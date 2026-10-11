
const express = require('express');
const router = express.Router();

const {
  createAppointment,
  getMyAppointments,
  getMyBookings,
  updateAppointmentStatus,
} = require('../controllers/appointment.controller');

const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(protect);

// Buyer routes
router.post('/', restrictTo('buyer'), createAppointment);
router.get('/my-bookings', restrictTo('buyer'), getMyBookings);

// Broker routes
router.get('/me', restrictTo('broker'), getMyAppointments);
router.patch(
  '/:appointment_id/status',
  restrictTo('broker'),
  updateAppointmentStatus
);

module.exports = router;
