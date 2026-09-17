import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarClock,
  Star,
  ShieldCheck,
  Bell,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/broker/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/broker/properties", label: "Properties", icon: Building2 },
  { to: "/broker/leads", label: "Leads", icon: Users },
  { to: "/broker/appointments", label: "Appointments", icon: CalendarClock },
  { to: "/broker/reviews", label: "Reviews", icon: Star },
  { to: "/broker/trust-score", label: "Trust Score", icon: ShieldCheck },
  { to: "/broker/notifications", label: "Notifications", icon: Bell },
];

export default function BrokerSidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-neutral-200 bg-neutral-0 min-h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-neutral-200">
        <span className="text-lg font-semibold text-primary-900 tracking-tight">
          LandEstate<span className="text-accent-600">X</span>
        </span>
        <p className="text-xs text-neutral-500 mt-0.5">Broker Portal</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-100 text-primary-900"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-200">
        <NavLink
          to="/broker/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
        >
          <Settings size={18} strokeWidth={2} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
