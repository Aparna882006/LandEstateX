
const express = require('express');

const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const brokerRoutes = require('./broker.routes');
const propertyRoutes = require('./property.routes');
const appointmentRoutes = require('./appointment.routes');
const wishlistRoutes = require('./wishlist.routes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/brokers', brokerRoutes);
router.use('/properties', propertyRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/wishlist', wishlistRoutes);

module.exports = router;
