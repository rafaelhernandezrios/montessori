import { Outlet } from "react-router-dom";
import { UserAppShell } from "../../components/AppShell";

export default function UserLayout() {
  return (
    <UserAppShell>
      <Outlet />
    </UserAppShell>
  );
}
