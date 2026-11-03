
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiArrowRight,
  FiShield,
  FiHome,
  FiCheckCircle,
} from 'react-icons/fi';

import { loginUser } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setServerError('');
    setLoading(true);

    try {
      const { data } = await loginUser(formData);

      login(data.data.user, data.data.access_token);

      if (data.data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.data.user.role === 'broker') {
        navigate('/broker/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] lg:grid lg:grid-cols-2">

      {/* LEFT PREMIUM VISUAL */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#14233f] lg:block">

        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90"
          alt="Luxury modern property"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#101b32]/95 via-[#14233f]/35 to-[#14233f]/20" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between p-12 xl:p-16">

          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
              <FiHome size={24} />
            </div>

            <div>
              <p className="text-2xl font-bold tracking-wide">
                LandEstateX
              </p>
              <p className="text-xs tracking-[0.25em] text-white/70">
                PROPERTY REDEFINED
              </p>
            </div>
          </Link>

          <div className="max-w-xl pb-8 text-white">

            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium tracking-widest backdrop-blur-md">
              <FiShield />
              YOUR PROPERTY JOURNEY STARTS HERE
            </span>

            <h1 className="text-5xl font-semibold leading-tight xl:text-6xl">
              Find a place
              <br />
              that feels like
              <span className="block text-[#d9bd8b]">
                yours.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-white/75">
              Discover exceptional properties, explore premium
              neighbourhoods and make smarter real-estate decisions
              with LandEstateX.
            </p>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/85">
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-[#d9bd8b]" />
                Verified listings
              </span>

              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-[#d9bd8b]" />
                AI-powered insights
              </span>
            </div>
          </div>

          <p className="text-xs tracking-wide text-white/60">
            © {new Date().getFullYear()} LandEstateX. All rights reserved.
          </p>
        </div>
      </section>

      {/* RIGHT LOGIN SECTION */}
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 lg:px-12">

        <div className="w-full max-w-[440px]">

          {/* MOBILE BRANDING */}
          <Link to="/" className="mb-12 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#192b4b] text-white">
              <FiHome size={22} />
            </div>
            <span className="text-xl font-bold text-[#192b4b]">
              LandEstateX
            </span>
          </Link>

          <div className="mb-9">
            <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-[#a88b5b]">
              WELCOME BACK
            </p>

            <h2 className="text-4xl font-semibold tracking-tight text-[#172640]">
              Sign in
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Welcome back. Sign in to continue your property journey.
            </p>
          </div>

          {serverError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* EMAIL / PHONE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#24344e]">
                Email or Phone
              </label>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Enter your email or phone"
                  autoComplete="username"
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#192b4b] focus:ring-4 focus:ring-[#192b4b]/10"
                  {...register('email_or_phone', {
                    required: 'Email or phone is required',
                  })}
                />
              </div>

              {errors.email_or_phone && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.email_or_phone.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-[#24344e]">
                  Password
                </label>
              </div>

              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm outline-none transition focus:border-[#192b4b] focus:ring-4 focus:ring-[#192b4b]/10"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#192b4b]"
                >
                  {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex items-center justify-between gap-3 text-sm">

              <label className="flex cursor-pointer items-center gap-2 text-slate-500">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#192b4b]"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-[#192b4b] transition hover:text-[#a88b5b]"
              >
                Forgot password?
              </Link>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#192b4b] font-semibold text-white shadow-lg shadow-[#192b4b]/15 transition hover:bg-[#263c61] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}

              {!loading && (
                <FiArrowRight className="transition group-hover:translate-x-1" />
              )}
            </button>

          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">NEW TO LANDESTATEX?</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <Link
            to="/register"
            className="flex h-14 w-full items-center justify-center rounded-xl border border-[#192b4b]/20 bg-white font-semibold text-[#192b4b] transition hover:border-[#192b4b] hover:bg-slate-50"
          >
            Create Your Account
          </Link>

          <p className="mt-10 text-center text-xs leading-6 text-slate-400">
            By continuing, you agree to our Terms of Service
            and Privacy Policy.
          </p>

        </div>
      </section>
    </div>
  );
};

export default LoginPage;
