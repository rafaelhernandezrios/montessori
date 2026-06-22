import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    serviceType: { type: String, required: true },
    status: {
      type: String,
      enum: ["solicitada", "confirmada", "completada", "cancelada", "reprogramada"],
      default: "solicitada",
    },
    meetingLink: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
    userNotes: { type: String, default: "" },
    paymentPlan: { type: String, default: "" },
    paidWithCredit: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

appointmentSchema.index({ scheduledAt: 1, status: 1 });
appointmentSchema.index({ userId: 1, scheduledAt: -1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
