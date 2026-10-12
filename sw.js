/* Archeron service worker. Bump VERSION on every release so phones pick up the new files. */
const VERSION = 'archeron-5.0.1';
const FILES = ['./', 'index.html', 'styles.css', 'transitions.css', 'vocab.js', 'data.js', 'content.js', 'defs.js', 'defs2.js', 'chem.js', 'exam.js', 'papers.js', 'fx.js', 'learn.js', 'guides.js', 'realm.js', 'app.js', 'manifest.json', 'icon.svg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Same-origin GETs: serve from cache instantly, refresh the cache in the background. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (req.mode === 'navigate' ? c.match('index.html') : Response.error());
  }));
});
