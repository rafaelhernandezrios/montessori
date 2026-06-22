import { Header, Footer } from "../components/Layout";

export default function ComoFuncionaPage() {
  const steps = [
    { t: "1. Regístrate", d: "Crea tu cuenta familiar y acepta la política de privacidad." },
    { t: "2. Perfil del niño/a", d: "Cuéntanos la edad, intereses y preocupaciones actuales (0–3 años)." },
    { t: "3. Reserva tu sesión", d: "Elige día, horario y tipo de asesoría. Adriana confirmará por correo." },
    { t: "4. Sesión en línea", d: "Videollamada individual adaptada a tu familia y zona horaria." },
    { t: "5. Seguimiento", d: "Recibe notas de sesión con observaciones y recomendaciones prácticas." },
  ];

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Proceso</span>
            <h2>Cómo funciona</h2>
            <p>Un acompañamiento claro, paso a paso, desde el registro hasta el seguimiento entre sesiones.</p>
          </div>
          <div className="cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {steps.map((s) => (
              <div key={s.t} className="card">
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
