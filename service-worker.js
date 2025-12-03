const CACHE_NAME = 'pg-management-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/guest-form.html',
  '/guest-list.html',
  '/room-status.html',
  '/reports.html',
  '/storage.html',
  '/admin-profile.html',
  '/css/style.css',
  '/js/auth.js',
  '/js/config.js',
  '/js/dashboard.js',
  '/js/guest-form.js',
  '/js/guest-list.js',
  '/js/room-status.js',
  '/js/reports.js',
  '/js/storage.js',
  '/js/supabase-client.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Install event - caching essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event - respond with cached assets or fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.filter(name => name !== CACHE_NAME)
                .map(name => caches.delete(name))
    ))
  );
});
