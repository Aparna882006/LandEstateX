import api from './api';

// Submit a broker review
export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response;
};

// Get reviews for a broker
export const getBrokerReviews = async (brokerId) => {
  const response = await api.get(`/reviews/broker/${brokerId}`);
  return response;
};