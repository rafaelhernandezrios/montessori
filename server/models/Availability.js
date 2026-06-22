import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    weeklySlots: {
      type: Map,
      of: [String],
      default: () =>
        new Map([
          ["1", ["09:00", "10:30", "12:00", "16:00", "17:30"]],
          ["2", ["09:00", "10:30", "12:00", "16:00", "17:30"]],
          ["3", ["09:00", "10:30", "12:00", "16:00", "17:30"]],
          ["4", ["09:00", "10:30", "12:00", "16:00", "17:30"]],
          ["5", ["09:00", "10:30", "12:00", "16:00", "17:30"]],
          ["6", ["09:00", "10:30", "12:00"]],
        ]),
    },
    blockedDates: [{ type: String }],
    slotDurationMinutes: { type: Number, default: 90 },
  },
  { timestamps: true }
);

const Availability = mongoose.model("Availability", availabilitySchema);
export default Availability;
