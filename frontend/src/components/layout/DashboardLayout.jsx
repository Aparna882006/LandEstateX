/**
 * DashboardLayout.jsx
 * Wraps any dashboard page (admin/broker/buyer) with a Sidebar + top bar.
 * Pages render inside via `children` (or swap for <Outlet /> if you move
 * this into AppRoutes.jsx as a layout route).
 */

import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardLayout({ title, links, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar title={title} links={links} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-0">
          <h1 className="text-base font-semibold text-primary-900">
            {title}
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500 hidden sm:inline">
              {user?.name || user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm font-medium text-danger-600 hover:opacity-80 transition-opacity"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
