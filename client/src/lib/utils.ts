/** "14:30" → "2:30 PM" */
export function format12Hour(time: string): string {
  const [h, m] = String(time).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** Address / query → Google Maps search link (passes URLs through untouched). */
export function mapsLink(query: string | null | undefined): string | null {
  if (!query) return null;
  if (/^https?:\/\//.test(query)) return query;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** "2026-08-20" → "Aug 20" (safe fallback to the raw string). */
export function shortDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
