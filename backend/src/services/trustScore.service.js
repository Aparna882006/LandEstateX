const Broker = require("../models/Broker.model");
const Review = require("../models/Review.model");
const Lead = require("../models/Lead.model");

/**
 * trustScore.service.js
 * Recomputes a broker's trust score from live data (reviews, deal conversion,
 * verification status) and persists it on the Broker document.
 *
 * Weighting (matches Broker.model.js trustScoreBreakdown caps):
 *   verifiedIdentity   -> 20 pts flat if licenseVerified/isVerified
 *   responseRate       -> 20 pts, derived from % leads contacted within SLA proxy
 *   dealSuccessRate     -> 25 pts, won leads / total leads
 *   reviewScore         -> 25 pts, avg rating scaled from 5 -> 25
 *   fraudFlagsPenalty   -> 0 to -20, currently manual/admin-set (not auto here)
 */
const recalculateBrokerTrustScore = async (brokerId) => {
  const broker = await Broker.findById(brokerId);
  if (!broker) return null;

  // Verified identity (flat)
  const verifiedIdentity = broker.licenseVerified && broker.isVerified ? 20 : broker.isVerified ? 10 : 0;

  // Deal success rate
  const totalLeads = await Lead.countDocuments({ broker: brokerId });
  const wonLeads = await Lead.countDocuments({ broker: brokerId, status: "won" });
  const dealSuccessRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 25) : 0;

  // Response rate: % of leads that have at least one activity logged (proxy for "contacted")
  const contactedLeads = await Lead.countDocuments({
    broker: brokerId,
    status: { $ne: "new" },
  });
  const responseRate = totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 20) : 0;

  // Review score
  const reviewAgg = await Review.aggregate([
    { $match: { broker: broker._id, isHidden: false } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avgRating = reviewAgg.length ? reviewAgg[0].avgRating : 0;
  const reviewCount = reviewAgg.length ? reviewAgg[0].count : 0;
  const reviewScore = Math.round((avgRating / 5) * 25);

  broker.trustScoreBreakdown = {
    verifiedIdentity,
    responseRate,
    dealSuccessRate,
    reviewScore,
    fraudFlagsPenalty: broker.trustScoreBreakdown?.fraudFlagsPenalty || 0,
  };
  broker.stats.avgRating = Math.round(avgRating * 10) / 10;
  broker.stats.reviewCount = reviewCount;
  broker.stats.totalLeads = totalLeads;
  broker.stats.convertedLeads = wonLeads;

  broker.recalculateTrustScore();
  await broker.save();

  return broker;
};

module.exports = { recalculateBrokerTrustScore };
