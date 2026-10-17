/* Archeron · The board: plays a checked DEMO one line at a time, like a teacher writing it up.
   Each character is a CSS animation with its own delay (no rAF), so it stays smooth on phones and
   pauses exactly with animation-play-state. Speed is a per-device convenience in localStorage. */
'use strict';
const BOARD = (() => {
  const SPEEDS = [['Slow', 1.5], ['Steady', 1], ['Quick', .55]], CH = 58, SAY = 420, HOLD = 900;
  const KEY = 'archeron-board-speed';
  let D = null, i = 0, playing = false, timer = 0, t0 = 0, dur = 0, left = 0, ended = false, tryFirst = false, waiting = false;
  let root = null, opts = {}, back = null, sp = 1;
  try { const s = localStorage.getItem(KEY); if (s !== null && +s >= 0 && +s < SPEEDS.length) sp = +s; } catch (e) {}
  const reduced = () => document.documentElement.classList.contains('rm');
  const k = () => SPEEDS[sp][1];
  const el = (tag, cls, ...kids) => { const e = document.createElement(tag); if (cls) e.className = cls; for (const c of kids.flat()) if (c != null && c !== false) e.append(c); return e; };
  const btn = (label, act, cls = '', aria) => { const b = el('button', 'btn ' + cls, label); b.type = 'button'; b.dataset.bd = act; if (aria) b.setAttribute('aria-label', aria); return b; };

  /* math markup → plain text for screen readers, and timed units for the pen */
  const plain = s => s.replace(/\[\[|\]\]/g, '').replace(/\{([^{}/]+)\/([^{}]+)\}/g, '$1/$2');
  function ink(s, start, animate) {
    const out = el('span', 'bm'), per = CH * k();
    let t = start, hi = false, word = null;
    const unit = (node, w) => { if (animate) { node.style.setProperty('--d', Math.round(t) + 'ms'); t += w; } if (hi) node.classList.add('hl'); return node; };
    const flush = () => { if (word) { out.append(word); word = null; } };
    const char = c => { if (c === ' ') { flush(); out.append(hi ? el('span', 'hl', ' ') : ' '); t += per * .35; return; } if (!word) word = el('span', 'bw'); word.append(unit(el('span', 'bc', c), per)); };
    const re = /\[\[|\]\]|\{([^{}/]+)\/([^{}]+)\}|./gsu;
    for (const m of s.matchAll(re)) {
      if (m[0] === '[[') { hi = true; continue; } if (m[0] === ']]') { hi = false; continue; }
      if (m[1] != null) {
        if (!word) word = el('span', 'bw');
        const f = el('span', 'bf'), top = el('span', 'bn'), bar = unit(el('span', 'bb'), per), bot = el('span', 'bdn');
        for (const c of m[1].replace(/\[\[|\]\]/g, '')) top.append(unit(el('span', 'bc', c), per * .8));
        for (const c of m[2].replace(/\[\[|\]\]/g, '')) bot.append(unit(el('span', 'bc', c), per * .8));
        if (/\[\[/.test(m[0])) f.classList.add('hl');
        f.append(top, bar, bot); word.append(f); continue;
      }
      char(m[0]);
    }
    flush();
    out.setAttribute('aria-label', plain(s)); out.setAttribute('role', 'img');
    return [out, t - start];
  }
  function table(rows, start, animate) {
    const tb = el('table', 'bt'), head = el('tr', null, el('th', null, 'Atom'), el('th', null, 'Left'), el('th', null, 'Right'), el('th', null, ''));
    tb.append(el('thead', null, head));
    const body = el('tbody');
    rows.forEach(([e, l, r], j) => { const tr = el('tr', l === r ? 'eq' : 'ne', el('td', null, e), el('td', null, String(l)), el('td', null, String(r)), el('td', null, l === r ? '✓' : '≠'));
      if (animate) tr.style.setProperty('--d', Math.round(start + j * 180 * k()) + 'ms'); body.append(tr); });
    tb.append(body);
    return [tb, rows.length * 180 * k() + 300];
  }
  /* right-angled triangle; the sides draw themselves, labels fade in after */
  function tri(lab, start, animate) {
    const NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 240 150'); s.setAttribute('class', 'btri'); s.setAttribute('role', 'img');
    s.setAttribute('aria-label', `Right-angled triangle. Shorter sides ${lab.a} and ${lab.b}, hypotenuse ${lab.c}.`);
    const P = (d, cls, j) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', cls); p.setAttribute('pathLength', '1'); if (animate) p.style.setProperty('--d', Math.round(start + j * 380 * k()) + 'ms'); s.append(p); };
    P('M40 120 H200', 'ts', 0); P('M40 120 V24', 'ts', 1); P('M40 24 L200 120', 'ts hyp', 2); P('M40 106 H54 V120', 'ts ra', 3);
    const T = (x, y, txt, j, cls = '') => { const t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('class', 'tl ' + cls); t.textContent = txt; if (animate) t.style.setProperty('--d', Math.round(start + (4 + j) * 300 * k()) + 'ms'); s.append(t); };
    T(120, 142, 'a = ' + lab.a, 0); T(10, 76, 'b', 1); T(14, 92, lab.b, 1, 'sm'); T(132, 62, 'c = ' + lab.c, 2, 'hy');
    return [s, 7 * 300 * k()];
  }

  function line(L, j, animate) {
    const row = el('div', 'bl' + (L.kind ? ' k-' + L.kind : '') + (animate ? ' live' : ''));
    let t = 0; const R = reduced(), go = animate && !R;
    if (L.say) { const s = el('p', 'bs', L.say); if (go) s.style.setProperty('--d', '0ms'); row.append(s); t += SAY * k(); }
    if (L.tri) { const [n, d] = tri(L.tri, t, go); row.append(n); t += d; }
    if (L.math) { const [n, d] = ink(L.math, t, go); row.append(n); t += d; }
    if (L.table) { const [n, d] = table(L.table, t, go); row.append(n); t += d; }
    if (L.why) {
      const w = el('p', 'bwhy', L.why); w.id = 'bwhy' + j; w.hidden = true;
      const b = btn('Why?', 'why', 'link xs'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', w.id);
      row.append(b, w);
    }
    return [row, R ? HOLD * k() : t + HOLD * k() * (L.kind === 'answer' ? 1.4 : 1)];
  }

  function draw(animate) {
    clearTimeout(timer); waiting = false;
    const board = root.querySelector('.bd-board'); board.textContent = '';
    for (let j = 0; j <= i; j++) { const [row, d] = line(D.lines[j], j, animate && j === i); if (j === i) { row.classList.add('now'); dur = d; } board.append(row); }
    const cur = board.lastElementChild; if (cur) cur.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    ended = i === D.lines.length - 1;
    t0 = performance.now(); left = dur;
    if (playing && !ended) timer = setTimeout(advance, dur);
    if (playing && ended) timer = setTimeout(() => { playing = false; sync(); }, dur);
    sync();
  }
  function advance() {
    if (i >= D.lines.length - 1) { playing = false; return sync(); }
    /* try-first mode: stop before each working line and let the student think */
    if (tryFirst && D.lines[i + 1].kind !== 'idea') { waiting = true; playing = false; return sync(); }
    i++; draw(true);
  }
  function sync() {
    if (!root) return;
    root.classList.toggle('paused', !playing);
    const p = root.querySelector('[data-bd="play"]');
    p.textContent = playing ? 'Pause' : ended ? 'Done' : waiting ? 'Show step' : 'Play'; p.disabled = ended && !playing;
    p.setAttribute('aria-label', playing ? 'Pause' : waiting ? 'Show the next step' : 'Play');
    root.querySelector('.bd-prog').textContent = `Step ${i + 1} of ${D.lines.length}`;
    root.querySelector('.bd-fill').style.transform = `scaleX(${(i + 1) / D.lines.length})`;
    root.querySelector('[data-bd="prev"]').disabled = i === 0;
    root.querySelector('[data-bd="next"]').disabled = ended;
    root.querySelector('[data-bd="speed"]').textContent = SPEEDS[sp][0];
    const tf = root.querySelector('[data-bd="try"]'); tf.setAttribute('aria-pressed', String(tryFirst)); tf.classList.toggle('on', tryFirst);
    root.querySelector('.bd-think').hidden = !waiting;
    root.querySelector('.bd-end').hidden = !ended || playing;
  }
  function pause() { if (!playing) return; playing = false; clearTimeout(timer); left = Math.max(0, left - (performance.now() - t0)); sync(); }
  function resume() {
    if (waiting) { waiting = false; playing = true; i++; return draw(true); }
    if (ended) return;
    playing = true; t0 = performance.now(); timer = setTimeout(advance, left); sync();
  }

  const ACT = {
    play: () => playing ? pause() : resume(),
    next: () => { if (i < D.lines.length - 1) { i++; draw(true); } },
    prev: () => { if (i > 0) { i--; draw(true); } },
    replay: () => { i = 0; playing = true; draw(true); },
    full: () => { playing = false; i = D.lines.length - 1; draw(false); },
    speed: () => { sp = (sp + 1) % SPEEDS.length; try { localStorage.setItem(KEY, String(sp)); } catch (e) {} sync(); },
    try: () => { tryFirst = !tryFirst; sync(); },
    why: b => { const w = b.nextElementSibling; w.hidden = !w.hidden; b.setAttribute('aria-expanded', String(!w.hidden)); if (!w.hidden) pause(); },
    close: () => close(),
    similar: () => { const f = opts.onSimilar; close(); if (f) f(); }
  };
  function onKey(e) {
    if (!root) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); ACT.next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); ACT.prev(); }
    else if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); ACT.play(); }
    else if (e.key === 'Tab') { /* keep focus inside the board while it is open */
      const f = [...root.querySelectorAll('button:not([disabled]):not([hidden])')].filter(b => b.offsetParent), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  }

  function open(demo, o = {}) {
    if (!demo || !demo.ok) return false;
    if (root) close(true);
    D = demo; opts = o; i = 0; playing = true; ended = false; waiting = false; back = document.activeElement;
    const checked = demo.source === 'verified' ? el('span', 'bd-ok', '✓ Every step checked') : el('span', 'bd-ok soft', 'Worked steps');
    if (demo.source === 'verified') checked.title = demo.checks.map(c => c[0]).join(' · ');
    root = el('div', 'bd-scrim',
      el('section', 'bd',
        el('header', 'bd-top', el('div', null, el('p', 'bd-kick', demo.subject ? demo.subject + ' · ' + demo.topic : demo.topic), checked), btn('✕', 'close', 'ghost icon-only', 'Close the board')),
        el('p', 'bd-q', demo.question),
        el('div', 'bd-board'),
        el('div', 'bd-think', el('p', null, 'What would you write next? Have a go in your head or on paper, then tap Show step.')),
        el('div', 'bd-end', el('p', null, 'Now try one on your own.'), el('div', 'row', o.onSimilar && btn('Try a similar one', 'similar', 'primary'), btn('Watch again', 'replay', 'ghost'), btn('Close', 'close', 'ghost'))),
        el('footer', 'bd-bar',
          el('div', 'bd-meter', el('span', 'bd-fill'), el('span', 'bd-prog')),
          el('div', 'bd-ctl', btn('‹', 'prev', 'ghost icon-only', 'Previous step'), btn('Play', 'play', 'primary'), btn('›', 'next', 'ghost icon-only', 'Next step'),
            btn('↺', 'replay', 'ghost icon-only', 'Replay from the start'), btn('Steady', 'speed', 'ghost', 'Change speed'), btn('Show all', 'full', 'ghost'), btn('Let me try first', 'try', 'ghost')))));
    const sec = root.querySelector('.bd');
    sec.setAttribute('role', 'dialog'); sec.setAttribute('aria-modal', 'true'); sec.setAttribute('aria-label', 'Worked on the board: ' + demo.topic);
    root.querySelector('.bd-board').setAttribute('aria-live', 'polite');
    root.addEventListener('click', e => { if (e.target === root) return close(); const b = e.target.closest('[data-bd]'); if (b && !b.disabled) ACT[b.dataset.bd](b); });
    document.addEventListener('keydown', onKey, true);
    document.body.append(root); document.documentElement.classList.add('bd-open');
    draw(true);
    root.querySelector('[data-bd="play"]').focus({ preventScroll: true });
    return true;
  }
  function close(silent) {
    if (!root) return;
    clearTimeout(timer); document.removeEventListener('keydown', onKey, true);
    root.remove(); root = null; D = null; playing = false; document.documentElement.classList.remove('bd-open');
    if (!silent && back && back.isConnected) back.focus({ preventScroll: true });
  }

  /* Run from the console: drives a real board through every control and checks what is on screen. */
  function selfTest() {
    const demo = { topic: 'Self-test', subject: '', question: 'Test', source: 'verified', ok: true, checks: [['ok', true]],
      lines: [{ kind: 'q', math: '3x + 5 = 20' }, { say: 'Subtract 5', math: '3x + 5[[ − 5]] = 20[[ − 5]]', why: 'Balance' }, { math: '{15/3}' }, { kind: 'answer', math: 'x = 5' }] };
    const res = [], cnt = () => root.querySelectorAll('.bl').length, T = (name, v) => res.push([name, !!v]);
    open(demo); T('opens on step 1', cnt() === 1);
    ACT.next(); T('next shows step 2', cnt() === 2);
    T('highlight marks the change', root.querySelectorAll('.bl.now .bc.hl').length === 4);
    T('screen reader text is plain', root.querySelector('.bl.now .bm').getAttribute('aria-label') === '3x + 5 − 5 = 20 − 5');
    ACT.prev(); T('prev goes back', cnt() === 1);
    ACT.full(); T('show all shows every step', cnt() === 4 && ended && !playing);
    T('fraction is stacked', !!root.querySelector('.bf .bn') && root.querySelector('.bf .bn').textContent === '15');
    ACT.replay(); T('replay restarts', cnt() === 1 && playing);
    ACT.play(); T('pause stops', !playing && root.classList.contains('paused'));
    ACT.play(); T('play resumes', playing);
    const s0 = sp; ACT.speed(); T('speed changes', sp !== s0); sp = s0; try { localStorage.setItem(KEY, String(sp)); } catch (e) {}
    tryFirst = true; playing = true; advance(); T('try-first waits before the next step', waiting && cnt() === 1); ACT.play(); T('show step continues', cnt() === 2); tryFirst = false;
    T('bad demos are refused', open({ ...demo, ok: false }) === false);
    close(); T('closes cleanly', !document.querySelector('.bd-scrim'));
    return { passed: res.filter(r => r[1]).length, failed: res.filter(r => !r[1]).map(r => r[0]) };
  }
  return { open, close, selfTest, isOpen: () => !!root };
})();
