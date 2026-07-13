const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { verifyAccessToken } = require('../utils/jwt.util');
const User = require('../models/User.model');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, 'Not authorized, invalid or expired token');
  }

  const user = await User.findById(decoded.user_id);
  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists');
  }

  if (user.status === 'blocked') {
    throw new ApiError(403, 'This account has been blocked');
  }

  // Attach user to request — never trust client-supplied user_id anywhere downstream
  req.user = { id: user._id.toString(), role: user.role };
  next();
});

module.exports = { protect };