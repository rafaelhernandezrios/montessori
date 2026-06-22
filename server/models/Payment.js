import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "mxn" },
    type: { type: String, enum: ["one_time", "subscription"], default: "one_time" },
    packageId: { type: String, default: "" },
    status: { type: String, enum: ["completed", "pending", "failed"], default: "completed" },
    stripeSessionId: { type: String, default: "" },
    description: { type: String, default: "" },
    paidAt: { type: Date, default: Date.now },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  },
  { timestamps: true }
);

paymentSchema.index({ paidAt: -1 });
paymentSchema.index({ userId: 1, paidAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
