/* Archeron · chemistry equations: formulae, naming, word equations and balancing.
   Formulae come from ion charges and coefficients from a solver, so every answer is right by construction.
   No DOM code in here. */
'use strict';
const CHEM = (() => {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
  const SUBD = '₀₁₂₃₄₅₆₇₈₉', SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const sub = f => f.replace(/\d/g, d => SUBD[d]);
  const unsub = s => String(s).replace(/[₀-₉]/g, c => SUBD.indexOf(c));
  const ion = (sym, q, sign) => sub(sym) + (q > 1 ? SUPD[q] : '') + sign;
  /* learn.js swaps this for its memory-aware chooser (no repeats, wrong items first) */
  let choose = list => [pick(list), null];

  /* Count atoms in a formula like Ca(OH)2. Returns null if it cannot be read. */
  function atoms(f) {
    f = unsub(f).replace(/\s/g, '');
    let i = 0;
    const group = () => {
      const m = {};
      while (i < f.length && f[i] !== ')') {
        let part;
        if (f[i] === '(') { i++; part = group(); if (f[i] !== ')') throw 0; i++; }
        else { const e = /^[A-Z][a-z]?/.exec(f.slice(i)); if (!e) throw 0; i += e[0].length; part = { [e[0]]: 1 }; }
        const d = /^\d+/.exec(f.slice(i)), k = d ? +d[0] : 1; if (d) i += d[0].length;
        if (!k) throw 0;
        for (const [el, c] of Object.entries(part)) m[el] = (m[el] || 0) + c * k;
      }
      return m;
    };
    try { const m = group(); return i === f.length && Object.keys(m).length ? m : null; } catch (e) { return null; }
  }
  const sameAtoms = (a, b) => { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(k => a[k] === b[k]); };

  /* ---------- ions and compounds ---------- */
  const CAT = [['sodium', 'Na', 1], ['potassium', 'K', 1], ['lithium', 'Li', 1], ['silver', 'Ag', 1], ['ammonium', 'NH4', 1],
    ['magnesium', 'Mg', 2], ['calcium', 'Ca', 2], ['zinc', 'Zn', 2], ['copper', 'Cu', 2], ['barium', 'Ba', 2], ['lead', 'Pb', 2], ['iron(II)', 'Fe', 2],
    ['aluminium', 'Al', 3], ['iron(III)', 'Fe', 3]];
  const AN = [['chloride', 'Cl', 1, 'chlorine'], ['bromide', 'Br', 1, 'bromine'], ['iodide', 'I', 1, 'iodine'], ['fluoride', 'F', 1, 'fluorine'],
    ['hydroxide', 'OH', 1, 'hydrogen oxide'], ['nitrate', 'NO3', 1, 'nitride'], ['oxide', 'O', 2, 'oxygen'], ['sulfide', 'S', 2, 'sulfate'],
    ['sulfate', 'SO4', 2, 'sulfide'], ['carbonate', 'CO3', 2, 'carbon oxide']];
  /* shortcut: pairs left out are ones that do not exist as stable compounds at GCSE level; widen if the spec changes. */
  const SKIP = new Set(['ammonium|oxide', 'ammonium|hydroxide', 'ammonium|sulfide', 'silver|hydroxide', 'aluminium|carbonate', 'iron(III)|carbonate']);
  const poly = s => /\d|[A-Z].*[A-Z]/.test(s);
  const part = (x, k) => k === 1 ? x : poly(x) ? `(${x})${k}` : x + k;
  function formula(c, a) { const l = c[2] * a[2] / gcd(c[2], a[2]); return part(c[1], l / c[2]) + part(a[1], l / a[2]); }
  const PAIRS = CAT.flatMap(c => AN.filter(a => !SKIP.has(c[0] + '|' + a[0])).map(a => ({ c, a, name: `${c[0]} ${a[0]}`, f: formula(c, a) })));
  const MOLS = [['water', 'H2O'], ['carbon dioxide', 'CO2'], ['carbon monoxide', 'CO'], ['methane', 'CH4'], ['ethane', 'C2H6'], ['propane', 'C3H8'], ['butane', 'C4H10'],
    ['ethene', 'C2H4'], ['ammonia', 'NH3'], ['hydrogen gas', 'H2'], ['oxygen gas', 'O2'], ['nitrogen gas', 'N2'], ['chlorine gas', 'Cl2'], ['bromine', 'Br2'], ['iodine', 'I2'],
    ['hydrochloric acid', 'HCl'], ['sulfuric acid', 'H2SO4'], ['nitric acid', 'HNO3'], ['sulfur dioxide', 'SO2'], ['glucose', 'C6H12O6'], ['ethanol', 'C2H5OH'], ['hydrogen peroxide', 'H2O2']];

  function genFormula() {
    if (Math.random() < .25) {
      const [[name, f], key] = choose(MOLS, m => 'mol|' + m[1]);
      return { kind: 'formula', key, q: `Write the formula of ${name}.`, f, molecular: true, show: sub(f), hint: 'Type numbers normally, e.g. H2O.',
        steps: [`${name} is ${sub(f)}`, 'Learn these: they come up in equations on every paper.'] };
    }
    const [{ c, a, name, f }, key] = choose(PAIRS, p => 'f|' + p.f + p.name), l = c[2] * a[2] / gcd(c[2], a[2]);
    return { kind: 'formula', key, q: `Write the formula of ${name}. The ions are ${ion(c[1], c[2], '⁺')} and ${ion(a[1], a[2], '⁻')}.`, f, show: sub(f), hint: 'Type numbers normally, e.g. Mg(OH)2.',
      steps: [`Charges: ${c[0]} is ${c[2]}+, ${a[0]} is ${a[2]}−`,
        c[2] === a[2] ? 'The charges already cancel, so one of each' : `Make the charges cancel: ${l / c[2]} × (${c[2]}+) = ${l}+ and ${l / a[2]} × (${a[2]}−) = ${l}−`,
        poly(a[1]) && l / a[2] > 1 ? `${sub(a[1])} is one ion, so it goes in brackets when there is more than one` : 'Write the metal first, then the non-metal part',
        `Formula: ${sub(f)}`] };
  }
  function genName() {
    const [{ c, a, name, f }, key] = choose(PAIRS, p => 'n|' + p.f + p.name);
    const pool = [`${c[0]} ${a[3]}`, ...AN.filter(x => x !== a).map(x => `${c[0]} ${x[0]}`).filter(n => PAIRS.some(p => p.name === n && p.f !== f))];
    if (c[0].startsWith('iron')) pool.unshift(`${c[0] === 'iron(II)' ? 'iron(III)' : 'iron(II)'} ${a[0]}`);
    const ds = [...new Set(pool)].filter(n => n !== name).slice(0, 6), options = shuffle([name, ...shuffle(ds.slice(0, 2)).concat(shuffle(ds.slice(2))).slice(0, 3)]);
    return { kind: 'mcq', key, q: `Name the compound ${sub(f)}.`, options, a: options.indexOf(name), show: name,
      steps: [`${sub(f)} → ${name}`, 'Metal first, unchanged. Non-metal on its own ends in -ide (chloride, oxide); with oxygen in a group it ends in -ate (sulfate, nitrate, carbonate).'] };
  }

  /* ---------- word equations ---------- */
  const ACIDS = [['hydrochloric acid', 'chloride'], ['sulfuric acid', 'sulfate'], ['nitric acid', 'nitrate']];
  const REACT = ['magnesium', 'zinc', 'iron', 'copper', 'silver'];
  const otherAn = an => pick(ACIDS.map(a => a[1]).filter(x => x !== an));
  const W = [];
  const add = (q, a, ds, why) => W.push({ q, a, ds: [...new Set(ds)].filter(d => d !== a), why });
  for (const [acid, an] of ACIDS.slice(0, 2)) for (const m of ['magnesium', 'zinc', 'iron'])
    add(`${m} + ${acid} → ?`, `${m} ${an} + hydrogen`, [`${m} ${an} + water`, `${m} oxide + hydrogen`, `${m} ${an} + carbon dioxide`, `${m} ${an === 'chloride' ? 'sulfate' : 'chloride'} + hydrogen`], 'metal + acid → salt + hydrogen');
  for (const [acid, an] of ACIDS) {
    for (const m of ['magnesium', 'copper', 'zinc', 'calcium'])
      add(`${m} oxide + ${acid} → ?`, `${m} ${an} + water`, [`${m} ${an} + hydrogen`, `${m} hydroxide + water`, `${m} ${an} + oxygen`, `${m} ${otherAn(an)} + water`], 'metal oxide + acid → salt + water');
    for (const m of ['sodium', 'potassium', 'calcium', 'lithium'])
      add(`${m} hydroxide + ${acid} → ?`, `${m} ${an} + water`, [`${m} ${an} + hydrogen`, `${m} oxide + water`, `${m} ${an} + oxygen`, `${m} ${otherAn(an)} + water`], 'alkali + acid → salt + water (neutralisation)');
    for (const m of ['calcium', 'magnesium', 'copper', 'sodium', 'zinc'])
      add(`${m} carbonate + ${acid} → ?`, `${m} ${an} + water + carbon dioxide`, [`${m} ${an} + water`, `${m} ${an} + hydrogen`, `${m} oxide + carbon dioxide`, `${m} ${otherAn(an)} + water + carbon dioxide`], 'carbonate + acid → salt + water + carbon dioxide');
  }
  for (const m of ['magnesium', 'copper', 'zinc', 'iron', 'aluminium', 'calcium', 'sodium'])
    add(`${m} + oxygen → ?`, `${m} oxide`, [`${m} hydroxide`, `${m} carbonate`, `${m} oxide + water`], 'metal + oxygen → metal oxide (oxidation)');
  for (const m of ['sodium', 'potassium', 'lithium'])
    add(`${m} + water → ?`, `${m} hydroxide + hydrogen`, [`${m} oxide + hydrogen`, `${m} hydroxide + oxygen`, `${m} oxide + water`], 'Group 1 metal + water → metal hydroxide + hydrogen');
  for (const [salt, sm, an] of [['copper sulfate', 'copper', 'sulfate'], ['zinc sulfate', 'zinc', 'sulfate'], ['iron sulfate', 'iron', 'sulfate'], ['magnesium sulfate', 'magnesium', 'sulfate'], ['silver nitrate', 'silver', 'nitrate']])
    for (const m of ['magnesium', 'zinc', 'iron', 'copper']) if (m !== sm) {
      const yes = REACT.indexOf(m) < REACT.indexOf(sm);
      add(`${m} + ${salt} solution → ?`, yes ? `${m} ${an} + ${sm}` : 'no reaction', ['no reaction', `${m} ${an} + ${sm}`, `${m} oxide + ${sm}`, `${m} ${an} + hydrogen`],
        yes ? `${m} is more reactive than ${sm}, so it displaces it` : `${m} is less reactive than ${sm}, so nothing happens`);
    }
  const HAL = ['chlorine', 'bromine', 'iodine'], IDE = { chlorine: 'chloride', bromine: 'bromide', iodine: 'iodide' };
  for (const x of HAL) for (const y of HAL) if (x !== y) for (const cat of ['potassium', 'sodium']) {
    const yes = HAL.indexOf(x) < HAL.indexOf(y);
    add(`${x} + ${cat} ${IDE[y]} solution → ?`, yes ? `${cat} ${IDE[x]} + ${y}` : 'no reaction', ['no reaction', `${cat} ${IDE[x]} + ${y}`, `${cat} ${IDE[y]} + ${x}`, `${cat} ${IDE[x]} + hydrogen`],
      yes ? `${x} is more reactive than ${y} (higher in Group 7), so it displaces it` : `${x} is less reactive than ${y}, so nothing happens`);
  }
  for (const fuel of ['methane', 'ethane', 'propane', 'butane', 'ethanol'])
    add(`${fuel} + oxygen (plenty of air) → ?`, 'carbon dioxide + water', ['carbon dioxide + hydrogen', 'carbon monoxide + water', 'carbon + hydrogen'], 'complete combustion of a fuel → carbon dioxide + water');
  add('methane + oxygen (limited air) → ?', 'carbon monoxide + water', ['carbon dioxide + water', 'carbon dioxide + hydrogen', 'methanol + water'], 'incomplete combustion makes carbon monoxide (and sometimes soot)');
  for (const m of ['calcium', 'copper', 'magnesium', 'zinc'])
    add(`${m} carbonate (heated strongly) → ?`, `${m} oxide + carbon dioxide`, [`${m} + carbon dioxide`, `${m} oxide + oxygen`, `${m} hydroxide + carbon dioxide`], 'thermal decomposition: carbonate → metal oxide + carbon dioxide');
  for (const [c, m, nm] of [['lead bromide', 'lead', 'bromine'], ['sodium chloride', 'sodium', 'chlorine'], ['zinc chloride', 'zinc', 'chlorine'], ['potassium iodide', 'potassium', 'iodine'], ['aluminium oxide', 'aluminium', 'oxygen']])
    add(`Electrolysis of molten ${c}: what forms at each electrode?`, `cathode (−): ${m}; anode (+): ${nm}`,
      [`cathode (−): ${nm}; anode (+): ${m}`, `cathode (−): hydrogen; anode (+): ${nm}`, `cathode (−): ${m}; anode (+): ${nm === 'oxygen' ? 'carbon dioxide' : 'oxygen'}`], 'molten: the metal forms at the cathode (−), the non-metal at the anode (+)');
  for (const m of ['copper', 'iron', 'lead', 'zinc'])
    add(`${m} oxide + carbon → ?`, `${m} + carbon dioxide`, [`${m} carbonate`, `${m} oxide + carbon dioxide`, `${m} + oxygen`], `carbon is more reactive than ${m}, so it takes the oxygen (reduction)`);
  function genWord() {
    const [w, key] = choose(W, x => 'w|' + x.q), options = shuffle([w.a, ...shuffle(w.ds).slice(0, 3)]);
    return { kind: 'mcq', key, q: `Complete the word equation: ${w.q}`, options, a: options.indexOf(w.a), show: w.a, steps: [w.q.replace('?', w.a), 'Rule: ' + w.why] };
  }

  /* ---------- balancing ---------- */
  const HAND = `H2 + O2 = H2O; Mg + O2 = MgO; Na + Cl2 = NaCl; Fe + O2 = Fe2O3; Al + O2 = Al2O3; Na + O2 = Na2O; K + O2 = K2O; Ca + O2 = CaO; Cu + O2 = CuO; Zn + O2 = ZnO;
    Mg + N2 = Mg3N2; CH4 + O2 = CO2 + H2O; C2H6 + O2 = CO2 + H2O; C3H8 + O2 = CO2 + H2O; C4H10 + O2 = CO2 + H2O; C2H4 + O2 = CO2 + H2O; C2H5OH + O2 = CO2 + H2O;
    N2 + H2 = NH3; H2 + Cl2 = HCl; CaCO3 = CaO + CO2; Na + H2O = NaOH + H2; K + H2O = KOH + H2; Li + H2O = LiOH + H2; Ca + H2O = Ca(OH)2 + H2;
    Fe + Cl2 = FeCl3; Cl2 + KBr = KCl + Br2; Cl2 + KI = KCl + I2; Br2 + KI = KBr + I2; Cl2 + NaBr = NaCl + Br2; Mg + CuSO4 = MgSO4 + Cu; Zn + CuSO4 = ZnSO4 + Cu;
    Fe + CuSO4 = FeSO4 + Cu; Cu + AgNO3 = Cu(NO3)2 + Ag; Mg + AgNO3 = Mg(NO3)2 + Ag; Fe2O3 + C = Fe + CO2; Fe2O3 + CO = Fe + CO2; CuO + C = Cu + CO2; PbO + C = Pb + CO2;
    Al2O3 = Al + O2; NaCl = Na + Cl2; PbBr2 = Pb + Br2; H2O = H2 + O2; H2O2 = H2O + O2; C6H12O6 + O2 = CO2 + H2O; CO2 + H2O = C6H12O6 + O2; C6H12O6 = C2H5OH + CO2;
    C10H22 = C6H14 + C2H4; C8H18 = C4H10 + C2H4; SO2 + O2 = SO3; NO + O2 = NO2; N2 + O2 = NO; P + O2 = P2O5; NH3 + O2 = NO + H2O; Al + Fe2O3 = Al2O3 + Fe;
    Al + HCl = AlCl3 + H2; NaHCO3 = Na2CO3 + H2O + CO2; Pb(NO3)2 + KI = PbI2 + KNO3; AgNO3 + NaCl = AgCl + NaNO3; BaCl2 + Na2SO4 = BaSO4 + NaCl;
    CuSO4 + NaOH = Cu(OH)2 + Na2SO4; FeCl3 + NaOH = Fe(OH)3 + NaCl; FeSO4 + NaOH = Fe(OH)2 + Na2SO4; Ca(OH)2 + CO2 = CaCO3 + H2O; Fe + H2O + O2 = Fe(OH)3;
    CuCO3 = CuO + CO2; MgCO3 = MgO + CO2; ZnCO3 = ZnO + CO2; HCl + NH3 = NH4Cl; CO + O2 = CO2; C + O2 = CO2; S + O2 = SO2; Si + O2 = SiO2`;
  const EQS = HAND.split(';').map(s => s.trim()).filter(Boolean).map(s => { const [l, r] = s.split('='); return { l: l.split('+').map(x => x.trim()), r: r.split('+').map(x => x.trim()) }; });
  /* symbol versions of the acid reactions, built from the same ions as the formula questions */
  const ION = n => CAT.find(c => c[0] === n), ANI = n => AN.find(a => a[0] === n);
  const ACIDF = [['HCl', 'chloride', 'hydrochloric acid'], ['H2SO4', 'sulfate', 'sulfuric acid'], ['HNO3', 'nitrate', 'nitric acid']];
  const salt = (m, an) => formula(ION(m), ANI(an));
  for (const [af, an, acid] of ACIDF) {
    if (af !== 'HNO3') for (const [m, s] of [['magnesium', 'Mg'], ['zinc', 'Zn'], ['iron(II)', 'Fe']]) EQS.push({ l: [s, af], r: [salt(m, an), 'H2'], w: `${m.replace('(II)', '')} + ${acid} → ${m.replace('(II)', '')} ${an} + hydrogen` });
    for (const m of ['magnesium', 'copper', 'zinc', 'calcium', 'sodium']) EQS.push({ l: [formula(ION(m), ANI('oxide')), af], r: [salt(m, an), 'H2O'], w: `${m} oxide + ${acid} → ${m} ${an} + water` });
    for (const m of ['sodium', 'potassium', 'lithium', 'calcium']) EQS.push({ l: [formula(ION(m), ANI('hydroxide')), af], r: [salt(m, an), 'H2O'], w: `${m} hydroxide + ${acid} → ${m} ${an} + water` });
    for (const m of ['calcium', 'magnesium', 'copper', 'sodium', 'zinc', 'potassium']) EQS.push({ l: [formula(ION(m), ANI('carbonate')), af], r: [salt(m, an), 'H2O', 'CO2'], w: `${m} carbonate + ${acid} → ${m} ${an} + water + carbon dioxide` });
  }
  const species = e => [...e.l.map(f => ({ f, m: atoms(f), side: 1 })), ...e.r.map(f => ({ f, m: atoms(f), side: -1 }))];
  function tally(sp, co) { const t = {}; sp.forEach((s, j) => { for (const [el, c] of Object.entries(s.m)) t[el] = (t[el] || 0) + s.side * c * co[j]; }); return t; }
  const unbalancedEl = (sp, co) => Object.entries(tally(sp, co)).find(([, v]) => v !== 0);
  /* Smallest whole-number coefficients: try every combination up to a growing maximum. shortcut: brute force, fine for GCSE-sized equations (≤5 species, coefficients ≤15). */
  const SOLVED = new Map();
  function solve(e) {
    const key = e.l.join('+') + '=' + e.r.join('+');
    if (SOLVED.has(key)) return SOLVED.get(key);
    const sp = species(e), n = sp.length, co = Array(n).fill(1);
    let res = null;
    for (let max = 1; max <= 15 && !res; max++) {
      const rec = j => {
        if (j === n) return co.includes(max) && !unbalancedEl(sp, co) ? [...co] : null;
        for (let v = 1; v <= max; v++) { co[j] = v; const r = rec(j + 1); if (r) return r; }
        return null;
      };
      res = rec(0);
    }
    SOLVED.set(key, res); return res;
  }
  const side = (fs, co) => fs.map((f, i) => (co && co[i] > 1 ? co[i] + ' ' : '') + sub(f)).join(' + ');
  const eqStr = (e, co) => side(e.l, co && co.slice(0, e.l.length)) + ' → ' + side(e.r, co && co.slice(e.l.length));
  function genBalance() {
    /* already-balanced ones (all 1s) are real exam questions too, but show them less often */
    const [e, key] = choose(Math.random() < .85 ? EQS.filter(x => solve(x).some(c => c > 1)) : EQS, x => 'b|' + x.l.join('+') + '=' + x.r.join('+')), co = solve(e), sp = species(e), n = sp.length;
    const counts = Object.keys(tally(sp, co)).map(el => {
      const left = sp.reduce((s, x, j) => s + (x.side > 0 ? (x.m[el] || 0) * co[j] : 0), 0);
      return `${el}: ${left} on each side`;
    });
    return { kind: 'coef', key, q: `Balance this equation: ${e.l.map(f => '__ ' + sub(f)).join(' + ')} → ${e.r.map(f => '__ ' + sub(f)).join(' + ')}`, e, n, co, show: eqStr(e, co),
      hint: `Type the ${n} big numbers in order, e.g. ${co.map(() => 1).join(' ')}. Write 1 where no number is needed.`,
      steps: [e.w ? 'Word equation: ' + e.w : null, 'Balanced: ' + eqStr(e, co), ...counts, 'Tip: balance atoms that appear in only one formula on each side first. Leave elements on their own (like O₂ or H₂) until last. Never change the small numbers.'].filter(Boolean) };
  }

  /* ---------- checking ---------- */
  function check(q, s) {
    if (q.kind === 'formula') {
      const t = unsub(s).replace(/\s/g, '');
      if (t === q.f) return { valid: true, ok: true };
      if (t.toLowerCase() === q.f.toLowerCase()) return { valid: true, ok: false, msg: 'Check the capitals: each element starts with a capital letter, e.g. Cl not CL.' };
      const m = atoms(t), want = atoms(q.f);
      if (!m) return { valid: false, msg: 'Type a formula like Mg(OH)2' };
      if (sameAtoms(m, want)) return q.molecular ? { valid: true, ok: true, msg: `Also written ${sub(q.f)}.` } : { valid: true, ok: false, msg: `Right atoms, but write it as ${sub(q.f)}: metal first, brackets around a group ion.` };
      return { valid: true, ok: false };
    }
    if (q.kind === 'coef') {
      const xs = (s.match(/\d+/g) || []).map(Number);
      if (xs.length !== q.n) return { valid: false, msg: `Type ${q.n} numbers, one for each formula` };
      if (xs.some(x => x < 1)) return { valid: false, msg: 'Use 1 where no number is needed, not 0' };
      const bad = unbalancedEl(species(q.e), xs);
      if (bad) return { valid: true, ok: false, msg: `The ${bad[0]} atoms do not balance.` };
      return xs.reduce(gcd) > 1 ? { valid: true, ok: false, msg: 'It balances, but use the smallest whole numbers.' } : { valid: true, ok: true };
    }
    return { valid: false };
  }

  const TOPICS = {
    'ce-formula': ['Writing formulae', genFormula], 'ce-name': ['Naming compounds', genName],
    'ce-word': ['Word equations', genWord], 'ce-balance': ['Balancing equations', genBalance]
  };
  /* Run from node to prove every equation balances and every formula parses. */
  function selfTest() {
    const bad = EQS.filter(e => { const co = solve(e); return !co || species(e).some(s => !s.m) || unbalancedEl(species(e), co); }).map(e => e.l.join('+'));
    const badF = [...PAIRS.map(p => p.f), ...MOLS.map(m => m[1])].filter(f => !atoms(f));
    return { equations: EQS.length, formulae: PAIRS.length + MOLS.length, names: PAIRS.length, words: W.length, bad, badF };
  }
  const keys = () => [...MOLS.map(m => 'mol|' + m[1]), ...PAIRS.map(p => 'f|' + p.f + p.name), ...PAIRS.map(p => 'n|' + p.f + p.name), ...W.map(x => 'w|' + x.q),
    ...EQS.map(x => 'b|' + x.l.join('+') + '=' + x.r.join('+'))];
  return { TOPICS, check, selfTest, solve, eqStr, atoms, EQS, PAIRS, keys, setChooser: f => { choose = f; } };
})();
