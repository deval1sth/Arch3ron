/* Archeron · app logic. UI is built from DOM nodes (never HTML strings with user data),
   events are delegated via data-act attributes, form drafts survive re-renders. */
'use strict';

/* fx.js may be missing if an old cached index.html is served during an update */
const FXS = typeof FX !== 'undefined' ? FX : { init() {}, burst() {}, countUp() {}, reveal() {} };
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
const fmtDate = k => { const d = parseKey(k); return d.getDate() + ' ' + MON[d.getMonth()]; };
const isKey = k => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k) && !isNaN(parseKey(k));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pctOf = s => Math.round(s.score / s.max * 100);
const pick = a => a[Math.floor(Math.random() * a.length)];

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
const bar = p => h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(p) }, h('i', { style: `width:${clamp(p, 0, 100)}%` }));
const selectSubj = (path, val) => h('select', { 'data-draft': path, value: val }, SUBJ.map(s => h('option', { value: s }, s)));
/* Transitions.dev-based helpers (styles in transitions.css) */
const ACC = {};
function acc(key, head, body, { open = false, cls = 'card' } = {}) {
  const isOpen = ACC[key] != null ? ACC[key] : open;
  const panel = h('div', { class: 't-acc-panel' }, h('div', { class: 't-acc-panel-inner' }, h('div', { class: 't-acc-gap' }), body));
  panel.firstChild.inert = !isOpen;
  const chev = h('span', { class: 't-acc-chevron' }); chev.append(svg('0 0 16 16', 'M4 6.5L8 10.5L12 6.5', ''));
  return h('section', { class: (cls ? cls + ' ' : '') + 't-acc', 'data-open': String(isOpen) },
    h('button', { type: 'button', class: 't-acc-head', 'data-act': 'acc', 'data-k': key, 'aria-expanded': String(isOpen) }, head, chev), panel);
}
const checkBox = () => { const s = h('span', { class: 't-check', 'aria-hidden': 'true' }); s.append(svg('0 0 10.1668 10.1668', 'M1 5.52L3.92 9.17L9.17 1', '')); return s; };
const successCheck = () => { const s = h('span', { class: 't-success-check', 'data-state': 'in', 'aria-hidden': 'true' }); s.append(svg('0 0 24 24', 'M5 13l4 4L19 7', '')); return s; };
const digits = (n, animate) => h('span', { class: 't-digit-group' + (animate ? ' is-animating' : '') }, String(n).split('').map(c => h('span', { class: 't-digit' }, c)));
const hero = (eyebrow, title, lede) => h('div', { class: 'hero' }, h('p', { class: 'eyebrow' }, eyebrow), h('h1', null, title), lede && h('p', { class: 'lede' }, lede));
const subHero = (eyebrow, title, back, lede) => h('div', { class: 'hero' },
  B([icon('back'), { home: 'Focus', learn: 'Learn', tools: 'Toolkit' }[back]], 'go', 'ghost sm backlink', { 'data-tab': back }),
  h('p', { class: 'eyebrow' }, eyebrow), h('h1', null, title), lede && h('p', { class: 'lede' }, lede));

/* ---------- state + migration ---------- */
function makePlan() {
  const p = {};
  for (let w = 0; w < 7; w++) p[w] = DEFAULT_PLAN[w].map((r, i) => ({ id: `d${w}-${i}`, t: r[0], label: r[1], sets: r[2], kind: r[3] }));
  return p;
}
function freshState() {
  return { v: 2, xp: 0, days: {}, cards: {}, custom: {}, checks: {}, mistakes: [], scores: [], grades: {},
    mock: '2027-01-11', plan: makePlan(), deload: false, timer: { focus: 25, brk: 5 }, focusSets: 0, focusMin: 0, fixedCount: 0,
    relics: {}, skill: {}, learnOk: 0, quoteOk: 0 };
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
  for (const k of ['focusSets', 'focusMin', 'learnOk', 'quoteOk']) s[k] = Math.max(0, num(r[k]));
  s.deload = !!r.deload;
  const t = obj(r.timer);
  s.timer = { focus: clamp(Math.round(num(t.focus, 25)), 1, 120), brk: clamp(Math.round(num(t.brk, 5)), 1, 60) };
  for (const [k, c] of Object.entries(obj(r.cards))) { const o = obj(c); if (isKey(o.due)) s.cards[k] = { box: clamp(Math.round(num(o.box)), 0, 5), due: o.due }; }
  for (const [k, v] of Object.entries(obj(r.checks))) if (v) s.checks[k] = true;
  for (const [k, g] of Object.entries(obj(r.grades))) { const o = obj(g); s.grades[k] = { cur: str(o.cur, 8), tgt: str(o.tgt, 8), pct: str(o.pct, 4) }; }
  for (const [k, v] of Object.entries(obj(r.relics))) if (isKey(v)) s.relics[k] = v;
  for (const [k, v] of Object.entries(obj(r.skill))) { const o = obj(v); s.skill[k] = { n: num(o.n), ok: num(o.ok), best: num(o.best), run: num(o.run), rec: arr(o.rec).slice(-6).map(Boolean) }; }
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

/* ---------- progress maths (everything here only ever counts up) ---------- */
const target = s => s.kind !== 'train' ? 0 : S.deload ? Math.ceil(s.sets / 2) : s.sets;
const countDone = (a, n) => (a || []).slice(0, n).filter(Boolean).length;
const dayOf = k => S.days[k] || { s: {}, f: {} };
const ensureDay = k => S.days[k] = S.days[k] || { s: {}, f: {} };
function setsOn(k) { const d = S.days[k]; if (!d) return 0; let n = 0; for (const a of Object.values(d.s)) n += a.filter(Boolean).length; return n; }
function lifeSets() { let n = 0; for (const k in S.days) n += setsOn(k); return n; }
function daysTrained() { let n = 0; for (const k in S.days) if (setsOn(k)) n++; return n; }
const daySets = w => S.plan[w].reduce((n, s) => n + target(s), 0);
const weekTarget = () => [0, 1, 2, 3, 4, 5, 6].reduce((n, w) => n + daySets(w), 0);
const learnedCards = () => Object.values(S.cards).filter(c => c.box >= 3).length;
const xp = n => { S.xp = Math.max(0, S.xp + n); save(); };
function fmtHours(min) { if (min < 60) return Math.round(min) + 'm'; const hh = Math.floor(min / 60), mm = Math.round(min % 60); return hh + 'h' + (mm ? ' ' + mm + 'm' : ''); }

/* ---------- skills (Learn) ---------- */
const skill = id => S.skill[id] || { n: 0, ok: 0, best: 0, run: 0, rec: [] };
const stars = id => { const k = skill(id); return k.best >= 5 ? 3 : k.best >= 3 ? 2 : k.ok >= 1 ? 1 : 0; };
const topicIds = track => track === 'maths' ? LEARN.MATHS : track === 'physics' ? LEARN.PHYS : LEARN.QUOTES.filter(id => quoteCards(id).length);
const mastered = track => topicIds(track).filter(id => stars(id) === 3).length;
const TRACKS = { maths: ['Maths · Foundation', 'Maths'], physics: ['Physics equations', 'Science'], quotes: ['Quote recall', 'English Literature'] };
function quoteCards(id) { const deck = { 'q-mac': 'mac', 'q-acc': 'acc', 'q-je': 'je' }[id]; return deck ? cardsOf(deck).filter(c => /^["“'‘]/.test(c.f.trim())) : []; }
function record(id, ok) {
  const k = S.skill[id] = skill(id);
  k.n++; k.rec = [...k.rec, ok].slice(-6);
  if (ok) { k.ok++; k.run++; k.best = Math.max(k.best, k.run); S.learnOk++; if (id.startsWith('q-')) S.quoteOk++; }
  else k.run = 0;
  save();
}
function pickTopic(track, avoid) {
  const ids = topicIds(track); if (!ids.length) return null;
  const pool = ids.length > 1 ? ids.filter(i => i !== avoid) : ids;
  const w = pool.map(id => {
    const k = skill(id); if (!k.n) return 3;
    const acc = k.rec.length ? k.rec.filter(Boolean).length / k.rec.length : 0;
    return k.best >= 5 && acc >= .8 ? .5 : 1 + (1 - acc) * 3;
  });
  let r = Math.random() * w.reduce((a, b) => a + b);
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

/* ---------- relics: permanent, never lost ---------- */
const RELICS = [
  { id: 'ember', name: 'First Ember', how: 'Finish your first set', icon: 'flame', test: () => lifeSets() >= 1 },
  { id: 'lantern', name: 'Lantern Bearer', how: 'Finish 10 sets', icon: 'lantern', test: () => lifeSets() >= 10 },
  { id: 'scholar', name: 'Night Scholar', how: 'Finish 25 sets', icon: 'feather', test: () => lifeSets() >= 25 },
  { id: 'torch', name: 'Torch of the Crossing', how: 'Finish 50 sets', icon: 'bolt', test: () => lifeSets() >= 50 },
  { id: 'beacon', name: 'Beacon', how: 'Finish 100 sets', icon: 'sparkle', test: () => lifeSets() >= 100 },
  { id: 'fires', name: 'Seven Fires', how: 'Study on 7 different days', icon: 'calendar', test: () => daysTrained() >= 7 },
  { id: 'hourglass', name: 'Hourglass', how: 'Focus for 10 hours in total', icon: 'hourglass', test: () => S.focusMin >= 600 },
  { id: 'first-right', name: 'Spark of Insight', how: 'Answer your first Learn question right', icon: 'sparkle', test: () => S.learnOk >= 1 },
  { id: 'hundred', name: 'Hundred Answers', how: 'Answer 100 Learn questions right', icon: 'gem', test: () => S.learnOk >= 100 },
  { id: 'mind', name: 'Sharpened Mind', how: 'Master 5 Maths topics', icon: 'target', test: () => mastered('maths') >= 5 },
  { id: 'smith', name: 'Formula Smith', how: 'Master 5 physics equations', icon: 'bolt', test: () => mastered('physics') >= 5 },
  { id: 'tongue', name: 'Silver Tongue', how: 'Recall 25 quotes', icon: 'feather', test: () => S.quoteOk >= 25 },
  { id: 'quill', name: 'Quill of Recall', how: 'Learn 20 flashcards well', icon: 'cards', test: () => learnedCards() >= 20 },
  { id: 'coin', name: "Ferryman's Coin", how: 'Log your first past paper', icon: 'coin', test: () => S.scores.length >= 1 },
  { id: 'deep', name: 'Deep Water', how: 'Log 5 past papers', icon: 'scroll', test: () => S.scores.length >= 5 },
  { id: 'blade', name: 'Mended Blade', how: 'Fix 5 mistakes', icon: 'shield', test: () => S.fixedCount >= 5 },
  { id: 'map', name: 'Cartographer', how: 'Complete any checklist', icon: 'map', test: () => Object.keys(LISTS).some(k => listPct(k) === 100) }
];
function checkRelics(silent) {
  const fresh = [];
  for (const r of RELICS) if (!S.relics[r.id] && r.test()) { S.relics[r.id] = dkey(); fresh.push(r); }
  if (!fresh.length) return;
  save();
  if (!silent) for (const r of fresh) FXS.reveal('Relic unlocked', r.name, r.how + ' · yours for good');
}

/* ---------- flashcards ---------- */
function cardsOf(k) {
  return [...DECKS[k].cards.map((c, i) => ({ id: k + i, f: c[0], b: c[1] })), ...(S.custom[k] || []).map(c => ({ id: c.id, f: c.f, b: c.b, custom: true }))];
}
function dueCards(k) { const t = dkey(); return cardsOf(k).filter(o => { const s = S.cards[o.id]; return !s || s.due <= t; }); }
const allDue = () => Object.keys(DECKS).reduce((n, k) => n + dueCards(k).length, 0);
const listPct = k => { const L = LISTS[k]; return Math.round(L.items.filter((_, i) => S.checks[k + i]).length / L.items.length * 100); };
LEARN.setQuoteSource(deck => cardsOf(deck));

/* ---------- timer (wall-clock based, survives reload and phone sleep) ---------- */
const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const tTotal = (m = T.mode) => (m === 'focus' ? S.timer.focus : S.timer.brk) * 60;
let T;
(function loadTimer() {
  try { const t = JSON.parse(read(TK) || 'null'); if (t && (t.mode === 'focus' || t.mode === 'break') && Number.isFinite(t.left)) T = { mode: t.mode, left: t.left, run: !!t.run, end: num(t.end), sid: t.sid ? str(t.sid, 30) : null }; } catch (e) {}
  if (!T) T = { mode: 'focus', left: S.timer.focus * 60, run: false, end: 0, sid: null };
})();
const saveT = () => store(TK, JSON.stringify(T));
const RING = 2 * Math.PI * 54;
const timerActive = () => T.run || T.left < tTotal() - .5;
function paintTimer() {
  const L = Math.ceil(T.left), m = $('#tm'), r = $('#tr'), mini = $('#mt');
  if (m) m.textContent = fmt(L);
  if (r) r.style.strokeDashoffset = String(RING * (T.left / tTotal()));
  if (mini) mini.textContent = fmt(L);
  document.title = T.run ? fmt(L) + ' · Archeron' : 'Archeron';
  document.body.classList.toggle('focusing', T.run && T.mode === 'focus' && TAB === 'home');
}
function timerTick() {
  if (!T.run) return;
  T.left = Math.max(0, (T.end - Date.now()) / 1000);
  if (T.left <= 0) timerDone(); else paintTimer();
}
function timerDone() {
  T.run = false; beep();
  if (T.mode === 'focus') {
    S.focusSets++; S.focusMin += S.timer.focus;
    const d = ensureDay(dkey()), s = T.sid && S.plan[new Date().getDay()].find(x => x.id === T.sid && x.kind === 'train');
    let sub = `Rest ${S.timer.brk} minutes. You earned it.`;
    if (s) {
      const n = target(s), a = d.s[s.id] = d.s[s.id] || [];
      const j = Array.from({ length: n }, (_, i) => i).find(i => !a[i]);
      if (j != null) { a[j] = true; xp(10); if (countDone(a, n) === n) { xp(20); sub = `${s.label}: session complete. Rest ${S.timer.brk} minutes.`; } }
      else (d.s.free = d.s.free || []).push(true);
    } else (d.s.free = d.s.free || []).push(true);
    /* rest starts by itself, timed from when the set actually ended (correct even if the phone was locked) */
    const ended = T.end || Date.now();
    T.mode = 'break'; T.left = tTotal(); T.sid = null; T.run = true; T.end = ended + T.left * 1000; T.left = Math.max(0, (T.end - Date.now()) / 1000);
    saveT(); save();
    FXS.reveal('Set complete', `Lantern ${lifeSets()} lit`, sub);
  } else { T.mode = 'focus'; T.left = tTotal(); saveT(); toast('Rest over. Ready when you are.'); }
  render(); checkRelics();
}
function beep() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    [0, .18, .36].forEach((t, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = [523.25, 659.25, 783.99][i]; o.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(.0001, a.currentTime + t); g.gain.exponentialRampToValueAtTime(.18, a.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t + .6); o.start(a.currentTime + t); o.stop(a.currentTime + t + .65); });
  } catch (e) {}
  try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate([200, 100, 200]); } catch (e) {}
}

/* ---------- UI state ---------- */
let TAB = 'home';
let CD = { deck: 'mac', flip: false, i: 0 };
let LT = 'mm', PD = new Date().getDay(), SEL = null, CHOOSE = false, DR = null;
const CHART = new Set(S.scores.length ? S.scores.map(s => s.subj).filter(s => SUBJ.includes(s)) : ['Maths']);
const blankScore = (subj = 'Maths') => ({ date: dkey(), subj, paper: '', score: '', max: '80', lost: [] });
const DRAFT = { score: blankScore(), mis: { subj: 'Maths', topic: '', note: '' }, card: { f: '', b: '' }, grades: null, dr: '' };
function setPath(o, path, v) { const p = path.split('.'); for (let i = 0; i < p.length - 1; i++) { o = o[p[i]]; if (!o) return; } o[p[p.length - 1]] = v; }

/* ---------- Focus (home) ---------- */
function todayTrain() {
  const d = dayOf(dkey());
  return S.plan[new Date().getDay()].filter(s => s.kind === 'train').map(s => { const n = target(s), c = countDone(d.s[s.id], n); return { s, n, c, left: n - c }; });
}
function currentSid() {
  const open = todayTrain().filter(x => x.left > 0);
  if (SEL === 'free') return 'free';
  if (SEL && open.find(x => x.s.id === SEL)) return SEL;
  return open.length ? open[0].s.id : 'free';
}
const trackFor = label => /math/i.test(label) ? 'maths' : /physic|science|chem|bio/i.test(label) ? 'physics' : /lit|quote|macbeth|carol|journey|english/i.test(label) ? 'quotes' : null;
function ringEl() {
  const r = h('div', { class: 'ring' + (T.mode === 'break' ? ' brk' : '') + (T.run ? ' live' : '') });
  r.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc9a"/><stop offset=".55" stop-color="#e2b04f"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient></defs><circle class="halo" cx="60" cy="60" r="54"/><circle class="trk" cx="60" cy="60" r="54"/><circle id="tr" class="prg" cx="60" cy="60" r="54"/></svg>';
  r.querySelector('#tr').style.strokeDasharray = String(RING);
  r.append(h('div', { class: 'ring-c' }, h('div', { id: 'tm', class: 'time', role: 'timer' }, fmt(Math.ceil(T.left))), h('small', null, T.mode === 'focus' ? 'focus' : 'rest')));
  return r;
}
function vHome() {
  const hr = new Date().getHours(), part = hr < 5 ? 'Late night' : hr < 12 ? 'Morning' : hr < 17 ? 'Afternoon' : 'Evening';
  const list = todayTrain(), open = list.filter(x => x.left > 0), active = timerActive(), todayN = setsOn(dkey());
  const cur = active && T.mode === 'focus' ? (T.sid || 'free') : currentSid(), item = list.find(x => x.s.id === cur);
  const restState = !active && T.mode === 'focus' && !open.length && SEL !== 'free';

  if (restState) return h('div', { class: 'stack home' },
    h('section', { class: 'focus calm' },
      h('p', { class: 'eyebrow' }, part),
      h('h1', { class: 'focus-title' }, list.length ? 'The rest is earned' : 'A day of rest'),
      h('p', { class: 'focus-meta' }, list.length ? `Today's sets are done. Recovery is part of the programme.` : 'Nothing planned today. Recharge, or do a set if you feel like it.'),
      h('div', { class: 'moon' }, icon('moon')),
      h('div', { class: 'row center' }, B([icon('play'), 'Bonus set'], 'pick', 'ghost', { 'data-sid': 'free' }), B([icon('sparkle'), 'Quick practice'], 'drill', 'ghost', { 'data-track': 'maths' }))),
    todayStrip(todayN));

  let title, meta;
  if (T.mode === 'break') { title = 'Rest'; meta = 'Stand up, drink water, look at something far away.'; }
  else if (item) { title = item.s.label; meta = `Set ${Math.min(item.c + 1, item.n)} of ${item.n} · ${S.timer.focus} minutes`; }
  else { title = list.length && !open.length ? 'Bonus set' : 'Free study'; meta = `${S.timer.focus} minutes · anything you choose`; }
  const track = T.mode === 'focus' && trackFor(item ? item.s.label : '');

  return h('div', { class: 'stack home' },
    h('section', { class: 'focus' + (T.mode === 'break' ? ' brk' : '') + (T.run ? ' live' : '') },
      h('p', { class: 'eyebrow' }, active ? (T.mode === 'break' ? 'Recovery' : T.run ? 'In the zone' : 'Paused') : `${part} · next up`),
      h('h1', { class: 'focus-title' }, title),
      h('p', { class: 'focus-meta' }, meta),
      ringEl(),
      !active ? B([icon('play'), 'Begin'], 'tgl', 'begin')
        : h('div', { class: 'row center' }, B(T.run ? [icon('pause'), 'Pause'] : [icon('play'), 'Resume'], 'tgl', 'begin sm'),
          T.mode === 'break' ? B([icon('skip'), 'Skip rest'], 'skip', 'ghost') : B('End set', 'rst', 'ghost')),
      track && h('button', { type: 'button', class: 'practise', 'data-act': 'drill', 'data-track': track },
        icon('sparkle'), h('span', null, h('b', null, `Practise here: ${TRACKS[track][0]}`), h('small', null, 'Real questions with worked methods'))),
      !active && T.mode === 'focus' && h('div', { class: 'focus-links' },
        B(CHOOSE ? 'Close' : 'Choose something else', 'choose', 'link'), h('span', { 'aria-hidden': 'true' }, '·'), B("Today's plan", 'go', 'link', { 'data-tab': 'today' })),
      CHOOSE && !active && h('div', { class: 'chooser t-panel-slide', 'data-open': 'false' },
        open.map(x => chip([x.s.label, h('span', { class: 'n' }, x.left + ' left')], x.s.id === cur, 'pick', { 'data-sid': x.s.id })),
        chip('Free study', cur === 'free', 'pick', { 'data-sid': 'free' }))),
    !active && todayStrip(todayN),
    !active && quickWins());
}
function todayStrip(n) {
  const shown = Math.min(n, 12);
  return h('div', { class: 'strip' },
    h('div', { class: 'embers', 'aria-hidden': 'true' }, Array.from({ length: Math.max(shown, 1) }, (_, i) => h('i', { class: i < n ? 'lit' : '' }))),
    h('span', null, n ? `${n} ${n === 1 ? 'set' : 'sets'} today${n > 12 ? '' : ''}` : 'Your first set today lights a lantern.'));
}
function quickWins() {
  const dueC = allDue(), dueM = S.mistakes.filter(m => !m.fixed && m.redo <= dkey()).length;
  const items = [
    h('button', { type: 'button', class: 'qw', 'data-act': 'drill', 'data-track': 'maths' }, icon('sparkle'), h('span', null, h('b', null, 'Maths warm-up'), h('small', null, 'A few quick questions'))),
    dueC > 0 && h('button', { type: 'button', class: 'qw', 'data-act': 'go', 'data-tab': 'cards' }, icon('cards'), h('span', null, h('b', null, 'Flashcards'), h('small', null, `${dueC} ready to review`))),
    dueM > 0 && h('button', { type: 'button', class: 'qw', 'data-act': 'go', 'data-tab': 'fix' }, icon('wrench'), h('span', null, h('b', null, 'Win back a mark'), h('small', null, `${dueM} mistake${dueM === 1 ? '' : 's'} ready to redo`)))];
  return h('div', { class: 'quick' }, h('p', { class: 'eyebrow' }, 'Spare a few minutes?'), h('div', { class: 'qws' }, items));
}

/* Today's plan (manual ticking, finishers) */
function vToday() {
  const t = dkey(), w = new Date().getDay(), day = dayOf(t), plan = S.plan[w];
  return h('div', { class: 'stack narrow' },
    subHero(`${DAYFULL[w]} ${fmtDate(t)}`, "Today's plan", 'home', 'Sets tick themselves when a focus set finishes. Tap a dot to log one you did away from the app.'),
    S.deload && h('div', { class: 'banner' }, icon('moon'), h('div', null, h('b', null, 'Deload week'), h('p', null, 'Half volume on purpose. Recovery is part of the programme.'))),
    card('Sessions', B([icon('edit'), 'Edit week'], 'go', 'ghost sm', { 'data-tab': 'plan' }),
      plan.length ? plan.map(s => sessionRow(s, day)) : h('p', { class: 'muted' }, 'Nothing planned today. Rest is training too.')),
    card('Daily extras', null, FINISHERS.map((f, i) => h('label', { class: 'chk' + (day.f[i] ? ' d' : '') },
      h('input', { type: 'checkbox', checked: !!day.f[i], 'data-act': 'fin', 'data-i': i }), checkBox(), h('span', null, f)))));
}
function sessionRow(s, day) {
  if (s.kind !== 'train') return h('div', { class: 'sess ' + (s.kind === 'rest' ? 'is-rest' : 'is-other') },
    h('div', { class: 'sess-t' }, s.t), h('div', { class: 'sess-b' }, h('b', null, s.label)),
    h('span', { class: 'pill' + (s.kind === 'rest' ? ' rest' : '') }, s.kind === 'rest' ? [icon('moon'), 'Earned rest'] : 'Fixed'));
  const n = target(s), done = day.s[s.id] || [], c = countDone(done, n);
  return h('div', { class: 'sess' + (c >= n ? ' complete' : '') },
    h('div', { class: 'sess-t' }, s.t),
    h('div', { class: 'sess-b' }, h('b', null, s.label), h('small', null, c >= n ? 'Complete' : `${c} of ${n} sets`)),
    h('div', { class: 'dots' }, Array.from({ length: n }, (_, j) => h('button', { type: 'button', class: 'dot' + (done[j] ? ' on' : ''), 'data-act': 'tick', 'data-sid': s.id, 'data-j': j,
      'aria-pressed': String(!!done[j]), 'aria-label': `Set ${j + 1} of ${n}: ${s.label}` }))));
}

/* ---------- Learn ---------- */
function vLearn() {
  const starsEl = id => h('span', { class: 'stars', 'aria-label': `${stars(id)} of 3 stars` }, [1, 2, 3].map(i => h('i', { class: i <= stars(id) ? 'on' : '' })));
  const tcard = (track, ic, desc, stat) => h('button', { type: 'button', class: 'lcard', 'data-act': 'drill', 'data-track': track },
    h('span', { class: 'lc-ic' }, icon(ic)), h('b', null, TRACKS[track][0]), h('span', { class: 'lc-d' }, desc), h('small', null, stat));
  const hard = [...LEARN.MATHS, ...LEARN.PHYS].filter(id => { const k = skill(id); return k.n >= 2 && k.rec.filter(Boolean).length / k.rec.length < .6; }).slice(0, 4);
  const jeCount = quoteCards('q-je').length;
  return h('div', { class: 'stack' },
    hero('Learn', 'Practice that sticks', 'Answer from memory, check, see the method. Topics you find hard come back more often until they click.'),
    h('div', { class: 'lgrid' },
      tcard('maths', 'target', 'Percentages, fractions, ratio, equations, Pythagoras and more. Every question is new.', `${mastered('maths')} of ${LEARN.MATHS.length} topics mastered`),
      tcard('physics', 'bolt', 'Use and rearrange every equation you need to recall, with units.', `${mastered('physics')} of ${LEARN.PHYS.length} equations mastered`),
      tcard('quotes', 'feather', `Fill the missing word: Macbeth, A Christmas Carol${jeCount ? " and Journey's End" : ''}.`, S.quoteOk ? `${S.quoteOk} quotes recalled` : 'Recall beats rereading'),
      h('button', { type: 'button', class: 'lcard', 'data-act': 'go', 'data-tab': 'cards' }, h('span', { class: 'lc-ic' }, icon('cards')), h('b', null, 'Flashcards'),
        h('span', { class: 'lc-d' }, 'Spaced repetition for quotes, formulas and your own cards.'), h('small', null, allDue() ? `${allDue()} ready to review` : 'All reviewed for today'))),
    hard.length && card('Worth another go', null, h('div', { class: 'chips' }, hard.map(id => chip([LEARN.name(id)], false, 'drill', { 'data-topic': id })))),
    acc('maths-topics', [h('h2', null, 'Practise one Maths topic'), h('span', { class: 'muted acc-r' }, LEARN.MATHS.length + ' topics')],
      h('ul', { class: 'topics' }, LEARN.MATHS.map(id => h('li', null, h('button', { type: 'button', 'data-act': 'drill', 'data-topic': id }, h('span', null, LEARN.name(id)), starsEl(id)))))),
    acc('phys-topics', [h('h2', null, 'Practise one equation'), h('span', { class: 'muted acc-r' }, LEARN.PHYS.length + ' equations')],
      h('ul', { class: 'topics' }, LEARN.PHYS.map(id => h('li', null, h('button', { type: 'button', 'data-act': 'drill', 'data-topic': id }, h('span', null, LEARN.name(id)), starsEl(id)))))),
    h('p', { class: 'muted xs center' }, '★ answered right · ★★ 3 in a row · ★★★ 5 in a row (mastered). Stars are never taken away.'));
}
function startDrill(track, topic) {
  DR = { track, topic: topic || null, q: null, state: 'ask', count: 0, ok: 0, last: null };
  nextQ();
}
function nextQ(sameTopic) {
  const id = sameTopic || DR.topic || pickTopic(DR.track, DR.last);
  const q = id && LEARN.gen(id);
  DR.q = q; DR.state = 'ask'; DR.msg = ''; DR.last = id; DRAFT.dr = '';
}
function vDrill() {
  if (!DR) return vLearn();
  const q = DR.q, title = DR.topic ? LEARN.name(DR.topic) : TRACKS[DR.track][0];
  if (!q) return h('div', { class: 'stack narrow' }, subHero('Learn', title, 'learn'),
    card(null, null, h('p', null, DR.track === 'quotes' ? 'No quotes to practise yet. Add quotes to a deck in Flashcards and they appear here.' : 'Nothing to practise here yet.')));
  const st = DR.state, inputMode = q.kind === 'num' ? 'decimal' : 'text';
  return h('div', { class: 'stack narrow' },
    subHero(DR.topic ? TRACKS[LEARN.trackOf(DR.topic)][0] : 'Mixed practice', title, 'learn'),
    h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, LEARN.name(q.id)), h('span', null, DR.ok ? `${DR.ok} right this session` : 'Take your time')),
    h('section', { class: 'card qcard ' + st },
      q.sub && h('p', { class: 'eyebrow' }, q.sub),
      h('p', { class: 'qtext' + (q.kind === 'word' ? ' quote' : '') }, q.q),
      h('div', { class: 'answer' },
        q.pre && h('span', { class: 'adorn' }, q.pre),
        h('input', { id: 'ans', 'data-draft': 'dr', 'data-enter': '1', value: DRAFT.dr, disabled: st !== 'ask', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', inputmode: inputMode, enterkeyhint: 'done', 'aria-label': 'Your answer' }),
        q.suf && h('span', { class: 'adorn' }, q.suf)),
      st === 'ask' && q.hint && h('p', { class: 'muted xs' }, q.hint),
      st === 'ask' ? h('div', { class: 'row' }, B('Check', 'check', 'primary grow'), B('Show me', 'reveal', 'ghost'))
        : st === 'right' ? h('div', { class: 'fb ok t-panel-slide', 'data-open': 'false' },
          h('p', { class: 'fb-h' }, successCheck(), pick(['Correct.', 'Exactly right.', 'Nailed it.', 'Yes. That is it.'])),
          acc('method', h('span', { class: 'btn link' }, 'See the method'), h('ol', { class: 'steps' }, q.steps.map(s => h('li', null, s))), { cls: '' }),
          B('Next question', 'next', 'primary wide', { id: 'nextq' }))
        : h('div', { class: 'fb no t-panel-slide', 'data-open': 'false' },
          h('p', { class: 'fb-h' }, st === 'shown' ? 'Here is how it works.' : 'Not quite.', DR.msg && h('span', null, ' ' + DR.msg)),
          h('p', null, 'Answer: ', h('b', null, q.show)),
          h('ol', { class: 'steps' }, q.steps.map(s => h('li', null, s))),
          h('div', { class: 'row' }, B('Try a similar one', 'similar', 'primary grow', { id: 'nextq' }), B('Next', 'next', 'ghost')),
          B([icon('plus'), 'Add to fix list'], 'drillFix', 'link'))),
    h('p', { class: 'muted xs center' }, 'Press Enter to check. Getting it wrong here is how it sticks for the exam.'));
}

/* ---------- Journey ---------- */
function vPath() {
  const life = lifeSets(), CH = 20, chapter = Math.floor(life / CH) + 1, inCh = life % CH;
  const feats = [['hourglass', S.focusMin ? fmtHours(S.focusMin) : 0, 'focused'], ['target', mastered('maths') + mastered('physics'), 'topics mastered'],
    ['sparkle', S.learnOk, 'questions right'], ['cards', learnedCards(), 'cards learned'], ['scroll', S.scores.length, 'papers done'], ['shield', S.fixedCount, 'mistakes fixed']].filter(f => f[1]);
  const got = RELICS.filter(r => S.relics[r.id]).length;
  return h('div', { class: 'stack' },
    h('div', { class: 'hero' }, h('p', { class: 'eyebrow' }, 'Your journey'),
      h('h1', null, life ? [h('span', { 'data-count': life }, life), life === 1 ? ' lantern lit' : ' lanterns lit'] : 'The path begins'),
      h('p', { class: 'lede' }, life ? 'Every set you finish lights one. They never go out.' : 'Finish your first focus set and the first lantern on the river lights up.')),
    card(`Chapter ${chapter}`, h('span', { class: 'muted' }, `${inCh} of ${CH}`), riverSvg(inCh, CH)),
    feats.length && h('div', { class: 'feats' }, feats.map(([ic, v, l]) => h('div', { class: 'feat' }, icon(ic), h('b', null, typeof v === 'number' ? h('span', { 'data-count': v }, v) : v), h('span', null, l)))),
    card('Relics', h('span', { class: 'muted' }, `${got} of ${RELICS.length} found`),
      h('ul', { class: 'relics' }, RELICS.map(r => { const on = S.relics[r.id];
        return h('li', { class: on ? 'on' : '' }, h('span', { class: 'rl-ic' }, icon(r.icon)), h('b', null, r.name), h('small', null, on ? 'Found ' + fmtDate(on) : r.how)); }))));
}
function riverSvg(lit, N) {
  const W = 400, H = 150, xs = i => 24 + i * ((W - 48) / (N - 1)), ys = i => 75 + 42 * Math.sin(i * .62);
  let d = ''; for (let x = 0; x <= W; x += 4) { const i = (x - 24) / ((W - 48) / (N - 1)); d += (x ? ' L' : 'M') + x + ' ' + (75 + 42 * Math.sin(i * .62)).toFixed(1); }
  let dots = '';
  for (let i = 0; i < N; i++) {
    const cls = i < lit ? 'lit' : i === lit ? 'next' : '';
    dots += `<g class="lan ${cls}" style="--i:${i}"><circle cx="${xs(i).toFixed(1)}" cy="${ys(i).toFixed(1)}" r="11" class="glow"/><circle cx="${xs(i).toFixed(1)}" cy="${ys(i).toFixed(1)}" r="5" class="core"/></g>`;
  }
  const wrap = h('div', { class: 'river', role: 'img', 'aria-label': `${lit} of ${N} lanterns lit in this chapter` });
  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="rv" x1="0" x2="1"><stop offset="0" stop-color="#3a3354"/><stop offset="1" stop-color="#1c1a2a"/></linearGradient></defs><path d="${d}" class="water"/><path d="${d}" class="water2"/>${dots}</svg>`;
  return wrap;
}

/* ---------- Toolkit ---------- */
function vTools() {
  const dueM = S.mistakes.filter(m => !m.fixed && m.redo <= dkey()).length;
  const tool = (tab, ic, name, sub) => h('button', { type: 'button', class: 'tool', 'data-act': 'go', 'data-tab': tab }, h('span', { class: 'lc-ic' }, icon(ic)), h('b', null, name), h('small', null, sub));
  return h('div', { class: 'stack' },
    hero('Toolkit', 'Everything else', 'Here when you need it.'),
    h('div', { class: 'tools' },
      tool('papers', 'scroll', 'Past papers', S.scores.length ? `${S.scores.length} logged · chart and marks lost` : 'Log scores, see your trend'),
      tool('fix', 'wrench', 'Fix list', dueM ? `${dueM} ready to redo` : 'Turn mistakes into marks'),
      tool('lists', 'check', 'Checklists', 'Topics, practicals, papers'),
      tool('cards', 'cards', 'Flashcards', allDue() ? `${allDue()} ready to review` : 'All reviewed for today'),
      tool('plan', 'calendar', 'Weekly plan', `${weekTarget()} sets a week${S.deload ? ' · deload' : ''}`),
      tool('me', 'user', 'Settings', 'Grades, timer, backup, install')));
}

/* Past papers */
function vPapers() {
  return h('div', { class: 'stack' }, subHero('Toolkit', 'Past papers', 'tools'), chartCard(), lostCard(), h('div', { class: 'cols' }, logCard(), gradesCard()), scoresCard());
}
function trend(pts) {
  if (pts.length < 2) return null;
  const xs = pts.map(p => dayNum(p.date)), ys = pts.map(pctOf), k = xs.length;
  const mx = xs.reduce((a, b) => a + b) / k, my = ys.reduce((a, b) => a + b) / k;
  let sxx = 0, sxy = 0; for (let i = 0; i < k; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); }
  const b = sxx ? sxy / sxx : 0, a = my - b * mx;
  return { at: d => clamp(a + b * d, 0, 100) };
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
      msg = !tg ? `Heading for about ${p}% by mocks. Add a target % in Settings.`
        : p >= tg ? `On pace: heading for ${p}% against a ${tg}% target.`
        : `Heading for ${p}% against ${tg}%. The marks-lost list shows the quickest ${tg - p}% to find.`;
    }
    return h('li', null, h('i', { style: `background:${SUBJ_COLOR[s]}` }), h('b', null, s), h('span', null, msg));
  });
  return card('Scores', null,
    h('div', { class: 'chips scroll' }, SUBJ.map(s => chip([h('i', { class: 'sw', style: `background:${SUBJ_COLOR[s]}` }), s], CHART.has(s), 'chart', { 'data-subj': s }))),
    h('canvas', { id: 'ch', role: 'img', 'aria-label': 'Past paper percentages over time with trend lines projected to the mock date' }),
    h('p', { class: 'muted xs' }, 'Solid: your scores. Dashed: trend towards mocks. Diamond: your target %.'),
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
  if (!total) return card('Marks to win back', null, h('p', { class: 'muted' }, 'When you log a paper, note where the marks went. This becomes a ranked list of the topics worth the most marks to fix.'));
  const topics = Object.values(byTopic).sort((a, b) => b.marks - a.marks).slice(0, 8), types = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const top = topics[0].marks, open = new Set(S.mistakes.filter(m => !m.fixed).map(m => m.subj + '|' + m.topic.toLowerCase()));
  return card('Marks to win back', h('span', { class: 'muted' }, total + ' marks mapped'),
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
      h('div', { class: 'lost-h' }, h('b', null, 'Where did the marks go?'), h('small', null, 'Optional. Builds your marks-to-win-back list.')),
      D.lost.map((l, i) => h('div', { class: 'lost-row' },
        h('input', { 'data-draft': `score.lost.${i}.topic`, value: l.topic, placeholder: 'Topic, e.g. Ratio', 'aria-label': 'Topic', maxlength: 60 }),
        h('select', { 'data-draft': `score.lost.${i}.type`, value: l.type, 'aria-label': 'Question type' }, QTYPES.map(q => h('option', { value: q }, q))),
        h('input', { type: 'number', min: 0, inputmode: 'numeric', 'data-draft': `score.lost.${i}.marks`, value: l.marks, placeholder: 'Marks', 'aria-label': 'Marks lost' }),
        B(icon('x'), 'lostDel', 'ghost icon-only', { 'data-i': i, 'aria-label': 'Remove row' }))),
      B([icon('plus'), 'Add where marks went'], 'lostAdd', 'ghost sm')),
    B('Log paper', 'addScore', 'primary wide'));
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

/* Flashcards */
function vCards() {
  const list = dueCards(CD.deck), D = DECKS[CD.deck], all = cardsOf(CD.deck);
  let body;
  if (!all.length) body = h('div', { class: 'card empty' }, h('b', null, D.name + ' is empty'), h('p', { class: 'muted' }, D.note || 'Add your first card below.'));
  else if (!list.length) {
    const strong = all.filter(c => (S.cards[c.id] || {}).box >= 3).length;
    body = h('div', { class: 'card empty' }, h('b', null, `All ${D.name} cards reviewed`), h('p', { class: 'muted' }, `${strong} of ${all.length} learned well. Spacing is the point: they come back when they are due.`));
  } else {
    const o = list[CD.i % list.length], box = (S.cards[o.id] || { box: 0 }).box;
    body = [
      h('button', { type: 'button', class: 'flash' + (CD.flip ? ' flipped' : ''), 'data-act': 'flip', 'aria-label': 'Flashcard. Tap to flip' },
        h('div', { class: 'flash-in' },
          h('div', { class: 'face front' }, h('span', { class: 'deck-n' }, D.name), h('p', null, o.f), h('small', null, 'Say it out loud, then tap')),
          h('div', { class: 'face back', 'aria-live': 'polite' }, h('span', { class: 'deck-n' }, o.f), h('p', null, o.b)))),
      h('div', { class: 'row center rate', id: 'rate', hidden: !CD.flip },
        B('Again soon', 'rate', 'ghost', { 'data-ok': 0 }), B('Got it', 'rate', 'primary', { 'data-ok': 1 })),
      h('div', { class: 'boxes', 'aria-label': `Box ${box} of 5` }, [0, 1, 2, 3, 4, 5].map(b => h('i', { class: b <= box ? 'on' : '' }))),
      h('p', { class: 'muted center xs' }, `${list.length} to review · keys: space flips, 1 again, 2 got it`)];
  }
  const C = DRAFT.card, mine = S.custom[CD.deck] || [];
  return h('div', { class: 'stack narrow' },
    subHero('Spaced repetition', 'Flashcards', 'learn'),
    h('div', { class: 'chips scroll' }, Object.keys(DECKS).map(k => chip([DECKS[k].name, h('span', { class: 'n' }, dueCards(k).length)], k === CD.deck, 'deck', { 'data-deck': k }))),
    body,
    acc('add-' + CD.deck, [h('h2', null, `Add to ${D.name}`), h('span', { class: 'muted acc-r' }, mine.length + ' of your own')], [
      D.note && all.length ? h('p', { class: 'muted xs' }, D.note) : null,
      field('Front (quote or prompt)', h('textarea', { rows: 2, 'data-draft': 'card.f', value: C.f, maxlength: 300 })),
      field('Back (who, when, why it matters)', h('textarea', { rows: 2, 'data-draft': 'card.b', value: C.b, maxlength: 300 })),
      h('p', { class: 'muted xs' }, 'Put quotes inside quotation marks and they also appear in Quote recall.'),
      B([icon('plus'), 'Add card'], 'addCard', 'primary'),
      mine.length ? h('ul', { class: 'list' }, mine.map(c => h('li', null, h('div', { class: 'grow' }, h('b', null, c.f), h('small', null, c.b)),
        B(icon('x'), 'delCard', 'ghost icon-only', { 'data-id': c.id, 'aria-label': 'Delete card' })))) : null], { open: !all.length }));
}

/* Checklists */
function vLists() {
  const L = LISTS[LT], p = listPct(LT);
  return h('div', { class: 'stack narrow' },
    subHero('Coverage', 'Checklists', 'tools'),
    h('div', { class: 'chips scroll' }, Object.keys(LISTS).map(k => chip([LISTS[k].name, h('span', { class: 'n' }, listPct(k) + '%')], k === LT, 'list', { 'data-k': k }))),
    card(L.name, h('b', { class: 'y' }, p + '%'), bar(p),
      h('div', { class: 'checks' }, L.items.map((it, i) => { const on = !!S.checks[LT + i];
        return h('label', { class: 'chk' + (on ? ' d' : '') }, h('input', { type: 'checkbox', checked: on, 'data-act': 'chk', 'data-i': i }), checkBox(), h('span', null, it)); })),
      h('p', { class: 'muted xs' }, 'Tick a topic when you can do an exam question on it without notes.')));
}

/* Fix list */
function vFix() {
  const t = dkey(), open = S.mistakes.filter(m => !m.fixed).sort((a, b) => a.redo < b.redo ? -1 : 1), due = open.filter(m => m.redo <= t).length, M = DRAFT.mis;
  return h('div', { class: 'stack' },
    subHero('Redo loop', 'Fix list', 'tools', 'Every mistake you redo is a mark you take back on the day.'),
    h('div', { class: 'cols' },
      card('Add a mistake', null,
        h('div', { class: 'grid2' }, field('Subject', selectSubj('mis.subj', M.subj)), field('Topic', h('input', { 'data-draft': 'mis.topic', value: M.topic, placeholder: 'e.g. Ratio', maxlength: 80 }))),
        field('What went wrong', h('textarea', { rows: 2, 'data-draft': 'mis.note', value: M.note, placeholder: 'e.g. Shared in the wrong order', maxlength: 300 })),
        B('Add · redo in 3 days', 'addMis', 'primary wide')),
      card('Redo list', h('span', { class: 'muted' }, `${S.fixedCount} fixed so far`),
        open.length ? h('ul', { class: 'list' }, open.map(m => { const isDue = m.redo <= t;
          return h('li', { class: isDue ? 'due' : '' },
            h('div', { class: 'grow' }, h('b', null, `${m.subj}: ${m.topic}`), m.note && h('small', null, m.note), h('small', { class: isDue ? 'y' : '' }, isDue ? 'Ready to redo' : 'Back on ' + fmtDate(m.redo))),
            isDue ? h('div', { class: 'row nowrap' }, B('Fixed', 'misOk', 'primary sm', { 'data-id': m.id }), B('Again', 'misAgain', 'ghost sm', { 'data-id': m.id }))
              : B(icon('x'), 'misDel', 'ghost icon-only', { 'data-id': m.id, 'aria-label': 'Delete mistake' })); }))
          : h('p', { class: 'muted' }, due ? '' : 'Nothing waiting. After a paper or a drill, add what tripped you up.'))));
}

/* Plan editor */
function vPlan() {
  const w = PD, plan = S.plan[w];
  const kinds = [['train', 'Training'], ['rest', 'Rest'], ['other', 'Fixed (e.g. tutoring)']];
  return h('div', { class: 'stack narrow' },
    subHero('Your week', 'Training plan', 'tools'),
    card('Week', h('span', { class: 'muted' }, weekTarget() + ' sets a week'),
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

/* Settings */
function vMe() {
  if (!DRAFT.grades) DRAFT.grades = Object.fromEntries(SUBJ.map(s => [s, Object.assign({ cur: '', tgt: '', pct: '' }, S.grades[s])]));
  const G = DRAFT.grades;
  return h('div', { class: 'stack' },
    subHero('Toolkit', 'Settings', 'tools'),
    h('div', { class: 'cols' },
      card('My grades', null, h('p', { class: 'muted xs' }, 'Saved only on this device. Target % is what you aim for on past papers; it shows on your chart.'),
        h('div', { class: 'tbl' }, h('table', { class: 'edit' }, h('tr', null, h('th', null, 'Subject'), h('th', null, 'Now'), h('th', null, 'Target'), h('th', null, 'Target %')),
          SUBJ.map(s => h('tr', null, h('td', null, s),
            h('td', null, h('input', { 'data-draft': `grades.${s}.cur`, value: G[s].cur, maxlength: 8, 'aria-label': s + ' current grade' })),
            h('td', null, h('input', { 'data-draft': `grades.${s}.tgt`, value: G[s].tgt, maxlength: 8, 'aria-label': s + ' target grade' })),
            h('td', null, h('input', { type: 'number', min: 0, max: 100, inputmode: 'numeric', 'data-draft': `grades.${s}.pct`, value: G[s].pct, 'aria-label': s + ' target percent' })))))),
        B('Save grades', 'saveGrades', 'primary')),
      h('div', { class: 'stack' },
        card('Focus timer', null,
          h('div', { class: 'chips' }, [[25, 5], [45, 10], [15, 3]].map(([f, b]) => chip(`${f} / ${b} min`, S.timer.focus === f && S.timer.brk === b, 'preset', { 'data-f': f, 'data-b': b }))),
          h('div', { class: 'grid2', style: 'margin-top:12px' },
            field('Focus minutes', h('input', { type: 'number', min: 1, max: 120, value: S.timer.focus, 'data-act': 'tlen', 'data-k': 'focus' })),
            field('Rest minutes', h('input', { type: 'number', min: 1, max: 60, value: S.timer.brk, 'data-act': 'tlen', 'data-k': 'brk' })))),
        card('Mocks', null, field('First mock exam', h('input', { type: 'date', value: S.mock, 'data-act': 'mock' })), h('p', { class: 'muted xs' }, 'Used for the trend line on your score chart.')),
        card('Backup', null, h('p', { class: 'muted xs' }, 'Progress lives in this browser. Back up weekly, and use it to move devices.'),
          h('div', { class: 'row' }, B([icon('download'), 'Download'], 'exp', 'primary'),
            h('label', { class: 'btn ghost' }, icon('upload'), 'Restore', h('input', { type: 'file', accept: '.json,application/json', 'data-act': 'imp', class: 'sr' })))),
        card('Install', null, h('p', { class: 'muted xs' }, h('b', null, 'iPhone: '), 'Safari → Share → Add to Home Screen.', h('br'), h('b', null, 'Android: '), 'Chrome menu ⋮ → Install app.')),
        card('Start over', null, h('p', { class: 'muted xs' }, 'Wipes everything on this device. Download a backup first.'), B('Reset everything', 'reset', 'ghost danger')))));
}

/* ---------- shell ---------- */
const TABS = [['home', 'flame', 'Focus'], ['learn', 'sparkle', 'Learn'], ['path', 'lantern', 'Journey'], ['tools', 'grid', 'Toolkit']];
const PARENT = { today: 'home', drill: 'learn', cards: 'learn', papers: 'tools', lists: 'tools', fix: 'tools', plan: 'tools', me: 'tools' };
const VIEWS = { home: vHome, learn: vLearn, drill: vDrill, path: vPath, tools: vTools, today: vToday, papers: vPapers, cards: vCards, lists: vLists, fix: vFix, plan: vPlan, me: vMe };
let renderedDay = dkey();

let shownLife = null;
function hdr() {
  const life = lifeSets(), el = $('#cd'), showMini = T.run && TAB !== 'home', grew = shownLife != null && life > shownLife;
  shownLife = life;
  el.replaceChildren(
    showMini ? h('button', { type: 'button', class: 'mini-t', 'data-act': 'go', 'data-tab': 'home', 'aria-label': 'Back to the running timer' }, icon(T.mode === 'focus' ? 'flame' : 'moon'), h('span', { id: 'mt' }, fmt(Math.ceil(T.left)))) : '',
    life ? h('span', { class: 'lan-chip', title: 'Lanterns lit', 'aria-label': `${life} lanterns lit` }, icon('lantern'), digits(life, grew)) : '');
}
/* Transitions.dev "Tabs sliding": the pill is measured onto the active tab; snaps without animation on first paint and resize */
function movePill(animate) {
  const nav = $('#nav'), pill = nav.querySelector('.t-tabs-pill'), tab = nav.querySelector('button.on');
  if (!pill || !tab) return;
  const apply = () => { pill.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`; pill.style.width = tab.offsetWidth + 'px'; pill.style.height = tab.offsetHeight + 'px'; };
  if (animate) return apply();
  const prev = pill.style.transition; pill.style.transition = 'none'; apply(); void pill.offsetWidth; pill.style.transition = prev;
}
function navPaint() {
  const nav = $('#nav'), first = !nav.childElementCount;
  if (first) nav.append(h('span', { class: 't-tabs-pill', 'aria-hidden': 'true' }), ...TABS.map(([k, ic, l]) => h('button', { type: 'button', 'data-act': 'go', 'data-tab': k }, icon(ic), h('span', null, l))));
  const cur = PARENT[TAB] || TAB;
  for (const b of nav.querySelectorAll('button')) { const on = b.dataset.tab === cur; b.classList.toggle('on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); }
  if (first) requestAnimationFrame(() => movePill(false)); else movePill(true);
}
function focusKey(el) {
  if (!el || el === document.body || !el.closest('#view')) return null;
  if (el.id) return '#' + CSS.escape(el.id);
  const parts = ['act', 'draft', 'sid', 'j', 'i', 'id', 'tab', 'k', 'd', 'deck', 'subj', 'field', 'ok', 'track', 'topic'].filter(a => el.dataset[a] != null).map(a => `[data-${a}="${CSS.escape(el.dataset[a])}"]`);
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
  if (TAB === 'papers') drawChart();
  paintTimer();
  if (fk) { const e = view.querySelector(fk); if (e && !e.disabled) e.focus({ preventScroll: true }); }
  if (o.focus) { const e = view.querySelector(o.focus); if (e) e.focus({ preventScroll: true }); }
  if (o.pulse) { const e = view.querySelector(o.pulse); if (e) { e.classList.add('pop'); if (o.burst) FXS.burst(e, o.burst); } }
  if (o.recheck) { const e = view.querySelector(o.recheck); if (e) { const on = e.classList.contains('d'); e.classList.toggle('d', !on); void e.offsetWidth; e.classList.toggle('d', on); } }
  if (o.enter) {
    FXS.countUp(view);
    if (!REDUCED) for (const el of view.querySelectorAll('.hero, .focus')) { el.classList.add('t-stagger'); void el.offsetWidth; requestAnimationFrame(() => el.classList.add('is-shown')); }
  }
  const panels = view.querySelectorAll('.t-panel-slide[data-open="false"]');
  if (panels.length) requestAnimationFrame(() => requestAnimationFrame(() => panels.forEach(p => p.setAttribute('data-open', 'true'))));
}
function go(t) { if (!VIEWS[t]) return; TAB = t; if (t === 'plan') PD = new Date().getDay(); CHOOSE = false; render({ enter: true }); scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); if (t !== 'drill') $('#view').focus({ preventScroll: true }); }

function toast(m, cls = '') {
  const t = h('div', { class: 'toast t-toast ' + cls }, m);
  $('#toasts').append(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('is-open')));
  setTimeout(() => { t.classList.remove('is-open'); setTimeout(() => t.remove(), 300); }, 2400);
}

/* ---------- actions ---------- */
const findSess = sid => { for (let w = 0; w < 7; w++) { const i = S.plan[w].findIndex(s => s.id === sid); if (i > -1) return { w, i, s: S.plan[w][i] }; } return null; };
const ACT = {
  go: el => go(el.dataset.tab),
  acc(el) {
    const box = el.closest('.t-acc'), open = box.getAttribute('data-open') !== 'true';
    ACC[el.dataset.k] = open; box.setAttribute('data-open', String(open)); el.setAttribute('aria-expanded', String(open));
    box.querySelector('.t-acc-panel-inner').inert = !open;
  },
  tick(el) {
    const t = dkey(), s = S.plan[new Date().getDay()].find(x => x.id === el.dataset.sid); if (!s) return;
    const j = +el.dataset.j, n = target(s), d = ensureDay(t), a = d.s[s.id] = d.s[s.id] || [];
    a[j] = !a[j]; xp(a[j] ? 10 : -10);
    const full = a[j] && countDone(a, n) === n;
    if (full) { xp(20); toast('Session complete', 'big'); }
    save(); render({ pulse: `.dot[data-sid="${CSS.escape(s.id)}"][data-j="${j}"]`, burst: a[j] ? (full ? 70 : 24) : 0 });
  },
  tgl() {
    if (T.run) { T.left = Math.max(0, (T.end - Date.now()) / 1000); T.run = false; }
    else { if (T.mode === 'focus' && !timerActive()) T.sid = currentSid(); T.end = Date.now() + T.left * 1000; T.run = true; }
    saveT(); render();
  },
  rst() { T.run = false; T.mode = 'focus'; T.left = tTotal(); T.sid = null; saveT(); render(); },
  skip() { T.run = false; T.mode = T.mode === 'focus' ? 'break' : 'focus'; T.left = tTotal(); saveT(); render(); },
  pick(el) { SEL = el.dataset.sid; CHOOSE = false; if (!T.run) { T.mode = 'focus'; T.left = tTotal(); saveT(); } render(); },
  choose() { CHOOSE = !CHOOSE; render(); },
  preset(el) { S.timer = { focus: +el.dataset.f, brk: +el.dataset.b }; save(); if (!T.run) { T.left = tTotal(); saveT(); } render(); },
  drill(el) { if (el.dataset.topic) startDrill(LEARN.trackOf(el.dataset.topic), el.dataset.topic); else startDrill(el.dataset.track || 'maths'); go('drill'); setTimeout(() => $('#ans')?.focus({ preventScroll: true }), 60); },
  check() {
    if (!DR || !DR.q || DR.state !== 'ask') return;
    const res = LEARN.check(DR.q, DRAFT.dr);
    if (!res.valid) { toast(res.msg || 'Type an answer'); $('#ans')?.focus(); return; }
    record(DR.q.id, res.ok);
    DR.state = res.ok ? 'right' : 'wrong'; DR.msg = res.msg || '';
    if (res.ok) DR.ok++;
    render({ focus: '#nextq' });
    if (res.ok) FXS.burst($('.qcard'), 36);
  },
  reveal() { if (!DR || DR.state !== 'ask') return; record(DR.q.id, false); DR.state = 'shown'; render({ focus: '#nextq' }); },
  next() { DR.count++; nextQ(); render({ focus: '#ans' }); },
  similar() { DR.count++; nextQ(DR.q.id); render({ focus: '#ans' }); },
  drillFix() {
    const q = DR.q, subj = TRACKS[LEARN.trackOf(q.id)][1];
    S.mistakes.push({ id: newId(), date: dkey(), subj, topic: LEARN.name(q.id), note: `${q.q} → ${q.show}`.slice(0, 300), redo: addDays(3), fixed: false });
    save(); toast('Added to your fix list · back in 3 days');
  },
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
    CHART.add(D.subj); xp(25); toast(`${Math.round(sc / mx * 100)}% logged. Every paper sharpens you.`);
    DRAFT.score = blankScore(D.subj); render();
  },
  delScore(el) { if (!confirm('Delete this paper?')) return; S.scores = S.scores.filter(s => s.id !== +el.dataset.id); save(); render(); },
  lost2fix(el) {
    S.mistakes.push({ id: newId(), date: dkey(), subj: el.dataset.subj, topic: el.dataset.topic, note: 'From marks to win back', redo: dkey(), fixed: false });
    toast('Added to your fix list'); save(); render();
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
    xp(3); toast('Added · back on ' + fmtDate(addDays(3))); DRAFT.mis = { subj: M.subj, topic: '', note: '' }; render();
  },
  misOk(el) { const m = S.mistakes.find(x => x.id === +el.dataset.id); if (!m) return; m.fixed = true; S.fixedCount++; xp(15); toast('Fixed. That is a mark won back.', 'big'); render(); },
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
  fin(el) { const d = ensureDay(dkey()); if (el.checked) d.f[el.dataset.i] = true; else delete d.f[el.dataset.i]; xp(el.checked ? 5 : -5); render({ recheck: `label:has(> [data-act="fin"][data-i="${el.dataset.i}"])` }); },
  chk(el) { const k = LT + el.dataset.i; if (el.checked) S.checks[k] = true; else delete S.checks[k]; xp(el.checked ? 3 : -3); if (el.checked && listPct(LT) === 100) toast('List complete', 'big'); render({ recheck: `label:has(> [data-act="chk"][data-i="${el.dataset.i}"])` }); },
  deload(el) { S.deload = el.checked; save(); toast(el.checked ? 'Deload on: half volume this week' : 'Deload off: full programme'); render(); },
  mock(el) { if (isKey(el.value)) { S.mock = el.value; save(); toast('Mock date updated'); } },
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
      S = normalize(data); DRAFT.grades = null; save(); checkRelics(true); toast('Backup restored'); render();
    }).catch(() => toast('That file is not an Archeron or Nightwatch backup')).finally(() => { el.value = ''; });
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.matches('input, select, textarea') || el.disabled) return;
  const f = ACT[el.dataset.act]; if (f) { f(el, e); checkRelics(); }
});
document.addEventListener('change', e => { const el = e.target, f = el.dataset && CHG[el.dataset.act]; if (f) { f(el); checkRelics(); } });
document.addEventListener('input', e => { const el = e.target; if (el.dataset && el.dataset.draft) setPath(DRAFT, el.dataset.draft, el.value); });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) { e.preventDefault(); ACT.check(); checkRelics(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input, textarea, select')) return;
  if (TAB === 'cards') {
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); $('.flash')?.click(); }
    else if (CD.flip && (e.key === '1' || e.key === '2')) $(`#rate [data-ok="${e.key === '2' ? 1 : 0}"]`)?.click();
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) return; timerTick(); if (dkey() !== renderedDay) render(); });
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { movePill(false); if (TAB === 'papers') drawChart(); }, 120); });
setInterval(() => { timerTick(); if (dkey() !== renderedDay) render(); }, 250);

/* intro */
(function intro() {
  const i = $('#intro'); if (!i) return;
  const end = () => { if (!i.isConnected) return; i.classList.add('out'); setTimeout(() => i.remove(), 600); };
  if (REDUCED) { i.remove(); return; }
  i.addEventListener('click', end); setTimeout(end, 2200);
})();

FXS.init();
checkRelics(true);
render({ enter: true });
if (T.run && T.end <= Date.now()) timerDone();
if (bootNote) setTimeout(() => toast(bootNote), 600);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  /* when a new version takes over, reload once so the update shows immediately (never mid-set) */
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    const reload = () => { if (!T.run) { reloading = true; location.reload(); } else setTimeout(reload, 5000); };
    reload();
  });
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
