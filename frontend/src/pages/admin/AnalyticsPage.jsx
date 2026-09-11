/**
 * AnalyticsPage.jsx
 * /admin/analytics — user growth line chart + role distribution bar chart.
 * Requires `recharts` — run `npm install recharts` in frontend/ if not
 * already a dependency.
 */

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

export default function AnalyticsPage() {
  const [growth, setGrowth] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [growthData, roleData] = await Promise.all([
          adminService.getUserGrowth(30),
          adminService.getRoleDistribution(),
        ]);
        if (mounted) {
          setGrowth(growthData.series);
          setRoles(roleData.distribution);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || "Failed to load analytics");
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
    <DashboardLayout title="Analytics" links={ADMIN_NAV_LINKS}>
      {loading && (
        <p className="text-sm text-neutral-500">Loading analytics...</p>
      )}

      {!loading && error && (
        <div className="rounded-md border border-danger-600/30 bg-danger-600/5 px-4 py-3 text-sm text-danger-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-5">
            <p className="text-sm font-medium text-primary-900 mb-4">
              New users — last 30 days
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval={Math.ceil(growth.length / 6)}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#7C5CFC"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-5">
            <p className="text-sm font-medium text-primary-900 mb-4">
              Users by role
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={roles}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="role" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#F5A623" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
