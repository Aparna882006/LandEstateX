/**
 * FraudDetectionPage.jsx
 * /admin/fraud — rule-based risk queue (stale unverified accounts,
 * suspended accounts). See adminAnalytics.controller.js::getFraudFlags.
 */

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

const SEVERITY_STYLES = {
  low: "text-warning-600",
  medium: "text-danger-600",
  high: "text-danger-600",
};

export default function FraudDetectionPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await adminService.getFraudFlags();
        if (mounted) setFlags(data.flags);
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || "Failed to load fraud flags");
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
    <DashboardLayout title="Fraud Detection" links={ADMIN_NAV_LINKS}>
      <p className="text-sm text-neutral-500 mb-5">
        Rule-based risk signals — not ML. Thresholds are configurable in
        Settings.
      </p>

      {loading && <p className="text-sm text-neutral-500">Scanning...</p>}

      {!loading && error && (
        <div className="rounded-md border border-danger-600/30 bg-danger-600/5 px-4 py-3 text-sm text-danger-600">
          {error}
        </div>
      )}

      {!loading && !error && flags.length === 0 && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-0 px-6 py-10 text-center text-sm text-neutral-500">
          No flags right now.
        </div>
      )}

      {!loading && !error && flags.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Flag</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Since</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag, i) => (
                <tr
                  key={`${flag.userId}-${i}`}
                  className="border-b border-neutral-200 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="text-primary-900 font-medium">
                      {flag.name || "—"}
                    </p>
                    <p className="text-neutral-500 text-xs">{flag.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {flag.message}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${
                        SEVERITY_STYLES[flag.severity] || ""
                      }`}
                    >
                      {flag.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {flag.since ? new Date(flag.since).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
