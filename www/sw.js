/* AuraOpal service worker — offline-first boulder-opal field map.
 *
 * Sibling of AuraGold's SW (github.com/banksiasprings/auragold), same strategy:
 *   - App shell (same-origin HTML/manifest/icons + bundled GeoJSON + Leaflet CDN)
 *     is precached on install so the app boots with no network.
 *   - Map tiles + the GA magnetics WMS + any cross-origin asset are cache-first at
 *     runtime: served from cache when present, else fetched and stored. Anything you
 *     view online is then available in the field with no signal.
 *
 * Bump SHELL_REV on every deploy so returning clients re-fetch the app shell.
 * Keep it in lockstep with APP_VERSION in index.html (the on-screen version badge).
 */
const SHELL_REV = 'v0.1.2';
const SHELL_CACHE = 'auraopal-shell-' + SHELL_REV;
const TILE_CACHE = 'auraopal-tiles-v1';

// Relative paths so it works under the /auraopal/ GitHub Pages subpath.
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // Ground-truth-adjacent bundled overlays (small, precached so they work offline).
  './data/winton_formation.geojson',
  './data/tenements_opalton.geojson',
  './data/contours_10m_opalton.geojson',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  // Leaflet from CDN — cross-origin but CORS-enabled, so cacheable.
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // Add each asset individually so one flaky CDN response can't fail install.
    await Promise.all(SHELL_ASSETS.map(async (url) => {
      try { await cache.add(new Request(url, { cache: 'reload' })); }
      catch (err) { console.warn('[sw] precache miss:', url, err); }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith('auraopal-shell-') && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // App shell: cache-first, network fallback, index.html fallback for navigations.
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && res.ok) { const cache = await caches.open(SHELL_CACHE); cache.put(req, res.clone()); }
        return res;
      } catch (err) {
        if (req.mode === 'navigate') {
          const fallback = await caches.match('./index.html');
          if (fallback) return fallback;
        }
        throw err;
      }
    })());
    return;
  }

  // Cross-origin: map tiles, GA magnetics WMS, Leaflet CDN — cache-first.
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) {
        const cache = await caches.open(TILE_CACHE);
        cache.put(req, res.clone());
      }
      return res;
    } catch (err) {
      return Response.error();  // offline + not cached — map shows an empty tile
    }
  })());
});

// Let the page report how many tiles are cached (used by offline UI/tests).
self.addEventListener('message', (event) => {
  if (event.data === 'TILE_COUNT') {
    event.waitUntil((async () => {
      let count = 0;
      try { const cache = await caches.open(TILE_CACHE); count = (await cache.keys()).length; } catch (e) {}
      const clients = await self.clients.matchAll();
      clients.forEach((c) => c.postMessage({ type: 'TILE_COUNT', count }));
    })());
  }
});
