import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import Button from '../common/Button';

const PURPOSES = ['Buy', 'Rent', 'Invest'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Commercial'];

const AISearchBar = () => {
  const [purpose, setPurpose] = useState('Buy');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [budget, setBudget] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      purpose: purpose.toLowerCase(),
      location,
      type: propertyType.toLowerCase(),
      budget,
    });
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full rounded-xl border border-neutral-200 bg-white p-3 shadow-md sm:p-4"
    >
      <div className="mb-3 flex gap-2">
        {PURPOSES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPurpose(p)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              purpose === p
                ? 'bg-primary-700 text-white'
                : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or locality (e.g. Gomti Nagar, Lucknow)"
          className="flex-1 rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary-700 focus:outline-none"
        />

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary-700 focus:outline-none sm:w-40"
        >
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary-700 focus:outline-none sm:w-44"
        >
          <option value="">Any budget</option>
          <option value="0-2500000">Under ₹25L</option>
          <option value="2500000-5000000">₹25L - ₹50L</option>
          <option value="5000000-10000000">₹50L - ₹1Cr</option>
          <option value="10000000-999999999">₹1Cr+</option>
        </select>

        <Button type="submit" variant="primary" size="md" className="whitespace-nowrap">
          <FiSearch size={16} />
          Search
        </Button>
      </div>

      {location && (
        <p className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
          <span className="text-accent-600">⚡</span>
          Searching properties in <span className="font-medium">{location}</span>
        </p>
      )}
    </form>
  );
};

export default AISearchBar;