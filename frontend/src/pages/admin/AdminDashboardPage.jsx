/**
 * AdminDashboardPage.jsx
 * Landing page for /admin — pulls dashboard-stats and renders StatCards.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/admin/StatCard";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await adminService.getDashboardStats();
        if (mounted) setStats(data);
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message || "Failed to load dashboard stats"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" links={ADMIN_NAV_LINKS}>
      <p className="text-sm text-neutral-500 mb-6">
        Platform overview — users, verification status, and growth.
      </p>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-neutral-200 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-md border border-danger-600/30 bg-danger-600/5 px-4 py-3 text-sm text-danger-600">
          {error}
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} />
            <StatCard label="Buyers" value={stats.totalBuyers} />
            <StatCard label="Brokers" value={stats.totalBrokers} />
            <StatCard label="Verified Users" value={stats.verifiedUsers} />
            <StatCard
              label="Unverified Users"
              value={stats.unverifiedUsers}
            />
            <StatCard
              label="New This Week"
              value={stats.newUsersThisWeek}
              accent
            />
            <StatCard
              label="Total Properties"
              value={
                stats.totalProperties === null
                  ? "Not yet built"
                  : stats.totalProperties
              }
            />
          </div>

          <div className="mt-8">
            <Link
              to="/admin/users"
              className="inline-flex items-center rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-900 transition-colors"
            >
              Manage Users →
            </Link>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
