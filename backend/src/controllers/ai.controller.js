
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  predictPropertyPrice,
} = require('../services/aiGateway.service');

const predictPrice = asyncHandler(async (req, res) => {
  const {
    property_type,
    listing_type,
    area_sqft,
    bedrooms,
    bathrooms,
    city,
    locality,
  } = req.body;

  if (
    typeof property_type !== 'string' ||
    !property_type.trim() ||
    typeof listing_type !== 'string' ||
    !listing_type.trim() ||
    typeof city !== 'string' ||
    !city.trim() ||
    typeof locality !== 'string' ||
    !locality.trim()
  ) {
    throw new ApiError(
      400,
      'property_type, listing_type, city and locality are required.'
    );
  }

  for (const [field, value] of Object.entries({
    area_sqft,
    bedrooms,
    bathrooms,
  })) {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0
    ) {
      throw new ApiError(
        400,
        `${field} must be a non-negative number.`
      );
    }
  }

  if (area_sqft <= 0) {
    throw new ApiError(400, 'area_sqft must be greater than zero.');
  }

  const prediction = await predictPropertyPrice({
    property_type: property_type.trim(),
    listing_type: listing_type.trim(),
    area_sqft,
    bedrooms,
    bathrooms,
    city: city.trim(),
    locality: locality.trim(),
  });

  return res.status(200).json(
    new ApiResponse(
      true,
      'Property price prediction generated.',
      prediction
    )
  );
});

module.exports = { predictPrice };
