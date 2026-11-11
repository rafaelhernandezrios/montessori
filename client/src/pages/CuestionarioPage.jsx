import { useState } from "react";
import { Link } from "react-router-dom";
import { Header, Footer } from "../components/Layout";
import { api } from "../api/client";
import { OTHER, surveyIntro, surveyQuestions } from "../../../shared/survey.js";

function Question({ q, answers, setAnswer }) {
  const value = answers[q.id];
  const otherKey = `${q.id}Other`;
  const options = q.other ? [...q.options, OTHER] : q.options || [];
  const selected = Array.isArray(value) ? value : [];
  const atMax = q.max && selected.length >= q.max;

  const toggle = (opt) => {
    const next = selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt];
    setAnswer(q.id, next);
  };
  const showOther = q.type === "multi" ? selected.includes(OTHER) : value === OTHER;

  return (
    <fieldset className="survey-q">
      <legend>
        {q.n && <span className="survey-n">{q.n}</span>}
        {q.label}
        {q.required && <span className="survey-req" aria-label="obligatoria"> *</span>}
      </legend>
      {q.hint && <p className="survey-hint">{q.hint}</p>}

      {(q.type === "text" || q.type === "email" || q.type === "tel") && (
        <input
          className="survey-input"
          type={q.type}
          required={q.required}
          value={value || ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder={q.type === "email" ? "tucorreo@ejemplo.com" : q.type === "tel" ? "+52 …" : "Tu respuesta"}
          aria-label={q.label}
        />
      )}
      {q.type === "textarea" && (
        <textarea className="field-input survey-input" value={value || ""} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder="Tu respuesta" aria-label={q.label} />
      )}

      {(q.type === "single" || q.type === "multi") && (
        <div className="survey-options">
          {options.map((opt) => {
            const checked = q.type === "multi" ? selected.includes(opt) : value === opt;
            const disabled = q.type === "multi" && !checked && atMax;
            return (
              <label key={opt} className={`survey-opt${checked ? " on" : ""}${disabled ? " off" : ""}`}>
                <input
                  type={q.type === "multi" ? "checkbox" : "radio"}
                  name={q.id}
                  checked={checked}
                  disabled={disabled}
                  required={q.required && q.type === "single"}
                  onChange={() => (q.type === "multi" ? toggle(opt) : setAnswer(q.id, opt))}
                />
                <span>{opt === OTHER ? "Otra" : opt}</span>
              </label>
            );
          })}
          {showOther && (
            <input
              className="survey-input"
              value={answers[otherKey] || ""}
              onChange={(e) => setAnswer(otherKey, e.target.value)}
              placeholder="Escribe tu respuesta"
              aria-label="Otra respuesta"
            />
          )}
        </div>
      )}
    </fieldset>
  );
}

export default function CuestionarioPage() {
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const setAnswer = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      await api.submitSurvey({ answers });
      setStatus({ state: "ok", message: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main survey-page">
        <div className="wrap survey-wrap">
          <div className="survey-head">
            <span className="eyebrow">{surveyIntro.subtitle}</span>
            <h1>{surveyIntro.title}</h1>
            {surveyIntro.text.map((t) => <p key={t}>{t}</p>)}
          </div>

          {status.state === "ok" ? (
            <div className="survey-card survey-done">
              <h2>¡Gracias! 💛</h2>
              <p>{surveyIntro.thanks}</p>
              <p>Te enviaré tu regalo a <b>{answers.email}</b>. Revisa también tu carpeta de spam.</p>
              <p className="survey-sign">Adriana Villalobos<br />Naré Montessori</p>
              <Link to="/" className="btn btn-primary">Volver al inicio</Link>
            </div>
          ) : (
            <form className="survey-card" onSubmit={submit}>
              {surveyQuestions.map((q) => (
                <Question key={q.id} q={q} answers={answers} setAnswer={setAnswer} />
              ))}
              <p className="survey-privacy">
                Tus respuestas son confidenciales y solo las uso para diseñar el acompañamiento.{" "}
                <Link to="/privacidad">Política de privacidad</Link>.
              </p>
              {status.state === "error" && <p className="lead-ok show lead-error">{status.message}</p>}
              <button className="btn btn-clay lead-submit" disabled={status.state === "sending"}>
                {status.state === "sending" ? "Enviando…" : "Enviar mis respuestas"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
