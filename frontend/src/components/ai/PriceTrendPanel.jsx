import { useEffect, useMemo, useState } from 'react';
import { getPropertyPriceTrends } from '../../services/priceTrend.service';

const formatPrice = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) return 'N/A';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPricePerSqft = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) return 'N/A';

  return `${formatPrice(amount)} / sq. ft.`;
};

const formatCount = (value) =>
  new Intl.NumberFormat('en-IN').format(Number(value) || 0);

const PriceHistoryChart = ({ currentPrice }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Demo timeline: January 2024 through December 2030 (84 monthly points).
  // October 2026 is the current-price reference month for this demo.
  const chart = useMemo(() => {
    const baseline = Number(currentPrice);

    if (!Number.isFinite(baseline) || baseline <= 0) {
      return { points: [], min: 0, max: 0 };
    }

    const startYear = 2024;
    const startMonth = 0;
    const endYear = 2030;
    const endMonth = 11;
    const referenceDate = new Date(2026, 9, 1);
    const referenceAbsoluteMonth =
      referenceDate.getFullYear() * 12 + referenceDate.getMonth();

    const points = [];

    for (
      let absoluteMonth = startYear * 12 + startMonth;
      absoluteMonth <= endYear * 12 + endMonth;
      absoluteMonth += 1
    ) {
      const year = Math.floor(absoluteMonth / 12);
      const month = absoluteMonth % 12;
      const monthDifference = absoluteMonth - referenceAbsoluteMonth;

      let value;
      let type;

      if (monthDifference < 0) {
        // Illustrative historical demo trend: about 4.5% annual growth.
        value =
          baseline /
          Math.pow(1.045, Math.abs(monthDifference) / 12);
        type = 'history';
      } else if (monthDifference === 0) {
        value = baseline;
        type = 'current';
      } else {
        // Illustrative future demo trend: about 4% annual growth.
        value =
          baseline *
          Math.pow(1.04, monthDifference / 12);
        type = 'forecast';
      }

      // A small repeatable seasonal variation makes the demo line less linear.
      if (monthDifference !== 0) {
        value *= 1 + Math.sin((month / 12) * Math.PI * 2) * 0.006;
      }

      points.push({
        year,
        month,
        label: new Date(year, month, 1).toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric',
        }),
        value: Math.round(value),
        type,
      });
    }

    const currentPoint = points.find((point) => point.type === 'current');
    if (currentPoint) currentPoint.value = baseline;

    const values = points.map((point) => point.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const range = rawMax - rawMin;
    const padding = range === 0 ? rawMax * 0.08 : range * 0.12;

    return {
      points,
      min: Math.max(0, rawMin - padding),
      max: rawMax + padding,
    };
  }, [currentPrice]);

  useEffect(() => {
    setSelectedIndex(null);
  }, [currentPrice]);

  if (chart.points.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="font-semibold text-slate-800">
          Price chart unavailable
        </p>
        <p className="mt-2 text-sm text-slate-500">
          A valid current property price is required to generate the demo chart.
        </p>
      </div>
    );
  }

  const width = 900;
  const height = 370;
  const left = 105;
  const right = 35;
  const top = 45;
  const bottom = 75;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const getX = (index) =>
    left + (index / (chart.points.length - 1)) * plotWidth;

  const getY = (value) => {
    const range = chart.max - chart.min || 1;
    return top + ((chart.max - value) / range) * plotHeight;
  };

  const currentIndex = chart.points.findIndex(
    (point) => point.type === 'current'
  );

  const actualPath = chart.points
    .slice(0, currentIndex + 1)
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.value)}`
    )
    .join(' ');

  const forecastPath = chart.points
    .slice(currentIndex)
    .map((point, index) => {
      const pointIndex = currentIndex + index;
      return `${index === 0 ? 'M' : 'L'} ${getX(pointIndex)} ${getY(point.value)}`;
    })
    .join(' ');

  const gridLines = Array.from({ length: 5 }, (_, index) => ({
    y: top + (plotHeight / 4) * index,
    value: chart.max - ((chart.max - chart.min) / 4) * index,
  }));

  const selectedPoint =
    selectedIndex !== null ? chart.points[selectedIndex] : null;
  const selectedX =
    selectedIndex !== null ? getX(selectedIndex) : 0;
  const selectedY = selectedPoint ? getY(selectedPoint.value) : 0;

  const tooltipWidth = 190;
  const tooltipHeight = 60;
  const tooltipX = Math.max(
    left + 4,
    Math.min(
      selectedX - tooltipWidth / 2,
      width - right - tooltipWidth
    )
  );
  const tooltipY =
    selectedY - tooltipHeight - 15 >= top
      ? selectedY - tooltipHeight - 15
      : Math.min(
          selectedY + 15,
          height - bottom - tooltipHeight
        );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Property Price Movement
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            January 2024 – December 2030
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          DEMO DATA
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-1 w-5 rounded bg-blue-600" />
          Historical Demo
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1 w-5 rounded bg-blue-900" />
          Current Price
        </span>
        <span className="flex items-center gap-2">
          <span className="w-5 border-t-2 border-dashed border-amber-500" />
          Future Forecast Demo
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-label="Interactive monthly property price demo chart from 2024 to 2030"
          className="h-auto w-full min-w-[650px]"
        >
          {gridLines.map((line, index) => (
            <g key={index}>
              <line
                x1={left}
                y1={line.y}
                x2={width - right}
                y2={line.y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <text
                x={left - 10}
                y={line.y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#64748b"
              >
                {formatPrice(line.value)}
              </text>
            </g>
          ))}

          <line
            x1={left}
            y1={top}
            x2={left}
            y2={height - bottom}
            stroke="#cbd5e1"
          />
          <line
            x1={left}
            y1={height - bottom}
            x2={width - right}
            y2={height - bottom}
            stroke="#cbd5e1"
          />

          <path
            d={actualPath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={forecastPath}
            fill="none"
            stroke="#d97706"
            strokeWidth="3"
            strokeDasharray="7 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {chart.points.map((point, index) => {
            if (point.month !== 0) return null;

            return (
              <text
                key={`year-${point.year}`}
                x={getX(index)}
                y={height - bottom + 27}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#475569"
              >
                {point.year}
              </text>
            );
          })}

          {chart.points.map((point, index) => {
            const x = getX(index);
            const y = getY(point.value);
            const isSelected = selectedIndex === index;
            const isCurrent = point.type === 'current';
            const isForecast = point.type === 'forecast';
            const fill = isForecast
              ? '#d97706'
              : isCurrent
                ? '#1e3a8a'
                : '#2563eb';

            return (
              <g
                key={`${point.year}-${point.month}`}
                role="button"
                tabIndex={0}
                aria-label={`${point.label}: ${formatPrice(point.value)}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedIndex(index);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={x} cy={y} r="10" fill="transparent" />
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="9"
                    fill={fill}
                    opacity="0.2"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected || isCurrent ? 6 : 3.5}
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {selectedPoint && (
            <>
              <line
                x1={selectedX}
                y1={top}
                x2={selectedX}
                y2={height - bottom}
                stroke="#64748b"
                strokeDasharray="4 4"
                opacity="0.7"
              />
              <circle
                cx={selectedX}
                cy={selectedY}
                r="10"
                fill="none"
                stroke={
                  selectedPoint.type === 'forecast'
                    ? '#d97706'
                    : '#2563eb'
                }
                strokeWidth="2"
              />
              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx="8"
                fill="#0f172a"
                opacity="0.97"
              />
              <text
                x={tooltipX + 12}
                y={tooltipY + 22}
                fontSize="12"
                fontWeight="600"
                fill="#cbd5e1"
              >
                {selectedPoint.label}
              </text>
              <text
                x={tooltipX + 12}
                y={tooltipY + 44}
                fontSize="15"
                fontWeight="700"
                fill="#ffffff"
              >
                {formatPrice(selectedPoint.value)}
              </text>
            </>
          )}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
        <div>
          <p className="text-xs text-slate-500">
            {selectedPoint ? 'Selected month' : 'Chart range'}
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {selectedPoint
              ? selectedPoint.label
              : 'January 2024 – December 2030'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            {selectedPoint ? 'Property Price' : 'Monthly Data Points'}
          </p>
          <p className="mt-1 font-bold text-blue-700">
            {selectedPoint ? formatPrice(selectedPoint.value) : '84'}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-amber-700">
        Demo only: Historical and forecast prices are illustrative values
        generated from the current reference price. They are not actual
        historical transaction records or guaranteed future market prices.
      </p>
    </div>
  );
};

const PriceTrendPanel = ({
  city = '',
  locality = '',
  propertyType = '',
  listingType = '',
  listedPrice,
  predictedPrice,
}) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const filters = useMemo(
    () => ({
      city: String(city || '').trim(),
      locality: String(locality || '').trim(),
      property_type: String(propertyType || '').trim().toLowerCase(),
      listing_type: String(listingType || '').trim().toLowerCase(),
    }),
    [city, locality, propertyType, listingType]
  );

  useEffect(() => {
    let active = true;

    const loadMarketData = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await getPropertyPriceTrends(filters);

        if (!result || typeof result !== 'object') {
          throw new Error('The market API returned an invalid response.');
        }

        if (
          result.success === false ||
          (result.success === undefined && result.data?.success === false)
        ) {
          throw new Error(
            result.message ||
              result.data?.message ||
              'Unable to load market statistics.'
          );
        }

        if (active) {
          setMarketData(result.data ?? result);
        }
      } catch (err) {
        if (active) {
          setMarketData(null);
          setError(
            err.response?.data?.message ||
              err.message ||
              'Unable to load market statistics.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMarketData();

    return () => {
      active = false;
    };
  }, [filters, retryCount]);

  const statistics = marketData?.statistics;
  const sampleCount = Number(marketData?.sample_count) || 0;

  const validListedPrice =
    listedPrice !== null &&
    listedPrice !== undefined &&
    String(listedPrice).trim() !== '' &&
    Number.isFinite(Number(listedPrice)) &&
    Number(listedPrice) > 0;

  const validPredictedPrice =
    predictedPrice !== null &&
    predictedPrice !== undefined &&
    String(predictedPrice).trim() !== '' &&
    Number.isFinite(Number(predictedPrice)) &&
    Number(predictedPrice) > 0;

  const difference =
    validListedPrice && validPredictedPrice
      ? Number(predictedPrice) - Number(listedPrice)
      : null;

  const differencePercent =
    difference !== null
      ? (difference / Number(listedPrice)) * 100
      : null;

  // Use market median first, then listed price, then AI estimate as demo baseline.
  const chartCurrentPrice =
    Number(statistics?.median_price) > 0
      ? statistics.median_price
      : validListedPrice
        ? listedPrice
        : validPredictedPrice
          ? predictedPrice
          : null;

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">
          Property Price Insights
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Review this property's asking price alongside current approved
          listing statistics for the selected market.
        </p>

        {(filters.city || filters.locality) && (
          <p className="mt-2 text-sm font-medium text-blue-700">
            Selected market:{' '}
            {[filters.locality, filters.city].filter(Boolean).join(', ')}
            {filters.property_type ? ` · ${filters.property_type}` : ''}
            {filters.listing_type ? ` · ${filters.listing_type}` : ''}
          </p>
        )}
      </header>

      {/* Current Market Snapshot */}
      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Current Market Snapshot
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Approved listing asking prices matching the selected filters.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div
            className="mt-5 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-600"
            role="status"
          >
            Loading current market statistics...
          </div>
        ) : error ? (
          <div
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5"
            role="alert"
          >
            <p className="font-semibold text-red-800">
              Market statistics unavailable
            </p>
            <p className="mt-2 text-sm leading-6 text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
            >
              Try again
            </button>
          </div>
        ) : sampleCount === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center">
            <p className="font-semibold text-slate-800">
              No matching approved listings found
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Try a broader location or property filter to find available
              market statistics.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Matching Listings</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCount(sampleCount)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Average Asking Price
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {formatPrice(statistics?.average_price)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Median Asking Price
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {formatPrice(statistics?.median_price)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Median Price per Sq. Ft.
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {formatPricePerSqft(statistics?.median_price_per_sqft)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Source: {marketData?.source || 'Backend market snapshot'}.
              These figures are asking-price statistics, not verified
              transaction prices or proof of market value.
            </p>

            {marketData?.message && (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {marketData.message}
              </p>
            )}
          </>
        )}
      </article>

      {/* 2024–2030 monthly demo chart */}
      {!loading && !error && (
        <PriceHistoryChart currentPrice={chartCurrentPrice} />
      )}

      {/* Listed Price and AI Estimate */}
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Seller's Listed Price</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {validListedPrice ? formatPrice(listedPrice) : 'Unavailable'}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">AI Estimated Price</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {validPredictedPrice
              ? formatPrice(predictedPrice)
              : 'Run a prediction first'}
          </p>
        </article>
      </div>

      {/* Asking Price Comparison */}
      {difference !== null && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="font-semibold text-slate-900">
            Asking Price Comparison
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {difference > 0
              ? 'The AI estimate is above the listed price by'
              : difference < 0
                ? 'The AI estimate is below the listed price by'
                : 'The AI estimate matches the listed price.'}{' '}
            {difference !== 0 && (
              <>
                <strong>{formatPrice(Math.abs(difference))}</strong>
                {differencePercent !== null && (
                  <> ({Math.abs(differencePercent).toFixed(1)}%).</>
                )}
              </>
            )}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            This comparison alone does not prove a property is underpriced
            or overpriced.
          </p>
        </div>
      )}
    </section>
  );
};

export default PriceTrendPanel;
