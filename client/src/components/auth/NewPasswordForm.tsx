import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Icon } from '../Icon';

export const NewPasswordForm = () => {
  const { updatePassword, busy, error, clearError } = useAuthStore();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    if (password.length < 8) {
      setLocalError('Use at least 8 characters.');
      return;
    }
    try {
      await updatePassword(password);
      setDone(true);
    } catch {
      // Error text shown from the store.
    }
  };

  const message = localError || error;

  return (
    <form onSubmit={handleSubmit}>
      <h1>New password</h1>
      <p className="tag">Choose a new password.</p>

      {done ? (
        <div className="form-msg ok">Password updated. Taking you in…</div>
      ) : (
        <>
          <div className="field">
            <label htmlFor="new-password">New password</label>
            <div className="pw-wrap">
              <input
                id="new-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="pw-eye"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <Icon name="eye" size={18} />
              </button>
            </div>
          </div>

          {message && <div className="form-msg error">{message}</div>}

          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </>
      )}
    </form>
  );
};
