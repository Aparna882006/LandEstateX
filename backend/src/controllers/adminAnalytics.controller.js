const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const User = require("../models/User.model");
const Property = require("../models/Property.model");
const Settings = require("../models/Settings.model");

// @desc Get user growth analytics
// @route GET /api/v1/admin/analytics/user-growth?days=30
// @access Admin
const getUserGrowth = asyncHandler(async (req, res) => {
  const requestedDays = parseInt(req.query.days, 10) || 30;
  const days = Math.min(Math.max(requestedDays, 1), 180);

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await User.aggregate([
    {
      $match: {
        created_at: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$created_at",
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const countByDate = new Map(
    rows.map((row) => [row._id, row.count])
  );

  const series = [];

  for (let i = 0; i < days; i += 1) {
    const date = new Date(since);
    date.setDate(since.getDate() + i);

    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    series.push({
      date: dateKey,
      count: countByDate.get(dateKey) || 0,
    });
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      "User growth analytics fetched successfully",
      { series }
    )
  );
});

// @desc Get user distribution by role
// @route GET /api/v1/admin/analytics/role-distribution
// @access Admin
const getRoleDistribution = asyncHandler(async (req, res) => {
  const distribution = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        role: "$_id",
        count: 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      true,
      "Role distribution fetched successfully",
      { distribution }
    )
  );
});

// @desc Get fraud and account review flags
// @route GET /api/v1/admin/fraud/flags
// @access Admin
const getFraudFlags = asyncHandler(async (req, res) => {
  const settingsDoc = await Settings.findOne({ key: "global" }).lean();

  const priceDeviationThreshold = Math.max(
    0,
    Number(settingsDoc?.fraudFlagPriceDeviationPercent ?? 60)
  );

  const maxListingsPerDay = Math.max(
    1,
    Number(settingsDoc?.fraudFlagMaxListingsPerDay ?? 10)
  );

  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const flags = [];

  /*
   * RULE 1:
   * Property price deviation from AI predicted price.
   *
   * deviation = abs(actual price - predicted price) / predicted price * 100
   */
  const properties = await Property.find({
    ai_predicted_price: { $gt: 0 },
    price: { $gt: 0 },
    status: { $nin: ["deleted", "rejected"] },
  })
    .select(
      "owner_id title price ai_predicted_price location created_at status is_fraud_flagged"
    )
    .populate("owner_id", "full_name email status")
    .lean();

  const propertiesToFlag = [];

  for (const property of properties) {
    const actualPrice = Number(property.price);
    const predictedPrice = Number(property.ai_predicted_price);

    if (
      !Number.isFinite(actualPrice) ||
      !Number.isFinite(predictedPrice) ||
      predictedPrice <= 0
    ) {
      continue;
    }

    const deviationPercent =
      (Math.abs(actualPrice - predictedPrice) / predictedPrice) * 100;

    if (deviationPercent > priceDeviationThreshold) {
      propertiesToFlag.push(property);

      flags.push({
        id: `price-${property._id}`,
        type: "price_deviation",
        severity: "high",

        user: {
          id: property.owner_id?._id
            ? String(property.owner_id._id)
            : null,
          full_name:
            property.owner_id?.full_name || "Unknown user",
          email: property.owner_id?.email || "",
        },

        property: {
          id: String(property._id),
          title: property.title,
          price: property.price,
          predictedPrice: property.ai_predicted_price,
          city: property.location?.city || "",
          locality: property.location?.locality || "",
        },

        created_at: property.created_at,
        status: "flagged",

        message:
          `Listing price deviates ${deviationPercent.toFixed(1)}% ` +
          `from its AI predicted price. ` +
          `Configured threshold: ${priceDeviationThreshold}%.`,
      });
    }
  }

  /*
   * Automatically flag suspicious properties for admin review.
   * This does not block the owner account.
   */
  if (propertiesToFlag.length > 0) {
    const ids = propertiesToFlag.map((property) => property._id);

    await Property.updateMany(
      {
        _id: { $in: ids },
        is_fraud_flagged: { $ne: true },
      },
      {
        $set: {
          is_fraud_flagged: true,
          status: "flagged",
        },
      }
    );
  }

  /*
   * RULE 2:
   * More than configured number of listings in the current day.
   */
  const dailyListingCounts = await Property.aggregate([
    {
      $match: {
        created_at: { $gte: todayStart },
        status: { $nin: ["deleted", "rejected"] },
      },
    },
    {
      $group: {
        _id: "$owner_id",
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: maxListingsPerDay },
      },
    },
  ]);

  const userIds = dailyListingCounts.map((row) => row._id);

  const users = userIds.length
    ? await User.find({
        _id: { $in: userIds },
      })
        .select("full_name email status")
        .lean()
    : [];

  const userMap = new Map(
    users.map((user) => [String(user._id), user])
  );

  for (const row of dailyListingCounts) {
    const user = userMap.get(String(row._id));

    flags.push({
      id: `volume-${row._id}`,
      type: "excessive_listings",
      severity: "medium",

      user: {
        id: String(row._id),
        full_name: user?.full_name || "Unknown user",
        email: user?.email || "",
      },

      property: null,
      created_at: now,
      status: user?.status || "unknown",

      message:
        `User posted ${row.count} listings today. ` +
        `Configured limit: ${maxListingsPerDay} listings per day.`,
    });
  }

  /*
   * RULE 3:
   * Accounts unverified for 14+ days.
   */
  const staleUnverifiedUsers = await User.find({
    is_verified: false,
    created_at: { $lte: fourteenDaysAgo },
    status: { $ne: "blocked" },
  })
    .select("full_name email created_at is_verified status")
    .sort({ created_at: 1 })
    .limit(50)
    .lean();

  for (const user of staleUnverifiedUsers) {
    flags.push({
      id: `stale-${user._id}`,
      type: "stale_unverified",
      severity: "medium",

      user: {
        id: String(user._id),
        full_name: user.full_name,
        email: user.email,
      },

      property: null,
      created_at: user.created_at,
      status: user.status,

      message: "Account has remained unverified for over 14 days.",
    });
  }

  /*
   * RULE 4:
   * Accounts currently blocked.
   */
  const blockedUsers = await User.find({
    status: "blocked",
  })
    .select("full_name email updated_at status")
    .sort({ updated_at: -1 })
    .limit(50)
    .lean();

  for (const user of blockedUsers) {
    flags.push({
      id: `blocked-${user._id}`,
      type: "blocked_account",
      severity: "high",

      user: {
        id: String(user._id),
        full_name: user.full_name,
        email: user.email,
      },

      property: null,
      created_at: user.updated_at,
      status: user.status,

      message: "This account is currently blocked.",
    });
  }

  flags.sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      "Fraud flags fetched successfully",
      {
        flags,
        thresholds: {
          priceDeviationPercent: priceDeviationThreshold,
          maxListingsPerDay,
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