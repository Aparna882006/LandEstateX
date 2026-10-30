
import PricePredictionCard from '../../components/ai/PricePredictionCard';

const PricePredictionPage = () => {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px 20px',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <header style={{ marginBottom: '28px' }}>
          <p
            style={{
              color: '#2563eb',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px',
            }}
          >
            LandEstateX · Buyer Tools
          </p>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              marginBottom: '8px',
              color: '#0f172a',
              lineHeight: 1.25,
            }}
          >
            AI Property Price Prediction
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: '15px',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: '720px',
            }}
          >
            Estimate a property's price using its location, area,
            property type, bedrooms, and bathrooms. Compare the
            estimated value with the seller's asking price when available.
          </p>
        </header>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          }}
        >
          <PricePredictionCard />
        </section>

        <aside
          style={{
            marginTop: '20px',
            padding: '16px 18px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
          }}
        >
          <h2
            style={{
              color: '#1e40af',
              fontSize: '14px',
              fontWeight: 700,
              margin: '0 0 6px',
            }}
          >
            About your estimate
          </h2>

          <p
            style={{
              color: '#1e3a8a',
              fontSize: '13px',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Predictions are estimates, not guaranteed market values.
            If the result is labelled as demo or synthetic data, it
            should not be treated as a verified real-estate valuation.
            Actual prices may vary with market conditions and property
            characteristics.
          </p>
        </aside>
      </div>
    </main>
  );
};

export default PricePredictionPage;
