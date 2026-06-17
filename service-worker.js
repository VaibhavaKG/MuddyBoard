// service-worker.js
const CACHE_NAME = 'muddyboard-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './modules/audio.js',
  './modules/photos.js',
  './modules/animations.js',
  './modules/celebrations.js',
  './modules/mascots.js',
  './modules/surprises.js',
  './modules/themes.js',
  './modules/parent.js',
  './modules/modes/bubbles.js',
  './modules/modes/animals.js',
  './modules/modes/paint.js',
  './modules/modes/music.js',
  './modules/modes/fireworks.js',
  './modules/modes/ocean.js',
  './modules/modes/space.js',
  './modules/modes/vehicles.js',
  './modules/modes/puzzle.js',
  './modules/modes/memory.js',
  './modules/modes/slideshow.js',
  './photos/photos.json'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core assets');
      // Use addAll, catch failures individually if they are optional
      return Promise.all(
        ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn(`[Service Worker] Failed to cache asset: ${asset}`, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Cache-first with Network Fallback
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Only cache valid GET responses and skip browser extensions or chrome:// URLs
        if (
          e.request.method === 'GET' &&
          networkResponse.status === 200 &&
          (e.request.url.startsWith('http') || e.request.url.startsWith(self.location.origin))
        ) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        // Optional offline fallback could be returned here
      });
    })
  );
});
