/**
 * admin.routes.js
 * -----------------------------------------------------------------------
 * All routes here are admin-only. ASSUMPTIONS on middleware naming —
 * rename these imports to match your actual auth/role middleware exports:
 *   - middlewares/auth.middleware.js -> exports `verifyJWT`
 *   - middlewares/role.middleware.js -> exports `authorizeRoles(...roles)`
 *   - middlewares/validate.middleware.js -> exports `validate`
 *
 * Mount in index.routes.js with:
 *   import adminRoutes from "./admin.routes.js";
 *   router.use("/admin", adminRoutes);
 * -----------------------------------------------------------------------
 */

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "../controllers/admin.controller.js";
import {
  getAllProperties,
  updatePropertyStatus,
  deleteProperty,
} from "../controllers/adminProperty.controller.js";
import {
  getUserGrowth,
  getRoleDistribution,
  getFraudFlags,
} from "../controllers/adminAnalytics.controller.js";
import {
  getSettings,
  updateSettings,
} from "../controllers/adminSettings.controller.js";
import {
  userIdParamValidator,
  updateUserStatusValidator,
  updateUserRoleValidator,
} from "../validators/admin.validator.js";

const router = Router();

// Every route below requires a logged-in admin.
router.use(verifyJWT, authorizeRoles("admin"));

router.get("/dashboard-stats", getDashboardStats);

router.get("/users", getAllUsers);
router.get("/users/:userId", userIdParamValidator, validate, getUserById);
router.patch(
  "/users/:userId/status",
  updateUserStatusValidator,
  validate,
  updateUserStatus
);
router.patch(
  "/users/:userId/role",
  updateUserRoleValidator,
  validate,
  updateUserRole
);
router.delete("/users/:userId", userIdParamValidator, validate, deleteUser);

// --- Property moderation ---
router.get("/properties", getAllProperties);
router.patch("/properties/:propertyId/status", updatePropertyStatus);
router.delete("/properties/:propertyId", deleteProperty);

// --- Broker management ---
// Placeholder — Broker module (Prompt 8E) isn't built yet. Once it is,
// mirror the property routes above against Broker.model.js: list, verify,
// suspend, delete. No admin.controller functions to wire until then.

// --- Analytics / reports ---
router.get("/analytics/user-growth", getUserGrowth);
router.get("/analytics/role-distribution", getRoleDistribution);

// --- Fraud detection ---
router.get("/fraud/flags", getFraudFlags);

// --- Settings ---
router.get("/settings", getSettings);
router.patch("/settings", updateSettings);

export default router;
