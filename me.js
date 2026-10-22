/* Archeron · profiles and set-up. Loaded after stats.js and before app.js.
   At load it only decides which profile's storage app.js should open; everything else runs after the app has started.
   Several people can share a device: each profile has its own saved progress and timer, picked on "Who's revising?".
   There are no passwords (no server), so profiles separate progress, they do not protect it.
   Whoever used Archeron on this device before profiles existed becomes the first profile, LEGACY, and keeps the original
   storage keys: nothing is copied or moved, so nothing can be lost in the change. */
'use strict';
const ME = (() => {
  const P = 'archeron', IDX = P + '-profiles', WHO = P + '-who', LEGACY = 'me0';
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
  const newId = () => 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
  let idx = (() => { try { const v = JSON.parse(get(IDX)); if (v && Array.isArray(v.list)) return v; } catch (e) {} return { list: [], active: null }; })();
  const saveIdx = () => put(IDX, JSON.stringify(idx));
  if (!idx.list.length) { const id = get('archeron-v2') || get('nightwatch-v1') ? LEGACY : newId(); idx.list.push({ id, name: '', av: null }); idx.active = id; saveIdx(); }
  let who = null; try { who = sessionStorage.getItem(WHO); } catch (e) {}
  const active = idx.list.some(p => p.id === who) ? who : idx.list.some(p => p.id === idx.active) ? idx.active : idx.list[0].id;
  const keys = active === LEGACY ? { state: 'archeron-v2', timer: 'archeron-timer', tab: 'archeron-tab', old: 'nightwatch-v1' }
    : { state: P + '-p-' + active, timer: P + '-t-' + active, tab: P + '-tab-' + active, old: P + '-none' };
  const choose = id => { try { sessionStorage.setItem(WHO, id); } catch (e) {} idx.active = id; saveIdx(); location.reload(); };

  /* ---------- the subjects anyone can pick. tracks = the question banks behind it; none means planning and tracking only ---------- */
  const SCI = 'Science and Maths', ENG = 'English', OTH = 'Other subjects';
  const CAT = [
    [SCI, 'maths', 'Maths', ['maths'], 'Maths', { tier: 1 }], [SCI, 'combined', 'Combined Science', ['biology', 'chemistry', 'physics'], 'Science', { tier: 1 }],
    [SCI, 'biology', 'Biology', ['biology'], 'Science', { tier: 1 }], [SCI, 'chemistry', 'Chemistry', ['chemistry'], 'Science', { tier: 1 }], [SCI, 'physics', 'Physics', ['physics'], 'Science', { tier: 1 }],
    [SCI, 'statistics', 'Statistics', [], 'Statistics', { tier: 1 }], [SCI, 'further', 'Further Maths (Level 2)', [], 'Further Maths', {}],
    [ENG, 'englang', 'English Language', ['englang'], 'English Language', {}], [ENG, 'englit', 'English Literature', ['englit'], 'English Literature', { texts: 1 }],
    ...[['art', 'Art and Design'], ['business', 'Business', ['business']], ['citizenship', 'Citizenship'], ['compsci', 'Computer Science', ['compsci']], ['dt', 'Design and Technology'], ['drama', 'Drama'],
      ['economics', 'Economics'], ['food', 'Food Preparation and Nutrition'], ['french', 'French', ['french'], { tier: 1 }], ['geography', 'Geography', ['geography']], ['german', 'German', [], { tier: 1 }],
      ['history', 'History', ['history']], ['latin', 'Latin'], ['media', 'Media Studies'], ['music', 'Music'], ['pe', 'Physical Education'], ['psychology', 'Psychology'], ['re', 'Religious Studies', ['re'], { relig: 1 }],
      ['sociology', 'Sociology'], ['spanish', 'Spanish', ['spanish'], { tier: 1 }]].map(([id, name, tr, f]) => [OTH, id, name, tr || [], id === 're' ? 'RE' : name, f || {}])
  ].map(([group, id, name, tracks, grade, f]) => ({ group, id, name, tracks, grade, ...f }));
  const byId = Object.fromEntries(CAT.map(c => [c.id, c]));
  const BOARDS = ['AQA', 'Edexcel', 'OCR', 'WJEC Eduqas', 'CCEA'];
  /* set texts and religions the banks cover, by the topic-id fragments that belong to them */
  const TEXTS = [['mac', 'Macbeth', 'Shakespeare'], ['acc', 'A Christmas Carol', '19th-century novel'], ['je', "Journey's End", 'Modern text'], ['poe', 'Power and Conflict', 'Poetry anthology']];
  const NOT_YET = { Shakespeare: 'Romeo and Juliet, The Tempest, Much Ado…', '19th-century novel': 'Jekyll and Hyde, Frankenstein…', 'Modern text': 'An Inspector Calls, Blood Brothers…', 'Poetry anthology': 'Love and Relationships…' };
  const RELIG = [['chr', 'Christianity'], ['isl', 'Islam']], RELIG_NOT = 'Judaism, Buddhism, Hinduism, Sikhism';
  const topicText = id => { const m = id.match(/(mac|acc|je|poe)/); return m && m[1]; };
  const topicRelig = id => { const m = id.match(/-(chr|isl)/); return m && m[1]; };

  /* ---------- 24 original avatars, drawn in code: 6 creature shapes × 4 eye styles, 8 colours ---------- */
  const AV_COL = ['#5b8def', '#f08a5d', '#3cb48b', '#e5b33a', '#e57aa5', '#8f7be6', '#4fb3c8', '#e2645f'];
  function avatarSvg(i) {
    const c = AV_COL[(i * 3) % 8], shape = i % 6, eyes = Math.floor(i / 6) % 4, bg = c + '33';
    let s = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="${bg}"/>`;
    if (shape === 1) s += `<path d="M16 26 L20 10 L28 20 Z M48 26 L44 10 L36 20 Z" fill="${c}"/>`;
    if (shape === 3) s += `<circle cx="18" cy="18" r="7" fill="${c}"/><circle cx="46" cy="18" r="7" fill="${c}"/>`;
    if (shape === 4) s += `<path d="M32 16 V7" stroke="${c}" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="6" r="4" fill="${c}"/>`;
    if (shape === 5) s += `<path d="M18 22 Q14 10 22 12 Z M46 22 Q50 10 42 12 Z" fill="#fff" stroke="${c}" stroke-width="2"/>`;
    s += shape === 2 ? `<path d="M14 54 V32 a18 18 0 0 1 36 0 V54 l-6 -5 -6 5 -6 -5 -6 5 -6 -5 Z" fill="${c}"/>` : `<circle cx="32" cy="36" r="19" fill="${c}"/>`;
    const E = [[25, 33], [39, 33]];
    if (eyes === 0) s += E.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#1c2033"/>`).join('');
    if (eyes === 1) s += E.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#fff"/><circle cx="${x + 1}" cy="${y + 1}" r="3" fill="#1c2033"/><circle cx="${x + 2}" cy="${y - 1}" r="1" fill="#fff"/>`).join('');
    if (eyes === 2) s += E.map(([x, y]) => `<path d="M${x - 4} ${y} q4 4 8 0" stroke="#1c2033" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join('');
    if (eyes === 3) s += `<circle cx="32" cy="32" r="8" fill="#fff"/><circle cx="33" cy="33" r="4" fill="#1c2033"/><circle cx="35" cy="30" r="1.4" fill="#fff"/>`;
    s += `<path d="M27 44 q5 4 10 0" stroke="#1c2033" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
    return s;
  }
  function avatarEl(av, size = 48) {
    const el = document.createElement('span'); el.className = 'me-av'; el.style.width = el.style.height = size + 'px';
    if (av && av.k === 'p' && /^data:image\/(jpeg|png|webp);base64,/.test(av.d || '')) { const im = new Image(); im.src = av.d; im.alt = ''; el.append(im); }
    else el.innerHTML = avatarSvg(av && av.k === 'a' ? av.i : 0);
    return el;
  }
  /* a chosen photo is shrunk to 160px and kept only on this device */
  function photoFrom(file) {
    return new Promise((ok, no) => {
      if (!file || !/^image\//.test(file.type)) return no(new Error('not an image'));
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => { const c = document.createElement('canvas'), z = 160, s = Math.min(im.width, im.height); c.width = c.height = z;
        c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, z, z); URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', .82)); };
      im.onerror = () => { URL.revokeObjectURL(url); no(new Error('could not read')); };
      im.src = url;
    });
  }

  /* ---------- the weekly plan, built from the subjects, grades and how much time each day has ---------- */
  const LOAD = [0, 1, 3, 5], LOAD_NAME = ['None', 'A little', 'Normal', 'Big'];
  const gn = g => { const n = parseInt(g, 10); return Number.isFinite(n) ? n : null; };
  function buildPlan(me) {
    const days = [1, 2, 3, 4, 5, 6, 0], cap = Object.fromEntries(days.map(w => [w, LOAD[me.avail[w] || 0]])), total = days.reduce((n, w) => n + cap[w], 0);
    const subs = me.subs.map(s => { const c = byId[s.id], cur = gn(s.cur) ?? 4, tgt = gn(s.tgt) ?? cur + 1;
      const core = ['maths', 'englang', 'englit', 'combined'].includes(s.id) ? .5 : 0, size = s.id === 'combined' ? 1.6 : 1;
      return { s, c, w: (1 + Math.max(0, tgt - cur) * .6 + core) * size }; });
    const fixes = total >= 12 ? 1 : 0, pool = total - fixes, alloc = new Map(subs.map(x => [x, 0]));
    if (pool >= subs.length) subs.forEach(x => alloc.set(x, 1));
    let left = pool - [...alloc.values()].reduce((a, b) => a + b, 0);
    const W = subs.reduce((a, x) => a + x.w, 0);
    const want = subs.map(x => ({ x, f: left * x.w / W }));
    want.forEach(o => { alloc.set(o.x, alloc.get(o.x) + Math.floor(o.f)); });
    left = pool - [...alloc.values()].reduce((a, b) => a + b, 0);
    want.sort((a, b) => (b.f % 1) - (a.f % 1)).slice(0, Math.max(0, left)).forEach(o => alloc.set(o.x, alloc.get(o.x) + 1));
    /* spread each subject over different days: the subject with the most sets goes first, each set to the emptiest day that has not had it yet */
    const room = { ...cap }, put2 = Object.fromEntries(days.map(w => [w, new Map()])), sciRot = ['Biology', 'Chemistry', 'Physics'];
    let sci = 0;
    const label = x => x.c.id === 'combined' ? 'Science: ' + sciRot[sci++ % 3] : ['biology', 'chemistry', 'physics'].includes(x.c.id) ? 'Science: ' + x.c.name : x.c.name;
    for (const x of [...subs].sort((a, b) => alloc.get(b) - alloc.get(a))) for (let k = 0; k < alloc.get(x); k++) {
      const order = days.filter(w => room[w] > 0).sort((a, b) => (put2[a].has(x.c.id) - put2[b].has(x.c.id)) || room[b] - room[a]); if (!order.length) break;
      const w = order[0], lb = put2[w].has(x.c.id) ? put2[w].get(x.c.id).label : label(x);
      const it = put2[w].get(x.c.id) || { label: lb, sets: 0 }; it.sets++; put2[w].set(x.c.id, it); room[w]--;
    }
    if (fixes) { const w = days.filter(d => room[d] > 0).sort((a, b) => room[b] - room[a])[0] ?? days.sort((a, b) => cap[b] - cap[a])[0]; put2[w].set('fixes', { label: 'Mistakes list redo (all subjects)', sets: 1 }); }
    /* the biggest day gets the Maths past paper */
    const big = days.filter(w => cap[w] >= 5)[0];
    if (big != null && put2[big].has('maths') && put2[big].get('maths').sets >= 2) put2[big].get('maths').label = 'Maths past paper + corrections';
    const TIMES = { wk: ['16:30', '17:30', '18:30', '19:30', '20:15'], we: ['10:00', '11:30', '13:30', '15:00', '16:30'] };
    const plan = {};
    for (const w of days) {
      const T = (w === 0 || w === 6) ? TIMES.we : TIMES.wk, items = [...put2[w].values()];
      plan[w] = items.length ? items.map((it, i) => ({ id: `u${w}-${i}`, t: T[i] || 'Evening', label: it.label, sets: it.sets, kind: 'train' }))
        : [{ id: `u${w}-0`, t: 'Evening', label: 'Rest day', sets: 0, kind: 'rest' }];
    }
    return plan;
  }

  /* ---------- apply a finished set-up to the app's saved state ---------- */
  function apply(me, rebuild) {
    S.me = me; S.profile.name = me.name; S.mock = me.mock;
    for (const s of me.subs) { const c = byId[s.id]; if (!c) continue; const g = S.grades[c.grade] = S.grades[c.grade] || {}; if (gn(s.cur) != null) g.cur = String(s.cur); if (gn(s.tgt) != null) g.tgt = String(s.tgt); }
    const tracks = new Set(me.subs.flatMap(s => (byId[s.id] || { tracks: [] }).tracks)), lit = me.subs.find(s => s.id === 'englit'), re = me.subs.find(s => s.id === 're');
    const mathsTier = (me.subs.find(s => s.id === 'maths') || {}).tier; /* Higher-only Maths topics are hidden on Foundation */
    S.hidden = {};
    for (const id of Object.keys(LEARN.TOPIC)) {
      const t = LEARN.TOPIC[id].subject, tx = topicText(id), rl = topicRelig(id);
      if (!tracks.has(t) || (LEARN.TOPIC[id].tier === 'H' && mathsTier !== 'Higher') || (t === 'englit' && tx && lit && !(lit.texts || []).includes(tx)) || (t === 're' && rl && re && !(re.relig || []).includes(rl))) S.hidden[id] = true;
    }
    if (rebuild) S.plan = buildPlan(me);
    const p = idx.list.find(x => x.id === active); if (p) { p.name = me.name; p.av = me.av; saveIdx(); }
    save();
  }
  const tracks = () => S && S.me ? new Set(S.me.subs.flatMap(s => (byId[s.id] || { tracks: [] }).tracks)) : null;
  /* a planned set for a subject with no question bank: revise it your own way, with the timer */
  function selfSubject(label) {
    if (!S || !S.me) return null;
    const c = S.me.subs.map(s => byId[s.id]).find(c => c && !c.tracks.length && label.toLowerCase().includes(c.name.toLowerCase()));
    return c ? { id: 'self', subj: null, own: c.name, title: `${c.name} revision`, steps: [`Pick one topic from your ${c.name} specification`, 'Write everything you remember about it on one page, then check your notes and fill the gaps in another colour',
      'Finish with exam questions from your board’s website, marked with the mark scheme', 'Practice questions for this subject are coming to Archeron'] } : null;
  }
  function selfPriority(label) {
    const c = S.me && S.me.subs.find(s => byId[s.id] && label.toLowerCase().includes(byId[s.id].name.toLowerCase())); if (!c) return 0;
    const cur = gn(c.cur) ?? 4, tgt = gn(c.tgt) ?? cur + 1; return Math.max(0, tgt - cur) * 10 + Math.max(0, 5 - cur) * 4 + 5;
  }

  /* ---------- the set-up flow: a full-screen sheet over the app ---------- */
  const STEPS = ['You', 'Year', 'Subjects', 'Boards', 'Grades', 'Dates', 'Time', 'Your week'];
  let D = null, step = 0, root = null, err = '', search = '';
  const dig = v => (String(v || '').match(/[1-9]/) || [''])[0];
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  function defaultsFor(year) {
    const now = new Date(), y = now.getFullYear(), m = now.getMonth(), schoolYear = m >= 7 ? y : y - 1; /* September starts the school year */
    return year === 10 ? { mock: `${schoolYear + 1}-06-14`, exams: `${schoolYear + 2}-05-10` } : { mock: `${schoolYear + 1}-01-11`, exams: `${schoolYear + 1}-05-10` };
  }
  function blank() { const d = defaultsFor(11); return { name: '', av: { k: 'a', i: Math.floor(Math.random() * 24) }, year: 11, subs: [], mock: d.mock, exams: d.exams, avail: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 3, 0: 1 }, ok: true }; }
  /* check = the one-time welcome for whoever used Archeron before set-up existed: their own set-up, filled in, from the start.
     Grades come only from what was typed on this device, never from the built-in report. */
  function open(edit, check) {
    D = (edit || check) && S.me ? JSON.parse(JSON.stringify(S.me)) : blank(); D.edit = !!(edit || check); D.check = !!check; step = check ? -1 : edit ? 2 : 0; err = ''; search = '';
    if (check) for (const s of D.subs) { const g = (byId[s.id] && S.grades[byId[s.id].grade]) || {}; s.cur = dig(g.cur); s.tgt = dig(g.tgt); }
    if (!root) { root = document.createElement('div'); root.id = 'su'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Set up Archeron'); document.body.append(root); }
    document.documentElement.classList.add('su-open'); paint();
    root.addEventListener('click', onClick); root.addEventListener('input', onInput); root.addEventListener('change', onChange);
  }
  function close() { if (!root) return; root.remove(); root = null; document.documentElement.classList.remove('su-open'); }
  const firstStep = () => D.check ? -1 : D.edit ? 2 : 0;
  /* once the first person has checked their own set-up, the built-in report grades are no longer used for anyone */
  function forgetReport() { if (typeof REPORT !== 'undefined') for (const k of Object.keys(REPORT)) delete REPORT[k]; }
  const sub = id => D.subs.find(s => s.id === id);
  function valid() {
    if (step === 0 && !D.name.trim()) return 'Type your name (or a nickname) first.';
    if (step === 2 && !D.subs.length) return 'Pick at least one subject.';
    if (step === 6 && ![0, 1, 2, 3, 4, 5, 6].some(w => D.avail[w] > 0)) return 'Pick at least one day you can revise.';
    if (step === 5 && (!/^\d{4}-\d{2}-\d{2}$/.test(D.mock) || !/^\d{4}-\d{2}-\d{2}$/.test(D.exams))) return 'Pick both dates.';
    return '';
  }
  const ACT = {
    next() { err = valid(); if (err) return paint(); if (step < STEPS.length - 1) { step++; paint(true); } },
    back() { err = ''; if (step > firstStep()) { step--; paint(true); } else if (D.edit && !D.check) close(); },
    av(b) { D.av = { k: 'a', i: +b.dataset.i }; paint(); },
    year(b) { D.year = +b.dataset.y; const d = defaultsFor(D.year); D.mock = d.mock; D.exams = d.exams; paint(); },
    subj(b) { const id = b.dataset.id, i = D.subs.findIndex(s => s.id === id);
      if (i >= 0) D.subs.splice(i, 1);
      else { if (id === 'combined') D.subs = D.subs.filter(s => !['biology', 'chemistry', 'physics'].includes(s.id)); if (['biology', 'chemistry', 'physics'].includes(id)) D.subs = D.subs.filter(s => s.id !== 'combined');
        D.subs.push({ id, board: 'AQA', tier: byId[id].tier ? 'Higher' : null, cur: '', tgt: '', texts: id === 'englit' ? TEXTS.map(t => t[0]) : undefined, relig: id === 're' ? RELIG.map(r => r[0]) : undefined }); }
      err = ''; paint(); },
    board(b) { sub(b.dataset.id).board = b.dataset.v; paint(); },
    tier(b) { sub(b.dataset.id).tier = b.dataset.v; paint(); },
    text(b) { const s = sub('englit'), a = s.texts = s.texts || [], k = b.dataset.v; s.texts = a.includes(k) ? a.filter(x => x !== k) : [...a, k]; paint(); },
    relig(b) { const s = sub('re'), a = s.relig = s.relig || [], k = b.dataset.v; s.relig = a.includes(k) ? a.filter(x => x !== k) : [...a, k]; paint(); },
    load(b) { D.avail[+b.dataset.w] = +b.dataset.v; err = ''; paint(); },
    photo() { root.querySelector('#su-file').click(); },
    finish() {
      const me = { name: D.name.trim().slice(0, 24), av: D.av, year: D.year, subs: D.subs.map(s => ({ ...s })), mock: D.mock, exams: D.exams, avail: { ...D.avail }, ok: true };
      apply(me, true); close();
      try { sessionStorage.setItem(WHO, active); } catch (e) {}
      location.reload();
    },
    keepPlan() { const me = { ...S.me, ...D, subs: D.subs.map(s => ({ ...s })), ok: true }; delete me.edit; delete me.check; apply(me, false); close(); forgetReport(); render(); toast('Set-up saved. Your plan is unchanged.'); },
    skip() { for (const s of S.me.subs) { const g = (byId[s.id] && S.grades[byId[s.id].grade]) || {}; s.cur = dig(g.cur); s.tgt = dig(g.tgt); } S.me.ok = true; save(); close(); forgetReport(); render(); },
    cancel() { close(); }
  };
  function onClick(e) { const b = e.target.closest('[data-su]'); if (!b || b.disabled) return; ACT[b.dataset.su](b); }
  function onInput(e) { const t = e.target;
    if (t.id === 'su-name') { D.name = t.value; err = ''; }
    if (t.id === 'su-search') { search = t.value; paint(false, '#su-search'); } }
  function onChange(e) { const t = e.target;
    if (t.id === 'su-file') photoFrom(t.files[0]).then(d => { D.av = { k: 'p', d }; paint(); }, () => { err = 'That file could not be used as a picture. Try a JPG or PNG.'; paint(); });
    if (t.dataset.grade) { const s = sub(t.dataset.id); s[t.dataset.grade] = t.value; }
    if (t.id === 'su-mock') D.mock = t.value; if (t.id === 'su-exams') D.exams = t.value; }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const btn = (label, act, cls = '', data = '') => `<button type="button" class="btn ${cls}" data-su="${act}" ${data}>${label}</button>`;
  const chipB = (label, on, act, data) => `<button type="button" class="chip${on ? ' on' : ''}" aria-pressed="${!!on}" data-su="${act}" ${data}>${label}</button>`;
  const ready = c => c.tracks.length ? '<span class="su-tag ok">Practice ready</span>' : '<span class="su-tag">Plan and track</span>';
  function stepHtml() {
    if (step === -1) return `<h1>Archeron has changed</h1><p class="muted">It now works around you: your subjects, your tiers, your grades and your dates. The next screens are filled in with a guess. Change anything that is not right.</p>
      <div class="su-card"><b>What is new</b><ul class="su-new"><li>Foundation or Higher for Maths and Science, with Higher-only topics and Higher papers</li><li>Topics get harder as you get them right (levels 1 to 3)</li><li>The Daily five: five Maths questions, the same for everyone each day</li><li>Pictures on questions</li><li>More subjects: History, Computer Science, French and Spanish</li></ul></div>
      <div class="su-card"><b>What stays the same</b><p class="muted xs">Your progress, your ticks and your weekly plan. Nothing is deleted.</p></div>
      <div class="row">${btn('Skip, keep everything as it is', 'skip', 'link')}</div>`;
    if (step === 0) return `<h1>Set up Archeron for you</h1><p class="muted">Two minutes. You can change any of this later in Toolkit.</p>
      <label class="su-l" for="su-name">Your name or a nickname</label><input id="su-name" maxlength="24" autocomplete="off" value="${esc(D.name)}" placeholder="e.g. Sam">
      <p class="su-l">Pick a picture</p><div class="su-avs">${Array.from({ length: 24 }, (_, i) => `<button type="button" class="su-av${D.av.k === 'a' && D.av.i === i ? ' on' : ''}" data-su="av" data-i="${i}" aria-label="Avatar ${i + 1}" aria-pressed="${D.av.k === 'a' && D.av.i === i}">${avatarSvg(i)}</button>`).join('')}</div>
      <div class="row"><span class="su-me"></span>${btn('Use my own photo', 'photo', 'ghost sm')}<input type="file" id="su-file" accept="image/*" hidden></div>
      <p class="muted xs">A photo stays on this device and is never uploaded.</p>`;
    if (step === 1) return `<h1>Which year are you in?</h1><p class="muted">This sets the usual dates for your mocks and exams.</p>
      <div class="su-big">${[10, 11].map(y => `<button type="button" class="su-opt${D.year === y ? ' on' : ''}" data-su="year" data-y="${y}" aria-pressed="${D.year === y}"><b>Year ${y}</b><small>${y === 11 ? 'Exams this summer' : 'Exams next year'}</small></button>`).join('')}</div>`;
    if (step === 2) { const q = search.trim().toLowerCase(), groups = [SCI, ENG, OTH];
      return `<h1>Your GCSE subjects</h1><p class="muted">Practice ready subjects have questions in Archeron. The rest still get a place in your plan, your timer and your grades.</p>
        <input id="su-search" placeholder="Search subjects" value="${esc(search)}" autocomplete="off" aria-label="Search subjects">
        ${groups.map(g => { const list = CAT.filter(c => c.group === g && (!q || c.name.toLowerCase().includes(q))); return list.length ? `<p class="su-g">${g}</p><div class="su-list">${list.map(c => { const on = !!sub(c.id);
          return `<button type="button" class="su-sub${on ? ' on' : ''}" data-su="subj" data-id="${c.id}" aria-pressed="${on}"><span>${esc(c.name)}</span>${ready(c)}<span class="su-pm" aria-hidden="true">${on ? '✓' : '+'}</span></button>`; }).join('')}</div>` : ''; }).join('')}
        <p class="muted xs">${D.subs.length} picked. Combined Science or separate sciences, not both.</p>`; }
    if (step === 3) return `<h1>Boards and tiers</h1><p class="muted">Questions in Archeron are written for AQA. Most of the content overlaps with other boards, but the question styles will not always match your papers.</p>
      ${D.subs.map(s => { const c = byId[s.id]; return `<div class="su-card"><b>${esc(c.name)}</b>
        <div class="chips">${BOARDS.map(b => chipB(b, s.board === b, 'board', `data-id="${s.id}" data-v="${b}"`)).join('')}</div>
        ${c.tier ? `<div class="chips">${['Foundation', 'Higher'].map(t => chipB(t, s.tier === t, 'tier', `data-id="${s.id}" data-v="${t}"`)).join('')}</div>${s.tier === 'Higher' && c.tracks.length ? (s.id === 'maths' ? '<p class="muted xs">You also get the Higher-only topics: the quadratic formula, completing the square, the sine and cosine rules, functions, surds and more, plus Higher practice papers.</p>' : '<p class="muted xs">You get Higher practice papers. The quick-fire questions are the ones both tiers share.</p>') : ''}` : ''}
        ${s.board !== 'AQA' && c.tracks.length ? `<p class="muted xs">Questions are written for AQA: the content mostly overlaps with ${esc(s.board)}.</p>` : ''}
        ${c.texts ? `<p class="su-l">Your set texts</p><div class="chips">${TEXTS.map(([k, n, kind]) => chipB(`${n} <small>${kind}</small>`, (s.texts || []).includes(k), 'text', `data-v="${k}"`)).join('')}</div><p class="muted xs">Not in Archeron yet: ${Object.values(NOT_YET).join('; ')}.</p>` : ''}
        ${c.relig ? `<p class="su-l">Your religions</p><div class="chips">${RELIG.map(([k, n]) => chipB(n, (s.relig || []).includes(k), 'relig', `data-v="${k}"`)).join('')}</div><p class="muted xs">Not in Archeron yet: ${RELIG_NOT}.</p>` : ''}</div>`; }).join('')}`;
    if (step === 4) { const opts = (v, notSure) => `<option value=""${!v ? ' selected' : ''}>${notSure}</option>` + [9, 8, 7, 6, 5, 4, 3, 2, 1].map(g => `<option value="${g}"${String(v) === String(g) ? ' selected' : ''}>${g}</option>`).join('');
      return `<h1>Where are you now?</h1><p class="muted">Your current working grade and the grade you are aiming for. Not sure is fine: your practice and papers will show it soon.</p>
        <div class="su-grades"><span></span><small>Now</small><small>Aim</small>${D.subs.map(s => `<b>${esc(byId[s.id].name)}</b>
        <select data-grade="cur" data-id="${s.id}" aria-label="${esc(byId[s.id].name)} grade now">${opts(s.cur, 'Not sure')}</select>
        <select data-grade="tgt" data-id="${s.id}" aria-label="${esc(byId[s.id].name)} grade you are aiming for">${opts(s.tgt, 'Not sure')}</select>`).join('')}</div>`; }
    if (step === 5) return `<h1>Your dates</h1><p class="muted">The countdown and your plan work back from these. Ask your teacher if you are not sure.</p>
      <label class="su-l" for="su-mock">Mocks start</label><input type="date" id="su-mock" value="${esc(D.mock)}">
      <label class="su-l" for="su-exams">Real exams start</label><input type="date" id="su-exams" value="${esc(D.exams)}">`;
    if (step === 6) return `<h1>When can you revise?</h1><p class="muted">A set is 25 minutes. A little is 1 set, normal is 3, big is 5. Rest days are part of the plan.</p>
      <div class="su-days">${[1, 2, 3, 4, 5, 6, 0].map(w => `<b>${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][w]}</b><div class="chips">${LOAD_NAME.map((n, v) => chipB(n, (D.avail[w] || 0) === v, 'load', `data-w="${w}" data-v="${v}"`)).join('')}</div>`).join('')}</div>
      <p class="muted xs">${[0, 1, 2, 3, 4, 5, 6].reduce((n, w) => n + LOAD[D.avail[w] || 0], 0)} sets a week, about ${Math.round([0, 1, 2, 3, 4, 5, 6].reduce((n, w) => n + LOAD[D.avail[w] || 0], 0) * 25 / 60)} hours.</p>`;
    const plan = buildPlan(D);
    return `<h1>Your week</h1><p class="muted">Subjects furthest from their aim get more sets, every subject gets at least one, and each subject is spread across the week. You can move anything in Toolkit, Plan.</p>
      <div class="su-week">${[1, 2, 3, 4, 5, 6, 0].map(w => `<div><b>${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][w]}</b>${plan[w].map(it => `<span class="${it.kind}">${esc(it.label)}${it.sets ? ` <em>×${it.sets}</em>` : ''}</span>`).join('')}</div>`).join('')}</div>
      ${D.edit ? `<p class="muted xs">Building a new week replaces your current plan. Ticks already done are kept.</p>` : ''}`;
  }
  function paint(moved, keepFocus) {
    if (!root) return;
    const was = root.querySelector('.su-body'), keepY = was && !moved ? was.scrollTop : 0; /* a tap redraws the sheet: stay where you were */
    const pct = Math.round((step + 1) / STEPS.length * 100), last = step === STEPS.length - 1, first = step === firstStep();
    root.innerHTML = `<div class="su-top"><span class="su-logo">Archeron</span><div class="su-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Set-up progress"><i style="width:${pct}%"></i></div>${D.edit && !D.check ? btn('✕', 'cancel', 'ghost icon-only', 'aria-label="Close set-up"') : '<span></span>'}</div>
      <div class="su-body">${stepHtml()}${err ? `<p class="su-err" role="alert">${esc(err)}</p>` : ''}</div>
      <div class="su-foot">${first ? '<span></span>' : btn('Back', 'back', 'ghost')}${last ? (D.check ? btn('Build a new week', 'finish', 'ghost') + btn('Keep my plan', 'keepPlan', 'primary') : D.edit ? btn('Keep my plan', 'keepPlan', 'ghost') + btn('Build my new week', 'finish', 'primary') : btn('Start revising', 'finish', 'primary')) : btn(step === -1 ? 'Check my set-up' : 'Next', 'next', 'primary')}</div>`;
    const me = root.querySelector('.su-me'); if (me) me.append(avatarEl(D.av, 56));
    if (keepY) root.querySelector('.su-body').scrollTop = keepY;
    if (keepFocus) { const f = root.querySelector(keepFocus); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }
    else if (moved) { root.querySelector('.su-body').scrollTop = 0; const h1 = root.querySelector('h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); } }
  }

  /* ---------- Who's revising? ---------- */
  function picker() {
    const el = document.createElement('div'); el.id = 'su'; el.className = 'pick'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', "Who's revising?");
    el.innerHTML = `<div class="su-body pick-b"><h1>Who's revising?</h1><div class="pick-list"></div><p class="muted xs">Profiles keep each person's progress separate on this device. Anyone using it can open them.</p></div>`;
    const list = el.querySelector('.pick-list');
    for (const p of idx.list) { const b = document.createElement('button'); b.type = 'button'; b.className = 'pick-p' + (p.id === active ? ' on' : ''); b.append(avatarEl(p.av, 72)); const n = document.createElement('b'); n.textContent = p.name || 'New profile'; b.append(n); b.onclick = () => p.id === active ? (sessionStorage.setItem(WHO, p.id), el.remove(), document.documentElement.classList.remove('su-open')) : choose(p.id); list.append(b); }
    const add = document.createElement('button'); add.type = 'button'; add.className = 'pick-p add'; add.innerHTML = '<span class="me-av add" style="width:72px;height:72px">+</span><b>Add someone</b>'; add.onclick = addProfile; list.append(add);
    document.body.append(el); document.documentElement.classList.add('su-open');
  }
  function addProfile() { const id = newId(); idx.list.push({ id, name: '', av: null }); saveIdx(); choose(id); }
  function removeProfile() {
    if (!sure(`Delete ${S.me ? S.me.name + "'s" : 'this'} profile and all its progress on this device? Make a backup first if you might want it back.`)) return;
    try { for (const k of [keys.state, keys.timer, keys.tab]) localStorage.removeItem(k); } catch (e) {}
    idx.list = idx.list.filter(p => p.id !== active); if (!idx.list.length) idx.list.push({ id: newId(), name: '', av: null });
    choose(idx.list[0].id);
  }

  /* a saved set-up, checked field by field (saves and backups are only trusted in the shapes the app writes) */
  const DAY = /^\d{4}-\d{2}-\d{2}$/, GR = v => /^[1-9]$/.test(String(v)) ? String(v) : '';
  function clean(r) {
    if (!r || typeof r !== 'object' || !Array.isArray(r.subs)) return null;
    const av = r.av && r.av.k === 'p' && typeof r.av.d === 'string' && r.av.d.length < 200000 && /^data:image\/(jpeg|png|webp);base64,/.test(r.av.d) ? { k: 'p', d: r.av.d }
      : { k: 'a', i: Math.min(23, Math.max(0, Math.round(+(r.av && r.av.i) || 0))) };
    const subs = r.subs.filter(s => s && byId[s.id]).slice(0, 20).map(s => ({ id: s.id, board: BOARDS.includes(s.board) ? s.board : 'AQA', tier: byId[s.id].tier ? (s.tier === 'Foundation' ? 'Foundation' : 'Higher') : null,
      cur: GR(s.cur), tgt: GR(s.tgt), texts: s.id === 'englit' ? (Array.isArray(s.texts) ? s.texts : []).filter(k => TEXTS.some(t => t[0] === k)) : undefined,
      relig: s.id === 're' ? (Array.isArray(s.relig) ? s.relig : []).filter(k => RELIG.some(t => t[0] === k)) : undefined }));
    const avail = {}; for (let w = 0; w < 7; w++) avail[w] = Math.min(3, Math.max(0, Math.round(+(r.avail && r.avail[w]) || 0)));
    return { name: String(r.name || '').slice(0, 24), av, year: r.year === 10 ? 10 : 11, ok: !!r.ok, subs, mock: DAY.test(r.mock) ? r.mock : defaultsFor(11).mock, exams: DAY.test(r.exams) ? r.exams : defaultsFor(11).exams, avail };
  }

  /* The person who used Archeron before profiles: a first guess at their set-up from what was typed on this device (subjects,
     grades, mock date, the week they built), which they then check on the welcome screens (open with check). Their plan,
     progress and topic choices stay exactly as they were. Only topics that are new to them and not theirs are switched off. */
  function seedLegacy() {
    const subs = ['maths', 'combined', 'englang', 'englit', 'geography', 'business', 're'].map(id => {
      const c = byId[id], g = S.grades[c.grade] || {}, cur = dig(g.cur), tgt = dig(g.tgt);
      return { id, board: 'AQA', tier: c.tier ? (+tgt && +tgt <= 5 ? 'Foundation' : 'Higher') : null, cur, tgt, texts: id === 'englit' ? TEXTS.map(t => t[0]) : undefined, relig: id === 're' ? RELIG.map(t => t[0]) : undefined };
    });
    const avail = {}; for (let w = 0; w < 7; w++) { const n = (S.plan[w] || []).reduce((a, s) => a + (s.kind === 'train' ? s.sets : 0), 0); avail[w] = n >= 5 ? 3 : n >= 3 ? 2 : n >= 1 ? 1 : 0; }
    S.me = { name: (S.profile.name || 'Me').slice(0, 24), av: { k: 'a', i: Math.floor(Math.random() * 24) }, year: 11, subs, mock: S.mock, exams: defaultsFor(11).exams, avail };
    const tr = tracks(), mt = subs[0].tier;
    for (const id of Object.keys(LEARN.TOPIC)) if (!tr.has(LEARN.TOPIC[id].subject) || (LEARN.TOPIC[id].tier === 'H' && mt !== 'Higher')) S.hidden[id] = true;
    const p = idx.list.find(x => x.id === LEGACY); if (p) { p.name = S.me.name; p.av = S.me.av; saveIdx(); }
    save();
  }
  /* after the app has started: first visit → set-up; several profiles and a new session → who's revising */
  function start() {
    let chosen = null; try { chosen = sessionStorage.getItem(WHO); } catch (e) {}
    if (!S.me && active === LEGACY) seedLegacy();
    if (!S.me) return open(false);
    if (active === LEGACY && !S.me.ok) return open(false, true);
    if (S.me.ok && typeof REPORT !== 'undefined' && Object.keys(REPORT).length) { forgetReport(); render(); }
    if (idx.list.length > 1 && !chosen) return picker();
    try { sessionStorage.setItem(WHO, active); } catch (e) {}
  }
  /* the card at the top of Toolkit */
  function card() {
    const box = document.createElement('section'); box.className = 'card me-card';
    const top = document.createElement('div'); top.className = 'me-top'; top.append(avatarEl(S.me && S.me.av, 64));
    const t = document.createElement('div'); t.innerHTML = `<p class="eyebrow">${S.me ? 'Year ' + S.me.year : ''}</p><h2>${esc(S.me ? S.me.name : 'You')}</h2><p class="muted xs">${S.me ? S.me.subs.length + ' subjects · ' + S.me.subs.filter(s => byId[s.id] && byId[s.id].tracks.length).length + ' with practice questions' : ''}</p>`;
    top.append(t); box.append(top);
    const row = document.createElement('div'); row.className = 'row';
    const mk = (label, fn, cls) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + cls; b.textContent = label; b.onclick = fn; row.append(b); };
    mk('Edit set-up', () => open(true), 'primary sm'); mk(idx.list.length > 1 ? 'Switch profile' : 'Add someone', () => idx.list.length > 1 ? picker() : addProfile(), 'ghost sm'); mk('Delete profile', removeProfile, 'ghost sm danger-t');
    box.append(row); return box;
  }
  return { keys, start, open, card, picker, clean, buildPlan, apply, tracks, selfSubject, selfPriority, avatarEl, CAT, byId, profiles: () => idx.list, active: () => active };
})();
/* the subjects this person picked (all of them before set-up), in the app's own order */
function mySubjects() { const t = ME.tracks(); return t ? LEARN.SUBJECTS.filter(s => t.has(s.id)) : LEARN.SUBJECTS; }
/* the built-in report grades belong to the person who used Archeron before profiles; nobody else sees them */
if (typeof REPORT !== 'undefined' && ME.active() !== 'me0') for (const k of Object.keys(REPORT)) delete REPORT[k];
