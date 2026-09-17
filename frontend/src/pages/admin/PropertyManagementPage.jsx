/**
 * PropertyManagementPage.jsx
 * /admin/properties — moderation queue: approve/reject/flag listings.
 */

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

const STATUSES = ["pending", "approved", "rejected", "flagged"];

const STATUS_COLORS = {
  pending: "text-warning-600",
  approved: "text-success-600",
  rejected: "text-danger-600",
  flagged: "text-danger-600",
};

export default function PropertyManagementPage() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const fetchProperties = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const data = await adminService.getAllProperties({
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        });
        setProperties(data.properties);
        setPagination(data.pagination);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load properties — check that the Property module is wired in yet"
        );
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search]
  );

  useEffect(() => {
    const t = setTimeout(() => fetchProperties(1), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const handleStatusChange = async (property, status) => {
    setActionId(property._id);
    try {
      await adminService.updatePropertyStatus(property._id, status);
      setProperties((prev) =>
        prev.map((p) => (p._id === property._id ? { ...p, status } : p))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (property) => {
    if (!window.confirm(`Delete "${property.title}"? This can't be undone.`))
      return;
    setActionId(property._id);
    try {
      await adminService.deleteProperty(property._id);
      setProperties((prev) => prev.filter((p) => p._id !== property._id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete property");
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout title="Property Management" links={ADMIN_NAV_LINKS}>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-danger-600/30 bg-danger-600/5 px-4 py-3 text-sm text-danger-600 mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-0">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Listed by</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  Loading properties...
                </td>
              </tr>
            )}
            {!loading && properties.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  No properties found.
                </td>
              </tr>
            )}
            {!loading &&
              properties.map((property) => (
                <tr
                  key={property._id}
                  className="border-b border-neutral-200 last:border-0"
                >
                  <td className="px-4 py-3 text-primary-900 font-medium">
                    {property.title}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {property.listedBy?.name || property.listedBy?.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {property.price
                      ? `₹${Number(property.price).toLocaleString("en-IN")}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={property.status}
                      disabled={actionId === property._id}
                      onChange={(e) =>
                        handleStatusChange(property, e.target.value)
                      }
                      className={`rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium ${
                        STATUS_COLORS[property.status] || ""
                      }`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={actionId === property._id}
                      onClick={() => handleDelete(property)}
                      className="text-xs font-medium text-danger-600 hover:opacity-80 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchProperties(pagination.page - 1)}
            className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-neutral-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchProperties(pagination.page + 1)}
            className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
