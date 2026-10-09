const express = require('express');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const {
  getMyProfile,
  updateMyProfile,
  getMyDashboard,
} = require('../controllers/broker.controller');

router.use(protect);

router.use(restrictTo('broker'));

router.get('/me', getMyProfile);

router.put('/me', updateMyProfile);

router.get('/me/dashboard', getMyDashboard);

module.exports = router;