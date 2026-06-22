import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { StatusBadge, formatDateTime } from "../../components/Layout";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.getAppointments().then((d) => setAppointments(d.appointments)).catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    try {
      await api.cancelAppointment(id, "Cancelada por la familia");
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="scr">
      <PageHeader
        eyebrow="Calendario familiar"
        title="Mis citas"
        action={<Link to="/citas/nueva" className="btn btn-primary btn-sm">+ Nueva reserva</Link>}
      />

      <div className="panel">
        {error && <div className="alert alert-error">{error}</div>}
        {appointments.length === 0 ? (
          <p className="empty">Aún no tienes citas. <Link to="/citas/nueva">Reserva tu primera sesión</Link></p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Asesoría</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>{formatDateTime(a.scheduledAt)}</td>
                    <td>{a.serviceType}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      {a.meetingLink && a.status === "confirmada" && (
                        <a href={a.meetingLink} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Videollamada</a>
                      )}
                      {["solicitada", "confirmada"].includes(a.status) && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleCancel(a._id)}>Cancelar</button>
                      )}
                    </td>
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
