
import api from './api';

export const createReview = async (reviewData) => {
  return api.post('/reviews', reviewData);
};

export const getBrokerReviews = async (brokerId) => {
  return api.get(`/reviews/broker/${brokerId}`);
};
