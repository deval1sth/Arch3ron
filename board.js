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
    /* [[...]] becomes one .hlg group, so the board can fly it in from the line above as a unit */
    let t = start, hi = false, word = null, grp = null;
    const unit = (node, w) => { if (animate) { node.style.setProperty('--d', Math.round(t) + 'ms'); t += w; } if (hi) node.classList.add('hl'); return node; };
    const flush = () => { if (word) { (grp || out).append(word); word = null; } };
    const char = c => { if (c === ' ') { flush(); (grp || out).append(hi ? el('span', 'hl', ' ') : ' '); t += per * .35; return; } if (!word) word = el('span', 'bw'); word.append(unit(el('span', 'bc', c), per)); };
    /* proper notation: any plain 3/4 is drawn as a stacked fraction (units like km/h are left alone),
       and √ gets a bar over everything it covers */
    s = s.replace(/(^|[^\w.{/])(\d+)\/(\d+)(?![\w./}])/g, '$1{$2/$3}');
    const re = /\[\[|\]\]|\{([^{}/]+)\/([^{}]+)\}|√\(([^()]+)\)|√(\d+(?:\.\d+)?)|./gsu;
    for (const m of s.matchAll(re)) {
      if (m[3] != null || m[4] != null) {
        if (!word) word = el('span', 'bw');
        const q = el('span', 'bsq', unit(el('span', 'bc', '√'), per)), inside = el('span', 'bsqi');
        for (const c of (m[3] || m[4])) inside.append(unit(el('span', 'bc', c), per));
        q.append(inside); word.append(q); continue;
      }
      if (m[0] === '[[') { flush(); hi = true; grp = el('span', 'hlg'); continue; }
      if (m[0] === ']]') { flush(); hi = false; if (grp) out.append(grp); grp = null; continue; }
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
    flush(); if (grp) out.append(grp);
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
  /* diagrams from demo.js: lines draw themselves in order, then labels and dots fade in. Big drawings
     (like lots of atoms) are sped up so a diagram never takes more than about 3 seconds at Steady. */
  function drawFig(F, start, animate) {
    const NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', `0 0 ${F.w} ${F.h}`); s.setAttribute('class', 'bfig'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', F.label);
    s.style.maxWidth = Math.min(F.w * 1.2, 460) + 'px';
    const step = Math.min(320, 3000 / F.parts.length) * k();
    let t = start;
    for (const [type, ...a] of F.parts) {
      let e;
      if (type === 'l') { e = document.createElementNS(NS, 'path'); e.setAttribute('d', a[0]); e.setAttribute('pathLength', '1'); e.setAttribute('class', 'fl ' + (a[1] || '')); }
      else if (type === 't') { e = document.createElementNS(NS, 'text'); e.setAttribute('x', a[0]); e.setAttribute('y', a[1]); e.textContent = a[2]; e.setAttribute('class', 'ft ' + (a[3] || '')); }
      else { e = document.createElementNS(NS, 'circle'); e.setAttribute('cx', a[0]); e.setAttribute('cy', a[1]); e.setAttribute('r', a[2]); e.setAttribute('class', 'fo ' + (a[3] || '')); }
      if (animate) { e.style.setProperty('--d', Math.round(t) + 'ms'); t += type === 'l' ? step : step * .45; }
      s.append(e);
    }
    return [s, animate ? t - start + 300 : 0];
  }

  function line(L, j, animate) {
    const row = el('div', 'bl' + (L.kind ? ' k-' + L.kind : '') + (animate && !reduced() ? ' live' : ''));
    let t = 0; const R = reduced(), go = animate && !R;
    /* a both-sides step: the teacher's arrows come down either side of the new line, labelled with what was done.
       The explanation goes underneath so the arrows sit right under the line above. */
    if (L.op && L.math) {
      row.classList.add('has-op');
      const arrow = side => { const a = el('span', 'bop ' + side, el('span', 'bopl', L.op)); a.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 34 46" aria-hidden="true"><path pathLength="1" d="M30 4 C6 6 4 34 26 42"/><path pathLength="1" d="M26 42 l-8 -1 M26 42 l-4 -7"/></svg>');
        if (go) a.style.setProperty('--d', '0ms'); return a; };
      t += 520 * k();
      const [n, d] = ink(L.math, t, go); t += d;
      row.append(el('span', 'bopw', arrow('l'), n, arrow('r')));
      if (L.say) { const s = el('p', 'bs after', L.say); if (go) s.style.setProperty('--d', Math.round(t) + 'ms'); row.append(s); t += SAY * k(); }
    } else {
      if (L.say) { const s = el('p', 'bs', L.say); if (go) s.style.setProperty('--d', '0ms'); row.append(s); t += SAY * k(); }
      if (L.fig) { const [n, d] = drawFig(L.fig, t, go); row.append(n); t += d; }
      if (L.math) { const [n, d] = ink(L.math, t, go); row.append(n); t += d; }
    }
    if (L.table) { const [n, d] = table(L.table, t, go); row.append(n); t += d; }
    if (L.why) {
      const w = el('p', 'bwhy', L.why); w.id = 'bwhy' + j; w.hidden = true;
      const b = btn('Why?', 'why', 'link xs'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', w.id);
      row.append(b, w);
    }
    return [row, R ? HOLD * k() : t + HOLD * k() * (L.kind === 'answer' ? 1.4 : 1)];
  }

  /* ---------- playback: rows are added and removed one at a time, never rebuilt mid-lesson ---------- */
  let anims = [];
  const boardEl = () => root.querySelector('.bd-board');
  const rowsNow = () => [...boardEl().querySelectorAll('.bl:not(.gone)')];
  const dOf = u => parseFloat(u.style.getPropertyValue('--d')) || 0;
  function stopAnims() { anims.forEach(a => a.cancel()); anims = []; sfx('stopPen'); }
  const sfx = (fn, ...a) => { if (typeof SFX !== 'undefined') SFX[fn](...a); };
  function addRow(j, animate) {
    const [row, d] = line(D.lines[j], j, animate); row.dataset.dur = d; boardEl().append(row);
    alignEq();
    if (animate && !reduced()) { carry(row); pen(row); }
    return row;
  }
  /* In a both-sides step the new line slides sideways so its = sits under the = of the line above,
     the way a teacher keeps the working in one column. Never closer than the arrows need, never off the board. */
  /* The whole run (the starting line plus every arrow step after it) is lined up at once: the = column is put
     where the line that needs the most room on its left can still fit its arrows. If that would push a line off
     the board (a narrow phone), the run is left as it is. */
  function alignEq(end) {
    const rows = rowsNow(); let s = end == null ? rows.length - 1 : end; const last = s;
    if (s < 1 || !rows[s].classList.contains('has-op')) return;
    while (s > 0 && rows[s].classList.contains('has-op')) s--;
    const run = rows.slice(s, last + 1).map(r => { const box = r.querySelector('.bopw') || r.querySelector(':scope > .bm'); if (!box) return null;
      const bm = box.classList.contains('bm') ? box : box.querySelector('.bm'), e = [...bm.querySelectorAll('.bc')].find(c => c.textContent === '=');
      return e && { box, bm, op: r.classList.contains('has-op'), off: e.getBoundingClientRect().left - bm.getBoundingClientRect().left }; });
    if (run.some(x => !x)) return;
    const col = Math.max(...run.map(x => (x.op ? 52 : 0) + x.off)), room = boardEl().clientWidth - 70;
    const wide = x => { const cs = x.bm.querySelectorAll('.bc'); return cs.length ? cs[cs.length - 1].getBoundingClientRect().right - x.bm.getBoundingClientRect().left : 0; };
    if (run.some(x => col - x.off + wide(x) > room)) return;
    for (const x of run) x.box.style.marginLeft = Math.round(col - x.off) + 'px';
  }
  /* A highlighted number that also appears on the line above flies down from there, the way a
     teacher carries "+ 5" across the equals sign. Matching is by the whole number only. */
  function carry(row) {
    const prev = rowsNow().slice(0, -1).reverse().map(r => r.querySelector('.bm')).find(Boolean); if (!prev) return;
    const pcs = [...prev.querySelectorAll('.bc')], txt = pcs.map(c => c.textContent).join('');
    for (const g of row.querySelectorAll('.bm > .hlg')) {
      const key = g.textContent.replace(/[^\d.]/g, ''); if (!key) continue;
      const m = [...txt.matchAll(/\d+(\.\d+)?/g)].find(x => x[0] === key); if (!m) continue;
      const src = pcs.slice(m.index, m.index + key.length), a = src[0].getBoundingClientRect(), z = src[src.length - 1].getBoundingClientRect(), b = g.getBoundingClientRect();
      const cs = [...g.querySelectorAll('.bc')], d0 = Math.min(...cs.map(dOf)), d1 = Math.max(...cs.map(dOf));
      cs.forEach(c => c.style.setProperty('--d', d0 + 'ms')); g.classList.add('carried');
      const dx = (a.left + z.right) / 2 - (b.left + b.right) / 2, dy = (a.top + z.bottom) / 2 - (b.top + b.bottom) / 2;
      const f = g.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.85)`, opacity: .2 }, { opacity: 1, offset: .2 }, { transform: 'none', opacity: 1 }],
        { duration: Math.max(560, d1 - d0 + 300) * k(), delay: d0, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'backwards' });
      src.forEach(c => c.classList.add('src')); f.onfinish = () => { src.forEach(c => c.classList.remove('src')); sfx('play', 'land'); };
      anims.push(f);
    }
  }
  /* the pen tip rides along the bottom of each character as it is written */
  function pen(row) {
    const B = boardEl(), us = [...row.querySelectorAll('.bm .bc, .bm .bb')].filter(u => !u.closest('.carried')).sort((p, q) => dOf(p) - dOf(q));
    if (!us.length) return;
    const R = B.getBoundingClientRect(), per = CH * k(), end = dOf(us[us.length - 1]) + per * 3;
    const at = u => { const r = u.getBoundingClientRect(); return `translate(${Math.round(r.right - R.left + B.scrollLeft)}px, ${Math.round(r.bottom - R.top + B.scrollTop - 7)}px)`; };
    const kf = [{ transform: at(us[0]), opacity: 0, offset: 0 }, { transform: at(us[0]), opacity: 0, offset: Math.max(0, dOf(us[0]) - per) / end }];
    for (const u of us) kf.push({ transform: at(u), opacity: 1, offset: Math.min(1, (dOf(u) + per * .8) / end) });
    kf.push({ transform: at(us[us.length - 1]), opacity: 0, offset: 1 });
    const p = el('span', 'bd-pen'); B.append(p);
    const a = p.animate(kf, { duration: end, fill: 'forwards' }); a.onfinish = () => p.remove(); a.oncancel = () => p.remove(); anims.push(a);
    sfx('pen', (dOf(us[us.length - 1]) - dOf(us[0]) + per) / 1000, dOf(us[0]) / 1000);
  }
  function focusRow(d) {
    const rows = rowsNow(); rows.forEach(r => r.classList.remove('now'));
    const cur = rows[rows.length - 1]; if (cur) { cur.classList.add('now'); cur.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); }
    dur = d; schedule();
  }
  function schedule() {
    clearTimeout(timer); waiting = false; ended = i === D.lines.length - 1; t0 = performance.now(); left = dur;
    if (playing) timer = setTimeout(ended ? () => { playing = false; sfx('play', 'chime'); sync(); } : advance, dur);
    sync();
  }
  function rebuild(animate) {
    stopAnims(); boardEl().textContent = '';
    let last = null; for (let j = 0; j <= i; j++) last = addRow(j, animate && j === i);
    focusRow(+last.dataset.dur);
  }
  function forward() { i++; const r = addRow(i, true); focusRow(+r.dataset.dur); }
  function backward() {
    const rows = rowsNow(), last = rows[rows.length - 1]; i--;
    last.classList.add('gone'); last.classList.remove('now');
    const a = last.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px)' }], { duration: reduced() ? 1 : 260, easing: 'ease-out', fill: 'forwards' });
    a.onfinish = () => last.remove(); setTimeout(() => last.remove(), 320); // animations can stall in a background tab
    focusRow(HOLD * k());
  }
  function advance() {
    if (i >= D.lines.length - 1) { playing = false; return sync(); }
    /* try-first mode: stop before each working line and let the student think */
    if (tryFirst && D.lines[i + 1].kind !== 'idea') { waiting = true; playing = false; return sync(); }
    forward();
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
  function pause() { if (!playing) return; playing = false; clearTimeout(timer); left = Math.max(0, left - (performance.now() - t0)); anims.forEach(a => a.playState === 'running' && a.pause()); sfx('stopPen'); sync(); }
  function resume() {
    if (waiting) { waiting = false; playing = true; return forward(); }
    if (ended) return;
    playing = true; t0 = performance.now(); anims.forEach(a => a.playState === 'paused' && a.play()); timer = setTimeout(advance, left); sync();
  }

  const ACT = {
    play: () => playing ? pause() : resume(),
    next: () => { if (i < D.lines.length - 1) forward(); },
    prev: () => { if (i > 0) backward(); },
    replay: () => { i = 0; playing = true; rebuild(true); },
    full: () => { playing = false; i = D.lines.length - 1; rebuild(false); },
    speed: () => { sp = (sp + 1) % SPEEDS.length; try { localStorage.setItem(KEY, String(sp)); } catch (e) {} sync(); },
    try: () => { tryFirst = !tryFirst; sync(); },
    why: b => { const w = b.nextElementSibling; w.hidden = !w.hidden; b.setAttribute('aria-expanded', String(!w.hidden)); if (!w.hidden) pause(); },
    close: () => close(),
    similar: () => { const f = opts.onSimilar; close(); if (f) f(); }
  };
  /* Two modes: a pop-up over the page (phones), or inline in a page column (o.mount, the computer study desk).
     Inline it never traps focus or steals keys from the question; its keys only work while focus is inside it. */
  const inline = () => !!(opts && opts.mount);
  function onKey(e) {
    if (!root) return;
    if (inline() && (!root.contains(e.target) || e.target.matches('input, textarea'))) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); ACT.next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); ACT.prev(); }
    else if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); ACT.play(); }
    else if (e.key === 'Tab' && !inline()) { /* keep focus inside the pop-up while it is open */
      const f = [...root.querySelectorAll('button:not([disabled]):not([hidden])')].filter(b => b.offsetParent), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  }

  function open(demo, o = {}) {
    if (!demo || !demo.ok) return false;
    if (root) close(true);
    D = demo; opts = o; i = 0; playing = true; ended = false; waiting = false; back = document.activeElement;
    const checked = demo.source === 'verified' ? el('span', 'bd-ok', '✓ Every step checked') : demo.source === 'sums' ? el('span', 'bd-ok', '✓ Every sum checked') : el('span', 'bd-ok soft', 'Worked steps');
    if (demo.source !== 'steps') checked.title = demo.checks.map(c => c[0]).join(' · ');
    root = el('div', inline() ? 'bd-inline' : 'bd-scrim',
      el('section', 'bd',
        el('header', 'bd-top', el('div', null, el('p', 'bd-kick', demo.subject ? demo.subject + ' · ' + demo.topic : demo.topic), checked), btn('✕', 'close', 'ghost icon-only', 'Close the board')),
        !inline() && el('p', 'bd-q', demo.question),
        el('div', 'bd-board'),
        el('div', 'bd-think', el('p', null, 'What would you write next? Have a go in your head or on paper, then tap Show step.')),
        el('div', 'bd-end', el('p', null, 'Now try one on your own.'), el('div', 'row', o.onSimilar && btn('Try a similar one', 'similar', 'primary'), btn('Watch again', 'replay', 'ghost'), btn('Close', 'close', 'ghost'))),
        el('footer', 'bd-bar',
          el('div', 'bd-meter', el('span', 'bd-fill'), el('span', 'bd-prog')),
          el('div', 'bd-ctl', btn('‹', 'prev', 'ghost icon-only', 'Previous step'), btn('Play', 'play', 'primary'), btn('›', 'next', 'ghost icon-only', 'Next step'),
            btn('↺', 'replay', 'ghost icon-only', 'Replay from the start'), btn('Steady', 'speed', 'ghost', 'Change speed'), btn('Show all', 'full', 'ghost'), btn('Let me try first', 'try', 'ghost')))));
    const sec = root.querySelector('.bd');
    if (!inline()) { sec.setAttribute('role', 'dialog'); sec.setAttribute('aria-modal', 'true'); } else sec.setAttribute('role', 'region');
    sec.setAttribute('aria-label', 'Worked on the board: ' + demo.topic);
    root.querySelector('.bd-board').setAttribute('aria-live', 'polite');
    root.addEventListener('click', e => { if (e.target === root && !inline()) return close(); const b = e.target.closest('[data-bd]'); if (b && !b.disabled) ACT[b.dataset.bd](b); });
    document.addEventListener('keydown', onKey, true);
    if (inline()) o.mount.replaceChildren(root); else { document.body.append(root); document.documentElement.classList.add('bd-open'); }
    rebuild(true);
    /* the handwriting font may arrive after the first layout; line the = signs up again once it has */
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (!root) return; const rs = rowsNow();
      rs.forEach((r, j) => { if (r.classList.contains('has-op') && !(rs[j + 1] && rs[j + 1].classList.contains('has-op'))) alignEq(j); }); });
    if (!inline()) root.querySelector('[data-bd="play"]').focus({ preventScroll: true });
    return true;
  }
  function close(silent) {
    if (!root) return;
    const done = opts && opts.onClose;
    clearTimeout(timer); stopAnims(); document.removeEventListener('keydown', onKey, true);
    root.remove(); root = null; D = null; playing = false; document.documentElement.classList.remove('bd-open');
    if (!silent && back && back.isConnected && !inline()) back.focus({ preventScroll: true });
    if (!silent && done) done();
  }

  /* Run from the console: drives a real board through every control and checks what is on screen. */
  function selfTest() {
    const demo = { topic: 'Self-test', subject: '', question: 'Test', source: 'verified', ok: true, checks: [['ok', true]],
      lines: [{ kind: 'q', math: '3x + 5 = 20' }, { say: 'Subtract 5', math: '3x + 5[[ − 5]] = 20[[ − 5]]', why: 'Balance' }, { math: '{15/3}' }, { kind: 'answer', math: 'x = 5' }] };
    const res = [], cnt = () => root.querySelectorAll('.bl:not(.gone)').length, T = (name, v) => res.push([name, !!v]);
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
    const rm = document.documentElement.classList.contains('rm'); document.documentElement.classList.add('rm'); open(demo); ACT.play();
    T('reduced motion: paused text stays visible', !root.querySelector('.bl.live') && getComputedStyle(root.querySelector('.bl .bc')).opacity === '1'); if (!rm) document.documentElement.classList.remove('rm');
    T('bad demos are refused', open({ ...demo, ok: false }) === false);
    close(); T('closes cleanly', !document.querySelector('.bd-scrim'));
    return { passed: res.filter(r => r[1]).length, failed: res.filter(r => !r[1]).map(r => r[0]) };
  }
  return { open, close, selfTest, isOpen: () => !!root, isInline: () => !!root && inline() };
})();
