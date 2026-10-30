
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },

    broker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    reviewer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// One buyer can review a particular property only once.
// Different buyers can review the same property.
// The same buyer can review different properties.
reviewSchema.index(
  {
    property_id: 1,
    reviewer_id: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);
