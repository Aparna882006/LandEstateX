
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    broker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },

    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },

    last_contacted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Ek buyer aur property ke liye broker ka ek hi lead record.
leadSchema.index(
  { broker_id: 1, buyer_id: 1, property_id: 1 },
  { unique: true }
);

leadSchema.index({ broker_id: 1, status: 1, created_at: -1 });

module.exports = mongoose.model('Lead', leadSchema);
