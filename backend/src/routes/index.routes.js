const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const brokerRoutes = require('./broker.routes');

router.use('/auth', authRoutes);
router.use('/broker', brokerRoutes);

module.exports = router;