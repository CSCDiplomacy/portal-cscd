import { create } from 'zustand';
import type { Delegate, Rundown, Speaker, Visit, Hotel, Announcement } from '../types';

interface HotelData {
  delegate: Partial<Delegate> | null;
  hotel: Hotel | null;
}

interface DelegateState {
  profile: Partial<Delegate> | null;
  favourites: Set<string>;
  hotel: HotelData | null;
  rundown: Rundown | null;
  speakers: Speaker[];
  visits: Visit[];
  announcements: Announcement[];
  loading: boolean;
  error: string | null;

  setProfile: (profile: Partial<Delegate> | null) => void;
  setFavourites: (ids: string[]) => void;
  addFavourite: (id: string) => void;
  removeFavourite: (id: string) => void;
  toggleFavourite: (id: string) => void;
  setHotel: (hotel: HotelData | null) => void;
  setRundown: (rundown: Rundown | null) => void;
  setSpeakers: (speakers: Speaker[]) => void;
  setVisits: (visits: Visit[]) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDelegateStore = create<DelegateState>((set) => ({
  profile: null,
  favourites: new Set(),
  hotel: null,
  rundown: null,
  speakers: [],
  visits: [],
  announcements: [],
  loading: false,
  error: null,

  setProfile: (profile) => set({ profile }),
  setFavourites: (ids) => set({ favourites: new Set(ids) }),
  addFavourite: (id) => set((state) => {
    const next = new Set(state.favourites);
    next.add(id);
    return { favourites: next };
  }),
  removeFavourite: (id) => set((state) => {
    const next = new Set(state.favourites);
    next.delete(id);
    return { favourites: next };
  }),
  toggleFavourite: (id) => set((state) => {
    const next = new Set(state.favourites);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return { favourites: next };
  }),
  setHotel: (hotel) => set({ hotel }),
  setRundown: (rundown) => set({ rundown }),
  setSpeakers: (speakers) => set({ speakers }),
  setVisits: (visits) => set({ visits }),
  setAnnouncements: (announcements) => set({ announcements }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    profile: null,
    favourites: new Set(),
    hotel: null,
    rundown: null,
    speakers: [],
    visits: [],
    announcements: [],
    loading: false,
    error: null,
  }),
}));
