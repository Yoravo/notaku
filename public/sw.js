const CACHE_NAME = "notaku-pwa-v4";
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/logo.png",
  "/favicon.ico",
];

// Halaman berisi data akun (PII/finansial) TIDAK boleh disimpan ke Cache Storage:
// cache ini dipakai bersama semua akun di perangkat yang sama dan tidak ikut terhapus saat logout.
// Saat offline, rute ini diarahkan ke /offline yang membaca snapshot localStorage per-user.
const PRIVATE_PREFIXES = [
  "/dashboard",
  "/invoices",
  "/recurring-invoices",
  "/customers",
  "/items",
  "/expenses",
  "/settings",
  "/wallet",
  "/tax-reports",
  "/referrals",
  "/billing",
  "/admin",
  "/i/",
  "/portal/",
];

function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p.endsWith("/") ? p : `${p}/`));
}

// Install: precache offline fallback and essential assets.
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

// Activate: clean up old caches (termasuk v3 yang mungkin berisi HTML privat) and claim clients
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

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-GET, non-http, cross-origin, API, and HMR requests
  if (
    request.method !== "GET" ||
    !request.url.startsWith("http") ||
    request.url.includes("/api/") ||
    request.url.includes("/_next/webpack-hmr")
  ) {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: network-first
  if (request.mode === "navigate") {
    const privatePage = isPrivatePath(url.pathname);

    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Hanya halaman publik non-redirect yang boleh di-cache
          if (
            !privatePage &&
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          if (!privatePage) {
            const cachedPage = await cache.match(request);
            if (cachedPage) return cachedPage;
          }
          const offlineFallback = await cache.match(OFFLINE_URL);
          return offlineFallback || Response.error();
        })
    );
    return;
  }

  // RSC payload (client-side navigation) & data: jangan di-cache (bisa berisi data akun)
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) {
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
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
