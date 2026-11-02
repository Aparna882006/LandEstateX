
const mongoose = require('mongoose');

const propertyPriceHistorySchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },

    captured_at: {
      type: Date,
      required: true,
      default: Date.now,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    city_key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    locality: {
      type: String,
      default: '',
      trim: true,
    },

    locality_key: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },

    property_type: {
      type: String,
      required: true,
      enum: ['apartment', 'villa', 'plot', 'commercial'],
    },

    listing_type: {
      type: String,
      required: true,
      enum: ['sale', 'rent'],
    },

    sample_count: {
      type: Number,
      required: true,
      min: 1,
    },

    average_price: {
      type: Number,
      required: true,
      min: 0,
    },

    median_price: {
      type: Number,
      required: true,
      min: 0,
    },

    median_price_per_sqft: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// One snapshot per month for each market segment.
propertyPriceHistorySchema.index(
  {
    month: 1,
    city_key: 1,
    locality_key: 1,
    property_type: 1,
    listing_type: 1,
  },
  {
    unique: true,
  }
);

// Efficient historical market lookups.
propertyPriceHistorySchema.index({
  city_key: 1,
  locality_key: 1,
  property_type: 1,
  listing_type: 1,
  month: 1,
});

module.exports = mongoose.model(
  'PropertyPriceHistory',
  propertyPriceHistorySchema
);
