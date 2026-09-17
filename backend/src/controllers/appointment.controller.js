const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const Appointment = require("../models/Appointment.model");
const Broker = require("../models/Broker.model");
const Property = require("../models/Property.model");
const { createNotification } = require("../services/notification.service");

const getBrokerId = async (userId) => {
  const broker = await Broker.findOne({ user: userId });
  if (!broker) throw new ApiError(404, "Broker profile not found");
  return broker._id;
};

// @route   POST /api/v1/appointments
// @desc    Buyer requests an appointment for a property
const requestAppointment = asyncHandler(async (req, res) => {
  const { propertyId, scheduledAt, mode, buyerNotes, leadId } = req.body;

  const property = await Property.findById(propertyId).populate("broker");
  if (!property) throw new ApiError(404, "Property not found");

  const brokerDoc = await Broker.findById(property.broker._id || property.broker);

  const appointment = await Appointment.create({
    broker: brokerDoc._id,
    property: property._id,
    buyer: req.user._id,
    lead: leadId || null,
    scheduledAt,
    mode: mode || "site_visit",
    location: mode === "site_visit" ? property.address?.fullAddress : undefined,
    buyerNotes,
    status: "requested",
  });

  await Broker.findByIdAndUpdate(brokerDoc._id, { $inc: { "stats.totalAppointments": 1 } });

  await createNotification({
    recipient: brokerDoc.user,
    type: "appointment_requested",
    title: "New appointment request",
    message: `${req.user.name} requested a visit for "${property.title}"`,
    relatedEntity: { entityType: "Appointment", entityId: appointment._id },
    actionUrl: `/broker/appointments/${appointment._id}`,
  });

  return res.status(201).json(new ApiResponse(201, appointment, "Appointment requested"));
});

// @route   GET /api/v1/broker/appointments
// @desc    Calendar/list view, filterable by date range and status
const getMyAppointments = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const { status, from, to, page = 1, limit = 20 } = req.query;

  const filter = { broker: brokerId };
  if (status) filter.status = status;
  if (from || to) {
    filter.scheduledAt = {};
    if (from) filter.scheduledAt.$gte = new Date(from);
    if (to) filter.scheduledAt.$lte = new Date(to);
  }

  const appointments = await Appointment.find(filter)
    .sort({ scheduledAt: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("property", "title coverImage address.city")
    .populate("buyer", "name phone email avatar");

  const total = await Appointment.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      appointments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    }, "Appointments fetched")
  );
});

// @route   GET /api/v1/broker/appointments/:id
const getAppointmentById = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const appointment = await Appointment.findOne({ _id: req.params.id, broker: brokerId })
    .populate("property", "title coverImage address")
    .populate("buyer", "name phone email avatar");

  if (!appointment) throw new ApiError(404, "Appointment not found");
  return res.status(200).json(new ApiResponse(200, appointment, "Appointment fetched"));
});

// @route   PATCH /api/v1/broker/appointments/:id/confirm
const confirmAppointment = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const appointment = await Appointment.findOne({ _id: req.params.id, broker: brokerId }).populate("property", "title");
  if (!appointment) throw new ApiError(404, "Appointment not found");

  appointment.status = "confirmed";
  await appointment.save();

  await createNotification({
    recipient: appointment.buyer,
    type: "appointment_confirmed",
    title: "Appointment confirmed",
    message: `Your visit for "${appointment.property.title}" has been confirmed`,
    relatedEntity: { entityType: "Appointment", entityId: appointment._id },
    actionUrl: `/dashboard/appointments/${appointment._id}`,
  });

  return res.status(200).json(new ApiResponse(200, appointment, "Appointment confirmed"));
});

// @route   PATCH /api/v1/broker/appointments/:id/reschedule
const rescheduleAppointment = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const { scheduledAt } = req.body;
  if (!scheduledAt) throw new ApiError(400, "New scheduledAt is required");

  const appointment = await Appointment.findOne({ _id: req.params.id, broker: brokerId }).populate("property", "title");
  if (!appointment) throw new ApiError(404, "Appointment not found");

  appointment.scheduledAt = scheduledAt;
  appointment.status = "rescheduled";
  await appointment.save();

  await createNotification({
    recipient: appointment.buyer,
    type: "appointment_confirmed",
    title: "Appointment rescheduled",
    message: `Your visit for "${appointment.property.title}" was rescheduled`,
    relatedEntity: { entityType: "Appointment", entityId: appointment._id },
    actionUrl: `/dashboard/appointments/${appointment._id}`,
  });

  return res.status(200).json(new ApiResponse(200, appointment, "Appointment rescheduled"));
});

// @route   PATCH /api/v1/broker/appointments/:id/cancel
const cancelAppointment = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const { reason } = req.body;

  const appointment = await Appointment.findOne({ _id: req.params.id, broker: brokerId }).populate("property", "title");
  if (!appointment) throw new ApiError(404, "Appointment not found");

  appointment.status = "cancelled";
  appointment.cancelledBy = "broker";
  appointment.cancellationReason = reason || null;
  await appointment.save();

  await createNotification({
    recipient: appointment.buyer,
    type: "appointment_cancelled",
    title: "Appointment cancelled",
    message: `Your visit for "${appointment.property.title}" was cancelled by the broker`,
    relatedEntity: { entityType: "Appointment", entityId: appointment._id },
    actionUrl: `/dashboard/appointments`,
  });

  return res.status(200).json(new ApiResponse(200, appointment, "Appointment cancelled"));
});

// @route   PATCH /api/v1/broker/appointments/:id/complete
const completeAppointment = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const { brokerNotes } = req.body;

  const appointment = await Appointment.findOne({ _id: req.params.id, broker: brokerId });
  if (!appointment) throw new ApiError(404, "Appointment not found");

  appointment.status = "completed";
  if (brokerNotes) appointment.brokerNotes = brokerNotes;
  await appointment.save();

  await Broker.findByIdAndUpdate(brokerId, { $inc: { "stats.completedAppointments": 1 } });

  return res.status(200).json(new ApiResponse(200, appointment, "Appointment marked complete"));
});

module.exports = {
  requestAppointment,
  getMyAppointments,
  getAppointmentById,
  confirmAppointment,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment,
};
