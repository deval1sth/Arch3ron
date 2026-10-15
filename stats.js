/* Archeron · Stats tab: your numbers for today, this week, this month or all time.
   Reads only what the app already records (day logs, papers, mistakes, readiness snapshots). Loaded before app.js. */
'use strict';

let STAT_P = 'week';
const STAT_PERIODS = [['day', 'Today', 'Today'], ['week', 'Week', 'This week'], ['month', 'Month', 'This month'], ['all', 'All time', 'All time']]; /* id, button, heading */

/* the date range for a period, plus the same stretch of the period before it, so comparisons are fair mid-week */
function statRange(p) {
  const today = dkey(), t = parseKey(today);
  if (p === 'day') return { from: today, to: today, prev: [addDays(-1), addDays(-1)], vs: 'yesterday' };
  if (p === 'week') {
    const mon = wkStart(today), n = Math.round((t - parseKey(mon)) / 864e5);
    return { from: mon, to: today, prev: [addDays(-7, mon), addDays(n - 7, mon)], vs: 'last week' };
  }
  if (p === 'month') {
    const pm = new Date(t.getFullYear(), t.getMonth() - 1, 1), pmLen = new Date(t.getFullYear(), t.getMonth(), 0).getDate();
    return { from: today.slice(0, 8) + '01', to: today, prev: [dkey(pm), dkey(new Date(pm.getFullYear(), pm.getMonth(), Math.min(t.getDate(), pmLen)))], vs: 'last month' };
  }
  const first = [...Object.keys(S.days), ...S.scores.map(s => s.date), ...S.mistakes.map(m => m.date)].filter(isKey).sort()[0];
  return { from: first && first < today ? first : today, to: today, prev: null, vs: '' };
}
function keysBetween(a, b) { const out = []; for (let k = a; k <= b && out.length < 1000; k = addDays(1, k)) out.push(k); return out; }
const studied = k => { const d = S.days[k]; return !!d && (setsOn(k) > 0 || ((d.ev || {}).sets || 0) > 0 || (d.qa || 0) >= 20); };

function statsFor(from, to) {
  const keys = keysBetween(from, to), focus = S.timer.focus || 25;
  const per = keys.map(k => { const d = S.days[k] || {}, ev = d.ev || {}; return { k, sets: Math.max(setsOn(k), ev.sets || 0), plan: daySets(parseKey(k).getDay()), qa: d.qa || 0, qr: d.qr || 0, t: d.t || {}, ev }; });
  const sum = f => per.reduce((a, d) => a + f(d), 0);
  const papers = S.scores.filter(x => x.date >= from && x.date <= to).sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id), pcs = papers.map(pctOf);
  const subj = {}, lost = {}, lostT = {};
  for (const d of per) for (const [t, n] of Object.entries(d.t)) if (SUBJ_BY[t]) subj[t] = (subj[t] || 0) + n;
  let lostSum = 0;
  for (const p of papers) for (const l of p.lost || []) {
    const key = p.subj + '|' + l.topic.toLowerCase();
    lost[key] = lost[key] || { subj: p.subj, topic: l.topic, marks: 0 }; lost[key].marks += l.marks; lostT[l.type] = (lostT[l.type] || 0) + l.marks; lostSum += l.marks;
  }
  const sets = sum(d => d.sets), rescue = Math.min(sets, sum(d => d.ev.rescue || 0)), qa = sum(d => d.qa), qr = sum(d => d.qr);
  return {
    keys, per, sets, plan: sum(d => d.plan), rescue, mins: (sets - rescue) * focus + rescue * 10, qa, qr, acc: qa ? Math.round(qr / qa * 100) : null,
    active: keys.filter(studied).length, fix: sum(d => d.ev.fix || 0), run: Math.max(0, ...per.map(d => d.ev.run || 0)),
    papers, avg: pcs.length ? Math.round(pcs.reduce((a, b) => a + b, 0) / pcs.length) : null, best: pcs.length ? Math.max(...pcs) : null,
    marks: papers.reduce((a, p) => a + p.score, 0), outOf: papers.reduce((a, p) => a + p.max, 0),
    mistakes: S.mistakes.filter(m => m.date >= from && m.date <= to).length,
    subj: Object.entries(subj).sort((a, b) => b[1] - a[1]), lostSum,
    lostT: Object.entries(lostT).sort((a, b) => b[1] - a[1]), lostTop: Object.values(lost).sort((a, b) => b.marks - a.marks).slice(0, 5)
  };
}
function streaks() {
  let cur = 0, k = studied(dkey()) ? dkey() : addDays(-1);
  while (studied(k) && cur < 1000) { cur++; k = addDays(-1, k); }
  let best = 0, run = 0, last = null;
  for (const x of Object.keys(S.days).filter(isKey).sort()) if (studied(x)) { run = last && addDays(1, last) === x ? run + 1 : 1; best = Math.max(best, run); last = x; }
  return { cur, best };
}
const readyBefore = k => { const ks = Object.keys(S.readyLog).filter(x => x < k).sort(); return ks.length ? S.readyLog[ks[ks.length - 1]] : null; };

/* ---------- pieces ---------- */
function stTrend(cur, prev, vs, unit = '') {
  if (!vs || cur == null || prev == null || (!cur && !prev)) return null;
  const d = Math.round((cur - prev) * 10) / 10;
  return h('small', { class: 'trend ' + (d > 0 ? 'up' : d < 0 ? 'down' : '') }, d === 0 ? `same as ${vs}` : `${d > 0 ? '▲' : '▼'} ${Math.abs(d)}${unit} on ${vs}`);
}
const stTile = (v, l, sub) => h('div', { class: 'tile' }, h('b', null, v), h('span', null, l), sub);
function stBars(rows, colourOf, fmt = n => String(n)) {
  const top = Math.max(1, ...rows.map(r => r[1]));
  return h('ul', { class: 'hbars' }, rows.map(([name, n, sub, key]) => h('li', null,
    h('div', { class: 'hb-l' }, h('b', null, name), sub && h('small', null, sub)),
    h('div', { class: 'hb-b' }, h('i', { style: `width:${n / top * 100}%;background:${colourOf(key || name)}` }), h('span', null, fmt(n))))));
}
/* sets each day against the plan; whole weeks for all time */
function activityCard(P, R, st) {
  if (P === 'day') {
    const d = st.per[0];
    return card('Today against your plan', h('span', { class: 'muted' }, `${d.sets} of ${d.plan} sets`),
      bar(d.plan ? d.sets / d.plan * 100 : d.sets ? 100 : 0),
      h('p', { class: 'muted xs' }, !d.plan ? 'No sets planned today. Anything you do is a bonus.' : d.sets >= d.plan ? 'Plan done for today. Anything more is a bonus.' : `${d.plan - d.sets} to go. One set is 25 minutes, then a 5-minute break.`));
  }
  let cols;
  if (P === 'all') {
    const weeks = {};
    for (const d of st.per) { const w = wkStart(d.k); weeks[w] = weeks[w] || { k: w, sets: 0, plan: 0 }; weeks[w].sets += d.sets; weeks[w].plan += d.plan; }
    cols = Object.values(weeks).slice(-26).map((w, i, a) => ({ label: i === 0 || i === a.length - 1 || !(i % 4) ? fmtDate(w.k) : '', title: `Week of ${fmtDate(w.k)}: ${w.sets} sets`, sets: w.sets, plan: w.plan, now: i === a.length - 1 }));
  } else {
    const end = P === 'week' ? addDays(6, R.from) : (() => { const t = parseKey(R.from); return dkey(new Date(t.getFullYear(), t.getMonth() + 1, 0)); })();
    cols = keysBetween(R.from, end).map((k, i) => {
      const d = st.per.find(x => x.k === k), dt = parseKey(k), future = k > R.to;
      return { label: P === 'week' ? DAYN[dt.getDay()] : (i === 0 || dt.getDate() % 5 === 0 || k === R.to ? String(dt.getDate()) : ''), title: `${fmtDate(k)}: ${d ? d.sets : 0} of ${daySets(dt.getDay())} sets`,
        sets: d ? d.sets : 0, plan: daySets(dt.getDay()), future, now: k === R.to };
    });
  }
  const top = Math.max(1, ...cols.map(c => Math.max(c.sets, c.plan)));
  return card(P === 'all' ? 'Sets each week' : 'Sets each day', h('span', { class: 'muted' }, `${st.sets} sets · ${st.plan} planned`),
    h('div', { class: 'st-chart' + (cols.length > 12 ? ' dense' : ''), role: 'img', 'aria-label': cols.map(c => c.title).join('; ') },
      cols.map(c => h('div', { class: 'st-col' + (c.future ? ' future' : '') + (c.now ? ' now' : ''), title: c.title },
        h('div', { class: 'st-bar' }, c.plan > 0 && h('i', { class: 'plan', style: `height:${c.plan / top * 100}%` }), c.sets > 0 && h('i', { class: 'done', style: `height:${c.sets / top * 100}%` })),
        h('small', null, c.label)))),
    h('div', { class: 'wk-key muted xs' }, h('span', { class: 'k done' }), 'sets done', h('span', { class: 'k plan' }), 'planned'));
}
function gradesTable(st) {
  const rows = SUBJ.map(s => {
    const p = predict(s), g = S.grades[s] || {}, rep = String(g.cur || (REPORT[s] || ['–'])[0]), aim = aimOf(s), mine = st.papers.filter(x => x.subj === s);
    return { s, rep, p, aim, mine, avg: mine.length ? Math.round(mine.reduce((a, x) => a + pctOf(x), 0) / mine.length) : null };
  });
  const ok = rows.filter(r => r.p && typeof r.p.g === 'number' && r.p.g >= r.aim).length, tested = rows.filter(r => r.p).length;
  return card('Grades', h('span', { class: 'pill' }, tested ? `${ok} of ${tested} on track` : 'no papers yet'),
    h('div', { class: 'tbl' }, h('table', { class: 'st-grades' },
      h('thead', null, h('tr', null, h('th', null, 'Subject'), h('th', null, 'Report'), h('th', null, 'Papers say'), h('th', null, 'Aim'), h('th', { class: 'num' }, 'Marks here'))),
      h('tbody', null, rows.map(r => h('tr', { class: r.p && typeof r.p.g === 'number' && r.p.g >= r.aim ? 'ok' : '' },
        h('td', null, h('span', { class: 'st-sn' }, h('i', { class: 'sw', style: `background:${SUBJ_COLOR[r.s]}` }), r.s)),
        h('td', null, r.rep), h('td', null, r.p ? h('b', null, String(r.p.g)) : '–'), h('td', null, String(r.aim)),
        h('td', { class: 'num' }, r.avg == null ? '–' : `${r.avg}%`, r.mine.length > 1 && h('small', null, ` (${r.mine.length})`))))))),
    h('p', { class: 'muted xs' }, '"Papers say" uses your last 3 papers in each subject. "Marks here" is your average on papers in this period. Grades are a rough guide from recent AQA boundaries.'));
}
function marksCard(st, R) {
  if (!st.papers.length) return card('Marks', null, h('p', { class: 'muted' }, R.prev ? 'No papers in this period. A timed paper is the best way to see where you really stand.' : 'No papers yet. Log or sit one and your marks appear here.'),
    h('div', { class: 'row' }, B([icon('flame'), 'Sit a paper'], 'go', 'primary sm', { 'data-tab': 'exam' }), B('Log a paper', 'go', 'link', { 'data-tab': 'papers' })));
  const bySubj = {};
  for (const p of st.papers) { bySubj[p.subj] = bySubj[p.subj] || []; bySubj[p.subj].push(pctOf(p)); }
  const subRows = Object.entries(bySubj).map(([s, a]) => [s, Math.round(a.reduce((x, y) => x + y, 0) / a.length), `${a.length} paper${a.length > 1 ? 's' : ''}`]).sort((a, b) => b[1] - a[1]);
  return card('Marks', h('span', { class: 'muted' }, `${st.marks} of ${st.outOf} marks`),
    h('div', { class: 'tiles st-two' }, stTile(`${st.avg}%`, 'average', h('small', null, `over ${st.papers.length} paper${st.papers.length === 1 ? '' : 's'}`)), stTile(`${st.best}%`, 'best paper', h('small', null, `grade ${gradeFor(st.papers.find(p => pctOf(p) === st.best).subj, st.best)}`))),
    h('h3', null, 'Average by subject'), stBars(subRows, s => SUBJ_COLOR[s] || 'var(--y)', n => n + '%'),
    h('h3', null, 'Latest papers'),
    h('ul', { class: 'list st-papers' }, st.papers.slice(0, 6).map(p => h('li', null,
      h('i', { class: 'sw', style: `background:${SUBJ_COLOR[p.subj] || 'var(--m)'}` }),
      h('div', { class: 'grow' }, h('b', null, p.paper), h('small', null, `${fmtDate(p.date)} · ${p.score}/${p.max}`)),
      h('span', { class: 'st-pc' }, `${pctOf(p)}%`, h('small', null, `grade ${gradeFor(p.subj, pctOf(p))}`))))),
    st.papers.length > 6 && h('p', { class: 'muted xs' }, `And ${st.papers.length - 6} more on the Papers tab.`));
}
function practiceCard(st) {
  if (!st.qa) return card('Practice by subject', null, h('p', { class: 'muted' }, 'No questions answered in this period. Learn has quick drills for every subject.'));
  const rows = st.subj.map(([id, n]) => [SUBJ_BY[id].name, n, `${Math.round(n / st.qa * 100)}% of questions`, SUBJ_BY[id].subj]);
  return card('Practice by subject', h('span', { class: 'muted' }, `${st.qa} questions`), stBars(rows, s => SUBJ_COLOR[s] || 'var(--y)'),
    h('p', { class: 'muted xs' }, st.acc == null ? '' : `${st.qr} right out of ${st.qa}: ${st.acc}%.`));
}
function lostMarksCard(st) {
  if (!st.lostSum) return null;
  const top = st.lostTop;
  return card('Where marks went', h('span', { class: 'muted' }, `${st.lostSum} marks lost`),
    h('h3', null, 'By question type'), stBars(st.lostT.map(([k, v]) => [k, v]), () => 'var(--danger)'),
    h('h3', null, 'Topics worth the most'), stBars(top.map(t => [t.topic, t.marks, t.subj, t.subj]), s => SUBJ_COLOR[s] || 'var(--y)'),
    h('div', { class: 'row' }, B([icon('wrench'), 'Fix these'], 'go', 'ghost sm', { 'data-tab': 'fix' })));
}
function recordsCard() {
  const all = statsFor(statRange('all').from, dkey()), sk = streaks();
  const bestDay = all.per.reduce((a, d) => d.sets > (a ? a.sets : 0) ? d : a, null);
  const bestP = S.scores.slice().sort((a, b) => pctOf(b) - pctOf(a))[0];
  const rec = (v, l, sub) => h('li', null, h('b', null, v), h('span', null, l), sub && h('small', null, sub));
  return card('Personal records', h('span', { class: 'muted' }, 'all time'),
    h('ul', { class: 'st-recs' },
      rec(`${sk.best} day${sk.best === 1 ? '' : 's'}`, 'longest streak', sk.cur ? `${sk.cur} right now` : 'start one today'),
      rec(bestDay ? `${bestDay.sets} sets` : '–', 'best day', bestDay && fmtDate(bestDay.k)),
      rec(bestP ? `${pctOf(bestP)}%` : '–', 'best paper', bestP && bestP.paper),
      rec(String(S.stat.bestRun || 0), 'right in a row', 'longest run of right answers'),
      rec(fmtHours(all.mins), 'focused in total', `${all.sets} sets`),
      rec(all.qa.toLocaleString('en-GB'), 'questions answered', all.acc == null ? null : `${all.acc}% right`)));
}

/* ---------- the view ---------- */
function vNumbers() {
  const P = STAT_PERIODS.some(x => x[0] === STAT_P) ? STAT_P : 'week', R = statRange(P), st = statsFor(R.from, R.to), pv = R.prev && statsFor(R.prev[0], R.prev[1]);
  const sk = streaks(), rd = readiness(), rdWas = readyBefore(R.from), label = STAT_PERIODS.find(x => x[0] === P)[2];
  const span = P === 'day' ? fmtDate(R.to) : P === 'all' ? `since ${fmtDate(R.from)}` : `${fmtDate(R.from)} to ${fmtDate(R.to)}`;
  const empty = !st.sets && !st.qa && !st.papers.length;
  return h('div', { class: 'stack numbers' },
    hero('Stats', 'Your numbers', `${label}: ${span}.`),
    h('div', { class: 'st-seg', role: 'tablist', 'aria-label': 'Period' }, STAT_PERIODS.map(([k, l]) =>
      h('button', { type: 'button', class: k === P ? 'on' : '', role: 'tab', 'aria-selected': String(k === P), 'data-act': 'statP', 'data-p': k }, l))),
    h('section', { class: 'card st-head' },
      empty && h('p', { class: 'muted' }, P === 'day' ? 'Nothing logged yet today. One set on Focus starts the numbers moving.' : 'Nothing logged in this period yet. Every set, question and paper you do shows up here.'),
      h('div', { class: 'tiles st-tiles' },
        stTile(String(st.sets), st.sets === 1 ? 'set' : 'sets', st.plan ? h('small', null, `of ${st.plan} planned`) : stTrend(st.sets, pv && pv.sets, R.vs)),
        stTile(fmtHours(st.mins), 'focused', stTrend(Math.round(st.mins / 6) / 10, pv && Math.round(pv.mins / 6) / 10, R.vs, 'h')),
        stTile(st.qa.toLocaleString('en-GB'), 'questions', stTrend(st.qa, pv && pv.qa, R.vs)),
        stTile(st.acc == null ? '–' : st.acc + '%', 'right', stTrend(st.acc, pv && pv.acc, R.vs, '%')),
        stTile(String(st.papers.length), st.papers.length === 1 ? 'paper' : 'papers', st.avg != null ? h('small', null, `average ${st.avg}%`) : null),
        stTile(`${sk.cur}`, 'day streak', h('small', null, P === 'day' ? `best ${sk.best}` : `${st.active} of ${st.keys.length} days studied`)),
        stTile(String(st.fix), st.fix === 1 ? 'topic fixed' : 'topics fixed', h('small', null, `${st.mistakes} mistake${st.mistakes === 1 ? '' : 's'} logged`)),
        stTile(rd.pct + '%', 'mock ready', P === 'all' || rdWas == null ? null : h('small', { class: 'trend ' + (rd.pct > rdWas ? 'up' : rd.pct < rdWas ? 'down' : '') },
          rd.pct === rdWas ? `no change since ${P === 'day' ? 'yesterday' : P === 'week' ? 'Monday' : 'the 1st'}` : `${rd.pct > rdWas ? '▲' : '▼'} ${Math.abs(rd.pct - rdWas)}% since ${P === 'day' ? 'yesterday' : P === 'week' ? 'Monday' : 'the 1st'}`))),
      R.prev && h('p', { class: 'muted xs' }, `Arrows compare with the same stretch of ${R.vs}. Focus time counts 25-minute sets and 10-minute rescue sets.`)),
    activityCard(P, R, st),
    gradesTable(st),
    marksCard(st, R),
    practiceCard(st),
    lostMarksCard(st),
    recordsCard());
}

Object.assign(PLUSACT, {
  statP(el) { if (!STAT_PERIODS.some(x => x[0] === el.dataset.p)) return; STAT_P = el.dataset.p; render(); }
});
