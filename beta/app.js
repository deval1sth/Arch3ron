/* Archeron · app logic. UI is built from DOM nodes (never HTML strings with user data),
   events are delegated via data-act attributes, form drafts survive re-renders. */
'use strict';

/* fx.js may be missing if an old cached index.html is served during an update */
const FXS = typeof FX !== 'undefined' ? FX : { init() {}, burst() {}, countUp() {}, reveal() {} };
/* each profile on this device has its own saved progress (me.js picks which); the beta never imports anyone's old data */
const K = ME.keys.state, OLD = 'archeron-beta-none', TK = ME.keys.timer, TABK = ME.keys.tab;
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
/* Look: the page (Paper, Night or match the phone) and your highlighter colour. index.html applies the same choice before first paint. */
const THEMES = [['lime', 'Lime', '#b6ef4f'], ['pink', 'Pink', '#ff9fd4'], ['orange', 'Orange', '#ffb65c'], ['sky', 'Sky', '#85d5ff'], ['lilac', 'Lilac', '#c8b4ff']];
const MODES = [['paper', 'Paper'], ['night', 'Night'], ['auto', 'Match my phone']];
const MQ_DARK = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const root = document.documentElement, mode = (S && S.mode) || 'paper', hl = (S && S.theme) || 'lime';
  if (mode === 'night' || (mode === 'auto' && MQ_DARK.matches)) root.dataset.mode = 'night'; else delete root.dataset.mode;
  if (hl === 'lime') delete root.dataset.hl; else root.dataset.hl = hl;
  root.dataset.text = (S && S.text) || 'normal';
  try { localStorage.setItem('archeron-beta-look', mode + ' ' + hl); } catch (e) {}
  const meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim() || '#f4f6fb');
}
(MQ_DARK.addEventListener ? MQ_DARK.addEventListener.bind(MQ_DARK, 'change') : MQ_DARK.addListener.bind(MQ_DARK))(() => { if (S && S.mode === 'auto') applyTheme(); });
const daysToMocks = () => Math.ceil((new Date(S.mock + 'T09:00') - new Date()) / 864e5);

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
/* "Watch it on the board" for any question whose demo builds and passes its checks; the demo is kept by key for ACT.board */
const BOARD_Q = new Map(); let boardN = 0;
function boardBtn(q, cls = 'ghost', similar = false) {
  const d = typeof DEMO !== 'undefined' && DEMO.build(q); if (!d || !d.ok) return null;
  const k = String(boardN++ % 300); BOARD_Q.set(k, d);
  return B([icon('play'), 'Watch it on the board'], 'board', cls, { 'data-k': k, 'data-sim': similar ? '1' : null });
}
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
const BACKS = { friends: 'Friends', lab: 'Experimental', ppp: 'PPP mode', feedback: 'Writing feedback', search: 'Search', ready: 'Readiness', mockstart: 'Mock hall', week: 'Weekly review', study: 'Guides', listen: 'Listen', guide: 'Guide', session: 'Your session', stats: 'Learned', numbers: 'Stats', exam: 'Exam practice', home: 'Focus', learn: 'Learn', tools: 'Toolkit', profile: 'Profile', mocks: 'Mocks', wrapped: 'Wrapped', subject: 'Subject' };
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
  return { v: 3, xp: 0, notes: {}, tnotes: {}, lvl: {}, friends: [], daily: null, readyLog: {}, pused: [], why: {}, lastBackup: '', backupSnooze: '', resume: null, text: 'normal', seb: true, fbk: [], days: {}, cards: {}, custom: {}, conf: {}, mistakes: [], scores: [], grades: {},
    mock: '2027-01-08', plan: makePlan(), deload: false, timer: { focus: 25, brk: 5 }, focusSets: 0, focusMin: 0, fixedCount: 0,
    skill: {}, learnOk: 0, quoteOk: 0, ach: {}, hidden: {}, plans: [], exam: null, items: {}, queue: [], mp: null, read: {}, sess: null, profile: { name: '', emblem: 'bat' }, motion: 'auto', sound: 'quiet', motionHint: false, theme: 'lime', mode: 'paper', achV: 2, wrapSeen: '',
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
  s.mock = isKey(r.mock) ? r.mock : s.mock; /* the beta has no old placeholder dates to correct */
  s.friends = FRIENDS.clean(r.friends);
  s.guided = !!r.guided;
  s.daily = r.daily && isKey(r.daily.d) && [0, 1, 2, 3, 4, 5].includes(r.daily.s) ? { d: r.daily.d, s: r.daily.s } : null;
  s.me = ME.clean(r.me); /* this profile's set-up: subjects, boards, tiers, grades, dates, availability */
  for (const [k, v] of Object.entries(obj(r.lvl))) if (LEARN.TOPIC[k] && v && [1, 2, 3].includes(v.l)) s.lvl[k] = { l: v.l, r: clamp(Math.round(num(v.r)), 0, 9), w: clamp(Math.round(num(v.w)), 0, 9) };
  const OLD_HL = { amethyst: 'lilac', abyss: 'sky', frost: 'sky' }; /* the five dark schemes before 8.3 */
  s.theme = THEMES.some(t => t[0] === r.theme) ? r.theme : OLD_HL[r.theme] || 'lime'; s.achV = num(r.achV);
  s.mode = MODES.some(m => m[0] === r.mode) ? r.mode : 'paper';
  for (const k of ['focusSets', 'focusMin', 'learnOk', 'quoteOk']) s[k] = Math.max(0, num(r[k]));
  s.deload = !!r.deload;
  s.motion = ['auto', 'full', 'reduced'].includes(r.motion) ? r.motion : 'auto'; s.sound = ['off', 'quiet', 'normal'].includes(r.sound) ? r.sound : 'quiet'; s.motionHint = !!r.motionHint; s.wrapSeen = isKey(r.wrapSeen) ? r.wrapSeen : '';
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
  for (const [k, v] of Object.entries(obj(r.read))) if (STUDY_BY[k] && isKey(v)) s.read[k] = v;
  s.sess = sessNorm(r.sess);
  for (const [k, v] of Object.entries(obj(r.why))) if (WHY.some(w => w[0] === k)) s.why[k] = Math.max(0, Math.round(num(v)));
  s.pused = arr(r.pused).filter(x => typeof x === 'string').slice(-4000).map(x => x.slice(0, 120));
  s.lastBackup = isKey(r.lastBackup) ? r.lastBackup : ''; s.backupSnooze = isKey(r.backupSnooze) ? r.backupSnooze : '';
  s.text = ['normal', 'large', 'xl'].includes(r.text) ? r.text : 'normal'; s.seb = r.seb !== false;
  s.fbk = arr(r.fbk).map(obj).filter(x => x.q || x.note || x.fix).slice(-60).map(x => ({ id: num(x.id, newId()), date: isKey(x.date) ? x.date : dkey(), subj: str(x.subj, 30), q: str(x.q, 300), mark: Math.round(num(x.mark, -1)), max: Math.max(0, num(x.max)), fix: str(x.fix, 200), note: str(x.note, 4000) }));
  { const rs = obj(r.resume); if (STUDY_BY[rs.g] && isKey(rs.at)) s.resume = { g: rs.g, at: rs.at }; }
  for (const [k, v] of Object.entries(obj(r.readyLog)).filter(([k]) => isKey(k)).sort().slice(-90)) s.readyLog[k] = clamp(Math.round(num(v)), 0, 100);
  for (const [k, v] of Object.entries(obj(r.notes))) if (isKey(k) && typeof v === 'string' && v) s.notes[k] = str(v, 2000);
  for (const [k, v] of Object.entries(obj(r.tnotes))) if (/^[a-z0-9-]{1,40}$/.test(k) && typeof v === 'string' && v.trim()) s.tnotes[k] = str(v, 4000);
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
    lost: arr(x.lost).map(obj).map(l => ({ topic: str(l.topic, 60), type: str(l.type || 'Recall', 30), marks: Math.max(0, num(l.marks)) })).filter(l => l.topic && l.marks > 0),
    tp: arr(x.tp).map(obj).map(t => ({ topic: str(t.topic, 60), got: Math.max(0, num(t.got)), max: Math.max(0, num(t.max)) })).filter(t => t.topic && t.max > 0) }));
  const ex = obj(r.exam), paper = ex.paper ? normPaper(ex.paper) : EXAMS.find(p => p.id === ex.pid); /* in-progress practice paper */
  if (paper && paper.qs.length) s.exam = { pid: paper.id, i: clamp(Math.round(num(ex.i)), 0, paper.qs.length - 1), ans: paper.qs.map((_, k) => str(arr(ex.ans)[k], 12000)),
    got: paper.qs.map((q, k) => qTicks(q).map((_, j) => !!arr(arr(ex.got)[k])[j])), marked: paper.qs.map((_, k) => !!arr(ex.marked)[k]),
    lv: paper.qs.map((q, k) => q[2].lv ? clamp(Math.round(num(arr(ex.lv)[k], -1)), -1, qMax(q)) : -1), end: Math.max(0, num(ex.end)) };
  if (s.exam && ex.paper) Object.assign(s.exam, { paper, ph: ex.ph === 'mark' ? 'mark' : 'sit', why: paper.qs.map((_, k) => WHY.some(w => w[0] === arr(ex.why)[k]) ? arr(ex.why)[k] : ''), used: clamp(Math.round(num(ex.used)), 0, 300), timed: !!ex.timed, printed: !!ex.printed });
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
    if (num(src.qa) > 0) { out.qa = Math.round(num(src.qa)); out.qr = clamp(Math.round(num(src.qr)), 0, out.qa); }
    const e = Object.entries(obj(src.ev)).filter(([k, v]) => /^[a-z0-9:]{1,24}$/.test(k) && Number.isFinite(+v)); if (e.length) out.ev = Object.fromEntries(e.map(([k, v]) => [k, Math.max(0, Math.round(+v))]));
    const tt = Object.entries(obj(src.t)).filter(([k, v]) => /^[a-z]{1,16}$/.test(k) && +v > 0 && Number.isFinite(+v)); if (tt.length) out.t = Object.fromEntries(tt.map(([k, v]) => [k, Math.round(+v)]));
    s.days[k] = out;
  }
  for (const [k, v] of Object.entries(obj(r.items))) if (Array.isArray(v) && v.length === 4 && v.every(x => Number.isFinite(+x))) s.items[str(k, 16)] = v.map(x => Math.round(+x));
  s.queue = arr(r.queue).map(obj).filter(x => LEARN.TOPIC[x.id]).slice(-40).map(x => ({ id: x.id, why: str(x.why, 160), date: isKey(x.date) ? x.date : dkey() }));
  const mp = obj(r.mp); /* generated Maths paper in progress: our own question objects */
  if (Array.isArray(mp.qs) && mp.qs.length && mp.qs.every(q => q && typeof q.q === 'string' && LEARN.TOPIC[q.id]))
    s.mp = { qs: mp.qs, ans: mp.qs.map((_, k) => str(arr(mp.ans)[k], 40)), i: clamp(Math.round(num(mp.i)), 0, mp.qs.length - 1), ppp: !!mp.ppp, self: mp.self && Array.isArray(mp.self.my) ? { i: clamp(Math.round(num(mp.self.i)), 0, mp.qs.length - 1), my: mp.qs.map((_, k) => typeof mp.self.my[k] === 'boolean' ? mp.self.my[k] : null), why: mp.qs.map((_, k) => str(arr(mp.self.why)[k], 12)) } : null, track: LEARN.SUBJECTS.some(x => x.id === mp.track) ? mp.track : 'maths' };
  s.tc = obj(r.tc); /* lessons, gap finder, grade tests and exam questions by topic (teach.js, check.js) */
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
/* per-day counters (sets, fixes, papers, best run): the weekly Wrapped reads them */
function dayEv(name, n = 1, asMax = false) { const d = ensureDay(dkey()); d.ev = d.ev || {}; d.ev[name] = asMax ? Math.max(d.ev[name] || 0, n) : (d.ev[name] || 0) + n; }
function setsOn(k) { const d = S.days[k]; if (!d) return 0; let n = 0; for (const a of Object.values(d.s)) n += a.filter(Boolean).length; return n; }
function lifeSets() { let n = 0; for (const k in S.days) n += setsOn(k); return n; }
function daysTrained() { let n = 0; for (const k in S.days) if (setsOn(k)) n++; return n; }
const daySets = w => S.plan[w].reduce((n, s) => n + target(s), 0);
const weekTarget = () => [0, 1, 2, 3, 4, 5, 6].reduce((n, w) => n + daySets(w), 0);
const learnedCards = () => Object.values(S.cards).filter(c => c.box >= 3).length;
const xp = n => { S.xp = Math.max(0, S.xp + n); save(); };
function fmtHours(min) { if (min < 60) return Math.round(min) + 'm'; const hh = Math.floor(min / 60), mm = Math.round(min % 60); return hh + 'h' + (mm ? ' ' + mm + 'm' : ''); }
const TITLES = [[0, 'Wanderer'], [5, 'Initiate'], [15, 'Ashwalker'], [30, 'Night Scholar'], [60, 'Ferryman'], [100, 'Keeper of the Crossing'], [200, 'Legend of Acheron']];
const titleFor = n => TITLES.filter(t => n >= t[0]).pop()[1];
const nextTitle = n => TITLES.find(t => t[0] > n);
const EMBLEMS = [['bat', 0], ['flame', 0], ['feather', 10], ['moon', 15], ['gem', 30], ['shield', 45], ['crown', 60], ['star', 100]];

/* ---------- subjects, topics and skills (Learn) ---------- */
const SUBJ_BY = Object.fromEntries(LEARN.SUBJECTS.map(s => [s.id, s]));
const TRACK_NAME = t => t === 'fix' ? 'Fix queue' : t === 'science' ? 'Science mix' : t === 'all' ? 'All subjects' : (SUBJ_BY[t] || { name: t }).name;
function quoteCards(id) { const deck = { 'q-mac': 'mac', 'q-acc': 'acc', 'q-je': 'je' }[id]; return deck ? cardsOf(deck).filter(c => /^["“'‘]/.test(c.f.trim())) : []; }
const usable = id => !S.hidden[id] && (LEARN.TOPIC[id].type !== 'quote' || quoteCards(id).length > 0);
function topicsFor(track) {
  const ids = track === 'fix' ? S.queue.map(x => x.id) : track === 'all' ? Object.keys(LEARN.TOPIC) : track === 'science' ? ['biology', 'chemistry', 'physics'].flatMap(s => SUBJ_BY[s].topics) : SUBJ_BY[track] ? SUBJ_BY[track].topics : (LEARN.TOPIC[track] ? [track] : []);
  return ids.filter(usable);
}
const skill = id => S.skill[id] || { n: 0, ok: 0, best: 0, run: 0, rec: [] };
const stars = id => { const k = skill(id); return k.best >= 5 ? 3 : k.best >= 3 ? 2 : k.ok >= 1 ? 1 : 0; };
const masteredIn = ids => ids.filter(id => stars(id) === 3).length;
const masteredAll = () => masteredIn(Object.keys(LEARN.TOPIC));
const subjectsPractised = () => LEARN.SUBJECTS.filter(s => s.topics.reduce((n, t) => n + skill(t).ok, 0) >= 25).length;
const today = () => dayNum(dkey());
LEARN.setItemInfo(key => { const m = S.items[key]; return m ? { n: m[0], r: m[1], s: m[2], ago: today() - m[3] } : null; });
const learned = key => { const m = S.items[key]; return !!m && m[2] >= 2; }; /* right twice in a row, and right last time */
/* Smart difficulty: each topic has a level 1–3. Four right in a row at a level moves you up (with a small celebration);
   two misses at a level move you back down, quietly, so a hard patch never feels like a punishment. */
const levelOf = id => (S.lvl[id] || { l: 1 }).l;
function levelUp(id, ok) {
  if (!LEARN.LEVELLED.has(id)) return;
  const m = S.lvl[id] = S.lvl[id] || { l: 1, r: 0, w: 0 };
  if (ok) { m.r++; if (m.r >= 4 && m.l < 3) { m.l++; m.r = 0; m.w = 0; toast(`Level up: ${LEARN.name(id)} is now level ${m.l}`, 'big'); } }
  else { m.r = 0; m.w++; if (m.w >= 2 && m.l > 1) { m.l--; m.w = 0; } }
}
function record(id, ok, key) {
  levelUp(id, ok);
  const k = S.skill[id] = skill(id);
  k.n++; k.rec = [...k.rec, ok].slice(-6);
  if (key) { const m = S.items[key] || [0, 0, 0, 0]; m[0]++; if (ok) { m[1]++; m[2]++; } else m[2] = 0; m[3] = today(); S.items[key] = m; }
  const d = ensureDay(dkey()); d.qa = (d.qa || 0) + 1; d.qr = (d.qr || 0) + (ok ? 1 : 0);
  const tr = LEARN.TOPIC[id] && LEARN.TOPIC[id].subject; if (tr) { d.t = d.t || {}; d.t[tr] = (d.t[tr] || 0) + 1; } /* per-subject practice, so priorities can balance */
  if (ok) {
    k.ok++; k.run++; k.best = Math.max(k.best, k.run); S.learnOk++; if (id.startsWith('q-')) S.quoteOk++;
    const t = LEARN.TOPIC[id]; if (t) { dayEv(t.type); dayEv('s:' + t.subject); }
  } else k.run = 0;
  const qi = S.queue.findIndex(x => x.id === id);
  if (ok && qi >= 0 && k.run >= 3) { S.queue.splice(qi, 1); dayEv('fix'); toast(`Fixed: ${LEARN.name(id)} · 3 right in a row`, 'big'); }
  save();
}
/* Fix queue: topics where marks were lost come back in Focus and mixed practice until you get 3 right in a row */
function addFix(ids, why) {
  let n = 0;
  for (const id of new Set(ids)) if (LEARN.TOPIC[id] && !S.hidden[id] && !S.queue.some(x => x.id === id)) { S.queue.push({ id, why, date: dkey() }); n++; }
  if (S.queue.length > 40) S.queue = S.queue.slice(-40);
  return n;
}
const higherPull = () => { const a = LEARN.MATHS.map(id => { const k = skill(id); return k.rec.length ? k.rec.filter(Boolean).length / k.rec.length : null; }).filter(x => x != null), m = a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; return m >= .7 ? 1.5 : m >= .5 ? 1 : .6; };
function pickTopic(track, avoid) {
  const ids = topicsFor(track); if (!ids.length) return null;
  const pool = ids.length > 1 ? ids.filter(i => i !== avoid) : ids;
  const pull = higherPull(); /* Higher topics come up more as your Maths gets stronger */
  const w = pool.map(id => {
    const core = (LEARN.TOPIC[id].type === 'eq' ? .3 : 1) * (LEARN.TOPIC[id].tier === 'H' ? pull : 1); /* Science core: 600+ formula and equation drills come up less, key terms and facts more */
    const k = skill(id), boost = S.queue.some(x => x.id === id) ? 4 * core : core; if (!k.n) return 3 * boost;
    const accu = k.rec.length ? k.rec.filter(Boolean).length / k.rec.length : 0;
    return (k.best >= 5 && accu >= .8 ? .5 : 1 + (1 - accu) * 3) * boost;
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
  ['sets', 'Focus', 'Iron Discipline', 'flame', 'sets finished', [5, 25, 75, 200, 400], () => lifeSets()],
  ['hours', 'Focus', 'Hourglass', 'hourglass', 'hours focused', [3, 10, 30, 75, 150], () => S.focusMin / 60],
  ['days', 'Focus', 'Many Fires', 'calendar', 'days studied', [5, 14, 30, 60, 100], () => daysTrained()],
  ['sessions', 'Focus', 'Full Session', 'check', 'planned sessions completed', [3, 15, 50, 120], () => S.stat.sessions],
  ['night', 'Focus', 'Night Owl', 'moon', 'sets finished after 8pm', [5, 25, 60, 120], () => S.stat.night],
  ['early', 'Focus', 'First Light', 'sparkle', 'sets finished before 9am', [3, 15, 40], () => S.stat.early],
  ['weekend', 'Focus', 'Weekend Warrior', 'shield', 'weekend sets', [10, 40, 100, 200], () => S.stat.weekend],
  ['right', 'Learn', 'Sharp Mind', 'target', 'questions right', [50, 250, 750, 2000, 5000], () => S.learnOk],
  ['run', 'Learn', 'Unbroken', 'bolt', 'right in a row', [10, 20, 40, 75], () => S.stat.bestRun],
  ['mastered', 'Learn', 'Master', 'crown', 'topics mastered', [3, 10, 25, 50, 90], () => masteredAll()],
  ['polymath', 'Learn', 'Polymath', 'compass', 'subjects with 25+ right answers', [3, 6, 9], () => subjectsPractised()],
  ['quotes', 'Learn', 'Silver Tongue', 'feather', 'quotes recalled', [25, 100, 300], () => S.quoteOk],
  ['cards', 'Learn', 'Quill of Recall', 'cards', 'flashcards learned well', [15, 35, 55], () => learnedCards()],
  ['plans', 'Learn', 'Architect', 'edit', 'plans written', [3, 10, 25, 50], () => S.stat.plans],
  ['papers', 'Exams', "Ferryman's Coin", 'coin', 'past papers logged', [3, 10, 25, 40], () => S.scores.length],
  ['improve', 'Exams', 'Rising Tide', 'chart', 'personal bests on papers', [3, 10, 25], () => S.stat.improve],
  ['fixes', 'Exams', 'Mended Blade', 'wrench', 'mistakes fixed', [5, 25, 60, 120], () => S.fixedCount],
  ['ready', 'Exams', 'Cartographer', 'map', 'topics rated exam-ready', [10, 40, 90, 140], () => examReady()],
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
  if (!silent && fresh.length) SFX.play('ach');
  if (!silent) for (const [a, tier] of fresh.slice(0, 3)) FXS.reveal(`${TIERS[tier - 1]} achievement`, a.name, `${a.t[tier - 1].toLocaleString('en-GB')} ${a.unit} · yours for good`);
}
const badgeCount = () => ACH.reduce((t, a) => t + (S.ach[a.id] ? S.ach[a.id].tier : 0), 0);
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
const tTotal = (m = T.mode) => m === 'focus' && T && T.len ? T.len : (m === 'focus' ? S.timer.focus : S.timer.brk) * 60; /* T.len: a one-off length, e.g. the 10-minute rescue set */
let T;
(function loadTimer() {
  try { const t = JSON.parse(read(TK) || 'null'); if (t && (t.mode === 'focus' || t.mode === 'break') && Number.isFinite(t.left)) T = { mode: t.mode, left: t.left, run: !!t.run, end: num(t.end), sid: t.sid ? str(t.sid, 30) : null, len: clamp(Math.round(num(t.len)), 0, 7200), rescue: !!t.rescue, swap: t.swap === false ? false : t.swap && typeof t.swap.to === 'string' ? { to: str(t.swap.to, 20), msg: str(t.swap.msg, 300) } : null }; } catch (e) {}
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
  const st = $('#st'); if (st) st.textContent = fmt(L);
  document.title = T.run ? fmt(L) + ' · Archeron Beta' : 'Archeron Beta';
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
    S.focusSets++; S.focusMin += T.len ? T.len / 60 : S.timer.focus; dayEv('sets'); if (T.rescue) dayEv('rescue');
    const now = new Date(), hr = now.getHours(), wd = now.getDay();
    if (hr >= 20 || hr < 4) S.stat.night++; else if (hr < 9) S.stat.early++;
    if (wd === 0 || wd === 6) S.stat.weekend++;
    const d = ensureDay(dkey()), s = T.sid && S.plan[wd].find(x => x.id === T.sid && x.kind === 'train');
    let sub = T.rescue ? 'Rescue set done. A bad day that still counts.' : `Rest ${S.timer.brk} minutes. Stand up and look away from the screen.`;
    if (s) {
      const n = target(s), a = d.s[s.id] = d.s[s.id] || [];
      const j = Array.from({ length: n }, (_, i) => i).find(i => !a[i]);
      if (j != null) { a[j] = true; xp(10); if (countDone(a, n) === n) { xp(20); S.stat.sessions++; sub = `${s.label}: session complete. Rest ${S.timer.brk} minutes.`; } }
      else (d.s.free = d.s.free || []).push(true);
    } else (d.s.free = d.s.free || []).push(true);
    /* rest starts by itself, timed from when the set actually ended (correct even if the phone was locked) */
    const ended = T.end || Date.now();
    T.mode = 'break'; T.len = 0; T.rescue = false; T.swap = null; T.left = tTotal(); T.sid = null; T.run = true; T.end = ended + T.left * 1000; T.left = Math.max(0, (T.end - Date.now()) / 1000);
    saveT(); save();
    FXS.reveal('Set complete', `${lifeSets()} sets finished`, sub); SFX.play('fanfare');
  } else { T.mode = 'focus'; T.left = tTotal(); saveT(); toast('Rest over. Ready when you are.'); SFX.play('rest'); }
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
const DRAFT = { mp: '', ex: '', score: blankScore(), mis: { subj: 'Maths', topic: '', note: '' }, card: { f: '', b: '' }, grades: null, dr: '', plans: {} };
function setPath(o, path, v) { const p = path.split('.'); for (let i = 0; i < p.length - 1; i++) { o = o[p[i]]; if (!o) return; } o[p[p.length - 1]] = v; }

/* ---------- missions: what to actually do in each set ---------- */
const RESCUE_M = { id: 'rescue', title: 'Rescue set', steps: ['These are the facts and skills you are closest to forgetting', 'Your score does not matter today. Turning up does', 'Ten minutes, then you are done. It counts as a set'] };
const PRACTISE_STEPS = ['Answer each question from memory, no notes', 'Wrong? Read the method, then hit "Try a similar one"', 'Anything that keeps tripping you up: add it to your fix list'];
/* A planned subject you are already well above your aim in hands its set to your biggest gap, where extra marks are worth more.
   Found by the 10-student simulation: fixed Maths sessions kept piling into Maths at 90%+ while Science sat just under a 4. */
function missionFor(label) {
  const M = missionPlan(label);
  if (M.id !== 'drill') return M;
  /* decided once when a set starts and kept on the timer, so the subject never changes halfway through a set */
  const lock = timerActive() && T.mode === 'focus', sw = lock && T.swap != null ? T.swap : swapFor(M.subj);
  if (lock && T.swap == null) { T.swap = sw || false; saveT(); }
  return sw ? { id: 'drill', subj: sw.to, title: `${TRACK_NAME(sw.to)} practice`, steps: PRACTISE_STEPS, swap: sw.msg } : M;
}
/* the name of what a set is actually about once any swap is applied; every screen uses this, so they agree */
const setTitle = label => { const M = missionFor(label); return M.swap ? TRACK_NAME(M.subj) : label; };
function swapFor(tr) {
  const subj = trackSubj(tr === 'science' ? 'biology' : tr);
  /* A subject nobody has touched for a week takes the set, but only from whichever subject has had the most practice this week,
     so the time comes from the subject with the most to spare. Found by the 50-student simulation (Oct 2026): subjects planned
     on one day only (Geography, Business) got 0% of practice, because students do fewer sets than planned and the top-priority
     set is always picked first. Swapping from any set raised learning ~15% but cut Biology and Chemistry by a third; taking only
     from the busiest subject keeps every science within ~1.5 points and still raises learning ~10%. */
  const ids = tr === 'science' ? ['biology', 'chemistry', 'physics'] : [tr], mine = typeof recentShare === 'function' ? Math.max(...ids.map(recentShare)) : 0;
  const busiest = mySubjects().every(s => recentShare(s.id) <= mine);
  const idle = busiest && typeof daysIdle === 'function' && sessRank().find(t => trackSubj(t) !== subj && (daysIdle(t) || 0) >= 7);
  if (idle) { const d = daysIdle(idle);
    return { to: idle, msg: `${TRACK_NAME(idle)} ${d >= 60 ? 'has not had any practice yet, so this set gets it started' : `has had no practice for ${d} days, so this set goes there before it fades`}. ${TRACK_NAME(tr)} comes back next time.` }; }
  const p = typeof predict === 'function' ? predict(subj) : null;
  if (!p || p.n < 2) return null;
  const need = boundFor(subj, aimOf(subj)); if (p.pc < need + 12) return null;
  const to = sessRank().find(t => trackSubj(t) !== subj); if (!to) return null;
  return { to, msg: `${subj} is safe for now: ${p.pc}% on recent papers, and your aim needs about ${need}%. This set goes to ${TRACK_NAME(to)}, where the marks are.` };
}
function missionPlan(label) {
  const L = (label || '').toLowerCase();
  const subj = /math/.test(L) ? 'maths' : /biolog/.test(L) ? 'biology' : /chemi/.test(L) ? 'chemistry' : /physic/.test(L) ? 'physics' : /scien/.test(L) ? 'science'
    : /geograph/.test(L) ? 'geography' : /business/.test(L) ? 'business' : /histor/.test(L) ? 'history' : /computer/.test(L) ? 'compsci' : /french/.test(L) ? 'french' : /spanish/.test(L) ? 'spanish' : null;
  if (/mistake/.test(L)) return { id: 'fixes', title: 'Redo your mistakes', steps: ['Redo each mistake below from scratch, no notes', 'Got it right? Tap Fixed. Still shaky? Tap Again', 'Nothing waiting? Do the mixed drill instead'] };
  if (/paper|full timed/.test(L)) return { id: 'paper', subj, title: 'Past paper practice', steps: ['Use a paper from your teacher or your exam board website', 'Work timed, in silence, phone face down', 'Mark it with the mark scheme straight after', 'Log the score and where the marks went'].concat(/plan the week/.test(L) ? ['Last few minutes: check next week in your plan'] : []) };
  if (/lit|quote|essay|macbeth|carol|journey/.test(L)) return { id: 'lit', title: 'Quotes and an essay plan', steps: ['Warm up: quote and context questions until you get 5 right', 'Then plan one essay below: thesis and three paragraphs', 'Each paragraph: point, quote, method, effect, context'] };
  if (/english lang|language|timed answer|writing/.test(L)) return { id: 'lang', title: 'English Language practice', steps: ['Pick a question type and read the method', 'Write your answer on paper, timed', 'Check it against the method, then plan a piece of writing'] };
  if (/\bre\b|religio/.test(L)) return { id: 're', title: 'RE: key terms and a 12-mark plan', steps: ['Answer key-term questions until you get 5 right', 'Plan a 12-mark answer below: both sides, then a justified conclusion'] };
  /* 5-a-day: five warm-up questions from all over Maths in the app, then one topic for the rest of the set */
  if (subj === 'maths' && /5-a-day/.test(L)) return { id: 'drill', subj, five: true, title: 'Maths: 5-a-day, then one topic', steps: ['Warm up: 5 quick questions from all over Maths', 'Then one topic, picked for you, until the timer ends', PRACTISE_STEPS[1]] };
  if (subj) return { id: 'drill', subj, title: `${TRACK_NAME(subj)} practice`, steps: PRACTISE_STEPS };
  const own = ME.selfSubject(label); if (own) return own; /* a subject with no question bank yet: revise it your own way */
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
  if (!open.length) return 'free';
  /* the set whose subject needs it most right now, so doing fewer sets than planned never skips the same subjects every week */
  const pr = x => setPriority(x.s.label);
  return open.reduce((a, b) => pr(b) > pr(a) ? b : a).s.id;
}
/* today's sets in the order Begin hands them out: the one in progress (or picked) first, the rest by need, done ones last.
   Lists showed plan order while Begin picked by need, so the top of the list was not what you got. */
function todayQueue() {
  const list = todayTrain(), now = timerActive() && T.mode === 'focus' ? T.sid : currentSid(), pr = x => setPriority(x.s.label);
  const rank = x => x.s.id === now && x.left > 0 ? Infinity : x.left > 0 ? pr(x) : -Infinity;
  return list.map(x => [x, rank(x)]).sort((a, b) => b[1] - a[1] || 0).map(a => a[0]);
}
function ringEl(compact) {
  const r = h('div', { class: 'ring' + (T.mode === 'break' ? ' brk' : '') + (T.run ? ' live' : '') + (compact ? ' compact' : '') });
  r.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--y2)"/><stop offset=".55" style="stop-color:var(--y)"/><stop offset="1" style="stop-color:var(--ember)"/></linearGradient></defs><circle class="halo" cx="60" cy="60" r="54"/><circle class="trk" cx="60" cy="60" r="54"/><circle id="tr" class="prg" cx="60" cy="60" r="54"/></svg>';
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
  const RES = active && T.mode === 'focus' && T.rescue, M = RES ? RESCUE_M : missionFor(label);

  if (T.mode === 'break' && active) return h('div', { class: 'stack home' },
    h('section', { class: 'focus brk' + (T.run ? ' live' : '') },
      h('p', { class: 'eyebrow' }, 'Recovery'), h('h1', { class: 'focus-title' }, 'Rest'),
      h('p', { class: 'focus-meta' }, 'Stand up, drink water, look at something far away.'), ringEl(),
      h('div', { class: 'row center' }, B(T.run ? [icon('pause'), 'Pause'] : [icon('play'), 'Resume'], 'tgl', 'begin sm'), B([icon('skip'), 'Skip rest'], 'skip', 'ghost')),
    ),
    sebastian('break'));

  if (restState) return h('div', { class: 'stack home' },
    resumeCard(), noticeLine(),
    sebastian(),
    h('section', { class: 'focus calm' },
      h('p', { class: 'eyebrow' }, part),
      h('h1', { class: 'focus-title' }, list.length ? 'The rest is earned' : 'A day of rest'),
      h('p', { class: 'focus-meta' }, list.length ? "Today's sets are done. Recovery is part of the programme." : 'Nothing planned today. Recharge, or do a set if you feel like it.'),
      h('div', { class: 'moon' }, icon('moon')),
      h('div', { class: 'row center' }, B([icon('play'), 'Bonus set'], 'pick', 'ghost', { 'data-sid': 'free' }), B([icon('flame'), 'Mocks'], 'go', 'ghost', { 'data-tab': 'mocks' }))),
    todayBar());

  const title = RES ? 'Rescue set' : item ? setTitle(item.s.label) : list.length && !open.length ? 'Bonus set' : 'Free study';
  const meta = RES ? '10 minutes · what you are closest to forgetting' : item ? `Set ${Math.min(item.c + 1, item.n)} of ${item.n} in this block · ${S.timer.focus} minutes` : `${S.timer.focus} minutes · anything you choose`;
  const HT = M.subj && M.subj !== 'science' ? M.subj : { lit: 'englit', lang: 'englang', re: 're' }[M.id] || null; /* the subject the next set is about */

  if (active && typeof deskMode === 'function' && deskMode() && T.mode === 'focus') return deskWorking(M, title, meta);
  if (active) return h('div', { class: 'stack home working' },
    h('section', { class: 'focus-bar' + (T.run ? ' live' : '') },
      ringEl(true),
      h('div', { class: 'fb-txt' }, h('p', { class: 'eyebrow' }, T.run ? 'In the zone' : 'Paused'), h('b', null, title), h('small', null, meta)),
      h('div', { class: 'fb-ctl' }, B(T.run ? icon('pause') : icon('play'), 'tgl', 'primary icon-only', { 'aria-label': T.run ? 'Pause' : 'Resume' }), B('End', 'rst', 'ghost sm'))),
    missionCard(M, true));

  const rough = hr >= 18 && list.length > 0 && !todayN && !((S.days[dkey()] || {}).ev || {}).sets; /* evening, sets planned, none done */
  const wb = welcomeBack();
  /* One main card, one short list, one notice. Everything else is a tap away: the page had grown to ten blocks and felt
     like too much (Oct 2026). Sebastian keeps you company on the rest and break screens instead. */
  return h('div', { class: 'stack home' },
    resumeCard(),
    wb || h('section', { class: 'focus hero' },
      h('p', { class: 'eyebrow' }, `${part} · next up`),
      h('h1', { class: 'focus-title' }, title),
      h('p', { class: 'focus-meta' }, meta),
      ringEl(),
      B([icon('play'), 'Begin'], 'tgl', 'begin'),
      h('div', { class: 'focus-links' },
        B(CHOOSE ? 'Close' : 'Choose something else', 'choose', 'link'), h('span', { 'aria-hidden': 'true' }, '·'), B("Today's plan", 'go', 'link', { 'data-tab': 'today' })),
      CHOOSE && h('div', { class: 'chooser t-panel-slide', 'data-open': 'false' },
        todayQueue().filter(x => x.left > 0).map(x => chip([x.s.label, h('span', { class: 'n' }, x.left + ' left')], x.s.id === cur, 'pick', { 'data-sid': x.s.id })),
        chip('Free study', cur === 'free', 'pick', { 'data-sid': 'free' }),
        h('div', { class: 'ch-more' }, B([icon('target'), 'A 25-minute session on my biggest gap'], 'doNow', 'ghost sm'), B([icon('calendar'), 'Plan a longer revision session'], 'go', 'ghost sm', { 'data-tab': 'session' }))),
      todayBar()),
    !wb && setPreview(Object.assign({ why: missionWhy(HT) }, M)),
    guideCard(),
    alsoToday(rough && !wb),
    noticeLine());
}
/* what the next set holds, folded away until wanted: Begin already shows it all */
function setPreview(M) {
  return acc('set-pv', h('span', { class: 'sp-h' }, h('small', null, 'In this set'), h('b', null, M.title)),
    h('div', { class: 'sp-b' }, M.swap && h('p', { class: 'm-swap' }, M.swap), h('ol', { class: 'm-steps' }, M.steps.map(s => h('li', null, s))), M.why || null), { cls: 'card set-pv' });
}
/* After 4 or more days without a set, Focus offers two 10-minute rescue sets of what you are closest to forgetting, and
   nothing about the days missed. Students who study in patches gained least in every simulation; a small, kind first
   step is the easiest way back. */
function welcomeBack() {
  if (timerActive() || lifeSets() < 3) return null;
  const today = dkey(), done = setsOn(today), w = S.tc && S.tc.wb;
  if (done >= 2 || (w && w.d === today && w.skip)) return null;
  let gap = null; for (let i = 1; i <= 60; i++) if (setsOn(addDays(-i))) { gap = i; break; }
  if (gap == null || gap < 4) return null;
  return h('section', { class: 'focus hero welcome' },
    h('p', { class: 'eyebrow' }, 'Welcome back'),
    h('h1', { class: 'focus-title' }, done ? 'One more and you are back in' : 'Ease back in'),
    h('p', { class: 'focus-meta' }, `Two short sets of what you are closest to forgetting. This is set ${done + 1} of 2.`),
    h('div', { class: 'wb-ic' }, icon('sparkle')),
    B([icon('play'), 'Begin · 10 minutes'], 'rescue', 'begin'),
    h('div', { class: 'focus-links' }, B('Go to my usual plan', 'wbSkip', 'link')));
}
/* The short list under the main card: only what is relevant today, four at most */
let AT_MORE = false;
function alsoToday(rough) {
  const dueC = allDue(), dueM = S.mistakes.filter(m => !m.fixed && m.redo <= dkey()).length, ses = activeSession(), wrap = wrapNudge(), row = atRow;
  const rows = [
    ses && row('play', 'Carry on your revision session', `${sessDone(ses)} of ${sessSteps(ses)} steps done`, 'go', { 'data-tab': 'session' }),
    rough && row('shield', 'Rough day? A 10-minute rescue set', 'It still counts, and it stops you forgetting', 'rescue'),
    !dailyDoneToday() && row('star', 'Daily five', 'Five Maths questions, about 3 minutes', 'daily'),
    dueM > 0 && row('wrench', `${dueM} mistake${dueM === 1 ? '' : 's'} to redo`, 'Win back marks you lost once', 'go', { 'data-tab': 'fix' }),
    dueC > 0 && row('cards', `${dueC} flashcard${dueC === 1 ? '' : 's'} ready`, 'Even ten helps', 'go', { 'data-tab': 'cards' }),
    wrap && row('star', 'Your week, wrapped', 'Last week as a story', 'wrapOpen'),
    row('listen', 'Listen and learn', 'Hands-free, for the bus or a walk', 'go', { 'data-tab': 'listen' })].filter(Boolean);
  const shown = AT_MORE ? rows : rows.slice(0, 4);
  return h('section', { class: 'card also' }, h('p', { class: 'eyebrow' }, 'Also today'), h('div', { class: 'at-list' }, shown),
    rows.length > 4 && B(AT_MORE ? 'Show fewer' : `${rows.length - 4} more`, 'atMore', 'link sm at-more'));
}
/* One notice at a time, most important first */
function noticeLine() {
  const since = daysSince(S.lastBackup), worth = lifeSets() + S.scores.length + Object.keys(S.items).length >= 5;
  if (worth && !(since != null && since < 7) && !((daysSince(S.backupSnooze) ?? 99) < 3))
    return h('div', { class: 'notice' }, icon('shield'), h('span', { class: 'grow' }, since == null ? 'Back up your progress: it only lives on this device' : `Last backup ${since} days ago`),
      B('Back up', 'exp', 'primary sm'), B('Later', 'backupLater', 'link sm'));
  if (MQ_REDUCED.matches && S.motion === 'auto' && !S.motionHint)
    return h('div', { class: 'notice' }, icon('sparkle'), h('span', { class: 'grow' }, 'Animations are off on this device'),
      B('Turn on', 'motion', 'primary sm', { 'data-v': 'full' }), B('Keep still', 'motion', 'link sm', { 'data-v': 'reduced' }));
  return null;
}
function missionCard(M, live) {
  const head = h('div', { class: 'm-head' }, h('span', { class: 'lc-ic' }, icon(M.id === 'fixes' ? 'wrench' : M.id === 'paper' ? 'scroll' : M.id === 'lit' ? 'feather' : M.id === 'lang' ? 'book' : M.id === 're' ? 'sparkle' : 'target')),
    h('div', null, h('p', { class: 'eyebrow' }, live ? 'Your mission' : 'In this set you will'), h('h2', null, M.title)));
  const steps = [M.swap && h('p', { class: 'm-swap' }, M.swap), h('ol', { class: 'm-steps' }, M.steps.map(s => h('li', null, s)))];
  if (!live) return h('section', { class: 'card mission' }, head, steps, M.why || null, h('p', { class: 'muted xs' }, 'Press Begin and everything you need appears here.'));
  return h('section', { class: 'card mission live' }, head, steps, missionPanel(M));
}
/* every live set says how it ends: with the timer, never after a number of questions (a 5-a-day set counts its warm-up first) */
function setNote(M) {
  const live = DR && DR.ctx === 'focus', n = live ? DR.n || 0 : 0, five = M.five && live && DR.five;
  if (five && n < 5) return h('div', { class: 'set-note' }, h('b', null, `Warm-up: ${n} of 5`), h('span', { class: 'dots5', 'aria-hidden': 'true' }, [0, 1, 2, 3, 4].map(i => h('i', { class: i < n ? 'on' : '' }))),
    h('small', null, 'After 5, it moves on to one topic until the timer ends.'));
  return h('div', { class: 'set-note' }, five && h('b', null, `Warm-up done ✓ Now: ${DR.topic ? LEARN.name(DR.topic) : 'one topic'}`),
    h('small', null, `This set ends when the timer runs out, not after a number of questions${n ? `. ${n} answered so far` : ''}. Keep going until then.`));
}
function missionPanel(M) {
  const panel = missionBody(M); if (panel) panel.prepend(setNote(M)); return panel;
}
function missionBody(M) {
  if (M.id === 'rescue') return h('div', { class: 'm-panel' }, drillZone('all'));
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
  if (M.id === 'drill') return h('div', { class: 'm-panel' }, drillZone(M.subj, M.five));
  if (M.id === 'self') return h('div', { class: 'm-panel' }, h('p', { class: 'muted' }, `Use the timer, your notes and past papers from your board. Log any paper you sit so your progress shows up.`), h('div', { class: 'row' }, B([icon('scroll'), 'Log a paper'], 'go', 'primary', { 'data-tab': 'papers' }), B([icon('cards'), 'Flashcards'], 'go', 'ghost', { 'data-tab': 'cards' })));
  return h('div', { class: 'm-panel' },
    h('div', { class: 'chips' }, mySubjects().map(s => chip([icon(s.icon), s.name], FREE_TRACK === s.id, 'freeTrack', { 'data-track': s.id }))),
    FREE_TRACK ? drillZone(FREE_TRACK) : h('p', { class: 'muted xs' }, 'Pick a subject to get questions.'));
}

/* ---------- Learn ---------- */
function learnSummary() {
  const BK = LEARN.bank(); let l = 0, t = 0;
  for (const b of Object.values(BK)) for (const k of [...b.def, ...b.recall, ...b.eq, ...(b.vocab || [])]) { t++; if (learned(k)) l++; }
  const calc = Object.keys(LEARN.TOPIC).filter(id => LEARN.TOPIC[id].type === 'calc'); l += masteredIn(calc); t += calc.length;
  return tilt(h('button', { type: 'button', class: 'lcard wide', 'data-act': 'go', 'data-tab': 'stats' }, h('span', { class: 'lc-ic' }, icon('chart')), h('b', null, 'Your progress'),
    h('span', { class: 'lc-d' }, `${l.toLocaleString('en-GB')} of ${t.toLocaleString('en-GB')} facts, definitions, equations and skills learned.`), bar(t ? l / t * 100 : 0), h('small', null, 'See every subject')));
}
/* a row in a short list of next steps (Focus "Also today", Learn "Next for you") */
const atRow = (ic, t, sub, act, extra = {}) => h('button', Object.assign({ type: 'button', class: 'at-row', 'data-act': act }, extra),
  h('span', { class: 'at-ic' }, icon(ic)), h('span', { class: 'grow' }, h('b', null, t), sub && h('small', null, sub)), h('span', { class: 'at-go', 'aria-hidden': 'true' }, '›'));
let GAP_PICK = false;
/* Learn: progress, one suggestion, your subjects, then the tools in a single row */
function vLearn() {
  const hard = Object.keys(LEARN.TOPIC).filter(id => { const k = skill(id); return usable(id) && k.n >= 2 && k.rec.filter(Boolean).length / k.rec.length < .6; });
  /* the same lesson your next Focus set will teach, so Focus and Learn never point different ways */
  const it = todayTrain().find(x => x.s.id === currentSid()), FM = it && missionFor(it.s.label), fl = FM && FM.lesson && FM.lesson.st === 'todo' ? FM.lesson : null;
  const fx = fixCount(), sid = !fl && typeof lessonDue === 'function' ? sessRank().find(x => lessonDue(x)) : null, nx = fl || (sid && lessonDue(sid));
  const next = [nx && atRow('book', `Lesson: ${nx.title}`, `${TRACK_NAME(nx.subj)} · about ${nx.mins} minutes${fl ? ', also in your next Focus set' : ', taught step by step'}`, 'lsStart', { 'data-lid': nx.lid, 'data-topic': nx.topic }),
    fx > 0 && atRow('wrench', `${fx} thing${fx > 1 ? 's' : ''} to fix`, 'Topics you keep missing and mistakes to redo', 'go', { 'data-tab': 'fix' }),
    !nx && !fx && hard[0] && atRow('reset', `Another go: ${LEARN.name(hard[0])}`, 'Below 60% lately', 'drill', { 'data-topic': hard[0] })].filter(Boolean);
  const gaps = GAP_PICK && typeof gapLeft === 'function' ? mySubjects().filter(s => testable(s.id).length >= 3) : [];
  return h('div', { class: 'stack' },
    hero('Learn', 'Practice that sticks', 'Every subject has lessons, practice and exam questions. Wrong answers come back until they stick.'),
    learnSummary(),
    next.length > 0 && h('section', { class: 'card also' }, h('p', { class: 'eyebrow' }, 'Next for you'), h('div', { class: 'at-list' }, next)),
    h('div', { class: 'sgrid' }, mySubjects().map(s => { const ids = topicsFor(s.id);
      return tilt(h('button', { type: 'button', class: 'scard', 'data-act': 'subject', 'data-track': s.id },
        h('span', { class: 'lc-ic' }, icon(s.icon)), h('b', null, s.name), h('small', null, `${masteredIn(ids)} of ${ids.length} mastered`), bar(ids.length ? masteredIn(ids) / ids.length * 100 : 0))); })),
    h('div', { class: 'row tools-row' }, B([icon('compass'), 'Mixed practice'], 'drill', 'ghost', { 'data-track': 'all' }), typeof gapLeft === 'function' && B([icon('target'), 'Find your gaps'], 'gapPick', 'ghost' + (GAP_PICK ? ' on' : ''), { 'aria-expanded': String(GAP_PICK) }),
      B([icon('cards'), allDue() ? `Flashcards · ${allDue()}` : 'Flashcards'], 'go', 'ghost', { 'data-tab': 'cards' }), B([icon('edit'), 'Plans and writing'], 'go', 'ghost', { 'data-tab': 'write' }),
      B([icon('listen'), 'Listen'], 'go', 'ghost', { 'data-tab': 'listen' }), B([icon('book'), 'All guides'], 'go', 'ghost', { 'data-tab': 'study' })),
    gaps.length > 0 && card('Find your gaps', h('span', { class: 'muted' }, 'about 8 minutes'),
      h('p', { class: 'muted xs' }, 'One quick question per topic. What you know gets ticked off; what you don\'t gets taught first in your Focus sets.'),
      h('div', { class: 'chips' }, gaps.map(s => chip([icon(s.icon), s.name, gapLeft(s.id) ? null : h('span', { class: 'n' }, '✓')], false, 'gapStart', { 'data-track': s.id })))),
    h('p', { class: 'muted xs center' }, '★ answered right · ★★ 3 in a row · ★★★ 5 in a row (mastered). Stars are never taken away.'));
}
const starsEl = id => h('span', { class: 'stars', 'aria-label': `${stars(id)} of 3 stars` }, [1, 2, 3].map(i => h('i', { class: i <= stars(id) ? 'on' : '' })));
const ext = (href, label, sub) => h('li', null, h('a', { href, target: '_blank', rel: 'noopener' }, label), sub && h('small', { class: 'muted' }, ' · ' + sub));
/* Explainer above a topic's questions: big idea, method, worked example, tip, and a video. */
function guidePanel(id) {
  const g = GUIDES[id], subj = LEARN.trackOf(id), vid = h('a', { class: 'btn ghost', href: videoFor(subj, LEARN.name(id)), target: '_blank', rel: 'noopener' }, icon('play'), 'Watch it explained');
  if (!g) return card(null, null, h('div', { class: 'row' }, vid));
  return acc('guide-' + id, h('h2', null, 'How it works'), h('div', { class: 'guide' },
    h('p', null, g[0]), h('ol', { class: 'steps' }, g[1].map(x => h('li', null, x))),
    h('p', { class: 'g-ex' }, h('b', null, 'Example: '), g[2]), h('p', { class: 'muted' }, h('b', null, 'Exam tip: '), g[3]), h('div', { class: 'row' }, vid)), { open: !stars(id) });
}
/* A subject in three tabs, so one page is never everything at once: Learn (lessons and guides), Practise (questions),
   Exam (exam-style questions, papers, grade tests). The tab is remembered for each subject. */
const SUBJ_TAB = {};
function vSubject() {
  const s = SUBJ_BY[SUBJ_SEL] || mySubjects()[0], ids = topicsFor(s.id), tab = SUBJ_TAB[s.id] || 'learn';
  const group = (type, title) => { const g = ids.filter(id => LEARN.TOPIC[id].type === type); return g.length ? card(title, h('span', { class: 'muted' }, g.length + (g.length === 1 ? ' topic' : ' topics')),
    h('ul', { class: 'topics' }, g.map(id => h('li', null, h('button', { type: 'button', 'data-act': 'drill', 'data-topic': id }, h('span', null, LEARN.name(id), LEARN.TOPIC[id].size ? h('small', null, ` · ${LEARN.TOPIC[id].size} ${LEARN.TOPIC[id].type === 'def' ? 'terms' : LEARN.TOPIC[id].type === 'vocab' ? 'words' : 'facts'}`) : null), starsEl(id)))))) : null; };
  const extras = s.id === 'englit' ? [B([icon('edit'), 'Plan an essay'], 'go', 'ghost', { 'data-tab': 'write' }), B([icon('cards'), 'Quote flashcards'], 'go', 'ghost', { 'data-tab': 'cards' })]
    : s.id === 're' ? [B([icon('edit'), 'Plan a 12-mark answer'], 'go', 'ghost', { 'data-tab': 'write' })]
    : s.id === 'englang' ? [B([icon('book'), 'Question guides and writing'], 'go', 'ghost', { 'data-tab': 'write' })]
    : s.id === 'physics' || s.id === 'maths' ? [B([icon('cards'), 'Formula flashcards'], 'go', 'ghost', { 'data-tab': 'cards' })] : [];
  const tests = typeof testable === 'function' && testable(s.id).length >= 3;
  let body;
  if (tab === 'practise') body = [
    h('div', { class: 'row' }, B([icon('play'), 'Mixed practice'], 'drill', 'primary', { 'data-track': s.id }), extras,
      typeof SEQS !== 'undefined' && SEQS.some(x => ids.includes(x.topic)) && B([icon('grid'), 'Put it in order'], 'ordDrill', 'ghost', { 'data-track': s.id }),
      B([icon('listen'), 'Listen'], 'listenGo', 'ghost', { 'data-track': s.id }), tests && B([icon('target'), 'Gap finder'], 'gapStart', 'ghost', { 'data-track': s.id })),
    group('def', 'Definitions'), group('vocab', 'Descriptive vocabulary: spell it, know it, use it'), group('recall', 'Key facts'), group('eq', 'Equations and formulae'), group('calc', s.id === 'maths' ? 'Topics' : s.id === 'physics' ? 'Equations' : 'Calculations'), group('quote', 'Quotes'),
    !ids.length && card(null, null, h('p', { class: 'muted' }, 'All topics in this subject are hidden. Turn them back on in Settings.'))];
  else if (tab === 'exam') body = [
    h('div', { class: 'row' }, EXAMS.some(p => p.name.toLowerCase().startsWith(s.name.toLowerCase())) && B([icon('scroll'), 'Practice papers'], 'go', 'ghost', { 'data-tab': 'exam' }),
      B([icon('sparkle'), 'Generated paper'], S.mp && (S.mp.track || 'maths') === s.id ? 'mpResume' : 'mpNew', 'ghost', { 'data-track': s.id }), tests && B([icon('trophy'), 'Grade test'], 'gtOpen', 'ghost', { 'data-track': s.id })),
    typeof xqList === 'function' && xqList(s)];
  else body = [typeof nextLessonBtn === 'function' && nextLessonBtn(s), typeof lessonList === 'function' && lessonList(s),
    card('Watch and read', h('span', { class: 'muted' }, 'free, opens in a new tab'), h('ul', { class: 'links' }, sitesFor(s.id).map(([n, u, d]) => ext(u, n, d))))];
  return h('div', { class: 'stack narrow' },
    subHero('Learn', s.name, 'learn', `${masteredIn(ids)} of ${ids.length} topics mastered. Hide topics you don't study in Settings.`),
    h('div', { class: 'st-seg subj-tabs', role: 'tablist', 'aria-label': `${s.name} sections` }, [['learn', 'Learn'], ['practise', 'Practise'], ['exam', 'Exam']].map(([k, l]) =>
      h('button', { type: 'button', role: 'tab', class: k === tab ? 'on' : '', 'aria-selected': String(k === tab), 'data-act': 'subjTab', 'data-k': k }, l))),
    body);
}
function startDrill(track, topic, ctx = 'learn') {
  DR = { track, topic: topic || null, ctx, q: null, state: 'ask', count: 0, ok: 0, run: 0, last: null, picked: null };
  nextQ();
}
/* A topic that has not clicked yet: under 40% right over its last 3–6 attempts. The 50-student simulation (Oct 2026) found
   scheduling changes could not help these students; only learning that sticks better on first contact did. So these topics get
   a worked example before the question, and missed facts come back once a few questions later. Both switch off by themselves. */
const lowTopic = id => { const k = skill(id); return k.rec.length >= 3 && k.rec.filter(Boolean).length / k.rec.length < .4; };
function queueBack() {
  const q = DR.q; if (!q || !q.key || q.back || !lowTopic(q.id)) return;
  (DR.retry = DR.retry || []).push({ q: Object.assign({}, q, { back: true }), at: DR.count + 3 });
}
/* Daily five: five Maths questions that are the same for everyone today. The date seeds the random numbers while they are
   made, so every device builds identical questions. Maths because every GCSE student takes it. Only the first go counts. */
function dailyQs(day = dkey()) {
  let seed = (dayNum(day) * 2654435761) >>> 0;
  const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pool = LEARN.MATHS.filter(id => !LEARN.TOPIC[id].tier).sort(), keep = Math.random;
  Math.random = rnd;
  try { const ids = []; while (ids.length < 5) { const id = pool[Math.floor(rnd() * pool.length)]; if (!ids.includes(id)) ids.push(id); } return ids.map(id => LEARN.gen(id, 2)).filter(Boolean); }
  finally { Math.random = keep; }
}
const dailyDoneToday = () => !!(S.daily && S.daily.d === dkey());
function dailyDone() { if (!dailyDoneToday()) { S.daily = { d: dkey(), s: Math.min(5, DR.ok) }; save(); SFX.play('fanfare'); } }
/* the first thing a new (or returning) person sees on Focus: what Begin does and what each tab is for, until they close it */
function guideCard() {
  if (S.guided) return null;
  return card('How Archeron works', B('Got it', 'guided', 'ghost sm'),
    h('ol', { class: 'gc-l' },
      h('li', null, h('b', null, 'Press Begin. '), `A ${S.timer.focus}-minute timer starts and everything for your next set appears under it.`),
      h('li', null, h('b', null, 'Follow the steps. '), 'Each set says exactly what to do. When the timer ends, take the short rest.'),
      h('li', null, h('b', null, 'No need to choose. '), "Begin always picks the set you need most. Today's plan shows the rest in order.")),
    h('p', { class: 'muted xs' }, 'Learn: lessons, practice and exam questions for every subject. Mocks: timed papers and grade tests. Stats: your progress. Toolkit: your set-up, plan and settings.'));
}
function dailyCard(inDrill) {
  if (inDrill || dailyDoneToday()) return card('Daily five', h('span', { class: 'muted' }, 'the same five for everyone today'),
    h('p', { class: 'big-score' }, `${dailyDoneToday() ? S.daily.s : DR.ok} / 5`),
    h('p', { class: 'muted xs' }, 'New questions tomorrow. Share your friend link and your friends see today\'s five on their board.'),
    h('div', { class: 'row' }, B([icon('user'), 'Friends'], 'go', 'ghost', { 'data-tab': 'friends' })));
  return h('button', { type: 'button', class: 'card rescue-cta', 'data-act': 'daily' }, h('span', { class: 'wc-ic' }, icon('star')),
    h('span', { class: 'grow' }, h('b', null, 'Daily five'), h('small', null, 'Five Maths questions, the same for everyone today. About 3 minutes.')), h('span', { class: 'btn primary sm' }, 'Start'));
}
function nextQ(sameTopic) {
  if (DR.ctx === 'daily') { DR.msg = ''; DR.picked = null; DRAFT.dr = ''; DR.ex = null; DR.q = (DR.dq || [])[DR.count] || null; DR.state = 'ask'; if (!DR.q && DR.dq) dailyDone(); return; }
  DR.msg = ''; DR.picked = null; DRAFT.dr = ''; DR.ex = null;
  if (DR.five && !DR.topic && (DR.n || 0) >= 5) DR.topic = pickTopic(DR.track, DR.last); /* warm-up done: one topic for the rest of the set */
  const due = !sameTopic && DR.retry && DR.retry.find(r => r.at <= DR.count);
  if (due) { DR.retry = DR.retry.filter(r => r !== due); DR.q = due.q; DR.last = due.q.id; DR.state = 'ask'; return; }
  const id = sameTopic || DR.topic || pickTopic(DR.track, DR.last);
  DR.q = id && LEARN.gen(id, levelOf(id)); DR.state = 'ask'; DR.last = id;
  /* the first question in a not-yet-clicked topic each session starts with a different example, worked on the board */
  DR.exSeen = DR.exSeen || [];
  if (DR.q && lowTopic(id) && !DR.exSeen.includes(id) && typeof DEMO !== 'undefined') {
    const ex = LEARN.gen(id), d = ex && DEMO.build(ex);
    if (d && d.ok) { DR.exSeen.push(id); DR.ex = d; DR.state = 'example'; }
  }
}
function drillZone(track, five) {
  if (five && DR && DR.ctx === 'focus' && DR.setNo !== lifeSets()) DR = null; /* each 5-a-day set starts its own warm-up */
  if (!DR || DR.ctx !== 'focus' || DR.track !== track) { startDrill(track, null, 'focus'); DR.setNo = lifeSets(); DR.five = !!five; }
  return drillPanel();
}
function vDrill() {
  if (!DR) return vLearn();
  const title = DR.ctx === 'daily' ? 'Daily five' : DR.topic ? LEARN.name(DR.topic) : TRACK_NAME(DR.track);
  const back = DR.ctx === 'sess' ? 'session' : DR.ctx === 'guide' ? 'guide' : DR.topic || SUBJ_BY[DR.track] ? 'subject' : 'learn';
  if (DR.topic) SUBJ_SEL = LEARN.trackOf(DR.topic); else if (SUBJ_BY[DR.track]) SUBJ_SEL = DR.track;
  return h('div', { class: 'stack narrow' },
    subHero(DR.topic ? TRACK_NAME(LEARN.trackOf(DR.topic)) : 'Practice', title, back, null, back === 'session' ? 'Back to your session' : back === 'guide' ? 'Back to the guide' : back === 'subject' ? TRACK_NAME(SUBJ_SEL) : 'Learn'),
    DR.topic && guidePanel(DR.topic),
    drillPanel(),
    drillFact(),
    h('p', { class: 'muted xs center' }, 'Keys: 1–4 pick an answer, Enter checks or moves on. Getting it wrong here is how it sticks for the exam.'));
}
function drillPanel() {
  const q = DR && DR.q;
  if (!q && DR && DR.ctx === 'daily') return dailyCard(true);
  if (!q) return card(null, null, h('p', { class: 'muted' }, DR && DR.track === 'englit' ? 'Add quotes in Flashcards and they appear here.' : 'Nothing to practise here yet. Check Settings in case these topics are hidden.'));
  const st = DR.state, mcq = q.kind === 'mcq', def = q.kind === 'def';
  if (st === 'example' && DR.ex) return h('section', { class: 'card qcard example' },
    h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, q.sub || LEARN.name(q.id)), h('span', null, 'Worked example first')),
    h('p', { class: 'fb-h' }, 'This topic has not clicked yet, so watch one done first.'),
    h('p', { class: 'muted' }, 'Then it is your turn with different numbers. You only see this once per topic each session.'),
    h('p', { class: 'qtext ex-q' }, h('span', { class: 'muted' }, 'Example: '), DR.ex.question),
    h('div', { class: 'row' }, B([icon('play'), 'Watch it'], 'exWatch', 'primary grow', { id: 'nextq' }), B('Skip', 'exSkip', 'ghost')));
  const answerBox = def
    ? st !== 'ask' ? null : h('textarea', { id: 'ans', class: 'def-ans', rows: 3, 'data-draft': 'dr', value: DRAFT.dr, disabled: st !== 'ask', maxlength: 600, placeholder: 'Write the definition in your own words', 'aria-label': 'Your definition' })
    : mcq
    ? h('div', { class: 'mcq' }, q.options.map((o, i) => h('button', { type: 'button', class: 'opt' + (st !== 'ask' ? (i === q.a ? ' correct' : i === DR.picked ? ' picked' : ' dim') : ''), 'data-act': 'mcq', 'data-i': i, disabled: st !== 'ask', id: i === 0 ? 'opt0' : null },
      h('span', { class: 'opt-k' }, 'ABCD'[i]), h('span', null, o))))
    : h('div', { class: 'answer' },
      q.pre && h('span', { class: 'adorn' }, q.pre),
      h('input', { id: 'ans', 'data-draft': 'dr', 'data-enter': '1', value: DRAFT.dr, disabled: st !== 'ask', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', inputmode: q.kind === 'num' ? 'decimal' : 'text', enterkeyhint: 'done', 'aria-label': 'Your answer', placeholder: q.kind === 'coef' ? q.co.map(() => '1').join(' ') : null }),
      q.suf && h('span', { class: 'adorn' }, q.suf));
  return h('section', { class: 'card qcard ' + st },
    h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, q.sub || LEARN.name(q.id)), LEARN.LEVELLED.has(q.id) && h('span', { class: 'pill lvl', title: 'Questions get harder as you get them right' }, 'Level ' + levelOf(q.id)), h('span', null, q.back && st === 'ask' ? 'Back again: one to fix' : DR.run >= 3 ? `${DR.run} in a row` : DR.ok ? `${DR.ok} right` : 'Take your time')),
    h('p', { class: 'qtext' + (q.kind === 'word' ? ' quote' : '') }, q.q),
    DEMO.picOf(q) && h('div', { class: 'qpic-w' }, PIC.el(DEMO.picOf(q))),
    def && st !== 'ask' && DRAFT.dr.trim() && h('p', { class: 'yours' }, h('b', null, 'You wrote: '), DRAFT.dr.trim()),
    answerBox,
    st === 'ask' && !mcq && q.hint && h('p', { class: 'muted xs' }, q.hint),
    st === 'mark' ? h('div', { class: 'fb mark' },
        h('p', { class: 'fb-h' }, 'Mark it like an examiner'),
        h('p', null, h('b', null, 'Model answer: '), q.show),
        h('p', { class: 'muted xs' }, 'Tick each key point your answer clearly made. The ticks are a first guess, so fix them honestly.'),
        q.points.map((pt, i) => h('label', { class: 'chk' + (DR.ticks[i] ? ' d' : '') }, h('input', { type: 'checkbox', checked: !!DR.ticks[i], 'data-act': 'defTick', 'data-i': i }), checkBox(), h('span', null, pt))),
        B(`Confirm · ${DR.ticks.filter(Boolean).length} of ${q.points.length} key points`, 'defDone', 'primary wide', { id: 'nextq' }))
    : st === 'ask' ? (mcq ? h('div', { class: 'row end' }, B('Show me', 'reveal', 'link')) : h('div', { class: 'row' }, B(def ? 'Mark it' : 'Check', 'check', 'primary grow'), B('Show me', 'reveal', 'ghost')))
      : st === 'right' ? h('div', { class: 'fb ok t-panel-slide', 'data-open': 'false' },
        h('p', { class: 'fb-h' }, successCheck(), pick(['Correct.', 'Exactly right.', 'Nailed it.', 'Yes. That is it.'])), DR.msg && h('p', { class: 'muted xs' }, DR.msg),
        !mcq && acc('method', h('span', { class: 'btn link' }, 'See the method'), h('ol', { class: 'steps' }, q.steps.map(s => h('li', null, s))), { cls: '' }),
        !mcq && boardBtn(q, 'link', true),
        B('Next question', 'next', 'primary wide', { id: 'nextq' }))
      : h('div', { class: 'fb no t-panel-slide', 'data-open': 'false' },
        h('p', { class: 'fb-h' }, st === 'shown' ? 'Here is how it works.' : 'Not quite.', DR.msg && h('span', null, ' ' + DR.msg)),
        h('p', null, 'Answer: ', h('b', null, q.show)),
        !mcq && h('ol', { class: 'steps' }, q.steps.map(s => h('li', null, s))),
        !mcq && boardBtn(q, 'ghost', true),
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
    h('button', { type: 'button', class: 'card fixlink fblink', 'data-act': 'go', 'data-tab': 'feedback' }, icon('sparkle'),
      h('span', { class: 'grow' }, h('b', null, 'Get feedback on any answer'), h('small', null, 'Paste a homework or past-paper answer and Claude marks it like an examiner.')), h('span', { class: 'btn primary sm' }, 'Open')),
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
  const life = lifeSets(), nt = nextTitle(life);
  const stats = [['flame', life, 'sets finished'], ['hourglass', fmtHours(S.focusMin), 'focused'], ['target', S.learnOk, 'questions right'], ['crown', masteredAll(), 'topics mastered'],
    ['calendar', daysTrained(), 'days studied'], ['scroll', S.scores.length, 'papers logged'], ['wrench', S.fixedCount, 'mistakes fixed']];
  const cats = ['All', 'Focus', 'Learn', 'Exams'];
  const shown = ACH.filter(a => ACH_CAT === 'All' || a.cat === ACH_CAT);
  return h('div', { class: 'stack' },
    subHero('Toolkit', 'Your profile', 'tools', null, 'Toolkit'),
    h('section', { class: 'card idcard' },
      h('div', { class: 'id-emb' }, emblemEl(S.profile.emblem, 'emb big')),
      h('div', { class: 'id-txt' },
        h('input', { class: 'id-name', value: S.profile.name, placeholder: 'Your name', maxlength: 30, 'data-act': 'pname', 'aria-label': 'Your name' }),
        h('p', { class: 'id-title' }, titleFor(life)),
        h('p', { class: 'muted xs' }, nt ? `${nt[0] - life} more set${nt[0] - life === 1 ? '' : 's'} to become ${nt[1]}` : 'The highest title there is.'),
        h('div', { class: 'id-badges' }, h('span', { class: 'lan-chip' }, icon('star'), `${badgeCount()} badges`), h('span', { class: 'lan-chip' }, icon('flame'), `${daysTrained()} days studied`)))),
    acc('emblems', [h('h2', null, 'Emblem'), h('span', { class: 'muted acc-r' }, 'unlocked by sets')],
      h('div', { class: 'emblems' }, EMBLEMS.map(([id, need]) => { const ok = life >= need;
        return h('button', { type: 'button', class: 'emb-pick' + (S.profile.emblem === id ? ' on' : '') + (ok ? '' : ' locked'), 'data-act': 'emblem', 'data-id': id, disabled: !ok, 'aria-label': ok ? `Use ${id} emblem` : `Locked: finish ${need} sets` },
          emblemEl(id), !ok && h('small', null, need)); }))),
    h('div', { class: 'feats' }, stats.map(([ic, v, l]) => h('div', { class: 'feat' }, icon(ic), h('b', null, typeof v === 'number' ? h('span', { 'data-count': v }, v.toLocaleString('en-GB')) : v), h('span', null, l)))),
    card('Achievements', h('span', { class: 'muted' }, `${badgeCount()} of ${badgeTotal} badges`),
      h('div', { class: 'chips scroll' }, cats.map(c => chip(c, c === ACH_CAT, 'achCat', { 'data-k': c }))),
      h('ul', { class: 'achs' }, shown.map(a => {
        const tier = S.ach[a.id] ? S.ach[a.id].tier : 0, v = a.v(), next = a.t[tier], prev = tier ? a.t[tier - 1] : 0;
        const p = next ? clamp((v - prev) / (next - prev) * 100, 0, 100) : 100;
        return h('li', { class: 'ach t' + tier }, h('span', { class: 'ach-ic' }, icon(a.icon)),
          h('div', { class: 'ach-b' }, h('b', null, a.name), h('small', null, tier ? `${TIERS[tier - 1]} · ` : '', next ? `${Math.floor(v).toLocaleString('en-GB')} / ${next.toLocaleString('en-GB')} ${a.unit}` : `All tiers earned · ${Math.floor(v).toLocaleString('en-GB')} ${a.unit}`), bar(p)),
          h('span', { class: 'pips', 'aria-label': `${tier} of ${a.t.length} tiers` }, a.t.map((_, i) => h('i', { class: i < tier ? 'on t' + (i + 1) : '' })))); }))),
    card('Subject mastery', null, h('ul', { class: 'mastery' }, mySubjects().map(s => { const ids = topicsFor(s.id), m = masteredIn(ids);
      return h('li', null, h('button', { type: 'button', 'data-act': 'subject', 'data-track': s.id }, icon(s.icon), h('span', null, s.name), h('small', null, `${m}/${ids.length}`)), bar(ids.length ? m / ids.length * 100 : 0)); }))),
    h('div', { class: 'row center' }, B([icon('user'), 'Settings and backup'], 'go', 'ghost', { 'data-tab': 'me' })));
}
/* ---------- Toolkit ---------- */
function vTools() {
  const tool = (tab, ic, name, sub, extra = {}) => tilt(h('button', Object.assign({ type: 'button', class: 'tool', 'data-act': 'go', 'data-tab': tab }, extra), h('span', { class: 'lc-ic' }, icon(ic)), h('b', null, name), h('small', null, sub)));
  return h('div', { class: 'stack' },
    hero('Toolkit', 'Everything else', 'Here when you need it.'),
    ME.card(),
    h('div', { class: 'tools' },
      tool('lists', 'check', 'Checklists', `${examReady()} topics exam-ready · every subject`),
      tool('plan', 'calendar', 'Plan', `${weekTarget()} sets a week${S.deload ? ' · deload' : ''} · tick today's sets`),
      tool('profile', 'star', 'Profile', `${badgeCount()} badges · emblem and mastery`),
      tool('me', 'user', 'Settings', 'Subjects, grades, timer, backup'),
      tool('friends', 'user', 'Friends', `${S.friends.length} ${S.friends.length === 1 ? 'friend' : 'friends'} · this week's effort`),
      tool('lab', 'shield', 'Experimental', labOpen() ? 'Unlocked on this device' : 'Locked')));
}

/* Today's plan (manual ticking, finishers) */
function vToday() {
  const t = dkey(), w = new Date().getDay(), day = dayOf(t), plan = S.plan[w];
  return h('div', { class: 'stack narrow' },
    subHero(`${DAYFULL[w]} ${fmtDate(t)}`, "Today's plan", 'home', 'Sets tick themselves when a focus set finishes. Tap a dot to log one you did away from the app.'),
    S.deload && h('div', { class: 'banner' }, icon('moon'), h('div', null, h('b', null, 'Deload week'), h('p', null, 'Half volume on purpose. Recovery is part of the programme.'))),
    card('Sessions', B([icon('edit'), 'Edit week'], 'go', 'ghost sm', { 'data-tab': 'plan' }),
      plan.length ? plan.map(s => sessionRow(s, day)) : h('p', { class: 'muted' }, 'Nothing planned today. Rest is training too.')),
    card('Daily extras', null, FINISHERS.map(f => tierFor('Maths') === 'H' ? f.replace('(Foundation)', '(Higher)') : f).map((f, i) => h('label', { class: 'chk' + (day.f[i] ? ' d' : '') },
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

/* Exam practice: answer exam-style questions, mark against the mark scheme, record by paper and topic.
   Schemes (exam.js, papers.js): [points] one mark each · {any, max} capped · {lv, look} levels-based. */
let EXRES = null;
const paperOf = id => (S.exam && S.exam.paper && S.exam.paper.id === id && S.exam.paper) || EXAMS.find(p => p.id === id); /* a PPP paper is built fresh and lives with its run */
/* Higher students see Higher papers and Foundation students Foundation ones; untiered papers (English, RE...) suit everyone.
   With no tier chosen yet, both are shown. */
function tierFor(subj) {
  const ids = subj === 'Maths' ? ['maths'] : subj === 'Science' ? ['combined', 'biology', 'chemistry', 'physics'] : [];
  const s = S.me && S.me.subs.find(x => ids.includes(x.id));
  return s && s.tier ? s.tier[0] : null;
}
const paperFits = p => !p.tier || !tierFor(p.subj) || tierFor(p.subj) === p.tier;
function qMax(q) { const s = q[2]; return Array.isArray(s) ? s.length : s.lv ? s.lv[0][1] : s.max; }
function qTicks(q) { const s = q[2]; return Array.isArray(s) ? s : s.any || s.look; }
const qX = q => q[3] || {};
const marksOf = p => p.qs.reduce((n, q) => n + qMax(q), 0);
const groupOf = p => p.g || p.name.split(' ')[0];
function qScore(q, ticks, lv) { const s = q[2]; if (s.lv) return Math.max(0, lv); const n = ticks.filter(Boolean).length; return s.any ? Math.min(n, s.max) : n; }
const qDone = (E, k, q) => E.marked[k] && (!q[2].lv || E.lv[k] >= 0);
const qType = q => qX(q).auto && qX(q).auto.kind !== 'mcq' ? 'Calculation' : q[2].lv ? 'Extended writing' : /^(Calculate|Work out)/.test(q[1]) ? 'Calculation' : qMax(q) >= 3 ? 'Extended writing' : 'Recall';
const nums = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);
function vExam() {
  const run = S.exam && paperOf(S.exam.pid), tops = {};
  for (const sc of S.scores) for (const t of sc.tp) { const k = sc.subj + '|' + t.topic; const o = tops[k] = tops[k] || { subj: sc.subj, topic: t.topic, got: 0, max: 0 }; o.got += t.got; o.max += t.max; }
  const topics = Object.values(tops).sort((a, b) => a.got / a.max - b.got / b.max);
  const shown = EXAMS.filter(paperFits).sort((a, b) => !!b.tier - !!a.tier), groups = [...new Set(EXAMS.map(groupOf))].filter(g => shown.some(p => groupOf(p) === g)); /* full papers before 6-mark sets */
  return h('div', { class: 'stack narrow' },
    subHero('Mocks', 'Exam practice', 'mocks', 'Write your answer, then mark it against the mark scheme like an examiner. Scores go into Past papers, by paper and by topic.'),
    EXRES && examReport(EXRES),
    run && card('In progress', null, h('p', null, h('b', null, run.name), h('small', { class: 'muted' }, ` · question ${S.exam.i + 1} of ${run.qs.length}`)),
      h('div', { class: 'row' }, B([icon('play'), 'Carry on'], 'exStart', 'primary', { 'data-id': run.id }), B('Abandon', 'exQuit', 'link'))),
    card('Generated papers', h('span', { class: 'muted' }, 'any subject'), h('p', { class: 'muted xs' }, 'Quick practice sets, not the real exam format: a fresh set every time, weighted to your weak topics, marked automatically. Long sets cover more topics and count more towards your predicted grade.'),
      h('div', { class: 'chips' }, chip('Quick · 20 questions', GP_LEN === 20, 'gpLen', { 'data-n': 20 }), chip('Long · 40 questions', GP_LEN === 40, 'gpLen', { 'data-n': 40 })),
      S.mp && B([icon('play'), `Resume ${TRACK_NAME(S.mp.track || 'maths')} paper (Q${S.mp.i + 1})`], 'mpResume', 'primary'),
      h('div', { class: 'chips' }, mySubjects().map(x => chip([icon(x.icon), x.name], false, 'mpNew', { 'data-track': x.id })))),
    groups.map(g => card(g, null, EXAM_HOW[g] && h('p', { class: 'muted xs how' }, EXAM_HOW[g]),
      h('ul', { class: 'list' }, shown.filter(p => groupOf(p) === g).map(p => {
      const done = S.scores.filter(x => x.paper.startsWith(p.name)), best = done.length ? Math.max(...done.map(pctOf)) + '%' : '–', label = p.name.slice(g.length).trim();
      return h('li', { class: 'xp-row' }, h('div', { class: 'grow' }, h('b', null, label.charAt(0).toUpperCase() + label.slice(1)), h('small', null, `${p.qs.length} questions · ${marksOf(p)} marks · about ${p.mins} min`)),
        h('div', { class: 'num' }, h('b', null, best), h('small', null, done.length ? `best of ${done.length}` : 'not tried')),
        h('div', { class: 'row' }, B(run && run.id === p.id ? 'Resume' : 'Start', 'exStart', 'ghost sm', { 'data-id': p.id }), !(run && run.id === p.id) && B([icon('flame'), 'Mock'], 'mockGo', 'ghost sm', { 'data-id': p.id, 'aria-label': `Timed mock, ${p.mins} minutes` }), B(icon('scroll'), 'printPaper', 'ghost icon-only desk-only', { 'data-id': p.id, 'aria-label': `Print ${p.name}` })));
    })))),
    card('Results by topic', h('span', { class: 'muted' }, 'weakest first'), topics.length
      ? h('ul', { class: 'hbars' }, topics.map(t => h('li', null, h('div', { class: 'hb-l' }, h('b', null, t.topic), h('small', null, t.subj)),
        h('div', { class: 'hb-b' }, h('i', { style: `width:${t.got / t.max * 100}%;background:${SUBJ_COLOR[t.subj] || 'var(--y)'}` }), h('span', null, Math.round(t.got / t.max * 100) + '%')))))
      : h('p', { class: 'muted' }, 'Finish a paper and every topic gets a score here, so you can see exactly where marks are slipping.')));
}
function markPanel(q, E, i) {
  const s = q[2], m = qMax(q), list = qTicks(q).map((pt, j) => h('label', { class: 'chk' + (E.got[i][j] ? ' d' : '') },
    h('input', { type: 'checkbox', checked: E.got[i][j], 'data-act': 'exTick', 'data-j': j }), checkBox(), h('span', null, pt)));
  if (!s.lv) return h('div', { class: 'fb mark' }, h('p', { class: 'fb-h' }, 'Mark scheme'),
    h('p', { class: 'muted xs' }, s.any ? `Any ${s.max === 1 ? 'one' : s.max} of these, one mark each, up to ${s.max}. Only tick what your answer clearly says.` : 'One mark per point. Only tick a point if your answer clearly makes it; examiners do not give the benefit of the doubt.'),
    list, h('p', { class: 'ex-score' }, `${qScore(q, E.got[i], -1)} / ${m}`));
  const L = s.lv, n = E.got[i].filter(Boolean).length, sug = n ? L.length - Math.max(1, Math.ceil(n / list.length * L.length)) : -1;
  const cur = E.lv[i], sel = L.findIndex(([lo, hi]) => cur >= lo && cur <= hi);
  return h('div', { class: 'fb mark' },
    h('p', { class: 'fb-h' }, '1. What examiners look for'), h('p', { class: 'muted xs' }, 'Tick only what your answer actually does.'), list,
    h('p', { class: 'fb-h' }, '2. Pick the level that fits best'),
    L.map(([lo, hi, d], l) => h('button', { type: 'button', class: 'lvl' + (l === sel ? ' on' : '') + (l === sug ? ' sug' : ''), 'data-act': 'exLevel', 'data-l': l, 'aria-pressed': String(l === sel) },
      h('span', { class: 'lvl-h' }, h('b', null, `Level ${L.length - l}`), h('small', null, lo === hi ? ` · ${lo} mark${lo > 1 ? 's' : ''}` : ` · ${lo}–${hi} marks`), l === sug && h('em', null, 'your ticks suggest this')), h('span', null, d))),
    sel >= 0 && L[sel][0] !== L[sel][1] && [h('p', { class: 'fb-h' }, '3. Top, middle or bottom of the level?'), h('div', { class: 'chips' }, nums(L[sel][0], L[sel][1]).map(v => chip(String(v), v === cur, 'exMarkSet', { 'data-m': v })))],
    h('div', { class: 'row end' }, B('Nothing worth credit (0)', 'exMarkSet', 'link', { 'data-m': 0 })),
    h('p', { class: 'ex-score' }, `${cur >= 0 ? cur : '–'} / ${m}`));
}
function vExamQ() {
  const p = S.exam && paperOf(S.exam.pid);
  if (!p) return vExam();
  const E = S.exam, i = E.i, q = p.qs[i], x = qX(q), m = qMax(q), last = i === p.qs.length - 1;
  const sit = !!p.ppp && E.ph !== 'mark', show = !sit && (E.marked[i] || x.same); /* PPP: sit the whole paper first, then mark it */
  const total = p.qs.reduce((n, qq, k) => n + (qDone(E, k, qq) ? qScore(qq, E.got[k], E.lv[k]) : 0), 0), done = p.qs.filter((qq, k) => qDone(E, k, qq)).length;
  const srcs = [].concat(x.src || []).filter(k => p.src && p.src[k]), how = EXAM_HOW[groupOf(p)], a = x.auto;
  const parts = p.qs.filter(qq => !qX(qq).same).length, answered = p.qs.filter((qq, k) => !qX(qq).same && E.ans[k]).length, marks = p.qs.reduce((n, qq) => n + qMax(qq), 0);
  const yours = k => { const v = E.ans[k], aa = qX(p.qs[k]).auto; return v === '' ? (E.printed ? '(written on paper)' : '(left blank)') : aa && aa.kind === 'mcq' ? `${'ABCD'[+v]}: ${aa.options[+v]}` : v; };
  const got = show ? qScore(q, E.got[i], E.lv[i]) : 0;
  const opts = sit && !a ? q[1].split('\n').filter(l => /^[A-D]  /.test(l)) : []; /* a written multiple-choice question gets tick boxes too */
  return h('div', { class: 'stack narrow' },
    subHero(p.subj, p.name.replace(/^PPP /, ''), p.ppp ? 'ppp' : 'exam', null, p.ppp ? 'PPP mode' : 'Exam practice'),
    h('div', { class: 'exdots', 'aria-label': `Part ${i + 1} of ${p.qs.length}` }, p.qs.map((qq, k) => h('button', { type: 'button', class: 'exdot' + (k === i ? ' on' : '') + ((sit ? E.ans[k] : qDone(E, k, qq)) ? ' done' : '') + (k && qX(qq).g0 ? ' gs' : ''), 'data-act': 'exGo', 'data-i': k, 'aria-label': `Question ${qX(qq).n || k + 1}` }))),
    mockBar(),
    !E.end && hallBtn() && h('div', { class: 'row end' }, hallBtn()),
    i === 0 && sit ? h('div', { class: 'banner' }, icon('sparkle'), h('div', null, h('b', null, 'Real exam format'),
        h('p', null, `${p.ppp.qn} questions (${parts} parts), ${marks} marks, ${hrs(p.mins)}: the same as the real AQA ${p.g} paper. No marking until the end, like the real thing. Then you mark it yourself against the mark scheme.`),
        E.printed ? h('p', { class: 'muted xs' }, 'Sitting it on paper? Write your answers there. When you finish, press Pens down and mark each part here.')
          : p.g === 'Maths' && h('p', { class: 'muted xs' }, 'Do your working on paper and type the final answer. Fractions like 3/8; standard form like 4.7 x 10^5.'),
        isDesk() && B([icon('scroll'), 'Print this paper'], 'printRun', 'link')))
      : i === 0 && how && h('div', { class: 'banner' }, icon('sparkle'), h('div', null, h('b', null, 'How to do this paper'), h('p', null, how))),
    h('div', { class: 'exsplit' + (srcs.length ? ' has-src' : '') }, srcs.length > 0 && h('div', { class: 'ex-src' }, srcs.map(k => acc(`src-${p.id}-${k}`, h('b', { class: 'src-h' }, p.src[k][0]), h('div', { class: 'srcbox' }, p.src[k][1]), { open: true }))),
    h('div', { class: 'ex-main' },
    h('section', { class: 'card qcard exq' + (show ? ' marked' : '') },
      h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, q[0]), h('span', null, `${x.n ? 'Question ' + x.n : 'Q' + (i + 1)} · ${m} mark${m > 1 ? 's' : ''}${x.mins ? ` · about ${x.mins} min` : ''}`)),
      x.sec && h('p', { class: 'eyebrow' }, x.sec),
      h('p', { class: 'qtext' }, opts.length ? q[1].split('\n').filter(l => !/^[A-D]  /.test(l)).join('\n') : q[1]),
      sit ? [
        x.same ? h('p', { class: 'muted' }, 'Nothing to write here: this is marked on your answer to the question before.')
          : a && a.kind === 'mcq' ? [h('p', { class: 'muted xs' }, 'Tick one box.'), h('div', { class: 'mcq' }, a.options.map((o, k) => h('button', { type: 'button', class: 'opt' + (E.ans[i] === String(k) ? ' picked' : ''), 'data-act': 'exPick', 'data-o': k, disabled: mockOver(), 'aria-pressed': String(E.ans[i] === String(k)) }, h('span', { class: 'opt-k' }, 'ABCD'[k]), h('span', null, o))))]
          : opts.length ? [h('p', { class: 'muted xs' }, 'Tick one box.'), h('div', { class: 'mcq' }, opts.map(l => h('button', { type: 'button', class: 'opt' + (E.ans[i] === l[0] ? ' picked' : ''), 'data-act': 'exPick', 'data-v': l[0], disabled: mockOver(), 'aria-pressed': String(E.ans[i] === l[0]) }, h('span', { class: 'opt-k' }, l[0]), h('span', null, l.slice(3).trim()))))]
          : a ? h('div', { class: 'answer' }, a.pre && h('span', { class: 'adorn' }, a.pre),
            h('input', { id: 'exans', 'data-draft': 'ex', value: DRAFT.ex || '', disabled: mockOver(), maxlength: 60, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', inputmode: a.kind === 'num' ? 'decimal' : 'text', placeholder: 'Answer', 'aria-label': 'Your answer' }), a.suf && h('span', { class: 'adorn' }, a.suf))
          : h('textarea', { id: 'exans', class: m >= 9 ? 'long' : '', rows: Math.min(14, 2 + m), 'data-draft': 'ex', value: DRAFT.ex || '', disabled: mockOver(), maxlength: 12000, placeholder: m >= 20 ? 'Write your answer here, or on paper and paste in a summary' : 'Write your answer and working, as you would on the paper', 'aria-label': 'Your answer' }),
        a && a.hint && h('p', { class: 'muted xs' }, a.hint),
        h('div', { class: 'row' }, i > 0 && B('Back', 'exGo', 'ghost', { 'data-i': i - 1 }), last ? B([icon('check'), 'Pens down: mark it'], 'exPppMark', 'primary grow') : B('Next', 'exGo', 'primary grow', { 'data-i': i + 1 }))]
      : show ? [
        h('p', { class: 'yours' }, h('b', null, x.same ? (x.n ? 'Your answer to the question before: ' : `Your answer to question ${i}: `) : 'Your answer: '), x.same ? yours(i - 1) : yours(i)),
        a && m > 1 && h('p', { class: 'muted xs' }, 'A correct final answer gets all the marks, even with no working. If it is wrong, give the method marks your working earned.'),
        markPanel(q, E, i),
        p.ppp && got < m && !(q[2].lv && E.lv[i] < 0) && [h('p', { class: 'fb-h' }, `Why did you lose ${m - got > 1 ? 'those marks' : 'that mark'}?`), h('div', { class: 'chips' }, WHY.map(([k, l]) => chip(l, arr(E.why)[i] === k, 'exWhy', { 'data-r': k })))],
        examFeedback(p, q, E, i),
        h('div', { class: 'row' }, i > 0 && p.ppp && B('Back', 'exGo', 'ghost', { 'data-i': i - 1 }), last ? B('Finish and save score', 'exFinish', 'primary grow') : B('Next question', 'exGo', 'primary grow', { 'data-i': i + 1 }))]
      : [h('textarea', { id: 'exans', class: m >= 9 ? 'long' : '', rows: Math.min(14, 2 + m), 'data-draft': 'ex', value: DRAFT.ex || '', disabled: mockOver(), maxlength: 12000, placeholder: m >= 20 ? 'Write your answer here, or on paper and paste in a summary' : 'Write your answer and working, as you would on the paper', 'aria-label': 'Your answer' }),
        h('div', { class: 'row' }, B('Mark it', 'exMark', 'primary grow'), !last && B('Skip', 'exGo', 'ghost', { 'data-i': i + 1 }))]),
    sit ? [!last && h('div', { class: 'row center' }, B('Pens down: finish and mark it now', 'exPppMark', 'link')),
        h('p', { class: 'muted xs center' }, `${answered} of ${parts} answered. Your place is saved if you leave.`)]
      : [done > 0 && !(show && last) && h('div', { class: 'row center' }, B('Finish and save score', 'exFinish', 'link')),
        h('p', { class: 'muted xs center' }, `${done} of ${p.qs.length} marked · ${total} marks so far. Your place is saved if you leave${p.ppp ? '' : ', and you can save a score for just part of a paper'}.`)])));
}
function exOpen(i) { S.exam.i = i; DRAFT.ex = S.exam.ans[i] || ''; save(); }
const EXACT = {
  exStart(el) {
    const p = paperOf(el.dataset.id);
    if (S.exam && S.exam.pid !== p.id && !confirm('You have another paper in progress. Abandon it and start this one?')) return;
    if (!S.exam || S.exam.pid !== p.id) S.exam = { pid: p.id, i: 0, ans: p.qs.map(() => ''), got: p.qs.map(q => qTicks(q).map(() => false)), lv: p.qs.map(() => -1), marked: p.qs.map(() => false), end: el.dataset.timed ? Date.now() + p.mins * 60000 : 0 };
    EXRES = null; exOpen(S.exam.i); go('examq', '#exans');
  },
  exPick(el) { const E = S.exam; if (mockOver()) return; E.ans[E.i] = DRAFT.ex = String(el.dataset.v || el.dataset.o); save(); render(); },
  exWhy(el) { const E = S.exam; E.why = E.why || []; E.why[E.i] = el.dataset.r; save(); render(); },
  /* pens down: stop the clock, then mark the whole paper against the scheme */
  exPppMark() {
    const E = S.exam, p = paperOf(E.pid); E.ans[E.i] = (DRAFT.ex || '').trim();
    const blank = p.qs.filter((q, k) => !qX(q).same && !E.ans[k]).length;
    if (blank && !mockOver() && !confirm(`${blank} part${blank > 1 ? 's are' : ' is'} blank and will score 0. Put your pen down and start marking?`)) return save();
    if (E.end) { E.used = Math.max(1, Math.min(p.mins, Math.round((Math.min(Date.now(), E.end) - (E.end - p.mins * 60000)) / 60000))); E.timed = true; E.end = 0; }
    E.ph = 'mark'; E.marked = E.marked.map(() => true); exOpen(0); toast('Pens down. Now mark it like an examiner.'); render(); scrollTo({ top: 0 });
  },
  exMark() { const E = S.exam; E.ans[E.i] = (DRAFT.ex || '').trim(); E.marked[E.i] = true; save(); render(); },
  exLevel(el) {
    const E = S.exam, [lo, hi] = paperOf(E.pid).qs[E.i][2].lv[+el.dataset.l];
    if (!(E.lv[E.i] >= lo && E.lv[E.i] <= hi)) E.lv[E.i] = Math.floor((lo + hi) / 2);
    E.marked[E.i] = true; save(); render();
  },
  exMarkSet(el) { const E = S.exam; E.lv[E.i] = +el.dataset.m; E.marked[E.i] = true; save(); render(); },
  exGo(el) { if (S.exam.i !== +el.dataset.i && !S.exam.marked[S.exam.i]) S.exam.ans[S.exam.i] = (DRAFT.ex || '').trim(); exOpen(+el.dataset.i); render({ focus: '#exans' }); scrollTo({ top: 0 }); },
  exQuit() { if (!confirm('Abandon this paper? Nothing from it will be saved.')) return; S.exam = null; save(); render(); },
  exClose() { EXRES = null; render(); },
  exFinish() {
    const E = S.exam, p = paperOf(E.pid);
    const pend = p.qs.findIndex((q, k) => E.marked[k] && q[2].lv && E.lv[k] < 0);
    if (pend >= 0) { toast(`Pick a level for question ${pend + 1} first`); exOpen(pend); render(); return; }
    const done = p.qs.map((q, k) => qDone(E, k, q)), n = done.filter(Boolean).length;
    if (!n) return toast('Mark at least one question first');
    if (n < p.qs.length && !confirm(`${p.qs.length - n} question${p.qs.length - n > 1 ? 's are' : ' is'} not marked. Save a score for just the ${n} you marked?`)) return;
    const tp = {}, lost = {};
    p.qs.forEach((q, k) => {
      if (!done[k]) return;
      const g = qScore(q, E.got[k], E.lv[k]), m = qMax(q), t = tp[q[0]] = tp[q[0]] || { topic: q[0], got: 0, max: 0 };
      t.got += g; t.max += m;
      if (m > g) { const key = q[0] + '|' + qType(q); lost[key] = lost[key] || { topic: q[0], type: qType(q), marks: 0 }; lost[key].marks += m - g; }
    });
    const tps = Object.values(tp), got = tps.reduce((a, t) => a + t.got, 0), max = tps.reduce((a, t) => a + t.max, 0), pc = Math.round(got / max * 100);
    const timed = !!(E.end || E.timed), self = p.ppp ? pppCheck(p, E) : null;
    const name = p.name + (timed ? ' (timed)' : '') + (n < p.qs.length ? ` (${n} of ${p.qs.length} questions)` : ''), prevBest = Math.max(-1, ...subjPts(p.subj).map(pctOf));
    S.scores.push({ id: newId(), date: dkey(), subj: p.subj, paper: name, score: got, max, lost: Object.values(lost), tp: tps });
    if (prevBest >= 0 && pc > prevBest) { S.stat.improve++; toast(`${pc}% · a personal best in ${p.subj}!`, 'big'); } else toast(`${pc}% saved. Every paper sharpens you.`);
    CHART.add(p.subj); xp(25); dayEv('paper');
    const g = groupOf(p), lostIds = p.qs.filter((q, k) => done[k] && qX(q).tid && qScore(q, E.got[k], E.lv[k]) < qMax(q)).map(q => qX(q).tid);
    const added = tps.filter(t => t.got / t.max < .75).reduce((a, t) => a + addFix(EXAM_LINK[g + '|' + t.topic] || [], `${t.got}/${t.max} on ${t.topic} (${p.name})`), 0) + (lostIds.length ? addFix([...new Set(lostIds)], `Lost marks on ${p.name}`) : 0);
    if (added) setTimeout(() => toast(`${added} topic${added > 1 ? 's' : ''} added to your fix queue`), 1600);
    EXRES = { name, got, max, tp: tps, subj: p.subj, timed, mins: p.mins, used: E.used || (E.end ? Math.max(1, Math.min(p.mins, Math.round((Date.now() - (E.end - p.mins * 60000)) / 60000))) : 0), marked: n, total: p.qs.length, ppp: !!p.ppp, self };
    S.exam = null; DRAFT.ex = ''; save(); go(p.ppp ? 'ppp' : 'exam');
  }
};

/* Generated Maths paper: a fresh paper from the question generators, no feedback until the end, then marked automatically */
const MUST4 = new Set(['pct-of', 'pct-incdec', 'frac-of', 'ratio-share', 'solve-1', 'expand', 'substitute', 'area', 'angles', 'averages', 'prob', 'rounding', 'negatives', 'bidmas', 'sdt', 'nth-term', 'pythag', 'circles']);
let MPRES = null, GP_LEN = 40; /* generated paper length: full length by default, since more questions make the grade more reliable */
const trackSubj = t => (LEARN.SUBJECTS.find(x => x.id === t) || { subj: 'Maths' }).subj;
const makeMathsPaper = (n = 20) => makePaper('maths', n);
/* a fresh auto-marked paper for any subject: Maths is calculations only; others skip definitions (those are self-marked) */
function makePaper(track = 'maths', n = 20) {
  const ids = topicsFor(track).filter(id => track === 'maths' ? LEARN.TOPIC[id].type === 'calc' : true); /* definitions come as multiple choice, so they mark themselves */
  const pool = ids.map(id => { const k = skill(id), acc = k.rec.length ? k.rec.filter(Boolean).length / k.rec.length : .5;
    return { id, w: (MUST4.has(id) ? 1.5 : 1) * (S.queue.some(x => x.id === id) ? 3 : 1) * (1.5 - acc) }; });
  const chosen = [];
  while (chosen.length < n && pool.length) { let r = Math.random() * pool.reduce((a, b) => a + b.w, 0); const i = pool.findIndex(x => (r -= x.w) <= 0); chosen.push(pool.splice(i < 0 ? pool.length - 1 : i, 1)[0].id); }
  while (chosen.length < n && ids.length) chosen.push(pick(ids)); /* fewer topics than questions */
  chosen.sort((a, b) => ids.indexOf(a) - ids.indexOf(b)); /* generator order runs roughly easy to hard */
  /* no repeats across papers: each question is regenerated until it is one this device has never had on a paper
     (numbers change in calculation questions; fact questions use one you have not been asked yet until the bank runs out) */
  const ok = q => q && (track === 'maths' ? q.kind !== 'mcq' : q.kind !== 'def'), used = new Set(S.pused), out = [];
  for (const id of chosen) {
    let q = null;
    for (let t = 0; t < 40; t++) { const c = LEARN.gen(id); if (!ok(c)) continue; q = q || c; if (!used.has(qSig(c))) { q = c; break; } }
    if (q) { used.add(qSig(q)); out.push(q); }
  }
  S.pused = [...used].slice(-4000);
  return out;
}
const qSig = q => q.key ? 'k' + q.key : q.id + '|' + String(q.q).slice(0, 80);
function vMPaper() {
  if (MPRES) return mpResults();
  const M = S.mp; if (!M) return vExam();
  if (M.self) return vSelfMark(M);
  const i = M.i, q = M.qs[i], last = i === M.qs.length - 1;
  return h('div', { class: 'stack narrow' },
    subHero(TRACK_NAME(M.track || 'maths'), 'Generated paper', 'exam', null, 'Exam practice'),
    h('div', { class: 'exdots' }, M.qs.map((_, k) => h('button', { type: 'button', class: 'exdot' + (k === i ? ' on' : '') + (M.ans[k] ? ' done' : ''), 'data-act': 'mpGo', 'data-i': k, 'aria-label': `Question ${k + 1}` }))),
    i === 0 && h('div', { class: 'banner' }, icon('sparkle'), h('div', null, h('b', null, 'Exam conditions'), h('p', null, (M.track || 'maths') === 'maths' ? 'No feedback until the end, like the real thing. Do your working on paper and type the final answer. Fractions like 3/8; standard form like 4.7 x 10^5.' : 'No feedback until the end, like the real thing. Answer from memory, then it is marked automatically.'))),
    h('section', { class: 'card qcard exq' },
      h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, LEARN.name(q.id)), h('span', null, `Question ${i + 1} of ${M.qs.length}`)),
      h('p', { class: 'qtext' }, q.q),
      q.kind === 'mcq' ? h('div', { class: 'mcq' }, q.options.map((o, k) => h('button', { type: 'button', class: 'opt' + (M.ans[i] === String(k) ? ' picked' : ''), 'data-act': 'mpPick', 'data-o': k, 'aria-pressed': String(M.ans[i] === String(k)) }, h('span', { class: 'opt-k' }, String(k + 1)), h('span', null, o)))) :
      h('div', { class: 'answer' }, q.pre && h('span', { class: 'adorn' }, q.pre),
        h('input', { id: 'mpans', 'data-draft': 'mp', value: DRAFT.mp || '', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', inputmode: q.kind === 'num' ? 'decimal' : 'text', enterkeyhint: last ? 'done' : 'next', 'aria-label': 'Your answer' }),
        q.suf && h('span', { class: 'adorn' }, q.suf)),
      q.hint && h('p', { class: 'muted xs' }, q.hint),
      h('div', { class: 'row' }, i > 0 && B('Back', 'mpGo', 'ghost', { 'data-i': i - 1 }), last ? B('Finish and mark', 'mpFinish', 'primary grow') : B('Next', 'mpGo', 'primary grow', { 'data-i': i + 1 }))),
    h('p', { class: 'muted xs center' }, `${M.ans.filter(Boolean).length} of ${M.qs.length} answered. Your place is saved if you leave.`),
    h('div', { class: 'row center' }, B('Abandon paper', 'mpQuit', 'link')));
}
function mpResults() {
  const R = MPRES;
  return h('div', { class: 'stack narrow' },
    subHero(TRACK_NAME(R.track || 'maths'), 'Generated paper marked', 'exam', null, 'Exam practice'),
    R.self && selfCard(R.self),
    card(null, null, h('p', { class: 'big-score' }, `${R.score} / ${R.rows.length}`, h('small', null, ` · ${Math.round(R.score / R.rows.length * 100)}% · about a grade ${gradeFor(trackSubj(R.track || 'maths'), Math.round(R.score / R.rows.length * 100))}`)),
      h('p', { class: 'muted' }, R.added ? `${R.added} topic${R.added > 1 ? 's' : ''} you got wrong ${R.added > 1 ? 'are' : 'is'} now in your fix queue.` : R.score === R.rows.length ? 'Full marks. Generate another; it will be different.' : 'Saved to Past papers.'),
      h('div', { class: 'row' }, R.ppp && R.added ? B([icon('wrench'), 'Do the corrections now'], 'drill', 'primary', { 'data-track': 'fix' }) : B([icon('sparkle'), 'New paper'], 'mpNew', 'primary', Object.assign({ 'data-track': R.track || 'maths' }, R.ppp ? { 'data-ppp': '1' } : {})), B('Done', 'mpDone', 'ghost'))),
    card('Question by question', null, h('ul', { class: 'mpres' }, R.rows.map((r, k) => h('li', { class: r.ok ? 'ok' : 'no' },
      h('p', null, h('b', null, `${k + 1}. ${r.ok ? '✓' : '✗'} `), r.q.q),
      h('p', { class: 'muted xs' }, `Your answer: ${(r.q.kind === 'mcq' && r.a ? r.q.options[+r.a] : r.a) || '(blank)'}${r.ok ? '' : ` · Correct: ${r.q.show}`}${r.msg ? ` · ${r.msg}` : ''}`),
      !r.ok && acc('mp' + k, h('span', { class: 'btn link' }, 'See the method'), h('div', null, h('ol', { class: 'steps' }, r.q.steps.map(x => h('li', null, x))), boardBtn(r.q, 'link')), { cls: '' }))))));
}
const MPACT = {
  mpNew(el) {
    if (S.mp && !MPRES && !confirm('Start a new paper? The one in progress will be lost.')) return;
    const track = (el && el.dataset && el.dataset.track) || 'maths';
    const len = el && el.dataset && el.dataset.ppp ? 40 : GP_LEN; S.mp = null; const qs = makePaper(track, len);
    if (!qs.length) return toast(`All ${TRACK_NAME(track)} topics are hidden in Settings`);
    S.mp = { qs, ans: qs.map(() => ''), i: 0, track, ppp: !!(el && el.dataset && el.dataset.ppp) };
    if (len > 20) toast(`Long set: ${qs.length} questions, about ${Math.round(qs.length * 1.5)} minutes`); DRAFT.mp = ''; MPRES = null; save(); go('mpaper', '#mpans'); scrollTo({ top: 0 });
  },
  mpResume() { MPRES = null; DRAFT.mp = S.mp.ans[S.mp.i] || ''; go('mpaper', '#mpans'); },
  gpLen(el) { GP_LEN = +el.dataset.n; render(); },
  mpPick(el) { S.mp.ans[S.mp.i] = String(el.dataset.o); save(); render(); },
  mpGo(el) { const M = S.mp; if (M.qs[M.i].kind !== 'mcq') M.ans[M.i] = (DRAFT.mp || '').trim().slice(0, 40); M.i = +el.dataset.i; DRAFT.mp = M.ans[M.i] || ''; save(); render({ focus: '#mpans' }); },
  mpQuit() { if (!confirm('Abandon this paper? Nothing will be saved.')) return; S.mp = null; save(); go('exam'); },
  mpDone() { MPRES = null; go('exam'); },
  mpFinish() {
    const M = S.mp; if (M.qs[M.i].kind !== 'mcq') M.ans[M.i] = (DRAFT.mp || '').trim().slice(0, 40);
    const track = M.track || 'maths', subj = trackSubj(track), tn = TRACK_NAME(track);
    const blank = M.ans.filter(a => !a).length;
    if (blank && !confirm(`${blank} question${blank > 1 ? 's are' : ' is'} blank and will score 0. Mark the paper now?`)) return;
    if (M.ppp && !M.self) { M.self = { i: 0, my: M.qs.map(() => null), why: M.qs.map(() => '') }; save(); render(); return scrollTo({ top: 0 }); } /* PPP: you mark it first */
    const rows = M.qs.map((q, k) => { const a = M.ans[k], r = a ? LEARN.check(q, a) : { valid: false }; const ok = !!(r.valid && r.ok); record(q.id, ok, q.key); return { q, a, ok, msg: r.valid ? r.msg : '' }; });
    const tp = {}, lost = {};
    for (const r of rows) { const t = tp[r.q.id] = tp[r.q.id] || { topic: LEARN.name(r.q.id), got: 0, max: 0 }; t.max++; if (r.ok) t.got++; else { const l = lost[r.q.id] = lost[r.q.id] || { topic: LEARN.name(r.q.id), type: track === 'maths' ? 'Calculation' : 'Recall', marks: 0 }; l.marks++; } }
    const score = rows.filter(r => r.ok).length, pc = Math.round(score / rows.length * 100), prevBest = Math.max(-1, ...subjPts(subj).map(pctOf));
    S.scores.push({ id: newId(), date: dkey(), subj, paper: `${M.ppp ? 'PPP' : 'Generated'} ${tn} paper${rows.length > 20 ? ` (${rows.length} questions)` : ''}`, score, max: rows.length, lost: Object.values(lost), tp: Object.values(tp) });
    const added = addFix(rows.filter(r => !r.ok).map(r => r.q.id), `Wrong on a generated ${tn} paper`);
    if (prevBest >= 0 && pc > prevBest) { S.stat.improve++; toast(`${pc}% · a personal best in ${subj}!`, 'big'); } else toast(`${pc}% saved.`);
    CHART.add(subj); xp(25); dayEv('paper'); MPRES = { rows, score, added, track, ppp: !!M.ppp, self: M.self ? selfReport(M, rows) : null }; S.mp = null; DRAFT.mp = ''; save(); render(); scrollTo({ top: 0 });
  }
};

/* Progress: what is actually learned, by subject, from the item memory, topic stars and exam scores */
function vStats() {
  const BK = LEARN.bank(), dayAt = i => S.days[addDays(-i)] || {};
  const span = (a, b) => { let n = 0, r = 0; for (let i = a; i < b; i++) { const d = dayAt(i); n += d.qa || 0; r += d.qr || 0; } return { n, r, pc: n ? Math.round(r / n * 100) : null }; };
  const wk = span(0, 7), prev = span(7, 14), acts = Array.from({ length: 28 }, (_, i) => dayAt(27 - i).qa || 0), top = Math.max(1, ...acts);
  let allL = 0, allT = 0;
  const rows = mySubjects().map(s => {
    const b = BK[s.id] || { def: [], recall: [], eq: [], vocab: [] }, calc = s.topics.filter(id => LEARN.TOPIC[id].type === 'calc');
    const parts = [['Definitions', b.def], ['Descriptive vocabulary', b.vocab || []], ['Key facts', b.recall], ['Equations and formulae', b.eq]].filter(([, k]) => k.length).map(([n, k]) => [n, k.filter(learned).length, k.length, k.filter(x => S.items[x]).length]);
    if (calc.length) parts.push(['Calculation skills mastered', masteredIn(calc), calc.length, calc.filter(id => skill(id).n).length]);
    const L = parts.reduce((a, p) => a + p[1], 0), T = parts.reduce((a, p) => a + p[2], 0); allL += L; allT += T;
    const papers = S.scores.filter(x => s.subj === 'Science' ? x.paper.startsWith(s.name) : x.subj === s.subj).sort((a, b) => a.date < b.date ? -1 : 1);
    const tg = +(S.grades[s.subj] || {}).pct || 0;
    return { s, parts, L, T, papers, tg };
  });
  const hard = Object.keys(LEARN.TOPIC).filter(id => usable(id) && skill(id).rec.length >= 3).map(id => { const k = skill(id); return [id, k.rec.filter(Boolean).length / k.rec.length]; })
    .filter(x => x[1] < .7).sort((a, b) => a[1] - b[1]).slice(0, 6);
  const tile = (v, l, sub) => h('div', { class: 'tile' }, h('b', null, v), h('span', null, l), sub && h('small', null, sub));
  return h('div', { class: 'stack narrow' },
    hero('Stats', 'What you have learned', 'Learned means right at least twice in a row, and right the last time you saw it. Calculation topics count once mastered (5 in a row).'),
    card('Overall', h('span', { class: 'pill' }, `${allT ? Math.round(allL / allT * 100) : 0}% learned`), bar(allT ? allL / allT * 100 : 0),
      h('p', { class: 'muted xs' }, `${allL.toLocaleString('en-GB')} of ${allT.toLocaleString('en-GB')} facts, definitions, equations and skills learned. In each subject, the faint bar shows what you have tried; the bright bar shows what you have learned.`),
      h('div', { class: 'tiles' },
        tile(Object.values(S.skill).reduce((a, k) => a + k.n, 0).toLocaleString('en-GB'), 'questions answered'),
        tile(wk.pc == null ? '–' : wk.pc + '%', 'right this week', wk.pc != null && prev.pc != null ? (wk.pc >= prev.pc ? `up ${wk.pc - prev.pc} from last week` : `down ${prev.pc - wk.pc} from last week`) : `${wk.n} answered`),
        tile(S.queue.length, 'in the fix queue'))),
    predictCard(),
    card('Last 28 days', h('span', { class: 'muted' }, `${acts.reduce((a, b) => a + b, 0)} questions`),
      h('div', { class: 'spark', role: 'img', 'aria-label': 'Questions answered per day for the last 28 days' }, acts.map((n, i) => h('i', { style: `height:${Math.max(n ? 6 : 2, n / top * 100)}%`, title: `${fmtDate(addDays(i - 27))}: ${n}` }))),
      h('div', { class: 'spark-l muted xs' }, h('span', null, '4 weeks ago'), h('span', null, 'today'))),
    hard.length > 0 && card('Weakest topics right now', null, h('div', { class: 'chips' }, hard.map(([id, a]) => chip([LEARN.name(id), h('small', null, ` ${Math.round(a * 100)}%`)], false, 'drill', { 'data-topic': id })))),
    rows.map(r => card(r.s.name, h('span', { class: 'pill' }, `${r.T ? Math.round(r.L / r.T * 100) : 0}%`),
      r.parts.map(([n, l, t, tried]) => h('div', { class: 'prow' }, h('div', { class: 'prow-h' }, h('span', null, n), h('small', null, `${l} learned · ${tried} tried / ${t}`)),
        h('div', { class: 'bar two', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(t ? l / t * 100 : 0) }, h('i', { class: 'tried', style: `width:${t ? tried / t * 100 : 0}%` }), h('i', { style: `width:${t ? l / t * 100 : 0}%` })))),
      r.papers.length ? h('p', { class: 'muted xs' }, `Exam practice: latest ${pctOf(r.papers[r.papers.length - 1])}%, best ${Math.max(...r.papers.map(pctOf))}% over ${r.papers.length} paper${r.papers.length > 1 ? 's' : ''}${r.tg ? ` · target ${r.tg}%` : ''}.`)
        : h('p', { class: 'muted xs' }, 'No exam practice yet for this subject.'))));
}

/* Past papers */
function vPapers() {
  return h('div', { class: 'stack' }, hero('Stats', 'Past papers'), chartCard(), h('div', { class: 'cols' }, logCard(), gradesCard()), scoresCard());
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
      h('p', { class: 'muted center xs' }, `${list.length} to review · after flipping, swipe right if you got it, left for again`)];
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
/* Plan editor */
function vPlan() {
  const w = PD, plan = S.plan[w];
  const kinds = [['train', 'Training'], ['rest', 'Rest'], ['other', 'Fixed']];
  return h('div', { class: 'stack narrow' },
    subHero('Plan', 'Your week', 'tools', 'Name sessions after a subject (e.g. "Geography", "Science: Chemistry") and Focus builds the right mission for them.'),
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
          mySubjects().map(s => acc('hide-' + s.id, [h('b', null, s.name), h('span', { class: 'muted acc-r' }, `${s.topics.filter(t => !S.hidden[t]).length} of ${s.topics.length} on`)],
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
        card('Look', null, h('h3', null, 'Page'), h('div', { class: 'chips' }, MODES.map(([v, l]) => chip(l, S.mode === v, 'mode', { 'data-v': v }))),
          h('h3', null, 'Highlighter'), h('div', { class: 'themes' }, THEMES.map(([id, name, a]) => h('button', { type: 'button', class: 'theme' + (S.theme === id ? ' on' : ''), 'data-act': 'theme', 'data-v': id, 'aria-pressed': String(S.theme === id), style: `--ta:${a}` },
          h('span', { class: 'th-sw' }), h('b', null, name))))),
        card('Motion', null, h('p', { class: 'muted xs' }, 'Auto follows your device setting. Full turns on every animation and effect.'),
          h('div', { class: 'chips' }, [['auto', 'Auto'], ['full', 'Full'], ['reduced', 'Reduced']].map(([v, l]) => chip(l, S.motion === v, 'motion', { 'data-v': v }))),
          MQ_REDUCED.matches && h('p', { class: 'muted xs' }, 'Your device currently asks for reduced motion.')),
        card('Sound', null, h('p', { class: 'muted xs' }, 'Effects for right answers, streaks, the timer, flashcards and the board. Made on your device, so they work offline.'),
          h('div', { class: 'chips' }, [['off', 'Off'], ['quiet', 'Quiet'], ['normal', 'Normal']].map(([v, l]) => chip(l, S.sound === v, 'sound', { 'data-v': v })))),
        card('Mocks', null, field('First mock exam', h('input', { type: 'date', value: S.mock, 'data-act': 'mock' })), h('p', { class: 'muted xs' }, 'Used for the trend line on your score chart.')),
        card('Sebastian', null, h('p', { class: 'muted xs' }, 'The resident rat on Focus. Purely for fun.'),
          h('div', { class: 'chips' }, chip('Show him', S.seb !== false, 'sebShow', { 'data-v': '1' }), chip('Hide him', S.seb === false, 'sebShow', { 'data-v': '0' }))),
        card('Text size', null, h('p', { class: 'muted xs' }, 'Makes guides, questions and sources bigger. The top bar and tabs stay the same.'),
          h('div', { class: 'chips' }, TEXT_SIZES.map(([v, l]) => chip(l, (S.text || 'normal') === v, 'textSize', { 'data-v': v })))),
        card('Backup', h('span', { class: 'muted' }, backupLine()), h('p', { class: 'muted xs' }, 'Progress lives only on this device. Back up weekly: on a phone, choose Save to Files or Google Drive. Restore it on any device.'),
          h('div', { class: 'row' }, B([icon('download'), 'Download'], 'exp', 'primary'),
            h('label', { class: 'btn ghost' }, icon('upload'), 'Restore', h('input', { type: 'file', accept: '.json,application/json', 'data-act': 'imp', class: 'sr' })))),
        card('Install', null, h('p', { class: 'muted xs' }, h('b', null, 'iPhone: '), 'Safari → Share → Add to Home Screen.', h('br'), h('b', null, 'Android: '), 'Chrome menu ⋮ → Install app.')),
        card('Start over', null, h('p', { class: 'muted xs' }, 'Wipes everything on this device. Download a backup first.'), B('Reset everything', 'reset', 'ghost danger')))));
}

/* ---------- shell ---------- */
const TABS = [['home', 'flame', 'Focus'], ['learn', 'sparkle', 'Learn'], ['mocks', 'scroll', 'Mocks'], ['numbers', 'chart', 'Stats'], ['tools', 'grid', 'Toolkit']];
const PARENT = { friends: 'tools', lab: 'tools', ppp: 'tools', feedback: 'learn', exam: 'mocks', examq: 'mocks', mpaper: 'mocks', mockstart: 'mocks', wrapped: 'mocks', profile: 'tools', stats: 'numbers', ready: 'numbers', week: 'numbers', study: 'learn', guide: 'learn', session: 'home', listen: 'learn', today: 'home', drill: 'learn', subject: 'learn', write: 'learn', cards: 'learn', papers: 'numbers', lists: 'tools', fix: 'mocks', plan: 'tools', me: 'tools' };
const VIEWS = { friends: vFriends, lab: vLab, ppp: vPPP, feedback: vFeedback, search: vSearch, ready: progView('ready', vReady), mockstart: vMockStart, week: progView('week', vWeek), home: vHome, learn: vLearn, subject: vSubject, drill: vDrill, write: vWrite, study: vStudy, guide: vGuide, session: vSession, mocks: vMocks, wrapped: vWrapped, profile: vProfile, tools: vTools, today: planView('today', vToday), papers: progView('papers', vPapers), exam: vExam, examq: vExamQ, mpaper: vMPaper, stats: progView('stats', vStats), numbers: progView('numbers', vNumbers), cards: vCards, lists: vLists, fix: vFixAll, plan: planView('plan', vPlan), me: vMe };
const ORDER = t => { const p = PARENT[t] || t, i = TABS.findIndex(x => x[0] === p); return i * 10 + (PARENT[t] ? 5 : 0); };
let renderedDay = dkey();

function hdr() {
  const el = $('#cd'), showMini = T.run && TAB !== 'home';
  el.replaceChildren(
    searchBtn(),
    showMini ? h('button', { type: 'button', class: 'mini-t', 'data-act': 'go', 'data-tab': 'home', 'aria-label': 'Back to the running timer' }, icon(T.mode === 'focus' ? 'flame' : 'moon'), h('span', { id: 'mt' }, fmt(Math.ceil(T.left)))) : '',
    (() => { const dl = daysToMocks(); return dl > 0 ? h('button', { type: 'button', class: 'cd-chip', 'data-act': 'go', 'data-tab': 'me', 'aria-label': `${dl} days until your mocks. Change the date in Settings` }, icon('hourglass'), h('b', null, dl), h('span', { class: 'cd-l' }, dl === 1 ? 'day to mocks' : 'days to mocks')) : dl > -21 ? h('span', { class: 'cd-chip' }, icon('hourglass'), h('b', null, 'Mocks')) : ''; })(),
    readyChip());
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
/* Sebastian's idle animations are drawn on the main thread (SVG), so they pause whenever he is scrolled out of sight */
const SEB_IO = 'IntersectionObserver' in window ? new IntersectionObserver(es => { for (const e of es) e.target.classList.toggle('off', !e.isIntersecting); }) : null;
function render(o = {}) {
  const fk = o.enter ? null : focusKey(document.activeElement);
  renderedDay = dkey();
  hdr();
  const view = $('#view');
  view.replaceChildren(VIEWS[TAB]());
  if (SEB_IO) { SEB_IO.disconnect(); for (const r of view.querySelectorAll('.seb-rat')) SEB_IO.observe(r); }
  view.classList.remove('enter'); if (o.enter && !REDUCED) { void view.offsetWidth; view.classList.add('enter'); }
  navPaint();
  if (TAB === 'papers') drawChart();
  paintTimer();
  if (fk) { const e = view.querySelector(fk); if (e && !e.disabled) e.focus({ preventScroll: true }); }
  if (o.focus) { const e = view.querySelector(o.focus); if (e) { e.focus({ preventScroll: true }); revealAboveNav(e); } }
  if (o.pulse) { const e = view.querySelector(o.pulse); if (e) { e.classList.add('pop'); if (o.burst) FXS.burst(e, o.burst); } }
  if (o.recheck) { const e = view.querySelector(o.recheck); if (e) { const on = e.classList.contains('d'); e.classList.toggle('d', !on); void e.offsetWidth; e.classList.toggle('d', on); } }
  if (o.enter) {
    FXS.countUp(view);
    if (!REDUCED && !HAS_VT) for (const el of view.querySelectorAll('.hero, .focus')) { el.classList.add('t-stagger'); void el.offsetWidth; const show = () => el.classList.add('is-shown'); requestAnimationFrame(show); setTimeout(show, 120); }
  }
  if (typeof paintSide === 'function') paintSide();
  const panels = view.querySelectorAll('.t-panel-slide[data-open="false"]');
  if (panels.length) { const open = () => panels.forEach(p => p.setAttribute('data-open', 'true')); requestAnimationFrame(() => requestAnimationFrame(open)); setTimeout(open, 150); }
}
/* After answering, the feedback and Next button render below the fold, often under the fixed nav, where a tap lands on the nav instead. Bring them into clear view. */
function revealAboveNav(e) {
  const n = $('#nav').getBoundingClientRect(), nav = n.width > n.height ? n.top : innerHeight; /* on a computer the nav is a side rail, not a bar along the bottom */
  const r = e.getBoundingClientRect(), fb = e.closest('.fb') || e, top = fb.getBoundingClientRect().top;
  if (r.bottom > nav - 12 || r.top < 70) scrollBy({ top: Math.min(r.bottom - nav + 24, top - 80), behavior: REDUCED ? 'auto' : 'smooth' });
}
/* Page changes slide sideways in the direction of travel (View Transitions API, motion tuned after Transitions.dev "Page side-by-side") */
const SCROLLS = {};
function go(t, focusSel) {
  if (!VIEWS[t]) return;
  if (t !== TAB) SFX.play('click');
  const dir = ORDER(t) >= ORDER(TAB) ? 'fwd' : 'back';
  const from = TAB, fromY = scrollY; /* Back to a list returns to where you were in it, like a phone app; anywhere else starts at the top */
  const swap = () => { SCROLLS[from] = fromY; TAB = t; if (t === 'plan') PD = new Date().getDay(); CHOOSE = false; render({ enter: true }); scrollTo(0, t === PARENT[from] ? SCROLLS[t] || 0 : 0); };
  if (HAS_VT && t !== TAB) { document.documentElement.dataset.dir = dir; document.startViewTransition(swap).ready.catch(() => {}); } /* a quick second tap skips the first slide: that is fine */
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
/* one more question done in this drill; in a 5-a-day set the fifth one ends the warm-up and picks the topic for the rest */
function countAns() {
  DR.n = (DR.n || 0) + 1;
  if (DR.five && DR.n === 5 && !DR.topic) { DR.topic = pickTopic(DR.track, DR.q.id); const t = LEARN.name(DR.topic); setTimeout(() => toast(`Warm-up done. Next: ${t} until the timer ends.`, "big"), 600); }
}
function finishAnswer(res) {
  record(DR.q.id, res.ok, DR.q.key); countAns();
  if (!res.ok) queueBack();
  DR.state = res.ok ? 'right' : 'wrong'; DR.msg = res.msg || '';
  if (res.ok) { DR.ok++; DR.run++; S.stat.bestRun = Math.max(S.stat.bestRun, DR.run); } else DR.run = 0;
  dayEv('run', DR.run, true);
  save();
  render({ focus: '#nextq' });
  if (res.ok) FXS.burst($('.qcard'), DR.run >= 5 ? 60 : 36);
  SFX.play(!res.ok ? 'wrong' : DR.run === 3 || DR.run === 5 || DR.run % 10 === 0 ? 'combo' : 'correct', DR.run);
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
    else { if (T.mode === 'focus' && !timerActive()) { T.sid = currentSid(); T.swap = null; DR = null; SFX.play('start'); } T.end = Date.now() + T.left * 1000; T.run = true; }
    saveT(); render(); scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  },
  rst() { if (T.mode === 'focus' && T.run && !confirm('End this set early? It will not count as a set.')) return; T.run = false; T.mode = 'focus'; T.len = 0; T.rescue = false; T.swap = null; T.left = tTotal(); T.sid = null; saveT(); render(); },
  skip() { T.run = false; T.mode = T.mode === 'focus' ? 'break' : 'focus'; T.len = 0; T.rescue = false; T.left = tTotal(); saveT(); render(); },
  pick(el) { SEL = el.dataset.sid; CHOOSE = false; if (!T.run) { T.mode = 'focus'; T.len = 0; T.rescue = false; T.left = tTotal(); saveT(); } render(); },
  /* bad day: 10 minutes of what you are closest to forgetting, instead of a zero day */
  guided() { S.guided = true; save(); render(); },
  rescue() {
    if (timerActive() && !(T.mode === 'focus' && !T.run && T.rescue)) return toast('Finish or end the set you are on first.');
    T = { mode: 'focus', left: 600, run: true, end: Date.now() + 600000, sid: null, len: 600, rescue: true }; DR = null; saveT(); go('home');
  },
  choose() { CHOOSE = !CHOOSE; render(); },
  atMore() { AT_MORE = !AT_MORE; render(); },
  wbSkip() { S.tc = S.tc || {}; S.tc.wb = { d: dkey(), skip: true }; save(); render(); },
  subjTab(el) { SUBJ_TAB[SUBJ_SEL] = el.dataset.k; render(); },
  gapPick() { GAP_PICK = !GAP_PICK; render(); },
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
    if (DR.q.kind === 'def') {
      if (!DRAFT.dr.trim()) { toast('Write your definition first, or tap Show me'); $('#ans')?.focus(); return; }
      DR.ticks = LEARN.defTicks(DR.q, DRAFT.dr); DR.state = 'mark'; render({ focus: '#nextq' }); return;
    }
    const res = LEARN.check(DR.q, DRAFT.dr);
    if (!res.valid) { toast(res.msg || 'Type an answer'); $('#ans')?.focus(); return; }
    finishAnswer(res);
  },
  defDone() {
    if (!DR || DR.state !== 'mark') return;
    const n = DR.ticks.filter(Boolean).length, all = DR.q.points.length;
    finishAnswer({ valid: true, ok: n === all, msg: n === all ? '' : `${n} of ${all} key points. Learn the model answer word for word.` });
  },
  reveal() {
    if (!DR || DR.state !== 'ask') return; record(DR.q.id, false, DR.q.key); countAns(); queueBack(); DR.run = 0; DR.state = 'shown'; render({ focus: '#nextq' });
    SFX.play('reveal');
    /* Show me plays the board straight away when the demo is fully checked; the written method stays underneath */
    const d = typeof DEMO !== 'undefined' && DEMO.build(DR.q);
    if (d && d.ok && d.source === 'verified') playBoard(d, true);
  },
  board(el) { const d = BOARD_Q.get(el.dataset.k); if (d) playBoard(d, !!(el.dataset.sim && DR && DR.q)); },
  daily() {
    if (dailyDoneToday()) { toast('You have done today\'s five. New ones tomorrow.'); return; }
    startDrill('maths', null, 'daily'); DR.dq = dailyQs(); DR.count = 0; nextQ(); go('drill', '#ans');
  },
  frSort(el) { FR_SORT = el.dataset.k; render(); },
  frShare() { FRIENDS.share(); },
  async frCopy() { const c = FRIENDS.code(); try { await navigator.clipboard.writeText(c); toast('Code copied'); } catch (e) { prompt('Copy your code:', c); } },
  frAdd() {
    const got = FRIENDS.parse(DRAFT.fr || '');
    if (!got.length) { toast('No friend code found in that. Paste the whole link or code.'); return; }
    const n = FRIENDS.add(got); DRAFT.fr = ''; toast(n ? `${n} ${n === 1 ? 'friend' : 'friends'} added or updated` : 'Nothing new in that code'); render();
  },
  frDel(el) { const f = S.friends.find(x => x.i === el.dataset.i); if (f && confirm(`Remove ${f.n}?`)) { S.friends = S.friends.filter(x => x !== f); save(); render(); } },
  /* worked example first: your own question appears straight away and the example plays beside it (desk) or over it (phone) */
  exWatch() { if (!DR || !DR.ex) return; const d = DR.ex; DR.state = 'ask'; render({ focus: '#ans' }); playBoard(d, false, 'Worked example'); },
  exSkip() { if (!DR) return; DR.state = 'ask'; DR.ex = null; render({ focus: DR.q && DR.q.kind === 'mcq' ? '#opt0' : '#ans' }); },
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
  theme(el) { const t = THEMES.find(x => x[0] === el.dataset.v); if (!t) return; S.theme = t[0]; save(); applyTheme(); render(); toast(t[1] + ' highlighter'); },
  mode(el) { const m = MODES.find(x => x[0] === el.dataset.v); if (!m) return; S.mode = m[0]; save(); applyTheme(); render(); toast('Page: ' + m[1]); },
  sound(el) { S.sound = el.dataset.v; save(); SFX.setLevel(S.sound); SFX.play('correct'); render(); },
  motion(el) { S.motion = el.dataset.v; S.motionHint = true; save(); applyMotion(); render({ enter: true }); if (!REDUCED) toast('Full motion on', 'big'); },
  achCat(el) { ACH_CAT = el.dataset.k; render(); },
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
  flip(el) { SFX.play('flip'); CD.flip = !CD.flip; el.classList.toggle('flipped', CD.flip); const r = $('#rate'); if (r) r.hidden = !CD.flip; },
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
  planReset() { if (!confirm('Rebuild your week from your set-up? Past ticks are kept.')) return; S.plan = S.me ? ME.buildPlan(S.me) : makePlan(); save(); render(); },
  saveGrades() {
    for (const s of SUBJ) { const g = DRAFT.grades[s]; S.grades[s] = { cur: str(g.cur, 8).trim(), tgt: str(g.tgt, 8).trim(), pct: g.pct === '' ? '' : String(clamp(Math.round(+g.pct || 0), 0, 100)) }; }
    DRAFT.grades = null; save(); toast('Grades saved on this device'); render();
  },
  /* exp (backup) lives in plus.js: share sheet on phones, download elsewhere */

  reset() {
    if (!confirm('Wipe ALL progress on this device? Download a backup first.')) return;
    try { [K, OLD, TK, TABK].forEach(k => localStorage.removeItem(k)); } catch (e) {}
    location.reload();
  }
};
const CHG = {
  defTick(el) { if (DR && DR.state === 'mark') { DR.ticks[+el.dataset.i] = el.checked; render(); } },
  exTick(el) { const E = S.exam; if (E) { E.got[E.i][+el.dataset.j] = el.checked; E.marked[E.i] = true; save(); render(); } },
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

Object.assign(ACT, EXACT, MPACT, STUDYACT, PLUSACT);
CHG.sessTick = STUDYACT.sessTick; /* checkbox: arrives as a change event, not a click */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.matches('input, select, textarea') || el.disabled) return;
  if (ACT[el.dataset.act]) runAct(el.dataset.act, el, e);
});
document.addEventListener('change', e => { const el = e.target, f = el.dataset && CHG[el.dataset.act]; if (f) { withUndo(el.dataset.act, () => f(el)); checkAch(); } });
document.addEventListener('input', e => { const el = e.target; if (el.dataset && el.dataset.draft) setPath(DRAFT, el.dataset.draft, el.value); });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'mpans') { e.preventDefault(); $('#view .exq .btn.primary')?.click(); return; }
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) { e.preventDefault(); ACT.check(); checkAch(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input, textarea, select')) return;
  if (DR && ['drill', 'home', 'guide'].includes(TAB) && DR.q) {
    if (DR.state === 'ask' && DR.q.kind === 'mcq' && /^[1-4]$/.test(e.key)) { $(`[data-act="mcq"][data-i="${+e.key - 1}"]`)?.click(); return; }
    if (DR.state !== 'ask' && DR.state !== 'mark' && e.key === 'Enter' && !e.target.closest('button')) { ACT.next(); return; }
  }
  if (TAB === 'cards') {
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); $('.flash')?.click(); }
    else if (CD.flip && (e.key === '1' || e.key === '2')) $(`#rate [data-ok="${e.key === '2' ? 1 : 0}"]`)?.click();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  timerTick(); if (dkey() !== renderedDay) render();
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
document.addEventListener('touchstart', () => {}, { passive: true }); /* iPhones only show the press-in on buttons (:active) when the page listens for touches */
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { movePill(false); if (TAB === 'papers') drawChart(); }, 120); });
setInterval(() => { timerTick(); if (dkey() !== renderedDay) render(); }, 250);

applyMotion(); applyTheme(); SFX.setLevel(S.sound);
/* intro */
(function intro() {
  const i = $('#intro'); if (!i) return;
  const end = () => { if (!i.isConnected) return; i.classList.add('out'); setTimeout(() => i.remove(), 600); };
  const w = $('#welcome'), name = S.profile.name;
  if (w) { w.querySelector('.w1').textContent = name ? `Welcome back, ${name}` : 'Welcome to Archeron'; w.querySelector('.w2').textContent = lifeSets() ? `${lifeSets()} set${lifeSets() === 1 ? '' : 's'} done · ${Math.max(0, daysToMocks())} days to mocks` : 'Your mocks start here'; }
  if (REDUCED || document.documentElement.classList.contains('no-intro')) { i.remove(); return; } /* the full intro plays on the first open of the day */
  i.addEventListener('click', end); setTimeout(end, 4000);
})();

applyMotion();
applyTheme();
FXS.init();
if (S.achV !== 2) { S.ach = {}; S.achV = 2; save(); } /* tiers got harder: recount once, silently */
checkAch(true);
render({ enter: true });
ME.start(); FRIENDS.boot();
if (T.run && T.end <= Date.now()) timerDone();
if (bootNote) setTimeout(() => toast(bootNote), 600);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  /* when a new version takes over, reload once so the update shows immediately (never mid-set) */
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    if (performance.now() < 6000 && !T.run) { reloading = true; try { sessionStorage.setItem('archeron-beta-updated', '1'); } catch (e) {} location.reload(); } /* just opened: update straight away */
    else showUpdate(); /* in the middle of something: ask instead */
  });
  navigator.serviceWorker.register('sw.js').then(reg => {
    const check = () => reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    setInterval(check, 30 * 60e3);
  }).catch(() => {});
  try { if (sessionStorage.getItem('archeron-beta-updated')) { sessionStorage.removeItem('archeron-beta-updated'); setTimeout(() => toast('Archeron updated to the latest version'), 1200); } } catch (e) {}
}
window.ARCHERON_OK = true;
