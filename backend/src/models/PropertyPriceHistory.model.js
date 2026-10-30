const mongoose = require('mongoose');

const propertyPriceHistorySchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },
    captured_at: {
      type: Date,
      required: true,
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
    },
    property_type: {
      type: String,
      enum: ['apartment', 'villa', 'plot', 'commercial'],
      required: true,
    },
    listing_type: {
      type: String,
      enum: ['sale', 'rent'],
      required: true,
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
    timestamps: true,
  }
);

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
