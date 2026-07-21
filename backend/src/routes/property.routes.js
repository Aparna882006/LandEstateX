const express = require('express');
const router = express.Router();

const {
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyById,
  getAllProperties,
  searchProperties,
  getMyProperties,
  addPropertyImages,
  deletePropertyImage,
} = require('../controllers/property.controller');

const {
  createPropertyValidator,
  updatePropertyValidator,
  searchQueryValidator,
} = require('../validators/property.validator');

const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const optionalAuth = require('../middlewares/optionalAuth.middleware');
const upload = require('../middlewares/upload.middleware');

// Specific routes BEFORE dynamic :property_id routes to avoid route-matching conflicts
router.get('/search', searchQueryValidator, validate, searchProperties);
router.get('/my-properties', protect, getMyProperties);

router.post(
  '/',
  protect,
  restrictTo('seller', 'broker', 'builder'),
  upload.array('images', 20),
  createPropertyValidator,
  validate,
  createProperty
);

router.get('/', getAllProperties);
router.get('/:property_id', optionalAuth, getPropertyById);
router.put('/:property_id', protect, updatePropertyValidator, validate, updateProperty);
router.delete('/:property_id', protect, deleteProperty);

router.post('/:property_id/images', protect, upload.array('images', 20), addPropertyImages);
router.delete('/:property_id/images/:image_id', protect, deletePropertyImage);

module.exports = router;