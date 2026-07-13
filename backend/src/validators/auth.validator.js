const { body } = require('express-validator');

const registerValidator = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name must contain only letters and spaces'),

  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),

  body('phone_number')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least 1 number and 1 special character'),

  body('role')
    .isIn(['buyer', 'seller', 'broker', 'builder', 'investor'])
    .withMessage('Invalid role selected'),
];

const loginValidator = [
  body('email_or_phone').trim().notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
];

const resetPasswordValidator = [
  body('reset_token').notEmpty().withMessage('Reset token is required'),
  body('new_password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least 1 number and 1 special character'),
  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.new_password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

const verifyEmailValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
};