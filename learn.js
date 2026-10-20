/* Archeron · Learn engine. Questions are generated and their answers computed, so every
   question is new and every answer is right by construction. No DOM code in here. */
'use strict';
const LEARN = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  const clean = x => Number(x.toPrecision(10));
  const n = x => String(clean(x)).replace('-', '−');
  const money = x => Number.isInteger(clean(x)) ? String(clean(x)) : clean(x).toFixed(2);
  const simp = (a, b) => { const g = gcd(a, b), s = b < 0 ? -1 : 1; return [s * a / g, s * b / g]; };
  const fs = (a, b) => b === 1 ? n(a) : `${n(a)}/${b}`;
  const sg = x => (x < 0 ? ' − ' : ' + ') + Math.abs(x);
  const par = x => x < 0 ? `(${n(x)})` : n(x);
  const lin = (a, b, v) => (a === 1 ? '' : a === -1 ? '−' : n(a)) + v + (b ? sg(b) : '');
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const sup = p => String(p).split('').map(c => SUP[c]).join('');
  const frac = () => { const d = ri(2, 9); let k; do k = ri(1, d - 1); while (gcd(k, d) !== 1); return [k, d]; };

  /* ---------- Maths: AQA Foundation, weighted to what secures a grade 4 ---------- */
  const M = {};
  const T = (id, name, gen) => { M[id] = { name, gen }; };
  const work = (expr, v, steps, dm) => ({ q: `Work out ${expr}`, kind: 'num', v, show: n(v), steps, dm });

  T('pct-of', 'Percentage of an amount', () => {
    const p = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 65, 70, 75, 80, 90]), amt = ri(2, 30) * 20, a = amt / 10, ans = amt * p / 100;
    const tens = Math.floor(p / 10), five = p % 10 === 5, steps = [`10% of ${amt} = ${amt} ÷ 10 = ${n(a)}`];
    if (tens > 1) steps.push(`${tens * 10}% = ${tens} × ${n(a)} = ${n(tens * a)}`);
    if (five) steps.push(`5% = half of 10% = ${n(a / 2)}`);
    if (five && tens) steps.push(`${p}% = ${n(tens * a)} + ${n(a / 2)} = ${n(ans)}`);
    steps.push(`Calculator check: ${p / 100} × ${amt} = ${n(ans)}`);
    return { q: `Find ${p}% of ${amt}.`, kind: 'num', v: ans, dm: { p, amt }, show: n(ans), steps };
  });
  T('pct-incdec', 'Increase or decrease by a %', () => {
    const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), up = Math.random() < .5, amt = ri(4, 60) * 10, pc = 100 + (up ? p : -p), m = pc / 100, ans = clean(amt * pc / 100);
    return { q: `${up ? 'Increase' : 'Decrease'} £${amt} by ${p}%.`, kind: 'num', v: ans, dm: { p, up, amt }, pre: '£', show: '£' + money(ans), tol: .005,
      steps: [`Multiplier: 100% ${up ? '+' : '−'} ${p}% = ${pc}% = ${n(m)}`, `£${amt} × ${n(m)} = £${money(ans)}`] };
  });
  T('pct-change', 'Percentage change', () => {
    for (;;) {
      const o = pick([20, 25, 40, 50, 60, 80, 120, 160, 200, 250, 400]), p = pick([5, 10, 20, 25, 30, 40, 50, 60, 75]), up = Math.random() < .6, c = o * p / 100;
      if (!Number.isInteger(c)) continue;
      const nw = up ? o + c : o - c;
      return { q: `A price ${up ? 'rises' : 'falls'} from £${o} to £${nw}. Find the percentage ${up ? 'increase' : 'decrease'}.`, kind: 'num', v: p, dm: { o, nw, up }, suf: '%', show: p + '%',
        steps: [`Change = ${up ? nw + ' − ' + o : o + ' − ' + nw} = ${c}`, 'Percentage change = change ÷ original × 100', `= ${c} ÷ ${o} × 100 = ${p}%`] };
    }
  });
  T('frac-of', 'Fraction of an amount', () => {
    const [k, d] = (() => { const d = pick([3, 4, 5, 6, 8, 10]); let k; do k = ri(1, d - 1); while (gcd(k, d) !== 1); return [k, d]; })();
    const amt = d * ri(3, 15), one = amt / d, ans = one * k;
    return { q: `Find ${k}/${d} of ${amt}.`, kind: 'num', v: ans, dm: { k, d, amt }, show: n(ans), steps: [`Divide by the bottom: ${amt} ÷ ${d} = ${one}`, `Multiply by the top: ${one} × ${k} = ${ans}`] };
  });
  T('frac-add', 'Adding and subtracting fractions', () => {
    let a = frac(), b = frac(); while (a[1] === b[1]) b = frac();
    const sub = Math.random() < .4; if (sub && a[0] / a[1] < b[0] / b[1]) [a, b] = [b, a];
    const L = lcm(a[1], b[1]), an = a[0] * L / a[1], bn = b[0] * L / b[1], rn = sub ? an - bn : an + bn, [sn, sd] = simp(rn, L), op = sub ? '−' : '+';
    const steps = [`Common denominator: ${L}`, `${a[0]}/${a[1]} = ${an}/${L}   and   ${b[0]}/${b[1]} = ${bn}/${L}`, `${an}/${L} ${op} ${bn}/${L} = ${rn}/${L}`];
    if (sd !== L) steps.push(`Simplify: ${rn}/${L} = ${fs(sn, sd)}`);
    return { q: `Work out ${a[0]}/${a[1]} ${op} ${b[0]}/${b[1]}. Give your answer in its simplest form.`, kind: 'frac', dm: { a, b, sub }, n: sn, d: sd, show: fs(sn, sd), hint: 'Type a fraction like 7/12', steps };
  });
  T('frac-mul', 'Multiplying and dividing fractions', () => {
    const a = frac(), b = frac(), div = Math.random() < .5, bb = div ? [b[1], b[0]] : b, rn = a[0] * bb[0], rd = a[1] * bb[1], [sn, sd] = simp(rn, rd);
    const steps = [];
    if (div) steps.push(`Keep, change, flip: ${a[0]}/${a[1]} ÷ ${b[0]}/${b[1]} = ${a[0]}/${a[1]} × ${bb[0]}/${bb[1]}`);
    steps.push(`Multiply the tops and the bottoms: (${a[0]} × ${bb[0]})/(${a[1]} × ${bb[1]}) = ${rn}/${rd}`);
    if (sd !== rd) steps.push(`Simplify: ${rn}/${rd} = ${fs(sn, sd)}`);
    return { q: `Work out ${a[0]}/${a[1]} ${div ? '÷' : '×'} ${b[0]}/${b[1]}. Give your answer in its simplest form.`, kind: 'frac', dm: { a, b, div }, n: sn, d: sd, show: fs(sn, sd), hint: 'Type a fraction like 5/8', steps };
  });
  T('ratio-share', 'Sharing in a ratio', () => {
    let a, b; do { a = ri(1, 7); b = ri(1, 7); } while (a === b || gcd(a, b) !== 1);
    const k = ri(2, 20), tot = (a + b) * k, who = pick([['Amy', 'Ben'], ['Sam', 'Priya'], ['Jay', 'Mo'], ['Leah', 'Tom']]), w = ri(0, 1), part = w ? b : a, ans = part * k;
    return { q: `£${tot} is shared between ${who[0]} and ${who[1]} in the ratio ${a}:${b}. How much does ${who[w]} get?`, kind: 'num', v: ans, dm: { a, b, tot, part, name: who[w] }, pre: '£', show: '£' + ans,
      steps: [`Total parts: ${a} + ${b} = ${a + b}`, `One part: £${tot} ÷ ${a + b} = £${k}`, `${who[w]} gets ${part} part${part === 1 ? '' : 's'}: ${part} × £${k} = £${ans}`] };
  });
  T('ratio-simp', 'Simplifying ratios', () => {
    let p, q; do { p = ri(1, 9); q = ri(1, 9); } while (p === q || gcd(p, q) !== 1);
    const k = ri(2, 12);
    return { q: `Simplify ${p * k}:${q * k}`, kind: 'ratio', dm: { p, q, k }, parts: [p, q], show: `${p}:${q}`, hint: 'Type it like 2:3',
      steps: [`Highest common factor of ${p * k} and ${q * k} is ${k}`, `${p * k} ÷ ${k} = ${p}   and   ${q * k} ÷ ${k} = ${q}`, `Answer: ${p}:${q}`] };
  });
  T('bidmas', 'Order of operations (BIDMAS)', () => {
    const a = ri(2, 12), b = ri(2, 9), c = ri(2, 9), f = ri(0, 3);
    const W = (q, sl) => Object.assign(q, { sl });
    if (f === 0) return W(work(`${a} + ${b} × ${c}`, a + b * c, [`Multiply before adding: ${b} × ${c} = ${b * c}`, `Then add: ${a} + ${b * c} = ${a + b * c}`]), { f, a, b, c });
    if (f === 1) return W(work(`(${a} + ${b}) × ${c}`, (a + b) * c, [`Brackets first: ${a} + ${b} = ${a + b}`, `Then multiply: ${a + b} × ${c} = ${(a + b) * c}`]), { f, a, b, c });
    if (f === 2) { const d = ri(2, 6), e = d * ri(2, 9); return W(work(`${a} × ${b} − ${e} ÷ ${d}`, a * b - e / d, [`Multiply and divide first: ${a} × ${b} = ${a * b}   and   ${e} ÷ ${d} = ${e / d}`, `Then subtract: ${a * b} − ${e / d} = ${n(a * b - e / d)}`]), { f, a, b, d, e }); }
    return W(work(`${b}² − ${a} × ${c}`, b * b - a * c, [`Indices first: ${b}² = ${b * b}`, `Then multiply: ${a} × ${c} = ${a * c}`, `Then subtract: ${b * b} − ${a * c} = ${n(b * b - a * c)}`]), { f, a, b, c });
  });
  T('negatives', 'Negative numbers', () => {
    const a = ri(2, 12), b = ri(2, 12), f = ri(0, 3);
    if (f === 0) return work(`−${a} + ${b}`, b - a, [`Start at −${a} on the number line and go up ${b}`, `Answer: ${n(b - a)}`], { line: [-a, b] });
    if (f === 1) return work(`${a} − (−${b})`, a + b, ['Subtracting a negative is the same as adding', `${a} + ${b} = ${a + b}`], { line: [a, b] });
    if (f === 2) return work(`−${a} × ${b}`, -a * b, ['Negative × positive = negative', `${a} × ${b} = ${a * b}, so the answer is ${n(-a * b)}`]);
    return work(`−${a} × −${b}`, a * b, ['Negative × negative = positive', `${a} × ${b} = ${a * b}`]);
  });
  T('solve-1', 'Solving equations', (lvl = 2) => {
    /* level 1: small positive numbers; level 3: bigger, with negatives */
    const a = lvl === 1 ? ri(2, 5) : lvl === 3 ? ri(3, 12) : ri(2, 9); let x, b; do x = lvl === 1 ? ri(1, 10) : lvl === 3 ? ri(-9, 15) : ri(-5, 12); while (!x); do b = lvl === 1 ? ri(1, 15) : lvl === 3 ? ri(-40, 40) : ri(-20, 20); while (!b);
    const c = a * x + b;
    return { q: `Solve ${a}x${sg(b)} = ${n(c)}`, kind: 'num', v: x, dm: { a, b, c }, pre: 'x =', show: 'x = ' + n(x),
      steps: [`${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} on both sides: ${a}x = ${n(c - b)}`, `Divide both sides by ${a}: x = ${n(c - b)} ÷ ${a} = ${n(x)}`] };
  });
  T('solve-2', 'Unknowns on both sides', () => {
    const c = ri(1, 5), a = c + ri(1, 6); let x, b, d; do x = ri(-6, 10); while (!x); do b = ri(-15, 15); while (!b);
    d = (a - c) * x + b; if (!d) d = 0;
    const rhs = (c === 1 ? '' : c) + 'x' + (d ? sg(d) : '');
    return { q: `Solve ${a}x${sg(b)} = ${rhs}`, kind: 'num', v: x, dm: { a, b, c, d }, pre: 'x =', show: 'x = ' + n(x),
      steps: [`Subtract ${c === 1 ? '' : c}x from both sides: ${a - c === 1 ? '' : a - c}x${sg(b)} = ${n(d)}`, `${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)}: ${a - c === 1 ? '' : a - c}x = ${n(d - b)}`,
        a - c === 1 ? `x = ${n(x)}` : `Divide by ${a - c}: x = ${n(d - b)} ÷ ${a - c} = ${n(x)}`] };
  });
  T('substitute', 'Substitution', () => {
    const a = ri(-5, 6) || 2, b = ri(-5, 6) || -3, p = ri(2, 6), q = ri(2, 6);
    if (Math.random() < .5) {
      const v = p * a + q * b;
      return { q: `If a = ${n(a)} and b = ${n(b)}, work out ${p}a + ${q}b.`, kind: 'num', v, dm: { a, b, p, q, sq: false }, show: n(v),
        steps: [`Replace the letters: ${p} × ${par(a)} + ${q} × ${par(b)}`, `= ${n(p * a)} + ${par(q * b)}`, `= ${n(v)}`] };
    }
    const v = a * a + q * b;
    return { q: `If a = ${n(a)} and b = ${n(b)}, work out a² + ${q}b.`, kind: 'num', v, dm: { a, b, q, sq: true }, show: n(v),
      steps: [`${par(a)}² = ${a * a}${a < 0 ? ' (a negative squared is positive)' : ''}`, `${q} × ${par(b)} = ${n(q * b)}`, `${a * a} + ${par(q * b)} = ${n(v)}`] };
  });
  T('expand', 'Expanding brackets', (lvl = 2) => {
    const k = lvl === 3 ? ri(4, 12) : ri(2, 9), p = lvl === 1 ? 1 : lvl === 3 ? ri(2, 7) : ri(1, 5), m = lvl === 3 ? ri(5, 20) : ri(1, 12), neg = lvl > 1 && Math.random() < .5, A = k * p, B = k * (neg ? -m : m), px = (p === 1 ? '' : p) + 'x';
    return { q: `Expand ${k}(${px} ${neg ? '−' : '+'} ${m})`, kind: 'lin', dm: { k, p, m: neg ? -m : m }, v: 'x', a: A, b: B, show: lin(A, B, 'x'), hint: 'Type it like 6x + 15',
      steps: [`Multiply everything inside the bracket by ${k}`, `${k} × ${px} = ${A}x`, `${k} × ${neg ? '−' : ''}${m} = ${n(B)}`, `Answer: ${lin(A, B, 'x')}`] };
  });
  T('nth-term', 'nth term of a sequence', () => {
    let d; do d = ri(-5, 9); while (d >= -1 && d <= 1); const c = ri(-8, 10), t = [1, 2, 3, 4].map(i => d * i + c);
    return { q: `Find the nth term of: ${t.map(n).join(', ')}, …`, kind: 'lin', dm: { d, c }, v: 'n', a: d, b: c, show: lin(d, c, 'n'), hint: 'Type it like 3n + 2',
      steps: [`The terms change by ${n(d)} each time, so it starts ${lin(d, 0, 'n')}`, `${lin(d, 0, 'n')} gives ${[1, 2, 3, 4].map(i => n(d * i)).join(', ')}`,
        c ? `To match the sequence, ${c > 0 ? 'add' : 'subtract'} ${Math.abs(c)}` : 'That already matches the sequence', `nth term = ${lin(d, c, 'n')}`] };
  });
  T('area', 'Area of triangles and trapeziums', () => {
    if (Math.random() < .5) {
      const b = ri(3, 20), h = ri(2, 15), v = b * h / 2;
      return { q: `A triangle has base ${b} cm and perpendicular height ${h} cm. Find its area.`, kind: 'num', v, suf: 'cm²', show: n(v) + ' cm²', dm: { shape: 'tri', b, h },
        steps: ['Area of a triangle = ½ × base × height', `= ½ × ${b} × ${h}`, `= ${n(v)} cm²`] };
    }
    const a = ri(3, 12), b = a + ri(1, 8), h = ri(2, 10), v = (a + b) * h / 2;
    return { q: `A trapezium has parallel sides ${a} cm and ${b} cm, and height ${h} cm. Find its area.`, kind: 'num', v, suf: 'cm²', show: n(v) + ' cm²', dm: { shape: 'trap', a, b, h },
      steps: ['Area of a trapezium = ½ × (a + b) × h', `= ½ × (${a} + ${b}) × ${h} = ½ × ${a + b} × ${h}`, `= ${n(v)} cm²`] };
  });
  T('circles', 'Circles: area and circumference', () => {
    const r = ri(2, 15), useD = Math.random() < .4, area = Math.random() < .5, v = area ? Math.PI * r * r : 2 * Math.PI * r, ans = Math.round(v * 10) / 10;
    const steps = []; if (useD && area) steps.push(`Radius = diameter ÷ 2 = ${2 * r} ÷ 2 = ${r} cm`);
    if (area) steps.push('Area = π × r²', `= π × ${r}² = π × ${r * r}`, `= ${v.toFixed(3)}… = ${ans.toFixed(1)} cm² (1 d.p.)`);
    else steps.push('Circumference = π × diameter', useD ? `= π × ${2 * r}` : `Diameter = 2 × ${r} = ${2 * r}, so π × ${2 * r}`, `= ${v.toFixed(3)}… = ${ans.toFixed(1)} cm (1 d.p.)`);
    return { q: `A circle has ${useD ? 'diameter ' + 2 * r : 'radius ' + r} cm. Find its ${area ? 'area' : 'circumference'} to 1 decimal place.`, kind: 'num', v: ans, dm: { r, useD, area }, tol: .051, suf: area ? 'cm²' : 'cm', show: ans.toFixed(1) + (area ? ' cm²' : ' cm'), steps };
  });
  T('pythag', 'Pythagoras', () => {
    const tri = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], null, null, null]);
    if (Math.random() < .6) {
      const [a, b] = tri || [ri(3, 12), ri(3, 14)], s = a * a + b * b, c = Math.sqrt(s), exact = Number.isInteger(c), ans = exact ? c : Math.round(c * 10) / 10;
      return { q: `A right-angled triangle has shorter sides ${a} cm and ${b} cm. Find the hypotenuse${exact ? '.' : ' to 1 d.p.'}`, kind: 'num', v: ans, dm: { a, b, hyp: true }, tol: exact ? 1e-6 : .051, suf: 'cm', show: (exact ? ans : ans.toFixed(1)) + ' cm',
        steps: ['Hypotenuse² = a² + b²', `= ${a}² + ${b}² = ${a * a} + ${b * b} = ${s}`, `Hypotenuse = √${s} = ${exact ? c : c.toFixed(3) + '… = ' + ans.toFixed(1)} cm`] };
    }
    let a, c; if (tri) { a = tri[0]; c = tri[2]; } else { c = ri(8, 20); a = ri(3, c - 2); }
    const s = c * c - a * a, b = Math.sqrt(s), exact = Number.isInteger(b), ans = exact ? b : Math.round(b * 10) / 10;
    return { q: `A right-angled triangle has hypotenuse ${c} cm and one shorter side ${a} cm. Find the other side${exact ? '.' : ' to 1 d.p.'}`, kind: 'num', v: ans, dm: { a, c, hyp: false }, tol: exact ? 1e-6 : .051, suf: 'cm', show: (exact ? ans : ans.toFixed(1)) + ' cm',
      steps: ['Shorter side² = hypotenuse² − other side²', `= ${c}² − ${a}² = ${c * c} − ${a * a} = ${s}`, `Side = √${s} = ${exact ? b : b.toFixed(3) + '… = ' + ans.toFixed(1)} cm`] };
  });
  T('angles', 'Angles', () => {
    const f = ri(0, 3);
    if (f === 0) { const a = ri(20, 90), b = ri(20, 160 - a), v = 180 - a - b; return { q: `Two angles in a triangle are ${a}° and ${b}°. Find the third angle.`, kind: 'num', v, dm: { f: 'tri', a, b }, suf: '°', show: v + '°', steps: ['Angles in a triangle add up to 180°', `180 − ${a} − ${b} = ${v}°`] }; }
    if (f === 1) { const a = ri(15, 165), v = 180 - a; return { q: `Two angles sit on a straight line. One is ${a}°. Find the other.`, kind: 'num', v, dm: { f: 'line', a }, suf: '°', show: v + '°', steps: ['Angles on a straight line add up to 180°', `180 − ${a} = ${v}°`] }; }
    if (f === 2) { const a = ri(40, 130), b = ri(40, 120), c = ri(30, 300 - a - b), v = 360 - a - b - c; return { q: `Four angles meet at a point. Three are ${a}°, ${b}° and ${c}°. Find the fourth.`, kind: 'num', v, dm: { f: 'point', a, b, c }, suf: '°', show: v + '°', steps: ['Angles around a point add up to 360°', `360 − ${a} − ${b} − ${c} = ${v}°`] }; }
    const N = { 5: 'pentagon', 6: 'hexagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' }, k = pick([5, 6, 8, 9, 10, 12]), ext = 360 / k, inner = Math.random() < .5;
    return { q: `Find the ${inner ? 'interior' : 'exterior'} angle of a regular ${N[k]} (${k} sides).`, kind: 'num', v: inner ? 180 - ext : ext, dm: { f: 'poly', k, inner, name: N[k] }, suf: '°', show: (inner ? 180 - ext : ext) + '°',
      steps: ['Exterior angles of any polygon add up to 360°', `Exterior angle = 360 ÷ ${k} = ${ext}°`].concat(inner ? ['Interior + exterior = 180°', `Interior angle = 180 − ${ext} = ${180 - ext}°`] : []) };
  });
  T('averages', 'Mean, median, mode, range', () => {
    const k = pick(['mean', 'median', 'range', 'mode']); let xs;
    if (k === 'mode') { const m = ri(1, 20), others = []; while (others.length < 3) { const v = ri(1, 20); if (v !== m && !others.includes(v)) others.push(v); } xs = [m, m, m, ...others].sort(() => Math.random() - .5); }
    else { xs = Array.from({ length: k === 'median' ? pick([5, 7]) : ri(5, 7) }, () => ri(1, 20)); }
    if (k === 'mean') { const r = xs.reduce((a, b) => a + b) % xs.length; if (r) xs[0] += xs.length - r; }
    const s = xs.reduce((a, b) => a + b), sorted = [...xs].sort((a, b) => a - b);
    const out = { mean: [s / xs.length, [`Add them up: ${xs.join(' + ')} = ${s}`, `Divide by how many there are: ${s} ÷ ${xs.length} = ${s / xs.length}`]],
      median: [sorted[(sorted.length - 1) / 2], [`Put them in order: ${sorted.join(', ')}`, `The middle value is ${sorted[(sorted.length - 1) / 2]}`]],
      range: [sorted[sorted.length - 1] - sorted[0], [`Biggest − smallest = ${sorted[sorted.length - 1]} − ${sorted[0]} = ${sorted[sorted.length - 1] - sorted[0]}`]],
      mode: [xs.find(v => xs.filter(w => w === v).length === 3), ['The mode is the value that appears most often', `${xs.find(v => xs.filter(w => w === v).length === 3)} appears 3 times`]] }[k];
    return { q: `Find the ${k} of: ${xs.join(', ')}`, kind: 'num', v: out[0], dm: { k, xs }, show: n(out[0]), steps: out[1] };
  });
  T('sdt', 'Speed, distance, time', () => {
    const s = pick([20, 30, 40, 45, 50, 60, 70, 80]), t = pick([.5, 1.5, 2, 2.5, 3, 4]), d = s * t, f = ri(0, 2);
    const ts = t === .5 ? '30 minutes' : Number.isInteger(t) ? `${t} hours` : `${Math.floor(t)} hours 30 minutes`, note = Number.isInteger(t) ? [] : [`${ts} = ${t} hours`];
    if (f === 0) return { q: `A car travels ${d} km in ${ts}. Find its average speed.`, kind: 'num', v: s, dm: { f: 's', s, t, d }, suf: 'km/h', show: s + ' km/h', steps: [...note, 'Speed = distance ÷ time', `= ${d} ÷ ${t} = ${s} km/h`] };
    if (f === 1) return { q: `A cyclist travels at ${s} km/h for ${ts}. How far do they go?`, kind: 'num', v: d, dm: { f: 'd', s, t, d }, suf: 'km', show: d + ' km', steps: [...note, 'Distance = speed × time', `= ${s} × ${t} = ${d} km`] };
    return { q: `How long does it take to travel ${d} km at ${s} km/h? Give your answer in hours.`, kind: 'num', v: t, dm: { f: 't', s, t, d }, suf: 'hours', show: t + ' hours', steps: ['Time = distance ÷ speed', `= ${d} ÷ ${s} = ${t} hours`] };
  });
  T('std-form', 'Standard form', () => {
    const m = ri(11, 99) / 10, neg = Math.random() < .35, p = neg ? -ri(1, 4) : ri(2, 6), v = clean(m * Math.pow(10, p)), ms = String(m);
    if (Math.random() < .5) return { q: `Write ${ms} × 10${sup(p)} as an ordinary number.`, kind: 'num', v, rel: 1e-9, dm: { m, p, toOrd: true }, show: String(v),
      steps: [`The power is ${p}, so move the decimal point ${Math.abs(p)} place${Math.abs(p) > 1 ? 's' : ''} ${p > 0 ? 'right (bigger number)' : 'left (smaller number)'}`, `${ms} → ${v}`] };
    return { q: `Write ${v} in standard form.`, kind: 'sf', v, dm: { m, p, toOrd: false }, show: `${ms} × 10${sup(p)}`, hint: 'Type it like 4.7 x 10^5',
      steps: ['Standard form is A × 10ⁿ, where 1 ≤ A < 10', `A = ${ms}`, `Count how far the decimal point moves to get from ${ms} to ${v}: ${Math.abs(p)} place${Math.abs(p) > 1 ? 's' : ''} ${p > 0 ? 'right, so n = ' + p : 'left, so n = ' + p}`, `${ms} × 10${sup(p)}`] };
  });
  T('prob', 'Probability', () => {
    const cols = ['red', 'blue', 'green', 'yellow'], k = ri(2, 3), cs = Array.from({ length: k }, () => ri(1, 9)), tot = cs.reduce((a, b) => a + b), i = ri(0, k - 1), not = Math.random() < .35;
    const num = not ? tot - cs[i] : cs[i], [sn, sd] = simp(num, tot);
    const list = cs.map((c, j) => `${c} ${cols[j]}`), desc = list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
    return { q: `A bag has ${desc} counters. One is taken at random. What is the probability it is ${not ? 'not ' : ''}${cols[i]}?`, kind: 'frac', dm: { cs, i, not, cols }, n: sn, d: sd, simplest: false, show: fs(num, tot) + (sd !== tot ? ` (= ${fs(sn, sd)})` : ''), hint: 'Type a fraction like 3/8',
      steps: [`Total counters: ${cs.join(' + ')} = ${tot}`, not ? `Not ${cols[i]}: ${tot} − ${cs[i]} = ${num}` : `${cap(cols[i])} counters: ${num}`, `Probability = ${num}/${tot}${sd !== tot ? ' = ' + fs(sn, sd) : ''}`] };
  });
  T('compound', 'Compound interest', () => {
    const P = ri(2, 50) * 100, r = pick([2, 3, 4, 5, 6, 8]), y = ri(2, 5), m = 1 + r / 100, v = Math.round(P * Math.pow(m, y) * 100) / 100;
    return { q: `£${P} is invested at ${r}% compound interest per year. How much is it worth after ${y} years?`, kind: 'num', v, dm: { P, r, y }, tol: .011, pre: '£', show: '£' + v.toFixed(2),
      steps: [`Multiplier: 1 + ${r}/100 = ${n(m)}`, `Apply it once per year: £${P} × ${n(m)}${sup(y)}`, `= £${v.toFixed(2)}`] };
  });
  T('rounding', 'Rounding (d.p. and s.f.)', () => {
    const dig = k => { let d; do d = ri(0, 9); while (k && d === 5); return d; };
    if (Math.random() < .5) {
      const dp = ri(1, 2), ip = ri(0, 99), ds = [dig(), dig(), dig(), dig()]; ds[dp] = dig(true);
      const x = Number(`${ip}.${ds.join('')}`), ans = Number(x.toFixed(dp)), up = ds[dp] > 5;
      return { q: `Round ${x} to ${dp} decimal place${dp > 1 ? 's' : ''}.`, kind: 'num', v: ans, dm: { x, dp }, show: ans.toFixed(dp),
        steps: [`Look at the digit after decimal place ${dp}: it is ${ds[dp]}`, up ? 'It is 5 or more, so round up' : 'It is less than 5, so round down', `Answer: ${ans.toFixed(dp)}`] };
    }
    const sf = ri(1, 3), big = Math.random() < .6, ds = [ri(1, 9), dig(), dig(), dig(), dig()]; ds[sf] = dig(true);
    const x = big ? Number(ds.join('')) : Number('0.0' + ds.join('')), ans = Number(x.toPrecision(sf)), up = ds[sf] > 5;
    return { q: `Round ${x} to ${sf} significant figure${sf > 1 ? 's' : ''}.`, kind: 'num', v: ans, dm: { x, sf }, rel: 1e-9, show: String(ans),
      steps: [`The first significant figure is the first non-zero digit: ${ds[0]}`, `The digit after ${sf} s.f. is ${ds[sf]}, so round ${up ? 'up' : 'down'}`, big ? 'Fill the remaining places with zeros to keep the size of the number' : 'Keep the leading zeros', `Answer: ${ans}`] };
  });
  /* ---------- Maths: harder algebra, trigonometry and percentages, on both tiers. Each takes a level (1 easier, 3 harder) ---------- */
  const TH = (id, name, gen) => { M[id] = { name, gen, tier: 'H' }; }, TB = (id, name, gen) => { M[id] = { name, gen, lv: true }; };
  const nz = (a, b) => { let v; do v = ri(a, b); while (!v); return v; };
  /* a picture drawn from the question's own numbers (pics.js); questions work without one */
  const pic = (f, ...a) => typeof PIC !== 'undefined' && PIC[f] ? PIC[f](...a) : undefined;
  const quadStr = (A, B, C) => [A === 1 ? 'x²' : A === -1 ? '−x²' : n(A) + 'x²', B ? (B < 0 ? ' − ' : ' + ') + (Math.abs(B) === 1 ? '' : Math.abs(B)) + 'x' : '', C ? sg(C) : ''].join('');
  const brk = p => `(x${sg(p)})`;
  TB('h-dbl', 'Expanding double brackets', (lvl = 2) => {
    const p = lvl === 3 ? ri(2, 4) : 1, a = nz(lvl === 1 ? 1 : -9, 9), b = nz(lvl === 1 ? 1 : -9, 9), A = p, B = p * b + a, C = a * b;
    const px = p === 1 ? 'x' : p + 'x';
    return { q: `Expand and simplify (${px}${sg(a)})(x${sg(b)})`, kind: 'quad', A, B, C, show: quadStr(A, B, C), hint: 'Type it like x^2 + 5x + 6',
      steps: [`First: ${px} × x = ${p === 1 ? '' : p}x²`, `Outside: ${px} × ${par(b)} = ${n(p * b)}x`, `Inside: ${n(a)} × x = ${n(a)}x`, `Last: ${n(a)} × ${par(b)} = ${n(C)}`,
        `Collect the x terms: ${n(p * b)} + ${par(a)} = ${n(B)}`, `Answer: ${quadStr(A, B, C)}`] };
  });
  TB('h-fact', 'Factorising quadratics', (lvl = 2) => {
    let p, q; do { p = nz(lvl === 1 ? 1 : -9, 9); q = nz(lvl === 1 ? 1 : -9, 9); } while (p + q === 0);
    const B = p + q, C = p * q;
    return { q: `Factorise ${quadStr(1, B, C)}`, kind: 'fact', r: [p, q], show: brk(p) + brk(q), hint: 'Type it like (x + 2)(x + 3)',
      steps: [`Find two numbers that multiply to ${n(C)} and add to ${n(B)}`, `${n(p)} × ${par(q)} = ${n(C)}   and   ${n(p)} + ${par(q)} = ${n(B)}`, `Answer: ${brk(p)}${brk(q)}`] };
  });
  TB('h-quad', 'Solving quadratics', (lvl = 2) => {
    let p, q; do { p = nz(-9, lvl === 1 ? -1 : 9); q = nz(-9, lvl === 1 ? -1 : 9); } while (p === q || p + q === 0);
    const B = -(p + q), C = p * q;
    return { q: `Solve ${quadStr(1, B, C)} = 0`, kind: 'roots', r: [p, q], show: `x = ${n(p)} or x = ${n(q)}`, hint: 'Type both answers, like x = 2 or x = −5',
      steps: [`Factorise: two numbers that multiply to ${n(C)} and add to ${n(B)} are ${n(-p)} and ${n(-q)}`, `${brk(-p)}${brk(-q)} = 0`,
        `So x${sg(-p)} = 0, giving x = ${n(p)}`, `or x${sg(-q)} = 0, giving x = ${n(q)}`] };
  });
  TB('h-sim', 'Simultaneous equations', (lvl = 2) => {
    for (;;) {
      const x = lvl === 1 ? ri(1, 6) : nz(-6, 9), y = lvl === 1 ? ri(1, 6) : nz(-6, 9), a1 = ri(1, 5), b1 = ri(1, 5), a2 = ri(1, 5), b2 = lvl === 1 ? -ri(1, 4) : nz(-5, 5);
      const det = a1 * b2 - a2 * b1; if (!det) continue;
      const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y, e = (A, B2, Cc) => `${A === 1 ? '' : A}x${B2 < 0 ? ' − ' : ' + '}${Math.abs(B2) === 1 ? '' : Math.abs(B2)}y = ${n(Cc)}`;
      return { q: `Solve the simultaneous equations:  ${e(a1, b1, c1)}  and  ${e(a2, b2, c2)}`, kind: 'pair', x, y, show: `x = ${n(x)}, y = ${n(y)}`, hint: 'Type it like x = 2, y = −3',
        steps: [`Make the y terms match: multiply the first equation by ${par(b2)} and the second by ${b1}`, `${n(a1 * b2)}x + ${par(b1 * b2)}y = ${n(c1 * b2)}`, `${n(a2 * b1)}x + ${par(b2 * b1)}y = ${n(c2 * b1)}`,
          `Subtract to remove y: ${n(a1 * b2)} − ${par(a2 * b1)} = ${n(det)}, and ${n(c1 * b2)} − ${par(c2 * b1)} = ${n(c1 * b2 - c2 * b1)}`, `${n(det)}x = ${n(c1 * b2 - c2 * b1)}, so x = ${n(c1 * b2 - c2 * b1)} ÷ ${par(det)} = ${n(x)}`,
          `Substitute into the first equation: ${b1}y = ${n(c1)} − ${par(a1 * x)} = ${n(c1 - a1 * x)}, so y = ${n(y)}`, `Check in the second: ${a2} × ${par(x)} + ${par(b2)} × ${par(y)} = ${n(c2)} ✓`] };
    }
  });
  TB('h-trig', 'Trigonometry (SOH CAH TOA)', (lvl = 2) => {
    const deg = Math.PI / 180, ang = ri(lvl === 1 ? 30 : 15, lvl === 1 ? 60 : 75), H = ri(6, 30), O = H * Math.sin(ang * deg), A = H * Math.cos(ang * deg), f = ri(lvl === 3 ? 0 : 1, 3);
    const r1 = v => Math.round(v * 10) / 10;
    if (f === 0) { const o = r1(O), a = r1(A), t = r1(Math.atan(o / a) / deg);
      return { q: `A right-angled triangle has opposite ${o} cm and adjacent ${a} cm to the angle θ. Find θ to 1 decimal place.`, pic: pic('right', Math.atan(o / a) / deg, { ang: '?', opp: o + ' cm', adj: a + ' cm' }), kind: 'num', v: t, tol: .051, suf: '°', show: t.toFixed(1) + '°',
        steps: ['Opposite and adjacent: use TAN (TOA)', `tan θ = ${o} ÷ ${a}`, `θ = tan⁻¹(${o} ÷ ${a}) = ${(Math.atan(o / a) / deg).toFixed(3)}… = ${t.toFixed(1)}°`] }; }
    if (f === 1) { const v = r1(O); return { q: `A right-angled triangle has hypotenuse ${H} cm and angle ${ang}°. Find the side opposite the angle, to 1 decimal place.`, pic: pic('right', ang, { ang: ang + '°', hyp: H + ' cm', opp: '?' }), kind: 'num', v, tol: .051, suf: 'cm', show: v.toFixed(1) + ' cm',
      steps: ['Hypotenuse known, opposite wanted: use SIN (SOH)', `opposite = ${H} × sin ${ang}°`, `= ${O.toFixed(3)}… = ${v.toFixed(1)} cm`] }; }
    if (f === 2) { const v = r1(A); return { q: `A right-angled triangle has hypotenuse ${H} cm and angle ${ang}°. Find the side adjacent to the angle, to 1 decimal place.`, pic: pic('right', ang, { ang: ang + '°', hyp: H + ' cm', adj: '?' }), kind: 'num', v, tol: .051, suf: 'cm', show: v.toFixed(1) + ' cm',
      steps: ['Hypotenuse known, adjacent wanted: use COS (CAH)', `adjacent = ${H} × cos ${ang}°`, `= ${A.toFixed(3)}… = ${v.toFixed(1)} cm`] }; }
    const a = ri(5, 20), o = a * Math.tan(ang * deg), v = r1(o);
    return { q: `A right-angled triangle has angle ${ang}° and the side adjacent to it is ${a} cm. Find the opposite side to 1 decimal place.`, pic: pic('right', ang, { ang: ang + '°', adj: a + ' cm', opp: '?' }), kind: 'num', v, tol: .051, suf: 'cm', show: v.toFixed(1) + ' cm',
      steps: ['Adjacent known, opposite wanted: use TAN (TOA)', `opposite = ${a} × tan ${ang}°`, `= ${o.toFixed(3)}… = ${v.toFixed(1)} cm`] };
  });
  TB('h-ind', 'Laws of indices', (lvl = 2) => {
    const L = pick(['a', 'x', 'y', 'm']), f = ri(0, lvl === 1 ? 1 : 2), m = ri(2, 9), k = ri(2, lvl === 3 ? 9 : 6);
    if (f === 0) return { q: `Simplify ${L}${sup(m)} × ${L}${sup(k)}`, kind: 'num', v: m + k, pre: L + '^', show: L + sup(m + k), hint: 'Type just the new power',
      steps: ['Multiplying powers of the same letter: add the powers', `${m} + ${k} = ${m + k}`, `Answer: ${L}${sup(m + k)}`] };
    if (f === 1) { const big = m + k; return { q: `Simplify ${L}${sup(big)} ÷ ${L}${sup(k)}`, kind: 'num', v: m, pre: L + '^', show: L + sup(m), hint: 'Type just the new power',
      steps: ['Dividing powers of the same letter: subtract the powers', `${big} − ${k} = ${m}`, `Answer: ${L}${sup(m)}`] }; }
    return { q: `Simplify (${L}${sup(m)})${sup(k)}`, kind: 'num', v: m * k, pre: L + '^', show: L + sup(m * k), hint: 'Type just the new power',
      steps: ['A power of a power: multiply the powers', `${m} × ${k} = ${m * k}`, `Answer: ${L}${sup(m * k)}`] };
  });
  TB('h-revpct', 'Reverse percentages', (lvl = 2) => {
    const p = pick(lvl === 1 ? [10, 20, 25, 50] : [5, 10, 15, 20, 25, 30, 40]), up = Math.random() < .5, orig = ri(4, 60) * 4, m = (100 + (up ? p : -p)) / 100, now = clean(orig * m);
    return { q: `After a ${p}% ${up ? 'increase' : 'decrease'}, a price is £${money(now)}. What was the original price?`, kind: 'num', v: orig, tol: .005, pre: '£', show: '£' + money(orig),
      steps: [`The new price is ${up ? 100 + p : 100 - p}% of the original: multiplier ${n(m)}`, 'Undo the multiplier: divide by it', `£${money(now)} ÷ ${n(m)} = £${money(orig)}`] };
  });
  /* Higher only from here: hidden for Foundation students */
  TH('h-surd', 'Simplifying surds', (lvl = 2) => {
    const b = pick([2, 3, 5, 6, 7, 10, 11]), a = ri(2, lvl === 3 ? 9 : 5), nn = a * a * b;
    return { q: `Simplify √${nn}`, kind: 'surd', a, b, show: `${a}√${b}`, hint: 'Type it like 4√3 (or 4 root 3)',
      steps: [`Find the biggest square number that goes into ${nn}: ${a * a}`, `${nn} = ${a * a} × ${b}`, `√${nn} = √${a * a} × √${b} = ${a}√${b}`] };
  });
  TH('h-recur', 'Recurring decimals to fractions', (lvl = 2) => {
    if (lvl === 1 || Math.random() < .3) { const d = ri(1, 8), [sn, sd] = simp(d, 9);
      return { q: `Write 0.${d}${d}${d}… (${d} recurring) as a fraction in its simplest form.`, kind: 'frac', n: sn, d: sd, show: fs(sn, sd), hint: 'Type a fraction like 5/9',
        steps: [`Let x = 0.${d}${d}${d}…`, `10x = ${d}.${d}${d}${d}…`, `Subtract: 10x − x = 9x = ${d}`, `x = ${d}/9${sd !== 9 ? ' = ' + fs(sn, sd) : ''}`] }; }
    let ab; do ab = ri(10, 98); while (ab % 11 === 0);
    const s = String(ab), [sn, sd] = simp(ab, 99);
    return { q: `Write 0.${s}${s}${s}… (${s} recurring) as a fraction in its simplest form.`, kind: 'frac', n: sn, d: sd, show: fs(sn, sd), hint: 'Type a fraction like 5/11',
      steps: [`Let x = 0.${s}${s}…`, `100x = ${s}.${s}${s}…`, `Subtract: 100x − x = 99x = ${ab}`, `x = ${ab}/99${sd !== 99 ? ' = ' + fs(sn, sd) : ''}`] };
  });
  /* ---------- Maths: Higher-only topics (bold in the AQA specification). Answers are computed; anything rounded is rounded once, at the end ---------- */
  const rd = (v, d) => Math.sign(v) * Math.round(Number((Math.abs(v) * 10 ** d).toFixed(6))) / 10 ** d;
  const fd = (v, d) => rd(v, d).toFixed(d).replace('-', '−');
  const deg = Math.PI / 180, subN = i => String(i).split('').map(c => '₀₁₂₃₄₅₆₇₈₉'[c]).join('');
  const xt = (c, k) => (c === 1 ? '' : c === -1 ? '−' : n(c)) + 'x' + (k ? sg(k) : ''); /* 2x + 3 */
  const tx = k => (k < 0 ? ' − ' : ' + ') + (Math.abs(k) === 1 ? '' : Math.abs(k)) + 'x'; /* " − 3x" */
  /* a polynomial from its coefficients, co[i] is the coefficient of v to the power i */
  const polyStr = (co, v = 'x') => { let out = ''; for (let p = co.length - 1; p >= 0; p--) { const c = co[p]; if (!c) continue; const m = Math.abs(c), body = p === 0 ? String(m) : (m === 1 ? '' : m) + v + (p > 1 ? sup(p) : ''); out += out ? (c < 0 ? ' − ' : ' + ') + body : (c < 0 ? '−' : '') + body; } return out || '0'; };
  const UF = { '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾' };
  const gradStr = (a, b) => { const [p, q] = simp(a, b); if (q === 1) return p === 1 ? '' : p === -1 ? '−' : n(p); const u = UF[Math.abs(p) + '/' + q]; return (p < 0 ? '−' : '') + (u || `(${Math.abs(p)}/${q})`); };
  const pf = (a, b) => { const [p, q] = simp(a, b); return q === 1 ? par(p) : `(${fs(p, q)})`; }; /* a fraction ready to multiply by */

  TH('h-rat', 'Rationalising denominators', (lvl = 2) => {
    const b = pick([2, 3, 5, 6, 7, 10]), k = ri(1, lvl === 1 ? 4 : 7), c = lvl === 3 ? ri(2, 4) : 1, a = k * b * c, den = c === 1 ? `√${b}` : `(${c}√${b})`, ans = (k === 1 ? '' : k) + '√' + b;
    return { q: `Rationalise the denominator and simplify fully: ${a}/${den}`, kind: 'surd', a: k, b, show: ans, hint: 'Type it like 4√3 (or 4 root 3)',
      steps: [`Multiply the top and the bottom by √${b}, because √${b} × √${b} = ${b}`, `${a}/${den} = ${a}√${b}/${c * b}`, `Simplify the numbers: ${a} ÷ ${c * b} = ${k}`, `Answer: ${ans}`] };
  });
  TH('h-fracind', 'Negative and fractional indices', (lvl = 2) => {
    const f = lvl === 1 ? ri(0, 1) : lvl === 2 ? ri(0, 2) : ri(1, 3);
    if (f === 0) { const b = ri(2, 5), p = ri(1, b > 3 ? 2 : 3), v = b ** p;
      return { q: `Work out ${b}${sup(-p)}. Give your answer as a fraction.`, kind: 'frac', n: 1, d: v, show: `1/${v}`, hint: 'Type a fraction like 1/8',
        steps: [`A negative power means one over the positive power: ${b}${sup(-p)} = 1/${b}${p > 1 ? sup(p) : ''}`, ...(p > 1 ? [`${b}${sup(p)} = ${v}`] : []), `Answer: 1/${v}`] }; }
    const r = pick([2, 2, 3, 3, 4]), k = r === 2 ? ri(2, f === 1 ? 12 : 6) : r === 3 ? ri(2, 5) : ri(2, 3), b = k ** r;
    const m = f === 1 ? 1 : r === 2 ? (f === 3 ? ri(1, 2) : 3) : r === 3 ? (f === 3 ? ri(1, 2) : 2) : (f === 3 ? 1 : 3), v = k ** m;
    const pw = `${m}/${r}`, rootName = { 2: 'square', 3: 'cube', 4: 'fourth' }[r];
    const steps = [`The bottom of the power is a root: the ${rootName} root of ${b} is ${k}`];
    if (m > 1) steps.push(`The top of the power is a power: ${k}${sup(m)} = ${v}`);
    if (f === 3) return { q: `Work out ${b}^(−${pw}). Give your answer as a fraction.`, kind: 'frac', n: 1, d: v, show: `1/${v}`, hint: 'Type a fraction like 1/9',
      steps: [`The minus sign means one over: ${b}^(−${pw}) = 1/${b}^(${pw})`, ...steps, `Answer: 1/${v}`] };
    return { q: `Work out ${b}^(${pw}).`, kind: 'num', v, show: String(v), hint: 'Type a whole number', steps: [...steps, `Answer: ${v}`] };
  });
  TH('h-qform', 'The quadratic formula', (lvl = 2) => {
    for (;;) {
      const a = lvl === 1 ? 1 : ri(1, lvl === 3 ? 5 : 3), b = nz(-9, 9), c = nz(-9, 9), D = b * b - 4 * a * c;
      if (D <= 0 || Number.isInteger(Math.sqrt(D))) continue;
      const s = Math.sqrt(D), x1 = (-b - s) / (2 * a), x2 = (-b + s) / (2 * a), r = [rd(x1, 2), rd(x2, 2)];
      if (r[0] === r[1]) continue;
      return { q: `Solve ${quadStr(a, b, c)} = 0. Give your answers to 2 decimal places.`, kind: 'roots', r, tol: .0051, show: `x = ${fd(x1, 2)} or x = ${fd(x2, 2)}`, hint: 'Type both answers, like x = 0.56 or x = −3.56',
        steps: [`It does not factorise, so use the formula x = (−b ± √(b² − 4ac)) ÷ 2a with a = ${a}, b = ${n(b)}, c = ${n(c)}`,
          `b² − 4ac = ${par(b)}² − 4 × ${a} × ${par(c)} = ${D}`, `x = (${n(-b)} ± √${D}) ÷ ${2 * a}`,
          `With +: x = (${n(-b)} + √${D}) ÷ ${2 * a} = ${x2.toFixed(4).replace('-', '−')}…`, `With −: x = (${n(-b)} − √${D}) ÷ ${2 * a} = ${x1.toFixed(4).replace('-', '−')}…`,
          `To 2 decimal places: x = ${fd(x1, 2)} or x = ${fd(x2, 2)}`] };
    }
  });
  TH('h-ctsq', 'Completing the square', (lvl = 2) => {
    for (;;) {
      const a = lvl === 3 && Math.random() < .5 ? ri(2, 3) : 1, p = nz(lvl === 1 ? 1 : -6, 6), c = nz(-12, 12), b = 2 * a * p, q0 = c - a * p * p;
      if (!q0) continue;
      const sq = `(x${sg(p)})²`, form = `${a === 1 ? '' : a}${sq}${sg(q0)}`, Q = quadStr(a, b, c);
      const steps = a === 1 ? [`Halve the number of x: ${n(b)} ÷ 2 = ${n(p)}`, `x²${tx(b)} = ${sq} − ${p * p}`, `So ${Q} = ${sq} − ${p * p}${sg(c)}`, `${n(-p * p)}${sg(c)} = ${n(q0)}`]
        : [`Take ${a} out of the x terms: ${Q} = ${a}(x²${tx(2 * p)})${sg(c)}`, `Complete the square inside: x²${tx(2 * p)} = ${sq} − ${p * p}`, `${a}(${sq} − ${p * p})${sg(c)} = ${a}${sq} − ${a * p * p}${sg(c)}`, `${n(-a * p * p)}${sg(c)} = ${n(q0)}`];
      if (a === 1 && lvl > 1 && Math.random() < .4) return { q: `By completing the square, find the coordinates of the turning point of y = ${Q}.`, kind: 'pair', x: -p, y: q0, show: `(${n(-p)}, ${n(q0)})`, hint: 'Type it like (3, −2)',
        steps: [...steps, `y = ${form}`, `The turning point is where the bracket is 0: x = ${n(-p)}, and then y = ${n(q0)}`] };
      return { q: `Write ${Q} in the form ${a === 1 ? '(x + p)² + q' : 'a(x + p)² + q'}.`, kind: 'ctsq', ca: a, cp: p, cq: q0, show: form, hint: a === 1 ? 'Type it like (x + 3)^2 − 4' : 'Type it like 2(x + 3)^2 − 4',
        steps: [...steps, `Answer: ${form}`] };
    }
  });
  TH('h-fact2', 'Factorising harder quadratics', (lvl = 2) => {
    if (lvl === 3 && Math.random() < .3) { let p, q; do { p = ri(2, 5); q = ri(1, 9); } while (gcd(p, q) !== 1);
      return { q: `Factorise ${quadStr(p * p, 0, -q * q)}`, kind: 'fact2', A: p * p, B: 0, C: -q * q, show: `(${p}x + ${q})(${p}x − ${q})`, hint: 'Type it like (2x + 3)(2x − 3)',
        steps: [`Both terms are squares: ${p * p}x² = (${p}x)² and ${q * q} = ${q}²`, 'The difference of two squares: a² − b² = (a + b)(a − b)', `Answer: (${p}x + ${q})(${p}x − ${q})`] }; }
    for (;;) {
      const p = lvl === 1 ? ri(2, 3) : ri(2, 5), r = lvl === 3 ? ri(2, 3) : 1, q = lvl === 1 ? ri(1, 7) : nz(-7, 7), s = lvl === 1 ? ri(1, 7) : nz(-7, 7);
      if (gcd(p, q) !== 1 || gcd(r, s) !== 1) continue;
      const A = p * r, B = p * s + q * r, C = q * s, m1 = p * s, m2 = q * r; if (!B) continue;
      const f2 = `(${xt(r, s)})`, ans = `(${xt(p, q)})${f2}`;
      return { q: `Factorise ${quadStr(A, B, C)}`, kind: 'fact2', A, B, C, show: ans, hint: 'Type it like (2x + 1)(x − 3)',
        steps: [`Multiply the x² number by the number on its own: ${A} × ${par(C)} = ${A * C}`, `Two numbers that multiply to ${A * C} and add to ${n(B)} are ${n(m1)} and ${n(m2)}`,
          `Split the middle term: ${A}x²${tx(m1)}${tx(m2)}${sg(C)}`, `Factorise in pairs: ${xt(p, 0)}${f2}${Math.abs(q) === 1 ? (q < 0 ? ' − ' : ' + ') : sg(q)}${f2}`, `Answer: ${ans}`] };
    }
  });
  TH('h-algfrac', 'Simplifying algebraic fractions', (lvl = 2) => {
    if (lvl === 1 || Math.random() < .25) { const p = ri(2, 9);
      return { q: `Simplify fully: (x² − ${p * p})/(x + ${p})`, kind: 'lin', v: 'x', a: 1, b: -p, show: `x − ${p}`, hint: 'Type it like x + 3',
        steps: [`The top is a difference of two squares: x² − ${p * p} = (x + ${p})(x − ${p})`, `(x + ${p}) is on the top and the bottom, so cancel it`, `Answer: x − ${p}`] }; }
    let p, q; do { p = nz(-8, 8); q = nz(-8, 8); } while (p === q || p + q === 0);
    const k = lvl === 3 && Math.random() < .5 && gcd(2, Math.abs(p)) === 1 ? 2 : 1, top = quadStr(k, k * q + p, p * q), den = k === 1 ? `x${sg(p)}` : `2x${sg(p)}`;
    return { q: `Simplify fully: (${top})/(${den})`, kind: 'lin', v: 'x', a: 1, b: q, show: `x${sg(q)}`, hint: 'Type it like x + 3',
      steps: [`Factorise the top: ${top} = (${den})(x${sg(q)})`, `(${den}) is on the top and the bottom, so cancel it`, `Answer: x${sg(q)}`] };
  });
  TH('h-qineq', 'Quadratic inequalities', (lvl = 2) => {
    let a, b; do { a = nz(-8, 8); b = nz(-8, 8); } while (a >= b);
    const B = -(a + b), C = a * b, inside = Math.random() < .5, eq = lvl === 3 && Math.random() < .5, sym = inside ? (eq ? '≤' : '<') : (eq ? '≥' : '>');
    const lhs = lvl === 1 ? `(x${sg(-a)})(x${sg(-b)})` : quadStr(1, B, C), show = inside ? `${n(a)} ${sym} x ${sym} ${n(b)}` : `x ${eq ? '≤' : '<'} ${n(a)} or x ${sym} ${n(b)}`;
    return { q: `Solve ${lhs} ${sym} 0`, kind: 'ineq', lo: a, hi: b, inside, eq, show, hint: inside ? 'Type it like −2 < x < 3 (use <= for ≤)' : 'Type it like x < −2 or x > 3 (use >= for ≥)',
      steps: [`Find where it equals 0: (x${sg(-a)})(x${sg(-b)}) = 0, so x = ${n(a)} or x = ${n(b)}`, `The graph is a ∪-shaped curve crossing the x-axis at ${n(a)} and ${n(b)}`,
        inside ? `${sym} 0 means ${eq ? 'on or ' : ''}below the axis, which is between the two values` : `${sym} 0 means ${eq ? 'on or ' : ''}above the axis, which is outside the two values`, `Answer: ${show}`] };
  });
  TH('h-func', 'Composite and inverse functions', (lvl = 2) => {
    const a = ri(2, 5), b = nz(-9, 9), f = `${a}x${sg(b)}`, c = ri(2, 4), d = nz(-6, 6), F = x => a * x + b, Fs = x => `${a} × ${par(x)}${sg(b)}`;
    const G = pick(lvl === 1 ? [0, 1] : [0, 1, 2]), g = [`x²`, `${c}x${sg(d)}`, `x²${sg(d)}`][G], Gv = x => [x * x, c * x + d, x * x + d][G], Gs = x => [`${par(x)}²`, `${c} × ${par(x)}${sg(d)}`, `${par(x)}²${sg(d)}`][G];
    const t = lvl === 1 ? 0 : ri(0, 2), k = nz(-5, 6);
    if (t === 2) { const x0 = nz(-6, 9), v = F(x0);
      return { q: `f(x) = ${f}. Work out f⁻¹(${n(v)}).`, kind: 'num', v: x0, show: n(x0),
        steps: [`f⁻¹ undoes f, so solve ${f} = ${n(v)}`, `${a}x = ${n(v)} − ${par(b)} = ${n(v - b)}`, `x = ${n(v - b)} ÷ ${a} = ${n(x0)}`] }; }
    const intro = `f(x) = ${f} and g(x) = ${g}.`;
    if (t === 0) { const gk = Gv(k), v = F(gk);
      return { q: `${intro} Work out fg(${n(k)}).`, kind: 'num', v, show: n(v),
        steps: [`fg(${n(k)}) means do g first: g(${n(k)}) = ${Gs(k)} = ${n(gk)}`, `Then do f: f(${n(gk)}) = ${Fs(gk)} = ${n(v)}`] }; }
    const fk = F(k), v = Gv(fk);
    return { q: `${intro} Work out gf(${n(k)}).`, kind: 'num', v, show: n(v),
      steps: [`gf(${n(k)}) means do f first: f(${n(k)}) = ${Fs(k)} = ${n(fk)}`, `Then do g: g(${n(fk)}) = ${Gs(fk)} = ${n(v)}`] };
  });
  TH('h-iter', 'Iteration', (lvl = 2) => {
    for (;;) {
      const x0 = pick([1, 1.5, 2, 2.5, 3]), p = ri(2, 9), q = ri(1, 4), steps = lvl === 1 ? 2 : 3;
      const F = pick([[`∛(${p} + ${q}xₙ)`, x => Math.cbrt(p + q * x), x => `∛(${p} + ${q} × ${x})`], [`√(${p} + ${q}/xₙ)`, x => Math.sqrt(p + q / x), x => `√(${p} + ${q}/${x})`],
        [`${p}/(xₙ² + ${q})`, x => p / (x * x + q), x => `${p}/(${x}² + ${q})`]]);
      const xs = [x0]; for (let i = 0; i < steps; i++) xs.push(F[1](xs[i]));
      if (!xs.every(Number.isFinite)) continue;
      const v = rd(xs[steps], 3), show = (i, x) => i === 0 ? String(x) : x.toFixed(6) + '…';
      return { q: `Use the iteration formula xₙ₊₁ = ${F[0]} with x₀ = ${x0} to find x${subN(steps)}. Give your answer to 3 decimal places.`, kind: 'num', v, tol: .0011, show: fd(xs[steps], 3), hint: 'Use the ANS key so nothing is rounded too early',
        steps: [`Start with x₀ = ${x0}`, ...xs.slice(1).map((x, i) => `x${subN(i + 1)} = ${F[2](show(i, xs[i]))} = ${x.toFixed(6)}…`), `To 3 decimal places, x${subN(steps)} = ${fd(xs[steps], 3)}`] };
    }
  });
  TH('h-sine', 'The sine rule', (lvl = 2) => {
    for (;;) {
      if (lvl === 1 || Math.random() < .55) {
        const A = ri(30, 80), B = ri(30, 100); if (A + B > 160) continue;
        const a = ri(5, 20), b = a * Math.sin(B * deg) / Math.sin(A * deg);
        return { q: `In triangle ABC, angle A = ${A}°, angle B = ${B}° and BC = ${a} cm. Work out the length of AC to 1 decimal place.`, pic: pic('tri', [a, b, a * Math.sin((180 - A - B) * deg) / Math.sin(A * deg)], { names: ['A', 'B', 'C'], sides: [a + ' cm', '?', ''], angles: [A + '°', B + '°', ''] }), kind: 'num', v: rd(b, 1), tol: .051, suf: 'cm', show: fd(b, 1) + ' cm',
          steps: ['Each side goes with the angle opposite it: BC is opposite A, and AC is opposite B', 'Sine rule: AC ÷ sin B = BC ÷ sin A', `AC = ${a} × sin ${B}° ÷ sin ${A}°`, `AC = ${b.toFixed(4)}… = ${fd(b, 1)} cm`] };
      }
      const A = ri(40, 110), a = ri(8, 20), b = ri(4, a - 1), sB = b * Math.sin(A * deg) / a, Bd = Math.asin(sB) / deg;
      return { q: `In triangle ABC, angle A = ${A}°, BC = ${a} cm and AC = ${b} cm. Work out angle B to 1 decimal place.`, pic: pic('tri', [a, b, a * Math.sin((180 - A - Bd) * deg) / Math.sin(A * deg)], { names: ['A', 'B', 'C'], sides: [a + ' cm', b + ' cm', ''], angles: [A + '°', '?', ''] }), kind: 'num', v: rd(Bd, 1), tol: .051, suf: '°', show: fd(Bd, 1) + '°',
        steps: ['BC is opposite angle A, and AC is opposite angle B', 'Sine rule for an angle: sin B ÷ AC = sin A ÷ BC', `sin B = ${b} × sin ${A}° ÷ ${a} = ${sB.toFixed(4)}…`, `B = sin⁻¹(${sB.toFixed(4)}…) = ${Bd.toFixed(3)}… = ${fd(Bd, 1)}°`] };
    }
  });
  TH('h-cosine', 'The cosine rule', (lvl = 2) => {
    if (lvl === 1 || Math.random() < .55) {
      const b = ri(4, 15), c = ri(4, 15), A = ri(25, 120), a2 = b * b + c * c - 2 * b * c * Math.cos(A * deg), a = Math.sqrt(a2);
      return { q: `In triangle ABC, AB = ${c} cm, AC = ${b} cm and angle A = ${A}°. Work out the length of BC to 1 decimal place.`, pic: pic('tri', [a, b, c], { names: ['A', 'B', 'C'], sides: ['?', b + ' cm', c + ' cm'], angles: [A + '°', '', ''] }), kind: 'num', v: rd(a, 1), tol: .051, suf: 'cm', show: fd(a, 1) + ' cm',
        steps: ['Two sides and the angle between them: use the cosine rule', 'BC² = AB² + AC² − 2 × AB × AC × cos A', `BC² = ${c}² + ${b}² − 2 × ${c} × ${b} × cos ${A}° = ${a2.toFixed(4)}…`, `BC = √${a2.toFixed(4)}… = ${a.toFixed(4)}… = ${fd(a, 1)} cm`] };
    }
    for (;;) {
      const b = ri(4, 15), c = ri(4, 15), a = ri(Math.abs(b - c) + 2, b + c - 2), num = b * b + c * c - a * a, den = 2 * b * c, Ad = Math.acos(num / den) / deg;
      if (!(Ad > 15 && Ad < 165)) continue;
      return { q: `In triangle ABC, AB = ${c} cm, AC = ${b} cm and BC = ${a} cm. Work out angle A to 1 decimal place.`, pic: pic('tri', [a, b, c], { names: ['A', 'B', 'C'], sides: [a + ' cm', b + ' cm', c + ' cm'], angles: ['?', '', ''] }), kind: 'num', v: rd(Ad, 1), tol: .051, suf: '°', show: fd(Ad, 1) + '°',
        steps: ['Three sides known: use the cosine rule for an angle', 'cos A = (AB² + AC² − BC²) ÷ (2 × AB × AC)', `cos A = (${c}² + ${b}² − ${a}²) ÷ (2 × ${c} × ${b}) = ${num} ÷ ${den}`, `A = cos⁻¹(${num} ÷ ${den}) = ${Ad.toFixed(3)}… = ${fd(Ad, 1)}°`] };
    }
  });
  TH('h-areasin', 'Area of a triangle (½ab sin C)', (lvl = 2) => {
    const a = ri(4, 20), b = ri(4, 20);
    if (lvl === 3 && Math.random() < .4) { const area = rd(.5 * a * b * Math.sin(ri(20, 80) * deg), 1), half = a * b / 2, sC = area / half, Cd = Math.asin(sC) / deg;
      return { q: `A triangle has sides of ${a} cm and ${b} cm and an area of ${area} cm². The angle between those two sides is acute. Work out the angle to 1 decimal place.`, pic: pic('tri', [Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(Cd * deg)), b, a], { sides: ['', b + ' cm', a + ' cm'], angles: ['?', '', ''], inner: 'area ' + area + ' cm²' }), kind: 'num', v: rd(Cd, 1), tol: .051, suf: '°', show: fd(Cd, 1) + '°',
        steps: ['Area = ½ × a × b × sin C', `${area} = ½ × ${a} × ${b} × sin C, which is ${n(half)} × sin C`, `sin C = ${area} ÷ ${n(half)} = ${sC.toFixed(4)}…`, `C = sin⁻¹(${sC.toFixed(4)}…) = ${Cd.toFixed(3)}… = ${fd(Cd, 1)}°`] }; }
    const C = ri(20, 150), A = .5 * a * b * Math.sin(C * deg);
    return { q: `Triangle PQR has PQ = ${a} cm, PR = ${b} cm and angle QPR = ${C}°. Work out its area to 1 decimal place.`, pic: pic('tri', [Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C * deg)), b, a], { names: ['P', 'Q', 'R'], sides: ['', b + ' cm', a + ' cm'], angles: [C + '°', '', ''], inner: 'area ?' }), kind: 'num', v: rd(A, 1), tol: .051, suf: 'cm²', show: fd(A, 1) + ' cm²',
      steps: ['Two sides and the angle between them: area = ½ab sin C', `Area = ½ × ${a} × ${b} × sin ${C}°`, `Area = ${A.toFixed(4)}… = ${fd(A, 1)} cm²`] };
  });
  TH('h-bounds', 'Upper and lower bounds', (lvl = 2) => {
    const t = lvl === 1 ? 0 : ri(1, 3), up = Math.random() < .5, UL = up ? 'upper' : 'lower', pm = up ? '+' : '−';
    if (t === 0) { let x10; do x10 = ri(21, 99); while (x10 % 10 === 0); const x = x10 / 10, v = clean(x + (up ? .05 : -.05));
      return { q: `A length is ${n(x)} cm, correct to 1 decimal place. Write down its ${UL} bound.`, kind: 'num', v, suf: 'cm', show: n(v) + ' cm',
        steps: ['Correct to 1 decimal place means it could be up to 0.05 either side (half of 0.1)', `${up ? 'Upper' : 'Lower'} bound: ${n(x)} ${pm} 0.05 = ${n(v)}`] }; }
    if (t === 1) { const w = ri(4, 20), hh = ri(3, 15), W = w + (up ? .5 : -.5), H = hh + (up ? .5 : -.5), v = W * H;
      return { q: `A rectangle measures ${w} cm by ${hh} cm, each correct to the nearest cm. Work out the ${UL} bound for its area.`, pic: pic('rect', w, hh, w + ' cm', hh + ' cm'), kind: 'num', v, suf: 'cm²', show: n(v) + ' cm²',
        steps: [`The ${UL} bounds of the sides: ${w} ${pm} 0.5 = ${n(W)}   and   ${hh} ${pm} 0.5 = ${n(H)}`, `${up ? 'Biggest' : 'Smallest'} area: ${n(W)} × ${n(H)} = ${n(v)} cm²`] }; }
    if (t === 2) { const d = ri(10, 60) * 10, s = ri(20, 90), D = d + (up ? 5 : -5), Tm = s + (up ? -.5 : .5), v = D / Tm;
      return { q: `A runner covers ${d} m, correct to the nearest 10 m, in ${s} seconds, correct to the nearest second. Work out the ${UL} bound for the average speed. Give your answer to 2 decimal places.`, kind: 'num', v: rd(v, 2), tol: .0051, suf: 'm/s', show: fd(v, 2) + ' m/s',
        steps: [`Distance: between ${d - 5} m and ${d + 5} m. Time: between ${s - .5} s and ${s + .5} s`, `Speed = distance ÷ time. The ${up ? 'biggest' : 'smallest'} speed uses the ${up ? 'biggest distance and the smallest time' : 'smallest distance and the biggest time'}`,
          `${up ? 'Upper' : 'Lower'} bound = ${D} ÷ ${Tm} = ${v.toFixed(4)}… = ${fd(v, 2)} m/s`] }; }
    const a = ri(30, 90), b = ri(10, a - 5), A = a + (up ? .5 : -.5), Bb = b + (up ? -.5 : .5), v = A - Bb;
    return { q: `Two lengths are ${a} cm and ${b} cm, each correct to the nearest cm. Work out the ${UL} bound for the difference between them.`, kind: 'num', v, suf: 'cm', show: n(v) + ' cm',
      steps: [`To make the difference ${up ? 'biggest' : 'smallest'}, take the ${UL} bound of the longer length and the ${up ? 'lower' : 'upper'} bound of the shorter`, `${n(A)} − ${n(Bb)} = ${n(v)} cm`] };
  });
  TH('h-prop', 'Direct and inverse proportion', (lvl = 2) => {
    const f = pick(lvl === 1 ? ['x', 'x²'] : ['x', 'x²', 'x³', '√x', '1/x', '1/x²']), inv = f[0] === '1', pw = { x: 1, 'x²': 2, 'x³': 3, '√x': .5, '1/x': 1, '1/x²': 2 }[f];
    let x0, x1; do { x0 = f === '√x' ? ri(1, 10) ** 2 : ri(2, inv ? 6 : 10); x1 = f === '√x' ? ri(1, 12) ** 2 : ri(2, inv ? 6 : 10); } while (x0 === x1);
    const P = x => Math.round(x ** pw), k = inv ? ri(1, 4) * lcm(P(x0), P(x1)) : ri(2, 9), y0 = inv ? k / P(x0) : k * P(x0), y1 = inv ? k / P(x1) : k * P(x1);
    const what = { x: 'x', 'x²': 'the square of x', 'x³': 'the cube of x', '√x': 'the square root of x', '1/x': 'x', '1/x²': 'the square of x' }[f], eqn = inv ? `y = k/${f.slice(2)}` : `y = k${f}`;
    const val = x => ({ x: String(x), 'x²': `${x}²`, 'x³': `${x}³`, '√x': `√${x}`, '1/x': String(x), '1/x²': `${x}²` })[f];
    const steps = [`Write it as an equation: ${eqn}`];
    if (f === 'x³' || f === '√x') steps.push(`${val(x0)} = ${P(x0)}   and   ${val(x1)} = ${P(x1)}`);
    if (inv) steps.push(`Put in x = ${x0} and y = ${y0}: k = ${y0} × ${P(x0)} = ${k}`, `When x = ${x1}: y = ${k} ÷ ${P(x1)} = ${n(y1)}`);
    else steps.push(`Put in x = ${x0} and y = ${y0}: k = ${y0} ÷ ${P(x0)} = ${k}`, `When x = ${x1}: y = ${k} × ${P(x1)} = ${n(y1)}`);
    return { q: `y is ${inv ? 'inversely' : 'directly'} proportional to ${what}. When x = ${x0}, y = ${n(y0)}. Work out y when x = ${x1}.`, kind: 'num', v: y1, show: n(y1), steps };
  });
  TH('h-cond', 'Probability without replacement', (lvl = 2) => {
    const c = pick([['red', 'blue'], ['green', 'yellow'], ['black', 'white']]), r = ri(2, 7), b = ri(2, 7), T = r + b, t = lvl === 1 ? 0 : ri(0, lvl === 3 ? 2 : 1), den = T * (T - 1);
    const num = t === 0 ? r * (r - 1) : t === 1 ? 2 * r * b : r * (r - 1) + b * (b - 1), [sn, sd] = simp(num, den);
    const ask = t === 0 ? `both are ${c[0]}` : t === 1 ? 'one of each colour is taken' : 'both are the same colour';
    const steps = t === 0 ? [`First ${c[0]}: ${r}/${T}`, `One ${c[0]} has gone, so ${r - 1} of the ${T - 1} left are ${c[0]}: ${r - 1}/${T - 1}`, `Multiply along the branches: ${r}/${T} × ${r - 1}/${T - 1} = ${num}/${den}`]
      : t === 1 ? [`${cap(c[0])} then ${c[1]}: ${r}/${T} × ${b}/${T - 1} = ${r * b}/${den}`, `${cap(c[1])} then ${c[0]}: ${b}/${T} × ${r}/${T - 1} = ${r * b}/${den}`, `Add the two ways: ${r * b}/${den} + ${r * b}/${den} = ${num}/${den}`]
      : [`Both ${c[0]}: ${r}/${T} × ${r - 1}/${T - 1} = ${r * (r - 1)}/${den}`, `Both ${c[1]}: ${b}/${T} × ${b - 1}/${T - 1} = ${b * (b - 1)}/${den}`, `Add them: ${r * (r - 1)}/${den} + ${b * (b - 1)}/${den} = ${num}/${den}`];
    if (sd !== den) steps.push(`Simplify: ${num}/${den} = ${fs(sn, sd)}`);
    return { q: `A bag has ${r} ${c[0]} and ${b} ${c[1]} counters. Two counters are taken at random, without replacement. What is the probability that ${ask}?`, pic: pic('tree', c, r, b), kind: 'frac', n: sn, d: sd, simplest: false, show: fs(sn, sd), hint: 'Type a fraction like 5/14', steps };
  });
  TH('h-circle', 'Circles: equations and tangents', (lvl = 2) => {
    const [p, q0, r] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15]]), sw = Math.random() < .5, x = (sw ? q0 : p) * pick([1, -1]), y = (sw ? p : q0) * pick([1, -1]), t = lvl === 1 ? 0 : lvl === 2 ? ri(0, 1) : ri(1, 2);
    if (t === 0) return { q: `A circle has equation x² + y² = ${r * r}. What is its radius?`, pic: pic('circle', r * r, null), kind: 'num', v: r, show: String(r),
      steps: ['x² + y² = r² is a circle with its centre at (0, 0) and radius r', `r² = ${r * r}, so r = √${r * r} = ${r}`] };
    const [gn, gd] = simp(y, x), [tn, td] = simp(-x, y), pt = `(${n(x)}, ${n(y)})`, eq = `x² + y² = ${r * r}`;
    const steps = [`Gradient of the radius from (0, 0) to ${pt}: ${n(y)} ÷ ${par(x)} = ${fs(gn, gd)}`, 'A tangent is at right angles to the radius, so flip the gradient and change its sign', `Gradient of the tangent: ${fs(tn, td)}`];
    if (t === 1) return { q: `The point ${pt} lies on the circle ${eq}. Work out the gradient of the tangent to the circle at this point.`, pic: pic('circle', r * r, [x, y], true), kind: 'frac', n: tn, d: td, simplest: false, show: fs(tn, td), hint: 'Type a fraction like −3/4', steps };
    const [cn, cd] = simp(r * r, y);
    return { q: `The point ${pt} lies on the circle ${eq}. The tangent at this point crosses the y-axis at (0, c). Work out c.`, pic: pic('circle', r * r, [x, y], true), kind: 'frac', n: cn, d: cd, simplest: false, show: fs(cn, cd), hint: 'Type a fraction like 25/4',
      steps: [...steps, `Use y = mx + c through ${pt}: ${n(y)} = ${pf(tn, td)} × ${par(x)} + c`, `c = ${n(y)} − ${pf(tn, td)} × ${par(x)} = ${fs(cn, cd)}`] };
  });
  TH('h-perp', 'Perpendicular lines', (lvl = 2) => {
    const [mn, md] = pick([[2, 1], [3, 1], [4, 1], [5, 1], [-2, 1], [-3, 1], [1, 2], [1, 3], [-1, 2], [2, 3], [-3, 4], [3, 4], [-1, 1], [1, 1]]), [pn, pd] = simp(-md, mn), c0 = nz(-9, 9);
    const L = `y = ${gradStr(mn, md)}x${sg(c0)}`;
    if (lvl === 1 || Math.random() < .4) return { q: `A line has equation ${L}. Write down the gradient of a line perpendicular to it.`, pic: pic('line', mn / md, c0, L), kind: 'frac', n: pn, d: pd, simplest: false, show: fs(pn, pd), hint: 'Type a whole number or a fraction like −1/2',
      steps: ['Perpendicular gradients multiply to −1', `Flip the gradient and change its sign: ${fs(...simp(mn, md))} becomes ${fs(pn, pd)}`, `Check: ${pf(mn, md)} × ${pf(pn, pd)} = −1`] };
    const x1 = nz(-4, 4) * pd, y1 = nz(-9, 9), c = y1 - pn * x1 / pd, ans = `y = ${gradStr(pn, pd)}x${c ? sg(c) : ''}`;
    return { q: `Line L has equation ${L}. Find the equation of the line that is perpendicular to L and passes through (${n(x1)}, ${n(y1)}).`, pic: pic('line', mn / md, c0, 'L', [x1, y1]), kind: 'line', gm: pn / pd, gc: c, show: ans, hint: 'Type it like y = −2x + 5 (y = 1/2x + 3 is fine)',
      steps: [`The gradient of L is ${fs(...simp(mn, md))}, so the perpendicular gradient is ${fs(pn, pd)}`, `Use y = mx + c through (${n(x1)}, ${n(y1)}): ${n(y1)} = ${pf(pn, pd)} × ${par(x1)} + c`, `c = ${n(y1)} − ${pf(pn, pd)} × ${par(x1)} = ${n(c)}`, `Answer: ${ans}`] };
  });
  TH('h-qseq', 'Quadratic sequences: nth term', (lvl = 2) => {
    const a = lvl === 1 ? 1 : pick(lvl === 3 ? [1, 2, 3, -1, -2] : [1, 2, 3]), b = ri(-6, 6), c = ri(-6, 6), T = k => a * k * k + b * k + c, ks = [1, 2, 3, 4, 5], terms = ks.map(T);
    const d1 = ks.slice(1).map(k => T(k) - T(k - 1)), rest = ks.map(k => T(k) - a * k * k), an = polyStr([0, 0, a], 'n'), ans = polyStr([c, b, a], 'n');
    return { q: `Find the nth term of the quadratic sequence ${terms.map(n).join(', ')}, …`, kind: 'poly', v: 'n', co: [c, b, a], show: ans, hint: 'Type it like 2n^2 + 3n − 1',
      steps: [`First differences: ${d1.map(n).join(', ')}`, `The second difference is ${n(2 * a)}, so the n² number is ${n(2 * a)} ÷ 2 = ${n(a)}`, `Take ${an} away from each term: ${rest.map(n).join(', ')}`,
        `What is left is linear, with nth term ${polyStr([c, b], 'n')}`, `nth term: ${ans}`] };
  });
  TH('h-expand3', 'Expanding triple brackets', (lvl = 2) => {
    const a = nz(lvl === 1 ? 1 : -6, 6), b = nz(lvl === 1 ? 1 : -6, 6), c = nz(lvl === 1 ? 1 : -6, 6), two = [a * b, a + b, 1], co = [a * b * c, a * b + c * (a + b), a + b + c, 1];
    return { q: `Expand and simplify (x${sg(a)})(x${sg(b)})(x${sg(c)})`, kind: 'poly', v: 'x', co, show: polyStr(co), hint: 'Type it like x^3 + 2x^2 − 5x − 6',
      steps: [`Expand the first two brackets: (x${sg(a)})(x${sg(b)}) = ${polyStr(two)}`, `Multiply by x: ${polyStr([0, ...two])}`, `Multiply by ${n(c)}: ${polyStr(two.map(v => v * c))}`, `Collect like terms: ${polyStr(co)}`] };
  });
  TH('h-transf', 'Transforming graphs', (lvl = 2) => {
    const px = nz(-5, 5), py = nz(-5, 5), k = nz(-4, 4), t = ri(0, lvl === 1 ? 1 : 3);
    const [g, [x, y], why] = [[`y = f(x)${sg(k)}`, [px, py + k], `Adding ${n(k)} outside f moves the graph ${k > 0 ? 'up' : 'down'} by ${Math.abs(k)}`],
      [`y = f(x${sg(k)})`, [px - k, py], `Adding ${n(k)} inside the bracket moves the graph ${k > 0 ? 'left' : 'right'} by ${Math.abs(k)}: the opposite way to the sign`],
      ['y = −f(x)', [px, -py], 'A minus sign outside f reflects the graph in the x-axis, so the y-coordinate changes sign'],
      ['y = f(−x)', [-px, py], 'A minus sign inside the bracket reflects the graph in the y-axis, so the x-coordinate changes sign']][t];
    return { q: `The graph of y = f(x) has a turning point at (${n(px)}, ${n(py)}). Write down the coordinates of the turning point of the graph of ${g}.`, pic: pic('turning', px, py), kind: 'pair', x, y, show: `(${n(x)}, ${n(y)})`, hint: 'Type it like (3, −2)',
      steps: [why, `(${n(px)}, ${n(py)}) moves to (${n(x)}, ${n(y)})`] };
  });
  TH('h-simsh', 'Similar shapes: area and volume', (lvl = 2) => {
    const t = lvl === 1 ? ri(0, 1) : lvl === 2 ? ri(0, 1) : ri(1, 2);
    if (t === 2) { const [p, q] = pick([[1, 2], [1, 3], [2, 3], [2, 5], [4, 5], [1, 4]]), m = ri(1, 6), j = ri(1, 5), s1 = m * p * p, s2 = m * q * q, V1 = j * p ** 3, V2 = j * q ** 3, k = q / p;
      return { q: `Two similar solids have surface areas of ${s1} cm² and ${s2} cm². The smaller solid has a volume of ${V1} cm³. Work out the volume of the larger solid.`, pic: pic('similar', k, true, '', '', `${s1} cm², ${V1} cm³`, `${s2} cm², V = ?`), kind: 'num', v: V2, suf: 'cm³', show: V2 + ' cm³',
        steps: [`Area scale factor: ${s2} ÷ ${s1} = ${n(k * k)}`, `Length scale factor: √${n(k * k)} = ${n(k)}`, `Volume scale factor: ${n(k)}³ = ${n(k ** 3)}`, `Volume: ${V1} × ${n(k ** 3)} = ${V2} cm³`] }; }
    const k = pick(lvl === 1 ? [2, 3, 4] : [2, 3, 4, 1.5, 2.5]), l1 = ri(2, 8) * 2, l2 = l1 * k;
    if (t === 0) { const A1 = ri(3, 30), A2 = clean(A1 * k * k);
      return { q: `Two similar shapes have matching lengths of ${l1} cm and ${n(l2)} cm. The smaller shape has an area of ${A1} cm². Work out the area of the larger shape.`, pic: pic('similar', k, false, l1 + ' cm', n(l2) + ' cm', A1 + ' cm²', 'area ?'), kind: 'num', v: A2, suf: 'cm²', show: n(A2) + ' cm²',
        steps: [`Length scale factor: ${n(l2)} ÷ ${l1} = ${n(k)}`, `Area scale factor: ${n(k)}² = ${n(k * k)}`, `Area: ${A1} × ${n(k * k)} = ${n(A2)} cm²`] }; }
    const V1 = ri(2, 20) * 8, V2 = clean(V1 * k ** 3);
    return { q: `Two similar solids have matching lengths of ${l1} cm and ${n(l2)} cm. The smaller solid has a volume of ${V1} cm³. Work out the volume of the larger solid.`, pic: pic('similar', k, true, l1 + ' cm', n(l2) + ' cm', 'V = ' + V1 + ' cm³', 'V = ?'), kind: 'num', v: V2, suf: 'cm³', show: n(V2) + ' cm³',
      steps: [`Length scale factor: ${n(l2)} ÷ ${l1} = ${n(k)}`, `Volume scale factor: ${n(k)}³ = ${n(clean(k ** 3))}`, `Volume: ${V1} × ${n(clean(k ** 3))} = ${n(V2)} cm³`] };
  });
  TH('h-histo', 'Histograms', (lvl = 2) => {
    for (;;) {
      const lo = ri(0, 8) * 5, w = pick([5, 10, 15, 20, 25, 30, 40]), hi = lo + w, fd0 = pick([0.4, 0.6, 0.8, 1.2, 1.5, 2, 2.4, 3, 3.5, 4, 5]), f = clean(fd0 * w);
      if (!Number.isInteger(f)) continue;
      if (lvl === 1 || Math.random() < .5) return { q: `In a histogram, the class ${lo} < t ≤ ${hi} has a frequency of ${f}. Work out the frequency density for this class.`, pic: pic('histo', lo, hi, null, f), kind: 'num', v: fd0, show: n(fd0),
        steps: ['Frequency density = frequency ÷ class width', `Class width: ${hi} − ${lo} = ${w}`, `Frequency density: ${f} ÷ ${w} = ${n(fd0)}`] };
      return { q: `In a histogram, the bar for the class ${lo} < t ≤ ${hi} has a frequency density of ${n(fd0)}. How many are in this class?`, pic: pic('histo', lo, hi, fd0, null), kind: 'num', v: f, show: String(f),
        steps: ['Frequency = frequency density × class width', `Class width: ${hi} − ${lo} = ${w}`, `Frequency: ${n(fd0)} × ${w} = ${f}`] };
    }
  });
  TH('h-3d', 'Pythagoras and trigonometry in 3D', (lvl = 2) => {
    if (lvl === 3 && Math.random() < .5) { const a = ri(3, 12), b = ri(3, 12), c = ri(2, 10), base = Math.sqrt(a * a + b * b), th = Math.atan(c / base) / deg;
      return { q: `A cuboid measures ${a} cm by ${b} cm and is ${c} cm high. Work out the angle between the longest diagonal and the base, to 1 decimal place.`, pic: pic('cuboid', a, c, b, { w: a + ' cm', h: c + ' cm', d: b + ' cm' }, { base: true }), kind: 'num', v: rd(th, 1), tol: .051, suf: '°', show: fd(th, 1) + '°',
        steps: [`Diagonal of the base: √(${a}² + ${b}²) = √${a * a + b * b} = ${base.toFixed(4)}…`, `The height, ${c} cm, is opposite the angle and the base diagonal is next to it`, `tan θ = ${c} ÷ ${base.toFixed(4)}…`, `θ = ${th.toFixed(3)}… = ${fd(th, 1)}°`] }; }
    const exact = lvl === 1 || Math.random() < .4, [a, b, c, e] = exact ? pick([[2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [3, 4, 12, 13], [2, 10, 11, 15], [4, 4, 7, 9], [6, 6, 7, 11], [1, 2, 2, 3], [4, 8, 8, 12], [2, 5, 14, 15], [8, 9, 12, 17]]) : [ri(2, 15), ri(2, 15), ri(2, 15), 0];
    const S2 = a * a + b * b + c * c, d = Math.sqrt(S2);
    return { q: `A cuboid measures ${a} cm by ${b} cm by ${c} cm. Work out the length of its longest diagonal (from one corner to the opposite corner)${exact ? '' : ', to 1 decimal place'}.`, pic: pic('cuboid', a, c, b, { w: a + ' cm', h: c + ' cm', d: b + ' cm', top: 'diagonal = ?' }, { diag: true }), kind: 'num', v: exact ? e : rd(d, 1), tol: exact ? undefined : .051, suf: 'cm', show: (exact ? e : fd(d, 1)) + ' cm',
      steps: ['In 3D: diagonal² = length² + width² + height²', `d² = ${a}² + ${b}² + ${c}² = ${S2}`, exact ? `d = √${S2} = ${e} cm` : `d = √${S2} = ${d.toFixed(4)}… = ${fd(d, 1)} cm`] };
  });
  TH('h-simq', 'Simultaneous equations (one quadratic)', (lvl = 2) => {
    for (;;) {
      const m = nz(-3, 4), k = nz(-6, 6), r1 = nz(-5, 5), r2 = nz(-5, 5); if (r1 >= r2) continue;
      const b = m - (r1 + r2), c = k + r1 * r2, y1 = m * r1 + k, y2 = m * r2 + k, line = `${m === 1 ? '' : m === -1 ? '−' : n(m)}x${sg(k)}`, Q = quadStr(1, b, c);
      return { q: `Solve the simultaneous equations y = ${Q} and y = ${line}`, kind: 'pairs', sols: [[r1, y1], [r2, y2]], show: `x = ${n(r1)}, y = ${n(y1)} or x = ${n(r2)}, y = ${n(y2)}`, hint: 'Type both pairs, like x = 1, y = 3 or x = −2, y = 0',
        steps: [`Both equal y, so ${Q} = ${line}`, `Rearrange so one side is 0: ${quadStr(1, b - m, c - k)} = 0`, `Factorise: (x${sg(-r1)})(x${sg(-r2)}) = 0, so x = ${n(r1)} or x = ${n(r2)}`,
          `Put each x into y = ${line}: y = ${n(m)} × ${par(r1)}${sg(k)} = ${n(y1)}   and   y = ${n(m)} × ${par(r2)}${sg(k)} = ${n(y2)}`, `Answer: ${`x = ${n(r1)}, y = ${n(y1)} or x = ${n(r2)}, y = ${n(y2)}`}`] };
    }
  });


  /* ---------- Physics: AQA equations to recall, forwards and rearranged ---------- */
  const P = {};
  const E = (id, name, eq, out, ins, sub, re, f) => { P[id] = { id, name, eq, out, ins, sub, re, f }; };
  E('weight', 'Weight', 'W = m × g', ['W', 'W', 'weight', 'N'], [['m', 'm', 'mass', 'kg', [2, 5, 8, 10, 15, 20, 50, 60, 75]], ['g', 'g', 'gravitational field strength', 'N/kg', [9.8]]], '{m} × {g}', { m: ['m = W ÷ g', '{W} ÷ {g}'] }, v => v.m * v.g);
  E('work', 'Work done', 'W = F × s', ['W', 'W', 'work done', 'J'], [['F', 'F', 'force', 'N', [5, 10, 20, 25, 40, 50, 100, 250]], ['s', 's', 'distance', 'm', [2, 3, 4, 5, 8, 10, 12, 20]]], '{F} × {s}', { F: ['F = W ÷ s', '{W} ÷ {s}'], s: ['s = W ÷ F', '{W} ÷ {F}'] }, v => v.F * v.s);
  E('spring', 'Spring force', 'F = k × e', ['F', 'F', 'force', 'N'], [['k', 'k', 'spring constant', 'N/m', [20, 25, 40, 50, 100, 200]], ['e', 'e', 'extension', 'm', [.02, .05, .1, .15, .2, .3]]], '{k} × {e}', { k: ['k = F ÷ e', '{F} ÷ {e}'], e: ['e = F ÷ k', '{F} ÷ {k}'] }, v => v.k * v.e);
  E('speed', 'Speed', 'v = s ÷ t', ['v', 'v', 'speed', 'm/s'], [['s', 's', 'distance', 'm', [100, 200, 400, 600, 1000, 1500, 3000]], ['t', 't', 'time', 's', [10, 20, 25, 40, 50, 100, 200]]], '{s} ÷ {t}', { s: ['s = v × t', '{v} × {t}'], t: ['t = s ÷ v', '{s} ÷ {v}'] }, v => v.s / v.t);
  E('accel', 'Acceleration', 'a = Δv ÷ t', ['a', 'a', 'acceleration', 'm/s²'], [['dv', 'Δv', 'change in velocity', 'm/s', [2, 4, 5, 6, 10, 12, 15, 20, 30]], ['t', 't', 'time', 's', [2, 4, 5, 10, 20]]], '{dv} ÷ {t}', { dv: ['Δv = a × t', '{a} × {t}'], t: ['t = Δv ÷ a', '{dv} ÷ {a}'] }, v => v.dv / v.t);
  E('newton2', 'Resultant force', 'F = m × a', ['F', 'F', 'resultant force', 'N'], [['m', 'm', 'mass', 'kg', [.5, 2, 5, 10, 50, 800, 1200]], ['a', 'a', 'acceleration', 'm/s²', [.5, 2, 3, 4, 5, 10]]], '{m} × {a}', { m: ['m = F ÷ a', '{F} ÷ {a}'], a: ['a = F ÷ m', '{F} ÷ {m}'] }, v => v.m * v.a);
  E('momentum', 'Momentum', 'p = m × v', ['p', 'p', 'momentum', 'kg m/s'], [['m', 'm', 'mass', 'kg', [.2, 2, 5, 60, 80, 1000, 1500]], ['v', 'v', 'velocity', 'm/s', [2, 3, 5, 10, 15, 20, 25]]], '{m} × {v}', { m: ['m = p ÷ v', '{p} ÷ {v}'], v: ['v = p ÷ m', '{p} ÷ {m}'] }, v => v.m * v.v);
  E('ke', 'Kinetic energy', 'Eₖ = ½ × m × v²', ['E', 'Eₖ', 'kinetic energy', 'J'], [['m', 'm', 'mass', 'kg', [2, 4, 10, 50, 60, 1000]], ['v', 'v', 'speed', 'm/s', [2, 3, 4, 5, 10, 20]]], '½ × {m} × {v}²', { m: ['m = 2 × Eₖ ÷ v²', '2 × {E} ÷ {v}²'], v: ['v = √(2 × Eₖ ÷ m)', '√(2 × {E} ÷ {m})'] }, v => .5 * v.m * v.v * v.v);
  E('gpe', 'Gravitational potential energy', 'Eₚ = m × g × h', ['E', 'Eₚ', 'gravitational potential energy', 'J'], [['m', 'm', 'mass', 'kg', [2, 5, 10, 50, 60]], ['g', 'g', 'gravitational field strength', 'N/kg', [9.8]], ['h', 'h', 'height', 'm', [2, 5, 10, 20, 50]]], '{m} × {g} × {h}', { m: ['m = Eₚ ÷ (g × h)', '{E} ÷ ({g} × {h})'], h: ['h = Eₚ ÷ (m × g)', '{E} ÷ ({m} × {g})'] }, v => v.m * v.g * v.h);
  E('power-e', 'Power (energy)', 'P = E ÷ t', ['P', 'P', 'power', 'W'], [['E', 'E', 'energy transferred', 'J', [600, 1200, 3000, 6000, 12000, 36000]], ['t', 't', 'time', 's', [10, 20, 30, 60, 120, 300]]], '{E} ÷ {t}', { E: ['E = P × t', '{P} × {t}'], t: ['t = E ÷ P', '{E} ÷ {P}'] }, v => v.E / v.t);
  E('charge', 'Charge', 'Q = I × t', ['Q', 'Q', 'charge', 'C'], [['I', 'I', 'current', 'A', [.2, .5, 1.5, 2, 3, 5, 10]], ['t', 't', 'time', 's', [10, 20, 30, 60, 120, 300]]], '{I} × {t}', { I: ['I = Q ÷ t', '{Q} ÷ {t}'], t: ['t = Q ÷ I', '{Q} ÷ {I}'] }, v => v.I * v.t);
  E('ohm', 'Potential difference', 'V = I × R', ['V', 'V', 'potential difference', 'V'], [['I', 'I', 'current', 'A', [.1, .2, .5, 1.5, 2, 3, 4]], ['R', 'R', 'resistance', 'Ω', [2, 5, 10, 12, 20, 50, 100]]], '{I} × {R}', { I: ['I = V ÷ R', '{V} ÷ {R}'], R: ['R = V ÷ I', '{V} ÷ {I}'] }, v => v.I * v.R);
  E('power-vi', 'Power (electrical)', 'P = V × I', ['P', 'P', 'power', 'W'], [['V', 'V', 'potential difference', 'V', [3, 6, 12, 230]], ['I', 'I', 'current', 'A', [.5, 1.5, 2, 3, 5, 10, 13]]], '{V} × {I}', { V: ['V = P ÷ I', '{P} ÷ {I}'], I: ['I = P ÷ V', '{P} ÷ {V}'] }, v => v.V * v.I);
  E('power-ir', 'Power (resistance)', 'P = I² × R', ['P', 'P', 'power', 'W'], [['I', 'I', 'current', 'A', [.5, 2, 3, 4, 5, 10]], ['R', 'R', 'resistance', 'Ω', [2, 4, 5, 10, 20, 50]]], '{I}² × {R}', { R: ['R = P ÷ I²', '{P} ÷ {I}²'], I: ['I = √(P ÷ R)', '√({P} ÷ {R})'] }, v => v.I * v.I * v.R);
  E('energy-pt', 'Energy transferred (power)', 'E = P × t', ['E', 'E', 'energy transferred', 'J'], [['P', 'P', 'power', 'W', [60, 100, 500, 1000, 2000, 3000]], ['t', 't', 'time', 's', [10, 30, 60, 120, 600]]], '{P} × {t}', { P: ['P = E ÷ t', '{E} ÷ {t}'], t: ['t = E ÷ P', '{E} ÷ {P}'] }, v => v.P * v.t);
  E('energy-qv', 'Energy transferred (charge)', 'E = Q × V', ['E', 'E', 'energy transferred', 'J'], [['Q', 'Q', 'charge', 'C', [2, 5, 10, 20, 50, 100, 500]], ['V', 'V', 'potential difference', 'V', [1.5, 3, 6, 9, 12, 230]]], '{Q} × {V}', { Q: ['Q = E ÷ V', '{E} ÷ {V}'], V: ['V = E ÷ Q', '{E} ÷ {Q}'] }, v => v.Q * v.V);
  E('density', 'Density', 'ρ = m ÷ V', ['rho', 'ρ', 'density', 'kg/m³'], [['m', 'm', 'mass', 'kg', [.4, .8, 1.2, 2, 2.7, 5.4, 7.8]], ['V', 'V', 'volume', 'm³', [.0002, .0005, .001, .002]]], '{m} ÷ {V}', { m: ['m = ρ × V', '{rho} × {V}'], V: ['V = m ÷ ρ', '{m} ÷ {rho}'] }, v => v.m / v.V);
  E('wave', 'Wave speed', 'v = f × λ', ['v', 'v', 'wave speed', 'm/s'], [['f', 'f', 'frequency', 'Hz', [2, 5, 10, 50, 100, 200, 500, 1000]], ['lam', 'λ', 'wavelength', 'm', [.1, .2, .5, 1.5, 2, 3, 4]]], '{f} × {lam}', { f: ['f = v ÷ λ', '{v} ÷ {lam}'], lam: ['λ = v ÷ f', '{v} ÷ {f}'] }, v => v.f * v.lam);

  const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => n(v[k]));
  /* a labelled sketch for the physics equations that have one in pics.js; the unknown is "?" */
  const physPic = (e, v, find) => typeof PIC === 'undefined' ? undefined : PIC.phys(e.id, Object.fromEntries([e.out, ...e.ins].map(i => [i[0], i[0] === find ? '?' : `${n(v[i[0]])} ${i[3]}`]))) || undefined;
  function genPhys(e) {
    const v = {}; for (const [k, , , , vals] of e.ins) v[k] = pick(vals);
    const [ok, osym, oname, ounit] = e.out; v[ok] = clean(e.f(v));
    const keys = Object.keys(e.re), desc = list => list.map(i => `${i[1]} = ${n(v[i[0]])} ${i[3]}`).join(', ');
    if (!keys.length || Math.random() < .5)
      return { q: `Find the ${oname} when ${desc(e.ins)}.`, sub: e.name, pic: physPic(e, v, ok), kind: 'num', v: v[ok], dm: { pid: e.id, v, find: ok }, rel: .005, suf: ounit, show: `${n(v[ok])} ${ounit}`,
        steps: [`Equation: ${e.eq}`, `${osym} = ${fill(e.sub, v)}`, `= ${n(v[ok])} ${ounit}`] };
    const k = pick(keys), inn = e.ins.find(i => i[0] === k), known = [[ok, osym, oname, ounit], ...e.ins.filter(i => i[0] !== k)];
    return { q: `Find the ${inn[2]} when ${desc(known)}.`, sub: e.name + ' · rearranging', pic: physPic(e, v, k), kind: 'num', v: v[k], dm: { pid: e.id, v, find: k }, rel: .005, suf: inn[3], show: `${n(v[k])} ${inn[3]}`,
      steps: [`Equation: ${e.eq}`, `Rearrange: ${e.re[k][0]}`, `${inn[1]} = ${fill(e.re[k][1], v)}`, `= ${n(v[k])} ${inn[3]}`] };
  }

  /* ---------- Quotes: fill the missing word ---------- */
  const STOP = new Set('that this with from your have will what which their there these those they them then than into upon shall would could should been were when where while more most only very such some each other being make made much many like just also over here thee thou thy thine hath doth does done unto'.split(' '));
  let quoteSource = () => [];
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function genQuote(deck) {
    const qs = quoteSource(deck).filter(c => /^["“'‘]/.test(c.f.trim()));
    if (!qs.length) return null;
    const [c, key] = choose(qs, x => 'quote|' + x.f), text = c.f.trim().replace(/^["“'‘]+|["”'’!?.]+$/g, '');
    const words = (text.match(/[A-Za-z][A-Za-z']*[A-Za-z]|[A-Za-z]/g) || []);
    let cand = words.filter(w => w.length >= 4 && !STOP.has(w.toLowerCase()));
    if (!cand.length) cand = [...words].sort((a, b) => b.length - a.length).slice(0, 1);
    const w = pick(cand), blank = text.replace(new RegExp(`(^|[^A-Za-z'])${escRe(w)}(?![A-Za-z'])`), `$1${'_'.repeat(Math.max(4, Math.min(9, w.length)))}`);
    return { q: `“${blank}”`, key, sub: 'Fill the missing word', kind: 'word', w, show: w, steps: [`“${text}”`, c.b] };
  }

  /* ---------- Science, Business and Geography calculations ---------- */
  const C = {};
  const CT = (id, subject, name, gen) => { C[id] = { name, subject, gen }; };
  /* ---------- Computer Science: number systems, binary arithmetic, file sizes and logic, worked and checked ---------- */
  const bin8 = v => v.toString(2).padStart(8, '0'), PLACES = [128, 64, 32, 16, 8, 4, 2, 1];
  function toBinarySteps(v) {
    const steps = ['Place values: 128 64 32 16 8 4 2 1. Take away each place value that fits, largest first'];
    let rem = v;
    for (const p of PLACES) if (rem >= p) { steps.push(`${rem} − ${p} = ${rem - p}, so the ${p} column is 1`); rem -= p; }
    steps.push(`Every other column is 0: ${bin8(v)}`);
    return steps;
  }
  CT('cs-binary', 'compsci', 'Binary and denary', (lvl = 2) => {
    const v = lvl === 1 ? ri(1, 31) : lvl === 3 ? ri(128, 255) : ri(16, 200), b = bin8(v);
    if (Math.random() < .5) { const used = PLACES.filter((p, i) => b[i] === '1');
      return { q: `Convert the binary number ${b} to denary.`, kind: 'num', v, show: String(v), steps: ['Write the place values over the bits: 128 64 32 16 8 4 2 1', `Add the place values that have a 1: ${used.join(' + ')} = ${v}`] }; }
    return { q: `Convert ${v} to an 8-bit binary number.`, kind: 'str', mode: 'bits', ans: b, show: b, hint: 'Type 8 digits, like 01101001', steps: toBinarySteps(v) };
  });
  CT('cs-hex', 'compsci', 'Hexadecimal', (lvl = 2) => {
    const v = ri(lvl === 1 ? 16 : 26, 255), H = v.toString(16).toUpperCase().padStart(2, '0'), hi = Math.floor(v / 16), lo = v % 16, dig = d => d.toString(16).toUpperCase(), f = ri(0, lvl === 1 ? 1 : 2);
    if (f === 0) return { q: `Convert the hexadecimal number ${H} to denary.`, kind: 'num', v, show: String(v),
      steps: [`Hex digits: A = 10, B = 11, C = 12, D = 13, E = 14, F = 15`, `${dig(hi)} is worth ${hi} sixteens and ${dig(lo)} is worth ${lo} ones`, `${hi} × 16 + ${lo} = ${v}`] };
    if (f === 1) return { q: `Convert ${v} to hexadecimal.`, kind: 'str', mode: 'hex', ans: H, show: H, hint: 'Type it like 3F',
      steps: [`Divide by 16: ${v} ÷ 16 = ${hi} remainder ${lo}`, `${hi} sixteens is the digit ${dig(hi)}; the remainder ${lo} is the digit ${dig(lo)}`, `Answer: ${H}`] };
    const b = bin8(v);
    return { q: `Convert the binary number ${b} to hexadecimal.`, kind: 'str', mode: 'hex', ans: H, show: H, hint: 'Type it like 3F',
      steps: [`Split into two nibbles: ${b.slice(0, 4)} and ${b.slice(4)}`, `${b.slice(0, 4)} in binary is ${hi}, which is hex ${dig(hi)}`, `${b.slice(4)} in binary is ${lo}, which is hex ${dig(lo)}`, `Answer: ${H}`] };
  });
  CT('cs-add', 'compsci', 'Binary addition and shifts', (lvl = 2) => {
    if (Math.random() < .6) {
      const a = ri(lvl === 1 ? 1 : 20, lvl === 1 ? 40 : 120), b = ri(lvl === 1 ? 1 : 20, Math.min(255 - a, lvl === 1 ? 40 : 135)), s = a + b;
      return { q: `Add these binary numbers: ${bin8(a)} + ${bin8(b)}. Give an 8-bit answer.`, kind: 'str', mode: 'bits', ans: bin8(s), show: bin8(s), hint: 'Type 8 digits',
        steps: ['Add column by column from the right: 0 + 0 = 0, 1 + 0 = 1, 1 + 1 = 10 (write 0, carry 1), 1 + 1 + 1 = 11 (write 1, carry 1)', `Check in denary: ${a} + ${b} = ${s}`, `${s} in binary is ${bin8(s)}`] };
    }
    const k = ri(1, 2), left = Math.random() < .5, v = left ? ri(1, Math.floor(255 / (1 << k))) : ri(4, 255) & ~((1 << k) - 1), r = left ? v << k : v >> k;
    return { q: `Apply a ${k}-place ${left ? 'left' : 'right'} shift to ${bin8(v)}.`, kind: 'str', mode: 'bits', ans: bin8(r), show: bin8(r), hint: 'Type 8 digits',
      steps: [`Move every bit ${k} place${k > 1 ? 's' : ''} to the ${left ? 'left' : 'right'}, filling the gap with 0${k > 1 ? 's' : ''}`, `A ${left ? 'left' : 'right'} shift of ${k} ${left ? 'multiplies' : 'divides'} by ${1 << k}: ${v} ${left ? '×' : '÷'} ${1 << k} = ${r}`, `Answer: ${bin8(r)}`] };
  });
  CT('cs-size', 'compsci', 'File size calculations', (lvl = 2) => {
    if (Math.random() < .5) {
      const w = pick([8, 16, 20, 40, 64, 100, 200]), hh = pick([8, 10, 16, 32, 50, 100]), d = pick(lvl === 1 ? [1, 8] : [1, 2, 4, 8, 16, 24]), bits = w * hh * d, by = bits / 8;
      return { q: `An image is ${w} × ${hh} pixels with a colour depth of ${d} bit${d > 1 ? 's' : ''}. What is its file size in bytes?`, kind: 'num', v: by, suf: 'bytes', show: `${n(by)} bytes`,
        steps: ['File size (bits) = width × height × colour depth', `${w} × ${hh} × ${d} = ${bits} bits`, `Divide by 8 to get bytes: ${bits} ÷ 8 = ${n(by)} bytes`] };
    }
    const rate = pick([1000, 2000, 8000, 10000]), depth = pick([8, 16]), secs = pick([2, 5, 10, 30]), bits = rate * depth * secs, by = bits / 8;
    return { q: `A sound is recorded for ${secs} seconds at a sample rate of ${rate} Hz with a bit depth of ${depth} bits. What is its file size in bytes?`, kind: 'num', v: by, suf: 'bytes', show: `${n(by)} bytes`,
      steps: ['File size (bits) = sample rate × bit depth × seconds', `${rate} × ${depth} × ${secs} = ${bits} bits`, `Divide by 8 to get bytes: ${bits} ÷ 8 = ${n(by)} bytes`] };
  });
  CT('cs-logic', 'compsci', 'Logic gates', () => {
    const A = ri(0, 1), Bv = ri(0, 1), Cv = ri(0, 1), f = ri(0, 3), NOT = x => 1 - x;
    const E = [[`A AND B`, A & Bv, [`A AND B: 1 only if both are 1: ${A} AND ${Bv} = ${A & Bv}`]], [`A OR B`, A | Bv, [`A OR B: 1 if at least one is 1: ${A} OR ${Bv} = ${A | Bv}`]],
      [`NOT (A AND B)`, NOT(A & Bv), [`A AND B = ${A & Bv}`, `NOT reverses it: ${NOT(A & Bv)}`]], [`(A OR B) AND NOT C`, (A | Bv) & NOT(Cv), [`A OR B = ${A | Bv}`, `NOT C = ${NOT(Cv)}`, `${A | Bv} AND ${NOT(Cv)} = ${(A | Bv) & NOT(Cv)}`]]][f];
    return { q: `If A = ${A}, B = ${Bv}${f === 3 ? `, C = ${Cv}` : ''}, what is the output of ${E[0]}?`, kind: 'num', v: E[1], show: String(E[1]), hint: 'Type 0 or 1', steps: [...E[2], `Output: ${E[1]}`] };
  });

  /* ---------- French and Spanish: present-tense verbs, regular and the key irregulars ---------- */
  const FR_P = ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'], ES_P = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes'];
  const FR_END = { er: ['e', 'es', 'e', 'ons', 'ez', 'ent'], ir: ['is', 'is', 'it', 'issons', 'issez', 'issent'], re: ['s', 's', '', 'ons', 'ez', 'ent'] };
  const ES_END = { ar: ['o', 'as', 'a', 'amos', 'áis', 'an'], er: ['o', 'es', 'e', 'emos', 'éis', 'en'], ir: ['o', 'es', 'e', 'imos', 'ís', 'en'] };
  const FR_REG = [['parler', 'to speak'], ['jouer', 'to play'], ['regarder', 'to watch'], ['aimer', 'to like'], ['habiter', 'to live'], ['travailler', 'to work'], ['écouter', 'to listen'], ['détester', 'to hate'],
    ['finir', 'to finish'], ['choisir', 'to choose'], ['remplir', 'to fill'], ['vendre', 'to sell'], ['attendre', 'to wait'], ['répondre', 'to answer'], ['entendre', 'to hear']];
  const FR_IRR = { être: ['to be', ['suis', 'es', 'est', 'sommes', 'êtes', 'sont']], avoir: ['to have', ['ai', 'as', 'a', 'avons', 'avez', 'ont']], aller: ['to go', ['vais', 'vas', 'va', 'allons', 'allez', 'vont']], faire: ['to do / to make', ['fais', 'fais', 'fait', 'faisons', 'faites', 'font']] };
  const ES_REG = [['hablar', 'to speak'], ['estudiar', 'to study'], ['trabajar', 'to work'], ['escuchar', 'to listen'], ['mirar', 'to look at'], ['bailar', 'to dance'], ['cantar', 'to sing'], ['viajar', 'to travel'],
    ['comer', 'to eat'], ['beber', 'to drink'], ['aprender', 'to learn'], ['correr', 'to run'], ['vender', 'to sell'], ['vivir', 'to live'], ['escribir', 'to write'], ['abrir', 'to open'], ['recibir', 'to receive']];
  const ES_IRR = { ser: ['to be (permanent)', ['soy', 'eres', 'es', 'somos', 'sois', 'son']], estar: ['to be (temporary or place)', ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están']], tener: ['to have', ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen']],
    ir: ['to go', ['voy', 'vas', 'va', 'vamos', 'vais', 'van']], hacer: ['to do / to make', ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen']] };
  function verbQ(lang, lvl) {
    const fr = lang === 'fr', P = fr ? FR_P : ES_P, REG = fr ? FR_REG : ES_REG, IRR = fr ? FR_IRR : ES_IRR, END = fr ? FR_END : ES_END, i = ri(0, 5);
    const irr = lvl === 1 ? false : lvl === 3 ? Math.random() < .6 : Math.random() < .35;
    let inf, mean, form, steps;
    if (irr) { inf = pick(Object.keys(IRR)); [mean] = IRR[inf]; form = IRR[inf][1][i]; steps = [`${inf} is irregular, so it has to be learned`, `${inf}: ${IRR[inf][1].join(', ')}`, `${P[i]} → ${form}`]; }
    else { [inf, mean] = pick(REG); const t = inf.slice(-2), stem = inf.slice(0, -2); form = stem + END[t][i];
      steps = [`${inf} is a regular -${t} verb: take off -${t} to get the stem "${stem}"`, `The ${P[i]} ending for -${t} verbs is "-${END[t][i] || '(no ending)'}"`, `${P[i]} → ${form}`]; }
    const pron = fr && i === 0 && /^[aeiouéèh]/.test(form) ? 'j’' : P[i];
    return { q: `Write the present tense of “${inf}” (${mean}) for: ${pron} ____`, kind: 'str', mode: 'text', ans: form, show: `${pron === 'j’' ? 'j’' : pron + ' '}${form}`, hint: 'Type just the verb', steps };
  }
  CT('fr-verbs', 'french', 'French: present tense verbs', (lvl = 2) => verbQ('fr', lvl));
  CT('es-verbs', 'spanish', 'Spanish: present tense verbs', (lvl = 2) => verbQ('es', lvl));

  const sum = xs => xs.reduce((a, b) => a + b, 0);
  const d1 = x => Math.round(x * 10) / 10, d2 = x => Math.round(x * 100) / 100;

  CT('bc-mag', 'biology', 'Magnification', () => {
    const real = pick([.01, .02, .05, .1, .2, .5]), mg = pick([40, 50, 100, 200, 400, 500]), img = clean(real * mg), f = ri(0, 2);
    if (f === 0) return { q: `A cell is ${n(real)} mm wide. In a drawing it is ${n(img)} mm wide. What is the magnification?`, pic: pic('cell', n(img) + ' mm', n(real) + ' mm', '×?'), kind: 'num', sl: { f, real, img, mg }, v: mg, pre: '×', show: '×' + mg,
      steps: ['Magnification = image size ÷ real size', `= ${n(img)} ÷ ${n(real)}`, `= ×${mg}`] };
    if (f === 1) return { q: `A cell ${n(real)} mm wide is viewed at ×${mg}. How wide is the image?`, pic: pic('cell', '?', n(real) + ' mm', '×' + mg), kind: 'num', sl: { f, real, img, mg }, v: img, suf: 'mm', show: n(img) + ' mm',
      steps: ['Image size = magnification × real size', `= ${mg} × ${n(real)}`, `= ${n(img)} mm`] };
    return { q: `The image of a cell is ${n(img)} mm wide at ×${mg}. What is its real size?`, pic: pic('cell', n(img) + ' mm', '?', '×' + mg), kind: 'num', sl: { f, real, img, mg }, v: real, suf: 'mm', show: n(real) + ' mm',
      steps: ['Real size = image size ÷ magnification', `= ${n(img)} ÷ ${mg}`, `= ${n(real)} mm`] };
  });
  CT('bc-osmosis', 'biology', 'Percentage change in mass', () => {
    const s = ri(20, 50) / 10, ch = ri(-12, 12) / 10 || .3, e = clean(s + ch), diff = clean(e - s), p = d1(diff / s * 100);
    return { q: `A potato cylinder had a mass of ${s.toFixed(1)} g. After soaking it was ${e.toFixed(1)} g. Calculate the percentage change in mass to 1 d.p.`, kind: 'num', sl: { s, e }, v: p, tol: .051, suf: '%', show: n(p) + '%',
      steps: ['Change = final mass − starting mass', `= ${e.toFixed(1)} − ${s.toFixed(1)} = ${n(diff)} g`, '% change = change ÷ starting mass × 100', `= ${n(diff)} ÷ ${s.toFixed(1)} × 100 = ${n(p)}%${p < 0 ? ' (negative means mass was lost)' : ''}`] };
  });
  CT('bc-mean', 'biology', 'Mean of results', () => {
    const k = ri(3, 5), xs = Array.from({ length: k }, () => ri(8, 40)), s = sum(xs), m = d1(s / k);
    return { q: `In a photosynthesis experiment the bubbles counted per minute were ${xs.join(', ')}. Calculate the mean to 1 d.p.`, kind: 'num', v: m, sl: { xs }, tol: .051, show: m.toFixed(1),
      steps: [`Add them: ${xs.join(' + ')} = ${s}`, `Divide by how many: ${s} ÷ ${k} = ${m.toFixed(1)}`] };
  });

  const AR = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, K: 39, Ca: 40 };
  const FORMULAS = ['H2O', 'CO2', 'NaCl', 'MgO', 'CaCO3', 'H2SO4', 'NH3', 'CH4', 'NaOH', 'HCl', 'CaO', 'MgCl2', 'KOH', 'C2H6', 'Na2O', 'Al2O3', 'KCl', 'CaCl2', 'SO2', 'C3H8', 'HNO3', 'Na2CO3', 'MgSO4'];
  const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  const subF = f => f.replace(/\d/g, c => SUB[c]);
  const parseF = f => { const m = {}; for (const [, e, c] of f.matchAll(/([A-Z][a-z]?)(\d*)/g)) m[e] = (m[e] || 0) + (c ? +c : 1); return Object.entries(m); };
  CT('cc-mr', 'chemistry', 'Relative formula mass', () => {
    const f = pick(FORMULAS), parts = parseF(f), mr = clean(sum(parts.map(([e, c]) => AR[e] * c)));
    return { q: `Calculate the relative formula mass (Mr) of ${subF(f)}. Relative atomic masses: ${parts.map(([e]) => `${e} = ${AR[e]}`).join(', ')}.`, kind: 'num', sl: { parts: parts.map(([e, c]) => [AR[e], c]) }, v: mr, show: n(mr),
      steps: [...parts.map(([e, c]) => `${e}: ${c} × ${AR[e]} = ${n(c * AR[e])}`), `Mr = ${parts.map(([e, c]) => n(c * AR[e])).join(' + ')} = ${n(mr)}`] };
  });
  CT('cc-pct', 'chemistry', 'Percentage by mass', () => {
    const f = pick(FORMULAS.filter(x => parseF(x).length > 1)), parts = parseF(f), mr = clean(sum(parts.map(([e, c]) => AR[e] * c))), [e, c] = pick(parts), p = d1(AR[e] * c / mr * 100);
    return { q: `Calculate the percentage by mass of ${e} in ${subF(f)} to 1 d.p. Relative atomic masses: ${parts.map(([x]) => `${x} = ${AR[x]}`).join(', ')}.`, kind: 'num', sl: { ar: AR[e], c, mr }, v: p, tol: .051, suf: '%', show: p.toFixed(1) + '%',
      steps: [`Mr of ${subF(f)} = ${n(mr)}`, `Mass of ${e} in the formula = ${c} × ${AR[e]} = ${n(c * AR[e])}`, `% = ${n(c * AR[e])} ÷ ${n(mr)} × 100 = ${p.toFixed(1)}%`] };
  });
  CT('cc-conc', 'chemistry', 'Concentration (g/dm³)', () => {
    const m = pick([2, 4, 5, 8, 10, 12.5, 20, 25]), v = pick([100, 200, 250, 500]), dm = v / 1000, c = clean(m / dm);
    return { q: `${n(m)} g of solute is dissolved to make ${v} cm³ of solution. What is the concentration in g/dm³?`, kind: 'num', sl: { m, v }, v: c, rel: .005, suf: 'g/dm³', show: n(c) + ' g/dm³',
      steps: [`Convert the volume: ${v} cm³ ÷ 1000 = ${n(dm)} dm³`, 'Concentration = mass ÷ volume', `= ${n(m)} ÷ ${n(dm)} = ${n(c)} g/dm³`] };
  });
  CT('cc-rf', 'chemistry', 'Rf values', () => {
    const sol = ri(50, 90) / 10, spot = ri(10, sol * 10 - 5) / 10, rf = d2(spot / sol);
    return { q: `In chromatography the solvent moved ${sol.toFixed(1)} cm and a spot moved ${spot.toFixed(1)} cm. Calculate the Rf value to 2 d.p.`, pic: pic('chrom', sol, spot), kind: 'num', sl: { sol, spot }, v: rf, tol: .006, show: rf.toFixed(2),
      steps: ['Rf = distance moved by the spot ÷ distance moved by the solvent', `= ${spot.toFixed(1)} ÷ ${sol.toFixed(1)} = ${rf.toFixed(2)}`, 'Rf is always less than 1 and has no units'] };
  });
  CT('cc-rate', 'chemistry', 'Mean rate of reaction', () => {
    const v = pick([20, 30, 40, 45, 60, 80, 90, 120]), t = pick([10, 15, 20, 30, 40, 60]), r = d2(v / t);
    return { q: `A reaction produced ${v} cm³ of gas in ${t} seconds. Calculate the mean rate of reaction to 2 d.p.`, pic: pic('gas', v + ' cm³', t + ' s'), kind: 'num', sl: { v, t }, v: r, tol: .006, suf: 'cm³/s', show: n(r) + ' cm³/s',
      steps: ['Mean rate = quantity of product ÷ time', `= ${v} ÷ ${t} = ${n(r)} cm³/s`] };
  });

  CT('bz-profit', 'business', 'Revenue, costs and profit', () => {
    const p = ri(4, 20), vc = ri(1, p - 2), q = ri(5, 60) * 10, fc = ri(5, 40) * 100, rev = p * q, tc = fc + vc * q, pr = rev - tc, f = ri(0, 2);
    const given = `A business sells ${q} units at £${p} each. Fixed costs are £${fc} and variable costs are £${vc} per unit.`;
    if (f === 0) return { q: `${given} Calculate the revenue.`, kind: 'num', sl: { f, p, vc, q, fc }, v: rev, pre: '£', show: '£' + rev, steps: ['Revenue = price × quantity sold', `= £${p} × ${q} = £${rev}`] };
    if (f === 1) return { q: `${given} Calculate the total costs.`, kind: 'num', sl: { f, p, vc, q, fc }, v: tc, pre: '£', show: '£' + tc, steps: ['Total costs = fixed costs + (variable cost per unit × quantity)', `= £${fc} + (£${vc} × ${q})`, `= £${fc} + £${vc * q} = £${tc}`] };
    return { q: `${given} Calculate the profit (use a minus sign for a loss).`, kind: 'num', sl: { f, p, vc, q, fc }, v: pr, pre: '£', show: (pr < 0 ? '−£' : '£') + Math.abs(pr),
      steps: [`Revenue = £${p} × ${q} = £${rev}`, `Total costs = £${fc} + (£${vc} × ${q}) = £${tc}`, `Profit = revenue − total costs = £${rev} − £${tc} = ${pr < 0 ? '−£' + Math.abs(pr) + ' (a loss)' : '£' + pr}`] };
  });
  CT('bz-breakeven', 'business', 'Break-even', () => {
    const p = ri(5, 30), vc = ri(1, p - 2), c = p - vc, be = ri(20, 400), fc = c * be;
    return { q: `Fixed costs are £${fc}. Each unit sells for £${p} and has a variable cost of £${vc}. Calculate the break-even output.`, kind: 'num', sl: { fc, p, vc }, v: be, suf: 'units', show: be + ' units',
      steps: ['Break-even = fixed costs ÷ (selling price − variable cost per unit)', `Contribution per unit = £${p} − £${vc} = £${c}`, `Break-even = £${fc} ÷ £${c} = ${be} units`] };
  });
  CT('bz-margins', 'business', 'Profit margins', () => {
    const rev = ri(20, 200) * 1000, cos = Math.round(rev * ri(30, 70) / 100 / 100) * 100, gp = rev - cos, exp = Math.round(gp * ri(20, 70) / 100 / 100) * 100, np = gp - exp, net = Math.random() < .5;
    if (!net) { const m = d1(gp / rev * 100); return { q: `Revenue is £${rev} and cost of sales is £${cos}. Calculate the gross profit margin to 1 d.p.`, kind: 'num', sl: { rev, gp, np: gp, net: false }, v: m, tol: .051, suf: '%', show: m.toFixed(1) + '%',
      steps: [`Gross profit = revenue − cost of sales = £${rev} − £${cos} = £${gp}`, 'Gross profit margin = gross profit ÷ revenue × 100', `= £${gp} ÷ £${rev} × 100 = ${m.toFixed(1)}%`] }; }
    const m = d1(np / rev * 100);
    return { q: `Revenue is £${rev}, cost of sales is £${cos} and other expenses are £${exp}. Calculate the net profit margin to 1 d.p.`, kind: 'num', sl: { rev, gp, np, net: true }, v: m, tol: .051, suf: '%', show: m.toFixed(1) + '%',
      steps: [`Gross profit = £${rev} − £${cos} = £${gp}`, `Net profit = gross profit − expenses = £${gp} − £${exp} = £${np}`, `Net profit margin = £${np} ÷ £${rev} × 100 = ${m.toFixed(1)}%`] };
  });
  CT('bz-cash', 'business', 'Cash flow', () => {
    const open = ri(-5, 20) * 100, inf = ri(20, 80) * 100, out = ri(20, 80) * 100, net = inf - out, close = open + net, money = x => (x < 0 ? '−£' : '£') + Math.abs(x);
    if (Math.random() < .5) return { q: `Cash inflows this month are £${inf} and cash outflows are £${out}. Calculate the net cash flow (use a minus sign if negative).`, kind: 'num', v: net, pre: '£', show: money(net),
      steps: ['Net cash flow = total inflows − total outflows', `= £${inf} − £${out} = ${money(net)}`] };
    return { q: `The opening balance is ${money(open)}. Inflows are £${inf} and outflows are £${out}. Calculate the closing balance (use a minus sign if negative).`, kind: 'num', v: close, pre: '£', show: money(close),
      steps: [`Net cash flow = £${inf} − £${out} = ${money(net)}`, 'Closing balance = opening balance + net cash flow', `= ${money(open)} ${net < 0 ? '−' : '+'} £${Math.abs(net)} = ${money(close)}`] };
  });
  CT('bz-arr', 'business', 'Average rate of return', () => {
    const cost = ri(5, 50) * 1000, arr = pick([5, 8, 10, 12, 15, 20, 25]), y = ri(3, 5), avg = cost * arr / 100, tot = avg * y;
    return { q: `An investment costs £${cost}. Over ${y} years it makes a total profit of £${tot} (after the cost is taken off). Calculate the average rate of return.`, kind: 'num', sl: { cost, tot, y }, v: arr, suf: '%', show: arr + '%',
      steps: [`Average annual profit = total profit ÷ years = £${tot} ÷ ${y} = £${n(avg)}`, 'ARR = average annual profit ÷ cost of investment × 100', `= £${n(avg)} ÷ £${cost} × 100 = ${arr}%`] };
  });

  CT('gc-density', 'geography', 'Population density', () => {
    const pop = ri(5, 200) * 10000, area = ri(20, 900), d = Math.round(pop / area);
    return { q: `A region has ${pop.toLocaleString('en-GB')} people living in ${area} km². Calculate its population density to the nearest whole number.`, kind: 'num', sl: { pop, area }, v: d, tol: .51, suf: 'people/km²', show: d + ' people per km²',
      steps: ['Population density = population ÷ area', `= ${pop.toLocaleString('en-GB')} ÷ ${area} = ${n(clean(pop / area))}…`, `≈ ${d} people per km²`] };
  });
  CT('gc-natinc', 'geography', 'Natural increase', () => {
    const br = ri(8, 45), dr = ri(5, 20), ni = br - dr;
    return { q: `A country has a birth rate of ${br} per 1000 and a death rate of ${dr} per 1000. What is the natural increase per 1000?`, kind: 'num', v: ni, show: n(ni) + ' per 1000',
      steps: ['Natural increase = birth rate − death rate', `= ${br} − ${dr} = ${n(ni)} per 1000`, ni < 0 ? 'Negative means the population is naturally falling' : `As a percentage that is ${n(ni / 10)}%`] };
  });
  CT('gc-data', 'geography', 'Rainfall data', () => {
    const xs = Array.from({ length: 6 }, () => ri(20, 180)), range = Math.max(...xs) - Math.min(...xs), s = sum(xs), mean = d1(s / 6), useMean = Math.random() < .5;
    if (useMean) return { q: `Monthly rainfall (mm) was ${xs.join(', ')}. Calculate the mean to 1 d.p.`, kind: 'num', v: mean, tol: .051, suf: 'mm', show: mean.toFixed(1) + ' mm', steps: [`Total = ${xs.join(' + ')} = ${s}`, `Mean = ${s} ÷ 6 = ${mean.toFixed(1)} mm`] };
    return { q: `Monthly rainfall (mm) was ${xs.join(', ')}. Calculate the range.`, kind: 'num', v: range, suf: 'mm', show: range + ' mm', steps: [`Range = highest − lowest = ${Math.max(...xs)} − ${Math.min(...xs)} = ${range} mm`] };
  });

  /* ---------- Recall banks → multiple-choice questions ---------- */
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- item memory: no repeats, wrong and unseen first, known items spaced out ---------- */
  const hkey = str => { let h = 5381; for (let i = 0; i < str.length; i++) h = (h * 33 ^ str.charCodeAt(i)) >>> 0; return h.toString(36); };
  let itemInfo = () => null; /* app supplies: key → { n, r, s (right streak), ago (days) } or null */
  const RECENT = [];
  /* scheduling knobs, exported so the student simulation can try alternatives; these values are the live ones */
  const TUNE = { due: .75, grow: 2, miss: 1 };
  const gap = m => m.ago - (m.s > 0 ? TUNE.grow ** (m.s - 1) : TUNE.miss); /* ≥ 0 means due: a miss comes back the next day, then 1, 2, 4, 8… days after each right answer */
  function choose(list, keyOf) {
    const rows = list.map(it => { const k = hkey(keyOf(it)); return { it, k, m: itemInfo(k) }; });
    const pool = rows.length > 1 && rows.some(r => !RECENT.includes(r.k)) ? rows.filter(r => !RECENT.includes(r.k)) : rows;
    const fresh = pool.filter(r => !r.m), due = pool.filter(r => r.m && gap(r.m) >= 0);
    /* Reviews that are due come first: that is what makes facts stick. With a backlog, the ones that have only just come due go
       first, while they can still be saved; long-overdue ones are nearly new again and wait their turn. About a quarter of
       questions stay new, so you keep moving forward. (Before, new facts always came first and misses came back at random, so a
       struggling student's facts faded before they were ever reviewed. Found by the 12-week simulation.) */
    due.sort((a, b) => gap(a.m) - gap(b.m));
    const set = due.length && (Math.random() < TUNE.due || !fresh.length) ? due.slice(0, 6) : fresh.length ? fresh : null;
    const r = set ? pick(set) : pool.reduce((a, b) => gap(b.m) > gap(a.m) ? b : a); /* nothing due: the one closest to due */
    RECENT.push(r.k); if (RECENT.length > 40) RECENT.shift();
    return [r.it, r.k];
  }
  const R = {};
  for (const [id, [subject, title, text]] of Object.entries(typeof BANKS !== 'undefined' ? BANKS : {})) {
    const items = text.trim().split('\n').map(l => l.split('|')).filter(p => p.length >= 2)
      .map(([q, a, d]) => ({ q: q.trim(), a: a.trim(), d: d ? d.split(';').map(s => s.trim()).filter(Boolean) : null }));
    R[id] = { name: title, subject, items };
  }
  const termLike = it => !it.d && it.a.length <= 32 && it.q.length >= 25 && /^[A-Z]/.test(it.a) && !/\d/.test(it.a);
  function genRecall(id) {
    const t = R[id], [it, key] = choose(t.items, x => id + '|' + x.q);
    return recallQ(id, it, key);
  }
  function recallQ(id, it, key = hkey(id + '|' + it.q), plain = false) {
    const t = R[id], fact = [it.q, it.a];
    const others = t.items.filter(x => x.a !== it.a && termLike(x));
    if (!plain && termLike(it) && others.length >= 3 && Math.random() < .35) {
      const options = shuffle([it.q, ...shuffle(others).slice(0, 3).map(x => x.q)]);
      return { kind: 'mcq', key, fact, q: `Which of these describes “${it.a}”?`, sub: t.name, options, a: options.indexOf(it.q), show: it.q, steps: [`${it.a}: ${it.q}`] };
    }
    let ds = it.d;
    if (!ds) {
      const others = shuffle([...new Set(t.items.map(x => x.a))].filter(a => a !== it.a));
      ds = shuffle(others.sort((x, y) => Math.abs(x.length - it.a.length) - Math.abs(y.length - it.a.length)).slice(0, 5)).slice(0, 3);
    }
    const options = shuffle([it.a, ...ds.filter(x => x !== it.a).slice(0, 3)]);
    return { kind: 'mcq', key, fact, q: it.q, sub: t.name, options, a: options.indexOf(it.a), show: it.a, steps: [`${it.q} → ${it.a}`] };
  }

  /* ---------- Definitions: write it (self-marked against key points) or pick it ---------- */
  const DF = {};
  for (const [id, [subject, title, text]] of Object.entries(typeof DEFS !== 'undefined' ? DEFS : {})) {
    const items = text.trim().split('\n').map(l => l.split('|')).filter(p => p.length >= 3)
      .map(([t, d, k]) => ({ t: t.trim(), d: d.trim(), k: k.split(';').map(x => x.trim()).filter(Boolean) }));
    DF[id] = { name: title, subject, items };
  }
  function genDef(id) {
    const t = DF[id], [it, key] = choose(t.items, x => id + '|' + x.t);
    return defQ(id, it, key, Math.random() < .35);
  }
  function defQ(id, it, key = hkey(id + '|' + it.t), mcq = true) {
    const t = DF[id], fact = [it.t, it.d];
    if (mcq) {
      const options = shuffle([it.d, ...shuffle(t.items.filter(x => x !== it)).slice(0, 3).map(x => x.d)]);
      return { kind: 'mcq', key, fact, q: `Which is the correct definition of “${it.t}”?`, sub: t.name, options, a: options.indexOf(it.d), show: it.d, steps: [`${it.t}: ${it.d}`] };
    }
    return { kind: 'def', key, fact, q: pick([`Define “${it.t}”.`, `What is meant by “${it.t}”?`]), sub: t.name, term: it.t, points: it.k, show: it.d, steps: it.k.map(k => 'Key point: ' + k) };
  }
  /* First guess at which key points an answer hit; the student confirms or fixes the ticks.
     shortcut: word-stem matching, not real marking; that is why the student has the final say. */
  const DSTOP = new Set('the and for with from that this its are can into than more less only when where which what their them they has have had was not all any one per'.split(' '));
  const words = x => norm(x).toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter(w => (w.length > 2 || /\d/.test(w)) && !DSTOP.has(w));
  const compact = x => norm(x).toLowerCase().replace(/[^a-z0-9]+/g, '');
  function defTicks(q, raw) {
    const aw = words(raw), has = w => aw.some(a => a === w || (a.length >= 4 && w.length >= 4 && a.slice(0, 4) === w.slice(0, 4)) || (Math.min(a.length, w.length) >= 3 && (a.startsWith(w) || w.startsWith(a))));
    return q.points.map(p => { const kw = words(p.replace(/\(.*?\)/g, "")); return kw.length ? kw.filter(has).length / kw.length >= .6 : !!compact(p) && compact(raw).includes(compact(p)); });
  }
  /* Run from the console to prove every model answer earns all its own ticks and a blank answer earns none. */
  function selfTest() {
    const all = Object.values(DF).flatMap(t => t.items), bad = all.filter(it => !defTicks({ points: it.k }, it.d).every(Boolean) || defTicks({ points: it.k }, 'no idea').some(Boolean)).map(it => it.t);
    return { definitions: all.length, bad };
  }

  /* ---------- Descriptive vocabulary: spell it, know its meaning, use it in a sentence ---------- */
  const VB = {};
  for (const [id, [title, text]] of Object.entries(typeof VOCAB !== 'undefined' ? VOCAB : {}))
    VB[id] = { name: title, items: text.trim().split('\n').map(l => l.split('|')).filter(p => p.length === 3).map(([w, m, e]) => ({ w: w.trim(), m: m.trim(), e: e.trim() })) };
  const blankOut = it => it.e.replace(new RegExp(it.w.slice(0, Math.max(4, it.w.length - 3)) + '[a-z]*', 'i'), '_____');
  function genVocab(id) {
    const t = VB[id], [it, key] = choose(t.items, x => 'vocab|' + x.w);
    return vocabQ(id, it, key, Math.random());
  }
  function vocabQ(id, it, key = hkey('vocab|' + it.w), r = .6) {
    const t = VB[id], others = shuffle(t.items.filter(x => x !== it)).slice(0, 3), fact = [it.w, `${it.m}. For example: ${it.e}`];
    const steps = [`${it.w}: ${it.m}`, `Example: ${it.e}`];
    if (r < .5) return { kind: 'word', key, fact, q: `Spell the word that means “${it.m}”.\n${blankOut(it)}`, sub: 'Spell it', w: it.w, show: it.w, hint: `Starts with “${it.w[0]}”, ${it.w.length} letters.`, steps };
    if (r < .75) { const options = shuffle([it.m, ...others.map(x => x.m)]); return { kind: 'mcq', key, fact, q: `What does “${it.w}” mean?`, sub: t.name, options, a: options.indexOf(it.m), show: it.m, steps }; }
    const options = shuffle([it.w, ...others.map(x => x.w)]);
    return { kind: 'mcq', key, fact, q: `Which word fits best?\n${blankOut(it)}`, sub: 'Use it in a sentence', options, a: options.indexOf(it.w), show: it.w, steps };
  }
  /* every fact, definition and word in a topic, with its memory key: lessons teach them and quick question types reuse them */
  function itemsOf(id) {
    if (R[id]) return R[id].items.map(it => ({ k: hkey(id + '|' + it.q), p: it.q, a: it.a, q: () => recallQ(id, it, undefined, true) }));
    if (DF[id]) return DF[id].items.map(it => ({ k: hkey(id + '|' + it.t), p: it.t, a: it.d, pts: it.k, q: (mcq = true) => defQ(id, it, undefined, mcq) }));
    if (VB[id]) return VB[id].items.map(it => ({ k: hkey('vocab|' + it.w), p: it.w, a: it.m, e: it.e, q: (r = .6) => vocabQ(id, it, undefined, r) }));
    return [];
  }

  /* ---------- registry ---------- */
  const QDECKS = { 'q-mac': ['mac', 'Macbeth quotes'], 'q-acc': ['acc', 'A Christmas Carol quotes'], 'q-je': ['je', "Journey's End quotes"] };
  const TOPIC = {};
  for (const id of Object.keys(M)) TOPIC[id] = { name: M[id].name, subject: 'maths', type: 'calc', tier: M[id].tier || null };
  for (const k of Object.keys(P)) TOPIC['p-' + k] = { name: P[k].name, subject: 'physics', type: 'calc' };
  for (const [id, c] of Object.entries(C)) TOPIC[id] = { name: c.name, subject: c.subject, type: 'calc' };
  for (const [id, r] of Object.entries(R)) TOPIC[id] = { name: r.name, subject: r.subject, type: 'recall', size: r.items.length };
  for (const [id, q] of Object.entries(QDECKS)) TOPIC[id] = { name: q[1], subject: 'englit', type: 'quote' };
  for (const [id, d] of Object.entries(DF)) TOPIC[id] = { name: d.name, subject: d.subject, type: 'def', size: d.items.length };
  const CH = typeof CHEM !== 'undefined' ? CHEM.TOPICS : {};
  if (typeof CHEM !== 'undefined') CHEM.setChooser(choose);
  for (const [id, c] of Object.entries(CH)) TOPIC[id] = { name: c[0], subject: 'chemistry', type: 'eq' };
  for (const [id, v] of Object.entries(VB)) TOPIC[id] = { name: v.name, subject: 'englang', type: 'vocab', size: v.items.length };
  const SUBJECTS = [
    ['maths', 'Maths', 'target', 'Maths'], ['biology', 'Biology', 'leaf', 'Science'], ['chemistry', 'Chemistry', 'flask', 'Science'], ['physics', 'Physics', 'bolt', 'Science'],
    ['englit', 'English Literature', 'feather', 'English Literature'], ['englang', 'English Language', 'scroll', 'English Language'],
    ['geography', 'Geography', 'map', 'Geography'], ['business', 'Business', 'coin', 'Business'], ['re', 'RE', 'sparkle', 'RE'],
    ['history', 'History', 'hourglass', 'History'], ['compsci', 'Computer Science', 'grid', 'Computer Science'], ['french', 'French', 'book', 'French'], ['spanish', 'Spanish', 'compass', 'Spanish']
  ].map(([id, name, icon, subj]) => ({ id, name, icon, subj, topics: Object.keys(TOPIC).filter(t => TOPIC[t].subject === id) }));
  const trackOf = id => TOPIC[id] ? TOPIC[id].subject : 'maths';
  const name = id => TOPIC[id] ? TOPIC[id].name : id;
  function gen(id, lvl) { /* lvl 1–3 picks easier or harder numbers where a generator supports it; others ignore it */
    let q = null;
    try {
      if (M[id]) q = M[id].gen(lvl);
      else if (id.startsWith('p-') && P[id.slice(2)]) q = genPhys(P[id.slice(2)]);
      else if (C[id]) q = C[id].gen(lvl);
      else if (R[id]) q = genRecall(id);
      else if (QDECKS[id]) q = genQuote(QDECKS[id][0]);
      else if (DF[id]) q = genDef(id);
      else if (VB[id]) q = genVocab(id);
      else if (CH[id]) q = CH[id][1]();
    } catch (e) { q = null; }
    if (q) { q.id = id; if (!q.sub) q.sub = name(id); }
    return q;
  }
  const MATHS = SUBJECTS[0].topics, PHYS = Object.keys(P).map(k => 'p-' + k), QUOTES = Object.keys(QDECKS), RECALL = Object.keys(R);

  /* ---------- answer checking ---------- */
  const norm = s => String(s || '').trim().replace(/[−–—]/g, '-').replace(/\s+/g, ' ');
  function parseNum(s) {
    const m = norm(s).replace(/,/g, '').match(/-?\d*\.?\d+(e-?\d+)?/i);
    return m ? Number(m[0]) : null;
  }
  function parseFrac(s) {
    s = norm(s);
    let m = s.match(/^(-?\d+) (\d+)\/(\d+)$/);
    if (m) { const w = +m[1], a = +m[2], b = +m[3]; if (!b) return null; return { n: (w < 0 ? -1 : 1) * (Math.abs(w) * b + a), d: b }; }
    m = s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
    if (m) return +m[2] ? { n: +m[1], d: +m[2] } : null;
    m = s.match(/^-?\d*\.?\d+$/);
    if (m) return Number.isInteger(+s) ? { n: +s, d: 1 } : { dec: +s };
    return null;
  }
  function parseLin(s, v) {
    s = norm(s).toLowerCase().replace(/\s/g, '').replace(/[×*]/g, '');
    if (!s || !new RegExp(`^[-+0-9.${v}]+$`).test(s)) return null;
    const terms = s.match(/[+-]?[^+-]+/g); if (!terms) return null;
    let a = 0, b = 0;
    for (const t of terms) {
      if (t.endsWith(v)) { const c = t.slice(0, -1); const k = c === '' || c === '+' ? 1 : c === '-' ? -1 : Number(c); if (!Number.isFinite(k)) return null; a += k; }
      else { const k = Number(t); if (!Number.isFinite(k)) return null; b += k; }
    }
    return { a, b };
  }
  /* ax² + bx + c typed any reasonable way: x^2, x², terms in any order */
  function parseQuad(s) {
    s = norm(s).toLowerCase().replace(/\s/g, '').replace(/[×*]/g, '').replace(/²/g, '^2');
    if (!s || !/^[-+0-9x^.]+$/.test(s)) return null;
    const terms = s.match(/[+-]?[^+-]+/g); if (!terms) return null;
    let A = 0, B = 0, C = 0;
    for (const t of terms) {
      const k = c => c === '' || c === '+' ? 1 : c === '-' ? -1 : Number(c);
      if (t.endsWith('x^2')) { const v = k(t.slice(0, -3)); if (!Number.isFinite(v)) return null; A += v; }
      else if (t.endsWith('x')) { const v = k(t.slice(0, -1)); if (!Number.isFinite(v)) return null; B += v; }
      else { const v = Number(t); if (!Number.isFinite(v) || /x|\^/.test(t)) return null; C += v; }
    }
    return { A, B, C };
  }
  /* a polynomial up to a cube in x (or n), any reasonable way: x^3, x³, terms in any order. co[i] is the coefficient of the i-th power */
  function parsePoly(s, v = 'x') {
    s = norm(s).toLowerCase().replace(/\s/g, '').replace(/[×*]/g, '').replace(/²/g, '^2').replace(/³/g, '^3');
    if (!s || !new RegExp(`^[-+0-9${v}^.]+$`).test(s)) return null;
    const co = [0, 0, 0, 0], k = c => c === '' || c === '+' ? 1 : c === '-' ? -1 : Number(c);
    for (const t of s.match(/[+-]?[^+-]+/g) || []) {
      const m = t.match(new RegExp(`^([+-]?[0-9.]*)(${v}(?:\\^([0-3]))?)?$`)); if (!m || (!m[2] && !/\d/.test(m[1]))) return null;
      const c = m[2] ? k(m[1]) : Number(m[1]); if (!Number.isFinite(c)) return null;
      co[m[2] ? (m[3] ? +m[3] : 1) : 0] += c;
    }
    return co;
  }
  const UNSUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '⁻': '-' };
  function parseSF(s) {
    s = norm(s).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, c => '^' + UNSUP[c]).replace(/\^(?=\^)/g, '').replace(/\s/g, '').replace(/\^-\^/g, '^-');
    let m = s.match(/^(-?\d+(?:\.\d+)?)[x×*]10\^?\(?(-?\d+)\)?$/i) || s.match(/^(-?\d+(?:\.\d+)?)e\+?(-?\d+)$/i);
    return m ? { m: +m[1], p: +m[2] } : null;
  }
  function check(q, raw) {
    const s = norm(raw);
    if (!s) return { valid: false, msg: 'Type an answer first' };
    if (q.kind === 'mcq') { const i = Number(s); return Number.isInteger(i) && i >= 0 && i < q.options.length ? { valid: true, ok: i === q.a } : { valid: false, msg: 'Pick an answer' }; }
    if (q.kind === 'num') {
      const x = parseNum(s); if (x == null) return { valid: false, msg: 'Type a number' };
      const tol = q.tol != null ? q.tol : q.rel != null ? Math.max(Math.abs(q.v) * q.rel, q.rel >= .005 ? .01 : 0) : 1e-6;
      return { valid: true, ok: Math.abs(x - q.v) <= tol + 1e-12 };
    }
    if (q.kind === 'frac') {
      const f = parseFrac(s); if (!f) return { valid: false, msg: 'Type a fraction like 3/8' };
      if (f.dec != null) return { valid: true, ok: Math.abs(f.dec - q.n / q.d) < 1e-6 };
      const eq = f.n * q.d === q.n * f.d;
      if (eq && q.simplest !== false && gcd(f.n, f.d) !== 1) return { valid: true, ok: false, msg: 'Right value, but it can be simplified further.' };
      return { valid: true, ok: eq };
    }
    if (q.kind === 'ratio') {
      const m = s.replace(/\s/g, '').match(/^(\d+):(\d+)$/); if (!m) return { valid: false, msg: 'Type a ratio like 2:3' };
      const a = +m[1], b = +m[2];
      if (a === q.parts[0] && b === q.parts[1]) return { valid: true, ok: true };
      if (a * q.parts[1] === b * q.parts[0]) return { valid: true, ok: false, msg: 'Equivalent, but it can be simplified further.' };
      return { valid: true, ok: false };
    }
    if (q.kind === 'lin') {
      const r = parseLin(s, q.v); if (!r) return { valid: false, msg: `Type it like 3${q.v} + 2` };
      return { valid: true, ok: r.a === q.a && r.b === q.b };
    }
    if (q.kind === 'sf') {
      const r = parseSF(s); if (!r) return { valid: false, msg: 'Type it like 4.7 x 10^5' };
      const val = r.m * Math.pow(10, r.p), same = Math.abs(val - q.v) <= Math.abs(q.v) * 1e-9;
      if (same && (Math.abs(r.m) < 1 || Math.abs(r.m) >= 10)) return { valid: true, ok: false, msg: 'Right value, but the first number must be between 1 and 10.' };
      return { valid: true, ok: same };
    }
    if (q.kind === 'quad') {
      const r = parseQuad(s); if (!r) return { valid: false, msg: 'Type it like x^2 + 5x + 6' };
      return { valid: true, ok: r.A === q.A && r.B === q.B && r.C === q.C };
    }
    if (q.kind === 'fact') {
      const t = s.toLowerCase().replace(/\s/g, '').replace(/[−–]/g, '-');
      const sq = t.match(/^\(x([+-]\d+)\)(?:\^2|²)$/), m = t.match(/^\(x([+-]\d+)\)\(x([+-]\d+)\)$/);
      const got = sq ? [+sq[1], +sq[1]] : m ? [+m[1], +m[2]] : null;
      if (!got) { const e = parseQuad(s); return e && e.A === 1 && e.B === q.r[0] + q.r[1] && e.C === q.r[0] * q.r[1] ? { valid: true, ok: false, msg: 'That is the expanded form. Put it into two brackets.' } : { valid: false, msg: 'Type it like (x + 2)(x + 3)' }; }
      return { valid: true, ok: [...got].sort((a, b) => a - b).join() === [...q.r].sort((a, b) => a - b).join() };
    }
    if (q.kind === 'roots') {
      const xs = (s.replace(/[−–]/g, '-').match(/-?\d+(\.\d+)?/g) || []).map(Number);
      if (xs.length < 2) return { valid: false, msg: 'Type both answers, like x = 2 or x = -5' };
      const a = [...xs].sort((p, r) => p - r), b = [...q.r].sort((p, r) => p - r), tol = (q.tol || 0) + 1e-9;
      return { valid: true, ok: xs.length === 2 && a.every((v, i) => Math.abs(v - b[i]) <= tol) };
    }
    if (q.kind === 'pairs') { /* two (x, y) solutions, in either order */
      const v = (s.match(/-?\d+(\.\d+)?/g) || []).map(Number);
      if (v.length !== 4) return { valid: false, msg: 'Type both pairs, like x = 1, y = 3 or x = -2, y = 0' };
      const same = (p, r) => p[0] === r[0] && p[1] === r[1], [A, B] = q.sols, P = [v[0], v[1]], R = [v[2], v[3]];
      if ((same(P, A) && same(R, B)) || (same(P, B) && same(R, A))) return { valid: true, ok: true };
      const xs = [v[0], v[1]].sort((p, r) => p - r).join(), ys = [v[2], v[3]].sort((p, r) => p - r).join();
      return xs === [A[0], B[0]].sort((p, r) => p - r).join() && ys === [A[1], B[1]].sort((p, r) => p - r).join() ? { valid: true, ok: false, msg: 'Right numbers: write each x with its own y, like x = 1, y = 3 or x = -2, y = 0' } : { valid: true, ok: false };
    }
    if (q.kind === 'poly') {
      const r = parsePoly(s, q.v); if (!r) return { valid: false, msg: q.v === 'n' ? 'Type it like 2n^2 + 3n - 1' : 'Type it like x^3 + 2x^2 - 5x - 6' };
      return { valid: true, ok: r.every((c, i) => c === (q.co[i] || 0)) };
    }
    if (q.kind === 'ctsq') {
      const t = s.toLowerCase().replace(/\s/g, '').replace(/²/g, '^2'), m = t.match(/^(\d*)\(x([+-]\d+)\)\^2([+-]\d+)?$/);
      if (!m) { const e = parseQuad(s); return e && e.A === q.ca && e.B === 2 * q.ca * q.cp && e.C === q.ca * q.cp * q.cp + q.cq ? { valid: true, ok: false, msg: 'That is the same expression. Write it with a squared bracket.' } : { valid: false, msg: q.ca === 1 ? 'Type it like (x + 3)^2 - 4' : 'Type it like 2(x + 3)^2 - 4' }; }
      return { valid: true, ok: (m[1] ? +m[1] : 1) === q.ca && +m[2] === q.cp && (m[3] ? +m[3] : 0) === q.cq };
    }
    if (q.kind === 'fact2') {
      const t = s.toLowerCase().replace(/\s/g, '').replace(/²/g, '^2'), BR = '\\((-?\\d*)x([+-]\\d+)\\)', two = t.match(new RegExp('^' + BR + BR + '$')), sq = t.match(new RegExp('^' + BR + '\\^2$'));
      const k = c => c === '' ? 1 : c === '-' ? -1 : +c, f = two ? [k(two[1]), +two[2], k(two[3]), +two[4]] : sq ? [k(sq[1]), +sq[2], k(sq[1]), +sq[2]] : null;
      if (!f) { const e = parseQuad(s); return e && e.A === q.A && e.B === q.B && e.C === q.C ? { valid: true, ok: false, msg: 'That is the expanded form. Put it into two brackets.' } : { valid: false, msg: 'Type it like (2x + 1)(x - 3)' }; }
      return { valid: true, ok: f[0] * f[2] === q.A && f[0] * f[3] + f[1] * f[2] === q.B && f[1] * f[3] === q.C };
    }
    if (q.kind === 'ineq') {
      const t = s.toLowerCase().replace(/\s/g, '').replace(/≤|=<|<=/g, 'L').replace(/≥|=>|>=/g, 'G').replace(/</g, 'l').replace(/>/g, 'g'), N = '(-?\\d+(?:\\.\\d+)?)';
      const wrongEnds = q.eq ? 'Right region, but the end values are included here: use ≤ (type <=).' : 'Right region, but the end values are not included: use <.';
      const m = t.match(new RegExp(`^${N}([lL])x([lL])${N}$`));
      if (m) {
        if (+m[1] !== q.lo || +m[4] !== q.hi) return { valid: true, ok: false };
        if (!q.inside) return { valid: true, ok: false, msg: 'Right values, but this curve is above the axis outside them, not between.' };
        return (q.eq ? m[2] === 'L' && m[3] === 'L' : m[2] === 'l' && m[3] === 'l') ? { valid: true, ok: true } : { valid: true, ok: false, msg: wrongEnds };
      }
      const parts = t.split(/or|,|;|\|/).filter(Boolean).map(p => p.match(new RegExp(`^x([lLgG])${N}$`)));
      if (parts.length === 2 && parts.every(Boolean)) {
        const lt = parts.find(p => /[lL]/.test(p[1])), gt = parts.find(p => /[gG]/.test(p[1]));
        if (lt && gt) {
          if (+lt[2] !== q.lo || +gt[2] !== q.hi) return { valid: true, ok: false };
          if (q.inside) return { valid: true, ok: false, msg: 'Right values, but this curve is below the axis between them, not outside.' };
          return (q.eq ? lt[1] === 'L' && gt[1] === 'G' : lt[1] === 'l' && gt[1] === 'g') ? { valid: true, ok: true } : { valid: true, ok: false, msg: q.eq ? 'Right region, but the end values are included here: use ≤ and ≥.' : 'Right region, but the end values are not included: use < and >.' };
        }
      }
      return { valid: false, msg: q.inside ? 'Type it like -2 < x < 3' : 'Type it like x < -2 or x > 3' };
    }
    if (q.kind === 'line') { /* y = mx + c, with the gradient as a whole number, a fraction or a decimal */
      const t = s.toLowerCase().replace(/\s/g, '').replace(/[½⅓⅔¼¾]/g, c => ({ '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4' })[c]).replace(/[()×*]/g, '');
      const m0 = t.match(/^y=(.+)$/); if (!m0) return { valid: false, msg: 'Type it like y = -2x + 5' };
      let gm = 0, gc = 0, seen = false;
      for (const term of m0[1].match(/[+-]?[^+-]+/g) || []) {
        const x = term.match(/^([+-]?)(\d+(?:\.\d+)?)?(?:\/(\d+))?x(?:\/(\d+))?$/), c = term.match(/^([+-]?\d+(?:\.\d+)?)(?:\/(\d+))?$/);
        if (x) { gm += (x[1] === '-' ? -1 : 1) * (x[2] ? +x[2] : 1) / ((x[3] ? +x[3] : 1) * (x[4] ? +x[4] : 1)); seen = true; }
        else if (c) gc += +c[1] / (c[2] ? +c[2] : 1);
        else return { valid: false, msg: 'Type it like y = -2x + 5' };
      }
      if (!seen) return { valid: false, msg: 'Type it like y = -2x + 5' };
      return { valid: true, ok: Math.abs(gm - q.gm) < 1e-9 && Math.abs(gc - q.gc) < 1e-9 };
    }
    if (q.kind === 'pair') {
      const t = s.toLowerCase().replace(/[−–]/g, '-'), mx = t.match(/x\s*=\s*(-?\d+(?:\.\d+)?)/), my = t.match(/y\s*=\s*(-?\d+(?:\.\d+)?)/), all = t.match(/-?\d+(\.\d+)?/g) || [];
      const x = mx ? +mx[1] : all.length === 2 ? +all[0] : null, y = my ? +my[1] : all.length === 2 ? +all[1] : null;
      if (x == null || y == null) return { valid: false, msg: 'Type it like x = 2, y = -3' };
      return { valid: true, ok: x === q.x && y === q.y };
    }
    if (q.kind === 'surd') {
      const m = s.toLowerCase().replace(/\s/g, '').match(/^(\d*)(?:√|sqrt|root|r)\(?(\d+)\)?$/); if (!m) return { valid: false, msg: 'Type it like 4√3 or 4 root 3' };
      const a = m[1] ? +m[1] : 1, b = +m[2];
      if (a === q.a && b === q.b) return { valid: true, ok: true };
      return a * a * b === q.a * q.a * q.b ? { valid: true, ok: false, msg: 'Same value, but it can be simplified further.' } : { valid: true, ok: false };
    }
    if (q.kind === 'str') {
      if (q.mode === 'bits') {
        const d = s.replace(/\s/g, ''); if (!/^[01]+$/.test(d)) return { valid: false, msg: 'Type 0s and 1s' };
        if (d === q.ans) return { valid: true, ok: true };
        return parseInt(d, 2) === parseInt(q.ans, 2) ? { valid: true, ok: false, msg: `Right value, but write all ${q.ans.length} bits (add the leading zeros).` } : { valid: true, ok: false };
      }
      if (q.mode === 'hex') { const d = s.toUpperCase().replace(/\s|^0X/g, ''); if (!/^[0-9A-F]+$/.test(d)) return { valid: false, msg: 'Type hex digits 0–9 and A–F' }; return { valid: true, ok: parseInt(d, 16) === parseInt(q.ans, 16) }; }
      /* words: case and the kind of apostrophe never matter; a missing accent is accepted with a reminder */
      const flat = t => t.toLowerCase().replace(/[’‘]/g, "'").trim(), bare = t => flat(t).normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (flat(s) === flat(q.ans)) return { valid: true, ok: true };
      if (bare(s) === bare(q.ans)) return { valid: true, ok: true, msg: `Watch the accent: ${q.ans}` };
      return { valid: true, ok: false };
    }
    if (q.kind === 'formula' || q.kind === 'coef') return CHEM.check(q, s);
    if (q.kind === 'word') {
      const a = s.toLowerCase().replace(/[^a-z']/g, ''), b = q.w.toLowerCase();
      return { valid: true, ok: a === b || a.replace(/'/g, '') === b.replace(/'/g, '') };
    }
    return { valid: false };
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  let BANK = null;
  function bank() {
    if (BANK) return BANK;
    BANK = {};
    const add = (subj, kind, k) => { const b = BANK[subj] = BANK[subj] || { def: [], recall: [], eq: [], vocab: [] }; b[kind].push(k); };
    for (const [id, t] of Object.entries(R)) for (const it of t.items) add(t.subject, 'recall', hkey(id + '|' + it.q));
    for (const [id, t] of Object.entries(DF)) for (const it of t.items) add(t.subject, 'def', hkey(id + '|' + it.t));
    if (typeof CHEM !== 'undefined') for (const k of CHEM.keys()) add('chemistry', 'eq', hkey(k));
    for (const t of Object.values(VB)) for (const it of t.items) add('englang', 'vocab', hkey('vocab|' + it.w));
    return BANK;
  }
  /* topics whose questions change with level (1 easier, 3 harder) */
  const LEVELLED = new Set(['solve-1', 'expand', 'cs-binary', 'cs-hex', 'cs-add', 'cs-size', 'fr-verbs', 'es-verbs', ...Object.keys(M).filter(id => M[id].tier === 'H' || M[id].lv)]);
  return { TUNE, LEVELLED, MATHS, PHYS, PEQ: P, QUOTES, RECALL, SUBJECTS, TOPIC, gen, check, defTicks, selfTest, name, trackOf, bank, itemsOf, hkey, parseNum, parseFrac, parseLin, setItemInfo: f => { itemInfo = f; }, setQuoteSource: f => { quoteSource = f; } };
})();
