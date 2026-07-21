const { verifyAccessToken } = require('../utils/jwt.util');
const User = require('../models/User.model');

// Attaches req.user if a valid token is present, but does NOT block 
// the request if no token exists — used for public endpoints that 
// behave slightly differently for logged-in users (e.g., property details)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.user_id);
      if (user) {
        req.user = { id: user._id.toString(), role: user.role };
      }
    } catch (err) {
      // Invalid/expired token on an optional-auth route — just proceed as guest
    }
  }

  next();
};

module.exports = optionalAuth;