
/**
 * admin.controller.js
 * Admin module controller
 */

const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const User = require("../models/User.model");
const Property = require("../models/Property.model");

// GET /api/v1/admin/dashboard-stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBuyers,
    totalBrokers,
    verifiedUsers,
    unverifiedUsers,
    totalProperties,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "buyer" }),
    User.countDocuments({ role: "broker" }),
    User.countDocuments({ is_verified: true }),
    User.countDocuments({ is_verified: false }),
    Property.countDocuments(),
  ]);

  const oneWeekAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  const newUsersThisWeek = await User.countDocuments({
    created_at: { $gte: oneWeekAgo },
  });

  return res.status(200).json(
    new ApiResponse(
      true,
      "Dashboard stats fetched successfully",
      {
        totalUsers,
        totalBuyers,
        totalBrokers,
        verifiedUsers,
        unverifiedUsers,
        newUsersThisWeek,
        totalProperties,
      }
    )
  );
});

// GET /api/v1/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "no-store");

  const page = Math.max(
    parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || 20, 1),
    100
  );

  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.isVerified !== undefined) {
    filter.is_verified = req.query.isVerified === "true";
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    const search = req.query.search.trim();

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        {
          full_name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          phone_number: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -refresh_tokens")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(true, "Users fetched successfully", {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  );
});

// GET /api/v1/admin/users/:userId
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select("-password -refresh_tokens")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(true, "User fetched successfully", user)
  );
});

// PATCH /api/v1/admin/users/:userId/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean");
  }

  if (!req.user?._id) {
    throw new ApiError(
      401,
      "Authenticated user missing from request"
    );
  }

  if (
    String(userId) === String(req.user._id) &&
    !isActive
  ) {
    throw new ApiError(
      400,
      "You cannot suspend your own account"
    );
  }

  const newStatus = isActive ? "active" : "blocked";

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { status: newStatus } },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  console.log(
    `[Admin] User ${userId} status saved as: ${updatedUser.status}`
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      `User ${isActive ? "reactivated" : "suspended"} successfully`,
      {
        userId: updatedUser._id,
        status: updatedUser.status,
        isActive: updatedUser.status === "active",
      }
    )
  );
});

// PATCH /api/v1/admin/users/:userId/verify
const verifyUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!req.user?._id) {
    throw new ApiError(
      401,
      "Authenticated user missing from request"
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { is_verified: true } },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -refresh_tokens");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(true, "User verified successfully", {
      userId: updatedUser._id,
      is_verified: updatedUser.is_verified,
    })
  );
});

// PATCH /api/v1/admin/users/:userId/role
const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const allowedRoles = [
    "buyer",
    "seller",
    "broker",
    "builder",
    "investor",
    "admin",
  ];

  if (!allowedRoles.includes(role)) {
    throw new ApiError(
      400,
      `Role must be one of: ${allowedRoles.join(", ")}`
    );
  }

  if (!req.user?._id) {
    throw new ApiError(
      401,
      "Authenticated user missing from request"
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { role } },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(true, "User role updated successfully", {
      userId: updatedUser._id,
      role: updatedUser.role,
    })
  );
});

// DELETE /api/v1/admin/users/:userId
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!req.user?._id) {
    throw new ApiError(
      401,
      "Authenticated user missing from request"
    );
  }

  if (String(userId) === String(req.user._id)) {
    throw new ApiError(
      400,
      "You cannot delete your own account"
    );
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(true, "User deleted successfully", {
      userId,
    })
  );
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  verifyUser,
  updateUserRole,
  deleteUser,
};
