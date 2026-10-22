/* Your rival: a copy of you that lives your routine and studies in every free slot. It reads Archeron's saved
   progress on this device (never writes it), and works everything out from the clock, so it keeps going while the
   page is closed. Its goal is your recent daily average plus 15%, nudged to keep the race close; its accuracy is yours;
   half its answers go to the topics you got wrong today. */
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
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const wday = t => new Date(t).toLocaleDateString('en-GB', { weekday: 'short' });
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
  let KEY = null, S = null, RAW = '', FIRST = null;
  function loadS() {
    KEY = stateKey(); const raw = KEY ? read(KEY) : null;
    if (raw === RAW && S) return false;
    RAW = raw; try { S = raw ? JSON.parse(raw) : null; } catch (e) { S = null; }
    if (S && (typeof S.days !== 'object' || !S.days)) S.days = {};
    FIRST = S ? Object.keys(S.days).filter(k => +S.days[k].qa > 0).sort()[0] || null : null;
    return true;
  }
  const dayStats = k => { const d = S && S.days[k]; return d ? { qa: +d.qa || 0, qr: +d.qr || 0, t: d.t || {} } : { qa: 0, qr: 0, t: {} }; };
  const missesFor = k => {
    const M = S && S.tc && S.tc.miss; if (!M || M.d !== k || !M.t || typeof M.t !== 'object') return [];
    return Object.entries(M.t).filter(([, e]) => Array.isArray(e)).map(([id, e]) => ({ id, name: String(e[0]).slice(0, 60), track: e[1], n: +e[2] || 1, at: +e[3] || 0 })).sort((a, b) => a.at - b.at);
  };

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

  /* ---------- Onur's own path: he starts as a copy of your first week (answers a day, % right) and improves in a straight
     line until your mocks, whatever you do. Your days never change his. ---------- */
  const GROW = .6, SHARP = .12;
  let MIR = null;
  function mirror() {
    if (MIR) return MIR;
    const first = Object.keys(S.days).filter(k => +S.days[k].qa > 0).sort().slice(0, 7);
    let qa = 0, qr = 0; for (const k of first) { qa += +S.days[k].qa || 0; qr += +S.days[k].qr || 0; }
    const born = FIRST ? new Date(FIRST + 'T00:00').getTime() : midnight(Date.now());
    const mk = S.mock && /^\d{4}-\d\d-\d\d$/.test(S.mock) ? new Date(S.mock + 'T00:00').getTime() : born + 90 * 864e5;
    return (MIR = { born, mock: Math.max(mk, born + 14 * 864e5), base: first.length ? clamp(qa / first.length, 40, 300) : 100, acc: qa >= 30 ? clamp(qr / qa, .4, .88) : .7, days: first.length });
  }
  const progAt = t => { const M = mirror(); return clamp((t - M.born) / (M.mock - M.born), 0, 1); };

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

    const M = mirror(), pr = progAt(t0), goal = clamp(Math.round(M.base * (1 + GROW * pr)), 40, 400), acc = clamp(M.acc + SHARP * pr, .4, .96);

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
    /* the same random draws whatever you missed, so a new mistake only changes answers after it */
    const subs = subjects(), W = subs.reduce((a, s) => a + s.w, 0), r = rng(hash(k + '|rival')), miss = missesFor(k), ans = [];
    for (const run of runs) if (run.kind === 'study') {
      let t = t0 + run.a * MIN; const end = t0 + run.b * MIN;
      for (;;) {
        t += PACE * (.7 + r() * .6); if (t > end) break;
        const xs = r(), rm = r(), rk = r(), ro = r();
        let x = xs * W, s = subs[0]; for (const q of subs) { x -= q.w; if (x <= 0) { s = q; break; } }
        let topic = null; const due = miss.filter(e => e.at < t);
        if (due.length && rm < .55) { const e = due[Math.floor(rk * due.length)]; topic = e.name; s = subs.find(q => q.tracks.includes(e.track)) || s; }
        ans.push({ t, s, topic, ok: ro < clamp(acc + s.dc * .035, .35, .96), run });
      }
    }
    const p = { k, t0, school, wake, bed, dinner, leave, home, runs, ans, goal, acc, pr, A, miss };
    if (t0 <= midnight(Date.now())) cache.set(k, p);
    return p;
  }
  const doneBy = (p, now) => { let lo = 0, hi = p.ans.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (p.ans[mid].t <= now) lo = mid + 1; else hi = mid; } return lo; };
  const dayResult = (t0, now) => {
    const p = plan(t0), you = dayStats(p.k).qa, riv = t0 === midnight(now) ? doneBy(p, now) : p.ans.length;
    return { t0, you, riv, res: t0 > midnight(now) ? 'later' : t0 === midnight(now) ? 'live' : you > riv ? 'W' : riv > you ? 'L' : 'T' };
  };

  /* ---------- what the rival is doing right now ---------- */
  function where(now, hype) {
    const p = plan(midnight(now)), m = clamp(Math.floor((now - p.t0) / MIN), 0, 1439), run = p.runs.find(r => m >= r.a && m < r.b), n = doneBy(p, now);
    const next = p.runs.find(r => r.kind === 'study' && r.a > m), end = p.t0 + run.b * MIN, cur = p.ans[n] && p.ans[n].run === run ? p.ans[n] : null;
    let chip, note, pose = 'away', lamp = false;
    switch (run.kind) {
      case 'study': pose = 'write'; lamp = true;
        chip = `${cur && cur.topic ? `Revising your mistake: ${cur.topic}` : `Revising ${cur ? cur.s.name : 'notes'}`} · ${n} of ${p.goal}`; note = [`Goal: ${p.goal}`, `Done: ${n}`]; break;
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
    const info = { pose, lamp, note, hype: !!hype, subject: cur ? cur.topic || cur.s.name : '', prog: n / p.goal, spread: 0, line: 0, frac: 0, marks: [] };
    if (pose === 'write') {
      const prev = n && p.ans[n - 1].run === run ? p.ans[n - 1].t : p.t0 + run.a * MIN, nt = cur ? cur.t : end;
      info.spread = Math.floor(n / 6) + run.a * 1000; info.line = n % 6; info.frac = clamp((now - prev) / Math.max(1, nt - prev), 0, 1);
      for (let j = 0; j < 6; j++) { const a = p.ans[n - (n % 6) + j]; info.marks.push(a ? a.ok : true); }
    }
    return { p, run, n, chip, info };
  }

  /* ---------- page ---------- */
  const app = $('app');
  loadS();
  if (!S) {
    app.innerHTML = `<section class="card empty"><h2>Onur needs a copy of you</h2><p>Open Archeron on this device and answer a few questions first. Onur, your rival, is built from that.</p><a href="./">Open Archeron</a></section>`;
    setInterval(() => { if (loadS() && S) location.reload(); }, 2000);
    return;
  }
  let motion = typeof P.motion === 'boolean' ? P.motion : S.motion !== 'reduced';
  const PIP = 'documentPictureInPicture' in window || !matchMedia('(pointer: coarse)').matches;
  const field = (k, l) => `<label for="r-${k}">${l}<input type="time" id="r-${k}" value="${esc(P.r[k])}"></label>`;
  const DOW = [[1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat'], [0, 'Sun']];
  app.innerHTML = `
<header class="top"><div class="brand"><h1><b>Onur</b></h1><p>Your rival. A copy of you, living your day, studying every free minute.</p></div><a class="back" href="./">Archeron</a></header>
<section class="room" aria-label="Onur's room"><div id="scene"></div>
  <div class="acts"><button type="button" class="play" id="play">Watch Onur's day</button>${PIP ? '<button type="button" class="play" id="pop">Pop out</button>' : ''}</div>
  <div class="score num" id="score"><b class="sy">You 0</b><b class="sr">Onur 0</b></div>
  <div class="chip"><i class="dot" id="dot"></i><span id="chip"></span></div></section>
<div id="away"></div>
<section class="day"><div class="dayhead"><h2>Onur's day</h2><span id="dplan"></span></div>
  <div class="strip" id="strip"></div><div class="ticks"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div><div class="legend" id="legend"></div></section>
<div class="grid">
  <section class="card"><h2>Today <small id="tdate"></small></h2><div class="vs">
    <div class="side you"><span class="lbl">You</span><span class="big num" id="you">0</span><span class="bar"><b id="youb"></b></span></div>
    <div class="side riv"><span class="lbl">Onur</span><span class="big num" id="riv">0</span><span class="bar"><b id="rivb"></b></span></div>
    <div><p class="verdict" id="verdict"></p><p class="sub" id="goal"></p></div></div></section>
  <section class="card week" id="wk"><h2><span id="wkTitle">This week</span> <small id="wkRange"></small></h2><div id="week"></div><div class="res" id="wkRes"></div>
    <div class="keys"><span><i style="background:var(--you)"></i>You</span><span><i style="background:var(--riv)"></i>Onur</span><span><i class="r-W"></i>W win</span><span><i class="r-L"></i>L loss</span></div>
    <p class="tally" id="wkTally"></p><p class="sub" id="wkMore"></p></section>
</div>
<div class="grid">
  <section class="card"><h2>By subject today <small><span style="color:var(--you)">you</span> · <span style="color:var(--riv)">Onur</span></small></h2><div class="subs" id="subs"></div></section>
  <section class="card"><h2>Onur's homework <small>your mistakes today</small></h2><div id="hw"></div></section>
</div>
<section class="card"><h2>Head to head <small>you vs Onur</small></h2><div class="tiles" id="tiles"></div></section>
<section class="card brains"><h2>Runo vs Onur <small>last 14 days · drag to spin</small></h2>
  <div class="bgrid"><figure><canvas id="bRuno" aria-label="Runo, your brain, lit up by subject"></canvas><figcaption><b>Runo</b> your brain</figcaption></figure>
  <figure><canvas id="bOnur" aria-label="Onur's brain, lit up by subject"></canvas><figcaption><b class="o">Onur</b> his brain</figcaption></figure></div>
  <p class="sub" id="bnote"></p></section>
<div class="grid">
  <section class="card"><h2>Predicted grades <small>Onur's path to your mocks</small></h2><div id="grades"></div></section>
  <section class="card"><h2>Mistake revenge <small>topics you got wrong</small></h2><div id="rev"></div></section>
</div>
<section class="card"><h2>When you study <small>last 14 days, by hour</small></h2><div id="hours"></div></section>
<details class="card" id="rout"><summary>Your routine <small id="rsum"></small></summary><div class="form">
  <div><h3>School days</h3><div class="days" id="dows">${DOW.map(([d, l]) => `<button type="button" data-d="${d}" aria-pressed="${P.r.days.includes(d)}">${l}</button>`).join('')}</div></div>
  <div><h3>On school days</h3><div class="fields">${field('wake', 'Wake up')}${field('leave', 'Leave for school')}${field('home', 'Home')}${field('dinner', 'Dinner')}${field('bed', 'Bed')}</div></div>
  <div><h3>Weekends and days off</h3><div class="fields">${field('wwake', 'Wake up')}${field('wdinner', 'Dinner')}${field('wbed', 'Bed')}</div></div>
  <div class="toggles">
    <label class="tg" for="off"><span>No school today<small>Half term, an inset day or off ill</small></span><input type="checkbox" id="off"></label>
    <label class="tg" for="mot"><span>Animation<small>Onur writes, the clock ticks, the sky moves</small></span><input type="checkbox" id="mot"></label>
  </div></div></details>
<p class="foot">Reads your Archeron progress on this device. Nothing is sent anywhere.</p>`;

  SCENE.mount($('scene'));
  const room = app.querySelector('.room'), svgEl = room.querySelector('svg');
  const chipEl = $('chip'), dotEl = $('dot'), playEl = $('play'), popEl = $('pop'), scoreEl = $('score');
  const setMotion = () => { room.classList.toggle('still', !motion); $('mot').checked = motion; };
  setMotion();

  const youToday = () => dayStats(dkey(new Date())).qa;
  const subToday = s => { const t = dayStats(dkey(new Date())).t; return s.tracks.reduce((a, k) => a + (+t[k] || 0), 0); };

  function drawStrip(p) {
    $('strip').innerHTML = p.runs.map(r => `<i class="k-${r.kind}" style="width:${((r.b - r.a) / 14.4).toFixed(3)}%" title="${LABEL[r.kind]} ${hm(p.t0 + r.a * MIN)}–${hm(p.t0 + r.b * MIN)}"></i>`).join('') + '<b class="now" id="now"></b>';
    const kinds = [...new Set(p.runs.map(r => r.kind))];
    $('legend').innerHTML = ['sleep', 'ready', 'school', 'study', 'break', 'dinner', 'free'].filter(k => kinds.includes(k)).map(k => `<span><i class="k-${k}"></i>${LABEL[k]}</span>`).join('');
    const studyMin = p.runs.filter(r => r.kind === 'study').reduce((a, r) => a + r.b - r.a, 0);
    $('dplan').textContent = `${p.school ? 'School day' : 'Day off'} · ${Math.floor(studyMin / 60)}h ${pad(studyMin % 60)}m of study`;
  }

  /* this week, Monday to Sunday: bars, a win or loss under each day, and the record */
  function drawWeek(now) {
    const mon = midnight(now, -((new Date(now).getDay() + 6) % 7)), days = Array.from({ length: 7 }, (_, i) => dayResult(midnight(mon, i), now));
    const top = Math.max(50, ...days.map(d => Math.max(d.you, d.riv))), max = Math.ceil(top / 50) * 50, Y = v => 124 - v / max * 104;
    let g = `<line x1="0" x2="300" y1="${Y(max)}" y2="${Y(max)}" stroke="rgba(237,240,252,.07)"/><line x1="0" x2="300" y1="${Y(max / 2)}" y2="${Y(max / 2)}" stroke="rgba(237,240,252,.07)"/><line x1="0" x2="300" y1="124" y2="124" stroke="rgba(237,240,252,.16)"/>`;
    g += `<text x="306" y="${Y(max) + 4}">${max}</text><text x="306" y="${Y(max / 2) + 4}">${max / 2}</text>`;
    days.forEach((d, i) => {
      const cx = 300 / 7 * (i + .5), bar = (v, x, c) => v > 0 ? `<rect x="${x}" y="${Y(v)}" width="13" height="${124 - Y(v)}" rx="3.5" fill="${c}"/>` : `<rect x="${x}" y="122" width="13" height="2" rx="1" fill="${c}" opacity=".35"/>`;
      g += d.res === 'later' ? `<rect x="${cx - 14.5}" y="96" width="29" height="28" rx="4" fill="none" stroke="rgba(237,240,252,.14)" stroke-dasharray="3 3"/>` : bar(d.you, cx - 14.5, 'var(--you)') + bar(d.riv, cx + 1.5, 'var(--riv)');
      g += `<text x="${cx}" y="142" text-anchor="middle" class="${d.res === 'live' ? 'tday' : ''}">${d.res === 'live' ? 'Today' : wday(d.t0)}</text>`;
    });
    $('week').innerHTML = `<svg viewBox="0 0 330 150" role="img" aria-label="Answers each day this week, you and Onur">${g}</svg>`;
    const lead = d => d.you > d.riv ? 'you' : d.riv > d.you ? 'riv' : '';
    $('wkRes').innerHTML = days.map(d => d.res === 'later' ? '<i class="r-later">·</i>' : d.res === 'live' ? `<i class="r-live ${lead(d)}" title="Today so far">now</i>`
      : `<i class="r-${d.res}" title="${wday(d.t0)}: you ${d.you}, Onur ${d.riv}">${d.res}</i>`).join('');

    const tally = list => { const c = { W: 0, L: 0, T: 0 }; for (const d of list) if (c[d.res] != null) c[d.res]++; return c; };
    const say = c => `won ${c.W}, lost ${c.L}${c.T ? `, tied ${c.T}` : ''}`;
    const c = tally(days), d0 = new Date(now), sunday = d0.getDay() === 0 && d0.getHours() >= 18;
    $('wk').classList.toggle('final', sunday);
    $('wkTitle').textContent = sunday ? 'Sunday night results' : 'This week';
    $('wkRange').textContent = `${new Date(mon).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(midnight(mon, 6)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
    const t = days.find(d => d.res === 'live'), live = t ? ` Today: ${t.you > t.riv ? `you lead by ${t.you - t.riv}` : t.riv > t.you ? `Onur leads by ${t.riv - t.you}` : 'level'}, still live until midnight.` : '';
    $('wkTally').innerHTML = c.W + c.L + c.T ? `<b>You ${say(c)}.</b>${live}` : `<b>No finished days yet this week.</b>${live}`;

    const done = days.filter(d => d.res === 'W' || d.res === 'L'), best = done.filter(d => d.res === 'W').sort((a, b) => (b.you - b.riv) - (a.you - a.riv))[0], worst = done.filter(d => d.res === 'L').sort((a, b) => (b.riv - b.you) - (a.riv - a.you))[0];
    const lw = tally(Array.from({ length: 7 }, (_, i) => dayResult(midnight(mon, i - 7), now)).filter(d => !FIRST || dkey(new Date(d.t0)) >= FIRST));
    const all = { W: 0, L: 0, T: 0 };
    if (FIRST) for (let t0 = new Date(FIRST + 'T00:00').getTime(), n = 0; t0 < midnight(now) && n < 400; t0 = midnight(t0, 1), n++) { const r = dayResult(t0, now).res; if (all[r] != null) all[r]++; }
    const lines = [];
    if (best) lines.push(`Biggest win: ${wday(best.t0)}, by ${best.you - best.riv}.`);
    if (worst) lines.push(`Heaviest loss: ${wday(worst.t0)}, by ${worst.riv - worst.you}.`);
    if (lw.W + lw.L + lw.T) lines.push(`Last week you ${say(lw)}.`);
    if (all.W + all.L + all.T) lines.push(`All time: ${all.W} win${all.W === 1 ? '' : 's'}, ${all.L} loss${all.L === 1 ? '' : 'es'}${all.T ? `, ${all.T} tied` : ''}.`);
    $('wkMore').textContent = lines.join(' ');
  }

  function drawSubs(p, now) {
    const n = doneBy(p, now), rows = subjects().map(s => ({ s, you: subToday(s), riv: p.ans.slice(0, n).filter(a => a.s === s).length }));
    const max = Math.max(1, ...rows.map(r => Math.max(r.you, r.riv)));
    $('subs').innerHTML = rows.map(r => `<div class="srow${r.you || r.riv ? '' : ' idle'}"><span class="nm">${esc(r.s.name)}</span><span class="vv num"><b style="color:var(--you)">${r.you}</b> · <b style="color:var(--riv)">${r.riv}</b></span>
      ${r.you || r.riv ? `<div class="pair"><i style="width:${r.you / max * 100}%"></i><i style="width:${r.riv / max * 100}%"></i></div>` : ''}</div>`).join('');
  }

  function drawHomework(p, now) {
    if (!p.miss.length) { $('hw').innerHTML = '<p class="sub">When you get a question wrong in Archeron today, the topic lands here and Onur revises it too. The list starts fresh each morning.</p>'; return; }
    const n = doneBy(p, now), done = p.ans.slice(0, n);
    $('hw').innerHTML = '<div class="hw">' + p.miss.map(e => { const its = done.filter(a => a.topic === e.name), ok = its.filter(a => a.ok).length;
      return `<div class="hrow"><span class="nm">${esc(e.name)}</span><span class="vv">you missed ${e.n} · <b style="color:var(--riv)">Onur has done ${its.length}</b>${its.length ? `, ${ok} right` : ''}</span></div>`; }).join('') + '</div>';
  }

  /* ---------- head to head ---------- */
  const fmtG = v => { const t = Math.round(v * 3) / 3, b = Math.round(t), d = t - b; return b + (d > .1 ? '+' : d < -.1 ? '-' : ''); };
  const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '–';
  function finished(now) {
    const out = []; if (!FIRST) return out;
    for (let t0 = new Date(FIRST + 'T00:00').getTime(), n = 0; t0 < midnight(now) && n < 400; t0 = midnight(t0, 1), n++) out.push(dayResult(t0, now));
    return out;
  }
  const TITLES = ['Sleepwalker', 'Drifter', 'Steady', 'Grinder', 'Contender', 'Hunter', 'Shadow', 'Phantom', 'Nemesis', 'Unstoppable'];
  function drawTiles(p, now) {
    const H = finished(now), t = dayResult(p.t0, now), M = mirror();
    let st = null; for (let i = H.length - 1; i >= 0; i--) { const r = H[i].res; if (r !== 'W' && r !== 'L') break; if (!st) st = { r, n: 1 }; else if (st.r === r) st.n++; else break; }
    const youBest = Math.max(t.you, 0, ...H.map(d => d.you)), onBest = Math.max(t.riv, 0, ...H.map(d => d.riv));
    const n = doneBy(p, now), done = p.ans.slice(0, n), ts = dayStats(p.k), going = where(now).run.kind === 'study';
    let life = n, mins = n / 2, youLife = t.you; for (const d of H) { const q = plan(d.t0); life += q.ans.length; mins += q.runs.filter(r => r.kind === 'study').reduce((a, r) => a + r.b - r.a, 0); youLife += d.you; }
    const need = t.riv - t.you + 1, lvl = Math.min(9, Math.floor(p.pr * 10)), daysIn = Math.max(1, Math.round((p.t0 - M.born) / 864e5) + 1), daysAll = Math.round((M.mock - M.born) / 864e5);
    const tile = (k, v, s, cls = '') => `<div class="tile ${cls}"><small>${k}</small><b>${v}</b><span>${s}</span></div>`;
    $('tiles').innerHTML = [
      tile('Streak', st ? `${st.n} ${st.r === 'W' ? 'win' : 'loss'}${st.n === 1 ? '' : st.r === 'W' ? 's' : 'es'}` : '–', st ? (st.n === 1 ? (st.r === 'W' ? 'You won yesterday.' : 'Onur won yesterday.') : st.r === 'W' ? `You've won the last ${st.n} days.` : `Onur has won the last ${st.n} days.`) : 'No finished days yet.', st ? (st.r === 'W' ? 'win' : 'lose') : ''),
      t.riv >= t.you ? tile('Comeback watch', `${need} answer${need === 1 ? '' : 's'}`, `to overtake Onur today. About ${Math.ceil(need / 2)} min at 2 a minute${going ? ', and he is still adding about 2 a minute' : ''}.`, 'lose')
        : tile('Comeback watch', `${t.you - t.riv} ahead`, `Onur needs ${t.you - t.riv + 1} to pass you${going ? ', and he is studying right now' : ''}.`, 'win'),
      tile('Accuracy today', `${pct(ts.qr, ts.qa)} vs ${pct(done.filter(a => a.ok).length, n)}`, 'You vs Onur, share of answers right.', ts.qa && n ? (ts.qr / ts.qa >= done.filter(a => a.ok).length / n ? 'win' : 'lose') : ''),
      tile('Best day', `${youBest} vs ${onBest}`, 'Your record day vs Onur\'s.', youBest >= onBest ? 'win' : 'lose'),
      tile('Onur, all time', life.toLocaleString(), `answers in ${Math.round(mins / 60)} hours of study since ${new Date(M.born).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}. You: ${youLife.toLocaleString()}.`),
      tile(`Level ${lvl + 1} · ${TITLES[lvl]}`, `Day ${Math.min(daysIn, daysAll)} of ${daysAll}`, `${Math.round(p.pr * 100)}% of the way to his mock-day form: ${Math.round(M.base * (1 + GROW))} a day, ${Math.round(Math.min(.96, M.acc + SHARP) * 100)}% right.`)
    ].join('');
  }

  function drawGrades(now) {
    const pr = progAt(now), rows = subjects().filter(s => s.cur != null);
    if (!rows.length) { $('grades').innerHTML = '<p class="sub">Add your grades in Archeron (Settings → My subjects) and Onur\'s predicted grades appear here.</p>'; return; }
    const X = g => `${((g - 1) / 8 * 100).toFixed(1)}%`;
    $('grades').innerHTML = rows.map(s => { const tg = s.tgt ?? s.cur + 1, on = s.cur + (tg - s.cur) * pr;
      return `<div class="grow"><div class="gtop"><span class="nm">${esc(s.name)}</span><span class="vv">report <b>${fmtG(s.cur)}</b> · Onur now <b class="o">${fmtG(on)}</b> · on mock day <b class="o">${fmtG(tg)}</b></span></div>
        <div class="gbar"><i class="gr" style="left:${X(s.cur)};width:calc(${X(on)} - ${X(s.cur)})"></i><u class="gc" style="left:${X(s.cur)}"></u><u class="go" style="left:${X(on)}"></u><u class="gt" style="left:${X(tg)}"></u></div></div>`; }).join('')
      + '<p class="sub">Grade 1 on the left, 9 on the right. Grey: your report. Orange: where Onur is now. Ring: your target, which he reaches by your mocks.</p>';
  }

  function drawRevenge() {
    const L = (S.tc && S.tc.mlog) || {}, sk = S.skill || {};
    const rows = Object.entries(L).filter(([, e]) => Array.isArray(e)).map(([id, e]) => { const rec = sk[id] && Array.isArray(sk[id].rec) ? sk[id].rec : []; return { name: String(e[0]), day: String(e[2]), won: rec.length > 0 && rec[rec.length - 1] === true }; })
      .sort((a, b) => (a.day < b.day ? 1 : -1)).slice(0, 14);
    if (!rows.length) { $('rev').innerHTML = '<p class="sub">Topics you get wrong from now on are listed here. Get one right next time and it counts as avenged.</p>'; return; }
    const won = rows.filter(r => r.won).length;
    $('rev').innerHTML = `<p class="tally"><b>${won} of ${rows.length} avenged.</b> The rest are still waiting for a rematch.</p><div class="chips2">${rows.map(r => `<span class="${r.won ? 'won' : 'open'}">${r.won ? '✓' : '·'} ${esc(r.name)}</span>`).join('')}</div>`;
  }

  function drawHours(now) {
    const you = new Array(24).fill(0), on = new Array(24).fill(0), HR = (S.tc && S.tc.hrs) || {};
    for (let i = 0; i < 14; i++) {
      const t0 = midnight(now, -i), a = HR[dkey(new Date(t0))]; if (Array.isArray(a)) a.forEach((v, h) => { you[h] += +v || 0; });
      for (const x of plan(t0).ans) if (x.t <= now) on[new Date(x.t).getHours()]++;
    }
    const mx = Math.max(1, ...you), mo = Math.max(1, ...on), row = (arr, m, cls) => arr.map((v, h) => `<i class="${cls}" style="opacity:${v ? (.15 + .85 * v / m).toFixed(2) : .06}" title="${pad(h)}:00 · ${v} answers"></i>`).join('');
    const peak = arr => arr.indexOf(Math.max(...arr));
    $('hours').innerHTML = `<div class="hrs"><span>You</span><div class="hrow24">${row(you, mx, 'hy')}</div><span>Onur</span><div class="hrow24">${row(on, mo, 'ho')}</div><span></span><div class="hticks"><b>00</b><b>06</b><b>12</b><b>18</b><b>24</b></div></div>`
      + `<p class="sub">${you.some(Boolean) ? `Your busiest hour: ${pad(peak(you))}:00. Onur's: ${pad(peak(on))}:00.` : 'Your hours start recording from this update, so your row fills in as you study.'}</p>`;
  }

  /* ---------- Runo vs Onur: two brains, one region per subject, glowing by the last 14 days of answers ---------- */
  const COLS = ['#ff5d6c', '#ffb347', '#7bd389', '#6cc4ff', '#b38cff', '#ff8ad8', '#f2e86d', '#5ee6d0', '#ff9a6c', '#9fd4ff'];
  let brains = null;
  function drawBrains(now) {
    if (!brains) brains = { runo: BRAIN.create($('bRuno'), 'runo'), onur: BRAIN.create($('bOnur'), 'onur') };
    const subs = subjects(), you = new Map(), on = new Map();
    for (let i = 0; i < 14; i++) {
      const t0 = midnight(now, -i), st = dayStats(dkey(new Date(t0)));
      for (const s of subs) you.set(s, (you.get(s) || 0) + s.tracks.reduce((a, k) => a + (+st.t[k] || 0), 0));
      for (const a of plan(t0).ans) if (a.t <= now) on.set(a.s, (on.get(a.s) || 0) + 1);
    }
    const max = Math.max(1, ...subs.map(s => Math.max(you.get(s) || 0, on.get(s) || 0))), keys = BRAIN.place(subs.map(s => s.id));
    const tone = s => (you.get(s) || 0) > (on.get(s) || 0) ? 'win' : (on.get(s) || 0) > (you.get(s) || 0) ? 'lose' : 'even';
    brains.runo.set(subs.map((s, i) => ({ name: s.name, key: keys[i], color: COLS[i % COLS.length], v: (you.get(s) || 0) / max, tone: tone(s), line: `you ${you.get(s) || 0}${tone(s) === 'win' ? ' · you lead' : tone(s) === 'lose' ? ' · Onur leads' : ''}` })));
    brains.onur.set(subs.map((s, i) => ({ name: s.name, key: keys[i], color: COLS[i % COLS.length], v: (on.get(s) || 0) / max, tone: tone(s) === 'win' ? 'win' : tone(s) === 'lose' ? 'lose' : 'even', line: `Onur ${on.get(s) || 0}${tone(s) === 'lose' ? ' · beats you' : ''}` })));
    const beat = subs.filter(s => tone(s) === 'lose').map(s => s.name), lead = subs.filter(s => tone(s) === 'win').map(s => s.name);
    const acc = new Map(); for (let i = 0; i < 7; i++) for (const a of plan(midnight(now, -i)).ans) if (a.t <= now) { const v = acc.get(a.s) || [0, 0]; v[0]++; v[1] += a.ok; acc.set(a.s, v); }
    const ranked = [...acc].filter(([, v]) => v[0] >= 5).sort((a, b) => b[1][1] / b[1][0] - a[1][1] / a[1][0]);
    $('bnote').innerHTML = `${lead.length ? `<b class="tw">You lead in ${esc(lead.join(', '))}.</b> ` : ''}${beat.length ? `<b class="tl">Onur has you beat in ${esc(beat.join(', '))}.</b> ` : ''}`
      + (ranked.length ? `This week Onur is sharpest at ${esc(ranked[0][0].name)} (${pct(ranked[0][1][1], ranked[0][1][0])}) and shakiest at ${esc(ranked[ranked.length - 1][0].name)} (${pct(ranked[ranked.length - 1][1][1], ranked[ranked.length - 1][1][0])}).` : '');
  }
  const brainsVisible = () => { const r = $('bRuno') && $('bRuno').getBoundingClientRect(); return r && r.bottom > 0 && r.top < innerHeight; };

  /* ---------- live: numbers, reactions, the scene ---------- */
  const START = ["Oh, you're revising? Fine.", "Right. Let's go.", 'Finally. Race you.'], SLUMP = ['No way.', 'Hm. Not for long.', 'Okay, okay.'];
  const STRETCH = ['Caught you.', 'Back in front.', 'Ahead again.'], NOTED = ["Noted. I'll revise that.", "I'll take that one.", 'Adding it to my list.'];
  let prev = null, lastSay = 0, lastYou = 0, lastMin = -1, dirty = true, cur = null, tour = null;
  const hype = now => now - lastYou < 90e3;
  function tick() {
    const now = Date.now(); cur = where(now, hype(now)); const p = cur.p;
    if (!tour) { chipEl.textContent = cur.chip; dotEl.classList.toggle('on', cur.run.kind === 'study'); }
    const you = youToday(), riv = cur.n, top = Math.max(you, riv, p.goal, 1), sign = Math.sign(you - riv);
    if (prev && !tour) {
      let ev = null;
      if (you > prev.you && now - lastYou > 10 * MIN) ev = ['glance', pick(START)];
      if (p.miss.length > prev.miss) ev = ['glance', pick(NOTED)];
      if (prev.sign <= 0 && sign > 0 && you > prev.you) ev = ['slump', pick(SLUMP)];
      if (prev.sign >= 0 && sign < 0 && riv > prev.riv) ev = ['stretch', pick(STRETCH)];
      if (ev && now - lastSay > 12e3 && (cur.info.pose === 'write' || cur.info.pose === 'phone')) { SCENE.say(ev[0], ev[1]); lastSay = now; }
    }
    if (prev && you > prev.you) { if (prev.you != null) { const s = document.createElement('span'); s.className = 'pop'; s.textContent = '+' + (you - prev.you); $('you').appendChild(s); setTimeout(() => s.remove(), 1200); } lastYou = now; }
    prev = { you, riv, sign, miss: p.miss.length };
    if ($('you').firstChild && $('you').firstChild.nodeType === 3) $('you').firstChild.nodeValue = you; else $('you').prepend(String(you));
    $('riv').textContent = riv; scoreEl.innerHTML = `<b class="sy">You ${you}</b><b class="sr">Onur ${riv}</b>`;
    $('youb').style.width = (you / top * 100).toFixed(1) + '%'; $('rivb').style.width = (riv / top * 100).toFixed(1) + '%';
    const d = you - riv, going = cur.run.kind === 'study';
    $('verdict').textContent = d > 0 ? `You're ${d} ahead.` : d < 0 ? `Onur is ${-d} ahead${going ? ' and still going' : ''}.` : you ? 'Dead level.' : 'Neither of you has started yet.';
    const MI = mirror();
    $('goal').textContent = `Onur's goal today is ${p.goal} answers at about ${Math.round(p.acc * 100)}% right. He started as a copy of ${MI.days ? 'your first week' : 'a typical start'} (${Math.round(MI.base)} a day, ${Math.round(MI.acc * 100)}% right) and gets a little better every day until your mocks, whatever you do.`;
    const mm = Math.floor(now / MIN);
    if (mm !== lastMin || dirty) {
      lastMin = mm; dirty = false;
      drawStrip(p); drawWeek(now); drawSubs(p, now); drawHomework(p, now); drawTiles(p, now); drawGrades(now); drawRevenge(); drawHours(now); drawBrains(now);
      $('tdate').textContent = new Date(now).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      $('off').checked = P.off.includes(p.k);
      $('rsum').textContent = `${P.r.wake}–${P.r.bed} on school days`;
    }
    $('now').style.left = ((now - p.t0) / 864e3).toFixed(2) + '%';
    if (!tour && (!motion || !visible())) SCENE.frame(now, cur.info, false);
    if (brains && !motion) { brains.runo.draw(now, false); brains.onur.draw(now, false); }
  }

  /* the frame loop runs in the pop-out window while it's open, so the rival keeps moving when this tab is hidden */
  let pipWin = null, loopId = 0, lastWhere = 0, lastRefresh = 0;
  const visible = () => !!pipWin || !document.hidden;
  const raf = cb => (pipWin || window).requestAnimationFrame(cb);
  function startLoop() {
    const id = ++loopId;
    const step = () => {
      if (id !== loopId) return;
      const now = Date.now();
      if (now - lastRefresh > 1000) refresh();
      if (tour) {
        const at = tourAt(now);
        if (!at) stopTour();
        else { const w = where(at.target, false); chipEl.textContent = `${hm(at.t)} · ${w.chip}`; dotEl.classList.toggle('on', w.run.kind === 'study'); SCENE.frame(at.t, w.info, true); }
      } else if (motion && cur && visible()) { if (now - lastWhere > 250) { cur = where(now, hype(now)); lastWhere = now; } SCENE.frame(now, cur.info, true); }
      if (brains && !pipWin && !document.hidden && brainsVisible()) { brains.runo.draw(now, motion); brains.onur.draw(now, motion); }
      raf(step);
    };
    raf(step);
  }

  /* "Watch Onur's day": a ~40-second time-lapse through today's plan. Sweeps move the sky; stops play each scene. */
  const SWEEP = 1.4;
  function tourAt(real) {
    const e = (real - tour.start) / 1000; let acc = 0, prevT = null;
    for (const s of tour.steps) {
      if (prevT != null) {
        if (e < acc + SWEEP) { const k = (e - acc) / SWEEP, q = k < .5 ? 2 * k * k : 1 - Math.pow(2 - 2 * k, 2) / 2; return { t: prevT + (s.t - prevT) * q, target: s.t }; }
        acc += SWEEP;
      }
      if (e < acc + s.d) { const t = s.t + (e - acc) * 1000 * s.s; return { t, target: t }; }
      acc += s.d; prevT = s.t + s.d * 1000 * s.s;
    }
    return null;
  }
  function startTour() {
    const p = plan(midnight(Date.now())), steps = [], first = k => p.runs.find(r => r.kind === k);
    const add = (r, off, d, s) => { if (r) steps.push({ t: p.t0 + Math.min(r.b - 1, r.a + off) * MIN, d, s }); };
    add(p.runs[0], 180, 3, 60); add(first('ready'), 15, 2.5, 30); add(first('school'), 200, 2.5, 60);
    add(first('study'), 1, 8, 12); add(first('break'), 1, 3, 20); add(first('dinner'), 10, 2.5, 30);
    add(p.runs.find(r => r.kind === 'free' && r.a > p.dinner), 30, 3, 30); add(p.runs[p.runs.length - 1], 40, 3.5, 60);
    steps.sort((a, b) => a.t - b.t);
    tour = { start: Date.now(), steps }; playEl.textContent = 'Back to now'; room.classList.remove('still');
  }
  function stopTour() { tour = null; playEl.textContent = "Watch Onur's day"; setMotion(); tick(); SCENE.frame(Date.now(), cur.info, motion); }

  /* pop out: an always-on-top mini window (Chrome and Edge on a computer) */
  const slot = document.createComment('room');
  async function popOut() {
    if (pipWin) { pipWin.close(); return; }
    if (!('documentPictureInPicture' in window)) { miniWindow(); return; }
    let w;
    try { w = await documentPictureInPicture.requestWindow({ width: 440, height: 264 }); }
    catch (e) { console.warn('Pop-out window refused, opening a small window instead:', e && e.message); miniWindow(); return; }
    const link = w.document.createElement('link'); link.rel = 'stylesheet'; link.href = new URL('rival.css', location.href).href; w.document.head.append(link);
    w.document.title = 'Onur'; w.document.body.className = 'pipdoc';
    room.before(slot); w.document.body.append(room); svgEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    pipWin = w; popEl.textContent = 'Pop back in'; startLoop();
    w.addEventListener('pagehide', () => { slot.replaceWith(room); svgEl.removeAttribute('preserveAspectRatio'); pipWin = null; popEl.textContent = 'Pop out'; startLoop(); });
  }

  /* browsers without the pop-out window get a small ordinary window showing only the room (rival.html?mini) */
  function miniWindow() { window.open('rival.html?mini', 'archeron-rival-mini', 'popup,width=460,height=290'); }
  if (new URLSearchParams(location.search).has('mini')) {
    document.body.className = 'pipdoc'; document.body.prepend(room); app.hidden = true; svgEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  }

  /* while you were away */
  (function away() {
    const since = +P.seen || 0, now = Date.now();
    if (!since || now - since < 15 * MIN || now - since > 14 * 864e5) return;
    let n = 0, ok = 0; const by = new Map();
    for (let t0 = midnight(since); t0 <= now; t0 = midnight(t0, 1)) for (const a of plan(t0).ans) if (a.t > since && a.t <= now) { n++; ok += a.ok; by.set(a.s.name, (by.get(a.s.name) || 0) + 1); }
    if (!n) return;
    const top = [...by].sort((a, b) => b[1] - a[1])[0][0], sd = new Date(since), yest = midnight(now, -1) <= since && since < midnight(now);
    const when = since >= midnight(now) ? hm(since) : yest ? `yesterday at ${hm(since)}` : `${sd.toLocaleDateString('en-GB', { weekday: 'long' })} at ${hm(since)}`;
    $('away').innerHTML = `<section class="card away"><span class="ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><div><p><b>While you were away</b></p><p>Since you last looked (${when}), Onur answered ${n} question${n === 1 ? '' : 's'} and got ${ok} right. Mostly ${esc(top)}.</p></div></section>`;
  })();
  const seen = () => { P.seen = Date.now(); saveP(); };
  setInterval(seen, 30e3); addEventListener('pagehide', seen); document.addEventListener('visibilitychange', () => { if (document.hidden) seen(); });

  /* routine editing */
  const changed = () => { saveP(); cache.clear(); MIR = null; dirty = true; tick(); };
  for (const k of Object.keys(DEF)) if (k !== 'days') $('r-' + k).addEventListener('change', e => { if (/^\d\d:\d\d$/.test(e.target.value)) { P.r[k] = e.target.value; changed(); } });
  $('dows').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const d = +b.dataset.d, on = P.r.days.includes(d);
    P.r.days = on ? P.r.days.filter(x => x !== d) : [...P.r.days, d]; b.setAttribute('aria-pressed', String(!on)); changed();
  });
  $('off').addEventListener('change', e => { const k = dkey(new Date()); P.off = P.off.filter(x => x !== k); if (e.target.checked) P.off.push(k); changed(); });
  $('mot').addEventListener('change', e => { motion = e.target.checked; P.motion = motion; saveP(); setMotion(); tick(); });
  playEl.addEventListener('click', () => tour ? stopTour() : startTour());
  if (popEl) popEl.addEventListener('click', popOut);

  /* Archeron saves in another tab or window → the storage event fires here; a 1-second check covers the rest */
  function refresh() {
    lastRefresh = Date.now();
    if (loadS()) { if (!S) { location.reload(); return; } SUBS = null; MIR = null; cache.clear(); dirty = true; }
    tick();
  }
  addEventListener('storage', e => { if (!e.key || e.key === KEY || e.key === 'archeron-profiles') refresh(); });
  setInterval(() => { if (Date.now() - lastRefresh > 900) refresh(); }, 1000);
  tick(); SCENE.frame(Date.now(), cur.info, motion); startLoop();
})();
