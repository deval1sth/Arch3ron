/* Archeron · app logic. UI is built from DOM nodes (never HTML strings with user data),
   events are delegated via data-act attributes, form drafts survive re-renders. */
'use strict';

const K = 'archeron-v2', OLD = 'nightwatch-v1', TK = 'archeron-timer', TABK = 'archeron-tab';
const $ = s => document.querySelector(s);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- dates ---------- */
const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYFULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dkey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const parseKey = k => new Date(k + 'T12:00');
const addDays = (n, from) => { const d = from ? parseKey(from) : new Date(); d.setDate(d.getDate() + n); return dkey(d); };
const dayNum = k => Math.round(parseKey(k).getTime() / 864e5);
const weekStart = (k = dkey()) => addDays(-((parseKey(k).getDay() + 6) % 7), k);
const fmtDate = k => { const d = parseKey(k); return d.getDate() + ' ' + MON[d.getMonth()]; };
const isKey = k => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k) && !isNaN(parseKey(k));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pctOf = s => Math.round(s.score / s.max * 100);

/* ---------- DOM builder: text is always a text node, so user input cannot inject markup ---------- */
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  add(el, kids);
  if (props) for (const k in props) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'value' || k === 'checked' || k === 'disabled') el[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  return el;
}
function add(el, kids) { for (const c of kids.flat(9)) { if (c == null || c === false || c === '') continue; el.append(c instanceof Node ? c : String(c)); } }
const NS = 'http://www.w3.org/2000/svg';
function svg(view, d, cls) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', view); s.setAttribute('class', cls || 'i'); s.setAttribute('aria-hidden', 'true');
  for (const p of [].concat(d)) { const e = document.createElementNS(NS, 'path'); e.setAttribute('d', p); s.append(e); }
  return s;
}
const icon = (n, cls) => svg('0 0 24 24', ICONS[n], cls);
const B = (label, act, cls = '', extra = {}) => h('button', Object.assign({ type: 'button', class: 'btn ' + cls, 'data-act': act }, extra), label);
const card = (title, right, ...kids) => h('section', { class: 'card' }, (title || right) && h('div', { class: 'card-h' }, title && h('h2', null, title), right), kids);
const chip = (label, on, act, extra = {}) => h('button', Object.assign({ type: 'button', class: 'chip' + (on ? ' on' : ''), 'data-act': act, 'aria-pressed': String(!!on) }, extra), label);
const field = (label, input) => h('label', { class: 'f' }, h('span', null, label), input);
const bar = (p, color) => h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(p) }, h('i', { style: `width:${clamp(p, 0, 100)}%` + (color ? `;background:${color}` : '') }));
const selectSubj = (path, val) => h('select', { 'data-draft': path, value: val }, SUBJ.map(s => h('option', { value: s }, s)));

/* ---------- state + migration ---------- */
function makePlan() {
  const p = {};
  for (let w = 0; w < 7; w++) p[w] = DEFAULT_PLAN[w].map((r, i) => ({ id: `d${w}-${i}`, t: r[0], label: r[1], sets: r[2], kind: r[3] }));
  return p;
}
function freshState() {
  return { v: 2, xp: 0, days: {}, cards: {}, custom: {}, checks: {}, mistakes: [], scores: [], grades: {},
    mock: '2027-01-11', plan: makePlan(), deload: false, timer: { focus: 25, brk: 5 }, focusSets: 0, fixedCount: 0 };
}
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const arr = v => Array.isArray(v) ? v : [];
const num = (v, d = 0) => (v !== '' && v != null && Number.isFinite(+v)) ? +v : d;
const str = (v, max = 200) => String(v ?? '').slice(0, max);
let uid = Date.now();
const newId = () => ++uid;

function normalize(raw) {
  const r = obj(raw), s = freshState();
  s.xp = Math.max(0, Math.round(num(r.xp)));
  s.mock = isKey(r.mock) ? r.mock : s.mock;
  s.focusSets = Math.max(0, num(r.focusSets));
  s.deload = !!r.deload;
  const t = obj(r.timer);
  s.timer = { focus: clamp(Math.round(num(t.focus, 25)), 1, 120), brk: clamp(Math.round(num(t.brk, 5)), 1, 60) };
  for (const [k, c] of Object.entries(obj(r.cards))) { const o = obj(c); if (isKey(o.due)) s.cards[k] = { box: clamp(Math.round(num(o.box)), 0, 5), due: o.due }; }
  for (const [k, v] of Object.entries(obj(r.checks))) if (v) s.checks[k] = true;
  for (const [k, g] of Object.entries(obj(r.grades))) { const o = obj(g); s.grades[k] = { cur: str(o.cur, 8), tgt: str(o.tgt, 8), pct: str(o.pct, 4) }; }
  for (const [k, list] of Object.entries(obj(r.custom))) if (DECKS[k])
    s.custom[k] = arr(list).map(obj).filter(c => c.f && c.b).map(c => ({ id: str(c.id || 'u' + newId(), 30), f: str(c.f, 300), b: str(c.b, 300) }));
  s.mistakes = arr(r.mistakes).map(obj).filter(m => m.topic).map(m => ({
    id: num(m.id, newId()), date: isKey(m.date) ? m.date : dkey(), subj: str(m.subj, 40), topic: str(m.topic, 80),
    note: str(m.note, 300), redo: isKey(m.redo) ? m.redo : dkey(), fixed: !!m.fixed }));
  s.fixedCount = Math.max(num(r.fixedCount), s.mistakes.filter(m => m.fixed).length);
  s.scores = arr(r.scores).map(obj).filter(x => num(x.max) > 0 && Number.isFinite(+x.score)).map(x => ({
    id: num(x.id, newId()), date: isKey(x.date) ? x.date : dkey(), subj: str(x.subj, 40), paper: str(x.paper, 80),
    score: Math.max(0, +x.score), max: +x.max,
    lost: arr(x.lost).map(obj).map(l => ({ topic: str(l.topic, 60), type: str(l.type || 'Recall', 30), marks: Math.max(0, num(l.marks)) })).filter(l => l.topic && l.marks > 0) }));
  const rp = obj(r.plan);
  if (Object.keys(rp).length) for (let w = 0; w < 7; w++) {
    s.plan[w] = arr(rp[w]).map(obj).filter(x => x.id).map(x => {
      const kind = ['train', 'rest', 'other'].includes(x.kind) ? x.kind : 'train';
      return { id: str(x.id, 30), t: str(x.t, 12), label: str(x.label || 'Session', 60), kind, sets: kind === 'train' ? clamp(Math.round(num(x.sets, 1)), 1, 12) : 0 };
    });
  }
  for (const [k, d] of Object.entries(obj(r.days))) {
    if (!isKey(k)) continue;
    const out = { s: {}, f: {} }, src = obj(d);
    if ((r.v || 1) >= 2) {
      for (const [sid, a] of Object.entries(obj(src.s))) if (Array.isArray(a)) out.s[sid] = a.map(Boolean);
      for (const [i, v] of Object.entries(obj(src.f))) if (v) out.f[i] = true;
    } else { /* v1: {0:[..],1:[..],f0:true} keyed by plan index for that weekday */
      const w = parseKey(k).getDay();
      for (const [key, v] of Object.entries(src)) {
        if (/^f\d$/.test(key)) { if (v) out.f[key.slice(1)] = true; }
        else if (Array.isArray(v)) out.s[`d${w}-${key}`] = v.map(Boolean);
      }
    }
    s.days[k] = out;
  }
  return s;
}

let S, bootNote = '';
function store(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
(function load() {
  const raw = read(K);
  try {
    if (raw) S = normalize(JSON.parse(raw));
    else { const old = read(OLD); S = normalize(old ? JSON.parse(old) : {}); if (old) bootNote = 'Your Nightwatch progress moved into Archeron'; }
  } catch (e) {
    store(K + '-unreadable-' + Date.now(), raw || read(OLD) || '');
    S = freshState(); bootNote = 'Saved data could not be read. A copy was kept and a fresh start made.';
  }
})();
let saveWarned = false;
function save() { if (!store(K, JSON.stringify(S)) && !saveWarned) { saveWarned = true; toast('Progress cannot be saved in this browser mode'); } }

/* ---------- training maths ---------- */
const target = s => s.kind !== 'train' ? 0 : S.deload ? Math.ceil(s.sets / 2) : s.sets;
const countDone = (a, n) => (a || []).slice(0, n).filter(Boolean).length;
const dayOf = k => S.days[k] || { s: {}, f: {} };
const ensureDay = k => S.days[k] = S.days[k] || { s: {}, f: {} };
function setsOn(k) { const d = S.days[k]; if (!d) return 0; let n = 0; for (const a of Object.values(d.s)) n += a.filter(Boolean).length; return n; }
function streak() { let n = 0, i = setsOn(dkey()) ? 0 : 1; while (setsOn(addDays(-i))) { n++; i++; } return n; }
function weekSets(back = 0) { const st = addDays(-7 * back, weekStart()); let n = 0; for (let i = 0; i < 7; i++) n += setsOn(addDays(i, st)); return n; }
const daySets = w => S.plan[w].reduce((n, s) => n + target(s), 0);
const weekTarget = () => [0, 1, 2, 3, 4, 5, 6].reduce((n, w) => n + daySets(w), 0);
function weekTotals() { const m = {}; for (const k in S.days) { const n = setsOn(k); if (n) { const w = weekStart(k); m[w] = (m[w] || 0) + n; } } return m; }
function level(x = S.xp) { const l = Math.floor(x / 200) + 1; return { l, rank: RANKS[Math.min(RANKS.length - 1, Math.floor((l - 1) / 3))], into: x % 200 }; }
function xp(n) {
  const before = level().l;
  S.xp = Math.max(0, S.xp + n); save();
  const L = level();
  if (L.l > before) toast(`Level ${L.l} · ${L.rank}`, 'big');
}
function daysLeft() { return Math.ceil((new Date(S.mock + 'T09:00') - new Date()) / 864e5); }

/* ---------- flashcards ---------- */
function cardsOf(k) {
  return [...DECKS[k].cards.map((c, i) => ({ id: k + i, f: c[0], b: c[1] })), ...(S.custom[k] || []).map(c => ({ id: c.id, f: c.f, b: c.b, custom: true }))];
}
function dueCards(k) { const t = dkey(); return cardsOf(k).filter(o => { const s = S.cards[o.id]; return !s || s.due <= t; }); }
const allDue = () => Object.keys(DECKS).reduce((n, k) => n + dueCards(k).length, 0);
const listPct = k => { const L = LISTS[k]; return Math.round(L.items.filter((_, i) => S.checks[k + i]).length / L.items.length * 100); };

/* ---------- timer (wall-clock based, survives reload and phone sleep) ---------- */
const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const tTotal = (m = T.mode) => (m === 'focus' ? S.timer.focus : S.timer.brk) * 60;
let T;
(function loadTimer() {
  try { const t = JSON.parse(read(TK) || 'null'); if (t && (t.mode === 'focus' || t.mode === 'break') && Number.isFinite(t.left)) T = { mode: t.mode, left: t.left, run: !!t.run, end: num(t.end) }; } catch (e) {}
  if (!T) T = { mode: 'focus', left: S.timer.focus * 60, run: false, end: 0 };
})();
const saveT = () => store(TK, JSON.stringify(T));
const RING = 2 * Math.PI * 54;
function paintTimer() {
  const L = Math.ceil(T.left), m = $('#tm'), r = $('#tr');
  if (m) m.textContent = fmt(L);
  if (r) r.style.strokeDashoffset = String(RING * (T.left / tTotal()));
  document.title = T.run ? fmt(L) + ' · Archeron' : 'Archeron';
}
function timerTick() {
  if (!T.run) return;
  T.left = Math.max(0, (T.end - Date.now()) / 1000);
  if (T.left <= 0) timerDone(); else paintTimer();
}
function timerDone() {
  T.run = false; beep();
  if (T.mode === 'focus') { S.focusSets++; xp(5); toast('Focus set done · +5 XP. Tick a set, then rest.'); T.mode = 'break'; }
  else { toast('Break over. Next set when you are ready.'); T.mode = 'focus'; }
  T.left = tTotal(); saveT(); save(); render();
}
function beep() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    [0, .25, .5].forEach(t => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; o.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(.2, a.currentTime + t); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + t + .2); o.start(a.currentTime + t); o.stop(a.currentTime + t + .22); });
  } catch (e) {}
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

/* ---------- UI state (not persisted except tab) ---------- */
let TAB = read(TABK) || 'today';
let CD = { deck: 'mac', flip: false, i: 0 };
let LT = 'mm', PD = new Date().getDay();
const CHART = new Set(S.scores.length ? S.scores.map(s => s.subj).filter(s => SUBJ.includes(s)) : ['Maths']);
const blankScore = (subj = 'Maths') => ({ date: dkey(), subj, paper: '', score: '', max: '80', lost: [] });
const DRAFT = { score: blankScore(), mis: { subj: 'Maths', topic: '', note: '' }, card: { f: '', b: '' }, grades: null };
function setPath(o, path, v) { const p = path.split('.'); for (let i = 0; i < p.length - 1; i++) { o = o[p[i]]; if (!o) return; } o[p[p.length - 1]] = v; }

/* ---------- views ---------- */
function statsRow() {
  const lv = level();
  return h('div', { class: 'stats' },
    h('div', { class: 'stat' }, icon('flame'), h('b', null, streak()), h('small', null, 'day streak')),
    h('div', { class: 'stat' }, icon('dumbbell'), h('b', null, weekSets(), h('span', null, '/' + weekTarget())), h('small', null, 'sets this week')),
    h('div', { class: 'stat' }, icon('bolt'), h('b', null, S.xp), h('small', null, `XP · Lv ${lv.l}`)));
}

function vToday() {
  const t = dkey(), w = new Date().getDay(), day = dayOf(t), lv = level();
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Morning session' : hr < 17 ? 'Afternoon session' : 'Evening session';
  return h('div', { class: 'stack' },
    h('div', { class: 'hero' }, h('p', { class: 'eyebrow' }, `${DAYFULL[w]} ${fmtDate(t)}`), h('h1', null, greet)),
    statsRow(),
    S.deload && h('div', { class: 'banner' }, icon('moon'), h('div', null, h('b', null, 'Deload week'),
      h('p', null, 'Half volume on purpose. Recovery is part of the programme; the strength shows up next week.'))),
    h('div', { class: 'cols' }, timerCard(), setsCard(w, day)),
    h('div', { class: 'cols' },
      card('Rank', h('span', { class: 'muted' }, `${lv.into}/200 to Lv ${lv.l + 1}`),
        h('div', { class: 'rank' }, h('b', null, lv.rank), h('span', null, 'Level ' + lv.l)), bar(lv.into / 2)),
      card('Daily finishers', null, FINISHERS.map((f, i) => h('label', { class: 'chk' + (day.f[i] ? ' d' : '') },
        h('input', { type: 'checkbox', checked: !!day.f[i], 'data-act': 'fin', 'data-i': i }), h('span', null, f), h('em', null, '+5'))))),
    waitingCard(t));
}

function timerCard() {
  const focus = T.mode === 'focus';
  const ring = h('div', { class: 'ring' + (focus ? '' : ' brk') });
  ring.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="trk" cx="60" cy="60" r="54"/><circle id="tr" class="prg" cx="60" cy="60" r="54"/></svg>';
  ring.querySelector('#tr').style.strokeDasharray = String(RING);
  ring.append(h('div', { class: 'ring-c' }, h('div', { id: 'tm', class: 'time', role: 'timer', 'aria-live': 'off' }, fmt(Math.ceil(T.left))), h('small', null, focus ? 'focus set' : 'break')));
  const presets = [[25, 5], [45, 10], [15, 3]];
  return card(focus ? `Focus · ${S.timer.focus} min` : `Break · ${S.timer.brk} min`,
    h('div', { class: 'chips sm' }, presets.map(([f, b]) => chip(`${f}/${b}`, S.timer.focus === f && S.timer.brk === b, 'preset', { 'data-f': f, 'data-b': b, 'aria-label': `${f} minute focus, ${b} minute break` }))),
    ring,
    h('div', { class: 'row center' },
      B(T.run ? [icon('pause'), 'Pause'] : [icon('play'), 'Start'], 'tgl', 'primary'),
      B(icon('reset'), 'rst', 'ghost icon-only', { 'aria-label': 'Reset timer' }),
      B(icon('skip'), 'skip', 'ghost icon-only', { 'aria-label': focus ? 'Skip to break' : 'Skip to focus' })),
    h('p', { class: 'muted center' }, focus ? 'Phone face down. One task. No notes unless the set says so.' : 'Stand up, water, look at something far away.'));
}

function setsCard(w, day) {
  const plan = S.plan[w];
  return card('Today\'s sets', B([icon('edit'), 'Edit plan'], 'go', 'ghost sm', { 'data-tab': 'plan' }),
    plan.length ? plan.map(s => sessionRow(s, day)) : h('p', { class: 'muted' }, 'Nothing planned today. Rest is training too.'));
}
function sessionRow(s, day) {
  if (s.kind !== 'train') return h('div', { class: 'sess ' + (s.kind === 'rest' ? 'is-rest' : 'is-other') },
    h('div', { class: 'sess-t' }, s.t), h('div', { class: 'sess-b' }, h('b', null, s.label)),
    h('span', { class: 'pill' + (s.kind === 'rest' ? ' rest' : '') }, s.kind === 'rest' ? [icon('moon'), 'Earned rest'] : 'Fixed'));
  const n = target(s), done = day.s[s.id] || [], c = countDone(done, n);
  return h('div', { class: 'sess' + (c >= n ? ' complete' : '') },
    h('div', { class: 'sess-t' }, s.t),
    h('div', { class: 'sess-b' }, h('b', null, s.label), h('small', null, `${c}/${n} sets` + (S.deload && s.sets !== n ? ' · deload' : ''))),
    h('div', { class: 'dots' }, Array.from({ length: n }, (_, j) => h('button', { type: 'button', class: 'dot' + (done[j] ? ' on' : ''), 'data-act': 'tick', 'data-sid': s.id, 'data-j': j,
      'aria-pressed': String(!!done[j]), 'aria-label': `Set ${j + 1} of ${n}: ${s.label}` }))));
}
function waitingCard(t) {
  const dueM = S.mistakes.filter(m => !m.fixed && m.redo <= t).length, dueC = allDue();
  return card('Waiting for you', null, h('div', { class: 'tiles2' },
    h('button', { type: 'button', class: 'tile', 'data-act': 'go', 'data-tab': 'fix' }, icon('wrench'), h('b', null, dueM), h('span', null, dueM === 1 ? 'mistake to redo' : 'mistakes to redo')),
    h('button', { type: 'button', class: 'tile', 'data-act': 'go', 'data-tab': 'cards' }, icon('cards'), h('b', null, dueC), h('span', null, dueC === 1 ? 'card due' : 'cards due'))));
}

/* Progress */
function vStats() {
  return h('div', { class: 'stack' }, h('div', { class: 'hero' }, h('p', { class: 'eyebrow' }, 'Progress'), h('h1', null, 'Training log')),
    loadCard(), heatCard(), chartCard(), lostCard(), gradesCard(), logCard(), scoresCard());
}
function loadCard() {
  const tw = weekSets(), lw = weekSets(1), tot = weekTotals(), best = Math.max(0, ...Object.values(tot));
  let life = 0, trained = 0; for (const k in S.days) { const n = setsOn(k); life += n; if (n) trained++; }
  const delta = tw - lw;
  const tile = (ic, v, l, sub) => h('div', { class: 'mini' }, icon(ic), h('b', null, v), h('span', null, l), sub && h('small', null, sub));
  return card('Training load', null, h('div', { class: 'minis' },
    tile('dumbbell', tw, 'sets this week', lw ? (delta > 0 ? `+${delta} on last week` : `last week: ${lw}`) : 'first week logged'),
    tile('trophy', best, 'best week'),
    tile('bolt', life, 'lifetime sets'),
    tile('flame', trained, 'days trained'),
    tile('target', S.focusSets, 'focus sets'),
    tile('wrench', S.fixedCount, 'mistakes fixed')));
}
function heatCard() {
  const today = dkey(), start = addDays(-77, weekStart());
  const cells = Array.from({ length: 84 }, (_, i) => {
    const k = addDays(i, start), n = setsOn(k), fut = k > today;
    const lvl = n === 0 ? 0 : n <= 2 ? 1 : n <= 4 ? 2 : n <= 7 ? 3 : 4;
    return h('i', { class: `l${lvl}` + (fut ? ' fut' : '') + (k === today ? ' now' : ''), title: `${fmtDate(k)}: ${n} sets` });
  });
  return card('Last 12 weeks', h('span', { class: 'legend' }, 'less', [0, 1, 2, 3, 4].map(l => h('i', { class: 'l' + l })), 'more'),
    h('div', { class: 'heat-wrap' }, h('div', { class: 'heat-days' }, ['M', '', 'W', '', 'F', '', 'S'].map(d => h('span', null, d))), h('div', { class: 'heat', role: 'img', 'aria-label': 'Sets per day over the last 12 weeks' }, cells)));
}
function trend(pts) {
  if (pts.length < 2) return null;
  const xs = pts.map(p => dayNum(p.date)), ys = pts.map(pctOf), n = xs.length;
  const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let sxx = 0, sxy = 0; for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); }
  const b = sxx ? sxy / sxx : 0, a = my - b * mx;
  return { at: d => clamp(a + b * d, 0, 100), slope: b };
}
const subjPts = s => S.scores.filter(x => x.subj === s).sort((a, b) => a.date < b.date ? -1 : 1);
function chartCard() {
  const sel = SUBJ.filter(s => CHART.has(s));
  const pace = sel.map(s => {
    const pts = subjPts(s), tg = +(S.grades[s] || {}).pct || 0, tr = trend(pts);
    let msg;
    if (!pts.length) msg = 'No papers logged yet.';
    else if (!tr) msg = `Latest ${pctOf(pts[pts.length - 1])}%. One more paper unlocks a trend.`;
    else if (pts.length < 3) { const d = pctOf(pts[1]) - pctOf(pts[0]); msg = (d > 0 ? `Up ${d}% since your first paper. ` : `Latest ${pctOf(pts[1])}%. `) + 'A third paper unlocks a projection.'; }
    else {
      const p = Math.round(tr.at(dayNum(S.mock)));
      msg = !tg ? `Projected ${p}% by mocks. Add a target % in Me.`
        : p >= tg ? `On pace: projected ${p}% vs target ${tg}%. Keep the reps coming.`
        : `Projected ${p}% vs target ${tg}%: ${tg - p}% to find. Your marks-lost list shows where.`;
    }
    return h('li', null, h('i', { style: `background:${SUBJ_COLOR[s]}` }), h('b', null, s), h('span', null, msg));
  });
  return card('Scores', null,
    h('div', { class: 'chips scroll' }, SUBJ.map(s => chip([h('i', { class: 'sw', style: `background:${SUBJ_COLOR[s]}` }), s], CHART.has(s), 'chart', { 'data-subj': s }))),
    h('canvas', { id: 'ch', role: 'img', 'aria-label': 'Past paper percentages over time with trend lines projected to the mock date' }),
    h('p', { class: 'muted xs' }, 'Solid: your scores. Dashed: trend projected to mocks. Diamond: your target %.'),
    sel.length ? h('ul', { class: 'pace' }, pace) : h('p', { class: 'muted' }, 'Pick a subject above.'));
}
function drawChart() {
  const c = $('#ch'); if (!c) return;
  const dpr = devicePixelRatio || 1, W = c.clientWidth, H = c.clientHeight;
  if (!W || !H) return;
  c.width = W * dpr; c.height = H * dpr;
  const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cs = getComputedStyle(document.documentElement), cm = cs.getPropertyValue('--m').trim(), cl = cs.getPropertyValue('--line').trim(), ct = cs.getPropertyValue('--t').trim(), cy = cs.getPropertyValue('--y').trim();
  const sel = SUBJ.filter(s => CHART.has(s)), all = S.scores.filter(s => CHART.has(s.subj)), today = dkey();
  let x0 = dayNum(addDays(-28)), x1 = Math.max(dayNum(S.mock), dayNum(today) + 7);
  for (const s of all) { x0 = Math.min(x0, dayNum(s.date)); x1 = Math.max(x1, dayNum(s.date)); }
  const L = 40, R = 16, Tp = 18, Bt = 26, px = d => L + (W - L - R) * (d - x0) / ((x1 - x0) || 1), py = v => Tp + (H - Tp - Bt) * (1 - v / 100);
  x.font = '11px system-ui, -apple-system, "Segoe UI", sans-serif'; x.lineWidth = 1;
  x.textAlign = 'right'; x.textBaseline = 'middle';
  for (let v = 0; v <= 100; v += 25) { x.strokeStyle = cl; x.beginPath(); x.moveTo(L, py(v)); x.lineTo(W - R, py(v)); x.stroke(); x.fillStyle = cm; x.fillText(v + '%', L - 8, py(v)); }
  x.textAlign = 'center'; x.textBaseline = 'top';
  const d0 = new Date(x0 * 864e5);
  for (let m = new Date(d0.getFullYear(), d0.getMonth() + 1, 1, 12); dayNum(dkey(m)) <= x1; m.setMonth(m.getMonth() + 1)) {
    const X = px(dayNum(dkey(m))); x.fillStyle = cm; x.fillText(MON[m.getMonth()], X, H - Bt + 8);
    x.strokeStyle = cl; x.beginPath(); x.moveTo(X, H - Bt); x.lineTo(X, H - Bt + 4); x.stroke();
  }
  const tx = px(dayNum(today)); x.strokeStyle = cm; x.globalAlpha = .35; x.beginPath(); x.moveTo(tx, Tp); x.lineTo(tx, H - Bt); x.stroke(); x.globalAlpha = 1;
  x.fillStyle = cm; x.fillText('today', tx, 2);
  const mxp = px(dayNum(S.mock)); x.setLineDash([3, 4]); x.strokeStyle = cy; x.beginPath(); x.moveTo(mxp, Tp); x.lineTo(mxp, H - Bt); x.stroke(); x.setLineDash([]);
  x.fillStyle = cy; x.textAlign = mxp > W - 40 ? 'right' : 'center'; x.fillText('mocks', Math.min(mxp, W - R), 2);
  if (!all.length) { x.fillStyle = cm; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Log a past paper to start your chart', (L + W - R) / 2, H / 2); return; }
  for (const s of sel) {
    const pts = subjPts(s), col = SUBJ_COLOR[s], tr = trend(pts), tg = +(S.grades[s] || {}).pct || 0;
    if (tr && pts.length >= 3) { const a = dayNum(pts[0].date), b = dayNum(S.mock); x.setLineDash([6, 6]); x.strokeStyle = col; x.globalAlpha = .55; x.lineWidth = 2; x.beginPath(); x.moveTo(px(a), py(tr.at(a))); x.lineTo(px(b), py(tr.at(b))); x.stroke(); x.setLineDash([]); x.globalAlpha = 1; }
    if (tg) { const X = mxp, Y = py(clamp(tg, 0, 100)); x.fillStyle = col; x.beginPath(); x.moveTo(X, Y - 6); x.lineTo(X + 6, Y); x.lineTo(X, Y + 6); x.lineTo(X - 6, Y); x.closePath(); x.fill(); }
    if (!pts.length) continue;
    x.strokeStyle = col; x.lineWidth = 2.5; x.lineJoin = 'round'; x.beginPath();
    pts.forEach((p, i) => { const X = px(dayNum(p.date)), Y = py(pctOf(p)); i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.stroke();
    pts.forEach(p => { const X = px(dayNum(p.date)), Y = py(pctOf(p)); x.fillStyle = col; x.beginPath(); x.arc(X, Y, 4.5, 0, 7); x.fill();
      if (sel.length === 1) { x.fillStyle = ct; x.textAlign = 'center'; x.textBaseline = 'bottom'; x.fillText(pctOf(p) + '%', X, Y - 8); } });
  }
}
function lostCard() {
  const byTopic = {}, byType = {};
  let total = 0;
  for (const s of S.scores) for (const l of s.lost) {
    const k = s.subj + '|' + l.topic.toLowerCase();
    byTopic[k] = byTopic[k] || { subj: s.subj, topic: l.topic, marks: 0 }; byTopic[k].marks += l.marks;
    byType[l.type] = (byType[l.type] || 0) + l.marks; total += l.marks;
  }
  const topics = Object.values(byTopic).sort((a, b) => b.marks - a.marks).slice(0, 8);
  const types = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  if (!total) return card('Marks lost', null, h('p', { class: 'muted' }, 'When you log a paper, add where the marks went. This turns into a ranked list of the topics worth the most marks to fix.'));
  const top = topics[0].marks, open = new Set(S.mistakes.filter(m => !m.fixed).map(m => m.subj + '|' + m.topic.toLowerCase()));
  return card('Marks lost', h('span', { class: 'muted' }, total + ' marks mapped'),
    h('h3', null, 'By topic: biggest wins first'),
    h('ul', { class: 'hbars' }, topics.map(t => h('li', null,
      h('div', { class: 'hb-l' }, h('b', null, t.topic), h('small', null, t.subj)),
      h('div', { class: 'hb-b' }, h('i', { style: `width:${t.marks / top * 100}%;background:${SUBJ_COLOR[t.subj] || 'var(--y)'}` }), h('span', null, t.marks)),
      open.has(t.subj + '|' + t.topic.toLowerCase()) ? h('span', { class: 'pill' }, 'In fixes')
        : B([icon('plus'), 'Fix'], 'lost2fix', 'ghost sm', { 'data-subj': t.subj, 'data-topic': t.topic })))),
    h('h3', null, 'By question type'),
    h('ul', { class: 'hbars types' }, types.map(([k, v]) => h('li', null, h('div', { class: 'hb-l' }, h('b', null, k)),
      h('div', { class: 'hb-b' }, h('i', { style: `width:${v / types[0][1] * 100}%` }), h('span', null, Math.round(v / total * 100) + '%'))))));
}
function gradesCard() {
  return card('Grades', B('Edit', 'go', 'ghost sm', { 'data-tab': 'me' }), h('div', { class: 'tbl' }, h('table', null,
    h('tr', null, h('th', null, 'Subject'), h('th', null, 'Now'), h('th', null, 'Target'), h('th', null, 'Best')),
    SUBJ.map(s => { const g = S.grades[s] || {}, b = subjPts(s).map(pctOf);
      return h('tr', null, h('td', null, h('i', { class: 'sw', style: `background:${SUBJ_COLOR[s]}` }), s), h('td', null, g.cur || '–'), h('td', { class: 'y' }, g.tgt || '–'), h('td', null, b.length ? Math.max(...b) + '%' : '–')); }))),
    h('p', { class: 'muted xs' }, 'Stored on this device only.'));
}
function logCard() {
  const D = DRAFT.score;
  return card('Log a past paper', null,
    h('div', { class: 'grid2' }, field('Date', h('input', { type: 'date', 'data-draft': 'score.date', value: D.date })), field('Subject', selectSubj('score.subj', D.subj))),
    field('Paper', h('input', { 'data-draft': 'score.paper', value: D.paper, placeholder: 'e.g. Paper 1 non-calc, June 2023', maxlength: 80 })),
    h('div', { class: 'grid2' },
      field('Score', h('input', { type: 'number', inputmode: 'decimal', min: 0, 'data-draft': 'score.score', value: D.score, id: 'sc' })),
      field('Out of', h('input', { type: 'number', inputmode: 'numeric', min: 1, 'data-draft': 'score.max', value: D.max }))),
    h('div', { class: 'lost' },
      h('div', { class: 'lost-h' }, h('b', null, 'Where did the marks go?'), h('small', null, 'Optional. Feeds your marks-lost analysis.')),
      D.lost.map((l, i) => h('div', { class: 'lost-row' },
        h('input', { 'data-draft': `score.lost.${i}.topic`, value: l.topic, placeholder: 'Topic, e.g. Ratio', 'aria-label': 'Topic', maxlength: 60 }),
        h('select', { 'data-draft': `score.lost.${i}.type`, value: l.type, 'aria-label': 'Question type' }, QTYPES.map(q => h('option', { value: q }, q))),
        h('input', { type: 'number', min: 0, inputmode: 'numeric', 'data-draft': `score.lost.${i}.marks`, value: l.marks, placeholder: 'Marks', 'aria-label': 'Marks lost' }),
        B(icon('x'), 'lostDel', 'ghost icon-only', { 'data-i': i, 'aria-label': 'Remove row' }))),
      B([icon('plus'), 'Add where marks went'], 'lostAdd', 'ghost sm')),
    B('Log score · +25 XP', 'addScore', 'primary wide'));
}
function scoresCard() {
  const rec = [...S.scores].sort((a, b) => a.date < b.date ? 1 : -1);
  return card('All papers', h('span', { class: 'muted' }, rec.length + ' logged'), rec.length ? h('ul', { class: 'list' }, rec.map(s => h('li', null,
    h('i', { class: 'sw', style: `background:${SUBJ_COLOR[s.subj] || 'var(--m)'}` }),
    h('div', { class: 'grow' }, h('b', null, s.subj), h('small', null, [fmtDate(s.date), s.paper].filter(Boolean).join(' · '))),
    h('div', { class: 'num' }, h('b', null, pctOf(s) + '%'), h('small', null, `${s.score}/${s.max}`)),
    B(icon('x'), 'delScore', 'ghost icon-only', { 'data-id': s.id, 'aria-label': `Delete ${s.subj} paper from ${fmtDate(s.date)}` }))))
    : h('p', { class: 'muted' }, 'No papers logged yet. Your first full one is on the plan for Saturday.'));
}

/* Cards */
function vCards() {
  const list = dueCards(CD.deck), D = DECKS[CD.deck], all = cardsOf(CD.deck);
  let body;
  if (!all.length) body = h('div', { class: 'card empty' }, h('b', null, D.name + ' is empty'), h('p', { class: 'muted' }, D.note || 'Add your first card below.'));
  else if (!list.length) {
    const strong = all.filter(c => (S.cards[c.id] || {}).box >= 3).length;
    body = h('div', { class: 'card empty' }, h('b', null, `All ${D.name} cards done for today`), h('p', { class: 'muted' }, `${strong}/${all.length} strongly learned. Spacing is the point: come back tomorrow.`));
  } else {
    const o = list[CD.i % list.length], box = (S.cards[o.id] || { box: 0 }).box;
    body = [
      h('button', { type: 'button', class: 'flash' + (CD.flip ? ' flipped' : ''), 'data-act': 'flip', 'aria-label': 'Flashcard. Tap to flip' },
        h('div', { class: 'flash-in' },
          h('div', { class: 'face front' }, h('span', { class: 'deck-n' }, D.name), h('p', null, o.f), h('small', null, 'Say it out loud, then tap')),
          h('div', { class: 'face back', 'aria-live': 'polite' }, h('span', { class: 'deck-n' }, o.f), h('p', null, o.b)))),
      h('div', { class: 'row center rate', id: 'rate', hidden: !CD.flip },
        B('Again soon', 'rate', 'ghost', { 'data-ok': 0 }), B('Got it · +2', 'rate', 'primary', { 'data-ok': 1 })),
      h('div', { class: 'boxes', 'aria-label': `Box ${box} of 5` }, [0, 1, 2, 3, 4, 5].map(b => h('i', { class: b <= box ? 'on' : '' }))),
      h('p', { class: 'muted center xs' }, `${list.length} due · box ${box}/5 · keys: space flips, 1 again, 2 got it`)];
  }
  const C = DRAFT.card, mine = S.custom[CD.deck] || [];
  return h('div', { class: 'stack' },
    h('div', { class: 'hero' }, h('p', { class: 'eyebrow' }, 'Spaced repetition'), h('h1', null, 'Cards')),
    h('div', { class: 'chips scroll' }, Object.keys(DECKS).map(k => chip([DECKS[k].name, h('span', { class: 'n' }, dueCards(k).length)], k === CD.deck, 'deck', { 'data-deck': k }))),
    body,
    h('details', { class: 'card', open: !all.length || null },
      h('summary', null, h('h2', null, `Add to ${D.name}`), h('span', { class: 'muted' }, mine.length + ' of your own')),
      D.note && all.length ? h('p', { class: 'muted xs' }, D.note) : null,
      field('Front (quote or prompt)', h('textarea', { rows: 2, 'data-draft': 'card.f', value: C.f, maxlength: 300 })),
      field('Back (who, when, why it matters)', h('textarea', { rows: 2, 'data-draft': 'card.b', value: C.b, maxlength: 300 })),
      B([icon('plus'), 'Add card'], 'addCard', 'primary'),
      mine.length ? h('ul', { class: 'list' }, mine.map(c => h('li', null, h('div', { class: 'grow' }, h('b', null, c.f), h('small', null, c.b)),
        B(icon('x'), 'delCard', 'ghost icon-only', { 'data-id': c.id, 'aria-label': 'Delete card' })))) : null));
}

/* Lists */
function vLists() {
  const L = LISTS[LT], p = listPct(LT);
  return h('div', { class: 'stack' },
    h('div', { class: 'hero' }, h('p', { class: 'eyebrow' }, 'Coverage'), h('h1', null, 'Checklists')),
    h('div', { class: 'chips scroll' }, Object.keys(LISTS).map(k => chip([LISTS[k].name, h('span', { class: 'n' }, listPct(k) + '%')], k === LT, 'list', { 'data-k': k }))),
    card(L.name, h('b', { class: 'y' }, p + '%'), bar(p),
      h('div', { class: 'checks' }, L.items.map((it, i) => { const on = !!S.checks[LT + i];
        return h('label', { class: 'chk' + (on ? ' d' : '') }, h('input', { type: 'checkbox', checked: on, 'data-act': 'chk', 'data-i': i }), h('span', null, it), h('em', null, '+3')); })),
      h('p', { class: 'muted xs' }, 'Only tick a topic when you can do an exam question on it without notes.')));
}

/* Fixes */
function vFix() {
  const t = dkey(), open = S.mistakes.filter(m => !m.fixed).sort((a, b) => a.redo < b.redo ? -1 : 1), due = open.filter(m => m.redo <= t).length, M = DRAFT.mis;
  return h('div', { class: 'stack' },
    h('div', { class: 'hero' }, h('p', { class: 'eyebrow' }, 'Redo loop'), h('h1', null, 'Fixes')),
    h('div', { class: 'cols' },
      card('Add a mistake', null,
        h('div', { class: 'grid2' }, field('Subject', selectSubj('mis.subj', M.subj)), field('Topic', h('input', { 'data-draft': 'mis.topic', value: M.topic, placeholder: 'e.g. Ratio', maxlength: 80 }))),
        field('What went wrong', h('textarea', { rows: 2, 'data-draft': 'mis.note', value: M.note, placeholder: 'e.g. Shared in the wrong order', maxlength: 300 })),
        B('Add · redo in 3 days', 'addMis', 'primary wide')),
      card('Redo list', h('span', { class: 'muted' }, `${due} due · ${S.fixedCount} fixed so far`),
        open.length ? h('ul', { class: 'list' }, open.map(m => { const isDue = m.redo <= t;
          return h('li', { class: isDue ? 'due' : '' },
            h('div', { class: 'grow' }, h('b', null, `${m.subj}: ${m.topic}`), m.note && h('small', null, m.note), h('small', { class: isDue ? 'y' : '' }, isDue ? 'Ready to redo' : 'Redo on ' + fmtDate(m.redo))),
            isDue ? h('div', { class: 'row nowrap' }, B('Fixed · +15', 'misOk', 'primary sm', { 'data-id': m.id }), B('Again', 'misAgain', 'ghost sm', { 'data-id': m.id }))
              : B(icon('x'), 'misDel', 'ghost icon-only', { 'data-id': m.id, 'aria-label': 'Delete mistake' })); }))
          : h('p', { class: 'muted' }, 'Nothing waiting. After every paper or 5-a-day, add what you got wrong. Each one is a mark you can win back.'))));
}

/* Plan editor */
function vPlan() {
  const w = PD, plan = S.plan[w];
  const kinds = [['train', 'Training'], ['rest', 'Rest'], ['other', 'Fixed (e.g. tutoring)']];
  return h('div', { class: 'stack' },
    h('div', { class: 'hero' }, B([icon('back'), 'Today'], 'go', 'ghost sm', { 'data-tab': 'today' }), h('h1', null, 'Training plan')),
    card('Week', h('span', { class: 'muted' }, weekTarget() + ' sets / week'),
      h('div', { class: 'chips scroll' }, [1, 2, 3, 4, 5, 6, 0].map(d => chip([DAYN[d], h('span', { class: 'n' }, daySets(d))], d === w, 'planDay', { 'data-d': d }))),
      h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: S.deload, 'data-act': 'deload', role: 'switch' }),
        h('span', null, h('b', null, 'Deload week'), h('small', null, 'Halves every session. Planned recovery, not a step back.')))),
    card(DAYFULL[w], null,
      plan.length ? h('ul', { class: 'plan' }, plan.map((s, i) => h('li', { class: 'plan-row k-' + s.kind },
        h('input', { class: 'p-time', value: s.t, 'aria-label': 'Time', 'data-act': 'planEdit', 'data-sid': s.id, 'data-field': 't', maxlength: 12 }),
        h('input', { class: 'p-label', value: s.label, 'aria-label': 'Session', 'data-act': 'planEdit', 'data-sid': s.id, 'data-field': 'label', maxlength: 60 }),
        h('select', { class: 'p-kind', 'aria-label': 'Type', 'data-act': 'planEdit', 'data-sid': s.id, 'data-field': 'kind', value: s.kind }, kinds.map(([v, l]) => h('option', { value: v }, l))),
        s.kind === 'train' ? h('div', { class: 'stepper' },
          B('−', 'planSets', 'ghost icon-only', { 'data-sid': s.id, 'data-d': -1, 'aria-label': 'Fewer sets', disabled: s.sets <= 1 }),
          h('span', null, s.sets + (s.sets === 1 ? ' set' : ' sets')),
          B('+', 'planSets', 'ghost icon-only', { 'data-sid': s.id, 'data-d': 1, 'aria-label': 'More sets', disabled: s.sets >= 12 }))
          : h('span', { class: 'pill' + (s.kind === 'rest' ? ' rest' : '') }, s.kind === 'rest' ? 'Rest' : 'No sets'),
        h('div', { class: 'p-move' },
          B(icon('up'), 'planMove', 'ghost icon-only', { 'data-sid': s.id, 'data-d': -1, 'aria-label': 'Move up', disabled: i === 0 }),
          B(icon('down'), 'planMove', 'ghost icon-only', { 'data-sid': s.id, 'data-d': 1, 'aria-label': 'Move down', disabled: i === plan.length - 1 }),
          B(icon('x'), 'planDel', 'ghost icon-only', { 'data-sid': s.id, 'aria-label': 'Delete session' })))))
        : h('p', { class: 'muted' }, 'A full rest day. Add a session if you want one.'),
      h('div', { class: 'row' }, B([icon('plus'), 'Session'], 'planAdd', 'ghost', { 'data-kind': 'train' }), B([icon('moon'), 'Rest block'], 'planAdd', 'ghost', { 'data-kind': 'rest' }))),
    h('p', { class: 'muted xs center' }, 'Ticks are attached to each session, so editing the plan never wipes past progress.'),
    h('div', { class: 'row center' }, B('Reset to the starting plan', 'planReset', 'ghost sm')));
}

/* Me */
function vMe() {
  if (!DRAFT.grades) DRAFT.grades = Object.fromEntries(SUBJ.map(s => [s, Object.assign({ cur: '', tgt: '', pct: '' }, S.grades[s])]));
  const G = DRAFT.grades;
  return h('div', { class: 'stack' },
    h('div', { class: 'hero' }, h('p', { class: 'eyebrow' }, 'Settings'), h('h1', null, 'Me')),
    h('div', { class: 'cols' },
      card('My grades', null, h('p', { class: 'muted xs' }, 'Saved only on this device. Target % is what you aim for on past papers; it shows on your chart.'),
        h('div', { class: 'tbl' }, h('table', { class: 'edit' }, h('tr', null, h('th', null, 'Subject'), h('th', null, 'Now'), h('th', null, 'Target'), h('th', null, 'Target %')),
          SUBJ.map((s, i) => h('tr', null, h('td', null, s),
            h('td', null, h('input', { 'data-draft': `grades.${s}.cur`, value: G[s].cur, maxlength: 8, 'aria-label': s + ' current grade' })),
            h('td', null, h('input', { 'data-draft': `grades.${s}.tgt`, value: G[s].tgt, maxlength: 8, 'aria-label': s + ' target grade' })),
            h('td', null, h('input', { type: 'number', min: 0, max: 100, inputmode: 'numeric', 'data-draft': `grades.${s}.pct`, value: G[s].pct, 'aria-label': s + ' target percent' })))))),
        B('Save grades', 'saveGrades', 'primary')),
      h('div', { class: 'stack' },
        card('Programme', null,
          field('Mocks start', h('input', { type: 'date', value: S.mock, 'data-act': 'mock' })),
          h('div', { class: 'grid2' },
            field('Focus minutes', h('input', { type: 'number', min: 1, max: 120, value: S.timer.focus, 'data-act': 'tlen', 'data-k': 'focus' })),
            field('Break minutes', h('input', { type: 'number', min: 1, max: 60, value: S.timer.brk, 'data-act': 'tlen', 'data-k': 'brk' }))),
          h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: S.deload, 'data-act': 'deload', role: 'switch' }),
            h('span', null, h('b', null, 'Deload week'), h('small', null, 'Half volume for recovery.'))),
          B([icon('edit'), 'Edit weekly plan'], 'go', 'ghost', { 'data-tab': 'plan' })),
        card('Backup', null, h('p', { class: 'muted xs' }, 'Progress lives in this browser. Back up weekly, and use it to move devices.'),
          h('div', { class: 'row' }, B([icon('download'), 'Download'], 'exp', 'primary'),
            h('label', { class: 'btn ghost' }, icon('upload'), 'Restore', h('input', { type: 'file', accept: '.json,application/json', 'data-act': 'imp', class: 'sr' })))),
        card('Install', null, h('p', { class: 'muted xs' }, h('b', null, 'iPhone: '), 'Safari → Share → Add to Home Screen.', h('br'), h('b', null, 'Android: '), 'Chrome menu ⋮ → Install app.')),
        card('Start over', null, h('p', { class: 'muted xs' }, 'Wipes everything on this device. Download a backup first.'), B('Reset everything', 'reset', 'ghost danger')))));
}

/* ---------- shell ---------- */
const TABS = [['today', 'home', 'Today'], ['stats', 'chart', 'Progress'], ['cards', 'cards', 'Cards'], ['lists', 'check', 'Lists'], ['fix', 'wrench', 'Fixes'], ['me', 'user', 'Me']];
const VIEWS = { today: vToday, stats: vStats, cards: vCards, lists: vLists, fix: vFix, me: vMe, plan: vPlan };
if (!VIEWS[TAB]) TAB = 'today';
let renderedDay = dkey();

function hdr() {
  const d = daysLeft(), el = $('#cd');
  el.replaceChildren(d > 0 ? h('b', null, d) : h('b', null, 'Mocks'), h('span', null, d > 0 ? (d === 1 ? 'day to mocks' : `days to mocks · ${Math.floor(d / 7)} wks`) : 'you have trained for this'));
}
function navPaint() {
  const nav = $('#nav');
  if (!nav.childElementCount) nav.append(...TABS.map(([k, ic, l]) => h('button', { type: 'button', 'data-act': 'go', 'data-tab': k }, icon(ic), h('span', null, l))));
  const cur = TAB === 'plan' ? 'today' : TAB;
  for (const b of nav.children) { const on = b.dataset.tab === cur; b.classList.toggle('on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); }
}
function focusKey(el) {
  if (!el || el === document.body || !el.closest('#view')) return null;
  if (el.id) return '#' + CSS.escape(el.id);
  const parts = ['act', 'draft', 'sid', 'j', 'i', 'id', 'tab', 'k', 'd', 'deck', 'subj', 'field', 'ok'].filter(a => el.dataset[a] != null).map(a => `[data-${a}="${CSS.escape(el.dataset[a])}"]`);
  return parts.length ? el.tagName.toLowerCase() + parts.join('') : null;
}
function render(o = {}) {
  const fk = o.enter ? null : focusKey(document.activeElement);
  renderedDay = dkey();
  hdr();
  const view = $('#view');
  view.replaceChildren(VIEWS[TAB]());
  view.classList.remove('enter'); if (o.enter && !REDUCED) { void view.offsetWidth; view.classList.add('enter'); }
  navPaint();
  if (TAB === 'stats') drawChart();
  if (TAB === 'today') paintTimer();
  if (fk) { const e = view.querySelector(fk); if (e) e.focus({ preventScroll: true }); }
  if (o.pulse) { const e = view.querySelector(o.pulse); if (e) e.classList.add('pop'); }
}
function go(t) { if (!VIEWS[t]) return; TAB = t; if (t !== 'plan') store(TABK, t); if (t === 'plan') PD = new Date().getDay(); render({ enter: true }); scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); $('#view').focus({ preventScroll: true }); }

function toast(m, cls = '') {
  const t = h('div', { class: 'toast ' + cls }, m);
  $('#toasts').append(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); }, 2400);
}

/* ---------- actions ---------- */
const findSess = sid => { for (let w = 0; w < 7; w++) { const i = S.plan[w].findIndex(s => s.id === sid); if (i > -1) return { w, i, s: S.plan[w][i] }; } return null; };
const ACT = {
  go: el => go(el.dataset.tab),
  tick(el) {
    const t = dkey(), s = S.plan[new Date().getDay()].find(x => x.id === el.dataset.sid); if (!s) return;
    const j = +el.dataset.j, n = target(s), d = ensureDay(t), a = d.s[s.id] = d.s[s.id] || [];
    a[j] = !a[j]; xp(a[j] ? 10 : -10);
    if (a[j] && countDone(a, n) === n) { xp(20); toast('Session complete · +20 bonus XP', 'big'); }
    save(); render({ pulse: `.dot[data-sid="${CSS.escape(s.id)}"][data-j="${j}"]` });
  },
  tgl() { if (T.run) { T.left = Math.max(0, (T.end - Date.now()) / 1000); T.run = false; } else { T.end = Date.now() + T.left * 1000; T.run = true; } saveT(); render(); },
  rst() { T.run = false; T.left = tTotal(); saveT(); render(); },
  skip() { T.run = false; T.mode = T.mode === 'focus' ? 'break' : 'focus'; T.left = tTotal(); saveT(); render(); },
  preset(el) { S.timer = { focus: +el.dataset.f, brk: +el.dataset.b }; save(); if (!T.run) { T.left = tTotal(); saveT(); } render(); },
  chart(el) { const s = el.dataset.subj; CHART.has(s) ? CHART.delete(s) : CHART.add(s); render(); },
  lostAdd() { DRAFT.score.lost.push({ topic: '', type: QTYPES[0], marks: '' }); render(); const r = $('#view').querySelectorAll('.lost-row input'); if (r.length) r[r.length - 2].focus(); },
  lostDel(el) { DRAFT.score.lost.splice(+el.dataset.i, 1); render(); },
  addScore() {
    const D = DRAFT.score, sc = parseFloat(D.score), mx = parseFloat(D.max);
    if (D.score === '' || !Number.isFinite(sc) || sc < 0) { toast('Enter your score'); $('#sc')?.focus(); return; }
    if (!(mx > 0)) return toast('"Out of" needs to be more than 0');
    if (sc > mx) return toast('Score is higher than the total');
    const lost = D.lost.map(l => ({ topic: l.topic.trim(), type: l.type, marks: Math.max(0, +l.marks || 0) })).filter(l => l.topic && l.marks > 0);
    S.scores.push({ id: newId(), date: isKey(D.date) ? D.date : dkey(), subj: D.subj, paper: D.paper.trim(), score: sc, max: mx, lost });
    CHART.add(D.subj); xp(25); toast(`${Math.round(sc / mx * 100)}% logged · +25 XP`);
    DRAFT.score = blankScore(D.subj); render();
  },
  delScore(el) { if (!confirm('Delete this paper?')) return; S.scores = S.scores.filter(s => s.id !== +el.dataset.id); save(); render(); },
  lost2fix(el) {
    S.mistakes.push({ id: newId(), date: dkey(), subj: el.dataset.subj, topic: el.dataset.topic, note: 'From marks-lost analysis', redo: dkey(), fixed: false });
    xp(3); toast('Added to Fixes · ready to redo now'); render();
  },
  deck(el) { CD = { deck: el.dataset.deck, flip: false, i: 0 }; DRAFT.card = { f: '', b: '' }; render(); },
  flip(el) { CD.flip = !CD.flip; el.classList.toggle('flipped', CD.flip); const r = $('#rate'); if (r) r.hidden = !CD.flip; },
  rate(el) {
    const ok = el.dataset.ok === '1', list = dueCards(CD.deck); if (!list.length) return;
    const o = list[CD.i % list.length], s = S.cards[o.id] || { box: 0 };
    s.box = ok ? Math.min(s.box + 1, 5) : 0; s.due = addDays(INT[s.box]); S.cards[o.id] = s;
    if (ok) xp(2); else CD.i++;
    CD.flip = false; save(); render({ pulse: '.flash' });
  },
  addCard() {
    const f = DRAFT.card.f.trim(), b = DRAFT.card.b.trim();
    if (!f || !b) return toast('Fill in both sides');
    (S.custom[CD.deck] = S.custom[CD.deck] || []).push({ id: 'u' + newId().toString(36), f, b });
    DRAFT.card = { f: '', b: '' }; save(); toast('Card added'); render();
  },
  delCard(el) { if (!confirm('Delete this card?')) return; const id = el.dataset.id; S.custom[CD.deck] = (S.custom[CD.deck] || []).filter(c => c.id !== id); delete S.cards[id]; save(); render(); },
  list: el => { LT = el.dataset.k; render(); },
  addMis() {
    const M = DRAFT.mis, tp = M.topic.trim(); if (!tp) return toast('Add a topic');
    S.mistakes.push({ id: newId(), date: dkey(), subj: M.subj, topic: tp, note: M.note.trim(), redo: addDays(3), fixed: false });
    xp(3); toast('Added · redo on ' + fmtDate(addDays(3))); DRAFT.mis = { subj: M.subj, topic: '', note: '' }; render();
  },
  misOk(el) { const m = S.mistakes.find(x => x.id === +el.dataset.id); if (!m) return; m.fixed = true; S.fixedCount++; xp(15); toast('Fixed · +15 XP. That is a mark won back.', 'big'); render(); },
  misAgain(el) { const m = S.mistakes.find(x => x.id === +el.dataset.id); if (!m) return; m.redo = addDays(3); save(); toast('Back in 3 days. Repetition is the training.'); render(); },
  misDel(el) { S.mistakes = S.mistakes.filter(x => x.id !== +el.dataset.id); save(); render(); },
  planDay: el => { PD = +el.dataset.d; render(); },
  planAdd(el) {
    const kind = el.dataset.kind;
    S.plan[PD].push({ id: 's' + newId().toString(36), t: '', label: kind === 'rest' ? 'Rest: earned' : 'New session', kind, sets: kind === 'train' ? 2 : 0 });
    save(); render(); const rows = $('#view').querySelectorAll('.p-label'); rows[rows.length - 1]?.select();
  },
  planSets(el) { const f = findSess(el.dataset.sid); if (!f) return; f.s.sets = clamp(f.s.sets + +el.dataset.d, 1, 12); save(); render(); },
  planMove(el) { const f = findSess(el.dataset.sid); if (!f) return; const p = S.plan[f.w], j = f.i + +el.dataset.d; if (j < 0 || j >= p.length) return; [p[f.i], p[j]] = [p[j], p[f.i]]; save(); render(); },
  planDel(el) { const f = findSess(el.dataset.sid); if (!f || !confirm(`Remove "${f.s.label}"?`)) return; S.plan[f.w].splice(f.i, 1); save(); render(); },
  planReset() { if (!confirm('Reset the whole week to the starting plan? Past ticks are kept.')) return; S.plan = makePlan(); save(); render(); },
  saveGrades() {
    for (const s of SUBJ) { const g = DRAFT.grades[s]; S.grades[s] = { cur: str(g.cur, 8).trim(), tgt: str(g.tgt, 8).trim(), pct: g.pct === '' ? '' : String(clamp(Math.round(+g.pct || 0), 0, 100)) }; }
    DRAFT.grades = null; save(); toast('Grades saved on this device'); render();
  },
  exp() {
    const b = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }), a = h('a', { href: URL.createObjectURL(b), download: 'archeron-backup-' + dkey() + '.json' });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  },
  reset() {
    if (!confirm('Wipe ALL progress on this device? Download a backup first.')) return;
    try { [K, OLD, TK, TABK].forEach(k => localStorage.removeItem(k)); } catch (e) {}
    location.reload();
  }
};
const CHG = {
  fin(el) { const d = ensureDay(dkey()); d.f[el.dataset.i] = el.checked; if (!el.checked) delete d.f[el.dataset.i]; xp(el.checked ? 5 : -5); render(); },
  chk(el) { const k = LT + el.dataset.i; if (el.checked) S.checks[k] = true; else delete S.checks[k]; xp(el.checked ? 3 : -3); if (el.checked && listPct(LT) === 100) toast('List complete', 'big'); render(); },
  deload(el) { S.deload = el.checked; save(); toast(el.checked ? 'Deload on: half volume this week' : 'Deload off: full programme'); render(); },
  mock(el) { if (isKey(el.value)) { S.mock = el.value; save(); hdr(); toast('Countdown updated'); } },
  tlen(el) { const k = el.dataset.k, v = clamp(Math.round(+el.value || 0), 1, k === 'focus' ? 120 : 60); S.timer[k] = v; save(); if (!T.run) { T.left = tTotal(); saveT(); } render(); },
  planEdit(el) {
    const f = findSess(el.dataset.sid); if (!f) return; const k = el.dataset.field;
    if (k === 'kind') { f.s.kind = el.value; f.s.sets = el.value === 'train' ? (f.s.sets || 2) : 0; }
    else f.s[k] = str(el.value, k === 't' ? 12 : 60).trim() || (k === 'label' ? 'Session' : '');
    save(); render();
  },
  imp(el) {
    const file = el.files[0]; if (!file) return;
    file.text().then(t => {
      const data = JSON.parse(t);
      if (!data || typeof data !== 'object' || !('xp' in data || 'days' in data)) throw new Error('not a backup');
      if (!confirm('Replace everything on this device with this backup?')) return;
      S = normalize(data); DRAFT.grades = null; save(); toast('Backup restored'); render();
    }).catch(() => toast('That file is not an Archeron or Nightwatch backup')).finally(() => { el.value = ''; });
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.matches('input, select, textarea') || el.disabled) return;
  const f = ACT[el.dataset.act]; if (f) f(el, e);
});
document.addEventListener('change', e => { const el = e.target, f = el.dataset && CHG[el.dataset.act]; if (f) f(el); });
document.addEventListener('input', e => { const el = e.target; if (el.dataset && el.dataset.draft) setPath(DRAFT, el.dataset.draft, el.value); });
document.addEventListener('keydown', e => {
  if (TAB !== 'cards' || e.target.matches('input, textarea, select') || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); $('.flash')?.click(); }
  else if (CD.flip && (e.key === '1' || e.key === '2')) $(`#rate [data-ok="${e.key === '2' ? 1 : 0}"]`)?.click();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) return; timerTick(); if (dkey() !== renderedDay) render(); });
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (TAB === 'stats') drawChart(); }, 120); });
setInterval(() => { timerTick(); if (dkey() !== renderedDay) render(); }, 250);

/* intro */
(function intro() {
  const i = $('#intro'); if (!i) return;
  const end = () => { if (!i.isConnected) return; i.classList.add('out'); setTimeout(() => i.remove(), 500); };
  if (REDUCED) { i.remove(); return; }
  i.addEventListener('click', end); setTimeout(end, 1900);
})();

render({ enter: true });
if (T.run && T.end <= Date.now()) timerDone();
if (bootNote) setTimeout(() => toast(bootNote), 600);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
