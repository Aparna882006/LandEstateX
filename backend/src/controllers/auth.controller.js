
const User = require('../models/User.model');
const Broker = require('../models/Broker.model');
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

const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../services/email.service');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// REGISTER
// POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    phone_number,
    password,
    role,
  } = req.body;

  if (!full_name || !email || !phone_number || !password) {
    throw new ApiError(
      400,
      'Full name, email, phone number and password are required'
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone_number.trim();

  const allowedRoles = ['buyer', 'broker'];

  if (!role || !allowedRoles.includes(role)) {
    throw new ApiError(400, 'A valid role is required');
  }

  const existingUser = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { phone_number: normalizedPhone },
    ],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      'This email or phone number is already registered'
    );
  }

  // Generate a six-digit OTP.
  const otp = generateOTP();

  // Store only the hashed OTP in MongoDB.
  const hashedOtp = hashToken(otp);

  // OTP expires after 10 minutes.
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    full_name: full_name.trim(),
    email: normalizedEmail,
    phone_number: normalizedPhone,
    password,
    role,
    email_verification_otp: hashedOtp,
    email_verification_expires: otpExpiry,
  });

  // Create broker profile if the selected role is broker.
  let brokerCreated = false;

  try {
    if (user.role === 'broker') {
      await Broker.create({
        user_id: user._id,
      });

      brokerCreated = true;
    }

    // Send verification OTP to the registered Gmail/email address.
    await sendVerificationEmail({
      to: user.email,
      name: user.full_name,
      otp,
    });
  } catch (error) {
    // Remove incomplete registration if broker creation or email fails.
    try {
      if (brokerCreated) {
        await Broker.deleteOne({ user_id: user._id });
      }

      await User.findByIdAndDelete(user._id);
    } catch (cleanupError) {
      console.error(
        '[REGISTER] Cleanup failed:',
        cleanupError.message
      );
    }

    console.error(
      '[REGISTER] Registration email delivery failed:',
      error.message
    );

    throw new ApiError(
      503,
      'Unable to send verification email. Please try registering again.'
    );
  }

  return res.status(201).json(
    new ApiResponse(
      true,
      'Account created. Verification OTP has been sent to your email.',
      {
        user_id: user._id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      }
    )
  );
});

// VERIFY EMAIL
// POST /api/v1/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = String(otp).trim();

  if (!/^\d{6}$/.test(normalizedOtp)) {
    throw new ApiError(400, 'Please enter a valid six-digit OTP');
  }

  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+email_verification_otp +email_verification_expires');

  if (!user) {
    throw new ApiError(401, 'Incorrect or expired OTP');
  }

  if (user.is_verified) {
    throw new ApiError(409, 'Email already verified');
  }

  const storedOtp = user.email_verification_otp;

  // Accept hashed OTPs and temporarily support old plaintext
  // OTPs created before this update.
  const isOtpValid =
    storedOtp &&
    (
      storedOtp === hashToken(normalizedOtp) ||
      storedOtp === normalizedOtp
    );

  if (
    !isOtpValid ||
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
    new ApiResponse(true, 'Email verified successfully', {
      is_verified: true,
    })
  );
});

// LOGIN
// POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email_or_phone, password } = req.body;

  if (!email_or_phone || !password) {
    throw new ApiError(
      400,
      'Email/phone and password are required'
    );
  }

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
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json(
    new ApiResponse(true, 'Login successful', {
      user: user.toSafeObject(),
      access_token: accessToken,
      expires_in: 900,
    })
  );
});

// REFRESH TOKEN
// POST /api/v1/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken || req.body?.refresh_token;

  if (!token) {
    throw new ApiError(400, 'Refresh token is required');
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, 'Refresh token invalid or expired');
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

  user.refresh_tokens = user.refresh_tokens.filter(
    (rt) => rt.token_hash !== tokenHash
  );

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refresh_tokens.push({
    token_hash: hashToken(newRefreshToken),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  res.cookie(
    'refreshToken',
    newRefreshToken,
    REFRESH_COOKIE_OPTIONS
  );

  return res.status(200).json(
    new ApiResponse(true, 'Token refreshed', {
      access_token: newAccessToken,
      expires_in: 900,
    })
  );
});

// LOGOUT
// POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken || req.body?.refresh_token;

  if (token && req.user?.id) {
    const tokenHash = hashToken(token);

    await User.findByIdAndUpdate(req.user.id, {
      $pull: {
        refresh_tokens: {
          token_hash: tokenHash,
        },
      },
    });
  }

  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

  return res.status(200).json(
    new ApiResponse(true, 'Logged out successfully')
  );
});

// FORGOT PASSWORD
// POST /api/v1/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (user) {
    const resetToken = generateRandomToken();

    user.password_reset_token = hashToken(resetToken);
    user.password_reset_expires = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await user.save();

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.full_name,
        resetToken,
      });
    } catch (error) {
      user.password_reset_token = undefined;
      user.password_reset_expires = undefined;

      await user.save();

      console.error(
        '[FORGOT PASSWORD] Email delivery failed:',
        error.message
      );

      throw new ApiError(
        503,
        'Unable to send password reset email. Please try again later.'
      );
    }
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      'If an account exists with this email, a reset link has been sent.'
    )
  );
});

// RESET PASSWORD
// POST /api/v1/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { reset_token, new_password } = req.body;

  if (!reset_token || !new_password) {
    throw new ApiError(
      400,
      'Reset token and new password are required'
    );
  }

  if (new_password.length < 8) {
    throw new ApiError(
      400,
      'Password must be at least 8 characters'
    );
  }

  const tokenHash = hashToken(reset_token.trim());

  const user = await User.findOne({
    password_reset_token: tokenHash,
    password_reset_expires: { $gt: new Date() },
  }).select('+password_reset_token +password_reset_expires');

  if (!user) {
    throw new ApiError(401, 'Invalid or expired reset token');
  }

  user.password = new_password;
  user.password_reset_token = undefined;
  user.password_reset_expires = undefined;
  user.refresh_tokens = [];

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      true,
      'Password reset successful. Please log in with your new password.'
    )
  );
});

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};
