/* Archeron · Know where you stand. The gap finder (one quick question per topic, so lessons and checklists start from what
   you actually know), grade tests (fifteen questions pitched at one grade), and exam questions sorted by topic with their
   mark schemes. Loaded after teach.js, whose helpers it uses; results live in S.tc. */
'use strict';
const TESTABLE = new Set(['calc', 'recall', 'def', 'vocab', 'eq']);
const TESTS = new Set(['gap', 'grade']);
function testQ(id, lvl) {
  let q = LEARN.gen(id, lvl);
  if (q && q.kind === 'def') { const it = LEARN.itemsOf(id).find(x => x.k === q.key); q = it ? withId(it.q(true), id) : null; } /* written definitions are slow to self-mark: pick one instead */
  return q;
}
const testable = sid => topicsFor(sid).filter(id => TESTABLE.has(LEARN.TOPIC[id].type));
function startTest(ctx, track, qs, extra = {}) {
  DR = Object.assign({ track, topic: null, ctx, q: null, state: 'ask', count: 0, ok: 0, run: 0, last: null, picked: null, msg: '', gq: qs, res: [] }, extra);
  DRAFT.dr = ''; DR.q = qs[0] || null; SUBJ_SEL = track;
  go('drill', DR.q && DR.q.kind === 'mcq' ? '#opt0' : '#ans');
}

/* ---------- gap finder ---------- */
function gapTopics(sid, n = 12) {
  const G = tcObj('gap');
  return shuffleA(testable(sid)).sort((a, b) => (G[a] ? 1 : 0) - (G[b] ? 1 : 0) || (skill(a).n ? 1 : 0) - (skill(b).n ? 1 : 0)).slice(0, n);
}
const gapLeft = sid => testable(sid).filter(id => !tcObj('gap')[id]).length;

/* ---------- grade tests ---------- */
const GT_N = 15;
const lvlFor = g => g <= 3 ? [1] : g === 4 ? [1, 2] : g === 5 ? [2] : g === 6 ? [2, 3] : [3];
function gradeQs(sid, g) {
  let ids = testable(sid);
  if (sid === 'maths') {
    const H = ids.filter(id => LEARN.TOPIC[id].tier === 'H'), F = ids.filter(id => !LEARN.TOPIC[id].tier);
    ids = g >= 6 && H.length ? [...H, ...F.filter(id => LEARN.LEVELLED.has(id))] : g <= 4 ? F.filter(id => MUST4.has(id) || LEARN.LEVELLED.has(id)) : F;
  }
  const pool = shuffleA(ids), out = [];
  for (let i = 0; out.length < GT_N && i < pool.length * 3; i++) { const q = testQ(pool[i % pool.length], pick(lvlFor(g))); if (q) out.push(q); }
  return out;
}
let GT_SEL = { sid: null, g: null };
const gtSubs = () => mySubjects().filter(s => testable(s.id).length >= 3);
function vGradeTest() {
  const subs = gtSubs(); if (!subs.length) return VIEWS.mocks();
  const sid = subs.some(s => s.id === GT_SEL.sid) ? GT_SEL.sid : subs.some(s => s.id === SUBJ_SEL) ? SUBJ_SEL : subs[0].id;
  const sn = trackSubj(sid), aim = aimOf(sn), maxG = tierFor(sn) === 'F' ? 5 : 9, g = clamp(GT_SEL.g || aim, 3, maxG), hist = tcArr('gt').filter(x => x.t === sid).slice(-6).reverse();
  return h('div', { class: 'stack narrow' },
    subHero('Mocks', 'Grade tests', 'mocks', 'Fifteen questions pitched at one grade, marked as you go. A quick way to see whether a grade is secure, and what is holding it back.', 'Mocks'),
    card('Subject', null, h('div', { class: 'chips' }, subs.map(s => chip([icon(s.icon), s.name], s.id === sid, 'gtSub', { 'data-track': s.id })))),
    card('Grade', h('span', { class: 'muted' }, `your aim: ${aim}`), h('div', { class: 'chips' }, Array.from({ length: maxG - 2 }, (_, k) => k + 3).map(v => chip(`Grade ${v}`, v === g, 'gtGrade', { 'data-g': v }))),
      h('p', { class: 'muted xs' }, maxG === 5 ? 'Foundation tier goes up to grade 5.' : 'Higher grades bring in Higher-tier topics and harder numbers.')),
    B([icon('play'), `Start the grade ${g} test`], 'gtGo', 'primary wide', { 'data-track': sid, 'data-g': g }),
    hist.length > 0 && card('Your last tries', null, h('ul', { class: 'list' }, hist.map(x => h('li', { class: 'xp-row' }, h('div', { class: 'grow' }, h('b', null, `Grade ${x.g}`), h('small', null, fmtDate(x.d))), h('div', { class: 'num' }, h('b', null, `${x.ok} / ${x.n}`), h('small', null, x.ok / x.n >= .7 ? 'secure' : x.ok / x.n >= .5 ? 'nearly' : 'building')))))),
    h('p', { class: 'muted xs center' }, 'A rough guide, not a grade: real grades come from full papers. Topics you miss go into your fix queue.'));
}
VIEWS.gtest = vGradeTest; PARENT.gtest = 'mocks'; BACKS.gtest = 'Grade tests';

/* ---------- running a test: questions in a fixed list, no hints, results at the end ---------- */
const _nextQt = nextQ;
nextQ = function (sameTopic) {
  if (DR && TESTS.has(DR.ctx)) {
    DR.msg = ''; DR.picked = null; DRAFT.dr = ''; DR.hint = 0; DR.slip = null; DR.hid = null; DR.ex = null;
    DR.q = DR.gq[DR.count] || null; DR.state = 'ask';
    if (!DR.q) finishTest();
    return;
  }
  return _nextQt(sameTopic);
};
const _recordT = record;
record = function (id, ok, key) {
  if (DR && TESTS.has(DR.ctx) && !DR.saved && DR.q && DR.q.id === id && DR.res[DR.count] == null) DR.res[DR.count] = { id, ok: !!ok };
  return _recordT(id, ok, key);
};
function finishTest() {
  if (DR.saved) return; DR.saved = true;
  const res = DR.res.filter(Boolean), d = dkey();
  if (DR.ctx === 'gap') {
    const G = tcObj('gap'); for (const r of res) G[r.id] = [r.ok ? 1 : 0, d];
    /* checklists only ever go up from here: right → at least "Nearly there"; a miss on something not started → "Learning" */
    let moved = 0;
    for (const [k, L] of Object.entries(LISTS)) L.items.forEach((it, i) => {
      const r = res.find(x => x.id === it[1]); if (!r) return; const c = S.conf[k + i] || 0;
      if (r.ok && c < 2) { S.conf[k + i] = 2; moved++; } else if (!r.ok && c === 0) { S.conf[k + i] = 1; moved++; }
    });
    DR.moved = moved;
  } else {
    tcArr('gt').push({ t: DR.track, g: DR.grade, ok: res.filter(r => r.ok).length, n: res.length, d });
    if (S.tc.gt.length > 60) S.tc.gt = S.tc.gt.slice(-60);
    const miss = [...new Set(res.filter(r => !r.ok).map(r => r.id))]; DR.added = miss.length ? addFix(miss, `Missed in a grade ${DR.grade} test`) : 0;
  }
  dayEv(DR.ctx === 'gap' ? 'gapf' : 'gtest'); xp(10); save(); SFX.play('fanfare');
}
function testResults() {
  const res = DR.res.filter(Boolean), ok = res.filter(r => r.ok), miss = [...new Set(res.filter(r => !r.ok).map(r => r.id))], sn = TRACK_NAME(DR.track);
  const missChips = miss.map(id => { const lid = lessonFor(id); return lid && !taughtOn(lid) ? chip([icon('book'), LEARN.name(id)], false, 'lsStart', { 'data-lid': lid, 'data-topic': id }) : chip([icon('play'), LEARN.name(id)], false, 'drill', { 'data-topic': id }); });
  if (DR.ctx === 'gap') {
    const left = gapLeft(DR.track), first = miss.find(id => lessonFor(id));
    return h('section', { class: 'card test-res' },
      h('div', { class: 'card-h' }, h('h2', null, `Gap finder: ${sn}`), h('span', { class: 'pill' }, `${ok.length} of ${res.length} known`)),
      h('p', null, miss.length ? `You already know ${ok.length} of these. The ${miss.length} you didn't are now first in line: your Focus sets will teach them before anything else.` : 'You knew every one of these. Check another batch to find the real gaps.'),
      ok.length > 0 && [h('h3', null, 'You know these'), h('div', { class: 'chips' }, [...new Set(ok.map(r => r.id))].map(id => chip([icon('check'), LEARN.name(id)], false, 'drill', { 'data-topic': id })))],
      miss.length > 0 && [h('h3', null, 'To learn'), h('p', { class: 'muted xs' }, 'Tap one to start its lesson.'), h('div', { class: 'chips' }, missChips)],
      DR.moved ? h('p', { class: 'muted xs' }, `${DR.moved} checklist item${DR.moved > 1 ? 's' : ''} updated from your answers. Ratings only ever go up here.`) : null,
      h('div', { class: 'row' }, first && B([icon('book'), 'Teach me the first one'], 'lsStart', 'primary', { 'data-lid': lessonFor(first), 'data-topic': first }),
        left > 0 && B(`Check ${Math.min(12, left)} more`, 'gapStart', first ? 'ghost' : 'primary', { 'data-track': DR.track }), B('Done', 'go', 'link', { 'data-tab': 'subject' })),
      h('p', { class: 'muted xs' }, left ? `${left} ${sn} topic${left > 1 ? 's' : ''} not checked yet.` : `Every ${sn} topic has now been checked.`));
  }
  const g = DR.grade, pc = res.length ? ok.length / res.length : 0;
  const [head, line] = pc >= .7 ? ['Secure at this level', `You are working at about grade ${g} on these questions.${g < 9 ? ` Try grade ${g + 1} next.` : ''}`]
    : pc >= .5 ? ['Nearly there', `A few topics to firm up for grade ${g}. They are listed below.`]
      : ['Building up', `Grade ${g} questions are a stretch right now. Work on the topics below, then try again${g > 3 ? `, or try grade ${g - 1} first` : ''}.`];
  return h('section', { class: 'card test-res' },
    h('div', { class: 'card-h' }, h('h2', null, `Grade ${g} test: ${sn}`), h('span', { class: 'pill' }, `${ok.length} / ${res.length}`)),
    h('p', { class: 'big-score' }, `${ok.length} / ${res.length}`), h('p', { class: 'fb-h' }, head), h('p', null, line),
    miss.length > 0 && [h('h3', null, 'To work on'), h('div', { class: 'chips' }, missChips)],
    DR.added ? h('p', { class: 'muted xs' }, `${DR.added} topic${DR.added > 1 ? 's' : ''} added to your fix queue, so Focus brings ${DR.added > 1 ? 'them' : 'it'} back.`) : null,
    h('div', { class: 'row' }, pc >= .7 && g < 9 && B(`Try grade ${g + 1}`, 'gtGo', 'primary', { 'data-track': DR.track, 'data-g': g + 1 }),
      B('Same grade again', 'gtGo', pc >= .7 ? 'ghost' : 'primary', { 'data-track': DR.track, 'data-g': g }), B('Done', 'go', 'link', { 'data-tab': 'gtest' })),
    h('p', { class: 'muted xs' }, 'A rough guide, not a grade: real grades come from full papers.'));
}
const _drillPanelT = drillPanel;
drillPanel = function () {
  if (!DR || !TESTS.has(DR.ctx)) return _drillPanelT();
  if (!DR.q) return testResults();
  const el = _drillPanelT();
  try {
    for (const b of el.querySelectorAll('[data-act="similar"], [data-act="drillFix"]')) b.remove();
    const rv = el.querySelector('[data-act="reveal"]'); if (rv) rv.textContent = DR.ctx === 'gap' ? "Don't know it yet" : 'Skip';
    const m = el.querySelector('.drill-meta > span:last-child'); if (m) m.textContent = `Question ${DR.count + 1} of ${DR.gq.length}`;
    if (DR.ctx === 'gap' && DR.count === 0 && DR.state === 'ask') el.prepend(h('p', { class: 'muted xs gap-note' }, "One question per topic. No guessing: if you haven't learned it yet, tap “Don't know it yet”. That's exactly what this is for."));
  } catch (e) { console.error(e); }
  return el;
};
const _vDrillT = VIEWS.drill;
VIEWS.drill = function () {
  const el = _vDrillT();
  if (DR && TESTS.has(DR.ctx)) try {
    const h1 = el.querySelector('.hero h1'); if (h1) h1.textContent = DR.ctx === 'gap' ? 'Gap finder' : `Grade ${DR.grade} test`;
    if (DR.ctx === 'grade') { const b = el.querySelector('.hero .backlink'); if (b) { b.dataset.tab = 'gtest'; b.lastChild.textContent = 'Grade tests'; } }
  } catch (e) { console.error(e); }
  return el;
};

/* ---------- exam questions by topic: the hand-written ones from every practice paper first, then a bank built from the
   app's own checked content (definitions, facts, calculations, required practicals), so a topic never runs out ---------- */
const XQ_G = { maths: 'Maths', biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', englang: 'English Language', englit: 'English Literature', geography: 'Geography', business: 'Business', re: 'RE' };
const xqLevel = m => m <= 2 ? 'Easy' : m <= 4 ? 'Medium' : 'Hard'; /* by marks, as Save My Exams sorts its questions */
const ASKS = /^(what|which|who|whom|where|why|how|name|give|state|define|describe|explain)\b|^when (did|does|do|was|were|is|are)\b/i; /* "When a cell becomes specialised…" is a description, not a question */
/* question makers for some practice topics: each call makes one fresh question in the practice papers' format */
function xqMakers(ids, label) {
  const out = [];
  for (const id of ids) {
    const T = LEARN.TOPIC[id]; if (!T || !usable(id)) continue;
    if (T.type === 'def') for (const it of LEARN.itemsOf(id)) out.push(() => [label, Math.random() < .5 ? `Define “${it.p}”.` : `What is meant by “${it.p}”?`,
      it.pts.length <= 3 ? it.pts : { any: it.pts, max: 3 }, { gen: true, key: 'd:' + it.k, def: true, model: it.a }]);
    else if (T.type === 'recall') for (const it of LEARN.itemsOf(id)) out.push(() => [label, ASKS.test(it.p) || /\?\s*$/.test(it.p) ? it.p.replace(/[?.]*\s*$/, '?') : `Complete this: ${it.p} → …`,
      [it.a], { gen: true, key: 'r:' + it.k, model: it.a }]);
    else if (T.type === 'calc') for (let k = 0; k < 6; k++) out.push(() => {
      const q0 = LEARN.gen(id, 2); if (!q0 || q0.kind === 'mcq' || !q0.steps || !q0.steps.length) return null; q0.id = id;
      const method = q0.steps.slice(0, -1).filter(s => s.length <= 140).slice(0, 2);
      return [label, q0.q, [...method.map(s => `Method: ${s}`), `Answer: ${q0.show}`], { gen: true, key: 'c:' + id, calc: q0 }];
    });
    for (const s of SEQS.filter(x => x.topic === id)) out.push(() => {
      const ask = /^Required practical: /i.test(s.title) ? `Describe how you would carry out the required practical: ${s.title.replace(/^Required practical: /i, '')}.`
        : /^How /.test(s.title) ? `Explain ${s.title.charAt(0).toLowerCase() + s.title.slice(1)}.` : `Describe the stages, in order: ${s.title}.`, m = Math.min(6, s.steps.length);
      return [label, ask, m >= s.steps.length ? s.steps : { any: s.steps, max: m }, { gen: true, key: 's:' + s.id, model: s.steps.join(' → ') }];
    });
  }
  return out;
}
function xqIndex(sid) {
  const g = XQ_G[sid]; if (!g) return [];
  const by = new Map(), row = l => { if (!by.has(l)) by.set(l, { label: l, list: [], makers: [] }); return by.get(l); };
  for (const k of Object.keys(EXAM_LINK)) if (k.startsWith(g + '|')) row(k.slice(g.length + 1)).makers = xqMakers(EXAM_LINK[k], k.slice(g.length + 1));
  for (const p of EXAMS) {
    if (p.ppp || groupOf(p) !== g || !paperFits(p)) continue;
    p.qs.forEach((q, i) => { if (qX(q).same || !q[0]) return; row(q[0]).list.push({ pid: p.id, i }); });
  }
  return [...by.values()].filter(t => t.list.length || t.makers.length);
}
const GEN_P = { id: 'gen', name: 'Built from your topics', src: null };
const xqKey = r => r.gq ? qX(r.gq).key || 'g' : `${r.pid}:${r.i}`;
let XQ = null;
const xqCur = () => { const r = XQ && XQ.list[XQ.i]; if (!r) return null; if (r.gq) return { p: GEN_P, q: r.gq, r }; const p = EXAMS.find(e => e.id === r.pid); return p ? { p, q: p.qs[r.i], r } : null; };
function xqMark(q) {
  const s = q[2], m = qMax(q), x = qX(q), list = qTicks(q).map((pt, j) => h('label', { class: 'chk' + (XQ.got[j] ? ' d' : '') }, h('input', { type: 'checkbox', checked: !!XQ.got[j], 'data-act': 'xqTick', 'data-j': j }), checkBox(), h('span', null, pt)));
  if (!s.lv) return h('div', { class: 'fb mark' }, h('p', { class: 'fb-h' }, 'Mark scheme'), XQ.auto && h('p', { class: 'muted xs' }, XQ.auto),
    x.model && x.def && h('p', null, h('b', null, 'Model answer: '), x.model),
    h('p', { class: 'muted xs' }, s.any ? `Any ${s.max === 1 ? 'one' : s.max} of these, one mark each, up to ${s.max}. Only tick what your answer clearly says.` : 'One mark per point. Only tick a point if your answer clearly makes it.'),
    list, h('p', { class: 'ex-score' }, `${qScore(q, XQ.got, -1)} / ${m}`));
  const L = s.lv, cur = XQ.lv, sel = L.findIndex(([lo, hi]) => cur >= lo && cur <= hi);
  return h('div', { class: 'fb mark' }, h('p', { class: 'fb-h' }, '1. What examiners look for'), h('p', { class: 'muted xs' }, 'Tick only what your answer actually does.'), list,
    h('p', { class: 'fb-h' }, '2. Pick the level that fits best'),
    L.map(([lo, hi, d], l) => h('button', { type: 'button', class: 'lvl' + (l === sel ? ' on' : ''), 'data-act': 'xqLevel', 'data-l': l, 'aria-pressed': String(l === sel) },
      h('span', { class: 'lvl-h' }, h('b', null, `Level ${L.length - l}`), h('small', null, lo === hi ? ` · ${lo} mark${lo > 1 ? 's' : ''}` : ` · ${lo}–${hi} marks`)), h('span', null, d))),
    sel >= 0 && L[sel][0] !== L[sel][1] && [h('p', { class: 'fb-h' }, '3. Top, middle or bottom of the level?'), h('div', { class: 'chips' }, nums(L[sel][0], L[sel][1]).map(v => chip(String(v), v === cur, 'xqMarkSet', { 'data-m': v })))],
    h('div', { class: 'row end' }, B('Nothing worth credit (0)', 'xqMarkSet', 'link', { 'data-m': 0 })),
    h('p', { class: 'ex-score' }, `${cur >= 0 ? cur : '–'} / ${m}`));
}
function vXQ() {
  const c = xqCur(); if (!c) return VIEWS.subject();
  const { p, q } = c, x = qX(q), m = qMax(q), last = XQ.i === XQ.list.length - 1, srcs = [].concat(x.src || []).filter(k => p.src && p.src[k]);
  SUBJ_SEL = XQ.sid;
  return h('div', { class: 'stack narrow' },
    subHero(TRACK_NAME(XQ.sid), XQ.label, 'subject', null, TRACK_NAME(XQ.sid)),
    h('div', { class: 'exdots', 'aria-label': `Question ${XQ.i + 1} of ${XQ.list.length}` }, XQ.list.map((_, k) => h('button', { type: 'button', class: 'exdot' + (k === XQ.i ? ' on' : '') + (XQ.res[k] ? ' done' : ''), 'data-act': 'xqGo', 'data-i': k, 'aria-label': `Question ${k + 1}` }))),
    srcs.map(k => acc(`xsrc-${p.id}-${k}`, h('b', { class: 'src-h' }, p.src[k][0]), h('div', { class: 'srcbox' }, p.src[k][1]), { open: true })),
    h('section', { class: 'card qcard exq' + (XQ.marked ? ' marked' : '') },
      h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, q[0]), h('span', null, `${m} mark${m > 1 ? 's' : ''} · ${xqLevel(m)}${x.mins ? ` · about ${x.mins} min` : ''} · ${p.name.replace(/ \(.*\)$/, '')}`)),
      h('p', { class: 'qtext' }, q[1]),
      x.calc && DEMO.picOf(x.calc) && h('div', { class: 'qpic-w' }, PIC.el(DEMO.picOf(x.calc))),
      XQ.marked ? [h('p', { class: 'yours' }, h('b', null, 'Your answer: '), XQ.ans || '(left blank)'), xqMark(q),
        h('div', { class: 'row' }, B(last ? 'Finish' : 'Next question', last ? 'xqFinish' : 'xqNext', 'primary grow', { id: 'xq-next' }))]
        : [x.calc ? h('div', { class: 'answer' }, x.calc.pre && h('span', { class: 'adorn' }, x.calc.pre), h('input', { id: 'xqans', 'data-draft': 'xq', value: DRAFT.xq || '', maxlength: 80, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', inputmode: x.calc.kind === 'num' ? 'decimal' : 'text', placeholder: 'Answer', 'aria-label': 'Your answer' }), x.calc.suf && h('span', { class: 'adorn' }, x.calc.suf))
          : h('textarea', { id: 'xqans', class: m >= 9 ? 'long' : '', rows: Math.min(14, 2 + m), 'data-draft': 'xq', value: DRAFT.xq || '', maxlength: 12000, placeholder: 'Write your answer and working, as you would on the paper', 'aria-label': 'Your answer' }),
          x.calc && x.calc.hint && h('p', { class: 'muted xs' }, x.calc.hint),
          h('div', { class: 'row' }, B('Mark it', 'xqMarkIt', 'primary grow'), !last && B('Skip', 'xqGo', 'ghost', { 'data-i': XQ.i + 1 }))]),
    h('p', { class: 'muted xs center' }, `Question ${XQ.i + 1} of ${XQ.list.length}. Mark it honestly: examiners only give a mark for what is clearly there.`));
}
VIEWS.xq = vXQ; PARENT.xq = 'learn'; BACKS.xq = 'Exam questions';
function xqSave() {
  const c = xqCur(); if (!c || !XQ.marked) return true;
  if (c.q[2].lv && XQ.lv < 0) { toast('Pick a level first'); return false; }
  const got = qScore(c.q, XQ.got, XQ.lv), max = qMax(c.q);
  tcObj('xq')[xqKey(c.r)] = [got, max, dkey()]; XQ.res[XQ.i] = [got, max]; save();
  return true;
}
function xqOpen(i) { XQ.i = clamp(i, 0, XQ.list.length - 1); XQ.marked = false; XQ.ans = ''; XQ.auto = ''; DRAFT.xq = ''; const c = xqCur(); XQ.got = qTicks(c.q).map(() => false); XQ.lv = -1; }
/* the subject page's Exam tab (app.js vSubject); the gap finder lives on its Practise tab and on Learn, grade tests in Mocks */
function xqList(s) {
  const idx = xqIndex(s.id); if (!idx.length) return null;
  const X = tcObj('xq'), total = idx.reduce((n, t) => n + t.list.length + t.makers.length, 0);
  return card('Exam questions by topic', h('span', { class: 'muted' }, `${total.toLocaleString('en-GB')}+ questions`),
    h('p', { class: 'muted xs' }, 'The hand-written questions from the practice papers come first, then a bank built from each topic, so you never run out. Answer, then mark yourself like an examiner.'),
    h('ul', { class: 'list' }, idx.map(t => {
      const done = t.list.map(r => X[xqKey(r)]).filter(Array.isArray), got = done.reduce((a, d) => a + d[0], 0), max = done.reduce((a, d) => a + d[1], 0);
      const n = t.list.length, bank = t.makers.length;
      return h('li', { class: 'xp-row' }, h('div', { class: 'grow' }, h('b', null, t.label),
        h('small', null, [n && `${n} from the papers`, bank && `${bank} more in the bank`].filter(Boolean).join(' · ') + (done.length ? ` · ${got}/${max} marks so far` : ''))),
        B(n && done.length === n ? 'More' : 'Start', 'xqStart', 'ghost sm', { 'data-track': s.id, 'data-label': t.label }));
    })));
}
/* ten questions a round: hand-written ones you have not done (or dropped marks on) first, then fresh ones from the bank */
function xqRound(t) {
  const X = tcObj('xq'), rank = r => { const d = X[xqKey(r)]; return !d ? 0 : d[0] < d[1] ? 1 : 2; };
  const written = [...t.list].sort((a, b) => rank(a) - rank(b)).filter(r => rank(r) < 2).slice(0, 10), seen = new Set(), out = [...written];
  for (const mk of shuffleA(t.makers)) { if (out.length >= Math.max(10, written.length + 4)) break; const q = mk(); if (!q) continue; const k = qX(q).key + '|' + q[1]; if (seen.has(k)) continue; seen.add(k); out.push({ gq: q }); }
  return out.length ? out : [...t.list];
}

Object.assign(ACT, {
  gapStart(el) {
    const sid = el.dataset.track || SUBJ_SEL, qs = gapTopics(sid).map(id => testQ(id, 2)).filter(Boolean);
    if (!qs.length) return toast('Nothing to check in this subject yet');
    startTest('gap', sid, qs);
  },
  gtOpen(el) { GT_SEL = { sid: el.dataset.track || null, g: null }; go('gtest'); },
  gtSub(el) { GT_SEL = { sid: el.dataset.track, g: null }; render(); },
  gtGrade(el) { GT_SEL.g = +el.dataset.g; render(); },
  gtGo(el) {
    const sid = el.dataset.track, g = +el.dataset.g, qs = gradeQs(sid, g);
    if (qs.length < 5) return toast('Not enough questions in this subject yet');
    GT_SEL = { sid, g }; startTest('grade', sid, qs, { grade: g });
  },
  xqStart(el) {
    const t = xqIndex(el.dataset.track).find(x => x.label === el.dataset.label); if (!t) return;
    const list = xqRound(t); if (!list.length) return toast('No questions for this topic yet');
    XQ = { sid: el.dataset.track, label: t.label, list, i: 0, res: [] };
    xqOpen(0); go('xq', '#xqans');
  },
  xqMarkIt() {
    if (!XQ) return; const c = xqCur(), x = qX(c.q), ans = (DRAFT.xq || '').trim();
    XQ.ans = ans; XQ.marked = true; XQ.auto = '';
    /* a right final answer earns every mark, as it does with a real examiner; otherwise give the method marks yourself */
    if (x.calc && ans) { const r = LEARN.check(x.calc, ans); if (r.valid && r.ok) { XQ.got = XQ.got.map(() => true); XQ.auto = 'Right answer: full marks.'; } else XQ.auto = `The answer is ${x.calc.show}. Tick any method marks your working earned.`; }
    else if (x.def && ans) { XQ.got = LEARN.defTicks({ points: qTicks(c.q) }, ans); XQ.auto = 'The ticks are a first guess from your words. Fix them honestly.'; }
    else if (x.gen && Array.isArray(c.q[2]) && c.q[2].length === 1 && ans && typeof fillOk === 'function' && fillOk(ans, c.q[2][0])) { XQ.got = [true]; XQ.auto = 'That matches the mark scheme.'; }
    render({ focus: '#xq-next' });
  },
  xqLevel(el) { const c = xqCur(), [lo, hi] = c.q[2].lv[+el.dataset.l]; if (!(XQ.lv >= lo && XQ.lv <= hi)) XQ.lv = Math.floor((lo + hi) / 2); render(); },
  xqMarkSet(el) { XQ.lv = +el.dataset.m; render(); },
  xqNext() { if (!xqSave()) return; xqOpen(XQ.i + 1); render({ focus: '#xqans' }); scrollTo({ top: 0 }); },
  xqGo(el) { if (XQ.marked && !xqSave()) return; xqOpen(+el.dataset.i); render({ focus: '#xqans' }); scrollTo({ top: 0 }); },
  xqFinish() {
    if (!xqSave()) return;
    const done = XQ.res.filter(Boolean), got = done.reduce((a, d) => a + d[0], 0), max = done.reduce((a, d) => a + d[1], 0);
    if (!max) { XQ = null; return go('subject'); }
    const pc = got / max, added = pc < .75 ? addFix(EXAM_LINK[`${XQ_G[XQ.sid]}|${XQ.label}`] || [], `${got}/${max} on ${XQ.label} exam questions`) : 0;
    dayEv('xq'); xp(10); save();
    toast(`${got} / ${max} marks on ${XQ.label}${added ? ` · ${added} topic${added > 1 ? 's' : ''} added to your fix queue` : ''}`, 'big');
    XQ = null; go('subject');
  }
});
CHG.xqTick = el => { if (!XQ) return; XQ.got[+el.dataset.j] = el.checked; render(); };
