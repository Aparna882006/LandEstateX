const mongoose = require("mongoose");

/**
 * Broker.model.js
 * Extends a User (role: 'broker') with broker-specific profile data,
 * trust score components, and aggregate stats used across the Broker Dashboard.
 */

const trustScoreBreakdownSchema = new mongoose.Schema(
  {
    verifiedIdentity: { type: Number, default: 0, min: 0, max: 20 }, // KYC/doc verification
    responseRate: { type: Number, default: 0, min: 0, max: 20 }, // speed/consistency replying to leads
    dealSuccessRate: { type: Number, default: 0, min: 0, max: 25 }, // closed vs listed
    reviewScore: { type: Number, default: 0, min: 0, max: 25 }, // weighted avg customer review rating
    fraudFlagsPenalty: { type: Number, default: 0, min: -20, max: 0 }, // negative contribution
  },
  { _id: false }
);

const brokerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    agencyName: { type: String, trim: true, maxlength: 120 },
    licenseNumber: { type: String, trim: true },
    licenseVerified: { type: Boolean, default: false },
    bio: { type: String, maxlength: 1000 },
    yearsOfExperience: { type: Number, default: 0, min: 0 },
    serviceAreas: [{ type: String, trim: true }], // e.g. ["Noida", "Greater Noida West"]
    specializations: [
      { type: String, enum: ["residential", "commercial", "rental", "luxury", "industrial", "land"] },
    ],
    profileImage: { type: String, default: null }, // Cloudinary URL
    contactPhone: { type: String, trim: true },
    contactEmailPublic: { type: String, trim: true, lowercase: true },

    // --- Trust Score ---
    trustScore: { type: Number, default: 0, min: 0, max: 100, index: true },
    trustScoreBreakdown: { type: trustScoreBreakdownSchema, default: () => ({}) },
    trustScoreLastCalculatedAt: { type: Date, default: null },
    trustBadge: {
      type: String,
      enum: ["unranked", "bronze", "silver", "gold", "platinum"],
      default: "unranked",
    },

    // --- Aggregate stats (denormalized for fast dashboard reads) ---
    stats: {
      totalListings: { type: Number, default: 0 },
      activeListings: { type: Number, default: 0 },
      soldOrRentedCount: { type: Number, default: 0 },
      totalLeads: { type: Number, default: 0 },
      convertedLeads: { type: Number, default: 0 },
      totalAppointments: { type: Number, default: 0 },
      completedAppointments: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0, min: 0, max: 5 },
      reviewCount: { type: Number, default: 0 },
      profileViews: { type: Number, default: 0 },
    },

    isVerified: { type: Boolean, default: false }, // admin-approved broker account
    isActive: { type: Boolean, default: true }, // can be suspended
    suspensionReason: { type: String, default: null },
  },
  { timestamps: true }
);

brokerSchema.index({ trustScore: -1 });
brokerSchema.index({ serviceAreas: 1 });
brokerSchema.index({ isVerified: 1, isActive: 1 });

/** Recompute the 0-100 trustScore from breakdown components and set the badge tier. */
brokerSchema.methods.recalculateTrustScore = function () {
  const b = this.trustScoreBreakdown;
  const raw =
    (b.verifiedIdentity || 0) +
    (b.responseRate || 0) +
    (b.dealSuccessRate || 0) +
    (b.reviewScore || 0) +
    (b.fraudFlagsPenalty || 0);

  this.trustScore = Math.max(0, Math.min(100, raw));
  this.trustScoreLastCalculatedAt = new Date();

  if (this.trustScore >= 90) this.trustBadge = "platinum";
  else if (this.trustScore >= 75) this.trustBadge = "gold";
  else if (this.trustScore >= 50) this.trustBadge = "silver";
  else if (this.trustScore >= 25) this.trustBadge = "bronze";
  else this.trustBadge = "unranked";

  return this.trustScore;
};

module.exports = mongoose.model("Broker", brokerSchema);
