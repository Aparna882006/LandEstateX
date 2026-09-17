/**
 * admin.controller.js
 * Admin module controller
 */

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const User = require('../models/User.model');

// GET /api/v1/admin/dashboard-stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBuyers,
    totalBrokers,
    verifiedUsers,
    unverifiedUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'buyer' }),
    User.countDocuments({ role: 'broker' }),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ isVerified: false }),
  ]);

  const oneWeekAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: oneWeekAgo },
  });

  // Property statistics are not connected yet.
  const totalProperties = null;

  return res.status(200).json(
    new ApiResponse(
      true,
      'Dashboard stats fetched successfully',
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
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.isVerified !== undefined) {
    filter.isVerified = req.query.isVerified === 'true';
  }

  if (req.query.search) {
    const search = req.query.search.trim();

    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshTokens -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    User.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      true,
      'Users fetched successfully',
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    )
  );
});

// GET /api/v1/admin/users/:userId
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select(
    '-password -refreshTokens -passwordResetToken'
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      'User fetched successfully',
      user
    )
  );
});

// PATCH /api/v1/admin/users/:userId/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (
    String(user._id) === String(req.user._id) &&
    !isActive
  ) {
    throw new ApiError(
      400,
      'You cannot suspend your own account'
    );
  }

  user.isActive = isActive;

  await user.save({
    validateBeforeSave: false,
  });

  return res.status(200).json(
    new ApiResponse(
      true,
      `User ${
        isActive ? 'reactivated' : 'suspended'
      } successfully`,
      {
        userId: user._id,
        isActive: user.isActive,
      }
    )
  );
});

// PATCH /api/v1/admin/users/:userId/role
const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const allowedRoles = [
    'buyer',
    'seller',
    'broker',
    'builder',
    'investor',
    'admin',
  ];

  if (!allowedRoles.includes(role)) {
    throw new ApiError(
      400,
      `Role must be one of: ${allowedRoles.join(', ')}`
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.role = role;

  await user.save({
    validateBeforeSave: false,
  });

  return res.status(200).json(
    new ApiResponse(
      true,
      'User role updated successfully',
      {
        userId: user._id,
        role: user.role,
      }
    )
  );
});

// DELETE /api/v1/admin/users/:userId
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (String(userId) === String(req.user._id)) {
    throw new ApiError(
      400,
      'You cannot delete your own account'
    );
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      'User deleted successfully',
      { userId }
    )
  );
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
};