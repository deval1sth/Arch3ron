/* Archeron · Rounds (11.10.0). Runo's request, 27 Nov 2026; the design is in the vault: 8 Archeron HQ/Ideas/Rounds and a daily paper.md.
   Inside drill and rescue Focus sets, practice comes in rounds: about 12 questions from the set's subject, fixed when the round
   starts, a different topic each time, ending with a score. A weak round offers a short win-back round. The day
   can end with a paper block (a full PPP paper or a section of one) sized to the time you have. Settings -> Focus style switches
   back to the classic drill; all progress is shared, so nothing is lost either way.
   Why: Runo found the open drill "monotonous" and felt nothing stuck, while doing papers (a finish line, a mark, variety) made
   them want to keep going. Mixed practice sticks better than blocked practice (Rohrer 2020, d = 0.83).
   Loads last: wraps missionBody, setNote, nextQ, finishAnswer, drillPanel, alsoToday and ACT.reveal/tgl. Every top-level name
   starts with rd/RD (check.js already has xqRound). State: S.tc.rdOff (Classic), S.tc.rdl (round log), S.tc.rdp (pacing notes). */
'use strict';

const rdOn = () => !(S.tc && S.tc.rdOff);
const RD_N = 12, RD_RESCUE = 8, RD_WIN = 6;
const rdLog = () => tcArr('rdl');
const rdToday = () => rdLog().filter(r => r && r.d === dkey());

/* how the last two full rounds (from the last 3 days) went: push = over 85% right, steady = under 70% */
function rdMode() {
  const old = addDays(-3), L = rdLog().filter(r => r && r.k !== 'win' && r.d >= old && r.n > 0).slice(-2);
  if (!L.length) return 'even';
  const pc = L.reduce((a, r) => a + r.ok, 0) / L.reduce((a, r) => a + r.n, 0);
  return pc > .85 ? 'push' : pc < .7 ? 'steady' : 'even';
}
/* Rounds stay in the set's own subject (a Science set mixes Biology, Chemistry and Physics). The first build mixed in the one or
   two other subjects that needed it most: in the 50-student simulation that LOST 0.9 points (41 of 50 students worse), because
   every round sent a third of each set to other subjects and undid the balance the plan and subject swaps already keep. Picking
   the least-practised subjects instead (-1.5) or a weighted draw (-1.1) lost too. Single-subject rounds were neutral (-0.18 +/-
   0.12 with win-back, -0.04 without) with a better weakest subject (1.9 vs 1.7). The research gain from mixing is mostly within a
   subject, telling problem types apart, which the drill already does by changing topic every question. (The simulator has
   V.rounds for re-testing; .sim/sim.bak-2026-11-27 is the version before it.) */
/* one topic for a slot: pickTopic's weights (weakness, fix queue, marks lost on papers, due facts, new topics), nudged by mode */
function rdPick(track, avoid, mode, taken) {
  for (let i = 0; i < 14; i++) {
    const id = pickTopic(track, avoid); if (!id) return null;
    const fresh = !skill(id).n;
    if (mode === 'steady' && fresh && i < 8) continue; /* struggling: consolidate what you have met before new topics */
    if (taken.filter(x => x === id).length >= 2 && i < 12) continue; /* at most twice per topic in a round */
    return id;
  }
  return pickTopic(track, avoid);
}
/* never the same topic twice in a row */
const rdId = s => typeof s === 'object' ? s.id : s; /* a slot is a topic id, or a missed question asked again */
function rdSpread(list) {
  const out = [...list];
  const at = k => k >= 0 && k < out.length ? rdId(out[k]) : null;
  for (let pass = 0; pass < 3; pass++) for (let i = 1; i < out.length; i++) if (at(i) === at(i - 1)) {
    const bad = at(i); /* swap out[i] with any slot k where neither move makes a new pair */
    const j = out.findIndex((x, k) => k !== i && k !== i - 1 && rdId(x) !== bad && at(k - 1) !== bad && at(k + 1) !== bad
      && (k - 1 === i ? true : at(i - 1) !== rdId(x)) && (k + 1 === i ? true : at(i + 1) !== rdId(x)));
    if (j >= 0) [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
/* a normal round: 12 from the set's subject (4 of them on a lesson just taught), never the same topic twice in a row */
function rdPlan(track, pin) {
  const mode = rdMode(), main = [], fresh = topicsFor(track).filter(id => !skill(id).n);
  pin = pin && usable(pin) ? pin : null;
  if (mode === 'push') for (let i = 0; i < 2 && fresh.length; i++) main.push(fresh.splice(Math.floor(Math.random() * fresh.length), 1)[0]); /* cruising: two new topics */
  while (main.length < RD_N - (pin ? 4 : 0)) { const id = rdPick(track, main[main.length - 1], mode, main); if (!id) break; main.push(id); }
  if (!main.length && !pin) return [];
  main.sort(() => Math.random() - .5);
  return rdSpread(pin ? [pin, main[0], pin, main[1], pin, main[2], pin, ...main.slice(3)].filter(x => x != null) : main);
}
/* a rescue round: the facts closest to slipping first, then ordinary picks */
function rdRescuePlan() {
  const ids = topicsFor('all').map(id => [id, dueShare(id)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 6).map(x => x[0]), plan = [...ids];
  while (plan.length < RD_RESCUE) { const id = pickTopic('all', plan[plan.length - 1]); if (!id) break; plan.push(id); }
  return rdSpread(plan);
}
/* a win-back round: what was just missed (the same fact again, or the same skill with new numbers), with solid ones between */
function rdWinPlan(miss, track) {
  const back = [], seen = new Set();
  for (const q of miss) { const k = q.key || q.id; if (seen.has(k) || back.length >= 4) continue; seen.add(k); back.push(q.key ? q : q.id); }
  const solid = topicsFor(track === 'rescue' ? 'all' : track).filter(id => { const k = skill(id); return k.rec.length >= 3 && k.rec.filter(Boolean).length / k.rec.length >= .8; }).sort(() => Math.random() - .5);
  const fill = solid.slice(0, RD_WIN - back.length), tr = track === 'rescue' ? 'all' : track;
  for (let i = 0; back.length + fill.length < RD_WIN && i < 20; i++) { const id = pickTopic(tr, fill[fill.length - 1]); if (!id) break; if (!fill.includes(id) && !back.some(b => rdId(b) === id)) fill.push(id); }
  const plan = []; /* start on a solid one, then alternate */
  for (let i = 0; back.length || fill.length; i++) plan.push(fill.length && (i % 2 === 0 || !back.length) ? fill.shift() : back.shift());
  return rdSpread(plan);
}

function rdStart(track, opts = {}) {
  const rescue = track === 'rescue', tr = rescue ? 'all' : track, prev = DR && DR.round;
  startDrill(tr, null, 'focus');
  DR.five = false; DR.setNo = lifeSets();
  const kind = opts.win ? 'win' : rescue ? 'rescue' : 'round';
  DR.round = { track, kind, pinFor: opts.pin || (prev && prev.pinFor) || null, plan: opts.win ? rdWinPlan(opts.win, track) : rescue ? rdRescuePlan() : rdPlan(tr, opts.pin), res: [], miss: [], t0: Date.now(), no: rdToday().length + 1, after: prev ? prev.kind : null };
  DR.count = 0; nextQ();
}
/* the round's own question order; "Try a similar one" is a bonus question that does not count */
const _rdNextQ = nextQ;
nextQ = function (sameTopic) {
  const R = DR && DR.ctx === 'focus' && DR.round;
  if (!R) return _rdNextQ(sameTopic);
  if (sameTopic) { R.extra = true; return _rdNextQ(sameTopic); }
  R.extra = false;
  /* a new fact shown on a card (or a low topic's miss) is due back a few questions later: if the round ends first, it joins the end */
  if (R.res.length >= R.plan.length && DR.retry && DR.retry.length && R.kind !== 'win') { R.plan.push(...DR.retry.map(r => Object.assign(r.q, { back: true }))); DR.retry = []; }
  const s = R.plan[R.res.length];
  if (s == null) {
    DR.q = null; DR.state = 'ask'; DR.msg = ''; DR.picked = null; DRAFT.dr = ''; DR.ex = null;
    if (!R.logged) { R.logged = true; const L = rdLog(); L.push({ d: dkey(), k: R.kind, n: R.res.length, ok: R.res.filter(Boolean).length, t: R.track, at: Date.now() }); if (L.length > 200) L.splice(0, L.length - 200); save(); }
    return;
  }
  if (typeof s === 'object') { /* a missed fact, asked again */
    DR.msg = ''; DR.picked = null; DRAFT.dr = ''; DR.ex = null; DR.hint = 0; DR.slip = null; DR.hid = null; DR.ord = null; DR.mt = null;
    DR.q = Object.assign({}, s, { back: true }); DR.state = 'ask'; DR.last = s.id; return;
  }
  /* steer the topic through DR.topic (not "same topic"), so quick question types, learn-first cards, worked examples and
     facts due back after a card all still work as in the classic drill; a fact due back takes that slot */
  DR.topic = s;
  try { return _rdNextQ(); } finally { DR.topic = null; }
};
const rdCount = ok => { const R = DR && DR.ctx === 'focus' && DR.round; if (!R || R.extra || !DR.q || R.res.length >= R.plan.length) return; R.res.push(!!ok); if (!ok) R.miss.push(DR.q); };
const _rdFinish = finishAnswer;
finishAnswer = function (res) { rdCount(res && res.ok); return _rdFinish(res); };
const _rdReveal = ACT.reveal;
ACT.reveal = function (...a) { if (DR && DR.q && DR.state === 'ask') rdCount(false); return _rdReveal.apply(this, a); };

/* focus time today (sets, papers, practice, logged), for the pacing notes */
const rdFocusMins = () => typeof statsFor === 'function' ? statsFor(dkey(), dkey()).mins : setsOn(dkey()) * (S.timer.focus || 25);
/* after about 2.5 hours a longer break is suggested once (on that round's end screen); after about 5 hours, a full day */
function rdPace(R) {
  const t = TCD(), P = t.rdp = t.rdp && t.rdp.d === dkey() ? t.rdp : { d: dkey() }, m = rdFocusMins();
  if (m >= 300) return h('p', { class: 'rd-pace' }, icon('sparkle'), h('span', null, h('b', null, 'That is a full day. '), 'About five hours in: anything more now mostly turns into tiredness, not memory. Resting is part of revising.'));
  if (m >= 150 && (!P.brk || P.brk === R.t0)) {
    if (!P.brk) { P.brk = R.t0; save(); }
    return h('p', { class: 'rd-pace' }, icon('hourglass'), h('span', null, h('b', null, 'Two and a half hours in. '), 'A proper 20 to 30 minute break now (food, a walk, no screens) makes the next rounds stick better.'));
  }
  return null;
}
function rdEndCard() {
  const R = DR.round, n = R.res.length, ok = R.res.filter(Boolean).length, pc = n ? ok / n : 0;
  const earlier = rdToday().slice(0, -1).filter(r => r.n && r.k !== 'win'); /* the last entry is this round */
  const best = earlier.length && R.kind !== 'win' && earlier.every(r => r.ok / r.n < pc);
  const names = [...new Set(R.plan.map(s => LEARN.name(typeof s === 'object' ? s.id : s)))].slice(0, 5);
  const right = ((S.days[dkey()] || {}).qr || 0), weak = R.kind !== 'win' && pc < .65 && R.miss.length > 0;
  const say = R.kind === 'win' ? (pc >= .65 ? 'Won back. Those will stick better for it.' : 'Still tricky, and that is fine: they come back on another day.')
    : pc >= .85 ? 'A strong round.' : pc >= .65 ? 'A solid round.' : 'A tough one. That is where the learning happens.';
  return h('section', { class: 'card qcard rd-end' },
    h('p', { class: 'eyebrow' }, R.kind === 'win' ? 'Win-back round done' : R.kind === 'rescue' ? 'Rescue round done' : `Round ${R.no} done`),
    h('p', { class: 'rd-score' }, h('b', null, String(ok)), h('span', null, ` / ${n}`)),
    h('p', { class: 'fb-h' }, say, best ? ' Your best round today.' : ''),
    names.length > 0 && h('p', { class: 'muted xs' }, 'In this round: ' + names.join(' · ')),
    h('p', { class: 'muted xs' }, `${right} right today.`),
    rdPace(R),
    weak ? h('div', { class: 'rd-btns' }, B([icon('target'), `Win-back round · ${RD_WIN} questions`], 'rdWin', 'primary grow', { id: 'nextq' }), B('Next round', 'rdNext', 'ghost grow'))
      : h('div', { class: 'rd-btns' }, B([icon('play'), 'Next round'], 'rdNext', 'primary wide', { id: 'nextq' })),
    weak && h('p', { class: 'muted xs center' }, 'The win-back round asks what you just missed again, with ones you know in between. Optional.'));
}
const _rdPanel = drillPanel;
drillPanel = function () {
  const R = DR && DR.ctx === 'focus' && DR.round;
  if (R && !DR.q) return rdEndCard();
  const el = _rdPanel();
  if (R && DR.q && DR.state !== 'ask' && R.res.length >= R.plan.length && !R.extra) { const b = el && el.querySelector && el.querySelector('#nextq'); if (b) b.textContent = 'See your round'; }
  return el;
};
/* the line above the question: where you are in the round, instead of "ends when the timer runs out" */
const _rdSetNote = setNote;
setNote = function (M) {
  const R = DR && DR.ctx === 'focus' && DR.round; if (!R || !rdOn()) return _rdSetNote(M);
  const n = R.plan.length, i = Math.min(n, R.res.length + (DR.q ? 1 : 0)), subs = [...new Set(R.plan.map(s => TRACK_NAME(LEARN.trackOf(typeof s === 'object' ? s.id : s))))];
  return h('div', { class: 'set-note rd-note' },
    h('b', null, R.kind === 'win' ? 'Win-back round' : R.kind === 'rescue' ? 'Rescue round' : `Round ${R.no}`),
    h('span', { class: 'rd-dots', 'aria-hidden': 'true' }, R.plan.map((_, k) => h('i', { class: k < R.res.length ? (R.res[k] ? 'ok' : 'no') : k === R.res.length && DR.q ? 'now' : '' }))),
    h('small', null, DR.q ? `Question ${i} of ${n}${subs.length > 1 ? ` · ${subs.join(', ')}` : ''}` : `${n} questions done`));
};
/* drill and rescue sets run rounds; a lesson in the set still comes first, and the first round after it leans on that topic */
const _rdBody = missionBody;
missionBody = function (M) {
  if (!rdOn() || !(M.id === 'drill' || M.id === 'rescue')) return M.id === 'paper' && rdOn() ? rdPaperInSet(_rdBody(M)) : _rdBody(M);
  const live = timerActive() && T.mode === 'focus';
  if (live && M.lesson && M.lesson.st === 'todo') return _rdBody(M);
  const track = M.id === 'rescue' ? 'rescue' : M.subj, pin = M.lesson && M.lesson.st === 'done' && M.lesson.topic && usable(M.lesson.topic) ? M.lesson.topic : null;
  if (!DR || DR.ctx !== 'focus' || !DR.round || DR.round.track !== track || (pin && DR.round.pinFor !== pin)) rdStart(track, { pin });
  return h('div', { class: 'm-panel' }, drillPanel());
};
/* an unfinished round survives the break: starting the next set keeps it if the set is for the same subject */
const _rdTgl = ACT.tgl;
ACT.tgl = function (...a) {
  const keep = DR && DR.ctx === 'focus' && DR.round && DR.round.res.length < DR.round.plan.length && DR.round.res.length > 0 ? DR : null;
  const r = _rdTgl.apply(this, a);
  if (keep && DR === null && T.run && T.mode === 'focus') { DR = keep; render(); }
  return r;
};

/* ---------- the paper block: the day ends with a paper, sized to the day ---------- */
const rdPaperToday = () => S.scores.some(s => s.date === dkey()) || !!S.exam;
function rdPaperChoice() {
  const cands = mySubjects().filter(s => PPP_SPEC[s.id]).map(s => {
    const subj = trackSubj(s.id), last = S.scores.filter(x => x.subj === subj).map(x => x.date).sort().pop();
    const ago = last ? Math.round((parseKey(dkey()) - parseKey(last)) / 864e5) : 14;
    return { id: s.id, v: subjPriority(s.id) + Math.min(14, ago) * 2 };
  }).sort((a, b) => b.v - a.v);
  if (!cands.length) return null;
  const t = cands[0].id, specs = PPP_SPEC[t], done = S.scores.filter(x => /^PPP /.test(x.paper) && x.subj === trackSubj(t)).length, k = done % specs.length;
  const left = todayTrain().reduce((a, x) => a + Math.max(0, x.left), 0) * (S.timer.focus || 25), full = rdFocusMins() + left >= 180;
  return { t, k, sp: specs[k], full };
}
function rdPaperStart(t, k, full) {
  if (S.exam && !sure('You have another paper in progress. Abandon it and start this one?')) return;
  const p = pppBuild(t, k); if (!p.qs.length) return toast('All the topics for this paper are hidden in Settings');
  if (!full) { /* a section: questions in order up to about 30 minutes of marks */
    const total = p.qs.reduce((a, q) => a + qMax(q), 0), want = Math.max(8, Math.round(total * 30 / p.mins)); let sum = 0, n = 0;
    while (n < p.qs.length && (sum < want || n === 0)) { sum += qMax(p.qs[n]); n++; }
    p.qs = p.qs.slice(0, n); p.mins = Math.max(10, Math.round(p.mins * sum / total)); p.name += ' (section)';
  }
  S.exam = { pid: p.id, paper: p, ph: 'sit', i: 0, ans: p.qs.map(() => ''), got: p.qs.map(q => qTicks(q).map(() => false)), lv: p.qs.map(() => -1), marked: p.qs.map(() => false), why: p.qs.map(() => ''), end: Date.now() + p.mins * 60000, printed: false };
  EXRES = null; save(); exOpen(0); go('examq', '#exans'); scrollTo({ top: 0 });
}
const rdPaperLabel = c => `${TRACK_NAME(c.t)} ${c.sp.n}${c.full ? '' : ', one section'}`;
const rdPaperSub = c => c.full ? `${c.sp.marks} marks · ${hrs(c.sp.mins)} · real ${pppBoard(c.t)} format` : `About 30 minutes, marked out of its own marks`;
function rdPaperInSet(panel) {
  if (!panel || rdPaperToday()) return panel;
  const c = rdPaperChoice(); if (!c) return panel;
  panel.prepend(h('div', { class: 'rd-paper' }, h('b', null, `In the app: ${rdPaperLabel(c)}`), h('small', null, rdPaperSub(c)),
    h('div', { class: 'row' }, B([icon('scroll'), c.full ? 'Sit the full paper' : 'Sit a section'], 'rdPaper', 'primary sm', { 'data-t': c.t, 'data-k': c.k, 'data-f': c.full ? 1 : 0 }),
      B(c.full ? 'Just a section' : 'The full paper', 'rdPaper', 'ghost sm', { 'data-t': c.t, 'data-k': c.k, 'data-f': c.full ? 0 : 1 }))));
  return panel;
}
const _rdAlso = alsoToday;
alsoToday = function (rough) {
  const el = _rdAlso(rough);
  if (!rdOn() || rdPaperToday() || timerActive() || !el || !el.querySelector) return el;
  const planned = todayTrain().some(x => missionPlan(x.s.label).id === 'paper' && x.left > 0);
  if (planned || !(rdToday().length || setsOn(dkey()))) return el;
  const c = rdPaperChoice(); if (!c) return el;
  const list = el.querySelector('.at-list');
  if (list) list.prepend(atRow('scroll', `End the day with a paper: ${rdPaperLabel(c)}`, rdPaperSub(c) + (c.full ? '' : ' · or the full paper from PPP'), 'rdPaper', { 'data-t': c.t, 'data-k': c.k, 'data-f': c.full ? 1 : 0 }));
  return el;
};

Object.assign(ACT, {
  rdNext() { const R = DR && DR.round; if (!R) return; rdStart(R.track); render({ focus: drFocusSel() }); },
  rdWin() { const R = DR && DR.round; if (!R || !R.miss.length) return; rdStart(R.track, { win: R.miss }); render({ focus: drFocusSel() }); },
  rdPaper(el) { rdPaperStart(el.dataset.t, +el.dataset.k, el.dataset.f === '1'); },
  rdStyle(el) { TCD().rdOff = el.dataset.v === 'classic'; DR = null; save(); render(); toast(rdOn() ? 'Focus sets now run in rounds' : 'Focus sets are back to the classic drill'); }
});
