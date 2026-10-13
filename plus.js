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
