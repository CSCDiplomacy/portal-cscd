// Login shell: brand header + one of three forms (sign in / reset / new
// password). Recovery links land here with recoveryMode set by the auth store.
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { LoginForm } from './LoginForm';
import { ResetForm } from './ResetForm';
import { NewPasswordForm } from './NewPasswordForm';

type FormKind = 'login' | 'reset' | 'newpw';

export const LoginView = () => {
  const { eventName, recoveryMode, clearError } = useAuthStore();
  const [form, setForm] = useState<FormKind>(recoveryMode ? 'newpw' : 'login');

  useEffect(() => {
    if (recoveryMode) setForm('newpw');
  }, [recoveryMode]);

  const swap = (kind: FormKind) => {
    clearError();
    setForm(kind);
  };

  return (
    <div className="login-wrap">
      <div className="login-above">
        <img src="/img/cscd-logo.png" className="brand-logo" alt="CSCD" />
        <span className="brand-sub">{eventName}</span>
      </div>
      <div className="login-card">
        <div className="login-body">
          {form === 'login' && <LoginForm onForgot={() => swap('reset')} />}
          {form === 'reset' && <ResetForm onBack={() => swap('login')} />}
          {form === 'newpw' && <NewPasswordForm />}
        </div>
      </div>
    </div>
  );
};
