const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const mainRoutes = require('./routes/index.routes');
const errorMiddleware = require('./middlewares/error.middleware');
const notFoundMiddleware = require('./middlewares/notFound.middleware');

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow the frontend's origin, with credentials (cookies) enabled
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting on auth endpoints specifically (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many attempts from this IP, please try again after 15 minutes',
  },
});
app.use('/api/v1/auth', authLimiter);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'LandEstateX backend is running' });
});

// Main API routes
app.use('/api/v1', mainRoutes);

// 404 + centralized error handling — must be last
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;