/**
 * adminSettings.controller.js
 * Get/update the single global Settings document.
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Settings } from "../models/Settings.model.js";

/**
 * GET /api/v1/admin/settings
 * Returns the global settings doc, creating it with defaults if missing.
 */
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ key: "global" });
  if (!settings) {
    settings = await Settings.create({ key: "global" });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, settings, "Settings fetched successfully"));
});

/**
 * PATCH /api/v1/admin/settings
 * Body: any subset of the Settings schema fields (excluding key/_id).
 */
export const updateSettings = asyncHandler(async (req, res) => {
  const disallowed = ["_id", "key", "createdAt", "updatedAt"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => !disallowed.includes(k))
  );

  const settings = await Settings.findOneAndUpdate(
    { key: "global" },
    { ...updates, updatedBy: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, settings, "Settings updated successfully"));
});
