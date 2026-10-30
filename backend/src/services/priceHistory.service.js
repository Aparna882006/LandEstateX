const Property = require('../models/Property.model');
const PropertyPriceHistory = require('../models/PropertyPriceHistory.model');

const median = (values) => {
  if (!values.length) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

const average = (values) => {
  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const normalize = (value) =>
  String(value || '').trim().toLowerCase();

async function captureMonthlyPriceSnapshots() {
  const capturedAt = new Date();

  const month = [
    capturedAt.getUTCFullYear(),
    String(capturedAt.getUTCMonth() + 1).padStart(2, '0'),
  ].join('-');

  const properties = await Property.find({
    status: 'approved',
    price: { $gt: 0 },
    area_sqft: { $gt: 0 },
    'location.city': { $exists: true, $ne: '' },
  })
    .select(
      'price area_sqft property_type listing_type location.city location.locality'
    )
    .lean();

  const groups = new Map();

  const addToGroup = (property, cityWide) => {
    const city = String(property.location?.city || '').trim();
    const locality = cityWide
      ? ''
      : String(property.location?.locality || '').trim();

    const cityKey = normalize(city);
    const localityKey = normalize(locality);

    if (!cityKey || !property.property_type || !property.listing_type) {
      return;
    }

    const key = [
      cityKey,
      localityKey,
      property.property_type,
      property.listing_type,
    ].join('|');

    if (!groups.has(key)) {
      groups.set(key, {
        month,
        captured_at: capturedAt,
        city,
        city_key: cityKey,
        locality,
        locality_key: localityKey,
        property_type: property.property_type,
        listing_type: property.listing_type,
        prices: [],
        rates: [],
      });
    }

    const group = groups.get(key);
    const price = Number(property.price);
    const area = Number(property.area_sqft);

    if (Number.isFinite(price) && price > 0) {
      group.prices.push(price);

      if (Number.isFinite(area) && area > 0) {
        group.rates.push(price / area);
      }
    }
  };

  for (const property of properties) {
    addToGroup(property, true);

    if (String(property.location?.locality || '').trim()) {
      addToGroup(property, false);
    }
  }

  const operations = [];

  for (const group of groups.values()) {
    if (!group.prices.length) continue;

    operations.push({
      updateOne: {
        filter: {
          month: group.month,
          city_key: group.city_key,
          locality_key: group.locality_key,
          property_type: group.property_type,
          listing_type: group.listing_type,
        },
        update: {
          $setOnInsert: {
            month: group.month,
            captured_at: group.captured_at,
            city: group.city,
            city_key: group.city_key,
            locality: group.locality,
            locality_key: group.locality_key,
            property_type: group.property_type,
            listing_type: group.listing_type,
            sample_count: group.prices.length,
            average_price: average(group.prices),
            median_price: median(group.prices),
            median_price_per_sqft: median(group.rates),
          },
        },
        upsert: true,
      },
    });
  }

  if (!operations.length) {
    console.log(
      `[PriceHistory] No approved listings available for ${month}.`
    );

    return { month, snapshots: 0 };
  }

  const result = await PropertyPriceHistory.bulkWrite(operations, {
    ordered: false,
  });

  const snapshots = result.upsertedCount || 0;

  console.log(
    `[PriceHistory] ${month}: ${snapshots} new snapshots saved.`
  );

  return { month, snapshots };
}

module.exports = {
  captureMonthlyPriceSnapshots,
};
