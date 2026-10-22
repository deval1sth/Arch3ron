/* Your rival: a copy of you that lives your routine and studies in every free slot. It reads Archeron's saved
   progress on this device (never writes it), and works everything out from the clock, so it keeps going while the
   page is closed. Its daily goal is your recent daily average plus 15%; its accuracy is yours. */
(() => {
  'use strict';
  const MIN = 6e4, PACE = 30e3, PREF = 'archeron-rival';
  const read = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const pad = n => String(n).padStart(2, '0');
  const dkey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const midnight = (t, off = 0) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + off).getTime(); };
  const hm = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const mins = s => { const [h, m] = String(s).split(':').map(Number); return (h || 0) * 60 + (m || 0); };
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = id => document.getElementById(id);

  /* ---------- the routine the rival copies (kept on this device) ---------- */
  const DEF = { days: [1, 2, 3, 4, 5], wake: '07:00', leave: '08:05', home: '15:50', dinner: '18:30', bed: '22:30', wwake: '09:30', wdinner: '18:30', wbed: '23:00' };
  const P = (() => { try { const v = JSON.parse(read(PREF)); if (v && typeof v === 'object') return v; } catch (e) {} return {}; })();
  P.r = Object.assign({}, DEF, P.r || {});
  P.off = Array.isArray(P.off) ? P.off.filter(k => /^\d{4}-\d\d-\d\d$/.test(k)).slice(-60) : [];
  const saveP = () => write(PREF, JSON.stringify(P));

  /* ---------- Archeron's saved progress for the active profile (same rules as me.js) ---------- */
  function stateKey() {
    let idx = null, who = null;
    try { idx = JSON.parse(read('archeron-profiles')); } catch (e) {}
    try { who = sessionStorage.getItem('archeron-who'); } catch (e) {}
    const list = idx && Array.isArray(idx.list) ? idx.list : [];
    const id = list.some(p => p.id === who) ? who : list.some(p => p.id === idx.active) ? idx.active : list[0] && list[0].id;
    if (!id) return read('archeron-v2') ? 'archeron-v2' : null;
    return id === 'me0' ? 'archeron-v2' : 'archeron-p-' + id;
  }
  let KEY = null, S = null, RAW = '';
  function loadS() {
    KEY = stateKey(); const raw = KEY ? read(KEY) : null;
    if (raw === RAW && S) return false;
    RAW = raw; try { S = raw ? JSON.parse(raw) : null; } catch (e) { S = null; }
    if (S && (typeof S.days !== 'object' || !S.days)) S.days = {};
    return true;
  }
  const dayStats = k => { const d = S && S.days[k]; return d ? { qa: +d.qa || 0, qr: +d.qr || 0, t: d.t || {} } : { qa: 0, qr: 0, t: {} }; };

  const CAT = { maths: ['Maths', ['maths']], combined: ['Science', ['biology', 'chemistry', 'physics']], biology: ['Biology', ['biology']], chemistry: ['Chemistry', ['chemistry']], physics: ['Physics', ['physics']],
    englang: ['English Language', ['englang']], englit: ['English Literature', ['englit']], business: ['Business', ['business']], geography: ['Geography', ['geography']], history: ['History', ['history']],
    re: ['RE', ['re']], french: ['French', ['french']], spanish: ['Spanish', ['spanish']], compsci: ['Computer Science', ['compsci']] };
  const gnum = g => { const m = /^\s*(\d)\s*([+-]?)/.exec(g == null ? '' : String(g)); return m ? +m[1] + (m[2] === '+' ? .33 : m[2] === '-' ? -.33 : 0) : null; };
  let SUBS = null;
  function subjects() {
    if (SUBS) return SUBS;
    const mine = S && S.me && Array.isArray(S.me.subs) ? S.me.subs : [];
    let out = mine.filter(s => s && CAT[s.id]).map(s => ({ id: s.id, name: CAT[s.id][0], tracks: CAT[s.id][1], cur: gnum(s.cur), tgt: gnum(s.tgt) }));
    if (!out.length) {
      const seen = new Set(); for (const d of Object.values(S.days)) for (const t in (d && d.t) || {}) seen.add(t);
      out = [...seen].map(t => { const id = Object.keys(CAT).find(k => CAT[k][1].length === 1 && CAT[k][1][0] === t) || t; return { id, name: CAT[id] ? CAT[id][0] : t, tracks: [t], cur: null, tgt: null }; });
    }
    if (!out.length) out = [{ id: 'maths', name: 'Maths', tracks: ['maths'], cur: null, tgt: null }];
    const known = out.filter(s => s.cur != null), mean = known.length ? known.reduce((a, s) => a + s.cur, 0) / known.length : 4;
    for (const s of out) { const c = s.cur ?? mean, t = s.tgt ?? c + 1; s.w = 1 + Math.max(0, t - c) * .8 + Math.max(0, 5 - c) * .25; s.dc = c - mean; }
    return (SUBS = out);
  }

  /* ---------- one day of the rival's life, minute by minute ---------- */
  const cache = new Map();
  const LABEL = { sleep: 'Asleep', ready: 'Getting ready', school: 'School', free: 'Free time', dinner: 'Dinner', study: 'Studying', break: 'Break' };
  function plan(t0) {
    const k = dkey(new Date(t0)); if (cache.has(k)) return cache.get(k);
    const R = P.r, school = R.days.includes(new Date(t0).getDay()) && !P.off.includes(k);
    const wake = mins(school ? R.wake : R.wwake), dinner = mins(school ? R.dinner : R.wdinner), leave = mins(R.leave), home = mins(R.home);
    let bed = mins(school ? R.bed : R.wbed); if (bed <= wake) bed = 1439;
    const A = new Array(1440).fill('sleep'), fill = (a, b, kind) => { for (let m = clamp(a, 0, 1440); m < clamp(b, 0, 1440); m++) A[m] = kind; };
    fill(wake, bed, 'free');
    if (school) { fill(wake, leave, 'ready'); fill(leave, home, 'school'); } else fill(wake, wake + 60, 'ready');
    fill(dinner, Math.min(dinner + 40, bed), 'dinner');

    const prev = []; let qa = 0, qr = 0;
    for (let i = 1; i <= 14; i++) { const s = dayStats(dkey(new Date(midnight(t0, -i)))); if (i <= 7 && s.qa > 0) prev.push(s.qa); qa += s.qa; qr += s.qr; }
    const avg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;
    const goal = clamp(Math.round(avg ? avg * 1.15 + 10 : 120), 60, 400);
    const acc = qa >= 30 ? clamp(qr / qa + .02, .4, .95) : .72;

    let need = Math.ceil(goal * PACE / MIN), m = school ? home + 30 : wake + 90, n = 0;
    const free = x => x < 1440 && A[x] === 'free';
    while (need > 0 && m < bed - 15) {
      if (!free(m)) { m++; continue; }
      let len = 0; while (len < Math.min(25, need) && free(m + len) && m + len < bed - 15) len++;
      if (len < 8 && len < need) { m += len || 1; continue; }
      fill(m, m + len, 'study'); need -= len; m += len; n++;
      if (need > 0) for (let j = 0, br = n % 3 ? 5 : 20; j < br && free(m); j++, m++) A[m] = 'break';
    }

    const runs = [];
    for (let x = 0; x < 1440; x++) { const l = runs[runs.length - 1]; if (l && l.kind === A[x]) l.b = x + 1; else runs.push({ a: x, b: x + 1, kind: A[x] }); }
    const subs = subjects(), W = subs.reduce((a, s) => a + s.w, 0), r = rng(hash(k + '|rival')), ans = [];
    for (const run of runs) if (run.kind === 'study') {
      let t = t0 + run.a * MIN; const end = t0 + run.b * MIN;
      for (;;) {
        t += PACE * (.7 + r() * .6); if (t > end) break;
        let x = r() * W, s = subs[0]; for (const q of subs) { x -= q.w; if (x <= 0) { s = q; break; } }
        ans.push({ t, s, ok: r() < clamp(acc + s.dc * .035, .35, .96), run });
      }
    }
    const p = { k, t0, school, wake, bed, dinner, leave, home, runs, ans, goal, acc, avg, A, mine: qa };
    if (t0 <= midnight(Date.now())) cache.set(k, p);
    return p;
  }
  const doneBy = (p, now) => { let lo = 0, hi = p.ans.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (p.ans[mid].t <= now) lo = mid + 1; else hi = mid; } return lo; };

  /* ---------- what the rival is doing right now ---------- */
  function where(now) {
    const p = plan(midnight(now)), m = clamp(Math.floor((now - p.t0) / MIN), 0, 1439), run = p.runs.find(r => m >= r.a && m < r.b), n = doneBy(p, now);
    const next = p.runs.find(r => r.kind === 'study' && r.a > m), end = p.t0 + run.b * MIN, cur = p.ans[n];
    let chip, note, pose = 'away', lamp = false;
    switch (run.kind) {
      case 'study': {
        pose = 'write'; lamp = true;
        chip = `Revising ${cur && cur.run === run ? cur.s.name : 'notes'} · ${n} of ${p.goal}`; note = [`Goal: ${p.goal}`, `Done: ${n}`]; break;
      }
      case 'break': pose = 'phone'; lamp = true; chip = `Short break · back at ${hm(end)}`; note = ['Break', `till ${hm(end)}`]; break;
      case 'free': pose = 'phone'; lamp = true;
        chip = next ? `Free time · next session at ${hm(p.t0 + next.a * MIN)}` : `Free time · ${n} answers done today`;
        note = next ? ['Next session', hm(p.t0 + next.a * MIN)] : ['Done today', `${n} answers`]; break;
      case 'ready': chip = p.school ? `Getting ready · leaves at ${hm(p.t0 + p.leave * MIN)}` : 'Having breakfast'; note = p.school ? ['Morning!', `out at ${hm(p.t0 + p.leave * MIN)}`] : ['Weekend', 'breakfast first']; break;
      case 'school': chip = `At school until ${hm(p.t0 + p.home * MIN)}`; note = ['At school', `back ${hm(p.t0 + p.home * MIN)}`]; break;
      case 'dinner': chip = `Having dinner · back at ${hm(end)}`; note = ['Dinner', `back ${hm(end)}`]; break;
      default: { pose = 'sleep';
        const up = m < p.wake ? p.t0 + p.wake * MIN : (q => q.t0 + q.wake * MIN)(plan(midnight(now, 1)));
        chip = `Asleep · up at ${hm(up)}`; note = ['Asleep', `up at ${hm(up)}`]; }
    }
    const info = { pose, lamp, note, spread: 0, line: 0, frac: 0, marks: [] };
    if (pose === 'write') {
      const prev = n && p.ans[n - 1].run === run ? p.ans[n - 1].t : p.t0 + run.a * MIN, nt = cur && cur.run === run ? cur.t : end;
      info.spread = Math.floor(n / 6) + run.a * 1000; info.line = n % 6; info.frac = clamp((now - prev) / Math.max(1, nt - prev), 0, 1);
      for (let j = 0; j < 6; j++) { const a = p.ans[n - (n % 6) + j]; info.marks.push(a ? a.ok : true); }
    }
    return { p, run, n, chip, info };
  }

  /* ---------- page ---------- */
  const app = $('app');
  loadS();
  if (!S) {
    app.innerHTML = `<section class="card empty"><h2>Your rival needs a copy of you</h2><p>Open Archeron on this device and answer a few questions first. Your rival is built from that.</p><a href="./">Open Archeron</a></section>`;
    return;
  }
  let motion = typeof P.motion === 'boolean' ? P.motion : S.motion !== 'reduced';
  const field = (k, l) => `<label for="r-${k}">${l}<input type="time" id="r-${k}" value="${esc(P.r[k])}"></label>`;
  const DOW = [[1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat'], [0, 'Sun']];
  app.innerHTML = `
<header class="top"><div class="brand"><h1>Your <b>rival</b></h1><p>A copy of you. Same day as you, every free minute studying.</p></div><a class="back" href="./">Archeron</a></header>
<section class="room" aria-label="The rival's room"><div id="scene"></div><div class="chip"><i class="dot" id="dot"></i><span id="chip"></span></div></section>
<div id="away"></div>
<section class="day"><div class="dayhead"><h2>The rival's day</h2><span id="dplan"></span></div>
  <div class="strip" id="strip"></div><div class="ticks"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div><div class="legend" id="legend"></div></section>
<div class="grid">
  <section class="card"><h2>Today <small id="tdate"></small></h2><div class="vs">
    <div class="side you"><span class="lbl">You</span><span class="big num" id="you">0</span><span class="bar"><b id="youb"></b></span></div>
    <div class="side riv"><span class="lbl">Rival</span><span class="big num" id="riv">0</span><span class="bar"><b id="rivb"></b></span></div>
    <div><p class="verdict" id="verdict"></p><p class="sub" id="goal"></p></div></div></section>
  <section class="card week"><h2>Last 7 days <small>answers</small></h2><div id="week"></div><div class="keys"><span><i style="background:var(--you)"></i>You</span><span><i style="background:var(--riv)"></i>Rival</span></div></section>
</div>
<section class="card"><h2>By subject today <small><span style="color:var(--you)">you</span> · <span style="color:var(--riv)">rival</span></small></h2><div class="subs" id="subs"></div></section>
<details class="card" id="rout"><summary>Your routine <small id="rsum"></small></summary><div class="form">
  <div><h3>School days</h3><div class="days" id="dows">${DOW.map(([d, l]) => `<button type="button" data-d="${d}" aria-pressed="${P.r.days.includes(d)}">${l}</button>`).join('')}</div></div>
  <div><h3>On school days</h3><div class="fields">${field('wake', 'Wake up')}${field('leave', 'Leave for school')}${field('home', 'Home')}${field('dinner', 'Dinner')}${field('bed', 'Bed')}</div></div>
  <div><h3>Weekends and days off</h3><div class="fields">${field('wwake', 'Wake up')}${field('wdinner', 'Dinner')}${field('wbed', 'Bed')}</div></div>
  <div class="toggles">
    <label class="tg" for="off"><span>No school today<small>Half term, an inset day or off ill</small></span><input type="checkbox" id="off"></label>
    <label class="tg" for="mot"><span>Animation<small>The rival writes, the clock ticks, the sky moves</small></span><input type="checkbox" id="mot"></label>
  </div></div></details>
<p class="foot">Reads your Archeron progress on this device. Nothing is sent anywhere.</p>`;

  SCENE.mount($('scene'));
  const room = app.querySelector('.room');
  const setMotion = () => { room.classList.toggle('still', !motion); $('mot').checked = motion; };
  setMotion();

  const youToday = () => dayStats(dkey(new Date())).qa;
  const subToday = s => { const t = dayStats(dkey(new Date())).t; return s.tracks.reduce((a, k) => a + (+t[k] || 0), 0); };

  function drawStrip(p, now) {
    $('strip').innerHTML = p.runs.map(r => `<i class="k-${r.kind}" style="width:${((r.b - r.a) / 14.4).toFixed(3)}%" title="${LABEL[r.kind]} ${hm(p.t0 + r.a * MIN)}–${hm(p.t0 + r.b * MIN)}"></i>`).join('') + '<b class="now" id="now"></b>';
    const kinds = [...new Set(p.runs.map(r => r.kind))];
    $('legend').innerHTML = ['sleep', 'ready', 'school', 'study', 'break', 'dinner', 'free'].filter(k => kinds.includes(k)).map(k => `<span><i class="k-${k}"></i>${LABEL[k]}</span>`).join('');
    const studyMin = p.runs.filter(r => r.kind === 'study').reduce((a, r) => a + r.b - r.a, 0);
    $('dplan').textContent = `${p.school ? 'School day' : 'Day off'} · ${Math.floor(studyMin / 60)}h ${pad(studyMin % 60)}m of study`;
  }

  function drawWeek(now) {
    const days = Array.from({ length: 7 }, (_, i) => { const t0 = midnight(now, i - 6), p = plan(t0); return { t0, you: dayStats(p.k).qa, riv: i === 6 ? doneBy(p, now) : p.ans.length, today: i === 6 }; });
    const top = Math.max(50, ...days.map(d => Math.max(d.you, d.riv))), max = Math.ceil(top / 50) * 50, Y = v => 124 - v / max * 104;
    let g = `<line x1="0" x2="300" y1="${Y(max)}" y2="${Y(max)}" stroke="rgba(237,240,252,.07)"/><line x1="0" x2="300" y1="${Y(max / 2)}" y2="${Y(max / 2)}" stroke="rgba(237,240,252,.07)"/><line x1="0" x2="300" y1="124" y2="124" stroke="rgba(237,240,252,.16)"/>`;
    g += `<text x="306" y="${Y(max) + 4}">${max}</text><text x="306" y="${Y(max / 2) + 4}">${max / 2}</text>`;
    days.forEach((d, i) => {
      const cx = 300 / 7 * (i + .5), bar = (v, x, c) => v > 0 ? `<rect x="${x}" y="${Y(v)}" width="13" height="${124 - Y(v)}" rx="3.5" fill="${c}"/>` : `<rect x="${x}" y="122" width="13" height="2" rx="1" fill="${c}" opacity=".35"/>`;
      g += bar(d.you, cx - 14.5, 'var(--you)') + bar(d.riv, cx + 1.5, 'var(--riv)');
      g += `<text x="${cx}" y="142" text-anchor="middle" class="${d.today ? 'tday' : ''}">${d.today ? 'Today' : new Date(d.t0).toLocaleDateString('en-GB', { weekday: 'short' })}</text>`;
    });
    $('week').innerHTML = `<svg viewBox="0 0 330 150" role="img" aria-label="Answers per day for the last 7 days, you and your rival">${g}</svg>`;
  }

  function drawSubs(p, now) {
    const n = doneBy(p, now), rows = subjects().map(s => ({ s, you: subToday(s), riv: p.ans.slice(0, n).filter(a => a.s === s).length }));
    const max = Math.max(1, ...rows.map(r => Math.max(r.you, r.riv)));
    $('subs').innerHTML = rows.map(r => `<div class="srow${r.you || r.riv ? '' : ' idle'}"><span class="nm">${esc(r.s.name)}</span><span class="vv num"><b style="color:var(--you)">${r.you}</b> · <b style="color:var(--riv)">${r.riv}</b></span>
      ${r.you || r.riv ? `<div class="pair"><i style="width:${r.you / max * 100}%"></i><i style="width:${r.riv / max * 100}%"></i></div>` : ''}</div>`).join('');
  }

  let prevYou = null, lastMin = -1, dirty = true, cur = null;
  function tick() {
    const now = Date.now(); cur = where(now); const p = cur.p;
    $('chip').textContent = cur.chip; $('dot').classList.toggle('on', cur.run.kind === 'study');
    const you = youToday(), riv = cur.n, top = Math.max(you, riv, p.goal, 1);
    if (prevYou != null && you > prevYou) { const s = document.createElement('span'); s.className = 'pop'; s.textContent = '+' + (you - prevYou); $('you').appendChild(s); setTimeout(() => s.remove(), 1200); }
    if ($('you').firstChild && $('you').firstChild.nodeType === 3) $('you').firstChild.nodeValue = you; else $('you').prepend(String(you));
    prevYou = you; $('riv').textContent = riv;
    $('youb').style.width = (you / top * 100).toFixed(1) + '%'; $('rivb').style.width = (riv / top * 100).toFixed(1) + '%';
    const d = you - riv, going = cur.run.kind === 'study';
    $('verdict').textContent = d > 0 ? `You're ${d} ahead.` : d < 0 ? `Your rival is ${-d} ahead${going ? ' and still going' : ''}.` : you ? 'Dead level.' : 'Neither of you has started yet.';
    $('goal').textContent = (p.avg ? `Its goal today is ${p.goal}: your recent daily average plus 15%.` : `Its goal today is ${p.goal}. After a few days of studying it will match your pace.`)
      + (p.mine >= 30 ? ` It gets about ${Math.round(p.acc * 100)}% right, like you.` : '');
    $('now') && ($('now').style.left = ((now - p.t0) / 864e3).toFixed(2) + '%');
    const mm = Math.floor(now / MIN);
    if (mm !== lastMin || dirty) {
      lastMin = mm; dirty = false;
      drawStrip(p, now); $('now').style.left = ((now - p.t0) / 864e3).toFixed(2) + '%'; drawWeek(now); drawSubs(p, now);
      $('tdate').textContent = new Date(now).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      $('off').checked = P.off.includes(p.k);
      $('rsum').textContent = `${P.r.wake}–${P.r.bed} on school days`;
    }
    if (!motion || document.hidden) SCENE.frame(now, cur.info, false);
  }
  function loop() { if (motion && cur && !document.hidden) { if (Date.now() - lastWhere > 250) { cur = where(Date.now()); lastWhere = Date.now(); } SCENE.frame(Date.now(), cur.info, true); } requestAnimationFrame(loop); }
  let lastWhere = 0;

  /* while you were away */
  (function away() {
    const since = +P.seen || 0, now = Date.now();
    if (!since || now - since < 15 * MIN || now - since > 14 * 864e5) return;
    let n = 0, ok = 0; const by = new Map();
    for (let t0 = midnight(since); t0 <= now; t0 = midnight(t0, 1)) for (const a of plan(t0).ans) if (a.t > since && a.t <= now) { n++; ok += a.ok; by.set(a.s.name, (by.get(a.s.name) || 0) + 1); }
    if (!n) return;
    const top = [...by].sort((a, b) => b[1] - a[1])[0][0], sd = new Date(since), yest = midnight(now, -1) <= since && since < midnight(now);
    const when = since >= midnight(now) ? hm(since) : yest ? `yesterday at ${hm(since)}` : `${sd.toLocaleDateString('en-GB', { weekday: 'long' })} at ${hm(since)}`;
    $('away').innerHTML = `<section class="card away"><span class="ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><div><p><b>While you were away</b></p><p>Since you last looked (${when}), your rival answered ${n} question${n === 1 ? '' : 's'} and got ${ok} right. Mostly ${esc(top)}.</p></div></section>`;
  })();
  const seen = () => { P.seen = Date.now(); saveP(); };
  setInterval(seen, 30e3); addEventListener('pagehide', seen); document.addEventListener('visibilitychange', () => { if (document.hidden) seen(); });

  /* routine editing */
  const changed = () => { saveP(); cache.clear(); dirty = true; tick(); };
  for (const k of Object.keys(DEF)) if (k !== 'days') $('r-' + k).addEventListener('change', e => { if (/^\d\d:\d\d$/.test(e.target.value)) { P.r[k] = e.target.value; changed(); } });
  $('dows').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const d = +b.dataset.d, on = P.r.days.includes(d);
    P.r.days = on ? P.r.days.filter(x => x !== d) : [...P.r.days, d]; b.setAttribute('aria-pressed', String(!on)); changed();
  });
  $('off').addEventListener('change', e => { const k = dkey(new Date()); P.off = P.off.filter(x => x !== k); if (e.target.checked) P.off.push(k); changed(); });
  $('mot').addEventListener('change', e => { motion = e.target.checked; P.motion = motion; saveP(); setMotion(); tick(); });

  /* live: Archeron saves in another tab or window → the storage event fires here */
  const refresh = () => { if (loadS()) { SUBS = null; cache.clear(); dirty = true; } tick(); };
  addEventListener('storage', e => { if (!e.key || e.key === KEY || e.key === 'archeron-profiles') refresh(); });
  setInterval(refresh, 1000);
  tick(); SCENE.frame(Date.now(), cur.info, motion); requestAnimationFrame(loop);
})();
