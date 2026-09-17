/**
 * adminAnalytics.controller.js
 * -----------------------------------------------------------------------
 * Chart-ready aggregation endpoints for the Analytics page, plus a simple
 * rule-based fraud detection pass (no ML — thresholds pulled from Settings,
 * good enough for a B.Tech project; swap for the AI service's fraud model
 * later if you build one).
 * -----------------------------------------------------------------------
 */

/**
 * adminAnalytics.controller.js
 * Admin analytics and fraud detection
 */

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const User = require('../models/User.model');
const Settings = require('../models/Settings.model');

// GET /api/v1/admin/analytics/user-growth?days=30
const getUserGrowth = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 30, 180);

  const since = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  );

  const rows = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
          },
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const byDate = Object.fromEntries(
    rows.map((r) => [r._id, r.count])
  );

  const series = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(
      Date.now() - i * 24 * 60 * 60 * 1000
    );

    const key = d.toISOString().slice(0, 10);

    series.push({
      date: key,
      count: byDate[key] || 0,
    });
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      'User growth fetched successfully',
      {
        series,
      }
    )
  );
});

// GET /api/v1/admin/analytics/role-distribution
const getRoleDistribution = asyncHandler(async (req, res) => {
  const rows = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  const distribution = rows.map((r) => ({
    role: r._id || 'unknown',
    count: r.count,
  }));

  return res.status(200).json(
    new ApiResponse(
      true,
      'Role distribution fetched successfully',
      {
        distribution,
      }
    )
  );
});

// GET /api/v1/admin/fraud/flags
const getFraudFlags = asyncHandler(async (req, res) => {
  const settings =
    (await Settings.findOne({ key: 'global' })) || {};

  const fourteenDaysAgo = new Date(
    Date.now() - 14 * 24 * 60 * 60 * 1000
  );

  const [staleUnverified, suspendedUsers] =
    await Promise.all([
      User.find({
        isVerified: false,
        createdAt: {
          $lte: fourteenDaysAgo,
        },
      })
        .select('name email createdAt')
        .limit(50),

      User.find({
        isActive: false,
      })
        .select('name email updatedAt')
        .limit(50),
    ]);

  const flags = [
    ...staleUnverified.map((u) => ({
      type: 'stale_unverified',
      severity: 'low',
      message: 'Registered 14+ days ago, still unverified',
      userId: u._id,
      name: u.name,
      email: u.email,
      since: u.createdAt,
    })),

    ...suspendedUsers.map((u) => ({
      type: 'suspended_account',
      severity: 'medium',
      message: 'Currently suspended by an admin',
      userId: u._id,
      name: u.name,
      email: u.email,
      since: u.updatedAt,
    })),
  ];

  return res.status(200).json(
    new ApiResponse(
      true,
      'Fraud flags fetched successfully',
      {
        flags,
        thresholds: {
          fraudFlagPriceDeviationPercent:
            settings.fraudFlagPriceDeviationPercent ?? 60,

          fraudFlagMaxListingsPerDay:
            settings.fraudFlagMaxListingsPerDay ?? 10,
        },
      }
    )
  );
});

module.exports = {
  getUserGrowth,
  getRoleDistribution,
  getFraudFlags,
};