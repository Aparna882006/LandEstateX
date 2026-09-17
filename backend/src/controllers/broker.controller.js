const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const Broker = require("../models/Broker.model");
const Property = require("../models/Property.model");
const Lead = require("../models/Lead.model");
const Appointment = require("../models/Appointment.model");
const Review = require("../models/Review.model");
const { recalculateBrokerTrustScore } = require("../services/trustScore.service");

/** Helper: resolve the Broker doc for the logged-in user, or throw. */
const getBrokerOrThrow = async (userId) => {
  const broker = await Broker.findOne({ user: userId });
  if (!broker) throw new ApiError(404, "Broker profile not found for this account");
  return broker;
};

// @route   POST /api/v1/broker/profile
// @desc    Create broker profile for the logged-in user (role must already be 'broker')
const createBrokerProfile = asyncHandler(async (req, res) => {
  const existing = await Broker.findOne({ user: req.user._id });
  if (existing) throw new ApiError(409, "Broker profile already exists");

  const { agencyName, licenseNumber, bio, yearsOfExperience, serviceAreas, specializations, contactPhone, contactEmailPublic } = req.body;

  const broker = await Broker.create({
    user: req.user._id,
    agencyName,
    licenseNumber,
    bio,
    yearsOfExperience,
    serviceAreas,
    specializations,
    contactPhone,
    contactEmailPublic,
  });

  return res.status(201).json(new ApiResponse(201, broker, "Broker profile created"));
});

// @route   GET /api/v1/broker/profile/me
const getMyBrokerProfile = asyncHandler(async (req, res) => {
  const broker = await getBrokerOrThrow(req.user._id);
  return res.status(200).json(new ApiResponse(200, broker, "Broker profile fetched"));
});

// @route   PATCH /api/v1/broker/profile/me
const updateMyBrokerProfile = asyncHandler(async (req, res) => {
  const broker = await getBrokerOrThrow(req.user._id);

  const allowedFields = [
    "agencyName", "bio", "yearsOfExperience", "serviceAreas",
    "specializations", "contactPhone", "contactEmailPublic", "profileImage",
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) broker[field] = req.body[field];
  });

  await broker.save();
  return res.status(200).json(new ApiResponse(200, broker, "Broker profile updated"));
});

// @route   GET /api/v1/broker/:brokerId (public profile, e.g. for buyers viewing a broker)
const getPublicBrokerProfile = asyncHandler(async (req, res) => {
  const broker = await Broker.findById(req.params.brokerId)
    .select("-suspensionReason")
    .populate("user", "name email avatar");

  if (!broker || !broker.isActive) throw new ApiError(404, "Broker not found");

  broker.stats.profileViews += 1;
  await broker.save();

  return res.status(200).json(new ApiResponse(200, broker, "Broker profile fetched"));
});

// @route   GET /api/v1/broker/dashboard
// @desc    Aggregate summary for the Broker Dashboard page (cards + recent activity)
const getDashboardSummary = asyncHandler(async (req, res) => {
  const broker = await getBrokerOrThrow(req.user._id);

  const [
    activeListings,
    totalListings,
    newLeadsCount,
    upcomingAppointments,
    recentReviews,
    leadsByStatus,
  ] = await Promise.all([
    Property.countDocuments({ broker: broker._id, status: "active" }),
    Property.countDocuments({ broker: broker._id }),
    Lead.countDocuments({ broker: broker._id, status: "new" }),
    Appointment.find({ broker: broker._id, scheduledAt: { $gte: new Date() }, status: { $in: ["requested", "confirmed"] } })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .populate("property", "title address.city coverImage")
      .populate("buyer", "name avatar"),
    Review.find({ broker: broker._id, isHidden: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("reviewer", "name avatar"),
    Lead.aggregate([
      { $match: { broker: broker._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const pipeline = { new: 0, contacted: 0, qualified: 0, negotiating: 0, won: 0, lost: 0 };
  leadsByStatus.forEach((row) => { pipeline[row._id] = row.count; });

  return res.status(200).json(
    new ApiResponse(200, {
      trustScore: broker.trustScore,
      trustBadge: broker.trustBadge,
      stats: broker.stats,
      cards: {
        activeListings,
        totalListings,
        newLeadsCount,
        upcomingAppointmentsCount: upcomingAppointments.length,
      },
      leadPipeline: pipeline,
      upcomingAppointments,
      recentReviews,
    }, "Dashboard summary fetched")
  );
});

// @route   POST /api/v1/broker/trust-score/recalculate
const recalculateTrustScore = asyncHandler(async (req, res) => {
  const broker = await getBrokerOrThrow(req.user._id);
  const updated = await recalculateBrokerTrustScore(broker._id);
  return res.status(200).json(new ApiResponse(200, {
    trustScore: updated.trustScore,
    trustBadge: updated.trustBadge,
    breakdown: updated.trustScoreBreakdown,
  }, "Trust score recalculated"));
});

// @route   GET /api/v1/broker/trust-score/me
const getMyTrustScore = asyncHandler(async (req, res) => {
  const broker = await getBrokerOrThrow(req.user._id);
  return res.status(200).json(new ApiResponse(200, {
    trustScore: broker.trustScore,
    trustBadge: broker.trustBadge,
    breakdown: broker.trustScoreBreakdown,
    lastCalculatedAt: broker.trustScoreLastCalculatedAt,
  }, "Trust score fetched"));
});

module.exports = {
  createBrokerProfile,
  getMyBrokerProfile,
  updateMyBrokerProfile,
  getPublicBrokerProfile,
  getDashboardSummary,
  recalculateTrustScore,
  getMyTrustScore,
};
