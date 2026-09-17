const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { restrictTo } = require("../middlewares/role.middleware");
const {
  getMyProperties,
  createProperty,
  getMyPropertyById,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
} = require("../controllers/brokerProperty.controller");

const router = express.Router();

router.use(verifyJWT, restrictTo("broker", "admin"));

router.route("/").get(getMyProperties).post(createProperty);
router.route("/:id").get(getMyPropertyById).patch(updateProperty).delete(deleteProperty);
router.patch("/:id/status", updatePropertyStatus);

module.exports = router;
