import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/auth.service';

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await forgotPassword(formData);
      setMessage(data.message);
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-0 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Forgot your password?</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {message && (
          <div className="mb-4 rounded-md bg-info-600/10 px-4 py-2 text-sm text-info-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="mt-1 text-xs text-danger-600">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary-700 py-2 font-medium text-white transition hover:bg-primary-900 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link to="/login" className="font-medium text-primary-700">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;