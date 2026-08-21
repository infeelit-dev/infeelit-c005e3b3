const CACHE_NAME = 'infeelit-v3';
// Do NOT precache '/' or '/index.html' — that pins stale JS hashes forever.
const STATIC_ASSETS = [
  '/infeelit-logo.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Never intercept API / third-party traffic
  if (
    url.includes('supabase.co') ||
    url.includes('resend.com') ||
    url.includes('stadiamaps.com')
  ) {
    return;
  }

  const isDocument =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    event.request.headers.get('accept')?.includes('text/html');

  // Network-first for HTML so deploys are never stuck behind a cached index.html
  if (isDocument) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Network-first for hashed assets (JS/CSS) — fall back to cache only if offline
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    url.includes('/assets/')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first only for static icons/manifest
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (event.request.method === 'GET' && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
    )
  );
});
