import api from './api';

export const registerUser = (payload) => api.post('/auth/register', payload);

export const verifyEmail = (payload) => api.post('/auth/verify-email', payload);

export const loginUser = (payload) => api.post('/auth/login', payload);

export const logoutUser = () => api.post('/auth/logout');

export const forgotPassword = (payload) => api.post('/auth/forgot-password', payload);

export const resetPassword = (payload) => api.post('/auth/reset-password', payload);