import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ResetFormProps {
  onBackToLogin: () => void;
}

export const ResetForm = ({ onBackToLogin }: ResetFormProps) => {
  const { resetPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim()) {
      return;
    }

    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      // Error is already set in the store
    }
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Reset password</h1>
          <p className="tag">We'll email you a reset link.</p>
        </div>
        <div className="form-msg ok">
          If that email exists, a reset link is on its way.
        </div>
        <button
          type="button"
          className="btn w-full"
          onClick={onBackToLogin}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Reset password</h1>
        <p className="tag">We'll email you a reset link.</p>
      </div>

      <div className="field">
        <label htmlFor="reset-email">Email</label>
        <input
          id="reset-email"
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError();
          }}
          disabled={loading}
          required
        />
      </div>

      {error && <div className="form-msg error">{error}</div>}

      <button
        type="submit"
        className="btn w-full"
        disabled={loading}
      >
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <button
        type="button"
        className="link-btn w-full text-center"
        onClick={onBackToLogin}
        disabled={loading}
      >
        Back to sign in
      </button>
    </form>
  );
};
