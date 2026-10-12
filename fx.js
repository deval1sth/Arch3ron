/* Archeron · visual effects: ambient embers, spark bursts, count-ups, level-up overlay.
   Pure canvas/DOM, no assets. Everything is skipped under prefers-reduced-motion. */
'use strict';
const FX = (() => {
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, inited = false, H1 = 38, H2 = 18;
  /* ember colours follow the colour scheme (--fx-h1 / --fx-h2 in styles.css) */
  function refresh() {
    const cs = getComputedStyle(document.documentElement);
    H1 = +cs.getPropertyValue('--fx-h1') || 38; H2 = +cs.getPropertyValue('--fx-h2') || 18;
    for (const e of embers) e.hue = Math.random() < .8 ? H1 : H2;
  }
  const cv = document.getElementById('fx');
  const ctx = cv && cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, embers = [], sparks = [], running = false;

  function size() {
    if (!cv) return;
    dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  function ember(init) {
    return { x: rnd(0, W), y: init ? rnd(0, H) : H + 10, r: rnd(.6, 2.2), vy: rnd(.15, .55), vx: rnd(-.15, .15),
      ph: rnd(0, 6.28), sp: rnd(.005, .02), a: rnd(.25, .8), hue: Math.random() < .8 ? H1 : H2 };
  }
  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const e of embers) {
      e.ph += e.sp; e.y -= e.vy; e.x += e.vx + Math.sin(e.ph) * .25;
      if (e.y < -10) Object.assign(e, ember(false));
      const fade = Math.min(1, e.y / (H * .35));
      const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
      g.addColorStop(0, `hsla(${e.hue},100%,70%,${e.a * fade})`); g.addColorStop(1, `hsla(${e.hue},100%,50%,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 4, 0, 6.28); ctx.fill();
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.life -= 1; s.vy += .12; s.vx *= .97; s.vy *= .97; s.x += s.vx; s.y += s.vy;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      const t = s.life / s.max;
      ctx.fillStyle = `hsla(${s.hue},100%,${55 + 25 * t}%,${t})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.4 + t * .6), 0, 6.28); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(loop);
  }
  function start() {
    if (!cv || reduced || running) return;
    running = true; requestAnimationFrame(loop);
  }
  function init() {
    if (!cv || inited) return;
    inited = true;
    refresh();
    size();
    const n = Math.round(Math.min(46, W * H / 26000));
    embers = Array.from({ length: n }, () => ember(true));
    addEventListener('resize', () => { size(); });
    document.addEventListener('visibilitychange', () => { running = false; if (!document.hidden) start(); });
    start();
  }
  function setReduced(v) {
    reduced = !!v;
    if (reduced) { running = false; sparks = []; if (ctx) ctx.clearRect(0, 0, W, H); }
    else if (inited) start();
  }
  function burst(el, n = 26, hue = H1) {
    if (!cv || reduced || !el) return;
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.28), v = rnd(1.5, 5.5), life = rnd(28, 55);
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, r: rnd(1.2, 2.8), life, max: life, hue: hue + rnd(-12, 12) });
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
    if (!reduced) burst({ getBoundingClientRect: () => ({ left: innerWidth / 2, top: innerHeight / 2 - 20, width: 0, height: 0 }) }, 80, H1);
  }
  return { init, burst, countUp, reveal, setReduced, refresh };
})();
