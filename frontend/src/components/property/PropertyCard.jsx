import { useState } from 'react';
import PropTypes from 'prop-types';
import { FiHeart, FiMapPin } from 'react-icons/fi';
import Badge from '../common/Badge';

const PropertyCard = ({ property }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const priceGapPct = Math.round(
    ((property.price - property.aiPredictedPrice) / property.aiPredictedPrice) * 100
  );
  const isFairPriced = priceGapPct <= 2;

  return (
    <div className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <button
          type="button"
          onClick={() => setIsWishlisted((prev) => !prev)}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm transition hover:scale-110"
        >
          <FiHeart
            className={isWishlisted ? 'fill-danger-600 text-danger-600' : 'text-neutral-900'}
            size={16}
          />
        </button>

        <div className="absolute bottom-3 left-3">
          <Badge tone={isFairPriced ? 'success' : 'warning'}>
            {isFairPriced ? '✨ Fair Price' : `⚠ ${priceGapPct}% above AI est.`}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-semibold text-neutral-900">
            ₹{(property.price / 100000).toFixed(1)}L
          </span>
          <span className="text-xs text-neutral-500">{property.type}</span>
        </div>

        <h3 className="mt-1 truncate text-sm font-medium text-neutral-900">{property.title}</h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
          <FiMapPin size={12} />
          {property.location}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-xs text-neutral-500">
          <span>
            {property.bedrooms} BHK · {property.area} sqft
          </span>
          <span className="flex items-center gap-1 font-medium text-neutral-900">
            🛡 {property.brokerTrustScore}
          </span>
        </div>
      </div>
    </div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    aiPredictedPrice: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    bedrooms: PropTypes.number.isRequired,
    area: PropTypes.number.isRequired,
    brokerTrustScore: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};

export default PropertyCard;