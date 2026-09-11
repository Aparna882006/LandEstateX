/**
 * admin.validator.js
 * express-validator chains for the admin module — same pattern as
 * auth.validator.js. Wire these into routes via validate.middleware.js.
 */

import { body, param } from "express-validator";

export const userIdParamValidator = [
  param("userId").isMongoId().withMessage("Invalid user id"),
];

export const updateUserStatusValidator = [
  param("userId").isMongoId().withMessage("Invalid user id"),
  body("isActive")
    .isBoolean()
    .withMessage("isActive must be true or false"),
];

export const updateUserRoleValidator = [
  param("userId").isMongoId().withMessage("Invalid user id"),
  body("role")
    .isIn(["buyer", "seller", "broker", "builder", "investor", "admin"])
    .withMessage("Invalid role"),
];
