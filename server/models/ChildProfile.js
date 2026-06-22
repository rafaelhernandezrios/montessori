import mongoose from "mongoose";

const childProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    childName: { type: String, default: "" },
    birthDate: { type: Date },
    languages: { type: String, default: "" },
    attendsSchool: { type: Boolean, default: false },
    schoolName: { type: String, default: "" },
    interestAreas: [{ type: String }],
    concerns: [{ type: String }],
    firstSessionGoal: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const ChildProfile = mongoose.model("ChildProfile", childProfileSchema);
export default ChildProfile;
