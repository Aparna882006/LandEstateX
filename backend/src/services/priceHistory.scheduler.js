const {
  captureMonthlyPriceSnapshots,
} = require('./priceHistory.service');

const scheduleNextSnapshot = () => {
  const now = new Date();

  const nextRun = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      1,
      0,
      15,
      0,
      0
    )
  );

  const delay = Math.max(0, nextRun.getTime() - Date.now());

  setTimeout(async () => {
    try {
      await captureMonthlyPriceSnapshots();
    } catch (error) {
      console.error(
        '[PriceHistory] Scheduled snapshot failed:',
        error.message
      );
    } finally {
      scheduleNextSnapshot();
    }
  }, delay);
};

const startPriceHistoryScheduler = () => {
  captureMonthlyPriceSnapshots().catch((error) => {
    console.error(
      '[PriceHistory] Initial snapshot failed:',
      error.message
    );
  });

  scheduleNextSnapshot();

  console.log('[PriceHistory] Monthly scheduler started.');
};

module.exports = {
  startPriceHistoryScheduler,
};
