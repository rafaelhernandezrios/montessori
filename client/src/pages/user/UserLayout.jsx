import { NavLink, Outlet } from "react-router-dom";
import { Header, Footer } from "../../components/Layout";

const links = [
  { to: "/dashboard", label: "Inicio", end: true },
  { to: "/citas", label: "Mis citas" },
  { to: "/citas/nueva", label: "Reservar" },
  { to: "/sesiones", label: "Notas de sesión" },
  { to: "/perfil", label: "Perfil familiar" },
  { to: "/precios", label: "Precios" },
];

export default function UserLayout() {
  return (
    <div className="app-shell">
      <Header simple />
      <main className="app-main">
        <div className="wrap dash-grid">
          <aside className="dash-sidebar">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
                {l.label}
              </NavLink>
            ))}
          </aside>
          <div className="dash-content">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
