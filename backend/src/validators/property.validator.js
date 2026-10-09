const { body, query } = require('express-validator');

const createPropertyValidator = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 150 })
    .withMessage('Title must be 10-150 characters'),

  body('description')
    .trim()
    .isLength({ min: 20, max: 3000 })
    .withMessage('Description must be at least 20 characters'),

  body('property_type')
    .isIn(['apartment', 'villa', 'plot', 'commercial'])
    .withMessage('Invalid property type'),

  body('listing_type')
    .isIn(['sale', 'rent'])
    .withMessage('Invalid listing type'),

  body('price')
    .isFloat({ min: 1 })
    .withMessage('Price must be a positive number'),

  body('area_sqft')
    .isFloat({ min: 1 })
    .withMessage('Area must be a positive number'),

  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),

  body('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),

  body('location')
    .custom((value) => {
      let location = value;

      if (typeof value === 'string') {
        try {
          location = JSON.parse(value);
        } catch (error) {
          throw new Error('Invalid location format');
        }
      }

      if (!location || typeof location !== 'object') {
        throw new Error('Location is required');
      }

      if (
        typeof location.address !== 'string' ||
        !location.address.trim()
      ) {
        throw new Error('Address is required');
      }

      if (
        typeof location.city !== 'string' ||
        !location.city.trim()
      ) {
        throw new Error('City is required');
      }

      const latitude = Number(location.latitude);
      const longitude = Number(location.longitude);

      if (
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        throw new Error('Invalid latitude');
      }

      if (
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new Error('Invalid longitude');
      }

      return true;
    }),

  body('amenities')
    .optional(),

];

const updatePropertyValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 150 }),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 3000 }),

  body('price')
    .optional()
    .isFloat({ min: 1 }),

  body('area_sqft')
    .optional()
    .isFloat({ min: 1 }),
];

const searchQueryValidator = [
  query('min_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Invalid min_price'),

  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Invalid max_price'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

module.exports = {
  createPropertyValidator,
  updatePropertyValidator,
  searchQueryValidator,
};