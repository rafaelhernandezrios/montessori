import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header, Footer } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accepted) {
      setError("Debes aceptar la política de privacidad");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/perfil", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Header simple />
      <div className="auth-page">
        <div className="auth-card">
          <h1>Crear cuenta</h1>
          <p className="sub">Regístrate para reservar asesorías y recibir notas de tus sesiones.</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Nombre completo</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} minLength={6} required />
            </div>
            <div className="field">
              <label htmlFor="phone">Teléfono (opcional)</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <label className="check-item" style={{ marginTop: 16 }}>
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              Acepto la <Link to="/privacidad" target="_blank">política de privacidad</Link> y el tratamiento de datos de mi familia.
            </label>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p className="auth-link">¿Ya tienes cuenta? <Link to="/login">Ingresa aquí</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
