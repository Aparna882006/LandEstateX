const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const Settings = require("../models/Settings.model");

const BOOLEAN_FIELDS = [
  "maintenanceMode",
  "allowNewRegistrations",
  "requireEmailVerification",
  "listingApprovalRequired",
];

const NUMBER_FIELDS = [
  "maxPropertyImages",
  "fraudFlagPriceDeviationPercent",
  "fraudFlagMaxListingsPerDay",
];

// GET /api/v1/admin/settings
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ key: "global" });

  if (!settings) {
    settings = await Settings.create({
      key: "global",
    });
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      "Settings fetched successfully",
      settings
    )
  );
});

// PATCH /api/v1/admin/settings
const updateSettings = asyncHandler(async (req, res) => {
  const updates = {};

  for (const key of BOOLEAN_FIELDS) {
    if (req.body[key] !== undefined) {
      if (typeof req.body[key] !== "boolean") {
        return res.status(400).json(
          new ApiResponse(
            false,
            `${key} must be a boolean`
          )
        );
      }

      updates[key] = req.body[key];
    }
  }

  for (const key of NUMBER_FIELDS) {
    if (req.body[key] !== undefined) {
      const value = Number(req.body[key]);

      if (!Number.isFinite(value)) {
        return res.status(400).json(
          new ApiResponse(
            false,
            `${key} must be a valid number`
          )
        );
      }

      if (value < 0) {
        return res.status(400).json(
          new ApiResponse(
            false,
            `${key} cannot be negative`
          )
        );
      }

      if (
        key === "maxPropertyImages" ||
        key === "fraudFlagMaxListingsPerDay"
      ) {
        if (!Number.isInteger(value) || value < 1) {
          return res.status(400).json(
            new ApiResponse(
              false,
              `${key} must be a positive integer`
            )
          );
        }
      }

      if (
        key === "fraudFlagPriceDeviationPercent" &&
        value > 1000
      ) {
        return res.status(400).json(
          new ApiResponse(
            false,
            "Price deviation threshold cannot exceed 1000%"
          )
        );
      }

      updates[key] = value;
    }
  }

  const settings = await Settings.findOneAndUpdate(
    { key: "global" },
    {
      $set: {
        ...updates,
        updatedBy: req.user._id,
      },
      $setOnInsert: {
        key: "global",
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      "Settings updated successfully",
      settings
    )
  );
});

module.exports = {
  getSettings,
  updateSettings,
};