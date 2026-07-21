const Wishlist = require('../models/Wishlist.model');
const Property = require('../models/Property.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/v1/wishlist  (toggle add/remove)
const toggleWishlist = asyncHandler(async (req, res) => {
  const { property_id } = req.body;

  const property = await Property.findById(property_id);
  if (!property || property.status !== 'approved') {
    throw new ApiError(404, 'Property not found');
  }

  const existing = await Wishlist.findOne({ user_id: req.user.id, property_id });

  if (existing) {
    await existing.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(true, 'Removed from wishlist', { is_wishlisted: false }));
  }

  await Wishlist.create({ user_id: req.user.id, property_id });
  return res
    .status(201)
    .json(new ApiResponse(true, 'Added to wishlist', { is_wishlisted: true }));
});

// GET /api/v1/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  const [items, totalCount] = await Promise.all([
    Wishlist.find({ user_id: req.user.id })
      .populate('property_id')
      .sort({ added_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Wishlist.countDocuments({ user_id: req.user.id }),
  ]);

  const properties = items
    .filter((item) => item.property_id)
    .map((item) => ({
      wishlist_id: item._id,
      added_at: item.added_at,
      property: item.property_id,
    }));

  return res.status(200).json(
    new ApiResponse(true, 'Wishlist fetched', {
      items: properties,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
      },
    })
  );
});

// DELETE /api/v1/wishlist/:property_id
const removeFromWishlist = asyncHandler(async (req, res) => {
  const result = await Wishlist.findOneAndDelete({
    user_id: req.user.id,
    property_id: req.params.property_id,
  });

  if (!result) {
    throw new ApiError(404, 'This property is not in your wishlist');
  }

  return res.status(200).json(new ApiResponse(true, 'Removed from wishlist'));
});

module.exports = { toggleWishlist, getWishlist, removeFromWishlist };