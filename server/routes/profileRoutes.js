import express from "express";
import ChildProfile from "../models/ChildProfile.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/child", authMiddleware, async (req, res) => {
  const profile = await ChildProfile.findOne({ userId: req.userId });
  res.json({ profile });
});

router.put("/child", authMiddleware, async (req, res) => {
  try {
    const {
      childName,
      birthDate,
      languages,
      attendsSchool,
      schoolName,
      interestAreas,
      concerns,
      firstSessionGoal,
      notes,
    } = req.body;

    const profile = await ChildProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        childName,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        languages,
        attendsSchool,
        schoolName,
        interestAreas,
        concerns,
        firstSessionGoal,
        notes,
      },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar perfil" });
  }
});

router.put("/account", authMiddleware, async (req, res) => {
  try {
    const { name, phone, timezone } = req.body;
    const user = req.user;
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (timezone) user.timezone = timezone;
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, timezone: user.timezone, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar cuenta" });
  }
});

export default router;
