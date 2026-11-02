
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiMaximize2,
  FiHome,
  FiRefreshCw,
  FiSearch,
  FiAlertCircle,
} from 'react-icons/fi';

import { getPropertyRecommendations } from '../../services/ai.service';
import { getSavedSearches } from '../../services/savedSearch.service';

const PREFERENCE_STORAGE_KEY = 'landestatex_recommendation_preferences';

const BUDGET_RANGES = {
  under50: { min_price: 0, max_price: 5000000 },
  range50to100: { min_price: 5000000, max_price: 10000000 },
  range100to200: { min_price: 10000000, max_price: 20000000 },
  above200: { min_price: 20000000 },
};

const AREA_RANGES = {
  under1000: { min_area: 0, max_area: 1000 },
  range1000to1500: { min_area: 1000, max_area: 1500 },
  range1500to2500: { min_area: 1500, max_area: 2500 },
  above2500: { min_area: 2500 },
};

const AMENITY_OPTIONS = [
  'Parking',
  'Security',
  'Swimming Pool',
  'Gym',
  'Lift',
  'Garden',
  'Power Backup',
  'Clubhouse',
];

const readStoredPreference = () => {
  try {
    const stored = localStorage.getItem(PREFERENCE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getInitialForm = () => {
  const preference = readStoredPreference();
  const filters = preference?.filters || {};

  const budgetEntry = Object.entries(BUDGET_RANGES).find(
    ([, range]) =>
      range.min_price === filters.min_price &&
      range.max_price === filters.max_price
  );

  const areaEntry = Object.entries(AREA_RANGES).find(
    ([, range]) =>
      range.min_area === filters.min_area &&
      range.max_area === filters.max_area
  );

  return {
    purpose: filters.listing_type === 'rent' ? 'rent' : 'sale',
    location: preference?.keyword || '',
    propertyType: filters.property_type || '',
    budget: budgetEntry?.[0] || '',
    bedrooms: filters.bedrooms ? String(filters.bedrooms) : '',
    area: areaEntry?.[0] || '',
    amenities: Array.isArray(filters.amenities)
      ? filters.amenities
      : [],
  };
};

const formatPrice = (price) => {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return 'Price unavailable';
  }

  return `₹${value.toLocaleString('en-IN')}`;
};

const getImage = (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return (
    images.find((image) => image.is_primary)?.url ||
    images[0]?.url ||
    null
  );
};

const buildPreference = (form) => {
  const filters = {
    listing_type: form.purpose,
  };

  if (form.propertyType) {
    filters.property_type = form.propertyType;
  }

  if (form.budget && BUDGET_RANGES[form.budget]) {
    Object.assign(filters, BUDGET_RANGES[form.budget]);
  }

  if (form.bedrooms) {
    filters.bedrooms = Number(form.bedrooms);
  }

  if (form.area && AREA_RANGES[form.area]) {
    Object.assign(filters, AREA_RANGES[form.area]);
  }

  if (form.amenities.length > 0) {
    filters.amenities = form.amenities;
  }

  return {
    keyword: form.location.trim(),
    filters,
    sort: 'relevance',
  };
};

const RecommendationCard = ({ item }) => {
  const property = item.property || {};
  const location = property.location || {};
  const image = getImage(property.images);

  return (
    <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        to={`/properties/${property._id}`}
        className="block"
      >
        <div className="relative h-48 bg-neutral-100">
          {image ? (
            <img
              src={image}
              alt={property.title || 'Recommended property'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              Property image unavailable
            </div>
          )}

          <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow">
            {Math.round(Number(item.match_score) || 0)}% Match
          </span>
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span className="rounded-full bg-primary-50 px-2 py-1 font-medium capitalize text-primary-700">
            {property.property_type || 'Property'}
          </span>

          <span className="capitalize">
            For {property.listing_type || 'sale'}
          </span>
        </div>

        <Link
          to={`/properties/${property._id}`}
          className="line-clamp-1 font-semibold text-neutral-900 hover:text-primary-700"
        >
          {property.title || 'Recommended Property'}
        </Link>

        <p className="mt-2 text-lg font-bold text-primary-700">
          {formatPrice(property.price)}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-500">
          {(location.locality || location.city) && (
            <span className="flex items-center gap-1">
              <FiMapPin size={13} />
              {[location.locality, location.city]
                .filter(Boolean)
                .join(', ')}
            </span>
          )}

          {property.area_sqft > 0 && (
            <span className="flex items-center gap-1">
              <FiMaximize2 size={13} />
              {Number(property.area_sqft).toLocaleString('en-IN')} sq.ft.
            </span>
          )}

          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <FiHome size={13} />
              {property.bedrooms} Beds
            </span>
          )}
        </div>

        {Array.isArray(item.match_reasons) &&
          item.match_reasons.length > 0 && (
            <div className="mt-4 border-t border-neutral-100 pt-3">
              <p className="mb-2 text-xs font-semibold text-neutral-700">
                Why recommended?
              </p>

              <ul className="space-y-1">
                {item.match_reasons.slice(0, 4).map((reason, index) => (
                  <li
                    key={`${reason}-${index}`}
                    className="flex items-start gap-2 text-xs text-neutral-500"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

        <Link
          to={`/properties/${property._id}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-800"
        >
          View Property
        </Link>
      </div>
    </article>
  );
};

const RecommendationCarousel = () => {
  const [form, setForm] = useState(getInitialForm);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const loadRecommendations = useCallback(async (extraPreference = null) => {
    setLoading(true);
    setError('');

    try {
      const savedSearches = getSavedSearches();

      const questionnairePreference =
        extraPreference || readStoredPreference();

      const preferences = [
        ...(Array.isArray(savedSearches) ? savedSearches : []),
        ...(questionnairePreference ? [questionnairePreference] : []),
      ];

      if (preferences.length === 0) {
        setRecommendations([]);
        setHasSubmitted(false);
        return;
      }

      const result = await getPropertyRecommendations(preferences);

      setRecommendations(
        Array.isArray(result?.recommendations)
          ? result.recommendations
          : []
      );

      setHasSubmitted(true);
    } catch (err) {
      console.error('Failed to load recommendations:', err);

      setError(
        err.response?.data?.message ||
          'Recommendations could not be loaded. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedPreference = readStoredPreference();

    if (storedPreference) {
      loadRecommendations(storedPreference);
    } else {
      const savedSearches = getSavedSearches();

      if (savedSearches.length > 0) {
        loadRecommendations();
      }
    }
  }, [loadRecommendations]);

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleAmenity = (amenity) => {
    setForm((previous) => ({
      ...previous,
      amenities: previous.amenities.includes(amenity)
        ? previous.amenities.filter((item) => item !== amenity)
        : [...previous.amenities, amenity],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const hasAnyPreference =
      form.location.trim() ||
      form.propertyType ||
      form.budget ||
      form.bedrooms ||
      form.area ||
      form.amenities.length > 0;

    if (!hasAnyPreference) {
      setError('Please select at least one property preference.');
      return;
    }

    const preference = buildPreference(form);

    try {
      localStorage.setItem(
        PREFERENCE_STORAGE_KEY,
        JSON.stringify(preference)
      );
    } catch (storageError) {
      console.error('Could not save recommendation preferences:', storageError);
    }

    await loadRecommendations(preference);
  };

  return (
    <section className="mt-10">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-neutral-900">
          Find Your Perfect Property
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Tell us what you are looking for. We will find matching approved properties.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              I want to
            </label>

            <select
              value={form.purpose}
              onChange={(event) => updateForm('purpose', event.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            >
              <option value="sale">Buy a property</option>
              <option value="rent">Rent a property</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Preferred city or locality
            </label>

            <input
              type="text"
              value={form.location}
              onChange={(event) => updateForm('location', event.target.value)}
              placeholder="e.g. Kanpur, Civil Lines"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Property type
            </label>

            <select
              value={form.propertyType}
              onChange={(event) => updateForm('propertyType', event.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            >
              <option value="">Any property type</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Budget
            </label>

            <select
              value={form.budget}
              onChange={(event) => updateForm('budget', event.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            >
              <option value="">Any budget</option>
              <option value="under50">Below ₹50 Lakhs</option>
              <option value="range50to100">₹50–100 Lakhs</option>
              <option value="range100to200">₹1–2 Crore</option>
              <option value="above200">Above ₹2 Crore</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Bedrooms
            </label>

            <select
              value={form.bedrooms}
              onChange={(event) => updateForm('bedrooms', event.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            >
              <option value="">Any bedrooms</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Preferred area
            </label>

            <select
              value={form.area}
              onChange={(event) => updateForm('area', event.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-600"
            >
              <option value="">Any area</option>
              <option value="under1000">Below 1,000 sq.ft.</option>
              <option value="range1000to1500">1,000–1,500 sq.ft.</option>
              <option value="range1500to2500">1,500–2,500 sq.ft.</option>
              <option value="above2500">Above 2,500 sq.ft.</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-neutral-700">
            Preferred amenities
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AMENITY_OPTIONS.map((amenity) => (
              <label
                key={amenity}
                className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600"
              >
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="h-4 w-4 rounded border-neutral-300 accent-primary-700"
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSearch size={16} />
            {loading ? 'Finding Properties...' : 'Get My Recommendations'}
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({
                purpose: 'sale',
                location: '',
                propertyType: '',
                budget: '',
                bedrooms: '',
                area: '',
                amenities: [],
              });
              setError('');
            }}
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Clear Preferences
          </button>
        </div>
      </form>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Recommended Properties
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Recommendations based on your questionnaire and saved searches.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadRecommendations()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          <FiRefreshCw
            size={15}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
          <FiRefreshCw
            size={24}
            className="mx-auto animate-spin text-primary-700"
          />
          <p className="mt-3 text-sm text-neutral-500">
            Finding properties that match your preferences...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <FiAlertCircle
            size={24}
            className="mx-auto text-red-600"
          />
          <p className="mt-3 text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={() => loadRecommendations()}
            className="mt-3 text-sm font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
          <FiSearch
            size={25}
            className="mx-auto text-primary-700"
          />

          <h3 className="mt-3 font-semibold text-neutral-900">
            {hasSubmitted
              ? 'No matching properties found'
              : 'Tell us your property preferences'}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            {hasSubmitted
              ? 'Try changing your location, budget or property requirements.'
              : 'Complete the questionnaire above to receive personalized property recommendations.'}
          </p>

          {!hasSubmitted && (
            <p className="mt-3 text-xs text-neutral-400">
              You can also receive suggestions based on your saved searches.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((item) => (
              <RecommendationCard
                key={item.property?._id}
                item={item}
              />
            ))}
          </div>

          <p className="mt-4 text-xs text-neutral-400">
            Match scores use rule-based preference scoring of approved listings.
            They are indicative matches, not guarantees of property suitability.
          </p>
        </>
      )}
    </section>
  );
};

export default RecommendationCarousel;
