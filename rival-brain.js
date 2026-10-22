/* Two spinning holographic brains on canvas (no libraries). The brain is built from horizontal slices, so it reads as
   glowing scan lines, with bright folds (gyri) running over the surface. Each subject owns a region that burns brighter
   with strength and has a labelled callout. BRAIN.create(canvas, 'runo' | 'onur') → { set(regions), draw(now, motion) }.
   regions = [{ name, line, key, v: 0..1, tone: 'win' | 'lose' | 'even' }] */
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
    let regions = [], weights = [], angle = Math.PI / 2 - .5, last = 0, dragX = null, held = 0, labels = [];
    canvas.addEventListener('pointerdown', e => { if (!e.isPrimary) return; dragX = e.clientX; held = Date.now(); try { canvas.setPointerCapture(e.pointerId); } catch (x) {} });
    canvas.addEventListener('pointermove', e => { if (dragX == null || !e.isPrimary) return; angle += (e.clientX - dragX) * .012; dragX = e.clientX; held = Date.now(); });
    const up = e => { if (e.isPrimary) dragX = null; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

    function set(list) {
      regions = list.map(r => ({ ...r, p: anchor(r.key) }));
      /* how much each slice point belongs to each region, worked out once */
      weights = LOOPS.map(loop => loop.map(q => { let best = -1, bw = 0; regions.forEach((r, j) => { const d = Math.hypot(q[0] - r.p[0], q[1] - r.p[1], q[2] - r.p[2]), w = 1 - d / .3; if (w > bw) { bw = w; best = j; } }); return best < 0 ? null : [best, bw]; }));
      labels = regions.map(() => null);
    }

    function draw(now, motion) {
      const dpr = Math.min(2, window.devicePixelRatio || 1), W = canvas.clientWidth, H = canvas.clientHeight;
      if (!W || !H) return;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
      const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
      if (motion && dragX == null && Date.now() - held > 2500) angle += dt * .3;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'source-over';
      const bg = ctx.createRadialGradient(W / 2, H * .5, 0, W / 2, H * .5, Math.max(W, H) * .7); bg.addColorStop(0, C.bg[0]); bg.addColorStop(1, C.bg[1]);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H * .47, R = Math.min(W * .3, H * .46), ca = Math.cos(angle), sa = Math.sin(angle), tl = .1, ct = Math.cos(tl), st = Math.sin(tl);
      const proj = q => { const x1 = q[0] * ca + q[2] * sa, z1 = -q[0] * sa + q[2] * ca, y1 = q[1] * ct - z1 * st, z2 = q[1] * st + z1 * ct, k = 2.8 / (2.8 + z2); return [cx + x1 * R * k, cy - y1 * R * k, z2]; };
      const pulse = motion ? .85 + .15 * Math.sin(now / 420) : 1;

      /* soft halo behind the brain */
      const halo = ctx.createRadialGradient(cx, cy, R * .2, cx, cy, R * 1.25); halo.addColorStop(0, `rgba(${C.glow},.16)`); halo.addColorStop(1, `rgba(${C.glow},0)`);
      ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';

      /* scan lines: each slice in two passes (back faint, front bright), plus a wide soft pass for the glow */
      const hot = regions.map(() => new Path2D());
      LOOPS.forEach((loop, si) => {
        const P = loop.map(proj), front = new Path2D(), back = new Path2D(), wt = weights[si];
        for (let i = 0; i < NS; i++) {
          const a = P[i], b = P[(i + 1) % NS], path = (a[2] + b[2]) / 2 < 0 ? front : back;
          path.moveTo(a[0], a[1]); path.lineTo(b[0], b[1]);
          const w = wt && wt[i]; if (w && w[1] > .2 && regions[w[0]].v > .02) { hot[w[0]].moveTo(a[0], a[1]); hot[w[0]].lineTo(b[0], b[1]); }
        }
        ctx.strokeStyle = rgba(C.line, .1); ctx.lineWidth = 1; ctx.stroke(back);
        ctx.strokeStyle = rgba(C.line, .14); ctx.lineWidth = 4; ctx.stroke(front);
        ctx.strokeStyle = rgba(C.line, .62); ctx.lineWidth = 1.1; ctx.stroke(front);
      });
      /* folds */
      for (const v of VEINS) {
        const P = v.map(proj), f = new Path2D(), b = new Path2D();
        for (let i = 0; i < P.length - 1; i++) { const path = (P[i][2] + P[i + 1][2]) / 2 < 0 ? f : b; path.moveTo(P[i][0], P[i][1]); path.lineTo(P[i + 1][0], P[i + 1][1]); }
        ctx.strokeStyle = rgba(C.vein, .07); ctx.lineWidth = 1; ctx.stroke(b);
        ctx.strokeStyle = rgba(C.vein, .18); ctx.lineWidth = 3.2; ctx.stroke(f);
        ctx.strokeStyle = rgba(C.vein, .7); ctx.lineWidth = 1.1; ctx.stroke(f);
      }
      /* regions burn brighter by strength */
      regions.forEach((reg, j) => {
        const [x, y, z] = proj(reg.p), vis = z < .1 ? 1 : .35, v = reg.v * pulse;
        ctx.strokeStyle = rgba(C.hot, .55 * v * vis); ctx.lineWidth = 2.2; ctx.stroke(hot[j]);
        const rad = R * (.22 + .2 * reg.v), g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `rgba(${C.glow},${(.5 * v * vis).toFixed(3)})`); g.addColorStop(1, `rgba(${C.glow},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';

      /* callouts: each label sits on the side its region faces and glides into place */
      const anchors = regions.map((reg, j) => { const [x, y, z] = proj(reg.p); return { j, x, y, z }; });
      const sides = [anchors.filter(a => a.x < cx).sort((a, b) => a.y - b.y), anchors.filter(a => a.x >= cx).sort((a, b) => a.y - b.y)];
      const F1 = '700 11.5px "Atkinson Hyperlegible Next", system-ui, sans-serif', F2 = '400 10.5px "Atkinson Hyperlegible Next", system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      sides.forEach((list, side) => list.forEach((a, k) => {
        const ty = H * (list.length === 1 ? .5 : .1 + .78 * k / (list.length - 1)), tx = side ? W - 8 : 8;
        const L = labels[a.j] = labels[a.j] || { x: tx, y: ty }; L.x += (tx - L.x) * Math.min(1, dt * 6); L.y += (ty - L.y) * Math.min(1, dt * 6);
        const reg = regions[a.j], col = reg.tone === 'win' ? '91,214,155' : reg.tone === 'lose' ? '255,92,104' : '190,190,205', vis = a.z < .1 ? 1 : .4;
        const right = L.x > cx; ctx.font = F1; const w1 = ctx.measureText(reg.name).width; ctx.font = F2; const w = Math.max(w1, ctx.measureText(reg.line).width), ex = right ? L.x - w - 6 : L.x + w + 6;
        ctx.strokeStyle = `rgba(${col},${(.7 * vis).toFixed(2)})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(ex, L.y); ctx.lineTo(ex + (right ? -12 : 12), L.y); ctx.lineTo(a.x, a.y); ctx.stroke();
        ctx.fillStyle = `rgba(${col},${vis})`; ctx.beginPath(); ctx.arc(a.x, a.y, 3, 0, TAU); ctx.fill();
        ctx.strokeStyle = `rgba(${col},${(.35 * vis).toFixed(2)})`; ctx.beginPath(); ctx.arc(a.x, a.y, motion ? 5 + 3 * Math.sin(now / 300 + a.j) : 6, 0, TAU); ctx.stroke();
        ctx.textAlign = right ? 'right' : 'left';
        ctx.font = F1; ctx.fillStyle = `rgba(244,240,245,${Math.max(.55, vis)})`; ctx.fillText(reg.name, L.x, L.y - 7);
        ctx.font = F2; ctx.fillStyle = `rgba(${col},${Math.max(.6, vis)})`; ctx.fillText(reg.line, L.x, L.y + 7);
      }));
    }
    return { set, draw };
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
