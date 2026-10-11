
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

const PropertyCard = ({ property, initialWishlisted = false }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const { user } = useAuth();
  const { compareIds, toggleCompare } = useCompare();

  const propertyId = property?._id || property?.id;

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const price = Number(property?.price) || 0;
  const aiPrice = Number(
    property?.ai_predicted_price || property?.aiPredictedPrice
  );

  const priceGapPct =
    aiPrice > 0 ? Math.round(((price - aiPrice) / aiPrice) * 100) : 0;

  const isFairPriced = priceGapPct <= 2;

  const primaryImage =
    property?.images?.find((img) => img.is_primary)?.url ||
    property?.images?.[0]?.url ||
    property?.image ||
    'https://picsum.photos/seed/placeholder/500/400';

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

  const isComparing = compareIds.some(
    (id) => String(id) === String(propertyId)
  );

  const handleCompareClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (propertyId) {
      toggleCompare(propertyId);
    }
  };

  return (
    <Link
      to={`/properties/${propertyId}`}
      className="group block overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={primaryImage}
          alt={property?.title || 'Property'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
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

        <button
          type="button"
          onClick={handleCompareClick}
          aria-pressed={isComparing}
          aria-label={
            isComparing ? 'Remove from comparison' : 'Add to comparison'
          }
          className={`absolute right-3 top-14 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition hover:scale-110 ${
            isComparing
              ? 'bg-primary-700 text-white'
              : 'bg-white/90 text-neutral-900'
          }`}
        >
          <FiBarChart2 size={16} />
        </button>

        {aiPrice > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge tone={isFairPriced ? 'success' : 'warning'}>
              {isFairPriced
                ? '✨ Fair Price'
                : `⚠ ${priceGapPct}% above AI est.`}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-semibold text-neutral-900">
            ₹{(price / 100000).toFixed(1)}L
          </span>

          <span className="text-xs capitalize text-neutral-500">
            {property?.property_type || property?.type || 'Property'}
          </span>
        </div>

        <h3 className="mt-1 truncate text-sm font-medium text-neutral-900">
          {property?.title || 'Untitled Property'}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
          <FiMapPin size={12} />
          {property?.location?.city ||
            property?.location ||
            'Location unavailable'}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-xs text-neutral-500">
          <span>
            {property?.bedrooms ?? property?.bhk ?? '—'} BHK ·{' '}
            {property?.area_sqft || property?.area || '—'} sqft
          </span>
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
