import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { formatDateTime } from "../../components/Layout";

export default function SessionNotesPage() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState(null);

  useEffect(() => {
    if (id) {
      api.getSessionNote(id).then((d) => setNote(d.note)).catch(() => {});
    } else {
      api.getSessionNotes().then((d) => setNotes(d.notes)).catch(() => {});
    }
  }, [id]);

  if (id && note) {
    return (
      <div className="panel">
        <Link to="/sesiones" style={{ color: "var(--sage-deep)", fontSize: ".9rem" }}>← Volver a sesiones</Link>
        <h2 style={{ marginTop: 12 }}>Nota de sesión</h2>
        {note.appointmentId && (
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>{formatDateTime(note.appointmentId.scheduledAt)}</p>
        )}
        {note.summary && <div className="note-block"><h4>Resumen</h4><p>{note.summary}</p></div>}
        {note.observations && <div className="note-block"><h4>Observaciones Montessori</h4><p>{note.observations}</p></div>}
        {note.recommendations && <div className="note-block"><h4>Recomendaciones prácticas</h4><p>{note.recommendations}</p></div>}
        {note.nextSteps && <div className="note-block"><h4>Próximos pasos</h4><p>{note.nextSteps}</p></div>}
        {note.resources?.length > 0 && (
          <div className="note-block">
            <h4>Recursos</h4>
            <ul>{note.resources.map((r) => <li key={r.url}><a href={r.url} target="_blank" rel="noreferrer">{r.title || r.url}</a></li>)}</ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Notas de sesión</h2>
      <p style={{ color: "var(--muted)" }}>Resúmenes y recomendaciones de Adriana tras cada sesión completada.</p>
      {notes.length === 0 ? (
        <p className="empty">Aún no hay notas publicadas.</p>
      ) : (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {notes.map((n) => (
            <div key={n._id} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18 }}>
              <p style={{ fontSize: ".85rem", color: "var(--muted)" }}>
                {n.appointmentId ? formatDateTime(n.appointmentId.scheduledAt) : formatDateTime(n.publishedAt)}
              </p>
              <p style={{ marginTop: 6 }}>{n.summary?.slice(0, 120)}{n.summary?.length > 120 ? "..." : ""}</p>
              <Link to={`/sesiones/${n._id}`} className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>Leer más</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
