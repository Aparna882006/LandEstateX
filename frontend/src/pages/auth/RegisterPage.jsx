import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/auth.service';

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'buyer',
    },
  });

  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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

    // Development debug only.
    // Password is intentionally NOT logged.
    console.log('[FRONTEND REGISTER] Sending:', {
      full_name: payload.full_name,
      email: payload.email,
      phone_number: payload.phone_number,
      role: payload.role,
    });

    try {
      const response = await registerUser(payload);

      console.log(
        '[FRONTEND REGISTER] Success:',
        response.data
      );

      const registeredEmail =
        response.data?.data?.email;

      if (!registeredEmail) {
        throw new Error(
          'Registration succeeded but email was not returned by the server.'
        );
      }

      navigate('/verify-email', {
        state: {
          email: registeredEmail,
        },
      });
    } catch (err) {
      console.error(
        '[FRONTEND REGISTER] Failed:',
        err.response?.data || err.message
      );

      const status = err.response?.status;
      const message =
        err.response?.data?.message;

      if (status === 409) {
        setServerError(
          message ||
            'This email or phone number is already registered.'
        );
      } else if (status === 400) {
        const validationErrors =
          err.response?.data?.errors;

        if (Array.isArray(validationErrors)) {
          setServerError(
            validationErrors.join(', ')
          );
        } else {
          setServerError(
            message ||
              'Please check your registration details.'
          );
        }
      } else {
        setServerError(
          message ||
            'Something went wrong. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-0 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">
          Create your account
        </h1>

        <p className="mb-6 text-sm text-neutral-500">
          Join LandEstateX to start your property journey.
        </p>

        {serverError && (
          <div className="mb-4 rounded-md bg-danger-600/10 px-4 py-3 text-sm text-danger-600">
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* FULL NAME */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Full Name
            </label>

            <input
              type="text"
              autoComplete="name"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('full_name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message:
                    'Full name must be at least 2 characters',
                },
              })}
            />

            {errors.full_name && (
              <p className="mt-1 text-xs text-danger-600">
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Email
            </label>

            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value:
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message:
                    'Please enter a valid email address',
                },
              })}
            />

            {errors.email && (
              <p className="mt-1 text-xs text-danger-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PHONE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Phone Number
            </label>

            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('phone_number', {
                required:
                  'Phone number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message:
                    'Please provide a valid 10-digit phone number',
                },
              })}
            />

            {errors.phone_number && (
              <p className="mt-1 text-xs text-danger-600">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          {/* ROLE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              I am a
            </label>

            <select
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('role', {
                required: 'Please select a role',
              })}
            >
              <option value="buyer">
                Buyer
              </option>

              <option value="seller">
                Seller
              </option>

              <option value="broker">
                Broker
              </option>

              <option value="builder">
                Builder
              </option>

              <option value="investor">
                Investor
              </option>
            </select>

            {errors.role && (
              <p className="mt-1 text-xs text-danger-600">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Password
            </label>

            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('password', {
                required:
                  'Password is required',

                minLength: {
                  value: 8,
                  message:
                    'Password must be at least 8 characters',
                },

                pattern: {
                  value:
                    /^(?=.*\d)(?=.*[!@#$%^&*])/,
                  message:
                    'Password must contain at least 1 number and 1 special character',
                },
              })}
            />

            {errors.password && (
              <p className="mt-1 text-xs text-danger-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary-700 py-2 font-medium text-white transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Creating account...'
              : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}

          <Link
            to="/login"
            className="font-medium text-primary-700"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;