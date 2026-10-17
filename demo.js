/* Archeron · Board demos. Turns the exact question a student is on into ordered teaching lines,
   then checks the maths with plain arithmetic before the board is allowed to play it. No DOM code here.
   Line: { say, math, why, kind: 'q' | 'answer' | 'check' | 'idea', table, tri }
   Math markup: {3/4} is a stacked fraction, [[x]] is the part that changes on this line. */
'use strict';
const DEMO = (() => {
  const clean = x => Number(x.toPrecision(10));
  const n = x => String(clean(x)).replace('-', '−');
  const sg = x => (x < 0 ? ' − ' : ' + ') + n(Math.abs(x));
  const cx = (k, v) => (k === 1 ? '' : k === -1 ? '−' : n(k)) + v;
  const lin = (a, b, v) => cx(a, v) + (b ? sg(b) : '');
  const par = x => x < 0 ? `(${n(x)})` : n(x);
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  const near = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  const fr = (a, b) => b === 1 ? n(a) : `{${n(a)}/${b}}`;
  const SUB = '₀₁₂₃₄₅₆₇₈₉', subs = f => f.replace(/\d/g, d => SUB[d]);
  const money = x => Number.isInteger(clean(x)) ? n(x) : clean(x).toFixed(2);
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }, sup = p => String(p).split('').map(c => SUP[c]).join('');
  const B = {};

  /* ---------- Diagrams: plain data the board draws in order. Parts: ['l', path, cls] a line that draws itself,
     ['t', x, y, text, cls] a label, ['o', cx, cy, r, cls] a filled dot. Sizes are in viewBox units. */
  const fig = (w, h, label, parts) => ({ w, h, label, parts });
  const P = (x, y) => `${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`;
  const pol = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)];
  const FIG = {
    rtri: (a, b, c) => fig(240, 150, `Right-angled triangle. Shorter sides ${a} and ${b}, hypotenuse ${c}.`, [
      ['l', 'M40 120 H200'], ['l', 'M40 120 V24'], ['l', 'M40 24 L200 120', 'hy'], ['l', 'M40 106 H54 V120', 'thin'],
      ['t', 120, 142, 'a = ' + a, 'mid'], ['t', 34, 76, 'b = ' + b, 'end'], ['t', 134, 62, 'c = ' + c, 'hy']]),
    tri: (b, h) => fig(260, 160, `Triangle with base ${b} cm and perpendicular height ${h} cm.`, [
      ['l', 'M30 130 H230'], ['l', 'M230 130 L160 30'], ['l', 'M160 30 L30 130'], ['l', 'M160 30 V130', 'dash hy'], ['l', 'M160 118 H172 V130', 'thin'],
      ['t', 130, 152, `base ${b} cm`, 'mid'], ['t', 168, 86, `height ${h} cm`, 'hy']]),
    trap: (a, b, h) => { const wa = Math.max(50, 200 * a / b), x0 = 130 - wa / 2, x1 = 130 + wa / 2;
      return fig(260, 165, `Trapezium with parallel sides ${a} cm and ${b} cm, height ${h} cm.`, [
        ['l', `M30 130 H230`], ['l', `M230 130 L${P(x1, 40)}`], ['l', `M${P(x1, 40)} H${x0}`], ['l', `M${P(x0, 40)} L30 130`], ['l', `M${P(x0, 40)} V130`, 'dash hy'],
        ['t', 130, 32, `a = ${a} cm`, 'mid'], ['t', 130, 152, `b = ${b} cm`, 'mid'], ['t', x0 + 6, 92, `h = ${h} cm`, 'hy']]); },
    circle: (r, useD) => fig(240, 170, `Circle with ${useD ? 'diameter ' + 2 * r : 'radius ' + r} cm.`, [
      ['l', 'M180 85 A60 60 0 1 1 179.9 84.4'], ['o', 120, 85, 3, ''], ['l', useD ? 'M60 85 H180' : 'M120 85 H180', 'hy'],
      ['t', useD ? 120 : 150, 78, useD ? `d = ${2 * r} cm` : `r = ${r} cm`, 'mid hy']]),
    line: a => { const [x, y] = pol(130, 120, 95, a), [lx, ly] = pol(130, 120, 34, a / 2), [rx, ry] = pol(130, 120, 34, (180 + a) / 2);
      return fig(260, 140, `Two angles on a straight line: ${a} degrees and x.`, [['l', 'M20 120 H240'], ['l', `M130 120 L${P(x, y)}`, 'hy'], ['t', lx + 4, ly, a + '°', 'mid'], ['t', rx - 4, ry, 'x', 'mid hy']]); },
    tri3: (a, b) => fig(260, 160, `Triangle with angles ${a} degrees, ${b} degrees and x. Not drawn to scale.`, [
      ['l', 'M30 135 H230'], ['l', 'M230 135 L120 25'], ['l', 'M120 25 L30 135'], ['t', 54, 128, a + '°'], ['t', 190, 128, b + '°'], ['t', 120, 52, 'x', 'mid hy'], ['t', 130, 156, 'not drawn to scale', 'mid sm']]),
    point: (as) => { let t = 0; const parts = [['o', 130, 85, 3, '']], all = [...as, 360 - as.reduce((s, v) => s + v, 0)];
      all.forEach((v, j) => { const [x, y] = pol(130, 85, 70, t); parts.push(['l', `M130 85 L${P(x, y)}`]); const [lx, ly] = pol(130, 85, 40, t + v / 2); parts.push(['t', lx, ly + 4, j === all.length - 1 ? 'x' : v + '°', j === all.length - 1 ? 'mid hy' : 'mid']); t += v; });
      return fig(260, 170, `Four angles around a point: ${as.join(', ')} degrees and x.`, parts); },
    poly: k => { const pts = Array.from({ length: k }, (_, j) => pol(110, 85, 62, 90 + 360 * j / k)), parts = [];
      pts.forEach((p, j) => { const q = pts[(j + 1) % k]; parts.push(['l', `M${P(...p)} L${P(...q)}`]); });
      const [a, b] = [pts[0], pts[1]], ex = [b[0] + (b[0] - a[0]) * .7, b[1] + (b[1] - a[1]) * .7];
      parts.push(['l', `M${P(...b)} L${P(...ex)}`, 'dash hy'], ['t', b[0] - 26, b[1] + 22, 'exterior', 'hy sm']);
      return fig(240, 170, `Regular polygon with ${k} sides and one side extended to show an exterior angle.`, parts); },
    numline: (s, e) => { const lo = Math.min(s, e, 0) - 1, hi = Math.max(s, e, 0) + 1, X = v => 20 + (v - lo) * 220 / (hi - lo), parts = [['l', 'M14 90 H246']];
      for (let v = lo; v <= hi; v++) { parts.push(['l', `M${P(X(v), 84)} V96`, 'thin']); if (hi - lo <= 16 || v % 2 === 0 || v === s || v === e) parts.push(['t', X(v), 114, n(v), 'mid sm']); }
      parts.push(['o', X(s), 90, 6, 'acc'], ['l', `M${P(X(s), 82)} Q${P((X(s) + X(e)) / 2, 30)} ${P(X(e), 82)}`, 'hy'], ['o', X(e), 90, 6, 'hyf']);
      return fig(260, 125, `Number line: start at ${n(s)}, move to ${n(e)}.`, parts); },
    sdt: want => fig(200, 150, 'Formula triangle: distance on top, speed and time underneath.', [
      ['l', 'M100 14 L186 136 H14 Z'], ['l', 'M50 86 H150'], ['l', 'M100 86 V136'],
      ['t', 100, 70, 'D', 'mid big' + (want === 'd' ? ' hy' : '')], ['t', 66, 122, 'S', 'mid big' + (want === 's' ? ' hy' : '')], ['t', 134, 122, 'T', 'mid big' + (want === 't' ? ' hy' : '')]]),
    bag: (cs, cols) => { const parts = [['l', 'M30 30 Q20 140 60 150 H200 Q240 140 230 30', ''], ['l', 'M30 30 Q130 46 230 30', 'thin']]; let j = 0;
      cs.forEach((c, k) => { for (let i = 0; i < c; i++, j++) parts.push(['o', 58 + (j % 8) * 21, 60 + Math.floor(j / 8) * 22, 8, 'c-' + cols[k]]); });
      return fig(260, 160, 'Bag of counters: ' + cs.map((c, k) => c + ' ' + cols[k]).join(', ') + '.', parts); },
    /* series circuit: cell, resistor, ammeter in the loop, voltmeter across the resistor */
    circuit: (L, extra) => fig(260, 175, `Circuit with a cell, resistor, ammeter and voltmeter. ${Object.entries(L).map(([k, v]) => k + ' = ' + v).join(', ')}.`, [
      ['l', 'M40 60 H110 M150 60 H220 V73 M220 97 V102 M220 122 V130 H40 V90 M40 80 V60'], ['l', 'M24 80 H56', ''], ['l', 'M32 90 H48', 'thick'],
      ['l', 'M110 52 H150 V68 H110 Z', 'hy'], ['l', 'M232 85 A12 12 0 1 1 231.9 84', ''], ['t', 220, 90, 'A', 'mid'],
      ['l', 'M95 60 V24 H118 M142 24 H165 V60', 'thin'], ['l', 'M142 24 A12 12 0 1 1 141.9 23.4', ''], ['t', 130, 29, 'V', 'mid'],
      ['t', 130, 88, L.R ? 'R = ' + L.R : 'resistor', 'mid' + (L.R === '?' ? ' hy' : '')], ['t', 220, 116, L.I ? 'I = ' + L.I : '', 'mid' + (L.I === '?' ? ' hy' : '')],
      ['t', 172, 20, L.V ? 'V = ' + L.V : '', (L.V === '?' ? 'hy' : '')], ['t', 130, 160, extra || '', 'mid hy']]),
    wave: (f, lam) => { let d = 'M20 53'; for (let x = 24; x <= 240; x += 4) d += ' L' + P(x, 85 + 32 * Math.sin((x - 20) * Math.PI / 40 - Math.PI / 2));
      return fig(260, 160, `A wave. Wavelength ${lam}, frequency ${f}.`, [['l', 'M14 85 H246', 'thin dash'], ['l', d, ''], ['l', 'M20 40 H100 M26 35 L20 40 L26 45 M94 35 L100 40 L94 45', 'hy'], ['l', 'M20 46 V53 M100 46 V53', 'thin'],
        ['t', 60, 30, 'λ = ' + lam, 'mid hy'], ['t', 130, 150, 'f = ' + f + '   (waves per second)', 'mid sm']]); },
    force: (kind, L) => { const box = ['l', 'M100 60 H160 V110 H100 Z'], m = ['t', 130, 90, L.m ? 'm = ' + L.m : '', 'mid sm'];
      if (kind === 'down') return fig(260, 175, `A mass with its weight acting downwards. ${L.W ? 'W = ' + L.W : ''}`, [box, m, ['l', 'M130 110 V160 M122 150 L130 160 L138 150', 'hy'], ['t', 140, 145, 'W = ' + L.W, 'hy']]);
      return fig(260, 150, 'A force pushing an object.', [box, m, ['l', 'M160 85 H230 M220 77 L230 85 L220 93', 'hy'], ['t', 196, 75, 'F = ' + L.F, 'mid hy'],
        L.a ? ['t', 130, 40, 'a = ' + L.a + ' →', 'mid'] : ['l', 'M100 128 H230 M100 122 V134 M230 122 V134', 'thin'], L.s ? ['t', 165, 146, 's = ' + L.s, 'mid'] : null].filter(Boolean)); },
    /* every atom drawn: each species is a column of identical molecules */
    particles: (e, co) => { const sp = [...e.l, ...e.r].map(f => CHEM.atoms(f)), parts = []; let x = 10, h = 0;
      sp.forEach((m, j) => { const at = Object.entries(m).flatMap(([el, c]) => Array(c).fill(el)), w = at.length * 17 + 6;
        for (let k = 0; k < co[j]; k++) at.forEach((el, a) => { parts.push(['o', x + 11 + a * 17, 22 + k * 26, 9, 'at at-' + el], ['t', x + 11 + a * 17, 26 + k * 26, el, 'mid at-t']); });
        h = Math.max(h, co[j] * 26 + 12); x += w;
        if (j < sp.length - 1) { parts.push(['t', x + 8, 26, j === e.l.length - 1 ? '→' : '+', 'mid big']); x += 18; } });
      return fig(Math.max(260, x + 6), Math.max(60, h), 'The balanced equation drawn as atoms. Each column is one substance; count the atoms of each element on both sides.', parts); }
  };

  /* ---------- Maths ---------- */
  B['solve-1'] = q => {
    const { a, b, c } = q.dm, x = (c - b) / a, k = Math.abs(b);
    return { lines: [
      { kind: 'q', say: 'Here is the equation.', math: `${a}x${sg(b)} = ${n(c)}` },
      { say: `We want x on its own. First undo the ${sg(b).trim()}: ${b > 0 ? 'subtract' : 'add'} ${k} on both sides.`, math: `${a}x${sg(b)}[[${sg(-b)}]] = ${n(c)}[[${sg(-b)}]]`,
        why: 'Doing the same thing to both sides keeps the equation balanced, like weighing scales.' },
      { say: 'Simplify both sides.', math: `${a}x = ${n(c - b)}` },
      { say: `x is multiplied by ${a}, so divide both sides by ${a}.`, math: `${a}x [[÷ ${a}]] = ${n(c - b)} [[÷ ${a}]]`, why: 'Dividing undoes multiplying.' },
      { kind: 'answer', math: `x = ${n(x)}` },
      { kind: 'check', say: `Check: put x = ${n(x)} back into the original equation.`, math: `${a} × ${par(x)}${sg(b)} = ${n(a * x)}${sg(b)} = ${n(a * x + b)} ✓` },
      { kind: 'idea', say: 'Undo the operations in reverse order: first the + or −, then the ×.', why: 'Common slip: dividing only the x term. Divide the whole of both sides.' }],
      checks: [['x makes both sides equal', near(a * x + b, c)], ['matches the marked answer', near(x, q.v)]] };
  };
  B['solve-2'] = q => {
    const { a, b, c, d } = q.dm, x = (d - b) / (a - c), k = a - c, dd = d ? sg(d) : '';
    const L = [
      { kind: 'q', say: 'Here is the equation. There are x terms on both sides.', math: `${a}x${sg(b)} = ${lin(c, d, 'x')}` },
      { say: `Subtract ${cx(c, 'x')} from both sides, so x is only on the left.`, math: `${a}x [[− ${cx(c, 'x')}]]${sg(b)} = ${cx(c, 'x')} [[− ${cx(c, 'x')}]]${dd}`,
        why: 'Move the smaller x term, so the x term you keep stays positive.' },
      { say: 'Simplify both sides.', math: `${lin(k, b, 'x')} = ${n(d)}` },
      { say: `Now undo the ${sg(b).trim()}: ${b > 0 ? 'subtract' : 'add'} ${Math.abs(b)} on both sides.`, math: `${lin(k, b, 'x')}[[${sg(-b)}]] = ${n(d)}[[${sg(-b)}]]` },
      { say: 'Simplify.', math: `${cx(k, 'x')} = ${n(d - b)}` }];
    if (k !== 1) L.push({ say: `Divide both sides by ${k}.`, math: `${k}x [[÷ ${k}]] = ${n(d - b)} [[÷ ${k}]]`, why: 'Dividing undoes multiplying.' });
    L.push({ kind: 'answer', math: `x = ${n(x)}` },
      { kind: 'check', say: `Check: put x = ${n(x)} into both sides.`, math: `Left: ${a} × ${par(x)}${sg(b)} = ${n(a * x + b)}` },
      { kind: 'check', math: `Right: ${c === 1 ? par(x) : c + ' × ' + par(x)}${dd} = ${n(c * x + d)} ✓` },
      { kind: 'idea', say: 'Collect the x terms on one side first, then solve it like a one-step equation.' });
    return { lines: L, checks: [['both sides equal at x', near(a * x + b, c * x + d)], ['matches the marked answer', near(x, q.v)]] };
  };
  B.expand = q => {
    const { k, p, m } = q.dm, A = k * p, Bc = k * m, px = cx(p, 'x'), at = x => k * (p * x + m);
    return { lines: [
      { kind: 'q', say: 'Here is the bracket to expand.', math: `${k}(${px}${sg(m)})` },
      { say: `Multiply the ${k} outside by every term inside.`, math: `[[${k}]] × ${px} = ${cx(A, 'x')}`, why: 'A number in front of a bracket multiplies everything inside it.' },
      { math: `[[${k}]] × ${par(m)} = ${n(Bc)}`, why: m < 0 ? 'Positive × negative = negative.' : null },
      { kind: 'answer', say: 'Put the two parts together.', math: `${k}(${px}${sg(m)}) = ${lin(A, Bc, 'x')}` },
      { kind: 'check', say: 'Check with x = 2: both versions should give the same number.', math: `${k} × (${n(p * 2)}${sg(m)}) = ${n(at(2))}   and   ${A} × 2${sg(Bc)} = ${n(A * 2 + Bc)} ✓` },
      { kind: 'idea', say: 'Multiply every term inside the bracket, not just the first one.' }],
      checks: [['same value at x = 2', near(at(2), A * 2 + Bc)], ['same value at x = −3', near(at(-3), A * -3 + Bc)], ['matches the marked answer', A === q.a && Bc === q.b]] };
  };
  B['nth-term'] = q => {
    const { d, c } = q.dm, t = [1, 2, 3, 4].map(i => d * i + c), step = (d > 0 ? '+' : '−') + Math.abs(d);
    return { lines: [
      { kind: 'q', say: 'Here is the sequence.', math: t.map(n).join(',  ') + ', …' },
      { say: 'Find the difference between neighbouring terms.', math: [step, step, step].join('    ') },
      { say: `It ${d > 0 ? 'goes up' : 'goes down'} by ${Math.abs(d)} each time, so the nth term starts with ${cx(d, 'n')}.`, math: cx(d, 'n'), why: `A sequence that changes by ${n(d)} each time is linked to the ${n(d)} times table.` },
      { say: `Write out ${cx(d, 'n')} for n = 1, 2, 3, 4.`, math: [1, 2, 3, 4].map(i => n(d * i)).join(',  ') },
      { say: `Compare with the sequence. What do you add to ${n(d)} to get ${n(t[0])}?`, math: `${n(t[0])} − ${par(d)} = ${n(c)}` },
      { kind: 'answer', math: `nth term = ${lin(d, c, 'n')}` },
      { kind: 'check', say: 'Check with n = 3: it should give the 3rd term.', math: `${n(d)} × 3${c ? sg(c) : ''} = ${n(d * 3 + c)} ✓` },
      { kind: 'idea', say: 'The difference gives the number in front of n. Then adjust to match the first term.' }],
      checks: [['formula gives every term', t.every((v, i) => v === d * (i + 1) + c)], ['matches the marked answer', d === q.a && c === q.b]] };
  };
  B['frac-add'] = q => {
    const { a, b, sub } = q.dm, L = lcm(a[1], b[1]), fa = L / a[1], fb = L / b[1], an = a[0] * fa, bn = b[0] * fb, rn = sub ? an - bn : an + bn, g = gcd(rn, L), op = sub ? '−' : '+';
    const lines = [
      { kind: 'q', say: 'Here is the sum.', math: `${fr(a[0], a[1])} ${op} ${fr(b[0], b[1])}` },
      { say: `The bottoms are different, so find a common denominator: the lowest common multiple of ${a[1]} and ${b[1]}.`, math: `LCM of ${a[1]} and ${b[1]} = ${L}`,
        why: 'You can only add or subtract pieces that are the same size.' }];
    for (const [f, k, nn] of [[a, fa, an], [b, fb, bn]]) if (k !== 1)
      lines.push({ say: `Multiply the top and bottom of ${f[0]}/${f[1]} by ${k}.`, math: `${fr(f[0], f[1])} = {${f[0]} [[× ${k}]]/${f[1]} [[× ${k}]]} = ${fr(nn, L)}`, why: 'Multiplying top and bottom by the same number gives an equal fraction.' });
    lines.push({ say: `Now the bottoms match, so ${sub ? 'subtract' : 'add'} the tops. The bottom stays ${L}.`, math: `${fr(an, L)} ${op} ${fr(bn, L)} = ${fr(rn, L)}`, why: 'The bottom says how big each piece is. That does not change.' });
    if (g > 1) lines.push({ say: `${rn} and ${L} can both be divided by ${g}.`, math: `{${rn} [[÷ ${g}]]/${L} [[÷ ${g}]]} = ${fr(rn / g, L / g)}` });
    lines.push({ kind: 'answer', math: `${fr(a[0], a[1])} ${op} ${fr(b[0], b[1])} = ${fr(rn / g, L / g)}` },
      { kind: 'idea', say: 'Same denominators first, then add or subtract the tops only.', why: 'Common slip: adding the bottoms too. 1/3 + 1/4 is not 2/7.' });
    return { lines, checks: [['equivalent fractions are equal', an * a[1] === a[0] * L && bn * b[1] === b[0] * L],
      ['answer equals the exact sum', (rn / g) * a[1] * b[1] === (sub ? a[0] * b[1] - b[0] * a[1] : a[0] * b[1] + b[0] * a[1]) * (L / g)],
      ['fully simplified', gcd(rn / g, L / g) === 1], ['matches the marked answer', rn / g === q.n && L / g === q.d]] };
  };
  B['frac-mul'] = q => {
    const { a, b, div } = q.dm, bb = div ? [b[1], b[0]] : b, rn = a[0] * bb[0], rd = a[1] * bb[1], g = gcd(rn, rd);
    const lines = [{ kind: 'q', say: 'Here is the calculation.', math: `${fr(a[0], a[1])} ${div ? '÷' : '×'} ${fr(b[0], b[1])}` }];
    if (div) lines.push({ say: 'To divide by a fraction: keep the first, change ÷ to ×, flip the second.', math: `${fr(a[0], a[1])} [[×]] [[${fr(bb[0], bb[1])}]]`, why: 'Dividing by a fraction is the same as multiplying by its reciprocal.' });
    lines.push({ say: 'Multiply the tops together and the bottoms together.', math: `{${a[0]} × ${bb[0]}/${a[1]} × ${bb[1]}} = ${fr(rn, rd)}`, why: 'With × you do not need a common denominator.' });
    if (g > 1) lines.push({ say: `${rn} and ${rd} can both be divided by ${g}.`, math: `{${rn} [[÷ ${g}]]/${rd} [[÷ ${g}]]} = ${fr(rn / g, rd / g)}` });
    lines.push({ kind: 'answer', math: `${fr(a[0], a[1])} ${div ? '÷' : '×'} ${fr(b[0], b[1])} = ${fr(rn / g, rd / g)}` },
      { kind: 'idea', say: div ? 'Keep, change, flip, then multiply.' : 'Top × top, bottom × bottom, then simplify.' });
    const tn = div ? a[0] * b[1] : a[0] * b[0], td = div ? a[1] * b[0] : a[1] * b[1];
    return { lines, checks: [['answer equals the exact result', (rn / g) * td === tn * (rd / g)], ['fully simplified', gcd(rn / g, rd / g) === 1], ['matches the marked answer', rn / g === q.n && rd / g === q.d]] };
  };
  B['ratio-share'] = q => {
    const { a, b, tot, part, name } = q.dm, one = tot / (a + b), ans = part * one, other = (a + b - part) * one;
    return { lines: [
      { kind: 'q', say: `£${tot} is shared in the ratio ${a}:${b}.`, math: `${a} : ${b}` },
      { say: 'Add the parts to find how many equal shares there are.', math: `${a} + ${b} = ${a + b} parts` },
      { say: 'Find the value of one part.', math: `£${tot} ÷ ${a + b} = £${n(one)}`, why: 'Each part is the same size, so share the total equally between them.' },
      { say: `${name} gets ${part} part${part === 1 ? '' : 's'}.`, math: `${part} × £${n(one)} = £${n(ans)}` },
      { kind: 'answer', math: `${name} gets £${n(ans)}` },
      { kind: 'check', say: 'Check: the two shares should add back to the total.', math: `£${n(ans)} + £${n(other)} = £${n(ans + other)} ✓` },
      { kind: 'idea', say: 'Total parts → one part → multiply.' }],
      checks: [['shares add to the total', near(ans + other, tot)], ['matches the marked answer', near(ans, q.v)]] };
  };
  B.pythag = q => {
    const { a, hyp } = q.dm, other = hyp ? q.dm.b : q.dm.c, s = hyp ? a * a + other * other : other * other - a * a, r = Math.sqrt(s), exact = Number.isInteger(r), ans = exact ? r : Math.round(r * 10) / 10;
    const lab = hyp ? { a: a + ' cm', b: other + ' cm', c: '?' } : { a: a + ' cm', b: '?', c: other + ' cm' };
    const lines = [
      { kind: 'q', say: hyp ? 'We know the two shorter sides and need the longest side, the hypotenuse.' : 'We know the hypotenuse and one shorter side.', fig: FIG.rtri(lab.a, lab.b, lab.c) },
      { say: 'Pythagoras links the three sides of a right-angled triangle. c is the hypotenuse, opposite the right angle.', math: 'a² + b² = c²', why: 'It only works for right-angled triangles.' }];
    if (hyp) lines.push({ say: 'Put the numbers in.', math: `c² = ${a}² + ${other}²` }, { say: 'Square each side, then add.', math: `c² = ${a * a} + ${other * other} = ${s}` }, { say: 'Square root to undo the square.', math: `c = √${s}` });
    else lines.push({ say: 'We need a shorter side, so subtract.', math: `b² = c² − a²`, why: 'Rearrange: take a² from both sides.' }, { say: 'Put the numbers in.', math: `b² = ${other}² − ${a}² = ${other * other} − ${a * a} = ${s}` }, { say: 'Square root to undo the square.', math: `b = √${s}` });
    lines.push({ kind: 'answer', math: `${hyp ? 'c' : 'b'} = ${exact ? r : r.toFixed(3) + '… = ' + ans} cm${exact ? '' : ' (1 d.p.)'}` },
      { kind: 'check', say: hyp ? 'Check: the hypotenuse must be the longest side.' : 'Check: the answer must be shorter than the hypotenuse.', math: hyp ? `${ans} > ${Math.max(a, other)} ✓` : `${ans} < ${other} ✓` },
      { kind: 'idea', say: 'Finding the longest side: add the squares. Finding a shorter side: subtract.' });
    return { lines, checks: [['square root is right', near(r * r, s)], ['answer is sensible', hyp ? ans > Math.max(a, other) : ans < other && ans > 0], ['matches the marked answer', near(ans, q.v)]] };
  };
  B['pct-of'] = q => {
    const { p, amt } = q.dm, ten = amt / 10, tens = Math.floor(p / 10), five = p % 10 === 5, ans = amt * p / 100;
    const lines = [{ kind: 'q', say: 'Find 10% first: it is the easiest building block.', math: `10% of ${amt} = ${amt} ÷ 10 = ${n(ten)}`, why: '10% is one tenth, so divide by 10.' }];
    if (tens > 1) lines.push({ say: `${tens * 10}% is ${tens} lots of 10%.`, math: `${tens * 10}% = ${tens} × ${n(ten)} = ${n(tens * ten)}` });
    if (five) lines.push({ say: '5% is half of 10%.', math: `5% = ${n(ten)} ÷ 2 = ${n(ten / 2)}` });
    if (five && tens) lines.push({ say: `Add them to make ${p}%.`, math: `${p}% = ${n(tens * ten)} + ${n(ten / 2)} = ${n(tens * ten + ten / 2)}` });
    lines.push({ kind: 'answer', math: `${p}% of ${amt} = ${n(ans)}` },
      { kind: 'check', say: 'Check with a multiplier.', math: `${n(p / 100)} × ${amt} = ${n(ans)} ✓` },
      { kind: 'idea', say: 'Build any percentage from 10%, 5% and 1%.' });
    return { lines, checks: [['building blocks add up', near(tens * ten + (five ? ten / 2 : 0), ans)], ['matches the marked answer', near(ans, q.v)]] };
  };

  B['frac-of'] = q => {
    const { k, d, amt } = q.dm, one = amt / d, ans = one * k;
    return { lines: [
      { kind: 'q', say: `Find ${k}/${d} of ${amt}.`, math: `{${k}/${d}} of ${amt}` },
      { say: 'Divide by the bottom number to find one part.', math: `${amt} ÷ ${d} = ${n(one)}`, why: `The bottom number says how many equal parts to split ${amt} into.` },
      { say: `Multiply by the top number: we want ${k} of those parts.`, math: `${n(one)} × ${k} = ${n(ans)}` },
      { kind: 'answer', math: `{${k}/${d}} of ${amt} = ${n(ans)}` },
      { kind: 'check', say: 'Check with a calculator.', math: `${k} ÷ ${d} × ${amt} = ${n(k / d * amt)} ✓` },
      { kind: 'idea', say: 'Divide by the bottom, times by the top.' }],
      checks: [['both methods agree', near(k / d * amt, ans)], ['matches the marked answer', near(ans, q.v)]] };
  };
  B['pct-incdec'] = q => {
    const { p, up, amt } = q.dm, pc = up ? 100 + p : 100 - p, m = pc / 100, ans = amt * m, part = amt * p / 100, alt = up ? amt + part : amt - part;
    return { lines: [
      { kind: 'q', say: `${up ? 'Increase' : 'Decrease'} £${amt} by ${p}%.`, math: `£${amt} ${up ? '+' : '−'} ${p}%` },
      { say: 'Find the multiplier. The original amount is 100%.', math: `100% ${up ? '+' : '−'} ${p}% = ${pc}% = ${n(m)}`, why: 'Percent means out of 100, so divide by 100 to turn it into a multiplier.' },
      { say: 'Multiply the original by the multiplier.', math: `£${amt} × ${n(m)} = £${money(ans)}` },
      { kind: 'answer', math: `£${money(ans)}` },
      { kind: 'check', say: `Check another way: find ${p}% and ${up ? 'add it on' : 'take it off'}.`, math: `${p}% of £${amt} = £${money(part)}` },
      { kind: 'check', math: `£${amt} ${up ? '+' : '−'} £${money(part)} = £${money(alt)} ✓` },
      { kind: 'idea', say: `One multiplication does it: an increase multiplies by more than 1, a decrease by less than 1.` }],
      checks: [['both methods agree', near(ans, alt)], ['matches the marked answer', near(ans, q.v)]] };
  };
  B['pct-change'] = q => {
    const { o, nw, up } = q.dm, c = Math.abs(nw - o), p = c / o * 100, m = up ? 1 + p / 100 : 1 - p / 100;
    return { lines: [
      { kind: 'q', say: `The price goes from £${o} to £${nw}.`, math: `£${o} → £${nw}` },
      { say: 'Find the change.', math: up ? `${nw} − ${o} = ${c}` : `${o} − ${nw} = ${c}` },
      { say: 'Divide the change by the ORIGINAL amount, then multiply by 100.', math: `${c} ÷ ${o} × 100 = ${n(p)}%`, why: 'Percentage change always compares with where you started.' },
      { kind: 'answer', math: `${n(p)}% ${up ? 'increase' : 'decrease'}` },
      { kind: 'check', say: `Check: ${up ? 'increase' : 'decrease'} £${o} by ${n(p)}%.`, math: `£${o} × ${n(m)} = £${n(o * m)} ✓` },
      { kind: 'idea', say: 'Change ÷ original × 100.', why: 'Common slip: dividing by the new amount instead of the original.' }],
      checks: [['gets back to the new price', near(o * m, nw)], ['matches the marked answer', near(p, q.v)]] };
  };
  B['ratio-simp'] = q => {
    const { p, q: r, k } = q.dm, A = p * k, Bv = r * k;
    return { lines: [
      { kind: 'q', say: 'Here is the ratio.', math: `${A} : ${Bv}` },
      { say: 'Find the highest common factor: the biggest number that divides into both.', math: `HCF of ${A} and ${Bv} = ${k}` },
      { say: `Divide both sides by ${k}.`, math: `${A} [[÷ ${k}]] : ${Bv} [[÷ ${k}]] = ${p} : ${r}`, why: 'Dividing both parts by the same number keeps the ratio the same.' },
      { kind: 'answer', math: `${p} : ${r}` },
      { kind: 'check', say: `Only 1 divides into both ${p} and ${r}, so it is fully simplified.`, math: `HCF of ${p} and ${r} = 1 ✓` },
      { kind: 'idea', say: 'Divide both parts by the highest common factor in one go.' }],
      checks: [['HCF is right', gcd(A, Bv) === k], ['fully simplified', gcd(p, r) === 1], ['matches the marked answer', q.parts[0] === p && q.parts[1] === r]] };
  };
  B.negatives = q => {
    const twoNeg = q.q.includes('(−'), [s, b] = q.dm.line, e = s + b;
    const lines = twoNeg ? [
      { kind: 'q', say: 'Here is the calculation.', math: `${s} − (−${b})` },
      { say: 'Subtracting a negative is the same as adding.', math: `${s} [[− (−]]${b}[[)]] = ${s} [[+]] ${b}`, why: 'Taking away a debt leaves you better off.' }]
      : [{ kind: 'q', say: 'Here is the calculation.', math: `${n(s)} + ${b}` }];
    lines.push({ say: `Start at ${n(s)} and move ${b} to the right.`, fig: FIG.numline(s, e) },
      { kind: 'answer', math: `${twoNeg ? `${s} − (−${b})` : `${n(s)} + ${b}`} = ${n(e)}` },
      { kind: 'check', say: 'Check by going back.', math: `${n(e)} − ${b} = ${n(e - b)} ✓` },
      { kind: 'idea', say: 'Adding moves right on the number line, subtracting moves left. Two minus signs together make a plus.' });
    return { lines, checks: [['going back returns to the start', e - b === s], ['matches the marked answer', near(e, q.v)]] };
  };
  B.substitute = q => {
    const { a, b, p, q: k, sq } = q.dm, t1 = sq ? a * a : p * a, t2 = k * b, v = t1 + t2;
    return { lines: [
      { kind: 'q', say: `a = ${n(a)} and b = ${n(b)}.`, math: sq ? `a² + ${k}b` : `${p}a + ${k}b` },
      { say: 'Replace each letter with its value. Put negatives in brackets.', math: sq ? `${par(a)}² + ${k} × ${par(b)}` : `${p} × ${par(a)} + ${k} × ${par(b)}`, why: `${k}b means ${k} × b.` },
      { say: sq ? 'Square first, then multiply.' : 'Do the multiplications first.', math: `${n(t1)} + ${par(t2)}`, why: sq && a < 0 ? 'A negative squared is positive: negative × negative.' : 'BIDMAS: multiplication before addition.' },
      { kind: 'answer', math: `= ${n(v)}` },
      { kind: 'idea', say: 'Swap letters for numbers in brackets, then follow BIDMAS.' }],
      checks: [['matches the marked answer', near(v, q.v)]] };
  };
  B.area = q => {
    const { shape, b, h } = q.dm;
    if (shape === 'tri') { const v = b * h / 2;
      return { lines: [
        { kind: 'q', say: 'Sketch it and label what you know.', fig: FIG.tri(b, h) },
        { say: 'The formula for the area of a triangle:', math: 'Area = ½ × base × height', why: 'A triangle is exactly half of a rectangle with the same base and height.' },
        { say: 'Substitute.', math: `Area = ½ × ${b} × ${h}` },
        { say: 'Multiply, then halve.', math: `${b} × ${h} = ${b * h},   ${b * h} ÷ 2 = ${n(v)}` },
        { kind: 'answer', math: `Area = ${n(v)} cm²` },
        { kind: 'check', say: 'Area is measured in square units, because cm × cm = cm².', math: 'cm × cm = cm² ✓' },
        { kind: 'idea', say: 'Use the perpendicular height: the one at right angles to the base.' }],
        checks: [['halving a rectangle agrees', near(v * 2, b * h)], ['matches the marked answer', near(v, q.v)]] }; }
    const a = q.dm.a, v = (a + b) * h / 2, split = a * h + (b - a) * h / 2;
    return { lines: [
      { kind: 'q', say: 'Sketch it and label what you know.', fig: FIG.trap(a, b, h) },
      { say: 'The formula for the area of a trapezium:', math: 'Area = ½ × (a + b) × h', why: 'It is the average of the two parallel sides, times the height.' },
      { say: 'Substitute.', math: `Area = ½ × (${a} + ${b}) × ${h}` },
      { say: 'Brackets first.', math: `= ½ × ${a + b} × ${h}` },
      { say: 'Multiply, then halve.', math: `${a + b} × ${h} = ${(a + b) * h},   ÷ 2 = ${n(v)}` },
      { kind: 'answer', math: `Area = ${n(v)} cm²` },
      { kind: 'check', say: 'Check: split it into a rectangle and a triangle.', math: `${a} × ${h} + ½ × ${b - a} × ${h} = ${n(split)} ✓` },
      { kind: 'idea', say: 'Add the parallel sides, halve, times the height.' }],
      checks: [['rectangle + triangle agrees', near(split, v)], ['matches the marked answer', near(v, q.v)]] };
  };
  B.circles = q => {
    const { r, useD, area } = q.dm, d = 2 * r, v = area ? Math.PI * r * r : Math.PI * d, ans = Math.round(v * 10) / 10, est = area ? 3 * r * r : 3 * d;
    const lines = [{ kind: 'q', say: 'Sketch it and label what you know.', fig: FIG.circle(r, useD) }];
    if (area) { if (useD) lines.push({ say: 'Area uses the radius, so halve the diameter.', math: `r = ${d} ÷ 2 = ${r} cm` });
      lines.push({ say: 'The formula for the area of a circle:', math: 'A = π × r²', why: 'r² means r × r. Square the radius before multiplying by π.' }, { say: 'Substitute.', math: `A = π × ${r}² = π × ${r * r}` }); }
    else { if (!useD) lines.push({ say: 'Circumference uses the diameter, so double the radius.', math: `d = 2 × ${r} = ${d} cm` });
      lines.push({ say: 'The formula for the circumference:', math: 'C = π × d', why: 'The distance round any circle is just over 3 diameters.' }, { say: 'Substitute.', math: `C = π × ${d}` }); }
    lines.push({ say: 'Use the π button on your calculator.', math: `= ${v.toFixed(3)}…` },
      { say: 'Round to 1 decimal place: look at the second decimal place.', math: `${v.toFixed(3)}… ≈ ${ans.toFixed(1)}`, why: 'If the next digit is 5 or more, round up. Otherwise, round down.' },
      { kind: 'answer', math: `${area ? 'A' : 'C'} = ${ans.toFixed(1)} ${area ? 'cm²' : 'cm'}` },
      { kind: 'check', say: 'Estimate with π ≈ 3: the answer should be a bit more than this.', math: `3 × ${area ? r * r : d} = ${est}, and ${ans.toFixed(1)} is a bit more ✓` },
      { kind: 'idea', say: area ? 'Area: π × r². Units are squared.' : 'Circumference: π × d.' });
    return { lines, checks: [['rounding is right', near(ans, Number(v.toFixed(1)))], ['passes the estimate', ans > est && ans < est * 1.1], ['matches the marked answer', near(ans, q.v)]] };
  };
  B.angles = q => {
    const D = q.dm;
    if (D.f === 'poly') { const ext = 360 / D.k, int = 180 - ext, sum = (D.k - 2) * 180;
      const lines = [{ kind: 'q', say: `A regular ${D.name} has ${D.k} equal sides and ${D.k} equal angles.`, fig: FIG.poly(D.k) },
        { say: 'The exterior angles of any polygon add up to 360°.', math: `exterior = 360° ÷ ${D.k} = ${n(ext)}°`, why: 'Walk all the way round the shape and you turn through one full turn.' }];
      if (D.inner) lines.push({ say: 'Interior and exterior angles sit on a straight line, so they add to 180°.', math: `interior = 180° − ${n(ext)}° = ${n(int)}°` });
      lines.push({ kind: 'answer', math: `${D.inner ? 'interior' : 'exterior'} angle = ${n(D.inner ? int : ext)}°` },
        { kind: 'check', say: 'Check with the sum of interior angles: (n − 2) × 180°.', math: `(${D.k} − 2) × 180 = ${sum},   ${sum} ÷ ${D.k} = ${n(sum / D.k)}° interior ✓` },
        { kind: 'idea', say: 'Start with the exterior angle: 360 ÷ number of sides.' });
      return { lines, checks: [['two methods agree', near(sum / D.k, int)], ['matches the marked answer', near(D.inner ? int : ext, q.v)]] }; }
    const total = D.f === 'point' ? 360 : 180, known = D.f === 'tri' ? [D.a, D.b] : D.f === 'line' ? [D.a] : [D.a, D.b, D.c], x = total - known.reduce((s, v) => s + v, 0);
    const rule = { tri: 'Angles in a triangle add up to 180°.', line: 'Angles on a straight line add up to 180°.', point: 'Angles around a point add up to 360°.' }[D.f];
    return { lines: [
      { kind: 'q', say: 'Sketch it and mark the angle you need as x.', fig: D.f === 'tri' ? FIG.tri3(D.a, D.b) : D.f === 'line' ? FIG.line(D.a) : FIG.point(known) },
      { say: rule, math: `${known.map(v => v + '°').join(' + ')} + x = ${total}°`, why: 'Write the rule as words in an exam: it earns the reasoning mark.' },
      { say: 'Take the angles you know away from the total.', math: `x = ${total}° − ${known.map(v => v + '°').join(' − ')}` },
      { kind: 'answer', math: `x = ${x}°` },
      { kind: 'check', say: 'Check: all the angles should add to the total.', math: `${[...known, x].join(' + ')} = ${known.reduce((s, v) => s + v, x)} ✓` },
      { kind: 'idea', say: 'Find the rule, write it down, then subtract.' }],
      checks: [['angles add to the total', known.reduce((s, v) => s + v, x) === total && x > 0], ['matches the marked answer', near(x, q.v)]] };
  };
  B.averages = q => {
    const { k, xs } = q.dm, s = xs.reduce((a, b) => a + b, 0), so = [...xs].sort((a, b) => a - b), mid = (so.length - 1) / 2;
    const c = v => xs.filter(w => w === v).length, mode = xs.find(v => c(v) === Math.max(...xs.map(c)));
    const L = { mean: () => [
        { say: 'Add all the values.', math: `${xs.join(' + ')} = ${s}` },
        { say: `Divide by how many values there are: ${xs.length}.`, math: `${s} ÷ ${xs.length} = ${n(s / xs.length)}`, why: 'The mean shares the total out equally.' }],
      median: () => [
        { say: 'Put the values in order, smallest first.', math: so.map((v, i) => i === mid ? `[[${v}]]` : v).join(',  '), why: 'The median is only the middle once the values are in order.' },
        { say: `There are ${so.length} values, so the middle one is number ${mid + 1}.`, math: `median = ${so[mid]}` }],
      mode: () => [{ say: 'Look for the value that appears most often.', math: xs.map(v => v === mode ? `[[${v}]]` : v).join(',  ') }, { say: `${mode} appears ${c(mode)} times.`, math: `mode = ${mode}` }],
      range: () => [{ say: 'Find the biggest and smallest values.', math: so.map((v, i) => i === 0 || i === so.length - 1 ? `[[${v}]]` : v).join(',  ') }, { say: 'Range = biggest − smallest.', math: `${so[so.length - 1]} − ${so[0]} = ${so[so.length - 1] - so[0]}` }] };
    const v = { mean: s / xs.length, median: so[mid], mode, range: so[so.length - 1] - so[0] }[k];
    const chk = { mean: [`${n(v)} × ${xs.length} = ${n(v * xs.length)}, which is the total ✓`, near(v * xs.length, s)],
      median: [`${mid} values below it and ${mid} above it ✓`, so.slice(0, mid).every(x => x <= v) && so.slice(mid + 1).every(x => x >= v)],
      mode: [`No other value appears ${c(mode)} times ✓`, xs.filter(x => x !== mode).every(x => c(x) < c(mode))],
      range: [`${so[0]} + ${v} = ${so[0] + v}, the biggest ✓`, so[0] + v === so[so.length - 1]] }[k];
    return { lines: [{ kind: 'q', say: `Find the ${k}.`, math: xs.join(',  ') }, ...L[k](), { kind: 'answer', math: `${k} = ${n(v)}` }, { kind: 'check', math: chk[0] },
      { kind: 'idea', say: 'Mean: add and share. Median: order, then middle. Mode: most often. Range: biggest − smallest.' }],
      checks: [['check holds', chk[1]], ['matches the marked answer', near(v, q.v)]] };
  };
  B.sdt = q => {
    const { f, s, t, d } = q.dm, ts = t === .5 ? '30 minutes' : Number.isInteger(t) ? `${t} hours` : `${Math.floor(t)} hours 30 minutes`;
    const [word, eq, sub, ans, unit] = { s: ['speed', 'speed = distance ÷ time', `${d} ÷ ${t}`, d / t, 'km/h'], d: ['distance', 'distance = speed × time', `${s} × ${t}`, s * t, 'km'], t: ['time', 'time = distance ÷ speed', `${d} ÷ ${s}`, d / s, 'hours'] }[f];
    const lines = [{ kind: 'q', say: `Cover the ${word} in the formula triangle to see what to do.`, fig: FIG.sdt(f), why: 'Side by side means multiply. One over the other means divide.' }];
    if (f !== 't' && !Number.isInteger(t)) lines.push({ say: 'Time must be in hours, as a decimal.', math: `${ts} = ${t} hours`, why: '30 minutes is half an hour, 0.5 — not 0.3.' });
    lines.push({ say: 'Write the formula.', math: eq }, { say: 'Substitute.', math: `${word} = ${sub}` },
      { kind: 'answer', math: `${word} = ${n(ans)} ${unit}` },
      { kind: 'check', say: 'Check: speed × time should give the distance.', math: `${s} × ${t} = ${n(s * t)} km ✓` },
      { kind: 'idea', say: 'D over S × T. Keep time in hours when speed is in km/h.' });
    return { lines, checks: [['speed × time = distance', near(s * t, d)], ['matches the marked answer', near(ans, q.v)]] };
  };
  B['std-form'] = q => {
    const { m, p, toOrd } = q.dm, v = clean(m * Math.pow(10, p)), ms = String(m), big = p > 0, f = n(Math.pow(10, Math.abs(p))), sf = `${ms} × 10${sup(p)}`;
    const lines = toOrd ? [
      { kind: 'q', say: 'Here is the number in standard form.', math: sf },
      { say: `10${sup(p)} means ${big ? '× ' + f : '÷ ' + f}.`, math: `${ms} ${big ? '×' : '÷'} ${f}`, why: big ? 'A positive power makes the number bigger.' : 'A negative power makes the number smaller.' },
      { say: `So the decimal point moves ${Math.abs(p)} place${Math.abs(p) > 1 ? 's' : ''} ${big ? 'right' : 'left'}.`, math: `${ms} ${big ? '×' : '÷'} ${f} = ${v}` },
      { kind: 'answer', math: `${v}` }] : [
      { kind: 'q', say: 'Here is the ordinary number.', math: `${v}` },
      { say: 'Standard form is A × 10ⁿ, where A is at least 1 and less than 10.', math: `A = ${ms}`, why: 'Put the decimal point after the first non-zero digit.' },
      { say: `How do we get from ${ms} to ${v}?`, math: `${ms} ${big ? '×' : '÷'} ${f} = ${v}` },
      { say: `${big ? '×' : '÷'} ${f} is ${big ? '' : '÷ '}10 to the power ${Math.abs(p)}, so n = ${p}.`, math: `n = ${p}` },
      { kind: 'answer', math: sf }];
    lines.push({ kind: 'check', say: 'Check: A is between 1 and 10.', math: `1 ≤ ${ms} < 10 ✓` }, { kind: 'idea', say: 'Big numbers have positive powers. Small numbers (less than 1) have negative powers.' });
    return { lines, checks: [['A is between 1 and 10', m >= 1 && m < 10], ['the two forms are equal', near(v, q.v)], ['digits move correctly', near(big ? m * Math.pow(10, p) : m / Math.pow(10, -p), v)]] };
  };
  B.prob = q => {
    const { cs, i, not, cols } = q.dm, tot = cs.reduce((a, b) => a + b, 0), num = not ? tot - cs[i] : cs[i], g = gcd(num, tot);
    const lines = [
      { kind: 'q', say: 'Picture the bag.', fig: FIG.bag(cs, cols) },
      { say: 'Count all the counters: these are all the possible outcomes.', math: `${cs.join(' + ')} = ${tot}` },
      not ? { say: `Count the ones that are not ${cols[i]}.`, math: `${tot} − ${cs[i]} = ${num}` } : { say: `Count the ${cols[i]} ones.`, math: `${cols[i]}: ${num}` },
      { say: 'Probability = number of ways it can happen ÷ total.', math: `P = ${fr(num, tot)}`, why: 'Every counter is equally likely to be picked.' }];
    if (g > 1) lines.push({ say: `Simplify: both divide by ${g}.`, math: `${fr(num, tot)} = ${fr(num / g, tot / g)}`, why: 'Simplifying is optional in probability, but both are right.' });
    lines.push({ kind: 'answer', math: `P = ${fr(num, tot)}${g > 1 ? ' = ' + fr(num / g, tot / g) : ''}` },
      { kind: 'check', say: 'Check: a probability must be between 0 and 1.', math: `0 ≤ ${fr(num, tot)} ≤ 1 ✓` },
      { kind: 'idea', say: 'What you want over the total.' });
    return { lines, checks: [['between 0 and 1', num >= 0 && num <= tot], ['matches the marked answer', num / g === q.n && tot / g === q.d]] };
  };
  B.compound = q => {
    const { P: p0, r, y } = q.dm, m = 1 + r / 100, fin = Math.round(p0 * Math.pow(m, y) * 100) / 100, simple = p0 + p0 * r / 100 * y, lines = [
      { kind: 'q', say: `£${p0} at ${r}% compound interest for ${y} years.`, math: `£${p0},  ${r}% a year,  ${y} years` },
      { say: 'Find the multiplier.', math: `1 + ${r} ÷ 100 = ${n(m)}`, why: `Keeping 100% and adding ${r}% gives ${100 + r}% = ${n(m)}.` }];
    let v = p0;
    for (let k = 1; k <= y; k++) { const nv = v * m; lines.push({ say: k === 1 ? 'Each year the interest is added on, and next year earns interest too.' : null, math: `Year ${k}:  £${v.toFixed(2)} × ${n(m)} = £${nv.toFixed(2)}` }); v = nv; }
    lines.push({ say: 'Quicker on a calculator: use a power.', math: `£${p0} × ${n(m)}${sup(y)} = £${fin.toFixed(2)}`, why: `${n(m)}${sup(y)} means multiply by ${n(m)} ${y} times.` },
      { kind: 'answer', math: `£${fin.toFixed(2)}` },
      { kind: 'check', say: 'Check: compound interest gives more than simple interest.', math: `simple: £${p0} + ${y} × £${money(p0 * r / 100)} = £${money(simple)} < £${fin.toFixed(2)} ✓` },
      { kind: 'idea', say: 'Original × multiplier to the power of the number of years.' });
    return { lines, checks: [['year by year agrees with the power', Math.abs(v - fin) < .006], ['more than simple interest', fin > simple], ['matches the marked answer', Math.abs(fin - q.v) < .006]] };
  };
  B.rounding = q => {
    const { x, dp, sf } = q.dm, s = String(x), digits = [...s].map((c, i) => [c, i]).filter(([c]) => c !== '.');
    let keep, ans, unit;
    if (dp != null) { const at = s.indexOf('.') + dp; keep = digits.findIndex(([, i]) => i === at); ans = Number(x.toFixed(dp)); unit = Math.pow(10, -dp); }
    else { const first = digits.findIndex(([c]) => c !== '0'); keep = first + sf - 1; ans = Number(x.toPrecision(sf)); unit = Math.pow(10, Math.floor(Math.log10(Math.abs(x))) - sf + 1); }
    const dec = digits[keep + 1] ? Number(digits[keep + 1][0]) : 0, mark = [...s].map((c, i) => digits[keep] && i === digits[keep][1] ? `[[${c}]]` : c).join(''), up = dec >= 5;
    const shown = dp != null ? ans.toFixed(dp) : String(ans);
    return { lines: [
      { kind: 'q', say: `Round to ${dp != null ? dp + ' decimal place' + (dp > 1 ? 's' : '') : sf + ' significant figure' + (sf > 1 ? 's' : '')}.`, math: s },
      { say: dp != null ? `Count ${dp} place${dp > 1 ? 's' : ''} after the decimal point. That is the last digit you keep.` : `Start at the first non-zero digit and count ${sf}. That is the last digit you keep.`, math: mark,
        why: dp == null ? 'Zeros at the start are not significant: they only hold the place.' : null },
      { say: `The digit after it is ${dec}, so ${up ? 'round up (5 or more)' : 'round down (4 or less)'}.`, math: `next digit: ${dec} → ${up ? 'up' : 'down'}` },
      dp == null && x >= 10 ? { say: 'Fill the gaps with zeros so the number stays the same size.', math: shown } : null,
      { kind: 'answer', math: `${s} ≈ ${shown}` },
      { kind: 'check', say: 'Check: the rounded number should be close to the original.', math: `${s} → ${shown}, a difference of ${n(Math.abs(ans - x))} ✓` },
      { kind: 'idea', say: 'Find the last digit you keep, look at the next one: 5 or more rounds up.' }].filter(Boolean),
      checks: [['within half a unit', Math.abs(ans - x) <= unit / 2 + 1e-9], ['rounded the right way', up ? Math.abs(ans) >= Math.abs(x) - 1e-12 : Math.abs(ans) <= Math.abs(x) + 1e-12], ['matches the marked answer', near(ans, q.v)]] };
  };

  /* ---------- Physics: every AQA equation in learn.js, forwards and rearranged ---------- */
  /* The display templates in learn.js are evaluated as arithmetic here, so the rearranged equation is
     checked independently of the value the generator picked. They are fixed strings in our own code. */
  const evalT = (tpl, v) => Function('"use strict";return (' + tpl.replace(/\{(\w+)\}/g, (_, k) => `(${v[k]})`).replace(/×/g, '*').replace(/÷/g, '/').replace(/½/g, '0.5').replace(/²/g, '**2').replace(/√/g, 'Math.sqrt') + ')')();
  const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => n(v[k]));
  const CIRCUIT = ['ohm', 'power-vi', 'power-ir', 'charge', 'energy-qv'];
  function picture(pid, all, v, find) {
    const lab = k => { const i = all.find(x => x[0] === k); return k === find ? '?' : `${n(v[k])} ${i[3]}`; }, has = k => all.some(i => i[0] === k);
    let f = null;
    if (CIRCUIT.includes(pid)) { const L = {}; for (const k of ['I', 'V', 'R']) if (has(k)) L[k] = lab(k);
      f = FIG.circuit(L, all.filter(i => !['I', 'V', 'R'].includes(i[0])).map(i => `${i[1]} = ${lab(i[0])}`).join('    ')); }
    else if (pid === 'wave') f = FIG.wave(lab('f'), lab('lam'));
    else if (pid === 'weight') f = FIG.force('down', { m: lab('m'), W: lab('W') });
    else if (pid === 'newton2') f = FIG.force('push', { m: lab('m'), F: lab('F'), a: lab('a') });
    else if (pid === 'work') f = FIG.force('push', { F: lab('F'), s: lab('s') });
    return f && { say: 'Sketch it and label what you know. The ? is what we need.', fig: f };
  }
  B.phys = q => {
    const { pid, v, find } = q.dm, e = LEARN.PEQ[pid], all = [e.out, ...e.ins], tgt = all.find(i => i[0] === find), known = all.filter(i => i[0] !== find), fwd = find === e.out[0];
    const tpl = fwd ? e.sub : e.re[find][1], got = evalT(tpl, v), back = { ...v, [find]: got };
    const lines = [
      { kind: 'q', say: 'Write down what you know, with units.', math: known.map(i => `${i[1]} = ${n(v[i[0]])} ${i[3]}`).join('    ') },
      { say: `We need the ${tgt[2]} (${tgt[1]}), measured in ${tgt[3]}.`, math: `${tgt[1]} = ?` },
      picture(pid, all, v, find),
      { say: `The equation that links ${all.map(i => i[2]).join(', ').replace(/, ([^,]*)$/, ' and $1')}:`, math: e.eq, why: 'Choose the equation that contains everything you know and the thing you need.' }];
    if (!fwd) lines.push({ say: `Rearrange to get ${tgt[1]} on its own.`, math: e.re[find][0], why: 'Do the same thing to both sides, exactly like solving an equation.' });
    lines.push({ say: 'Substitute the numbers in.', math: `${tgt[1]} = ${fill(tpl, v)}` },
      { kind: 'answer', say: 'Calculate, and always write the unit.', math: `${tgt[1]} = ${n(got)} ${tgt[3]}` });
    if (fwd) { const k = Object.keys(e.re)[0], ki = k && e.ins.find(i => i[0] === k);
      if (ki) lines.push({ kind: 'check', say: `Check by working backwards to the ${ki[2]}.`, math: `${e.re[k][0].split(' = ')[0]} = ${fill(e.re[k][1], back)} = ${n(evalT(e.re[k][1], back))} ${ki[3]} ✓` }); }
    else lines.push({ kind: 'check', say: `Check: put ${tgt[1]} = ${n(got)} back into ${e.eq}.`, math: `${e.out[1]} = ${fill(e.sub, back)} = ${n(evalT(e.sub, back))} ${e.out[3]} ✓` });
    lines.push({ kind: 'idea', say: 'Equation → rearrange → substitute → calculate → unit.' });
    const inv = fwd ? Object.keys(e.re).every(k => near(evalT(e.re[k][1], back), v[k])) : near(evalT(e.sub, back), v[e.out[0]]);
    return { lines: lines.filter(Boolean), checks: [['calculation is right', near(got, v[find])], ['works backwards to the given values', inv], ['unit matches', q.suf === tgt[3]], ['matches the marked answer', near(clean(got), q.v)]] };
  };

  /* ---------- Chemistry: balancing, one coefficient at a time, atom counts always shown ---------- */
  B['ce-balance'] = q => {
    const e = q.e, co = q.co, sp = [...e.l.map(f => ({ f, s: 1 })), ...e.r.map(f => ({ f, s: -1 }))].map(x => ({ ...x, m: CHEM.atoms(x.f) }));
    const els = [...new Set(sp.flatMap(x => Object.keys(x.m)))];
    const count = cur => els.map(el => [el, sp.reduce((t, x, j) => t + (x.s > 0 ? (x.m[el] || 0) * cur[j] : 0), 0), sp.reduce((t, x, j) => t + (x.s < 0 ? (x.m[el] || 0) * cur[j] : 0), 0)]);
    const eq = (cur, hi) => [e.l, e.r].map((side, si) => side.map((f, i) => { const j = si ? e.l.length + i : i, c = cur[j] > 1 ? String(cur[j]) : '';
      return (j === hi ? `[[${c || '1'}]] ` : c ? c + ' ' : '') + subs(f); }).join(' + ')).join(' → ');
    const cur = co.map(() => 1), ok = t => t.filter(r => r[1] === r[2]).map(r => r[0]);
    const lines = [
      { kind: 'q', say: e.w ? `Word equation: ${e.w}. Here are the formulae.` : 'Here is the unbalanced equation.', math: eq(cur) },
      { say: 'Count the atoms of each element on each side.', table: count(cur), why: 'Atoms are not made or destroyed in a reaction, so both sides must have the same number of each.' }];
    /* atoms that appear in only one formula per side are fixed first; lone elements like O₂ last */
    const order = sp.map((x, j) => j).filter(j => co[j] > 1).sort((i, j) => (Object.keys(sp[i].m).length === 1) - (Object.keys(sp[j].m).length === 1));
    if (!order.length) lines.push({ say: 'Every element already matches, so no big numbers are needed.', math: eq(cur) });
    for (const j of order) {
      const before = ok(count(cur)); cur[j] = co[j]; const t = count(cur), fixed = ok(t).filter(el => !before.includes(el));
      lines.push({ say: `Put a ${co[j]} in front of ${subs(sp[j].f)}${fixed.length ? ` to balance ${fixed.join(' and ')}` : ''}.`, math: eq(cur, j), table: t });
    }
    lines.push({ kind: 'answer', say: 'Every element now matches on both sides.', math: eq(co) });
    /* draw the atoms when it stays readable: no molecule over 12 atoms, no side over 40 */
    const size = j => Object.values(sp[j].m).reduce((a, b) => a + b, 0), side = s => sp.reduce((t, x, j) => t + (x.s === s ? size(j) * co[j] : 0), 0);
    if (sp.every((x, j) => size(j) <= 12) && side(1) <= 40) lines.push({ say: 'Here it is as particles. Count each colour on both sides.', fig: FIG.particles(e, co), why: 'The atoms are only rearranged into new substances. None appear or disappear.' });
    lines.push(
      { kind: 'idea', say: 'Only change the big numbers in front.', why: 'Changing a small number would make a different substance: H₂O is water, H₂O₂ is bleach.' });
    const t = count(co), g = co.reduce(gcd);
    return { lines, checks: [['atoms balance for every element', t.every(r => r[1] === r[2])], ['smallest whole numbers', g === 1 && co.every(c => Number.isInteger(c) && c >= 1)],
      ['matches the marked answer', String(CHEM.solve(e)) === String(co)]] };
  };

  /* ---------- Any other question with worked steps: play those steps as written ---------- */
  /* Recalculate every "sum = sum = number" chain written in the steps. A piece counts only if it is pure
     arithmetic (after a leading £ and a trailing unit); words, letters and labels like "30%" are skipped. */
  const UNIT = /\s*(cm²|cm|km\/h|km|m\/s|hours|°)$/;
  function arith(piece, last) {
    let s = piece.trim().replace(/^£/, '').replace(UNIT, '');
    if (last) s = s.replace(/%$/, '');
    if (!s || !/^[\d\s.+\−×÷()²\/-]+$/.test(s) || !/\d/.test(s)) return null;
    try { const v = Function('"use strict";return (' + s.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/(\d|\))²/g, '$1**2') + ')')(); return Number.isFinite(v) ? v : null; } catch (e) { return null; }
  }
  function sums(steps) {
    let checked = 0, wrong = [];
    for (const st of steps) for (const part of st.split(/   and   |, so /)) {
      const chain = part.slice(part.lastIndexOf(': ') + 1).split(' = '), vals = chain.map((p, j) => /…/.test(p) ? null : arith(p, j === chain.length - 1));
      /* a written value with k decimals may be the exact value rounded to k decimals */
      const dp = p => { const m = p.trim().match(/^£?−?\d*\.(\d+)\D*$/); return m ? m[1].length : null; }, ok = (a, b, p) => near(a, b) || (dp(p) != null && Math.abs(a - b) <= .5 * Math.pow(10, -dp(p)) + 1e-9);
      for (let j = 1; j < vals.length; j++) if (vals[j] != null && vals[j - 1] != null) { checked++; if (!ok(vals[j - 1], vals[j], chain[j]) && !ok(vals[j], vals[j - 1], chain[j - 1])) wrong.push(chain.slice(j - 1, j + 1).join(' = ')); }
    }
    return { checked, wrong };
  }
  function fromSteps(q) {
    const lines = q.steps.map(s => { const i = s.indexOf(': '); return i > 0 && i < 60 ? { say: s.slice(0, i) + ':', math: s.slice(i + 2) } : { math: s }; });
    lines.unshift({ kind: 'q', say: 'Here is the question.', math: q.q });
    lines.push({ kind: 'answer', math: q.show });
    const S = sums(q.steps), checks = S.wrong.map(w => ['sum is right: ' + w, false]);
    /* steps with real arithmetic that all adds up earn the checked badge; steps with none play as written */
    return S.checked && !S.wrong.length ? { lines, checks: [['every written sum recalculated (' + S.checked + ')', true]], source: 'sums' } : { lines, checks, source: 'steps' };
  }

  const pick = q => B[q.id] || (q.id && q.id.startsWith('p-') && q.dm ? B.phys : null);
  /* Returns null when there is nothing worth animating; ok is false when a check failed, and then the board is never shown. */
  function build(q) {
    if (!q || q.kind === 'mcq' || q.kind === 'def' || q.kind === 'word') return null;
    const f = pick(q);
    let d = null;
    try { d = f && (q.dm || q.co) ? f(q) : null; } catch (err) { d = { lines: [], checks: [['built without errors', false]] }; }
    if (!d) { if (!q.steps || !q.steps.length) return null; d = fromSteps(q); }
    const subj = LEARN.SUBJECTS.find(s => s.topics.includes(q.id));
    return { id: q.id, topic: q.sub || LEARN.name(q.id), subject: subj ? subj.name : '', question: q.q, lines: d.lines, checks: d.checks,
      source: d.source || 'verified', ok: d.checks.every(c => c[1]) && d.lines.length > 0 };
  }

  /* Run from the console: every verified builder, 300 fresh questions each; every other topic must build or skip cleanly. */
  function selfTest(per = 300) {
    const topics = [...new Set(LEARN.SUBJECTS.flatMap(s => s.topics).concat(LEARN.PHYS))], out = { verified: 0, sums: 0, steps: 0, none: 0, bad: [] };
    for (const id of topics) for (let i = 0; i < per; i++) {
      const q = LEARN.gen(id); if (!q) break;
      const d = build(q); if (!d) { out.none++; continue; }
      out[d.source]++;
      const empty = d.lines.some(l => !l.say && !l.math && !l.table && !l.fig), noAns = !d.lines.some(l => l.kind === 'answer');
      if ((!d.ok || empty || noAns) && out.bad.length < 20) out.bad.push([id, q.q, d.checks.filter(c => !c[1]).map(c => c[0]).join(', ') || (empty ? 'empty line' : 'no answer line')]);
    }
    return out;
  }
  return { build, selfTest, builders: Object.keys(B) };
})();
