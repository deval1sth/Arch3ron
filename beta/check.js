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

/* ---------- exam questions sorted by topic, from every practice paper, with the mark scheme ---------- */
const XQ_G = { maths: 'Maths', biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', englang: 'English Language', englit: 'English Literature', geography: 'Geography', business: 'Business', re: 'RE' };
function xqIndex(sid) {
  const g = XQ_G[sid]; if (!g) return [];
  const by = new Map();
  for (const p of EXAMS) {
    if (p.ppp || groupOf(p) !== g || !paperFits(p)) continue;
    p.qs.forEach((q, i) => { if (qX(q).same || !q[0]) return; if (!by.has(q[0])) by.set(q[0], []); by.get(q[0]).push({ pid: p.id, i }); });
  }
  return [...by.entries()].map(([label, list]) => ({ label, list }));
}
const xqKey = r => `${r.pid}:${r.i}`;
let XQ = null;
const xqCur = () => { const r = XQ && XQ.list[XQ.i], p = r && EXAMS.find(e => e.id === r.pid); return p ? { p, q: p.qs[r.i], r } : null; };
function xqMark(q) {
  const s = q[2], m = qMax(q), list = qTicks(q).map((pt, j) => h('label', { class: 'chk' + (XQ.got[j] ? ' d' : '') }, h('input', { type: 'checkbox', checked: !!XQ.got[j], 'data-act': 'xqTick', 'data-j': j }), checkBox(), h('span', null, pt)));
  if (!s.lv) return h('div', { class: 'fb mark' }, h('p', { class: 'fb-h' }, 'Mark scheme'),
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
      h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, q[0]), h('span', null, `${m} mark${m > 1 ? 's' : ''}${x.mins ? ` · about ${x.mins} min` : ''} · ${p.name.replace(/ \(.*\)$/, '')}`)),
      h('p', { class: 'qtext' }, q[1]),
      XQ.marked ? [h('p', { class: 'yours' }, h('b', null, 'Your answer: '), XQ.ans || '(left blank)'), xqMark(q),
        h('div', { class: 'row' }, B(last ? 'Finish' : 'Next question', last ? 'xqFinish' : 'xqNext', 'primary grow', { id: 'xq-next' }))]
        : [h('textarea', { id: 'xqans', class: m >= 9 ? 'long' : '', rows: Math.min(14, 2 + m), 'data-draft': 'xq', value: DRAFT.xq || '', maxlength: 12000, placeholder: 'Write your answer and working, as you would on the paper', 'aria-label': 'Your answer' }),
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
function xqOpen(i) { XQ.i = clamp(i, 0, XQ.list.length - 1); XQ.marked = false; XQ.ans = ''; DRAFT.xq = ''; const c = xqCur(); XQ.got = qTicks(c.q).map(() => false); XQ.lv = -1; }
function xqCard(s) {
  const idx = xqIndex(s.id); if (!idx.length) return null;
  const X = tcObj('xq'), total = idx.reduce((n, t) => n + t.list.length, 0);
  return acc('xq-' + s.id, [h('h2', null, 'Exam questions by topic'), h('span', { class: 'muted acc-r' }, `${total} questions`)],
    h('div', null, h('p', { class: 'muted xs' }, 'Exam-style questions from every practice paper, sorted by topic. Answer, then mark yourself against the mark scheme like an examiner.'),
      h('ul', { class: 'list' }, idx.map(t => {
        const done = t.list.map(r => X[xqKey(r)]).filter(Array.isArray), got = done.reduce((a, d) => a + d[0], 0), max = done.reduce((a, d) => a + d[1], 0);
        return h('li', { class: 'xp-row' }, h('div', { class: 'grow' }, h('b', null, t.label), h('small', null, `${t.list.length} question${t.list.length > 1 ? 's' : ''}${done.length ? ` · ${got}/${max} marks on the ${done.length} done` : ''}`)),
          B(done.length === t.list.length ? 'Again' : 'Start', 'xqStart', 'ghost sm', { 'data-track': s.id, 'data-label': t.label }));
      }))), { open: false });
}

/* ---------- where these show up ---------- */
const _vSubjectC = VIEWS.subject;
VIEWS.subject = function () {
  const el = _vSubjectC(), s = SUBJ_BY[SUBJ_SEL] || mySubjects()[0];
  try {
    const row = el.children[1];
    if (row && testable(s.id).length >= 3) row.append(B([icon('target'), 'Gap finder'], 'gapStart', 'ghost', { 'data-track': s.id }), B([icon('trophy'), 'Grade test'], 'gtOpen', 'ghost', { 'data-track': s.id }));
    const xc = xqCard(s), lastCard = el.lastElementChild; if (xc && lastCard) lastCard.before(xc);
  } catch (e) { console.error(e); }
  return el;
};
const _vMocksC = VIEWS.mocks;
VIEWS.mocks = function () {
  const el = _vMocksC();
  try {
    const subs = gtSubs(), last = tcArr('gt').slice(-1)[0], anchor = el.children[1];
    if (subs.length && anchor) anchor.after(card('Grade tests', last ? h('span', { class: 'muted' }, `last: grade ${last.g}, ${last.ok}/${last.n}`) : h('span', { class: 'pill' }, 'new'),
      h('p', { class: 'muted xs' }, 'Fifteen questions pitched at one grade, about 15 minutes. See whether a grade is secure and exactly what is holding it back.'),
      h('div', { class: 'chips' }, subs.map(s => chip([icon(s.icon), s.name], false, 'gtOpen', { 'data-track': s.id })))));
  } catch (e) { console.error(e); }
  return el;
};
const _vLearnC = VIEWS.learn;
VIEWS.learn = function () {
  const el = _vLearnC();
  try {
    const subs = mySubjects().filter(s => testable(s.id).length >= 3), after = el.querySelector('.sgrid');
    if (subs.length && after) after.after(card('Find your gaps', h('span', { class: 'muted' }, 'about 8 minutes'),
      h('p', { class: 'muted xs' }, 'One quick question per topic. What you know gets ticked off; what you don\'t gets taught first in your Focus sets.'),
      h('div', { class: 'chips' }, subs.map(s => { const left = gapLeft(s.id); return chip([icon(s.icon), s.name, left ? null : h('span', { class: 'n' }, '✓')], false, 'gapStart', { 'data-track': s.id }); }))));
  } catch (e) { console.error(e); }
  return el;
};

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
    const X = tcObj('xq'), rank = r => { const d = X[xqKey(r)]; return !d ? 0 : d[0] < d[1] ? 1 : 2; };
    XQ = { sid: el.dataset.track, label: t.label, list: [...t.list].sort((a, b) => rank(a) - rank(b)), i: 0, res: [] };
    xqOpen(0); go('xq', '#xqans');
  },
  xqMarkIt() { if (!XQ) return; XQ.ans = (DRAFT.xq || '').trim(); XQ.marked = true; render({ focus: '#xq-next' }); },
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
render();
