import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onForgotPassword: () => void;
}

export const LoginForm = ({ onForgotPassword }: LoginFormProps) => {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password) {
      // Error will be set by the form validation
      return;
    }

    try {
      await login(email, password);
    } catch {
      // Error is already set in the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Delegate sign in</h1>
        <p className="tag">Your event, all in one place.</p>
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
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

      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
            disabled={loading}
            required
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

      {error && <div className="form-msg error">{error}</div>}

      <button
        type="submit"
        className="btn w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="inline-block w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9" opacity="0.25" />
              <path d="M12 3a9 9 0 0 1 9 9" />
            </svg>
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </button>

      <button
        type="button"
        className="link-btn w-full text-center"
        onClick={onForgotPassword}
        disabled={loading}
      >
        Forgot password?
      </button>
    </form>
  );
};
