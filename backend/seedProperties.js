
require('dotenv').config();

const mongoose = require('mongoose');
const Property = require('./src/models/Property.model');
const User = require('./src/models/User.model');

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI;

const TARGET_COUNT = 30;
const IMAGES_PER_PROPERTY = 6;

const CITY = 'Kanpur';

const localities = [
  {
    name: 'Kalyanpur',
    latitude: 26.5123,
    longitude: 80.2329,
  },
  {
    name: 'Kakadeo',
    latitude: 26.4851,
    longitude: 80.2867,
  },
  {
    name: 'Swaroop Nagar',
    latitude: 26.4833,
    longitude: 80.319,
  },
  {
    name: 'Civil Lines',
    latitude: 26.4748,
    longitude: 80.3462,
  },
  {
    name: 'Panki',
    latitude: 26.4685,
    longitude: 80.217,
  },
  {
    name: 'Kidwai Nagar',
    latitude: 26.4239,
    longitude: 80.3256,
  },
];

const propertyTypes = [
  'apartment',
  'villa',
  'plot',
  'commercial',
];

const categoryQueries = {
  apartment: {
    exterior: 'modern apartment building exterior architecture',
    living_room: 'modern apartment living room interior',
    bedroom: 'modern bedroom interior residential home',
    kitchen: 'modern modular kitchen interior',
    bathroom: 'modern bathroom interior home',
    balcony: 'apartment balcony outdoor seating',
  },

  villa: {
    exterior: 'luxury villa house exterior architecture',
    living_room: 'luxury villa living room interior',
    bedroom: 'luxury villa bedroom interior',
    kitchen: 'luxury house modern kitchen interior',
    bathroom: 'luxury villa bathroom interior',
    garden: 'villa landscaped garden outdoor house',
  },

  plot: {
    land: 'vacant residential land plot real estate',
    aerial_view: 'aerial view vacant land property',
    other: 'residential land parcel empty plot',
  },

  commercial: {
    exterior: 'commercial office building exterior architecture',
    office_interior: 'modern commercial office interior',
    workspace: 'modern coworking workspace office interior',
    other: 'commercial real estate building',
  },
};

const fallbackQueries = {
  exterior: 'house building exterior architecture',
  living_room: 'modern living room interior',
  bedroom: 'bedroom interior design',
  kitchen: 'modern kitchen interior',
  bathroom: 'modern bathroom interior',
  balcony: 'balcony outdoor home',
  garden: 'landscaped garden house',
  land: 'vacant land real estate plot',
  aerial_view: 'aerial view land property',
  office_interior: 'modern office interior',
  workspace: 'modern workspace interior',
  other: 'real estate property building',
};

// Cache image pools so the same category is not searched repeatedly.
const imagePoolCache = new Map();

function getRequiredCategories(type) {
  return Object.keys(categoryQueries[type] || categoryQueries.apartment);
}

async function searchUnsplash(query) {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error(
      'UNSPLASH_ACCESS_KEY missing in backend/.env'
    );
  }

  const url = new URL(
    'https://api.unsplash.com/search/photos'
  );

  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '30');
  url.searchParams.set('orientation', 'landscape');

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Unsplash API error (${response.status}): ${message}`
    );
  }

  const data = await response.json();

  return (data.results || [])
    .filter((photo) => photo.id && photo.urls?.regular)
    .map((photo) => ({
      url: photo.urls.regular,
      public_id: `unsplash_${photo.id}`,
    }));
}

async function getImagePool(type, category) {
  const cacheKey = `${type}:${category}`;

  if (imagePoolCache.has(cacheKey)) {
    return imagePoolCache.get(cacheKey);
  }

  const query =
    categoryQueries[type]?.[category] ||
    fallbackQueries[category] ||
    fallbackQueries.other;

  let photos = [];

  try {
    photos = await searchUnsplash(query);
  } catch (error) {
    console.error(
      `Image search failed for ${cacheKey}: ${error.message}`
    );
  }

  // Try a general category query if the first query returns nothing.
  if (photos.length === 0) {
    const fallback =
      fallbackQueries[category] || fallbackQueries.other;

    try {
      photos = await searchUnsplash(fallback);
    } catch (error) {
      console.error(
        `Fallback image search failed for ${cacheKey}: ${error.message}`
      );
    }
  }

  imagePoolCache.set(cacheKey, photos);

  return photos;
}

async function buildImages(type, propertyNumber) {
  const categories = getRequiredCategories(type);
  const images = [];
  const usedIds = new Set();

  for (const category of categories) {
    const pool = await getImagePool(type, category);

    if (pool.length === 0) {
      console.warn(
        `No Unsplash photos found for ${type}/${category}`
      );
      continue;
    }

    // Rotate through the cached pool for variety between properties.
    const startIndex =
      (propertyNumber * 3) % pool.length;

    let selected;

    for (let offset = 0; offset < pool.length; offset++) {
      const candidate =
        pool[(startIndex + offset) % pool.length];

      if (!usedIds.has(candidate.public_id)) {
        selected = candidate;
        break;
      }
    }

    // If a category pool is small, allow a reused photo rather
    // than failing the entire seed operation.
    if (!selected) {
      selected = pool[startIndex];
    }

    if (!selected) continue;

    usedIds.add(selected.public_id);

    images.push({
      ...selected,
      category,
      is_primary: images.length === 0,
    });
  }

  // Fill remaining slots with category-appropriate images.
  // Do not exceed the desired number of images.
  const allCategories = [
    ...categories,
    'other',
  ];

  let fallbackIndex = 0;

  while (
    images.length < IMAGES_PER_PROPERTY &&
    fallbackIndex < allCategories.length * 2
  ) {
    const category =
      allCategories[fallbackIndex % allCategories.length];

    fallbackIndex++;

    const pool = await getImagePool(type, category);

    if (!pool.length) continue;

    const candidate =
      pool[(propertyNumber + fallbackIndex) % pool.length];

    if (!candidate) continue;

    // Avoid duplicates inside this property's gallery.
    if (usedIds.has(candidate.public_id)) continue;

    usedIds.add(candidate.public_id);

    images.push({
      ...candidate,
      category: categories.includes(category)
        ? category
        : 'other',
      is_primary: images.length === 0,
    });
  }

  if (images.length > 0) {
    images.forEach((image, index) => {
      image.is_primary = index === 0;
    });
  }

  return images;
}

function makePropertyData(index, ownerId, images) {
  const type = propertyTypes[index % propertyTypes.length];
  const locality = localities[index % localities.length];

  const isResidential =
    type === 'apartment' || type === 'villa';

  const bedrooms = isResidential
    ? type === 'villa'
      ? 3 + (index % 3)
      : 2 + (index % 3)
    : 0;

  const bathrooms = isResidential
    ? Math.max(1, bedrooms - 1)
    : 0;

  const area_sqft =
    type === 'plot'
      ? 1200 + index * 100
      : type === 'commercial'
        ? 800 + index * 75
        : type === 'villa'
          ? 1800 + index * 80
          : 750 + index * 50;

  const titleByType = {
    apartment: `Modern Apartment in ${locality.name} ${index + 1}`,
    villa: `Premium Villa in ${locality.name} ${index + 1}`,
    plot: `Residential Land Plot in ${locality.name} ${index + 1}`,
    commercial: `Commercial Property in ${locality.name} ${index + 1}`,
  };

  const descriptionByType = {
    apartment:
      'Well-planned apartment with comfortable interiors and convenient access to local amenities.',
    villa:
      'Spacious villa with a thoughtfully designed layout and attractive indoor and outdoor spaces.',
    plot:
      'Residential land parcel suitable for buyers planning a future construction project. Verify title, zoning, access, and approvals before purchase.',
    commercial:
      'Commercial property suitable for business use, subject to local zoning and applicable permissions.',
  };

  const listing_type = index % 3 === 0 ? 'rent' : 'sale';

  const basePrice = {
    apartment: 4500000,
    villa: 9500000,
    plot: 2500000,
    commercial: 6500000,
  }[type];

  const price =
    listing_type === 'rent'
      ? 12000 + index * 1500
      : basePrice + index * 175000;

  return {
    owner_id: ownerId,
    title: titleByType[type],
    description: descriptionByType[type],
    property_type: type,
    listing_type,
    price,
    ai_predicted_price: null,
    area_sqft,
    bedrooms,
    bathrooms,

    location: {
      address: `${locality.name}, ${CITY}, Uttar Pradesh`,
      city: CITY,
      locality: locality.name,
      latitude: locality.latitude,
      longitude: locality.longitude,
    },

    amenities:
      type === 'plot'
        ? ['Road Access', 'Residential Area']
        : type === 'commercial'
          ? ['Parking', 'Road Access']
          : ['Parking', 'Water Supply', 'Power Backup'],

    images,
    status: 'approved',
    rejection_reason: null,
    is_fraud_flagged: false,
    views_count: index * 7,
  };
}

async function findSeedOwner() {
  // Reuse a user already in the database.
  const owner = await User.findOne({});

  if (!owner) {
    throw new Error(
      'No users found. Create a user first, then run this seed script.'
    );
  }

  return owner;
}

async function seedProperties() {
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI or MONGO_URI missing in backend/.env'
    );
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const owner = await findSeedOwner();
  console.log(`Using existing user as owner: ${owner._id}`);

  let inserted = 0;
  let updated = 0;
  let totalImages = 0;

  for (let index = 0; index < TARGET_COUNT; index++) {
    const type = propertyTypes[index % propertyTypes.length];

    console.log(
      `Preparing property ${index + 1}/${TARGET_COUNT} (${type})...`
    );

    const images = await buildImages(type, index);

    if (images.length === 0) {
      throw new Error(
        `No images could be fetched for property ${index + 1}. Check Unsplash API key and internet connection.`
      );
    }

    const propertyData = makePropertyData(
      index,
      owner._id,
      images
    );

    // A deterministic title makes repeated runs update the same seed
    // listings instead of creating duplicates.
    const existing = await Property.findOne({
      owner_id: owner._id,
      title: propertyData.title,
    });

    if (existing) {
      Object.assign(existing, propertyData);
      await existing.save();
      updated++;
    } else {
      await Property.create(propertyData);
      inserted++;
    }

    totalImages += images.length;

    console.log(
      `Saved: ${propertyData.title} | images: ${images.length}`
    );
  }

  const seededTitles = Array.from(
    { length: TARGET_COUNT },
    (_, index) => {
      const type = propertyTypes[index % propertyTypes.length];
      const locality = localities[index % localities.length];

      const prefix = {
        apartment: 'Modern Apartment',
        villa: 'Premium Villa',
        plot: 'Residential Land Plot',
        commercial: 'Commercial Property',
      }[type];

      return `${prefix} in ${locality.name} ${index + 1}`;
    }
  );

  const verified = await Property.countDocuments({
    owner_id: owner._id,
    title: { $in: seededTitles },
  });

  console.log('\nSeed completed');
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Verified seed properties: ${verified}`);
  console.log(`Images assigned this run: ${totalImages}`);

  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}

seedProperties().catch(async (error) => {
  console.error('Seed failed:', error);

  try {
    await mongoose.disconnect();
  } catch (_) {
    // Ignore disconnect errors during failure handling.
  }

  process.exitCode = 1;
});
