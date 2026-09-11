/**
 * Sidebar.jsx
 * Shared sidebar for role-based dashboard layouts (admin now, broker/buyer
 * later). Uses the project's Tailwind v4 design tokens from index.css.
 */

import { NavLink } from "react-router-dom";

/**
 * @param {{ title?: string, links: { to: string, label: string, icon?: React.ReactNode }[] }} props
 */
export default function Sidebar({ title = "Admin", links = [] }) {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-neutral-200 bg-neutral-0 min-h-screen">
      <div className="px-6 py-5 border-b border-neutral-200">
        <span className="text-lg font-semibold text-primary-900">
          LandEstateX
        </span>
        <p className="text-xs text-neutral-500 mt-0.5">{title} Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-100 text-primary-900"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-primary-700",
              ].join(" ")
            }
            end
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-neutral-200 text-xs text-neutral-500">
        LandEstateX Admin © {new Date().getFullYear()}
      </div>
    </aside>
  );
}
