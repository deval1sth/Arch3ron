/* Archeron Beta service worker: a separate test copy at /beta/ with its own cache names and storage.
   Bump VERSION on every release. Only ever deletes its own old caches, never the main app's. */
const VERSION = 'archeron-beta-2.5.5';
const FILES = ['./', 'index.html', 'styles.css', 'transitions.css', 'teach.css', 'vocab.js', 'data.js', 'content.js', 'bank2.js', 'bank3.js', 'defs.js', 'defs2.js', 'bank4.js', 'chem.js', 'exam.js', 'papers.js', 'papersh.js', 'fx.js', 'sfx.js', 'pics.js', 'learn.js', 'demo.js', 'board.js', 'guides.js', 'study.js', 'plus.js', 'desk.js', 'stats.js', 'me.js', 'friends.js', 'app.js', 'seq.js', 'slips.js', 'teach.js', 'check.js', 'bites.js', 'listen.js', 'examiner.js', 'forecast.js', 'manifest.json', 'icon.svg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'fonts/bricolage.woff', 'fonts/kalam-400.woff2', 'fonts/kalam-700.woff2', 'fonts/atkinson-400.woff', 'fonts/atkinson-700.woff', 'fonts/atkinson-italic.woff'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('archeron-beta-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await c.match('index.html') : null);
    return hit || fetch(req).catch(() => Response.error());
  }));
});
