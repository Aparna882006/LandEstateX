import api from './api';

export const toggleWishlist = (propertyId) => api.post('/wishlist', { property_id: propertyId });

export const getWishlist = (params) => api.get('/wishlist', { params });

export const removeFromWishlist = (propertyId) => api.delete(`/wishlist/${propertyId}`);