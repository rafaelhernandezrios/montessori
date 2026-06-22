import express from "express";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  combineDateAndTime,
  formatAppointmentDate,
  getAvailableSlotsForDate,
  getBookedSlotsForMonth,
  getOrCreateAvailability,
  parseDateKey,
} from "../utils/availability.js";
import {
  sendAppointmentConfirmedEmail,
  sendAppointmentRequestedEmail,
} from "../config/email.js";

const router = express.Router();
const CANCEL_HOURS = 24;

router.get("/availability", authMiddleware, async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    if (!year || !month) {
      return res.status(400).json({ message: "year y month son requeridos" });
    }
    const availability = await getOrCreateAvailability();
    const booked = await getBookedSlotsForMonth(year, month);
    const daysInMonth = new Date(year, month, 0).getDate();
    const availableDays = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const slots = await getAvailableSlotsForDate(dateKey);
      if (slots.length) availableDays[dateKey] = slots;
    }

    res.json({
      availableDays,
      booked,
      blockedDates: availability.blockedDates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener disponibilidad" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { dateKey, time, serviceType, userNotes } = req.body;
    if (!dateKey || !time || !serviceType) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    const slots = await getAvailableSlotsForDate(dateKey);
    if (!slots.includes(time)) {
      return res.status(409).json({ message: "Ese horario ya no está disponible" });
    }
    const scheduledAt = combineDateAndTime(dateKey, time);
    const appointment = await Appointment.create({
      userId: req.userId,
      scheduledAt,
      serviceType,
      userNotes: userNotes || "",
      status: "solicitada",
    });
    const user = await User.findById(req.userId);
    await sendAppointmentRequestedEmail(user.email, user.name, formatAppointmentDate(scheduledAt), serviceType);
    res.status(201).json({ appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear cita" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const appointments = await Appointment.find({ userId: req.userId }).sort({ scheduledAt: -1 });
  res.json({ appointments });
});

router.get("/upcoming", authMiddleware, async (req, res) => {
  const now = new Date();
  const appointment = await Appointment.findOne({
    userId: req.userId,
    scheduledAt: { $gte: now },
    status: { $in: ["solicitada", "confirmada"] },
  }).sort({ scheduledAt: 1 });
  res.json({ appointment });
});

router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.userId });
    if (!appointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    if (["cancelada", "completada"].includes(appointment.status)) {
      return res.status(400).json({ message: "Esta cita no puede cancelarse" });
    }
    const hoursUntil = (appointment.scheduledAt - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < CANCEL_HOURS) {
      return res.status(400).json({ message: `Solo puedes cancelar con al menos ${CANCEL_HOURS} horas de anticipación` });
    }
    appointment.status = "cancelada";
    appointment.cancelledAt = new Date();
    appointment.cancelReason = req.body.reason || "";
    await appointment.save();
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar cita" });
  }
});

export default router;
