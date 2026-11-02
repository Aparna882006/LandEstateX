
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

// ---------------------------------------------
// ADMIN CONTROLLERS
// ---------------------------------------------
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  verifyUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/admin.controller");

// ---------------------------------------------
// PROPERTY CONTROLLERS
// ---------------------------------------------
const {
  getAllProperties,
  updatePropertyStatus,
  deleteProperty,
} = require("../controllers/adminProperty.controller");

// ---------------------------------------------
// BROKER CONTROLLERS
// ---------------------------------------------
const {
  getAllBrokers,
  updateBrokerVerification,
  updateBrokerAccountStatus,
} = require("../controllers/adminBroker.controller");

// ---------------------------------------------
// ANALYTICS CONTROLLERS
// ---------------------------------------------
const {
  getUserGrowth,
  getRoleDistribution,
  getFraudFlags,
} = require("../controllers/adminAnalytics.controller");

// ---------------------------------------------
// SETTINGS CONTROLLERS
// ---------------------------------------------
const {
  getSettings,
  updateSettings,
} = require("../controllers/adminSettings.controller");

// ---------------------------------------------
// AI FRAUD DETECTION CONTROLLERS
// ---------------------------------------------
const {
  analysePropertyFraudForAdmin,
  getFraudReports,
  reviewFraudReport,
} = require("../controllers/adminFraud.controller");

// ---------------------------------------------
// VALIDATORS
// ---------------------------------------------
const {
  userIdParamValidator,
  updateUserStatusValidator,
  updateUserRoleValidator,
} = require("../validators/admin.validator");

const router = Router();

console.log("[Admin Routes] admin.routes.js loaded");

// ---------------------------------------------
// GLOBAL ADMIN AUTHENTICATION
// All routes require JWT + admin role.
// ---------------------------------------------
router.use(verifyJWT, restrictTo("admin"));

// ---------------------------------------------
// DASHBOARD
// ---------------------------------------------
router.get(
  "/dashboard-stats",
  getDashboardStats
);

// ---------------------------------------------
// USER MANAGEMENT
// ---------------------------------------------
router.get(
  "/users",
  getAllUsers
);

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

// ---------------------------------------------
// PROPERTY MODERATION
// ---------------------------------------------
router.get(
  "/properties",
  getAllProperties
);

router.patch(
  "/properties/:propertyId/status",
  updatePropertyStatus
);

router.delete(
  "/properties/:propertyId",
  deleteProperty
);

// ---------------------------------------------
// BROKER MANAGEMENT
// ---------------------------------------------
router.get(
  "/brokers",
  getAllBrokers
);

router.patch(
  "/brokers/:brokerId/verification",
  updateBrokerVerification
);

router.patch(
  "/brokers/:brokerId/account-status",
  updateBrokerAccountStatus
);

// ---------------------------------------------
// ANALYTICS
// ---------------------------------------------
router.get(
  "/analytics/user-growth",
  getUserGrowth
);

router.get(
  "/analytics/role-distribution",
  getRoleDistribution
);

// ---------------------------------------------
// FRAUD DETECTION
// ---------------------------------------------

// Existing rule-based fraud flags.
router.get(
  "/fraud/flags",
  getFraudFlags
);

// Run Python AI fraud analysis for a property.
// Saves the assessment in MongoDB FraudReport.
router.post(
  "/fraud/analyze/:propertyId",
  analysePropertyFraudForAdmin
);

// Get saved fraud reports.
// Supports review_status, severity, is_suspicious,
// page and limit query parameters.
router.get(
  "/fraud/reports",
  getFraudReports
);

// Admin review action.
// Supported statuses: reviewed, confirmed, dismissed.
router.patch(
  "/fraud/reports/:reportId/review",
  reviewFraudReport
);

// ---------------------------------------------
// SETTINGS
// ---------------------------------------------
router.get(
  "/settings",
  getSettings
);

router.patch(
  "/settings",
  updateSettings
);

module.exports = router;
