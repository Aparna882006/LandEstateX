const mongoose = require('mongoose');

const brokerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    experience_years: {
      type: Number,
      min: 0,
      max: 60,
      default: 0,
    },

    specialties: [
      {
        type: String,
        trim: true,
      },
    ],

    languages: [
      {
        type: String,
        trim: true,
      },
    ],

    location: {
      city: {
        type: String,
        trim: true,
        default: '',
      },
      locality: {
        type: String,
        trim: true,
        default: '',
      },
    },

    agency_name: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },

    license_number: {
      type: String,
      trim: true,
      default: '',
    },

    verification_status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    review_count: {
      type: Number,
      min: 0,
      default: 0,
    },

    trust_score: {
      type: Number,
      min: 0,
      max: 100,
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

module.exports = mongoose.model('Broker', brokerSchema);