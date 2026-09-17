const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { restrictTo } = require("../middlewares/role.middleware");
const {
  createReview,
  getBrokerReviews,
  getMyReviews,
  replyToReview,
  flagReview,
} = require("../controllers/review.controller");

const router = express.Router();

// Public
router.get("/brokers/:brokerId/reviews", getBrokerReviews);

// Authenticated buyer
router.post("/brokers/:brokerId/reviews", verifyJWT, createReview);
router.post("/reviews/:id/flag", verifyJWT, flagReview);

// Broker-only
router.get("/broker/reviews/me", verifyJWT, restrictTo("broker", "admin"), getMyReviews);
router.post("/broker/reviews/:id/reply", verifyJWT, restrictTo("broker", "admin"), replyToReview);

module.exports = router;
