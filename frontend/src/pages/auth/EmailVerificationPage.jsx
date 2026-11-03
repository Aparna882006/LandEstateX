
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../services/auth.service';

const EmailVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!email) {
      setError('Email address is missing. Please register again.');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter your complete 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      await verifyEmail({
        email,
        otp: otp.trim(),
      });

      navigate('/login', {
        replace: true,
        state: {
          message: 'Your email has been verified successfully. Please log in.',
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Verification failed. Please check your code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] lg:grid lg:grid-cols-2">

      {/* LEFT PREMIUM IMAGE SECTION */}
      <div className="relative hidden min-h-screen overflow-hidden lg:block">

        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90"
          alt="Luxury modern residential property"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#101c31]/95 via-[#192b4b]/35 to-[#192b4b]/20" />

        <div className="relative z-10 flex h-full min-h-screen flex-col justify-between p-12 xl:p-16">

          <Link to="/" className="inline-flex w-fit flex-col">
            <span className="text-3xl font-semibold tracking-[0.18em] text-white">
              LANDESTATE<span className="text-[#d9bd8b]">X</span>
            </span>
            <span className="mt-1 text-[10px] tracking-[0.38em] text-white/70">
              REAL ESTATE. REDEFINED.
            </span>
          </Link>

          <div className="max-w-lg pb-10">

            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-[#d9bd8b]" />
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-[#e0c99f]">
                Account Security
              </span>
            </div>

            <h1 className="text-4xl font-light leading-tight text-white xl:text-5xl">
              A more secure way
              <br />
              to find your
              <br />
              <span className="font-semibold italic text-[#e0c99f]">
                perfect property.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-white/75">
              Your journey towards the right property begins with a
              secure account. Verify your email to unlock your
              LandEstateX experience.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d9bd8b]/50 text-[#e0c99f]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Secure Email Verification
                </p>
                <p className="mt-1 text-xs text-white/55">
                  Your account, protected from the beginning.
                </p>
              </div>
            </div>

          </div>

          <p className="text-xs tracking-wide text-white/45">
            © {new Date().getFullYear()} LandEstateX. All rights reserved.
          </p>

        </div>
      </div>

      {/* RIGHT VERIFICATION SECTION */}
      <div className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 lg:px-12 xl:px-20">

        <div className="w-full max-w-[440px]">

          {/* MOBILE BRANDING */}
          <Link to="/" className="mb-12 flex flex-col items-center lg:hidden">
            <span className="text-2xl font-semibold tracking-[0.16em] text-[#192b4b]">
              LANDESTATE<span className="text-[#a88b5b]">X</span>
            </span>
            <span className="mt-1 text-[9px] tracking-[0.35em] text-[#8b8b85]">
              REAL ESTATE. REDEFINED.
            </span>
          </Link>

          {/* TOP LABEL */}
          <div className="mb-9">

            <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e7dfd1] bg-[#f1ede5] text-[#a88b5b]">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-8 w-8"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
                <path d="m16 15 2 2 3-3" />
              </svg>

            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#a88b5b]">
              Almost There
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-[#192b4b] sm:text-4xl">
              Verify your email
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#777a80]">
              We've sent a verification code to your registered email
              address. Enter the code below to activate your account.
            </p>

          </div>

          {/* EMAIL DISPLAY */}
          <div className="mb-7 rounded-xl border border-[#e9e3d9] bg-white p-4">

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#99958e]">
              Verification email
            </p>

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f0e9] text-[#a88b5b]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-4 w-4"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>

              <p className="break-all text-sm font-medium text-[#192b4b]">
                {email || 'Email address unavailable'}
              </p>

            </div>

          </div>

          {/* VERIFICATION FORM */}
          <form onSubmit={handleSubmit}>

            <label
              htmlFor="verification-otp"
              className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#454b55]"
            >
              Enter 6-digit verification code
            </label>

            <input
              id="verification-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              disabled={loading}
              className="h-[68px] w-full rounded-xl border border-[#dedbd4] bg-white text-center text-3xl font-semibold tracking-[0.55em] text-[#192b4b] outline-none transition placeholder:text-[#d5d1c9] focus:border-[#a88b5b] focus:ring-4 focus:ring-[#a88b5b]/10 disabled:opacity-60"
            />

            <div className="mt-3 flex justify-between text-xs text-[#96958f]">
              <span>Enter the code sent to your email</span>
              <span>{otp.length}/6</span>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 h-4 w-4 shrink-0"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5m0 3h.01" />
                </svg>

                <p>{error}</p>

              </div>
            )}

            {/* VERIFY BUTTON */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6 || !email}
              className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#192b4b] px-6 text-sm font-semibold tracking-wide text-white shadow-lg shadow-[#192b4b]/15 transition duration-300 hover:bg-[#243b60] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Activate Account

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </>
              )}

            </button>

          </form>

          {/* SECURITY NOTE */}
          <div className="mt-8 flex items-start gap-3 border-t border-[#e7e3dc] pt-6">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mt-0.5 h-5 w-5 shrink-0 text-[#a88b5b]"
            >
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 118 0v3" />
            </svg>

            <p className="text-xs leading-6 text-[#898982]">
              For your security, this verification code expires after
              10 minutes. Never share your code with anyone.
            </p>

          </div>

          {/* FOOTER */}
          <div className="mt-9 text-center">

            <Link
              to="/register"
              className="text-sm font-medium text-[#a88b5b] transition hover:text-[#192b4b]"
            >
              Back to registration
            </Link>

            <p className="mt-5 text-[10px] tracking-wide text-[#aaa69e]">
              © {new Date().getFullYear()} LandEstateX · Real Estate. Redefined.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default EmailVerificationPage;
