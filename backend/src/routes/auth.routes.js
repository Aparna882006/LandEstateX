const express = require('express');

const router = express.Router();

const {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');

const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
} = require('../validators/auth.validator');

const validate = require('../middlewares/validate.middleware');

const { protect } = require('../middlewares/auth.middleware');

// ─────────────────────────────────────────────
// REGISTER
// POST /api/v1/auth/register
// ─────────────────────────────────────────────
router.post(
  '/register',
  (req, res, next) => {
    console.log('🔥🔥🔥 REGISTER ROUTE HIT 🔥🔥🔥');
    next();
  },
  registerValidator,
  validate,
  register
);

// ─────────────────────────────────────────────
// VERIFY EMAIL
// POST /api/v1/auth/verify-email
// ─────────────────────────────────────────────
router.post(
  '/verify-email',
  verifyEmailValidator,
  validate,
  verifyEmail
);

// ─────────────────────────────────────────────
// LOGIN
// POST /api/v1/auth/login
// ─────────────────────────────────────────────
router.post(
  '/login',
  loginValidator,
  validate,
  login
);

// ─────────────────────────────────────────────
// REFRESH TOKEN
// POST /api/v1/auth/refresh-token
// ─────────────────────────────────────────────
router.post(
  '/refresh-token',
  refreshToken
);

// ─────────────────────────────────────────────
// LOGOUT
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────
router.post(
  '/logout',
  protect,
  logout
);

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// POST /api/v1/auth/forgot-password
// ─────────────────────────────────────────────
router.post(
  '/forgot-password',
  forgotPasswordValidator,
  validate,
  forgotPassword
);

// ─────────────────────────────────────────────
// RESET PASSWORD
// POST /api/v1/auth/reset-password
// ─────────────────────────────────────────────
router.post(
  '/reset-password',
  resetPasswordValidator,
  validate,
  resetPassword
);

module.exports = router;