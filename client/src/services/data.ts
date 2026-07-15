import { api, getJson } from './api';
import type {
  Rundown,
  Speaker,
  Visit,
  Announcement,
} from '../types';

/**
 * Load the event rundown (schedule with day tabs and timeline)
 */
export async function loadRundown(): Promise<Rundown | null> {
  try {
    return await getJson('/data/rundown.json');
  } catch (err) {
    console.error('Failed to load rundown:', err);
    return null;
  }
}

/**
 * Load speakers list
 */
export async function loadSpeakers(): Promise<Speaker[]> {
  try {
    const data = await getJson<Record<string, unknown>>('/data/speakers.json');
    return (data?.speakers as Speaker[]) || [];
  } catch (err) {
    console.error('Failed to load speakers:', err);
    return [];
  }
}

/**
 * Load visits/excursions
 */
export async function loadVisits(): Promise<Visit[]> {
  try {
    const data = await getJson<Record<string, unknown>>('/data/visits.json');
    return (data?.visits as Visit[]) || [];
  } catch (err) {
    console.error('Failed to load visits:', err);
    return [];
  }
}

/**
 * Load announcements/updates from Supabase
 */
export async function loadAnnouncements(): Promise<Announcement[]> {
  try {
    return await api<Announcement[]>('/announcements');
  } catch (err) {
    console.error('Failed to load announcements:', err);
    return [];
  }
}

/**
 * Submit feedback
 */
export async function submitFeedback(comment: string): Promise<void> {
  await api('/feedback', {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

/**
 * Add an event to favorites
 */
export async function addToFavorites(eventId: string): Promise<void> {
  await api('/favorites', {
    method: 'POST',
    body: JSON.stringify({ event_id: eventId }),
  });
}

/**
 * Remove an event from favorites
 */
export async function removeFromFavorites(eventId: string): Promise<void> {
  await api(`/favorites/${eventId}`, { method: 'DELETE' });
}

/**
 * Load user's favorite events
 */
export async function loadFavorites(): Promise<string[]> {
  try {
    const data = await api<{ event_id: string }[]>('/favorites');
    return data.map((f) => f.event_id);
  } catch (err) {
    console.error('Failed to load favorites:', err);
    return [];
  }
}

/**
 * Track usage event (analytics)
 */
export async function trackEvent(
  eventType: string,
  detail?: unknown
): Promise<void> {
  try {
    await api('/track', {
      method: 'POST',
      body: JSON.stringify({ event_type: eventType, detail: detail || null }),
    });
  } catch {
    // Fire-and-forget; errors don't surface to UI
  }
}
