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
  const B = {};

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
      { kind: 'q', say: hyp ? 'We know the two shorter sides and need the longest side, the hypotenuse.' : 'We know the hypotenuse and one shorter side.', tri: lab },
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

  /* ---------- Physics: every AQA equation in learn.js, forwards and rearranged ---------- */
  /* The display templates in learn.js are evaluated as arithmetic here, so the rearranged equation is
     checked independently of the value the generator picked. They are fixed strings in our own code. */
  const evalT = (tpl, v) => Function('"use strict";return (' + tpl.replace(/\{(\w+)\}/g, (_, k) => `(${v[k]})`).replace(/×/g, '*').replace(/÷/g, '/').replace(/½/g, '0.5').replace(/²/g, '**2').replace(/√/g, 'Math.sqrt') + ')')();
  const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => n(v[k]));
  B.phys = q => {
    const { pid, v, find } = q.dm, e = LEARN.PEQ[pid], all = [e.out, ...e.ins], tgt = all.find(i => i[0] === find), known = all.filter(i => i[0] !== find), fwd = find === e.out[0];
    const tpl = fwd ? e.sub : e.re[find][1], got = evalT(tpl, v), back = { ...v, [find]: got };
    const lines = [
      { kind: 'q', say: 'Write down what you know, with units.', math: known.map(i => `${i[1]} = ${n(v[i[0]])} ${i[3]}`).join('    ') },
      { say: `We need the ${tgt[2]} (${tgt[1]}), measured in ${tgt[3]}.`, math: `${tgt[1]} = ?` },
      { say: `The equation that links ${all.map(i => i[2]).join(', ').replace(/, ([^,]*)$/, ' and $1')}:`, math: e.eq, why: 'Choose the equation that contains everything you know and the thing you need.' }];
    if (!fwd) lines.push({ say: `Rearrange to get ${tgt[1]} on its own.`, math: e.re[find][0], why: 'Do the same thing to both sides, exactly like solving an equation.' });
    lines.push({ say: 'Substitute the numbers in.', math: `${tgt[1]} = ${fill(tpl, v)}` },
      { kind: 'answer', say: 'Calculate, and always write the unit.', math: `${tgt[1]} = ${n(got)} ${tgt[3]}` });
    if (fwd) { const k = Object.keys(e.re)[0], ki = k && e.ins.find(i => i[0] === k);
      if (ki) lines.push({ kind: 'check', say: `Check by working backwards to the ${ki[2]}.`, math: `${e.re[k][0].split(' = ')[0]} = ${fill(e.re[k][1], back)} = ${n(evalT(e.re[k][1], back))} ${ki[3]} ✓` }); }
    else lines.push({ kind: 'check', say: `Check: put ${tgt[1]} = ${n(got)} back into ${e.eq}.`, math: `${e.out[1]} = ${fill(e.sub, back)} = ${n(evalT(e.sub, back))} ${e.out[3]} ✓` });
    lines.push({ kind: 'idea', say: 'Equation → rearrange → substitute → calculate → unit.' });
    const inv = fwd ? Object.keys(e.re).every(k => near(evalT(e.re[k][1], back), v[k])) : near(evalT(e.sub, back), v[e.out[0]]);
    return { lines, checks: [['calculation is right', near(got, v[find])], ['works backwards to the given values', inv], ['unit matches', q.suf === tgt[3]], ['matches the marked answer', near(clean(got), q.v)]] };
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
    lines.push({ kind: 'answer', say: 'Every element now matches on both sides.', math: eq(co) },
      { kind: 'idea', say: 'Only change the big numbers in front.', why: 'Changing a small number would make a different substance: H₂O is water, H₂O₂ is bleach.' });
    const t = count(co), g = co.reduce(gcd);
    return { lines, checks: [['atoms balance for every element', t.every(r => r[1] === r[2])], ['smallest whole numbers', g === 1 && co.every(c => Number.isInteger(c) && c >= 1)],
      ['matches the marked answer', String(CHEM.solve(e)) === String(co)]] };
  };

  /* ---------- Any other question with worked steps: play those steps as written ---------- */
  function fromSteps(q) {
    const lines = q.steps.map(s => { const i = s.indexOf(': '); return i > 0 && i < 60 ? { say: s.slice(0, i) + ':', math: s.slice(i + 2) } : { math: s }; });
    lines.unshift({ kind: 'q', say: 'Here is the question.', math: q.q });
    lines.push({ kind: 'answer', math: q.show });
    return { lines, checks: [], source: 'steps' };
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
    const topics = [...new Set(LEARN.SUBJECTS.flatMap(s => s.topics).concat(LEARN.PHYS))], out = { verified: 0, steps: 0, none: 0, bad: [] };
    for (const id of topics) for (let i = 0; i < per; i++) {
      const q = LEARN.gen(id); if (!q) break;
      const d = build(q); if (!d) { out.none++; continue; }
      d.source === 'verified' ? out.verified++ : out.steps++;
      const empty = d.lines.some(l => !l.say && !l.math && !l.table && !l.tri), noAns = !d.lines.some(l => l.kind === 'answer');
      if ((!d.ok || empty || noAns) && out.bad.length < 20) out.bad.push([id, q.q, d.checks.filter(c => !c[1]).map(c => c[0]).join(', ') || (empty ? 'empty line' : 'no answer line')]);
      if (pick(q) === null && d.source === 'verified') out.bad.push([id, 'claimed verified without a builder']);
    }
    return out;
  }
  return { build, selfTest, builders: Object.keys(B) };
})();
