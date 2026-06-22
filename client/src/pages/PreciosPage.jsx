import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header, Footer } from "../components/Layout";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PreciosPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.stripeConfig().then(setConfig).catch(() => {});
  }, []);

  const checkout = async (packageId) => {
    if (!user) {
      window.location.href = "/registro";
      return;
    }
    setLoading(true);
    try {
      const { url } = await api.stripeCheckout(packageId);
      if (url) window.location.href = url;
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Inversión</span>
            <h2>Precios y paquetes</h2>
            <p>Sesiones individuales en línea. Los pagos en línea estarán disponibles cuando Stripe esté configurado.</p>
          </div>
          {params.get("success") && <div className="alert alert-success">¡Pago recibido! Tus créditos se acreditarán en breve.</div>}
          <div className="cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {(config?.packages || [
              { id: "single", name: "1 sesión", credits: 1, description: "Asesoría individual en línea (90 min)" },
              { id: "pack4", name: "Paquete 4 sesiones", credits: 4, description: "Acompañamiento continuo con seguimiento" },
            ]).map((p) => (
              <div key={p.id} className="card">
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p style={{ marginTop: 12, fontSize: ".85rem", color: "var(--muted)" }}>
                  {config?.enabled ? "Pago en línea disponible" : "Reserva sin pago en línea por ahora — contacta a Adriana"}
                </p>
                {config?.enabled ? (
                  <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 14 }} disabled={loading} onClick={() => checkout(p.id)}>
                    Comprar
                  </button>
                ) : (
                  <a href="/citas/nueva" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>Reservar sesión</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
