import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header, Footer, Reveal } from "../components/Layout";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const IMAGES = {
  hero: "/assets/hero.jpg",
  about: "/assets/about.jpg",
  concern: "/assets/concern.jpg",
  gallery: ["/assets/gallery-1.jpg", "/assets/gallery-2.jpg", "/assets/gallery-3.jpg"],
  creds: ["/assets/cred-1.jpg", "/assets/cred-2.jpg"],
};

export default function LandingPage() {
  const { user, isAdmin } = useAuth();
  const [services, setServices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [openQuote, setOpenQuote] = useState(null);

  useEffect(() => {
    api.getContent().then((d) => {
      setServices(d.services || []);
      setQuotes(d.quotes || []);
    }).catch(() => {});
  }, []);

  const reserveTo = user ? (isAdmin ? "/admin" : "/citas/nueva") : "/registro";

  return (
    <div className="app-shell">
      <Header />
      <section className="hero" style={{ padding: 0 }} id="inicio">
        <div className="wrap hero-grid">
          <Reveal>
            <span className="eyebrow">Acompañamiento Montessori para familias</span>
            <h1>Los primeros años se viven <em>una sola vez</em></h1>
            <p className="lead">
              Acompaño a mamás, papás y cuidadores de niños de 0 a 3 años a entender el desarrollo de su hijo y aplicar Montessori en casa de forma práctica, amorosa y realista.
            </p>
            <div className="hero-cta">
              <Link to={reserveTo} className="btn btn-primary">Reservar una sesión</Link>
              <a href="#asesorias" className="btn btn-ghost">Ver asesorías</a>
            </div>
            <div className="credchips">
              <span className="chip">Guía AMI 0–3 en formación</span>
              <span className="chip">Sesiones 100% en línea</span>
            </div>
          </Reveal>
          <div className="hero-photo reveal in">
            <div className="framed"><img src={IMAGES.hero} alt="Adriana Villalobos" /></div>
            <div className="float-tag">
              <div className="dot">♥</div>
              <span>Acompañamiento personalizado para tu familia</span>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="tint">
        <div className="wrap about-grid">
          <div className="about-photo reveal in">
            <div className="framed"><img src={IMAGES.about} alt="Sobre Adriana" /></div>
          </div>
          <div className="about-text reveal in">
            <span className="eyebrow">Sobre mí</span>
            <h2>Hola, soy Adriana</h2>
            <p>Soy guía en formación AMI Montessori 0–3, mamá de Hanami y profesional con experiencia internacional en educación, desarrollo infantil y acompañamiento familiar.</p>
            <p>Mi trabajo es ayudar a las familias a observar a su hijo con más objetividad, preparar ambientes en casa, establecer rutinas sanas y responder con mayor consciencia a las necesidades emocionales y de desarrollo de los primeros años.</p>
            <p>No busco imponer un modelo perfecto de crianza, sino acompañar a cada familia a encontrar soluciones reales, amorosas y sostenibles según su contexto, su ritmo y las necesidades de su hijo.</p>
            <p className="sign">— Adriana Villalobos Silva</p>
            <div className="stats">
              <div className="stat"><b>0–3</b><span>etapa de especialidad</span></div>
              <div className="stat"><b>AMI</b><span>formación internacional</span></div>
              <div className="stat"><b>8</b><span>áreas de asesoría</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="asesorias">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">Asesorías personalizadas</span>
            <h2>En qué te puedo acompañar</h2>
            <p>Áreas concretas de trabajo, pensadas para niños de 0 a 3 años y adaptables a la etapa preescolar. Cada sesión parte de la observación y de lo que tu familia necesita hoy.</p>
          </div>
          <div className="cards">
            {services.map((s) => (
              <div key={s.t} className="card">
                <div className="ic">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <g dangerouslySetInnerHTML={{ __html: s.i }} />
                  </svg>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ayuda" className="tint">
        <div className="wrap concerns">
          <div className="reveal in">
            <span className="eyebrow">Cómo te ayudo</span>
            <h2 style={{ fontSize: "clamp(1.9rem,3.4vw,2.7rem)", margin: ".7rem 0 1rem" }}>¿Te suena familiar?</h2>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>Toca cada frase para ver cómo la abordamos desde una mirada Montessori.</p>
            <div className="quote-list">
              {quotes.map((q, i) => (
                <div
                  key={q.q}
                  className={`q${openQuote === i ? " open" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenQuote(openQuote === i ? null : i)}
                  onKeyDown={(e) => e.key === "Enter" && setOpenQuote(openQuote === i ? null : i)}
                >
                  <div className="said">{q.q}</div>
                  <div className="ans">{q.a}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="concern-photo reveal in">
            <div className="framed"><img src={IMAGES.concern} alt="Acompañamiento familiar" /></div>
          </div>
        </div>
      </section>

      <section id="galeria">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">En acción</span>
            <h2>Aprendizaje real, en ambientes preparados</h2>
            <p>Momentos de trabajo, concentración y vida práctica junto a los niños y sus familias.</p>
          </div>
          <div className="gallery reveal in">
            <div className="framed tall"><img src={IMAGES.gallery[0]} alt="Galería 1" loading="lazy" /></div>
            <div className="framed"><img src={IMAGES.gallery[1]} alt="Galería 2" loading="lazy" /></div>
            <div className="framed"><img src={IMAGES.gallery[2]} alt="Galería 3" loading="lazy" /></div>
          </div>
        </div>
      </section>

      <section id="formacion" className="tint">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">Formación y certificaciones</span>
            <h2>Respaldo Montessori internacional</h2>
            <p>Mi acompañamiento se apoya en formación reconocida por la Association Montessori Internationale (AMI), fundada por Maria Montessori en 1929.</p>
          </div>
          <div className="creds reveal in">
            {IMAGES.creds.map((src, i) => (
              <div key={src} className="cred-card">
                <img src={src} alt={`Certificación ${i + 1}`} loading="lazy" />
                <div className="meta"><b>Formación AMI</b> · Montessori 0–3</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reservar">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">Agenda tu sesión</span>
            <h2>Reserva tu asesoría en línea</h2>
            <p>Crea tu cuenta, completa el perfil de tu familia y elige el día y la hora que mejor te queden.</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link to={reserveTo} className="btn btn-primary">Ir a reservar</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
