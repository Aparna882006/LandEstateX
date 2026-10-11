
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiRefreshCw,
  FiHome,
  FiUser,
  FiMail,
  FiPhone,
} from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Loader from '../../components/common/Loader';
import { getMyBookings } from '../../services/appointment.service';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

const getAppointmentArray = (response) => {
  const body = response?.data?.data ?? response?.data;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.appointments)) return body.appointments;
  if (Array.isArray(body?.data?.appointments)) {
    return body.data.appointments;
  }

  return [];
};

const formatDate = (value) => {
  if (!value) return 'Date not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (value) => {
  if (!value) return 'Time not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Time not available';
  }

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatLocation = (location) => {
  if (!location) return '';

  if (typeof location === 'string') {
    return location;
  }

  if (typeof location === 'object') {
    return [
      location.address,
      location.locality,
      location.city,
      location.state,
      location.pincode,
    ]
      .filter((part) => typeof part === 'string' && part.trim())
      .join(', ');
  }

  return '';
};

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAppointments = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const response = await getMyBookings();
      setAppointments(getAppointmentArray(response));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Could not load your appointments. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const counts = useMemo(() => {
    const result = {
      all: appointments.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    appointments.forEach((appointment) => {
      if (result[appointment.status] !== undefined) {
        result[appointment.status] += 1;
      }
    });

    return result;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (activeFilter === 'all') return appointments;

    return appointments.filter(
      (appointment) => appointment.status === activeFilter
    );
  }, [appointments, activeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-28 sm:px-6 sm:pb-8 sm:pt-32 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Buyer Dashboard
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Appointments
            </h1>

            <p className="mt-2 text-slate-600">
              Manage your property visits and check their status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAppointments(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                activeFilter === filter.value
                  ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="block text-sm text-slate-600">
                {filter.label}
              </span>

              <span className="mt-2 block text-2xl font-bold">
                {counts[filter.value]}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => loadAppointments()}
              className="shrink-0 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <FiCalendar size={28} />
            </div>

            <h2 className="text-xl font-bold">
              {appointments.length === 0
                ? 'No appointments yet'
                : `No ${activeFilter} appointments`}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600">
              {appointments.length === 0
                ? 'When you request a visit for a property, it will appear here.'
                : 'Try selecting another status filter to see your appointments.'}
            </p>

            {appointments.length === 0 && (
              <Link
                to="/properties"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Browse Properties
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredAppointments.map((appointment) => {
              const property =
                appointment.property_id &&
                typeof appointment.property_id === 'object'
                  ? appointment.property_id
                  : appointment.property &&
                      typeof appointment.property === 'object'
                    ? appointment.property
                    : null;

              const broker =
                appointment.broker_id &&
                typeof appointment.broker_id === 'object'
                  ? appointment.broker_id
                  : null;

              const appointmentId =
                appointment._id || appointment.id;

              const propertyId =
                property?._id ||
                property?.id ||
                (typeof appointment.property_id === 'string'
                  ? appointment.property_id
                  : null);

              const title = property?.title || 'Property visit';
              const location = formatLocation(
                property?.location || property?.address
              );

              const status = appointment.status || 'pending';

              return (
                <article
                  key={appointmentId}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FiHome size={26} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="break-words text-lg font-bold sm:text-xl">
                          {title}
                        </h2>

                        {location && (
                          <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                            <FiMapPin className="mt-0.5 shrink-0" />
                            <span>{location}</span>
                          </p>
                        )}

                        {property?.price != null && (
                          <p className="mt-2 font-semibold text-indigo-700">
                            ₹{Number(property.price).toLocaleString('en-IN')}
                            {property.listing_type === 'rent' ? ' / month' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                        STATUS_STYLES[status] ||
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                    <div className="flex items-start gap-3">
                      <FiCalendar className="mt-1 shrink-0 text-indigo-600" />

                      <div>
                        <p className="text-sm text-slate-500">
                          Visit date
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatDate(appointment.scheduled_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiClock className="mt-1 shrink-0 text-indigo-600" />

                      <div>
                        <p className="text-sm text-slate-500">
                          Visit time
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatTime(appointment.scheduled_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiUser className="mt-1 shrink-0 text-indigo-600" />

                      <div>
                        <p className="text-sm text-slate-500">
                          Broker
                        </p>

                        <p className="mt-1 font-semibold">
                          {broker?.full_name || 'Broker details unavailable'}
                        </p>

                        {broker?.email && (
                          <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-600">
                            <FiMail className="shrink-0" />
                            {broker.email}
                          </p>
                        )}

                        {broker?.phone_number && (
                          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                            <FiPhone className="shrink-0" />
                            {broker.phone_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                      <p className="text-sm font-semibold text-slate-700">
                        Your notes
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
                    <p className="text-xs text-slate-500">
                      Booking ID: {appointmentId || 'Unavailable'}
                    </p>

                    {propertyId && (
                      <Link
                        to={`/properties/${propertyId}`}
                        className="font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        View Property
                      </Link>
                    )}
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

export default MyAppointmentsPage;
