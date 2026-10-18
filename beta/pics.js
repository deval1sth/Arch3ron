/* Archeron · question pictures. Builders return plain figure data in the board's format, drawn from the exact numbers in the
   question, so the picture always matches what is asked. The unknown is labelled "?" and the answer is never drawn as a number.
   Parts: ['l', path, cls] a line, ['t', x, y, text, cls] a label, ['o', cx, cy, r, cls] a dot. PIC.el draws one for a question card. */
'use strict';
const PIC = (() => {
  const fig = (w, h, label, parts) => ({ w, h, label, parts, pic: true });
  const R = v => Math.round(v * 10) / 10, P = (x, y) => `${R(x)} ${R(y)}`;
  const num = v => String(Number(Number(v).toPrecision(10))).replace('-', '−');
  const NDA = () => ['t', 252, 10, 'Not drawn accurately', 'end sm'];
  /* fit a list of [x, y] points (y up) into a box, returning screen points (y down) */
  function fit(pts, x0, y0, w, h) {
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const s = Math.min(w / ((maxX - minX) || 1), h / ((maxY - minY) || 1)), ox = x0 + (w - (maxX - minX) * s) / 2, oy = y0 + (h - (maxY - minY) * s) / 2;
    return pts.map(([x, y]) => [ox + (x - minX) * s, oy + (maxY - y) * s]);
  }
  const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  function arc(V, A, B, r = 18) {
    const u = unit(V, A), v = unit(V, B), p1 = [V[0] + u[0] * r, V[1] + u[1] * r], p2 = [V[0] + v[0] * r, V[1] + v[1] * r];
    return `M${P(...p1)} A${r} ${r} 0 0 ${u[0] * v[1] - u[1] * v[0] > 0 ? 1 : 0} ${P(...p2)}`;
  }
  const away = (pt, c, d) => { const u = unit(c, pt); return [pt[0] + u[0] * d, pt[1] + u[1] * d]; };
  const cls = s => s === '?' ? 'mid hy' : 'mid';

  /* any triangle from its three sides (side i is opposite vertex i). lab: names, sides and angles to show ('' hides one) */
  function tri(sides, lab) {
    const [a, b, c] = sides, cosB = (a * a + c * c - b * b) / (2 * a * c), Bv = [0, 0], Cv = [a, 0], Av = [c * cosB, c * Math.sqrt(Math.max(0, 1 - cosB * cosB))];
    const span = Math.max(a, Av[0]) - Math.min(0, Av[0]); if (Av[1] < span * .42) Av[1] = span * .42; /* a very flat triangle is drawn taller so its labels have room */
    const [A, B, C] = fit([Av, Bv, Cv], 40, 26, 180, 104), V = [A, B, C], G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    const parts = [['l', `M${P(...A)} L${P(...B)} L${P(...C)} Z`]];
    V.forEach((p, i) => {
      if (lab.names) { const q = away(p, G, 14); parts.push(['t', q[0], q[1] + 4, lab.names[i], 'mid']); }
      const o = V.filter((_, j) => j !== i), s = lab.sides && lab.sides[i], ang = lab.angles && lab.angles[i];
      if (s) { const m = [(o[0][0] + o[1][0]) / 2, (o[0][1] + o[1][1]) / 2], q = away(m, G, 16); parts.push(['t', q[0], q[1] + 4, s, cls(s)]); }
      if (ang) { parts.push(['l', arc(p, o[0], o[1]), ang === '?' ? 'thin hy' : 'thin']); const u = unit(p, o[0]), w = unit(p, o[1]), half = Math.acos(Math.max(-1, Math.min(1, u[0] * w[0] + u[1] * w[1]))) / 2, q = away(p, G, -Math.min(58, Math.max(28, 15 / Math.sin(half)))); parts.push(['t', q[0], q[1] + 4, ang, cls(ang)]); }
    });
    if (lab.inner) parts.push(['t', 10, 154, lab.inner, 'sm' + (lab.inner.includes('?') ? ' hy' : '')]);
    parts.push(NDA(160));
    return fig(260, 160, lab.say || 'A triangle with the given sides and angles marked. Not drawn accurately.', parts);
  }
  /* right-angled triangle with the angle θ at the bottom left: o opposite, a adjacent, h hypotenuse labels */
  function right(deg, lab) {
    const t = deg * Math.PI / 180, [A, B, C] = fit([[0, 0], [Math.cos(t), 0], [Math.cos(t), Math.sin(t)]], 40, 22, 180, 108);
    const parts = [['l', `M${P(...A)} L${P(...B)} L${P(...C)} Z`], ['l', `M${P(B[0] - 12, B[1])} V${R(B[1] - 12)} H${R(B[0])}`, 'thin'],
      ['l', arc(A, B, C, 24), lab.ang === '?' ? 'thin hy' : 'thin'], (() => { const G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3], q = away(A, G, -Math.min(70, Math.max(34, 16 / Math.sin(t / 2)))); return ['t', q[0], q[1] + 4, lab.ang, cls(lab.ang)]; })()];
    if (lab.adj) parts.push(['t', (A[0] + B[0]) / 2, B[1] + 18, lab.adj, cls(lab.adj)]);
    if (lab.opp) parts.push(['t', B[0] + 10, (B[1] + C[1]) / 2 + 4, lab.opp, (lab.opp === '?' ? 'hy' : '')]);
    if (lab.hyp) parts.push(['t', (A[0] + C[0]) / 2 - 10, (A[1] + C[1]) / 2 - 6, lab.hyp, lab.hyp === '?' ? 'end hy' : 'end']);
    parts.push(NDA(160));
    return fig(260, 160, 'A right-angled triangle with the angle and sides marked. Not drawn accurately.', parts);
  }
  /* a cuboid drawn with depth going back at an angle; diag draws the long diagonal, base its shadow on the floor */
  function cuboid(w, h, d, lab, opt = {}) {
    const k = opt.scale || Math.min(150 / (w + d * .55), 100 / (h + d * .32)), W = w * k, H = h * k, dx = d * k * .55, dy = d * k * .32, x0 = opt.x0 ?? 40, y0 = opt.y0 ?? 130;
    const fbl = [x0, y0], fbr = [x0 + W, y0], ftr = [x0 + W, y0 - H], ftl = [x0, y0 - H], bbl = [x0 + dx, y0 - dy], bbr = [x0 + W + dx, y0 - dy], btr = [x0 + W + dx, y0 - H - dy], btl = [x0 + dx, y0 - H - dy];
    const parts = [['l', `M${P(...fbl)} L${P(...fbr)} L${P(...ftr)} L${P(...ftl)} Z`], ['l', `M${P(...ftl)} L${P(...btl)} L${P(...btr)} L${P(...ftr)} M${P(...fbr)} L${P(...bbr)} L${P(...btr)}`],
      ['l', `M${P(...fbl)} L${P(...bbl)} L${P(...bbr)} M${P(...bbl)} L${P(...btl)}`, 'thin dash']];
    if (opt.diag) parts.push(['l', `M${P(...fbl)} L${P(...btr)}`, 'hy']);
    if (opt.base) parts.push(['l', `M${P(...fbl)} L${P(...bbr)}`, 'thin dash hy'], ['l', arc(fbl, bbr, btr, 26), 'thin hy'], ['t', fbl[0] + 34, fbl[1] - 12, 'θ', 'hy']);
    if (lab.w) parts.push(['t', x0 + W / 2, y0 + 16, lab.w, cls(lab.w)]);
    if (lab.h) parts.push(['t', x0 - 6, y0 - H / 2 + 4, lab.h, 'end' + (lab.h === '?' ? ' hy' : '')]);
    if (lab.d) parts.push(['t', x0 + W + dx / 2 + 6, y0 - dy / 2 + 12, lab.d, '' + (lab.d === '?' ? 'hy' : '')]);
    if (lab.top) parts.push(['t', x0 + W / 2 + dx / 2, y0 - H - dy - 8, lab.top, cls(lab.top)]);
    return parts;
  }
  /* coordinate axes centred at (cx, cy) */
  const axes = (cx, cy, w, h) => [['l', `M${cx - w} ${cy} H${cx + w} M${cx} ${cy + h} V${cy - h}`, 'thin'], ['l', `M${cx + w - 6} ${cy - 4} L${cx + w} ${cy} L${cx + w - 6} ${cy + 4} M${cx - 4} ${cy - h + 6} L${cx} ${cy - h} L${cx + 4} ${cy - h + 6}`, 'thin'],
    ['t', cx + w - 2, cy + 16, 'x', 'end sm'], ['t', cx + 8, cy - h + 10, 'y', 'sm']];

  const B = {
    tri, right,
    cuboid: (w, h, d, lab, opt) => fig(260, 160, `A cuboid ${w} by ${d} by ${h}.${opt && opt.base ? ' The angle θ is between the long diagonal and the base.' : ''}`, [...cuboid(w, h, d, lab, opt), NDA(160)]),
    /* two similar shapes side by side: the small one and the large one, scale factor k */
    similar: (k, solid, l1, l2, s1, s2) => { const base = solid ? Math.min(46, 130 / (1 + k), 96 / k) : Math.min(46, 150 / (1 + k)), parts = [];
      if (solid) { parts.push(...cuboid(1, .8, .8, { w: l1, top: s1 }, { scale: base, x0: 20, y0: 130 }), ...cuboid(1, .8, .8, { w: l2, top: s2 }, { scale: base * k, x0: 40 + base * 1.5, y0: 130 })); }
      else { const t = (x, s) => [['l', `M${x} 130 H${R(x + s)} L${R(x + s * .3)} ${R(130 - s * .8)} Z`], ['t', x + s / 2, 148, s === base ? l1 : l2, 'mid'], ['t', R(x + s * .45), R(130 - s * .25), s === base ? s1 : s2, 'mid sm' + ((s === base ? s1 : s2).includes('?') ? ' hy' : '')]];
        parts.push(...t(24, base), ...t(48 + base, base * k)); }
      return fig(260, 160, 'Two similar shapes, the smaller on the left. Not drawn accurately.', [...parts, NDA(160)]); },
    /* circle x² + y² = r² on axes, with a point on it and (optionally) the tangent there */
    circle: (r2, pt, tangent) => { const cx = 130, cy = 82, s = 56 / Math.sqrt(r2), parts = [...axes(cx, cy, 110, 76), ['l', `M${cx + 56} ${cy} A56 56 0 1 1 ${cx + 55.99} ${cy - .4}`], ['t', 250, 20, `x² + y² = ${r2}`, 'end']];
      if (pt) { const X = cx + pt[0] * s, Y = cy - pt[1] * s; parts.push(['l', `M${cx} ${cy} L${P(X, Y)}`, 'thin dash'], ['o', X, Y, 4, 'hyf'], ['t', X + (pt[0] < 0 ? -8 : 8), Y + (pt[1] < 0 ? 16 : -8), `(${num(pt[0])}, ${num(pt[1])})`, pt[0] < 0 ? 'end' : '']);
        if (tangent) { const u = [-pt[1], pt[0]], l = Math.hypot(...u); parts.push(['l', `M${P(X - u[0] / l * 60, Y + u[1] / l * 60)} L${P(X + u[0] / l * 60, Y - u[1] / l * 60)}`, 'hy']); } }
      else parts.push(['l', `M${cx} ${cy} L${cx + 40} ${cy - 40}`, 'thin dash hy'], ['t', cx + 26, cy - 30, 'r = ?', 'hy']);
      return fig(260, 165, `The circle x² + y² = ${r2}${pt ? ` and the point (${num(pt[0])}, ${num(pt[1])}) on it` : ''}.`, parts); },
    /* the graph of y = f(x): a smooth ∪ curve with its turning point marked */
    turning: (px, py) => { const cx = 130, cy = 84, s = 9, X = x => cx + x * s, Y = y => cy - y * s, parts = [...axes(cx, cy, 110, 76)];
      let d = ''; for (let x = px - 4; x <= px + 4.001; x += .25) { const y = py + (x - px) ** 2 * .9; if (Y(y) < 6) continue; d += (d ? ' L' : 'M') + P(X(x), Y(y)); }
      parts.push(['l', d], ['o', X(px), Y(py), 4, 'hyf'], ['t', X(px), Y(py) + 18, `(${num(px)}, ${num(py)})`, 'mid hy'], ['t', 250, 20, 'y = f(x)', 'end']);
      return fig(260, 165, `The graph of y = f(x) with its turning point at (${num(px)}, ${num(py)}).`, parts); },
    /* a straight line y = mx + c, and a point if there is one */
    line: (m, c, label, pt) => { const lim = Math.max(10, pt ? Math.abs(pt[0]) + 2 : 0, pt ? Math.abs(pt[1]) + 2 : 0, Math.abs(c) + 2), cx = 130, cy = 84, s = 72 / lim, X = x => cx + x * s, Y = y => cy - y * s;
      const xs = [-lim, lim].map(y => (y - c) / m).concat([-lim, lim]).filter(x => Math.abs(x) <= lim + 1e-9 && Math.abs(m * x + c) <= lim + 1e-9).sort((a, b) => a - b);
      const parts = [...axes(cx, cy, 110, 78)];
      if (xs.length >= 2) { const a = xs[0], b = xs[xs.length - 1]; parts.push(['l', `M${P(X(a), Y(m * a + c))} L${P(X(b), Y(m * b + c))}`]); parts.push(['t', X(b) + (m > 0 ? -4 : 4), Y(m * b + c) + (m > 0 ? 14 : -6), label, m > 0 ? 'end' : '']); }
      if (pt) parts.push(['o', X(pt[0]), Y(pt[1]), 4, 'hyf'], ['t', X(pt[0]) + 8, Y(pt[1]) - 8, `(${num(pt[0])}, ${num(pt[1])})`, 'hy']);
      return fig(260, 165, `The line ${label}${pt ? ` and the point (${num(pt[0])}, ${num(pt[1])})` : ''}.`, parts); },
    /* one histogram bar; fd is drawn to a scale only when it is given */
    histo: (lo, hi, fd, f) => { const x0 = 40, y0 = 130, parts = [['l', `M${x0} 14 V${y0} H246`, 'thin'], ['t', x0 + 6, 12, 'Frequency density', 'sm'], ['t', 240, 150, 'time, t', 'end sm']];
      const bx = 90, bw = Math.max(40, Math.min(130, (hi - lo) * 3.4)), top = fd == null ? 52 : y0 - Math.min(96, fd * (96 / Math.max(fd, 1) * .9));
      parts.push(['l', `M${bx} ${y0} V${R(top)} H${R(bx + bw)} V${y0}`, 'hy'], ['t', bx, y0 + 16, String(lo), 'mid sm'], ['t', bx + bw, y0 + 16, String(hi), 'mid sm']);
      parts.push(['l', `M${x0 - 4} ${R(top)} H${x0}`, 'thin'], ['t', x0 - 6, top + 4, fd == null ? '?' : num(fd), fd == null ? 'end hy' : 'end']);
      if (f != null) parts.push(['t', bx + bw / 2, top - 6, `frequency ${f}`, 'mid sm']); else parts.push(['t', bx + bw / 2, top - 6, 'frequency ?', 'mid sm hy']);
      return fig(260, 160, `A histogram bar for ${lo} < t ≤ ${hi}.`, parts); },
    /* tree diagram for two picks without replacement; the second picks are left for the student */
    tree: (c, r, b) => { const T = r + b, parts = [['o', 20, 80, 3, '']], br = (x1, y1, x2, y2, t, lab, lc) => [['l', `M${x1} ${y1} L${x2} ${y2}`, 'thin'], ['t', (x1 + x2) / 2 - 4, (y1 + y2) / 2 + (y2 < y1 ? -8 : 16), t, 'mid sm' + (t === '?' ? ' hy' : '')], ['t', x2 + 6, y2 + 4, lab, 'sm']];
      parts.push(...br(20, 80, 100, 40, `${r}/${T}`, c[0]), ...br(20, 80, 100, 120, `${b}/${T}`, c[1]));
      for (const [y, ys] of [[40, [18, 58]], [120, [102, 142]]]) { parts.push(...br(150, y, 220, ys[0], '?', c[0]), ...br(150, y, 220, ys[1], '?', c[1])); }
      return fig(270, 160, `Tree diagram: first counter ${c[0]} ${r}/${T} or ${c[1]} ${b}/${T}; the second branches are for you to fill in.`, parts); },
    rect: (w, h, wl, hl) => { const k = Math.min(160 / w, 100 / h), W = w * k, H = h * k, x = 130 - W / 2, y = 80 - H / 2;
      return fig(260, 160, `A rectangle ${wl} by ${hl}.`, [['l', `M${P(x, y)} H${R(x + W)} V${R(y + H)} H${R(x)} Z`], ['t', 130, y + H + 18, wl, 'mid'], ['t', x - 8, 84, hl, 'end']]); },

    /* ---------- science ---------- */
    chrom: (sol, spot) => { const base = 140, front = 26, k = (base - front) / sol, sy = base - spot * k, parts = [['l', 'M60 14 H170 V156 H60 Z', 'thin'], ['l', `M64 ${base} H166`, 'thin'], ['t', 172, base + 4, 'start line', 'sm'],
      ['l', `M64 ${front} H166`, 'thin dash'], ['t', 172, front + 4, 'solvent front', 'sm'], ['o', 100, base, 5, 'acc'], ['o', 100, R(sy), 6, 'hyf'],
      ['l', `M40 ${base} V${front} M36 ${front + 6} L40 ${front} L44 ${front + 6}`, 'thin'], ['t', 34, (base + front) / 2, `${num(sol)} cm`, 'end sm'],
      ['l', `M130 ${base} V${R(sy)} M126 ${R(sy + 6)} L130 ${R(sy)} L134 ${R(sy + 6)}`, 'thin hy'], ['t', 136, (base + sy) / 2 + 4, `${num(spot)} cm`, 'sm hy']];
      return fig(260, 160, `A chromatogram: the solvent moved ${num(sol)} cm and the spot moved ${num(spot)} cm.`, parts); },
    cell: (img, real, mag) => fig(260, 150, `A cell seen under a microscope. Image width ${img}, real width ${real}, magnification ${mag}.`, [
      ['l', 'M50 70 C50 30 210 30 210 70 C210 110 50 110 50 70 Z'], ['l', 'M150 70 m-18 0 a18 14 0 1 0 36 0 a18 14 0 1 0 -36 0', 'thin'], ['o', 150, 70, 5, 'acc'],
      ['l', 'M50 124 H210 M56 118 L50 124 L56 130 M204 118 L210 124 L204 130', 'thin'], ['t', 130, 142, `image width: ${img}`, cls(img)],
      ['t', 130, 16, `real width: ${real}`, cls(real)], ['t', 250, 70, mag, 'end' + (mag === '?' ? ' hy' : '')]]),
    gas: (v, t) => fig(260, 150, `A flask giving off gas into a syringe: ${v} in ${t}.`, [
      ['l', 'M40 40 V70 L20 130 H90 L70 70 V40'], ['l', 'M30 112 H80', 'thin'], ['l', 'M55 40 V24 H130', 'thin'], ['l', 'M130 14 H230 V34 H130 Z'], ['l', 'M170 18 V30 M230 24 H250', 'thin'],
      ['t', 180, 56, `gas collected: ${v}`, 'mid' + (v.includes('?') ? ' hy' : '')], ['t', 180, 76, `time: ${t}`, 'mid' + (t.includes('?') ? ' hy' : '')]]),
    /* physics: a labelled sketch for the equation being used. L maps symbol → label text ('?' for the unknown) */
    phys: (pid, L) => {
      const box = (x, y, w, h, t) => [['l', `M${x} ${y} h${w} v${h} h${-w} Z`], ['t', x + w / 2, y + h / 2 + 4, t || '', 'mid sm' + ((t || '').includes('?') ? ' hy' : '')]];
      const arrow = (x1, x2, y, t) => [['l', `M${x1} ${y} H${x2} M${x2 - 8} ${y - 6} L${x2} ${y} L${x2 - 8} ${y + 6}`, 'hy'], ['t', (x1 + x2) / 2, y - 8, t, 'mid' + (t.includes('?') ? ' hy' : '')]];
      const ground = [['l', 'M14 130 H246', 'thin']];
      const t = (x, y, s, c = '') => ['t', x, y, s, c + (s.includes('?') ? ' hy' : '')];
      let parts = null, say = '';
      if (pid === 'momentum' || pid === 'ke') { parts = [...ground, ...box(70, 90, 70, 40, 'm = ' + L.m), ['o', 86, 132, 6, 'acc'], ['o', 124, 132, 6, 'acc'], ...arrow(150, 220, 108, 'v = ' + L.v), t(130, 30, (pid === 'ke' ? 'Eₖ = ' + L.E : 'p = ' + L.p), 'mid')]; say = 'A moving object with its mass and velocity.'; }
      if (pid === 'gpe') { parts = [...ground, ['l', 'M150 130 V64 H230', 'thin'], ...box(170, 34, 44, 30, 'm = ' + L.m), ['l', 'M120 64 V128 M114 70 L120 64 L126 70 M114 122 L120 128 L126 122', 'thin hy'], t(112, 100, 'h = ' + L.h, 'end'), t(130, 20, 'Eₚ = ' + L.E + '   g = ' + L.g, 'mid')]; say = 'An object lifted to a height.'; }
      if (pid === 'spring') { let d = 'M130 20 V30'; for (let i = 0; i < 8; i++) d += ` L${i % 2 ? 116 : 144} ${36 + i * 8}`; d += ' L130 100 V108';
        parts = [['l', 'M90 20 H170', 'thick'], ['l', d], ...box(112, 108, 36, 26, ''), ['l', 'M190 92 V112 M184 98 L190 92 L196 98 M184 106 L190 112 L196 106', 'thin hy'], t(198, 106, 'e = ' + L.e), t(130, 150, 'F = ' + L.F + '   k = ' + L.k, 'mid')]; say = 'A spring stretched by a force.'; }
      if (pid === 'density') { parts = [['l', 'M80 60 H170 V130 H80 Z M80 60 L110 40 H200 L170 60 M200 40 V110 L170 130'], t(125, 100, 'm = ' + L.m, 'mid'), t(125, 150, 'V = ' + L.V, 'mid'), t(240, 30, 'ρ = ' + L.rho, 'end')]; say = 'A block of material.'; }
      if (pid === 'speed') { parts = [...ground, ...box(24, 96, 48, 30, ''), ['l', 'M24 112 V146 M232 112 V146', 'thin'], ['l', 'M24 140 H232 M30 134 L24 140 L30 146 M226 134 L232 140 L226 146', 'thin hy'], t(128, 156, 's = ' + L.s, 'mid'), t(128, 40, 't = ' + L.t + '    v = ' + L.v, 'mid')]; say = 'An object travelling a distance.'; }
      if (pid === 'accel') { parts = [...ground, ...box(30, 96, 48, 30, ''), ...arrow(90, 130, 104, 'u'), ...box(150, 96, 48, 30, ''), ...arrow(210, 250, 104, 'v'), t(130, 40, 'change in velocity Δv = ' + L.dv, 'mid'), t(130, 60, 't = ' + L.t + '    a = ' + L.a, 'mid')]; say = 'An object speeding up.'; }
      return parts && fig(260, 160, say + ' ' + Object.entries(L).map(([k, v]) => `${k} = ${v}`).join(', ') + '.', parts);
    }
  };

  /* a picture for a question card: drawn at once (the board draws them stroke by stroke) */
  function el(F) {
    const NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', `0 0 ${F.w} ${F.h}`); s.setAttribute('class', 'bfig qpic'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', F.label);
    for (const [type, ...a] of F.parts) {
      let e;
      if (type === 'l') { e = document.createElementNS(NS, 'path'); e.setAttribute('d', a[0]); e.setAttribute('class', 'fl ' + (a[1] || '')); }
      else if (type === 't') { e = document.createElementNS(NS, 'text'); e.setAttribute('x', a[0]); e.setAttribute('y', a[1]); e.textContent = a[2]; e.setAttribute('class', 'ft ' + (a[3] || '')); }
      else { e = document.createElementNS(NS, 'circle'); e.setAttribute('cx', a[0]); e.setAttribute('cy', a[1]); e.setAttribute('r', a[2]); e.setAttribute('class', 'fo ' + (a[3] || '')); }
      s.append(e);
    }
    return s;
  }
  return Object.assign(B, { el });
})();
