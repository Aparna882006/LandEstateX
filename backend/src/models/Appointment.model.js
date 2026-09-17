const mongoose = require("mongoose");

/**
 * Appointment.model.js
 * Site visits / meetings between a buyer and a broker for a specific property.
 */

const appointmentSchema = new mongoose.Schema(
  {
    broker: { type: mongoose.Schema.Types.ObjectId, ref: "Broker", required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },

    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 30 },
    mode: { type: String, enum: ["site_visit", "video_call", "phone_call", "office_visit"], default: "site_visit" },
    location: { type: String, trim: true }, // free text address/link, denormalized from property if site_visit

    status: {
      type: String,
      enum: ["requested", "confirmed", "rescheduled", "completed", "cancelled", "no_show"],
      default: "requested",
      index: true,
    },
    cancelledBy: { type: String, enum: ["broker", "buyer", "system", null], default: null },
    cancellationReason: { type: String, default: null },

    buyerNotes: { type: String, maxlength: 500 },
    brokerNotes: { type: String, maxlength: 500 },

    reminderSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

appointmentSchema.index({ broker: 1, scheduledAt: 1 });
appointmentSchema.index({ broker: 1, status: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
