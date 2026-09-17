import api from "./api";

/**
 * broker.service.js
 * All API calls for the Broker Module. Assumes an existing `api.js` Axios
 * instance with baseURL = VITE_API_BASE_URL and the auto-refresh-on-401 interceptor.
 */

// --- Profile & Dashboard ---
export const getMyBrokerProfile = () => api.get("/broker/profile/me");
export const updateMyBrokerProfile = (data) => api.patch("/broker/profile/me", data);
export const getPublicBrokerProfile = (brokerId) => api.get(`/broker/${brokerId}`);
export const getDashboardSummary = () => api.get("/broker/dashboard/summary");
export const getMyTrustScore = () => api.get("/broker/trust-score/me");
export const recalculateTrustScore = () => api.post("/broker/trust-score/recalculate");

// --- Property Management ---
export const getMyProperties = (params) => api.get("/broker/properties", { params });
export const createProperty = (data) => api.post("/broker/properties", data);
export const getPropertyById = (id) => api.get(`/broker/properties/${id}`);
export const updateProperty = (id, data) => api.patch(`/broker/properties/${id}`, data);
export const updatePropertyStatus = (id, status) => api.patch(`/broker/properties/${id}/status`, { status });
export const deleteProperty = (id) => api.delete(`/broker/properties/${id}`);

// --- Lead Management ---
export const getMyLeads = (params) => api.get("/leads/broker/my-leads", { params });
export const getLeadById = (id) => api.get(`/leads/broker/${id}`);
export const updateLeadStatus = (id, status, lostReason) => api.patch(`/leads/broker/${id}/status`, { status, lostReason });
export const updateLead = (id, data) => api.patch(`/leads/broker/${id}`, data);
export const addLeadActivity = (id, type, note) => api.post(`/leads/broker/${id}/activities`, { type, note });
export const deleteLead = (id) => api.delete(`/leads/broker/${id}`);

// --- Appointment Management ---
export const getMyAppointments = (params) => api.get("/appointments/broker/my-appointments", { params });
export const getAppointmentById = (id) => api.get(`/appointments/broker/${id}`);
export const confirmAppointment = (id) => api.patch(`/appointments/broker/${id}/confirm`);
export const rescheduleAppointment = (id, scheduledAt) => api.patch(`/appointments/broker/${id}/reschedule`, { scheduledAt });
export const cancelAppointment = (id, reason) => api.patch(`/appointments/broker/${id}/cancel`, { reason });
export const completeAppointment = (id, brokerNotes) => api.patch(`/appointments/broker/${id}/complete`, { brokerNotes });

// --- Reviews ---
export const getBrokerReviews = (brokerId, params) => api.get(`/brokers/${brokerId}/reviews`, { params });
export const getMyReviews = (params) => api.get("/broker/reviews/me", { params });
export const replyToReview = (id, text) => api.post(`/broker/reviews/${id}/reply`, { text });

// --- Notifications ---
export const getMyNotifications = (params) => api.get("/notifications", { params });
export const getUnreadCount = () => api.get("/notifications/unread-count");
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch("/notifications/read-all");
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
