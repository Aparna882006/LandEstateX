/**
 * adminProperty.controller.js
 * Admin-side property moderation
 */

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const Property = require('../models/Property.model');

// GET /api/v1/admin/properties
const getAllProperties = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    filter.title = {
      $regex: req.query.search.trim(),
      $options: 'i',
    };
  }

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate('listedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Property.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      true,
      'Properties fetched successfully',
      {
        properties,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    )
  );
});

// PATCH /api/v1/admin/properties/:propertyId/status
const updatePropertyStatus = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { status } = req.body;

  const allowed = [
    'pending',
    'approved',
    'rejected',
    'flagged',
  ];

  if (!allowed.includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${allowed.join(', ')}`
    );
  }

  const property = await Property.findById(propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  property.status = status;

  await property.save({
    validateBeforeSave: false,
  });

  return res.status(200).json(
    new ApiResponse(
      true,
      `Property marked ${status}`,
      {
        propertyId,
        status,
      }
    )
  );
});

// DELETE /api/v1/admin/properties/:propertyId
const deleteProperty = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const property = await Property.findByIdAndDelete(propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      'Property deleted successfully',
      {
        propertyId,
      }
    )
  );
});

module.exports = {
  getAllProperties,
  updatePropertyStatus,
  deleteProperty,
};