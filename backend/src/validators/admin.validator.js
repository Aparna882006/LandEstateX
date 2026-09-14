/**
 * admin.validator.js
 * express-validator chains for the admin module — same pattern as
 * auth.validator.js. Wire these into routes via validate.middleware.js.
 */

/**
 * admin.validator.js
 * Express-validator chains for the admin module.
 */

const { body, param } = require('express-validator');

const userIdParamValidator = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user id'),
];

const updateUserStatusValidator = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user id'),

  body('isActive')
    .isBoolean()
    .withMessage('isActive must be true or false'),
];

const updateUserRoleValidator = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user id'),

  body('role')
    .isIn([
      'buyer',
      'seller',
      'broker',
      'builder',
      'investor',
      'admin',
    ])
    .withMessage('Invalid role'),
];

module.exports = {
  userIdParamValidator,
  updateUserStatusValidator,
  updateUserRoleValidator,
};