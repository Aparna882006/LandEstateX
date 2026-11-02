
const {
  captureMonthlyPriceSnapshots,
} = require('./priceHistory.service');

const MAX_TIMEOUT = 2_000_000_000;

let schedulerStarted = false;
let scheduledTimer = null;
let snapshotRunning = false;

const getNextSnapshotDate = () => {
  const now = new Date();

  return new Date(
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
};

const runScheduledSnapshot = async () => {
  if (snapshotRunning) {
    return;
  }

  snapshotRunning = true;

  try {
    await captureMonthlyPriceSnapshots();
  } catch (error) {
    console.error(
      '[PriceHistory] Scheduled snapshot failed:',
      error.message
    );
  } finally {
    snapshotRunning = false;
    scheduleNextSnapshot();
  }
};

const scheduleNextSnapshot = () => {
  if (!schedulerStarted) {
    return;
  }

  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }

  const nextRun = getNextSnapshotDate();
  const remainingDelay = nextRun.getTime() - Date.now();

  if (remainingDelay <= 0) {
    scheduledTimer = setTimeout(() => {
      runScheduledSnapshot();
    }, 0);

    return;
  }

  // Node.js timers cannot safely handle delays above
  // approximately 24.8 days. Check again in smaller intervals.
  const delay = Math.min(remainingDelay, MAX_TIMEOUT);

  scheduledTimer = setTimeout(() => {
    const currentTime = Date.now();

    if (currentTime >= nextRun.getTime()) {
      runScheduledSnapshot();
    } else {
      scheduleNextSnapshot();
    }
  }, delay);
};

const startPriceHistoryScheduler = () => {
  if (schedulerStarted) {
    console.log(
      '[PriceHistory] Scheduler is already running.'
    );
    return;
  }

  schedulerStarted = true;

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
