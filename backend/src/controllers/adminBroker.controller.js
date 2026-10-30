
const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");

const Broker = require("../models/Broker.model");
const User = require("../models/User.model");

const ALLOWED_VERIFICATION_STATUSES = [
  "pending",
  "verified",
  "rejected",
];

const ALLOWED_ACCOUNT_STATUSES = [
  "active",
  "blocked",
  "pending",
];

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllBrokers = asyncHandler(async (req, res) => {
  const page = Math.max(
    1,
    Number.parseInt(req.query.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
  );

  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim()
      : "";

  const verificationStatus =
    typeof req.query.verificationStatus === "string"
      ? req.query.verificationStatus
      : "";

  const accountStatus =
    typeof req.query.accountStatus === "string"
      ? req.query.accountStatus
      : "";

  if (
    verificationStatus &&
    !ALLOWED_VERIFICATION_STATUSES.includes(verificationStatus)
  ) {
    throw new ApiError(400, "Invalid verification status");
  }

  if (
    accountStatus &&
    !ALLOWED_ACCOUNT_STATUSES.includes(accountStatus)
  ) {
    throw new ApiError(400, "Invalid account status");
  }

  const brokerFilter = {};

  if (verificationStatus) {
    brokerFilter.verification_status = verificationStatus;
  }

  const userFilter = {
    role: "broker",
  };

  if (accountStatus) {
    userFilter.status = accountStatus;
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");

    const [matchingUsers, matchingProfiles] = await Promise.all([
      User.find({
        role: "broker",
        ...(accountStatus ? { status: accountStatus } : {}),
        $or: [
          { full_name: regex },
          { email: regex },
          { phone_number: regex },
        ],
      })
        .select("_id")
        .lean(),

      Broker.find({
        $or: [
          { agency_name: regex },
          { license_number: regex },
          { bio: regex },
          { "location.city": regex },
          { "location.locality": regex },
        ],
      })
        .select("user_id")
        .lean(),
    ]);

    const matchingIds = new Set([
      ...matchingUsers.map((user) => String(user._id)),
      ...matchingProfiles.map((broker) => String(broker.user_id)),
    ]);

    const objectIds = [...matchingIds]
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    userFilter._id = { $in: objectIds };
  }

  const matchingUsers = await User.find(userFilter)
    .select("_id")
    .lean();

  const matchingUserIds = matchingUsers.map((user) => user._id);

  brokerFilter.user_id = { $in: matchingUserIds };

  const [brokers, total] = await Promise.all([
    Broker.find(brokerFilter)
      .populate({
        path: "user_id",
        select:
          "full_name email phone_number role status is_verified created_at",
      })
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Broker.countDocuments(brokerFilter),
  ]);

  const result = brokers
    .filter(
      (broker) =>
        broker.user_id && broker.user_id.role === "broker"
    )
    .map((broker) => ({
      ...broker,
      account_status: broker.user_id.status,
      user: broker.user_id,
    }));

  return res.status(200).json(
    new ApiResponse(true, "Brokers fetched successfully", {
      brokers: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  );
});

const updateBrokerVerification = asyncHandler(async (req, res) => {
  const { brokerId } = req.params;
  const { verification_status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(brokerId)) {
    throw new ApiError(400, "Invalid broker ID");
  }

  if (!ALLOWED_VERIFICATION_STATUSES.includes(verification_status)) {
    throw new ApiError(
      400,
      "verification_status must be pending, verified, or rejected"
    );
  }

  const broker = await Broker.findById(brokerId);

  if (!broker) {
    throw new ApiError(404, "Broker not found");
  }

  const user = await User.findOne({
    _id: broker.user_id,
    role: "broker",
  });

  if (!user) {
    throw new ApiError(404, "Broker user account not found");
  }

  broker.verification_status = verification_status;
  await broker.save();

  return res.status(200).json(
    new ApiResponse(true, "Broker verification updated successfully", {
      broker_id: broker._id,
      verification_status: broker.verification_status,
      user_id: user._id,
    })
  );
});

const updateBrokerAccountStatus = asyncHandler(async (req, res) => {
  const { brokerId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(brokerId)) {
    throw new ApiError(400, "Invalid broker ID");
  }

  if (!["active", "blocked"].includes(status)) {
    throw new ApiError(
      400,
      "Account status must be active or blocked"
    );
  }

  const broker = await Broker.findById(brokerId);

  if (!broker) {
    throw new ApiError(404, "Broker not found");
  }

  const user = await User.findOne({
    _id: broker.user_id,
    role: "broker",
  });

  if (!user) {
    throw new ApiError(404, "Broker user account not found");
  }

  user.status = status;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      true,
      "Broker account status updated successfully",
      {
        broker_id: broker._id,
        user_id: user._id,
        account_status: user.status,
      }
    )
  );
});

module.exports = {
  getAllBrokers,
  updateBrokerVerification,
  updateBrokerAccountStatus,
};
