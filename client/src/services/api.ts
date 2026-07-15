// Thin fetch wrapper for the app's own API. The Bearer token is kept in
// localStorage by useAuth (updated on every Supabase auth state change).

export const TOKEN_KEY = 'cscd_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function api<T = unknown>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const headers = new Headers(opts.headers || {});
  if (!headers.has('Content-Type') && opts.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`/api${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({} as { error?: string }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

/** Fire-and-forget usage analytics. Never blocks or surfaces errors to the UI.
 *  The backend only accepts: login | pdf_download | screen_view. */
export function track(
  eventType: 'login' | 'pdf_download' | 'screen_view',
  detail?: string
): void {
  api('/track', {
    method: 'POST',
    body: JSON.stringify({ event_type: eventType, detail: detail ?? null }),
  }).catch(() => {});
}
