/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (char) => {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return escapeMap[char];
  });
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + m;
}

/**
 * Format time string to 12-hour format
 */
export function format12Hour(time: string): string {
  const [h, m] = String(time).split(':').map(Number);
  const hour = ((h + 11) % 12) + 1;
  const mins = String(m).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${hour}:${mins} ${ap}`;
}

/**
 * Get current time in a specific timezone
 */
export function tzNow(tz: string): { date: string; minutes: number } {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    f.formatToParts(new Date()).map((x) => [x.type, x.value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: +parts.hour * 60 + +parts.minute,
  };
}

/**
 * Generate a Google Maps search link from a location string
 */
export function mapsLink(query: string | null | undefined): string | null {
  if (!query) return null;
  if (/^https?:\/\//.test(query)) return query;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Clone and sort an array
 */
export function sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  const sorted = [...arr].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
}
