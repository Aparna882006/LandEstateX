/**
 * adminNavLinks.js — single source of truth for the admin Sidebar links.
 * Add more entries here as the Broker/Property/Reports admin pages get built.
 */
export const ADMIN_NAV_LINKS = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/properties", label: "Properties" },
  { to: "/admin/brokers", label: "Brokers" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/fraud", label: "Fraud" },
  { to: "/admin/settings", label: "Settings" },
];
