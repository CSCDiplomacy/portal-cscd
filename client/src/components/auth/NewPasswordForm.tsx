import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface NewPasswordFormProps {
  onSuccess: () => void;
}

export const NewPasswordForm = ({ onSuccess }: NewPasswordFormProps) => {
  const { setPassword, loading, error, clearError } = useAuth();
  const [password, setPasswordValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (password.length < 8) {
      return;
    }

    try {
      await setPassword(password);
      setTimeout(() => {
        onSuccess();
      }, 800);
    } catch {
      // Error is already set in the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">New password</h1>
        <p className="tag">Choose a new password.</p>
      </div>

      <div className="field">
        <label htmlFor="new-password">New password</label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPasswordValue(e.target.value);
              clearError();
            }}
            disabled={loading}
            required
            minLength={8}
          />
          <button
            type="button"
            className="icon-btn absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Show password"
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      {password && password.length < 8 && (
        <div className="form-msg error">Use at least 8 characters.</div>
      )}

      {error && <div className="form-msg error">{error}</div>}

      <button
        type="submit"
        className="btn w-full"
        disabled={loading || password.length < 8}
      >
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
};
