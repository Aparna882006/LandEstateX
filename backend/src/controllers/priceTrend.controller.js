
const Property = require('../models/Property.model');
const PropertyPriceHistory = require('../models/PropertyPriceHistory.model');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const normalize = (value) =>
  String(value || '').trim().toLowerCase();

const average = (values) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;

const median = (values) => {
  if (!values.length) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

const getPriceTrends = asyncHandler(async (req, res) => {
  const city = String(req.query.city || '').trim();
  const locality = String(req.query.locality || '').trim();
  const propertyType = normalize(req.query.property_type);
  const listingType = normalize(req.query.listing_type);

  const allowedPropertyTypes = [
    'apartment',
    'villa',
    'plot',
    'commercial',
  ];

  const allowedListingTypes = ['sale', 'rent'];

  const filter = {
    status: 'approved',
    price: { $gt: 0 },
    area_sqft: { $gt: 0 },
  };

  if (city) {
    filter['location.city'] = new RegExp(
      `^${escapeRegex(city)}$`,
      'i'
    );
  }

  if (locality) {
    filter['location.locality'] = new RegExp(
      `^${escapeRegex(locality)}$`,
      'i'
    );
  }

  if (propertyType && allowedPropertyTypes.includes(propertyType)) {
    filter.property_type = propertyType;
  }

  if (listingType && allowedListingTypes.includes(listingType)) {
    filter.listing_type = listingType;
  }

  const properties = await Property.find(filter)
    .select(
      'price area_sqft property_type listing_type location.city location.locality'
    )
    .lean();

  const prices = properties
    .map((property) => Number(property.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  const rates = properties
    .map(
      (property) =>
        Number(property.price) / Number(property.area_sqft)
    )
    .filter((rate) => Number.isFinite(rate) && rate > 0);

  let historicalData = [];

  // Historical comparisons must use the same market segment.
  if (
    city &&
    allowedPropertyTypes.includes(propertyType) &&
    allowedListingTypes.includes(listingType)
  ) {
    const historyFilter = {
      city_key: normalize(city),
      property_type: propertyType,
      listing_type: listingType,
      locality_key: normalize(locality),
    };

    const historyRecords = await PropertyPriceHistory.find(
      historyFilter
    )
      .sort({ month: 1 })
      .limit(60)
      .lean();

    historicalData = historyRecords
      .filter(
        (record) =>
          Number.isFinite(Number(record.median_price)) &&
          Number(record.median_price) > 0
      )
      .map((record) => ({
        month: record.month,
        date: record.month,
        price: Number(record.median_price),
        value: Number(record.median_price),
        median_price: Number(record.median_price),
        average_price: Number(record.average_price),
        median_price_per_sqft:
          record.median_price_per_sqft == null
            ? null
            : Number(record.median_price_per_sqft),
        sample_count: Number(record.sample_count),
      }));
  }

  // Do not manufacture a forecast from insufficient history.
  const forecastData = [];

  const data = {
    source: 'approved_listing_asking_prices',
    generated_at: new Date().toISOString(),
    filters: {
      city: city || null,
      locality: locality || null,
      property_type: propertyType || null,
      listing_type: listingType || null,
    },
    sample_count: prices.length,
    statistics: {
      average_price: average(prices),
      median_price: median(prices),
      average_price_per_sqft: average(rates),
      median_price_per_sqft: median(rates),
    },
    historical_data: historicalData,
    forecast_data: forecastData,
    message:
      historicalData.length < 2
        ? 'Current approved listing statistics are available. At least two monthly historical snapshots are needed to show a price trend. A future forecast is not available yet.'
        : 'Historical points represent monthly median asking prices of approved listings. They do not necessarily represent completed property sale prices. No validated future forecast is available yet.',
  };

  return res.status(200).json(
    new ApiResponse(
      true,
      'Price trend snapshot retrieved',
      data
    )
  );
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { getPriceTrends };
