
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

const ROLES = ["buyer", "seller", "broker", "builder", "investor", "admin"];

function getUserName(user) {

  return (
    user?.full_name ||
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.profile?.name ||
    user?.profile?.full_name ||
    "—"
  );
}

function isUserActive(user) {
  if (typeof user?.status === "string") {
    return user.status === "active";
  }

  if (typeof user?.isActive === "boolean") {
    return user.isActive;
  }

  return true;
}

function isUserVerified(user) {
  return Boolean(user?.is_verified ?? user?.isVerified ?? false);
}

export default function UserManagementPage() {
  const [searchParams] = useSearchParams();

  const urlRole = searchParams.get("role") || "";
  const urlVerified = searchParams.get("verified") ?? "";
  const urlPeriod = searchParams.get("period") || "";

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(urlRole);
  const [verifiedFilter, setVerifiedFilter] = useState(urlVerified);
  const [periodFilter, setPeriodFilter] = useState(urlPeriod);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionUserId, setActionUserId] = useState(null);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");

      try {
        const data = await adminService.getAllUsers({
          page,
          limit: 20,
          role: roleFilter || undefined,
          search: search.trim() || undefined,
          verified: verifiedFilter !== "" ? verifiedFilter : undefined,
          period: periodFilter || undefined,
        });

        setUsers(Array.isArray(data?.users) ? data.users : []);

        setPagination(
          data?.pagination || {
            page,
            totalPages: 1,
            total: Array.isArray(data?.users)
              ? data.users.length
              : 0,
          }
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load users."
        );
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter, verifiedFilter, periodFilter]
  );

  // Keep filters synchronized when dashboard navigation changes URL query params.
  useEffect(() => {
    setRoleFilter(urlRole);
    setVerifiedFilter(urlVerified);
    setPeriodFilter(urlPeriod);
  }, [urlRole, urlVerified, urlPeriod]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(1), 350);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const handleVerifyUser = async (user) => {
    if (actionUserId !== null) return;

    if (!user?._id) {
      setError("Cannot verify user: user ID is missing.");
      return;
    }

    if (isUserVerified(user)) return;

    setActionUserId(user._id);
    setError("");
    setSuccess("");

    try {
      // Save verification in the database through the backend.
      await adminService.verifyUser(user._id);

      // Update the UI immediately.
      setUsers((previous) =>
        previous.map((item) =>
          item._id === user._id
            ? {
                ...item,
                is_verified: true,
                isVerified: true,
              }
            : item
        )
      );

      setSuccess(`${getUserName(user)} verified successfully.`);

      // Fetch persisted data from the backend.
      await fetchUsers(pagination.page);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to verify user."
      );
    } finally {
      setActionUserId(null);
    }
  };

  const handleToggleStatus = async (user) => {
    if (actionUserId !== null) return;

    if (!user?._id) {
      setError("Cannot update status: user ID is missing.");
      return;
    }

    const nextIsActive = !isUserActive(user);

    setActionUserId(user._id);
    setError("");
    setSuccess("");

    try {
      const response = await adminService.updateUserStatus(
        user._id,
        nextIsActive
      );

      const updatedStatus =
        response?.status ||
        (typeof response?.isActive === "boolean"
          ? response.isActive
            ? "active"
            : "blocked"
          : nextIsActive
            ? "active"
            : "blocked");

      setUsers((previous) =>
        previous.map((item) =>
          item._id === user._id
            ? {
                ...item,
                status: updatedStatus,
                isActive: updatedStatus === "active",
              }
            : item
        )
      );

      setSuccess(
        `User ${nextIsActive ? "reactivated" : "suspended"} successfully.`
      );

      await fetchUsers(pagination.page);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update user status."
      );
    } finally {
      setActionUserId(null);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (actionUserId !== null || newRole === user?.role) return;

    if (!user?._id) {
      setError("Cannot update role: user ID is missing.");
      return;
    }

    setActionUserId(user._id);
    setError("");
    setSuccess("");

    try {
      await adminService.updateUserRole(user._id, newRole);

      setUsers((previous) =>
        previous.map((item) =>
          item._id === user._id
            ? { ...item, role: newRole }
            : item
        )
      );

      setSuccess("User role updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update user role."
      );
    } finally {
      setActionUserId(null);
    }
  };

  const handleDelete = async (user) => {
    if (!user?._id || actionUserId !== null) {
      if (!user?._id) {
        setError("Cannot delete user: user ID is missing.");
      }
      return;
    }

    const displayName = getUserName(user);

    const confirmed = window.confirm(
      `Permanently delete ${
        displayName !== "—"
          ? displayName
          : user.email || "this user"
      }? This action cannot be undone.`
    );

    if (!confirmed) return;

    setActionUserId(user._id);
    setError("");
    setSuccess("");

    try {
      await adminService.deleteUser(user._id);

      const remaining = users.filter(
        (item) => item._id !== user._id
      );

      setUsers(remaining);

      setPagination((previous) => ({
        ...previous,
        total: Math.max((previous.total || 0) - 1, 0),
      }));

      setSuccess("User deleted successfully.");

      if (remaining.length === 0 && pagination.page > 1) {
        await fetchUsers(pagination.page - 1);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setActionUserId(null);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchUsers(page);
  };

  return (
    <DashboardLayout
      title="User Management"
      links={ADMIN_NAV_LINKS}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && !error && (
        <div
          role="status"
          className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <div className="mb-3 text-sm text-neutral-500">
        Total users: {pagination.total ?? users.length}
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-0">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-neutral-500"
                >
                  Loading users...
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && !error && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-neutral-500"
                >
                  No users found.
                </td>
              </tr>
            )}

            {!loading &&
              users.map((user, index) => {
                const userId = user?._id;
                const rowKey =
                  userId || user?.email || `user-${index}`;
                const active = isUserActive(user);
                const verified = isUserVerified(user);
                const busy = actionUserId === userId;

                return (
                  <tr
                    key={rowKey}
                    className="border-b border-neutral-200 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-primary-900">
                      {getUserName(user)}
                    </td>

                    <td className="px-4 py-3 text-neutral-500">
                      {user?.email || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        aria-label={`Role for ${
                          user?.email || getUserName(user)
                        }`}
                        value={user?.role || "buyer"}
                        disabled={!userId || actionUserId !== null}
                        onChange={(event) =>
                          handleRoleChange(user, event.target.value)
                        }
                        className="rounded-md border border-neutral-200 px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            verified
                              ? "text-green-600 text-xs font-medium"
                              : "text-amber-600 text-xs font-medium"
                          }
                        >
                          {verified ? "Verified" : "Pending"}
                        </span>

                        {!verified && (
                          <button
                            type="button"
                            disabled={!userId || actionUserId !== null}
                            onClick={() => handleVerifyUser(user)}
                            className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busy ? "Please wait..." : "Verify"}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={
                          active
                            ? "text-green-600 text-xs font-medium"
                            : "text-red-600 text-xs font-medium"
                        }
                      >
                        {active ? "Active" : "Suspended"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          disabled={!userId || actionUserId !== null}
                          onClick={() => handleToggleStatus(user)}
                          className="text-xs font-medium text-primary-700 hover:text-primary-900 disabled:opacity-50"
                        >
                          {busy
                            ? "Please wait..."
                            : active
                              ? "Suspend"
                              : "Reactivate"}
                        </button>

                        <button
                          type="button"
                          disabled={!userId || actionUserId !== null}
                          onClick={() => handleDelete(user)}
                          className="text-xs font-medium text-red-600 hover:opacity-80 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={loading || pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-sm text-neutral-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={
              loading ||
              pagination.page >= pagination.totalPages
            }
            onClick={() => handlePageChange(pagination.page + 1)}
            className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
