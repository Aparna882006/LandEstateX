
const express = require('express');

const router = express.Router();

const {
  toggleWishlist,
  getWishlist,
  removeFromWishlist,
} = require('../controllers/wishlist.controller');

const { protect } = require('../middlewares/auth.middleware');

// Authentication required for all wishlist routes
router.use(protect);

// POST /api/v1/wishlist
router.post('/', toggleWishlist);

// GET /api/v1/wishlist
router.get('/', getWishlist);

// DELETE /api/v1/wishlist/:property_id
router.delete('/:property_id', removeFromWishlist);

module.exports = router;
