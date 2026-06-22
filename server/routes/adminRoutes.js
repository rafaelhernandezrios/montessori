import express from "express";
import bcrypt from "bcryptjs";
import Appointment from "../models/Appointment.js";
import ChildProfile from "../models/ChildProfile.js";
import SessionNote from "../models/SessionNote.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
  formatAppointmentDate,
  getOrCreateAvailability,
} from "../utils/availability.js";
import {
  sendAppointmentConfirmedEmail,
  sendSessionNotePublishedEmail,
} from "../config/email.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.get("/stats", async (_req, res) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const [pending, todayCount, weekCount, activeFamilies, totalAppointments, cancelled] = await Promise.all([
    Appointment.countDocuments({ status: "solicitada" }),
    Appointment.countDocuments({
      scheduledAt: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: ["solicitada", "confirmada"] },
    }),
    Appointment.countDocuments({
      scheduledAt: { $gte: startOfWeek, $lte: endOfWeek },
      status: { $in: ["solicitada", "confirmada", "completada"] },
    }),
    User.countDocuments({ role: "user", isActive: true }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: "cancelada" }),
  ]);

  const serviceStats = await Appointment.aggregate([
    { $group: { _id: "$serviceType", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.json({
    stats: {
      pending,
      todayCount,
      weekCount,
      activeFamilies,
      totalAppointments,
      cancelRate: totalAppointments ? Math.round((cancelled / totalAppointments) * 100) : 0,
      topServices: serviceStats,
    },
  });
});

router.get("/appointments", async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const appointments = await Appointment.find(filter)
    .populate("userId", "name email phone")
    .sort({ scheduledAt: -1 });
  res.json({ appointments });
});

router.patch("/appointments/:id", async (req, res) => {
  try {
    const { status, meetingLink, adminNotes, scheduledAt } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate("userId", "name email");
    if (!appointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    if (status) appointment.status = status;
    if (meetingLink !== undefined) appointment.meetingLink = meetingLink;
    if (adminNotes !== undefined) appointment.adminNotes = adminNotes;
    if (scheduledAt) appointment.scheduledAt = new Date(scheduledAt);
    await appointment.save();

    if (status === "confirmada" && appointment.userId) {
      await sendAppointmentConfirmedEmail(
        appointment.userId.email,
        appointment.userId.name,
        formatAppointmentDate(appointment.scheduledAt),
        appointment.meetingLink
      );
    }
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar cita" });
  }
});

router.get("/availability", async (_req, res) => {
  const availability = await getOrCreateAvailability();
  const weeklySlots = {};
  const slots = availability.weeklySlots;
  if (slots instanceof Map) {
    for (const [k, v] of slots.entries()) weeklySlots[k] = v;
  } else {
    Object.assign(weeklySlots, slots);
  }
  res.json({
    weeklySlots,
    blockedDates: availability.blockedDates,
    slotDurationMinutes: availability.slotDurationMinutes,
  });
});

router.put("/availability", async (req, res) => {
  try {
    const availability = await getOrCreateAvailability();
    if (req.body.weeklySlots) {
      availability.weeklySlots = new Map(Object.entries(req.body.weeklySlots));
    }
    if (req.body.blockedDates) {
      availability.blockedDates = req.body.blockedDates;
    }
    if (req.body.slotDurationMinutes) {
      availability.slotDurationMinutes = req.body.slotDurationMinutes;
    }
    await availability.save();
    res.json({ availability });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar disponibilidad" });
  }
});

router.get("/users", async (req, res) => {
  const filter = { role: "user" };
  if (req.query.q) {
    filter.$or = [
      { name: { $regex: req.query.q, $options: "i" } },
      { email: { $regex: req.query.q, $options: "i" } },
    ];
  }
  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
  res.json({ users });
});

router.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  const [profile, appointments, notes] = await Promise.all([
    ChildProfile.findOne({ userId: user._id }),
    Appointment.find({ userId: user._id }).sort({ scheduledAt: -1 }),
    SessionNote.find({ userId: user._id }).sort({ createdAt: -1 }),
  ]);
  res.json({ user, profile, appointments, notes });
});

router.patch("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const { isActive, adminNotes, sessionCredits } = req.body;
    if (isActive !== undefined) user.isActive = isActive;
    if (adminNotes !== undefined) user.adminNotes = adminNotes;
    if (sessionCredits !== undefined) user.sessionCredits = sessionCredits;
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive, adminNotes: user.adminNotes, sessionCredits: user.sessionCredits } });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
});

router.get("/session-notes/appointment/:appointmentId", async (req, res) => {
  const note = await SessionNote.findOne({ appointmentId: req.params.appointmentId });
  res.json({ note });
});

router.post("/session-notes", async (req, res) => {
  try {
    const {
      appointmentId,
      summary,
      observations,
      recommendations,
      resources,
      nextSteps,
      publish,
    } = req.body;
    const appointment = await Appointment.findById(appointmentId).populate("userId", "name email");
    if (!appointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    const note = await SessionNote.findOneAndUpdate(
      { appointmentId },
      {
        userId: appointment.userId._id,
        summary,
        observations,
        recommendations,
        resources,
        nextSteps,
        isPublished: !!publish,
        publishedAt: publish ? new Date() : undefined,
      },
      { upsert: true, new: true }
    );
    if (publish) {
      if (appointment.status !== "completada") {
        appointment.status = "completada";
        await appointment.save();
      }
      await sendSessionNotePublishedEmail(appointment.userId.email, appointment.userId.name);
    }
    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar nota" });
  }
});

export default router;
