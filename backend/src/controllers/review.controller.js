const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const Review = require("../models/Review.model");
const Broker = require("../models/Broker.model");
const { createNotification } = require("../services/notification.service");
const { recalculateBrokerTrustScore } = require("../services/trustScore.service");

// @route   POST /api/v1/brokers/:brokerId/reviews
// @desc    Buyer submits a review for a broker
const createReview = asyncHandler(async (req, res) => {
  const { brokerId } = req.params;
  const { rating, title, comment, propertyId, dealType } = req.body;

  if (!rating || rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");

  const broker = await Broker.findById(brokerId);
  if (!broker) throw new ApiError(404, "Broker not found");

  const existing = await Review.findOne({ broker: brokerId, reviewer: req.user._id });
  if (existing) throw new ApiError(409, "You have already reviewed this broker. Edit your existing review instead.");

  const review = await Review.create({
    broker: brokerId,
    reviewer: req.user._id,
    property: propertyId || null,
    rating,
    title,
    comment,
    dealType: dealType || null,
  });

  await createNotification({
    recipient: broker.user,
    type: "new_review",
    title: "New review received",
    message: `${req.user.name} left you a ${rating}-star review`,
    relatedEntity: { entityType: "Review", entityId: review._id },
    actionUrl: `/broker/reviews`,
  });

  recalculateBrokerTrustScore(brokerId).catch(() => {});

  return res.status(201).json(new ApiResponse(201, review, "Review submitted"));
});

// @route   GET /api/v1/brokers/:brokerId/reviews
// @desc    Public list of a broker's reviews (paginated)
const getBrokerReviews = asyncHandler(async (req, res) => {
  const { brokerId } = req.params;
  const { page = 1, limit = 10, sort = "-createdAt", rating } = req.query;

  const filter = { broker: brokerId, isHidden: false };
  if (rating) filter.rating = Number(rating);

  const reviews = await Review.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("reviewer", "name avatar");

  const total = await Review.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    }, "Reviews fetched")
  );
});

// @route   GET /api/v1/broker/reviews/me
// @desc    Logged-in broker views all reviews about them (including hidden/flagged, for management)
const getMyReviews = asyncHandler(async (req, res) => {
  const broker = await Broker.findOne({ user: req.user._id });
  if (!broker) throw new ApiError(404, "Broker profile not found");

  const { page = 1, limit = 10 } = req.query;
  const reviews = await Review.find({ broker: broker._id })
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("reviewer", "name avatar")
    .populate("property", "title");

  const total = await Review.countDocuments({ broker: broker._id });

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    }, "Reviews fetched")
  );
});

// @route   POST /api/v1/broker/reviews/:id/reply
const replyToReview = asyncHandler(async (req, res) => {
  const broker = await Broker.findOne({ user: req.user._id });
  if (!broker) throw new ApiError(404, "Broker profile not found");

  const { text } = req.body;
  if (!text) throw new ApiError(400, "Reply text is required");

  const review = await Review.findOne({ _id: req.params.id, broker: broker._id });
  if (!review) throw new ApiError(404, "Review not found");

  review.brokerReply = { text, repliedAt: new Date() };
  await review.save();

  await createNotification({
    recipient: review.reviewer,
    type: "review_reply",
    title: "The broker replied to your review",
    message: text.slice(0, 100),
    relatedEntity: { entityType: "Review", entityId: review._id },
  });

  return res.status(200).json(new ApiResponse(200, review, "Reply posted"));
});

// @route   POST /api/v1/reviews/:id/flag
// @desc    Any authenticated user can flag a review for moderation
const flagReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  review.isFlagged = true;
  await review.save();

  return res.status(200).json(new ApiResponse(200, {}, "Review flagged for moderation"));
});

module.exports = {
  createReview,
  getBrokerReviews,
  getMyReviews,
  replyToReview,
  flagReview,
};
