/* Archeron · Mistake detective. When an answer is wrong, work out what each classic slip would have given from the
   question's own numbers; if the answer matches one, say which slip it was. Most sites only say "wrong".
   SLIPS.find(q, typedAnswer) → a sentence, or null when the answer matches no known slip (then nothing is claimed). */
'use strict';
const SLIPS = (() => {
  const PI = Math.PI, r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
  /* A slip only counts when the answer IS that slip's value, rounded (or cut off) to the decimal places the student typed.
     Being merely close to it proves nothing, so nothing is claimed. DP is set from the typed answer by find(). */
  let DP = 0;
  const near = (x, c) => {
    if (!Number.isFinite(c)) return false;
    const d = Math.abs(x - c); if (d < 1e-9) return true;
    if (DP >= 6) return d <= Math.max(1e-6, Math.abs(c) * 1e-9);
    return d <= .5 * 10 ** -DP + 1e-9 && d <= Math.abs(c) * .05; /* rounded, and not so short that any small number would fit */
  };
  /* the same tolerance the answer checker uses, so a "slip" that would be marked right is never named */
  const right = (q, c) => q.exact ? Math.abs(c - q.v) < 1e-9 : Math.abs(c - q.v) <= (q.tol != null ? q.tol : q.rel != null ? Math.max(Math.abs(q.v) * q.rel, q.rel >= .005 ? .01 : 0) : 1e-6) + 1e-12;
  const hit = (q, x, list) => { for (const [c, m] of list) if (c != null && Number.isFinite(c) && !right(q, c) && (q.exact ? Math.abs(x - c) < 1e-9 : near(x, c))) return m; return null; };
  const SUPN = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
  const supNum = s => +[...s].map(c => SUPN[c]).join('');
  const N = {}; /* number answers: topic → (q, x) → message */

  N['pct-of'] = (q, x) => { const { p, amt } = q.dm; return hit(q, x, [
    [amt * p, `Looks like you multiplied by ${p} but didn't divide by 100. ${p}% means ${p} ÷ 100.`],
    [amt - amt * p / 100, `That is what's left after taking ${p}% away. The question wants ${p}% itself.`],
    [amt / p, 'Looks like you divided by the percentage. Find 10% first (÷ 10), then build up.'],
    [amt * p / 10, 'Decimal point slip: 10% is ÷ 10, so 1% is ÷ 100.']]); };
  N['pct-incdec'] = (q, x) => { const { p, up, amt } = q.dm; return hit(q, x, [
    [amt * p / 100, `That is the ${up ? 'increase' : 'decrease'} on its own. Now ${up ? 'add it to' : 'take it off'} £${amt}.`],
    [amt * (up ? 1 - p / 100 : 1 + p / 100), `That is a${up ? ' decrease' : 'n increase'}. Check the direction: the question says ${up ? 'increase' : 'decrease'}.`],
    [amt + (up ? p : -p), `Looks like you ${up ? 'added' : 'took off'} £${p}, not ${p}%. Work out ${p}% of £${amt} first.`],
    [amt * p, 'Multiplier slip: use (100 ± p) ÷ 100, so a 15% increase is × 1.15.']]); };
  N['pct-change'] = (q, x) => { const { o, nw } = q.dm, c = Math.abs(nw - o); return hit(q, x, [
    [c / nw * 100, `You divided by the new value. Percentage change always divides by the original (${o}).`],
    [c, `${c} is the change in pounds. Now divide by the original and multiply by 100.`],
    [c / o, 'Nearly: that is a decimal. Multiply by 100 to make it a percentage.'],
    [nw / o * 100, 'That is the new price as a percentage of the old one. Take away 100 to get the change.']]); };
  N['frac-of'] = (q, x) => { const { k, d, amt } = q.dm; return hit(q, x, [
    [amt / d, `That is one part (÷ ${d}). Now multiply by the top number, ${k}.`],
    [amt / k * d, 'Upside down: divide by the bottom number, then multiply by the top.'],
    [amt * k, `Divide by ${d} first, then multiply by ${k}.`]]); };
  N['ratio-share'] = (q, x) => { const { a, b, tot, part, name } = q.dm, one = tot / (a + b); return hit(q, x, [
    [one, `That is one part. ${name} gets ${part} part${part > 1 ? 's' : ''}, so multiply by ${part}.`],
    [(a + b - part) * one, `That is the other person's share. The question asks for ${name}'s.`],
    [tot / part, `Add the ratio numbers first: ${a} + ${b} = ${a + b} parts in total.`],
    [tot / a, `Add the ratio numbers first: ${a} + ${b} = ${a + b} parts in total.`]]); };
  N['solve-1'] = (q, x) => { const { a, b, c } = q.dm; return hit(q, x, [
    [(c + b) / a, `When ${b < 0 ? '−' : '+'}${Math.abs(b)} moves to the other side it becomes ${b < 0 ? '+' : '−'}${Math.abs(b)}. Do the opposite to both sides.`],
    [c - b, `Nearly: that is what ${a}x equals. Now divide by ${a}.`],
    [(c - b) * a, `Divide by ${a}, don't multiply: ${a}x means ${a} × x.`],
    [c / a - b, 'Undo the + or − first, then divide.']]); };
  N['solve-2'] = (q, x) => { const { a, b, c, d } = q.dm; return hit(q, x, [
    [(d - b) / (a + c), `When ${c === 1 ? '' : c}x moves across it is subtracted: ${a}x − ${c === 1 ? '' : c}x = ${a - c === 1 ? '' : a - c}x.`],
    [(d + b) / (a - c), `Check the sign when you move ${b < 0 ? '−' : '+'}${Math.abs(b)} across: do the opposite.`],
    [d - b, `Nearly: that is what ${a - c}x equals. Now divide by ${a - c}.`]]); };
  N['substitute'] = (q, x) => { const { a, b, p, q: k, sq } = q.dm;
    if (sq) return hit(q, x, [[-(a * a) + k * b, `A negative number squared is positive: (${a})² = ${a * a}.`], [2 * a + k * b, `a² means a × a, not 2 × a.`], [a * a + k + b, `${k}b means ${k} × b.`]]);
    return hit(q, x, [[p * Math.abs(a) + k * Math.abs(b), 'Keep the minus signs when you substitute. Use brackets: 3 × (−2) = −6.'], [p + a + k + b, `${p}a means ${p} × a, not ${p} + a.`]]); };
  N['area'] = (q, x) => { const D = q.dm; return D.shape === 'tri'
    ? hit(q, x, [[D.b * D.h, 'For a triangle, halve it: ½ × base × height.'], [D.b + D.h, 'Area multiplies: ½ × base × height.']])
    : hit(q, x, [[(D.a + D.b) * D.h, "Don't forget the ½: area = ½ × (a + b) × h."], [D.a * D.b * D.h / 2, 'Add the parallel sides first: ½ × (a + b) × h.']]); };
  N['circles'] = (q, x) => { const { r, useD, area } = q.dm;
    return area ? hit(q, x, [[useD ? r1(PI * 4 * r * r) : null, 'You used the diameter. Halve it to get the radius before you square it.'],
      [r1(2 * PI * r), 'That is the circumference. Area = π × r².'], [r1(PI * r), 'Square the radius: area = π × r².'], [r1(PI * PI * r * r), 'Square only the radius, not π.']])
      : hit(q, x, [[r1(PI * r), 'Circumference = π × diameter. You used the radius: double it first.'], [useD ? r1(PI * 4 * r) : null, 'You doubled the diameter. Circumference = π × diameter.'],
        [r1(PI * r * r), 'That is the area. Circumference = π × diameter.']]); };
  N['pythag'] = (q, x) => { const D = q.dm, rt = v => r1(Math.sqrt(v));
    if (D.hyp) return hit(q, x, [[D.a + D.b, 'Square, add, then square root: √(a² + b²). Adding the sides does not work.'], [D.a * D.a + D.b * D.b, 'Nearly: now square root it.'], [rt(Math.abs(D.b * D.b - D.a * D.a)), 'For the hypotenuse, add the squares. Subtract only for a shorter side.']]);
    return hit(q, x, [[rt(D.a * D.a + D.c * D.c), 'For a shorter side, subtract: c² − a². Add only for the hypotenuse.'], [D.c * D.c - D.a * D.a, 'Nearly: now square root it.'], [D.c - D.a, 'Square first, then subtract, then square root.']]); };
  N['angles'] = (q, x) => { const D = q.dm;
    if (D.f === 'tri') return hit(q, x, [[360 - D.a - D.b, 'Angles in a triangle add up to 180°, not 360°.']]);
    if (D.f === 'line') return hit(q, x, [[360 - D.a, 'Angles on a straight line add up to 180°.'], [90 - D.a, 'Angles on a straight line add up to 180°, not 90°.']]);
    if (D.f === 'point') return hit(q, x, [[180 - D.a - D.b - D.c, 'Angles around a point add up to 360°.']]);
    const ext = 360 / D.k;
    return D.inner ? hit(q, x, [[ext, 'That is the exterior angle. Interior = 180° − exterior.'], [180 * (D.k - 2), 'That is the total of all the interior angles. Divide by the number of sides.']])
      : hit(q, x, [[180 - ext, 'That is the interior angle. Exterior = 360° ÷ number of sides.']]); };
  N['averages'] = (q, x) => { const { k, xs } = q.dm, s = xs.reduce((a, b) => a + b, 0), so = [...xs].sort((a, b) => a - b), n = xs.length, med = n % 2 ? so[(n - 1) / 2] : null;
    if (k === 'mean') return hit(q, x, [[s, `That is the total. Now divide by how many numbers there are (${n}).`], [med, 'That is the median. The mean is the total ÷ how many.']]);
    if (k === 'median') return hit(q, x, [[n % 2 ? xs[(n - 1) / 2] : null, 'Put the numbers in order first, then find the middle one.'], [s / n, 'That is the mean. The median is the middle value once they are in order.']]);
    if (k === 'range') return hit(q, x, [[so[n - 1], 'Range = biggest − smallest.'], [Math.abs(xs[n - 1] - xs[0]), 'Use the biggest and smallest values, not the first and last.']]);
    return hit(q, x, [[3, 'The mode is the value itself, not how many times it appears.']]); };
  N['sdt'] = (q, x) => { const { f, s, t, d } = q.dm, t3 = t % 1 ? Math.floor(t) + .3 : null;
    if (f === 's') return hit(q, x, [[d * t, 'Speed = distance ÷ time.'], [t3 && d / t3, '30 minutes is 0.5 of an hour, not 0.3.'], [t / d, 'Upside down: speed = distance ÷ time.']]);
    if (f === 'd') return hit(q, x, [[s / t, 'Distance = speed × time.'], [t3 && s * t3, '30 minutes is 0.5 of an hour, not 0.3.']]);
    return hit(q, x, [[s / d, 'Upside down: time = distance ÷ speed.'], [d * s, 'Time = distance ÷ speed.'], [t * 60, 'The question asks for hours, not minutes.']]); };
  N['std-form'] = (q, x) => { const { m, p, toOrd } = q.dm; if (!toOrd) return null;
    return hit(q, x, [[m * 10 ** (p - 1), `Move the decimal point exactly ${Math.abs(p)} place${Math.abs(p) > 1 ? 's' : ''}.`], [m * 10 ** (p + 1), `Move the decimal point exactly ${Math.abs(p)} place${Math.abs(p) > 1 ? 's' : ''}.`],
      [m * 10 ** -p, p > 0 ? 'A positive power makes the number bigger: move the point right.' : 'A negative power makes the number smaller: move the point left.']]); };
  N['compound'] = (q, x) => { const { P, r, y } = q.dm, m = 1 + r / 100; return hit(q, x, [
    [r2(P * (1 + r * y / 100)), `That is simple interest. Compound interest multiplies every year: × ${m}^${y}.`],
    [r2(P * m ** y - P), 'That is just the interest. The question asks how much it is worth in total.'],
    [r2(P * m), `That is after one year. Use the power: × ${m}^${y}.`]]); };
  N['rounding'] = (q, x) => { const D = q.dm;
    if (D.dp) { const f = 10 ** D.dp; return hit(q, x, [[Math.trunc(D.x * f) / f, 'Look at the next digit: 5 or more rounds up.'], [Math.round(D.x * f * 10) / (f * 10), `Count again: ${D.dp} decimal place${D.dp > 1 ? 's' : ''} after the point.`]]); }
    const big = D.x >= 1, digits = big ? Math.floor(Math.log10(D.x)) + 1 : 0, ans = q.v;
    return hit(q, x, [[big ? ans / 10 ** (digits - D.sf) : null, 'Keep the size of the number: fill the empty places with zeros.'], [big ? Math.floor(D.x / 10 ** (digits - D.sf)) * 10 ** (digits - D.sf) : null, 'Look at the next digit: 5 or more rounds up.']]); };
  N['bidmas'] = (q, x) => { const S = q.sl; if (!S) return null;
    if (S.f === 0) return hit(q, x, [[(S.a + S.b) * S.c, 'Multiply before you add (BIDMAS).']]);
    if (S.f === 1) return hit(q, x, [[S.a + S.b * S.c, 'Brackets first, then multiply.']]);
    if (S.f === 2) return hit(q, x, [[(S.a * S.b - S.e) / S.d, 'Do the × and ÷ before the −.']]);
    return hit(q, x, [[S.b * 2 - S.a * S.c, `${S.b}² means ${S.b} × ${S.b}, not ${S.b} × 2.`], [(S.b * S.b - S.a) * S.c, 'Multiply before you subtract.']]); };
  N['h-revpct'] = (q, x) => { const m0 = q.q.match(/After a (\d+)% (increase|decrease), a price is £([\d.]+)/); if (!m0) return null;
    const p = +m0[1], up = m0[2] === 'increase', now = +m0[3];
    return hit(q, x, [[now * (up ? 1 - p / 100 : 1 + p / 100), `Reverse percentages can't be undone by taking off ${p}%. Divide £${now} by the multiplier ${(100 + (up ? p : -p)) / 100}.`],
      [now - (up ? 1 : -1) * now * p / 100, `${p}% of the new price is not the same as ${p}% of the original. Divide by the multiplier instead.`]]); };
  N['h-ind'] = (q, x) => {
    const nums = (q.q.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g) || []).map(supNum); if (nums.length < 2) return null; const [m, k] = nums;
    if (q.q.includes('×')) return hit(q, x, [[m * k, 'When you multiply, add the powers.']]);
    if (q.q.includes('÷')) return hit(q, x, [[m / k, 'When you divide, subtract the powers.'], [m + k, 'When you divide, subtract the powers.']]);
    return hit(q, x, [[m + k, 'A power of a power: multiply the powers.']]); };
  N['h-trig'] = (q, x) => { const H = q.q.match(/hypotenuse ([\d.]+) cm and angle (\d+)°/), A = q.q.match(/angle (\d+)° and the side adjacent to it is ([\d.]+) cm/), list = [];
    if (H) { const h0 = +H[1], a = +H[2], d = a * PI / 180, opp = /opposite/.test(q.q.split('Find')[1] || '');
      list.push([r1(h0 * (opp ? Math.sin(a) : Math.cos(a))), 'Your calculator is in radians. Switch it to degrees (D or DEG on the screen).'],
        [r1(h0 * (opp ? Math.cos(d) : Math.sin(d))), opp ? 'Opposite and hypotenuse: use SIN (SOH), not cos.' : 'Adjacent and hypotenuse: use COS (CAH), not sin.'], [r1(opp ? h0 / Math.sin(d) : h0 / Math.cos(d)), 'Multiply by the hypotenuse, don\'t divide.']); }
    if (A) { const a = +A[1], adj = +A[2], d = a * PI / 180; list.push([r1(adj * Math.tan(a)), 'Your calculator is in radians. Switch it to degrees (D or DEG on the screen).'], [r1(adj / Math.tan(d)), 'Opposite = adjacent × tan θ. Multiply, don\'t divide.']); }
    return hit(q, x, list); };

  /* Science, Business and Geography calculations carry their numbers in q.sl */
  N['bc-mag'] = (q, x) => { const S = q.sl; if (!S) return null;
    return S.f === 0 ? hit(q, x, [[S.real / S.img, 'Upside down: magnification = image size ÷ real size.']])
      : S.f === 1 ? hit(q, x, [[S.real / S.mg, 'Image size = magnification × real size.']]) : hit(q, x, [[S.img * S.mg, 'Real size = image size ÷ magnification.']]); };
  N['bc-osmosis'] = (q, x) => { const S = q.sl; if (!S) return null; const dif = S.e - S.s;
    return hit(q, x, [[r1(dif / S.e * 100), 'Divide by the starting mass, not the final mass.'], [r1(dif), 'That is the change in grams. Divide by the starting mass and multiply by 100.'], [r1(-dif / S.s * 100), dif < 0 ? 'The mass went down, so the change is negative.' : 'The mass went up, so the change is positive.']]); };
  N['bc-mean'] = (q, x) => { const S = q.sl; return S ? hit(q, x, [[S.xs.reduce((a, b) => a + b, 0), `That is the total. Now divide by how many results (${S.xs.length}).`]]) : null; };
  N['cc-mr'] = (q, x) => { const S = q.sl; return S ? hit(q, x, [[S.parts.reduce((a, [ar]) => a + ar, 0), 'Multiply each relative atomic mass by the number of atoms: the small number after the symbol.']]) : null; };
  N['cc-pct'] = (q, x) => { const S = q.sl; if (!S) return null;
    return hit(q, x, [[r1(S.ar / S.mr * 100), `There ${S.c > 1 ? `are ${S.c} atoms` : 'is 1 atom'} of that element: use ${S.c} × ${S.ar}.`], [r1(S.mr / (S.ar * S.c) * 100), 'Upside down: mass of the element ÷ Mr × 100.'], [Math.round(S.ar * S.c / S.mr * 1000) / 1000, 'Multiply by 100 to make it a percentage.']]); };
  N['cc-conc'] = (q, x) => { const S = q.sl; return S ? hit(q, x, [[S.m / S.v, `Convert ${S.v} cm³ to dm³ first: divide by 1000.`], [S.v / 1000 / S.m, 'Upside down: concentration = mass ÷ volume.'], [S.m * S.v / 1000, 'Concentration = mass ÷ volume. Divide, don\'t multiply.']]) : null; };
  N['cc-rf'] = (q, x) => { const S = q.sl; return S ? hit(q, x, [[r2(S.sol / S.spot), 'Upside down: Rf = spot distance ÷ solvent distance. It is always less than 1.']]) : null; };
  N['cc-rate'] = (q, x) => { const S = q.sl; return S ? hit(q, x, [[r2(S.t / S.v), 'Upside down: mean rate = amount of product ÷ time.']]) : null; };
  N['bz-profit'] = (q, x) => { const S = q.sl; if (!S) return null; const rev = S.p * S.q, tc = S.fc + S.vc * S.q;
    if (S.f === 0) return hit(q, x, [[(S.p - S.vc) * S.q, 'Revenue is just price × quantity. Costs are not taken off.'], [rev - tc, 'That is profit. Revenue is price × quantity.']]);
    if (S.f === 1) return hit(q, x, [[S.fc + S.vc, 'Variable cost is per unit: multiply it by the quantity.'], [S.vc * S.q, 'Add the fixed costs as well.']]);
    return hit(q, x, [[rev - S.fc, 'Take off the variable costs too (variable cost × quantity).'], [rev - S.fc - S.vc, 'Variable cost is per unit: multiply it by the quantity.'], [tc - rev, 'Profit = revenue − total costs. Check the order.']]); };
  N['bz-breakeven'] = (q, x) => { const S = q.sl; return S ? hit(q, x, [[S.fc / S.p, 'Divide by the contribution (price − variable cost), not the price.'], [S.fc / S.vc, 'Divide by the contribution: price − variable cost.']]) : null; };
  N['bz-margins'] = (q, x) => { const S = q.sl; if (!S) return null;
    return S.net ? hit(q, x, [[r1(S.gp / S.rev * 100), 'That is the gross profit margin. Take off the other expenses first.'], [r2(S.np / S.rev), 'Multiply by 100 to make it a percentage.']])
      : hit(q, x, [[r1((S.rev - S.gp) / S.rev * 100), 'That is cost of sales as a percentage. Use gross profit ÷ revenue × 100.'], [r2(S.gp / S.rev), 'Multiply by 100 to make it a percentage.']]); };
  N['bz-arr'] = (q, x) => { const S = q.sl; return S ? hit(q, x, [[S.tot / S.cost * 100, `Divide the total profit by ${S.y} years first, to get the average per year.`], [S.tot / S.y, 'That is the average profit per year. Now divide by the cost and multiply by 100.']]) : null; };
  N['gc-density'] = (q, x) => { const S = q.sl; return S ? hit(q, x, [[S.area / S.pop, 'Upside down: density = population ÷ area.']]) : null; };

  /* Physics equations: the unknown and every known value are in q.dm */
  function phys(q, x) {
    const D = q.dm, e = LEARN.PEQ[D.pid]; if (!e) return null;
    const v = D.v, out = e.out[0], L = [];
    if (D.pid === 'ke') {
      if (D.find === out) L.push([v.m * v.v * v.v, "Don't forget the ½: Eₖ = ½ × m × v²."], [.5 * v.m * v.v, 'Square the speed: v² = v × v.'], [(.5 * v.m * v.v) ** 2, 'Only the speed is squared.']);
      if (D.find === 'v') L.push([2 * v.E / v.m, 'Nearly: now square root it.'], [Math.sqrt(v.E / v.m), 'Remember the 2: v = √(2 × Eₖ ÷ m).']);
      if (D.find === 'm') L.push([v.E / (v.v * v.v), 'Remember the 2: m = 2 × Eₖ ÷ v².'], [2 * v.E / v.v, 'Square the speed: divide by v².']);
    }
    if (D.pid === 'power-ir') {
      if (D.find === out) L.push([v.I * v.R, 'Square the current: P = I² × R.'], [(v.I * v.R) ** 2, 'Only the current is squared.']);
      if (D.find === 'I') L.push([v.P / v.R, 'Nearly: now square root it.']);
      if (D.find === 'R') L.push([v.P / v.I, 'Divide by I², not I.']);
    }
    if ((D.pid === 'weight' || D.pid === 'gpe') && D.find === out) L.push([v[out] / 9.8 * 10, 'Use g = 9.8 N/kg, the value the question gives.']);
    const ins = e.ins.map(i => i[0]).filter(k => !(k === 'g' && e.ins.length > 2));
    if (D.find === out && ins.length === 2) {
      const [a, b] = ins, mult = /×/.test(e.eq.split('=')[1]);
      L.push(mult ? [v[a] / v[b], `The equation multiplies: ${e.eq}.`] : [v[a] * v[b], `The equation divides: ${e.eq}.`], [v[b] / v[a], mult ? `The equation multiplies: ${e.eq}.` : `Upside down: ${e.eq}.`]);
    }
    if (D.find !== out && e.re[D.find]) {
      const known = [out, ...e.ins.map(i => i[0]).filter(k => k !== D.find)].map(k => v[k]), msg = `Rearrange first: ${e.re[D.find][0]}.`;
      L.push([known.reduce((p, c) => p * c, 1), msg]);
      if (known.length === 2) L.push([known[1] / known[0], msg]);
    }
    return hit(q, x, L);
  }

  /* fraction answers (compared by value) */
  const F = {};
  F['frac-add'] = (q, x) => { const { a, b, sub } = q.dm, L = a[1] * b[1] / gcdN(a[1], b[1]), top = sub ? a[0] - b[0] : a[0] + b[0];
    return hit(q, x, [[top / (a[1] + b[1]), `Looks like you ${sub ? 'subtracted' : 'added'} the bottoms too. Make the denominators the same first, then only ${sub ? 'subtract' : 'add'} the tops.`],
      [top / L, 'You found the common denominator but didn\'t change the tops. Whatever you do to the bottom, do to the top.']]); };
  F['frac-mul'] = (q, x) => { const { a, b, div } = q.dm;
    return div ? hit(q, x, [[a[0] * b[0] / (a[1] * b[1]), 'You multiplied without flipping. To divide: keep the first, change ÷ to ×, flip the second.'], [a[1] * b[0] / (a[0] * b[1]), 'You flipped the first fraction. Only the second one flips.']])
      : hit(q, x, [[a[0] * b[1] / (a[1] * b[0]), 'For ×, multiply straight across: top × top, bottom × bottom. Flipping is only for ÷.'], [(a[0] + b[0]) / (a[1] + b[1]), 'Multiply the tops and multiply the bottoms. Don\'t add them.']]); };
  F['prob'] = (q, x) => { const { cs, i, not, cols } = q.dm, tot = cs.reduce((p, c) => p + c, 0);
    return hit(q, x, [[not ? cs[i] / tot : (tot - cs[i]) / tot, not ? `That is the chance it IS ${cols[i]}. "Not ${cols[i]}" is 1 minus that.` : `That is the chance it is NOT ${cols[i]}.`],
      [cs[i] / (tot - cs[i]), 'The bottom of the fraction is the total number of counters.']]); };
  const gcdN = (p, r) => { while (r) [p, r] = [r, p % r]; return p; };

  /* linear expression answers */
  const Lin = {};
  Lin['expand'] = (q, r) => { const { k, p, m } = q.dm;
    if (r.a === k * p && r.b === m) return `Multiply every term in the bracket by ${k}, including the number.`;
    if (r.a === p && r.b === k * m) return `Multiply every term in the bracket by ${k}, including the x term.`;
    if (r.a === q.a && r.b === -q.b) return 'Check the sign of the number term: a positive times a negative is negative.';
    return null; };
  Lin['nth-term'] = (q, r) => { const { d, c } = q.dm;
    if (r.a === c && r.b === d && c !== d) return 'Swapped round: the number in front of n is the difference between the terms.';
    if (r.a === d && r.b === d + c && c) return `The number on the end is not the first term. Compare ${d}n with the sequence to see what to add.`;
    if (r.a === -d && r.b === c) return 'Check the sign of the difference: is the sequence going up or down?';
    return null; };

  function generic(q, x) {
    const v = q.v; if (!Number.isFinite(v)) return null;
    if (v && near(x, -v)) return v < 0 ? 'Right size, wrong sign: this answer should be negative.' : 'Right size, wrong sign: this answer should be positive.';
    for (const k of [1, 2, 3, 6, -1, -2, -3, -6]) if (v && near(x, v * 10 ** k)) return `Your answer is ${(10 ** Math.abs(k)).toLocaleString('en-GB')} times too ${k > 0 ? 'big' : 'small'}. Check the units (g and kg, cm and m, cm³ and dm³) and the decimal point.`;
    const dp = /(\d) d\.p\.|(\d) decimal place/.exec(q.q), whole = /nearest whole/.test(q.q);
    if ((dp || whole) && Math.abs(x - v) <= 1.5 * 10 ** -(dp ? +(dp[1] || dp[2]) : 0)) return `Close. Check the rounding: the question wants ${whole ? 'a whole number' : `${dp[1] || dp[2]} decimal place${(dp[1] || dp[2]) > 1 ? 's' : ''}`}.`;
    if (q.tol && v && Math.abs(x - v) <= Math.abs(v) * .02) return 'Very close. Keep the full calculator value until the end, and only round your final answer.';
    return null;
  }
  function fracGeneric(q, x) {
    const v = q.n / q.d; if (q.n && Math.abs(x - 1 / v) < 1e-9) return 'Upside down: check which number goes on the bottom.';
    return null;
  }

  const safe = f => { try { return f() || null; } catch (e) { return null; } };
  function find(q, raw) {
    if (!q || !raw || !String(raw).trim()) return null;
    DP = Math.min(6, ((String(raw).replace(/,/g, '').match(/\.(\d+)/) || [, ''])[1]).length);
    try {
      if (q.kind === 'num') { const x = LEARN.parseNum(raw); if (x == null) return null; return safe(() => N[q.id] && N[q.id](q, x)) || safe(() => q.id.startsWith('p-') && q.dm && phys(q, x)) || safe(() => generic(q, x)); }
      if (q.kind === 'frac') { const f = LEARN.parseFrac(raw); if (!f) return null; const x = f.dec != null ? f.dec : f.n / f.d, qq = Object.assign({}, q, { v: q.n / q.d, exact: true }); return (F[q.id] && q.dm && F[q.id](qq, x)) || fracGeneric(q, x); }
      if (q.kind === 'lin') { const r = LEARN.parseLin(raw, q.v); return r && Lin[q.id] && q.dm ? Lin[q.id](q, r) : null; }
    } catch (e) { /* a rule that cannot read this question says nothing rather than guessing */ }
    return null;
  }
  return { find, topics: () => [...Object.keys(N), ...Object.keys(F), ...Object.keys(Lin)] };
})();
