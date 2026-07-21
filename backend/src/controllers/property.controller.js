const Property = require('../models/Property.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

// ─────────────────────────────────────────────
// CREATE PROPERTY
// POST /api/v1/properties
// ─────────────────────────────────────────────
const createProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    property_type,
    listing_type,
    price,
    area_sqft,
    bedrooms,
    bathrooms,
    location,
    amenities,
  } = req.body;

  const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
  const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;

  const images = (req.files || []).map((file, index) => ({
    url: file.path,
    public_id: file.filename,
    is_primary: index === 0,
  }));

  const property = await Property.create({
    owner_id: req.user.id,
    title,
    description,
    property_type,
    listing_type,
    price,
    area_sqft,
    bedrooms,
    bathrooms,
    location: parsedLocation,
    amenities: parsedAmenities || [],
    images,
    status: 'pending',
  });

  return res
    .status(201)
    .json(new ApiResponse(true, 'Property submitted for review', { property_id: property._id, status: property.status }));
});

// ─────────────────────────────────────────────
// UPDATE PROPERTY
// PUT /api/v1/properties/:property_id
// ─────────────────────────────────────────────
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.property_id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.owner_id.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to edit this property');
  }

  if (property.status === 'sold') {
    throw new ApiError(409, 'Cannot edit a property that has already been sold');
  }

  const editableFields = [
    'title',
    'description',
    'price',
    'area_sqft',
    'bedrooms',
    'bathrooms',
    'amenities',
  ];

  const materialFields = ['price', 'area_sqft', 'location'];
  let resetToPending = false;

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      property[field] = req.body[field];
      if (materialFields.includes(field)) resetToPending = true;
    }
  });

  if (req.body.location) {
    property.location = { ...property.location.toObject(), ...req.body.location };
    resetToPending = true;
  }

  if (resetToPending && property.status === 'approved') {
    property.status = 'pending';
  }

  await property.save();

  return res
    .status(200)
    .json(new ApiResponse(true, 'Property updated successfully', { property_id: property._id, status: property.status }));
});

// ─────────────────────────────────────────────
// DELETE PROPERTY (soft delete)
// DELETE /api/v1/properties/:property_id
// ─────────────────────────────────────────────
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.property_id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.owner_id.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to delete this property');
  }

  property.status = 'deleted';
  await property.save();

  return res.status(200).json(new ApiResponse(true, 'Property removed'));
});

// ─────────────────────────────────────────────
// GET PROPERTY DETAILS
// GET /api/v1/properties/:property_id
// ─────────────────────────────────────────────
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.property_id).populate(
    'owner_id',
    'full_name role'
  );

  if (!property || property.status === 'deleted') {
    throw new ApiError(404, 'Property not found');
  }

  const isOwner = req.user && property.owner_id._id.toString() === req.user.id;
  const isAdmin = req.user && req.user.role === 'admin';

  if (property.status !== 'approved' && !isOwner && !isAdmin) {
    throw new ApiError(404, 'Property not found');
  }

  property.views_count += 1;
  await property.save();

  return res.status(200).json(new ApiResponse(true, 'Property fetched', property));
});

// ─────────────────────────────────────────────
// GET ALL PROPERTIES (base feed)
// GET /api/v1/properties
// ─────────────────────────────────────────────
const getAllProperties = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const sort = req.query.sort || 'newest';

  const sortMap = {
    newest: { created_at: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    most_viewed: { views_count: -1 },
  };

  const filter = { status: 'approved' };

  const [properties, totalCount] = await Promise.all([
    Property.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(true, 'Properties fetched', {
      properties,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
      },
    })
  );
});

// ─────────────────────────────────────────────
// SEARCH & FILTER PROPERTIES
// GET /api/v1/properties/search
// ─────────────────────────────────────────────
const searchProperties = asyncHandler(async (req, res) => {
  const {
    q,
    city,
    min_price,
    max_price,
    property_type,
    listing_type,
    bedrooms,
    min_area,
    max_area,
    amenities,
    sort,
  } = req.query;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  const filter = { status: 'approved' };

  if (q) {
    filter.$text = { $search: q };
  }
  if (city) {
    filter['location.city'] = new RegExp(city, 'i');
  }
  if (property_type) {
    filter.property_type = property_type;
  }
  if (listing_type) {
    filter.listing_type = listing_type;
  }
  if (bedrooms) {
    filter.bedrooms = { $gte: parseInt(bedrooms, 10) };
  }
  if (min_price || max_price) {
    filter.price = {};
    if (min_price) filter.price.$gte = parseFloat(min_price);
    if (max_price) filter.price.$lte = parseFloat(max_price);
  }
  if (min_area || max_area) {
    filter.area_sqft = {};
    if (min_area) filter.area_sqft.$gte = parseFloat(min_area);
    if (max_area) filter.area_sqft.$lte = parseFloat(max_area);
  }
  if (amenities) {
    const amenityList = Array.isArray(amenities) ? amenities : [amenities];
    filter.amenities = { $all: amenityList };
  }

  const sortMap = {
    newest: { created_at: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    relevance: q ? { score: { $meta: 'textScore' } } : { created_at: -1 },
  };

  let query = Property.find(filter);
  if (q) {
    query = query.select({ score: { $meta: 'textScore' } });
  }

  const [properties, totalCount] = await Promise.all([
    query
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(true, 'Search results fetched', {
      properties,
      applied_filters: req.query,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
      },
    })
  );
});

// ─────────────────────────────────────────────
// GET MY PROPERTIES (owner-scoped, includes all statuses)
// GET /api/v1/properties/my-properties
// ─────────────────────────────────────────────
const getMyProperties = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  const filter = { owner_id: req.user.id, status: { $ne: 'deleted' } };
  if (status) filter.status = status;

  const [properties, totalCount] = await Promise.all([
    Property.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(true, 'Your properties fetched', {
      properties,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
      },
    })
  );
});

// ─────────────────────────────────────────────
// ADD IMAGES TO EXISTING PROPERTY
// POST /api/v1/properties/:property_id/images
// ─────────────────────────────────────────────
const addPropertyImages = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.property_id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }
  if (property.owner_id.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not have permission to modify this property');
  }
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No images provided');
  }

  const newImages = req.files.map((file) => ({
    url: file.path,
    public_id: file.filename,
    is_primary: property.images.length === 0,
  }));

  property.images.push(...newImages);
  await property.save();

  return res.status(201).json(new ApiResponse(true, 'Images added', { images: property.images }));
});

// ─────────────────────────────────────────────
// DELETE A PROPERTY IMAGE
// DELETE /api/v1/properties/:property_id/images/:image_id
// ─────────────────────────────────────────────
const deletePropertyImage = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.property_id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }
  if (property.owner_id.toString() !== req.user.id) {
    throw new ApiError(403, 'You do not have permission to modify this property');
  }

  const image = property.images.id(req.params.image_id);
  if (!image) {
    throw new ApiError(404, 'Image not found');
  }

  await cloudinary.uploader.destroy(image.public_id);
  image.deleteOne();
  await property.save();

  return res.status(200).json(new ApiResponse(true, 'Image removed'));
});

module.exports = {
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyById,
  getAllProperties,
  searchProperties,
  getMyProperties,
  addPropertyImages,
  deletePropertyImage,
};