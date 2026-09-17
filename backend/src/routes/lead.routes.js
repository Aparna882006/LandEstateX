const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { restrictTo } = require("../middlewares/role.middleware");
const {
  createLead,
  getMyLeads,
  getLeadById,
  updateLeadStatus,
  updateLead,
  addLeadActivity,
  deleteLead,
} = require("../controllers/lead.controller");

const router = express.Router();

router.use(verifyJWT);

// Buyer-facing: submit interest (any authenticated user)
router.post("/", createLead);

// Broker-facing: manage own leads
router.get("/broker/my-leads", restrictTo("broker", "admin"), getMyLeads);
router.get("/broker/:id", restrictTo("broker", "admin"), getLeadById);
router.patch("/broker/:id/status", restrictTo("broker", "admin"), updateLeadStatus);
router.patch("/broker/:id", restrictTo("broker", "admin"), updateLead);
router.post("/broker/:id/activities", restrictTo("broker", "admin"), addLeadActivity);
router.delete("/broker/:id", restrictTo("broker", "admin"), deleteLead);

module.exports = router;
