import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

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
    metadata: { userId: user._id.toString(), packageId },
  });
  res.json({ url: session.url });
});

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
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const packageId = session.metadata?.packageId;
    const credits = packageId === "pack4" ? 4 : 1;
    if (userId) {
      await User.findByIdAndUpdate(userId, { $inc: { sessionCredits: credits } });
    }
  }
  res.json({ received: true });
});

export default router;
