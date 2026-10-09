const mongoose = require('mongoose');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

const Broker = require('../models/Broker.model');
const User = require('../models/User.model');
const Property = require('../models/Property.model');
const Appointment = require('../models/Appointment.model');
const Review = require('../models/Review.model');

const ALLOWED_PROFILE_FIELDS = [
  'bio',
  'experience_years',
  'specialties',
  'languages',
  'location',
  'agency_name',
  'license_number',
];

const computeTrustScore = ({
  verificationStatus,
  avgRating,
  completedAppointments,
  reviewCount,
}) => {
  let score = 0;

  if (verificationStatus === 'verified') {
    score += 30;
  }

  score += Math.min(avgRating * 10, 50);
  score += Math.min(completedAppointments, 15);
  score += Math.min(reviewCount, 5);

  return Math.round(Math.min(score, 100));
};

/**
 * GET /api/brokers/me
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let broker = await Broker.findOne({
    user_id: userId,
  });

  if (!broker) {
    broker = await Broker.create({
      user_id: userId,
    });
  }

  const account = await User.findById(userId);

  if (!account) {
    throw new ApiError(
      404,
      'Associated user account not found'
    );
  }

  const safeAccount =
    typeof account.toSafeObject === 'function'
      ? account.toSafeObject()
      : {
          _id: account._id,
          full_name: account.full_name,
          email: account.email,
          phone_number: account.phone_number,
          role: account.role,
          is_verified: account.is_verified,
          status: account.status,
          created_at: account.created_at,
        };

  return res.status(200).json(
    new ApiResponse(
      true,
      'Broker profile fetched successfully',
      {
        profile: broker,
        account: safeAccount,
      }
    )
  );
});

/**
 * PUT /api/brokers/me
 */
const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const updates = {};

  for (const field of ALLOWED_PROFILE_FIELDS) {
    if (req.body?.[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (
    updates.specialties !== undefined &&
    !Array.isArray(updates.specialties)
  ) {
    throw new ApiError(
      400,
      'specialties must be an array of strings'
    );
  }

  if (
    updates.languages !== undefined &&
    !Array.isArray(updates.languages)
  ) {
    throw new ApiError(
      400,
      'languages must be an array of strings'
    );
  }

  if (updates.location !== undefined) {
    if (
      typeof updates.location !== 'object' ||
      Array.isArray(updates.location) ||
      updates.location === null
    ) {
      throw new ApiError(
        400,
        'location must be an object with city and locality'
      );
    }

    updates.location = {
      city:
        typeof updates.location.city === 'string'
          ? updates.location.city.trim()
          : '',

      locality:
        typeof updates.location.locality === 'string'
          ? updates.location.locality.trim()
          : '',
    };
  }

  if (updates.experience_years !== undefined) {
    const years = Number(updates.experience_years);

    if (
      Number.isNaN(years) ||
      years < 0 ||
      years > 60
    ) {
      throw new ApiError(
        400,
        'experience_years must be a number between 0 and 60'
      );
    }

    updates.experience_years = years;
  }

  let broker = await Broker.findOne({
    user_id: userId,
  });

  if (!broker) {
    broker = await Broker.create({
      user_id: userId,
      ...updates,
    });
  } else {
    Object.assign(broker, updates);
    await broker.save();
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      'Broker profile updated successfully',
      {
        profile: broker,
      }
    )
  );
});

/**
 * GET /api/brokers/me/dashboard
 */
const getMyDashboard = asyncHandler(async (req, res) => {
  const brokerUserId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(brokerUserId)) {
    throw new ApiError(
      400,
      'Invalid authenticated user ID'
    );
  }

  const brokerObjectId =
    new mongoose.Types.ObjectId(brokerUserId);

  const [
    broker,
    totalProperties,
    activeProperties,
    totalLeads,
    newLeads,
    upcomingAppointments,
    completedAppointments,
    reviewStats,
  ] = await Promise.all([
    Broker.findOne({
      user_id: brokerUserId,
    }),

    Property.countDocuments({
      owner_id: brokerUserId,
      status: {
        $ne: 'deleted',
      },
    }),

    Property.countDocuments({
      owner_id: brokerUserId,
      status: 'approved',
    }),

    Appointment.countDocuments({
      broker_id: brokerUserId,
    }),

    Appointment.countDocuments({
      broker_id: brokerUserId,
      status: 'pending',
    }),

    Appointment.countDocuments({
      broker_id: brokerUserId,
      status: 'confirmed',
      scheduled_at: {
        $gte: new Date(),
      },
    }),

    Appointment.countDocuments({
      broker_id: brokerUserId,
      status: 'completed',
    }),

    Review.aggregate([
      {
        $match: {
          broker_id: brokerObjectId,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: {
            $avg: '$rating',
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  const averageRating =
    reviewStats.length > 0
      ? Number(reviewStats[0].avgRating.toFixed(2))
      : 0;

  const reviewCount =
    reviewStats.length > 0
      ? reviewStats[0].count
      : 0;

  const trustScore = computeTrustScore({
    verificationStatus:
      broker?.verification_status || 'pending',

    avgRating: averageRating,

    completedAppointments,

    reviewCount,
  });

  if (broker) {
    broker.rating = averageRating;
    broker.review_count = reviewCount;
    broker.trust_score = trustScore;

    await broker.save();
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      'Broker dashboard data fetched successfully',
      {
        total_properties: totalProperties,
        active_properties: activeProperties,

        total_leads: totalLeads,
        new_leads: newLeads,

        upcoming_appointments:
          upcomingAppointments,

        completed_appointments:
          completedAppointments,

        average_rating: averageRating,
        review_count: reviewCount,
        trust_score: trustScore,
      }
    )
  );
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyDashboard,
};