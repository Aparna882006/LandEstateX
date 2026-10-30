
import api from './api';

export const getMyLeads = (params = {}) => {
  return api.get('/leads/me', { params });
};

export const updateLead = (leadId, payload) => {
  return api.patch(`/leads/${leadId}`, payload);
};

