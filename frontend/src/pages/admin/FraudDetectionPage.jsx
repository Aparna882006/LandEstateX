
import { useCallback, useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

const SEVERITY_STYLES = {
  low: "bg-green-500/10 text-green-700",
  medium: "bg-orange-500/10 text-orange-700",
  high: "bg-red-500/10 text-red-700",
};

const REVIEW_STYLES = {
  pending: "bg-amber-500/10 text-amber-700",
  reviewed: "bg-blue-500/10 text-blue-700",
  confirmed: "bg-red-500/10 text-red-700",
  dismissed: "bg-neutral-500/10 text-neutral-600",
};

const TYPE_LABELS = {
  price_deviation: "Price deviation",
  excessive_listings: "Excessive listings",
  stale_unverified: "Unverified account",
  blocked_account: "Blocked account",
  extreme_price_deviation: "Extreme price deviation",
  excessive_listing_volume: "Excessive listing volume",
  unusual_price_per_sqft: "Unusual price per sq. ft.",
  incomplete_description: "Incomplete description",
};

const EMPTY_PAGINATION = {
  current_page: 1,
  per_page: 10,
  total_reports: 0,
  total_pages: 1,
};

const formatCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "N/A";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleString("en-IN");
};

function StatusBadge({ value, styles }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[value] || "bg-neutral-100 text-neutral-600"
      }`}
    >
      {value || "Unknown"}
    </span>
  );
}

function RiskScore({ score }) {
  const numericScore = Math.min(
    Math.max(Number(score) || 0, 0),
    100
  );

  const color =
    numericScore >= 70
      ? "bg-red-600"
      : numericScore >= 40
        ? "bg-orange-500"
        : "bg-green-600";

  return (
    <div className="min-w-28">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-primary-900">
          {numericScore}/100
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${numericScore}%` }}
        />
      </div>
    </div>
  );
}

export default function FraudDetectionPage() {
  const [flags, setFlags] = useState([]);
  const [thresholds, setThresholds] = useState(null);

  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");

  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const [severityFilter, setSeverityFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);

  const [analyzing, setAnalyzing] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("reviewed");
  const [adminNotes, setAdminNotes] = useState("");

  const [latestAnalysis, setLatestAnalysis] = useState(null);

  // -----------------------------------------
  // Load existing fraud flags
  // -----------------------------------------
  const fetchFlags = useCallback(async () => {
    try {
      const data = await adminService.getFraudFlags();

      setFlags(Array.isArray(data?.flags) ? data.flags : []);
      setThresholds(data?.thresholds || null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load existing fraud flags."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------
  // Load properties for AI analysis
  // -----------------------------------------
  const fetchProperties = useCallback(async () => {
    setPropertiesLoading(true);

    try {
      const data = await adminService.getAllProperties({
        page: 1,
        limit: 100,
      });

      setProperties(
        Array.isArray(data?.properties) ? data.properties : []
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load properties."
      );
    } finally {
      setPropertiesLoading(false);
    }
  }, []);

  // -----------------------------------------
  // Load fraud reports
  // -----------------------------------------
  const fetchReports = useCallback(
    async (page = 1) => {
      setReportsLoading(true);

      try {
        const filters = {
          page,
          limit: 10,
        };

        if (reviewFilter !== "all") {
          filters.review_status = reviewFilter;
        }

        if (severityFilter !== "all") {
          filters.severity = severityFilter;
        }

        const data = await adminService.getFraudReports(filters);

        setReports(
          Array.isArray(data?.reports) ? data.reports : []
        );

        setPagination(
          data?.pagination || EMPTY_PAGINATION
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load fraud reports."
        );
      } finally {
        setReportsLoading(false);
      }
    },
    [reviewFilter, severityFilter]
  );

  useEffect(() => {
    fetchFlags();
    fetchProperties();
  }, [fetchFlags, fetchProperties]);

  useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  // -----------------------------------------
  // Analyze selected property
  // -----------------------------------------
  const handleAnalyze = async () => {
    if (!selectedPropertyId) {
      setError("Please select a property first.");
      return;
    }

    const property = properties.find(
      (item) => item._id === selectedPropertyId
    );

    if (!property) {
      setError("Selected property could not be found.");
      return;
    }

    const confirmed = window.confirm(
      `Run AI fraud analysis for "${property.title}"?`
    );

    if (!confirmed) return;

    setAnalyzing(true);
    setError("");
    setSuccess("");
    setLatestAnalysis(null);

    try {
      const response =
        await adminService.analyzePropertyFraud(
          selectedPropertyId
        );

      const report =
        response?.report ||
        response?.data?.report ||
        null;

      const analysis =
        report ||
        response?.analysis ||
        response?.data?.analysis ||
        null;

      if (analysis) {
        setLatestAnalysis(analysis);
      }

      setSuccess(
        "AI fraud analysis completed and report saved successfully."
      );

      await fetchReports(1);
      await fetchFlags();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "AI fraud analysis failed."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // -----------------------------------------
  // Open admin review
  // -----------------------------------------
  const openReview = (report) => {
    setSelectedReport(report);
    setReviewStatus(
      report.review_status === "pending"
        ? "reviewed"
        : report.review_status
    );
    setAdminNotes(report.admin_notes || "");
    setError("");
    setSuccess("");
  };

  // -----------------------------------------
  // Submit admin review
  // -----------------------------------------
  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!selectedReport?._id) return;

    if (
      !["reviewed", "confirmed", "dismissed"].includes(
        reviewStatus
      )
    ) {
      setError("Please select a valid review status.");
      return;
    }

    if (adminNotes.length > 2000) {
      setError("Admin notes cannot exceed 2000 characters.");
      return;
    }

    setReviewingId(selectedReport._id);
    setError("");
    setSuccess("");

    try {
      await adminService.reviewFraudReport(
        selectedReport._id,
        {
          review_status: reviewStatus,
          admin_notes: adminNotes.trim(),
        }
      );

      setSuccess("Fraud report review updated successfully.");
      setSelectedReport(null);

      await fetchReports(pagination.current_page || 1);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update fraud report review."
      );
    } finally {
      setReviewingId(null);
    }
  };

  // -----------------------------------------
  // Existing flags filtering
  // -----------------------------------------
  const filteredFlags = flags.filter((flag) => {
    const query = search.trim().toLowerCase();

    const matchesSeverity =
      severityFilter === "all" ||
      flag.severity === severityFilter;

    const matchesSearch =
      !query ||
      flag.user?.full_name?.toLowerCase().includes(query) ||
      flag.user?.email?.toLowerCase().includes(query) ||
      flag.property?.title?.toLowerCase().includes(query) ||
      flag.message?.toLowerCase().includes(query);

    return matchesSeverity && matchesSearch;
  });

  return (
    <DashboardLayout
      title="Fraud Detection"
      links={ADMIN_NAV_LINKS}
    >
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-primary-900">
              AI Fraud Detection Center
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Analyze property risk, inspect AI signals and manage
              admin reviews.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchFlags();
              fetchProperties();
              fetchReports(1);
            }}
            disabled={loading || reportsLoading}
            className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-neutral-100 disabled:opacity-50"
          >
            Refresh Data
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-3 font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {/* Thresholds */}
        {thresholds && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
            <h3 className="font-semibold text-primary-900">
              Fraud Detection Rules
            </h3>

            <div className="mt-3 flex flex-wrap gap-6 text-sm text-neutral-600">
              <p>
                Price deviation threshold:{" "}
                <strong>
                  {thresholds.priceDeviationPercent}%
                </strong>
              </p>

              <p>
                Daily listing limit:{" "}
                <strong>
                  {thresholds.maxListingsPerDay}
                </strong>
              </p>
            </div>
          </div>
        )}

        {/* AI Analysis */}
        <section className="rounded-lg border border-neutral-200 bg-neutral-0 p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-primary-900">
              Run AI Property Analysis
            </h3>

            <p className="mt-1 text-sm text-neutral-500">
              Select a property to generate an explainable fraud
              risk assessment.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedPropertyId}
              onChange={(event) =>
                setSelectedPropertyId(event.target.value)
              }
              disabled={propertiesLoading || analyzing}
              className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">
                {propertiesLoading
                  ? "Loading properties..."
                  : "Select a property"}
              </option>

              {properties.map((property) => (
                <option
                  key={property._id}
                  value={property._id}
                >
                  {property.title} —{" "}
                  {property.location?.city || "Unknown city"} —{" "}
                  {formatCurrency(property.price)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={
                !selectedPropertyId ||
                analyzing ||
                propertiesLoading
              }
              className="rounded-md bg-primary-900 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing
                ? "Analyzing..."
                : "Run AI Analysis"}
            </button>
          </div>

          {properties.length === 0 && !propertiesLoading && (
            <p className="mt-3 text-sm text-amber-700">
              No properties are available for analysis.
            </p>
          )}

          {latestAnalysis && (
            <div className="mt-5 rounded-lg border border-neutral-200 p-4">
              <h4 className="mb-3 font-semibold text-primary-900">
                Latest Analysis
              </h4>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-neutral-500">
                    Risk Score
                  </p>

                  <p className="mt-1 text-2xl font-bold text-primary-900">
                    {latestAnalysis.risk_score ?? "N/A"}/100
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">
                    Severity
                  </p>

                  <div className="mt-2">
                    <StatusBadge
                      value={latestAnalysis.severity}
                      styles={SEVERITY_STYLES}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">
                    Suspicious
                  </p>

                  <p className="mt-2 font-semibold text-primary-900">
                    {latestAnalysis.is_suspicious
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
              </div>

              {latestAnalysis.recommendation && (
                <p className="mt-4 text-sm text-neutral-600">
                  <strong>Recommendation:</strong>{" "}
                  {latestAnalysis.recommendation}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Fraud Reports */}
        <section className="rounded-lg border border-neutral-200 bg-neutral-0 p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold text-primary-900">
                AI Fraud Reports
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Total reports: {pagination.total_reports || 0}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={reviewFilter}
                onChange={(event) =>
                  setReviewFilter(event.target.value)
                }
                className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
              >
                <option value="all">All review statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="confirmed">Confirmed</option>
                <option value="dismissed">Dismissed</option>
              </select>

              <select
                value={severityFilter}
                onChange={(event) =>
                  setSeverityFilter(event.target.value)
                }
                className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
              >
                <option value="all">All severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {reportsLoading ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              Loading fraud reports...
            </p>
          ) : reports.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 px-5 py-10 text-center">
              <p className="font-medium text-primary-900">
                No fraud reports found
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Run AI analysis on a property to generate a report.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="px-3 py-3">Property</th>
                    <th className="px-3 py-3">Risk Score</th>
                    <th className="px-3 py-3">Severity</th>
                    <th className="px-3 py-3">Review Status</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report._id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-3 py-3">
                        <p className="font-medium text-primary-900">
                          {report.property_id?.title ||
                            "Property unavailable"}
                        </p>

                        <p className="text-xs text-neutral-500">
                          {report.property_id?.location?.city ||
                            "Unknown city"}
                        </p>
                      </td>

                      <td className="min-w-32 px-3 py-3">
                        <RiskScore score={report.risk_score} />
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge
                          value={report.severity}
                          styles={SEVERITY_STYLES}
                        />
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge
                          value={report.review_status}
                          styles={REVIEW_STYLES}
                        />
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-xs text-neutral-500">
                        {formatDate(report.created_at)}
                      </td>

                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => openReview(report)}
                          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-primary-900 hover:bg-neutral-100"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
            <p className="text-xs text-neutral-500">
              Page {pagination.current_page || 1} of{" "}
              {pagination.total_pages || 1}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  reportsLoading ||
                  !pagination.has_previous_page
                }
                onClick={() =>
                  fetchReports(
                    (pagination.current_page || 1) - 1
                  )
                }
                className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  reportsLoading ||
                  !pagination.has_next_page
                }
                onClick={() =>
                  fetchReports(
                    (pagination.current_page || 1) + 1
                  )
                }
                className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* Existing Fraud Flags */}
        <section className="rounded-lg border border-neutral-200 bg-neutral-0 p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-primary-900">
              Existing Fraud Flags
            </h3>

            <p className="mt-1 text-sm text-neutral-500">
              Existing rule-based account and listing flags.
            </p>
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
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

          {loading ? (
            <p className="py-5 text-sm text-neutral-500">
              Loading fraud flags...
            </p>
          ) : filteredFlags.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              No matching fraud flags.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="px-3 py-3">User</th>
                    <th className="px-3 py-3">Property</th>
                    <th className="px-3 py-3">Flag</th>
                    <th className="px-3 py-3">Severity</th>
                    <th className="px-3 py-3">Since</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFlags.map((flag) => (
                    <tr
                      key={flag.id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-3 py-3">
                        <p className="font-medium text-primary-900">
                          {flag.user?.full_name || "Unknown user"}
                        </p>

                        <p className="text-xs text-neutral-500">
                          {flag.user?.email || "N/A"}
                        </p>
                      </td>

                      <td className="px-3 py-3">
                        {flag.property?.title || "N/A"}
                      </td>

                      <td className="px-3 py-3">
                        <p className="font-medium">
                          {TYPE_LABELS[flag.type] ||
                            flag.type ||
                            "Review"}
                        </p>

                        <p className="mt-1 max-w-xs text-xs text-neutral-500">
                          {flag.message || "No details"}
                        </p>
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge
                          value={flag.severity}
                          styles={SEVERITY_STYLES}
                        />
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-xs text-neutral-500">
                        {formatDate(flag.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs text-neutral-500">
          Automated AI risk assessments are not proof of fraud.
          Admin review is required before taking action.
        </p>
      </div>

      {/* Admin Review Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReport(null);
            }
          }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">
                  Review Fraud Report
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  {selectedReport.property_id?.title ||
                    "Property unavailable"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-xl text-neutral-500 hover:text-neutral-900"
                aria-label="Close review dialog"
              >
                ×
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 p-4">
              <div>
                <p className="text-xs text-neutral-500">
                  Risk Score
                </p>

                <p className="mt-1 text-xl font-bold text-primary-900">
                  {selectedReport.risk_score}/100
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">
                  Severity
                </p>

                <div className="mt-2">
                  <StatusBadge
                    value={selectedReport.severity}
                    styles={SEVERITY_STYLES}
                  />
                </div>
              </div>
            </div>

            <h4 className="mb-2 text-sm font-semibold text-primary-900">
              Detected Signals
            </h4>

            {selectedReport.signals?.length > 0 ? (
              <div className="mb-5 space-y-2">
                {selectedReport.signals.map((signal, index) => (
                  <div
                    key={`${signal.type}-${index}`}
                    className="rounded-md border border-neutral-200 p-3"
                  >
                    <div className="flex justify-between gap-3">
                      <p className="text-sm font-medium text-primary-900">
                        {TYPE_LABELS[signal.type] ||
                          signal.type}
                      </p>

                      <span className="text-xs font-semibold text-orange-600">
                        +{signal.points} points
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-neutral-500">
                      {signal.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-5 rounded-md bg-green-50 p-3 text-sm text-green-700">
                No suspicious signals were detected.
              </p>
            )}

            {selectedReport.recommendation && (
              <div className="mb-5 rounded-md bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-800">
                  AI Recommendation
                </p>

                <p className="mt-1 text-sm text-blue-900">
                  {selectedReport.recommendation}
                </p>
              </div>
            )}

            <form onSubmit={handleReviewSubmit}>
              <label
                htmlFor="fraud-review-status"
                className="mb-2 block text-sm font-medium text-primary-900"
              >
                Review Decision
              </label>

              <select
                id="fraud-review-status"
                value={reviewStatus}
                onChange={(event) =>
                  setReviewStatus(event.target.value)
                }
                className="mb-4 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
                required
              >
                <option value="reviewed">Reviewed</option>
                <option value="confirmed">Confirmed Fraud</option>
                <option value="dismissed">Dismissed</option>
              </select>

              <label
                htmlFor="fraud-admin-notes"
                className="mb-2 block text-sm font-medium text-primary-900"
              >
                Admin Notes
              </label>

              <textarea
                id="fraud-admin-notes"
                value={adminNotes}
                onChange={(event) =>
                  setAdminNotes(event.target.value)
                }
                rows={4}
                maxLength={2000}
                placeholder="Enter your review observations..."
                className="mb-4 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />

              <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={reviewingId === selectedReport._id}
                  className="rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {reviewingId === selectedReport._id
                    ? "Saving..."
                    : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
