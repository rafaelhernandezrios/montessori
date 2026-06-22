import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatDateTime } from "../../components/Layout";

export default function AdminFamiliesPage() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = () => api.adminUsers(q).then((d) => setUsers(d.users));

  useEffect(() => { load(); }, []);

  const search = (e) => {
    e.preventDefault();
    load();
  };

  const openUser = async (id) => {
    setSelected(id);
    const d = await api.adminUser(id);
    setDetail(d);
  };

  const toggleActive = async () => {
    await api.adminUpdateUser(selected, { isActive: !detail.user.isActive });
    openUser(selected);
    load();
  };

  const saveAdminNotes = async () => {
    await api.adminUpdateUser(selected, { adminNotes: detail.user.adminNotes });
    alert("Notas guardadas");
  };

  return (
    <div>
      <div className="panel">
        <h2>Familias</h2>
        <form onSubmit={search} className="actions">
          <input placeholder="Buscar por nombre o email" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <button type="submit" className="btn btn-ghost btn-sm">Buscar</button>
        </form>
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Activa</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.isActive ? "Sí" : "No"}</td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openUser(u._id)}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div className="panel">
          <h3>{detail.user.name}</h3>
          <p>{detail.user.email} · {detail.user.phone}</p>
          <div className="actions" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={toggleActive}>
              {detail.user.isActive ? "Desactivar cuenta" : "Activar cuenta"}
            </button>
          </div>

          {detail.profile && (
            <>
              <h4 style={{ marginTop: 20 }}>Perfil del niño/a</h4>
              <p>Nombre: {detail.profile.childName || "—"}</p>
              <p>Intereses: {detail.profile.interestAreas?.join(", ") || "—"}</p>
              <p>Preocupaciones: {detail.profile.concerns?.join("; ") || "—"}</p>
              <p>Meta primera sesión: {detail.profile.firstSessionGoal || "—"}</p>
            </>
          )}

          <h4 style={{ marginTop: 20 }}>Notas internas (solo admin)</h4>
          <textarea
            className="field-input"
            value={detail.user.adminNotes || ""}
            onChange={(e) => setDetail({ ...detail, user: { ...detail.user, adminNotes: e.target.value } })}
          />
          <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={saveAdminNotes}>Guardar notas</button>

          <h4 style={{ marginTop: 20 }}>Historial de citas</h4>
          <ul>
            {detail.appointments?.map((a) => (
              <li key={a._id}>{formatDateTime(a.scheduledAt)} — {a.serviceType} ({a.status})</li>
            ))}
          </ul>
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => { setSelected(null); setDetail(null); }}>Cerrar</button>
        </div>
      )}
    </div>
  );
}
