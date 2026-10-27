/* Archeron · subject backgrounds: in Night, a faint working-out writes itself behind a subject's screens (the subject page,
   its questions, its Daily question), one board at a time, alternating sides, then fades. Off under reduced motion, off
   in Paper, and switchable in Settings → Look. Every line here was checked by hand: keep it that way when adding boards. */
'use strict';
const BGFX = (() => {
  /* [lines, optional sketch path in a 160×110 box]; the last line is the answer */
  const SCENES = {
    maths: { c: '#9db2ff', b: [
      [['2x + 3 = 11', '2x = 8', 'x = 4']],
      [['x² − 5x + 6 = 0', '(x − 2)(x − 3) = 0', 'x = 2  or  x = 3'], 'M8 6V104M8 74H152M24 10C48 112 112 112 136 10'],
      [['a² + b² = c²', '6² + 8² = c²', '36 + 64 = 100', 'c = 10'], 'M20 96H140V16Z'],
      [['3(x − 4) = 2x + 1', '3x − 12 = 2x + 1', 'x = 13']],
      [['A = πr²', 'r = 5 cm', 'A = 25π ≈ 78.5 cm²'], 'M80 55m-42 0a42 42 0 1 0 84 0a42 42 0 1 0-84 0M80 55H122']
    ] },
    physics: { c: '#ffae6b', b: [
      [['v = u + at', 'u = 2 m/s,  a = 3 m/s²,  t = 4 s', 'v = 2 + 3 × 4', 'v = 14 m/s'], 'M10 100V8M10 100H154M10 84L140 18'],
      [['F = ma', 'm = 5 kg,  a = 2 m/s²', 'F = 10 N']],
      [['Eₖ = ½mv²', 'm = 2 kg,  v = 3 m/s', 'Eₖ = ½ × 2 × 3²', 'Eₖ = 9 J']],
      [['V = IR', 'I = 0.5 A,  R = 12 Ω', 'V = 6 V'], 'M60 30H20V90H140V30H70M60 22V38M70 26V34'],
      [['ρ = m ÷ V', 'm = 600 g,  V = 200 cm³', 'ρ = 3 g/cm³']]
    ] },
    chemistry: { c: '#6fe0cf', b: [
      [['2H₂ + O₂ → 2H₂O']],
      [['CH₄ + 2O₂ → CO₂ + 2H₂O'], 'M80 40m-14 0a14 14 0 1 0 28 0a14 14 0 1 0-28 0M70 50L44 78M90 50L116 78M44 78m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M116 78m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0'],
      [['Mr of CO₂', '= 12 + (2 × 16)', '= 44']],
      [['Mg + 2HCl → MgCl₂ + H₂']],
      [['moles = mass ÷ Mr', '22 g of CO₂ ÷ 44', '= 0.5 mol']],
      [['CaCO₃ → CaO + CO₂']]
    ] }
  };
  const LINE = 1300, HOLD = 3800, FADE = 1500;
  let layer = null, cur = null, token = 0, side = 0; /* side: which free column the next board uses */
  const trackNow = () => {
    if (typeof TAB === 'undefined') return null;
    if (TAB === 'subject') return SUBJ_SEL;
    if (TAB === 'drill' && DR) return DR.dt || (DR.topic ? LEARN.trackOf(DR.topic) : DR.track);
    return null;
  };
  /* the empty columns beside the content (cards are opaque, so a board behind them would never be seen): left of the
     page, and right of it below the Today panel. null when neither has room (phones). */
  function zones() {
    const c = document.querySelector('#view > *'), r = c && c.getBoundingClientRect(), rail = innerWidth >= 900 ? 104 : 0;
    if (!r) return [];
    const sp = document.getElementById('side'), s = sp && sp.getClientRects().length ? sp.getBoundingClientRect() : null; /* fixed, so offsetParent is always null */
    return [{ x: rail + 20, w: r.left - rail - 40, top: 90 }, { x: r.right + 24, w: innerWidth - r.right - 48, top: s && s.left < r.right + 200 ? s.bottom + 30 : 90 }]
      .map(z => Object.assign(z, { h: innerHeight - z.top - 24 })).filter(z => z.w >= 120 && z.h >= 120);
  }
  function board(t, n) {
    const [lines, sk] = SCENES[t].b[n % SCENES[t].b.length], zs = zones();
    if (!zs.length) return [null, 0];
    const z = zs[side++ % zs.length], sketch = sk && z.h >= 300 && z.w >= 150 && sk, el = document.createElement('div'), longest = Math.max(...lines.map(l => l.length));
    /* as big as the column allows: Georgia averages about half an em per character, lines are 1.65em tall */
    const fs = Math.max(12, Math.min(26, z.w / (longest * .52), (z.h - (sketch ? 120 : 0)) / (lines.length * 1.65))), tall = lines.length * fs * 1.65 + (sketch ? 120 : 0);
    el.className = 'bgb'; el.style.setProperty('--bc', SCENES[t].c);
    el.style.left = z.x + 'px'; el.style.width = z.w + 'px'; el.style.fontSize = fs.toFixed(1) + 'px';
    el.style.top = (z.top + Math.random() * Math.max(0, z.h - tall)).toFixed(0) + 'px';
    if (sketch) el.innerHTML = `<svg viewBox="0 0 160 110" aria-hidden="true"><path d="${sketch}"/></svg>`;
    lines.forEach((l, i) => { const p = document.createElement('p'); p.textContent = l; p.style.setProperty('--i', i + (sketch ? 1 : 0)); el.append(p); });
    return [el, (lines.length + (sketch ? 1 : 0)) * LINE];
  }
  function play(t, n, my) {
    if (my !== token) return;
    const [el, write] = board(t, n);
    if (!el) { setTimeout(() => play(t, n, my), 4000); return; } /* no room right now (narrow window): look again shortly */
    layer.replaceChildren(el);
    setTimeout(() => { if (my === token) el.classList.add('out'); }, write + HOLD);
    setTimeout(() => play(t, n + 1, my), write + HOLD + FADE);
  }
  function sync() {
    const t = trackNow(), want = S.bgfx && !REDUCED && document.documentElement.dataset.mode === 'night' && SCENES[t] ? t : null;
    if (want === cur) return;
    cur = want; token++;
    if (!layer) { layer = document.createElement('div'); layer.id = 'bgfx'; layer.setAttribute('aria-hidden', 'true'); document.body.prepend(layer); }
    layer.replaceChildren();
    if (want) play(want, Math.floor(Date.now() / 864e5), token); /* a different first board each day */
  }
  sync(); /* app.js rendered before this file loaded */
  return { sync, SCENES };
})();
