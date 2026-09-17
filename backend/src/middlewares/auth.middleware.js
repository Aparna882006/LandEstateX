const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const User = require("../models/User.model");

/**
 * verifyJWT
 * Expects existing auth module's access token flow: Bearer token in Authorization header.
 * Attaches req.user (Mongoose User doc, minus password/refresh fields).
 */
const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized request - no token provided");

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await User.findById(decoded._id).select("-password -refreshTokens");

  if (!user) throw new ApiError(401, "Invalid access token");

  req.user = user;
  next();
});

module.exports = { verifyJWT };
