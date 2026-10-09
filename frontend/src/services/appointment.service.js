import api from "./api";

export const getMyAppointments = (params = {}) => {
  return api.get("/appointments/me", {
    params,
  });
};

export const updateAppointmentStatus = (
  appointmentId,
  status
) => {
  return api.patch(
    `/appointments/${appointmentId}/status`,
    {
      status,
    }
  );
};