import express from "express";
import SessionNote from "../models/SessionNote.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const notes = await SessionNote.find({ userId: req.userId, isPublished: true })
    .populate("appointmentId")
    .sort({ publishedAt: -1 });
  res.json({ notes });
});

router.get("/:id", authMiddleware, async (req, res) => {
  const note = await SessionNote.findOne({
    _id: req.params.id,
    userId: req.userId,
    isPublished: true,
  }).populate("appointmentId");
  if (!note) {
    return res.status(404).json({ message: "Nota no encontrada" });
  }
  res.json({ note });
});

export default router;
