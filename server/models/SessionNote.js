import mongoose from "mongoose";

const sessionNoteSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    summary: { type: String, default: "" },
    observations: { type: String, default: "" },
    recommendations: { type: String, default: "" },
    resources: [{ title: String, url: String }],
    nextSteps: { type: String, default: "" },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

const SessionNote = mongoose.model("SessionNote", sessionNoteSchema);
export default SessionNote;
