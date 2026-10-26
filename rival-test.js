/* One deterministic weekly paper, shared by Runo, Onur and the league students. */
(() => {
  'use strict';
  const KEY = 'weeklyTests', FILES = ['vocab.js', 'data.js', 'content.js', 'bank2.js', 'bank3.js', 'defs.js', 'defs2.js', 'bank4.js', 'bank5.js', 'chem.js', 'learn.js'];
  const pad = n => String(n).padStart(2, '0');
  const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function week(d) {
    const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    x.setUTCDate(x.getUTCDate() + 4 - (x.getUTCDay() || 7));
    const year = x.getUTCFullYear(), start = new Date(Date.UTC(year, 0, 1));
    return `${year}-W${pad(Math.ceil((((x - start) / 864e5) + 1) / 7))}`;
  }
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const readStore = () => { try { const v = JSON.parse(localStorage.getItem('archeron-rival') || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let loading;
  function loadQuestions() {
    if (typeof LEARN === 'object') return Promise.resolve();
    if (loading) return loading;
    loading = FILES.reduce((p, file) => p.then(() => new Promise((resolve, reject) => {
      const s = document.createElement('script'); s.src = file; s.onload = resolve; s.onerror = () => reject(new Error(`Couldn't load ${file}`)); document.head.append(s);
    })), Promise.resolve());
    return loading;
  }
  function paperFor(w, subjects) {
    const rand = rng(hash('archeron-weekly|' + w)), pools = [];
    for (const s of subjects) {
      const defs = LEARN.SUBJECTS.filter(x => x.id === s.id || x.name === s.name || s.tracks.includes(x.id));
      const ids = defs.flatMap(def => def.topics).filter(id => s.tracks.includes(LEARN.trackOf(id)));
      if (ids.length) pools.push(ids.slice());
    }
    for (const a of pools) for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    const ids = [], max = Math.max(0, ...pools.map(a => a.length));
    for (let i = 0; i < max; i++) for (const a of pools) if (a[i]) ids.push(a[i]);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    const out = [];
    for (const id of ids) {
      if (out.length >= 20) break;
      let q = null;
      try { const old = Math.random; Math.random = rand; try { q = LEARN.gen(id); } finally { Math.random = old; } } catch (e) { q = null; }
      if (!q || (q.kind !== 'mcq' && q.kind === 'def')) continue;
      if (q.kind !== 'mcq' && !('hint' in q)) continue;
      try { const check = LEARN.check(q, q.kind === 'mcq' ? String(q.a) : String(q.show || '')); if (!check || check.valid !== true || !check.ok) continue; } catch (e) { continue; }
      out.push(q);
    }
    return out;
  }
  function mount(el, cfg) {
    if (!el) return;
    const w = week(new Date());
    if (el.dataset.rtWeek === w) return;
    el.dataset.rtWeek = w;
    const store = readStore(), taken = store[KEY] && store[KEY][w];
    el.innerHTML = `<section class="rt-card"><div class="rt-head"><div><h2>This week's test</h2><p class="rt-sub">One shared paper · 20 questions · ${esc(w)}</p></div></div><div class="rt-body"><button type="button" class="rt-start" ${taken ? 'disabled' : ''}>${taken ? 'Test completed' : 'Open this week’s paper'}</button><div class="rt-content">${taken ? '' : '<p class="rt-note">The paper is prepared when you open it. Your result is saved on this device.</p>'}</div></div></section>`;
    const body = el.querySelector('.rt-content'), start = el.querySelector('.rt-start');
    const standings = () => {
      const s = readStore(), all = s[KEY] || {}, prev = new Date(); prev.setDate(prev.getDate() - 7);
      const keys = [w, week(prev)]; return keys.map(k => ({ week: k, results: all[k] || {} }));
    };
    function showScores() {
      const data = standings(); if (!data.length) return;
      const labels = [['you', 'You'], ['onur', 'Onur'], ['claude', 'Claude'], ['codex', 'Codex'], ['anti', 'Antigravity']];
      body.insertAdjacentHTML('beforeend', `<div class="rt-scores"><b>Weekly scores</b><div class="rt-score-grid"><span></span>${labels.map(x => `<b>${x[1]}</b>`).join('')}${data.map((x, i) => `<strong>${i ? 'Last week' : 'This week'} <small>${esc(x.week)}</small></strong>${labels.map(([k]) => { const n = x.results[k], old = data[1] && data[1].results[k], delta = !i && n != null && old != null ? ` <small>${n > old ? '+' : ''}${n - old}</small>` : ''; return `<span>${n == null ? '–' : n + '/20'}${delta}</span>`; }).join('')}`).join('')}</div></div>`);
    }
    if (taken) { start.hidden = true; body.innerHTML = `<p class="rt-score">Your score: <b>${taken.you}/20</b></p>${(taken.answers || []).map((a, i) => `<div class="rt-answer"><b>${i + 1}. ${esc(a.q)}</b><span>${a.ok ? 'Correct' : 'Answer: ' + esc(a.answer)}</span></div>`).join('')}`; showScores(); return; }
    showScores();
    start.addEventListener('click', async () => {
      start.disabled = true; body.innerHTML = '<p class="rt-note">Loading the question bank…</p>';
      try {
        await loadQuestions(); const paper = paperFor(w, cfg.subjects());
        if (paper.length !== 20) throw new Error(`Only ${paper.length} markable questions were available; try opening the test again later.`);
        let i = 0, answers = [];
        const draw = () => {
          const q = paper[i], typed = q.kind !== 'mcq';
          body.innerHTML = `<p class="rt-progress">Question ${i + 1} of 20 · ${esc(q.sub || LEARN.name(q.id))}</p><h3>${esc(q.q)}</h3>${typed ? `<label class="rt-input">${esc(q.hint || 'Your answer')}<input autocomplete="off" inputmode="text" placeholder="${esc(q.hint || '')}" aria-label="Your answer"></label><button type="button" class="rt-mark">Mark answer</button>` : `<div class="rt-options">${q.options.map((o, n) => `<button type="button" data-i="${n}">${esc(o)}</button>`).join('')}</div>`}<p class="rt-feedback" aria-live="polite"></p><button type="button" class="rt-next" hidden>${i === 19 ? 'Finish test' : 'Next question'}</button>`;
          let raw = null;
          const mark = value => { if (raw !== null) return; const res = LEARN.check(q, String(value)); if (!res.valid) { body.querySelector('.rt-feedback').textContent = res.msg || 'Choose or enter an answer.'; return; }
            raw = String(value); const ok = !!res.ok, right = q.kind === 'mcq' ? q.options[q.a] : (q.show || q.answer || q.steps && q.steps[0] || 'See explanation'); answers.push({ q: q.q, answer: right, ok });
            body.querySelectorAll('.rt-options button').forEach(b => { b.disabled = true; if (+b.dataset.i === q.a) b.classList.add('rt-right'); if (+b.dataset.i === +raw && !ok) b.classList.add('rt-wrong'); });
            const input = body.querySelector('input'); if (input) input.disabled = true;
            const markBtn = body.querySelector('.rt-mark'); if (markBtn) markBtn.disabled = true;
            body.querySelector('.rt-feedback').textContent = ok ? 'Correct' : `Answer: ${right}`; body.querySelector('.rt-next').hidden = false;
          };
          body.querySelectorAll('.rt-options button').forEach(b => b.addEventListener('click', () => mark(b.dataset.i)));
          const input = body.querySelector('input'); if (input) { input.addEventListener('keydown', e => { if (e.key === 'Enter') mark(input.value); }); body.querySelector('.rt-mark').addEventListener('click', () => mark(input.value)); }
          body.querySelector('.rt-next').addEventListener('click', () => { if (i < 19) { i++; draw(); return; } finish(); });
        };
        const finish = () => {
          const score = answers.filter(a => a.ok).length, fresh = readStore(), all = fresh[KEY] && typeof fresh[KEY] === 'object' ? fresh[KEY] : {};
          if (all[w]) { start.hidden = true; body.innerHTML = `<p class="rt-score">This week's test is already recorded: <b>${all[w].you}/20</b></p>`; showScores(); return; }
          all[w] = { you: score, answers, d: dateKey(new Date()) }; fresh[KEY] = all;
          try { localStorage.setItem('archeron-rival', JSON.stringify(fresh)); } catch (e) { body.insertAdjacentHTML('afterbegin', '<p class="rt-note">The score could not be saved because local storage is unavailable.</p>'); }
          cfg.record(paper, answers, w); start.hidden = true;
          body.innerHTML = `<p class="rt-score">Your score: <b>${score}/20</b></p>${answers.map((a, n) => `<div class="rt-answer"><b>${n + 1}. ${esc(a.q)}</b><span>${a.ok ? 'Correct' : 'Answer: ' + esc(a.answer)}</span></div>`).join('')}`; showScores();
        };
        if (paper.length) draw();
      } catch (e) { body.innerHTML = `<p class="rt-note">${esc(e.message || 'The question bank could not be loaded.')}</p>`; start.disabled = false; }
    });
  }
  globalThis.RIVALTEST = Object.freeze({ mount, week });
})();
