import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiBarChart2 } from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PropertyCard from '../../components/property/PropertyCard';
import PropertyFilters, { ActiveFilterPills } from '../../components/property/PropertyFilters';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { searchProperties } from '../../services/property.service';
import { useDebounce } from '../../hooks/useDebounce';
import { useCompare } from '../../hooks/useCompare';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const PropertyListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { compareIds } = useCompare();

  const [filters, setFilters] = useState({
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    property_type: searchParams.get('type') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    min_area: '',
    max_area: '',
  });

  const [keyword, setKeyword] = useState(searchParams.get('location') || '');
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);

  const debouncedKeyword = useDebounce(keyword, 400);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        q: debouncedKeyword || undefined,
        min_price: filters.min_price || undefined,
        max_price: filters.max_price || undefined,
        property_type: filters.property_type || undefined,
        bedrooms: filters.bedrooms || undefined,
        min_area: filters.min_area || undefined,
        max_area: filters.max_area || undefined,
        sort,
        page,
        limit: 12,
      };
      const { data } = await searchProperties(params);
      setProperties(data.data.properties);
      setPagination(data.data.pagination);
    } catch (err) {
      setError('Something went wrong while fetching properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, filters, sort, page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, filters, sort]);

  const handleClearFilters = () => {
    setFilters({
      min_price: '',
      max_price: '',
      property_type: '',
      bedrooms: '',
      min_area: '',
      max_area: '',
    });
    setSearchParams({});
  };

  const handleRemoveFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
  };

  return (
    <div className="min-h-screen bg-neutral-0">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-28">
        {/* Search bar + sort */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by location, title..."
              className="w-full rounded-md border border-neutral-200 py-2.5 pl-9 pr-3 text-sm focus:border-primary-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            {compareIds.length > 0 && (
              <Button as={Link} to="/compare" variant="accent" size="sm">
                <FiBarChart2 size={14} />
                Compare ({compareIds.length})
              </Button>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary-700 focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PropertyFilters filters={filters} onChange={setFilters} onClear={handleClearFilters} />
          </aside>

          {/* Results */}
          <div>
            <ActiveFilterPills filters={filters} onRemove={handleRemoveFilter} />

            <p className="mb-4 text-sm text-neutral-500">
              {loading ? 'Searching...' : `${pagination.total_count} properties found`}
            </p>

            {loading && <Loader count={8} />}

            {!loading && error && (
              <EmptyState title="Something went wrong" description={error} />
            )}

            {!loading && !error && properties.length === 0 && (
              <EmptyState
                title="No properties match these filters yet"
                description="Try adjusting your filters or search for a different location."
                action={
                  <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                    Reset Filters
                  </Button>
                }
              />
            )}

            {!loading && !error && properties.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {properties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-3 text-sm text-neutral-500">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page >= pagination.total_pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyListingPage;