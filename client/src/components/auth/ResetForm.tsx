import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

export const ResetForm = ({ onBack }: { onBack: () => void }) => {
  const { resetPassword, busy, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    if (!email.trim()) {
      setLocalError('Enter your email.');
      return;
    }
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      // Error text shown from the store.
    }
  };

  const message = localError || error;

  return (
    <form onSubmit={handleSubmit}>
      <h1>Reset password</h1>
      <p className="tag">We'll email you a reset link.</p>

      {sent ? (
        <div className="form-msg ok">If that email exists, a reset link is on its way.</div>
      ) : (
        <div className="field">
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
        </div>
      )}

      {!sent && message && <div className="form-msg error">{message}</div>}

      {!sent && (
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      )}
      <button type="button" className="link-btn" onClick={onBack} disabled={busy}>
        Back to sign in
      </button>
    </form>
  );
};
