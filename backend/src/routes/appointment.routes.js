const express = require('express');

const router = express.Router();

const {
  getMyAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointment.controller');

const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(protect);
router.use(restrictTo('broker'));

router.get('/me', getMyAppointments);

router.patch(
  '/:appointment_id/status',
  updateAppointmentStatus
);

module.exports = router;