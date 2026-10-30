
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

const STATUSES = [
  "pending",
  "approved",
  "rejected",
  "sold",
  "flagged",
];

const STATUS_COLORS = {
  pending: "text-amber-600",
  approved: "text-green-600",
  rejected: "text-red-600",
  sold: "text-blue-600",
  flagged: "text-red-600",
};

const EMPTY_PAGINATION = {
  page: 1,
  totalPages: 1,
  total: 0,
};

export default function PropertyManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlStatus = searchParams.get("status") || "";

  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  // Keep the selected filter synchronized with dashboard URL parameters.
  useEffect(() => {
    setStatusFilter(urlStatus);
  }, [urlStatus]);

  // Fetch properties using the currently selected filters.
  const fetchProperties = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");

      try {
        const data = await adminService.getAllProperties({
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search.trim() || undefined,
        });

        setProperties(data?.properties || []);
        setPagination(
          data?.pagination || EMPTY_PAGINATION
        );
      } catch (err) {
        setProperties([]);
        setPagination(EMPTY_PAGINATION);
        setError(
          err?.response?.data?.message ||
            "Failed to load properties. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search]
  );

  // Reload when filters change.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProperties]);

  // Update both the dropdown and URL.
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);

    const nextParams = new URLSearchParams(searchParams);

    if (status) {
      nextParams.set("status", status);
    } else {
      nextParams.delete("status");
    }

    setSearchParams(nextParams, { replace: true });
  };

  const handleStatusChange = async (property, status) => {
    const previousStatus = property.status || "pending";

    if (status === previousStatus) return;

    let rejection_reason = "";

    if (status === "rejected") {
      const reason = window.prompt(
        `Please enter the reason for rejecting "${property.title}":`
      );

      if (reason === null) return;

      rejection_reason = reason.trim();

      if (!rejection_reason) {
        setError("Rejection reason is required.");
        return;
      }

      if (rejection_reason.length > 1000) {
        setError(
          "Rejection reason cannot exceed 1000 characters."
        );
        return;
      }

      const confirmed = window.confirm(
        `Reject "${property.title}" with this reason?\n\n${rejection_reason}`
      );

      if (!confirmed) return;
    }

    if (status === "approved") {
      if (!window.confirm(`Approve "${property.title}"?`)) {
        return;
      }
    }

    if (status === "flagged") {
      if (
        !window.confirm(
          `Flag "${property.title}" for fraud review?`
        )
      ) {
        return;
      }
    }

    if (status === "sold") {
      if (!window.confirm(`Mark "${property.title}" as sold?`)) {
        return;
      }
    }

    setActionId(property._id);
    setError("");

    try {
      const updated = await adminService.updatePropertyStatus(
        property._id,
        status,
        rejection_reason
      );

      const updatedProperty = {
        ...property,
        ...updated,
        status: updated?.status || status,
        rejection_reason:
          updated?.rejection_reason ??
          (status === "rejected" ? rejection_reason : null),
        is_fraud_flagged:
          updated?.is_fraud_flagged ??
          (status === "flagged"
            ? true
            : ["approved", "pending"].includes(status)
              ? false
              : property.is_fraud_flagged),
      };

      // If the property no longer matches the active filter,
      // remove it and reload the current page's results.
      if (statusFilter && updatedProperty.status !== statusFilter) {
        await fetchProperties(pagination.page || 1);
      } else {
        setProperties((previous) =>
          previous.map((item) =>
            item._id === property._id
              ? updatedProperty
              : item
          )
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          `Failed to change status from ${previousStatus} to ${status}.`
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (property) => {
    const confirmed = window.confirm(
      `Delete "${property.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setActionId(property._id);
    setError("");

    try {
      await adminService.deleteProperty(property._id);

      const remaining = properties.filter(
        (item) => item._id !== property._id
      );

      const newTotal = Math.max((pagination.total || 0) - 1, 0);

      setProperties(remaining);
      setPagination((previous) => ({
        ...previous,
        total: newTotal,
        totalPages: Math.max(
          1,
          Math.ceil(newTotal / 20)
        ),
      }));

      if (remaining.length === 0 && pagination.page > 1) {
        await fetchProperties(pagination.page - 1);
      } else if (remaining.length === 0) {
        await fetchProperties(1);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete property. Please try again."
      );
    } finally {
      setActionId(null);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
      return "—";
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return String(price);
    }

    return `₹${numericPrice.toLocaleString("en-IN")}`;
  };

  const getOwnerName = (property) => {
    const owner = property.owner_id || property.listedBy;

    if (typeof owner === "string") return owner;

    return (
      owner?.name ||
      owner?.full_name ||
      owner?.email ||
      "—"
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSearchParams({}, { replace: true });
  };

  return (
    <DashboardLayout
      title="Property Management"
      links={ADMIN_NAV_LINKS}
    >
      {/* Search and filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search properties by title..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            handleStatusFilterChange(event.target.value)
          }
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>

          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {(statusFilter || search) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-neutral-500">
            Active filters:
          </span>

          {statusFilter && (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">
              Status: {statusFilter}
            </span>
          )}

          {search && (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">
              Search: {search}
            </span>
          )}

          <button
            type="button"
            onClick={clearFilters}
            className="font-medium text-blue-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-500">
        <span>
          {statusFilter
            ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} properties`
            : "All properties"}
          {" · "}
          Total: {pagination.total ?? properties.length}
        </span>

        <button
          type="button"
          onClick={() => fetchProperties(pagination.page || 1)}
          disabled={loading}
          className="rounded-md border border-neutral-200 px-3 py-2 hover:bg-neutral-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Listed by</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  Loading properties...
                </td>
              </tr>
            )}

            {!loading && !error && properties.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center"
                >
                  <p className="font-medium text-neutral-700">
                    {statusFilter
                      ? `No ${statusFilter} properties found.`
                      : "No properties found."}
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">
                    Try another status or clear your filters.
                  </p>

                  {(statusFilter || search) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-3 font-medium text-blue-700 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            )}

            {!loading &&
              properties.map((property) => (
                <tr
                  key={property._id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {property.title || "Untitled property"}

                    <div className="mt-1 text-xs text-neutral-400">
                      ID: {property._id}
                    </div>

                    {property.status === "rejected" &&
                      property.rejection_reason && (
                        <div className="mt-2 max-w-xs whitespace-normal text-xs font-normal text-red-600">
                          <span className="font-semibold">
                            Rejection reason:
                          </span>{" "}
                          {property.rejection_reason}
                        </div>
                      )}
                  </td>
                  

                  <td className="px-4 py-3 text-neutral-600">
                    {getOwnerName(property)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                    {formatPrice(property.price)}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      aria-label={`Status for ${property.title}`}
                      value={property.status || "pending"}
                      disabled={actionId === property._id}
                      onChange={(event) =>
                        handleStatusChange(
                          property,
                          event.target.value
                        )
                      }
                      className={`rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium disabled:opacity-50 ${
                        STATUS_COLORS[property.status] || ""
                      }`}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={actionId === property._id}
                      onClick={() => handleDelete(property)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {actionId === property._id
                        ? "Please wait..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={loading || pagination.page <= 1}
            onClick={() =>
              fetchProperties(pagination.page - 1)
            }
            className="rounded-md border border-neutral-200 px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-neutral-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={
              loading ||
              pagination.page >= pagination.totalPages
            }
            onClick={() =>
              fetchProperties(pagination.page + 1)
            }
            className="rounded-md border border-neutral-200 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
