const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      required: true,
    },

    // Feature toggles
    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    allowNewRegistrations: {
      type: Boolean,
      default: true,
    },

    requireEmailVerification: {
      type: Boolean,
      default: true,
    },

    // Marketplace rules
    maxPropertyImages: {
      type: Number,
      default: 15,
      min: 1,
    },

    listingApprovalRequired: {
      type: Boolean,
      default: true,
    },

    // Fraud thresholds
    fraudFlagPriceDeviationPercent: {
      type: Number,
      default: 60,
      min: 0,
      max: 1000,
    },

    fraudFlagMaxListingsPerDay: {
      type: Number,
      default: 10,
      min: 1,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);