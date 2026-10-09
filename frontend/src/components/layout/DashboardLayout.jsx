/**
 * DashboardLayout.jsx
 * Shared layout for admin, broker and buyer dashboards.
 */

import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardLayout({
  title,
  links = [],
  children,
}) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar
        title={title}
        links={links}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-neutral-200 bg-neutral-0 px-6 py-4">
          <h1 className="text-base font-semibold text-primary-900">
            {title}
          </h1>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-neutral-500 sm:inline">
              {user?.full_name || user?.name || user?.email}
            </span>

            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-danger-600 transition-opacity hover:opacity-80"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-6">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}