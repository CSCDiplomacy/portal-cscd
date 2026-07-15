import { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { ResetForm } from './ResetForm';
import { NewPasswordForm } from './NewPasswordForm';

type FormType = 'login' | 'reset' | 'newpw';

interface LoginViewProps {
  eventName: string;
}

export const LoginView = ({ eventName }: LoginViewProps) => {
  const [currentForm, setCurrentForm] = useState<FormType>('login');

  useEffect(() => {
    // Check if we're in password recovery flow
    if (location.hash.includes('type=recovery')) {
      setCurrentForm('newpw');
    }
  }, []);

  const handleSuccess = () => {
    // User will be redirected by App.tsx when session is established
    setCurrentForm('login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Above the card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-8">
          <img
            src="/img/cscd-logo.png"
            alt="CSCD"
            className="w-16 h-16 mx-auto mb-4"
          />
          <div className="text-sm font-medium text-on-surface-2">{eventName}</div>
        </div>

        {/* Login card */}
        <div className="w-full max-w-md">
          <div className="bg-surface border border-on-surface-2 border-opacity-10 rounded-lg p-8">
            {currentForm === 'login' && (
              <LoginForm onForgotPassword={() => setCurrentForm('reset')} />
            )}

            {currentForm === 'reset' && (
              <ResetForm onBackToLogin={() => setCurrentForm('login')} />
            )}

            {currentForm === 'newpw' && (
              <NewPasswordForm onSuccess={handleSuccess} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-on-surface-2">
        <p>&copy; {new Date().getFullYear()} CSCD. All rights reserved.</p>
      </div>
    </div>
  );
};
