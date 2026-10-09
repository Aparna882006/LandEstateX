import { useEffect, useState } from "react";

import {
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../../services/property.service";

import DashboardLayout from "../../components/layout/DashboardLayout";

const BROKER_LINKS = [
  {
    to: "/broker/dashboard",
    label: "Dashboard",
  },
  {
    to: "/broker/properties",
    label: "My Properties",
  },
  {
    to: "/broker/appointments",
    label: "Appointments",
  },
];

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "plot", label: "Plot" },
  { value: "commercial", label: "Commercial" },
];

const LISTING_TYPES = [
  { value: "sale", label: "Sale" },
  { value: "rent", label: "Rent" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "sold", label: "Sold" },
];

const initialForm = {
  title: "",
  description: "",
  property_type: "apartment",
  listing_type: "sale",
  price: "",
  area_sqft: "",
  bedrooms: "0",
  bathrooms: "0",
  address: "",
  city: "",
  locality: "",
  latitude: "",
  longitude: "",
  amenities: "",
};

const PropertyManagementPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await getMyProperties(params);

      setProperties(response.data?.data?.properties || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load your properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [statusFilter]);

  const resetForm = () => {
    setForm(initialForm);
    setImages([]);
    setEditingProperty(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagesChange = (event) => {
    setImages(Array.from(event.target.files || []));
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");
    setEditingProperty(null);
    setForm(initialForm);
    setImages([]);
    setShowForm(true);
  };

  const openEditForm = (property) => {
    setError("");
    setSuccess("");

    setEditingProperty(property);

    setForm({
      title: property.title || "",
      description: property.description || "",
      property_type: property.property_type || "apartment",
      listing_type: property.listing_type || "sale",
      price: property.price ?? "",
      area_sqft: property.area_sqft ?? "",
      bedrooms: property.bedrooms ?? 0,
      bathrooms: property.bathrooms ?? 0,
      address: property.location?.address || "",
      city: property.location?.city || "",
      locality: property.location?.locality || "",
      latitude: property.location?.latitude ?? "",
      longitude: property.location?.longitude ?? "",
      amenities: Array.isArray(property.amenities)
        ? property.amenities.join(", ")
        : "",
    });

    setImages([]);
    setShowForm(true);
  };

  const buildAmenities = () => {
    return form.amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingProperty) {
        const payload = {
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          area_sqft: Number(form.area_sqft),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          amenities: buildAmenities(),
          location: {
            address: form.address.trim(),
            city: form.city.trim(),
            locality: form.locality.trim(),
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
          },
        };

        await updateProperty(editingProperty._id, payload);

        setSuccess("Property updated successfully.");
      } else {
        const formData = new FormData();

        formData.append("title", form.title.trim());
        formData.append("description", form.description.trim());
        formData.append("property_type", form.property_type);
        formData.append("listing_type", form.listing_type);
        formData.append("price", Number(form.price));
        formData.append("area_sqft", Number(form.area_sqft));
        formData.append("bedrooms", Number(form.bedrooms));
        formData.append("bathrooms", Number(form.bathrooms));

        formData.append(
          "location",
          JSON.stringify({
            address: form.address.trim(),
            city: form.city.trim(),
            locality: form.locality.trim(),
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
          })
        );

        formData.append(
          "amenities",
          JSON.stringify(buildAmenities())
        );

        images.forEach((image) => {
          formData.append("images", image);
        });

        await createProperty(formData);

        setSuccess(
          "Property created successfully and submitted for approval."
        );
      }

      resetForm();
      await loadProperties();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save property."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (property) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteProperty(property._id);

      setSuccess("Property deleted successfully.");

      await loadProperties();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete property."
      );
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "—";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "sold":
        return "bg-blue-100 text-blue-700";

      case "pending":
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <DashboardLayout
      title="Broker"
      links={BROKER_LINKS}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">
              My Properties
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Manage properties listed under your broker account.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-800"
          >
            Add Property
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-danger-600/10 p-4 text-sm text-danger-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg bg-green-600/10 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-900">
              Property Status
            </p>

            <p className="text-xs text-neutral-500">
              Filter your properties by approval status.
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-600"
          >
            {STATUS_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-neutral-500">
              Loading your properties...
            </p>
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900">
              No properties found
            </h3>

            <p className="mt-2 text-sm text-neutral-500">
              You haven't added any properties yet.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
            >
              Add Your First Property
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property._id}
                className="overflow-hidden rounded-lg bg-white shadow-sm"
              >
                {property.images?.length > 0 ? (
                  <img
                    src={property.images[0].url}
                    alt={property.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-neutral-100">
                    <span className="text-sm text-neutral-400">
                      No image
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="line-clamp-2 text-lg font-semibold text-neutral-900">
                        {property.title}
                      </h3>

                      <p className="mt-1 text-xs capitalize text-neutral-500">
                        {property.property_type} ·{" "}
                        {property.listing_type}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                        property.status
                      )}`}
                    >
                      {property.status}
                    </span>
                  </div>

                  <p className="text-lg font-semibold text-primary-900">
                    {formatPrice(property.price)}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-neutral-500">
                    <span>
                      {property.area_sqft} sq.ft.
                    </span>

                    <span>
                      {property.bedrooms || 0} Beds
                    </span>

                    <span>
                      {property.bathrooms || 0} Baths
                    </span>

                    <span>
                      {property.location?.city || "—"}
                    </span>
                  </div>

                  <div className="mt-5 flex gap-2 border-t border-neutral-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openEditForm(property)}
                      disabled={property.status === "sold"}
                      className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(property)}
                      className="flex-1 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-8">
            <div className="mx-auto max-w-3xl rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {editingProperty
                      ? "Edit Property"
                      : "Add Property"}
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    {editingProperty
                      ? "Update your property details."
                      : "Add a new property for approval."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                >
                  Close
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 p-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      minLength={10}
                      maxLength={150}
                      required
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                      placeholder="e.g. Spacious 3 BHK Apartment in Gomti Nagar"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      maxLength={3000}
                      required
                      rows={5}
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                      placeholder="Describe the property..."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Property Type
                    </label>

                    <select
                      name="property_type"
                      value={form.property_type}
                      onChange={handleChange}
                      disabled={Boolean(editingProperty)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-600 disabled:bg-neutral-100"
                    >
                      {PROPERTY_TYPES.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Listing Type
                    </label>

                    <select
                      name="listing_type"
                      value={form.listing_type}
                      onChange={handleChange}
                      disabled={Boolean(editingProperty)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-600 disabled:bg-neutral-100"
                    >
                      {LISTING_TYPES.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Price
                    </label>

                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Area (sq.ft.)
                    </label>

                    <input
                      type="number"
                      name="area_sqft"
                      value={form.area_sqft}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Bedrooms
                    </label>

                    <input
                      type="number"
                      name="bedrooms"
                      value={form.bedrooms}
                      onChange={handleChange}
                      min="0"
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Bathrooms
                    </label>

                    <input
                      type="number"
                      name="bathrooms"
                      value={form.bathrooms}
                      onChange={handleChange}
                      min="0"
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Address
                    </label>

                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Locality
                    </label>

                    <input
                      type="text"
                      name="locality"
                      value={form.locality}
                      onChange={handleChange}
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Latitude
                    </label>

                    <input
                      type="number"
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      step="any"
                      required
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                      placeholder="e.g. 26.8467"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Longitude
                    </label>

                    <input
                      type="number"
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      step="any"
                      required
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                      placeholder="e.g. 80.9462"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Amenities
                    </label>

                    <input
                      type="text"
                      name="amenities"
                      value={form.amenities}
                      onChange={handleChange}
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-600"
                      placeholder="Parking, Gym, Swimming Pool"
                    />

                    <p className="mt-1 text-xs text-neutral-500">
                      Separate multiple amenities with commas.
                    </p>
                  </div>

                  {!editingProperty && (
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Property Images
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                        className="block w-full text-sm text-neutral-600"
                      />

                      <p className="mt-1 text-xs text-neutral-500">
                        You can select multiple images.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-primary-700 px-5 py-2 text-sm font-medium text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : editingProperty
                      ? "Update Property"
                      : "Create Property"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PropertyManagementPage;