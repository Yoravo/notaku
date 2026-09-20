const CACHE_NAME = "notaku-pwa-v2";
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/logo.png",
  "/favicon.ico",
];

// Install: precache offline fallback and essential assets.
// NOTE: we intentionally do NOT call skipWaiting() here — the new worker
// stays in "waiting" so the client can show an update toast and let the
// user reload on demand (triggered via the SKIP_WAITING message below).
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Allow the page to activate the waiting worker on user action ("Reload").
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Activate: clean up old caches and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for navigations with offline fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-GET, chrome-extension, and API requests
  if (
    request.method !== "GET" ||
    !request.url.startsWith("http") ||
    request.url.includes("/api/") ||
    request.url.includes("/_next/webpack-hmr")
  ) {
    return;
  }

  // Handle page navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse || Response.error();
      })
    );
    return;
  }

  // Stale-while-revalidate for static assets
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
