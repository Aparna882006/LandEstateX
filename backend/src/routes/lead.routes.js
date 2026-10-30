
const express = require('express');
const router = express.Router();

const {
  getMyLeads,
  updateLead,
} = require('../controllers/lead.controller');

const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(protect);
router.use(restrictTo('broker'));

router.get('/me', getMyLeads);
router.patch('/:lead_id', updateLead);

module.exports = router;
