import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDelegateStore } from '../stores/delegateStore';
import {
  loadRundown,
  loadSpeakers,
  loadVisits,
  loadAnnouncements,
  loadFavorites,
} from '../services/data';

/**
 * Load all app data (rundown, speakers, visits, announcements, favorites)
 * Called once when the user is authenticated
 */
export const useAppData = () => {
  const { session } = useAuthStore();
  const {
    setRundown,
    setSpeakers,
    setVisits,
    setAnnouncements,
    setFavourites,
    setLoading,
    setError,
  } = useDelegateStore();

  useEffect(() => {
    if (!session) return;

    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [rundown, speakers, visits, announcements, favorites] =
          await Promise.all([
            loadRundown(),
            loadSpeakers(),
            loadVisits(),
            loadAnnouncements(),
            loadFavorites(),
          ]);

        if (rundown) setRundown(rundown);
        if (speakers) setSpeakers(speakers);
        if (visits) setVisits(visits);
        if (announcements) setAnnouncements(announcements);
        if (favorites) setFavourites(favorites);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to load app data';
        setError(msg);
        console.error('Failed to load app data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [session]);
};
