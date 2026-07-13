import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/auth.service';

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setServerError('');
    setLoading(true);
    try {
      const { data } = await registerUser(formData);
      navigate('/verify-email', { state: { email: data.data.email } });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-0 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Create your account</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Join LandEstateX to start your property journey.
        </p>

        {serverError && (
          <div className="mb-4 rounded-md bg-danger-600/10 px-4 py-2 text-sm text-danger-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">Full Name</label>
            <input
              type="text"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('full_name', { required: 'Full name is required' })}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-danger-600">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="mt-1 text-xs text-danger-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">Phone Number</label>
            <input
              type="tel"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('phone_number', { required: 'Phone number is required' })}
            />
            {errors.phone_number && (
              <p className="mt-1 text-xs text-danger-600">{errors.phone_number.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">I am a</label>
            <select
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('role', { required: true })}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="broker">Broker</option>
              <option value="builder">Builder</option>
              <option value="investor">Investor</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('password', { required: 'Password is required', minLength: 8 })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-danger-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary-700 py-2 font-medium text-white transition hover:bg-primary-900 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;