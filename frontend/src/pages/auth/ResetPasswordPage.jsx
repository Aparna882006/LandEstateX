import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/auth.service';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData) => {
    setServerError('');
    setLoading(true);
    try {
      await resetPassword({ ...formData, reset_token: resetToken });
      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-0 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Reset your password</h1>
        <p className="mb-6 text-sm text-neutral-500">Choose a new password for your account.</p>

        {serverError && (
          <div className="mb-4 rounded-md bg-danger-600/10 px-4 py-2 text-sm text-danger-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">New Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('new_password', { required: 'Password is required', minLength: 8 })}
            />
            {errors.new_password && (
              <p className="mt-1 text-xs text-danger-600">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('new_password') || 'Passwords do not match',
              })}
            />
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-danger-600">{errors.confirm_password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary-700 py-2 font-medium text-white transition hover:bg-primary-900 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;