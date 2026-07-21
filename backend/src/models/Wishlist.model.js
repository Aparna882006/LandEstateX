const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
  },
  { timestamps: { createdAt: 'added_at', updatedAt: false } }
);

wishlistSchema.index({ user_id: 1, property_id: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);