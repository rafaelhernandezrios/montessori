import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatDateTime } from "../../components/Layout";

export default function DashboardPage() {
  const [upcoming, setUpcoming] = useState(null);
  const [lastNote, setLastNote] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getUpcoming(),
      api.getSessionNotes(),
      api.getChildProfile(),
    ]).then(([up, notes, prof]) => {
      setUpcoming(up.appointment);
      setLastNote(notes.notes?.[0] || null);
      setProfile(prof.profile);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="panel">
        <h2>Tu panel familiar</h2>
        <p style={{ color: "var(--muted)" }}>Bienvenida. Aquí puedes ver tu próxima sesión y acceder a tus notas.</p>
      </div>

      {!profile?.interestAreas?.length && (
        <div className="panel" style={{ background: "var(--clay-soft)" }}>
          <h3>Completa el perfil de tu hijo/a</h3>
          <p style={{ marginBottom: 12 }}>Antes de tu primera sesión, cuéntanos sobre tu familia y tus intereses.</p>
          <Link to="/perfil" className="btn btn-primary btn-sm">Completar perfil</Link>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <b>{upcoming ? "1" : "0"}</b>
          <span>Próxima cita</span>
        </div>
        <div className="stat-card">
          <b>{lastNote ? "✓" : "—"}</b>
          <span>Última nota</span>
        </div>
      </div>

      <div className="panel">
        <h3>Próxima cita</h3>
        {upcoming ? (
          <>
            <p><strong>{upcoming.serviceType}</strong></p>
            <p style={{ color: "var(--muted)" }}>{formatDateTime(upcoming.scheduledAt)}</p>
            {upcoming.meetingLink && (
              <p style={{ marginTop: 8 }}><a href={upcoming.meetingLink} target="_blank" rel="noreferrer">Unirse a videollamada</a></p>
            )}
            <div className="actions">
              <Link to="/citas" className="btn btn-ghost btn-sm">Ver todas</Link>
            </div>
          </>
        ) : (
          <p className="empty">No tienes citas próximas. <Link to="/citas/nueva">Reserva una sesión</Link></p>
        )}
      </div>

      <div className="panel">
        <h3>Última nota de sesión</h3>
        {lastNote ? (
          <>
            <p>{lastNote.summary?.slice(0, 160)}{lastNote.summary?.length > 160 ? "..." : ""}</p>
            <Link to={`/sesiones/${lastNote._id}`} className="btn btn-ghost btn-sm">Leer nota completa</Link>
          </>
        ) : (
          <p className="empty">Aún no hay notas publicadas.</p>
        )}
      </div>
    </div>
  );
}
