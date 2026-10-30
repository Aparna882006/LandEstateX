require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const {
  startPriceHistoryScheduler,
} = require('./services/priceHistory.scheduler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  startPriceHistoryScheduler();

  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });
};

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
