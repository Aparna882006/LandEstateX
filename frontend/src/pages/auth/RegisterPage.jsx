
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
  FiUser,
  FiPhone,
  FiBriefcase,
} from 'react-icons/fi';

import { registerUser } from '../../services/auth.service';

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      role: 'buyer',
    },
  });

  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setServerError('');
    setLoading(true);

    const payload = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone_number: formData.phone_number.trim(),
      password: formData.password,
      role: formData.role,
    };

    try {
      const response = await registerUser(payload);

      const registeredEmail = response.data?.data?.email;

      if (!registeredEmail) {
        throw new Error(
          'Registration response did not contain an email address.'
        );
      }

      navigate('/verify-email', {
        state: {
          email: registeredEmail,
        },
      });
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        setServerError(
          message || 'This email or phone number is already registered.'
        );
      } else if (status === 400) {
        const validationErrors = err.response?.data?.errors;

        setServerError(
          Array.isArray(validationErrors)
            ? validationErrors.join(', ')
            : message || 'Please check your registration details.'
        );
      } else {
        setServerError(
          message || err.message || 'Something went wrong. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#192b4b] focus:ring-4 focus:ring-[#192b4b]/10';

  const roleOptions = [
    { value: 'buyer', label: 'Buyer' },
    { value: 'seller', label: 'Seller' },
    { value: 'broker', label: 'Broker' },
    { value: 'builder', label: 'Builder' },
    { value: 'investor', label: 'Investor' },
  ];

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

          {/* BRAND */}
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

          {/* BRAND MESSAGE */}
          <div className="max-w-xl pb-8 text-white">

            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium tracking-widest backdrop-blur-md">
              <FiShield />
              YOUR PROPERTY JOURNEY STARTS HERE
            </span>

            <h1 className="text-5xl font-semibold leading-tight xl:text-6xl">
              A new journey
              <br />
              begins with
              <span className="block text-[#d9bd8b]">
                one step.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-white/75">
              Create your LandEstateX account and discover exceptional
              properties, premium neighbourhoods and smarter
              real-estate opportunities.
            </p>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/85">
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-[#d9bd8b]" />
                Trusted connections
              </span>

              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-[#d9bd8b]" />
                AI-powered insights
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <p className="text-xs tracking-wide text-white/60">
            © {new Date().getFullYear()} LandEstateX. All rights reserved.
          </p>

        </div>
      </section>

      {/* RIGHT REGISTER SECTION */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-12">

        <div className="w-full max-w-[440px]">

          {/* MOBILE BRANDING */}
          <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#192b4b] text-white">
              <FiHome size={22} />
            </div>

            <span className="text-xl font-bold text-[#192b4b]">
              LandEstateX
            </span>
          </Link>

          {/* HEADING */}
          <div className="mb-7">

            <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-[#a88b5b]">
              CREATE YOUR ACCOUNT
            </p>

            <h2 className="text-4xl font-semibold tracking-tight text-[#172640]">
              Get started
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Join LandEstateX and take the first step towards
              your property journey.
            </p>

          </div>

          {/* SERVER ERROR */}
          {serverError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* FULL NAME */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#24344e]">
                Full Name
              </label>

              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className={`${inputClass} ${
                    errors.full_name ? 'border-red-400' : ''
                  }`}
                  {...register('full_name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must contain at least 2 characters',
                    },
                    validate: (value) =>
                      value.trim().length >= 2 ||
                      'Please enter a valid name',
                  })}
                />
              </div>

              {errors.full_name && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.full_name.message}
                </p>
              )}

            </div>

            {/* EMAIL */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#24344e]">
                Email Address
              </label>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className={`${inputClass} ${
                    errors.email ? 'border-red-400' : ''
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>

              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}

            </div>

            {/* PHONE */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#24344e]">
                Phone Number
              </label>

              <div className="relative">

                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter your 10-digit mobile number"
                  autoComplete="tel"
                  maxLength={10}
                  className={`${inputClass} ${
                    errors.phone_number ? 'border-red-400' : ''
                  }`}
                  {...register('phone_number', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Enter a valid 10-digit mobile number',
                    },
                  })}
                />

              </div>

              {errors.phone_number && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.phone_number.message}
                </p>
              )}

            </div>

            {/* ROLE */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#24344e]">
                I am registering as
              </label>

              <div className="relative">

                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <select
                  className={`${inputClass} appearance-none cursor-pointer`}
                  {...register('role', {
                    required: 'Please select your role',
                  })}
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                  ▾
                </span>

              </div>

              {errors.role && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.role.message}
                </p>
              )}

            </div>

            {/* PASSWORD */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-[#24344e]">
                Create Password
              </label>

              <div className="relative">

                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create your password"
                  autoComplete="new-password"
                  className={`${inputClass} pr-12 ${
                    errors.password ? 'border-red-400' : ''
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*\d)(?=.*[!@#$%^&*])/,
                      message:
                        'Include at least one number and one special character',
                    },
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#192b4b]"
                >
                  {showPassword ? (
                    <FiEyeOff size={19} />
                  ) : (
                    <FiEye size={19} />
                  )}
                </button>

              </div>

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Minimum 8 characters, including one number and one special character.
              </p>

            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#192b4b] font-semibold text-white shadow-lg shadow-[#192b4b]/15 transition hover:bg-[#263c61] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}

              {!loading && (
                <FiArrowRight className="transition group-hover:translate-x-1" />
              )}
            </button>

          </form>

          {/* LOGIN LINK */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs text-slate-400">
              ALREADY WITH US?
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <Link
            to="/login"
            className="flex h-14 w-full items-center justify-center rounded-xl border border-[#192b4b]/20 bg-white font-semibold text-[#192b4b] transition hover:border-[#192b4b] hover:bg-slate-50"
          >
            Sign In
          </Link>

          {/* FOOTER */}
          <p className="mt-8 text-center text-xs leading-6 text-slate-400">
            By creating an account, you agree to our Terms of Service
            and Privacy Policy.
          </p>

        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
