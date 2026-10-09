import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/auth.service';

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const newPassword = watch('new_password');

  const onSubmit = async (formData) => {
    setServerError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      console.log('[FRONTEND] Reset password request');
      console.log('[FRONTEND] Reset token:', formData.reset_token);

      await resetPassword({
        reset_token: formData.reset_token.trim(),
        new_password: formData.new_password,
      });

      setSuccessMessage(
        'Password reset and set successfully! Redirecting to login...'
      );

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      console.error('[FRONTEND] Reset password error:', err);

      setServerError(
        err.response?.data?.message ||
        'Password reset failed. Please check your reset token.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-0 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">

        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">
          Reset & Set Password
        </h1>

        <p className="mb-6 text-sm text-neutral-500">
          Enter the reset token from the development terminal,
          then set your new password.
        </p>

        {/* ERROR */}
        {serverError && (
          <div className="mb-4 rounded-md bg-danger-600/10 px-4 py-3 text-sm text-danger-600">
            {serverError}
          </div>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div className="mb-4 rounded-md bg-success-600/10 px-4 py-3 text-sm text-success-600">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >

          {/* RESET TOKEN */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Reset Token
            </label>

            <input
              type="text"
              placeholder="Paste token from terminal"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('reset_token', {
                required: 'Reset token is required',
              })}
            />

            {errors.reset_token && (
              <p className="mt-1 text-xs text-danger-600">
                {errors.reset_token.message}
              </p>
            )}
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Set New Password
            </label>

            <input
              type="password"
              placeholder="Enter new password"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('new_password', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message:
                    'Password must be at least 8 characters',
                },
              })}
            />

            {errors.new_password && (
              <p className="mt-1 text-xs text-danger-600">
                {errors.new_password.message}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              Confirm New Password
            </label>

            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-700 focus:outline-none"
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === newPassword ||
                  'Passwords do not match',
              })}
            />

            {errors.confirm_password && (
              <p className="mt-1 text-xs text-danger-600">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {/* RESET + SET PASSWORD */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary-700 py-3 font-medium text-white transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Resetting & Setting Password...'
              : 'Reset & Set Password'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link
            to="/login"
            className="font-medium text-primary-700"
          >
            Back to login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default ResetPasswordPage;