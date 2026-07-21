import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';

const PROPERTY_TYPES = ['apartment', 'villa', 'plot', 'commercial'];
const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

const PropertyFilters = ({ filters, onChange, onClear }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">Filters</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-primary-700 hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-900">Price Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.min_price || ''}
              onChange={(e) => handleChange('min_price', e.target.value)}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none"
            />
            <span className="text-neutral-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.max_price || ''}
              onChange={(e) => handleChange('max_price', e.target.value)}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-900">Property Type</label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  handleChange('property_type', filters.property_type === type ? '' : type)
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                  filters.property_type === type
                    ? 'bg-primary-700 text-white'
                    : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-900">Bedrooms</label>
          <div className="flex flex-wrap gap-2">
            {BEDROOM_OPTIONS.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() =>
                  handleChange('bedrooms', filters.bedrooms === String(num) ? '' : String(num))
                }
                className={`h-8 w-8 rounded-full text-xs font-medium transition ${
                  filters.bedrooms === String(num)
                    ? 'bg-primary-700 text-white'
                    : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                {num}+
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-900">Area (sqft)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.min_area || ''}
              onChange={(e) => handleChange('min_area', e.target.value)}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none"
            />
            <span className="text-neutral-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.max_area || ''}
              onChange={(e) => handleChange('max_area', e.target.value)}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary-700 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const activeFilterLabel = (key, value) => {
  const labels = {
    min_price: `Min ₹${value}`,
    max_price: `Max ₹${value}`,
    property_type: value,
    bedrooms: `${value}+ BHK`,
    min_area: `Min ${value} sqft`,
    max_area: `Max ${value} sqft`,
  };
  return labels[key] || value;
};

export const ActiveFilterPills = ({ filters, onRemove }) => {
  const activeEntries = Object.entries(filters).filter(([, value]) => value);

  if (activeEntries.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {activeEntries.map(([key, value]) => (
        <span
          key={key}
          className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium capitalize text-primary-700"
        >
          {activeFilterLabel(key, value)}
          <button type="button" onClick={() => onRemove(key)} aria-label={`Remove ${key} filter`}>
            <FiX size={12} />
          </button>
        </span>
      ))}
    </div>
  );
};

ActiveFilterPills.propTypes = {
  filters: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
};

PropertyFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default PropertyFilters;