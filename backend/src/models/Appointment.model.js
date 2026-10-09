const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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

    scheduled_at: {
      type: Date,
      required: [true, 'Scheduled date/time is required'],
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },

    notes: {
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

appointmentSchema.index({
  broker_id: 1,
  status: 1,
});

appointmentSchema.index({
  broker_id: 1,
  scheduled_at: 1,
});

module.exports = mongoose.model('Appointment', appointmentSchema);