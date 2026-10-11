
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiRefreshCw } from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);

const LoanCalculatorPage = () => {
  const [propertyPrice, setPropertyPrice] = useState('7000000');
  const [downPayment, setDownPayment] = useState('1400000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenureYears, setTenureYears] = useState('20');

  const calculation = useMemo(() => {
    const price = Math.max(0, Number(propertyPrice) || 0);
    const down = Math.min(
      price,
      Math.max(0, Number(downPayment) || 0)
    );
    const principal = price - down;
    const annualRate = Math.max(0, Number(interestRate) || 0);
    const years = Math.max(1, Number(tenureYears) || 1);

    const months = years * 12;
    const monthlyRate = annualRate / 12 / 100;

    let emi = 0;

    if (principal > 0) {
      if (monthlyRate === 0) {
        emi = principal / months;
      } else {
        const factor = Math.pow(1 + monthlyRate, months);

        emi =
          (principal * monthlyRate * factor) /
          (factor - 1);
      }
    }

    const totalPayment = emi * months;

    return {
      principal,
      emi,
      totalInterest: Math.max(0, totalPayment - principal),
      totalPayment,
    };
  }, [propertyPrice, downPayment, interestRate, tenureYears]);

  const resetCalculator = () => {
    setPropertyPrice('7000000');
    setDownPayment('1400000');
    setInterestRate('8.5');
    setTenureYears('20');
  };

  const inputClass =
    'mt-2 w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-900 outline-none focus:border-primary-700 focus:ring-1 focus:ring-primary-700';

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-16 pt-32">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:underline"
        >
          <FiArrowLeft />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <FiHome size={24} />
          </div>

          <h1 className="text-3xl font-bold text-neutral-900">
            Home Loan & EMI Calculator
          </h1>

          <p className="mt-2 text-neutral-600">
            Estimate your monthly home loan payment, interest and total repayment.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-3">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-neutral-900">
                Loan Details
              </h2>

              <button
                type="button"
                onClick={resetCalculator}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:underline"
              >
                <FiRefreshCw />
                Reset
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="propertyPrice"
                  className="text-sm font-medium text-neutral-700"
                >
                  Property price (₹)
                </label>

                <input
                  id="propertyPrice"
                  type="number"
                  min="0"
                  value={propertyPrice}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPropertyPrice(value);

                    if (Number(downPayment) > Number(value)) {
                      setDownPayment(value);
                    }
                  }}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="downPayment"
                  className="text-sm font-medium text-neutral-700"
                >
                  Down payment (₹)
                </label>

                <input
                  id="downPayment"
                  type="number"
                  min="0"
                  max={Math.max(0, Number(propertyPrice) || 0)}
                  value={downPayment}
                  onChange={(event) =>
                    setDownPayment(event.target.value)
                  }
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-neutral-500">
                  Loan amount:{' '}
                  {formatCurrency(calculation.principal)}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="interestRate"
                    className="text-sm font-medium text-neutral-700"
                  >
                    Annual interest rate
                  </label>

                  <span className="font-semibold text-primary-700">
                    {interestRate || '0'}%
                  </span>
                </div>

                <input
                  id="interestRate"
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={Math.min(
                    20,
                    Math.max(0, Number(interestRate) || 0)
                  )}
                  onChange={(event) =>
                    setInterestRate(event.target.value)
                  }
                  className="mt-4 w-full accent-indigo-700"
                />

                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={interestRate}
                  onChange={(event) =>
                    setInterestRate(event.target.value)
                  }
                  className={inputClass}
                  aria-label="Interest rate percentage"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="tenureYears"
                    className="text-sm font-medium text-neutral-700"
                  >
                    Loan tenure
                  </label>

                  <span className="font-semibold text-primary-700">
                    {tenureYears || '1'} years
                  </span>
                </div>

                <input
                  id="tenureYears"
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={Math.min(
                    30,
                    Math.max(1, Number(tenureYears) || 1)
                  )}
                  onChange={(event) =>
                    setTenureYears(event.target.value)
                  }
                  className="mt-4 w-full accent-indigo-700"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-primary-900 p-6 text-white lg:col-span-2">
            <p className="text-sm text-indigo-200">
              Estimated monthly EMI
            </p>

            <p className="mt-2 break-words text-3xl font-bold sm:text-4xl">
              {formatCurrency(calculation.emi)}
            </p>

            <p className="mt-2 text-sm text-indigo-200">
              For {tenureYears || '1'} years
            </p>

            <div className="my-6 border-t border-white/20" />

            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-indigo-200">
                  Loan principal
                </span>
                <span className="text-right font-semibold">
                  {formatCurrency(calculation.principal)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-indigo-200">
                  Total interest
                </span>
                <span className="text-right font-semibold">
                  {formatCurrency(calculation.totalInterest)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-indigo-200">
                  Total repayment
                </span>
                <span className="text-right font-semibold">
                  {formatCurrency(calculation.totalPayment)}
                </span>
              </div>
            </div>

            <p className="mt-8 text-xs leading-5 text-indigo-200">
              This is an estimate based on the entered interest rate and
              tenure. Actual lender terms, fees, insurance and rate changes
              may affect your EMI.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoanCalculatorPage;
