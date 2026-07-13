import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../services/auth.service';

const EmailVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyEmail({ email, otp: otp.trim() });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-0 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm text-center">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Verify your email</h1>
        <p className="mb-6 text-sm text-neutral-500">
          We&apos;ve sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-danger-600/10 px-4 py-2 text-sm text-danger-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-center text-lg tracking-widest focus:border-primary-700 focus:outline-none"
            placeholder="------"
          />

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full rounded-md bg-primary-700 py-2 font-medium text-white transition hover:bg-primary-900 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationPage;