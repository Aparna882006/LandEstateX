const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone_number: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never returned by default in queries
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'broker', 'builder', 'investor', 'admin'],
      default: 'buyer',
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'blocked', 'pending'],
      default: 'pending',
    },

    // Email verification
    email_verification_otp: { type: String, select: false },
    email_verification_expires: { type: Date, select: false },

    // Password reset
    password_reset_token: { type: String, select: false },
    password_reset_expires: { type: Date, select: false },

    // Refresh token tracking (for revocation)
    refresh_tokens: [
      {
        token_hash: { type: String },
        expires_at: { type: Date },
        created_at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Hash password before saving, only if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never expose sensitive fields when converting to JSON
userSchema.methods.toSafeObject = function () {
  return {
    user_id: this._id,
    full_name: this.full_name,
    email: this.email,
    phone_number: this.phone_number,
    role: this.role,
    is_verified: this.is_verified,
    status: this.status,
    created_at: this.created_at,
  };
};

module.exports = mongoose.model('User', userSchema);