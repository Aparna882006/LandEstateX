import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

const SEVERITY_STYLES = {
  low: "bg-warning-600/10 text-warning-600",
  medium: "bg-orange-500/10 text-orange-600",
  high: "bg-danger-600/10 text-danger-600",
};

const TYPE_LABELS = {
  price_deviation: "Price deviation",
  excessive_listings: "Excessive listings",
  stale_unverified: "Unverified account",
  blocked_account: "Blocked account",
};

export default function FraudDetectionPage() {
  const [flags, setFlags] = useState([]);
  const [thresholds, setThresholds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchFlags = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await adminService.getFraudFlags();

      setFlags(Array.isArray(data.flags) ? data.flags : []);
      setThresholds(data.thresholds || null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load fraud flags"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const filteredFlags = flags.filter((flag) => {
    const matchesSeverity =
      severityFilter === "all" ||
      flag.severity === severityFilter;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      flag.user?.full_name?.toLowerCase().includes(query) ||
      flag.user?.email?.toLowerCase().includes(query) ||
      flag.property?.title?.toLowerCase().includes(query) ||
      flag.message?.toLowerCase().includes(query);

    return matchesSeverity && matchesSearch;
  });

  return (
    <DashboardLayout title="Fraud Detection" links={ADMIN_NAV_LINKS}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">
            Rule-based risk signals. Flags identify accounts and
            listings that may need admin review.
          </p>

          {thresholds && (
            <p className="mt-2 text-xs text-neutral-500">
              Price deviation threshold:{" "}
              <strong>{thresholds.priceDeviationPercent}%</strong>
              {" · "}
              Daily listing limit:{" "}
              <strong>{thresholds.maxListingsPerDay}</strong>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={fetchFlags}
          disabled={loading}
          className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-neutral-100 disabled:opacity-50"
        >
          {loading ? "Scanning..." : "Refresh"}
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search user, property, or flag..."
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm sm:max-w-sm"
        />

        <select
          value={severityFilter}
          onChange={(event) =>
            setSeverityFilter(event.target.value)
          }
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="all">All severity</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading && (
        <p className="text-sm text-neutral-500">
          Scanning accounts and listings...
        </p>
      )}

      {!loading && error && (
        <div className="mb-4 rounded-md border border-danger-600/30 bg-danger-600/5 px-4 py-3 text-sm text-danger-600">
          {error}
        </div>
      )}

      {!loading && !error && filteredFlags.length === 0 && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-0 px-6 py-10 text-center">
          <p className="text-sm font-medium text-primary-900">
            No matching fraud flags
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            Try changing your search or severity filter.
          </p>
        </div>
      )}

      {!loading && !error && filteredFlags.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Flag</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Since</th>
              </tr>
            </thead>

            <tbody>
              {filteredFlags.map((flag) => (
                <tr
                  key={flag.id}
                  className="border-b border-neutral-200 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-900">
                      {flag.user?.full_name || "Unknown user"}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {flag.user?.email || "—"}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    {flag.property ? (
                      <>
                        <p className="font-medium text-primary-900">
                          {flag.property.title ||
                            "Untitled property"}
                        </p>

                        <p className="text-xs text-neutral-500">
                          {flag.property.city}
                          {flag.property.locality
                            ? `, ${flag.property.locality}`
                            : ""}
                        </p>

                        <p className="text-xs text-neutral-500">
                          Price:{" "}
                          {Number(
                            flag.property.price
                          ).toLocaleString()}
                        </p>

                        <p className="text-xs text-neutral-500">
                          AI predicted:{" "}
                          {Number(
                            flag.property.predictedPrice
                          ).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-900">
                      {TYPE_LABELS[flag.type] ||
                        flag.type ||
                        "Review"}
                    </p>

                    <p className="mt-1 max-w-sm text-xs text-neutral-500">
                      {flag.message || "No details provided"}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        SEVERITY_STYLES[flag.severity] ||
                        "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {flag.severity || "unknown"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                    {flag.created_at
                      ? new Date(
                          flag.created_at
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-neutral-500">
        These rules are automated review signals, not proof of
        fraud. Admin review is recommended before taking action
        against an account.
      </p>
    </DashboardLayout>
  );
}