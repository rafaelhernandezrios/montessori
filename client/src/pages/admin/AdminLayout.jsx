import { Outlet } from "react-router-dom";
import { AdminAppShell } from "../../components/AppShell";

export default function AdminLayout() {
  return (
    <AdminAppShell>
      <Outlet />
    </AdminAppShell>
  );
}
