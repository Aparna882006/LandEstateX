
const express = require('express');

const router = express.Router();

const {
  getPriceTrends,
} = require('../controllers/priceTrend.controller');

router.get('/', getPriceTrends);

module.exports = router;
