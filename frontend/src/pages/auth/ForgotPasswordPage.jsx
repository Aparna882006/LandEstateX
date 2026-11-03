
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  FiHome,
  FiMail,
  FiArrowLeft,
  FiArrowRight,
  FiShield,
} from 'react-icons/fi';
import { forgotPassword } from '../../services/auth.service';

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData) => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await forgotPassword({
        email: formData.email.trim().toLowerCase(),
      });

      setMessage(
        response.data?.message ||
        'If an account exists with this email, a reset link has been sent.'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] lg:grid lg:grid-cols-2">

      {/* LEFT VISUAL */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#14233f] lg:block">

        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90"
          alt="Luxury property"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#101b32]/95 via-[#14233f]/35 to-[#14233f]/20" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between p-12 xl:p-16">

          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <FiHome size={23} />
            </div>
            <span className="text-2xl font-bold">LandEstateX</span>
          </Link>

          <div className="max-w-lg pb-8 text-white">
            <FiShield size={35} className="mb-7 text-[#d9bd8b]" />

            <h1 className="text-5xl font-semibold leading-tight">
              Your account.
              <br />
              Your properties.
              <span className="block text-[#d9bd8b]">
                Your journey.
              </span>
            </h1>

            <p className="mt-6 leading-8 text-white/75">
              We will help you securely get back to your
              LandEstateX account.
            </p>
          </div>

          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} LandEstateX
          </p>
        </div>
      </section>

      {/* RIGHT FORM */}
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">

        <div className="w-full max-w-[440px]">

          <Link to="/" className="mb-12 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#192b4b] text-white">
              <FiHome size={22} />
            </div>
            <span className="text-xl font-bold text-[#192b4b]">
              LandEstateX
            </span>
          </Link>

          <Link
            to="/login"
            className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#192b4b]"
          >
            <FiArrowLeft />
            Back to Login
          </Link>

          <div className="mb-9">

            <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#192b4b]/5 text-[#192b4b]">
              <FiMail size={28} />
            </div>

            <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-[#a88b5b]">
              ACCOUNT RECOVERY
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-[#172640]">
              Forgot password?
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              No worries. Enter the email address associated with
              your account and follow the password recovery
              instructions.
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#24344e]">
                Email Address
              </label>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#192b4b] focus:ring-4 focus:ring-[#192b4b]/10"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
              </div>

              {errors.email && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#192b4b] font-semibold text-white shadow-lg shadow-[#192b4b]/15 transition hover:bg-[#263c61] disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Recovery Link'}

              {!loading && (
                <FiArrowRight className="transition group-hover:translate-x-1" />
              )}
            </button>

          </form>

          <p className="mt-9 text-center text-sm text-slate-500">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#192b4b] hover:text-[#a88b5b]"
            >
              Sign in
            </Link>
          </p>

        </div>
      </section>
    </div>
  );
};

export default ForgotPasswordPage;
