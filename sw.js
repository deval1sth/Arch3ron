/* Archeron service worker. Bump VERSION on every release so phones pick up the new files.
   Each version caches one consistent set of files, fetched fresh (bypassing the browser's HTTP cache, which on
   GitHub Pages holds files for 10 minutes). Files are never refreshed one by one: mixing old and new files is
   what broke the app after an update. */
const VERSION = 'archeron-11.9.53';
const FILES = ['./', 'index.html', 'styles.css', 'transitions.css', 'teach.css', 'vocab.js', 'data.js', 'content.js', 'bank2.js', 'bank3.js', 'defs.js', 'defs2.js', 'bank4.js', 'bank5.js', 'chem.js', 'exam.js', 'papers.js', 'papersh.js', 'fx.js', 'sfx.js', 'pics.js', 'learn.js', 'demo.js', 'board.js', 'guides.js', 'study.js', 'plus.js', 'desk.js', 'stats.js', 'me.js', 'app.js', 'bgfx.js', 'seq.js', 'slips.js', 'teach.js', 'check.js', 'bites.js', 'listen.js', 'examiner.js', 'forecast.js', 'rival.html', 'rival.css', 'rival-pixel.js', 'rival-brain.js', 'rival.js', 'rival-neurons.js', 'rival-log.js', 'rival-log.css', 'rival-chart.js', 'rival-chart.css', 'rival-paper.js', 'rival-paper.css', 'rival-sick.js', 'rival-league.js', 'rival-league.css', 'rival-test.js', 'rival-test.css', 'rival-coach-claude.js', 'rival-coach-codex.js', 'rival-coach-anti.js', 'manifest.json', 'icon.svg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'fonts/bricolage.woff', 'fonts/kalam-400.woff2', 'fonts/kalam-700.woff2', 'fonts/atkinson-400.woff', 'fonts/atkinson-700.woff', 'fonts/atkinson-italic.woff'];

self.addEventListener('install', e => {
  /* ?v= makes each file a new address, so GitHub's servers cannot hand back the previous version for a few minutes after a push */
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f + '?v=' + VERSION, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  /* only this app's own old versions: the Lab and Beta copies on the same site keep their caches */
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => /^archeron-\d/.test(k) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Same-origin GETs: this version's cached copy, else the network. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (/\/(lab|beta|onur3d)\//.test(new URL(req.url).pathname)) return; /* other pages on the site: never answer for them */
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await c.match('index.html', { ignoreSearch: true }) : null);
    return hit || fetch(req).catch(() => Response.error());
  }));
});
