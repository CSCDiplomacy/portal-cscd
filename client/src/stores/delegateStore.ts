// Event data + per-user data (favourites). Favourite toggles are optimistic:
// the Set updates immediately, the API call runs behind it, and the change is
// rolled back if the server rejects it.
import { create } from 'zustand';
import type { Announcement, ContactData, Rundown } from '../types';
import * as dataService from '../services/data';

interface DelegateState {
  rundown: Rundown | null;
  contact: ContactData | null;
  announcements: Announcement[];
  favourites: Set<string>;
  loaded: boolean;

  loadAll: () => Promise<void>;
  toggleFavourite: (sessionId: string) => Promise<void>;
}

let loadPromise: Promise<void> | null = null;

export const useDelegateStore = create<DelegateState>((set, get) => ({
  rundown: null,
  contact: null,
  announcements: [],
  favourites: new Set<string>(),
  loaded: false,

  loadAll: () => {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      const [rundown, contact, announcements, favourites] = await Promise.all([
        dataService.loadRundown(),
        dataService.loadContact(),
        dataService.loadAnnouncements(),
        dataService.loadFavourites(),
      ]);
      set({
        rundown,
        contact,
        announcements,
        favourites: new Set(favourites),
        loaded: true,
      });
    })();
    return loadPromise;
  },

  toggleFavourite: async (sessionId) => {
    const had = get().favourites.has(sessionId);
    const apply = (on: boolean) =>
      set((state) => {
        const next = new Set(state.favourites);
        if (on) next.add(sessionId);
        else next.delete(sessionId);
        return { favourites: next };
      });

    apply(!had); // optimistic
    try {
      if (had) await dataService.removeFavourite(sessionId);
      else await dataService.addFavourite(sessionId);
    } catch {
      apply(had); // roll back
    }
  },
}));
