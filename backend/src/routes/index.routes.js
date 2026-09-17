const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const brokerRoutes = require('./broker.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/broker', brokerRoutes);
router.use('/admin', adminRoutes);

module.exports = router;