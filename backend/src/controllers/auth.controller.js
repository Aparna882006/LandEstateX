const User = require('../models/User.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateOTP,
  generateRandomToken,
} = require('../utils/jwt.util');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─────────────────────────────────────────────
// REGISTER
// POST /api/v1/auth/register
// ─────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { full_name, email, phone_number, password, role } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { phone_number },
    ],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      'This email or phone number is already registered'
    );
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    full_name,
    email: normalizedEmail,
    phone_number,
    password,
    role,
    email_verification_otp: otp,
    email_verification_expires: otpExpiry,
  });

  // Development only
  console.log(
    `[DEV ONLY] Verification OTP for ${normalizedEmail}: ${otp}`
  );

  return res.status(201).json(
    new ApiResponse(
      true,
      'Account created. Please verify your email.',
      {
        user_id: user._id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      }
    )
  );
});

// ─────────────────────────────────────────────
// VERIFY EMAIL
// POST /api/v1/auth/verify-email
// ─────────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select(
    '+email_verification_otp +email_verification_expires'
  );

  if (!user) {
    throw new ApiError(401, 'Incorrect or expired OTP');
  }

  if (user.is_verified) {
    throw new ApiError(409, 'Email already verified');
  }

  if (
    !user.email_verification_otp ||
    user.email_verification_otp !== otp ||
    !user.email_verification_expires ||
    user.email_verification_expires < new Date()
  ) {
    throw new ApiError(401, 'Incorrect or expired OTP');
  }

  user.is_verified = true;
  user.status = 'active';

  user.email_verification_otp = undefined;
  user.email_verification_expires = undefined;

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      true,
      'Email verified successfully',
      {
        is_verified: true,
      }
    )
  );
});

// ─────────────────────────────────────────────
// LOGIN
// POST /api/v1/auth/login
// ─────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email_or_phone, password } = req.body;

  const loginValue = email_or_phone.trim().toLowerCase();

  const user = await User.findOne({
    $or: [
      { email: loginValue },
      { phone_number: email_or_phone.trim() },
    ],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email or password is incorrect');
  }

  if (user.status === 'blocked') {
    throw new ApiError(
      403,
      'This account has been temporarily restricted'
    );
  }

  if (!user.is_verified) {
    throw new ApiError(
      403,
      'Please verify your email before logging in'
    );
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refresh_tokens.push({
    token_hash: hashToken(refreshToken),
    expires_at: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
  });

  await user.save();

  res.cookie(
    'refreshToken',
    refreshToken,
    REFRESH_COOKIE_OPTIONS
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      'Login successful',
      {
        user: user.toSafeObject(),
        access_token: accessToken,
        expires_in: 900,
      }
    )
  );
});

// ─────────────────────────────────────────────
// REFRESH TOKEN
// POST /api/v1/auth/refresh-token
// ─────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken ||
    req.body.refresh_token;

  if (!token) {
    throw new ApiError(
      400,
      'Refresh token is required'
    );
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(
      401,
      'Refresh token invalid or expired'
    );
  }

  const user = await User.findById(decoded.user_id);

  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  const tokenHash = hashToken(token);

  const storedToken = user.refresh_tokens.find(
    (rt) => rt.token_hash === tokenHash
  );

  if (!storedToken) {
    user.refresh_tokens = [];

    await user.save();

    throw new ApiError(
      401,
      'Refresh token invalid or has been revoked'
    );
  }

  // Remove old refresh token
  user.refresh_tokens = user.refresh_tokens.filter(
    (rt) => rt.token_hash !== tokenHash
  );

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refresh_tokens.push({
    token_hash: hashToken(newRefreshToken),
    expires_at: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
  });

  await user.save();

  res.cookie(
    'refreshToken',
    newRefreshToken,
    REFRESH_COOKIE_OPTIONS
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      'Token refreshed',
      {
        access_token: newAccessToken,
        expires_in: 900,
      }
    )
  );
});

// ─────────────────────────────────────────────
// LOGOUT
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken ||
    req.body.refresh_token;

  if (token) {
    const tokenHash = hashToken(token);

    await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          refresh_tokens: {
            token_hash: tokenHash,
          },
        },
      }
    );
  }

  res.clearCookie(
    'refreshToken',
    REFRESH_COOKIE_OPTIONS
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      'Logged out successfully'
    )
  );
});

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// POST /api/v1/auth/forgot-password
// ─────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  console.log('\n========================================');
  console.log('[DEV] Forgot password request');
  console.log('[DEV] Email:', normalizedEmail);

  const user = await User.findOne({
    email: normalizedEmail,
  });

  console.log('[DEV] User found:', !!user);

  if (user) {
    const resetToken = generateRandomToken();

    user.password_reset_token =
      hashToken(resetToken);

    user.password_reset_expires = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await user.save();

    // Development only
    console.log('\n========================================');
    console.log(
      '[DEV ONLY] PASSWORD RESET TOKEN'
    );
    console.log(
      'Email:',
      normalizedEmail
    );
    console.log(
      'Token:',
      resetToken
    );
    console.log(
      'Expires:',
      user.password_reset_expires
    );
    console.log('========================================\n');
  } else {
    console.log(
      '[DEV] No user found with this email.'
    );
    console.log('========================================\n');
  }

  // Always return the same response
  // so account existence is not revealed.
  return res.status(200).json(
    new ApiResponse(
      true,
      'If an account exists with this email, a reset link has been sent.'
    )
  );
});

// ─────────────────────────────────────────────
// RESET PASSWORD
// POST /api/v1/auth/reset-password
// ─────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const {
    reset_token,
    new_password,
  } = req.body;

  if (!reset_token) {
    throw new ApiError(
      400,
      'Reset token is required'
    );
  }

  if (!new_password) {
    throw new ApiError(
      400,
      'New password is required'
    );
  }

  if (new_password.length < 8) {
    throw new ApiError(
      400,
      'Password must be at least 8 characters'
    );
  }

  const tokenHash = hashToken(
    reset_token.trim()
  );

  const user = await User.findOne({
    password_reset_token: tokenHash,
    password_reset_expires: {
      $gt: new Date(),
    },
  }).select(
    '+password_reset_token +password_reset_expires'
  );

  if (!user) {
    throw new ApiError(
      401,
      'Invalid or expired reset token'
    );
  }

  // The User model pre-save hook will hash
  // the new password automatically.
  user.password = new_password;

  // Remove used reset token
  user.password_reset_token = undefined;
  user.password_reset_expires = undefined;

  // Revoke all existing sessions
  user.refresh_tokens = [];

  await user.save();

  console.log(
    `[DEV] Password successfully reset for ${user.email}`
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      'Password reset successful. Please log in with your new password.'
    )
  );
});

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};