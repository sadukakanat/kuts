/**
 * KUTS MOBILE SERVICE WORKER - OFFLINE ACCESSIBILITY INFRASTRUCTURE
 */
const CACHE_NAME = "kuts-mobile-v1";
const ASSETS = [
  "./index.html",
  "./kuts-mesh-worker.js",
  "./manifest.json"
];

// Installs and caches the core KUTS independent files locally on the phone
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Intercepts data requests to serve the browser smoothly offline
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});