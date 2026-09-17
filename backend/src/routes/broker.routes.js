const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { restrictTo } = require("../middlewares/role.middleware");
const {
  createBrokerProfile,
  getMyBrokerProfile,
  updateMyBrokerProfile,
  getPublicBrokerProfile,
  getDashboardSummary,
  recalculateTrustScore,
  getMyTrustScore,
} = require("../controllers/broker.controller");

const router = express.Router();

// Public
router.get("/:brokerId", getPublicBrokerProfile);

// Broker-only
router.use(verifyJWT, restrictTo("broker", "admin"));

router.post("/profile", createBrokerProfile);
router.get("/profile/me", getMyBrokerProfile);
router.patch("/profile/me", updateMyBrokerProfile);

router.get("/dashboard/summary", getDashboardSummary);

router.get("/trust-score/me", getMyTrustScore);
router.post("/trust-score/recalculate", recalculateTrustScore);

module.exports = router;
