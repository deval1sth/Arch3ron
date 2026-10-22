/* Two spinning 3D brains (a point cloud on a canvas, no libraries). Each subject owns a region that glows by strength,
   with a labelled callout. BRAIN.create(canvas) → { set(regions), draw(now, motion) }.
   regions = [{ name, line, key, color, v: 0..1, tone: 'win' | 'lose' | 'even' }] */
const BRAIN = (() => {
  /* ---------- the model, unit-ish coordinates: x left/right, y up, z front (+) / back (-) ---------- */
  const PTS = (() => {
    const out = [], fib = (n, fn) => { for (let i = 0; i < n; i++) { const y = 1 - 2 * (i + .5) / n, r = Math.sqrt(1 - y * y), a = i * 2.399963; fn(Math.cos(a) * r, y, Math.sin(a) * r); } };
    for (const sx of [-1, 1]) fib(2200, (x, y, z) => {
      if (x * sx < -.2) x = -.2 * sx + (x + .2 * sx) * .2;                       /* flat inner face: the gap down the middle */
      const g = Math.sin(x * 9 + z * 7 + sx) * Math.sin(y * 11 - z * 5) + .6 * Math.sin(z * 13 + y * 6 - x * 4);
      const k = 1 + g * .03;
      out.push({ x: sx * .37 + x * .4 * k, y: .06 + y * (y < 0 ? .42 : .54) * k, z: z * .84 * k, s: g });
    });
    fib(380, (x, y, z) => out.push({ x: x * .33, y: -.3 + y * .15, z: -.56 + z * .2, s: Math.sin(y * 34) }));
    for (let i = 0; i < 110; i++) { const a = i * 2.4, h = i / 110; out.push({ x: Math.cos(a) * .09, y: -.34 - h * .5, z: -.3 + Math.sin(a) * .09 + h * .04, s: 0 }); }
    return out;
  })();
  /* where each kind of subject lives (for fun, loosely after the lobes) */
  const SPOTS = { parietal: [.33, .5, -.2], frontal: [.33, .34, .5], prefrontal: [-.2, .06, .8], occipital: [.25, .14, -.8], temporal: [.72, -.16, .16],
    motor: [-.3, .56, .1], broca: [-.68, .02, .42], cerebellum: [0, -.42, -.62], temporalL: [-.72, -.16, .1], parietalL: [-.33, .5, -.24], frontalL: [-.33, .34, .5] };
  const R0 = .4;

  function create(canvas) {
    const ctx = canvas.getContext('2d');
    let regions = [], memb = new Int16Array(PTS.length).fill(-1), wt = new Float32Array(PTS.length);
    let angle = .7, last = 0, dragX = null, held = 0, labels = [];
    canvas.addEventListener('pointerdown', e => { dragX = e.clientX; held = Date.now(); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (dragX == null) return; angle += (e.clientX - dragX) * .012; dragX = e.clientX; held = Date.now(); });
    const up = () => { dragX = null; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

    function set(list) {
      regions = list.map(r => ({ ...r, p: SPOTS[r.key] || SPOTS.frontal, rgb: [1, 3, 5].map(i => parseInt(r.color.slice(i, i + 2), 16)) }));
      memb.fill(-1); wt.fill(0);
      PTS.forEach((q, i) => { let best = -1, bd = R0; regions.forEach((r, j) => { const d = Math.hypot(q.x - r.p[0], q.y - r.p[1], q.z - r.p[2]); if (d < bd) { bd = d; best = j; } }); memb[i] = best; wt[i] = best < 0 ? 0 : 1 - bd / R0; });
      labels = regions.map(() => null);
    }

    function draw(now, motion) {
      const dpr = Math.min(2, window.devicePixelRatio || 1), W = canvas.clientWidth, H = canvas.clientHeight;
      if (!W || !H) return;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
      const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
      if (motion && dragX == null && Date.now() - held > 2500) angle += dt * .32;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * .52, R = Math.min(W * .3, H * .44), ca = Math.cos(angle), sa = Math.sin(angle), tilt = .2, ct = Math.cos(tilt), st = Math.sin(tilt);
      const proj = (x, y, z) => { const x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * ct - z1 * st, z2 = y * st + z1 * ct, k = 2.8 / (2.8 + z2); return [cx + x1 * R * k, cy - y1 * R * k, z2, k]; };

      const g = ctx.createRadialGradient(cx, cy, R * .2, cx, cy, R * 1.5); g.addColorStop(0, 'rgba(120,90,140,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      const P = PTS.map((q, i) => { const [x, y, z, k] = proj(q.x, q.y, q.z); return { x, y, z, k, i }; }).sort((a, b) => b.z - a.z);
      for (const p of P) {
        const q = PTS[p.i], front = (1 - p.z) / 2, sulc = .55 + .45 * (q.s + 1.6) / 3.2, j = memb[p.i];
        let r = 120, gg = 126, b = 160, a = (.18 + .62 * front) * sulc;
        if (j >= 0) { const reg = regions[j], m = wt[p.i] * (.25 + .75 * reg.v); r += (reg.rgb[0] - r) * m; gg += (reg.rgb[1] - gg) * m; b += (reg.rgb[2] - b) * m; a = Math.min(1, a + m * .5); }
        ctx.fillStyle = `rgba(${r | 0},${gg | 0},${b | 0},${a.toFixed(3)})`;
        const s = (.7 + 1.3 * front) * p.k; ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      /* glow over strong regions */
      ctx.globalCompositeOperation = 'lighter';
      regions.forEach(reg => {
        const [x, y, z] = proj(...reg.p), vis = z < .15 ? 1 : .35, rad = R * (.28 + .22 * reg.v);
        const gl = ctx.createRadialGradient(x, y, 0, x, y, rad); gl.addColorStop(0, `rgba(${reg.rgb.join(',')},${(.38 * reg.v * vis).toFixed(3)})`); gl.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';

      /* callouts: labels sit on the side their region currently faces and glide into place */
      const anchors = regions.map((reg, j) => { const [x, y, z] = proj(...reg.p); return { j, x, y, z }; });
      const sides = [anchors.filter(a => a.x < cx).sort((a, b) => a.y - b.y), anchors.filter(a => a.x >= cx).sort((a, b) => a.y - b.y)];
      ctx.font = '700 11.5px "Atkinson Hyperlegible Next", system-ui, sans-serif'; ctx.textBaseline = 'middle';
      sides.forEach((list, side) => list.forEach((a, k) => {
        const ty = H * (list.length === 1 ? .5 : .14 + .72 * k / (list.length - 1)), tx = side ? W - 8 : 8;
        const L = labels[a.j] = labels[a.j] || { x: tx, y: ty }; L.x += (tx - L.x) * Math.min(1, dt * 6); L.y += (ty - L.y) * Math.min(1, dt * 6);
        const reg = regions[a.j], col = reg.tone === 'win' ? '91,214,155' : reg.tone === 'lose' ? '255,92,104' : '190,190,205', vis = a.z < .15 ? 1 : .38;
        const right = L.x > cx, w = Math.max(ctx.measureText(reg.name).width, ctx.measureText(reg.line).width), ex = right ? L.x - w - 6 : L.x + w + 6;
        ctx.strokeStyle = `rgba(${col},${(.75 * vis).toFixed(2)})`; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(ex, L.y); ctx.lineTo(ex + (right ? -12 : 12), L.y); ctx.lineTo(a.x, a.y); ctx.stroke();
        ctx.fillStyle = `rgba(${col},${vis})`; ctx.beginPath(); ctx.arc(a.x, a.y, 3.2, 0, Math.PI * 2); ctx.fill();
        const pulse = 5 + 3 * Math.sin(now / 300 + a.j); ctx.strokeStyle = `rgba(${col},${(.35 * vis).toFixed(2)})`; ctx.beginPath(); ctx.arc(a.x, a.y, pulse, 0, Math.PI * 2); ctx.stroke();
        ctx.textAlign = right ? 'right' : 'left';
        ctx.fillStyle = `rgba(244,240,245,${Math.max(.55, vis)})`; ctx.font = '700 11.5px "Atkinson Hyperlegible Next", system-ui, sans-serif'; ctx.fillText(reg.name, L.x, L.y - 7);
        ctx.fillStyle = `rgba(${col},${Math.max(.6, vis)})`; ctx.font = '400 10.5px "Atkinson Hyperlegible Next", system-ui, sans-serif'; ctx.fillText(reg.line, L.x, L.y + 7);
        ctx.font = '700 11.5px "Atkinson Hyperlegible Next", system-ui, sans-serif';
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
