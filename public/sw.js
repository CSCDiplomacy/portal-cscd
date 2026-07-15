/* CSCD Delegate App — service worker (v2, React shell).
   v1 (vanilla app) precached /js/app.js, /css/app.css etc. cache-first; those
   files no longer exist, so v2's first job is to wipe old caches. Strategy:
   - Navigations: network-first (fresh index.html on every deploy), cache fallback.
   - /assets/* (Vite content-hashed): cache-first — a hash change is a new URL.
   - Static event JSON (/api/rundown etc.): stale-while-revalidate.
   - Everything else (auth, per-user API, cross-origin): network only. */

const CACHE = 'cscd-v2';
const STATIC_API = ['/api/rundown', '/api/visits', '/api/speakers', '/api/checkin', '/api/contact'];

self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // Navigations: network-first so deploys reach users immediately.
  if (request.mode === 'navigate' || request.destination === 'document') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put('/index.html', res.clone()));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Hashed build assets + images: cache-first.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/img/')) {
    e.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((res) => {
              if (res.ok) cache.put(request, res.clone());
              return res;
            })
        )
      )
    );
    return;
  }

  // Static event JSON: stale-while-revalidate.
  if (STATIC_API.some((p) => url.pathname.startsWith(p))) {
    e.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fresh = fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          });
          return cached || fresh;
        })
      )
    );
  }
  // Everything else falls through to the network.
});
