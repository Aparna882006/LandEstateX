const mongoose = require("mongoose");

/**
 * Review.model.js
 * Customer reviews of a broker, optionally tied to a specific property/deal.
 * Feeds into Broker.stats.avgRating and the trustScore.reviewScore component.
 */

const reviewSchema = new mongoose.Schema(
  {
    broker: { type: mongoose.Schema.Types.ObjectId, ref: "Broker", required: true, index: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },

    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 120 },
    comment: { type: String, maxlength: 1500 },

    dealType: { type: String, enum: ["purchase", "sale", "rental", "consultation", null], default: null },

    brokerReply: {
      text: { type: String, maxlength: 1000 },
      repliedAt: { type: Date, default: null },
    },

    isVerifiedDeal: { type: Boolean, default: false }, // true if linked to a "won" lead/appointment
    isFlagged: { type: Boolean, default: false }, // flagged for moderation (abuse/fraud)
    isHidden: { type: Boolean, default: false }, // hidden by admin after moderation

    helpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ broker: 1, createdAt: -1 });
reviewSchema.index({ broker: 1, rating: 1 });
// One review per reviewer per broker (edit instead of duplicate)
reviewSchema.index({ broker: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
