const ApiError = require("../utils/apiError");

/**
 * restrictTo(...roles)
 * Usage: router.use(verifyJWT, restrictTo("broker", "admin"))
 */
const restrictTo = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }
    next();
  };
};

module.exports = { restrictTo };
