/* Archeron · app logic. UI is built from DOM nodes (never HTML strings with user data),
   events are delegated via data-act attributes, form drafts survive re-renders. */
'use strict';

/* fx.js may be missing if an old cached index.html is served during an update */
const FXS = typeof FX !== 'undefined' ? FX : { init() {}, burst() {}, countUp() {}, reveal() {} };
const K = 'archeron-v2', OLD = 'nightwatch-v1', TK = 'archeron-timer', TABK = 'archeron-tab';
const $ = s => document.querySelector(s);
/* Motion: 'auto' follows the device's reduce-motion setting; the user can override it in Settings */
const MQ_REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
let REDUCED = MQ_REDUCED.matches, HAS_VT = false;
function applyMotion() {
  const m = (S && S.motion) || 'auto';
  REDUCED = m === 'full' ? false : m === 'reduced' ? true : MQ_REDUCED.matches;
  HAS_VT = typeof document.startViewTransition === 'function' && !REDUCED;
  document.documentElement.classList.toggle('rm', REDUCED); document.documentElement.classList.toggle('vt', HAS_VT);
  if (FXS.setReduced) FXS.setReduced(REDUCED);
}

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
const icon = (n, cls) => svg('0 0 24 24', ICONS[n] || ICONS.sparkle, cls);
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
/* Transitions.dev "Card hover tilt": outer wrapper is the flat hit area, the card inside tilts */
function tilt(el) { el.classList.add('t-tilt-card'); el.append(h('span', { class: 't-tilt-glare', 'aria-hidden': 'true' })); return h('div', { class: 't-tilt' }, el); }
const BACKS = { home: 'Focus', learn: 'Learn', tools: 'Toolkit', profile: 'Profile', voyage: 'Voyage', subject: 'Subject' };
const hero = (eyebrow, title, lede) => h('div', { class: 'hero' }, h('p', { class: 'eyebrow' }, eyebrow), h('h1', null, title), lede && h('p', { class: 'lede' }, lede));
const subHero = (eyebrow, title, back, lede, backLabel) => h('div', { class: 'hero' },
  B([icon('back'), backLabel || BACKS[back]], 'go', 'ghost sm backlink', { 'data-tab': back }),
  h('p', { class: 'eyebrow' }, eyebrow), h('h1', null, title), lede && h('p', { class: 'lede' }, lede));

/* ---------- state + migration ---------- */
function makePlan() {
  const p = {};
  for (let w = 0; w < 7; w++) p[w] = DEFAULT_PLAN[w].map((r, i) => ({ id: `d${w}-${i}`, t: r[0], label: r[1], sets: r[2], kind: r[3] }));
  return p;
}
const STAT_KEYS = ['sessions', 'night', 'early', 'weekend', 'bestRun', 'plans', 'voyages', 'gates', 'improve', 'rightTowardsVoyage'];
function freshState() {
  return { v: 3, xp: 0, days: {}, cards: {}, custom: {}, conf: {}, mistakes: [], scores: [], grades: {},
    mock: '2027-01-11', plan: makePlan(), deload: false, timer: { focus: 25, brk: 5 }, focusSets: 0, focusMin: 0, fixedCount: 0,
    skill: {}, learnOk: 0, quoteOk: 0, ach: {}, hidden: {}, plans: [], profile: { name: '', emblem: 'bat' }, motion: 'auto', motionHint: false,
    game: { tokens: 1, lastFree: '', best: 0, boat: 'raft', zone: 'twilight' },
    stat: Object.fromEntries(STAT_KEYS.map(k => [k, 0])) };
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
  s.motion = ['auto', 'full', 'reduced'].includes(r.motion) ? r.motion : 'auto'; s.motionHint = !!r.motionHint;
  const t = obj(r.timer);
  s.timer = { focus: clamp(Math.round(num(t.focus, 25)), 1, 120), brk: clamp(Math.round(num(t.brk, 5)), 1, 60) };
  for (const [k, c] of Object.entries(obj(r.cards))) { const o = obj(c); if (isKey(o.due)) s.cards[k] = { box: clamp(Math.round(num(o.box)), 0, 5), due: o.due }; }
  for (const [k, v] of Object.entries(obj(r.checks))) if (v) s.conf[k] = 3; /* v1/v2 ticks → exam-ready */
  for (const [k, v] of Object.entries(obj(r.conf))) { const n = clamp(Math.round(num(v)), 0, 3); if (n) s.conf[k] = n; }
  for (const [k, g] of Object.entries(obj(r.grades))) { const o = obj(g); s.grades[k] = { cur: str(o.cur, 8), tgt: str(o.tgt, 8), pct: str(o.pct, 4) }; }
  for (const [k, v] of Object.entries(obj(r.skill))) { const o = obj(v); s.skill[k] = { n: num(o.n), ok: num(o.ok), best: num(o.best), run: num(o.run), rec: arr(o.rec).slice(-6).map(Boolean) }; }
  for (const [k, v] of Object.entries(obj(r.ach))) { const o = obj(v); if (num(o.tier) > 0) s.ach[k] = { tier: Math.round(num(o.tier)), date: isKey(o.date) ? o.date : dkey() }; }
  for (const [k, v] of Object.entries(obj(r.hidden))) if (v) s.hidden[k] = true;
  const st = obj(r.stat); for (const k of STAT_KEYS) s.stat[k] = Math.max(0, num(st[k]));
  const p = obj(r.profile); s.profile = { name: str(p.name, 30), emblem: str(p.emblem || 'bat', 20) };
  const g = obj(r.game); s.game = { tokens: Math.max(0, Math.round(num(g.tokens, 1))), lastFree: isKey(g.lastFree) ? g.lastFree : '', best: Math.max(0, num(g.best)), boat: str(g.boat || 'raft', 20), zone: str(g.zone || 'twilight', 20) };
  s.plans = arr(r.plans).map(obj).filter(x => x.kind).slice(-200).map(x => ({ id: num(x.id, newId()), date: isKey(x.date) ? x.date : dkey(), kind: str(x.kind, 20), prompt: str(x.prompt, 300), f: arr(x.f).map(v => str(v, 2000)) }));
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
const TITLES = [[0, 'Wanderer'], [5, 'Lamplighter'], [15, 'Lantern Bearer'], [30, 'Night Scholar'], [60, 'Ferryman'], [100, 'Keeper of the Crossing'], [200, 'Legend of Acheron']];
const titleFor = n => TITLES.filter(t => n >= t[0]).pop()[1];
const nextTitle = n => TITLES.find(t => t[0] > n);
const EMBLEMS = [['bat', 0], ['flame', 0], ['lantern', 5], ['feather', 10], ['moon', 15], ['gem', 30], ['shield', 45], ['crown', 60], ['star', 100]];

/* ---------- subjects, topics and skills (Learn) ---------- */
const SUBJ_BY = Object.fromEntries(LEARN.SUBJECTS.map(s => [s.id, s]));
const TRACK_NAME = t => t === 'science' ? 'Science mix' : t === 'all' ? 'All subjects' : (SUBJ_BY[t] || { name: t }).name;
function quoteCards(id) { const deck = { 'q-mac': 'mac', 'q-acc': 'acc', 'q-je': 'je' }[id]; return deck ? cardsOf(deck).filter(c => /^["“'‘]/.test(c.f.trim())) : []; }
const usable = id => !S.hidden[id] && (LEARN.TOPIC[id].type !== 'quote' || quoteCards(id).length > 0);
function topicsFor(track) {
  const ids = track === 'all' ? Object.keys(LEARN.TOPIC) : track === 'science' ? ['biology', 'chemistry', 'physics'].flatMap(s => SUBJ_BY[s].topics) : SUBJ_BY[track] ? SUBJ_BY[track].topics : (LEARN.TOPIC[track] ? [track] : []);
  return ids.filter(usable);
}
const skill = id => S.skill[id] || { n: 0, ok: 0, best: 0, run: 0, rec: [] };
const stars = id => { const k = skill(id); return k.best >= 5 ? 3 : k.best >= 3 ? 2 : k.ok >= 1 ? 1 : 0; };
const masteredIn = ids => ids.filter(id => stars(id) === 3).length;
const masteredAll = () => masteredIn(Object.keys(LEARN.TOPIC));
const subjectsPractised = () => LEARN.SUBJECTS.filter(s => s.topics.some(t => skill(t).ok > 0)).length;
function record(id, ok) {
  const k = S.skill[id] = skill(id);
  k.n++; k.rec = [...k.rec, ok].slice(-6);
  if (ok) {
    k.ok++; k.run++; k.best = Math.max(k.best, k.run); S.learnOk++; if (id.startsWith('q-')) S.quoteOk++;
    if (++S.stat.rightTowardsVoyage >= 10) { S.stat.rightTowardsVoyage = 0; S.game.tokens++; toast('10 right answers · voyage earned', 'big'); }
  } else k.run = 0;
  save();
}
function pickTopic(track, avoid) {
  const ids = topicsFor(track); if (!ids.length) return null;
  const pool = ids.length > 1 ? ids.filter(i => i !== avoid) : ids;
  const w = pool.map(id => {
    const k = skill(id); if (!k.n) return 3;
    const accu = k.rec.length ? k.rec.filter(Boolean).length / k.rec.length : 0;
    return k.best >= 5 && accu >= .8 ? .5 : 1 + (1 - accu) * 3;
  });
  let r = Math.random() * w.reduce((a, b) => a + b);
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

/* ---------- checklists ---------- */
const CONF = ['Not started', 'Learning', 'Nearly there', 'Exam-ready'];
function listPct(k) { const L = LISTS[k]; return Math.round(L.items.reduce((t, _, i) => t + (S.conf[k + i] || 0), 0) / (3 * L.items.length) * 100); }
const examReady = () => Object.entries(S.conf).filter(([k, v]) => v === 3 && !k.startsWith('pa')).length;

/* ---------- achievements: tiered, permanent ---------- */
const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Legend'];
const ACH = [
  ['sets', 'Focus', 'Lantern Keeper', 'lantern', 'sets finished', [1, 10, 50, 150, 300], () => lifeSets()],
  ['hours', 'Focus', 'Hourglass', 'hourglass', 'hours focused', [1, 5, 20, 50, 100], () => S.focusMin / 60],
  ['days', 'Focus', 'Many Fires', 'calendar', 'days studied', [3, 7, 21, 50, 100], () => daysTrained()],
  ['sessions', 'Focus', 'Full Session', 'check', 'planned sessions completed', [1, 10, 40, 100], () => S.stat.sessions],
  ['night', 'Focus', 'Night Owl', 'moon', 'sets finished after 8pm', [1, 10, 30, 75], () => S.stat.night],
  ['early', 'Focus', 'First Light', 'sparkle', 'sets finished before 9am', [1, 5, 20], () => S.stat.early],
  ['weekend', 'Focus', 'Weekend Warrior', 'shield', 'weekend sets', [5, 20, 60, 120], () => S.stat.weekend],
  ['right', 'Learn', 'Sharp Mind', 'target', 'questions right', [10, 100, 300, 750, 1500], () => S.learnOk],
  ['run', 'Learn', 'Unbroken', 'bolt', 'right in a row', [5, 10, 20, 40], () => S.stat.bestRun],
  ['mastered', 'Learn', 'Master', 'crown', 'topics mastered', [1, 5, 15, 30, 60], () => masteredAll()],
  ['polymath', 'Learn', 'Polymath', 'compass', 'subjects practised', [3, 6, 9], () => subjectsPractised()],
  ['quotes', 'Learn', 'Silver Tongue', 'feather', 'quotes recalled', [10, 50, 150], () => S.quoteOk],
  ['cards', 'Learn', 'Quill of Recall', 'cards', 'flashcards learned well', [10, 30, 60], () => learnedCards()],
  ['plans', 'Learn', 'Architect', 'edit', 'plans written', [1, 5, 15, 40], () => S.stat.plans],
  ['papers', 'Exams', "Ferryman's Coin", 'coin', 'past papers logged', [1, 5, 15, 30], () => S.scores.length],
  ['improve', 'Exams', 'Rising Tide', 'chart', 'personal bests on papers', [1, 5, 15], () => S.stat.improve],
  ['fixes', 'Exams', 'Mended Blade', 'wrench', 'mistakes fixed', [1, 10, 30, 75], () => S.fixedCount],
  ['ready', 'Exams', 'Cartographer', 'map', 'topics rated exam-ready', [5, 25, 60, 120], () => examReady()],
  ['voyages', 'Voyage', 'Ferryman', 'ship', 'voyages sailed', [1, 10, 30, 75], () => S.stat.voyages],
  ['distance', 'Voyage', 'Far Shore', 'star', 'best voyage score', [500, 2000, 5000, 10000, 20000], () => S.game.best],
  ['gates', 'Voyage', 'Gatekeeper', 'sparkle', 'knowledge gates passed', [1, 10, 50, 150], () => S.stat.gates]
].map(([id, cat, name, ic, unit, t, v]) => ({ id, cat, name, icon: ic, unit, t, v }));
const tierOf = a => a.t.filter(x => a.v() >= x).length;
function checkAch(silent) {
  const fresh = [];
  for (const a of ACH) {
    const tier = tierOf(a), had = S.ach[a.id] ? S.ach[a.id].tier : 0;
    if (tier > had) { S.ach[a.id] = { tier, date: dkey() }; fresh.push([a, tier]); }
  }
  if (!fresh.length) return;
  save();
  if (!silent) for (const [a, tier] of fresh.slice(0, 3)) FXS.reveal(`${TIERS[tier - 1]} achievement`, a.name, `${a.t[tier - 1].toLocaleString('en-GB')} ${a.unit} · yours for good`);
}
const badgeCount = () => Object.values(S.ach).reduce((t, a) => t + a.tier, 0);
const badgeTotal = ACH.reduce((t, a) => t + a.t.length, 0);

/* ---------- flashcards ---------- */
function cardsOf(k) {
  return [...DECKS[k].cards.map((c, i) => ({ id: k + i, f: c[0], b: c[1] })), ...(S.custom[k] || []).map(c => ({ id: c.id, f: c.f, b: c.b, custom: true }))];
}
function dueCards(k) { const t = dkey(); return cardsOf(k).filter(o => { const s = S.cards[o.id]; return !s || s.due <= t; }); }
const allDue = () => Object.keys(DECKS).reduce((n, k) => n + dueCards(k).length, 0);
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
    S.focusSets++; S.focusMin += S.timer.focus; S.game.tokens++;
    const now = new Date(), hr = now.getHours(), wd = now.getDay();
    if (hr >= 20 || hr < 4) S.stat.night++; else if (hr < 9) S.stat.early++;
    if (wd === 0 || wd === 6) S.stat.weekend++;
    const d = ensureDay(dkey()), s = T.sid && S.plan[wd].find(x => x.id === T.sid && x.kind === 'train');
    let sub = `Rest ${S.timer.brk} minutes · a voyage is waiting if you want one`;
    if (s) {
      const n = target(s), a = d.s[s.id] = d.s[s.id] || [];
      const j = Array.from({ length: n }, (_, i) => i).find(i => !a[i]);
      if (j != null) { a[j] = true; xp(10); if (countDone(a, n) === n) { xp(20); S.stat.sessions++; sub = `${s.label}: session complete. Rest ${S.timer.brk} minutes.`; } }
      else (d.s.free = d.s.free || []).push(true);
    } else (d.s.free = d.s.free || []).push(true);
    /* rest starts by itself, timed from when the set actually ended (correct even if the phone was locked) */
    const ended = T.end || Date.now();
    T.mode = 'break'; T.left = tTotal(); T.sid = null; T.run = true; T.end = ended + T.left * 1000; T.left = Math.max(0, (T.end - Date.now()) / 1000);
    saveT(); save();
    FXS.reveal('Set complete', `Lantern ${lifeSets()} lit`, sub);
  } else { T.mode = 'focus'; T.left = tTotal(); saveT(); toast('Rest over. Ready when you are.'); }
  render(); checkAch();
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
let LT = 'mm', PD = new Date().getDay(), SEL = null, CHOOSE = false, DR = null, SUBJ_SEL = 'maths', ACH_CAT = 'All', PB = {}, FREE_TRACK = null;
const CHART = new Set(S.scores.length ? S.scores.map(s => s.subj).filter(s => SUBJ.includes(s)) : ['Maths']);
const blankScore = (subj = 'Maths') => ({ date: dkey(), subj, paper: '', score: '', max: '80', lost: [] });
const DRAFT = { score: blankScore(), mis: { subj: 'Maths', topic: '', note: '' }, card: { f: '', b: '' }, grades: null, dr: '', plans: {} };
function setPath(o, path, v) { const p = path.split('.'); for (let i = 0; i < p.length - 1; i++) { o = o[p[i]]; if (!o) return; } o[p[p.length - 1]] = v; }

/* ---------- missions: what to actually do in each set ---------- */
const PRACTISE_STEPS = ['Answer each question from memory, no notes', 'Wrong? Read the method, then hit "Try a similar one"', 'Anything that keeps tripping you up: add it to your fix list'];
function missionFor(label) {
  const L = (label || '').toLowerCase();
  const subj = /math/.test(L) ? 'maths' : /biolog/.test(L) ? 'biology' : /chemi/.test(L) ? 'chemistry' : /physic/.test(L) ? 'physics' : /scien/.test(L) ? 'science'
    : /geograph/.test(L) ? 'geography' : /business/.test(L) ? 'business' : null;
  if (/mistake/.test(L)) return { id: 'fixes', title: 'Redo your mistakes', steps: ['Redo each mistake below from scratch, no notes', 'Got it right? Tap Fixed. Still shaky? Tap Again', 'Nothing waiting? Do the mixed drill instead'] };
  if (/paper|full timed/.test(L)) return { id: 'paper', subj, title: 'Past paper practice', steps: ['Use a paper from your teacher or your exam board website', 'Work timed, in silence, phone face down', 'Mark it with the mark scheme straight after', 'Log the score and where the marks went'].concat(/plan the week/.test(L) ? ['Last few minutes: check next week in your plan'] : []) };
  if (/lit|quote|essay|macbeth|carol|journey/.test(L)) return { id: 'lit', title: 'Quotes and an essay plan', steps: ['Warm up: quote and context questions until you get 5 right', 'Then plan one essay below: thesis and three paragraphs', 'Each paragraph: point, quote, method, effect, context'] };
  if (/english lang|language|timed answer|writing/.test(L)) return { id: 'lang', title: 'English Language practice', steps: ['Pick a question type and read the method', 'Write your answer on paper, timed', 'Check it against the method, then plan a piece of writing'] };
  if (/\bre\b|religio/.test(L)) return { id: 're', title: 'RE: key terms and a 12-mark plan', steps: ['Answer key-term questions until you get 5 right', 'Plan a 12-mark answer below: both sides, then a justified conclusion'] };
  if (subj) return { id: 'drill', subj, title: `${TRACK_NAME(subj)} practice`, steps: subj === 'maths' && /5-a-day/.test(L) ? ['Start with Corbettmaths 5-a-day (Foundation) on paper', ...PRACTISE_STEPS.slice(0, 2)] : PRACTISE_STEPS };
  return { id: 'choose', title: 'Choose what to study', steps: ['Pick a subject below', ...PRACTISE_STEPS.slice(0, 2)] };
}

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
function ringEl(compact) {
  const r = h('div', { class: 'ring' + (T.mode === 'break' ? ' brk' : '') + (T.run ? ' live' : '') + (compact ? ' compact' : '') });
  r.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc9a"/><stop offset=".55" stop-color="#e2b04f"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient></defs><circle class="halo" cx="60" cy="60" r="54"/><circle class="trk" cx="60" cy="60" r="54"/><circle id="tr" class="prg" cx="60" cy="60" r="54"/></svg>';
  r.querySelector('#tr').style.strokeDasharray = String(RING);
  r.append(h('div', { class: 'ring-c' }, h('div', { id: 'tm', class: 'time', role: 'timer' }, fmt(Math.ceil(T.left))), !compact && h('small', null, T.mode === 'focus' ? 'focus' : 'rest')));
  return r;
}
function vHome() {
  const hr = new Date().getHours(), part = hr < 5 ? 'Late night' : hr < 12 ? 'Morning' : hr < 17 ? 'Afternoon' : 'Evening';
  const list = todayTrain(), open = list.filter(x => x.left > 0), active = timerActive(), todayN = setsOn(dkey());
  const cur = active && T.mode === 'focus' ? (T.sid || 'free') : currentSid(), item = list.find(x => x.s.id === cur);
  const restState = !active && T.mode === 'focus' && !open.length && SEL !== 'free';
  const label = item ? item.s.label : '';
  const M = missionFor(label);

  if (T.mode === 'break' && active) return h('div', { class: 'stack home' },
    h('section', { class: 'focus brk' + (T.run ? ' live' : '') },
      h('p', { class: 'eyebrow' }, 'Recovery'), h('h1', { class: 'focus-title' }, 'Rest'),
      h('p', { class: 'focus-meta' }, 'Stand up, drink water, look at something far away.'), ringEl(),
      h('div', { class: 'row center' }, B(T.run ? [icon('pause'), 'Pause'] : [icon('play'), 'Resume'], 'tgl', 'begin sm'), B([icon('skip'), 'Skip rest'], 'skip', 'ghost')),
      S.game.tokens > 0 && h('button', { type: 'button', class: 'practise', 'data-act': 'go', 'data-tab': 'voyage' }, icon('ship'),
        h('span', null, h('b', null, 'Take a voyage while you rest'), h('small', null, `${S.game.tokens} voyage${S.game.tokens === 1 ? '' : 's'} ready`)))));

  if (restState) return h('div', { class: 'stack home' },
    h('section', { class: 'focus calm' },
      h('p', { class: 'eyebrow' }, part),
      h('h1', { class: 'focus-title' }, list.length ? 'The rest is earned' : 'A day of rest'),
      h('p', { class: 'focus-meta' }, list.length ? "Today's sets are done. Recovery is part of the programme." : 'Nothing planned today. Recharge, or do a set if you feel like it.'),
      h('div', { class: 'moon' }, icon('moon')),
      h('div', { class: 'row center' }, B([icon('play'), 'Bonus set'], 'pick', 'ghost', { 'data-sid': 'free' }), B([icon('ship'), 'Voyage'], 'go', 'ghost', { 'data-tab': 'voyage' }))),
    todayStrip(todayN));

  const title = item ? item.s.label : list.length && !open.length ? 'Bonus set' : 'Free study';
  const meta = item ? `Set ${Math.min(item.c + 1, item.n)} of ${item.n} · ${S.timer.focus} minutes` : `${S.timer.focus} minutes · anything you choose`;

  if (active) return h('div', { class: 'stack home working' },
    h('section', { class: 'focus-bar' + (T.run ? ' live' : '') },
      ringEl(true),
      h('div', { class: 'fb-txt' }, h('p', { class: 'eyebrow' }, T.run ? 'In the zone' : 'Paused'), h('b', null, title), h('small', null, meta)),
      h('div', { class: 'fb-ctl' }, B(T.run ? icon('pause') : icon('play'), 'tgl', 'primary icon-only', { 'aria-label': T.run ? 'Pause' : 'Resume' }), B('End', 'rst', 'ghost sm'))),
    missionCard(M, true));

  return h('div', { class: 'stack home' },
    h('section', { class: 'focus' },
      h('p', { class: 'eyebrow' }, `${part} · next up`),
      h('h1', { class: 'focus-title' }, title),
      h('p', { class: 'focus-meta' }, meta),
      ringEl(),
      B([icon('play'), 'Begin'], 'tgl', 'begin'),
      h('div', { class: 'focus-links' },
        B(CHOOSE ? 'Close' : 'Choose something else', 'choose', 'link'), h('span', { 'aria-hidden': 'true' }, '·'), B("Today's plan", 'go', 'link', { 'data-tab': 'today' })),
      CHOOSE && h('div', { class: 'chooser t-panel-slide', 'data-open': 'false' },
        open.map(x => chip([x.s.label, h('span', { class: 'n' }, x.left + ' left')], x.s.id === cur, 'pick', { 'data-sid': x.s.id })),
        chip('Free study', cur === 'free', 'pick', { 'data-sid': 'free' }))),
    motionHint(),
    missionCard(M, false),
    todayStrip(todayN),
    quickWins());
}
function missionCard(M, live) {
  const head = h('div', { class: 'm-head' }, h('span', { class: 'lc-ic' }, icon(M.id === 'fixes' ? 'wrench' : M.id === 'paper' ? 'scroll' : M.id === 'lit' ? 'feather' : M.id === 'lang' ? 'book' : M.id === 're' ? 'sparkle' : 'target')),
    h('div', null, h('p', { class: 'eyebrow' }, live ? 'Your mission' : 'In this set you will'), h('h2', null, M.title)));
  const steps = h('ol', { class: 'm-steps' }, M.steps.map(s => h('li', null, s)));
  if (!live) return h('section', { class: 'card mission' }, head, steps, h('p', { class: 'muted xs' }, 'Press Begin and everything you need appears here.'));
  return h('section', { class: 'card mission live' }, head, steps, missionPanel(M));
}
function missionPanel(M) {
  if (M.id === 'fixes') {
    const due = S.mistakes.filter(m => !m.fixed && m.redo <= dkey());
    if (due.length) return h('div', { class: 'm-panel' }, h('h3', null, `${due.length} ready to redo`), fixList(due));
    return h('div', { class: 'm-panel' }, h('p', { class: 'muted' }, 'No mistakes are waiting. Here is a mixed drill instead.'), drillZone('all'));
  }
  if (M.id === 'paper') return h('div', { class: 'm-panel' },
    h('div', { class: 'row' }, B([icon('scroll'), 'Log this paper'], 'go', 'primary', { 'data-tab': 'papers' }), B([icon('check'), 'Past papers list'], 'listGo', 'ghost', { 'data-k': 'pa' })),
    h('p', { class: 'muted xs' }, 'Finished early, or waiting for a paper? Warm up below.'), drillZone(M.subj || 'science'));
  if (M.id === 'lit') return h('div', { class: 'm-panel' }, drillZone('englit'), planBuilder(['macbeth', 'acc', 'je', 'poetry'], 'focus-lit'));
  if (M.id === 'lang') return h('div', { class: 'm-panel' }, langGuides(), planBuilder(['writing1', 'writing2'], 'focus-lang'), drillZone('englang'));
  if (M.id === 're') return h('div', { class: 'm-panel' }, drillZone('re'), planBuilder(['re'], 'focus-re'));
  if (M.id === 'drill') return h('div', { class: 'm-panel' }, drillZone(M.subj));
  return h('div', { class: 'm-panel' },
    h('div', { class: 'chips' }, LEARN.SUBJECTS.map(s => chip([icon(s.icon), s.name], FREE_TRACK === s.id, 'freeTrack', { 'data-track': s.id }))),
    FREE_TRACK ? drillZone(FREE_TRACK) : h('p', { class: 'muted xs' }, 'Pick a subject to get questions.'));
}
function motionHint() {
  if (!MQ_REDUCED.matches || S.motion !== 'auto' || S.motionHint) return null;
  return h('div', { class: 'banner motion' }, icon('sparkle'), h('div', { class: 'grow' }, h('b', null, 'Animations are switched off on this device'),
    h('p', null, 'Your device asked apps to reduce motion, so Archeron is keeping still. Want the full animated version?'),
    h('div', { class: 'row' }, B([icon('sparkle'), 'Turn on animations'], 'motion', 'primary sm', { 'data-v': 'full' }), B('Keep it still', 'motion', 'ghost sm', { 'data-v': 'reduced' }))));
}
function todayStrip(n) {
  const shown = Math.min(n, 12);
  return h('div', { class: 'strip' },
    h('div', { class: 'embers', 'aria-hidden': 'true' }, Array.from({ length: Math.max(shown, 1) }, (_, i) => h('i', { class: i < n ? 'lit' : '' }))),
    h('span', null, n ? `${n} ${n === 1 ? 'set' : 'sets'} today` : 'Your first set today lights a lantern.'));
}
function quickWins() {
  const dueC = allDue(), dueM = S.mistakes.filter(m => !m.fixed && m.redo <= dkey()).length;
  const items = [
    h('button', { type: 'button', class: 'qw', 'data-act': 'drill', 'data-track': 'all' }, icon('sparkle'), h('span', null, h('b', null, 'Quick mixed questions'), h('small', null, 'All your subjects, a few minutes'))),
    dueC > 0 && h('button', { type: 'button', class: 'qw', 'data-act': 'go', 'data-tab': 'cards' }, icon('cards'), h('span', null, h('b', null, 'Flashcards'), h('small', null, `${dueC} ready to review`))),
    dueM > 0 && h('button', { type: 'button', class: 'qw', 'data-act': 'go', 'data-tab': 'fix' }, icon('wrench'), h('span', null, h('b', null, 'Win back a mark'), h('small', null, `${dueM} mistake${dueM === 1 ? '' : 's'} ready to redo`))),
    S.game.tokens > 0 && h('button', { type: 'button', class: 'qw', 'data-act': 'go', 'data-tab': 'voyage' }, icon('ship'), h('span', null, h('b', null, 'Voyage'), h('small', null, `${S.game.tokens} ready to sail`)))];
  return h('div', { class: 'quick' }, h('p', { class: 'eyebrow' }, 'Spare a few minutes?'), h('div', { class: 'qws' }, items));
}

/* ---------- Learn ---------- */
function vLearn() {
  const hard = Object.keys(LEARN.TOPIC).filter(id => { const k = skill(id); return usable(id) && k.n >= 2 && k.rec.filter(Boolean).length / k.rec.length < .6; }).slice(0, 5);
  return h('div', { class: 'stack' },
    hero('Learn', 'Practice that sticks', 'Answer from memory, check, see the method. Topics you find hard come back more often until they click. Every 10 right answers earns a voyage.'),
    tilt(h('button', { type: 'button', class: 'lcard wide', 'data-act': 'drill', 'data-track': 'all' }, h('span', { class: 'lc-ic' }, icon('compass')), h('b', null, 'Mixed practice'),
      h('span', { class: 'lc-d' }, 'Questions from all your subjects, weighted towards what you find hardest.'), h('small', null, `${S.learnOk.toLocaleString('en-GB')} answered right so far`))),
    h('div', { class: 'sgrid' }, LEARN.SUBJECTS.map(s => { const ids = topicsFor(s.id);
      return tilt(h('button', { type: 'button', class: 'scard', 'data-act': 'subject', 'data-track': s.id },
        h('span', { class: 'lc-ic' }, icon(s.icon)), h('b', null, s.name), h('small', null, `${masteredIn(ids)} of ${ids.length} mastered`), bar(ids.length ? masteredIn(ids) / ids.length * 100 : 0))); })),
    h('div', { class: 'lgrid' },
      tilt(h('button', { type: 'button', class: 'lcard', 'data-act': 'go', 'data-tab': 'write' }, h('span', { class: 'lc-ic' }, icon('edit')), h('b', null, 'Plans and writing'),
        h('span', { class: 'lc-d' }, 'Essay plans, RE 12-markers, creative and viewpoint writing, and how to answer each English question.'), h('small', null, S.plans.length ? `${S.plans.length} plans saved` : 'Plan beats panic'))),
      tilt(h('button', { type: 'button', class: 'lcard', 'data-act': 'go', 'data-tab': 'cards' }, h('span', { class: 'lc-ic' }, icon('cards')), h('b', null, 'Flashcards'),
        h('span', { class: 'lc-d' }, 'Spaced repetition for quotes, formulas and your own cards.'), h('small', null, allDue() ? `${allDue()} ready to review` : 'All reviewed for today')))),
    hard.length && card('Worth another go', null, h('div', { class: 'chips' }, hard.map(id => chip([LEARN.name(id)], false, 'drill', { 'data-topic': id })))),
    h('p', { class: 'muted xs center' }, '★ answered right · ★★ 3 in a row · ★★★ 5 in a row (mastered). Stars are never taken away.'));
}
const starsEl = id => h('span', { class: 'stars', 'aria-label': `${stars(id)} of 3 stars` }, [1, 2, 3].map(i => h('i', { class: i <= stars(id) ? 'on' : '' })));
function vSubject() {
  const s = SUBJ_BY[SUBJ_SEL] || LEARN.SUBJECTS[0], ids = topicsFor(s.id);
  const group = (type, title) => { const g = ids.filter(id => LEARN.TOPIC[id].type === type); return g.length ? card(title, h('span', { class: 'muted' }, g.length + (g.length === 1 ? ' topic' : ' topics')),
    h('ul', { class: 'topics' }, g.map(id => h('li', null, h('button', { type: 'button', 'data-act': 'drill', 'data-topic': id }, h('span', null, LEARN.name(id), LEARN.TOPIC[id].size ? h('small', null, ` · ${LEARN.TOPIC[id].size} facts`) : null), starsEl(id)))))) : null; };
  const extras = s.id === 'englit' ? [B([icon('edit'), 'Plan an essay'], 'go', 'ghost', { 'data-tab': 'write' }), B([icon('cards'), 'Quote flashcards'], 'go', 'ghost', { 'data-tab': 'cards' })]
    : s.id === 're' ? [B([icon('edit'), 'Plan a 12-mark answer'], 'go', 'ghost', { 'data-tab': 'write' })]
    : s.id === 'englang' ? [B([icon('book'), 'Question guides and writing'], 'go', 'ghost', { 'data-tab': 'write' })]
    : s.id === 'physics' || s.id === 'maths' ? [B([icon('cards'), 'Formula flashcards'], 'go', 'ghost', { 'data-tab': 'cards' })] : [];
  return h('div', { class: 'stack narrow' },
    subHero('Learn', s.name, 'learn', `${masteredIn(ids)} of ${ids.length} topics mastered. Hide topics you don't study in Settings.`),
    h('div', { class: 'row' }, B([icon('play'), 'Mixed practice'], 'drill', 'primary', { 'data-track': s.id }), extras),
    group('recall', 'Key facts'), group('calc', s.id === 'maths' ? 'Topics' : s.id === 'physics' ? 'Equations' : 'Calculations'), group('quote', 'Quotes'),
    !ids.length && card(null, null, h('p', { class: 'muted' }, 'All topics in this subject are hidden. Turn them back on in Settings.')));
}
function startDrill(track, topic, ctx = 'learn') {
  DR = { track, topic: topic || null, ctx, q: null, state: 'ask', count: 0, ok: 0, run: 0, last: null, picked: null };
  nextQ();
}
function nextQ(sameTopic) {
  const id = sameTopic || DR.topic || pickTopic(DR.track, DR.last);
  DR.q = id && LEARN.gen(id); DR.state = 'ask'; DR.msg = ''; DR.last = id; DR.picked = null; DRAFT.dr = '';
}
function drillZone(track) {
  if (!DR || DR.ctx !== 'focus' || DR.track !== track) startDrill(track, null, 'focus');
  return drillPanel();
}
function vDrill() {
  if (!DR) return vLearn();
  const title = DR.topic ? LEARN.name(DR.topic) : TRACK_NAME(DR.track);
  const back = DR.topic || SUBJ_BY[DR.track] ? 'subject' : 'learn';
  if (DR.topic) SUBJ_SEL = LEARN.trackOf(DR.topic); else if (SUBJ_BY[DR.track]) SUBJ_SEL = DR.track;
  return h('div', { class: 'stack narrow' },
    subHero(DR.topic ? TRACK_NAME(LEARN.trackOf(DR.topic)) : 'Practice', title, back, null, back === 'subject' ? TRACK_NAME(SUBJ_SEL) : 'Learn'),
    drillPanel(),
    h('p', { class: 'muted xs center' }, 'Keys: 1–4 pick an answer, Enter checks or moves on. Getting it wrong here is how it sticks for the exam.'));
}
function drillPanel() {
  const q = DR && DR.q;
  if (!q) return card(null, null, h('p', { class: 'muted' }, DR && DR.track === 'englit' ? 'Add quotes in Flashcards and they appear here.' : 'Nothing to practise here yet. Check Settings in case these topics are hidden.'));
  const st = DR.state, mcq = q.kind === 'mcq';
  const answerBox = mcq
    ? h('div', { class: 'mcq' }, q.options.map((o, i) => h('button', { type: 'button', class: 'opt' + (st !== 'ask' ? (i === q.a ? ' correct' : i === DR.picked ? ' picked' : ' dim') : ''), 'data-act': 'mcq', 'data-i': i, disabled: st !== 'ask', id: i === 0 ? 'opt0' : null },
      h('span', { class: 'opt-k' }, 'ABCD'[i]), h('span', null, o))))
    : h('div', { class: 'answer' },
      q.pre && h('span', { class: 'adorn' }, q.pre),
      h('input', { id: 'ans', 'data-draft': 'dr', 'data-enter': '1', value: DRAFT.dr, disabled: st !== 'ask', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', inputmode: q.kind === 'num' ? 'decimal' : 'text', enterkeyhint: 'done', 'aria-label': 'Your answer' }),
      q.suf && h('span', { class: 'adorn' }, q.suf));
  return h('section', { class: 'card qcard ' + st },
    h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, q.sub || LEARN.name(q.id)), h('span', null, DR.run >= 3 ? `${DR.run} in a row` : DR.ok ? `${DR.ok} right` : 'Take your time')),
    h('p', { class: 'qtext' + (q.kind === 'word' ? ' quote' : '') }, q.q),
    answerBox,
    st === 'ask' && !mcq && q.hint && h('p', { class: 'muted xs' }, q.hint),
    st === 'ask' ? (mcq ? h('div', { class: 'row end' }, B('Show me', 'reveal', 'link')) : h('div', { class: 'row' }, B('Check', 'check', 'primary grow'), B('Show me', 'reveal', 'ghost')))
      : st === 'right' ? h('div', { class: 'fb ok t-panel-slide', 'data-open': 'false' },
        h('p', { class: 'fb-h' }, successCheck(), pick(['Correct.', 'Exactly right.', 'Nailed it.', 'Yes. That is it.'])),
        !mcq && acc('method', h('span', { class: 'btn link' }, 'See the method'), h('ol', { class: 'steps' }, q.steps.map(s => h('li', null, s))), { cls: '' }),
        B('Next question', 'next', 'primary wide', { id: 'nextq' }))
      : h('div', { class: 'fb no t-panel-slide', 'data-open': 'false' },
        h('p', { class: 'fb-h' }, st === 'shown' ? 'Here is how it works.' : 'Not quite.', DR.msg && h('span', null, ' ' + DR.msg)),
        h('p', null, 'Answer: ', h('b', null, q.show)),
        !mcq && h('ol', { class: 'steps' }, q.steps.map(s => h('li', null, s))),
        h('div', { class: 'row' }, B('Try a similar one', 'similar', 'primary grow', { id: 'nextq' }), B('Next', 'next', 'ghost')),
        B([icon('plus'), 'Add to fix list'], 'drillFix', 'link')));
}

/* ---------- plans and writing ---------- */
const PLAN_FIELDS = {
  lit: ['Thesis: your argument in one sentence', 'Paragraph 1: point, quote, method, effect', 'Paragraph 2: point, quote, method, effect', 'Paragraph 3: point, quote, method, effect', 'Context you will weave in', 'Conclusion: link back to the question'],
  re: ['Argument for, with a religious teaching', 'Argument against, with a religious teaching', 'A non-religious or different view', 'Your justified conclusion'],
  writing: ['Opening hook', 'Paragraph ideas (4–5)', 'Ending', 'Five ambitious words or devices to use']
};
const PLAN_KIND = { macbeth: ['Macbeth', 'lit'], acc: ['A Christmas Carol', 'lit'], je: ["Journey's End", 'lit'], poetry: ['Poetry', 'lit'], re: ['RE 12-marker', 're'], writing1: ['Creative writing (P1 Q5)', 'writing'], writing2: ['Viewpoint writing (P2 Q5)', 'writing'] };
function planDraft(kind) { return DRAFT.plans[kind] = DRAFT.plans[kind] || { pi: Math.floor(Math.random() * PROMPTS[kind].length), f: PLAN_FIELDS[PLAN_KIND[kind][1]].map(() => '') }; }
function planBuilder(kinds, key) {
  const kind = kinds.includes(PB[key]) ? PB[key] : kinds[0], D = planDraft(kind), fields = PLAN_FIELDS[PLAN_KIND[kind][1]];
  return h('section', { class: 'planner' },
    h('div', { class: 'card-h' }, h('h3', null, 'Plan it'), h('span', { class: 'muted xs' }, '5–10 minutes')),
    kinds.length > 1 && h('div', { class: 'chips scroll' }, kinds.map(k => chip(PLAN_KIND[k][0], k === kind, 'pbKind', { 'data-k': key, 'data-kind': k }))),
    h('div', { class: 'prompt' }, h('p', null, PROMPTS[kind][D.pi]), B([icon('reset'), 'New prompt'], 'pbNext', 'ghost sm', { 'data-kind': kind })),
    fields.map((f, i) => field(f, h('textarea', { rows: i === 1 && kind.startsWith('writing') ? 3 : 2, 'data-draft': `plans.${kind}.f.${i}`, value: D.f[i], maxlength: 2000 }))),
    B([icon('check'), 'Save plan'], 'pbSave', 'primary', { 'data-kind': kind }));
}
function langGuides() {
  return h('div', { class: 'guides' }, LANG_GUIDES.map(([t, steps], i) => acc('guide' + i, h('b', null, t), h('ol', { class: 'steps' }, steps.map(s => h('li', null, s))), { cls: 'guide' })));
}
function vWrite() {
  return h('div', { class: 'stack narrow' },
    subHero('Learn', 'Plans and writing', 'learn', 'A five-minute plan is the fastest way to a structured answer. Plans are saved on this device.'),
    card('Plan an answer', null, planBuilder(Object.keys(PLAN_KIND), 'write')),
    card('How to answer English Language questions', null, langGuides()),
    S.plans.length ? card('Saved plans', h('span', { class: 'muted' }, S.plans.length + ' saved'),
      [...S.plans].reverse().slice(0, 30).map(p => acc('plan' + p.id, h('span', { class: 'pl-h' }, h('b', null, PLAN_KIND[p.kind] ? PLAN_KIND[p.kind][0] : p.kind), h('small', null, `${fmtDate(p.date)} · ${p.prompt}`)),
        [h('dl', { class: 'pl' }, (PLAN_FIELDS[(PLAN_KIND[p.kind] || [, 'lit'])[1]] || []).map((f, i) => p.f[i] ? [h('dt', null, f), h('dd', null, p.f[i])] : null)),
          B([icon('x'), 'Delete plan'], 'pbDel', 'link', { 'data-id': p.id })], { cls: 'saved' }))) : null);
}

/* ---------- Profile ---------- */
function emblemEl(id, cls = 'emb') {
  const e = h('span', { class: cls });
  e.append(id === 'bat' ? svg('0 0 200 100', BAT, 'bat') : icon(id));
  return e;
}
function vProfile() {
  const life = lifeSets(), nt = nextTitle(life), CH = 20, chapter = Math.floor(life / CH) + 1, inCh = life % CH;
  const stats = [['lantern', life, 'lanterns lit'], ['hourglass', fmtHours(S.focusMin), 'focused'], ['target', S.learnOk, 'questions right'], ['crown', masteredAll(), 'topics mastered'],
    ['calendar', daysTrained(), 'days studied'], ['scroll', S.scores.length, 'papers logged'], ['wrench', S.fixedCount, 'mistakes fixed'], ['ship', S.game.best, 'best voyage']];
  const cats = ['All', 'Focus', 'Learn', 'Exams', 'Voyage'];
  const shown = ACH.filter(a => ACH_CAT === 'All' || a.cat === ACH_CAT);
  return h('div', { class: 'stack' },
    h('section', { class: 'card idcard' },
      h('div', { class: 'id-emb' }, emblemEl(S.profile.emblem, 'emb big')),
      h('div', { class: 'id-txt' },
        h('input', { class: 'id-name', value: S.profile.name, placeholder: 'Your name', maxlength: 30, 'data-act': 'pname', 'aria-label': 'Your name' }),
        h('p', { class: 'id-title' }, titleFor(life)),
        h('p', { class: 'muted xs' }, nt ? `${nt[0] - life} more lantern${nt[0] - life === 1 ? '' : 's'} to become ${nt[1]}` : 'The highest title on the river.'),
        h('div', { class: 'id-badges' }, h('span', { class: 'lan-chip' }, icon('lantern'), life), h('span', { class: 'lan-chip' }, icon('star'), `${badgeCount()} badges`), h('span', { class: 'lan-chip' }, icon('ship'), `${S.game.tokens} voyages`)))),
    acc('emblems', [h('h2', null, 'Emblem'), h('span', { class: 'muted acc-r' }, 'unlocked by lanterns')],
      h('div', { class: 'emblems' }, EMBLEMS.map(([id, need]) => { const ok = life >= need;
        return h('button', { type: 'button', class: 'emb-pick' + (S.profile.emblem === id ? ' on' : '') + (ok ? '' : ' locked'), 'data-act': 'emblem', 'data-id': id, disabled: !ok, 'aria-label': ok ? `Use ${id} emblem` : `Locked: light ${need} lanterns` },
          emblemEl(id), !ok && h('small', null, need)); }))),
    h('div', { class: 'feats' }, stats.map(([ic, v, l]) => h('div', { class: 'feat' }, icon(ic), h('b', null, typeof v === 'number' ? h('span', { 'data-count': v }, v.toLocaleString('en-GB')) : v), h('span', null, l)))),
    card(`The river · chapter ${chapter}`, h('span', { class: 'muted' }, `${inCh} of ${CH}`), riverSvg(inCh, CH),
      h('p', { class: 'muted xs' }, 'Every set you finish lights a lantern. They never go out, and they unlock boats and river zones in Voyage.')),
    card('Achievements', h('span', { class: 'muted' }, `${badgeCount()} of ${badgeTotal} badges`),
      h('div', { class: 'chips scroll' }, cats.map(c => chip(c, c === ACH_CAT, 'achCat', { 'data-k': c }))),
      h('ul', { class: 'achs' }, shown.map(a => {
        const tier = S.ach[a.id] ? S.ach[a.id].tier : 0, v = a.v(), next = a.t[tier], prev = tier ? a.t[tier - 1] : 0;
        const p = next ? clamp((v - prev) / (next - prev) * 100, 0, 100) : 100;
        return h('li', { class: 'ach t' + tier }, h('span', { class: 'ach-ic' }, icon(a.icon)),
          h('div', { class: 'ach-b' }, h('b', null, a.name), h('small', null, tier ? `${TIERS[tier - 1]} · ` : '', next ? `${Math.floor(v).toLocaleString('en-GB')} / ${next.toLocaleString('en-GB')} ${a.unit}` : `All tiers earned · ${Math.floor(v).toLocaleString('en-GB')} ${a.unit}`), bar(p)),
          h('span', { class: 'pips', 'aria-label': `${tier} of ${a.t.length} tiers` }, a.t.map((_, i) => h('i', { class: i < tier ? 'on t' + (i + 1) : '' })))); }))),
    card('Subject mastery', null, h('ul', { class: 'mastery' }, LEARN.SUBJECTS.map(s => { const ids = topicsFor(s.id), m = masteredIn(ids);
      return h('li', null, h('button', { type: 'button', 'data-act': 'subject', 'data-track': s.id }, icon(s.icon), h('span', null, s.name), h('small', null, `${m}/${ids.length}`)), bar(ids.length ? m / ids.length * 100 : 0)); }))),
    h('div', { class: 'row center' }, B([icon('user'), 'Settings and backup'], 'go', 'ghost', { 'data-tab': 'me' })));
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
  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><path d="${d}" class="water"/><path d="${d}" class="water2"/>${dots}</svg>`;
  return wrap;
}

/* ---------- Voyage ---------- */
let GAMECTL = null, GATE = null, GAME_RESULT = null;
function boatSvg(b, big) {
  const wrap = h('span', { class: 'boat-ic' + (big ? ' big' : '') });
  wrap.innerHTML = `<svg viewBox="0 0 40 60" aria-hidden="true"><ellipse cx="20" cy="30" rx="18" ry="26" fill="${b.trim}" opacity=".12"/><path d="M20 6 Q34 24 31 52 L9 52 Q6 24 20 6Z" fill="${b.hull}" stroke="${b.trim}" stroke-width="2"/><line x1="12" y1="38" x2="28" y2="38" stroke="rgba(0,0,0,.35)"/><circle cx="20" cy="27" r="4" fill="#fff3c4"/></svg>`;
  return wrap;
}
function grantDaily() { if (S.game.lastFree !== dkey()) { S.game.lastFree = dkey(); S.game.tokens++; save(); } }
function vVoyage() {
  const life = lifeSets(), boat = VOYAGE.BOATS.find(b => b.id === S.game.boat) || VOYAGE.BOATS[0], zone = VOYAGE.ZONES.find(z => z.id === S.game.zone) || VOYAGE.ZONES[0];
  return h('div', { class: 'stack' },
    hero('Voyage', 'The river Acheron', 'Steer your ferry, dodge the rocks and gather wisps. Knowledge gates ask a question: get it right for an extra life.'),
    h('section', { class: 'card sail' },
      h('div', { class: 'sail-art' }, boatSvg(boat, true)),
      h('div', { class: 'sail-txt' },
        h('p', { class: 'eyebrow' }, `${zone.name} · ${boat.name}`),
        h('h2', null, S.game.tokens ? `${S.game.tokens} voyage${S.game.tokens === 1 ? '' : 's'} ready` : 'No voyages ready'),
        h('p', { class: 'muted xs' }, S.game.tokens ? `Best score: ${S.game.best.toLocaleString('en-GB')}` : 'Finish a focus set, or get 10 Learn answers right, to earn one. You also get a free one every day.'),
        B([icon('ship'), 'Set sail'], 'sail', 'begin sm', { disabled: !S.game.tokens }))),
    card('Boats', h('span', { class: 'muted' }, 'unlocked by lanterns'), h('div', { class: 'boats' }, VOYAGE.BOATS.map(b => { const ok = life >= b.need;
      return tilt(h('button', { type: 'button', class: 'boat' + (b.id === boat.id ? ' on' : '') + (ok ? '' : ' locked'), 'data-act': 'boat', 'data-id': b.id, disabled: !ok },
        boatSvg(b), h('b', null, b.name), h('small', null, ok ? b.perk : `Light ${b.need} lanterns (${b.need - life} to go)`))); }))),
    card('River zones', h('span', { class: 'muted' }, 'harder zones score more'), h('div', { class: 'zones' }, VOYAGE.ZONES.map(z => { const ok = life >= z.need;
      return h('button', { type: 'button', class: 'zone' + (z.id === zone.id ? ' on' : '') + (ok ? '' : ' locked'), 'data-act': 'zone', 'data-id': z.id, disabled: !ok, style: `--zc:${z.glow};--zw:${z.water[1]}` },
        h('b', null, z.name), h('small', null, ok ? `Score ×${z.mult}` : `Light ${z.need} lanterns`)); }))),
    card('How to play', null, h('ul', { class: 'howto' },
      h('li', null, 'Drag left and right, or use the arrow keys'), h('li', null, 'Rocks cost a life. Wisps add to your score'),
      h('li', null, 'Knowledge gates ask a question. Right answer: +1 life and bonus points'), h('li', null, 'Earn voyages: finish focus sets, get 10 answers right, or come back tomorrow'))));
}
function startVoyage() {
  if (GAMECTL || S.game.tokens <= 0) return;
  S.game.tokens--; save(); GAME_RESULT = null;
  const zone = VOYAGE.ZONES.find(z => z.id === S.game.zone) || VOYAGE.ZONES[0];
  const ov = h('div', { class: 'game-ov', role: 'dialog', 'aria-label': 'Voyage', 'aria-modal': 'true' },
    h('div', { class: 'game-top' }, h('b', null, zone.name), h('div', { class: 'row nowrap' }, B([icon('pause'), 'Pause'], 'gPause', 'ghost sm', { id: 'gpause' }), B(icon('x'), 'gQuit', 'ghost icon-only', { 'aria-label': 'End voyage' }))),
    h('div', { class: 'game-stage' }, h('canvas', { id: 'gcv', 'aria-label': 'Voyage game. Drag or use arrow keys to steer.' })),
    h('div', { id: 'gmodal', class: 'gmodal', hidden: true }));
  document.body.append(ov); document.body.classList.add('gaming');
  GAMECTL = VOYAGE.start($('#gcv'), { boat: S.game.boat, zone: S.game.zone, onGate: gateAsk, onEnd: voyageEnd, reduced: REDUCED });
}
function gmodal(...kids) { const m = $('#gmodal'); if (!m) return; m.replaceChildren(h('div', { class: 'gm-card t-panel-slide', 'data-open': 'false' }, kids)); m.hidden = false; const open = () => m.firstChild && m.firstChild.setAttribute('data-open', 'true'); requestAnimationFrame(() => requestAnimationFrame(open)); setTimeout(open, 100); }
function gmodalClose() { const m = $('#gmodal'); if (m) { m.hidden = true; m.replaceChildren(); } }
function gateAsk(cb) {
  const ids = Object.keys(LEARN.TOPIC).filter(id => usable(id) && (LEARN.TOPIC[id].type === 'recall'));
  const q = ids.length && LEARN.gen(pick(ids));
  if (!q) { cb(true); return; }
  GATE = { q, cb, done: false };
  gmodal(h('p', { class: 'eyebrow' }, 'Knowledge gate · ' + (q.sub || '')), h('p', { class: 'qtext' }, q.q),
    h('div', { class: 'mcq' }, q.options.map((o, i) => h('button', { type: 'button', class: 'opt', 'data-act': 'gate', 'data-i': i }, h('span', { class: 'opt-k' }, 'ABCD'[i]), h('span', null, o)))));
}
function voyageEnd(r) {
  const best = r.score > S.game.best;
  S.stat.voyages++; S.stat.gates += r.gates; if (best) S.game.best = r.score; save(); GAME_RESULT = r;
  gmodal(h('p', { class: 'eyebrow' }, 'Voyage over'), h('h2', { class: 'gm-score' }, r.score.toLocaleString('en-GB')),
    h('p', { class: 'muted' }, best ? 'New best score!' : `Best: ${S.game.best.toLocaleString('en-GB')}`),
    h('div', { class: 'gm-stats' }, h('span', null, h('b', null, r.wisps), ' wisps'), h('span', null, h('b', null, r.gates), ' gates'), h('span', null, h('b', null, r.dist), ' distance')),
    h('div', { class: 'row center' }, S.game.tokens > 0 && B([icon('ship'), `Sail again (${S.game.tokens} left)`], 'sailAgain', 'primary'), B('Back to the shore', 'gClose', 'ghost')));
  checkAch();
}
function closeVoyage() {
  if (GAMECTL) { GAMECTL.stop(); GAMECTL = null; }
  GATE = null; document.querySelector('.game-ov')?.remove(); document.body.classList.remove('gaming');
  render(); checkAch();
}

/* ---------- Toolkit ---------- */
function vTools() {
  const dueM = S.mistakes.filter(m => !m.fixed && m.redo <= dkey()).length;
  const tool = (tab, ic, name, sub, extra = {}) => tilt(h('button', Object.assign({ type: 'button', class: 'tool', 'data-act': 'go', 'data-tab': tab }, extra), h('span', { class: 'lc-ic' }, icon(ic)), h('b', null, name), h('small', null, sub)));
  return h('div', { class: 'stack' },
    hero('Toolkit', 'Everything else', 'Here when you need it.'),
    h('div', { class: 'tools' },
      tool('lists', 'check', 'Checklists', `${examReady()} topics exam-ready · every subject`),
      tool('papers', 'scroll', 'Past papers', S.scores.length ? `${S.scores.length} logged · chart and marks lost` : 'Log scores, see your trend'),
      tool('fix', 'wrench', 'Fix list', dueM ? `${dueM} ready to redo` : 'Turn mistakes into marks'),
      tool('cards', 'cards', 'Flashcards', allDue() ? `${allDue()} ready to review` : 'All reviewed for today'),
      tool('today', 'flame', "Today's plan", 'Tick sets you did away from the app'),
      tool('plan', 'calendar', 'Weekly plan', `${weekTarget()} sets a week${S.deload ? ' · deload' : ''}`),
      tool('write', 'edit', 'Plans and writing', `${S.plans.length} saved`),
      tool('me', 'user', 'Settings', 'Subjects, grades, timer, backup')));
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
        : `Heading for ${p}% against ${tg}%. The marks-to-win-back list shows the quickest ${tg - p}% to find.`;
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
      h('p', { class: 'muted xs' }, 'Put quotes inside quotation marks and they also appear in quote recall.'),
      B([icon('plus'), 'Add card'], 'addCard', 'primary'),
      mine.length ? h('ul', { class: 'list' }, mine.map(c => h('li', null, h('div', { class: 'grow' }, h('b', null, c.f), h('small', null, c.b)),
        B(icon('x'), 'delCard', 'ghost icon-only', { 'data-id': c.id, 'aria-label': 'Delete card' })))) : null], { open: !all.length }));
}

/* Checklists: confidence per topic, with a practise link */
function vLists() {
  const L = LISTS[LT], p = listPct(LT), conf = L.type === 'conf';
  const counts = [0, 0, 0, 0]; L.items.forEach((_, i) => counts[S.conf[LT + i] || 0]++);
  return h('div', { class: 'stack narrow' },
    subHero('Coverage', 'Checklists', 'tools', 'Rate how ready you are on each topic. Tap the sparkle to practise it straight away.'),
    h('div', { class: 'chips scroll' }, Object.keys(LISTS).map(k => chip([LISTS[k].name, h('span', { class: 'n' }, listPct(k) + '%')], k === LT, 'list', { 'data-k': k }))),
    card(L.name, h('b', { class: 'y' }, p + '%'), bar(p),
      conf && h('div', { class: 'conf-key' }, CONF.slice(1).map((c, i) => h('span', { class: 'ck lv' + (i + 1) }, h('i'), `${c} · ${counts[i + 1]}`))),
      conf ? h('ul', { class: 'clist' }, L.items.map(([label, link], i) => {
        const key = LT + i, v = S.conf[key] || 0, canPractise = link && LEARN.TOPIC[link] && usable(link);
        return h('li', { class: 'ci lv' + v },
          h('div', { class: 'ci-l' }, h('b', null, label), h('small', null, CONF[v])),
          h('div', { class: 'conf', role: 'group', 'aria-label': `Confidence for ${label}` }, [1, 2, 3].map(lv => h('button', { type: 'button', class: 'cf' + (lv <= v ? ' on' : ''), 'data-act': 'conf', 'data-k': key, 'data-v': lv, 'aria-label': CONF[lv], 'aria-pressed': String(lv === v) }))),
          canPractise ? B(icon('sparkle'), 'drill', 'ghost icon-only', { 'data-topic': link, 'aria-label': `Practise ${label}` }) : h('span', { class: 'ci-sp' }));
      }))
        : h('div', { class: 'checks' }, L.items.map(([label], i) => { const on = (S.conf[LT + i] || 0) === 3;
          return h('label', { class: 'chk' + (on ? ' d' : '') }, h('input', { type: 'checkbox', checked: on, 'data-act': 'chk', 'data-i': i }), checkBox(), h('span', null, label)); })),
      h('p', { class: 'muted xs' }, conf ? 'Exam-ready means you can answer an exam question on it without notes.' : 'Tick each paper once it is done and marked.')));
}

/* Fix list */
function fixList(open) {
  const t = dkey();
  return h('ul', { class: 'list' }, open.map(m => { const isDue = m.redo <= t;
    return h('li', { class: isDue ? 'due' : '' },
      h('div', { class: 'grow' }, h('b', null, `${m.subj}: ${m.topic}`), m.note && h('small', null, m.note), h('small', { class: isDue ? 'y' : '' }, isDue ? 'Ready to redo' : 'Back on ' + fmtDate(m.redo))),
      isDue ? h('div', { class: 'row nowrap' }, B('Fixed', 'misOk', 'primary sm', { 'data-id': m.id }), B('Again', 'misAgain', 'ghost sm', { 'data-id': m.id }))
        : B(icon('x'), 'misDel', 'ghost icon-only', { 'data-id': m.id, 'aria-label': 'Delete mistake' })); }));
}
function vFix() {
  const open = S.mistakes.filter(m => !m.fixed).sort((a, b) => a.redo < b.redo ? -1 : 1), M = DRAFT.mis;
  return h('div', { class: 'stack' },
    subHero('Redo loop', 'Fix list', 'tools', 'Every mistake you redo is a mark you take back on the day.'),
    h('div', { class: 'cols' },
      card('Add a mistake', null,
        h('div', { class: 'grid2' }, field('Subject', selectSubj('mis.subj', M.subj)), field('Topic', h('input', { 'data-draft': 'mis.topic', value: M.topic, placeholder: 'e.g. Ratio', maxlength: 80 }))),
        field('What went wrong', h('textarea', { rows: 2, 'data-draft': 'mis.note', value: M.note, placeholder: 'e.g. Shared in the wrong order', maxlength: 300 })),
        B('Add · redo in 3 days', 'addMis', 'primary wide')),
      card('Redo list', h('span', { class: 'muted' }, `${S.fixedCount} fixed so far`),
        open.length ? fixList(open) : h('p', { class: 'muted' }, 'Nothing waiting. After a paper or a drill, add what tripped you up.'))));
}

/* Plan editor */
function vPlan() {
  const w = PD, plan = S.plan[w];
  const kinds = [['train', 'Training'], ['rest', 'Rest'], ['other', 'Fixed (e.g. tutoring)']];
  return h('div', { class: 'stack narrow' },
    subHero('Your week', 'Training plan', 'tools', 'Name sessions after a subject (e.g. "Geography", "Science: Chemistry") and Focus builds the right mission for them.'),
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
      h('div', { class: 'stack' },
        card('My subjects and topics', null, h('p', { class: 'muted xs' }, "Hide topics you don't study, e.g. a religion or poetry cluster you're not doing. Hidden topics leave practice, gates and missions."),
          LEARN.SUBJECTS.map(s => acc('hide-' + s.id, [h('b', null, s.name), h('span', { class: 'muted acc-r' }, `${s.topics.filter(t => !S.hidden[t]).length} of ${s.topics.length} on`)],
            h('div', { class: 'hides' }, s.topics.map(t => h('label', { class: 'toggle sm' }, h('input', { type: 'checkbox', checked: !S.hidden[t], 'data-act': 'hide', 'data-topic': t, role: 'switch' }), h('span', null, LEARN.name(t))))), { cls: 'guide' }))),
        card('My grades', null, h('p', { class: 'muted xs' }, 'Saved only on this device. Target % is what you aim for on past papers; it shows on your chart.'),
          h('div', { class: 'tbl' }, h('table', { class: 'edit' }, h('tr', null, h('th', null, 'Subject'), h('th', null, 'Now'), h('th', null, 'Target'), h('th', null, 'Target %')),
            SUBJ.map(s => h('tr', null, h('td', null, s),
              h('td', null, h('input', { 'data-draft': `grades.${s}.cur`, value: G[s].cur, maxlength: 8, 'aria-label': s + ' current grade' })),
              h('td', null, h('input', { 'data-draft': `grades.${s}.tgt`, value: G[s].tgt, maxlength: 8, 'aria-label': s + ' target grade' })),
              h('td', null, h('input', { type: 'number', min: 0, max: 100, inputmode: 'numeric', 'data-draft': `grades.${s}.pct`, value: G[s].pct, 'aria-label': s + ' target percent' })))))),
          B('Save grades', 'saveGrades', 'primary'))),
      h('div', { class: 'stack' },
        card('Focus timer', null,
          h('div', { class: 'chips' }, [[25, 5], [45, 10], [15, 3]].map(([f, b]) => chip(`${f} / ${b} min`, S.timer.focus === f && S.timer.brk === b, 'preset', { 'data-f': f, 'data-b': b }))),
          h('div', { class: 'grid2', style: 'margin-top:12px' },
            field('Focus minutes', h('input', { type: 'number', min: 1, max: 120, value: S.timer.focus, 'data-act': 'tlen', 'data-k': 'focus' })),
            field('Rest minutes', h('input', { type: 'number', min: 1, max: 60, value: S.timer.brk, 'data-act': 'tlen', 'data-k': 'brk' })))),
        card('Motion', null, h('p', { class: 'muted xs' }, 'Auto follows your device setting. Full turns on every animation and effect.'),
          h('div', { class: 'chips' }, [['auto', 'Auto'], ['full', 'Full'], ['reduced', 'Reduced']].map(([v, l]) => chip(l, S.motion === v, 'motion', { 'data-v': v }))),
          MQ_REDUCED.matches && h('p', { class: 'muted xs' }, 'Your device currently asks for reduced motion.')),
        card('Mocks', null, field('First mock exam', h('input', { type: 'date', value: S.mock, 'data-act': 'mock' })), h('p', { class: 'muted xs' }, 'Used for the trend line on your score chart.')),
        card('Backup', null, h('p', { class: 'muted xs' }, 'Progress lives in this browser. Back up weekly, and use it to move devices.'),
          h('div', { class: 'row' }, B([icon('download'), 'Download'], 'exp', 'primary'),
            h('label', { class: 'btn ghost' }, icon('upload'), 'Restore', h('input', { type: 'file', accept: '.json,application/json', 'data-act': 'imp', class: 'sr' })))),
        card('Install', null, h('p', { class: 'muted xs' }, h('b', null, 'iPhone: '), 'Safari → Share → Add to Home Screen.', h('br'), h('b', null, 'Android: '), 'Chrome menu ⋮ → Install app.')),
        card('Start over', null, h('p', { class: 'muted xs' }, 'Wipes everything on this device. Download a backup first.'), B('Reset everything', 'reset', 'ghost danger')))));
}

/* ---------- shell ---------- */
const TABS = [['home', 'flame', 'Focus'], ['learn', 'sparkle', 'Learn'], ['voyage', 'ship', 'Voyage'], ['profile', 'user', 'Profile'], ['tools', 'grid', 'Toolkit']];
const PARENT = { today: 'home', drill: 'learn', subject: 'learn', write: 'learn', cards: 'learn', papers: 'tools', lists: 'tools', fix: 'tools', plan: 'tools', me: 'tools' };
const VIEWS = { home: vHome, learn: vLearn, subject: vSubject, drill: vDrill, write: vWrite, voyage: vVoyage, profile: vProfile, tools: vTools, today: vToday, papers: vPapers, cards: vCards, lists: vLists, fix: vFix, plan: vPlan, me: vMe };
const ORDER = t => { const p = PARENT[t] || t, i = TABS.findIndex(x => x[0] === p); return i * 10 + (PARENT[t] ? 5 : 0); };
let renderedDay = dkey();

let shownLife = null;
function hdr() {
  const life = lifeSets(), el = $('#cd'), showMini = T.run && TAB !== 'home', grew = shownLife != null && life > shownLife;
  shownLife = life;
  el.replaceChildren(
    showMini ? h('button', { type: 'button', class: 'mini-t', 'data-act': 'go', 'data-tab': 'home', 'aria-label': 'Back to the running timer' }, icon(T.mode === 'focus' ? 'flame' : 'moon'), h('span', { id: 'mt' }, fmt(Math.ceil(T.left)))) : '',
    h('button', { type: 'button', class: 'lan-chip', 'data-act': 'go', 'data-tab': 'profile', 'aria-label': `${life} lanterns lit. Open profile` }, emblemEl(S.profile.emblem, 'emb sm'), digits(life, grew)));
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
  const parts = ['act', 'draft', 'sid', 'j', 'i', 'id', 'tab', 'k', 'd', 'deck', 'subj', 'field', 'ok', 'track', 'topic', 'v', 'kind'].filter(a => el.dataset[a] != null).map(a => `[data-${a}="${CSS.escape(el.dataset[a])}"]`);
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
    if (!REDUCED) for (const el of view.querySelectorAll('.hero, .focus')) { el.classList.add('t-stagger'); void el.offsetWidth; const show = () => el.classList.add('is-shown'); requestAnimationFrame(show); setTimeout(show, 120); }
  }
  const panels = view.querySelectorAll('.t-panel-slide[data-open="false"]');
  if (panels.length) { const open = () => panels.forEach(p => p.setAttribute('data-open', 'true')); requestAnimationFrame(() => requestAnimationFrame(open)); setTimeout(open, 150); }
}
/* Page changes slide sideways in the direction of travel (View Transitions API, motion tuned after Transitions.dev "Page side-by-side") */
function go(t, focusSel) {
  if (!VIEWS[t]) return;
  const dir = ORDER(t) >= ORDER(TAB) ? 'fwd' : 'back';
  const swap = () => { TAB = t; if (t === 'plan') PD = new Date().getDay(); CHOOSE = false; render({ enter: true }); scrollTo(0, 0); };
  if (HAS_VT && t !== TAB) { document.documentElement.dataset.dir = dir; document.startViewTransition(swap); }
  else swap();
  setTimeout(() => { const f = focusSel && $(focusSel); (f || $('#view')).focus({ preventScroll: true }); }, HAS_VT ? 60 : 0);
}

function toast(m, cls = '') {
  const t = h('div', { class: 'toast t-toast ' + cls }, m);
  $('#toasts').append(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('is-open'))); setTimeout(() => t.classList.add('is-open'), 80);
  setTimeout(() => { t.classList.remove('is-open'); setTimeout(() => t.remove(), 300); }, 2400);
}

/* ---------- actions ---------- */
const findSess = sid => { for (let w = 0; w < 7; w++) { const i = S.plan[w].findIndex(s => s.id === sid); if (i > -1) return { w, i, s: S.plan[w][i] }; } return null; };
function finishAnswer(res) {
  record(DR.q.id, res.ok);
  DR.state = res.ok ? 'right' : 'wrong'; DR.msg = res.msg || '';
  if (res.ok) { DR.ok++; DR.run++; S.stat.bestRun = Math.max(S.stat.bestRun, DR.run); save(); } else DR.run = 0;
  render({ focus: '#nextq' });
  if (res.ok) FXS.burst($('.qcard'), DR.run >= 5 ? 60 : 36);
}
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
    if (full) { xp(20); S.stat.sessions++; toast('Session complete', 'big'); }
    save(); render({ pulse: `.dot[data-sid="${CSS.escape(s.id)}"][data-j="${j}"]`, burst: a[j] ? (full ? 70 : 24) : 0 });
  },
  tgl() {
    if (T.run) { T.left = Math.max(0, (T.end - Date.now()) / 1000); T.run = false; }
    else { if (T.mode === 'focus' && !timerActive()) { T.sid = currentSid(); DR = null; } T.end = Date.now() + T.left * 1000; T.run = true; }
    saveT(); render(); scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  },
  rst() { if (T.mode === 'focus' && T.run && !confirm('End this set early? It will not count as a lantern.')) return; T.run = false; T.mode = 'focus'; T.left = tTotal(); T.sid = null; saveT(); render(); },
  skip() { T.run = false; T.mode = T.mode === 'focus' ? 'break' : 'focus'; T.left = tTotal(); saveT(); render(); },
  pick(el) { SEL = el.dataset.sid; CHOOSE = false; if (!T.run) { T.mode = 'focus'; T.left = tTotal(); saveT(); } render(); },
  choose() { CHOOSE = !CHOOSE; render(); },
  freeTrack(el) { FREE_TRACK = el.dataset.track; DR = null; render(); },
  preset(el) { S.timer = { focus: +el.dataset.f, brk: +el.dataset.b }; save(); if (!T.run) { T.left = tTotal(); saveT(); } render(); },
  subject(el) { SUBJ_SEL = el.dataset.track; go('subject'); },
  drill(el) {
    if (el.dataset.topic) startDrill(LEARN.trackOf(el.dataset.topic), el.dataset.topic); else startDrill(el.dataset.track || 'all');
    go('drill', DR.q && DR.q.kind === 'mcq' ? '#opt0' : '#ans');
  },
  mcq(el) { if (!DR || DR.state !== 'ask') return; DR.picked = +el.dataset.i; finishAnswer(LEARN.check(DR.q, String(DR.picked))); },
  check() {
    if (!DR || !DR.q || DR.state !== 'ask' || DR.q.kind === 'mcq') return;
    const res = LEARN.check(DR.q, DRAFT.dr);
    if (!res.valid) { toast(res.msg || 'Type an answer'); $('#ans')?.focus(); return; }
    finishAnswer(res);
  },
  reveal() { if (!DR || DR.state !== 'ask') return; record(DR.q.id, false); DR.run = 0; DR.state = 'shown'; render({ focus: '#nextq' }); },
  next() { DR.count++; nextQ(); render({ focus: DR.q && DR.q.kind === 'mcq' ? '#opt0' : '#ans' }); },
  similar() { DR.count++; nextQ(DR.q.id); render({ focus: DR.q && DR.q.kind === 'mcq' ? '#opt0' : '#ans' }); },
  drillFix() {
    const q = DR.q, subj = SUBJ_BY[LEARN.trackOf(q.id)].subj;
    S.mistakes.push({ id: newId(), date: dkey(), subj, topic: LEARN.name(q.id), note: `${q.q} → ${q.show}`.slice(0, 300), redo: addDays(3), fixed: false });
    save(); toast('Added to your fix list · back in 3 days');
  },
  pbKind(el) { PB[el.dataset.k] = el.dataset.kind; render(); },
  pbNext(el) { const D = planDraft(el.dataset.kind); D.pi = (D.pi + 1) % PROMPTS[el.dataset.kind].length; render(); },
  pbSave(el) {
    const kind = el.dataset.kind, D = planDraft(kind);
    if (!D.f.some(x => x.trim())) return toast('Write at least one part of the plan');
    S.plans.push({ id: newId(), date: dkey(), kind, prompt: PROMPTS[kind][D.pi], f: D.f.map(x => x.trim()) });
    S.stat.plans++; delete DRAFT.plans[kind]; save(); toast('Plan saved. Now write it up on paper.', 'big'); render();
  },
  pbDel(el) { if (!confirm('Delete this plan?')) return; S.plans = S.plans.filter(p => p.id !== +el.dataset.id); save(); render(); },
  emblem(el) { S.profile.emblem = el.dataset.id; save(); render(); },
  motion(el) { S.motion = el.dataset.v; S.motionHint = true; save(); applyMotion(); render({ enter: true }); if (!REDUCED) toast('Full motion on', 'big'); },
  achCat(el) { ACH_CAT = el.dataset.k; render(); },
  sail() { startVoyage(); },
  sailAgain() { if (GAMECTL) { GAMECTL.stop(); GAMECTL = null; } document.querySelector('.game-ov')?.remove(); document.body.classList.remove('gaming'); startVoyage(); },
  boat(el) { S.game.boat = el.dataset.id; save(); render(); },
  zone(el) { S.game.zone = el.dataset.id; save(); render(); },
  gPause() {
    if (!GAMECTL || GATE) return;
    GAMECTL.pause();
    gmodal(h('p', { class: 'eyebrow' }, 'Paused'), h('h2', null, 'Catch your breath'), h('div', { class: 'row center' }, B([icon('play'), 'Resume'], 'gResume', 'primary'), B('End voyage', 'gEnd', 'ghost')));
  },
  gResume() { gmodalClose(); GAMECTL && GAMECTL.resume(); },
  gEnd() { gmodalClose(); GAMECTL && GAMECTL.finish(); },
  gQuit() { if (GAME_RESULT || !GAMECTL) return closeVoyage(); ACT.gPause(); },
  gClose() { closeVoyage(); },
  gate(el) {
    if (!GATE || GATE.done) return;
    const i = +el.dataset.i, q = GATE.q, ok = i === q.a; GATE.done = true;
    record(q.id, ok);
    gmodal(h('p', { class: 'eyebrow' }, 'Knowledge gate'), h('p', { class: 'fb-h ' + (ok ? 'okc' : 'noc') }, ok ? [successCheck(), 'Correct · +1 life'] : 'Not this time'),
      h('p', null, q.q, ' → ', h('b', null, q.show)), B([icon('play'), 'Sail on'], 'gateGo', 'primary wide', { 'data-ok': ok ? 1 : 0, id: 'gatego' }));
    setTimeout(() => $('#gatego')?.focus(), 50);
  },
  gateGo(el) { const g = GATE; GATE = null; gmodalClose(); g && g.cb(el.dataset.ok === '1'); },
  chart(el) { const s = el.dataset.subj; CHART.has(s) ? CHART.delete(s) : CHART.add(s); render(); },
  lostAdd() { DRAFT.score.lost.push({ topic: '', type: QTYPES[0], marks: '' }); render(); const r = $('#view').querySelectorAll('.lost-row input'); if (r.length) r[r.length - 2].focus(); },
  lostDel(el) { DRAFT.score.lost.splice(+el.dataset.i, 1); render(); },
  addScore() {
    const D = DRAFT.score, sc = parseFloat(D.score), mx = parseFloat(D.max);
    if (D.score === '' || !Number.isFinite(sc) || sc < 0) { toast('Enter your score'); $('#sc')?.focus(); return; }
    if (!(mx > 0)) return toast('"Out of" needs to be more than 0');
    if (sc > mx) return toast('Score is higher than the total');
    const lost = D.lost.map(l => ({ topic: l.topic.trim(), type: l.type, marks: Math.max(0, +l.marks || 0) })).filter(l => l.topic && l.marks > 0);
    const prevBest = Math.max(-1, ...subjPts(D.subj).map(pctOf)), p = Math.round(sc / mx * 100);
    S.scores.push({ id: newId(), date: isKey(D.date) ? D.date : dkey(), subj: D.subj, paper: D.paper.trim(), score: sc, max: mx, lost });
    if (prevBest >= 0 && p > prevBest) { S.stat.improve++; toast(`${p}% · a personal best in ${D.subj}!`, 'big'); } else toast(`${p}% logged. Every paper sharpens you.`);
    CHART.add(D.subj); xp(25);
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
  listGo: el => { LT = el.dataset.k; go('lists'); },
  conf(el) {
    const k = el.dataset.k, v = +el.dataset.v, cur = S.conf[k] || 0, nv = cur === v ? v - 1 : v;
    if (nv) S.conf[k] = nv; else delete S.conf[k];
    save(); render({ pulse: `.cf[data-k="${CSS.escape(k)}"][data-v="${Math.max(1, nv)}"]` });
    if (nv === 3) toast('Exam-ready', 'big');
  },
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
  chk(el) { const k = LT + el.dataset.i; if (el.checked) S.conf[k] = 3; else delete S.conf[k]; save(); if (el.checked && listPct(LT) === 100) toast('List complete', 'big'); render({ recheck: `label:has(> [data-act="chk"][data-i="${el.dataset.i}"])` }); },
  deload(el) { S.deload = el.checked; save(); toast(el.checked ? 'Deload on: half volume this week' : 'Deload off: full programme'); render(); },
  hide(el) { const t = el.dataset.topic; if (el.checked) delete S.hidden[t]; else S.hidden[t] = true; save(); },
  pname(el) { S.profile.name = str(el.value, 30).trim(); save(); },
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
      S = normalize(data); DRAFT.grades = null; save(); checkAch(true); toast('Backup restored'); render();
    }).catch(() => toast('That file is not an Archeron or Nightwatch backup')).finally(() => { el.value = ''; });
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.matches('input, select, textarea') || el.disabled) return;
  const f = ACT[el.dataset.act]; if (f) { f(el, e); checkAch(); }
});
document.addEventListener('change', e => { const el = e.target, f = el.dataset && CHG[el.dataset.act]; if (f) { f(el); checkAch(); } });
document.addEventListener('input', e => { const el = e.target; if (el.dataset && el.dataset.draft) setPath(DRAFT, el.dataset.draft, el.value); });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) { e.preventDefault(); ACT.check(); checkAch(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input, textarea, select')) return;
  if (GATE && !GATE.done && /^[1-4]$/.test(e.key)) { $(`#gmodal [data-act="gate"][data-i="${+e.key - 1}"]`)?.click(); return; }
  if (DR && (TAB === 'drill' || TAB === 'home') && DR.q && !GAMECTL) {
    if (DR.state === 'ask' && DR.q.kind === 'mcq' && /^[1-4]$/.test(e.key)) { $(`[data-act="mcq"][data-i="${+e.key - 1}"]`)?.click(); return; }
    if (DR.state !== 'ask' && e.key === 'Enter' && !e.target.closest('button')) { ACT.next(); return; }
  }
  if (TAB === 'cards') {
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); $('.flash')?.click(); }
    else if (CD.flip && (e.key === '1' || e.key === '2')) $(`#rate [data-ok="${e.key === '2' ? 1 : 0}"]`)?.click();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (GAMECTL && !GATE && !GAME_RESULT && !GAMECTL.isPaused()) ACT.gPause(); return; }
  timerTick(); if (dkey() !== renderedDay) { grantDaily(); render(); }
});
/* Transitions.dev "Card hover tilt" (mouse only, so touch scrolling is never blocked) */
let tiltEl = null;
const untilt = el => { if (!el) return; el.classList.remove('is-hover'); const c = el.firstElementChild; if (c) { c.classList.remove('is-tilting'); } el.style.setProperty('--tilt-rx', '0deg'); el.style.setProperty('--tilt-ry', '0deg'); };
document.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || REDUCED) return;
  const t = e.target.closest && e.target.closest('.t-tilt');
  if (t !== tiltEl) { untilt(tiltEl); tiltEl = t; }
  if (!t) return;
  const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  t.style.setProperty('--tilt-rx', ((.5 - y) * 9).toFixed(2) + 'deg'); t.style.setProperty('--tilt-ry', ((x - .5) * 11).toFixed(2) + 'deg');
  t.style.setProperty('--tilt-gx', (x * 100).toFixed(1) + '%'); t.style.setProperty('--tilt-gy', (y * 100).toFixed(1) + '%');
  t.classList.add('is-hover'); t.firstElementChild && t.firstElementChild.classList.add('is-tilting');
});
document.addEventListener('pointerleave', () => { untilt(tiltEl); tiltEl = null; });
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { movePill(false); if (TAB === 'papers') drawChart(); }, 120); });
setInterval(() => { timerTick(); if (dkey() !== renderedDay) { grantDaily(); render(); } }, 250);

applyMotion();
/* intro */
(function intro() {
  const i = $('#intro'); if (!i) return;
  const end = () => { if (!i.isConnected) return; i.classList.add('out'); setTimeout(() => i.remove(), 600); };
  if (REDUCED) { i.remove(); return; }
  i.addEventListener('click', end); setTimeout(end, 2200);
})();

applyMotion();
FXS.init();
grantDaily();
checkAch(true);
render({ enter: true });
if (T.run && T.end <= Date.now()) timerDone();
if (bootNote) setTimeout(() => toast(bootNote), 600);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  /* when a new version takes over, reload once so the update shows immediately (never mid-set) */
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    const reload = () => { if (!T.run && !GAMECTL) { reloading = true; location.reload(); } else setTimeout(reload, 5000); };
    reload();
  });
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
