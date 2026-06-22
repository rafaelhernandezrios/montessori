import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";

const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const now = new Date();
  const dateLabel = `${weekdays[now.getDay()]} · ${now.getDate()} de ${months[now.getMonth()]}`;

  useEffect(() => {
    Promise.all([
      api.adminStats(),
      api.adminAppointments(),
    ]).then(([s, a]) => {
      setStats(s.stats);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const todayApts = a.appointments.filter((apt) => {
        const d = new Date(apt.scheduledAt);
        return d >= today && d < tomorrow && ["solicitada", "confirmada"].includes(apt.status);
      });
      setAppointments(todayApts.slice(0, 4));
    }).catch(() => {});
  }, []);

  if (!stats) return <div className="panel">Cargando...</div>;

  return (
    <div className="scr">
      <PageHeader
        eyebrow={dateLabel}
        title="Buen día, Adriana"
        action={<Link to="/admin/agenda" className="btn btn-primary btn-sm">Ver agenda</Link>}
      />

      {stats.pending > 0 && (
        <div className="hero-card" style={{ marginBottom: 22 }}>
          <div className="hero-card-label">Atención</div>
          <h3>{stats.pending} solicitud{stats.pending > 1 ? "es" : ""} por confirmar</h3>
          <div className="hero-card-meta">Revisa y confirma las reservas de las familias</div>
          <Link to="/admin/citas?status=solicitada" className="btn btn-sm btn-white">Ver solicitudes</Link>
        </div>
      )}

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        <div className="metric-card">
          <div className="metric-card-label">Solicitudes pendientes</div>
          <b>{stats.pending}</b>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Citas hoy</div>
          <b>{stats.todayCount}</b>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Esta semana</div>
          <b>{stats.weekCount}</b>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Familias activas</div>
          <b>{stats.activeFamilies}</b>
          <div className="metric-card-hint">{stats.cancelRate}% cancelaciones</div>
        </div>
      </div>

      <div className="dash-bottom-grid">
        <div className="panel" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: "1rem" }}>Sesiones de hoy</h3>
          {appointments.length === 0 ? (
            <p className="empty" style={{ padding: "12px 0" }}>No hay sesiones programadas para hoy.</p>
          ) : (
            appointments.map((a) => {
              const d = new Date(a.scheduledAt);
              const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
              return (
                <div key={a._id} className="session-row">
                  <div className="session-time">
                    <b>{time}</b>
                    <span>60 min</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{a.userId?.name || "Familia"}</div>
                    <div style={{ fontSize: ".84rem", color: "var(--muted)" }}>{a.serviceType}</div>
                  </div>
                  <Link to="/admin/citas" className="btn btn-primary btn-sm">Gestionar</Link>
                </div>
              );
            })
          )}
        </div>

        <div className="panel" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: "1rem" }}>Áreas más solicitadas</h3>
          {stats.topServices?.length > 0 ? (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.topServices.map((s) => (
                <li key={s._id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".9rem", paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
                  <span>{s._id}</span>
                  <b style={{ color: "var(--sage-deep)" }}>{s.count}</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty" style={{ padding: "12px 0" }}>Sin datos aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}
