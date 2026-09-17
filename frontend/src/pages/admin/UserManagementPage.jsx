/**
 * UserManagementPage.jsx
 * /admin/users — searchable, paginated user table with role change,
 * suspend/reactivate, and delete actions.
 */

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

const ROLES = ["buyer", "seller", "broker", "builder", "investor", "admin"];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionUserId, setActionUserId] = useState(null); // disables buttons mid-request

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const data = await adminService.getAllUsers({
          page,
          limit: 20,
          role: roleFilter || undefined,
          search: search || undefined,
        });
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter]
  );

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(1), 350); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const handleToggleStatus = async (user) => {
    setActionUserId(user._id);
    try {
      await adminService.updateUserStatus(user._id, !user.isActive);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: !user.isActive } : u
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setActionUserId(null);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (newRole === user.role) return;
    setActionUserId(user._id);
    try {
      await adminService.updateUserRole(user._id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update role");
    } finally {
      setActionUserId(null);
    }
  };

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Permanently delete ${user.name || user.email}? This can't be undone.`
      )
    )
      return;

    setActionUserId(user._id);
    try {
      await adminService.deleteUser(user._id);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <DashboardLayout title="User Management" links={ADMIN_NAV_LINKS}>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">
                  Loading users...
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">
                  No users found.
                </td>
              </tr>
            )}

            {!loading &&
              users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-neutral-200 last:border-0"
                >
                  <td className="px-4 py-3 text-primary-900 font-medium">
                    {user.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      disabled={actionUserId === user._id}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      className="rounded-md border border-neutral-200 px-2 py-1 text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.isVerified
                          ? "text-success-600 text-xs font-medium"
                          : "text-warning-600 text-xs font-medium"
                      }
                    >
                      {user.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.isActive === false
                          ? "text-danger-600 text-xs font-medium"
                          : "text-success-600 text-xs font-medium"
                      }
                    >
                      {user.isActive === false ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button
                        disabled={actionUserId === user._id}
                        onClick={() => handleToggleStatus(user)}
                        className="text-xs font-medium text-primary-700 hover:text-primary-900 disabled:opacity-50"
                      >
                        {user.isActive === false ? "Reactivate" : "Suspend"}
                      </button>
                      <button
                        disabled={actionUserId === user._id}
                        onClick={() => handleDelete(user)}
                        className="text-xs font-medium text-danger-600 hover:opacity-80 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
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
            onClick={() => fetchUsers(pagination.page - 1)}
            className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-neutral-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchUsers(pagination.page + 1)}
            className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
