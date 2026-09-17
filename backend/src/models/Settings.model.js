/**
 * Settings.model.js
 * Single-document collection holding site-wide, admin-editable settings.
 * Read via findOne({ key: "global" }) — upsert on save so there's always
 * exactly one settings doc.
 */

import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },

    // Feature toggles
    maintenanceMode: { type: Boolean, default: false },
    allowNewRegistrations: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: true },

    // Marketplace rules
    maxPropertyImages: { type: Number, default: 15 },
    listingApprovalRequired: { type: Boolean, default: true }, // if true, new listings need admin approval before going live

    // Fraud/abuse thresholds
    fraudFlagPriceDeviationPercent: { type: Number, default: 60 }, // flag listing if price deviates this much from area average
    fraudFlagMaxListingsPerDay: { type: Number, default: 10 }, // flag a user posting more than this many listings/day

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Settings = mongoose.model("Settings", settingsSchema);
