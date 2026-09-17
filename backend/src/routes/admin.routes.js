/**
 * admin.routes.js
 * -----------------------------------------------------------------------
 * All routes here are admin-only.
 */

const { Router } = require('express');

const { verifyJWT } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');

const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} = require('../controllers/admin.controller');

const {
  getAllProperties,
  updatePropertyStatus,
  deleteProperty,
} = require('../controllers/adminProperty.controller');

const {
  getUserGrowth,
  getRoleDistribution,
  getFraudFlags,
} = require('../controllers/adminAnalytics.controller');

const {
  getSettings,
  updateSettings,
} = require('../controllers/adminSettings.controller');

const {
  userIdParamValidator,
  updateUserStatusValidator,
  updateUserRoleValidator,
} = require('../validators/admin.validator');

const router = Router();

// Every route below requires a logged-in admin.
router.use(verifyJWT, restrictTo('admin'));

// Dashboard
router.get('/dashboard-stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);

router.get(
  '/users/:userId',
  userIdParamValidator,
  validate,
  getUserById
);

router.patch(
  '/users/:userId/status',
  updateUserStatusValidator,
  validate,
  updateUserStatus
);

router.patch(
  '/users/:userId/role',
  updateUserRoleValidator,
  validate,
  updateUserRole
);

router.delete(
  '/users/:userId',
  userIdParamValidator,
  validate,
  deleteUser
);

// Property moderation
router.get('/properties', getAllProperties);

router.patch(
  '/properties/:propertyId/status',
  updatePropertyStatus
);

router.delete(
  '/properties/:propertyId',
  deleteProperty
);

// Analytics
router.get(
  '/analytics/user-growth',
  getUserGrowth
);

router.get(
  '/analytics/role-distribution',
  getRoleDistribution
);

// Fraud detection
router.get(
  '/fraud/flags',
  getFraudFlags
);

// Settings
router.get(
  '/settings',
  getSettings
);

router.patch(
  '/settings',
  updateSettings
);

module.exports = router;