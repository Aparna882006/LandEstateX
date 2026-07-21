const { body, query } = require('express-validator');

const createPropertyValidator = [
  body('title').trim().isLength({ min: 10, max: 150 }).withMessage('Title must be 10-150 characters'),
  body('description').trim().isLength({ min: 20, max: 3000 }).withMessage('Description must be at least 20 characters'),
  body('property_type').isIn(['apartment', 'villa', 'plot', 'commercial']).withMessage('Invalid property type'),
  body('listing_type').isIn(['sale', 'rent']).withMessage('Invalid listing type'),
  body('price').isFloat({ min: 1 }).withMessage('Price must be a positive number'),
  body('area_sqft').isFloat({ min: 1 }).withMessage('Area must be a positive number'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];

const updatePropertyValidator = [
  body('title').optional().trim().isLength({ min: 10, max: 150 }),
  body('description').optional().trim().isLength({ min: 20, max: 3000 }),
  body('price').optional().isFloat({ min: 1 }),
  body('area_sqft').optional().isFloat({ min: 1 }),
];

const searchQueryValidator = [
  query('min_price').optional().isFloat({ min: 0 }).withMessage('Invalid min_price'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('Invalid max_price'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

module.exports = { createPropertyValidator, updatePropertyValidator, searchQueryValidator };