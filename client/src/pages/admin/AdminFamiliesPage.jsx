import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { formatRelativeDays } from "../../utils/format";

export default function AdminFamiliesPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");

  const load = () => api.adminUsers(q).then((d) => setUsers(d.users));

  useEffect(() => { load(); }, []);

  const search = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="scr">
      <PageHeader eyebrow="CRM" title="Familias" />

      <div className="panel">
        <form onSubmit={search} className="actions" style={{ marginBottom: 16 }}>
          <input
            placeholder="Buscar por nombre o email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <button type="submit" className="btn btn-ghost btn-sm">Buscar</button>
        </form>

        {users.length === 0 ? (
          <p className="empty">No hay familias registradas.</p>
        ) : (
          <div className="crm-table">
            <div className="crm-table-head">
              <span>Familia</span>
              <span>Niño/a</span>
              <span>Plan</span>
              <span>Última sesión</span>
              <span />
            </div>
            {users.map((u) => (
              <button
                key={u._id}
                type="button"
                className="crm-table-row"
                onClick={() => navigate(`/admin/familias/${u._id}`)}
              >
                <span className="crm-family">
                  <span className="crm-avatar" />
                  <b>{u.name?.split(" ").pop() || u.name}</b>
                  {u.atRisk && <span className="crm-badge risk">⚠ riesgo</span>}
                </span>
                <span>{u.childName ? `${u.childName}${u.childAge ? ` · ${u.childAge}` : ""}` : "—"}</span>
                <span>
                  <span className={`crm-plan-pill${u.planLabel === "Sin plan" ? "" : " active"}`}>{u.planLabel}</span>
                </span>
                <span style={{ color: u.atRisk ? "var(--clay)" : "var(--muted)" }}>
                  {formatRelativeDays(u.inactiveDays)}
                </span>
                <span className="crm-arrow">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
