const CACHE_NAME = 'infeelit-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/infeelit-logo.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Don't cache Supabase API calls
  if (event.request.url.includes('supabase.co') ||
      event.request.url.includes('resend.com') ||
      event.request.url.includes('stadiamaps.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => {
        // If offline and no cache, return offline page
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});
