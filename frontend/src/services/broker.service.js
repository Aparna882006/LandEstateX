import api from './api';

export const getMyBrokerProfile = () => {
  return api.get('/brokers/me');
};

export const getMyBrokerDashboard = () => {
  return api.get('/brokers/me/dashboard');
};

export const updateMyBrokerProfile = (payload) => {
  return api.put('/brokers/me', payload);
};