
import { useEffect, useState } from "react";
import { predictPropertyPrice } from "../../services/ai.service";

const defaultForm = {
  property_type: "apartment",
  listing_type: "sale",
  area_sqft: "1500",
  bedrooms: "3",
  bathrooms: "2",
  city: "Kanpur",
  locality: "Swaroop Nagar",
};

const getFormValues = (data = {}) => ({
  property_type: String(
    data.property_type || defaultForm.property_type
  ).toLowerCase(),
  listing_type: String(
    data.listing_type || defaultForm.listing_type
  ).toLowerCase(),
  area_sqft: String(data.area_sqft ?? defaultForm.area_sqft),
  bedrooms: String(data.bedrooms ?? defaultForm.bedrooms),
  bathrooms: String(data.bathrooms ?? defaultForm.bathrooms),
  city: String(data.city || defaultForm.city),
  locality: String(data.locality || defaultForm.locality),
});

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  background: "#fff",
  color: "#111827",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "6px",
  color: "#374151",
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function PricePredictionCard({
  initialData,
  listedPrice,
  compact = false,
}) {
  const [form, setForm] = useState(() =>
    getFormValues(initialData)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Update the form when property details arrive or change.
  useEffect(() => {
    if (!initialData) return;

    setForm(getFormValues(initialData));
    setResult(null);
    setError("");
  }, [
    initialData?.property_type,
    initialData?.listing_type,
    initialData?.area_sqft,
    initialData?.bedrooms,
    initialData?.bathrooms,
    initialData?.city,
    initialData?.locality,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setResult(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    const area = Number(form.area_sqft);
    const bedrooms = Number(form.bedrooms);
    const bathrooms = Number(form.bathrooms);

    if (
      !form.city.trim() ||
      !form.locality.trim() ||
      !Number.isFinite(area) ||
      area <= 0 ||
      !Number.isFinite(bedrooms) ||
      bedrooms < 0 ||
      !Number.isFinite(bathrooms) ||
      bathrooms < 0
    ) {
      setError("Please enter valid property details.");
      return;
    }

    const propertyData = {
      property_type: form.property_type,
      listing_type: form.listing_type,
      area_sqft: area,
      bedrooms,
      bathrooms,
      city: form.city.trim(),
      locality: form.locality.trim(),
    };

    setLoading(true);

    try {
      const prediction = await predictPropertyPrice(propertyData);

      const price = Number(prediction?.predicted_price);

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        throw new Error(
          "The AI service did not return a valid price."
        );
      }

      setResult({
        ...prediction,
        predicted_price: price,
      });
    } catch (err) {
      const responseData = err.response?.data;

      setError(
        responseData?.message ||
          responseData?.error ||
          responseData?.data?.message ||
          err.message ||
          "Price prediction failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentListedPrice = Number(listedPrice);
  const hasListedPrice =
    listedPrice !== undefined &&
    listedPrice !== null &&
    listedPrice !== "" &&
    Number.isFinite(currentListedPrice) &&
    currentListedPrice > 0;

  const difference =
    result && hasListedPrice
      ? currentListedPrice - result.predicted_price
      : null;

  const differencePercent =
    difference !== null
      ? (Math.abs(difference) / result.predicted_price) * 100
      : null;

  return (
    <section
      style={{
        width: "100%",
        boxSizing: "border-box",
        maxWidth: compact ? "100%" : "760px",
        margin: compact ? "0" : "32px auto",
        padding: compact ? "18px" : "24px",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        background: "#ffffff",
        boxShadow: "0 8px 28px rgba(0,0,0,0.06)",
        fontFamily: "inherit",
      }}
    >
      <div style={{ marginBottom: "22px" }}>
        <p
          style={{
            margin: "0 0 8px",
            color: "#2563eb",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Buyer Price Intelligence
        </p>

        <h2
          style={{
            margin: "0 0 8px",
            fontSize: compact ? "21px" : "25px",
            color: "#111827",
          }}
        >
          AI Property Price Estimate
        </h2>

        <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
          {initialData
            ? "Review this property's details and estimate its price."
            : "Enter property details to get an estimated price."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "18px",
          }}
        >
          <div>
            <label style={labelStyle} htmlFor="property_type">
              Property type
            </label>
            <select
              id="property_type"
              name="property_type"
              value={form.property_type}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label style={labelStyle} htmlFor="listing_type">
              Listing type
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
            <label style={labelStyle} htmlFor="area_sqft">
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
            <label style={labelStyle} htmlFor="bedrooms">
              Bedrooms
            </label>
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min="0"
              required
              value={form.bedrooms}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="bathrooms">
              Bathrooms
            </label>
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min="0"
              required
              value={form.bathrooms}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="city">
              City
            </label>
            <input
              id="city"
              name="city"
              required
              value={form.city}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle} htmlFor="locality">
              Locality
            </label>
            <input
              id="locality"
              name="locality"
              required
              value={form.locality}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "22px",
            padding: "13px 18px",
            border: "none",
            borderRadius: "9px",
            background: loading ? "#93a3c7" : "#2563eb",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "15px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Predicting price..."
            : "Estimate Property Price"}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: "18px",
            padding: "12px",
            borderRadius: "8px",
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          aria-live="polite"
          style={{
            marginTop: "22px",
            padding: "20px",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
            background: "#f0fdf4",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#166534",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Estimated Property Price
          </p>

          <h3
            style={{
              margin: "0 0 10px",
              color: "#14532d",
              fontSize: "30px",
            }}
          >
            {formatPrice(result.predicted_price)}
          </h3>

          {hasListedPrice && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px",
                borderRadius: "10px",
                background: "#ffffff",
                border: "1px solid #d1fae5",
              }}
            >
              <p style={{ margin: "0 0 8px", color: "#374151" }}>
                <strong>Listed price:</strong>{" "}
                {formatPrice(currentListedPrice)}
              </p>

              <p style={{ margin: "0 0 8px", color: "#374151" }}>
                <strong>Difference from estimate:</strong>{" "}
                {formatPrice(Math.abs(difference))}
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 600,
                  color:
                    difference > 0
                      ? "#b45309"
                      : difference < 0
                        ? "#047857"
                        : "#374151",
                }}
              >
                {difference > 0
                  ? `Listed price is ${differencePercent.toFixed(1)}% above the estimate.`
                  : difference < 0
                    ? `Listed price is ${differencePercent.toFixed(1)}% below the estimate.`
                    : "Listed price matches the estimate."}
              </p>
            </div>
          )}

          <p
            style={{
              margin: "14px 0 0",
              color: "#4b5563",
              fontSize: "12px",
              lineHeight: 1.6,
            }}
          >
            This estimate is for guidance only. Actual market prices
            may differ.
          </p>

          {result.data_quality === "synthetic_demo" && (
            <p
              style={{
                margin: "10px 0 0",
                color: "#92400e",
                fontSize: "12px",
                lineHeight: 1.6,
              }}
            >
              Demo model: this estimate uses synthetic training data
              and is not a reliable market valuation.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default PricePredictionCard;
