
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUpload,
  FiImage,
  FiActivity,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

import { analysePropertyImage } from '../../services/ai.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const initialForm = {
  property_type: 'apartment',
  listing_type: 'sale',
  area_sqft: '1500',
  bedrooms: '3',
  bathrooms: '2',
  city: 'Kanpur',
  locality: 'Swaroop Nagar',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  background: '#ffffff',
  color: '#111827',
  fontSize: '14px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '7px',
  color: '#374151',
  fontSize: '13px',
  fontWeight: 600,
};

const formatPrice = (value) => {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    return 'Not available';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const formatFileSize = (bytes) => {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size < 0) {
    return 'Not available';
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const ImageValuationPage = () => {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!image) {
      setPreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setResult(null);
    setError('');
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError('');
    setResult(null);

    if (!selectedFile) {
      setImage(null);
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setImage(null);
      event.target.value = '';

      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setImage(null);
      event.target.value = '';

      setError('Image size must not exceed 10 MB.');
      return;
    }

    setImage(selectedFile);
  };

  const validateForm = () => {
    if (!image) {
      return 'Please upload a property image.';
    }

    if (!form.city.trim()) {
      return 'Please enter the property city.';
    }

    if (!form.locality.trim()) {
      return 'Please enter the property locality.';
    }

    if (!['sale', 'rent'].includes(form.listing_type)) {
      return 'Please select a valid listing type.';
    }

    if (
      !['apartment', 'villa', 'plot', 'commercial'].includes(
        form.property_type
      )
    ) {
      return 'Please select a valid property type.';
    }

    const area = Number(form.area_sqft);
    const bedrooms = Number(form.bedrooms);
    const bathrooms = Number(form.bathrooms);

    if (!Number.isFinite(area) || area <= 0) {
      return 'Please enter a valid area greater than zero.';
    }

    if (!Number.isInteger(bedrooms) || bedrooms < 0) {
      return 'Please enter a valid bedroom count.';
    }

    if (!Number.isInteger(bathrooms) || bathrooms < 0) {
      return 'Please enter a valid bathroom count.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setResult(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();

    formData.append('image', image);
    formData.append('property_type', form.property_type);
    formData.append('listing_type', form.listing_type);
    formData.append('area_sqft', String(Number(form.area_sqft)));
    formData.append('bedrooms', String(Number(form.bedrooms)));
    formData.append('bathrooms', String(Number(form.bathrooms)));
    formData.append('city', form.city.trim());
    formData.append('locality', form.locality.trim());

    setLoading(true);

    try {
      const response = await analysePropertyImage(formData);

      if (!response || !response.image_analysis) {
        throw new Error(
          'The AI service returned an incomplete image analysis.'
        );
      }

      setResult(response);
    } catch (err) {
      const responseData = err.response?.data;

      setError(
        responseData?.message ||
          responseData?.detail ||
          responseData?.error ||
          err.message ||
          'Image valuation failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.image_analysis;
  const estimation = result?.price_estimation;

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '36px 20px 60px',
        background: '#f8fafc',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        <Link
          to="/price-prediction"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '22px',
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <FiArrowLeft />
          Back to Price Prediction
        </Link>

        <header style={{ marginBottom: '28px' }}>
          <p
            style={{
              margin: '0 0 8px',
              color: '#2563eb',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            LandEstateX AI Module
          </p>

          <h1
            style={{
              margin: '0 0 12px',
              color: '#0f172a',
              fontSize: '32px',
              fontWeight: 750,
              lineHeight: 1.25,
            }}
          >
            AI Property Image Valuation
          </h1>

          <p
            style={{
              maxWidth: '760px',
              margin: 0,
              color: '#64748b',
              fontSize: '15px',
              lineHeight: 1.7,
            }}
          >
            Upload a property image and enter its details.
            The system will analyse image quality and generate
            a price estimate using the existing property
            prediction model.
          </p>
        </header>

        <section
          style={{
            padding: '24px',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          }}
        >
          <form onSubmit={handleSubmit}>
            <h2
              style={{
                margin: '0 0 18px',
                color: '#111827',
                fontSize: '19px',
              }}
            >
              <FiImage
                style={{
                  marginRight: '9px',
                  verticalAlign: 'middle',
                  color: '#2563eb',
                }}
              />
              Upload Property Image
            </h2>

            <label
              htmlFor="property-image"
              style={{
                display: 'flex',
                minHeight: '190px',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px',
                border: '2px dashed #93c5fd',
                borderRadius: '12px',
                background: '#eff6ff',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <FiUpload size={32} color="#2563eb" />

              <strong style={{ color: '#1e40af' }}>
                Click to upload property image
              </strong>

              <span style={{ color: '#64748b', fontSize: '13px' }}>
                JPEG, PNG or WebP | Maximum 10 MB
              </span>

              <input
                id="property-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>

            {preview && (
              <div style={{ marginTop: '18px' }}>
                <p
                  style={{
                    margin: '0 0 10px',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Selected Image
                </p>

                <img
                  src={preview}
                  alt="Selected property"
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '420px',
                    maxHeight: '280px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />

                <p
                  style={{
                    margin: '8px 0 0',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                >
                  {image?.name} | {formatFileSize(image?.size)}
                </p>
              </div>
            )}

            <div style={{ marginTop: '30px', marginBottom: '18px' }}>
              <h2
                style={{
                  margin: '0 0 6px',
                  color: '#111827',
                  fontSize: '19px',
                }}
              >
                Property Details
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                These details are used by the existing price
                prediction model.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '18px',
              }}
            >
              <div>
                <label htmlFor="property_type" style={labelStyle}>
                  Property Type
                </label>

                <select
                  id="property_type"
                  name="property_type"
                  value={form.property_type}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label htmlFor="listing_type" style={labelStyle}>
                  Listing Type
                </label>

                <select
                  id="listing_type"
                  name="listing_type"
                  value={form.listing_type}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </div>

              <div>
                <label htmlFor="area_sqft" style={labelStyle}>
                  Area (sq. ft.)
                </label>

                <input
                  id="area_sqft"
                  name="area_sqft"
                  type="number"
                  min="1"
                  required
                  value={form.area_sqft}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="bedrooms" style={labelStyle}>
                  Bedrooms
                </label>

                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.bedrooms}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="bathrooms" style={labelStyle}>
                  Bathrooms
                </label>

                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.bathrooms}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="city" style={labelStyle}>
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="locality" style={labelStyle}>
                  Locality
                </label>

                <input
                  id="locality"
                  name="locality"
                  type="text"
                  required
                  value={form.locality}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '9px',
                  marginTop: '20px',
                  padding: '13px',
                  border: '1px solid #fecaca',
                  borderRadius: '9px',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontSize: '13px',
                  lineHeight: 1.6,
                }}
              >
                <FiAlertCircle size={18} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '24px',
                padding: '14px 18px',
                border: 'none',
                borderRadius: '9px',
                background: loading ? '#93a3c7' : '#2563eb',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <FiActivity />
              {loading
                ? 'Analysing Property Image...'
                : 'Analyse Image & Estimate Price'}
            </button>
          </form>
        </section>

        {result && (
          <section
            aria-live="polite"
            style={{
              marginTop: '26px',
              padding: '24px',
              border: '1px solid #bbf7d0',
              borderRadius: '16px',
              background: '#ffffff',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <FiCheckCircle color="#16a34a" size={24} />

              <h2
                style={{
                  margin: 0,
                  color: '#14532d',
                  fontSize: '21px',
                }}
              >
                Image Analysis Complete
              </h2>
            </div>

            <div
              style={{
                marginBottom: '22px',
                padding: '20px',
                borderRadius: '12px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
              }}
            >
              <p
                style={{
                  margin: '0 0 8px',
                  color: '#166534',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Estimated Property Price
              </p>

              <h3
                style={{
                  margin: 0,
                  color: '#14532d',
                  fontSize: '30px',
                }}
              >
                {formatPrice(estimation?.predicted_price)}
              </h3>

              <p
                style={{
                  margin: '10px 0 0',
                  color: '#64748b',
                  fontSize: '12px',
                }}
              >
                Prediction source: Structured property details
              </p>
            </div>

            <h3
              style={{
                margin: '0 0 15px',
                color: '#111827',
                fontSize: '17px',
              }}
            >
              Image Quality Analysis
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                {
                  label: 'Image Format',
                  value: analysis?.format?.toUpperCase() || 'N/A',
                },
                {
                  label: 'Resolution',
                  value:
                    analysis?.width && analysis?.height
                      ? `${analysis.width} x ${analysis.height}`
                      : 'N/A',
                },
                {
                  label: 'File Size',
                  value: formatFileSize(analysis?.file_size_bytes),
                },
                {
                  label: 'Brightness',
                  value:
                    Number.isFinite(Number(analysis?.brightness))
                      ? Number(analysis.brightness).toFixed(1)
                      : 'N/A',
                },
                {
                  label: 'Contrast',
                  value:
                    Number.isFinite(Number(analysis?.contrast))
                      ? Number(analysis.contrast).toFixed(1)
                      : 'N/A',
                },
                {
                  label: 'Resolution Quality',
                  value:
                    analysis?.resolution_quality?.toUpperCase() || 'N/A',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '15px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    background: '#f8fafc',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 7px',
                      color: '#64748b',
                      fontSize: '12px',
                    }}
                  >
                    {item.label}
                  </p>

                  <strong
                    style={{
                      color: '#0f172a',
                      fontSize: '15px',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                background: '#eff6ff',
              }}
            >
              <strong
                style={{
                  color: '#1e40af',
                  fontSize: '13px',
                }}
              >
                Important valuation disclaimer
              </strong>

              <p
                style={{
                  margin: '7px 0 0',
                  color: '#1e3a8a',
                  fontSize: '13px',
                  lineHeight: 1.7,
                }}
              >
                Image analysis checks technical image properties
                such as resolution, brightness, and contrast.
                It does not independently assess construction
                quality, structural condition, or property value.
                The displayed price is generated from structured
                property details using the existing demo model.
                It is not a verified market valuation.
              </p>
            </div>

            {result.uploaded_image && (
              <p style={{ margin: '16px 0 0', fontSize: '13px' }}>
                <a
                  href={result.uploaded_image}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#2563eb',
                    fontWeight: 600,
                  }}
                >
                  View uploaded Cloudinary image
                </a>
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default ImageValuationPage;
