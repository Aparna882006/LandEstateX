const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const Property = require("../models/Property.model");
const Broker = require("../models/Broker.model");

/**
 * brokerProperty.controller.js
 * Property CRUD scoped to the logged-in broker. Complements the general
 * property.controller.js (public browsing/search) already scaffolded.
 */

const getBrokerId = async (userId) => {
  const broker = await Broker.findOne({ user: userId });
  if (!broker) throw new ApiError(404, "Broker profile not found");
  return broker._id;
};

// @route   GET /api/v1/broker/properties
// @desc    List all properties owned by the logged-in broker (with filters/pagination)
const getMyProperties = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const { status, page = 1, limit = 10, sort = "-createdAt" } = req.query;

  const filter = { broker: brokerId };
  if (status) filter.status = status;

  const properties = await Property.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Property.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      properties,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    }, "Properties fetched")
  );
});

// @route   POST /api/v1/broker/properties
const createProperty = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);

  const property = await Property.create({
    ...req.body,
    broker: brokerId,
    listedBy: req.user._id,
    status: req.body.status || "pending_review",
  });

  await Broker.findByIdAndUpdate(brokerId, {
    $inc: { "stats.totalListings": 1, "stats.activeListings": property.status === "active" ? 1 : 0 },
  });

  return res.status(201).json(new ApiResponse(201, property, "Property listed successfully"));
});

// @route   GET /api/v1/broker/properties/:id
const getMyPropertyById = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const property = await Property.findOne({ _id: req.params.id, broker: brokerId });
  if (!property) throw new ApiError(404, "Property not found");
  return res.status(200).json(new ApiResponse(200, property, "Property fetched"));
});

// @route   PATCH /api/v1/broker/properties/:id
const updateProperty = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const property = await Property.findOne({ _id: req.params.id, broker: brokerId });
  if (!property) throw new ApiError(404, "Property not found");

  const restrictedFields = ["broker", "listedBy", "_id"];
  Object.keys(req.body).forEach((key) => {
    if (!restrictedFields.includes(key)) property[key] = req.body[key];
  });

  await property.save();
  return res.status(200).json(new ApiResponse(200, property, "Property updated"));
});

// @route   PATCH /api/v1/broker/properties/:id/status
// @desc    Quick status toggle: active / sold / rented / inactive
const updatePropertyStatus = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const { status } = req.body;

  const validStatuses = ["active", "inactive", "sold", "rented", "pending_review"];
  if (!validStatuses.includes(status)) throw new ApiError(400, "Invalid status value");

  const property = await Property.findOne({ _id: req.params.id, broker: brokerId });
  if (!property) throw new ApiError(404, "Property not found");

  const wasActive = property.status === "active";
  property.status = status;
  await property.save();

  const isNowActive = status === "active";
  const isNowSoldOrRented = ["sold", "rented"].includes(status);

  const inc = {};
  if (wasActive && !isNowActive) inc["stats.activeListings"] = -1;
  if (!wasActive && isNowActive) inc["stats.activeListings"] = 1;
  if (isNowSoldOrRented) inc["stats.soldOrRentedCount"] = 1;

  if (Object.keys(inc).length) await Broker.findByIdAndUpdate(brokerId, { $inc: inc });

  return res.status(200).json(new ApiResponse(200, property, "Property status updated"));
});

// @route   DELETE /api/v1/broker/properties/:id
const deleteProperty = asyncHandler(async (req, res) => {
  const brokerId = await getBrokerId(req.user._id);
  const property = await Property.findOneAndDelete({ _id: req.params.id, broker: brokerId });
  if (!property) throw new ApiError(404, "Property not found");

  const inc = { "stats.totalListings": -1 };
  if (property.status === "active") inc["stats.activeListings"] = -1;
  await Broker.findByIdAndUpdate(brokerId, { $inc: inc });

  return res.status(200).json(new ApiResponse(200, {}, "Property deleted"));
});

module.exports = {
  getMyProperties,
  createProperty,
  getMyPropertyById,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
};
