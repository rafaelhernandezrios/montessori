import { Header, Footer } from "../components/Layout";

export default function PrivacidadPage() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <div className="panel">
            <h2>Política de privacidad</h2>
            <p style={{ color: "var(--muted)", marginBottom: 20 }}>Última actualización: {new Date().toLocaleDateString("es")}</p>
            <div className="note-block">
              <h4>Datos que recopilamos</h4>
              <p>Nombre del cuidador, correo electrónico, teléfono opcional, datos del perfil del niño/a (edad, intereses, preocupaciones) y notas de sesión.</p>
            </div>
            <div className="note-block">
              <h4>Uso de la información</h4>
              <p>Los datos se utilizan exclusivamente para coordinar asesorías Montessori, personalizar el acompañamiento y mantener un historial de sesiones entre Adriana y tu familia.</p>
            </div>
            <div className="note-block">
              <h4>Protección de menores</h4>
              <p>No publicamos información identificable de niños/as. Las notas de sesión son privadas y solo accesibles para la familia registrada y la guía.</p>
            </div>
            <div className="note-block">
              <h4>Tus derechos</h4>
              <p>Puedes solicitar acceso, corrección o eliminación de tus datos escribiendo a Adriana Villalobos.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
