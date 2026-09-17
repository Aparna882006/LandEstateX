const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { restrictTo } = require("../middlewares/role.middleware");
const {
  requestAppointment,
  getMyAppointments,
  getAppointmentById,
  confirmAppointment,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment,
} = require("../controllers/appointment.controller");

const router = express.Router();

router.use(verifyJWT);

// Buyer-facing: request an appointment
router.post("/", requestAppointment);

// Broker-facing: manage own appointments
router.get("/broker/my-appointments", restrictTo("broker", "admin"), getMyAppointments);
router.get("/broker/:id", restrictTo("broker", "admin"), getAppointmentById);
router.patch("/broker/:id/confirm", restrictTo("broker", "admin"), confirmAppointment);
router.patch("/broker/:id/reschedule", restrictTo("broker", "admin"), rescheduleAppointment);
router.patch("/broker/:id/cancel", restrictTo("broker", "admin"), cancelAppointment);
router.patch("/broker/:id/complete", restrictTo("broker", "admin"), completeAppointment);

module.exports = router;
