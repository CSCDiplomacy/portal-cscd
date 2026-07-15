import { create } from 'zustand';
import type { Delegate, Session } from '../types';

interface AuthState {
  session: Session | null;
  user: Partial<Delegate> | null;
  loading: boolean;
  error: string | null;

  setSession: (session: Session | null) => void;
  setUser: (user: Partial<Delegate> | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  error: null,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  reset: () => set({
    session: null,
    user: null,
    loading: false,
    error: null,
  }),
}));
