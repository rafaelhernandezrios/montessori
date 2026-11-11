import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { formatSurveyAnswer, surveyQuestions } from "../../../../shared/survey.js";

const TABS = [
  { id: "guide", label: "Guía gratuita" },
  { id: "school", label: "Escuela en Osaka" },
  { id: "survey", label: "Cuestionario" },
];

function SurveyList({ responses }) {
  const [open, setOpen] = useState(null);
  if (responses.length === 0) return <p className="empty">Todavía no hay respuestas.</p>;
  return (
    <div className="survey-admin">
      {responses.map((r) => {
        const isOpen = open === r._id;
        const a = r.answers || {};
        return (
          <div key={r._id} className={`survey-admin-item${isOpen ? " open" : ""}`}>
            <button type="button" className="survey-admin-head" onClick={() => setOpen(isOpen ? null : r._id)}>
              <span>{formatDate(r.updatedAt || r.createdAt)}</span>
              <b>{r.email}</b>
              <span>{a.childAge || "—"}</span>
              <span className="survey-admin-toggle">{isOpen ? "Ocultar" : "Ver respuestas"}</span>
            </button>
            {isOpen && (
              <dl className="survey-admin-body">
                {surveyQuestions.map((q) => {
                  const text = formatSurveyAnswer(q, a);
                  if (!text) return null;
                  return (
                    <div key={q.id}>
                      <dt>{q.n ? `${q.n}. ` : ""}{q.label}</dt>
                      <dd>{q.id === "email" ? <a href={`mailto:${text}`}>{text}</a> : text}</dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminLeadsPage() {
  const [type, setType] = useState("guide");
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLeads(null);
    setError("");
    const load = type === "survey" ? api.adminSurvey().then((d) => d.responses) : api.adminLeads(type).then((d) => d.leads);
    load.then(setLeads).catch((e) => setError(e.message));
  }, [type]);

  return (
    <div className="scr">
      <PageHeader eyebrow="Comunidad" title="Interesados" />
      <div className="agenda-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`agenda-tab${type === t.id ? " active" : ""}`} onClick={() => setType(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="panel">
        {!leads && !error && <p className="panel-muted">Cargando…</p>}
        {leads && type === "survey" && <SurveyList responses={leads} />}
        {leads && type !== "survey" && leads.length === 0 && <p className="empty">Todavía no hay registros.</p>}
        {leads && type !== "survey" && leads.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  {type === "guide" && <th>Edad del niño</th>}
                  {type === "guide" && <th>Principal dificultad</th>}
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l._id}>
                    <td>{formatDate(l.createdAt)}</td>
                    <td>{l.name || "—"}</td>
                    <td><a href={`mailto:${l.email}`}>{l.email}</a></td>
                    {type === "guide" && <td>{l.childAge || "—"}</td>}
                    {type === "guide" && <td>{l.mainNeed || "—"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
