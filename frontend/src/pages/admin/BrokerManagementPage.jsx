
import { useCallback, useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";
import adminService from "../../services/admin.service";

const verificationColors = {
  pending: "bg-amber-50 text-amber-700",
  verified: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const accountColors = {
  active: "bg-green-50 text-green-700",
  blocked: "bg-red-50 text-red-700",
  pending: "bg-amber-50 text-amber-700",
};

function StatusBadge({ status, colors }) {
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        colors[status] || "bg-neutral-100 text-neutral-600"
      }`}
    >
      {label}
    </span>
  );
}

export default function BrokerManagementPage() {
  const [brokers, setBrokers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [accountStatus, setAccountStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadBrokers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await adminService.getAllBrokers({
        page,
        limit: 20,
        search,
        verificationStatus,
        accountStatus,
      });

      setBrokers(result?.brokers || []);
      setPagination(
        result?.pagination || {
          page,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load brokers."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, verificationStatus, accountStatus]);

  useEffect(() => {
    loadBrokers();
  }, [loadBrokers]);

  const changeVerification = async (broker, nextStatus) => {
    if (!nextStatus || nextStatus === broker.verification_status) {
      return;
    }

    const name = broker.user?.full_name || "this broker";
    const confirmed = window.confirm(
      `Change ${name}'s verification status to "${nextStatus}"?`
    );

    if (!confirmed) return;

    setBusyId(String(broker._id));
    setError("");
    setNotice("");

    try {
      await adminService.updateBrokerVerification(
        broker._id,
        nextStatus
      );

      setNotice("Broker verification updated successfully.");
      await loadBrokers();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update verification."
      );
    } finally {
      setBusyId("");
    }
  };

  const changeAccountStatus = async (broker) => {
    const currentStatus = broker.account_status;
    const nextStatus =
      currentStatus === "blocked" ? "active" : "blocked";

    const name = broker.user?.full_name || "this broker";

    const confirmed = window.confirm(
      nextStatus === "blocked"
        ? `Suspend ${name}'s account? They may lose access according to your authentication rules.`
        : `Reactivate ${name}'s account?`
    );

    if (!confirmed) return;

    setBusyId(String(broker._id));
    setError("");
    setNotice("");

    try {
      await adminService.updateBrokerAccountStatus(
        broker._id,
        nextStatus
      );

      setNotice(
        nextStatus === "blocked"
          ? "Broker account suspended."
          : "Broker account reactivated."
      );

      await loadBrokers();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update account status."
      );
    } finally {
      setBusyId("");
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setVerificationStatus("");
    setAccountStatus("");
    setPage(1);
  };

  return (
    <DashboardLayout
      title="Broker Management"
      links={ADMIN_NAV_LINKS}
    >
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-primary-900">
            Broker Management
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Review broker profiles, verification and account access.
          </p>
        </div>

        {notice && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={loadBrokers}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">
              Matching brokers
            </p>
            <p className="mt-1 text-2xl font-semibold text-primary-900">
              {pagination.total}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-500">
              Current page
            </p>
            <p className="mt-1 text-2xl font-semibold text-primary-900">
              {pagination.totalPages
                ? `${page} / ${pagination.totalPages}`
                : "0 / 0"}
            </p>
          </div>

          <div className="flex items-center rounded-xl border border-neutral-200 bg-white p-4">
            <button
              type="button"
              onClick={loadBrokers}
              disabled={loading}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-neutral-50 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_210px_190px_auto]">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name, email, agency, license..."
            aria-label="Search brokers"
            className="min-w-0 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500"
          />

          <select
            value={verificationStatus}
            onChange={(event) => {
              setVerificationStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter verification status"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-3 text-sm"
          >
            <option value="">All verification statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={accountStatus}
            onChange={(event) => {
              setAccountStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter account status"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-3 text-sm"
          >
            <option value="">All account statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="pending">Pending</option>
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm hover:bg-neutral-50"
          >
            Reset
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-5 py-4 font-medium">Broker</th>
                  <th className="px-5 py-4 font-medium">Agency / Location</th>
                  <th className="px-5 py-4 font-medium">Experience</th>
                  <th className="px-5 py-4 font-medium">Verification</th>
                  <th className="px-5 py-4 font-medium">Account</th>
                  <th className="px-5 py-4 font-medium">Trust score</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-neutral-500"
                    >
                      Loading brokers...
                    </td>
                  </tr>
                ) : brokers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-neutral-500"
                    >
                      {error
                        ? "Broker data could not be loaded."
                        : "No brokers found for these filters."}
                    </td>
                  </tr>
                ) : (
                  brokers.map((broker) => {
                    const user = broker.user || {};
                    const busy = busyId === String(broker._id);

                    return (
                      <tr
                        key={broker._id}
                        className="align-top hover:bg-neutral-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-primary-900">
                            {user.full_name || "Unnamed broker"}
                          </p>
                          <p className="mt-1 text-neutral-500">
                            {user.email || "No email"}
                          </p>
                          <p className="mt-1 text-xs text-neutral-400">
                            {user.phone_number || "No phone"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-neutral-800">
                            {broker.agency_name || "Independent"}
                          </p>
                          <p className="mt-1 text-neutral-500">
                            {[
                              broker.location?.locality,
                              broker.location?.city,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Location not provided"}
                          </p>
                          {broker.license_number && (
                            <p className="mt-1 text-xs text-neutral-500">
                              License: {broker.license_number}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-neutral-700">
                          {broker.experience_years ?? 0} years
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            <StatusBadge
                              status={broker.verification_status}
                              colors={verificationColors}
                            />

                            <select
                              value={broker.verification_status || "pending"}
                              disabled={busy}
                              onChange={(event) =>
                                changeVerification(
                                  broker,
                                  event.target.value
                                )
                              }
                              aria-label={`Verification status for ${
                                user.full_name || "broker"
                              }`}
                              className="block max-w-[155px] rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs disabled:opacity-50"
                            >
                              <option value="pending">Pending</option>
                              <option value="verified">Verified</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={broker.account_status}
                            colors={accountColors}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-primary-900">
                            {broker.trust_score ?? 0}/100
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Rating: {broker.rating ?? 0}/5
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Reviews: {broker.review_count ?? 0}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => changeAccountStatus(broker)}
                            className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium disabled:opacity-50 ${
                              broker.account_status === "blocked"
                                ? "border-green-200 text-green-700 hover:bg-green-50"
                                : "border-red-200 text-red-700 hover:bg-red-50"
                            }`}
                          >
                            {busy
                              ? "Saving..."
                              : broker.account_status === "blocked"
                                ? "Reactivate"
                                : "Suspend"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">
              {pagination.total === 0
                ? "No records"
                : `Showing ${(page - 1) * pagination.limit + 1}–${Math.min(
                    page * pagination.limit,
                    pagination.total
                  )} of ${pagination.total} brokers`}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  loading ||
                  !pagination.totalPages ||
                  page >= pagination.totalPages
                }
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
