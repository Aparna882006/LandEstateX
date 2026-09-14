/**
 * adminSettings.controller.js
 * Get/update the single global Settings document.
 */

/**
 * adminSettings.controller.js
 * Get/update the single global Settings document.
 */

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const Settings = require('../models/Settings.model');

// GET /api/v1/admin/settings
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ key: 'global' });

  if (!settings) {
    settings = await Settings.create({
      key: 'global',
    });
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      'Settings fetched successfully',
      settings
    )
  );
});

// PATCH /api/v1/admin/settings
const updateSettings = asyncHandler(async (req, res) => {
  const disallowed = [
    '_id',
    'key',
    'createdAt',
    'updatedAt',
  ];

  const updates = Object.fromEntries(
    Object.entries(req.body).filter(
      ([key]) => !disallowed.includes(key)
    )
  );

  const settings = await Settings.findOneAndUpdate(
    { key: 'global' },
    {
      ...updates,
      updatedBy: req.user._id,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      'Settings updated successfully',
      settings
    )
  );
});

module.exports = {
  getSettings,
  updateSettings,
};