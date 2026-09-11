/**
 * adminProperty.controller.js
 * -----------------------------------------------------------------------
 * Admin-side property moderation. ASSUMES Property.model.js exists per
 * the roadmap (Prompt 8B is marked done) with roughly these fields:
 *   title, price, location, listedBy (User ref), status
 *   ("pending" | "approved" | "rejected" | "flagged"), images[], createdAt
 *
 * If your actual field names differ, adjust the `select`/filter fields
 * below — the control flow doesn't change.
 * -----------------------------------------------------------------------
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Property } from "../models/Property.model.js";

/**
 * GET /api/v1/admin/properties
 * Query params: page, limit, status, search
 */
export const getAllProperties = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.title = { $regex: req.query.search.trim(), $options: "i" };
  }

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("listedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        properties,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
      "Properties fetched successfully"
    )
  );
});

/**
 * PATCH /api/v1/admin/properties/:propertyId/status
 * Body: { status: "approved" | "rejected" | "flagged" | "pending" }
 * Drives the listing-approval workflow (Settings.listingApprovalRequired).
 */
export const updatePropertyStatus = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "approved", "rejected", "flagged"];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowed.join(", ")}`);
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  property.status = status;
  await property.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { propertyId, status }, `Property marked ${status}`)
    );
});

/**
 * DELETE /api/v1/admin/properties/:propertyId
 */
export const deleteProperty = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const property = await Property.findByIdAndDelete(propertyId);
  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { propertyId }, "Property deleted successfully"));
});
