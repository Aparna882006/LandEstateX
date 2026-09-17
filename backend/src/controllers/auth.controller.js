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

  const existingUser = await User.findOne({ $or: [{ email }, { phone_number }] });
  if (existingUser) {
    // Generic message — do not reveal which field matched (prevents enumeration)
    throw new ApiError(409, 'This email or phone number is already registered');
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await User.create({
    full_name,
    email,
    phone_number,
    password,
    role,
    email_verification_otp: otp,
    email_verification_expires: otpExpiry,
  });

  // TODO: send `otp` via email service (async, non-blocking) — 
  // stubbed for now, log to console during development
  console.log(`[DEV ONLY] Verification OTP for ${email}: ${otp}`);

  return res
    .status(201)
    .json(
      new ApiResponse(
  201,
  {
    user_id: user._id,
    email: user.email,
    role: user.role,
    is_verified: user.is_verified,
  },
  'Account created. Please verify your email.'
)
    );
});

// ─────────────────────────────────────────────
// VERIFY EMAIL
// POST /api/v1/auth/verify-email
// ─────────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select(
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
    user.email_verification_expires < new Date()
  ) {
    throw new ApiError(401, 'Incorrect or expired OTP');
  }

  user.is_verified = true;
  user.status = 'active';
  user.email_verification_otp = undefined;
  user.email_verification_expires = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(
  200,
  {
    is_verified: true,
  },
  'Email verified successfully'
));
});

// ─────────────────────────────────────────────
// LOGIN
// POST /api/v1/auth/login
// ─────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email_or_phone, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: email_or_phone }, { phone_number: email_or_phone }],
  }).select('+password');

  // Generic error for both "user not found" and "wrong password" — prevents enumeration
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email or password is incorrect');
  }

  if (user.status === 'blocked') {
    throw new ApiError(403, 'This account has been temporarily restricted');
  }

  if (!user.is_verified) {
    throw new ApiError(403, 'Please verify your email before logging in');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store hashed refresh token server-side for revocation capability
  user.refresh_tokens.push({
    token_hash: hashToken(refreshToken),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await user.save();

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

 return res.status(200).json(
  new ApiResponse(
    200,
    {
      user: user.toSafeObject(),
      access_token: accessToken,
      expires_in: 900,
    },
    'Login successful'
  )
);
});

// ─────────────────────────────────────────────
// REFRESH TOKEN
// POST /api/v1/auth/refresh-token
// ─────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refresh_token;

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
  const storedToken = user.refresh_tokens.find((rt) => rt.token_hash === tokenHash);

  if (!storedToken) {
    // Token not found in the revocation-aware store — treat as compromised, 
    // wipe ALL refresh tokens for this user, forcing full re-login everywhere
    user.refresh_tokens = [];
    await user.save();
    throw new ApiError(401, 'Refresh token invalid or has been revoked');
  }

  // Rotation: remove old token, issue a new one
  user.refresh_tokens = user.refresh_tokens.filter((rt) => rt.token_hash !== tokenHash);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refresh_tokens.push({
    token_hash: hashToken(newRefreshToken),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await user.save();

  res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json(
    new ApiResponse(
  200,
  {
    access_token: newAccessToken,
    expires_in: 900,
  },
  'Token refreshed'
)
  );
});

// ─────────────────────────────────────────────
// LOGOUT
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refresh_token;

  if (token) {
    const tokenHash = hashToken(token);
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { refresh_tokens: { token_hash: tokenHash } },
    });
  }

  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// POST /api/v1/auth/forgot-password
// ─────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always return the same response, regardless of whether the email 
  // exists — prevents account enumeration
  if (user) {
    const resetToken = generateRandomToken();
    user.password_reset_token = hashToken(resetToken);
    user.password_reset_expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await user.save();

    // TODO: send `resetToken` via email — stubbed for development
    console.log(`[DEV ONLY] Password reset token for ${email}: ${resetToken}`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, 'If an account exists with this email, a reset link has been sent.')
    );
});

// ─────────────────────────────────────────────
// RESET PASSWORD
// POST /api/v1/auth/reset-password
// ─────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { reset_token, new_password } = req.body;

  const tokenHash = hashToken(reset_token);

  const user = await User.findOne({
    password_reset_token: tokenHash,
    password_reset_expires: { $gt: new Date() },
  }).select('+password_reset_token +password_reset_expires');

  if (!user) {
    throw new ApiError(401, 'Invalid or expired reset token');
  }

  user.password = new_password; // pre-save hook will hash it
  user.password_reset_token = undefined;
  user.password_reset_expires = undefined;
  user.refresh_tokens = []; // revoke all sessions on password reset
  await user.save();

  // TODO: send confirmation email that password was changed

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Password reset successful. Please log in with your new password.'));
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