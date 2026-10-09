const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

const Appointment = require('../models/Appointment.model');

const ALLOWED_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
];

const getMyAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  if (status && !ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(400, 'Invalid appointment status');
  }

  const filter = {
    broker_id: req.user.id,
  };

  if (status) {
    filter.status = status;
  }

  const appointments = await Appointment.find(filter)
    .populate({
      path: 'buyer_id',
      select: 'full_name email phone_number',
    })
    .populate({
      path: 'property_id',
      select: 'title price property_type listing_type location images',
    })
    .sort({
      scheduled_at: 1,
    });

  return res.status(200).json(
    new ApiResponse(
      true,
      'Broker appointments fetched successfully',
      {
        appointments,
        total_count: appointments.length,
      }
    )
  );
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { appointment_id } = req.params;
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(400, 'Invalid appointment status');
  }

  const appointment = await Appointment.findOne({
    _id: appointment_id,
    broker_id: req.user.id,
  });

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  const currentStatus = appointment.status;

  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!allowedTransitions[currentStatus].includes(status)) {
    throw new ApiError(
      400,
      `Cannot change appointment status from ${currentStatus} to ${status}`
    );
  }

  appointment.status = status;

  await appointment.save();

  await appointment.populate([
    {
      path: 'buyer_id',
      select: 'full_name email phone_number',
    },
    {
      path: 'property_id',
      select: 'title price property_type listing_type location images',
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      true,
      'Appointment status updated successfully',
      {
        appointment,
      }
    )
  );
});

module.exports = {
  getMyAppointments,
  updateAppointmentStatus,
};