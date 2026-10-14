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
  const w = x => !/^Generated/.test(x.paper) ? 1 : x.max >= 40 ? .8 : .5; /* generated papers count less than real ones; full-length ones nearly as much */
  const pc = Math.round(pts.reduce((a, s) => a + pctOf(s) * w(s), 0) / pts.reduce((a, s) => a + w(s), 0)), nx = boundsOf(subj).slice().reverse().find(([, p]) => p > pc);
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
/* why the next set's subject matters right now, and the guide to read first; replaces a separate Do this now card when they agree */
function missionWhy(track) {
  const s = track && SUBJ_BY[track]; if (!s || activeSession()) return null;
  const gp = subjGap(s.subj), blk = (makeSession(25, [track]).blocks || [])[0], g = blk && STUDY_BY[blk.gid];
  const acc = blk && blk.topic ? accOf(blk.topic) : null, fixes = S.queue.filter(x => LEARN.trackOf(x.id) === track).length;
  const parts = [`now ${gp.curS}, aim ${gp.tgtS}`, blk && blk.topic && (acc != null ? `${LEARN.name(blk.topic)} is ${Math.round(acc * 100)}% right` : `${LEARN.name(blk.topic)} not practised yet`), fixes && `${fixes} in your fix queue`].filter(Boolean);
  return h('div', { class: 'm-why' }, h('p', null, h('b', null, 'Why it matters: '), parts.join(' · ')),
    g && B([icon('book'), h('span', null, 'Stuck? Read the guide: ', h('b', null, g.title))], 'guide', 'ghost sm m-guide', { 'data-id': g.id }));
}
function doNow(heroTrack) {
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
  if (heroTrack && sid === heroTrack) return null; /* the next set already covers it: the mission card says why */
  const second = !!heroTrack; /* the Begin button is the main action; this is the alternative */
  if (!blk) return null;
  const g = STUDY_BY[blk.gid], acc = blk.topic ? accOf(blk.topic) : null, fixes = S.queue.filter(x => LEARN.trackOf(x.id) === sid).length;
  const why = [`now ${gp.curS}, aim ${gp.tgtS}`, blk.topic && (acc != null ? `${LEARN.name(blk.topic)} is ${Math.round(acc * 100)}% right` : `${LEARN.name(blk.topic)} not practised yet`), fixes && `${fixes} in your fix queue`].filter(Boolean);
  const segs = blk.steps.map(x => [{ blurt: 'Warm up', learn: 'Learn', practise: 'Practise', plan: 'Apply', check: 'Check' }[x.k] || 'Step', x.m]);
  return h('section', { class: 'card donow' + (second ? ' alt' : '') },
    h('div', { class: 'dn-top' }, h('p', { class: 'eyebrow' }, DN_I % rank.length ? `Option ${DN_I % rank.length + 1} of ${rank.length}` : second ? 'Or tackle your biggest gap' : 'Do this now · biggest gap'), h('span', { class: 'pill' }, '25 min')),
    h('div', { class: 'dn-main' }, h('span', { class: 'dn-ic' }, icon(s.icon)), h('div', null, h('h2', null, s.name), h('small', { class: 'muted' }, g.title))),
    h('p', { class: 'dn-why' }, why.join(' · ')),
    h('div', { class: 'dn-segs', 'aria-label': segs.map(([n, m]) => `${n} ${m} minutes`).join(', ') }, segs.map(([n, m]) => h('span', { style: `flex:${m}` }, h('i'), h('b', null, n), h('small', null, m + 'm')))),
    h('div', { class: 'row' }, B([icon('play'), second ? 'Plan it instead' : 'Start now'], 'doNow', (second ? 'ghost' : 'primary') + ' grow'), B('Something else', 'doSkip', second ? 'link' : 'ghost')));
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
    subHero('Progress', 'This week', 'tools', verdict),
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
    subHero('Progress', 'Mock readiness', 'tools', null, 'Toolkit'),
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
  if (!quietNow() && HELD.length) { const n = HELD.length; toast(n === 1 ? `While you focused: ${HELD[0]}` : `While you focused you earned ${n} rewards. See The Realm.`, 'big'); HELD.length = 0; }
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
/* Sebastian's material. He cannot stop talking about his cousin Emmanuel. Clean jokes only.
   Nothing repeats until every line in its group has been used (see fresh() below). */
const SEB_GENERAL = [
  'My book is called Algebra for Rodents. It is three pages long. Two of them are pictures of cheese. Emmanuel wrote it. It shows.',
  'Write down what you remember BEFORE you check your notes. That is the Sebastian Method. Emmanuel says he invented it. He did not.',
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
  'Is this a lot of revision? Yes. Is it more than the amount of cheese I have eaten today? Absolutely not. Let us both stop judging each other.',
  'Emmanuel once tried to revise by sleeping with the textbook under his pillow. He woke up with a sore neck and zero knowledge.',
  'My nan used to say "a rat who revises is a rat who thrives". She also said "never trust a pigeon". She was right about both.',
  'I am not saying I am clever. I am saying I once found my way out of a maze and only cried twice.',
  'Emmanuel claims he can read upside down. He just holds the book upside down. It is not the same thing.',
  'Derek the pigeon asked me what a past paper is. I said it is like bread but it makes you smarter. He ate one. He is not smarter.',
  'I made a revision playlist. It is just the sound of a crisp packet, on repeat, for three hours. Very focusing. For me.',
  'New game: every time I mention Emmanuel, you do one question. Wait. That is a terrible deal for you. Forget I said anything.',
  'Emmanuel highlights every single word. The whole page is yellow. He calls it "being thorough". It is a crime.',
  'Your brain is a muscle. Sort of. Not really. But revision makes it stronger, so the metaphor works. I am a rat, not a neuroscientist.',
  'Little and often beats massive and never. That is the best revision advice I know, and I know two pieces of advice.',
  'Emmanuel says "practice makes perfect". Emmanuel has never practised anything. He was just born like that. Annoying.',
  'If you ever feel stuck, remember I once spent a whole week trying to climb a sock. You are doing great by comparison.',
  'Emmanuel and I once had a staring contest. He blinked first. I will be talking about that until I die.',
  'My lucky number is 4, because that is your Maths target. Before that, my lucky number was "cheese". I have grown as a rat.',
  'Emmanuel sent me a voice note. It was eleven minutes long. It was about a crumb. I listened to all of it. That is family.',
  'Emmanuel wrote "I am the best" on a sticky note and stuck it on his mirror. Then he stuck one on mine. I took it down. He put it back. Twice.',
  'Take a sip of water. Go on. Done? Great. I am basically your personal trainer now. I charge in crumbs.',
  'Emmanuel thinks a hypotenuse is a type of dinosaur. I have stopped correcting him. It is easier for everyone.',
  'I respect you in a strictly professional, rat-to-student way. Now do some revision before this gets weird.',
  'Emmanuel once got lost in a cereal box for two days. He says he was "exploring". He was crying.',
  'I tried to teach Derek the pigeon long division. He did a poo on the worksheet. Honestly, fair review.',
  'Emmanuel has a podcast. It has one listener. It is his mum. She skips the intro.'];
const SEB_BREAK = ['Break time. Stretch. Emmanuel does yoga on his breaks. He cannot touch his toes. He is a rat. None of us can.',
  'Drink some water. Emmanuel drinks sparkling water and calls it "fizzy hydration". I am so embarrassed for my family.',
  'Look at something far away. Not your phone. Your phone is close. I measured. Emmanuel helped. He measured wrong.',
  'Five minutes. Walk around. Do NOT open the fridge. The fridge is a trap. I lived in one for a week. Emmanuel still calls me "Chilly".',
  'Break time. Emmanuel spends his breaks posing for photos. Nobody is taking the photos. He just poses.',
  'Rest your eyes. Stare at a wall. Walls are great. I have lived inside several.'];
const SEB_POKE = { 5: 'Are you poking me? You are poking me.', 8: 'I am a rat, not a button. The button is up there. It says Begin. It is lovely. Go and press it.',
  11: 'Poke me again and I am calling Emmanuel. You do not want Emmanuel here. He will bring up his grade 9 within four seconds.',
  14: 'Right. That is it. I am fainting dramatically.', 17: 'I am back. I saw a bright light. It was Emmanuel\'s grade 9 certificate. Horrible. Do a set.' };
const s_ = n => n === 1 ? '' : 's';
/* lines that react to what is going on right now; several versions of each so the same situation reads differently */
function sebSituation() {
  const hr = new Date().getHours(), days = daysToMocks(), plan = todayTrain().reduce((a, x) => a + x.n, 0), n = setsOn(dkey());
  const due = S.mistakes.filter(m => !m.fixed && m.redo <= dkey()).length + S.queue.length, mp = predict('Maths'), rd = readiness().pct, L = [];
  if (hr >= 23 || hr < 5) L.push('It is late. Go to bed. Emmanuel goes to bed at 9 and look how insufferable he is. Hm. Bad argument. Go to bed anyway, sleep is when memories stick.',
    'It is past 11. I am nocturnal and even I think this is late. Your brain saves what you learned while you sleep. Mine saves crumbs.');
  else if (hr < 9) L.push('Morning. Emmanuel has been up since 5 doing push-ups. I have been up since 5 watching Emmanuel do push-ups. We all have our roles.', 'Good morning. I have been awake since 4. Not studying. Just vibrating.');
  if (plan && n >= plan) L.push('Plan done! Emmanuel has never finished a plan. Well, once. He has talked about it every day since. Now YOU get to talk about it every day.',
    'That is the whole plan done. I would throw you a party, but I only know four people and one of them is a woodlouse called Kevin.',
    'Plan complete. You are now legally allowed to lie on the floor. That is what I do. Every day. Regardless.', 'All sets done. I am celebrating by running in a small circle for no reason. As is rat tradition.');
  else if (n > 0) L.push(`${n} set${s_(n)} done. I am telling Emmanuel. He will pretend not to care. He cares. It eats him up inside.`,
    `${n} down${plan > n ? `, ${plan - n} to go` : ''}. You are on fire. Not literally. I checked. I am very jumpy about fire.`,
    `${n} set${s_(n)} already. If revision were cheese, you would be a small block of cheddar by now. Mature cheddar. Respect.`,
    `${n} done. I would high-five you, but my hand is the size of a raisin. Imagine it anyway. Powerful raisin high-five.`);
  else L.push('Emmanuel would have pressed Begin by now. Not that it is a competition. It is, though. It always has been.',
    'Squeak. That is rat for "press Begin". It is also rat for "hello", "cheese" and "have you met my cousin Emmanuel".',
    'I have been staring at that Begin button for an hour. It has not pressed itself. Lazy button.',
    'One set is 25 minutes. I once hid under a fridge for three days because I heard a crisp packet. You can do 25 minutes.',
    'If you press Begin I will do a little dance. I will not, I have no rhythm. But I will think about it really hard.',
    'Today\'s sets are not going to do themselves. I checked. I asked them nicely. Nothing.');
  if (mp && mp.g !== 'U' && mp.g >= 4) L.push(`Maths at a ${mp.g}?! Wait till Emmanuel hears. Actually, do not tell him. He will make it about himself.`,
    `Maths is at a ${mp.g}. I would do a backflip, but last time I landed in a teapot and we do not talk about the teapot.`, `A ${mp.g} in Maths. That is a no-resit grade. Now we guard it like the last crumb on Earth.`);
  else {
    L.push('A grade 4 in Maths means no resit. No resit means freedom. Freedom means cheese. Maybe freedom means something else for you. I do not know your life.',
      'Fractions are just pizza with anxiety. Percentages are pizza out of 100. Everything is pizza if you are brave enough.',
      'Nobody has ever regretted doing a Maths set. Except me. I did one and fell into the protractor drawer.');
    if (mp) L.push(`Maths is at a ${mp.g} on your papers. Emmanuel got a 9, but he also lives behind a Greggs and has an unfair amount of confidence. You need a 4. A 4 is plenty.`,
      `Maths is sitting at a ${mp.g}. I am sitting at a U, but in my defence, I ate the calculator.`);
  }
  if (due) L.push(`${due} mistake${s_(due)} waiting to be fixed. Emmanuel says he has never made a mistake. Emmanuel once fell into a bin. On purpose. Fix yours.`,
    `${due} mistake${s_(due)} in the fix queue. I would fix them myself, but last time I tried I accidentally ate question 3.`,
    `You have ${due} mistake${s_(due)} to win back. Mistakes are just marks you have not collected yet. I read that on a poster. The poster was in a bin. Still true.`);
  if (days > 0) L.push(`Mocks in ${days} days. That is ${(days * 24).toLocaleString('en-GB')} hours. I counted on my toes. I ran out of toes. Emmanuel lent me his. Weird day.`,
    `${days} days until mocks. I am not panicking. I am just chewing a sock really fast. Normal behaviour.`,
    `Mocks in ${days} days. That is ${days} chances to get one per cent better, or ${days} chances to listen to Emmanuel brag. Let us do the first one.`);
  if (!rd) L.push('You are 0% mock ready. Everyone starts at zero. Even Emmanuel. He will deny it. Sit one timed mock and watch it jump.', 'Readiness: 0%. Same as me before my morning crumb. One timed mock and that number moves. Promise.');
  else L.push(`You are ${rd}% mock ready. That is higher than Emmanuel was at this point. I made that up. Feels good though, doesn't it.`,
    `${rd}% mock ready. I am about 4% ready for anything, ever, and I am thriving. You are doing way better than me.`, `Readiness is at ${rd}%. Every set nudges it up. Even the boring ones. Especially the boring ones.`);
  return L;
}

/* Memory: what he has said, per device. Cosmetic, so plain localStorage is fine; it fails quietly. */
const strHash = s => { let x = 7; for (const c of String(s)) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; };
const sebSeen = new Set((() => { try { const v = JSON.parse(localStorage.getItem('archeron-seb')); return Array.isArray(v) ? v : []; } catch (e) { return []; } })());
function sebMark(t) { const k = strHash(t); sebSeen.delete(k); sebSeen.add(k); try { localStorage.setItem('archeron-seb', JSON.stringify([...sebSeen].slice(-800))); } catch (e) {} }
const rnd = a => a[Math.floor(Math.random() * a.length)];
/* an unseen item; once the whole group has been seen, forget that group and start again (never the line just shown) */
function fresh(list, avoid, reset = true) {
  if (!list || !list.length) return null;
  let pool = list.filter(t => t !== avoid && !sebSeen.has(strHash(t)));
  if (!pool.length && reset) { for (const t of list) sebSeen.delete(strHash(t)); pool = list.filter(t => t !== avoid); }
  return pool.length ? rnd(pool) : null;
}
let SEB_CUR = null, SEB_TAPS = 0, SEB_LAST = 0, SEB_EMM = 0;
function sebPick(ctx, avoid) {
  if (ctx === 'break') { const t = fresh(Math.random() < .6 ? SEB_BREAK : SEB_GENERAL, avoid) || fresh(SEB_BREAK, avoid); sebMark(t); return t; }
  const top = sessRank()[0], r = Math.random();
  const order = r < .4 ? ['now', 'joke', 'fact'] : r < .78 ? ['joke', 'now', 'fact'] : ['fact', 'joke', 'now'];
  /* unused lines from any group first; a group only starts again once every group has run dry */
  for (const reset of [false, true]) for (const k of order) {
    if (k === 'fact') { const f = top && factPick(SUBJ_BY[top].name, top, avoid, reset); if (f) return `${f.head}: ${f.text}`; continue; }
    const t = fresh(k === 'now' ? sebSituation() : SEB_GENERAL, avoid, reset); if (t) { sebMark(t); return t; }
  }
  return avoid || '';
}
function sebShowLine(sec, line) {
  if (/Emmanuel/.test(line)) SEB_EMM++;
  sec.querySelector('.seb-say p').textContent = line;
  const c = sec.querySelector('.seb-emm'); c.textContent = `Emmanuel mentions today: ${SEB_EMM}`; c.hidden = !SEB_EMM;
}
function sebastian(ctx = 'home') {
  if (S.seb === false) return null;
  const rat = h('button', { type: 'button', class: 'seb-rat', 'data-act': 'sebTap', 'data-ctx': ctx, 'aria-label': 'Sebastian the rat. Tap him' }); rat.innerHTML = SEB_SVG;
  const sec = h('section', { class: 'seb' }, rat,
    h('div', { class: 'seb-say', role: 'status', 'aria-live': 'polite' }, h('b', null, 'Sebastian'), h('p', null, ''), h('small', { class: 'seb-emm', hidden: true })));
  if (!SEB_CUR || SEB_CUR.ctx !== ctx || Date.now() - SEB_CUR.at > 45000) { /* a new line when you come back, the same one while you are here */
    SEB_CUR = { ctx, at: Date.now(), line: sebPick(ctx, SEB_CUR && SEB_CUR.line) }; sebShowLine(sec, SEB_CUR.line);
  } else { sec.querySelector('.seb-say p').textContent = SEB_CUR.line; const c = sec.querySelector('.seb-emm'); c.textContent = `Emmanuel mentions today: ${SEB_EMM}`; c.hidden = !SEB_EMM; }
  return sec;
}
const SEB_MOVES = ['hop', 'spin', 'squish', 'wiggle'];
Object.assign(PLUSACT, {
  sebTap(el) {
    const now = Date.now(); SEB_TAPS = now - SEB_LAST < 3000 ? SEB_TAPS + 1 : 1; SEB_LAST = now;
    const sec = el.closest('.seb'), line = SEB_POKE[SEB_TAPS] || sebPick(el.dataset.ctx, SEB_CUR && SEB_CUR.line);
    SEB_CUR = { ctx: el.dataset.ctx, at: now, line }; sebShowLine(sec, line);
    const move = SEB_TAPS === 14 ? 'faint' : rnd(SEB_MOVES.filter(m => !el.classList.contains(m)));
    el.classList.remove(...SEB_MOVES, 'faint'); void el.offsetWidth; el.classList.add(move);
    if (SEB_TAPS >= 17) SEB_TAPS = 0;
  },
  sebShow(el) { S.seb = el.dataset.v === '1'; save(); render(); }
});

/* ---------- Sebastian's topic facts: real facts about the people and history behind what you are studying ---------- */
/* [subjects, topic pattern or null for any topic in the subject, fact]. Facts checked; legends are called legends. */
const SEB_FACTS = [
  ['maths', /pythag|trigonometr/, 'Pythagoras led a group of followers in ancient Greece, and legend says they were not allowed to eat beans. The Babylonians were using his triangle rule more than 1,000 years before he was born, though.'],
  ['maths', /trigonometr/, '"Trigonometry" is Greek for "triangle measuring". Ancient astronomers used it to estimate the distance to the Moon.'],
  ['maths', /percent|%|interest|multiplier/, 'The % sign comes from Italian merchants writing "per cento", meaning per hundred. Centuries of lazy handwriting squashed it down into %.'],
  ['maths|business', /interest/, 'Albert Einstein is often quoted calling compound interest "the eighth wonder of the world". There is no evidence he ever said it. The internet just really wanted him to.'],
  ['maths', /fraction/, 'The flat line in a fraction is called a vinculum. The slanted one, like in 3/4, is called a solidus. Use those words to scare people.'],
  ['maths', /ratio|proportion/, 'The golden ratio, about 1.618, shows up in nature, like the spirals of seeds in a sunflower head and the scales of a pine cone.'],
  ['maths', /algebra|equation|expand|substitut|unknown|factoris|simplif/, 'The word "algebra" comes from "al-jabr" in the title of a book by al-Khwarizmi, a mathematician in 9th-century Baghdad. His name also gave us the word "algorithm".'],
  ['maths', /equation|unknown|solv/, 'The equals sign was invented in 1557 by the Welsh mathematician Robert Recorde. He picked two parallel lines because "no two things can be more equal".'],
  ['maths', /sequence|nth/, 'The Fibonacci sequence (1, 1, 2, 3, 5, 8...) is named after Leonardo of Pisa, who made it famous in 1202 with a puzzle about breeding rabbits. Rabbits. Not rats. I am offended.'],
  ['maths', /circle/, 'Pi Day is 14 March, because Americans write that date as 3/14. It is also Albert Einstein\'s birthday.'],
  ['maths', /circle/, 'Pi goes on forever without repeating. Computers have worked it out to more than 100 trillion digits. You need about two of them. 3.14. Done.'],
  ['maths', /angle|polygon/, 'There are 360 degrees in a circle probably because of the ancient Babylonians, who counted in 60s. 360 divides neatly by 2, 3, 4, 5, 6, 8, 9, 10, 12 and loads more.'],
  ['maths', /negative|number skill/, 'Over 2,000 years ago, Chinese mathematicians used red counting rods for positive numbers and black ones for negatives. In the 1500s, some European mathematicians were still calling negative numbers "absurd".'],
  ['maths', /bidmas|order of operations|number skill/, 'BIDMAS is called BODMAS in lots of places and PEMDAS in America. Same rules, different letters. Everyone still argues about it online.'],
  ['maths|physics', /standard form/, 'A googol is 1 × 10^100. The name was made up by a 9-year-old, Milton Sirotta, nephew of the mathematician Edward Kasner. Google is named after it, spelled wrong.'],
  ['maths', /probab/, 'Probability theory started in 1654 with letters between Blaise Pascal and Pierre de Fermat about how to fairly split the prize money from a game of chance that was stopped halfway.'],
  ['maths|geography|biology', /mean|median|mode|average|range|statistic|frequency|population|rainfall/, 'Florence Nightingale was a statistics pioneer. Her diagrams proved more soldiers were dying from disease than from battle wounds, and in 1858 she became the first woman in the Royal Statistical Society.'],
  ['maths', /round/, 'In 1982 the Vancouver Stock Exchange launched an index at 1,000, then kept chopping off decimals instead of rounding properly. Within two years it showed roughly half its real value. Rounding matters.'],
  ['maths|physics', /speed|distance|compound measure|unit/, 'Usain Bolt\'s 100 m world record of 9.58 seconds works out at about 10.4 metres per second, or roughly 23 miles per hour.'],
  ['maths', /area|volume|perimeter|trapez|triangle/, 'The Great Pyramid of Giza was the tallest human-made structure in the world for about 3,800 years.'],
  ['maths', /graph|y = mx/, 'Graphs with x and y axes are called Cartesian graphs, after René Descartes. Legend says he got the idea watching a fly crawl across his ceiling.'],
  ['maths', null, 'Zero as a proper number was developed in India. The mathematician Brahmagupta wrote rules for calculating with it in 628 AD.'],
  ['physics', /newton|force|resultant|momentum|motion|acceleration|weight/, 'Isaac Newton studied at Trinity College, Cambridge. When plague shut the university in 1665, he went home to Woolsthorpe in Lincolnshire and worked out huge chunks of his ideas on gravity, light and calculus. Best lockdown ever.'],
  ['physics', /newton|force|resultant|momentum|motion/, 'Newton later ran the Royal Mint and personally hunted down people forging coins. He reportedly went undercover in pubs to gather evidence.'],
  ['physics', /weight|gravit|newton/, 'The apple story is mostly true: Newton told friends that seeing an apple fall in his garden got him thinking about gravity. It never hit him on the head. That bit was added later.'],
  ['physics', /energy|work done|kinetic|potential energy/, 'The joule is named after James Prescott Joule, a brewer\'s son from Salford who showed work can be turned into heat. Legend says he took a thermometer on his honeymoon to measure waterfalls.'],
  ['physics', /power/, 'The watt is named after James Watt, the Scottish engineer who massively improved the steam engine. He also came up with "horsepower" to help sell it.'],
  ['physics', /charge|electric|circuit|potential difference/, 'Alessandro Volta built the first battery in 1800 by stacking zinc and copper discs with salty cardboard or cloth between them. The volt is named after him.'],
  ['physics', /resistance|circuit|electric/, 'Georg Ohm was a maths and physics teacher when he did the experiments behind V = IR. Your teacher could be next. Be nice to them.'],
  ['physics', /charge|electric/, 'Benjamin Franklin is the reason electrons count as "negative". He chose the labels before anyone knew electrons existed, and we have been stuck with it ever since.'],
  ['physics', /wave|spectrum|light/, 'Light from the Sun takes about 8 minutes to reach Earth. So if the Sun vanished, you would get 8 more minutes of revision. Use them wisely.'],
  ['physics', /wave|spectrum|radio/, 'Heinrich Hertz was the first to deliberately make and detect radio waves, in the 1880s. The hertz, the unit of frequency, is named after him.'],
  ['physics', /magnet/, 'Earth\'s magnetic north pole wanders. It has been drifting tens of kilometres a year, so navigation maps have to be updated regularly.'],
  ['physics|chemistry', /particle|radiation|radioactiv|atom/, 'Marie Curie is the only person to win Nobel Prizes in two different sciences: Physics in 1903 and Chemistry in 1911. Her notebooks are still radioactive and are kept in lead-lined boxes.'],
  ['physics', /density|particle model/, 'Archimedes supposedly shouted "Eureka!" ("I have found it!") in the bath after working out how to test whether a king\'s crown was pure gold, using water displacement. Legend, not on the exam.'],
  ['physics', /spring|force/, 'Hooke\'s law is named after Robert Hooke, who also named biological "cells". He and Isaac Newton could not stand each other.'],
  ['physics', /speed|wave/, 'Sound travels at about 340 metres per second in air. Count the seconds between lightning and thunder, divide by 3, and you get roughly how many kilometres away the storm is.'],
  ['chemistry', /periodic|group|atom|electron/, 'Dmitri Mendeleev left gaps in his periodic table for elements nobody had discovered yet, and predicted what they would be like. When gallium and germanium were found, he was spot on.'],
  ['chemistry|physics', /atom|electron|nucle/, 'Rutherford\'s gold foil experiment showed atoms are mostly empty space. He said seeing particles bounce back was like firing a shell at tissue paper and having it come back and hit you.'],
  ['chemistry', /bond|structure|ionic|formula|naming/, 'Table salt is sodium, a metal that reacts violently with water, bonded to chlorine, a poisonous gas. Together they go on your chips.'],
  ['chemistry', /bond|structure|propert/, 'Diamond and the graphite in pencils are both pure carbon. The only difference is how the carbon atoms are bonded together.'],
  ['chemistry', /electrolysis/, 'Humphry Davy used electrolysis to discover potassium and sodium in 1807. His cousin wrote that he danced around the lab with joy.'],
  ['chemistry', /acid|salt|reactivity|chemical change/, 'The pH scale was invented in 1909 by Søren Sørensen while he worked at the Carlsberg brewery\'s laboratory in Copenhagen.'],
  ['chemistry|biology', /rate|energy change|catalys|enzyme/, 'Enzymes are biological catalysts. Without them, some reactions in your body would take millions of years. With them, it takes a fraction of a second.'],
  ['chemistry', /crude oil|fuel/, 'Crude oil mostly formed from tiny sea creatures like plankton, buried and squashed for millions of years. Not dinosaurs. Sorry.'],
  ['chemistry', /atmosphere|resource/, 'Earth\'s early atmosphere had almost no oxygen. It built up over hundreds of millions of years thanks to algae and, later, plants doing photosynthesis.'],
  ['chemistry', /mixture|separation|chromatograph|rf value|analysis/, 'Chromatography was invented by the botanist Mikhail Tsvet to separate plant pigments. "Chroma" is Greek for colour, and "tsvet" is Russian for colour. A built-in pun.'],
  ['chemistry', /formula|equation|balanc|mass|concentration|calculation/, 'Antoine Lavoisier showed that mass is conserved in chemical reactions, which is exactly why equations have to balance. He also named oxygen and hydrogen.'],
  ['chemistry', /gas test/, 'The squeaky pop test works because hydrogen burns so fast with oxygen that it makes a tiny explosion. Rat-sized. Very safe. Mostly.'],
  ['chemistry', null, 'The Haber process makes ammonia for fertiliser. It is estimated that food grown with it feeds around half the people on Earth.'],
  ['biology', /cell|magnification|microscop/, 'Robert Hooke named "cells" in 1665 after looking at cork under a microscope. The tiny boxes reminded him of the small rooms monks lived in, which were called cells.'],
  ['biology', /cell|microscop|disease/, 'Antonie van Leeuwenhoek, a Dutch cloth merchant, was the first person to see bacteria, using microscopes he made himself in the 1670s.'],
  ['biology', /diffusion|osmosis|transport/, 'One estimate says your body has around 37 trillion cells, and every single one relies on diffusion to get oxygen in and carbon dioxide out.'],
  ['biology', /enzyme|digest/, 'The word "enzyme" comes from Greek for "in yeast", because they were first studied in fermenting yeast.'],
  ['biology', /photosynth|respiration|bioenerg|plant/, 'About half of the oxygen on Earth is made by tiny plankton in the oceans, not by trees.'],
  ['biology', /heart|blood|lung|organisation/, 'In 1628, William Harvey showed that blood circulates around the body. Before that, many people believed the liver kept making fresh blood that the body used up.'],
  ['biology', /disease|immun|medicine|infection/, 'Edward Jenner tested the first vaccine in 1796, using cowpox. "Vaccine" comes from "vacca", the Latin word for cow.'],
  ['biology', /disease|immun|medicine|infection/, 'Alexander Fleming discovered penicillin in 1928 when mould grew on a dish of bacteria he had left out while he was on holiday. Messy desks: occasionally world-changing.'],
  ['biology', /hormone|homeostasis|glucose/, 'Insulin was discovered in 1921 by Frederick Banting and Charles Best in Toronto. They sold the patent for just $1 each so it could help as many people as possible.'],
  ['biology', /nerv|reflex|homeostasis/, 'Some nerve signals travel at over 100 metres per second. That is roughly ten times faster than Usain Bolt.'],
  ['biology', /inherit|genetic|variation/, 'Gregor Mendel, a monk, worked out the basic rules of inheritance by growing and studying tens of thousands of pea plants in his monastery garden.'],
  ['biology', /inherit|genetic|dna/, 'Rosalind Franklin\'s X-ray image, known as Photo 51, was key to discovering that DNA is shaped like a double helix.'],
  ['biology', /evolution|selective|variation/, 'Charles Darwin studied at Cambridge and spent nearly five years sailing around the world on HMS Beagle, collecting the evidence that led to his theory of evolution.'],
  ['biology', /ecolog|ecosystem|cycle|sampling/, 'A single teaspoon of healthy soil can contain more living organisms than there are people on Earth.'],
  ['englit', /macbeth/, 'Shakespeare probably wrote Macbeth around 1606, partly with King James I in mind. James was so into witches that he wrote a whole book about them called Daemonologie.'],
  ['englit', /macbeth/, 'Actors traditionally refuse to say "Macbeth" inside a theatre and call it "the Scottish play" instead, because of an old superstition that the play is cursed.'],
  ['englit', /christmas carol|scrooge|stave/, 'Dickens wrote A Christmas Carol in about six weeks in 1843, and paid for it to be published himself.'],
  ['englit', /christmas carol|scrooge|stave/, 'When Dickens was 12, his dad was sent to a debtors\' prison and Dickens had to work in a factory sticking labels on pots of boot polish. You can see why he cared so much about poverty.'],
  ['englit', /journey|stanhope|sherriff/, 'R. C. Sherriff served as an officer in the First World War and was wounded at Passchendaele in 1917. He started writing plays to raise money for his rowing club.'],
  ['englit', /power and conflict|poet|poem/, 'Wilfred Owen, who wrote "Exposure", was killed one week before the First World War ended. His mother got the telegram on Armistice Day, as church bells rang for peace.'],
  ['englit', /power and conflict|poet|poem/, 'Percy Shelley wrote "Ozymandias" in 1817 as a friendly competition with his friend Horace Smith, who wrote a sonnet on the same subject. Shelley\'s is the one everyone remembers.'],
  ['englit', /essay|literature/, '"Essay" comes from the French "essayer", meaning "to try". So technically every essay is just an attempt. No pressure.'],
  ['englit|englang', null, 'Shakespeare is credited with the earliest recorded uses of hundreds of English words, including "lonely" and "bedroom".'],
  ['englang', /sound/, 'Animal noises change by language. A dog says "woof" in English, "wan wan" in Japanese and "guau" in Spanish.'],
  ['englang', /sight|colour|light/, 'Homer, the ancient Greek poet, famously described the sea as "wine-dark" rather than blue. Writers have been choosing surprising colour words for about 2,800 years.'],
  ['englang', null, 'The words "run" and "set" have some of the longest entries in the Oxford English Dictionary, with hundreds of meanings each.'],
  ['geography', /tectonic|hazard|earthquake|volcan/, 'Charles Richter created the Richter scale in 1935. Each whole number up means about ten times more ground shaking.'],
  ['geography', /tectonic|hazard|earthquake|volcan/, 'Iceland sits on the Mid-Atlantic Ridge, so it is being pulled apart by about 2 centimetres a year. At Silfra you can snorkel in the gap between two tectonic plates.'],
  ['geography', /weather|climate|rainfall|hazard/, 'The UK\'s highest temperature ever recorded is 40.3°C, at Coningsby in Lincolnshire, in July 2022.'],
  ['geography', /coast/, 'The Holderness coast in Yorkshire is one of the fastest-eroding coastlines in Europe, losing around 1 to 2 metres a year in places.'],
  ['geography', /river|coast/, 'The River Thames used to freeze so solid that Londoners held "frost fairs" on it, with stalls and games on the ice. The last one was in 1814.'],
  ['geography', /urban|population|development|natural increase/, 'Since about 2007, more than half of all the people on Earth have lived in towns and cities.'],
  ['geography', /living world|ecosystem/, 'Tropical rainforests cover a small slice of Earth\'s land, but they are home to around half of its plant and animal species.'],
  ['business', /enterprise|ownership|entrepreneur/, 'James Dyson built 5,127 prototypes of his bagless vacuum cleaner before he got it right. Emmanuel gave up on a sandwich after one attempt.'],
  ['business', /marketing/, 'Nike\'s swoosh logo was designed in 1971 by a student, Carolyn Davidson. She was paid $35.'],
  ['business', /finance|cash|profit|revenue|break-even|margin|return|calculation/, 'Luca Pacioli published the first description of double-entry bookkeeping in 1494. He was friends with Leonardo da Vinci and taught him maths.'],
  ['business', /operations|people/, 'Henry Ford\'s moving assembly line cut the time to build a Model T car from about 12 hours to about an hour and a half.'],
  ['business', /external|finance/, 'The Bank of England, which sets the UK\'s base interest rate, was founded in 1694 to raise money for a war against France.'],
  ['re', /christian/, 'The Bible is the most translated book in the world. The full Bible is available in over 700 languages.'],
  ['re', /christian/, 'The Bible never says what date Jesus was born. The first recorded Christmas on 25 December was in Rome in the 300s AD.'],
  ['re', /islam/, 'The Qur\'an was revealed in Arabic, and many Muslims memorise all of it. Someone who has done that is called a hafiz.'],
  ['re', /islam/, 'Ramadan moves about 11 days earlier each year, because the Islamic calendar follows the Moon.'],
  ['re', /islam/, 'Around two million Muslims perform Hajj, the pilgrimage to Makkah, each year.'],
  ['re', /theme|key term|answering/, 'The word "ethics" comes from the Greek "ethos", meaning character or custom.']];
const SEBF_HEADS = ['Sebastian\'s fun fact', 'Fun fact, from a rat', 'Okay, nerd moment', 'Did you know?', 'Rat fact of the moment', 'Quick history lesson'];
const SEBF_TAILS = ['Emmanuel says he knew that. He did not.', 'I told Emmanuel this and he said "cool" and ate a napkin.', 'Not on the exam. But now you will never forget the topic.',
  'Emmanuel thinks this fact is about him. It is not.', 'I learned that from a book. Well, I ate a book. Same thing.', 'Tell someone that today. Not Emmanuel. He will pretend he already knew.',
  'Derek the pigeon has never heard of this. Derek has never heard of anything.', 'Anyway. Back to it. You are doing great.'];
/* topic facts first, then the rest of the subject; nothing repeats until the subject's facts are used up */
function factPick(text, subj, avoidText, reset = true) {
  const t = String(text).toLowerCase(), mine = f => f[0].split('|').includes(subj);
  const topical = SEB_FACTS.filter(f => mine(f) && f[1] && f[1].test(t)).map(f => f[2]), all = SEB_FACTS.filter(mine).map(f => f[2]);
  if (!all.length) return null;
  const avoid = all.find(x => avoidText && String(avoidText).includes(x));
  const unseenTop = topical.filter(x => x !== avoid && !sebSeen.has(strHash(x)));
  const raw = unseenTop.length ? rnd(unseenTop) : fresh(all, avoid, reset);
  if (!raw) return null;
  sebMark(raw);
  const tail = Math.random() < .4 ? fresh(SEBF_TAILS) : null; if (tail) sebMark(tail);
  return { head: rnd(SEBF_HEADS), text: raw + (tail ? ' ' + tail : '') };
}
const SEBF_CUR = {}, SEBF_CTX = {}; /* the fact on screen for each guide or question, so redraws do not swap it */
function sebFactCard(text, subj, key) {
  if (S.seb === false) return null;
  SEBF_CTX[key] = [text, subj];
  const f = SEBF_CUR[key] || (SEBF_CUR[key] = factPick(text, subj)); if (!f) return null;
  const rat = h('button', { type: 'button', class: 'seb-rat mini', 'data-act': 'sebFact', 'data-k': key, 'aria-label': 'Sebastian. Tap for another fact' }); rat.innerHTML = SEB_SVG;
  return h('section', { class: 'seb fact' }, rat, h('div', { class: 'seb-say', role: 'note' }, h('b', null, f.head), h('p', null, f.text)));
}
/* in practice: every fourth question, once you have answered */
function drillFact() {
  if (!DR || !DR.q || DR.state === 'ask' || DR.count % 4 !== 3) return null;
  const id = DR.q.id, g = STUDY.find(x => x.topics.includes(id));
  return sebFactCard(`${LEARN.name(id)} ${g ? g.title : ''}`, LEARN.trackOf(id), 'd' + id + DR.count);
}
{ const g1 = STUDYACT.guide; STUDYACT.guide = el => { delete SEBF_CUR['g' + el.dataset.id]; g1(el); }; }
PLUSACT.sebFact = el => {
  const k = el.dataset.k, c = SEBF_CTX[k]; if (!c) return;
  const f = factPick(c[0], c[1], SEBF_CUR[k] && SEBF_CUR[k].text); if (!f) return;
  SEBF_CUR[k] = f; const sec = el.closest('.seb');
  sec.querySelector('.seb-say b').textContent = f.head; sec.querySelector('.seb-say p').textContent = f.text;
  el.classList.remove(...SEB_MOVES); void el.offsetWidth; el.classList.add(rnd(SEB_MOVES));
};

/* ---------- One Fix page: topics to retrain, mistakes to redo, marks lost on papers ---------- */
const fixCount = () => S.queue.length + S.mistakes.filter(m => !m.fixed && m.redo <= dkey()).length;
function vFixAll() {
  const open = S.mistakes.filter(m => !m.fixed).sort((a, b) => a.redo < b.redo ? -1 : 1), M = DRAFT.mis, due = open.filter(m => m.redo <= dkey()).length;
  return h('div', { class: 'stack narrow' },
    subHero('Toolkit', 'Fix', 'tools', 'Everything you have got wrong, in one place. Each thing you fix is a mark you take back on the day.'),
    h('div', { class: 'tiles fix-tiles' },
      h('div', { class: 'tile' }, h('b', null, String(S.queue.length)), h('span', null, 'topics to retrain')),
      h('div', { class: 'tile' }, h('b', null, String(due)), h('span', null, 'mistakes to redo today')),
      h('div', { class: 'tile' }, h('b', null, String(S.fixedCount)), h('span', null, 'fixed so far'))),
    card('Topics to retrain', h('span', { class: 'muted' }, 'added automatically'), S.queue.length
      ? [h('p', { class: 'muted xs' }, 'From wrong answers in drills, papers, mocks and your weekly review. Get 3 right in a row on a topic to clear it.'),
        h('ul', { class: 'fixq' }, S.queue.slice().reverse().map(x => h('li', null, h('button', { type: 'button', 'data-act': 'drill', 'data-topic': x.id }, h('b', null, LEARN.name(x.id)), h('small', null, x.why))))),
        B([icon('play'), 'Work through them all'], 'drill', 'primary', { 'data-track': 'fix' })]
      : h('p', { class: 'muted' }, 'Nothing to retrain. Topics you keep missing in practice land here by themselves.')),
    card('Mistakes to redo', h('span', { class: 'muted' }, 'ones you added'), open.length ? fixList(open) : h('p', { class: 'muted' }, 'Nothing waiting. After a paper or homework, add what tripped you up below.'),
      acc('fix-add', h('b', null, 'Add a mistake'), [
        h('div', { class: 'grid2' }, field('Subject', selectSubj('mis.subj', M.subj)), field('Topic', h('input', { 'data-draft': 'mis.topic', value: M.topic, placeholder: 'e.g. Ratio', maxlength: 80 }))),
        field('What went wrong', h('textarea', { rows: 2, 'data-draft': 'mis.note', value: M.note, placeholder: 'e.g. Shared in the wrong order', maxlength: 300 })),
        B('Add · redo in 3 days', 'addMis', 'primary wide')], { open: !open.length })),
    lostCard());
}

/* ---------- One Progress area: Readiness, Learned, This week, Papers ---------- */
const PROG_TABS = [['ready', 'Readiness'], ['stats', 'Learned'], ['week', 'This week'], ['papers', 'Papers']];
const tabRow = (list, cur, label) => h('div', { class: 'chips scroll ptabs', role: 'tablist', 'aria-label': label }, list.map(([t, l]) => chip(l, t === cur, 'go', { 'data-tab': t, role: 'tab', 'aria-selected': String(t === cur) })));
const withTabs = (list, label) => (id, fn) => () => { const v = fn(); const top = v.firstElementChild; if (top) top.after(tabRow(list, id, label)); return v; };
const progView = withTabs(PROG_TABS, 'Progress');
const planView = withTabs([['today', 'Today'], ['plan', 'Your week']], 'Plan');

/* ---------- Profile lives in The Realm ---------- */
function realmProfileCard() {
  const life = lifeSets();
  return h('button', { type: 'button', class: 'card rprof', 'data-act': 'go', 'data-tab': 'profile' }, emblemEl(S.profile.emblem, 'emb'),
    h('span', { class: 'grow' }, h('b', null, S.profile.name || 'Your profile'), h('small', null, `${R0().title ? COSMETICS[R0().title].name : titleFor(life)} · ${badgeCount()} badges · emblems and mastery`)), icon('back', 'rp-go'));
}

/* ---------- Writing feedback: package an answer for Claude to mark like an examiner, then keep the mark and the fix ---------- */
const CLAUDE_URL = 'https://claude.ai/new';
function fbPrompt(c) {
  const lv = c.levels && c.levels.length ? c.levels.map(([lo, hi, d], i) => `- Level ${c.levels.length - i} (${lo === hi ? lo : `${lo}-${hi}`} marks): ${d}`).join('\n') : '';
  return [`You are an experienced AQA GCSE ${c.subj} examiner. Mark my answer${c.max ? ` out of ${c.max}` : ''} the way a real examiner would.`,
    `\nQuestion:\n${c.question.trim()}`,
    c.source && `\nSource / extract the question is about:\n${c.source.trim()}`,
    lv && `\nMark scheme levels (a summary of how the bands read):\n${lv}`,
    c.look && c.look.length && `\nWhat examiners look for:\n${c.look.map(x => '- ' + x).join('\n')}`,
    c.scheme && `\nMark scheme / what the question wants:\n${c.scheme.trim()}`,
    `\nMy answer:\n"""\n${c.answer.trim()}\n"""`,
    `\nPlease reply with:\n1. Mark: X${c.max ? `/${c.max}` : ''}${c.levels ? ' and the level' : ''}, with one sentence saying why.\n2. Two things I did well (quote my words).\n3. The ONE change that would move me up a level. Show me by rewriting one of my sentences.\n4. A short model sentence or paragraph for my weakest part.`,
    `\nKeep it short, honest and specific. I am aiming for a grade ${c.aim}. Do not rewrite my whole answer.`].filter(Boolean).join('\n');
}
const FB = {}; /* the answer each feedback box packages, by key */
function fbBox(key, ctx) {
  FB[key] = ctx;
  const D = DRAFT.fb && DRAFT.fb.k === key ? DRAFT.fb : (DRAFT.fb = { k: key, mark: '', fix: '', note: '' });
  const canShare = !!navigator.share;
  return h('section', { class: 'card fbbox' },
    h('div', { class: 'card-h' }, h('h2', null, 'Get examiner feedback'), h('span', { class: 'pill' }, 'with Claude')),
    h('p', { class: 'muted xs' }, 'Marking your own long answers is hard: you cannot see what you did not do. Send this to Claude and you get a mark, two strengths and the one change that moves you up a level.'),
    h('ol', { class: 'fb-steps' },
      h('li', null, h('b', null, 'Send it. '), canShare ? 'Share it straight to the Claude app, or copy it and paste it into a new chat.' : 'Copy it, then paste it into a new Claude chat.'),
      h('li', null, h('b', null, 'Read the feedback. '), 'Do the rewrite it suggests, in your own words.'),
      h('li', null, h('b', null, 'Come back and save the mark '), 'and the one thing to fix. The fix goes to your Fix page.')),
    h('div', { class: 'row' }, canShare && B([icon('sparkle'), 'Share to Claude'], 'fbShare', 'primary', { 'data-k': key }), B([icon('check'), 'Copy for Claude'], 'fbCopy', canShare ? 'ghost' : 'primary', { 'data-k': key }),
      h('a', { class: 'btn ghost', href: CLAUDE_URL, target: '_blank', rel: 'noopener' }, 'Open Claude')),
    acc('fbsee-' + key, h('b', null, 'See exactly what gets sent'), h('pre', { class: 'fb-pre' }, fbPrompt(ctx))),
    h('div', { class: 'fb-save' }, h('p', { class: 'fb-h' }, 'Got your feedback?'),
      h('div', { class: 'fb-fields' }, field(`Claude's mark${ctx.max ? ` (out of ${ctx.max})` : ''}`, h('input', { type: 'number', inputmode: 'numeric', min: 0, max: ctx.max || 100, 'data-draft': 'fb.mark', value: D.mark })),
        field('The one thing to fix', h('input', { 'data-draft': 'fb.fix', value: D.fix, maxlength: 200, placeholder: 'e.g. explain the effect of each quote' }))),
      field('Paste the feedback to keep it (optional)', h('textarea', { rows: 3, 'data-draft': 'fb.note', value: D.note, maxlength: 4000 })),
      B([icon('check'), 'Save feedback'], 'fbSave', 'primary', { 'data-k': key })));
}
/* in a practice paper: long answers only, once written */
function examFeedback(p, q, E, i) {
  const x = qX(q), m = qMax(q), ans = (x.same ? E.ans[i - 1] : E.ans[i]) || '';
  if (!(q[2].lv || m >= 4) || ans.trim().length < 40) return null;
  const src = [].concat(x.src || []).filter(k => p.src && p.src[k]).map(k => `${p.src[k][0]}\n${p.src[k][1]}`).join('\n\n');
  return fbBox(`ex-${p.id}-${i}`, { subj: p.subj, question: q[1], source: src, levels: q[2].lv || null, look: qTicks(q), max: m, answer: ans, aim: aimOf(p.subj), exam: { pid: p.id, i } });
}
/* anything else: homework, a plan you wrote up, a past-paper answer on paper */
function vFeedback() {
  const F = DRAFT.fbf || (DRAFT.fbf = { subj: 'English Language', max: '', question: '', answer: '', scheme: '' }), past = (S.fbk || []).slice().reverse();
  const ready = F.question.trim().length > 5 && F.answer.trim().length > 40;
  return h('div', { class: 'stack narrow' },
    subHero('Learn', 'Writing feedback', 'write', 'For any long answer: homework, a past paper you did on paper, or practice writing. Practice papers in the app have this built in after you mark.', 'Plans and writing'),
    card('Your answer', null,
      h('div', { class: 'grid2' }, field('Subject', selectSubj('fbf.subj', F.subj)), field('Marks available', h('input', { type: 'number', inputmode: 'numeric', min: 1, max: 60, 'data-draft': 'fbf.max', value: F.max, placeholder: 'e.g. 12' }))),
      field('The question', h('textarea', { rows: 2, 'data-draft': 'fbf.question', value: F.question, maxlength: 1500 })),
      field('Your answer', h('textarea', { rows: 8, 'data-draft': 'fbf.answer', value: F.answer, maxlength: 12000, placeholder: 'Type it, or paste it from your notes' })),
      field('Mark scheme or what the question wants (optional)', h('textarea', { rows: 2, 'data-draft': 'fbf.scheme', value: F.scheme, maxlength: 3000, placeholder: 'Paste the mark scheme if you have it: it makes the mark more accurate' })),
      B('Get it ready for Claude', 'fbReady', 'primary wide')),
    ready && FB_FREE && fbBox('free', { subj: F.subj, question: F.question, answer: F.answer, scheme: F.scheme, max: +F.max || 0, aim: aimOf(F.subj) }),
    past.length > 0 && card('Feedback you have saved', h('span', { class: 'muted' }, String(past.length)),
      past.slice(0, 20).map(f => acc('fbk' + f.id, h('span', { class: 'pl-h' }, h('b', null, f.subj), h('small', null, `${fmtDate(f.date)}${f.mark >= 0 ? ` · ${f.mark}${f.max ? '/' + f.max : ''}` : ''}`)),
        [h('p', null, h('b', null, 'Question: '), f.q), f.fix && h('p', null, h('b', null, 'Fix: '), f.fix), f.note && h('p', { class: 'fb-note' }, f.note)], { cls: 'saved' }))));
}
let FB_FREE = false;
const fbText = k => FB[k] && fbPrompt(FB[k]);
Object.assign(PLUSACT, {
  fbReady() { const F = DRAFT.fbf; if (F.question.trim().length <= 5) return toast('Add the question'); if (F.answer.trim().length <= 40) return toast('Add your answer first'); FB_FREE = true; render(); setTimeout(() => $('.fbbox')?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 80); },
  fbCopy(el) {
    const t = fbText(el.dataset.k); if (!t) return;
    const done = () => toast('Copied. Paste it into a new Claude chat'), ta = () => { const a = h('textarea', { style: 'position:fixed;opacity:0' }); a.value = t; document.body.append(a); a.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Could not copy. Open "See exactly what gets sent" and copy it from there'); } a.remove(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, ta); else ta();
  },
  fbShare(el) { const t = fbText(el.dataset.k); if (t) navigator.share({ text: t }).catch(() => {}); },
  fbSave(el) {
    const k = el.dataset.k, c = FB[k], D = DRAFT.fb; if (!c || !D) return;
    const mark = D.mark === '' ? -1 : Math.round(+D.mark), fix = str(D.fix, 200).trim(), note = str(D.note, 4000).trim();
    if (mark < 0 && !fix && !note) return toast('Add the mark, the fix or the feedback first');
    if (c.max && mark > c.max) return toast(`The mark can be at most ${c.max}`);
    (S.fbk = S.fbk || []).push({ id: newId(), date: dkey(), subj: c.subj, q: str(c.question, 300), mark, max: c.max || 0, fix, note });
    if (S.fbk.length > 60) S.fbk = S.fbk.slice(-60);
    if (fix) S.mistakes.push({ id: newId(), date: dkey(), subj: SUBJ.includes(c.subj) ? c.subj : 'English Language', topic: str(c.question, 60).replace(/\s+/g, ' ').trim(), note: fix, redo: addDays(3), fixed: false });
    const E = S.exam, ex = c.exam;
    if (ex && mark >= 0 && E && E.pid === ex.pid) { const q = paperOf(ex.pid).qs[ex.i]; if (q[2].lv) { E.lv[ex.i] = Math.min(mark, qMax(q)); E.marked[ex.i] = true; } }
    DRAFT.fb = { k, mark: '', fix: '', note: '' }; save();
    toast(fix ? 'Saved. The fix is on your Fix page, back in 3 days' : 'Feedback saved'); render();
  }
});

/* how much a planned set's subject needs doing now (same scale as the session planner) */
function setPriority(label) {
  const M = missionFor(label), tr = M.id === 'lit' ? 'englit' : M.id === 'lang' ? 'englang' : M.id === 're' ? 're' : M.subj;
  if (M.id === 'fixes') return fixCount() ? 30 : -20;
  if (tr === 'science') return Math.max(...['biology', 'chemistry', 'physics'].map(subjPriority));
  return tr && SUBJ_BY[tr] ? subjPriority(tr) : 0;
}

/* ---------- Experimental: features being tried out. Hidden behind a password; only its SHA-256 fingerprint is stored here.
   shortcut: a static app cannot truly protect code, so this hides features from normal users, not from someone reading the source. ---------- */
const LAB_HASH = 'c6743c006b5ff18a6003be3327a25830b367b71714bb16a5c1a99a847820bc4c';
const labOpen = () => { try { return localStorage.getItem('archeron-lab') === LAB_HASH; } catch (e) { return false; } };
async function labTry(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('') === LAB_HASH;
}
function vLab() {
  if (!labOpen()) return h('div', { class: 'stack narrow' },
    subHero('Toolkit', 'Experimental', 'tools', 'Features being tried out before they join the main app.'),
    card('Locked', null, h('p', { class: 'muted xs' }, 'Enter the password to unlock experimental features on this device.'),
      h('form', { class: 'row lab-form', 'data-lab': '1' }, h('input', { id: 'labpw', type: 'password', autocomplete: 'off', placeholder: 'Password', 'aria-label': 'Password' }), h('button', { type: 'submit', class: 'btn primary' }, 'Unlock'))));
  return h('div', { class: 'stack narrow' },
    subHero('Toolkit', 'Experimental', 'tools', 'Features being tried out. They may change or disappear. Tell Claude what works.'),
    h('button', { type: 'button', class: 'card fixlink', 'data-act': 'go', 'data-tab': 'ppp' }, icon('scroll'), h('span', { class: 'grow' }, h('b', null, 'PPP mode'), h('small', null, 'Pure past papers: paper, mark, correct, repeat. No question ever repeats across papers.')), h('span', { class: 'btn primary sm' }, 'Open')),
    B('Lock again on this device', 'labLock', 'link'));
}
document.addEventListener('submit', e => {
  if (!e.target.dataset || !e.target.dataset.lab) return; e.preventDefault();
  const pw = $('#labpw').value;
  labTry(pw).then(ok => { if (ok) { try { localStorage.setItem('archeron-lab', LAB_HASH); } catch (err) {} toast('Experimental unlocked'); render(); } else { toast('Wrong password'); $('#labpw').value = ''; } });
});
PLUSACT.labLock = () => { try { localStorage.removeItem('archeron-lab'); } catch (e) {} go('tools'); };

/* ---------- PPP mode: the paper → mark → correct loop, with papers that never repeat a question ---------- */
function vPPP() {
  if (!labOpen()) return vLab();
  const papers = S.scores.filter(x => /^PPP /.test(x.paper)), sid = sessRank()[0], uniq = (S.pused || []).length;
  const bySubj = {}; for (const p of papers) (bySubj[p.subj] = bySubj[p.subj] || []).push(pctOf(p));
  const corrections = S.queue.length;
  return h('div', { class: 'stack narrow' },
    subHero('Experimental', 'PPP mode', 'lab', 'Pure past papers, done properly: sit a full paper, mark it, then correct every mistake before the next one. Corrections are where the marks come from.', 'Experimental'),
    h('ol', { class: 'ppp-loop' },
      h('li', { class: S.mp && S.mp.ppp ? 'on' : '' }, h('b', null, 'Sit it'), h('small', null, '40 questions, every topic, under exam conditions')),
      h('li', { class: corrections ? 'on' : '' }, h('b', null, 'Correct it'), h('small', null, 'Redo each topic you got wrong until you get 3 right in a row')),
      h('li', null, h('b', null, 'Next paper'), h('small', null, 'Brand new questions, aimed at your weakest subject'))),
    corrections > 0 && card('Corrections first', h('span', { class: 'pill' }, `${corrections} to fix`), h('p', { class: 'muted xs' }, 'Doing another paper before fixing these just repeats the same mistakes. Clear them, then sit the next one.'),
      B([icon('wrench'), 'Do the corrections'], 'drill', 'primary', { 'data-track': 'fix' })),
    S.mp && S.mp.ppp ? card('Paper in progress', null, B([icon('play'), `Carry on: ${TRACK_NAME(S.mp.track)} (question ${S.mp.i + 1})`], 'mpResume', 'primary'))
      : card('Next paper', null, h('p', { class: 'muted xs' }, `Suggested: ${SUBJ_BY[sid].name}, your biggest gap right now.`),
        B([icon('play'), `Start a ${SUBJ_BY[sid].name} paper`], 'mpNew', corrections ? 'ghost' : 'primary', { 'data-track': sid, 'data-ppp': '1' }),
        h('div', { class: 'chips' }, LEARN.SUBJECTS.map(x => chip([icon(x.icon), x.name], false, 'mpNew', { 'data-track': x.id, 'data-ppp': '1' })))),
    Object.keys(S.why || {}).length > 0 && card('Why you lose marks', h('span', { class: 'muted' }, 'all PPP papers'), whyBars(S.why)),
    card('Your PPP record', h('span', { class: 'muted' }, `${papers.length} paper${papers.length === 1 ? '' : 's'}`),
      papers.length ? h('ul', { class: 'list' }, Object.entries(bySubj).map(([s, l]) => h('li', null, h('div', { class: 'grow' }, h('b', null, s), h('small', null, `${l.length} paper${l.length > 1 ? 's' : ''} · latest ${l[l.length - 1]}% · best ${Math.max(...l)}%`)), medal(gradeFor(s, l[l.length - 1]), 'sm'))))
        : h('p', { class: 'muted' }, 'No PPP papers yet. Your first one sets the baseline.'),
      h('p', { class: 'muted xs' }, `${uniq.toLocaleString('en-GB')} different questions used on papers so far. None will appear on another paper until a subject's bank runs out; then the ones you got wrong come back first.`)));
}

/* ---------- PPP self-marking: be the examiner. Compare your answer with the mark scheme, decide the mark, say why you lost it.
   Then the app checks your marking, and your reasons for losing marks build up across papers. ---------- */
const WHY = [['know', "Didn't know it"], ['misread', 'Misread the question'], ['method', 'Wrong method'], ['slip', 'Careless slip'], ['time', 'Rushed or ran out of time']];
const WHY_FIX = { know: 'Learn it: these topics go to Fix, and the guide for each is the place to start.', misread: 'Underline the command word and key numbers before answering. Read the question twice.',
  method: 'Copy the worked method from the mark scheme, then redo a fresh version without looking.', slip: 'Check every answer against the question at the end. Write down working so slips are visible.',
  time: 'Do a timed mock: aim for about a minute per mark, and skip and return to hard questions.' };
const answerText = (q, a) => a === '' || a == null ? '(left blank)' : q.kind === 'mcq' ? q.options[+a] : a;
function vSelfMark(M) {
  const SM = M.self, i = SM.i, q = M.qs[i], done = SM.my.filter(x => x !== null).length;
  return h('div', { class: 'stack narrow' },
    subHero(TRACK_NAME(M.track || 'maths'), 'Mark your paper', 'ppp', null, 'PPP mode'),
    h('div', { class: 'exdots' }, M.qs.map((_, k) => h('button', { type: 'button', class: 'exdot' + (k === i ? ' on' : '') + (SM.my[k] === true ? ' done' : SM.my[k] === false ? ' miss' : ''), 'data-act': 'smGo', 'data-i': k, 'aria-label': `Question ${k + 1}` }))),
    i === 0 && !done && h('div', { class: 'banner' }, icon('sparkle'), h('div', null, h('b', null, 'You are the examiner now'), h('p', null, 'Compare each answer with the mark scheme. Only give the mark if your answer really matches it: examiners do not give the benefit of the doubt. When you lose a mark, say why.'))),
    h('section', { class: 'card qcard' },
      h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, LEARN.name(q.id)), h('span', null, `Question ${i + 1} of ${M.qs.length}`)),
      h('p', { class: 'qtext' }, q.q),
      h('div', { class: 'sm-cols' },
        h('div', { class: 'sm-box mine' }, h('small', null, 'Your answer'), h('b', null, answerText(q, M.ans[i]))),
        h('div', { class: 'sm-box scheme' }, h('small', null, 'Mark scheme'), h('b', null, q.show || String(q.a)),
          q.steps && q.steps.length > 0 && h('ol', { class: 'steps' }, q.steps.map(x => h('li', null, x))))),
      h('div', { class: 'row' }, B([icon('check'), 'I got the mark'], 'smMark', 'ghost grow' + (SM.my[i] === true ? ' on' : ''), { 'data-v': '1' }), B([icon('x'), 'I lost the mark'], 'smMark', 'ghost grow' + (SM.my[i] === false ? ' on' : ''), { 'data-v': '0' })),
      SM.my[i] === false && [h('p', { class: 'fb-h' }, 'Why did you lose it?'), h('div', { class: 'chips' }, WHY.map(([k, l]) => chip(l, SM.why[i] === k, 'smWhy', { 'data-r': k })))]),
    h('div', { class: 'row' }, i > 0 && B('Back', 'smGo', 'ghost', { 'data-i': i - 1 }),
      done === M.qs.length ? B([icon('check'), 'Finish marking'], 'smDone', 'primary grow') : B('Next', 'smGo', 'primary grow', { 'data-i': Math.min(M.qs.length - 1, i + 1), disabled: SM.my[i] === null || (SM.my[i] === false && !SM.why[i]) })),
    h('p', { class: 'muted xs center' }, `${done} of ${M.qs.length} marked. Your place is saved if you leave.`));
}
function selfReport(M, rows) {
  const generous = [], harsh = [], why = {};
  rows.forEach((r, k) => { const me = M.self.my[k]; if (me && !r.ok) generous.push(k + 1); if (me === false && r.ok) harsh.push(k + 1); if (!r.ok && M.self.why[k]) why[M.self.why[k]] = (why[M.self.why[k]] || 0) + 1; });
  for (const [k, n] of Object.entries(why)) S.why[k] = (S.why[k] || 0) + n;
  return { agree: rows.length - generous.length - harsh.length, total: rows.length, generous, harsh, why };
}
function whyBars(why) {
  const tot = Object.values(why).reduce((a, b) => a + b, 0); if (!tot) return null;
  const top = WHY.filter(([k]) => why[k]).sort((a, b) => why[b[0]] - why[a[0]]);
  return [h('ul', { class: 'hbars' }, top.map(([k, l]) => h('li', null, h('div', { class: 'hb-l' }, h('b', null, l)), h('div', { class: 'hb-b' }, h('i', { style: `width:${why[k] / tot * 100}%;background:var(--y)` }), h('span', null, `${why[k]}`))))),
    h('p', { class: 'muted xs' }, h('b', null, 'Biggest fix: '), WHY_FIX[top[0][0]])];
}
function selfCard(R) {
  return card('How you marked', h('span', { class: 'pill' }, `${R.agree}/${R.total} agree with the scheme`),
    h('p', { class: 'muted xs' }, R.generous.length || R.harsh.length ? 'Examiners mark exactly to the scheme. Look again at these:' : 'You marked exactly like an examiner. That is a real skill.'),
    R.generous.length > 0 && h('p', null, h('b', null, 'Too generous on: '), R.generous.map(n => 'Q' + n).join(', '), h('small', { class: 'muted' }, ' (you gave a mark the scheme would not)')),
    R.harsh.length > 0 && h('p', null, h('b', null, 'Too harsh on: '), R.harsh.map(n => 'Q' + n).join(', '), h('small', { class: 'muted' }, ' (your answer was actually right)')),
    Object.keys(R.why).length > 0 && [h('p', { class: 'fb-h' }, 'Why you lost marks on this paper'), whyBars(R.why)]);
}
Object.assign(PLUSACT, {
  smGo(el) { S.mp.self.i = +el.dataset.i; save(); render(); scrollTo({ top: 0 }); },
  smMark(el) { const SM = S.mp.self, v = el.dataset.v === '1'; SM.my[SM.i] = v; if (v) { SM.why[SM.i] = ''; if (SM.i < S.mp.qs.length - 1) SM.i++; } save(); render(); if (v) scrollTo({ top: 0 }); },
  smWhy(el) { const SM = S.mp.self; SM.why[SM.i] = el.dataset.r; if (SM.i < S.mp.qs.length - 1) SM.i++; save(); render(); scrollTo({ top: 0 }); },
  smDone() { MPACT.mpFinish(); }
});
