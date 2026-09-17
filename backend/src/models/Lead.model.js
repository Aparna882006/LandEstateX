const mongoose = require("mongoose");

/**
 * Lead.model.js
 * A "lead" is created whenever a buyer expresses interest in a broker's
 * property (contact form, wishlist + "request info", appointment request, etc.)
 * Brokers manage these through a pipeline of statuses (like a mini CRM).
 */

const leadActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["note", "call", "email", "whatsapp", "status_change", "meeting"],
      required: true,
    },
    note: { type: String, maxlength: 1000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    broker: { type: mongoose.Schema.Types.ObjectId, ref: "Broker", required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    buyerName: { type: String, trim: true }, // denormalized snapshot in case buyer edits profile later
    buyerPhone: { type: String, trim: true },
    buyerEmail: { type: String, trim: true, lowercase: true },

    source: {
      type: String,
      enum: ["contact_form", "wishlist", "appointment_request", "chatbot", "manual", "referral"],
      default: "contact_form",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "negotiating", "won", "lost"],
      default: "new",
      index: true,
    },
    lostReason: { type: String, default: null },

    budgetMin: { type: Number, default: null },
    budgetMax: { type: Number, default: null },
    message: { type: String, maxlength: 2000 },

    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    lastContactedAt: { type: Date, default: null },
    nextFollowUpAt: { type: Date, default: null },

    activities: [leadActivitySchema],
  },
  { timestamps: true }
);

leadSchema.index({ broker: 1, status: 1, createdAt: -1 });
leadSchema.index({ broker: 1, nextFollowUpAt: 1 });

module.exports = mongoose.model("Lead", leadSchema);
