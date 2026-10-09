const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
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

reviewSchema.index(
  {
    broker_id: 1,
    reviewer_id: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);