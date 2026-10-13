/* Archeron · mock hall (timed papers), "Do this now", grade predictor, weekly review.
   Loaded before app.js; everything here runs at render or click time, so it can use app.js and study.js helpers. */
'use strict';

/* ---------- Grade boundaries ---------- */
/* Rough AQA boundaries as % of total marks, best grade first. shortcut: one table per tier from recent years; boundaries move every year. */
const BOUNDS = {
  maths: [[5, 73], [4, 55], [3, 38], [2, 24], [1, 11]], /* Foundation Maths, capped at 5 */
  sci: [[5, 62], [4, 48], [3, 33], [2, 20], [1, 9]], /* Combined Science Foundation, per grade */
  open: [[9, 80], [8, 72], [7, 63], [6, 55], [5, 47], [4, 38], [3, 28], [2, 18], [1, 9]] };
const boundsOf = subj => subj === 'Maths' ? BOUNDS.maths : subj === 'Science' ? BOUNDS.sci : BOUNDS.open;
const gradeFor = (subj, pc) => (boundsOf(subj).find(([, p]) => pc >= p) || ['U'])[0];
const boundFor = (subj, g) => { const b = boundsOf(subj), x = b.find(([gg]) => gg <= g); return x ? x[1] : b[0][1]; };
function predict(subj) {
  const all = subjPts(subj), pts = all.slice(-3);
  if (!pts.length) return null;
  const pc = Math.round(pts.reduce((a, s) => a + pctOf(s), 0) / pts.length), nx = boundsOf(subj).slice().reverse().find(([, p]) => p > pc);
  const last = all.length >= 2 ? pctOf(all[all.length - 1]) - pctOf(all[all.length - 2]) : null;
  return { pc, g: gradeFor(subj, pc), n: all.length, used: pts.length, next: nx && { g: nx[0], need: nx[1] - pc }, last };
}
const aimOf = subj => Math.round(gradeNum(subjGap(subj).tgtS) || 4);

/* A track from 0 to 100% with a tick at every grade boundary, your score and your aim */
function ladder(subj, pc, aim) {
  const B = boundsOf(subj), aimP = aim ? boundFor(subj, aim) : null;
  return h('div', { class: 'ladder', role: 'img', 'aria-label': `${pc}%, grade ${gradeFor(subj, pc)}${aim ? `; aim is grade ${aim} at about ${aimP}%` : ''}` },
    h('div', { class: 'ld-trk' }, h('i', { class: 'ld-fill', style: `width:${pc}%` })),
    B.map(([g, p]) => h('span', { class: 'ld-tk' + (g === aim ? ' aim' : '') + (pc >= p ? ' got' : ''), style: `left:${p}%` }, h('em', null, String(g)))),
    h('span', { class: 'ld-me', style: `left:${pc}%` }),
    aimP != null && h('span', { class: 'ld-flag', style: `left:${aimP}%` }, 'aim'));
}
const medal = (g, cls = '') => h('span', { class: 'medal ' + cls }, h('b', null, String(g)), h('small', null, 'grade'));

function predictCard() {
  const rows = SUBJ.map(s => ({ s, p: predict(s), aim: aimOf(s) })), have = rows.filter(r => r.p), none = rows.filter(r => !r.p);
  const onTrack = have.filter(r => typeof r.p.g === 'number' && r.p.g >= r.aim).length, days = daysToMocks();
  return h('section', { class: 'card predict' },
    h('div', { class: 'card-h' }, h('h2', null, 'Predicted grades'), h('span', { class: 'pill' }, days > 0 ? `mocks in ${days} days` : 'mock season')),
    have.length ? h('p', { class: 'muted xs' }, `On track for your aim in ${onTrack} of ${have.length} subject${have.length > 1 ? 's' : ''} you have tested. Each prediction uses your last 3 papers.`)
      : h('p', { class: 'muted' }, 'Sit a timed mock and your predicted grade appears here, with how far you are from your aim.'),
    have.map(({ s, p, aim }) => h('div', { class: 'pr-row' + (typeof p.g === 'number' && p.g >= aim ? ' ok' : '') },
      h('div', { class: 'pr-h' },
        h('div', { class: 'grow' }, h('b', null, s), h('small', null, `${p.pc}% average`,
          p.last != null && h('span', { class: 'trend ' + (p.last >= 0 ? 'up' : 'down') }, ` ${p.last >= 0 ? '▲' : '▼'} ${Math.abs(p.last)}% last paper`))),
        medal(p.g, typeof p.g === 'number' && p.g >= aim ? 'won' : '')),
      ladder(s, p.pc, aim),
      h('p', { class: 'pr-f muted xs' }, p.next ? `${p.next.need}% more gets you a ${p.next.g}.` : 'Top grade on this tier.',
        p.n < 3 ? ` Based on ${p.n} paper${p.n > 1 ? 's' : ''}; ${3 - p.n} more makes it reliable.` : ''))),
    none.length > 0 && h('div', { class: 'pr-none' }, h('p', { class: 'muted xs' }, have.length ? 'Not tested yet. Tap one to sit a timed mock:' : 'Tap a subject to sit your first timed mock:'),
      h('div', { class: 'chips' }, none.map(r => EXAMS.some(e => e.subj === r.s) && chip([icon('flame'), r.s], false, 'mockGo', { 'data-subj': r.s })))),
    h('p', { class: 'muted xs' }, 'A rough guide: it uses recent AQA grade boundaries, which change every year. Maths and Science are Foundation tier, so 5 is the top grade.'));
}

/* ---------- Mock hall: timed papers under exam conditions ---------- */
let MOCK_PID = null, MOCK_PREV = null;
const isCalc = p => /calculator/i.test(p.name) && !/non-calculator/i.test(p.name);
function vMockStart() {
  const p = paperOf(MOCK_PID);
  if (!p) return vExam();
  const rules = [['Phone on Do Not Disturb, face down, out of reach', 'moon'], ['Pen, pencil and paper ready. Write your working on paper', 'edit'],
    [p.subj === 'Maths' ? (isCalc(p) ? 'Calculator allowed on this paper' : 'No calculator on this paper') : 'No notes, no revision guides open', 'shield'],
    ['If you get stuck, move on and come back. Do not leave anything blank', 'bolt']];
  const tried = subjPts(p.subj).filter(x => x.paper.startsWith(p.name));
  return h('div', { class: 'stack narrow' },
    subHero('Mock hall', p.name, 'exam', null, 'Exam practice'),
    h('section', { class: 'card mockgate' },
      h('div', { class: 'mg-time' }, h('b', null, String(p.mins)), h('span', null, 'minutes')),
      h('div', { class: 'mg-facts' }, h('span', null, `${p.qs.length} questions`), h('span', null, `${marksOf(p)} marks`), h('span', null, tried.length ? `best so far ${Math.max(...tried.map(pctOf))}%` : 'first attempt')),
      h('p', { class: 'muted xs center' }, `Grade ${aimOf(p.subj)} (your aim) needs about ${boundFor(p.subj, aimOf(p.subj))}% on a real paper.`)),
    card('Before you turn over', null, h('ul', { class: 'rules' }, rules.map(([t, ic]) => h('li', null, icon(ic), h('span', null, t))))),
    h('div', { class: 'row center' }, B([icon('play'), 'Turn over the paper'], 'mockBegin', 'primary wide')),
    h('p', { class: 'muted xs center' }, 'The clock keeps running if you leave the app, just like the real exam. When time is up, writing locks and you mark what you have.'));
}
const mockLeftS = E => Math.round((E.end - Date.now()) / 1000);
function mockBar() {
  const E = S.exam; if (!E || !E.end) return null;
  return h('div', { id: 'mockbar', class: 'mockbar' }, h('div', { class: 'mb-row' }, h('span', { class: 'mb-l' }, icon('flame'), 'Mock'), h('b', { class: 'mb-t', role: 'timer' }, ''), h('span', { class: 'mb-r muted xs' }, '')),
    h('div', { class: 'mb-trk' }, h('i')), (setTimeout(paintMock), null));
}
function paintMock() {
  const E = S.exam, el = document.getElementById('mockbar');
  if (!E || !E.end) { MOCK_PREV = null; return; }
  const left = mockLeftS(E), p = paperOf(E.pid), tot = p.mins * 60;
  const hit = MOCK_PREV == null ? null : [[0, 'Pens down. Time is up.'], [300, '5 minutes left. Finish the question you are on.'], [600, '10 minutes left. Start checking your answers.']].find(([th]) => MOCK_PREV > th && left <= th); /* most urgent only */
  if (hit) { beep(); toast(hit[1], hit[0] ? '' : 'big'); if (!hit[0] && TAB === 'examq') render(); }
  MOCK_PREV = left;
  if (!el) return;
  const s = Math.max(0, left);
  el.className = 'mockbar' + (left <= 0 ? ' over' : left <= 300 ? ' crit' : left <= 600 ? ' low' : '');
  el.querySelector('.mb-t').textContent = left > 0 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : 'Time is up';
  el.querySelector('.mb-r').textContent = left > 0 ? `of ${p.mins} min` : 'mark what you wrote';
  el.querySelector('.mb-trk i').style.width = `${Math.max(0, Math.min(100, left / tot * 100))}%`;
}
setInterval(paintMock, 1000);
const mockOver = () => !!(S.exam && S.exam.end && Date.now() > S.exam.end);

/* The report after a paper: grade medal, the ladder, time used */
function examReport(R) {
  const pc = Math.round(R.got / R.max * 100), g = gradeFor(R.subj, pc), aim = aimOf(R.subj);
  return h('section', { class: 'card report' },
    h('div', { class: 'rp-top' }, medal(g, typeof g === 'number' && g >= aim ? 'won big' : 'big'),
      h('div', { class: 'grow' }, h('p', { class: 'eyebrow' }, R.timed ? 'Mock result' : 'Paper marked'), h('h2', null, `${R.got} / ${R.max} · ${pc}%`), h('p', { class: 'muted xs' }, R.name))),
    ladder(R.subj, pc, aim),
    h('p', { class: 'muted xs' }, typeof g === 'number' && g >= aim ? `At or above your aim of grade ${aim}. Now make it consistent.` : `Grade ${aim} needs about ${boundFor(R.subj, aim)}%: ${Math.max(0, boundFor(R.subj, aim) - pc)}% more. The weakest topics below are where to find it.`),
    R.timed && h('div', { class: 'tiles' }, h('div', { class: 'tile' }, h('b', null, `${R.used}`), h('span', null, 'minutes used'), h('small', null, `of ${R.mins} allowed`)),
      h('div', { class: 'tile' }, h('b', null, (R.used / Math.max(1, R.marked)).toFixed(1)), h('span', null, 'minutes a question'), h('small', null, 'your pace')), h('div', { class: 'tile' }, h('b', null, `${R.marked}`), h('span', null, 'questions marked'), h('small', null, `of ${R.total}`))),
    h('ul', { class: 'hbars' }, R.tp.slice().sort((a, b) => a.got / a.max - b.got / b.max).map(t => h('li', null, h('div', { class: 'hb-l' }, h('b', null, t.topic)),
      h('div', { class: 'hb-b' }, h('i', { style: `width:${t.got / t.max * 100}%;background:var(--y)` }), h('span', null, `${t.got}/${t.max}`))))),
    h('p', { class: 'muted xs' }, 'Lost marks are in Past papers → Marks to win back, and weak topics are in your fix queue.'),
    h('div', { class: 'row' }, B('See the chart', 'go', 'ghost', { 'data-tab': 'papers' }), B('Close', 'exClose', 'link')));
}

/* ---------- Do this now ---------- */
let DN_I = 0;
function doNow() {
  const a = activeSession();
  if (a) {
    const bi = a.blocks.findIndex(b => b.steps.some(x => !x.d)), b = a.blocks[bi], st = b.steps.find(x => !x.d), s = SUBJ_BY[b.sid];
    return h('section', { class: 'card donow' },
      h('div', { class: 'dn-top' }, h('p', { class: 'eyebrow' }, 'Do this now'), h('span', { class: 'pill' }, `${sessDone(a)} / ${sessSteps(a)} steps`)),
      h('div', { class: 'dn-main' }, h('span', { class: 'dn-ic' }, icon(s.icon)), h('div', null, h('h2', null, `Carry on: ${s.name}`), h('small', { class: 'muted' }, `Block ${bi + 1} · next: ${{ blurt: 'Warm up', learn: 'Learn', practise: 'Practise', plan: 'Apply', check: 'Check' }[st.k] || 'Step'}`))),
      bar(sessDone(a) / sessSteps(a) * 100),
      h('div', { class: 'row' }, B([icon('play'), 'Back to my session'], 'doNow', 'primary grow')));
  }
  const rank = sessRank(); if (!rank.length) return null;
  const sid = rank[DN_I % rank.length], s = SUBJ_BY[sid], gp = subjGap(s.subj), blk = (makeSession(25, [sid]).blocks || [])[0];
  if (!blk) return null;
  const g = STUDY_BY[blk.gid], acc = blk.topic ? accOf(blk.topic) : null, fixes = S.queue.filter(x => LEARN.trackOf(x.id) === sid).length;
  const why = [`now ${gp.curS}, aim ${gp.tgtS}`, blk.topic && (acc != null ? `${LEARN.name(blk.topic)} is ${Math.round(acc * 100)}% right` : `${LEARN.name(blk.topic)} not practised yet`), fixes && `${fixes} in your fix queue`].filter(Boolean);
  const segs = blk.steps.map(x => [{ blurt: 'Warm up', learn: 'Learn', practise: 'Practise', plan: 'Apply', check: 'Check' }[x.k] || 'Step', x.m]);
  return h('section', { class: 'card donow' },
    h('div', { class: 'dn-top' }, h('p', { class: 'eyebrow' }, DN_I % rank.length ? `Option ${DN_I % rank.length + 1} of ${rank.length}` : 'Do this now · biggest gap'), h('span', { class: 'pill' }, '25 min')),
    h('div', { class: 'dn-main' }, h('span', { class: 'dn-ic' }, icon(s.icon)), h('div', null, h('h2', null, s.name), h('small', { class: 'muted' }, g.title))),
    h('p', { class: 'dn-why' }, why.join(' · ')),
    h('div', { class: 'dn-segs', 'aria-label': segs.map(([n, m]) => `${n} ${m} minutes`).join(', ') }, segs.map(([n, m]) => h('span', { style: `flex:${m}` }, h('i'), h('b', null, n), h('small', null, m + 'm')))),
    h('div', { class: 'row' }, B([icon('play'), 'Start now'], 'doNow', 'primary grow'), B('Something else', 'doSkip', 'ghost')));
}

/* ---------- Weekly review ---------- */
const weekStart = () => addDays(-((new Date().getDay() + 6) % 7)); /* Monday */
const weekSlips = () => Object.keys(LEARN.TOPIC).filter(id => usable(id) && skill(id).rec.length >= 3)
  .map(id => { const k = skill(id); return [id, k.rec.filter(Boolean).length / k.rec.length]; }).filter(x => x[1] < .7).sort((a, b) => a[1] - b[1]).slice(0, 6);
function vWeek() {
  const span = (a, b) => { let sets = 0, n = 0, r = 0; for (let i = a; i < b; i++) { const k = addDays(-i), d = S.days[k] || {}; sets += setsOn(k); n += d.qa || 0; r += d.qr || 0; } return { sets, n, pc: n ? Math.round(r / n * 100) : null }; };
  const wk = span(0, 7), pv = span(7, 14), from = addDays(-6), papers = S.scores.filter(x => x.date >= from), slip = weekSlips(), wkKey = weekStart();
  if (DRAFT.wk == null) DRAFT.wk = S.notes[wkKey] || '';
  const days = Array.from({ length: 7 }, (_, i) => { const k = addDays(i - 6), dt = parseKey(k); return { k, d: DAYN[dt.getDay()], done: setsOn(k), plan: daySets(dt.getDay()), q: (S.days[k] || {}).qa || 0 }; });
  const top = Math.max(1, ...days.map(d => Math.max(d.done, d.plan))), best = days.reduce((a, d) => d.done > a.done ? d : a, days[0]);
  const delta = (a, b, unit = '') => b == null || a == null ? null : h('small', { class: 'trend ' + (a > b ? 'up' : a < b ? 'down' : '') }, a === b ? 'same as last week' : `${a > b ? '▲' : '▼'} ${Math.abs(a - b)}${unit} on last week`);
  const tile = (v, l, d) => h('div', { class: 'tile' }, h('b', null, v), h('span', null, l), d);
  const verdict = !wk.sets && !wk.n ? 'A quiet week. One set tomorrow restarts the run.' : wk.sets > pv.sets ? 'Stronger than last week. Keep the pressure on.' : wk.sets === pv.sets ? 'Steady. Same output as last week.' : 'A lighter week than the last. Plan next week now so it bounces back.';
  const mk = SUBJ.map(s => ({ s, p: predict(s), aim: aimOf(s) })).filter(r => EXAMS.some(e => e.subj === r.s)).sort((a, b) => (a.p ? a.p.pc - boundFor(a.s, a.aim) : -99) - (b.p ? b.p.pc - boundFor(b.s, b.aim) : -99))[0], subjMock = mk && mk.s;
  const goals = [
    [`Hit ${Math.max(weekTarget(), wk.sets)} sets`, `This week: ${wk.sets}. Your plan: ${weekTarget()}.`, null],
    subjMock && [`One timed mock in ${subjMock}`, mk.p ? `Furthest from its aim: ${boundFor(mk.s, mk.aim) - mk.p.pc}% short of a ${mk.aim}.` : 'Not tested yet. A mock shows where you really stand.', B([icon('flame'), 'Book it now'], 'mockGo', 'ghost sm', { 'data-subj': subjMock })],
    S.queue.length ? [`Clear ${Math.min(5, S.queue.length)} topics from your fix queue`, `${S.queue.length} waiting. Each one is marks you have already lost once.`, B([icon('wrench'), 'Open'], 'go', 'ghost sm', { 'data-tab': 'fix' })]
      : [`Answer ${Math.max(100, wk.n + 20)} questions`, `This week: ${wk.n}.`, null]].filter(Boolean);
  return h('div', { class: 'stack narrow' },
    subHero('Toolkit', 'Weekly review', 'tools', verdict),
    h('section', { class: 'card week' },
      h('div', { class: 'card-h' }, h('h2', null, 'Last 7 days'), h('span', { class: 'muted' }, `${fmtDate(from)} to today`)),
      h('div', { class: 'wk-chart', role: 'img', 'aria-label': days.map(d => `${d.d}: ${d.done} of ${d.plan} sets`).join(', ') }, days.map((d, i) => h('div', { class: 'wk-col' + (i === 6 ? ' today' : '') + (d === best && d.done ? ' best' : '') },
        h('span', { class: 'wk-n' }, d.done ? String(d.done) : ''),
        h('div', { class: 'wk-bar' }, d.plan > 0 && h('i', { class: 'plan', style: `height:${d.plan / top * 100}%` }), h('i', { class: 'done', style: `height:${d.done / top * 100}%` })),
        h('small', null, i === 6 ? 'Today' : d.d)))),
      h('p', { class: 'muted xs wk-key' }, h('i', { class: 'k done' }), ' sets done ', h('i', { class: 'k plan' }), ' planned'),
      h('div', { class: 'tiles' }, tile(wk.sets, 'sets done', delta(wk.sets, pv.sets)), tile(wk.n, 'questions', delta(wk.n, pv.n)),
        tile(wk.pc == null ? '–' : wk.pc + '%', 'right', wk.pc != null && pv.pc != null ? delta(wk.pc, pv.pc, '%') : null))),
    card('Papers this week', h('span', { class: 'muted' }, String(papers.length)), papers.length
      ? h('ul', { class: 'list' }, papers.map(p => h('li', null, medal(gradeFor(p.subj, pctOf(p)), 'sm'), h('div', { class: 'grow' }, h('b', null, p.paper), h('small', null, fmtDate(p.date))), h('div', { class: 'num' }, h('b', null, pctOf(p) + '%')))))
      : h('p', { class: 'muted' }, 'No papers this week. One timed mock a week is the closest practice to January.')),
    card('Kept slipping', null, slip.length ? [h('div', { class: 'chips' }, slip.map(([id, a]) => chip([LEARN.name(id), h('small', null, ` ${Math.round(a * 100)}%`)], false, 'drill', { 'data-topic': id }))),
      h('p', { class: 'muted xs' }, 'Tap one to practise it now, or send them all to your fix queue so your next revision sessions start with them.'),
      B([icon('wrench'), 'Add all to next week'], 'weekFix', 'primary')]
      : h('p', { class: 'muted' }, 'Nothing is slipping yet. Answer more questions and weak spots show up here.')),
    card('Next week', h('span', { class: 'muted' }, 'three goals'), h('ol', { class: 'goals' }, goals.map(([t, d, b]) => h('li', null, h('div', { class: 'grow' }, h('b', null, t), h('small', null, d)), b)))),
    card('Your reflection', null, h('p', { class: 'muted xs' }, 'Two lines: what worked this week, and one thing to change.'),
      h('textarea', { rows: 3, 'data-draft': 'wk', value: DRAFT.wk, maxlength: 2000, placeholder: 'What worked… / What I will change…', 'aria-label': 'Your reflection' }),
      h('div', { class: 'row' }, B('Save', 'weekNote', 'ghost'), S.notes[wkKey] && h('small', { class: 'muted' }, 'Saved for this week'))),
    predictCard());
}

const PLUSACT = {
  doNow() {
    if (activeSession()) { go('session'); return scrollTo({ top: 0 }); }
    const rank = sessRank(); S.sess = makeSession(25, [rank[DN_I % rank.length]]); DN_I = 0; save();
    if (!T.run) STUDYACT.sessTimer(); else go('session');
    toast('Session planned and the 25-minute timer is running'); scrollTo({ top: 0 });
  },
  doSkip() { DN_I++; render(); },
  mockGo(el) {
    const p = el.dataset.id ? paperOf(el.dataset.id) : EXAMS.filter(e => e.subj === el.dataset.subj).sort((a, b) => subjPts(a.subj).filter(x => x.paper.startsWith(a.name)).length - subjPts(b.subj).filter(x => x.paper.startsWith(b.name)).length)[0];
    if (!p) return toast('No practice paper for that subject yet');
    MOCK_PID = p.id; go('mockstart'); scrollTo({ top: 0 });
  },
  mockBegin() {
    const p = paperOf(MOCK_PID); if (!p) return;
    if (S.exam && !confirm('You have another paper in progress. Abandon it and sit this mock?')) return;
    S.exam = null; MOCK_PREV = null;
    EXACT.exStart({ dataset: { id: p.id, timed: '1' } });
  },
  weekFix() { const n = addFix(weekSlips().map(x => x[0]), 'Weekly review: kept slipping'); toast(n ? `${n} topic${n > 1 ? 's' : ''} added to next week` : 'Already in your fix queue'); render(); },
  weekNote() { S.notes[weekStart()] = str(DRAFT.wk || '', 2000).trim(); save(); toast('Reflection saved'); render(); }
};

/* ---------- Mock readiness: one number for "how ready am I for January", built from things you control ---------- */
/* Per subject: grade on papers vs your aim (50), what you have learned (30), timed mocks sat (20). Maths counts double: it is the top priority. */
const READY_W = { grade: 50, know: 30, mocks: 20 }, READY_MOCKS = 3;
const subjWeight = s => s === 'Maths' ? 2 : 1;
let READY_C = null;
function readiness() {
  const sig = `${S.scores.length}|${Object.keys(S.items).length}|${Object.values(S.items).reduce((a, m) => a + m[0] + m[2], 0)}|${Object.values(S.skill).reduce((a, k) => a + k.n, 0)}|${JSON.stringify(S.grades)}|${JSON.stringify(S.hidden)}`;
  if (READY_C && READY_C.sig === sig && READY_C.day === dkey()) return READY_C;
  const BK = LEARN.bank(), rows = SUBJ.map(subj => {
    let L = 0, T = 0;
    for (const s of LEARN.SUBJECTS.filter(x => x.subj === subj)) {
      const b = BK[s.id] || {}, keys = [...(b.def || []), ...(b.recall || []), ...(b.eq || []), ...(b.vocab || [])], calc = s.topics.filter(id => LEARN.TOPIC[id].type === 'calc' && !S.hidden[id]);
      L += keys.filter(learned).length + masteredIn(calc); T += keys.length + calc.length;
    }
    const p = predict(subj), aim = aimOf(subj), need = boundFor(subj, aim), timed = S.scores.filter(x => x.subj === subj && /\(timed\)/.test(x.paper)).length;
    const parts = { grade: p ? Math.min(1, p.pc / need) : 0, know: T ? L / T : 0, mocks: Math.min(1, timed / READY_MOCKS) };
    const pct = Object.keys(READY_W).reduce((a, k) => a + parts[k] * READY_W[k], 0);
    return { subj, p, aim, need, timed, L, T, parts, pct, w: subjWeight(subj) };
  });
  const W = rows.reduce((a, r) => a + r.w, 0), pct = Math.round(rows.reduce((a, r) => a + r.pct * r.w, 0) / W);
  /* every gap, as overall points you would gain by closing it */
  const wins = [];
  for (const r of rows) for (const k of Object.keys(READY_W)) { const gain = (1 - r.parts[k]) * READY_W[k] * r.w / W; if (gain >= .5) wins.push({ r, k, gain }); }
  wins.sort((a, b) => b.gain - a.gain);
  if (S.readyLog[dkey()] !== pct) S.readyLog[dkey()] = pct; /* one snapshot a day, saved with the next save */
  return READY_C = { sig, day: dkey(), pct, rows, wins };
}
const readyTier = p => p >= 90 ? 'Mock ready' : p >= 75 ? 'Nearly there' : p >= 50 ? 'Getting there' : p >= 25 ? 'Building' : 'Just starting';
const readyAgo = days => { const keys = Object.keys(S.readyLog).filter(k => k <= addDays(-days)).sort(); return keys.length ? S.readyLog[keys[keys.length - 1]] : null; };
function readyChip() {
  const R = readiness();
  return h('button', { type: 'button', class: 'rd-chip', 'data-act': 'go', 'data-tab': 'ready', 'aria-label': `Mock readiness ${R.pct}%. ${readyTier(R.pct)}. Open the breakdown` },
    h('span', { class: 'rd-mini', style: `--p:${R.pct}` }), h('b', null, R.pct + '%'), h('span', { class: 'rd-l' }, 'ready'));
}
function winRow(w) {
  const { r, k } = w, s = r.subj, sid = LEARN.SUBJECTS.find(x => x.subj === s).id;
  const t = k === 'grade' ? (r.p ? `Lift ${s} from ${r.p.pc}% to ${r.need}% on papers` : `Sit your first ${s} mock`)
    : k === 'know' ? `Learn more ${s}: ${r.L} of ${r.T} done` : `Sit ${READY_MOCKS - r.timed} more timed ${s} mock${READY_MOCKS - r.timed > 1 ? 's' : ''}`;
  const why = k === 'grade' ? (r.p ? `That is grade ${r.aim}, your aim.` : 'Until you sit one, this part counts as zero.') : k === 'know' ? 'Questions in Learn and revision sessions move this.' : 'Practising under time pressure is what mocks test.';
  const btn = k === 'know' ? B([icon('play'), 'Practise'], 'readyDrill', 'ghost sm', { 'data-track': sid }) : B([icon('flame'), 'Mock'], 'mockGo', 'ghost sm', { 'data-subj': s });
  return h('li', null, h('span', { class: 'rw-gain' }, `+${Math.round(w.gain)}`), h('div', { class: 'grow' }, h('b', null, t), h('small', null, why)), btn);
}
function vReady() {
  const R = readiness(), wk = readyAgo(7), d = wk == null ? null : R.pct - wk, days = daysToMocks();
  const log = Array.from({ length: 28 }, (_, i) => S.readyLog[addDays(i - 27)]), have = log.filter(v => v != null);
  return h('div', { class: 'stack narrow' },
    subHero('Focus', 'Mock readiness', 'home', null, 'Focus'),
    h('section', { class: 'card rd-hero' },
      h('div', { class: 'rd-ring', style: `--p:${R.pct}`, role: 'img', 'aria-label': `${R.pct}% ready` }, h('div', null, h('b', null, R.pct + '%'), h('small', null, 'ready'))),
      h('h2', null, readyTier(R.pct)),
      h('p', { class: 'muted' }, d == null ? 'Your score is tracked daily from today, so you can watch it climb.' : d > 0 ? `Up ${d} points in the last week.` : d < 0 ? `Down ${-d} points in the last week. Old weak spots creep back; a few fixes win them back.` : 'Level with last week.',
        days > 0 ? ` ${days} days to your mocks.` : ''),
      have.length > 1 && h('div', { class: 'rd-spark', 'aria-hidden': 'true' }, log.map(v => h('i', { style: v == null ? 'opacity:0' : `height:${Math.max(6, v / Math.max(...have) * 100)}%`, title: `${v}%` })))),
    card('Biggest wins', h('span', { class: 'muted' }, 'points you would gain'), R.wins.length
      ? h('ul', { class: 'rwins' }, R.wins.slice(0, 4).map(winRow)) : h('p', { class: 'muted' }, 'Nothing left to win. You are ready.')),
    card('By subject', h('span', { class: 'muted' }, 'Maths counts double'), h('ul', { class: 'rsubs' }, R.rows.slice().sort((a, b) => a.pct - b.pct).map(r => h('li', null,
      h('div', { class: 'rs-h' }, h('b', null, r.subj), h('span', { class: 'rs-p' }, Math.round(r.pct) + '%')),
      h('div', { class: 'rs-bars' }, [['grade', 'Grade', r.p ? `${r.p.pc}% of ${r.need}%` : 'no mock'], ['know', 'Learned', `${Math.round(r.parts.know * 100)}%`], ['mocks', 'Mocks', `${Math.min(r.timed, READY_MOCKS)} of ${READY_MOCKS}`]].map(([k, l, v]) =>
        h('div', { class: 'rs-b' }, h('div', { class: 'rs-bl' }, h('span', null, l), h('small', null, v)), h('div', { class: 'bar' }, h('i', { style: `width:${r.parts[k] * 100}%` }))))))))),
    acc('ready-how', h('b', null, 'How the score works'), h('div', { class: 'muted xs' },
      h('p', null, 'Each subject scores out of 100: 50 for how close your recent paper scores are to the grade you are aiming for, 30 for how much of the subject you have learned in Learn, and 20 for sitting 3 timed mocks.'),
      h('p', null, 'Maths counts double because a grade 4 means no resit. Aims come from your target grades in Settings. Every set of practice moves it; 100% means your papers already hit every aim.'))));
}
/* Today's sets: one segment per planned set, bonus sets after them */
function todayBar() {
  const plan = todayTrain().reduce((a, x) => a + x.n, 0), done = setsOn(dkey()), n = Math.min(16, Math.max(plan, done, 1));
  const msg = !plan ? (done ? `${done} bonus set${done > 1 ? 's' : ''} on a rest day` : 'Rest day. A bonus set still counts.')
    : done >= plan ? (done > plan ? `Plan done, plus ${done - plan} bonus` : 'Plan complete for today') : `${plan - done} to go`;
  return h('button', { type: 'button', class: 'tbar', 'data-act': 'go', 'data-tab': 'today', 'aria-label': `Today: ${done} of ${plan} sets. ${msg}. Open today's plan` },
    h('div', { class: 'tb-h' }, h('span', null, 'Today'), h('b', null, `${done} / ${plan} sets`), h('small', null, msg)),
    h('div', { class: 'tb-segs' }, Array.from({ length: n }, (_, i) => h('i', { class: i < Math.min(done, plan) ? 'on' : i < done ? 'bonus' : '' }))));
}
PLUSACT.readyDrill = el => { startDrill(el.dataset.track, null, 'learn'); go('drill', '#ans'); };

/* ---------- Undo: snapshot before quick, easy-to-mis-tap actions; one tap puts everything back ---------- */
const UNDO_MSG = { tick: 'Set ticked', fin: 'Finisher updated', chk: 'Checklist updated', conf: 'Confidence updated', rate: 'Card rated', delCard: 'Card deleted', lostDel: 'Removed',
  delScore: 'Score deleted', misOk: 'Marked as fixed', misAgain: 'Sent back to redo', misDel: 'Mistake deleted', planDel: 'Session removed', planSets: 'Sets changed', planMove: 'Session moved',
  pbDel: 'Plan deleted', sessTick: 'Step updated', hide: 'Topic setting changed' };
let UNDO_SNAP = null;
function withUndo(name, fn) {
  if (!UNDO_MSG[name]) return fn();
  const snap = JSON.stringify(S); fn();
  if (JSON.stringify(S) !== snap) undoToast(UNDO_MSG[name], snap);
}
function runAct(name, el, e) { withUndo(name, () => ACT[name](el, e)); checkAch(); }
function undoToast(msg, snap) {
  document.querySelectorAll('#toasts .undo').forEach(t => t.remove());
  UNDO_SNAP = snap;
  const t = h('div', { class: 'toast t-toast undo' }, h('span', null, msg), h('button', { type: 'button', class: 'undo-b', 'data-act': 'undo' }, icon('back'), 'Undo'));
  $('#toasts').append(t); requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('is-open')));
  setTimeout(() => { t.classList.remove('is-open'); setTimeout(() => t.remove(), 300); }, 5000);
}
PLUSACT.undo = () => {
  if (!UNDO_SNAP) return;
  S = normalize(JSON.parse(UNDO_SNAP)); UNDO_SNAP = null; READY_C = null; save();
  document.querySelectorAll('#toasts .undo').forEach(t => t.remove()); toast('Undone'); render();
};

/* ---------- Backup reminder ---------- */
const daysSince = k => isKey(k) ? Math.round((parseKey(dkey()) - parseKey(k)) / 864e5) : null;
function backupNag() {
  const since = daysSince(S.lastBackup), worth = lifeSets() + S.scores.length + Object.keys(S.items).length >= 5;
  if (!worth || (since != null && since < 7) || (daysSince(S.backupSnooze) ?? 99) < 3) return null;
  return h('section', { class: 'card nag' }, h('span', { class: 'nag-ic' }, icon('shield')),
    h('div', { class: 'grow' }, h('b', null, since == null ? 'You have never backed up' : `Last backup ${since} days ago`),
      h('p', { class: 'muted xs' }, 'Your progress lives only on this phone. One tap saves a copy you can restore anywhere.'),
      h('div', { class: 'row' }, B([icon('download'), 'Back up now'], 'exp', 'primary sm'), B('Later', 'backupLater', 'link'))));
}
const backupLine = () => { const d = daysSince(S.lastBackup); return d == null ? 'Never backed up on this device.' : d === 0 ? 'Last backup: today.' : `Last backup: ${d} day${d > 1 ? 's' : ''} ago.`; };
async function backupNow() {
  const name = 'archeron-backup-' + dkey() + '.json', json = JSON.stringify(S, null, 1);
  try { /* phones: the share sheet offers Save to Files / Drive, which survives losing the browser */
    const f = new File([json], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [f] }) && matchMedia('(pointer:coarse)').matches) { await navigator.share({ files: [f], title: 'Archeron backup' }); return true; }
  } catch (e) { if (e && e.name === 'AbortError') return false; }
  const a = h('a', { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: name });
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); return true;
}
PLUSACT.backupLater = () => { S.backupSnooze = dkey(); save(); render(); };

/* ---------- Search everything ---------- */
let SIDX = null;
function searchIndex() {
  if (!SIDX) {
    SIDX = []; const lines = t => String(t).split('\n').map(l => l.trim()).filter(l => l && l.includes('|'));
    for (const g of STUDY) SIDX.push({ k: 'Guide', t: g.title, d: g.lead, s: (SUBJ_BY[g.subj] || {}).name || '', body: g.body, gid: g.id });
    for (const src of [DEFS, typeof DEFS_MORE !== 'undefined' ? DEFS_MORE : {}]) for (const [id, [, title, txt]] of Object.entries(src)) for (const l of lines(txt)) { const [t, d] = l.split('|'); SIDX.push({ k: 'Definition', t, d, s: title, topic: id }); }
    for (const [id, [, title, txt]] of Object.entries(BANKS)) for (const l of lines(txt)) { const [t, d] = l.split('|'); SIDX.push({ k: 'Fact', t, d, s: title, topic: id }); }
    for (const [id, [title, txt]] of Object.entries(VOCAB)) for (const l of lines(txt)) { const [t, m, ex] = l.split('|'); SIDX.push({ k: 'Word', t, d: `${m}. "${ex}"`, s: title, topic: id }); }
  }
  const decks = [];
  for (const k of ['mac', 'acc', 'je', 'phy', 'mat', 'my']) if (DECKS[k]) for (const c of cardsOf(k)) decks.push({ k: k === 'phy' || k === 'mat' ? 'Formula' : k === 'my' ? 'My card' : 'Quote', t: c.f, d: c.b, s: DECKS[k].name, deck: k });
  return SIDX.concat(decks); /* decks rebuilt each time: your own cards change */
}
function searchFind(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(w => w.length > 1); if (!terms.length) return [];
  const out = [];
  for (const it of searchIndex()) {
    const T = it.t.toLowerCase(), D = (it.d + ' ' + it.s).toLowerCase(), B = it.body ? it.body.toLowerCase() : '';
    if (!terms.every(w => T.includes(w) || D.includes(w) || B.includes(w))) continue;
    let sc = terms.reduce((a, w) => a + (T.startsWith(w) ? 60 : T.includes(w) ? 30 : D.includes(w) ? 8 : 2), 0);
    if (T === q.toLowerCase()) sc += 100;
    if (it.k === 'Guide') sc += 5;
    out.push([sc, it]);
  }
  return out.sort((a, b) => b[0] - a[0]).slice(0, 40).map(x => x[1]);
}
function mark(text, q) { /* highlight matches without innerHTML */
  const terms = q.toLowerCase().split(/\s+/).filter(w => w.length > 1).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!terms.length) return text;
  return String(text).split(new RegExp(`(${terms.join('|')})`, 'gi')).map((p, i) => i % 2 ? h('mark', null, p) : p);
}
function snippet(body, q) {
  const w = q.toLowerCase().split(/\s+/).find(x => x.length > 1 && body.toLowerCase().includes(x)); if (!w) return null;
  const i = body.toLowerCase().indexOf(w), a = Math.max(0, i - 60), b = Math.min(body.length, i + 90);
  return (a ? '…' : '') + body.slice(a, b).replace(/^[#>!*?-]+\s*/gm, '').replace(/\s+/g, ' ').trim() + (b < body.length ? '…' : '');
}
function searchResults(q) {
  const res = searchFind(q);
  if (!q.trim()) return h('div', { id: 'sres', class: 'sres' }, h('p', { class: 'muted' }, 'Search every guide, definition, key fact, formula, quote and descriptive word.'),
    h('div', { class: 'chips' }, ['osmosis', 'Lady Macbeth', 'percentage', 'tectonic', 'speed', 'Stanhope'].map(s => chip(s, false, 'searchTry', { 'data-q': s }))));
  if (!res.length) return h('div', { id: 'sres', class: 'sres' }, h('p', { class: 'muted' }, `Nothing matches "${q}". Try a shorter word or a different spelling.`));
  return h('div', { id: 'sres', class: 'sres' }, h('p', { class: 'muted xs' }, `${res.length === 40 ? '40+' : res.length} result${res.length > 1 ? 's' : ''}`),
    h('ul', { class: 'slist' }, res.map(it => {
      const extra = it.k === 'Guide' && !it.t.toLowerCase().includes(q.toLowerCase()) && !it.d.toLowerCase().includes(q.toLowerCase()) ? snippet(it.body, q) : null;
      const btn = it.gid ? B([icon('book'), 'Open guide'], 'guide', 'ghost sm', { 'data-id': it.gid }) : it.topic && LEARN.TOPIC[it.topic] ? B([icon('play'), 'Practise'], 'searchDrill', 'ghost sm', { 'data-topic': it.topic })
        : it.deck ? B([icon('cards'), 'Flashcards'], 'searchDeck', 'ghost sm', { 'data-deck': it.deck }) : null;
      return h('li', null, h('div', { class: 'sl-h' }, h('span', { class: 'pill' }, it.k), h('small', { class: 'muted' }, it.s)),
        h('b', null, mark(it.t, q)), h('p', null, mark(it.d, q)), extra && h('p', { class: 'muted xs' }, mark(extra, q)), btn);
    })));
}
function vSearch() {
  return h('div', { class: 'stack narrow' },
    h('div', { class: 'sbox' }, icon('search'), h('input', { id: 'q', type: 'search', value: DRAFT.q || '', placeholder: 'Search guides, definitions, quotes…', autocomplete: 'off', enterkeyhint: 'search', 'aria-label': 'Search' }),
      DRAFT.q ? B(icon('x'), 'searchClear', 'ghost icon-only', { 'aria-label': 'Clear search' }) : null),
    searchResults(DRAFT.q || ''));
}
document.addEventListener('input', e => { if (e.target.id === 'q') { DRAFT.q = e.target.value; const r = $('#sres'); if (r) r.replaceWith(searchResults(DRAFT.q)); } });
document.addEventListener('keydown', e => { if (e.key === '/' && !e.target.matches('input, textarea, select')) { e.preventDefault(); go('search', '#q'); } });
Object.assign(PLUSACT, {
  searchOpen() { go('search', '#q'); setTimeout(() => { const q = $('#q'); if (q && document.activeElement !== q) q.focus({ preventScroll: true }); }, 350); }, /* view transitions can finish after go() tries to focus */
  searchTry(el) { DRAFT.q = el.dataset.q; render({ focus: '#q' }); },
  searchClear() { DRAFT.q = ''; render({ focus: '#q' }); },
  searchDrill(el) { startDrill(LEARN.trackOf(el.dataset.topic), el.dataset.topic, 'learn'); go('drill', '#ans'); },
  searchDeck(el) { CD.deck = el.dataset.deck; CD.i = 0; CD.flip = false; go('cards'); },
  exp() { backupNow().then(ok => { if (ok) { S.lastBackup = dkey(); save(); toast('Backup saved'); render(); } }); }
});
ICONS.search = ['M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14z', 'M20 20l-4.2-4.2'];
const searchBtn = () => h('button', { type: 'button', class: 'srch-b', 'data-act': 'searchOpen', 'aria-label': 'Search everything' }, icon('search'));

/* ---------- Pick up where you left off ---------- */
let RESUME_HIDE = false;
function resumeCard() {
  if (RESUME_HIDE) return null;
  let t, sub, btn;
  const ex = S.exam && paperOf(S.exam.pid);
  if (ex) {
    const left = S.exam.end ? mockLeftS(S.exam) : null;
    t = `${S.exam.end ? 'Mock' : 'Paper'} in progress: ${ex.name}`; sub = `Question ${S.exam.i + 1} of ${ex.qs.length}${left != null ? (left > 0 ? ` · ${Math.ceil(left / 60)} min left on the clock` : ' · time is up, mark what you wrote') : ''}`;
    btn = B([icon('play'), 'Carry on'], 'exStart', 'primary sm', { 'data-id': ex.id });
  } else if (S.mp) { t = 'Generated Maths paper in progress'; sub = `Question ${S.mp.i + 1} of ${S.mp.qs.length}`; btn = B([icon('play'), 'Carry on'], 'mpResume', 'primary sm'); }
  else if (S.resume && STUDY_BY[S.resume.g] && !S.read[S.resume.g] && daysSince(S.resume.at) <= 2) {
    t = `Carry on reading: ${STUDY_BY[S.resume.g].title}`; sub = 'You opened this guide but have not marked it read.'; btn = B([icon('book'), 'Open'], 'guide', 'primary sm', { 'data-id': S.resume.g });
  } else return null;
  return h('section', { class: 'card resume' }, h('span', { class: 'nag-ic' }, icon('play')),
    h('div', { class: 'grow' }, h('p', { class: 'eyebrow' }, 'Pick up where you left off'), h('b', null, t), h('small', { class: 'muted' }, sub), h('div', { class: 'row' }, btn)),
    B(icon('x'), 'resumeHide', 'ghost icon-only', { 'aria-label': 'Hide' }));
}
PLUSACT.resumeHide = () => { RESUME_HIDE = true; render(); };
{ const g0 = STUDYACT.guide; STUDYACT.guide = el => { S.resume = { g: el.dataset.id, at: dkey() }; save(); g0(el); }; }

/* ---------- Swipe flashcards: right = got it, left = again ---------- */
let SW = null, SWIPED = false;
document.addEventListener('pointerdown', e => { const c = e.target.closest('.flash'); if (c && c.classList.contains('flipped')) SW = { c, x: e.clientX, y: e.clientY, dx: 0 }; });
document.addEventListener('pointermove', e => {
  if (!SW) return; SW.dx = e.clientX - SW.x;
  if (Math.abs(SW.dx) < 8 || Math.abs(e.clientY - SW.y) > Math.abs(SW.dx) * 1.2) return;
  SW.c.style.transition = 'none'; SW.c.style.transform = `translateX(${SW.dx}px) rotate(${SW.dx / 22}deg)`;
  SW.c.dataset.swipe = SW.dx > 40 ? 'ok' : SW.dx < -40 ? 'no' : '';
});
document.addEventListener('pointerup', () => {
  if (!SW) return; const { c, dx } = SW; SW = null;
  if (Math.abs(dx) > 90) {
    SWIPED = true; setTimeout(() => { SWIPED = false; }, 400);
    c.style.transition = 'transform .25s ease-in, opacity .25s'; c.style.transform = `translateX(${dx > 0 ? 520 : -520}px) rotate(${dx > 0 ? 18 : -18}deg)`; c.style.opacity = '0';
    setTimeout(() => runAct('rate', { dataset: { ok: dx > 0 ? '1' : '0' } }), 200);
  } else { c.style.transition = ''; c.style.transform = ''; c.dataset.swipe = ''; }
});
document.addEventListener('pointercancel', () => { if (SW) { SW.c.style.transform = ''; SW.c.dataset.swipe = ''; SW = null; } });
document.addEventListener('click', e => { if (SWIPED && e.target.closest('.flash')) { e.stopPropagation(); e.preventDefault(); } }, true);

/* ---------- Focus lock: no reward pop-ups during a focus set or a timed mock; they are shown after ---------- */
const quietNow = () => !!((S.exam && S.exam.end && Date.now() < S.exam.end) || (T.run && T.mode === 'focus'));
const HELD = [];
if (typeof FX !== 'undefined') { const rev = FX.reveal; FX.reveal = (a, b, c) => quietNow() ? void HELD.push(b ? `${a}: ${b}` : a) : rev(a, b, c); } /* FXS in app.js is this same object */
{ const gc = giveChest; giveChest = (type, why) => { if (!quietNow()) return gc(type, why); const R = R0(); R.chests.push(type); R.stat.chests++; HELD.push(`${CHESTS[type].name} (${why})`); }; }
setInterval(() => {
  const lock = !!(S.exam && S.exam.end && Date.now() < S.exam.end && TAB === 'examq');
  document.body.classList.toggle('lockdown', lock);
  if (!quietNow() && HELD.length) { const n = HELD.length; toast(n === 1 ? `While you focused: ${HELD[0]}` : `While you focused you earned ${n} rewards. See Profile and The Realm.`, 'big'); HELD.length = 0; }
}, 1000);

/* ---------- Text size ---------- */
const TEXT_SIZES = [['normal', 'Normal'], ['large', 'Large'], ['xl', 'Extra large']];
PLUSACT.textSize = el => { S.text = el.dataset.v; save(); applyTheme(); render(); };

/* ---------- Update ready ---------- */
function showUpdate() {
  if ($('#upd')) return;
  document.body.append(h('div', { id: 'upd', class: 'upd', role: 'status' }, icon('sparkle'), h('span', null, h('b', null, 'A new version is ready'), h('small', null, 'Refresh when you are free. Nothing is lost.')),
    h('button', { type: 'button', class: 'btn primary sm', 'data-act': 'appReload' }, 'Refresh')));
}
PLUSACT.appReload = () => { try { sessionStorage.setItem('archeron-updated', '1'); } catch (e) {} location.reload(); };

/* ---------- Sebastian: the resident rat. Just for fun, always on your side. ---------- */
const SEB_SVG = `<svg viewBox="0 0 120 110" aria-hidden="true">
<path class="sb-tail" d="M34 94 C12 98 4 84 13 74 C20 66 19 57 9 55" fill="none" stroke="#c99aa5" stroke-width="4.4" stroke-linecap="round"/>
<g class="sb-body"><ellipse cx="52" cy="77" rx="28" ry="24" fill="#8b8194"/><ellipse cx="58" cy="83" rx="16" ry="15" fill="#b8aebf"/>
<ellipse cx="46" cy="100" rx="7" ry="3.6" fill="#d5a3ae"/><ellipse cx="68" cy="100" rx="7" ry="3.6" fill="#d5a3ae"/>
<rect x="56" y="76" width="26" height="17" rx="2.5" fill="#2c2238" stroke="var(--y)" stroke-width="1.6" transform="rotate(-8 69 84)"/>
<path d="M69 77.5 L69.5 93" stroke="var(--y)" stroke-width="1" opacity=".7" transform="rotate(-8 69 84)"/>
<ellipse cx="59" cy="78" rx="4.6" ry="3.6" fill="#d5a3ae"/><ellipse cx="79" cy="75" rx="4.6" ry="3.6" fill="#d5a3ae"/>
<path d="M48 61 Q66 70 84 61 L86 67.5 Q66 78 46 67.5 Z" fill="var(--y)"/><path d="M53 67 L48 85 L55 83.5 L59 69.5 Z" fill="var(--y3)"/></g>
<g class="sb-head"><g class="sb-ear"><circle cx="57" cy="34" r="10.5" fill="#958b9e"/><circle cx="57" cy="34" r="6.4" fill="#e3a0b0"/></g>
<g class="sb-ear sb-ear2"><circle cx="77" cy="31" r="10" fill="#958b9e"/><circle cx="77" cy="31" r="6" fill="#e3a0b0"/></g>
<ellipse cx="69" cy="49" rx="22" ry="19" fill="#958b9e"/><path d="M80 44 Q100 46 106 53 Q104 60 84 64 Z" fill="#958b9e"/>
<ellipse cx="84" cy="59" rx="4.2" ry="2.4" fill="#e88fa0" opacity=".35"/><circle cx="105.5" cy="53.5" r="3.4" fill="#e88fa0"/>
<g class="sb-eye"><circle cx="80" cy="46" r="4.3" fill="#120f16"/><circle cx="81.6" cy="44.4" r="1.5" fill="#fff"/></g>
<path class="sb-x" d="M76.5 42.5 L83.5 49.5 M83.5 42.5 L76.5 49.5" stroke="#120f16" stroke-width="2.2" stroke-linecap="round"/>
<path d="M99 56 L117 50 M99 57.5 L119 57.5 M99 59 L116 64.5" stroke="rgba(255,255,255,.5)" stroke-width=".8" stroke-linecap="round"/></g></svg>`;
/* Sebastian's material. He cannot stop talking about his cousin Emmanuel. Clean jokes only. */
const SEB_GENERAL = [
  'Squeak. That is rat for "press Begin". It is also rat for "hello", "cheese" and "have you met my cousin Emmanuel".',
  'My book is called Algebra for Rodents. It is three pages long. Two of them are pictures of cheese. Emmanuel wrote it. It shows.',
  'Write down what you remember BEFORE you check your notes. That is the Sebastian Method. Emmanuel says he invented it. He did not.',
  'Fractions are just pizza with anxiety. You can handle pizza.',
  'My arch-nemesis is a pigeon called Derek. Derek has never done a past paper in his life. Do not be Derek.',
  'Fun fact: rats laugh when tickled, but it is too high-pitched for humans to hear. Emmanuel laughs at his own jokes. You can hear that one. Everyone can.',
  'Scientists found rats replay the day\'s mazes in their sleep. Emmanuel replays his grade 9. Out loud. Anyway, sleep helps revision.',
  'My front teeth never stop growing. If I ever go quiet, assume I am stuck in a table leg. Do not tell Emmanuel.',
  'I once opened a crisp packet first try. Emmanuel says it does not count because it was already open. It counts.',
  'Mitochondria is the powerhouse of the cell. Emmanuel is the powerhouse of being annoying. Only one of those is on the exam.',
  'I tried revising once. Fell asleep on the textbook. Woke up with "photosynthesis" printed on my face. Emmanuel took a photo. It is his lock screen.',
  'You are the main character. I am the weird rat in the corner. Emmanuel thinks he is the main character. Emmanuel is a side quest.',
  'Every set is a crumb. Enough crumbs make a feast. That is not a revision tip, I am just hungry.',
  'Emmanuel lives behind a Greggs and has never once been hungry. I think about that a lot. Like, a lot a lot.',
  'Emmanuel has a gym membership. He is a rat. He goes on the treadmill and just lies there. Calls it "cardio".',
  'Emmanuel is on holiday in Majorca. A rat. In Majorca. He sent me a postcard. It was a crumb with "wish you were here" chewed into it.',
  'When I said I was helping someone with their GCSEs, Emmanuel said "cute". CUTE. Let us get you a grade 4 and shut him up forever.',
  'Emmanuel thinks Macbeth is a burger. I love him, but he is wrong, and I need you to be right.',
  'Did I mention my cousin Emmanuel? I did? Well he is doing great. Thanks for asking. You did not ask.',
  'Emmanuel\'s tail is two centimetres longer than mine. Not that I have measured. I have measured. Eleven times.',
  'Emmanuel says the trick to exams is "just being naturally gifted". Emmanuel failed his driving test. He is a RAT. He was not allowed to take it.',
  'Is this a lot of revision? Yes. Is it more than the amount of cheese I have eaten today? Absolutely not. Let us both stop judging each other.'];
function sebLines(ctx) {
  const hr = new Date().getHours(), days = daysToMocks(), plan = todayTrain().reduce((a, x) => a + x.n, 0), done = setsOn(dkey());
  const due = S.mistakes.filter(m => !m.fixed && m.redo <= dkey()).length + S.queue.length, mp = predict('Maths'), rd = readiness().pct;
  if (ctx === 'break') return ['Break time. Stretch. Emmanuel does yoga on his breaks. He cannot touch his toes. He is a rat. None of us can.',
    'Drink some water. Emmanuel drinks sparkling water and calls it "fizzy hydration". I am so embarrassed for my family.',
    'Look at something far away. Not your phone. Your phone is close. I measured. Emmanuel helped. He measured wrong.',
    'Five minutes. Walk around. Do NOT open the fridge. The fridge is a trap. I lived in one for a week. Emmanuel still calls me "Chilly".'];
  const L = [];
  if (hr >= 23 || hr < 5) L.push('It is late. Go to bed. Emmanuel goes to bed at 9 and look how insufferable he is. Hm. Bad argument. Go to bed anyway, sleep is where memories stick.');
  else if (hr < 9) L.push('Morning. Emmanuel has been up since 5 doing push-ups. I have been up since 5 watching Emmanuel do push-ups. We all have our roles.');
  if (plan && done >= plan) L.push('Plan done! Emmanuel has never finished a plan. Well, once. He has talked about it every day since. Now YOU get to talk about it every day.');
  else if (done > 0) L.push(`${done} set${done > 1 ? 's' : ''} done. I am telling Emmanuel. He will pretend not to care. He cares. It eats him up inside.`);
  else L.push('Emmanuel would have pressed Begin by now. Not that it is a competition. It is, though. It always has been.');
  if (mp && mp.g !== 'U' && mp.g < 4) L.push(`Maths is at a ${mp.g} on your papers. Emmanuel got a 9, but he also lives behind a Greggs and has an unfair amount of confidence. You need a 4. A 4 is plenty.`);
  else if (mp && mp.g >= 4) L.push(`Maths at a ${mp.g}?! Wait till Emmanuel hears. Actually, do not tell him. He will make it about himself.`);
  else L.push('A grade 4 in Maths means no resit. No resit means freedom. Freedom means cheese. Maybe freedom means something else for you. I do not know your life.');
  if (due) L.push(`${due} mistake${due > 1 ? 's' : ''} waiting to be fixed. Emmanuel says he has never made a mistake. Emmanuel once fell into a bin. On purpose. Fix yours.`);
  if (days > 0) L.push(`Mocks in ${days} days. That is ${(days * 24).toLocaleString('en-GB')} hours. I counted on my toes. I ran out of toes. Emmanuel lent me his. Weird day.`);
  L.push(rd ? `You are ${rd}% mock ready. That is higher than Emmanuel was at this point. I made that up. Feels good though, doesn't it.`
    : 'You are 0% mock ready. Everyone starts at zero. Even Emmanuel. He will deny it. Sit one timed mock and watch it jump.');
  const off = Math.floor(Date.now() / 864e5) % SEB_GENERAL.length; /* a different joke first each day */
  return L.concat(SEB_GENERAL.slice(off), SEB_GENERAL.slice(0, off));
}
const SEB_POKE = { 5: 'Are you poking me? You are poking me.', 8: 'I am a rat, not a button. The button is up there. It says Begin. It is lovely. Go and press it.',
  11: 'Poke me again and I am calling Emmanuel. You do not want Emmanuel here. He will bring up his grade 9 within four seconds.',
  14: 'Right. That is it. I am fainting dramatically.', 17: 'I am back. I saw a bright light. It was Emmanuel\'s grade 9 certificate. Horrible. Do a set.' };
let SEB_I = 0, SEB_TAPS = 0, SEB_LAST = 0, SEB_EMM = 0;
const sebSay = (sec, line) => {
  if (/Emmanuel/.test(line)) SEB_EMM++;
  sec.querySelector('.seb-say p').textContent = line;
  const c = sec.querySelector('.seb-emm'); c.textContent = `Emmanuel mentions today: ${SEB_EMM}`; c.hidden = !SEB_EMM;
};
function sebastian(ctx = 'home') {
  if (S.seb === false) return null;
  const L = sebLines(ctx), line = L[SEB_I % L.length];
  const rat = h('button', { type: 'button', class: 'seb-rat', 'data-act': 'sebTap', 'data-ctx': ctx, 'aria-label': 'Sebastian the rat. Tap him' }); rat.innerHTML = SEB_SVG;
  const sec = h('section', { class: 'seb' }, rat,
    h('div', { class: 'seb-say', role: 'status', 'aria-live': 'polite' }, h('b', null, 'Sebastian'), h('p', null, ''), h('small', { class: 'seb-emm', hidden: true })));
  if (sebastian.idx !== SEB_I) { sebastian.idx = SEB_I; if (/Emmanuel/.test(line)) SEB_EMM++; } /* count each line once, not every redraw */
  sec.querySelector('.seb-say p').textContent = line;
  const c = sec.querySelector('.seb-emm'); c.textContent = `Emmanuel mentions today: ${SEB_EMM}`; c.hidden = !SEB_EMM;
  return sec;
}
const SEB_MOVES = ['hop', 'spin', 'squish', 'wiggle'];
Object.assign(PLUSACT, {
  sebTap(el) {
    const now = Date.now(); SEB_TAPS = now - SEB_LAST < 3000 ? SEB_TAPS + 1 : 1; SEB_LAST = now;
    const sec = el.closest('.seb'), poke = SEB_POKE[SEB_TAPS];
    if (!poke) SEB_I++;
    const line = poke || sebLines(el.dataset.ctx)[SEB_I % sebLines(el.dataset.ctx).length];
    sebastian.idx = SEB_I; sebSay(sec, line);
    const move = SEB_TAPS === 14 ? 'faint' : SEB_MOVES[Math.floor(Math.random() * SEB_MOVES.length)];
    el.classList.remove(...SEB_MOVES, 'faint'); void el.offsetWidth; el.classList.add(move);
    if (SEB_TAPS >= 17) SEB_TAPS = 0;
  },
  sebShow(el) { S.seb = el.dataset.v === '1'; save(); render(); }
});
