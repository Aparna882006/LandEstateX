
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiBookmark,
  FiSearch,
  FiTrash2,
  FiArrowLeft,
} from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';

import {
  getSavedSearches,
  deleteSavedSearch,
} from '../../services/savedSearch.service';

const FILTER_LABELS = {
  min_price: 'Minimum Price',
  max_price: 'Maximum Price',
  property_type: 'Property Type',
  bedrooms: 'Bedrooms',
  min_area: 'Minimum Area',
  max_area: 'Maximum Area',
};

const formatValue = (key, value) => {
  if (!value) return '';

  if (key === 'min_price' || key === 'max_price') {
    return Number(value).toLocaleString('en-IN');
  }

  return String(value);
};

const SavedSearchesPage = () => {
  const navigate = useNavigate();

  const [searches, setSearches] = useState([]);
  const [message, setMessage] = useState('');

  const loadSearches = useCallback(() => {
    try {
      setSearches(getSavedSearches());
    } catch (error) {
      console.error('Failed to load saved searches:', error);
      setMessage('Could not load saved searches.');
    }
  }, []);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  const handleDelete = (id) => {
    try {
      const updated = deleteSavedSearch(id);
      setSearches(updated);
      setMessage('Saved search deleted.');
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      setMessage('Could not delete this search. Please try again.');
    }
  };

  const handleSearchAgain = (search) => {
    const params = new URLSearchParams();

    if (search.keyword) {
      params.set('location', search.keyword);
    }

    const filters = search.filters || {};

    if (filters.min_price) {
      params.set('min_price', filters.min_price);
    }

    if (filters.max_price) {
      params.set('max_price', filters.max_price);
    }

    if (filters.property_type) {
      params.set('type', filters.property_type);
    }

    if (filters.bedrooms) {
      params.set('bedrooms', filters.bedrooms);
    }

    if (filters.min_area) {
      params.set('min_area', filters.min_area);
    }

    if (filters.max_area) {
      params.set('max_area', filters.max_area);
    }

    if (search.sort) {
      params.set('sort', search.sort);
    }

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-neutral-0">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-700"
            >
              <FiArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-semibold text-neutral-900">
              Saved Searches
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Your saved property searches are all in one place.
            </p>
          </div>

          <Button
            as={Link}
            to="/properties"
            variant="primary"
            size="sm"
          >
            <FiSearch size={15} />
            Search Properties
          </Button>
        </div>

        {message && (
          <p role="status" className="mb-4 text-sm text-neutral-600">
            {message}
          </p>
        )}

        {searches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <FiBookmark size={22} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-neutral-900">
              No saved searches yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
              Search for properties and click Save Search to keep
              your search criteria here.
            </p>

            <div className="mt-5">
              <Button
                as={Link}
                to="/properties"
                variant="primary"
                size="sm"
              >
                Explore Properties
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {searches.map((search) => {
              const filters = search.filters || {};

              const activeFilters = Object.entries(filters).filter(
                ([, value]) =>
                  value !== '' &&
                  value !== null &&
                  value !== undefined
              );

              return (
                <article
                  key={search.id}
                  className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                          <FiBookmark size={18} />
                        </div>

                        <div className="min-w-0">
                          <h2 className="break-words font-semibold text-neutral-900">
                            {search.keyword || 'All Properties'}
                          </h2>

                          <p className="mt-1 text-xs text-neutral-500">
                            Saved on{' '}
                            {search.createdAt
                              ? new Date(search.createdAt).toLocaleDateString(
                                  'en-IN',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  }
                                )
                              : 'Unknown date'}
                          </p>
                        </div>
                      </div>

                      {activeFilters.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {activeFilters.map(([key, value]) => (
                            <span
                              key={key}
                              className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                            >
                              {FILTER_LABELS[key] || key}:{' '}
                              {formatValue(key, value)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-neutral-500">
                          No additional filters applied.
                        </p>
                      )}

                      <p className="mt-3 text-xs text-neutral-500">
                        Sort: {search.sort || 'relevance'}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSearchAgain(search)}
                      >
                        <FiSearch size={14} />
                        Search Again
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(search.id)}
                      >
                        <FiTrash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SavedSearchesPage;
