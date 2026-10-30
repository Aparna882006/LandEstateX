
/**
 * admin.routes.js
 * All routes here are admin-only.
 */

const { Router } = require("express");

const {
  protect: verifyJWT,
} = require("../middlewares/auth.middleware");

const { restrictTo } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  verifyUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/admin.controller");

const {
  getAllProperties,
  updatePropertyStatus,
  deleteProperty,
} = require("../controllers/adminProperty.controller");

const {
  getAllBrokers,
  updateBrokerVerification,
  updateBrokerAccountStatus,
} = require("../controllers/adminBroker.controller");

const {
  getUserGrowth,
  getRoleDistribution,
  getFraudFlags,
} = require("../controllers/adminAnalytics.controller");

const {
  getSettings,
  updateSettings,
} = require("../controllers/adminSettings.controller");

const {
  userIdParamValidator,
  updateUserStatusValidator,
  updateUserRoleValidator,
} = require("../validators/admin.validator");

const router = Router();
console.log("[Admin Routes] admin.routes.js loaded");

// All routes require authentication and admin role.
router.use(verifyJWT, restrictTo("admin"));

// Dashboard
router.get("/dashboard-stats", getDashboardStats);

// User management
router.get("/users", getAllUsers);

router.get(
  "/users/:userId",
  userIdParamValidator,
  validate,
  getUserById
);

router.patch(
  "/users/:userId/status",
  updateUserStatusValidator,
  validate,
  updateUserStatus
);

router.patch(
  "/users/:userId/verify",
  userIdParamValidator,
  validate,
  verifyUser
);

router.patch(
  "/users/:userId/role",
  updateUserRoleValidator,
  validate,
  updateUserRole
);

router.delete(
  "/users/:userId",
  userIdParamValidator,
  validate,
  deleteUser
);

// Property moderation
router.get("/properties", getAllProperties);

router.patch(
  "/properties/:propertyId/status",
  updatePropertyStatus
);

router.delete(
  "/properties/:propertyId",
  deleteProperty
);

// Broker management
router.get("/brokers", getAllBrokers);

router.get("/__route-check", (req, res) => {
  res.json({ success: true, message: "Admin routes are mounted" });
});

router.patch(
  "/brokers/:brokerId/verification",
  updateBrokerVerification
);

router.patch(
  "/brokers/:brokerId/account-status",
  updateBrokerAccountStatus
);

// Analytics
router.get("/analytics/user-growth", getUserGrowth);

router.get("/analytics/role-distribution", getRoleDistribution);

// Fraud detection
router.get("/fraud/flags", getFraudFlags);

// Settings
router.get("/settings", getSettings);

router.patch("/settings", updateSettings);

module.exports = router;
