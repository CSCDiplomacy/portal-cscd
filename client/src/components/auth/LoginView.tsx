// Login shell: brand header + one of three forms (sign in / reset / new
// password). Recovery links land here with recoveryMode set by the auth store.
import { useAuthStore } from '../../stores/authStore';
import { LoginForm } from './LoginForm';
import { NewPasswordForm } from './NewPasswordForm';

export const LoginView = () => {
  const { eventName, recoveryMode } = useAuthStore();

  return (
    <div className="login-wrap">
      <div className="login-above">
        <img src="/img/cscd-logo.png" className="brand-logo" alt="CSCD" />
        <span className="brand-sub">{eventName}</span>
      </div>
      <div className="login-card">
        <div className="login-body">{recoveryMode ? <NewPasswordForm /> : <LoginForm />}</div>
      </div>
    </div>
  );
};
