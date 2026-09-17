import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
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
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setServerError('');
    setLoading(true);
    try {
      const { data } = await loginUser(formData);

const user = data.message.user;
const accessToken = data.message.access_token;

login(user, accessToken);

if (user.role === 'broker') {
  navigate('/broker/dashboard');
} else if (user.role === 'seller') {
  navigate('/dashboard');
} else if (user.role === 'builder') {
  navigate('/dashboard');
} else if (user.role === 'investor') {
  navigate('/dashboard');
} else {
  navigate('/dashboard');
}
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-0 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Welcome back</h1>
        <p className="mb-6 text-sm text-neutral-500">Log in to continue your property journey.</p>

        {serverError && (
          <div className="mb-4 rounded-md bg-danger-600/10 px-4 py-2 text-sm text-danger-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Email or Phone
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('email_or_phone', { required: 'This field is required' })}
            />
            {errors.email_or_phone && (
              <p className="mt-1 text-xs text-danger-600">{errors.email_or_phone.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-danger-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-neutral-500">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="font-medium text-primary-700">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary-700 py-2 font-medium text-white transition hover:bg-primary-900 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          New to LandEstateX?{' '}
          <Link to="/register" className="font-medium text-primary-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;