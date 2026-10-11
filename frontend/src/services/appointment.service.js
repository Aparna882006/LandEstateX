
import api from './api';

export const createAppointment = (payload) => {
  return api.post('/appointments', payload);
};

// Buyer: fetch the logged-in buyer's bookings.
export const getMyBookings = (params = {}) => {
  return api.get('/appointments/my-bookings', { params });
};

// Broker: fetch appointments assigned to the logged-in broker.
export const getMyAppointments = (params = {}) => {
  return api.get('/appointments/me', { params });
};

// Broker: update appointment status.
export const updateAppointmentStatus = (appointmentId, status) => {
  return api.patch(
    `/appointments/${appointmentId}/status`,
    { status }
  );
};
