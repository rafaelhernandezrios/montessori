import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brand } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split scr">
      <div className="auth-split-form">
        <div className="auth-split-form-inner">
          <div className="auth-brand-row">
            <Brand />
          </div>
          <div className="auth-eyebrow">Bienvenida de vuelta</div>
          <h1 className="auth-title">Tu espacio <em style={{ fontStyle: "italic", color: "var(--sage-deep)" }}>Montessori</em></h1>
          <p className="auth-sub">Acompañamiento cálido para los primeros tres años.</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Correo</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
              {loading ? "Ingresando..." : "Entrar"}
            </button>
          </form>
          <p className="auth-link">¿Primera vez aquí? <Link to="/registro">Crear cuenta</Link></p>
          <p className="auth-link" style={{ marginTop: 8 }}>
            <Link to="/">← Volver al sitio</Link>
          </p>
        </div>
      </div>
      <div className="auth-split-visual">
        <div className="auth-visual-glow" />
        <div className="auth-visual-photo">
          <img src="/assets/hero.jpg" alt="Ambiente preparado en casa" />
        </div>
        <div className="auth-float-card">
          <div className="auth-float-dot">🌱</div>
          <div><b>Montessori 0–3</b><br />Sesiones en línea con Adriana</div>
        </div>
      </div>
    </div>
  );
}
