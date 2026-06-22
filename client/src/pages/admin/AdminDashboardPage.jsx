import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.adminStats().then((d) => setStats(d.stats)).catch(() => {});
  }, []);

  if (!stats) return <div className="panel">Cargando...</div>;

  return (
    <div>
      <div className="panel">
        <h2>Panel de Adriana</h2>
        <p style={{ color: "var(--muted)" }}>Resumen de citas y familias.</p>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><b>{stats.pending}</b><span>Solicitudes pendientes</span></div>
        <div className="stat-card"><b>{stats.todayCount}</b><span>Citas hoy</span></div>
        <div className="stat-card"><b>{stats.weekCount}</b><span>Esta semana</span></div>
        <div className="stat-card"><b>{stats.activeFamilies}</b><span>Familias activas</span></div>
        <div className="stat-card"><b>{stats.cancelRate}%</b><span>Cancelaciones</span></div>
      </div>
      {stats.pending > 0 && (
        <div className="panel" style={{ background: "var(--clay-soft)" }}>
          <h3>Tienes {stats.pending} solicitud(es) por confirmar</h3>
          <Link to="/admin/citas?status=solicitada" className="btn btn-primary btn-sm">Ver solicitudes</Link>
        </div>
      )}
      {stats.topServices?.length > 0 && (
        <div className="panel">
          <h3>Áreas más solicitadas</h3>
          <ul>{stats.topServices.map((s) => <li key={s._id}>{s._id}: {s.count}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
