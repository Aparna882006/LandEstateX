const mongoose = require('mongoose');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

const Appointment = require('../models/Appointment.model');
const Property = require('../models/Property.model');
const User = require('../models/User.model');
const Lead = require('../models/Lead.model');

const ALLOWED_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
];

// POST /api/v1/appointments
// Buyer creates an appointment and a lead is created or reused.
const createAppointment = asyncHandler(async (req, res) => {
  const { property_id, scheduled_at, notes = '' } = req.body;

  // Validate property ID
  if (!mongoose.isValidObjectId(property_id)) {
    throw new ApiError(400, 'Invalid property ID');
  }

  // Validate scheduled date
  if (!scheduled_at) {
    throw new ApiError(400, 'Visit date and time are required');
  }

  const visitDate = new Date(scheduled_at);

  if (
    Number.isNaN(visitDate.getTime()) ||
    visitDate <= new Date()
  ) {
    throw new ApiError(
      400,
      'Please select a valid future date and time'
    );
  }

  // Validate notes
  if (typeof notes !== 'string' || notes.length > 1000) {
    throw new ApiError(
      400,
      'Notes must be at most 1000 characters'
    );
  }

  // Find approved property
  const property = await Property.findOne({
    _id: property_id,
    status: 'approved',
  });

  if (!property) {
    throw new ApiError(
      404,
      'Property not found or unavailable'
    );
  }

  // Prevent booking own property
  if (property.owner_id.toString() === req.user.id) {
    throw new ApiError(
      400,
      'You cannot book a visit to your own property'
    );
  }

  // Find active broker who owns the property
  const broker = await User.findOne({
    _id: property.owner_id,
    role: 'broker',
    status: 'active',
  });

  if (!broker) {
    throw new ApiError(
      400,
      'This property does not have an active broker assigned'
    );
  }

  // 1. Create appointment
  const appointment = await Appointment.create({
    broker_id: broker._id,
    buyer_id: req.user.id,
    property_id: property._id,
    scheduled_at: visitDate,
    notes: notes.trim(),
    status: 'pending',
  });

  console.log('Appointment created:', appointment._id.toString());

  // 2. Create or reuse lead
  try {
    const lead = await Lead.findOneAndUpdate(
      {
        broker_id: broker._id,
        buyer_id: req.user.id,
        property_id: property._id,
      },
      {
        $setOnInsert: {
          broker_id: broker._id,
          buyer_id: req.user.id,
          property_id: property._id,
          status: 'new',
          notes: notes.trim(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    console.log(
      'Lead created or reused successfully:',
      lead?._id?.toString()
    );
  } catch (error) {
    // Detailed diagnostic logging
    console.error('========== LEAD CREATION FAILED ==========');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    console.error('Broker ID:', broker._id.toString());
    console.error('Buyer ID:', req.user.id);
    console.error('Property ID:', property._id.toString());
    console.error('==========================================');
  }

  // 3. Return appointment response
  return res.status(201).json(
    new ApiResponse(
      true,
      'Visit request submitted successfully',
      { appointment }
    )
  );
});

// GET /api/v1/appointments/me
// Broker sees their appointments.
const getMyAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  if (status && !ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(400, 'Invalid appointment status');
  }

  const filter = { broker_id: req.user.id };

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
    .sort({ scheduled_at: 1 });

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

// GET /api/v1/appointments/my-bookings
// Buyer sees their bookings.
const getMyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;

  if (status && !ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(400, 'Invalid appointment status');
  }

  const filter = { buyer_id: req.user.id };

  if (status) {
    filter.status = status;
  }

  const appointments = await Appointment.find(filter)
    .populate({
      path: 'broker_id',
      select: 'full_name email phone_number',
    })
    .populate({
      path: 'property_id',
      select: 'title price property_type listing_type location images',
    })
    .sort({ scheduled_at: 1 });

  return res.status(200).json(
    new ApiResponse(
      true,
      'Your appointments fetched successfully',
      {
        appointments,
        total_count: appointments.length,
      }
    )
  );
});

// PATCH /api/v1/appointments/:appointment_id/status
// Broker updates appointment status.
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { appointment_id } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(appointment_id)) {
    throw new ApiError(400, 'Invalid appointment ID');
  }

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

  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!allowedTransitions[appointment.status].includes(status)) {
    throw new ApiError(
      400,
      `Cannot change appointment status from ${appointment.status} to ${status}`
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
      { appointment }
    )
  );
});

module.exports = {
  createAppointment,
  getMyAppointments,
  getMyBookings,
  updateAppointmentStatus,
};