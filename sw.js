/* Archeron service worker. Bump VERSION on every release so phones pick up the new files.
   Each version caches one consistent set of files, fetched fresh (bypassing the browser's HTTP cache, which on
   GitHub Pages holds files for 10 minutes). Files are never refreshed one by one: mixing old and new files is
   what broke the app after an update. */
const VERSION = 'archeron-5.11.0';
const FILES = ['./', 'index.html', 'styles.css', 'transitions.css', 'vocab.js', 'data.js', 'content.js', 'defs.js', 'defs2.js', 'chem.js', 'exam.js', 'papers.js', 'fx.js', 'learn.js', 'guides.js', 'study.js', 'realm.js', 'plus.js', 'app.js', 'manifest.json', 'icon.svg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Same-origin GETs: this version's cached copy, else the network. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await c.match('index.html') : null);
    return hit || fetch(req).catch(() => Response.error());
  }));
});
