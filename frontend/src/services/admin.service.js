/**
 * admin.service.js
 * Talks to the /admin backend routes using the shared `api` Axios instance
 * (services/api.js) — same pattern as auth.service.js, so the 401 refresh
 * interceptor is inherited automatically.
 */

import api from "./api";

const BASE = "/admin";

export const adminService = {
  getDashboardStats: async () => {
    const { data } = await api.get(`${BASE}/dashboard-stats`);
    return data.data;
  },

  getAllUsers: async ({ page = 1, limit = 20, role, isVerified, search } = {}) => {
    const params = { page, limit };
    if (role) params.role = role;
    if (isVerified !== undefined) params.isVerified = isVerified;
    if (search) params.search = search;

    const { data } = await api.get(`${BASE}/users`, { params });
    return data.data; // { users, pagination }
  },

  getUserById: async (userId) => {
    const { data } = await api.get(`${BASE}/users/${userId}`);
    return data.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const { data } = await api.patch(`${BASE}/users/${userId}/status`, {
      isActive,
    });
    return data.data;
  },

  updateUserRole: async (userId, role) => {
    const { data } = await api.patch(`${BASE}/users/${userId}/role`, {
      role,
    });
    return data.data;
  },

  deleteUser: async (userId) => {
    const { data } = await api.delete(`${BASE}/users/${userId}`);
    return data.data;
  },

  // --- Properties ---
  getAllProperties: async ({ page = 1, limit = 20, status, search } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;
    const { data } = await api.get(`${BASE}/properties`, { params });
    return data.data;
  },

  updatePropertyStatus: async (propertyId, status) => {
    const { data } = await api.patch(
      `${BASE}/properties/${propertyId}/status`,
      { status }
    );
    return data.data;
  },

  deleteProperty: async (propertyId) => {
    const { data } = await api.delete(`${BASE}/properties/${propertyId}`);
    return data.data;
  },

  // --- Analytics ---
  getUserGrowth: async (days = 30) => {
    const { data } = await api.get(`${BASE}/analytics/user-growth`, {
      params: { days },
    });
    return data.data;
  },

  getRoleDistribution: async () => {
    const { data } = await api.get(`${BASE}/analytics/role-distribution`);
    return data.data;
  },

  // --- Fraud ---
  getFraudFlags: async () => {
    const { data } = await api.get(`${BASE}/fraud/flags`);
    return data.data;
  },

  // --- Settings ---
  getSettings: async () => {
    const { data } = await api.get(`${BASE}/settings`);
    return data.data;
  },

  updateSettings: async (updates) => {
    const { data } = await api.patch(`${BASE}/settings`, updates);
    return data.data;
  },
};

export default adminService;
