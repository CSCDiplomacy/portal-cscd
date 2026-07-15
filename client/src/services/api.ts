export async function api<T>(
  path: string,
  opts?: RequestInit & { headers?: Record<string, string> }
): Promise<T> {
  const headers = new Headers(opts?.headers || {});
  headers.set('Content-Type', 'application/json');

  // Attach Bearer token if available in localStorage
  const token = localStorage.getItem('cscd_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`/api${path}`, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export async function getJson<T>(path: string): Promise<T> {
  return fetch(path).then((r) => r.json());
}

export async function track(eventType: string, detail?: unknown): Promise<void> {
  try {
    await api('/track', {
      method: 'POST',
      body: JSON.stringify({ event_type: eventType, detail: detail || null }),
    });
  } catch {
    // Fire-and-forget; errors don't surface to UI
  }
}
