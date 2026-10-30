
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiBarChart2 } from 'react-icons/fi';

import Badge from '../common/Badge';

import {
  toggleWishlist,
  removeFromWishlist,
} from '../../services/wishlist.service';

import { useAuth } from '../../hooks/useAuth';
import { useCompare } from '../../hooks/useCompare';

// Format property price
const formatPropertyPrice = (price, listingType) => {
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Price on request';
  }

  // Monthly rent
  if (listingType === 'rent') {
    return `₹${amount.toLocaleString('en-IN')}/month`;
  }

  // Crore
  if (amount >= 10000000) {
    return `₹${Number((amount / 10000000).toFixed(2))} Cr`;
  }

  // Lakh
  if (amount >= 100000) {
    return `₹${Number((amount / 100000).toFixed(2))} Lakh`;
  }

  return `₹${amount.toLocaleString('en-IN')}`;
};

const PropertyCard = ({
  property,
  initialWishlisted = false,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { user } = useAuth();
  const { compareIds, toggleCompare } = useCompare();

  const propertyId = property?._id || property?.id;

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  // Property price
  const price = Number(property?.price) || 0;

  // AI predicted price
  const aiPrice = Number(
    property?.ai_predicted_price || property?.aiPredictedPrice
  );

  // Difference between actual price and AI price
  const priceGapPct =
    aiPrice > 0
      ? Math.round(((price - aiPrice) / aiPrice) * 100)
      : 0;

  const isFairPriced = priceGapPct <= 2;

  // Get primary property image
  const primaryImage =
    property?.images?.find((img) => img.is_primary)?.url ||
    property?.images?.[0]?.url ||
    property?.image ||
    'https://picsum.photos/seed/property-placeholder/600/400';

  // Wishlist handler
  const handleWishlistClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (wishlistLoading) return;

    if (!user) {
      window.alert('Please log in to save properties to your wishlist.');
      return;
    }

    if (!propertyId) {
      window.alert('Property ID is missing.');
      return;
    }

    const previousState = isWishlisted;

    setWishlistLoading(true);
    setIsWishlisted(!previousState);

    try {
      if (previousState) {
        await removeFromWishlist(propertyId);
      } else {
        await toggleWishlist(propertyId);
      }
    } catch (error) {
      setIsWishlisted(previousState);

      console.error('Wishlist update failed:', error);

      window.alert(
        error.response?.data?.message ||
          'Could not update wishlist. Please try again.'
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // Compare status
  const isComparing = compareIds.some(
    (id) => String(id) === String(propertyId)
  );

  // Compare handler
  const handleCompareClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (propertyId) {
      toggleCompare(propertyId);
    }
  };

  // Property location
  const propertyCity =
    typeof property?.location === 'object'
      ? property?.location?.city
      : property?.location;

  // Property type
  const propertyType =
    property?.property_type || property?.type || 'Property';

  // Listing type
  const listingType = property?.listing_type || 'sale';

  // Bedrooms and area
  const bedrooms = property?.bedrooms ?? property?.bhk ?? '—';

  const area =
    property?.area_sqft || property?.area || '—';

  return (
    <Link
      to={`/properties/${propertyId}`}
      className="group block overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden bg-neutral-100">
        <img
          src={
            imageError
              ? 'https://picsum.photos/seed/property-fallback/600/400'
              : primaryImage
          }
          alt={property?.title || 'Property'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm transition hover:scale-110 disabled:opacity-60"
        >
          <FiHeart
            size={16}
            className={
              isWishlisted
                ? 'fill-red-600 text-red-600'
                : 'text-neutral-900'
            }
          />
        </button>

        {/* Compare Button */}
        <button
          type="button"
          onClick={handleCompareClick}
          aria-pressed={isComparing}
          aria-label={
            isComparing
              ? 'Remove from comparison'
              : 'Add to comparison'
          }
          className={`absolute right-3 top-14 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition hover:scale-110 ${
            isComparing
              ? 'bg-primary-700 text-white'
              : 'bg-white/90 text-neutral-900'
          }`}
        >
          <FiBarChart2 size={16} />
        </button>

        {/* AI Price Badge */}
        {aiPrice > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge tone={isFairPriced ? 'success' : 'warning'}>
              {isFairPriced
                ? '✨ Fair Price'
                : `⚠ ${priceGapPct}% above AI est.`}
            </Badge>
          </div>
        )}

        {/* Sale / Rent Badge */}
        <div className="absolute left-3 top-3">
          <span className="rounded-md bg-primary-700 px-2 py-1 text-xs font-medium capitalize text-white">
            {listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4">
        {/* Price and Property Type */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-semibold text-neutral-900">
            {formatPropertyPrice(price, listingType)}
          </span>

          <span className="text-xs capitalize text-neutral-500">
            {propertyType}
          </span>
        </div>

        {/* Property Title */}
        <h3 className="mt-1 truncate text-sm font-medium text-neutral-900">
          {property?.title || 'Untitled Property'}
        </h3>

        {/* Property Location */}
        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
          <FiMapPin size={12} />

          <span className="truncate">
            {propertyCity || 'Location unavailable'}
          </span>
        </p>

        {/* Property Features */}
        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-xs text-neutral-500">
          <span>
            {bedrooms} BHK · {area} sqft
          </span>

          {property?.bathrooms != null && (
            <span>
              {property.bathrooms} Baths
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
  initialWishlisted: PropTypes.bool,
};

export default PropertyCard;

