
/**
 * adminProperty.controller.js
 * Admin property management controller
 */

const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const Property = require("../models/Property.model");

// GET /api/v1/admin/properties
const getAllProperties = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "no-store");

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || 20, 1),
    100
  );

  const skip = (page - 1) * limit;
  const filter = {};

  // Optional status filter
  if (req.query.status) {
    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
      "sold",
      "deleted",
      "flagged",
    ];

    if (!allowedStatuses.includes(req.query.status)) {
      throw new ApiError(400, "Invalid property status filter");
    }

    filter.status = req.query.status;
  }

  // Optional keyword search
  if (req.query.search) {
    const search = String(req.query.search).trim();

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        {
          description: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          "location.address": {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          "location.city": {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }
  }

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("owner_id", "full_name email phone_number role")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Property.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(true, "Properties fetched successfully", {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  );
});

// PATCH /api/v1/admin/properties/:propertyId/status
const updatePropertyStatus = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { status, rejection_reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    throw new ApiError(400, "Invalid property ID");
  }

  const allowedStatuses = [
    "pending",
    "approved",
    "rejected",
    "flagged",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${allowedStatuses.join(", ")}`
    );
  }

  let rejectionReason = null;

  if (status === "rejected") {
    rejectionReason =
      typeof rejection_reason === "string"
        ? rejection_reason.trim()
        : "";

    if (!rejectionReason) {
      throw new ApiError(
        400,
        "A rejection reason is required when rejecting a property"
      );
    }

    if (rejectionReason.length > 1000) {
      throw new ApiError(
        400,
        "Rejection reason cannot exceed 1000 characters"
      );
    }
  }

  const update = {
    status,
    rejection_reason: status === "rejected" ? rejectionReason : null,
    is_fraud_flagged: status === "flagged",
  };

  const property = await Property.findByIdAndUpdate(
    propertyId,
    { $set: update },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("owner_id", "full_name email phone_number role")
    .lean();

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      `Property ${status} successfully`,
      property
    )
  );
});

// DELETE /api/v1/admin/properties/:propertyId
const deleteProperty = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    throw new ApiError(400, "Invalid property ID");
  }

  const property = await Property.findByIdAndDelete(propertyId);

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  return res.status(200).json(
    new ApiResponse(true, "Property deleted successfully", {
      propertyId: property._id,
    })
  );
});

module.exports = {
  getAllProperties,
  updatePropertyStatus,
  deleteProperty,
};
