/**
 * admin.controller.js
 * -----------------------------------------------------------------------
 * Admin module controller. Follows the same pattern as auth.controller.js:
 * asyncHandler wrapper, ApiResponse / ApiError helpers, Mongoose models.
 *
 * ASSUMPTIONS (adjust import paths/names if yours differ):
 *   - utils/asyncHandler.js  -> exports `asyncHandler(fn)`
 *   - utils/apiResponse.js   -> exports `ApiResponse` class (statusCode, data, message)
 *   - utils/apiError.js      -> exports `ApiError` class (statusCode, message)
 *   - models/User.model.js   -> has fields: role, isVerified, isActive/isSuspended, createdAt
 *
 * NOTE: Property-related stats/endpoints are stubbed behind a safe check
 * since Property.model.js doesn't exist yet per the roadmap. Once the
 * Property module is built, uncomment the Property import + related code.
 * -----------------------------------------------------------------------
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/User.model.js";

// Uncomment once Property module is implemented:
// import { Property } from "../models/Property.model.js";

/**
 * GET /api/v1/admin/dashboard-stats
 * High-level platform stats for the admin dashboard cards.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalBuyers, totalBrokers, verifiedUsers, unverifiedUsers] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "broker" }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isVerified: false }),
    ]);

  // Users created in the last 7 days — simple growth signal for the dashboard.
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: oneWeekAgo },
  });

  let totalProperties = null;
  // if (Property) {
  //   totalProperties = await Property.countDocuments();
  // }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalBuyers,
        totalBrokers,
        verifiedUsers,
        unverifiedUsers,
        newUsersThisWeek,
        totalProperties, // null until Property module exists
      },
      "Dashboard stats fetched successfully"
    )
  );
});

/**
 * GET /api/v1/admin/users
 * Paginated + filterable user list.
 * Query params: page, limit, role, isVerified, search (name/email)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isVerified !== undefined) {
    filter.isVerified = req.query.isVerified === "true";
  }
  if (req.query.search) {
    const search = req.query.search.trim();
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -refreshTokens -passwordResetToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Users fetched successfully"
    )
  );
});

/**
 * GET /api/v1/admin/users/:userId
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select(
    "-password -refreshTokens -passwordResetToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

/**
 * PATCH /api/v1/admin/users/:userId/status
 * Body: { isActive: boolean }
 * Suspends or reactivates a user account. Requires an `isActive` (or
 * `isSuspended`, inverted) field on User.model.js — add it if not present:
 *   isActive: { type: Boolean, default: true }
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prevent an admin from locking themselves out.
  if (String(user._id) === String(req.user._id) && !isActive) {
    throw new ApiError(400, "You cannot suspend your own account");
  }

  user.isActive = isActive;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userId: user._id, isActive: user.isActive },
        `User ${isActive ? "reactivated" : "suspended"} successfully`
      )
    );
});

/**
 * PATCH /api/v1/admin/users/:userId/role
 * Body: { role: "buyer" | "seller" | "broker" | "builder" | "admin" }
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const allowedRoles = ["buyer", "seller", "broker", "builder", "investor", "admin"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, `Role must be one of: ${allowedRoles.join(", ")}`);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { userId: user._id, role: user.role }, "User role updated successfully")
    );
});

/**
 * DELETE /api/v1/admin/users/:userId
 * Hard delete — consider soft-delete (isDeleted flag) instead in production.
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (String(userId) === String(req.user._id)) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { userId }, "User deleted successfully"));
});
