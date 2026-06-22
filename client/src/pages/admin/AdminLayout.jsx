import { NavLink, Outlet } from "react-router-dom";
import { Header, Footer } from "../../components/Layout";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/citas", label: "Citas" },
  { to: "/admin/agenda", label: "Agenda" },
  { to: "/admin/familias", label: "Familias" },
];

export default function AdminLayout() {
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
