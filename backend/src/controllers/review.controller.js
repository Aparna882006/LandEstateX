
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

const Broker = require('../models/Broker.model');
const Review = require('../models/Review.model');
const User = require('../models/User.model');
const Property = require('../models/Property.model');

// Create a review for a specific property and its broker
const createReview = asyncHandler(async (req, res) => {
  const reviewerId = req.user.id;
  const { property_id, broker_id, rating, comment = '' } = req.body;

  // Only buyers can submit reviews
  if (req.user.role !== 'buyer') {
    throw new ApiError(403, 'Only buyer accounts can submit reviews');
  }

  // Validate IDs
  if (!property_id || !mongoose.Types.ObjectId.isValid(property_id)) {
    throw new ApiError(400, 'A valid property ID is required');
  }

  if (!broker_id || !mongoose.Types.ObjectId.isValid(broker_id)) {
    throw new ApiError(400, 'A valid broker ID is required');
  }

  // Validate rating
  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw new ApiError(400, 'Rating must be an integer between 1 and 5');
  }

  // Validate comment
  if (typeof comment !== 'string' || comment.length > 1000) {
    throw new ApiError(
      400,
      'Comment must be a string of at most 1000 characters'
    );
  }

  // Find property
  const property = await Property.findById(property_id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  // Ensure the supplied broker owns this property
  if (String(property.owner_id) !== String(broker_id)) {
    throw new ApiError(
      400,
      'The selected broker does not own this property'
    );
  }

  // Prevent reviewing your own property
  if (String(reviewerId) === String(property.owner_id)) {
    throw new ApiError(400, 'You cannot review your own property');
  }

  // Verify broker account
  const brokerAccount = await User.findById(broker_id);

  if (!brokerAccount || brokerAccount.role !== 'broker') {
    throw new ApiError(404, 'Broker account not found');
  }

  // Verify broker profile
  const brokerProfile = await Broker.findOne({
    user_id: brokerAccount._id,
  });

  if (!brokerProfile) {
    throw new ApiError(404, 'Broker profile not found');
  }

  // One buyer can review a property only once
  const existingReview = await Review.findOne({
    property_id: property._id,
    reviewer_id: reviewerId,
  }).lean();

  if (existingReview) {
    throw new ApiError(
      409,
      'You have already reviewed this property'
    );
  }

  // Save review
  let review;

  try {
    review = await Review.create({
      property_id: property._id,
      broker_id: brokerAccount._id,
      reviewer_id: reviewerId,
      rating: numericRating,
      comment: comment.trim(),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        'You have already reviewed this property'
      );
    }

    throw error;
  }

  // Recalculate overall broker rating across all properties
  const stats = await Review.aggregate([
    {
      $match: {
        broker_id: brokerAccount._id,
      },
    },
    {
      $group: {
        _id: '$broker_id',
        average_rating: { $avg: '$rating' },
        review_count: { $sum: 1 },
      },
    },
  ]);

  const averageRating =
    stats.length > 0
      ? Number(stats[0].average_rating.toFixed(2))
      : 0;

  const reviewCount =
    stats.length > 0 ? stats[0].review_count : 0;

  await Broker.updateOne(
    { user_id: brokerAccount._id },
    {
      $set: {
        rating: averageRating,
        review_count: reviewCount,
      },
    }
  );

  return res.status(201).json(
    new ApiResponse(true, 'Review submitted successfully', {
      review,
      average_rating: averageRating,
      review_count: reviewCount,
    })
  );
});

// Get all reviews for a broker
const getBrokerReviews = asyncHandler(async (req, res) => {
  const { broker_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(broker_id)) {
    throw new ApiError(400, 'A valid broker ID is required');
  }

  const brokerAccount = await User.findById(broker_id);

  if (!brokerAccount || brokerAccount.role !== 'broker') {
    throw new ApiError(404, 'Broker account not found');
  }

  const reviews = await Review.find({
    broker_id: brokerAccount._id,
  })
    .populate('reviewer_id', 'full_name')
    .populate('property_id', 'title')
    .sort({ created_at: -1 });

  const stats = await Review.aggregate([
    {
      $match: {
        broker_id: brokerAccount._id,
      },
    },
    {
      $group: {
        _id: '$broker_id',
        average_rating: { $avg: '$rating' },
        review_count: { $sum: 1 },
      },
    },
  ]);

  const averageRating =
    stats.length > 0
      ? Number(stats[0].average_rating.toFixed(2))
      : 0;

  const reviewCount =
    stats.length > 0 ? stats[0].review_count : 0;

  return res.status(200).json(
    new ApiResponse(true, 'Broker reviews fetched successfully', {
      reviews,
      average_rating: averageRating,
      review_count: reviewCount,
    })
  );
});

module.exports = {
  createReview,
  getBrokerReviews,
};
