import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookingCalendar } from "../../components/BookingCalendar";
import { api } from "../../api/client";
import { serviceTypes } from "../../../../shared/content.js";

export default function NewAppointmentPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateKey, setDateKey] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [serviceType, setServiceType] = useState(serviceTypes[0]);
  const [userNotes, setUserNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAvailability = useCallback((year, month) => api.getAvailability(year, month), []);

  const handleSelect = ({ date, dateKey: dk, slot }) => {
    setSelectedDate(date);
    setDateKey(dk);
    if (slot !== undefined) setSelectedSlot(slot);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateKey || !selectedSlot) {
      setError("Elige una fecha y un horario");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.createAppointment({ dateKey, time: selectedSlot, serviceType, userNotes });
      setMsg("¡Solicitud enviada! Adriana confirmará tu cita por correo.");
      setTimeout(() => navigate("/citas"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="panel">
        <h2>Reservar asesoría</h2>
        <p style={{ color: "var(--muted)" }}>Sesiones individuales en línea, adaptadas a tu zona horaria.</p>
        <span className="modality">Sesión en línea</span>
        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <div className="book-grid" style={{ marginTop: 20 }}>
          <BookingCalendar
            onSelect={handleSelect}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            fetchAvailability={fetchAvailability}
          />
          <form className="booking-side" onSubmit={handleSubmit}>
            <h3>Detalles de la reserva</h3>
            <p className="hint">
              {selectedDate && selectedSlot
                ? `Fecha: ${dateKey} · Hora: ${selectedSlot}`
                : "Selecciona fecha y horario en el calendario"}
            </p>
            <div className="field">
              <label>Tipo de asesoría</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                {serviceTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Notas para Adriana (opcional)</label>
              <textarea className="field-input" value={userNotes} onChange={(e) => setUserNotes(e.target.value)} rows={3} />
            </div>
            <button type="submit" className="btn btn-primary book-confirm" disabled={loading}>
              {loading ? "Enviando..." : "Solicitar reserva"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
