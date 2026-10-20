/* Archeron · Teach first. Lessons that teach a topic in small screens with a quick question after each (built into Focus
   sets), new facts shown before they are first asked, hints one step at a time, the mistake detective's note on a wrong
   answer, and quick question types: fill the gap, match up and put it in order. Loaded after app.js; it wraps a few of its
   functions rather than editing them, so the same file works in the main app and in Beta. State lives in S.tc. */
'use strict';
const TCD = () => { if (!S.tc || typeof S.tc !== 'object' || Array.isArray(S.tc)) S.tc = {}; return S.tc; };
const tcObj = k => { const t = TCD(); if (!t[k] || typeof t[k] !== 'object' || Array.isArray(t[k])) t[k] = {}; return t[k]; };
const tcArr = k => { const t = TCD(); if (!Array.isArray(t[k])) t[k] = []; return t[k]; };

/* ================= lessons ================= */
const FACTY = new Set(['recall', 'def', 'vocab']);
const taughtOn = lid => tcObj('taught')[lid] || null;
const gapOf = id => { const g = tcObj('gap')[id]; return Array.isArray(g) ? g : null; };
const gapMiss = id => { const g = gapOf(id); return !!g && !g[0]; };
const gapKnown = id => { const g = gapOf(id); return !!g && !!g[0]; };
function lessonFor(id) {
  const T = LEARN.TOPIC[id]; if (!T || T.type === 'quote') return null;
  const g = STUDY.find(x => x.topics.includes(id)); if (g) return 'g:' + g.id;
  return T.type === 'eq' && !GUIDES[id] ? null : 't:' + id;
}
function lessonMeta(lid) {
  const [k, id] = [lid.slice(0, 1), lid.slice(2)];
  if (k === 'g') { const g = STUDY_BY[id]; if (!g) return null; return { lid, title: g.title, subj: g.subj, topics: g.topics.filter(t => LEARN.TOPIC[t]), mins: readMins(g) + 3 }; }
  const T = LEARN.TOPIC[id]; if (!T) return null;
  return { lid, title: T.name, subj: T.subject, topics: [id], mins: FACTY.has(T.type) ? 4 : 6 };
}
function lessonsOf(sid) {
  const ids = topicsFor(sid), seen = new Set(), out = [];
  for (const g of STUDY) if (g.subj === sid && g.topics.some(t => ids.includes(t))) { seen.add('g:' + g.id); out.push(lessonMeta('g:' + g.id)); }
  for (const id of ids) { const lid = lessonFor(id); if (lid && !seen.has(lid)) { seen.add(lid); out.push(lessonMeta(lid)); } }
  return out.filter(Boolean);
}
/* What to teach next in a subject: topics you missed in the gap finder or that have not clicked yet come first, then
   topics you have never practised, in the order the subject lists them. Taught lessons are never offered again here. */
function lessonDue(tr) {
  const subs = tr === 'science' ? ['biology', 'chemistry', 'physics'].filter(s => mySubjects().some(x => x.id === s)).sort((a, b) => subjPriority(b) - subjPriority(a)) : [tr];
  for (const sid of subs) {
    if (!SUBJ_BY[sid]) continue;
    let best = null, top = 0;
    const ids = topicsFor(sid), order = [...new Set([...STUDY.filter(g => g.subj === sid).flatMap(g => g.topics).filter(t => ids.includes(t)), ...ids])]; /* the guides' order is the course order */
    for (const id of order) {
      const sc = gapMiss(id) || lowTopic(id) ? 2 : !skill(id).n && !gapKnown(id) ? 1 : 0;
      if (sc <= top) continue;
      const lid = lessonFor(id); if (!lid || taughtOn(lid)) continue;
      best = { lid, topic: id }; top = sc; if (sc === 2) break;
    }
    if (best) { const m = lessonMeta(best.lid); if (m) return Object.assign(m, { topic: best.topic }); }
  }
  return null;
}

/* ---------- building a lesson's steps ---------- */
const LSTOP = new Set('about above after again also because been before being between both could does doing each even every from have here into just like made make many more most much must only other over same should since some such than that their them then there these they this those through under until very were what when where which while will with would your yours'.split(' '));
const kw = s => new Set(String(s).toLowerCase().replace(/[^a-z ]+/g, ' ').split(' ').filter(w => w.length >= 4 && !LSTOP.has(w)).map(w => w.slice(0, 6)));
const overlap = (a, b) => { let n = 0; for (const w of a) if (b.has(w)) n++; return n; };
function splitGuide(g) {
  const secs = []; let cur = { h: null, lines: [] };
  for (const raw of g.body.trim().split('\n')) { const l = raw.trim(); if (!l) continue; if (l.startsWith('## ')) { if (cur.h || cur.lines.length) secs.push(cur); cur = { h: l.slice(3), lines: [] }; } else cur.lines.push(l); }
  if (cur.h || cur.lines.length) secs.push(cur);
  return secs;
}
const withId = (q, id) => { if (q) { q.id = id; q.sub = q.sub || LEARN.name(id); } return q; };
/* the question that best tests a section: a fact or definition sharing the most key words with it, or a calculation whose
   name matches when the section has a worked example */
function sectionQ(g, sec, used) {
  const text = kw(sec.h + ' ' + sec.lines.join(' ')), head = kw(sec.h || ''), hasEx = sec.lines.some(l => l.startsWith('> '));
  let best = null, top = 0;
  for (const t of g.topics) {
    const T = LEARN.TOPIC[t]; if (!T || !usable(t)) continue;
    if (T.type === 'calc') { const o = overlap(head, kw(T.name)), sc = o * 3 + (hasEx ? 1 : 0); if (o && sc > top && !used.has(t)) { top = sc; best = { calc: t }; } }
    else if (FACTY.has(T.type)) for (const it of LEARN.itemsOf(t)) {
      if (used.has(it.k)) continue;
      const sc = overlap(text, kw(it.p + ' ' + it.a)); if (sc > top && sc >= 2) { top = sc; best = { t, it }; }
    }
  }
  if (!best) return null;
  if (best.calc) { used.add(best.calc); return withId(LEARN.gen(best.calc, 1), best.calc); }
  used.add(best.it.k); return withId(best.it.q(), best.t);
}
function pickItems(id, n) {
  const its = LEARN.itemsOf(id), fresh = its.filter(it => !S.items[it.k]), weak = its.filter(it => S.items[it.k] && S.items[it.k][2] === 0);
  const pool = [...fresh, ...weak, ...its.filter(it => !fresh.includes(it) && !weak.includes(it))];
  return pool.slice(0, n);
}
function buildLesson(lid, focusTopic) {
  const M = lessonMeta(lid); if (!M) return [];
  const steps = [], used = new Set();
  if (lid.startsWith('g:')) {
    const g = STUDY_BY[lid.slice(2)], secs = splitGuide(g);
    steps.push({ k: 'read', h: 'The big idea', lead: g.lead, body: '' });
    for (const s of secs) {
      const checks = s.lines.filter(l => l.startsWith('? ')).map(l => l.slice(2).split(' | '));
      steps.push({ k: 'read', h: s.h || g.title, body: s.lines.filter(l => !l.startsWith('? ')).join('\n') });
      const q = sectionQ(g, s, used); if (q) steps.push({ k: 'ask', q });
      for (const [cq, ca] of checks.slice(0, 2)) steps.push({ k: 'check', q: cq, a: ca });
    }
    const seq = SEQS.find(s => M.topics.includes(s.topic) && LEARN.TOPIC[s.topic]); if (seq) steps.push({ k: 'ask', q: orderQ(seq) });
  } else {
    const id = lid.slice(2), T = LEARN.TOPIC[id];
    if (FACTY.has(T.type)) {
      const its = pickItems(id, 5);
      steps.push({ k: 'cards', items: its.map(it => [it.p, it.e ? `${it.a}. For example: ${it.e}` : it.a]) });
      for (const it of [...its].sort(() => Math.random() - .5)) steps.push({ k: 'ask', q: withId(it.q(), id) });
      const seq = SEQS.find(s => s.topic === id); if (seq) steps.push({ k: 'ask', q: orderQ(seq) });
    } else {
      const G = GUIDES[id], ex = LEARN.gen(id, 1), d = ex && typeof DEMO !== 'undefined' ? DEMO.build(ex) : null;
      if (G) { steps.push({ k: 'read', h: 'The big idea', lead: G[0], body: '' }); steps.push({ k: 'method', h: 'The method', list: G[1] }); }
      if (ex) steps.push({ k: 'example', q: ex, d: d && d.ok ? d : null, fallback: G && G[2] });
      if (G) steps.push({ k: 'read', h: 'Exam tip', lead: G[3], body: '' });
      for (const l of [1, 2, 2]) { const q = LEARN.gen(id, l); if (q) steps.push({ k: 'ask', q: withId(q, id) }); }
    }
  }
  steps.push({ k: 'done' });
  return steps;
}

/* ---------- running a lesson ---------- */
let LS = null; /* { lid, steps, i, ctx: 'view' | 'focus', topic, ok, asked, open } */
function lessonStart(lid, ctx = 'view', topic = null) {
  const steps = buildLesson(lid); if (steps.length < 2) return false;
  const prog = +tcObj('lp')[lid] || 0;
  LS = { lid, steps, i: prog > 0 && prog < steps.length - 1 ? prog : 0, ctx, topic, ok: 0, asked: 0 };
  lsEnter(); return true;
}
function lsEnter() {
  const st = LS.steps[LS.i];
  if (st.k === 'ask') { DR = { track: LEARN.trackOf(st.q.id), topic: st.q.id, ctx: 'lesson', q: st.q, state: 'ask', count: 0, ok: 0, run: 0, last: st.q.id, picked: null, msg: '', lsStep: LS.i, lid: LS.lid }; DRAFT.dr = ''; }
  st.open = false;
}
function lsMove(d) {
  if (!LS) return;
  LS.i = clamp(LS.i + d, 0, LS.steps.length - 1);
  tcObj('lp')[LS.lid] = LS.i;
  if (LS.steps[LS.i].k === 'done') lsFinish();
  else lsEnter();
  save();
  render({ focus: '#ls-next' });
  const top = document.querySelector('.lesson'); if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' });
}
function lsFinish() {
  const first = !taughtOn(LS.lid), M = lessonMeta(LS.lid);
  tcObj('taught')[LS.lid] = dkey(); delete tcObj('lp')[LS.lid];
  ldayAdd(M.subj); if (LS.ctx === 'focus' && S.tc.fl && S.tc.fl.tr !== M.subj) ldayAdd(S.tc.fl.tr);
  if (first) { xp(15); dayEv('lesson'); }
  save(); SFX.play('fanfare');
  setTimeout(() => { const c = document.querySelector('.lesson'); if (c) FXS.burst(c, 60); }, 120);
}
const lsTopic = () => LS && (LS.topic || (lessonMeta(LS.lid) || { topics: [] }).topics[0]);
function lessonPanel() {
  if (!LS) return null;
  const M = lessonMeta(LS.lid), st = LS.steps[LS.i], n = LS.steps.length, last = st.k === 'done';
  const nextBtn = (label = 'Next', extra = {}) => B(label, 'lsNext', 'primary grow', Object.assign({ id: 'ls-next' }, extra));
  let body;
  if (st.k === 'read') body = [h('h3', { class: 'ls-h' }, st.h), st.lead && h('p', { class: 'ls-lead' }, st.lead), st.body && h('div', { class: 'guide-body ls-body' }, guideBody(st.body))];
  else if (st.k === 'method') body = [h('h3', { class: 'ls-h' }, st.h), h('ol', { class: 'steps ls-steps' }, st.list.map(x => h('li', null, x)))];
  else if (st.k === 'example') {
    const q = st.q;
    body = [h('h3', { class: 'ls-h' }, 'Watch one done'), h('p', { class: 'qtext ex-q' }, q.q), DEMO.picOf(q) && h('div', { class: 'qpic-w' }, PIC.el(DEMO.picOf(q))),
      st.d && B([icon('play'), 'Watch it worked out'], 'lsBoard', 'ghost'),
      st.open || !st.d ? [h('ol', { class: 'steps' }, q.steps.map(x => h('li', null, x))), h('p', null, 'Answer: ', h('b', null, q.show))] : B('Show the written steps', 'lsOpen', 'link'),
      !st.d && st.fallback && h('p', { class: 'g-ex' }, h('b', null, 'Another example: '), st.fallback)];
  }
  else if (st.k === 'cards') body = [h('h3', { class: 'ls-h' }, `Learn these ${st.items.length}`), h('p', { class: 'muted xs' }, 'Read each one, then cover it and say it in your head. Straight after, you get a question on each.'),
    h('ol', { class: 'ls-facts' }, st.items.map(([p, a]) => h('li', null, h('b', null, p), h('span', null, a))))];
  else if (st.k === 'check') body = [h('h3', { class: 'ls-h' }, 'Quick check'), h('p', { class: 'qtext' }, st.q),
    st.open ? [h('div', { class: 'fb ok ls-ans' }, h('p', null, h('b', null, 'Answer: '), st.a)), h('p', { class: 'muted xs' }, 'Did you get it?'),
      h('div', { class: 'row' }, B([icon('check'), 'Got it'], 'lsSelf', 'primary grow', { 'data-ok': 1, id: 'ls-next' }), B('Not yet', 'lsSelf', 'ghost', { 'data-ok': 0 }))]
      : [h('p', { class: 'muted xs' }, 'Answer it in your head or on paper first.'), B('Show the answer', 'lsOpen', 'primary wide', { id: 'ls-next' })]];
  else if (st.k === 'ask') { if (!(DR && DR.ctx === 'lesson' && DR.lsStep === LS.i && DR.lid === LS.lid)) lsEnter(); body = drillPanel(); }
  else {
    const t = lsTopic(), more = t && FACTY.has((LEARN.TOPIC[t] || {}).type) && LEARN.itemsOf(t).some(it => !S.items[it.k]);
    body = [h('div', { class: 'ls-done' }, h('span', { class: 'ls-trophy' }, icon('crown')), h('h3', null, 'Lesson complete'),
      h('p', null, LS.asked ? `${LS.ok} of ${LS.asked} questions right on the way through.` : 'Now put it to work.'),
      h('p', { class: 'muted xs' }, 'Practice straight after a lesson is what makes it stick. The questions you missed come back later on their own.')),
      LS.ctx === 'focus' ? B([icon('play'), 'Carry on with this set'], 'lsCarry', 'primary wide', { id: 'ls-next' })
        : h('div', { class: 'row' }, t && B([icon('play'), 'Practise it now'], 'lsPractise', 'primary grow', { id: 'ls-next' }), more && B('Teach me 5 more', 'lsStart', 'ghost', { 'data-lid': LS.lid }))];
  }
  const nav = st.k === 'ask' || st.k === 'check' || last ? null
    : h('div', { class: 'row ls-nav' }, LS.i > 0 && B('Back', 'lsNext', 'ghost', { 'data-d': -1 }), nextBtn(st.k === 'cards' ? 'Test me' : 'Next'));
  return h('section', { class: 'card lesson' + (last ? ' finished' : '') },
    h('div', { class: 'ls-top' }, h('span', { class: 'pill ls-pill' }, icon('book'), 'Lesson'), h('b', null, M.title), h('small', null, last ? 'done' : `${LS.i + 1} of ${n - 1}`)),
    h('div', { class: 'ls-prog', 'aria-hidden': 'true' }, LS.steps.slice(0, -1).map((s, i) => h('i', { class: (i < LS.i || last ? 'on' : i === LS.i ? 'cur' : '') + (s.k === 'ask' || s.k === 'check' ? ' q' : '') }))),
    h('div', { class: 'ls-step' }, body), nav,
    st.k === 'ask' && h('div', { class: 'row end' }, B('Skip this question', 'lsNext', 'link sm')));
}
function vLesson() {
  if (!LS || LS.ctx !== 'view') return VIEWS.learn();
  const M = lessonMeta(LS.lid); SUBJ_SEL = M.subj;
  return h('div', { class: 'stack narrow' }, subHero(TRACK_NAME(M.subj), M.title, 'subject', null, TRACK_NAME(M.subj)), lessonPanel());
}
VIEWS.lesson = vLesson; PARENT.lesson = 'learn'; BACKS.lesson = 'Lesson';

/* ---------- lessons inside Focus sets: one new lesson per subject per day, then practise it ---------- */
/* Up to two new lessons per subject per day (was one): in the simulation two did better under every assumption and a
   lesson in every set did no better than two. A skipped lesson uses up the day, so it is not offered again straight away. */
const LESSONS_A_DAY = 2;
const ldayN = tr => { const v = tcObj('lday')[tr]; return v && v.d === dkey() ? v.n : v === dkey() ? 1 : 0; };
const ldayAdd = (tr, n = 1) => { tcObj('lday')[tr] = { d: dkey(), n: Math.min(LESSONS_A_DAY, ldayN(tr) + n) }; };
const focusTrack = M => M.id === 'drill' ? M.subj : M.id === 'lit' ? 'englit' : M.id === 're' ? 're' : M.id === 'lang' ? 'englang' : null;
function focusLesson(tr) {
  const active = timerActive() && T.mode === 'focus', n = lifeSets(), d = dkey(), fl = S.tc && S.tc.fl;
  if (active && T.rescue) return null;
  if (active && fl && fl.n === n && fl.d === d && fl.tr === tr) {
    if (!fl.lid) return null;
    if (fl.st === 'todo' && taughtOn(fl.lid) === d && !(LS && LS.lid === fl.lid && LS.ctx === 'focus')) fl.st = 'done'; /* finished, then the app was reopened */
    return Object.assign(lessonMeta(fl.lid) || {}, { topic: fl.topic, st: fl.st });
  }
  const due = ldayN(tr) >= LESSONS_A_DAY ? null : lessonDue(tr);
  if (active) { TCD().fl = { n, d, tr, lid: due ? due.lid : null, topic: due ? due.topic : null, st: due ? 'todo' : 'none' }; save(); }
  return due ? Object.assign(due, { st: 'todo' }) : null;
}
const _missionFor = missionFor;
missionFor = function (label) {
  const M = _missionFor(label), tr = focusTrack(M);
  if (!tr || M.id === 'choose') return M;
  const L = focusLesson(tr); if (!L || !L.lid) return M;
  if (L.st === 'todo') return Object.assign({}, M, { lesson: L, title: `Learn: ${L.title}`,
    steps: [`Lesson first: ${L.title}, about ${L.mins} minutes. Read each part, then answer its quick question`, 'Then practise it until the timer ends', 'Missed one? Read the method and try a similar one'] });
  return L.st === 'done' ? Object.assign({}, M, { lesson: L }) : M;
};
const _missionBody = missionBody;
missionBody = function (M) {
  const live = timerActive() && T.mode === 'focus';
  if (live && M.lesson && M.lesson.st === 'todo') {
    if (!LS || LS.lid !== M.lesson.lid || LS.ctx !== 'focus') lessonStart(M.lesson.lid, 'focus', M.lesson.topic);
    if (LS && LS.ctx === 'focus') return h('div', { class: 'm-panel' }, lessonPanel(), LS.steps[LS.i].k !== 'done' && h('div', { class: 'row center' }, B('Skip the lesson and just practise', 'lsSkip', 'link sm')));
  }
  if (live && M.lesson && M.lesson.st === 'done' && M.id === 'drill' && M.lesson.topic && usable(M.lesson.topic)) {
    if (!DR || DR.ctx !== 'focus' || DR.track !== M.subj || DR.pin !== M.lesson.topic) { startDrill(M.subj, M.lesson.topic, 'focus'); DR.setNo = lifeSets(); DR.pin = M.lesson.topic; DR.five = !!M.five; }
  }
  return _missionBody(M);
};

/* ================= learn first, hints, mistake detective, quick question types ================= */
const TEST_CTX = new Set(['gap', 'grade', 'daily']);
const isNewFact = q => q && q.key && q.fact && !S.items[q.key] && FACTY.has((LEARN.TOPIC[q.id] || {}).type) && DR && !TEST_CTX.has(DR.ctx) && DR.ctx !== 'lesson' && !(T.rescue && timerActive());
const _nextQ = nextQ;
nextQ = function (sameTopic) {
  if (DR && DR.ctx === 'lesson') {
    const q0 = DR.q; DR.msg = ''; DR.picked = null; DRAFT.dr = ''; DR.hint = 0; DR.slip = null; DR.hid = null; DR.state = 'ask';
    if (sameTopic && q0 && q0.kind !== 'order') { const q = FACTY.has((LEARN.TOPIC[q0.id] || {}).type) ? (LEARN.itemsOf(q0.id).find(it => it.k === q0.key) || { q: () => null }).q() : LEARN.gen(q0.id, 1); if (q) DR.q = withId(q, q0.id); }
    return;
  }
  if (DR && DR.only === 'order') { DR.msg = ''; DR.picked = null; DRAFT.dr = ''; DR.hint = 0; DR.slip = null; DR.q = orderFor(DR.track); DR.state = 'ask'; return; }
  _nextQ(sameTopic);
  if (!DR || !DR.q) return;
  DR.hint = 0; DR.slip = null; DR.hid = null; DR.ord = null; DR.mt = null;
  if (TEST_CTX.has(DR.ctx) || DR.state === 'example' || DR.q.back) return;
  /* 35% quick types (was 20%): the 12-week simulation (sim2, Oct 2026) found more learning per minute at 35% under every
     assumption tested, even with slow match-ups; it rewards even more, but it cannot see that matching is easier than recall */
  if (!sameTopic && !DR.five && Math.random() < .35) { const alt = quickFor(DR.q.id); if (alt) { DR.q = alt; return; } }
  /* at most one "learn this first" card in any three questions, so a brand-new topic is not a wall of cards */
  if (isNewFact(DR.q) && (DR.lastCard == null || DR.count - DR.lastCard >= 3)) { DR.state = 'learn'; DR.lastCard = DR.count; }
};
/* New facts: shown first, then first asked two questions later. Asking straight away and again later took time for
   little gain: in the simulation, one delayed question beat both (+0.5 to +0.9 points), and a delayed first try is also
   what the testing-effect research favours. */
function ltGo() {
  if (!DR || DR.state !== 'learn') return;
  const q = Object.assign(DR.q, { back: true, lt: true });
  (DR.retry = DR.retry || []).push({ q, at: DR.count + 3 });
  DR.count++; nextQ(); render({ focus: DR.q && DR.q.kind === 'mcq' ? '#opt0' : '#ans' });
}
function learnCard(q) {
  return h('section', { class: 'card qcard learn-first' },
    h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, q.sub || LEARN.name(q.id)), h('span', { class: 'pill new' }, icon('sparkle'), 'New')),
    h('p', { class: 'fb-h' }, 'Learn this one first'),
    h('div', { class: 'lf-fact' }, h('b', null, q.fact[0]), h('p', null, q.fact[1])),
    h('p', { class: 'muted xs' }, 'Read it, look away and say it in your head. It comes back as a question in a couple of minutes.'),
    B('Got it', 'ltGo', 'primary wide', { id: 'nextq' }));
}

/* ---------- hints: one step of the method at a time; a hinted right answer counts, but does not raise your level ---------- */
function hintMax(q) {
  if (!q || DR.state !== 'ask' || TEST_CTX.has(DR.ctx)) return 0;
  if (q.kind === 'mcq') return q.options && q.options.length >= 4 ? 2 : 0;
  if (q.kind === 'def') return q.points && q.points.length >= 2 ? q.points.length - 1 : 0;
  if (q.kind === 'word') return q.w && q.w.length >= 4 ? 2 : 0;
  if (['order', 'match'].includes(q.kind) || !q.steps || q.steps.length < 2) return 0;
  /* hints stop before the first step that gives the answer away */
  const core = String(q.show || '').replace(/^[£×x =]+/, ''), num = /^−?-?[\d.,]+ [^\d]+$/.test(core) ? core.split(' ')[0] : null; /* "84 cm²" → "84" */
  const ans = [q.show, q.v != null && typeof q.v === 'number' && String(q.v), num].filter(Boolean).map(String);
  const k = q.steps.findIndex(s => ans.some(a => new RegExp(`(^|[^0-9.])${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^0-9])`).test(s)));
  return Math.min(q.steps.length - 1, k < 0 ? q.steps.length - 1 : k);
}
function nudge() {
  if (!DR || !DR.q) return;
  const q = DR.q, max = hintMax(q); if (!max || (DR.hint || 0) >= max) return;
  if (q.kind === 'mcq') { const hid = DR.hid = DR.hid || [], wrong = q.options.map((_, i) => i).filter(i => i !== q.a && !hid.includes(i)); if (wrong.length) hid.push(pick(wrong)); }
  DR.hint = (DR.hint || 0) + 1; SFX.play('click');
  render({ focus: q.kind === 'mcq' ? '#opt0' : '#ans' });
}
function hintList(q) {
  const n = DR.hint || 0; if (!n || q.kind === 'mcq') return null;
  const items = q.kind === 'def' ? q.points.slice(0, n).map(p => 'Key point: ' + p) : q.kind === 'word' ? [`It starts with “${q.w.slice(0, n)}”`, n > 1 ? `${q.w.length} letters` : null].filter(Boolean) : q.steps.slice(0, n);
  return h('div', { class: 'nudges' }, h('span', { class: 'g-tag' }, n === 1 ? 'Hint' : `Hints (${n})`), h('ol', null, items.map(x => h('li', null, x))));
}
let HINTED = false;
function recordHinted(id, key) {
  const k = S.skill[id] = skill(id); k.n++; k.ok++; k.rec = [...k.rec, true].slice(-6);
  if (key) { const m = S.items[key] || [0, 0, 0, 0]; m[0]++; m[1]++; m[3] = today(); S.items[key] = m; }
  const d = ensureDay(dkey()); d.qa = (d.qa || 0) + 1; d.qr = (d.qr || 0) + 1;
  const T0 = LEARN.TOPIC[id]; if (T0) { d.t = d.t || {}; d.t[T0.subject] = (d.t[T0.subject] || 0) + 1; dayEv(T0.type); dayEv('s:' + T0.subject); }
  S.learnOk++; save();
}
const _record = record;
record = function (id, ok, key) { return HINTED && ok ? recordHinted(id, key) : _record(id, ok, key); };
const _finishAnswer = finishAnswer;
finishAnswer = function (res) {
  if (DR && DR.q) DR.slip = res && res.valid !== false && !res.ok && !res.msg && typeof SLIPS !== 'undefined' ? SLIPS.find(DR.q, DRAFT.dr) : null;
  const hinted = !!(DR && DR.hint > 0 && res && res.ok), run0 = DR ? DR.run : 0;
  if (DR && DR.ctx === 'lesson' && LS) { LS.asked++; if (res && res.ok) LS.ok++; }
  HINTED = hinted;
  try { _finishAnswer(res); } finally { HINTED = false; }
  if (hinted && DR) DR.run = run0;
};

/* ---------- quick question types ---------- */
const shuffleA = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const seqKey = s => LEARN.hkey('seq|' + s.title);
function orderQ(s) {
  let order; do order = shuffleA(s.steps.map((_, i) => i)); while (order.every((v, i) => v === i));
  return { kind: 'order', id: s.topic, key: seqKey(s), q: s.title, sub: 'Put it in order', items: order, steps: s.steps, show: s.steps.join(' → '), seq: s.id };
}
function pickSeq(list) {
  const fresh = list.filter(s => !S.items[seqKey(s)]); if (fresh.length) return pick(fresh);
  return list.slice().sort((a, b) => (S.items[seqKey(a)] || [0, 0, 0, 0])[2] - (S.items[seqKey(b)] || [0, 0, 0, 0])[2] || Math.random() - .5)[0];
}
const seqsFor = id => SEQS.filter(s => s.topic === id && LEARN.TOPIC[s.topic]);
function orderFor(track) {
  const ids = new Set(topicsFor(track)), list = SEQS.filter(s => ids.has(s.topic));
  return list.length ? orderQ(pickSeq(list)) : null;
}
function matchQ(id) {
  const its = shuffleA(LEARN.itemsOf(id).filter(it => it.a.length <= 70 && it.p.length <= 120)), got = [], seen = new Set();
  for (const it of its) { const a = it.a.toLowerCase(); if (!seen.has(a)) { seen.add(a); got.push(it); } if (got.length === 4) break; }
  if (got.length < 4) return null;
  const right = shuffleA([0, 1, 2, 3]);
  return { kind: 'match', id, q: 'Match each one to its answer', sub: 'Match up', L: got.map(it => it.p), R: right.map(i => got[i].a), ans: got.map((_, i) => right.indexOf(i)),
    show: got.map(it => `${it.p} → ${it.a}`).join('; '), steps: got.map(it => `${it.p} → ${it.a}`) };
}
/* Fill the gap: the blank is always another key term defined in the same subject, and the wrong options are key terms
   too, so only knowledge decides it (a blanked verb could have two right answers). */
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termForm = t => /^[A-Z][a-z]/.test(t) && !/\s[A-Z]|'s\b/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t; /* names keep their capital */
function clozeQ(id) {
  const its = LEARN.itemsOf(id).filter(it => it.pts); if (its.length < 2) return null;
  const subj = LEARN.TOPIC[id].subject, sameSubj = LEARN.SUBJECTS.find(s => s.id === subj).topics.filter(t => LEARN.TOPIC[t].type === 'def');
  const terms = [...new Set(sameSubj.flatMap(t => LEARN.itemsOf(t).map(x => x.p)))].filter(t => t.length >= 3 && t.split(' ').length <= 3);
  const local = new Set(its.map(x => x.p));
  for (const it of shuffleA(its).slice(0, 10)) {
    const hits = terms.filter(t => t !== it.p && !it.p.toLowerCase().includes(t.toLowerCase()) && new RegExp(`\\b${reEsc(t)}\\b`, 'i').test(it.a));
    if (!hits.length) continue;
    const t = pick(hits), others = shuffleA(terms.filter(x => x !== t && x !== it.p && !new RegExp(`\\b${reEsc(x)}\\b`, 'i').test(it.a)))
      .sort((a, b) => (local.has(b) ? 1 : 0) - (local.has(a) ? 1 : 0)).slice(0, 3);
    if (others.length < 3) continue;
    const options = shuffleA([t, ...others]).map(termForm), right = termForm(t);
    return { kind: 'mcq', key: it.k, id, fact: [it.p, it.a], q: `Fill the gap in the definition of “${it.p}”:\n${it.a.replace(new RegExp(`\\b${reEsc(t)}\\b`, 'i'), '_____')}`, sub: 'Fill the gap', options, a: options.indexOf(right), show: right, steps: [`${it.p}: ${it.a}`] };
  }
  return null;
}
function quickFor(id) {
  const T0 = LEARN.TOPIC[id]; if (!T0) return null;
  const makers = [], seen = DR && (DR.qkSeen = DR.qkSeen || new Set()), seqs = seqsFor(id).filter(s => !seen || !seen.has(s.id)); /* a sequence once per session */
  if (seqs.length) makers.push(() => { const s = pickSeq(seqs); if (seen) seen.add(s.id); return orderQ(s); });
  if (FACTY.has(T0.type)) makers.push(() => matchQ(id));
  if (T0.type === 'def') makers.push(() => clozeQ(id));
  for (const m of shuffleA(makers)) { const q = m(); if (q) { q.id = q.id || id; return q; } }
  return null;
}
function quickPanel(q) {
  const st = DR.state, done = st !== 'ask';
  let body;
  if (q.kind === 'order') {
    const ord = DR.ord = DR.ord || [], left = q.items.filter(i => !ord.includes(i));
    body = [h('p', { class: 'muted xs' }, done ? 'The right order:' : 'Tap the steps in the right order. Tap a placed step to take it back.'),
      done ? h('ol', { class: 'ord-list done' }, q.steps.map((s, i) => h('li', { class: ord[i] === i ? 'ok' : st === 'shown' ? '' : 'no' }, s, st === 'wrong' && ord[i] !== i && h('small', null, `you put: ${q.steps[ord[i]] || '–'}`))))
        : [h('ol', { class: 'ord-list' }, ord.map((i, k) => h('li', null, h('button', { type: 'button', class: 'ord-placed', 'data-act': 'ordBack', 'data-i': k }, q.steps[i])))),
          left.length ? h('div', { class: 'ord-pool' }, left.map(i => h('button', { type: 'button', class: 'opt ord-opt', 'data-act': 'ordPick', 'data-i': i }, q.steps[i]))) : null]];
  } else {
    const mt = DR.mt = DR.mt || { sel: null, p: {} }, usedR = new Set(Object.values(mt.p));
    body = [h('p', { class: 'muted xs' }, done ? 'The right pairs:' : 'Tap one on the left, then its answer.'),
      h('div', { class: 'mt-grid' + (done ? ' done' : '') }, q.L.map((l, i) => {
        const r = mt.p[i], good = r === q.ans[i];
        return h('div', { class: 'mt-row' + (done ? (good ? ' ok' : ' no') : '') },
          h('button', { type: 'button', class: 'opt mt-l' + (mt.sel === i ? ' sel' : '') + (r != null ? ' set' : ''), 'data-act': 'mtL', 'data-i': i, disabled: done }, l),
          h('span', { class: 'mt-a' }, done ? q.R[q.ans[i]] : r != null ? q.R[r] : '…'));
      })),
      !done && h('div', { class: 'mt-pool' }, q.R.map((r, j) => h('button', { type: 'button', class: 'chip' + (usedR.has(j) ? ' used' : ''), 'data-act': 'mtR', 'data-i': j, disabled: mt.sel == null }, r)))];
  }
  const ready = q.kind === 'order' ? (DR.ord || []).length === q.items.length : Object.keys((DR.mt || { p: {} }).p).length === q.L.length;
  return h('section', { class: 'card qcard quick ' + st },
    h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, q.sub), h('span', null, LEARN.name(q.id))),
    h('p', { class: 'qtext' }, q.q), body,
    !done ? h('div', { class: 'row' }, B('Check', 'qkCheck', 'primary grow', { disabled: !ready }), B('Show me', 'reveal', 'ghost'))
      : h('div', { class: 'fb ' + (st === 'right' ? 'ok' : 'no') + ' t-panel-slide', 'data-open': 'false' },
        h('p', { class: 'fb-h' }, st === 'right' ? [successCheck(), 'All in the right place.'] : st === 'shown' ? 'Here is how it goes.' : ['Not quite.', DR.msg && h('span', null, ' ' + DR.msg)]),
        h('div', { class: 'row' }, B(DR.ctx === 'lesson' ? 'Continue' : 'Next question', 'next', 'primary grow', { id: 'nextq' }))));
}
function qkCheck() {
  if (!DR || !DR.q || DR.state !== 'ask') return;
  const q = DR.q;
  if (q.kind === 'order') { const ord = DR.ord || []; if (ord.length !== q.items.length) return; const right = ord.filter((v, i) => v === i).length; finishAnswer({ valid: true, ok: right === ord.length, msg: right === ord.length ? '' : `${right} of ${ord.length} in the right place.` }); }
  else { const p = (DR.mt || { p: {} }).p, right = q.ans.filter((r, i) => p[i] === r).length; finishAnswer({ valid: true, ok: right === q.L.length, msg: right === q.L.length ? '' : `${right} of ${q.L.length} pairs right.` }); }
}

/* ---------- the question card, with the extras added in ---------- */
const _drillPanel = drillPanel;
drillPanel = function () {
  const q = DR && DR.q;
  if (q && DR.state === 'learn') return learnCard(q);
  if (q && (q.kind === 'order' || q.kind === 'match')) return quickPanel(q);
  const el = _drillPanel();
  if (!q || !el || !el.classList || !el.classList.contains('qcard') || DR.state === 'example') return el;
  try {
    const max = hintMax(q);
    if (DR.state === 'ask') {
      if (q.lt) { const m = el.querySelector('.drill-meta > span:last-child'); if (m) m.textContent = 'The new one from a moment ago'; }
      if (q.kind === 'mcq' && DR.hid) for (const i of DR.hid) { const o = el.querySelector(`.opt[data-i="${i}"]`); if (o) { o.classList.add('gone'); o.disabled = true; } }
      const hl = hintList(q), box = el.querySelector('#ans, .mcq'); if (hl && box) box.after(hl);
      if (max) {
        const left = max - (DR.hint || 0), nb = B([icon('sparkle'), left ? (DR.hint ? 'Another hint' : 'Hint') : 'No more hints'], 'nudge', 'ghost hint-btn' + (q.kind === 'mcq' ? ' sm' : ''), { disabled: !left, 'aria-label': left ? 'Show a hint' : 'No more hints' });
        const row = el.querySelector('[data-act="reveal"]')?.closest('.row'); if (row) row.prepend(nb);
      }
    }
    if (DR.state === 'right' && DR.hint) { const f = el.querySelector('.fb.ok .fb-h'); if (f) f.after(h('p', { class: 'muted xs' }, 'Right, with a hint. Your level only goes up on answers without hints, so try the next one on your own.')); }
    if (DR.state === 'wrong' && DR.slip) { const f = el.querySelector('.fb.no .fb-h'); if (f) f.after(h('div', { class: 'slip' }, icon('target'), h('div', null, h('b', null, 'Mistake detective'), h('p', null, DR.slip)))); }
    if (DR.ctx === 'lesson') for (const b of el.querySelectorAll('[data-act="next"]')) b.textContent = 'Continue';
  } catch (e) { console.error(e); }
  return el;
};

/* ---------- actions ---------- */
Object.assign(ACT, {
  lsStart(el) {
    const lid = el.dataset.lid; if (!lid || !lessonStart(lid, 'view', el.dataset.topic || null)) return toast('That lesson is not available');
    if (el.dataset.lid === (LS && LS.lid) && TAB === 'lesson') { render(); scrollTo({ top: 0 }); } else go('lesson');
  },
  lsNext(el) {
    if (!LS) return;
    const d = el && el.dataset && el.dataset.d ? +el.dataset.d : 1, st = LS.steps[LS.i];
    if (d > 0 && st.k === 'ask' && DR && DR.ctx === 'lesson' && DR.state === 'ask') LS.asked++; /* skipped */
    lsMove(d);
  },
  lsOpen() { if (!LS) return; LS.steps[LS.i].open = true; render({ focus: '#ls-next' }); },
  lsSelf(el) { if (!LS) return; LS.asked++; if (+el.dataset.ok) LS.ok++; lsMove(1); },
  lsBoard() { const st = LS && LS.steps[LS.i]; if (st && st.d) { st.open = true; render(); playBoard(st.d, false, 'Worked example'); } },
  lsPractise() { const t = lsTopic(); if (!t) return; startDrill(LEARN.trackOf(t), t); LS = null; go('drill', DR.q && DR.q.kind === 'mcq' ? '#opt0' : '#ans'); },
  lsCarry() { if (S.tc && S.tc.fl) S.tc.fl.st = 'done'; LS = null; DR = null; save(); render(); },
  lsSkip() { if (S.tc && S.tc.fl) { S.tc.fl.st = 'skip'; ldayAdd(S.tc.fl.tr, LESSONS_A_DAY); } LS = null; DR = null; save(); render(); toast('Skipped. The lesson will be offered again another day.'); },
  ltGo,
  nudge,
  ordPick(el) { if (!DR || DR.state !== 'ask') return; (DR.ord = DR.ord || []).push(+el.dataset.i); SFX.play('click'); render(); },
  ordBack(el) { if (!DR || DR.state !== 'ask') return; DR.ord.splice(+el.dataset.i, 1); render(); },
  mtL(el) { if (!DR || DR.state !== 'ask') return; const i = +el.dataset.i, mt = DR.mt = DR.mt || { sel: null, p: {} }; mt.sel = mt.sel === i ? null : i; render(); },
  mtR(el) {
    if (!DR || DR.state !== 'ask' || !DR.mt || DR.mt.sel == null) return;
    const j = +el.dataset.i, mt = DR.mt; for (const k of Object.keys(mt.p)) if (mt.p[k] === j) delete mt.p[k];
    mt.p[mt.sel] = j; const nextFree = DR.q.L.findIndex((_, i) => mt.p[i] == null); mt.sel = nextFree >= 0 ? nextFree : null; SFX.play('click'); render();
  },
  qkCheck,
  lsAll(el) { LS_ALL[el.dataset.track] = !LS_ALL[el.dataset.track]; render(); },
  ordDrill(el) { startDrill(el.dataset.track, null); DR.only = 'order'; nextQ(); go('drill'); }
});
const _next = ACT.next, _similar = ACT.similar;
ACT.next = function () {
  if (DR && DR.state === 'learn') return ltGo();
  if (DR && DR.ctx === 'lesson') return lsMove(1);
  return _next();
};
ACT.similar = function () {
  if (DR && DR.ctx === 'lesson') { nextQ(DR.q.id); return render({ focus: DR.q && DR.q.kind === 'mcq' ? '#opt0' : '#ans' }); }
  return _similar();
};
const _reveal = ACT.reveal;
ACT.reveal = function () {
  const q = DR && DR.q; if (!q || DR.state !== 'ask') return;
  if (DR.ctx === 'lesson' && LS) LS.asked++;
  if (q.kind !== 'order' && q.kind !== 'match') return _reveal();
  record(q.id, false, q.key); countAns(); DR.run = 0; DR.state = 'shown'; SFX.play('reveal'); render({ focus: '#nextq' });
};

/* ---------- where lessons show up: a subject's Learn tab (app.js vSubject), Learn's "Next for you", above a topic's questions ---------- */
/* every lesson in a subject; a lesson built from a Study guide can also be read as the whole guide */
const LS_ALL = {};
function lessonList(s) {
  const all = lessonsOf(s.id); if (!all.length) return null;
  const done = all.filter(m => taughtOn(m.lid)).length, nx = lessonDue(s.id), shown = LS_ALL[s.id] ? all : all.slice(0, 6);
  return card('Lessons', h('span', { class: 'muted' }, `${done} of ${all.length} done`),
    h('p', { class: 'muted xs' }, 'Each lesson teaches one area in small steps, with a quick question after each part. Your Focus sets start new ones for you.'),
    h('ul', { class: 'list ls-list' }, shown.map(m => h('li', { class: 'xp-row' + (nx && nx.lid === m.lid ? ' next' : '') },
      h('div', { class: 'grow' }, h('b', null, m.title), h('small', null, taughtOn(m.lid) ? `✓ done ${fmtDate(taughtOn(m.lid))}` : nx && nx.lid === m.lid ? `up next · about ${m.mins} min` : `about ${m.mins} min`)),
      m.lid.startsWith('g:') && B('Read', 'guide', 'link sm', { 'data-id': m.lid.slice(2), 'data-from': 'subject', 'aria-label': `Read the guide: ${m.title}` }),
      B(taughtOn(m.lid) ? 'Again' : 'Start', 'lsStart', taughtOn(m.lid) ? 'ghost sm' : 'primary sm', { 'data-lid': m.lid })))),
    all.length > 6 && B(LS_ALL[s.id] ? 'Show fewer' : `Show all ${all.length} lessons`, 'lsAll', 'link sm ls-all', { 'data-track': s.id }));
}
function nextLessonBtn(s) {
  const nx = lessonDue(s.id); if (!nx) return null;
  return h('button', { type: 'button', class: 'card rescue-cta ls-cta', 'data-act': 'lsStart', 'data-lid': nx.lid, 'data-topic': nx.topic },
    h('span', { class: 'wc-ic' }, icon('book')), h('span', { class: 'grow' }, h('b', null, `Next lesson: ${nx.title}`), h('small', null, `About ${nx.mins} minutes, taught step by step with a question after each part.`)), h('span', { class: 'btn primary sm' }, 'Start'));
}
const _vDrill = VIEWS.drill;
VIEWS.drill = function () {
  const el = _vDrill();
  try {
    const t = DR && DR.topic, lid = t && ['learn', 'guide', 'sess'].includes(DR.ctx) && lessonFor(t);
    if (lid && !taughtOn(lid) && skill(t).n < 3 && el.children[0]) el.children[0].after(h('div', { class: 'banner ls-banner' }, icon('book'),
      h('div', { class: 'grow' }, h('b', null, 'New to this?'), h('p', null, `A short lesson teaches ${LEARN.name(t)} first, step by step.`)), B('Start the lesson', 'lsStart', 'primary sm', { 'data-lid': lid, 'data-topic': t })));
  } catch (e) { console.error(e); }
  return el;
};
