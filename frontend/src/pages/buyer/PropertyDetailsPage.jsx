
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FiHeart,
  FiMapPin,
  FiArrowLeft,
  FiHome,
  FiMaximize,
} from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

import {
  toggleWishlist,
  removeFromWishlist,
  getWishlist,
} from '../../services/wishlist.service';

import { getPropertyById } from '../../services/property.service';
import { createAppointment } from '../../services/appointment.service';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Appointment booking state
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProperty = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getPropertyById(id);
        const result = response?.data?.data;

        const propertyData =
          result?.property ||
          result?.data?.property ||
          result?.data ||
          result;

        if (!propertyData || cancelled) return;

        setProperty(propertyData);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              'Unable to load this property. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) loadProperty();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const checkWishlist = async () => {
      if (!user || !id) {
        setWishlisted(false);
        return;
      }

      try {
        const response = await getWishlist();
        const result = response?.data?.data;
        const items = result?.items || result?.wishlist || [];

        const found = items.some((item) => {
          const propertyId =
            item?.property?._id ||
            item?.property?.id ||
            item?.property_id ||
            item?.property;

          return String(propertyId) === String(id);
        });

        if (!cancelled) setWishlisted(found);
      } catch (err) {
        console.error('Could not check wishlist:', err);
      }
    };

    checkWishlist();

    return () => {
      cancelled = true;
    };
  }, [user, id]);

  const handleWishlist = async () => {
    if (!user) {
      window.alert('Please log in to save this property.');
      return;
    }

    if (wishlistLoading) return;

    const previous = wishlisted;
    setWishlistLoading(true);
    setWishlisted(!previous);

    try {
      if (previous) {
        await removeFromWishlist(id);
      } else {
        await toggleWishlist(id);
      }
    } catch (err) {
      setWishlisted(previous);
      window.alert(
        err.response?.data?.message ||
          'Could not update your wishlist. Please try again.'
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleBookVisit = async (event) => {
    event.preventDefault();

    if (!user) {
      setBookingError('Please log in to schedule a visit.');
      return;
    }

    if (user.role !== 'buyer') {
      setBookingError('Only buyer accounts can book property visits.');
      return;
    }

    if (!visitDate || !visitTime) {
      setBookingError('Please select a visit date and time.');
      return;
    }

    // Interpret the selected time in the visitor's local timezone.
    const scheduledAt = new Date(`${visitDate}T${visitTime}`);

    if (
      Number.isNaN(scheduledAt.getTime()) ||
      scheduledAt <= new Date()
    ) {
      setBookingError('Please select a future date and time.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingMessage('');

    try {
      await createAppointment({
        property_id: id,
        scheduled_at: scheduledAt.toISOString(),
        notes: visitNotes.trim(),
      });

      setBookingMessage(
        'Your visit request was submitted successfully. It is pending broker confirmation.'
      );

      setVisitDate('');
      setVisitTime('');
      setVisitNotes('');
      setShowVisitForm(false);
    } catch (err) {
      setBookingError(
        err.response?.data?.message ||
          'Unable to book the visit. Please try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto min-h-screen max-w-7xl px-6 pb-20 pt-28">
          <Loader count={1} />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Navbar />
        <main className="mx-auto min-h-screen max-w-7xl px-6 pb-20 pt-28">
          <Link
            to="/properties"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600"
          >
            <FiArrowLeft /> Back to properties
          </Link>

          <div className="rounded-lg border border-neutral-200 p-8">
            <h1 className="text-xl font-semibold">
              Property could not be loaded
            </h1>

            <p className="mt-2 text-neutral-600">
              {error || 'This property may no longer be available.'}
            </p>

            <div className="mt-5">
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images =
    property.images
      ?.map((image) => (
        typeof image === 'string' ? image : image.url
      ))
      .filter(Boolean) || [];

  if (images.length === 0 && property.image) {
    images.push(property.image);
  }

  const location =
    typeof property.location === 'object'
      ? [
          property.location.address,
          property.location.city,
          property.location.state,
        ]
          .filter(Boolean)
          .join(', ')
      : property.location;

  const price = Number(property.price) || 0;
  const minDate = new Date().toLocaleDateString('en-CA');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-28">
        <Link
          to="/properties"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <FiArrowLeft /> Back to properties
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activeImage] || images[0]}
                    alt={property.title || 'Property'}
                    className="h-72 w-full object-cover sm:h-96"
                  />

                  {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto p-3">
                      {images.map((image, index) => (
                        <button
                          type="button"
                          key={`${image}-${index}`}
                          onClick={() => setActiveImage(index)}
                          className={`shrink-0 overflow-hidden rounded-md border-2 ${
                            activeImage === index
                              ? 'border-blue-600'
                              : 'border-transparent'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Property image ${index + 1}`}
                            className="h-16 w-24 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-72 items-center justify-center bg-neutral-100 text-neutral-500">
                  No property images available
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-neutral-900">
                    {property.title || 'Property Details'}
                  </h1>

                  <p className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
                    <FiMapPin />
                    {location || 'Location not available'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm disabled:opacity-60"
                >
                  <FiHeart
                    className={
                      wishlisted
                        ? 'fill-red-600 text-red-600'
                        : 'text-neutral-700'
                    }
                  />
                  {wishlisted ? 'Saved' : 'Save Property'}
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-y border-neutral-100 py-5 sm:grid-cols-3">
                <div>
                  <FiHome className="mb-2 text-neutral-500" />
                  <p className="text-sm text-neutral-500">Bedrooms</p>
                  <p className="font-medium">
                    {property.bedrooms ?? property.bhk ?? '—'}
                  </p>
                </div>

                <div>
                  <FiMaximize className="mb-2 text-neutral-500" />
                  <p className="text-sm text-neutral-500">Area</p>
                  <p className="font-medium">
                    {property.area_sqft || property.area
                      ? `${property.area_sqft || property.area} sqft`
                      : '—'}
                  </p>
                </div>

                <div>
                  <FiHome className="mb-2 text-neutral-500" />
                  <p className="text-sm text-neutral-500">
                    Property Type
                  </p>
                  <p className="font-medium">
                    {property.property_type || property.type || '—'}
                  </p>
                </div>
              </div>

              <h2 className="mt-6 text-lg font-semibold">
                Description
              </h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-neutral-600">
                {property.description ||
                  'No description has been provided.'}
              </p>
            </div>
          </section>

          <aside>
            <div className="sticky top-24 rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-neutral-500">Property Price</p>
              <p className="mt-1 text-3xl font-bold text-neutral-900">
                {price > 0
                  ? `₹${price.toLocaleString('en-IN')}`
                  : 'Price on request'}
              </p>

              <p className="mt-3 text-sm capitalize text-neutral-500">
                Status: {property.status || 'Available'}
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setBookingError('');
                    setBookingMessage('');

                    if (!user) {
                      setBookingError(
                        'Please log in to schedule a visit.'
                      );
                      return;
                    }

                    if (user.role !== 'buyer') {
                      setBookingError(
                        'Only buyer accounts can book property visits.'
                      );
                      return;
                    }

                    setShowVisitForm((previous) => !previous);
                  }}
                  className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  {showVisitForm ? 'Close Booking Form' : 'Schedule a Visit'}
                </button>
              </div>

              {bookingMessage && (
                <p
                  role="status"
                  className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
                >
                  {bookingMessage}
                </p>
              )}

              {bookingError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {bookingError}
                </p>
              )}

              {showVisitForm && (
                <form
                  onSubmit={handleBookVisit}
                  className="mt-5 space-y-4 rounded-xl border border-neutral-200 p-4"
                >
                  <h2 className="font-semibold text-neutral-900">
                    Schedule your property visit
                  </h2>

                  <div>
                    <label
                      htmlFor="visit-date"
                      className="mb-1 block text-sm font-medium text-neutral-700"
                    >
                      Visit date
                    </label>
                    <input
                      id="visit-date"
                      type="date"
                      required
                      min={minDate}
                      value={visitDate}
                      onChange={(event) =>
                        setVisitDate(event.target.value)
                      }
                      className="w-full rounded-lg border border-neutral-300 p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="visit-time"
                      className="mb-1 block text-sm font-medium text-neutral-700"
                    >
                      Visit time
                    </label>
                    <input
                      id="visit-time"
                      type="time"
                      required
                      value={visitTime}
                      onChange={(event) =>
                        setVisitTime(event.target.value)
                      }
                      className="w-full rounded-lg border border-neutral-300 p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="visit-notes"
                      className="mb-1 block text-sm font-medium text-neutral-700"
                    >
                      Notes (optional)
                    </label>
                    <textarea
                      id="visit-notes"
                      rows={3}
                      maxLength={1000}
                      value={visitNotes}
                      onChange={(event) =>
                        setVisitNotes(event.target.value)
                      }
                      placeholder="Message for the broker..."
                      className="w-full rounded-lg border border-neutral-300 p-3 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {bookingLoading ? 'Submitting...' : 'Book Visit'}
                  </button>
                </form>
              )}

              <p className="mt-4 text-xs leading-5 text-neutral-500">
                Property information is provided as listed. Please
                verify details before making a purchase decision.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetailsPage;
