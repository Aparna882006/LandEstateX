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

router.post('/register', registerValidator, validate, register);
router.post('/verify-email', verifyEmailValidator, validate, verifyEmail);
router.post('/login', loginValidator, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

module.exports = router;