// GymLog service worker — lets the app open with no signal.
// Bump CACHE when the list of precached files changes.
const CACHE = 'gymlog-v2';
const FIREBASE = 'https://www.gstatic.com/firebasejs/';

const SHELL = [
  './',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'fonts/anton.woff2',
];
// Must match the versions imported in index.html
const FIREBASE_MODULES = [
  FIREBASE + '10.12.0/firebase-app.js',
  FIREBASE + '10.12.0/firebase-auth.js',
  FIREBASE + '10.12.0/firebase-firestore.js',
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // Best effort: a CDN hiccup shouldn't stop the worker installing
    await Promise.all(FIREBASE_MODULES.map(u => cache.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Firebase modules are versioned by URL, so whatever is cached is always right
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

// Our own files: prefer the network so updates arrive, fall back to the cache when offline or slow
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  const fromCache = () => cache.match(req, { ignoreSearch: req.mode === 'navigate' })
    .then(hit => hit || (req.mode === 'navigate' ? cache.match('./') : undefined));
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
    ]);
    if (res.ok) cache.put(req.mode === 'navigate' && new URL(req.url).pathname === '/' ? './' : req, res.clone());
    return res;
  } catch (err) {
    const hit = await fromCache();
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.startsWith(FIREBASE)) { e.respondWith(cacheFirst(req)); return; }
  if (new URL(req.url).origin === self.location.origin) e.respondWith(networkFirst(req));
  // Everything else (Firestore, sign-in, avatars) goes straight to the network
});
