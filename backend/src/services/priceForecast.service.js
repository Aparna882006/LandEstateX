const MIN_HISTORY_MONTHS = 3;
const FORECAST_HORIZON_MONTHS = 12;

// Prevent extreme projections from sparse or unusual data.
const MAX_MONTHLY_GROWTH = 0.015;
const MIN_MONTHLY_GROWTH = -0.015;

const getMonthIndex = (month) => {
  const match = /^(\d{4})-(\d{2})$/.exec(month || '');

  if (!match) return null;

  return Number(match[1]) * 12 + Number(match[2]) - 1;
};

const formatMonth = (index) => {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;

  return `${year}-${String(month).padStart(2, '0')}`;
};

const calculateRegression = (records) => {
  const points = records.map((record) => ({
    x: getMonthIndex(record.month),
    y: Math.log(Number(record.median_price)),
  }));

  const count = points.length;

  const meanX =
    points.reduce((sum, point) => sum + point.x, 0) / count;

  const meanY =
    points.reduce((sum, point) => sum + point.y, 0) / count;

  let numerator = 0;
  let denominator = 0;

  for (const point of points) {
    numerator += (point.x - meanX) * (point.y - meanY);
    denominator += (point.x - meanX) ** 2;
  }

  if (!denominator) return null;

  return numerator / denominator;
};

const buildPriceForecast = (
  historyRecords,
  horizonMonths = FORECAST_HORIZON_MONTHS
) => {
  const records = (historyRecords || [])
    .filter((record) => {
      return (
        getMonthIndex(record.month) !== null &&
        Number.isFinite(Number(record.median_price)) &&
        Number(record.median_price) > 0
      );
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  const uniqueRecords = [
    ...new Map(records.map((record) => [record.month, record])).values(),
  ];

  if (uniqueRecords.length < MIN_HISTORY_MONTHS) {
    return {
      available: false,
      method: 'log_linear_regression',
      required_months: MIN_HISTORY_MONTHS,
      available_months: uniqueRecords.length,
      forecast_data: [],
      message:
        'At least 3 distinct monthly historical snapshots are required for forecasting.',
    };
  }

  const slope = calculateRegression(uniqueRecords);

  if (!Number.isFinite(slope)) {
    return {
      available: false,
      method: 'log_linear_regression',
      required_months: MIN_HISTORY_MONTHS,
      available_months: uniqueRecords.length,
      forecast_data: [],
      message: 'Insufficient variation in historical dates.',
    };
  }

  const latestRecord = uniqueRecords[uniqueRecords.length - 1];

  const latestPrice = Number(latestRecord.median_price);
  const latestMonthIndex = getMonthIndex(latestRecord.month);

  const monthlyGrowth = Math.max(
    MIN_MONTHLY_GROWTH,
    Math.min(MAX_MONTHLY_GROWTH, Math.exp(slope) - 1)
  );

  const forecastData = [];

  for (
    let step = 1;
    step <= Math.min(horizonMonths, 60);
    step += 1
  ) {
    const projectedPrice =
      latestPrice * Math.pow(1 + monthlyGrowth, step);

    forecastData.push({
      month: formatMonth(latestMonthIndex + step),
      date: formatMonth(latestMonthIndex + step),
      price: Math.round(projectedPrice),
      value: Math.round(projectedPrice),
      step,
    });
  }

  const confidence =
    uniqueRecords.length >= 12
      ? 'medium'
      : 'low';

  return {
    available: true,
    method: 'capped_log_linear_regression',
    confidence,
    historical_months: uniqueRecords.length,
    forecast_horizon_months: forecastData.length,
    monthly_growth_rate: Number(
      (monthlyGrowth * 100).toFixed(3)
    ),
    forecast_data: forecastData,
    message:
      'Forecast is a statistical projection based on historical approved-listing asking prices. It is not a guaranteed property valuation.',
  };
};

module.exports = {
  buildPriceForecast,
};
