/* Archeron · visual effects: confetti bursts, count-ups, the set-complete overlay.
   Pure canvas/DOM, no assets. Everything is skipped under prefers-reduced-motion. */
'use strict';
const FX = (() => {
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, inited = false;
  const INKS = ['#b6ef4f', '#ff9fd4', '#ffb65c', '#85d5ff', '#c8b4ff', '#2f55e4']; /* the highlighters and the biro */
  const cv = document.getElementById('fx');
  const ctx = cv && cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, sparks = [], running = false;

  function size() {
    if (!cv) return;
    dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  /* paper confetti: little strips that tumble as they fall; the loop stops when the last one lands */
  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.life -= 1; s.vy += .14; s.vx *= .97; s.vy *= .97; s.x += s.vx; s.y += s.vy; s.rot += s.spin;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, s.life / 14);
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.scale(1, Math.cos(s.rot * 1.7));
      ctx.fillStyle = s.c; ctx.fillRect(-s.r, -s.r * .45, s.r * 2, s.r * .9); ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (!sparks.length) { running = false; ctx.clearRect(0, 0, W, H); return; }
    requestAnimationFrame(loop);
  }
  function start() {
    if (!cv || reduced || running) return;
    running = true; requestAnimationFrame(loop);
  }
  function init() {
    if (!cv || inited) return;
    inited = true;
    size();
    addEventListener('resize', () => { size(); });
  }
  function setReduced(v) {
    reduced = !!v;
    if (reduced) { running = false; sparks = []; if (ctx) ctx.clearRect(0, 0, W, H); }
  }
  function burst(el, n = 26) {
    if (!cv || reduced || !el) return;
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.28), v = rnd(1.5, 5.5), life = rnd(28, 55);
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, r: rnd(3, 5.5), life: life + 15, rot: rnd(0, 6.28), spin: rnd(-.25, .25), c: INKS[i % INKS.length] });
    }
    start();
  }
  function countUp(root) {
    for (const el of root.querySelectorAll('[data-count]')) {
      const to = +el.dataset.count; if (!to || reduced) continue;
      const t0 = performance.now(), d = 900;
      const step = t => { const p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step); };
      el.textContent = '0'; requestAnimationFrame(step);
    }
  }
  /* Full-screen reveal (set complete, relic unlocked). Queued so two never overlap. */
  const queue = [];
  let showing = false;
  function reveal(kicker, title, sub) { queue.push([kicker, title, sub]); if (!showing) next(); }
  function next() {
    const item = queue.shift(); if (!item) { showing = false; return; }
    showing = true;
    const o = document.createElement('div');
    o.className = 'reveal'; o.setAttribute('role', 'status');
    const inner = document.createElement('div'); inner.className = 'rv-in t-panel-slide'; inner.setAttribute('data-open', 'false');
    const k = document.createElement('p'); k.className = 'rv-k'; k.textContent = item[0];
    const r = document.createElement('h2'); r.textContent = item[1];
    const s = document.createElement('p'); s.className = 'rv-s'; s.textContent = item[2] || '';
    inner.append(k, r, s); o.append(inner); document.body.append(o);
    requestAnimationFrame(() => requestAnimationFrame(() => inner.setAttribute('data-open', 'true'))); setTimeout(() => inner.setAttribute('data-open', 'true'), 100);
    let done = false;
    const close = () => { if (done) return; done = true; inner.setAttribute('data-open', 'false'); o.classList.add('out'); setTimeout(() => { o.remove(); next(); }, 450); };
    o.addEventListener('click', close); setTimeout(close, 3000);
    if (!reduced) burst({ getBoundingClientRect: () => ({ left: innerWidth / 2, top: innerHeight / 2 - 20, width: 0, height: 0 }) }, 80);
  }
  return { init, burst, countUp, reveal, setReduced };
})();
