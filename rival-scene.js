/* Onur's room, lit by the real time of day. The drawing lives in rival-art.js; this file animates it.
   SCENE.mount(el) once, then SCENE.frame(now, info, motion) every frame, and SCENE.say(kind, text) for a reaction.
   info = { pose: 'write' | 'phone' | 'sleep' | 'away', lamp, hype, note: [a, b], subject, prog, spread, line, frac, marks } */
const SCENE = (() => {
  const NIGHT = { sky1: '#04050c', sky2: '#141a35', wall: '#1c1f2c', wall2: '#13151f', floor: '#16130f', frame: '#2b2f40', beamc: '#8fa6ff', amb: .5, stars: 1, cityl: 1, beam: .6 };
  const DAWN = { sky1: '#3d3f6e', sky2: '#e9a184', wall: '#6c6470', wall2: '#55505e', floor: '#3c322d', frame: '#9e98a0', beamc: '#ffc9a3', amb: .2, stars: .2, cityl: .4, beam: .55 };
  const DAY = { sky1: '#8fb3dd', sky2: '#e4ebf2', wall: '#bdb6ab', wall2: '#a29a8f', floor: '#57463a', frame: '#e9e4dc', beamc: '#fff0d2', amb: .04, stars: 0, cityl: 0, beam: 1 };
  const DUSK = { sky1: '#2a2f5e', sky2: '#e88456', wall: '#776461', wall2: '#5d4e4c', floor: '#3a2e28', frame: '#a8948c', beamc: '#ffb27a', amb: .18, stars: .1, cityl: .5, beam: .75 };
  const KEYS = [[0, NIGHT], [5.75, NIGHT], [7, DAWN], [8.5, DAY], [16.5, DAY], [18, DUSK], [19.4, NIGHT], [24, NIGHT]];
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
  function palette(h) {
    let i = 0; while (KEYS[i + 1][0] <= h) i++;
    const [h0, A] = KEYS[i], [h1, B] = KEYS[i + 1], t = (h - h0) / (h1 - h0), out = {};
    for (const k in A) out[k] = typeof A[k] === 'number' ? A[k] + (B[k] - A[k]) * t : mix(A[k], B[k], t);
    return out;
  }
  const { S, L1, L2, LINE } = ART.RIG;
  const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  let svg, el = {}, cal = [], last = { pose: '', spread: -1, day: '' }, rnd = 0, react = null;
  const $ = id => svg.getElementById ? svg.getElementById(id) : svg.querySelector('#' + id);
  const show = (e, on) => { e.style.opacity = on ? 1 : 0; };
  const op = (e, v) => { e.style.opacity = v; };
  const clamp01 = v => Math.max(0, Math.min(1, v));

  function mount(host) {
    host.innerHTML = ART.markup(); svg = host.querySelector('svg'); svg.style.setProperty('--amb2', 0); svg.style.setProperty('--rim', 0);
    svg.classList.add('boot'); setTimeout(() => svg.classList.remove('boot'), 120);
    for (const id of ['hh', 'mh', 'sh', 'n1', 'n2', 'sun', 'moon', 'moonc', 'duvet', 'sleeper', 'zz', 'chair', 'steam', 'ink', 'marks', 'flip', 'sitter', 'head', 'eyes',
      'write', 'arm', 'fore', 'cuff', 'forehi', 'pen', 'hand', 'think', 'stretch', 'phone', 'bub', 'bubr', 'bubt', 'glow', 'cone', 'mglow', 'pglow', 'bulb', 'screen', 'scrt', 'scrp', 'calm', 'calt'])
      el[id] = $('rv-' + id);
    cal = [...svg.querySelectorAll('.rv-cd')];
  }

  /* the wall calendar shows the real month with today ringed */
  function calendar(d) {
    const k = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); if (k === last.day) return; last.day = k;
    el.calm.textContent = MONTHS[d.getMonth()];
    const first = (new Date(d.getFullYear(), d.getMonth(), 1).getDay() + 6) % 7, days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    cal.forEach((c, i) => { const n = i - first + 1; c.textContent = n >= 1 && n <= days ? n : ''; });
    const i = first + d.getDate() - 1; el.calt.setAttribute('cx', 236 + (i % 7) * 10); el.calt.setAttribute('cy', 68 + Math.floor(i / 7) * 9);
  }

  function sky(now) {
    const d = new Date(now), h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600, p = palette(h);
    for (const k in p) svg.style.setProperty('--' + k, p[k]);
    const arc = (t, r) => [524 + t * 236, 214 - Math.sin(Math.PI * t) * r];
    const sunT = (h - 7) / 11, moonT = ((h + 24 - 18) % 24) / 13;
    const [sx, sy] = arc(clamp01(sunT), 150), [mx, my] = arc(clamp01(moonT), 140);
    el.sun.setAttribute('cx', sx); el.sun.setAttribute('cy', sunT > 0 && sunT < 1 ? sy : 400);
    el.moon.setAttribute('cx', mx); el.moon.setAttribute('cy', moonT > 0 && moonT < 1 ? my : 400);
    el.moonc.setAttribute('cx', mx + 4.5); el.moonc.setAttribute('cy', moonT > 0 && moonT < 1 ? my - 3 : 400);
    const m = d.getMinutes() + d.getSeconds() / 60, s = d.getSeconds();
    el.hh.setAttribute('transform', `rotate(${(d.getHours() % 12) * 30 + m / 2} 408 70)`);
    el.mh.setAttribute('transform', `rotate(${m * 6} 408 70)`);
    el.sh.setAttribute('transform', `rotate(${s * 6} 408 70)`);
    calendar(d);
    return p;
  }

  function scribble(i, len, seed) {
    const L = LINE(i); let d = `M${L.x} ${L.y}`;
    for (let x = 1.5; x <= len * L.w; x += 1.5) d += ` L${(L.x + x).toFixed(1)} ${(L.y + Math.sin(x * 1.3 + seed) * .8 + Math.sin(x * .37 + seed * 2) * .45).toFixed(2)}`;
    return d;
  }
  function mark(i, ok) {
    const L = LINE(i), x = L.x + L.w + 3, y = L.y;
    return ok ? `<path d="M${x - 2} ${y} l1.6 1.8 l3 -3.6" stroke="#2f9e64"/>` : `<path d="M${x - 2} ${y - 1.8} l3.4 3.6 M${x + 1.4} ${y - 1.8} l-3.4 3.6" stroke="#d64550"/>`;
  }

  function frame(now, info, motion) {
    if (!svg) return;
    const p = sky(now), t = motion ? now / 1000 : 0, night = Math.min(1, p.amb / .5);
    const seated = info.pose === 'write' || info.pose === 'phone', lamp = info.lamp && (night > .05 || info.pose === 'write');
    svg.style.setProperty('--amb2', (p.amb * (lamp ? .7 : 1)).toFixed(3));
    svg.style.setProperty('--rim', seated ? (.25 + .75 * night).toFixed(2) : 0);
    op(el.glow, lamp ? (.35 + .65 * night).toFixed(2) : 0);
    op(el.cone, lamp ? (.4 + .6 * night).toFixed(2) : 0);
    show(el.bulb, lamp); show(el.screen, info.pose === 'write');
    op(el.mglow, info.pose === 'write' ? (.15 + .85 * night).toFixed(2) : 0);
    el.n1.textContent = info.note[0] || ''; el.n2.textContent = info.note[1] || '';
    if (info.pose === 'write') { el.scrt.textContent = (info.subject || 'Revision').slice(0, 24); el.scrp.setAttribute('width', Math.round(134 * clamp01(info.prog || 0))); }

    if (info.pose !== last.pose) {
      show(el.sitter, seated); show(el.sleeper, info.pose === 'sleep'); show(el.zz, info.pose === 'sleep'); show(el.steam, seated);
      el.duvet.setAttribute('d', info.pose === 'sleep' ? 'M56 368 Q100 338 150 350 Q182 356 196 366 L198 410 Q120 418 52 412Z' : 'M70 372 Q130 364 196 370 L198 410 Q120 418 66 412Z');
      el.chair.style.transform = seated ? '' : 'translateX(-26px) rotate(-4deg)';
      last.pose = info.pose;
    }
    op(el.pglow, info.pose === 'phone' ? .9 : 0);

    const re = react ? (performance.now() - react.at) / 1000 : 99, live = seated && re < 3.4;
    const bump = live ? Math.sin(Math.min(1, re / 2.6) * Math.PI) : 0;
    const mode = live && react.kind === 'stretch' && re < 2.6 ? 'stretch' : info.pose === 'write' && info.frac < .28 ? 'think' : info.pose;
    if (mode !== last.mode) {
      op(el.stretch, mode === 'stretch' ? 1 : 0); show(el.think, mode === 'think'); show(el.write, mode === 'write'); show(el.phone, mode === 'phone');
      last.mode = mode;
    }
    op(el.bub, live ? 1 : 0); op(el.eyes, seated ? (info.hype ? 1 : .75) * (.35 + .65 * night) : 0);
    const turn = !live ? 0 : react.kind === 'glance' ? -12 * bump : react.kind === 'slump' ? 16 * bump : react.kind === 'stretch' ? -8 * bump : 0;
    let tilt = 0;

    if (info.pose === 'write') {
      if (info.spread !== last.spread) {
        if (last.spread >= 0 && motion) el.flip.animate([{ transform: 'scaleX(1)', opacity: 1 }, { transform: 'scaleX(-1)', opacity: 1, offset: .85 }, { transform: 'scaleX(-1)', opacity: 0 }], { duration: 750, easing: 'cubic-bezier(.45,0,.2,1)' });
        last.spread = info.spread; rnd = info.spread * 7.31;
      }
      let ink = '', marks = '';
      for (let i = 0; i < info.line; i++) { ink += `<path d="${scribble(i, 1, rnd + i)}"/>`; marks += mark(i, info.marks[i]); }
      const f = clamp01((info.frac - .28) / .6);
      ink += `<path d="${scribble(info.line, f, rnd + info.line)}"/>`;
      if (info.frac > .9) marks += mark(info.line, info.marks[info.line]);
      el.ink.innerHTML = ink; el.marks.innerHTML = marks;

      const L = LINE(info.line), lift = info.frac > .88 ? Math.sin((info.frac - .88) / .12 * Math.PI) * 4 : 0, sp = info.hype ? 1.7 : 1;
      const tx = L.x + f * L.w + (info.frac > .88 ? 3 : 0) + (motion ? Math.sin(t * 22 * sp) * .8 : 0), ty = L.y - lift + (motion ? Math.sin(t * 31 * sp) * .6 : 0);
      const W = [tx - 2, ty - 11], dx = W[0] - S[0], dy = W[1] - S[1], dist = Math.min(L1 + L2 - 1, Math.hypot(dx, dy)), a = Math.atan2(dy, dx);
      const b = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist))));
      const E = [S[0] + L1 * Math.cos(a + b), S[1] + L1 * Math.sin(a + b)], ang = Math.atan2(W[1] - E[1], W[0] - E[0]) * 180 / Math.PI;
      el.arm.setAttribute('d', ART.limb(S, E, 19, 15)); el.fore.setAttribute('d', ART.limb(E, W, 15, 11));
      el.cuff.setAttribute('cx', E[0].toFixed(1)); el.cuff.setAttribute('cy', E[1].toFixed(1));
      el.forehi.setAttribute('d', `M${(E[0] + 2).toFixed(1)} ${(E[1] - 5).toFixed(1)} L${(W[0] - 5).toFixed(1)} ${(W[1] - 5).toFixed(1)}`);
      el.pen.setAttribute('x1', tx.toFixed(1)); el.pen.setAttribute('y1', ty.toFixed(1)); el.pen.setAttribute('x2', (tx + 6.5).toFixed(1)); el.pen.setAttribute('y2', (ty - 16).toFixed(1));
      el.hand.setAttribute('transform', `translate(${W[0].toFixed(1)} ${W[1].toFixed(1)}) rotate(${ang.toFixed(1)}) scale(.9)`);
      tilt = mode === 'think' ? 0 + (motion ? Math.sin(t * .5) * .5 : 0) : 7 + (motion ? Math.sin(t * 1.1) * 1.6 + Math.sin(t * .37) * 1.1 : 0);
    } else if (info.pose === 'phone') tilt = 10 + (motion ? Math.sin(t * .6) * 1.4 : 0);
    el.head.style.transform = el.eyes.style.transform = `rotate(${(tilt + turn).toFixed(2)}deg)`;
  }

  /* a reaction: 'glance' (looks up), 'slump' (head drops), 'stretch' (arms up), with a speech bubble */
  function say(kind, text) {
    if (!svg) return;
    react = { kind, at: performance.now() }; el.bubt.textContent = text;
    let w = text.length * 7.4; try { w = el.bubt.getComputedTextLength() || w; } catch (e) {}
    el.bubr.setAttribute('width', Math.max(64, Math.round(w + 24)));
  }

  return { mount, frame, say };
})();
