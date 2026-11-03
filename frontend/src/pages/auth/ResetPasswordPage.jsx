
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  FiHome,
  FiLock,
  FiArrowLeft,
  FiShield,
  FiCheckCircle,
} from 'react-icons/fi';
import { resetPassword } from '../../services/auth.service';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resetToken = searchParams.get('token') || '';

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

    if (!resetToken) {
      setServerError(
        'Reset link is missing or invalid. Please request a new password reset link.'
      );
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        reset_token: resetToken,
        new_password: formData.new_password,
      });

      setSuccessMessage(
        'Your password has been reset successfully. Redirecting to login...'
      );

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);

    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        'Password reset failed. Your reset link may be invalid or expired.'
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
              Secure access.
              <br />
              Fresh start.
              <span className="block text-[#d9bd8b]">
                Welcome back.
              </span>
            </h1>

            <p className="mt-6 leading-8 text-white/75">
              Create a new password and continue your property
              journey with LandEstateX.
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
              <FiLock size={28} />
            </div>

            <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-[#a88b5b]">
              ACCOUNT SECURITY
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-[#172640]">
              Set new password
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Choose a strong password to secure your
              LandEstateX account. Your reset link is valid
              for 30 minutes.
            </p>
          </div>

          {!resetToken && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
              Your reset link is missing or invalid.
              Please request a new password reset email.
              <Link
                to="/forgot-password"
                className="ml-1 font-semibold underline"
              >
                Request new link
              </Link>
            </div>
          )}

          {serverError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
              {serverError}
              <div className="mt-2">
                <Link
                  to="/forgot-password"
                  className="font-semibold underline"
                >
                  Request a new reset link
                </Link>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
              <FiCheckCircle className="mt-1 shrink-0" size={18} />
              {successMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >

            {/* NEW PASSWORD */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#24344e]">
                New Password
              </label>

              <input
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                disabled={!resetToken || loading || !!successMessage}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#192b4b] focus:ring-4 focus:ring-[#192b4b]/10 disabled:bg-slate-100"
                {...register('new_password', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
              />

              {errors.new_password && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#24344e]">
                Confirm New Password
              </label>

              <input
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your new password"
                disabled={!resetToken || loading || !!successMessage}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#192b4b] focus:ring-4 focus:ring-[#192b4b]/10 disabled:bg-slate-100"
                {...register('confirm_password', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === newPassword ||
                    'Passwords do not match',
                })}
              />

              {errors.confirm_password && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={!resetToken || loading || !!successMessage}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#192b4b] font-semibold text-white shadow-lg shadow-[#192b4b]/15 transition hover:bg-[#263c61] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
              {!loading && <FiLock />}
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

export default ResetPasswordPage;
