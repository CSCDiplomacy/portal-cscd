import { useEffect, useState } from 'react';
import type { Config } from './types';
import { useAuth } from './hooks/useAuth';
import { useUIStore } from './stores/uiStore';
import { LoginView } from './components/auth/LoginView';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getJson } from './services/api';

const App = () => {
  const { session, loading: authLoading } = useAuth();
  const { setTheme } = useUIStore();
  const [config, setConfig] = useState<Config | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Initialize theme and config on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('cscd_theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    }

    loadConfig();
  }, [setTheme]);

  const loadConfig = async () => {
    try {
      const cfg: Config = await getJson('/api/config');
      setConfig(cfg);
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setConfigLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      {configLoading || authLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="text-center">
            <div className="inline-block">
              <svg className="w-12 h-12 animate-spin text-on-surface" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" opacity="0.25" />
                <path d="M12 3a9 9 0 0 1 9 9" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold mt-4">Loading…</h1>
            <p className="text-on-surface-2 mt-2">Initializing application</p>
          </div>
        </div>
      ) : !session ? (
        <LoginView eventName={config?.eventName || 'CSCD Delegate App'} />
      ) : (
        <AppLayout eventName={config?.eventName || 'Jakarta 2026'} />
      )}
    </ErrorBoundary>
  );
};

export default App;
