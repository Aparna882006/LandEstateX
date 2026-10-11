
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiHeart,
  FiCalendar,
  FiTrendingUp,
  FiMessageCircle,
  FiRefreshCw,
} from 'react-icons/fi';

import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { getMyBookings } from '../../services/appointment.service';
import { getWishlist } from '../../services/wishlist.service';
import { getSavedSearches } from '../../services/savedSearch.service';

const QUICK_ACTIONS = [
  {
    icon: FiSearch,
    label: 'Search Properties',
    description: 'Find your next home or investment',
    to: '/properties',
  },
  {
    icon: FiHeart,
    label: 'Wishlist',
    description: 'View properties you have saved',
    to: '/wishlist',
  },
  {
    icon: FiCalendar,
    label: 'Appointments',
    description: 'Manage your site visits',
    to: '/my-appointments',
  },
  {
    icon: FiTrendingUp,
    label: 'Loan & EMI',
    description: 'Check eligibility and calculate EMI',
    to: '/loan-calculator',
  },
];

const getAppointmentsFromResponse = (response) => {
  const body = response?.data?.data ?? response?.data;

  if (Array.isArray(body?.appointments)) {
    return body.appointments;
  }

  if (Array.isArray(body?.data?.appointments)) {
    return body.data.appointments;
  }

  if (Array.isArray(body)) {
    return body;
  }

  return [];
};

const getWishlistItemsFromResponse = (response) => {
  const body = response?.data?.data ?? response?.data;

  if (Array.isArray(body?.items)) {
    return body.items;
  }

  if (Array.isArray(body?.data?.items)) {
    return body.data.items;
  }

  return [];
};

const getUpcomingVisitsCount = (appointments) => {
  const now = new Date();

  return appointments.filter((appointment) => {
    const scheduledAt = new Date(appointment.scheduled_at);

    return (
      !Number.isNaN(scheduledAt.getTime()) &&
      scheduledAt >= now &&
      ['pending', 'confirmed'].includes(appointment.status)
    );
  }).length;
};

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const [savedProperties, setSavedProperties] = useState(0);
  const [upcomingVisits, setUpcomingVisits] = useState(0);
  const [activeSearches, setActiveSearches] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    const nextErrors = [];

    // Load saved searches from localStorage
    try {
      const searches = getSavedSearches();

      setActiveSearches(
        Array.isArray(searches) ? searches.length : 0
      );
    } catch (error) {
      console.error('Failed to load saved searches:', error);
      nextErrors.push('Saved searches could not be loaded.');
    }

    // Load wishlist and appointments
    const [wishlistResult, appointmentsResult] =
      await Promise.allSettled([
        getWishlist(),
        getMyBookings(),
      ]);

    if (wishlistResult.status === 'fulfilled') {
      const items = getWishlistItemsFromResponse(
        wishlistResult.value
      );

      setSavedProperties(items.length);
    } else {
      console.error(
        'Failed to load wishlist:',
        wishlistResult.reason
      );

      nextErrors.push('Saved properties could not be loaded.');
    }

    if (appointmentsResult.status === 'fulfilled') {
      const appointments = getAppointmentsFromResponse(
        appointmentsResult.value
      );

      setUpcomingVisits(
        getUpcomingVisitsCount(appointments)
      );
    } else {
      console.error(
        'Failed to load appointments:',
        appointmentsResult.reason
      );

      nextErrors.push('Upcoming visits could not be loaded.');
    }

    setErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Active Searches now opens Saved Searches page
  const stats = [
    {
      label: 'Saved Properties',
      value: savedProperties,
      to: '/wishlist',
    },
    {
      label: 'Upcoming Visits',
      value: upcomingVisits,
      to: '/my-appointments',
    },
    {
      label: 'Active Searches',
      value: activeSearches,
      to: '/saved-searches',
    },
    {
      label: 'Account Status',
      value: user?.is_verified ? 'Verified' : 'Pending',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-0">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700 text-lg font-bold text-white">
              X
            </span>

            <span className="text-lg font-semibold text-neutral-900">
              LandEstateX
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">
              Hi,{' '}
              <span className="font-medium text-neutral-900">
                {user?.full_name || 'User'}
              </span>
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Welcome back,{' '}
              {user?.full_name?.split(' ')[0] || 'User'} 👋
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Here's what's happening with your property journey.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            <FiRefreshCw
              className={loading ? 'animate-spin' : ''}
            />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {errors.length > 0 && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <p className="font-semibold">
              Some dashboard information could not be loaded.
            </p>

            <ul className="mt-1 list-inside list-disc">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>

            <button
              type="button"
              onClick={loadDashboardData}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Dashboard statistics */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => {
            const content = (
              <>
                <p className="text-xl font-semibold text-primary-700">
                  {loading && typeof stat.value === 'number'
                    ? '...'
                    : stat.value}
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  {stat.label}
                </p>
              </>
            );

            return stat.to ? (
              <Link
                key={stat.label}
                to={stat.to}
                className="rounded-lg border border-neutral-200 bg-white p-4 text-center transition hover:border-primary-300 hover:shadow-sm"
              >
                {content}
              </Link>
            ) : (
              <div
                key={stat.label}
                className="rounded-lg border border-neutral-200 bg-white p-4 text-center"
              >
                {content}
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className="group rounded-lg border border-neutral-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-100 text-primary-700 transition group-hover:bg-primary-700 group-hover:text-white">
                    <Icon size={18} />
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-neutral-900">
                    {action.label}
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <FiSearch size={20} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-neutral-900">
            No recommendations yet
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">
            Start searching for properties to get personalized AI
            recommendations here.
          </p>

          <div className="mt-4">
            <Button
              as={Link}
              to="/properties"
              variant="primary"
              size="sm"
            >
              Start Exploring Properties
            </Button>
          </div>
        </div>

        {/* AI assistant information */}
        <div className="mt-10 flex items-center gap-3 rounded-lg border border-primary-100 bg-primary-100/40 p-4">
          <FiMessageCircle
            className="shrink-0 text-primary-700"
            size={20}
          />

          <p className="text-sm text-neutral-900">
            Have a question? Ask our AI assistant — it can help
            with price checks, EMI calculations, and property
            recommendations.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
