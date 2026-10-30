
const express = require('express');

const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const brokerRoutes = require('./broker.routes');
const propertyRoutes = require('./property.routes');
const appointmentRoutes = require('./appointment.routes');
const wishlistRoutes = require('./wishlist.routes');
const leadRoutes = require('./lead.routes');
const reviewRoutes = require('./review.routes');
const aiRoutes = require('./ai.routes');
const priceTrendRoutes = require('./priceTrend.routes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/brokers', brokerRoutes);

// Keep this specific route BEFORE /properties
router.use('/properties/price-trends', priceTrendRoutes);
router.use('/properties', propertyRoutes);

router.use('/appointments', appointmentRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/leads', leadRoutes);
router.use('/reviews', reviewRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
