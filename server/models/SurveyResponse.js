import mongoose from "mongoose";

/** Respuestas del cuestionario "Te quiero conocer" (una por correo; si vuelve a responder se actualiza) */
const surveyResponseSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    whatsapp: { type: String, default: "", trim: true },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

surveyResponseSchema.index({ createdAt: -1 });

const SurveyResponse = mongoose.model("SurveyResponse", surveyResponseSchema);
export default SurveyResponse;
