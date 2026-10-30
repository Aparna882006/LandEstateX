
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: [
        'exterior',
        'living_room',
        'bedroom',
        'kitchen',
        'bathroom',
        'balcony',
        'garden',
        'land',
        'aerial_view',
        'office_interior',
        'workspace',
        'other',
      ],
      default: 'other',
    },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 10,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 3000,
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

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 1,
    },

    ai_predicted_price: {
      type: Number,
      default: null,
    },

    area_sqft: {
      type: Number,
      required: [true, 'Area is required'],
      min: 1,
    },

    bedrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      locality: {
        type: String,
        trim: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    images: {
      type: [imageSchema],
      default: [],
    },

    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'sold',
        'deleted',
        'flagged',
      ],
      default: 'pending',
    },

    rejection_reason: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        'Rejection reason cannot exceed 1000 characters',
      ],
      default: null,
    },

    is_fraud_flagged: {
      type: Boolean,
      default: false,
    },

    views_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

propertySchema.index({
  'location.city': 1,
  price: 1,
  property_type: 1,
  status: 1,
});

propertySchema.index({
  'location.latitude': 1,
  'location.longitude': 1,
});

propertySchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text',
});

module.exports = mongoose.model('Property', propertySchema);
