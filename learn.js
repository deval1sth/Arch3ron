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
  const work = (expr, v, steps) => ({ q: `Work out ${expr}`, kind: 'num', v, show: n(v), steps });

  T('pct-of', 'Percentage of an amount', () => {
    const p = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 65, 70, 75, 80, 90]), amt = ri(2, 30) * 20, a = amt / 10, ans = amt * p / 100;
    const tens = Math.floor(p / 10), five = p % 10 === 5, steps = [`10% of ${amt} = ${amt} ÷ 10 = ${n(a)}`];
    if (tens > 1) steps.push(`${tens * 10}% = ${tens} × ${n(a)} = ${n(tens * a)}`);
    if (five) steps.push(`5% = half of 10% = ${n(a / 2)}`);
    if (five && tens) steps.push(`${p}% = ${n(tens * a)} + ${n(a / 2)} = ${n(ans)}`);
    steps.push(`Calculator check: ${p / 100} × ${amt} = ${n(ans)}`);
    return { q: `Find ${p}% of ${amt}.`, kind: 'num', v: ans, show: n(ans), steps };
  });
  T('pct-incdec', 'Increase or decrease by a %', () => {
    const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), up = Math.random() < .5, amt = ri(4, 60) * 10, pc = 100 + (up ? p : -p), m = pc / 100, ans = clean(amt * pc / 100);
    return { q: `${up ? 'Increase' : 'Decrease'} £${amt} by ${p}%.`, kind: 'num', v: ans, pre: '£', show: '£' + money(ans), tol: .005,
      steps: [`Multiplier: 100% ${up ? '+' : '−'} ${p}% = ${pc}% = ${n(m)}`, `£${amt} × ${n(m)} = £${money(ans)}`] };
  });
  T('pct-change', 'Percentage change', () => {
    for (;;) {
      const o = pick([20, 25, 40, 50, 60, 80, 120, 160, 200, 250, 400]), p = pick([5, 10, 20, 25, 30, 40, 50, 60, 75]), up = Math.random() < .6, c = o * p / 100;
      if (!Number.isInteger(c)) continue;
      const nw = up ? o + c : o - c;
      return { q: `A price ${up ? 'rises' : 'falls'} from £${o} to £${nw}. Find the percentage ${up ? 'increase' : 'decrease'}.`, kind: 'num', v: p, suf: '%', show: p + '%',
        steps: [`Change = ${up ? nw + ' − ' + o : o + ' − ' + nw} = ${c}`, 'Percentage change = change ÷ original × 100', `= ${c} ÷ ${o} × 100 = ${p}%`] };
    }
  });
  T('frac-of', 'Fraction of an amount', () => {
    const [k, d] = (() => { const d = pick([3, 4, 5, 6, 8, 10]); let k; do k = ri(1, d - 1); while (gcd(k, d) !== 1); return [k, d]; })();
    const amt = d * ri(3, 15), one = amt / d, ans = one * k;
    return { q: `Find ${k}/${d} of ${amt}.`, kind: 'num', v: ans, show: n(ans), steps: [`Divide by the bottom: ${amt} ÷ ${d} = ${one}`, `Multiply by the top: ${one} × ${k} = ${ans}`] };
  });
  T('frac-add', 'Adding and subtracting fractions', () => {
    let a = frac(), b = frac(); while (a[1] === b[1]) b = frac();
    const sub = Math.random() < .4; if (sub && a[0] / a[1] < b[0] / b[1]) [a, b] = [b, a];
    const L = lcm(a[1], b[1]), an = a[0] * L / a[1], bn = b[0] * L / b[1], rn = sub ? an - bn : an + bn, [sn, sd] = simp(rn, L), op = sub ? '−' : '+';
    const steps = [`Common denominator: ${L}`, `${a[0]}/${a[1]} = ${an}/${L}   and   ${b[0]}/${b[1]} = ${bn}/${L}`, `${an}/${L} ${op} ${bn}/${L} = ${rn}/${L}`];
    if (sd !== L) steps.push(`Simplify: ${rn}/${L} = ${fs(sn, sd)}`);
    return { q: `Work out ${a[0]}/${a[1]} ${op} ${b[0]}/${b[1]}. Give your answer in its simplest form.`, kind: 'frac', n: sn, d: sd, show: fs(sn, sd), hint: 'Type a fraction like 7/12', steps };
  });
  T('frac-mul', 'Multiplying and dividing fractions', () => {
    const a = frac(), b = frac(), div = Math.random() < .5, bb = div ? [b[1], b[0]] : b, rn = a[0] * bb[0], rd = a[1] * bb[1], [sn, sd] = simp(rn, rd);
    const steps = [];
    if (div) steps.push(`Keep, change, flip: ${a[0]}/${a[1]} ÷ ${b[0]}/${b[1]} = ${a[0]}/${a[1]} × ${bb[0]}/${bb[1]}`);
    steps.push(`Multiply the tops and the bottoms: (${a[0]} × ${bb[0]})/(${a[1]} × ${bb[1]}) = ${rn}/${rd}`);
    if (sd !== rd) steps.push(`Simplify: ${rn}/${rd} = ${fs(sn, sd)}`);
    return { q: `Work out ${a[0]}/${a[1]} ${div ? '÷' : '×'} ${b[0]}/${b[1]}. Give your answer in its simplest form.`, kind: 'frac', n: sn, d: sd, show: fs(sn, sd), hint: 'Type a fraction like 5/8', steps };
  });
  T('ratio-share', 'Sharing in a ratio', () => {
    let a, b; do { a = ri(1, 7); b = ri(1, 7); } while (a === b || gcd(a, b) !== 1);
    const k = ri(2, 20), tot = (a + b) * k, who = pick([['Amy', 'Ben'], ['Sam', 'Priya'], ['Jay', 'Mo'], ['Leah', 'Tom']]), w = ri(0, 1), part = w ? b : a, ans = part * k;
    return { q: `£${tot} is shared between ${who[0]} and ${who[1]} in the ratio ${a}:${b}. How much does ${who[w]} get?`, kind: 'num', v: ans, pre: '£', show: '£' + ans,
      steps: [`Total parts: ${a} + ${b} = ${a + b}`, `One part: £${tot} ÷ ${a + b} = £${k}`, `${who[w]} gets ${part} part${part === 1 ? '' : 's'}: ${part} × £${k} = £${ans}`] };
  });
  T('ratio-simp', 'Simplifying ratios', () => {
    let p, q; do { p = ri(1, 9); q = ri(1, 9); } while (p === q || gcd(p, q) !== 1);
    const k = ri(2, 12);
    return { q: `Simplify ${p * k}:${q * k}`, kind: 'ratio', parts: [p, q], show: `${p}:${q}`, hint: 'Type it like 2:3',
      steps: [`Highest common factor of ${p * k} and ${q * k} is ${k}`, `${p * k} ÷ ${k} = ${p}   and   ${q * k} ÷ ${k} = ${q}`, `Answer: ${p}:${q}`] };
  });
  T('bidmas', 'Order of operations (BIDMAS)', () => {
    const a = ri(2, 12), b = ri(2, 9), c = ri(2, 9), f = ri(0, 3);
    if (f === 0) return work(`${a} + ${b} × ${c}`, a + b * c, [`Multiply before adding: ${b} × ${c} = ${b * c}`, `Then add: ${a} + ${b * c} = ${a + b * c}`]);
    if (f === 1) return work(`(${a} + ${b}) × ${c}`, (a + b) * c, [`Brackets first: ${a} + ${b} = ${a + b}`, `Then multiply: ${a + b} × ${c} = ${(a + b) * c}`]);
    if (f === 2) { const d = ri(2, 6), e = d * ri(2, 9); return work(`${a} × ${b} − ${e} ÷ ${d}`, a * b - e / d, [`Multiply and divide first: ${a} × ${b} = ${a * b}   and   ${e} ÷ ${d} = ${e / d}`, `Then subtract: ${a * b} − ${e / d} = ${n(a * b - e / d)}`]); }
    return work(`${b}² − ${a} × ${c}`, b * b - a * c, [`Indices first: ${b}² = ${b * b}`, `Then multiply: ${a} × ${c} = ${a * c}`, `Then subtract: ${b * b} − ${a * c} = ${n(b * b - a * c)}`]);
  });
  T('negatives', 'Negative numbers', () => {
    const a = ri(2, 12), b = ri(2, 12), f = ri(0, 3);
    if (f === 0) return work(`−${a} + ${b}`, b - a, [`Start at −${a} on the number line and go up ${b}`, `Answer: ${n(b - a)}`]);
    if (f === 1) return work(`${a} − (−${b})`, a + b, ['Subtracting a negative is the same as adding', `${a} + ${b} = ${a + b}`]);
    if (f === 2) return work(`−${a} × ${b}`, -a * b, ['Negative × positive = negative', `${a} × ${b} = ${a * b}, so the answer is ${n(-a * b)}`]);
    return work(`−${a} × −${b}`, a * b, ['Negative × negative = positive', `${a} × ${b} = ${a * b}`]);
  });
  T('solve-1', 'Solving equations', () => {
    const a = ri(2, 9); let x, b; do x = ri(-5, 12); while (!x); do b = ri(-20, 20); while (!b);
    const c = a * x + b;
    return { q: `Solve ${a}x${sg(b)} = ${n(c)}`, kind: 'num', v: x, pre: 'x =', show: 'x = ' + n(x),
      steps: [`${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} on both sides: ${a}x = ${n(c - b)}`, `Divide both sides by ${a}: x = ${n(c - b)} ÷ ${a} = ${n(x)}`] };
  });
  T('solve-2', 'Unknowns on both sides', () => {
    const c = ri(1, 5), a = c + ri(1, 6); let x, b, d; do x = ri(-6, 10); while (!x); do b = ri(-15, 15); while (!b);
    d = (a - c) * x + b; if (!d) d = 0;
    const rhs = (c === 1 ? '' : c) + 'x' + (d ? sg(d) : '');
    return { q: `Solve ${a}x${sg(b)} = ${rhs}`, kind: 'num', v: x, pre: 'x =', show: 'x = ' + n(x),
      steps: [`Subtract ${c === 1 ? '' : c}x from both sides: ${a - c === 1 ? '' : a - c}x${sg(b)} = ${n(d)}`, `${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)}: ${a - c === 1 ? '' : a - c}x = ${n(d - b)}`,
        a - c === 1 ? `x = ${n(x)}` : `Divide by ${a - c}: x = ${n(d - b)} ÷ ${a - c} = ${n(x)}`] };
  });
  T('substitute', 'Substitution', () => {
    const a = ri(-5, 6) || 2, b = ri(-5, 6) || -3, p = ri(2, 6), q = ri(2, 6);
    if (Math.random() < .5) {
      const v = p * a + q * b;
      return { q: `If a = ${n(a)} and b = ${n(b)}, work out ${p}a + ${q}b.`, kind: 'num', v, show: n(v),
        steps: [`Replace the letters: ${p} × ${par(a)} + ${q} × ${par(b)}`, `= ${n(p * a)} + ${par(q * b)}`, `= ${n(v)}`] };
    }
    const v = a * a + q * b;
    return { q: `If a = ${n(a)} and b = ${n(b)}, work out a² + ${q}b.`, kind: 'num', v, show: n(v),
      steps: [`${par(a)}² = ${a * a}${a < 0 ? ' (a negative squared is positive)' : ''}`, `${q} × ${par(b)} = ${n(q * b)}`, `${a * a} + ${par(q * b)} = ${n(v)}`] };
  });
  T('expand', 'Expanding brackets', () => {
    const k = ri(2, 9), p = ri(1, 5), m = ri(1, 12), neg = Math.random() < .5, A = k * p, B = k * (neg ? -m : m), px = (p === 1 ? '' : p) + 'x';
    return { q: `Expand ${k}(${px} ${neg ? '−' : '+'} ${m})`, kind: 'lin', v: 'x', a: A, b: B, show: lin(A, B, 'x'), hint: 'Type it like 6x + 15',
      steps: [`Multiply everything inside the bracket by ${k}`, `${k} × ${px} = ${A}x`, `${k} × ${neg ? '−' : ''}${m} = ${n(B)}`, `Answer: ${lin(A, B, 'x')}`] };
  });
  T('nth-term', 'nth term of a sequence', () => {
    let d; do d = ri(-5, 9); while (d >= -1 && d <= 1); const c = ri(-8, 10), t = [1, 2, 3, 4].map(i => d * i + c);
    return { q: `Find the nth term of: ${t.map(n).join(', ')}, …`, kind: 'lin', v: 'n', a: d, b: c, show: lin(d, c, 'n'), hint: 'Type it like 3n + 2',
      steps: [`The terms change by ${n(d)} each time, so it starts ${lin(d, 0, 'n')}`, `${lin(d, 0, 'n')} gives ${[1, 2, 3, 4].map(i => n(d * i)).join(', ')}`,
        c ? `To match the sequence, ${c > 0 ? 'add' : 'subtract'} ${Math.abs(c)}` : 'That already matches the sequence', `nth term = ${lin(d, c, 'n')}`] };
  });
  T('area', 'Area of triangles and trapeziums', () => {
    if (Math.random() < .5) {
      const b = ri(3, 20), h = ri(2, 15), v = b * h / 2;
      return { q: `A triangle has base ${b} cm and perpendicular height ${h} cm. Find its area.`, kind: 'num', v, suf: 'cm²', show: n(v) + ' cm²',
        steps: ['Area of a triangle = ½ × base × height', `= ½ × ${b} × ${h}`, `= ${n(v)} cm²`] };
    }
    const a = ri(3, 12), b = a + ri(1, 8), h = ri(2, 10), v = (a + b) * h / 2;
    return { q: `A trapezium has parallel sides ${a} cm and ${b} cm, and height ${h} cm. Find its area.`, kind: 'num', v, suf: 'cm²', show: n(v) + ' cm²',
      steps: ['Area of a trapezium = ½ × (a + b) × h', `= ½ × (${a} + ${b}) × ${h} = ½ × ${a + b} × ${h}`, `= ${n(v)} cm²`] };
  });
  T('circles', 'Circles: area and circumference', () => {
    const r = ri(2, 15), useD = Math.random() < .4, area = Math.random() < .5, v = area ? Math.PI * r * r : 2 * Math.PI * r, ans = Math.round(v * 10) / 10;
    const steps = []; if (useD && area) steps.push(`Radius = diameter ÷ 2 = ${2 * r} ÷ 2 = ${r} cm`);
    if (area) steps.push('Area = π × r²', `= π × ${r}² = π × ${r * r}`, `= ${v.toFixed(3)}… = ${ans} cm² (1 d.p.)`);
    else steps.push('Circumference = π × diameter', useD ? `= π × ${2 * r}` : `Diameter = 2 × ${r} = ${2 * r}, so π × ${2 * r}`, `= ${v.toFixed(3)}… = ${ans} cm (1 d.p.)`);
    return { q: `A circle has ${useD ? 'diameter ' + 2 * r : 'radius ' + r} cm. Find its ${area ? 'area' : 'circumference'} to 1 decimal place.`, kind: 'num', v: ans, tol: .051, suf: area ? 'cm²' : 'cm', show: ans + (area ? ' cm²' : ' cm'), steps };
  });
  T('pythag', 'Pythagoras', () => {
    const tri = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], null, null, null]);
    if (Math.random() < .6) {
      const [a, b] = tri || [ri(3, 12), ri(3, 14)], s = a * a + b * b, c = Math.sqrt(s), exact = Number.isInteger(c), ans = exact ? c : Math.round(c * 10) / 10;
      return { q: `A right-angled triangle has shorter sides ${a} cm and ${b} cm. Find the hypotenuse${exact ? '.' : ' to 1 d.p.'}`, kind: 'num', v: ans, tol: exact ? 1e-6 : .051, suf: 'cm', show: ans + ' cm',
        steps: ['Hypotenuse² = a² + b²', `= ${a}² + ${b}² = ${a * a} + ${b * b} = ${s}`, `Hypotenuse = √${s} = ${exact ? c : c.toFixed(3) + '… = ' + ans} cm`] };
    }
    let a, c; if (tri) { a = tri[0]; c = tri[2]; } else { c = ri(8, 20); a = ri(3, c - 2); }
    const s = c * c - a * a, b = Math.sqrt(s), exact = Number.isInteger(b), ans = exact ? b : Math.round(b * 10) / 10;
    return { q: `A right-angled triangle has hypotenuse ${c} cm and one shorter side ${a} cm. Find the other side${exact ? '.' : ' to 1 d.p.'}`, kind: 'num', v: ans, tol: exact ? 1e-6 : .051, suf: 'cm', show: ans + ' cm',
      steps: ['Shorter side² = hypotenuse² − other side²', `= ${c}² − ${a}² = ${c * c} − ${a * a} = ${s}`, `Side = √${s} = ${exact ? b : b.toFixed(3) + '… = ' + ans} cm`] };
  });
  T('angles', 'Angles', () => {
    const f = ri(0, 3);
    if (f === 0) { const a = ri(20, 90), b = ri(20, 160 - a), v = 180 - a - b; return { q: `Two angles in a triangle are ${a}° and ${b}°. Find the third angle.`, kind: 'num', v, suf: '°', show: v + '°', steps: ['Angles in a triangle add up to 180°', `180 − ${a} − ${b} = ${v}°`] }; }
    if (f === 1) { const a = ri(15, 165), v = 180 - a; return { q: `Two angles sit on a straight line. One is ${a}°. Find the other.`, kind: 'num', v, suf: '°', show: v + '°', steps: ['Angles on a straight line add up to 180°', `180 − ${a} = ${v}°`] }; }
    if (f === 2) { const a = ri(40, 130), b = ri(40, 120), c = ri(30, 300 - a - b), v = 360 - a - b - c; return { q: `Four angles meet at a point. Three are ${a}°, ${b}° and ${c}°. Find the fourth.`, kind: 'num', v, suf: '°', show: v + '°', steps: ['Angles around a point add up to 360°', `360 − ${a} − ${b} − ${c} = ${v}°`] }; }
    const N = { 5: 'pentagon', 6: 'hexagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' }, k = pick([5, 6, 8, 9, 10, 12]), ext = 360 / k, inner = Math.random() < .5;
    return { q: `Find the ${inner ? 'interior' : 'exterior'} angle of a regular ${N[k]} (${k} sides).`, kind: 'num', v: inner ? 180 - ext : ext, suf: '°', show: (inner ? 180 - ext : ext) + '°',
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
    return { q: `Find the ${k} of: ${xs.join(', ')}`, kind: 'num', v: out[0], show: n(out[0]), steps: out[1] };
  });
  T('sdt', 'Speed, distance, time', () => {
    const s = pick([20, 30, 40, 45, 50, 60, 70, 80]), t = pick([.5, 1.5, 2, 2.5, 3, 4]), d = s * t, f = ri(0, 2);
    const ts = t === .5 ? '30 minutes' : Number.isInteger(t) ? `${t} hours` : `${Math.floor(t)} hours 30 minutes`, note = Number.isInteger(t) ? [] : [`${ts} = ${t} hours`];
    if (f === 0) return { q: `A car travels ${d} km in ${ts}. Find its average speed.`, kind: 'num', v: s, suf: 'km/h', show: s + ' km/h', steps: [...note, 'Speed = distance ÷ time', `= ${d} ÷ ${t} = ${s} km/h`] };
    if (f === 1) return { q: `A cyclist travels at ${s} km/h for ${ts}. How far do they go?`, kind: 'num', v: d, suf: 'km', show: d + ' km', steps: [...note, 'Distance = speed × time', `= ${s} × ${t} = ${d} km`] };
    return { q: `How long does it take to travel ${d} km at ${s} km/h? Give your answer in hours.`, kind: 'num', v: t, suf: 'hours', show: t + ' hours', steps: ['Time = distance ÷ speed', `= ${d} ÷ ${s} = ${t} hours`] };
  });
  T('std-form', 'Standard form', () => {
    const m = ri(11, 99) / 10, neg = Math.random() < .35, p = neg ? -ri(1, 4) : ri(2, 6), v = clean(m * Math.pow(10, p)), ms = String(m);
    if (Math.random() < .5) return { q: `Write ${ms} × 10${sup(p)} as an ordinary number.`, kind: 'num', v, rel: 1e-9, show: String(v),
      steps: [`The power is ${p}, so move the decimal point ${Math.abs(p)} place${Math.abs(p) > 1 ? 's' : ''} ${p > 0 ? 'right (bigger number)' : 'left (smaller number)'}`, `${ms} → ${v}`] };
    return { q: `Write ${v} in standard form.`, kind: 'sf', v, show: `${ms} × 10${sup(p)}`, hint: 'Type it like 4.7 x 10^5',
      steps: ['Standard form is A × 10ⁿ, where 1 ≤ A < 10', `A = ${ms}`, `Count how far the decimal point moves to get from ${ms} to ${v}: ${Math.abs(p)} place${Math.abs(p) > 1 ? 's' : ''} ${p > 0 ? 'right, so n = ' + p : 'left, so n = ' + p}`, `${ms} × 10${sup(p)}`] };
  });
  T('prob', 'Probability', () => {
    const cols = ['red', 'blue', 'green', 'yellow'], k = ri(2, 3), cs = Array.from({ length: k }, () => ri(1, 9)), tot = cs.reduce((a, b) => a + b), i = ri(0, k - 1), not = Math.random() < .35;
    const num = not ? tot - cs[i] : cs[i], [sn, sd] = simp(num, tot);
    const list = cs.map((c, j) => `${c} ${cols[j]}`), desc = list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
    return { q: `A bag has ${desc} counters. One is taken at random. What is the probability it is ${not ? 'not ' : ''}${cols[i]}?`, kind: 'frac', n: sn, d: sd, simplest: false, show: fs(num, tot) + (sd !== tot ? ` (= ${fs(sn, sd)})` : ''), hint: 'Type a fraction like 3/8',
      steps: [`Total counters: ${cs.join(' + ')} = ${tot}`, not ? `Not ${cols[i]}: ${tot} − ${cs[i]} = ${num}` : `${cap(cols[i])} counters: ${num}`, `Probability = ${num}/${tot}${sd !== tot ? ' = ' + fs(sn, sd) : ''}`] };
  });
  T('compound', 'Compound interest', () => {
    const P = ri(2, 50) * 100, r = pick([2, 3, 4, 5, 6, 8]), y = ri(2, 5), m = 1 + r / 100, v = Math.round(P * Math.pow(m, y) * 100) / 100;
    return { q: `£${P} is invested at ${r}% compound interest per year. How much is it worth after ${y} years?`, kind: 'num', v, tol: .011, pre: '£', show: '£' + v.toFixed(2),
      steps: [`Multiplier: 1 + ${r}/100 = ${n(m)}`, `Apply it once per year: £${P} × ${n(m)}${sup(y)}`, `= £${v.toFixed(2)}`] };
  });
  T('rounding', 'Rounding (d.p. and s.f.)', () => {
    const dig = k => { let d; do d = ri(0, 9); while (k && d === 5); return d; };
    if (Math.random() < .5) {
      const dp = ri(1, 2), ip = ri(0, 99), ds = [dig(), dig(), dig(), dig()]; ds[dp] = dig(true);
      const x = Number(`${ip}.${ds.join('')}`), ans = Number(x.toFixed(dp)), up = ds[dp] > 5;
      return { q: `Round ${x} to ${dp} decimal place${dp > 1 ? 's' : ''}.`, kind: 'num', v: ans, show: ans.toFixed(dp),
        steps: [`Look at the digit after decimal place ${dp}: it is ${ds[dp]}`, up ? 'It is 5 or more, so round up' : 'It is less than 5, so round down', `Answer: ${ans.toFixed(dp)}`] };
    }
    const sf = ri(1, 3), big = Math.random() < .6, ds = [ri(1, 9), dig(), dig(), dig(), dig()]; ds[sf] = dig(true);
    const x = big ? Number(ds.join('')) : Number('0.0' + ds.join('')), ans = Number(x.toPrecision(sf)), up = ds[sf] > 5;
    return { q: `Round ${x} to ${sf} significant figure${sf > 1 ? 's' : ''}.`, kind: 'num', v: ans, rel: 1e-9, show: String(ans),
      steps: [`The first significant figure is the first non-zero digit: ${ds[0]}`, `The digit after ${sf} s.f. is ${ds[sf]}, so round ${up ? 'up' : 'down'}`, big ? 'Fill the remaining places with zeros to keep the size of the number' : 'Keep the leading zeros', `Answer: ${ans}`] };
  });

  /* ---------- Physics: AQA equations to recall, forwards and rearranged ---------- */
  const P = {};
  const E = (id, name, eq, out, ins, sub, re, f) => { P[id] = { name, eq, out, ins, sub, re, f }; };
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
  function genPhys(e) {
    const v = {}; for (const [k, , , , vals] of e.ins) v[k] = pick(vals);
    const [ok, osym, oname, ounit] = e.out; v[ok] = clean(e.f(v));
    const keys = Object.keys(e.re), desc = list => list.map(i => `${i[1]} = ${n(v[i[0]])} ${i[3]}`).join(', ');
    if (!keys.length || Math.random() < .5)
      return { q: `Find the ${oname} when ${desc(e.ins)}.`, sub: e.name, kind: 'num', v: v[ok], rel: .005, suf: ounit, show: `${n(v[ok])} ${ounit}`,
        steps: [`Equation: ${e.eq}`, `${osym} = ${fill(e.sub, v)}`, `= ${n(v[ok])} ${ounit}`] };
    const k = pick(keys), inn = e.ins.find(i => i[0] === k), known = [[ok, osym, oname, ounit], ...e.ins.filter(i => i[0] !== k)];
    return { q: `Find the ${inn[2]} when ${desc(known)}.`, sub: e.name + ' · rearranging', kind: 'num', v: v[k], rel: .005, suf: inn[3], show: `${n(v[k])} ${inn[3]}`,
      steps: [`Equation: ${e.eq}`, `Rearrange: ${e.re[k][0]}`, `${inn[1]} = ${fill(e.re[k][1], v)}`, `= ${n(v[k])} ${inn[3]}`] };
  }

  /* ---------- Quotes: fill the missing word ---------- */
  const STOP = new Set('that this with from your have will what which their there these those they them then than into upon shall would could should been were when where while more most only very such some each other being make made much many like just also over here thee thou thy thine hath doth does done unto'.split(' '));
  let quoteSource = () => [];
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function genQuote(deck) {
    const qs = quoteSource(deck).filter(c => /^["“'‘]/.test(c.f.trim()));
    if (!qs.length) return null;
    const c = pick(qs), text = c.f.trim().replace(/^["“'‘]+|["”'’!?.]+$/g, '');
    const words = (text.match(/[A-Za-z][A-Za-z']*[A-Za-z]|[A-Za-z]/g) || []);
    let cand = words.filter(w => w.length >= 4 && !STOP.has(w.toLowerCase()));
    if (!cand.length) cand = [...words].sort((a, b) => b.length - a.length).slice(0, 1);
    const w = pick(cand), blank = text.replace(new RegExp(`(^|[^A-Za-z'])${escRe(w)}(?![A-Za-z'])`), `$1${'_'.repeat(Math.max(4, Math.min(9, w.length)))}`);
    return { q: `“${blank}”`, sub: 'Fill the missing word', kind: 'word', w, show: w, steps: [`“${text}”`, c.b] };
  }

  /* ---------- registry ---------- */
  const QDECKS = { 'q-mac': ['mac', 'Macbeth'], 'q-acc': ['acc', 'A Christmas Carol'], 'q-je': ['je', "Journey's End"] };
  const MATHS = Object.keys(M), PHYS = Object.keys(P).map(k => 'p-' + k), QUOTES = Object.keys(QDECKS);
  const trackOf = id => id.startsWith('p-') ? 'physics' : id.startsWith('q-') ? 'quotes' : 'maths';
  const name = id => M[id] ? M[id].name : P[id.slice(2)] ? P[id.slice(2)].name : QDECKS[id] ? QDECKS[id][1] : id;
  function gen(id) {
    let q = null;
    try {
      if (M[id]) q = M[id].gen();
      else if (P[id.slice(2)]) q = genPhys(P[id.slice(2)]);
      else if (QDECKS[id]) q = genQuote(QDECKS[id][0]);
    } catch (e) { q = null; }
    if (q) q.id = id;
    return q;
  }

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
  const UNSUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9, '⁻': '-' };
  function parseSF(s) {
    s = norm(s).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, c => '^' + UNSUP[c]).replace(/\^(?=\^)/g, '').replace(/\s/g, '').replace(/\^-\^/g, '^-');
    let m = s.match(/^(-?\d+(?:\.\d+)?)[x×*]10\^?\(?(-?\d+)\)?$/i) || s.match(/^(-?\d+(?:\.\d+)?)e(-?\d+)$/i);
    return m ? { m: +m[1], p: +m[2] } : null;
  }
  function check(q, raw) {
    const s = norm(raw);
    if (!s) return { valid: false, msg: 'Type an answer first' };
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
    if (q.kind === 'word') {
      const a = s.toLowerCase().replace(/[^a-z']/g, ''), b = q.w.toLowerCase();
      return { valid: true, ok: a === b || a.replace(/'/g, '') === b.replace(/'/g, '') };
    }
    return { valid: false };
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  return { MATHS, PHYS, QUOTES, gen, check, name, trackOf, setQuoteSource: f => { quoteSource = f; } };
})();
