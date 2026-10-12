/* Archeron Lab · experimental features. Loaded after app.js and uses its globals.
   Mock Day, Daily Quests, Soundscapes, Weak Spots, rest breathing guide. */
'use strict';
const L = () => (S.lab = Object.assign({ mocks: [], q: null, cards: {}, sound: 'off', vol: .5 }, S.lab));
const today = () => dkey();

/* ---------- Weak Spots: drill the lowest-accuracy topics ---------- */
function weakTopics() {
  const seen = Object.keys(LEARN.TOPIC).filter(id => usable(id) && skill(id).n >= 2)
    .map(id => { const k = skill(id); return [id, k.rec.filter(Boolean).length / (k.rec.length || 1)]; })
    .sort((a, b) => a[1] - b[1]).slice(0, 6).map(x => x[0]);
  return seen.length >= 3 ? seen : [...seen, ...topicsFor('maths').filter(id => !skill(id).n)].slice(0, 6);
}
SUBJ_BY.weak = { id: 'weak', name: 'Weak spots', icon: 'target', subj: 'Maths', topics: [] };
const _topicsFor = topicsFor;
topicsFor = track => track === 'weak' ? SUBJ_BY.weak.topics : _topicsFor(track);
ACT.weak = () => { SUBJ_BY.weak.topics = weakTopics(); startDrill('weak'); go('drill', DR.q && DR.q.kind === 'mcq' ? '#opt0' : '#ans'); };

/* ---------- Daily Quests: three small goals, reward voyages, missed ones just vanish ---------- */
const QUESTS = {
  right15: ['Answer 15 questions right', q => S.learnOk - q.base.learnOk, 15],
  right30: ['Answer 30 questions right', q => S.learnOk - q.base.learnOk, 30],
  sets2: ['Finish 2 focus sets', () => setsOn(today()), 2],
  sets3: ['Finish 3 focus sets', () => setsOn(today()), 3],
  cards10: ['Review 10 flashcards', () => L().cards[today()] || 0, 10],
  fix2: ['Fix 2 mistakes', q => S.fixedCount - q.base.fixedCount, 2],
  plan1: ['Save an essay or answer plan', q => S.stat.plans - q.base.plans, 1],
  mock1: ['Finish a Mock Day', () => L().mocks.filter(m => m.date === today()).length, 1],
  quotes5: ['Recall 5 quotes', q => S.quoteOk - q.base.quoteOk, 5]
};
function quests() {
  const l = L(), t = today();
  if (!l.q || l.q.date !== t) {
    let seed = dayNum(t) * 9301 + 49297; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const ids = Object.keys(QUESTS).sort(() => rnd() - .5).slice(0, 3);
    l.q = { date: t, ids, claimed: {}, base: { learnOk: S.learnOk, fixedCount: S.fixedCount, plans: S.stat.plans, quoteOk: S.quoteOk } };
    save();
  }
  return l.q;
}
function questCard() {
  const q = quests(), rows = q.ids.map(id => { const [text, f, n] = QUESTS[id], v = Math.min(n, Math.max(0, f(q))); return { id, text, v, n, done: v >= n }; });
  const all = rows.every(r => r.done);
  return card('Daily quests', h('span', { class: 'muted' }, 'new ones every day'),
    h('ul', { class: 'quests' }, rows.map(r => h('li', { class: r.done ? 'done' : '' },
      h('div', { class: 'grow' }, h('b', null, r.text), bar(r.v / r.n * 100), h('small', null, `${r.v} / ${r.n}`)),
      r.done ? (q.claimed[r.id] ? h('span', { class: 'pill' }, icon('check'), 'Claimed') : B([icon('ship'), '+1 voyage'], 'qClaim', 'primary sm', { 'data-id': r.id })) : null))),
    all && !q.claimed.all ? B([icon('star'), 'All three done · claim a bonus voyage'], 'qClaim', 'primary wide', { 'data-id': 'all' }) : null);
}
ACT.qClaim = el => {
  const q = quests(), id = el.dataset.id; if (q.claimed[id]) return;
  q.claimed[id] = true; S.game.tokens++; save(); toast(id === 'all' ? 'Bonus voyage claimed' : 'Quest complete · +1 voyage', 'big'); render({ pulse: '.quests' });
};
const _rate = ACT.rate;
ACT.rate = el => { const l = L(); l.cards[today()] = (l.cards[today()] || 0) + 1; _rate(el); };

/* ---------- Soundscapes: generated live with Web Audio, nothing downloaded ---------- */
const SND = { ctx: null, master: null, nodes: [], timers: [], kind: 'off' };
function noise(ctx, brown) {
  const len = ctx.sampleRate * 2, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
  const s = ctx.createBufferSource(); s.buffer = b; s.loop = true; return s;
}
function chain(...n) { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); SND.nodes.push(...n); return n[n.length - 1]; }
const filt = (ctx, type, f, q = 1) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
const gain = (ctx, v) => { const g = ctx.createGain(); g.gain.value = v; return g; };
function blip(ctx, type, f, peak, dur) {
  const s = noise(ctx), g = gain(ctx, 0), t = ctx.currentTime;
  s.connect(filt(ctx, type, f, type === 'bandpass' ? 8 : 1)).connect(g).connect(SND.master);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.start(t); s.stop(t + dur + .02);
}
function stopSound() {
  SND.timers.forEach(clearInterval); SND.timers = [];
  SND.nodes.forEach(n => { try { n.stop && n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} }); SND.nodes = []; SND.kind = 'off';
}
function playSound(kind) {
  stopSound(); if (kind === 'off') return;
  const ctx = SND.ctx = SND.ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume();
  if (!SND.master) { SND.master = gain(ctx, L().vol); SND.master.connect(ctx.destination); }
  SND.kind = kind;
  if (kind === 'rain') {
    const s = noise(ctx); chain(s, filt(ctx, 'highpass', 600), filt(ctx, 'lowpass', 7000), gain(ctx, .3)).connect(SND.master); s.start();
    SND.timers.push(setInterval(() => { if (Math.random() < .7) blip(ctx, 'bandpass', 2000 + Math.random() * 3000, .25 * Math.random(), .05); }, 45));
  } else if (kind === 'fire') {
    const s = noise(ctx, true); chain(s, filt(ctx, 'lowpass', 650), gain(ctx, .9)).connect(SND.master); s.start();
    SND.timers.push(setInterval(() => { if (Math.random() < .35) blip(ctx, 'highpass', 1500 + Math.random() * 2000, .4 * Math.random(), .015 + Math.random() * .03); }, 70));
  } else if (kind === 'river') {
    const s = noise(ctx, true), g = gain(ctx, .6), lfo = ctx.createOscillator(), depth = gain(ctx, .25);
    lfo.frequency.value = .12; lfo.connect(depth).connect(g.gain); lfo.start(); SND.nodes.push(lfo, depth);
    chain(s, filt(ctx, 'lowpass', 1100), g).connect(SND.master); s.start();
    const w = noise(ctx); chain(w, filt(ctx, 'bandpass', 420, .6), gain(ctx, .06)).connect(SND.master); w.start();
  }
}
function soundBar(compact) {
  const l = L();
  return h('div', { class: 'snd' + (compact ? ' compact' : '') },
    h('div', { class: 'chips' }, [['off', 'Off'], ['rain', 'Rain'], ['fire', 'Fireplace'], ['river', 'River']].map(([k, n]) => chip(n, SND.kind === k, 'snd', { 'data-v': k }))),
    h('label', { class: 'vol' }, icon('bolt'), h('input', { type: 'range', min: 0, max: 1, step: .05, value: l.vol, 'data-lab': 'vol', 'aria-label': 'Volume' })));
}
ACT.snd = el => { L().sound = el.dataset.v; save(); playSound(el.dataset.v); render(); };
document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.lab === 'vol') { L().vol = +e.target.value; if (SND.master) SND.master.gain.value = L().vol; save(); } });

/* ---------- Mock Day: timed, no feedback until the end ---------- */
let MK = null, MK_SET = { track: 'all', n: 20, min: 20 };
function mkStart() {
  const ids = topicsFor(MK_SET.track); if (!ids.length) return toast('No topics to use. Check Settings.');
  const qs = []; let guard = 0;
  while (qs.length < MK_SET.n && guard++ < MK_SET.n * 5) { const q = LEARN.gen(pick(ids)); if (q) qs.push(q); }
  MK = { qs, ans: qs.map(() => ''), flag: qs.map(() => false), i: 0, end: Date.now() + MK_SET.min * 60000, start: Date.now(), done: false, res: null };
  render({ enter: true });
}
function mkFinish() {
  if (!MK || MK.done) return;
  MK.done = true;
  MK.res = MK.qs.map((q, i) => { const a = MK.ans[i], r = a === '' ? { valid: false } : LEARN.check(q, a); return { ok: !!(r.valid && r.ok), answered: a !== '' }; });
  MK.res.forEach((r, i) => { if (r.answered) record(MK.qs[i].id, r.ok); });
  const right = MK.res.filter(r => r.ok).length, mins = Math.round((Math.min(Date.now(), MK.end) - MK.start) / 60000);
  L().mocks.push({ date: today(), track: MK_SET.track, n: MK.qs.length, right, mins }); save();
  FXS.reveal('Mock Day complete', `${right} / ${MK.qs.length}`, `${Math.round(right / MK.qs.length * 100)}% in ${mins} minute${mins === 1 ? '' : 's'}`);
  render({ enter: true }); checkAch();
}
function vMock() {
  if (!MK) {
    const set = (k, vals, label) => h('div', { class: 'mk-set' }, h('span', { class: 'muted xs' }, label), h('div', { class: 'chips' }, vals.map(([v, l]) => chip(l, MK_SET[k] === v, 'mkSet', { 'data-k': k, 'data-v': v }))));
    const hist = L().mocks.slice(-6).reverse();
    return h('div', { class: 'stack narrow' },
      subHero('Lab', 'Mock Day', 'lab', 'Exam conditions: a timer, no feedback until the end, then a full review. Flag questions to come back to.'),
      card('Set up', null,
        set('track', [['all', 'All subjects'], ...LEARN.SUBJECTS.map(s => [s.id, s.name])], 'Subject'),
        set('n', [[10, '10 questions'], [20, '20 questions'], [30, '30 questions']], 'Length'),
        set('min', [[10, '10 min'], [20, '20 min'], [30, '30 min']], 'Time'),
        B([icon('play'), 'Start Mock Day'], 'mkStart', 'begin sm')),
      hist.length && card('Past Mock Days', null, h('ul', { class: 'list' }, hist.map(m => h('li', null,
        h('div', { class: 'grow' }, h('b', null, TRACK_NAME(m.track)), h('small', null, `${fmtDate(m.date)} · ${m.mins} min`)),
        h('div', { class: 'num' }, h('b', null, Math.round(m.right / m.n * 100) + '%'), h('small', null, `${m.right}/${m.n}`)))))));
  }
  if (MK.done) {
    const right = MK.res.filter(r => r.ok).length, wrong = MK.qs.map((q, i) => [q, i]).filter(([, i]) => !MK.res[i].ok);
    return h('div', { class: 'stack narrow' },
      subHero('Mock Day', `${right} / ${MK.qs.length}`, 'lab', `${Math.round(right / MK.qs.length * 100)}%. Every one you missed is below with the answer. Those are your quickest marks to win back.`),
      h('div', { class: 'row' }, wrong.length && B([icon('plus'), `Add ${wrong.length} to fix list`], 'mkFix', 'primary'), B([icon('reset'), 'New Mock Day'], 'mkReset', 'ghost')),
      card('Review', null, h('ul', { class: 'mk-review' }, MK.qs.map((q, i) => { const r = MK.res[i], a = MK.ans[i];
        return h('li', { class: r.ok ? 'ok' : 'no' }, h('span', { class: 'mk-n' }, i + 1),
          h('div', { class: 'grow' }, h('small', { class: 'muted' }, q.sub || LEARN.name(q.id)), h('b', null, q.q),
            h('p', null, 'You: ', h('span', null, a === '' ? '(no answer)' : q.kind === 'mcq' ? q.options[+a] : a), r.ok ? '' : [' · Answer: ', h('b', null, q.show)]),
            !r.ok && q.kind !== 'mcq' && acc('mkm' + i, h('span', { class: 'btn link' }, 'Method'), h('ol', { class: 'steps' }, q.steps.map(s => h('li', null, s))), { cls: '' }))); }))));
  }
  const q = MK.qs[MK.i], a = MK.ans[MK.i];
  return h('div', { class: 'stack narrow' },
    h('section', { class: 'focus-bar live mk-bar' }, icon('hourglass'), h('div', { class: 'fb-txt' }, h('p', { class: 'eyebrow' }, 'Mock Day'), h('b', { id: 'mk-t' }, fmt(Math.max(0, (MK.end - Date.now()) / 1000))), h('small', null, `Question ${MK.i + 1} of ${MK.qs.length}`)),
      B('Finish', 'mkFinish', 'ghost sm')),
    h('div', { class: 'mk-dots' }, MK.qs.map((_, i) => h('button', { type: 'button', class: 'mk-dot' + (MK.ans[i] !== '' ? ' on' : '') + (MK.flag[i] ? ' flag' : '') + (i === MK.i ? ' cur' : ''), 'data-act': 'mkGo', 'data-i': i, 'aria-label': `Question ${i + 1}` }, i + 1))),
    h('section', { class: 'card qcard' },
      h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, q.sub || LEARN.name(q.id)), B(MK.flag[MK.i] ? 'Flagged' : 'Flag', 'mkFlag', 'link')),
      h('p', { class: 'qtext' + (q.kind === 'word' ? ' quote' : '') }, q.q),
      q.kind === 'mcq' ? h('div', { class: 'mcq' }, q.options.map((o, i) => h('button', { type: 'button', class: 'opt' + (a === String(i) ? ' chosen' : ''), 'data-act': 'mkOpt', 'data-i': i }, h('span', { class: 'opt-k' }, 'ABCD'[i]), h('span', null, o))))
        : h('div', { class: 'answer' }, q.pre && h('span', { class: 'adorn' }, q.pre), h('input', { id: 'mk-ans', 'data-mk': MK.i, value: a, autocomplete: 'off', inputmode: q.kind === 'num' ? 'decimal' : 'text', 'aria-label': 'Your answer' }), q.suf && h('span', { class: 'adorn' }, q.suf)),
      q.hint && q.kind !== 'mcq' && h('p', { class: 'muted xs' }, q.hint),
      h('div', { class: 'row' }, B([icon('back'), 'Back'], 'mkStep', 'ghost', { 'data-d': -1, disabled: MK.i === 0 }),
        MK.i < MK.qs.length - 1 ? B(['Next', icon('skip')], 'mkStep', 'primary grow', { 'data-d': 1 }) : B('Finish and mark', 'mkFinish', 'primary grow'))));
}
Object.assign(ACT, {
  mkSet: el => { const k = el.dataset.k; MK_SET[k] = k === 'track' ? el.dataset.v : +el.dataset.v; render(); },
  mkStart, mkFinish: () => { if (!MK.done && MK.ans.some(x => x === '') && !confirm('Some questions are unanswered. Finish anyway?')) return; mkFinish(); },
  mkStep: el => { MK.i = clamp(MK.i + +el.dataset.d, 0, MK.qs.length - 1); render({ focus: '#mk-ans' }); },
  mkGo: el => { MK.i = +el.dataset.i; render(); },
  mkFlag: () => { MK.flag[MK.i] = !MK.flag[MK.i]; render(); },
  mkOpt: el => { MK.ans[MK.i] = el.dataset.i; render(); },
  mkReset: () => { MK = null; render({ enter: true }); },
  mkFix: () => {
    MK.qs.forEach((q, i) => { if (!MK.res[i].ok) S.mistakes.push({ id: newId(), date: today(), subj: (SUBJ_BY[LEARN.trackOf(q.id)] || { subj: 'Maths' }).subj, topic: LEARN.name(q.id), note: `${q.q} → ${q.show}`.slice(0, 300), redo: addDays(1), fixed: false }); });
    save(); toast('Added to your fix list · ready to redo tomorrow'); MK.res.forEach(r => { r.ok = true; }); render();
  }
});
document.addEventListener('input', e => { if (MK && e.target.dataset && e.target.dataset.mk != null) MK.ans[+e.target.dataset.mk] = e.target.value; });
setInterval(() => { if (!MK || MK.done) return; const left = (MK.end - Date.now()) / 1000, el = document.getElementById('mk-t'); if (el) el.textContent = fmt(Math.max(0, left)); if (left <= 0) { toast('Time is up'); mkFinish(); } }, 500);

/* ---------- Breathing guide during rests ---------- */
function breather() {
  return h('div', { class: 'breathe', 'aria-hidden': 'true' }, h('div', { class: 'br-orb' }), h('div', { class: 'br-txt' }, h('span', null, 'Breathe in'), h('span', null, 'Hold'), h('span', null, 'Breathe out')));
}

/* ---------- Lab hub + hooks into existing screens ---------- */
function vLab() {
  const mocks = L().mocks;
  const exp = (act, ic, name, desc, sub, extra = {}) => tilt(h('button', Object.assign({ type: 'button', class: 'lcard', 'data-act': act }, extra), h('span', { class: 'lc-ic' }, icon(ic)), h('b', null, name), h('span', { class: 'lc-d' }, desc), h('small', null, sub)));
  return h('div', { class: 'stack' },
    hero('Lab', 'Experiments', 'Features being tried out before they reach the main app. Your progress was copied in once; nothing here touches the main app.'),
    h('div', { class: 'lgrid' },
      exp('go', 'hourglass', 'Mock Day', 'A timed exam simulation across your subjects. No feedback until the end, then a full review.', mocks.length ? `${mocks.length} done · best ${Math.max(...mocks.map(m => Math.round(m.right / m.n * 100)))}%` : 'Try a 10-minute one first', { 'data-tab': 'mock' }),
      exp('weak', 'target', 'Weak Spots', 'One tap drills the topics you find hardest right now.', `${weakTopics().length} topics lined up`)),
    questCard(),
    card('Soundscapes', h('span', { class: 'muted' }, 'made live, nothing downloaded'), h('p', { class: 'muted xs' }, 'Background sound for focus sets. It keeps playing while you move around the app.'), soundBar()),
    card('Also in the Lab', null, h('ul', { class: 'howto' }, h('li', null, 'A breathing guide appears on the rest screen between sets'), h('li', null, 'Quests and the sound picker also show on Focus while a set is running'))));
}
VIEWS.lab = vLab; VIEWS.mock = vMock;
PARENT.lab = 'home'; PARENT.mock = 'home';
BACKS.lab = 'Lab';
const _home = VIEWS.home;
VIEWS.home = () => {
  const el = _home();
  if (T.mode === 'break' && timerActive()) { const f = el.querySelector('.focus'); if (f) f.insertBefore(breather(), f.querySelector('.ring')); }
  else if (T.run && T.mode === 'focus') el.append(card('Soundscape', null, soundBar(true)));
  el.append(questCard());
  return el;
};
render();
