import { useEffect, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from '../stores/authStore';
import { useDelegateStore } from '../stores/delegateStore';
import type { Config, Session } from '../types';
import { getJson } from '../services/api';

interface UseAuthReturn {
  session: Session | null;
  user: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  clearError: () => void;
}

let sbInstance: SupabaseClient | null = null;

export const useAuth = (): UseAuthReturn => {
  const {
    session,
    user,
    loading,
    error,
    setSession,
    setUser,
    setLoading,
    setError,
    clearError: storeClearError,
  } = useAuthStore();

  const { setProfile } = useDelegateStore();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const config: Config = await getJson('/api/config');

      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        setError('Auth not configured');
        return;
      }

      sbInstance = createClient(config.supabaseUrl, config.supabaseAnonKey);

      // Check for existing session
      const { data } = await sbInstance.auth.getSession();
      if (data.session) {
        setSession(data.session as Session);
        localStorage.setItem('cscd_token', data.session.access_token);
        await loadProfile();
      }

      // Listen for auth state changes
      sbInstance.auth.onAuthStateChange((_event, s) => {
        if (s) {
          setSession(s as Session);
          localStorage.setItem('cscd_token', s.access_token);
        } else {
          setSession(null);
          localStorage.removeItem('cscd_token');
        }
      });

      // Handle recovery token in URL
      if (location.hash.includes('type=recovery')) {
        // Supabase will handle this automatically
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth init failed');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/me/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cscd_token')}`,
        },
      });
      if (res.ok) {
        const profile = await res.json();
        setUser(profile);
        setProfile(profile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure Supabase is initialized
      if (!sbInstance) {
        const config: Config = await getJson('/api/config');
        if (!config.supabaseUrl || !config.supabaseAnonKey) {
          throw new Error('Auth not configured on server');
        }
        sbInstance = createClient(config.supabaseUrl, config.supabaseAnonKey);
      }

      const { data, error: err } = await sbInstance.auth.signInWithPassword({
        email,
        password,
      });

      if (err) throw err;
      if (data.session) {
        setSession(data.session as Session);
        localStorage.setItem('cscd_token', data.session.access_token);
        await loadProfile();
        // Track login event
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_type: 'login', detail: null }),
        }).catch(() => {});
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!sbInstance) throw new Error('Auth not initialized');
    try {
      setLoading(true);
      await sbInstance.auth.signOut();
      setSession(null);
      setUser(null);
      localStorage.removeItem('cscd_token');
      setProfile(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Logout failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!sbInstance) throw new Error('Auth not initialized');
    try {
      setLoading(true);
      setError(null);

      const { error: err } = await sbInstance.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin,
      });

      if (err) throw err;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setPassword = async (password: string) => {
    if (!sbInstance) throw new Error('Auth not initialized');
    try {
      setLoading(true);
      setError(null);

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const { error: err } = await sbInstance.auth.updateUser({ password });
      if (err) throw err;

      // Clear hash after reset
      history.replaceState(null, '', location.pathname);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Password update failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    user,
    loading,
    error,
    login,
    logout,
    resetPassword,
    setPassword,
    clearError: storeClearError,
  };
};
