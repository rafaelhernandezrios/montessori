import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  sendAppointmentRequestedEmail,
} from "../config/email.js";
import {
  combineDateAndTime,
  formatAppointmentDate,
  getAvailableSlotsForDate,
} from "../utils/availability.js";
import { bookingPlans } from "../../shared/content.js";

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const PACKAGE_META = {
  single: { name: "1 sesión", credits: 1, amountCents: 85000 },
  pack4: { name: "Paquete 4 sesiones", credits: 4, amountCents: 299000 },
};

router.get("/config", (_req, res) => {
  res.json({
    enabled: !!process.env.STRIPE_SECRET_KEY,
    prices: {
      single: process.env.STRIPE_PRICE_SINGLE || null,
      pack4: process.env.STRIPE_PRICE_PACK4 || null,
    },
    packages: [
      { id: "single", name: "1 sesión", credits: 1, description: "Asesoría individual en línea" },
      { id: "pack4", name: "Paquete 4 sesiones", credits: 4, description: "Acompañamiento continuo con descuento" },
    ],
    bookingPlans,
  });
});

router.post("/checkout", authMiddleware, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ message: "Pagos no configurados aún. Contacta a Adriana para reservar." });
  }
  const { packageId } = req.body;
  const priceMap = {
    single: process.env.STRIPE_PRICE_SINGLE,
    pack4: process.env.STRIPE_PRICE_PACK4,
  };
  const priceId = priceMap[packageId];
  if (!priceId) {
    return res.status(400).json({ message: "Paquete no válido" });
  }
  const user = await User.findById(req.userId);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/precios?success=1`,
    cancel_url: `${process.env.FRONTEND_URL}/precios?cancelled=1`,
    metadata: { userId: user._id.toString(), packageId, source: "precios" },
  });
  res.json({ url: session.url });
});

/** Checkout durante reserva: paga y crea cita al completar webhook */
router.post("/booking-checkout", authMiddleware, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ message: "Pagos en línea no disponibles. Elige solicitar sin pago." });
  }
  const { dateKey, time, serviceType, userNotes, packageId } = req.body;
  if (!dateKey || !time || !serviceType || !packageId) {
    return res.status(400).json({ message: "Faltan datos de la reserva" });
  }
  const meta = PACKAGE_META[packageId];
  if (!meta) {
    return res.status(400).json({ message: "Plan de pago no válido" });
  }
  const slots = await getAvailableSlotsForDate(dateKey);
  if (!slots.includes(time)) {
    return res.status(409).json({ message: "Ese horario ya no está disponible" });
  }
  const priceId = packageId === "single"
    ? process.env.STRIPE_PRICE_SINGLE
    : process.env.STRIPE_PRICE_PACK4;
  if (!priceId) {
    return res.status(503).json({ message: "Precio no configurado en Stripe" });
  }
  const user = await User.findById(req.userId);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/citas/nueva?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/citas/nueva?cancelled=1`,
    metadata: {
      userId: user._id.toString(),
      packageId,
      source: "booking",
      dateKey,
      time,
      serviceType,
      userNotes: userNotes || "",
    },
  });
  res.json({ url: session.url });
});

router.get("/booking-status", authMiddleware, async (req, res) => {
  const { session_id: sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ message: "session_id requerido" });
  }
  const payment = await Payment.findOne({ stripeSessionId: sessionId, userId: req.userId });
  if (!payment) {
    return res.json({ ready: false });
  }
  const appointment = payment.appointmentId
    ? await Appointment.findById(payment.appointmentId)
    : null;
  res.json({ ready: true, appointment, payment });
});

async function fulfillCheckout(session) {
  const userId = session.metadata?.userId;
  const packageId = session.metadata?.packageId;
  if (!userId || !packageId) return;

  const existing = await Payment.findOne({ stripeSessionId: session.id });
  if (existing) return;

  const meta = PACKAGE_META[packageId] || { credits: packageId === "pack4" ? 4 : 1, amountCents: session.amount_total || 0 };
  const amount = session.amount_total || meta.amountCents;
  const source = session.metadata?.source || "precios";

  const payment = await Payment.create({
    userId,
    amount,
    currency: session.currency || "mxn",
    type: "one_time",
    packageId,
    status: "completed",
    stripeSessionId: session.id,
    description: meta.name || packageId,
    paidAt: new Date(),
  });

  if (source === "booking") {
    const { dateKey, time, serviceType, userNotes } = session.metadata;
    const slots = await getAvailableSlotsForDate(dateKey);
    if (!slots.includes(time)) {
      await User.findByIdAndUpdate(userId, { $inc: { sessionCredits: meta.credits } });
      payment.description += " (horario no disponible — créditos acreditados)";
      await payment.save();
      return;
    }
    const scheduledAt = combineDateAndTime(dateKey, time);
    const appointment = await Appointment.create({
      userId,
      scheduledAt,
      serviceType,
      userNotes: userNotes || "",
      status: "solicitada",
      paymentPlan: packageId,
      paidWithCredit: false,
    });
    payment.appointmentId = appointment._id;
    await payment.save();
    if (meta.credits > 1) {
      await User.findByIdAndUpdate(userId, {
        $inc: { sessionCredits: meta.credits - 1 },
        activePlan: packageId === "pack4" ? "pack4" : "single",
      });
    } else {
      await User.findByIdAndUpdate(userId, { activePlan: "single" });
    }
    const user = await User.findById(userId);
    if (user) {
      await sendAppointmentRequestedEmail(
        user.email,
        user.name,
        formatAppointmentDate(scheduledAt),
        serviceType
      );
    }
  } else {
    await User.findByIdAndUpdate(userId, {
      $inc: { sessionCredits: meta.credits },
      activePlan: packageId === "pack4" ? "pack4" : "single",
    });
  }
}

router.post("/webhook", async (req, res) => {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send("Stripe no configurado");
  }
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    await fulfillCheckout(event.data.object);
  }
  res.json({ received: true });
});

export default router;
