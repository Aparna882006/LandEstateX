const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const Lead = require("../models/Lead.model");
const Broker = require("../models/Broker.model");
const Property = require("../models/Property.model");
const { createNotification } = require("../services/notification.service");
const { recalculateBrokerTrustScore } = require("../services/trustScore.service");

const getBrokerId = async (userId) => {
  const broker = await Broker.findOne({ user: userId });
  if (!broker) throw new ApiError(404, "Broker profile not found");
  return broker._id;
};

// @route   POST /api/v1/leads
// @desc    Create a lead (called when a buyer submits a contact form / requests info)
//          Can be invoked by a buyer (req.user is the buyer) targeting a property's broker.
const createLead = asyncHandler(async (req, res) => {
  const { propertyId, message, budgetMin, budgetMax, source } = req.body;

  const property = await Property.findById(propertyId).populate("broker");
  if (!property) throw new ApiError(404, "Property not found");

  const lead = await Lead.create({
    broker: property.broker._id || property.broker,
    property: property._id,
    buyer: req.user._id,
    buyerName: req.user.name,
    buyerPhone: req.user.phone,
    buyerEmail: req.user.email,
    message,
    budgetMin,
    budgetMax,
    source: source || "contact_form",
  });

  await Broker.findByIdAndUpdate(property.broker._id || property.broker, { $inc: { "stats.totalLeads": 1 } });

  const brokerUserId = property.broker.user || property.broker;
  await createNotification({
    recipient: brokerUserId,
    type: "new_lead",
    title: "New lead received",
    message: `${req.user.name} is interested in "${property.title}"`,
    relatedEntity: { entityType: "Lead", entityId: lead._id },
    actionUrl: `/broker/leads/${lead._id}`,
  });

  return res.status(201).json(new ApiResponse(201, lead, "Lead created"));
});

// @route   GET /api/v1/broker/leads
// @desc    Kanban/pipeline listing with filters
const getMyLeads = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const { status, priority, propertyId, page = 1, limit = 20, sort = "-createdAt" } = req.query;

  const filter = { broker: brokerId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (propertyId) filter.property = propertyId;

  const leads = await Lead.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("property", "title coverImage address.city")
    .populate("buyer", "name email avatar");

  const total = await Lead.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      leads,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    }, "Leads fetched")
  );
});

// @route   GET /api/v1/broker/leads/:id
const getLeadById = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const lead = await Lead.findOne({ _id: req.params.id, broker: brokerId })
    .populate("property", "title coverImage address")
    .populate("buyer", "name email phone avatar")
    .populate("activities.createdBy", "name");

  if (!lead) throw new ApiError(404, "Lead not found");
  return res.status(200).json(new ApiResponse(200, lead, "Lead fetched"));
});

// @route   PATCH /api/v1/broker/leads/:id/status
const updateLeadStatus = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const { status, lostReason } = req.body;

  const validStatuses = ["new", "contacted", "qualified", "negotiating", "won", "lost"];
  if (!validStatuses.includes(status)) throw new ApiError(400, "Invalid lead status");

  const lead = await Lead.findOne({ _id: req.params.id, broker: brokerId });
  if (!lead) throw new ApiError(404, "Lead not found");

  const previousStatus = lead.status;
  lead.status = status;
  if (status === "lost") lead.lostReason = lostReason || "Not specified";
  if (["contacted", "qualified", "negotiating"].includes(status)) lead.lastContactedAt = new Date();

  lead.activities.push({
    type: "status_change",
    note: `Status changed from ${previousStatus} to ${status}`,
    createdBy: req.user._id,
  });

  await lead.save();

  if (status === "won") {
    await Broker.findByIdAndUpdate(brokerId, { $inc: { "stats.convertedLeads": 1 } });
  }

  // Trust score depends on conversion/response rate - recalc async (fire and forget)
  recalculateBrokerTrustScore(brokerId).catch(() => {});

  return res.status(200).json(new ApiResponse(200, lead, "Lead status updated"));
});

// @route   PATCH /api/v1/broker/leads/:id
// @desc    Update priority / next follow-up date
const updateLead = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const lead = await Lead.findOne({ _id: req.params.id, broker: brokerId });
  if (!lead) throw new ApiError(404, "Lead not found");

  const allowedFields = ["priority", "nextFollowUpAt"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) lead[field] = req.body[field];
  });

  await lead.save();
  return res.status(200).json(new ApiResponse(200, lead, "Lead updated"));
});

// @route   POST /api/v1/broker/leads/:id/activities
// @desc    Log a call/note/email/meeting against a lead
const addLeadActivity = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const { type, note } = req.body;

  const validTypes = ["note", "call", "email", "whatsapp", "meeting"];
  if (!validTypes.includes(type)) throw new ApiError(400, "Invalid activity type");

  const lead = await Lead.findOne({ _id: req.params.id, broker: brokerId });
  if (!lead) throw new ApiError(404, "Lead not found");

  lead.activities.push({ type, note, createdBy: req.user._id });
  lead.lastContactedAt = new Date();
  if (lead.status === "new") lead.status = "contacted";

  await lead.save();
  return res.status(201).json(new ApiResponse(201, lead, "Activity logged"));
});

// @route   DELETE /api/v1/broker/leads/:id
const deleteLead = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const lead = await Lead.findOneAndDelete({ _id: req.params.id, broker: brokerId });
  if (!lead) throw new ApiError(404, "Lead not found");
  return res.status(200).json(new ApiResponse(200, {}, "Lead deleted"));
});

module.exports = {
  createLead,
  getMyLeads,
  getLeadById,
  updateLeadStatus,
  updateLead,
  addLeadActivity,
  deleteLead,
};
