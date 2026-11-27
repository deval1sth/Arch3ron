/* Archeron · Mock-day memory. Every other app asks what is due today; this asks what you will still know on the day of your
   mocks, fact by fact, and offers a short top-up of the ones that most need it.
   The memory model is FSRS-6 (the scheduler in Anki, fitted to hundreds of millions of real reviews), with its published
   default weights: forgetting follows a power curve, so memories fade fast at first and then level off, and a review gains
   most when the memory has started to fade. Stability (days until recall drops to 90%) is estimated from the app's own record
   of each fact: [times asked, times right, right in a row, last day]. It is an estimate, shown as counts of facts, never as a
   score. Loaded after check.js, whose fixed-list test runner the top-up uses. */
'use strict';
const FC_DEC = 0.1542, FC_FAC = Math.pow(0.9, -1 / FC_DEC) - 1;
const fcR = (t, s) => Math.pow(1 + FC_FAC * Math.max(0, t) / s, -FC_DEC);
/* a successful review (FSRS-6 weights 8–10, average difficulty): the gain is bigger the more the memory had faded */
const fcGain = (s, r) => s * (1 + Math.exp(1.8722) * 6 * Math.pow(s, -0.1666) * (Math.exp(0.796 * (1 - r)) - 1));
/* one right answer is about FSRS's first "good" (2.3 days); each further one in a row multiplies it about 2.5 times */
function fcStab(m) {
  if (!m[2]) return 0.4;
  const s = Math.min(365, 2.3 * Math.pow(2.5, m[2] - 1));
  return m[1] / m[0] < 0.5 ? s * 0.7 : s;
}
const FC_SOLID = 0.85, FC_SOON = 10; /* solid = at least 85% likely to come back on the day; the top-up line reviews 10 days before */
let FC_IX = null;
function fcIndex() {
  if (FC_IX) return FC_IX;
  FC_IX = new Map();
  for (const id of Object.keys(LEARN.TOPIC)) if (FACTY.has(LEARN.TOPIC[id].type)) for (const it of LEARN.itemsOf(id)) if (!FC_IX.has(it.k)) FC_IX.set(it.k, { id, it });
  return FC_IX;
}
/* every fact you have met, carried forward to mock day */
function fcFacts() {
  const D = Math.max(0, daysToMocks()), now = today(), out = [];
  for (const [k, m] of Object.entries(S.items)) {
    const x = fcIndex().get(k); if (!x || !usable(x.id) || !Array.isArray(m) || !(m[0] > 0)) continue;
    const s = fcStab(m), ago = Math.max(0, now - m[3]);
    out.push({ k, id: x.id, it: x.it, tr: LEARN.TOPIC[x.id].subject, learned: m[1] > 0, s, ago, rMock: fcR(ago + D, s) });
  }
  return out;
}
const fcSolid = f => f.learned && f.rMock >= FC_SOLID;
const fcTop = f => f.learned && f.rMock < FC_SOLID;
/* the ten that most need it: furthest faded by mock day first */
const fcPick = (facts, tr, n = 10) => facts.filter(f => fcTop(f) && (!tr || f.tr === tr)).sort((a, b) => a.rMock - b.rMock).slice(0, n);

/* ---------- the forgetting curve: facts you would recall, from today to mock day ---------- */
const SVGN = 'http://www.w3.org/2000/svg';
const sv = (tag, at, ...kids) => { const e = document.createElementNS(SVGN, tag); for (const k in at) e.setAttribute(k, at[k]); for (const c of kids) if (c || c === 0) e.append(c); return e; };
function fcCurve(facts) {
  const L = facts.filter(f => f.learned), N = L.length, D = Math.max(1, daysToMocks()), tr = D > FC_SOON + 4 ? D - FC_SOON : 0, steps = 48;
  const at = d => L.reduce((a, f) => a + fcR(f.ago + d, f.s), 0);
  /* a top-up is not always right: a fact recalled (chance r) gains stability; one missed is shown again and relearned from
     scratch (about a day). The line is the expected number either way, so it never promises more than a review delivers. */
  const rAt = L.map(f => fcR(f.ago + tr, f.s)), after = L.map((f, i) => fcGain(f.s, rAt[i]));
  const atB = d => L.reduce((a, f, i) => a + rAt[i] * fcR(d - tr, after[i]) + (1 - rAt[i]) * fcR(d - tr, 1), 0);
  const ds = Array.from({ length: steps + 1 }, (_, i) => D * i / steps), va = ds.map(at), endA = Math.round(va[steps]), endB = Math.round(atB(D));
  /* the chart shows the useful band (down to half, or lower if needed), labelled, so the fall and the lift are both visible */
  const lo = Math.min(0.5, Math.floor(Math.min(...va) / N * 10) / 10) * N;
  const W = 320, H = 156, x0 = 10, x1 = 300, y0 = 22, y1 = 128, X = d => x0 + (x1 - x0) * d / D, Y = v => y1 - (y1 - y0) * (v - lo) / (N - lo);
  const pa = ds.map((d, i) => [X(d), Y(va[i])]);
  /* the top-up line leaves the curve where the review happens and jumps up: the lift a single review gives */
  const pb = [[X(tr), Y(at(tr))], [X(tr), Y(atB(tr))], ...ds.filter(d => d > tr).map(d => [X(d), Y(atB(d))])];
  const path = pts => pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
  const txt = (x, y, s, cls, anchor = 'start') => sv('text', { x, y, class: cls, 'text-anchor': anchor }, s);
  return h('figure', { class: 'fc-fig' },
    sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'fc-svg', role: 'img', 'aria-label': `If you stopped revising today, about ${endA} of your ${N} learned facts would come back on mock day. With one top-up ${tr ? `${FC_SOON} days before` : 'today'}, about ${endB}.` },
      sv('line', { x1: x0, y1: Y(N), x2: x1, y2: Y(N), class: 'fc-grid' }), txt(x0, Y(N) - 6, `all ${N}`, 'fc-ax'),
      sv('line', { x1: x0, y1: y1, x2: x1, y2: y1, class: 'fc-base' }), txt(x0, y1 - 6, String(Math.round(lo)), 'fc-ax'),
      sv('line', { x1: x1, y1: y0 - 6, x2: x1, y2: y1, class: 'fc-mock' }),
      txt(x0, H - 8, 'Today', 'fc-ax'), txt(x1, H - 8, `Mock day · ${fmtDate(S.mock)}`, 'fc-ax', 'end'),
      sv('path', { d: path(pa), class: 'fc-a' }),
      sv('path', { d: path(pb), class: 'fc-b', pathLength: 1 }),
      tr > 0 && sv('circle', { cx: X(tr), cy: Y(atB(tr)), r: 4, class: 'fc-dot' }),
      sv('circle', { cx: x1, cy: Y(endB), r: 4.5, class: 'fc-dot' }),
      sv('circle', { cx: x1, cy: Y(endA), r: 3.5, class: 'fc-dot-a' })),
    h('figcaption', { class: 'fc-key' },
      h('span', { class: 'fc-k b' }, h('i', null), `With one top-up ${tr ? `${FC_SOON} days before` : 'today'}: about ${endB}`),
      h('span', { class: 'fc-k a' }, h('i', null), `If you stopped today: about ${endA}`)));
}

function vForecast() {
  const facts = fcFacts(), learned = facts.filter(f => f.learned), solid = learned.filter(fcSolid).length, top = learned.length - solid, D = daysToMocks();
  const head = subHero('Memory', 'Mock-day memory', 'mocks', `What you know now, carried forward to ${fmtDate(S.mock)}, fact by fact. Built on FSRS, a memory model fitted to millions of real study sessions.`, 'Mocks');
  if (learned.length < 10) return h('div', { class: 'stack narrow fc' }, head,
    card('Nothing to forecast yet', null, h('p', null, 'Answer some fact questions first: definitions, key facts and words. Once you have got ten right, this page shows which ones will still be there on mock day.'),
      h('div', { class: 'row' }, B([icon('play'), 'Practise'], 'go', 'primary', { 'data-tab': 'learn' }))));
  const pick = fcPick(facts), subs = LEARN.SUBJECTS.map(s => ({ s, L: learned.filter(f => f.tr === s.id) })).filter(x => x.L.length).map(x => ({ ...x, solid: x.L.filter(fcSolid).length })).sort((a, b) => (b.L.length - b.solid) - (a.L.length - a.solid));
  return h('div', { class: 'stack narrow fc' }, head,
    h('section', { class: 'card fc-head' },
      h('div', { class: 'fc-big' }, h('b', null, solid.toLocaleString('en-GB')), h('span', null, D > 0 ? `fact${solid === 1 ? '' : 's'} solid for mock day` : `fact${solid === 1 ? '' : 's'} solid today`)),
      top > 0 ? [h('p', null, `${top.toLocaleString('en-GB')} more ${top === 1 ? 'is' : 'are'} learned but ready for a top-up. One quick review as a memory starts to fade is what makes it last.`),
        B([icon('play'), `Top up ${pick.length} now · about ${Math.max(2, Math.round(pick.length * 0.3))} minutes`], 'fcTop', 'primary wide', { id: 'fc-go' })]
        : h('p', null, 'Everything you have learned looks solid for the day. Keep going with your Focus sets and it stays that way.')),
    D > 0 && card('Your forgetting curve', null, fcCurve(facts),
      h('p', { class: 'muted xs' }, 'Memories fade fast at first, then level off. One review close to the exam lifts them back up, which is why timing beats cramming.')),
    card('By subject', null, h('ul', { class: 'fc-subs' }, subs.map(({ s, L, solid: sd }) => h('li', null,
      h('span', { class: 'fc-sn' }, icon(s.icon), h('b', null, s.name)),
      h('span', { class: 'fc-bar', role: 'img', 'aria-label': `${sd} solid, ${L.length - sd} ready for a top-up` }, h('i', { style: `width:${sd / L.length * 100}%` })),
      h('small', null, `${sd} solid${L.length > sd ? ` · ${L.length - sd} to top up` : ''}`),
      L.length > sd ? B('Top up', 'fcTop', 'ghost sm', { 'data-track': s.id, 'aria-label': `Top up ${s.name}` }) : h('span', { class: 'fc-ok', 'aria-label': 'All solid' }, icon('check')))))),
    h('p', { class: 'muted xs center' }, 'An estimate from how you have answered, not a grade. Your Focus sets already bring facts back on their own; top-ups are extra.'));
}
VIEWS.forecast = vForecast; PARENT.forecast = 'mocks'; BACKS.forecast = 'Mock-day memory';
/* one line for the Mocks tools grid */
function fcLine() { const L = fcFacts().filter(f => f.learned); return L.length < 10 ? 'What will still be there on the day' : `${L.filter(fcSolid).length.toLocaleString('en-GB')} facts solid for mock day`; }

/* ---------- the top-up: a fixed list run by check.js's test runner ---------- */
TESTS.add('topup'); TEST_CTX.add('topup');
const _finishTestF = finishTest;
finishTest = function () {
  if (DR.ctx !== 'topup') return _finishTestF();
  if (DR.saved) return; DR.saved = true;
  dayEv('topup'); xp(5); save(); SFX.play('fanfare');
};
const _testResultsF = testResults;
testResults = function () {
  if (DR.ctx !== 'topup') return _testResultsF();
  const res = DR.res.filter(Boolean), ok = res.filter(r => r.ok).length, miss = res.length - ok, more = fcPick(fcFacts(), DR.fcTrack).length;
  return h('section', { class: 'card test-res', id: 'fc-res', tabindex: '-1' },
    h('div', { class: 'card-h' }, h('h2', null, 'Top-up done'), h('span', { class: 'pill' }, `${ok} of ${res.length} still there`)),
    ok > 0 && h('p', null, `${ok === res.length ? 'All of them came back.' : `${ok} came back.`} They are stronger now: a review just as a memory starts to fade is the one that makes it last.`),
    miss > 0 && h('p', null, `The ${miss === 1 ? 'one that had' : `${miss} that had`} slipped ${miss === 1 ? 'comes' : 'come'} back in your sets from tomorrow, so ${miss === 1 ? 'it gets' : 'they get'} learned again.`),
    h('div', { class: 'row' }, more > 0 && B([icon('play'), `Top up ${Math.min(10, more)} more`], 'fcTop', 'primary', { 'data-track': DR.fcTrack || '' }), B('Back to mock-day memory', 'go', more > 0 ? 'link' : 'primary', { 'data-tab': 'forecast' })));
};
const _vDrillF = VIEWS.drill;
VIEWS.drill = function () {
  const el = _vDrillF();
  if (DR && DR.ctx === 'topup') try {
    const h1 = el.querySelector('.hero h1'); if (h1) h1.textContent = 'Top-up';
    const b = el.querySelector('.hero .backlink'); if (b) { b.dataset.tab = 'forecast'; b.lastChild.textContent = 'Mock-day memory'; }
  } catch (e) { console.error(e); }
  return el;
};
Object.assign(ACT, {
  fcTop(el) {
    const tr = el.dataset.track || null, list = fcPick(fcFacts(), tr);
    if (!list.length) return toast('Nothing needs a top-up right now');
    const qs = list.map(f => { const q = f.it.q(); return q && withId(q, f.id); }).filter(Boolean);
    if (!qs.length) return toast('Nothing needs a top-up right now');
    startTest('topup', tr || LEARN.trackOf(qs[0].id), qs, { fcTrack: tr });
  }
});
/* Stats gets the headline, under the period tiles */
const _vNumbersF = VIEWS.numbers;
VIEWS.numbers = function () {
  const el = _vNumbersF(), L = fcFacts().filter(f => f.learned);
  if (L.length >= 10) try {
    const solid = L.filter(fcSolid).length, c = h('button', { type: 'button', class: 'card rescue-cta fc-cta', 'data-act': 'go', 'data-tab': 'forecast' },
      h('span', { class: 'wc-ic' }, icon('curve')), h('span', { class: 'grow' }, h('b', null, 'Mock-day memory'), h('small', null, `${solid.toLocaleString('en-GB')} of your ${L.length.toLocaleString('en-GB')} learned facts are solid for ${fmtDate(S.mock)}.`)), h('span', { class: 'btn ghost sm' }, 'Open'));
    const head = el.querySelector('.st-head'); if (head) head.after(c);
  } catch (e) { console.error(e); }
  return el;
};

/* ---------- the review log: every answer the app marked itself, so the memory model can be fitted to this student ----------
   One entry per answer: "key,day,right,type,hints,secs" (day = days since 1970, right = 1 or 0, type = question kind,
   hints = hints used, plus "n" if the topic notes were opened first (11.9.54+), secs = time from the question appearing to the answer, capped at 900; entries before 11.9.51 stop
   after "right"). Calculation topics have no per-fact key, so they log as "T:topic". Two more kinds of line record study
   before testing, to measure how much reading helps: "c:key,day" (a new-fact card shown) and "l:lesson,day" (a lesson
   started). Written definitions are left out, because you tick your own key points there, and a calibration is only as
   honest as its data. About 25 bytes an answer; save() drops the oldest half if storage ever fills. */
const RLOG_MAX = 30000;
const rlogPush = line => { const L = tcArr('rlog'); L.push(line); if (L.length > RLOG_MAX) L.splice(0, L.length - RLOG_MAX); };
/* 11.9.67 (Runo asked for fuller data) adds eight fields after secs:
   ctx   where it was asked: focus, lesson, daily, gap, grade, sess, guide, learn, paper (generated paper), drill
   why   new (first time), due (a review that was due), early (seen again before due), retry (back after a miss), fix (fix queue)
   lvl   question level 1-3 for levelled topics
   hour  hour of the day, 0-23
   think seconds from the question appearing to the first key typed (typed answers only)
   away  seconds the tab was hidden while the question was open
   shown "s" when Show me was pressed (logged as not right, but it is not a wrong answer)
   ans   what was given when wrong: the typed text, the picked option, or the order as 2-1-3 (commas become ;, max 40 chars)
   Paper marks, one line a question: "p:paper:question,day,got,max,topic,timed" (real-format papers) and
   "p:xq:subject:label:question,day,got,max" (exam questions rounds). */
const RLX = { ctx: '', ans: null, shown: false };
const rlClean = s => String(s == null ? '' : s).replace(/[,\r\n]+/g, ';').trim().slice(0, 40);
const rlWhy = (q, id, key) => {
  if (q && q.back) return 'retry';
  if (DR && DR.track === 'fix') return 'fix';
  if (!key) return id && LEARN.TOPIC[id] && !skill(id).n ? 'new' : '';
  const m = S.items[key]; if (!m) return 'new';
  const T = LEARN.TUNE, gap = today() - m[3] - (m[2] > 0 ? T.grow ** (m[2] - 1) : T.miss); /* the same rule as learn.js choose() */
  return gap >= 0 ? 'due' : 'early';
};
const rlogMeta = (id, key, ok) => {
  const q = DR && DR.q && (DR.q.id === id || (key && DR.q.key === key)) ? DR.q : null;
  const lvl = id && LEARN.LEVELLED.has(id) ? levelOf(id) : '', hour = new Date().getHours(), shown = RLX.shown ? 's' : '';
  if (!q) return `,,,${RLX.ctx},${rlWhy(null, id, key)},${lvl},${hour},,,${shown},${ok || shown || RLX.ans == null ? '' : rlClean(RLX.ans)}`;
  const mine = DR.tq === q, secs = mine && DR.t0 ? Math.min(900, Math.round((Date.now() - DR.t0) / 1000)) : '';
  const think = mine && DR.tk1 && DR.t0 ? Math.min(900, Math.round((DR.tk1 - DR.t0) / 1000)) : '', away = mine && DR.away ? Math.round(DR.away / 1000) : '';
  const ans = ok || shown ? '' : rlClean(q.kind === 'mcq' ? (DR.picked != null && q.options ? q.options[DR.picked] : '') : q.kind === 'order' ? (DR.ord || []).map(i => i + 1).join('-') : q.kind === 'match' ? '' : DRAFT.dr);
  return `${q.kind || ''},${DR.hint || 0}${DR.notesQ === q ? 'n' : ''},${secs},${RLX.ctx || DR.ctx || 'drill'},${rlWhy(q, id, key)},${lvl},${hour},${think},${away},${shown},${ans}`; /* "1n" = 1 hint, topic notes read first */
};
/* Practice time (11.9.69, Runo asked): time spent answering outside Focus sets and papers, so Stats' "focused" counts it.
   Kept per day in ev.pms (seconds): each answer's secs minus time away, at most 5 minutes an answer. Not counted: Focus
   sets and sessions (their set time counts already) and papers (counted per paper). Log lines before 11.9.67 and lessons
   do not say whether they were inside a Focus set, so the one-off backfill counts those only on days with no sets. */
const PM_SKIP = new Set(['focus', 'sess', 'paper']);
const pmSecs = line => {
  const f = String(line).split(','), s = +f[5], ctx = f[6] || '';
  if (/^[clp]:/.test(f[0]) || !f[5] || !(s > 0) || PM_SKIP.has(ctx)) return null;
  return { day: +f[1], secs: Math.max(0, Math.min(300, s) - (+f[11] || 0)), sure: !!ctx && ctx !== 'lesson' };
};
const pmAdd = line => {
  const r = pmSecs(line); if (!r || !r.secs || (T && T.run && T.mode === 'focus')) return;
  const d = ensureDay(dkey()); d.ev = d.ev || {}; d.ev.pms = (d.ev.pms || 0) + r.secs;
};
(function pmBackfill() {
  const t = TCD(); if (t.pmb) return;
  for (const line of tcArr('rlog')) {
    const r = pmSecs(line); if (!r || !r.secs || !(r.day > 0)) continue;
    const g = dkey(new Date(r.day * 864e5)), k = [g, addDays(-1, g), addDays(1, g)].find(x => dayNum(x) === r.day); /* dayNum counts from midday, so check */
    if (!k || (!r.sure && setsOn(k) > 0)) continue;
    const d = ensureDay(k); d.ev = d.ev || {}; d.ev.pms = (d.ev.pms || 0) + r.secs;
  }
  t.pmb = 1;
})();
const _recordF = record;
record = function (id, ok, key) {
  const self = DR && DR.q && DR.q.key === key && DR.q.kind === 'def';
  if (!self && (key || (id && LEARN.TOPIC[id]))) { const line = `${key || 'T:' + id},${today()},${ok ? 1 : 0},${rlogMeta(id, key, ok)}`; rlogPush(line); pmAdd(line); }
  /* today's missed topics by name, for the Rival page (rival.js): { d: day, t: { id: [name, subject, misses, firstMissMs] } } */
  if (!ok && id && LEARN.TOPIC[id]) {
    const M = tcObj('miss'), d = dkey();
    if (M.d !== d || !M.t || typeof M.t !== 'object') { M.d = d; M.t = {}; }
    if (M.t[id]) M.t[id][2]++; else if (Object.keys(M.t).length < 40) M.t[id] = [LEARN.name(id), LEARN.TOPIC[id].subject, 1, Date.now()];
    /* every topic missed in the last weeks, for "mistake revenge" on the Rival page */
    const ML = tcObj('mlog'); ML[id] = [LEARN.name(id), LEARN.TOPIC[id].subject, d];
    const ids = Object.keys(ML); if (ids.length > 80) delete ML[ids.sort((a, b) => (ML[a][2] < ML[b][2] ? -1 : 1))[0]];
  }
  /* answers per hour of the day, last 21 days, for the Rival page's "when you study" strip */
  if (id && LEARN.TOPIC[id]) {
    const HR = tcObj('hrs'), d = dkey();
    if (!Array.isArray(HR[d]) || HR[d].length !== 24) HR[d] = new Array(24).fill(0);
    HR[d][new Date().getHours()]++;
    const ks = Object.keys(HR).sort(); while (ks.length > 21) delete HR[ks.shift()];
    /* every topic you practise, with the day you first did it: Onur's own topic list grows from these */
    const TN = tcObj('tn'); if (!TN[id] && Object.keys(TN).length < 800) TN[id] = [LEARN.name(id), LEARN.TOPIC[id].subject, d];
    /* topics missed on each of the last 21 days, so Onur's past days replay exactly the same after midnight */
    if (!ok) {
      const MD = tcObj('missd'); if (!MD[d] || typeof MD[d] !== 'object') MD[d] = {};
      if (!MD[d][id]) MD[d][id] = Date.now();
      const mk = Object.keys(MD).sort(); while (mk.length > 21) delete MD[mk.shift()];
    }
  }
  return _recordF(id, ok, key);
};
/* the clock for "secs" starts when a question first appears */
const _drillPanelF = drillPanel;
drillPanel = function () { if (DR && DR.q && DR.state === 'ask' && DR.tq !== DR.q) { DR.tq = DR.q; DR.t0 = Date.now(); DR.tk1 = 0; DR.away = 0; DR.awayAt = 0; } return _drillPanelF(); };
/* think: the first key typed into the answer box; away: time the tab was hidden while a question was open */
document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.draft === 'dr' && DR && DR.q && DR.tq === DR.q && DR.state === 'ask' && !DR.tk1) DR.tk1 = Date.now(); });
document.addEventListener('visibilitychange', () => {
  if (!DR || !DR.q || DR.tq !== DR.q || DR.state !== 'ask') return;
  if (document.hidden) DR.awayAt = Date.now(); else if (DR.awayAt) { DR.away = (DR.away || 0) + Date.now() - DR.awayAt; DR.awayAt = 0; }
});
/* Show me, and answers marked at the end of a generated paper */
const _revealF = ACT.reveal;
ACT.reveal = function (...a) { RLX.shown = true; try { return _revealF.apply(this, a); } finally { RLX.shown = false; } };
const _mpFinishF = ACT.mpFinish;
ACT.mpFinish = function (...a) { RLX.ctx = 'paper'; try { return _mpFinishF.apply(this, a); } finally { RLX.ctx = ''; RLX.ans = null; } };
/* exam questions rounds: one line per marked question when the round is finished */
const _xqFinishF = ACT.xqFinish;
ACT.xqFinish = function (...a) {
  const X = XQ, r = _xqFinishF.apply(this, a);
  if (X && XQ !== X) (X.res || []).forEach((d, i) => { if (d) rlogPush(`p:xq:${String(X.sid + ':' + X.label).replace(/[,\r\n]+/g, ';')}:${i + 1},${today()},${d[0]},${d[1]}`); });
  return r;
};
/* study before testing: a new-fact card, a lesson */
const _ltGoF = ltGo; /* reached by the Got it button (ACT.ltGo) and by Enter (teach.js ACT.next calls ltGo()) */
ltGo = function () { if (DR && DR.state === 'learn' && DR.q) rlogPush(`c:${DR.q.key || DR.q.id},${today()}`); return _ltGoF(); };
ACT.ltGo = ltGo;
const _lessonStartF = lessonStart;
lessonStart = function (lid, ...a) { const ok = _lessonStartF(lid, ...a); if (ok) rlogPush(`l:${lid},${today()}`); return ok; };
/* reviews that can teach the model something: a fact seen again on a later day (cards, lessons and calculation topics don't count) */
function rlogUseful() {
  const last = {}; let n = 0;
  for (const e of tcArr('rlog')) { const [k, d] = e.split(','); if (k.includes(':')) continue; if (last[k] != null && +d > last[k]) n++; last[k] = +d; }
  return n;
}
function rlogCard() {
  const all = tcArr('rlog').length, use = rlogUseful(), need = 300;
  return card('Memory calibration', h('span', { class: 'muted' }, `${all.toLocaleString('en-GB')} answer${all === 1 ? '' : 's'} logged`),
    h('p', { class: 'muted xs' }, 'Archeron records every answer it marks itself (not the ones you mark yourself), so the memory model can be fitted to how you forget. It stays on this device until you export it.'),
    h('p', { class: 'muted xs' }, use >= need ? `${use} repeat reviews: enough for a first calibration.` : `${use} of about ${need} repeat reviews needed for a first calibration. Facts seen again on a later day count.`),
    h('div', { class: 'row' }, B([icon('download'), 'Export review log'], 'rlogExport', 'ghost', { disabled: !all })));
}
ACT.rlogExport = () => {
  const L = tcArr('rlog'); if (!L.length) return;
  const data = { app: 'archeron', kind: 'review-log', v: 3, exported: dkey(), mock: S.mock, fields: 'key,day,right,type,hints (n = topic notes read first),secs,ctx,why (new/due/early/retry/fix),lvl,hour,think (secs to first key),away (secs tab hidden),shown (s = Show me),ans (what was given when wrong) - entries before 11.9.67 stop after secs, before 11.9.51 after right; c:key,day = fact card shown; l:lesson,day = lesson started; T:topic = calculation topic; p:paper:question,day,got,max,topic,timed and p:xq:subject:label:question,day,got,max = paper marks', reviews: L };
  const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' })), download: `archeron-reviews-${dkey()}.json` });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(`${L.length.toLocaleString('en-GB')} answers exported`);
};
