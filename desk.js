/* Archeron · computer extras: exam hall mode, the Today side panel, keyboard shortcuts and printable papers.
   Loaded after plus.js and before app.js; everything here runs at click or render time. The phone layout is untouched. */
'use strict';
const isDesk = () => matchMedia('(min-width: 1100px)').matches;
const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

/* ---------- Exam hall: full screen, nothing but the paper and the clock, inside an animated exam hall ---------- */
let HALL = false;
const hallTimes = () => { const E = S.exam, p = E && paperOf(E.pid); if (!E || !E.end || !p) return ['--:--', '--:--']; return [hhmm(E.end - p.mins * 60000), hhmm(E.end)]; };
/* the hall, seen from your seat at the back: rows of students writing, an invigilator, the clock and the start/finish board, your own desk and pen */
function hallSvg(still) {
  const W = 1200, H = 640, [start, finish] = hallTimes(), now = new Date();
  const anim = (a) => still ? '' : a;
  const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  let s = `<svg class="hall-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="hw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d1b24"/><stop offset="1" stop-color="#141219"/></linearGradient>
    <linearGradient id="hf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26232c"/><stop offset="1" stop-color="#0c0b10"/></linearGradient>
    <radialGradient id="hl" cx=".5" cy="0" r=".8"><stop offset="0" stop-color="rgba(255,236,196,.20)"/><stop offset="1" stop-color="rgba(255,236,196,0)"/></radialGradient>
    <linearGradient id="hd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a2f"/><stop offset="1" stop-color="#3e2a1b"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="262" fill="url(#hw)"/><rect y="262" width="${W}" height="${H - 262}" fill="url(#hf)"/>`;
  for (let i = -9; i <= 9; i++) s += `<line x1="600" y1="262" x2="${600 + i * 150}" y2="${H}" stroke="rgba(255,255,255,.035)"/>`;
  for (const x of [220, 600, 980]) s += `<ellipse cx="${x}" cy="0" rx="260" ry="190" fill="url(#hl)"/>`;
  /* the board with start and finish times, like every real exam room */
  s += `<rect x="420" y="58" width="360" height="136" rx="6" fill="#ece8dc"/><rect x="420" y="58" width="360" height="136" rx="6" fill="none" stroke="#8a8578" stroke-width="3"/>
    <text x="600" y="94" text-anchor="middle" font-size="19" fill="#34323b" font-family="Georgia,serif">Mock examinations</text>
    <text x="600" y="134" text-anchor="middle" font-size="28" fill="#1f1e26" font-family="Georgia,serif" font-weight="bold">Start ${start} · Finish ${finish}</text>
    <text x="600" y="170" text-anchor="middle" font-size="14" fill="#5d5a52" font-family="Georgia,serif">Phones off and in your bag · Silence in the hall</text>`;
  /* the wall clock keeps real time */
  const hA = (now.getHours() % 12 + now.getMinutes() / 60) * 30, mA = now.getMinutes() * 6 + now.getSeconds() / 10, sA = now.getSeconds() * 6;
  s += `<g transform="translate(232 124)"><circle r="50" fill="#f4f1e8" stroke="#2f2d36" stroke-width="6"/>`;
  for (let i = 0; i < 12; i++) s += `<line x1="0" y1="-41" x2="0" y2="${i % 3 ? -36 : -32}" stroke="#2f2d36" stroke-width="${i % 3 ? 2 : 3.5}" transform="rotate(${i * 30})"/>`;
  s += `<line y2="-24" stroke="#2f2d36" stroke-width="5" stroke-linecap="round" transform="rotate(${hA})"/>
    <line y2="-36" stroke="#2f2d36" stroke-width="3.5" stroke-linecap="round" transform="rotate(${mA})">${anim(`<animateTransform attributeName="transform" type="rotate" from="${mA}" to="${mA + 360}" dur="3600s" repeatCount="indefinite"/>`)}</line>
    <line y1="8" y2="-40" stroke="#c0392b" stroke-width="1.6" transform="rotate(${sA})">${anim(`<animateTransform attributeName="transform" type="rotate" from="${sA}" to="${sA + 360}" dur="60s" repeatCount="indefinite"/>`)}</line><circle r="3.5" fill="#c0392b"/></g>`;
  s += `<rect x="900" y="70" width="180" height="120" rx="4" fill="#2a2833"/><rect x="908" y="78" width="164" height="104" fill="#3b4a63" opacity=".55"/><line x1="990" y1="78" x2="990" y2="182" stroke="#2a2833" stroke-width="5"/>`;
  /* the invigilator walks the front of the hall */
  s += `<g>${anim('<animateTransform attributeName="transform" type="translate" values="0 0;420 0;420 0;0 0;0 0" keyTimes="0;.42;.5;.92;1" dur="46s" repeatCount="indefinite"/>')}
    <g transform="translate(330 214) scale(.62)"><rect x="-18" y="18" width="36" height="74" rx="14" fill="#2c3240"/><circle r="16" cy="4" fill="#c99a76"/><path d="M-16 -2 Q0 -22 16 -2 Z" fill="#3a2b22"/>
    <rect x="-14" y="88" width="10" height="34" fill="#1f232c"/><rect x="4" y="88" width="10" height="34" fill="#1f232c"/></g></g>`;
  /* rows of students from behind, each writing at their own pace */
  const rows = [[292, .42, 8], [338, .55, 7], [400, .72, 6], [484, .95, 5]], hair = ['#1c1410', '#3a2618', '#5b3a1f', '#0f0d0c', '#7a5230', '#2b2522'], top = ['#2e3a52', '#3b2f45', '#2f4038', '#47342b', '#30323b'];
  rows.forEach(([y, k, n], r) => {
    const span = 1040 * (0.62 + k * .38), x0 = 600 - span / 2, gap = span / (n - 1);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * gap, id = r * 10 + i, dur = (0.7 + rnd(id, 1) * .9).toFixed(2), beg = (rnd(id, 2) * 2).toFixed(2), arm = rnd(id, 3) > .5 ? 1 : -1;
      if (Math.abs(x - 600) < 60 && r === 3) continue; /* your seat looks between the two in front */
      s += `<g transform="translate(${x.toFixed(1)} ${y}) scale(${k})">
        <rect x="-62" y="34" width="124" height="16" rx="3" fill="url(#hd)"/>
        <path d="M-34 52 Q-36 8 0 4 Q36 8 34 52 Z" fill="${top[id % top.length]}"/>
        <g>${anim(`<animateTransform attributeName="transform" type="rotate" values="${-3 * arm} ${20 * arm} 14;${5 * arm} ${20 * arm} 14;${-3 * arm} ${20 * arm} 14" dur="${dur}s" begin="${beg}s" repeatCount="indefinite"/>`)}
          <path d="M${20 * arm} 14 Q${40 * arm} 26 ${30 * arm} 40" stroke="${top[id % top.length]}" stroke-width="13" fill="none" stroke-linecap="round"/></g>
        <circle cy="-8" r="17" fill="${hair[id % hair.length]}"/><rect x="-6" y="6" width="12" height="6" fill="#b88763" opacity=".8"/></g>`;
    }
  });
  /* your desk: the paper and your pen, writing line after line */
  s += `<path d="M180 640 L300 548 L900 548 L1020 640 Z" fill="url(#hd)"/><path d="M180 640 L300 548 L900 548 L1020 640" fill="none" stroke="#7d5a3b" stroke-width="3"/>
    <g transform="translate(600 600) rotate(-3)"><rect x="-170" y="-46" width="340" height="120" fill="#f5f2ea"/>
    <text x="-158" y="-28" font-size="10" fill="#8b877c" font-family="Georgia,serif">01.1  Answer all questions in the spaces provided.</text>`;
  const L = [[-150, -10, 140], [-150, 8, 120], [-150, 26, 150]];
  L.forEach(([x, y, w], i) => {
    s += `<line x1="${x}" y1="${y}" x2="${x + 300}" y2="${y}" stroke="#d5d0c4" stroke-width="1"/>
      <path d="M${x} ${y - 3} q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" transform="scale(${(w / 144).toFixed(2)} 1)" transform-origin="${x} ${y}" fill="none" stroke="#1d2a55" stroke-width="1.6" stroke-dasharray="200" stroke-dashoffset="${still ? 0 : 200}">
      ${anim(`<animate attributeName="stroke-dashoffset" values="200;200;0;0" keyTimes="0;${(i / 3).toFixed(3)};${((i + 1) / 3).toFixed(3)};1" dur="9s" repeatCount="indefinite"/>`)}</path>`;
  });
  s += `<g>${anim(`<animateTransform attributeName="transform" type="translate" values="-150 -12;-10 -12;-150 6;-30 6;-150 24;0 24;-150 -12" keyTimes="0;.32;.335;.65;.665;.98;1" dur="9s" repeatCount="indefinite"/>`)}
      <g>${anim('<animateTransform attributeName="transform" type="rotate" values="-6;6;-6" dur=".35s" repeatCount="indefinite"/>')}
      <ellipse cx="22" cy="30" rx="26" ry="16" fill="#b9845e"/><rect x="-2" y="-24" width="4" height="44" rx="2" fill="#20263a" transform="rotate(28)"/></g></g></g>`;
  s += `<rect width="${W}" height="${H}" fill="url(#hl)" opacity=".25"/></svg>`;
  return s;
}
function hallEnter() {
  if (!S.exam || TAB !== 'examq' || HALL) return;
  HALL = true; document.body.classList.add('hall');
  const bg = h('div', { id: 'hall-bg', 'aria-hidden': 'true' }); bg.innerHTML = hallSvg(REDUCED); document.body.prepend(bg);
  try { const f = document.documentElement.requestFullscreen; if (f) document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {}
  const p = paperOf(S.exam.pid), [start, finish] = hallTimes();
  const intro = h('div', { id: 'hall-intro', role: 'dialog', 'aria-label': 'Exam hall', 'data-act': 'hallIn' },
    h('div', { class: 'hi-scene', 'aria-hidden': 'true' }),
    h('div', { class: 'hi-txt' }, h('p', { class: 'eyebrow' }, 'Exam hall'), h('h1', null, p ? p.name.replace(/^PPP /, '') : 'Your paper'),
      h('p', { class: 'hi-time' }, S.exam.end ? `Start ${start} · Finish ${finish}` : 'Untimed'), h('p', { class: 'hi-go' }, 'You may now turn over your paper.'), h('small', null, 'Click anywhere to begin · Esc leaves the hall')));
  intro.firstChild.innerHTML = hallSvg(REDUCED); document.body.append(intro);
  setTimeout(() => intro.classList.add('go'), REDUCED ? 0 : 1800);
  setTimeout(hallIn, REDUCED ? 1200 : 5200);
  render();
}
function hallIn() { const i = document.getElementById('hall-intro'); if (!i) return; i.classList.add('out'); setTimeout(() => i.remove(), 700); }
function hallExit() {
  if (!HALL) return; HALL = false; document.body.classList.remove('hall');
  for (const id of ['hall-bg', 'hall-intro']) document.getElementById(id)?.remove();
  try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (e) {}
  render();
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && HALL) hallExit(); }); /* Esc in full screen is handled by the browser first */
const hallBtn = () => isDesk() && TAB === 'examq' && S.exam && B([icon('flame'), HALL ? 'Leave the exam hall' : 'Exam hall (F)'], HALL ? 'hallOut' : 'hallGo', 'ghost sm');

/* ---------- Study desk: on a computer a set is three columns: session | question | board and notes ---------- */
const deskMode = () => isDesk() && !HALL;
function deskWorking(M, title, meta) {
  const list = todayTrain(), cur = T.sid;
  return h('div', { class: 'desk' },
    h('aside', { class: 'card desk-s', 'aria-label': 'This set' },
      h('div', { class: 'ds-timer' }, ringEl(true), h('div', null, h('p', { class: 'eyebrow' }, T.run ? 'In the zone' : 'Paused'), h('b', null, title), h('small', null, meta))),
      h('div', { class: 'row' }, B(T.run ? [icon('pause'), 'Pause'] : [icon('play'), 'Resume'], 'tgl', 'primary sm'), B('End', 'rst', 'ghost sm')),
      h('div', { class: 'ds-m' }, h('p', { class: 'eyebrow' }, 'Your mission'), h('h2', null, M.title), M.swap && h('p', { class: 'm-swap' }, M.swap), h('ol', { class: 'm-steps' }, M.steps.map(s => h('li', null, s)))),
      list.length > 0 && h('div', { class: 'ds-up' }, h('p', { class: 'eyebrow' }, 'Today'),
        h('ul', { class: 'sd-sets' }, list.map(x => h('li', { class: (x.left ? '' : 'done') + (x.s.id === cur ? ' now' : '') }, h('span', null, x.s.id === cur ? setTitle(x.s.label) : x.s.label), h('small', null, `${x.c}/${x.n}`)))))),
    h('section', { class: 'card desk-q' }, missionPanel(M)));
}
/* The dock lives outside #view, so the board keeps playing while the question re-renders around it. */
let DOCK_Q = null, dockSaveT = 0;
function paintDock() {
  const want = deskMode() && !!document.querySelector('#view .qcard');
  let el = document.getElementById('dock');
  document.body.classList.toggle('has-dock', want);
  if (!want) { if (BOARD.isInline()) BOARD.close(true); el?.remove(); DOCK_Q = null; return; }
  if (!el) { el = h('aside', { id: 'dock', 'aria-label': 'Board and notes' }, h('div', { class: 'dock-board' }), h('section', { class: 'card dock-notes' })); document.body.append(el); }
  const q = DR && DR.q, t = q ? q.id : null;
  if (q !== DOCK_Q && BOARD.isInline()) BOARD.close(true); /* a new question clears the old worked solution */
  DOCK_Q = q;
  if (!BOARD.isInline()) {
    const mis = t ? S.mistakes.filter(m => !m.fixed && m.topic === LEARN.name(t)).slice(-3).reverse() : [];
    el.querySelector('.dock-board').replaceChildren(h('section', { class: 'card dock-empty' },
      h('div', { class: 'card-h' }, h('h2', null, 'The board'), h('span', { class: 'muted' }, 'worked solutions play here')),
      h('p', { class: 'muted' }, 'Stuck? Press Show me and the method is written out here, step by step, while your question stays where it is.'),
      mis.length > 0 && [h('p', { class: 'eyebrow' }, 'Your recent mistakes on this topic'), h('ul', { class: 'dock-mis' }, mis.map(m => h('li', null, m.note)))]));
  }
  const notes = el.querySelector('.dock-notes');
  if (notes.dataset.t !== (t || '')) {
    notes.dataset.t = t || '';
    const ta = h('textarea', { id: 'tnote', rows: '5', placeholder: t ? 'Your notes for this topic: rules, tricks, what you keep forgetting…' : 'Notes appear here for the topic you are on.', 'aria-label': 'Notes for this topic', disabled: !t, value: t ? S.tnotes[t] || '' : '' });
    ta.addEventListener('input', () => { const v = ta.value.slice(0, 4000); if (v.trim()) S.tnotes[t] = v; else delete S.tnotes[t]; clearTimeout(dockSaveT); dockSaveT = setTimeout(save, 500); });
    notes.replaceChildren(h('div', { class: 'card-h' }, h('h2', null, 'Notes'), h('span', { class: 'muted' }, t ? LEARN.name(t) : '')), ta, h('small', { class: 'muted' }, 'Saved on this device with your progress.'));
  }
}
/* Show me on the desk plays in the dock; on a phone it is a pop-up */
function playBoard(d, similar) {
  const m = document.querySelector('#dock .dock-board');
  return BOARD.open(d, { mount: m, onSimilar: similar ? () => runAct('similar') : null, onClose: m ? () => paintDock() : null });
}

/* ---------- Today panel: timer, today's sets and what is next, on every page of a wide screen ---------- */
function paintSide() {
  if (HALL && TAB !== 'examq') { hallExit(); return; } /* leaving the paper leaves the hall */
  paintDock();
  let el = document.getElementById('side');
  /* the dock and the desk's own session column replace the Today panel, so the timer is never on screen twice */
  const want = !HALL && matchMedia('(min-width: 1360px)').matches && !document.body.classList.contains('has-dock') && !document.querySelector('#view .desk');
  document.body.classList.toggle('has-side', want);
  if (!want) { el?.remove(); return; }
  if (!el) { el = h('aside', { id: 'side', 'aria-label': 'Today' }); document.body.append(el); }
  const list = todayTrain(), cur = currentSid(), item = list.find(x => x.s.id === cur), act = timerActive(), done = setsOn(dkey());
  const status = !act ? 'Ready' : T.mode === 'break' ? (T.run ? 'Resting' : 'Rest paused') : T.run ? (T.rescue ? 'Rescue set' : 'Focusing') : 'Paused';
  el.replaceChildren(
    h('p', { class: 'eyebrow' }, `${DAYFULL[new Date().getDay()]} ${fmtDate(dkey())}`),
    h('div', { class: 'sd-timer' + (act && T.run ? ' live' : '') }, h('b', { id: 'st' }, fmt(Math.ceil(T.left))), h('small', null, status),
      h('div', { class: 'row' }, act ? [B(T.run ? icon('pause') : icon('play'), 'tgl', 'primary icon-only', { 'aria-label': T.run ? 'Pause' : 'Resume' }), B('End', 'rst', 'ghost sm')]
        : B([icon('play'), 'Begin'], 'sideBegin', 'primary sm'))),
    h('div', { class: 'sd-next' }, h('small', null, act && T.mode === 'focus' ? 'Now' : 'Next up'), h('b', null, act && T.rescue ? 'Rescue set' : item ? setTitle(item.s.label) : list.length ? 'Bonus set' : 'Free study')),
    list.length ? h('ul', { class: 'sd-sets' }, list.map(x => h('li', { class: x.left ? '' : 'done' }, h('span', null, x.s.id === cur && act ? setTitle(x.s.label) : x.s.label), h('small', null, `${x.c}/${x.n}`))))
      : h('p', { class: 'muted xs' }, 'No sets planned today.'),
    h('p', { class: 'muted xs' }, `${done} ${done === 1 ? 'set' : 'sets'} done today · mocks in ${daysToMocks()} days`),
    h('div', { class: 'sd-links' }, B("Today's plan", 'go', 'link', { 'data-tab': 'today' }), !act && B('Rescue set', 'rescue', 'link'), B('Shortcuts (?)', 'keysHelp', 'link')));
}
addEventListener('resize', () => { clearTimeout(paintSide.t); paintSide.t = setTimeout(() => typeof S !== 'undefined' && paintSide(), 150); });

/* ---------- keyboard ---------- */
const KEYS = [['Enter', 'Check your answer, then go to the next question'], ['N', 'Next question'], ['1 to 4', 'Pick a multiple-choice answer'], ['Space', 'Start or pause the timer on Focus; flip a flashcard'],
  ['← and →', 'Flashcards: again, or got it'], ['F', 'Exam hall mode on a paper'], ['Esc', 'Leave the exam hall, close this'], ['?', 'Show these shortcuts']];
function keysSheet() {
  let el = document.getElementById('keys'); if (el) { el.remove(); return; }
  el = h('div', { id: 'keys', role: 'dialog', 'aria-label': 'Keyboard shortcuts', 'data-act': 'keysHelp' }, h('div', { class: 'card' }, h('h2', null, 'Keyboard shortcuts'),
    h('ul', null, KEYS.map(([k, d]) => h('li', null, h('kbd', null, k), h('span', null, d)))), h('p', { class: 'muted xs' }, 'Esc or click anywhere to close.')));
  document.body.append(el);
}
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Escape') { if (document.getElementById('keys')) { keysSheet(); e.preventDefault(); return; } if (HALL) { hallExit(); e.preventDefault(); } return; }
  if (e.target.matches('input, textarea, select, [contenteditable]')) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key, onBtn = e.target.closest && e.target.closest('button, a');
  if (k === '?') { keysSheet(); e.preventDefault(); return; }
  if (k === 'f' && TAB === 'examq' && S.exam && isDesk()) { HALL ? hallExit() : hallEnter(); e.preventDefault(); return; }
  if (TAB === 'cards' && CD.flip && (k === 'ArrowLeft' || k === 'ArrowRight')) { $(`#rate [data-ok="${k === 'ArrowRight' ? 1 : 0}"]`)?.click(); e.preventDefault(); return; }
  if (k === ' ' && TAB === 'home' && !onBtn) { ACT.tgl(); e.preventDefault(); return; }
  if (k === 'n') { const b = $('#nextq') || $('#view .exq .row .btn.primary[data-act="exGo"]') || $('#view .exq .row .btn.primary[data-act="mpGo"]'); if (b && !b.disabled) { b.click(); e.preventDefault(); } }
});

/* ---------- printable papers: sit it with a pen, then mark it on screen ---------- */
function printPaper(p, printed) {
  const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const total = p.qs.reduce((n, q) => n + qMax(q), 0), g = groupOf(p);
  const calc = g === 'Maths' ? (/non-calculator/i.test(p.name) ? 'You must not use a calculator.' : 'You may use a calculator.') : ['Biology', 'Chemistry', 'Physics'].includes(g) ? 'You may use a calculator and a ruler.' : '';
  let out = `<section class="pp-cover"><p class="pp-brand">Archeron · practice paper</p><h1>${esc(p.subj)}</h1><h2>${esc(p.name.replace(/^PPP /, ''))}</h2>
    <table class="pp-meta"><tr><td>Time allowed</td><td>${esc(hrs(p.mins))}</td></tr><tr><td>Total marks</td><td>${total}</td></tr><tr><td>Name</td><td class="pp-fill"></td></tr><tr><td>Date</td><td class="pp-fill"></td></tr></table>
    <div class="pp-ins"><b>Instructions</b><ul><li>Use black ink or black ball-point pen.</li><li>Answer all questions in the spaces provided.</li>${calc ? `<li>${calc}</li>` : ''}<li>Show your working: you can get method marks even if your final answer is wrong.</li></ul>
    <b>Information</b><ul><li>The marks for each question are shown in brackets.</li>${printed ? '<li>When you finish, open the paper in Archeron, press Pens down and mark each part against the mark scheme.</li>' : ''}</ul></div>
    <p class="pp-note">An original practice paper in the AQA style. It is not a real AQA paper.</p></section>`;
  for (const [k, v] of Object.entries(p.src || {})) out += `<section class="pp-src"><h3>Source ${esc(k)}</h3><p class="pp-srct">${esc(v[0])}</p><div class="pp-srcx">${esc(v[1])}</div></section>`;
  out += '<section class="pp-qs">'; let sec = '';
  p.qs.forEach((q, i) => {
    const x = qX(q), m = qMax(q), a = x.auto; if (x.same) return;
    if (x.sec && x.sec !== sec) { sec = x.sec; out += `<h3 class="pp-sec">${esc(sec)}</h3>`; }
    const mcq = a && a.kind === 'mcq' ? `<ul class="pp-mcq">${a.options.map((o, k) => `<li><span class="pp-box"></span><b>${'ABCD'[k]}</b> ${esc(o)}</li>`).join('')}</ul>` : '';
    const lettered = !a && /\n[A-D]  /.test(q[1]), lines = mcq || lettered ? 0 : Math.min(30, Math.max(2, Math.round(m * (m >= 9 ? 2.4 : 1.8))));
    out += `<div class="pp-q"><p class="pp-qh"><b>${esc(x.n || i + 1)}</b> <span>${esc(q[0])}</span></p><p class="pp-qt">${esc(q[1])}</p>${mcq}${lettered ? '<p class="pp-tick">Tick one box or write the letter: ______</p>' : ''}
      ${'<div class="pp-ln"></div>'.repeat(lines)}${a && a.kind !== 'mcq' ? `<p class="pp-ans">Answer ${esc(a.pre || '')} ______________________ ${esc(a.suf || '')}</p>` : ''}<p class="pp-mk">[${m} mark${m > 1 ? 's' : ''}]</p></div>`;
  });
  out += '<p class="pp-end">END OF QUESTIONS</p></section>';
  let box = document.getElementById('print'); if (!box) { box = h('div', { id: 'print' }); document.body.append(box); }
  box.innerHTML = out; document.body.classList.add('printing');
  const done = () => { document.body.classList.remove('printing'); box.innerHTML = ''; removeEventListener('afterprint', done); };
  addEventListener('afterprint', done);
  setTimeout(() => print(), 60);
}

/* ---------- Study: the guide on the left, its questions on the right ---------- */
let GSIDE = null;
function guideSide(g) {
  if (!isDesk() || !g.topics.length) return null;
  const t = g.topics.includes(GSIDE) ? GSIDE : g.topics[0];
  if (!DR || DR.ctx !== 'gside' || DR.topic !== t) startDrill(LEARN.trackOf(t), t, 'gside');
  return h('aside', { class: 'card gside' }, h('div', { class: 'card-h' }, h('h2', null, 'Practise as you read'), h('span', { class: 'muted' }, 'fresh questions')),
    g.topics.length > 1 && h('div', { class: 'chips' }, g.topics.map(id => chip(LEARN.name(id), id === t, 'gsideTopic', { 'data-topic': id }))), drillPanel());
}

Object.assign(PLUSACT, {
  hallGo() { hallEnter(); }, hallOut() { hallExit(); }, hallIn() { hallIn(); },
  keysHelp() { keysSheet(); },
  sideBegin() { if (TAB !== 'home') go('home'); ACT.tgl(); },
  gsideTopic(el) { GSIDE = el.dataset.topic; DR = null; render(); },
  printPaper(el) { const p = paperOf(el.dataset.id); if (p) printPaper(p); },
  pppPrint(el) { if (pppStart(el.dataset.track, +el.dataset.k, true) !== false) printPaper(paperOf(S.exam.pid), true); },
  printRun() { const p = S.exam && paperOf(S.exam.pid); if (p) printPaper(p, S.exam.printed); }
});
