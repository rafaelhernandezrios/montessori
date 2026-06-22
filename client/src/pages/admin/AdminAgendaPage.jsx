import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { slotTimes } from "../../../../shared/content.js";

const DAYS = [
  { key: "1", label: "Lunes" },
  { key: "2", label: "Martes" },
  { key: "3", label: "Miércoles" },
  { key: "4", label: "Jueves" },
  { key: "5", label: "Viernes" },
  { key: "6", label: "Sábado" },
  { key: "0", label: "Domingo" },
];

export default function AdminAgendaPage() {
  const [weeklySlots, setWeeklySlots] = useState({});
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlocked, setNewBlocked] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.adminAvailability().then((d) => {
      setWeeklySlots(d.weeklySlots || {});
      setBlockedDates(d.blockedDates || []);
    });
  }, []);

  const toggleSlot = (day, slot) => {
    setWeeklySlots((prev) => {
      const current = prev[day] || [];
      const next = current.includes(slot) ? current.filter((s) => s !== slot) : [...current, slot].sort();
      return { ...prev, [day]: next };
    });
  };

  const addBlocked = () => {
    if (newBlocked && !blockedDates.includes(newBlocked)) {
      setBlockedDates([...blockedDates, newBlocked].sort());
      setNewBlocked("");
    }
  };

  const save = async () => {
    await api.adminSaveAvailability({ weeklySlots, blockedDates });
    setMsg("Agenda guardada");
  };

  return (
    <div className="scr">
      <PageHeader
        eyebrow="Disponibilidad"
        title="Gestión de agenda"
      />
      <div className="panel">
        <p className="panel-muted">Configura horarios por día y bloquea fechas de vacaciones.</p>
        {msg && <div className="alert alert-success">{msg}</div>}

        {DAYS.map(({ key, label }) => (
          <div key={key} style={{ marginTop: 20 }}>
            <h4>{label}</h4>
            <div className="slots">
              {slotTimes.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`slot${(weeklySlots[key] || []).includes(slot) ? " sel" : ""}`}
                  onClick={() => toggleSlot(key, slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        ))}

        <h3 style={{ marginTop: 28 }}>Fechas bloqueadas</h3>
        <div className="actions">
          <input type="date" value={newBlocked} onChange={(e) => setNewBlocked(e.target.value)} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={addBlocked}>Agregar</button>
        </div>
        <ul style={{ marginTop: 12 }}>
          {blockedDates.map((d) => (
            <li key={d}>
              {d}
              <button type="button" style={{ marginLeft: 8, background: "none", border: "none", color: "#b06a4f", cursor: "pointer" }} onClick={() => setBlockedDates(blockedDates.filter((x) => x !== d))}>×</button>
            </li>
          ))}
        </ul>

        <button type="button" className="btn btn-primary" style={{ marginTop: 20 }} onClick={save}>Guardar agenda</button>
      </div>
    </div>
  );
}
