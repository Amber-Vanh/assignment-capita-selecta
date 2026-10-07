import { Outlet } from "react-router";
import { AppHeader } from "../components/AppHeader.jsx";
import { BottomNav } from "../components/BottomNav.jsx";

import { getUser } from "../services/users.js"
import { getCurrentUserId } from "../services/auth.js"


export async function clientLoader() {
  const currentUser = getUser(await getCurrentUserId());
  return { currentUser };
}

export default function AppLayout({ loaderData }) {
  const { currentUser } = loaderData;

  return (
    <div className="app">
      <AppHeader currentUser={currentUser} />
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
