
const express = require('express');
const rateLimit = require('express-rate-limit');
const { predictPrice } = require('../controllers/ai.controller');

const router = express.Router();

const predictionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many prediction requests. Please try again later.',
  },
});

router.post('/price-prediction', predictionLimiter, predictPrice);

module.exports = router;
