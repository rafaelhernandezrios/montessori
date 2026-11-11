import express from "express";
import SurveyResponse from "../models/SurveyResponse.js";
import { OTHER, formatSurveyAnswer, surveyQuestions } from "../../shared/survey.js";
import { esc, notifyAdmin } from "../config/email.js";

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v, n) => String(v ?? "").trim().slice(0, n);

/** Guarda solo preguntas conocidas y opciones válidas */
function cleanAnswers(raw = {}) {
  const out = {};
  for (const q of surveyQuestions) {
    const v = raw[q.id];
    const allowed = q.other ? [...(q.options || []), OTHER] : q.options || [];
    if (q.type === "multi") {
      let list = Array.isArray(v) ? [...new Set(v)].filter((o) => allowed.includes(o)) : [];
      if (q.max) list = list.slice(0, q.max);
      if (list.length) out[q.id] = list;
    } else if (q.type === "single") {
      if (allowed.includes(v)) out[q.id] = v;
    } else {
      const text = clip(v, q.type === "textarea" ? 3000 : 300);
      if (text) out[q.id] = text;
    }
    const chosen = Array.isArray(out[q.id]) ? out[q.id] : [out[q.id]];
    if (q.other && chosen.includes(OTHER)) {
      const other = clip(raw[`${q.id}Other`], 300);
      if (other) out[`${q.id}Other`] = other;
    }
  }
  return out;
}

router.post("/", async (req, res) => {
  try {
    const answers = cleanAnswers(req.body?.answers);
    const email = String(answers.email || "").toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Escribe un correo válido para enviarte tu regalo" });
    }
    if (!answers.childAge) {
      return res.status(400).json({ message: "Indica la edad de tu hijo o hija" });
    }
    answers.email = email;

    const result = await SurveyResponse.findOneAndUpdate(
      { email },
      { whatsapp: answers.whatsapp || "", answers },
      { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
    );
    const isNew = !result.lastErrorObject?.updatedExisting;

    const rows = surveyQuestions
      .map((q) => [q, formatSurveyAnswer(q, answers)])
      .filter(([, a]) => a)
      .map(([q, a]) => `<p><b>${esc(q.label)}</b><br>${esc(a)}</p>`)
      .join("");
    await notifyAdmin({
      subject: `Cuestionario: ${isNew ? "nueva respuesta" : "respuesta actualizada"} de ${email}`,
      html: `${rows}<p>Recuerda enviarle su regalo respondiendo a este correo.</p>`,
      replyTo: email,
    });

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No se pudieron guardar tus respuestas. Intenta de nuevo." });
  }
});

export default router;
