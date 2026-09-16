/**
 * Deliberately minimal. Its only job is to satisfy the browser's
 * "installable as an app" requirement (a manifest + a registered
 * service worker with a fetch handler). It never caches app shell,
 * pages, or API responses — every request goes straight to the
 * network — so a change pushed to the live site (new UI, a new
 * downloader, an API fix) shows up in the installed app the very
 * next time it's opened. There is nothing to invalidate and no
 * separate "app build" to ship.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
