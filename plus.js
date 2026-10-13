/* Archeron · timed mocks, "Do this now", grade predictor, weekly review.
   Loaded before app.js; everything here runs at render time, so it can use app.js helpers. */
'use strict';
/* Rough AQA boundaries as % of total marks, best grade first. shortcut: one table per tier from recent years; boundaries move every year. */
const BOUNDS = {
  maths: [[5, 73], [4, 55], [3, 38], [2, 24], [1, 11]], /* Foundation Maths, capped at 5 */
  sci: [[5, 62], [4, 48], [3, 33], [2, 20], [1, 9]], /* Combined Science Foundation, per grade */
  open: [[9, 80], [8, 72], [7, 63], [6, 55], [5, 47], [4, 38], [3, 28], [2, 18], [1, 9]] };
const boundsOf = subj => subj === 'Maths' ? BOUNDS.maths : subj === 'Science' ? BOUNDS.sci : BOUNDS.open;
const gradeFor = (subj, pc) => (boundsOf(subj).find(([, p]) => pc >= p) || ['U'])[0];
function predict(subj) {
  const pts = subjPts(subj).slice(-3);
  if (!pts.length) return null;
  const pc = Math.round(pts.reduce((a, s) => a + pctOf(s), 0) / pts.length), nx = boundsOf(subj).slice().reverse().find(([, p]) => p > pc);
  return { pc, g: gradeFor(subj, pc), n: pts.length, next: nx && { g: nx[0], need: nx[1] - pc } };
}
function predictCard() {
  const rows = SUBJ.map(s => [s, predict(s)]);
  return card('Predicted grades', h('span', { class: 'muted' }, 'from your last 3 papers'),
    rows.some(r => r[1]) ? h('ul', { class: 'list' }, rows.map(([s, p]) => h('li', null,
      h('div', { class: 'grow' }, h('b', null, s), h('small', null, p ? `${p.pc}% average over ${p.n} paper${p.n > 1 ? 's' : ''}${p.next ? ` · ${p.next.need}% more for a ${p.next.g}` : ' · top grade on this tier'}` : 'No papers yet')),
      h('div', { class: 'num' }, h('b', null, p ? String(p.g) : '–'), h('small', null, 'grade')))))
      : h('p', { class: 'muted' }, 'Do a paper in Exam practice and your predicted grade appears here.'),
    h('p', { class: 'muted xs' }, 'Rough guide only: it uses recent AQA grade boundaries, which change every year. Maths and Science are Foundation tier, so 5 is the top grade.'));
}

/* Timed mock: the clock on a practice paper ticks in the page without re-rendering */
function mockClock() {
  const E = S.exam; if (!E || !E.end) return null;
  return h('div', { class: 'banner mock' }, icon('flame'), h('div', null, h('b', { id: 'mockclock', role: 'timer' }, mockLeft()), h('p', { class: 'muted xs' }, 'Mock conditions: no notes, no phone. When time is up, stop writing and mark what you have.')));
}
function mockLeft() {
  const s = Math.round((S.exam.end - Date.now()) / 1000);
  return s > 0 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} left` : "Time's up. Pens down and mark what you wrote.";
}
setInterval(() => { const el = document.getElementById('mockclock'); if (el && S.exam && S.exam.end) el.textContent = mockLeft(); }, 1000);

/* "Do this now": one tap plans 25 minutes on the subject that needs it most */
function doNow() {
  const a = activeSession(), s = SUBJ_BY[sessRank()[0]];
  if (!a && !s) return null;
  return h('button', { type: 'button', class: 'practise donow', 'data-act': 'doNow' }, icon('target'),
    h('span', null, h('b', null, a ? 'Do this now: carry on your session' : `Do this now: 25 minutes of ${s.name}`),
      h('small', null, a ? `${sessDone(a)} of ${sessSteps(a)} steps done` : 'Your biggest gap right now. One tap plans it.')));
}

/* Weekly review: this week against last week, and what kept slipping */
function vWeek() {
  const span = (a, b) => { let sets = 0, n = 0, r = 0; for (let i = a; i < b; i++) { const k = addDays(-i), d = S.days[k] || {}; sets += setsOn(k); n += d.qa || 0; r += d.qr || 0; } return { sets, n, pc: n ? Math.round(r / n * 100) : null }; };
  const wk = span(0, 7), pv = span(7, 14), from = addDays(-6), papers = S.scores.filter(x => x.date >= from);
  const slip = weekSlips(), tile = (v, l, sub) => h('div', { class: 'tile' }, h('b', null, v), h('span', null, l), sub && h('small', null, sub));
  const vs = (a, b) => b == null ? null : a === b ? 'same as last week' : a > b ? `up ${a - b} on last week` : `down ${b - a} on last week`;
  return h('div', { class: 'stack narrow' },
    subHero('Toolkit', 'Weekly review', 'tools', 'Best done on Sunday. Look at the week, then send what kept slipping into next week\'s practice.'),
    card('This week', h('span', { class: 'muted' }, `${fmtDate(from)} to today`), h('div', { class: 'tiles' },
      tile(wk.sets, 'sets done', vs(wk.sets, pv.sets)), tile(wk.n, 'questions answered', vs(wk.n, pv.n)),
      tile(wk.pc == null ? '–' : wk.pc + '%', 'right', wk.pc != null ? vs(wk.pc, pv.pc) : null)),
      papers.length ? h('ul', { class: 'list' }, papers.map(p => h('li', null, h('div', { class: 'grow' }, h('b', null, p.paper), h('small', null, `${fmtDate(p.date)} · grade ${gradeFor(p.subj, pctOf(p))}`)), h('div', { class: 'num' }, h('b', null, pctOf(p) + '%')))))
        : h('p', { class: 'muted xs' }, 'No papers this week. One timed paper a week is the best mock practice.')),
    card('Kept slipping', null, slip.length ? [h('div', { class: 'chips' }, slip.map(([id, a]) => chip([LEARN.name(id), h('small', null, ` ${Math.round(a * 100)}%`)], false, 'drill', { 'data-topic': id }))),
      h('p', { class: 'muted xs' }, 'Tap one to practise it now, or send them all to your fix queue. Revision sessions put fix-queue subjects first.'),
      B([icon('wrench'), 'Add these to next week'], 'weekFix', 'primary')]
      : h('p', { class: 'muted' }, 'Nothing is slipping yet. Answer more questions and weak spots show up here.')),
    predictCard());
}
const weekSlips = () => Object.keys(LEARN.TOPIC).filter(id => usable(id) && skill(id).rec.length >= 3)
  .map(id => { const k = skill(id); return [id, k.rec.filter(Boolean).length / k.rec.length]; }).filter(x => x[1] < .7).sort((a, b) => a[1] - b[1]).slice(0, 6);

const PLUSACT = {
  doNow() { if (!activeSession()) { S.sess = makeSession(25, [sessRank()[0]]); save(); } go('session'); scrollTo({ top: 0 }); },
  weekFix() { const n = addFix(weekSlips().map(x => x[0]), 'Weekly review: kept slipping'); toast(n ? `${n} topic${n > 1 ? 's' : ''} added to next week` : 'Already in your fix queue'); render(); }
};
