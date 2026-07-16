import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Icon } from '../Icon';

export const LoginForm = () => {
  const { login, busy, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    if (!email.trim() || !password) {
      setLocalError('Enter email and password.');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch {
      // Error text is shown from the store.
    }
  };

  const message = localError || error;

  return (
    <form onSubmit={handleSubmit}>
      <h1>Delegate sign in</h1>
      <p className="tag">Your event, all in one place.</p>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="pw-wrap">
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
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
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
};
