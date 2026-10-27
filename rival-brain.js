/* Two spinning holographic brains on canvas (no libraries). The brain is built from horizontal slices, so it reads as
   glowing scan lines, with bright folds (gyri) running over the surface. Each subject owns a region that burns brighter
   with strength and has a labelled callout. BRAIN.create(canvas, 'runo' | 'onur') returns:
     set(regions)       regions = [{ name, line, key, v: 0..1, tone: 'win' | 'lose' | 'even' }]
     draw(now, motion)  one frame; motion false = still, final state (no spin, sparks or signals)
     pick(x, y)         index of the region under a point (CSS px from the canvas top-left; label box or anchor dot), or -1
     focus(i)           light region i, enlarge its callout and dim the rest, until focus(-1)
     spark(i)           ~1s burst of light along region i's folds (an answer came in); overlaps fine; no-op when motion is off
     cost               ms the last draw took (performance.now), for checking frame budget
   Idle life with motion on: a slow breathing halo and faint signals hopping between regions. Points are projected into
   typed arrays and lines batched into a few strokes, so a frame allocates nothing per point. */
const BRAIN = (() => {
  const TAU = Math.PI * 2, NS = 76;
  const rand = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  /* ---------- the shape: x left/right, y up, z front (+) / back (-) ---------- */
  const SLICES = [];
  for (let y = -.34; y <= .745; y += .028) {
    const t = (y - .17) / .58;
    let D = .98 * Math.sqrt(Math.max(0, 1 - t * t)), zc = 0;
    if (y < -.02) { const u = (-.02 - y) / .32; D *= 1 - .42 * u; zc = .1 + .2 * u; }   /* the temporal lobe hangs lower, further forward */
    SLICES.push({ y, kind: 'c', D, W: D * .74, zc, split: y > .1 ? Math.min(1, (y - .1) / .25) : 0 });
  }
  for (let y = -.5; y <= -.13; y += .028) { const t = (y + .31) / .2, D = .27 * Math.sqrt(Math.max(0, 1 - t * t)); SLICES.push({ y, kind: 'b', D, W: D * 1.85, zc: -.6, split: .6 }); }
  for (let y = -.74; y <= -.37; y += .028) SLICES.push({ y, kind: 's', D: .085, W: .07, zc: -.24 + (y + .37) * .18, split: 0 });

  /* a point on a slice: th = 0 front, PI/2 right, -PI/2 left, PI back; the midline notch splits the hemispheres */
  function at(s, th) {
    const sx = Math.sin(th), cz = Math.cos(th), notch = s.split * .2 * s.D * Math.exp(-((sx / .2) ** 2));
    const wob = s.kind === 's' ? 1 : 1 + .022 * Math.sin(th * 14 + s.y * 23) + .012 * Math.sin(th * 31 - s.y * 41);
    return [s.W * sx * wob, s.y, s.zc + cz * (s.D - notch) * wob];
  }
  const LOOPS = SLICES.map(s => Array.from({ length: NS }, (_, i) => at(s, i / NS * TAU)));

  /* folds: meandering curves over the cerebrum surface */
  const CEREB = SLICES.filter(s => s.kind === 'c');
  function onCereb(y, th) {
    const i = Math.max(0, Math.min(CEREB.length - 2, Math.floor((y - CEREB[0].y) / .028))), a = CEREB[i], b = CEREB[i + 1], f = Math.max(0, Math.min(1, (y - a.y) / .028));
    const p = at(a, th), q = at(b, th); return [p[0] + (q[0] - p[0]) * f, y, p[2] + (q[2] - p[2]) * f].map((v, k) => k === 1 ? v : v * 1.01);
  }
  const VEINS = [];
  { const r = rand(97);
    for (let n = 0; n < 46; n++) {
      let y = -.18 + r() * .86, th = r() * TAU, h = r() * TAU; const pts = [];
      for (let k = 0, len = 16 + (r() * 22 | 0); k < len; k++) {
        pts.push(onCereb(y, th));
        h += (r() - .5) * 1.1; y += .022 * Math.sin(h); th += .07 * Math.cos(h);
        if (y < -.3 || y > .72) break;
      }
      if (pts.length > 4) VEINS.push(pts);
    }
    /* the two big landmarks: the lateral fissure down each side and the central sulcus over the top */
    for (const side of [1, -1]) {
      VEINS.push(Array.from({ length: 26 }, (_, k) => onCereb(-.02 + k * .012, side * (.95 + k * .045))));
      VEINS.push(Array.from({ length: 24 }, (_, k) => onCereb(.7 - k * .028, side * (1.25 + k * .02))));
    }
  }

  const SPOTS = { frontal: [.45, .5], frontalL: [.45, -.5], prefrontal: [.2, .12], motor: [.62, -1.25], parietal: [.6, 2.2], parietalL: [.6, -2.2],
    occipital: [.26, 3.05], temporal: [-.12, 1.25], temporalL: [-.12, -1.25], broca: [.08, -.72], cerebellum: null };
  const anchor = key => key === 'cerebellum' ? at(SLICES.find(s => s.kind === 'b' && s.y > -.33), Math.PI).map((v, k) => k === 1 ? v : v * 1.02) : onCereb(...(SPOTS[key] || SPOTS.frontal));
  const LOOK = {
    onur: { line: [255, 58, 70], vein: [255, 170, 175], hot: [255, 215, 215], glow: '255,40,56', bg: ['#2a0609', '#070102'] },
    runo: { line: [200, 204, 222], vein: [226, 214, 255], hot: [246, 240, 255], glow: '168,132,255', bg: ['#191428', '#06050c'] }
  };

  function create(canvas, who) {
    const ctx = canvas.getContext('2d'), C = LOOK[who] || LOOK.runo, rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
    let regions = [], segs = [], veinsOf = [], angle = Math.PI / 2 - .5, last = 0, dragX = null, held = 0, labels = [];
    let focusI = -1, fa = 0, nextSig = 0, nowT = 0, motionOn = true;
    /* projected points live in typed arrays filled in place, so a frame allocates nothing per point */
    const PL = new Float32Array(LOOPS.length * NS * 3), PV = VEINS.map(v => new Float32Array(v.length * 3));
    const sparks = Array.from({ length: 8 }, () => ({ j: -1, t: 0 })), sigs = Array.from({ length: 3 }, () => ({ a: -1, b: -1, t: 0 }));
    const left = [], right = [];
    /* one soft glow sprite made once and stamped, instead of a new gradient per region per frame */
    const spr = document.createElement('canvas'); spr.width = spr.height = 64;
    { const g = spr.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, `rgba(${C.glow},1)`); r.addColorStop(.5, `rgba(${C.glow},.35)`); r.addColorStop(1, `rgba(${C.glow},0)`); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }
    canvas.addEventListener('pointerdown', e => { if (!e.isPrimary) return; dragX = e.clientX; held = Date.now(); try { canvas.setPointerCapture(e.pointerId); } catch (x) {} });
    canvas.addEventListener('pointermove', e => { if (dragX == null || !e.isPrimary) return; angle += (e.clientX - dragX) * .012; dragX = e.clientX; held = Date.now(); });
    const up = e => { if (e.isPrimary) dragX = null; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

    function set(list) {
      regions = list.map(r => ({ ...r, p: anchor(r.key), sx: 0, sy: 0, sz: 0 }));
      /* which slice segments burn for each region, worked out once as flat index lists */
      const own = regions.map(() => []);
      LOOPS.forEach((loop, si) => loop.forEach((q, i) => { let best = -1, bw = .2; regions.forEach((r, j) => { const w = 1 - Math.hypot(q[0] - r.p[0], q[1] - r.p[1], q[2] - r.p[2]) / .3; if (w > bw) { bw = w; best = j; } }); if (best >= 0) own[best].push(si * NS + i); }));
      segs = own.map(a => Int32Array.from(a));
      /* each fold belongs to the region nearest its middle; sparks run along these */
      veinsOf = regions.map(() => []);
      VEINS.forEach((v, n) => { const m = v[v.length >> 1]; let best = -1, bd = .34; regions.forEach((r, j) => { const d = Math.hypot(m[0] - r.p[0], m[1] - r.p[1], m[2] - r.p[2]); if (d < bd) { bd = d; best = j; } }); if (best >= 0) veinsOf[best].push(n); });
      labels = regions.map(() => null); if (focusI >= regions.length) focusI = -1;
    }
    const focus = i => { focusI = i >= 0 && i < regions.length ? i : -1; };
    /* a burst along region i's folds; reuses the oldest of 8 slots so several can overlap */
    function spark(i) {
      if (!motionOn || !(i >= 0 && i < regions.length)) return;
      let s = sparks[0]; for (const x of sparks) { if (x.j < 0) { s = x; break; } if (x.t < s.t) s = x; }
      s.j = i; s.t = nowT;
    }
    /* the region under a point: a label box first, then the nearest anchor dot (front ones win) */
    function pick(x, y) {
      for (let j = 0; j < labels.length; j++) { const L = labels[j]; if (L && L.w && y > L.y - 16 && y < L.y + 16 && x > (L.r ? L.x - L.w - 8 : L.x - 8) && x < (L.r ? L.x + 8 : L.x + L.w + 8)) return j; }
      let best = -1, bd = 22 * 22;
      regions.forEach((r, j) => { const d = (r.sx - x) ** 2 + (r.sy - y) ** 2 + (r.sz < .1 ? 0 : 150); if (d < bd) { bd = d; best = j; } });
      return best;
    }

    function draw(now, motion) {
      const t0 = performance.now(), dpr = Math.min(2, window.devicePixelRatio || 1), W = canvas.clientWidth, H = canvas.clientHeight; nowT = now; motionOn = motion;
      if (!W || !H) return;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
      const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
      if (motion && dragX == null && Date.now() - held > 2500) angle += dt * .3;
      fa += ((focusI >= 0 ? 1 : 0) - fa) * (motion ? Math.min(1, dt * 8) : 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const bg = ctx.createRadialGradient(W / 2, H * .5, 0, W / 2, H * .5, Math.max(W, H) * .7); bg.addColorStop(0, C.bg[0]); bg.addColorStop(1, C.bg[1]);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H * .47, R = Math.min(W * .3, H * .46), ca = Math.cos(angle), sa = Math.sin(angle), tl = .1, ct = Math.cos(tl), st = Math.sin(tl);
      const projTo = (q, o, out) => { const x1 = q[0] * ca + q[2] * sa, z1 = -q[0] * sa + q[2] * ca, y1 = q[1] * ct - z1 * st, z2 = q[1] * st + z1 * ct, k = 2.8 / (2.8 + z2); out[o] = cx + x1 * R * k; out[o + 1] = cy - y1 * R * k; out[o + 2] = z2; };
      for (let si = 0, o = 0; si < LOOPS.length; si++) { const loop = LOOPS[si]; for (let i = 0; i < NS; i++, o += 3) projTo(loop[i], o, PL); }
      for (let n = 0; n < VEINS.length; n++) { const v = VEINS[n], out = PV[n]; for (let i = 0; i < v.length; i++) projTo(v[i], i * 3, out); }
      for (const r of regions) { const x1 = r.p[0] * ca + r.p[2] * sa, z1 = -r.p[0] * sa + r.p[2] * ca, y1 = r.p[1] * ct - z1 * st, z2 = r.p[1] * st + z1 * ct, k = 2.8 / (2.8 + z2); r.sx = cx + x1 * R * k; r.sy = cy - y1 * R * k; r.sz = z2; }
      const pulse = motion ? .85 + .15 * Math.sin(now / 420) : 1, breath = motion ? .8 + .2 * Math.sin(now / 2600) : 1, dim = 1 - .62 * fa, ld = .55 + .45 * dim;

      /* soft halo behind the brain, breathing slowly */
      const halo = ctx.createRadialGradient(cx, cy, R * .2, cx, cy, R * 1.25); halo.addColorStop(0, `rgba(${C.glow},${(.16 * breath).toFixed(3)})`); halo.addColorStop(1, `rgba(${C.glow},0)`);
      ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';

      /* scan lines: every back segment in one path, every front one in another (5 strokes a frame, not 3 per slice) */
      const lines = front => { ctx.beginPath(); for (let si = 0; si < LOOPS.length; si++) { const b0 = si * NS * 3; for (let i = 0; i < NS; i++) { const a = b0 + i * 3, b = b0 + ((i + 1) % NS) * 3; if ((PL[a + 2] + PL[b + 2] < 0) === front) { ctx.moveTo(PL[a], PL[a + 1]); ctx.lineTo(PL[b], PL[b + 1]); } } } };
      lines(false); ctx.strokeStyle = rgba(C.line, .1 * ld); ctx.lineWidth = 1; ctx.stroke();
      lines(true); ctx.strokeStyle = rgba(C.line, .14 * ld); ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = rgba(C.line, .62 * ld); ctx.lineWidth = 1.1; ctx.stroke();
      /* folds */
      const folds = front => { ctx.beginPath(); for (let n = 0; n < VEINS.length; n++) { const P = PV[n]; for (let a = 0, e = (VEINS[n].length - 1) * 3; a < e; a += 3) if ((P[a + 2] + P[a + 5] < 0) === front) { ctx.moveTo(P[a], P[a + 1]); ctx.lineTo(P[a + 3], P[a + 4]); } } };
      folds(false); ctx.strokeStyle = rgba(C.vein, .07 * ld); ctx.lineWidth = 1; ctx.stroke();
      folds(true); ctx.strokeStyle = rgba(C.vein, .18 * ld); ctx.lineWidth = 3.2; ctx.stroke(); ctx.strokeStyle = rgba(C.vein, .7 * ld); ctx.lineWidth = 1.1; ctx.stroke();
      /* regions burn brighter by strength; the focused one brighter still, the rest dimmed */
      for (let j = 0; j < regions.length; j++) {
        const reg = regions[j], foc = j === focusI, vis = reg.sz < .1 ? 1 : .35, v = Math.min(1.6, (reg.v || 0) * pulse * (foc ? 1 + .9 * fa : dim) + (foc ? .3 * fa : 0)), S = segs[j];
        if (S && S.length && (reg.v > .02 || foc)) {
          ctx.beginPath(); for (let k = 0; k < S.length; k++) { const g = S[k], b0 = g - g % NS, a = g * 3, b = (b0 + (g - b0 + 1) % NS) * 3; ctx.moveTo(PL[a], PL[a + 1]); ctx.lineTo(PL[b], PL[b + 1]); }
          ctx.strokeStyle = rgba(C.hot, Math.min(1, .55 * v * vis)); ctx.lineWidth = 2.2; ctx.stroke();
        }
        const rad = R * (.22 + .2 * Math.min(1, reg.v || 0)) * (foc ? 1 + .25 * fa : 1);
        ctx.globalAlpha = Math.min(1, .5 * v * vis); ctx.drawImage(spr, reg.sx - rad, reg.sy - rad, rad * 2, rad * 2); ctx.globalAlpha = 1;
      }

      if (motion) {
        /* sparks: a bright head with a short tail running along the region's folds for about a second */
        for (const s of sparks) {
          if (s.j < 0) continue;
          const age = (now - s.t) / 1000; if (age < 0 || age > 1.1 || s.j >= regions.length) { s.j = -1; continue; }
          const p = age / .9, fade = 1 - Math.max(0, (age - .8) / .3), list = veinsOf[s.j], reg = regions[s.j];
          ctx.beginPath();
          for (const n of list) { const P = PV[n], len = VEINS[n].length, h = p * (len + 5); for (let i = Math.max(0, (h | 0) - 6); i < Math.min(len - 1, h | 0); i++) { ctx.moveTo(P[i * 3], P[i * 3 + 1]); ctx.lineTo(P[i * 3 + 3], P[i * 3 + 4]); } }
          ctx.strokeStyle = rgba(C.hot, .25 * fade); ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = rgba(C.hot, .95 * fade); ctx.lineWidth = 1.6; ctx.stroke();
          const rad = R * (.3 + .25 * Math.sin(Math.min(1, p) * Math.PI)); ctx.globalAlpha = .55 * fade * (1 - p * .5); ctx.drawImage(spr, reg.sx - rad, reg.sy - rad, rad * 2, rad * 2); ctx.globalAlpha = 1;
        }
        /* idle life: now and then a faint signal hops from one region to another along a curve */
        if (regions.length > 1 && now > nextSig) {
          nextSig = now + 1400 + Math.random() * 2600;
          for (const s of sigs) if (s.a < 0) { s.a = Math.random() * regions.length | 0; s.b = (s.a + 1 + (Math.random() * (regions.length - 1) | 0)) % regions.length; s.t = now; break; }
        }
        for (const s of sigs) {
          if (s.a < 0) continue;
          const p = (now - s.t) / 1300; if (p > 1 || p < 0 || s.a >= regions.length || s.b >= regions.length) { s.a = -1; continue; }
          const A = regions[s.a], B = regions[s.b], mx = (A.sx + B.sx) / 2, my = (A.sy + B.sy) / 2, kx = mx + (mx - cx) * .35, ky = my + (my - cy) * .35, al = .5 * Math.sin(p * Math.PI) * dim;
          for (let k = 0; k < 4; k++) {
            const q = Math.max(0, p - k * .035), u = 1 - q, x = u * u * A.sx + 2 * u * q * kx + q * q * B.sx, y = u * u * A.sy + 2 * u * q * ky + q * q * B.sy, r = 7 - k * 1.4;
            ctx.globalAlpha = al * (1 - k * .22); ctx.drawImage(spr, x - r, y - r, r * 2, r * 2);
          }
          ctx.globalAlpha = 1;
        }
      }
      ctx.globalCompositeOperation = 'source-over';

      /* callouts: each label sits on the side its region faces and glides into place; the focused one grows */
      left.length = right.length = 0; for (let j = 0; j < regions.length; j++) (regions[j].sx < cx ? left : right).push(j);
      left.sort((a, b) => regions[a].sy - regions[b].sy); right.sort((a, b) => regions[a].sy - regions[b].sy);
      ctx.textBaseline = 'middle';
      for (let side = 0; side < 2; side++) { const list = side ? right : left; for (let k = 0; k < list.length; k++) {
        const j = list[k], a = regions[j], big = j === focusI ? fa : 0, cd = j === focusI || focusI < 0 ? 1 : 1 - .55 * fa;
        const ty = H * (list.length === 1 ? .5 : .1 + .78 * k / (list.length - 1)), tx = side ? W - 8 : 8, ease = motion ? Math.min(1, dt * 6) : 1;
        const L = labels[j] = labels[j] || { x: tx, y: ty, w: 0, r: false }; L.x += (tx - L.x) * ease; L.y += (ty - L.y) * ease;
        const col = a.tone === 'win' ? '91,214,155' : a.tone === 'lose' ? '255,92,104' : '190,190,205', vis = (a.sz < .1 ? 1 : .4) * cd, isR = L.x > cx;
        const F1 = `700 ${(11.5 + 2.5 * big).toFixed(1)}px "Atkinson Hyperlegible Next", system-ui, sans-serif`, F2 = `400 ${(10.5 + 1.5 * big).toFixed(1)}px "Atkinson Hyperlegible Next", system-ui, sans-serif`;
        ctx.font = F1; const w1 = ctx.measureText(a.name).width; ctx.font = F2; const w = Math.max(w1, ctx.measureText(a.line).width), ex = isR ? L.x - w - 6 : L.x + w + 6, dy = 7 + 1.5 * big; L.w = w; L.r = isR;
        ctx.strokeStyle = `rgba(${col},${(.7 * vis).toFixed(2)})`; ctx.lineWidth = 1.2 + .8 * big;
        ctx.beginPath(); ctx.moveTo(ex, L.y); ctx.lineTo(ex + (isR ? -12 : 12), L.y); ctx.lineTo(a.sx, a.sy); ctx.stroke();
        ctx.fillStyle = `rgba(${col},${vis.toFixed(2)})`; ctx.beginPath(); ctx.arc(a.sx, a.sy, 3 + big, 0, TAU); ctx.fill();
        ctx.strokeStyle = `rgba(${col},${(.35 * vis).toFixed(2)})`; ctx.beginPath(); ctx.arc(a.sx, a.sy, (motion ? 5 + 3 * Math.sin(now / 300 + j) : 6) + 3 * big, 0, TAU); ctx.stroke();
        ctx.textAlign = isR ? 'right' : 'left';
        ctx.font = F1; ctx.fillStyle = `rgba(244,240,245,${Math.max(.55 * cd, vis).toFixed(2)})`; ctx.fillText(a.name, L.x, L.y - dy);
        ctx.font = F2; ctx.fillStyle = `rgba(${col},${Math.max(.6 * cd, vis).toFixed(2)})`; ctx.fillText(a.line, L.x, L.y + dy);
      } }
      api.cost = performance.now() - t0;
    }
    const api = { set, draw, pick, focus, spark, cost: 0 };
    return api;
  }

  /* each subject gets a region; related subjects share an area when there are not enough to go round */
  const HOME = { maths: 'parietal', combined: 'frontal', biology: 'frontal', chemistry: 'frontalL', physics: 'motor', englang: 'broca', englit: 'temporalL', history: 'temporal',
    geography: 'occipital', re: 'prefrontal', business: 'parietalL', french: 'temporal', spanish: 'temporal', compsci: 'cerebellum' };
  function place(ids) {
    const used = new Set(), order = Object.keys(SPOTS);
    return ids.map(id => { let k = HOME[id]; if (!k || used.has(k)) k = order.find(o => !used.has(o)) || 'frontal'; used.add(k); return k; });
  }
  return { create, place };
})();
