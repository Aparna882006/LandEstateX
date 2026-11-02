
import { useState } from 'react';
import {
  FiTrendingUp,
  FiHome,
  FiDollarSign,
  FiTarget,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
} from 'react-icons/fi';

import { analysePropertyInvestment } from '../../services/ai.service';

const initialAssumptions = {
  monthly_rent: '25000',
  annual_expenses: '30000',
  annual_appreciation_percent: '5',
  holding_period_years: '5',
};

const formatINR = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return '—';

  return `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
};

const formatPercent = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? `${amount.toFixed(2)}%`
    : '—';
};

const InvestmentAnalytics = ({ property }) => {
  const [assumptions, setAssumptions] = useState(initialAssumptions);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateAssumption = (event) => {
    const { name, value } = event.target;

    setAssumptions((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();

    setError('');
    setResult(null);

    const monthlyRent = Number(assumptions.monthly_rent);
    const annualExpenses = Number(assumptions.annual_expenses);
    const appreciation = Number(
      assumptions.annual_appreciation_percent
    );
    const holdingPeriod = Number(
      assumptions.holding_period_years
    );

    if (
      !Number.isFinite(monthlyRent) ||
      monthlyRent < 0 ||
      !Number.isFinite(annualExpenses) ||
      annualExpenses < 0
    ) {
      setError('Please enter valid non-negative rent and expenses.');
      return;
    }

    if (
      !Number.isFinite(appreciation) ||
      appreciation < -20 ||
      appreciation > 30
    ) {
      setError('Annual appreciation must be between -20% and 30%.');
      return;
    }

    if (
      !Number.isInteger(holdingPeriod) ||
      holdingPeriod < 1 ||
      holdingPeriod > 30
    ) {
      setError('Holding period must be between 1 and 30 years.');
      return;
    }

    setLoading(true);

    try {
      const response = await analysePropertyInvestment(
        property._id,
        assumptions
      );

      if (!response?.analysis) {
        throw new Error('Investment analysis response is incomplete.');
      }

      setResult(response);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to generate investment analysis. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.analysis;
  const metrics = analysis?.investment_metrics;
  const projection = analysis?.projection;
  const risk = analysis?.risk_assessment;

  const riskColor =
    risk?.risk_level === 'high'
      ? 'text-red-700 bg-red-50'
      : risk?.risk_level === 'medium'
        ? 'text-amber-700 bg-amber-50'
        : 'text-green-700 bg-green-50';

  const MetricCard = ({ label, value, icon: Icon }) => (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        {Icon && <Icon size={17} />}
        {label}
      </div>

      <p className="mt-2 text-xl font-bold text-neutral-900">
        {value}
      </p>
    </div>
  );

  if (property?.listing_type !== 'sale') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <p className="font-semibold text-amber-900">
          Investment Analytics is available for sale listings only.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FiTrendingUp className="text-blue-600" size={24} />

          <h2 className="text-xl font-semibold text-neutral-900">
            AI Investment Analytics
          </h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Evaluate rental income, property appreciation assumptions,
          investment returns and estimated risk before making a decision.
        </p>
      </div>

      {/* Property summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard
          label="Property purchase price"
          value={formatINR(property.price)}
          icon={FiHome}
        />

        <MetricCard
          label="Property area"
          value={`${Number(property.area_sqft || property.area || 0).toLocaleString('en-IN')} sqft`}
          icon={FiTarget}
        />
      </div>

      {/* Assumption form */}
      <form
        onSubmit={handleAnalyze}
        className="space-y-5 rounded-xl border border-neutral-200 bg-neutral-50 p-5"
      >
        <div>
          <h3 className="font-semibold text-neutral-900">
            Investment assumptions
          </h3>

          <p className="mt-1 text-xs text-neutral-500">
            Enter your estimated rental income and investment assumptions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="investment-monthly-rent"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Expected monthly rent (₹)
            </label>

            <input
              id="investment-monthly-rent"
              name="monthly_rent"
              type="number"
              min="0"
              step="1"
              required
              value={assumptions.monthly_rent}
              onChange={updateAssumption}
              className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="investment-annual-expenses"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Annual expenses (₹)
            </label>

            <input
              id="investment-annual-expenses"
              name="annual_expenses"
              type="number"
              min="0"
              step="1"
              required
              value={assumptions.annual_expenses}
              onChange={updateAssumption}
              className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="investment-appreciation"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Annual appreciation assumption (%)
            </label>

            <input
              id="investment-appreciation"
              name="annual_appreciation_percent"
              type="number"
              min="-20"
              max="30"
              step="0.1"
              required
              value={assumptions.annual_appreciation_percent}
              onChange={updateAssumption}
              className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="investment-holding-period"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Holding period (years)
            </label>

            <select
              id="investment-holding-period"
              name="holding_period_years"
              value={assumptions.holding_period_years}
              onChange={updateAssumption}
              className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none"
            >
              {[1, 2, 3, 5, 7, 10, 15, 20, 25, 30].map((year) => (
                <option key={year} value={year}>
                  {year} {year === 1 ? 'year' : 'years'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <FiRefreshCw className="animate-spin" />
              Calculating investment returns...
            </>
          ) : (
            <>
              <FiTrendingUp />
              Analyze Investment
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-green-600" size={21} />

            <h3 className="text-lg font-semibold text-neutral-900">
              Investment Analysis Results
            </h3>
          </div>

          {/* Investment metrics */}
          <div>
            <h4 className="mb-3 font-semibold text-neutral-800">
              Rental performance
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                label="Price per sqft"
                value={formatINR(metrics?.price_per_sqft)}
                icon={FiHome}
              />

              <MetricCard
                label="Annual rental income"
                value={formatINR(metrics?.annual_rent)}
                icon={FiDollarSign}
              />

              <MetricCard
                label="Annual net income"
                value={formatINR(metrics?.annual_net_income)}
                icon={FiTrendingUp}
              />

              <MetricCard
                label="Gross rental yield"
                value={formatPercent(metrics?.gross_rental_yield_percent)}
              />

              <MetricCard
                label="Net rental yield"
                value={formatPercent(metrics?.net_rental_yield_percent)}
              />

              <MetricCard
                label="Rental payback period"
                value={
                  Number.isFinite(Number(metrics?.rental_payback_years))
                    ? `${Number(metrics.rental_payback_years).toFixed(2)} years`
                    : '—'
                }
              />
            </div>
          </div>

          {/* Projection */}
          <div>
            <h4 className="mb-3 font-semibold text-neutral-800">
              Property value projection
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MetricCard
                label="Projected property value"
                value={formatINR(projection?.projected_property_value)}
                icon={FiHome}
              />

              <MetricCard
                label="Cumulative net rental income"
                value={formatINR(projection?.cumulative_net_rental_income)}
                icon={FiDollarSign}
              />

              <MetricCard
                label="Estimated total profit"
                value={formatINR(projection?.estimated_total_profit)}
                icon={FiTrendingUp}
              />

              <MetricCard
                label="Estimated total ROI"
                value={formatPercent(projection?.estimated_total_roi_percent)}
                icon={FiTarget}
              />

              <MetricCard
                label="Average annual ROI"
                value={formatPercent(projection?.average_annual_roi_percent)}
                icon={FiTrendingUp}
              />
            </div>
          </div>

          {/* Risk assessment */}
          <div className="rounded-xl border border-neutral-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold text-neutral-900">
                Investment risk assessment
              </h4>

              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${riskColor}`}
              >
                {risk?.risk_level || 'Not available'} risk
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Investment score</p>
                <p className="mt-1 text-3xl font-bold text-blue-700">
                  {risk?.investment_score ?? '—'}
                  <span className="text-sm font-normal text-neutral-500">
                    /100
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Risk score</p>
                <p className="mt-1 text-3xl font-bold text-neutral-900">
                  {risk?.risk_score ?? '—'}
                  <span className="text-sm font-normal text-neutral-500">
                    /100
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, Number(risk?.investment_score) || 0)
                  )}%`,
                }}
              />
            </div>

            {risk?.recommendation && (
              <p className="mt-4 text-sm leading-6 text-neutral-700">
                {risk.recommendation}
              </p>
            )}

            {Array.isArray(risk?.risk_factors) &&
              risk.risk_factors.length > 0 && (
                <div className="mt-4 rounded-lg bg-amber-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-amber-900">
                    <FiAlertCircle />
                    Factors to review
                  </div>

                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                    {risk.risk_factors.map((factor, index) => (
                      <li key={index}>
                        {typeof factor === 'string'
                          ? factor
                          : factor.message || JSON.stringify(factor)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          <div className="rounded-lg bg-blue-50 p-4 text-xs leading-6 text-blue-900">
            <p className="font-semibold">
              Calculation methodology: {analysis.engine}
            </p>

            <p className="mt-1">
              Data quality: {analysis.data_quality}
            </p>

            <p className="mt-2">
              {analysis.disclaimer}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default InvestmentAnalytics;
