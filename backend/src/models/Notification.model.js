const mongoose = require("mongoose");

/**
 * Notification.model.js
 * Generic in-app notification, used for broker alerts (new lead, appointment
 * request, new review, trust score change, etc.) Recipient-agnostic so it can
 * be reused for buyers/admins later.
 */

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: {
      type: String,
      enum: [
        "new_lead",
        "lead_status_change",
        "appointment_requested",
        "appointment_confirmed",
        "appointment_cancelled",
        "appointment_reminder",
        "new_review",
        "review_reply",
        "trust_score_update",
        "listing_approved",
        "listing_flagged",
        "system",
      ],
      required: true,
    },

    title: { type: String, required: true, maxlength: 150 },
    message: { type: String, required: true, maxlength: 500 },

    relatedEntity: {
      entityType: { type: String, enum: ["Lead", "Appointment", "Review", "Property", "Broker", null], default: null },
      entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    },

    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },

    actionUrl: { type: String, default: null }, // frontend deep link, e.g. /broker/leads/:id
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
