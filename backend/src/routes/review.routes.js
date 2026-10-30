const express = require('express');
const router = express.Router();

const {
  createReview,
  getBrokerReviews,
} = require('../controllers/review.controller');

const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

// View reviews for a broker
router.get('/broker/:broker_id', getBrokerReviews);

// Submit a review — buyers only
router.post('/', protect, restrictTo('buyer'), createReview);

module.exports = router;