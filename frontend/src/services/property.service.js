import api from './api';

export const getAllProperties = (params) => api.get('/properties', { params });

export const searchProperties = (params) => api.get('/properties/search', { params });

export const getPropertyById = (id) => api.get(`/properties/${id}`);

export const getMyProperties = (params) => api.get('/properties/my-properties', { params });

export const createProperty = (formData) =>
  api.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProperty = (id, payload) => api.put(`/properties/${id}`, payload);

export const deleteProperty = (id) => api.delete(`/properties/${id}`);