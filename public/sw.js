// JBlock Offline Service Worker
// Advanced Static Asset Caching & Offline Fallback Strategy (v2)

const CACHE_NAME = 'jblock-offline-v2';
const FONTS_CACHE_NAME = 'jblock-fonts-v1';

// Critical static assets pre-cached during installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Precache critical shell assets
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // Force immediate activation without waiting for existing clients to close
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== FONTS_CACHE_NAME) {
            console.log('[ServiceWorker] Purging stale cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // Take control of all open client tabs immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Navigation requests (HTML documents)
  // Strategy: Network-First with instant offline fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Completely offline -> return pre-cached index.html shell
          return caches.match('/index.html').then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // 2. Google Fonts stylesheets and webfonts
  // Strategy: Cache-First with long-term retention
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(FONTS_CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        }).catch(() => {
          // Gracefully fallback to browser local system fonts if font network fails
          return new Response('', { status: 408, headers: { 'Content-Type': 'text/css' } });
        });
      })
    );
    return;
  }

  // 3. API requests (e.g. /api/compile-run, /api/system-jdk)
  // When offline, immediately return simulated offline fallback JSON
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            available: false,
            message: 'Operating in 100% offline desktop mode. Using local Java engine.'
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // 4. Static scripts, CSS, SVG, icons, JS modules
  // Strategy: Cache-First with background revalidation and automatic dynamic caching
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Fetch in background to update cache if online
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return cachedResponse;
        });

      // If cached, return immediately for instant offline load; otherwise await fetch
      return cachedResponse || fetchPromise;
    })
  );
});
