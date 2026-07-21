import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiBarChart2 } from 'react-icons/fi';
import Badge from '../common/Badge';
import { toggleWishlist } from '../../services/wishlist.service';
import { useAuth } from '../../hooks/useAuth';
import { useCompare } from '../../hooks/useCompare';

const PropertyCard = ({ property, initialWishlisted = false }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const { user } = useAuth();
  const { compareIds, toggleCompare } = useCompare();

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const price = property.price;
  const aiPrice = property.ai_predicted_price || property.aiPredictedPrice;
  const priceGapPct = aiPrice ? Math.round(((price - aiPrice) / aiPrice) * 100) : 0;
  const isFairPriced = priceGapPct <= 2;

  const primaryImage =
    property.images?.find((img) => img.is_primary)?.url ||
    property.images?.[0]?.url ||
    property.image ||
    'https://picsum.photos/seed/placeholder/500/400';

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsWishlisted((prev) => !prev); // optimistic update
    try {
      await toggleWishlist(property._id || property.id);
    } catch (err) {
      setIsWishlisted((prev) => !prev); // revert on failure
    }
  };

  const isComparing = compareIds.includes(property._id || property.id);

  return (
    <Link
      to={`/properties/${property._id || property.id}`}
      className="group block overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={primaryImage}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm transition hover:scale-110"
        >
          <FiHeart
            className={isWishlisted ? 'fill-danger-600 text-danger-600' : 'text-neutral-900'}
            size={16}
          />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleCompare(property._id || property.id);
          }}
          aria-label="Add to compare"
          className={`absolute right-3 top-14 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition hover:scale-110 ${
            isComparing ? 'bg-primary-700 text-white' : 'bg-white/90 text-neutral-900'
          }`}
        >
          <FiBarChart2 size={16} />
        </button>

        {aiPrice && (
          <div className="absolute bottom-3 left-3">
            <Badge tone={isFairPriced ? 'success' : 'warning'}>
              {isFairPriced ? '✨ Fair Price' : `⚠ ${priceGapPct}% above AI est.`}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-semibold text-neutral-900">
            ₹{(price / 100000).toFixed(1)}L
          </span>
          <span className="text-xs capitalize text-neutral-500">{property.property_type || property.type}</span>
        </div>

        <h3 className="mt-1 truncate text-sm font-medium text-neutral-900">{property.title}</h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
          <FiMapPin size={12} />
          {property.location?.city || property.location}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-xs text-neutral-500">
          <span>
            {property.bedrooms} BHK · {property.area_sqft || property.area} sqft
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