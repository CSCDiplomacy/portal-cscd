import { create } from 'zustand';
import type { Theme, Screen } from '../types';

interface ModalState {
  visible: boolean;
  title: string;
  body: string;
}

interface UIState {
  theme: Theme;
  activeScreen: Screen;
  sidebarOpen: boolean;
  railOpen: boolean;
  menuOpen: boolean;
  modal: ModalState;
  readNotifications: Set<string>;

  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  switchScreen: (screen: Screen) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleRail: () => void;
  setRailOpen: (open: boolean) => void;
  toggleMenu: () => void;
  setMenuOpen: (open: boolean) => void;
  showModal: (title: string, body: string) => void;
  hideModal: () => void;
  markNotificationRead: (id: string) => void;
  setReadNotifications: (ids: string[]) => void;
  reset: () => void;
}

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('cscd_theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialReadNotifications = (): Set<string> => {
  try {
    const stored = localStorage.getItem('cscd_read_notifications');
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

export const useUIStore = create<UIState>((set) => ({
  theme: getInitialTheme(),
  activeScreen: 'dashboard',
  sidebarOpen: true,
  railOpen: false,
  menuOpen: false,
  modal: { visible: false, title: '', body: '' },
  readNotifications: getInitialReadNotifications(),

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('cscd_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    return { theme: newTheme };
  }),

  setTheme: (theme) => set({
    theme,
  }),

  switchScreen: (screen) => set({ activeScreen: screen }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleRail: () => set((state) => ({ railOpen: !state.railOpen })),
  setRailOpen: (open) => set({ railOpen: open }),

  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
  setMenuOpen: (open) => set({ menuOpen: open }),

  showModal: (title, body) => set({ modal: { visible: true, title, body } }),
  hideModal: () => set({ modal: { visible: false, title: '', body: '' } }),

  markNotificationRead: (id) => set((state) => {
    const next = new Set(state.readNotifications);
    next.add(id);
    const arr = Array.from(next);
    localStorage.setItem('cscd_read_notifications', JSON.stringify(arr));
    return { readNotifications: next };
  }),

  setReadNotifications: (ids) => {
    const set_ = new Set(ids);
    localStorage.setItem('cscd_read_notifications', JSON.stringify(ids));
    return set({ readNotifications: set_ });
  },

  reset: () => set({
    theme: getInitialTheme(),
    activeScreen: 'dashboard',
    sidebarOpen: true,
    railOpen: false,
    menuOpen: false,
    modal: { visible: false, title: '', body: '' },
    readNotifications: new Set(),
  }),
}));
