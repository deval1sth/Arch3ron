/* AI league: Claude, Codex and Antigravity each write a coach that plans the days of the SAME simulated student, with the
   same luck. Their days are scored by NEURONS like yours and Onur's. Spec: .sim/LEAGUE.md (the model's rules live there).
   Pure: no DOM, no storage, no clock. Everything is worked out from the date, so the table is the same on every load. */
(() => {
  'use strict';
  const P = Object.freeze({
    topicsPer: 24, teach: .12, schoolS: .7, s0: 1.5,
    lessonMin: 20, paperMin: 60, minTask: 3, maxMin: 240, pace: .5,
    drain: .004, recover: .35, restBonus: .15, tiredCut: .25, tiredMin: 20,
    fullReview: 6, okShare: .6, paperReview: .3,
    budgetMs: 20, maxBlocks: 6, maxTasks: 12, gapMin: 5, memoBytes: 8192, pastDays: 14
  });
  const START = '2026-10-26';
  const COACHES = Object.freeze(['COACH_CLAUDE', 'COACH_CODEX', 'COACH_ANTI']);
  const WEAK = new Set(['maths', 'biology', 'chemistry', 'physics', 're']);   /* NEURONS pays x1.25 for these */
  const NAMES = { maths: 'Maths', biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', englit: 'English Literature', englang: 'English Language', geography: 'Geography', business: 'Business', re: 'RE', history: 'History', compsci: 'Computer Science', french: 'French', spanish: 'Spanish' };
  const DEF = { days: [1, 2, 3, 4, 5], wake: '07:00', leave: '08:05', home: '15:50', dinner: '18:30', bed: '22:30', wwake: '09:30', wdinner: '18:30', wbed: '23:00' };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r2 = v => Math.round(v * 100) / 100;
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const valid = d => typeof d === 'string' && /^\d{4}-\d\d-\d\d$/.test(d);
  const serial = d => { const [y, m, x] = d.split('-').map(Number); return Date.UTC(y, m - 1, x) / 864e5; };
  const dateOf = n => new Date(n * 864e5).toISOString().slice(0, 10);
  const mins = s => { const [h, m] = String(s).split(':').map(Number); return clamp((h || 0) * 60 + (m || 0), 0, 1440); };
  /* local wall-clock time on day d at a (fractional) minute after midnight, safe on clock-change days */
  const at = (d, minute) => { const [y, m, x] = d.split('-').map(Number), w = Math.floor(minute); return new Date(y, m - 1, x, Math.floor(w / 60), w % 60).getTime() + Math.round((minute - w) * 6e4); };
  const dayEnd = d => { const [y, m, x] = d.split('-').map(Number); return new Date(y, m - 1, x + 1).getTime(); };
  /* recall t days after the last practice, stability S days (FSRS power law: .9 when t = S) */
  const recall = (S, t) => t <= 0 ? 1 : Math.pow(1 + 19 / 81 * t / S, -.5);
  const Rof = (tp, i) => tp.learned ? recall(tp.S, i - tp.last) : 0;
  const right = R => .2 + .75 * R;

  /* ---------- the world: subjects, routine, days off, sick days, all from rival.js ---------- */
  function norm(w) {
    w = w && typeof w === 'object' ? w : {};
    const start = valid(w.start) ? w.start : START;
    const mock = valid(w.mock) && serial(w.mock) > serial(start) ? w.mock : dateOf(serial(start) + 77);
    const seen = new Set(), subjects = [], grade = v => v == null || !Number.isFinite(+v) ? null : clamp(+v, 1, 9);
    for (const s of Array.isArray(w.subjects) ? w.subjects : []) {
      const track = String(s && s.track || '').toLowerCase();
      if (!/^[a-z]{2,12}$/.test(track) || seen.has(track)) continue;
      seen.add(track);
      subjects.push({ track, name: String(s.name || NAMES[track] || track).slice(0, 30), cur: grade(s.cur), tgt: grade(s.tgt), weak: WEAK.has(track) });
    }
    if (!subjects.length) subjects.push({ track: 'maths', name: 'Maths', cur: null, tgt: null, weak: true });
    const routine = Object.assign({}, DEF, w.routine && typeof w.routine === 'object' ? w.routine : {});
    if (!Array.isArray(routine.days)) routine.days = DEF.days;
    const sick = typeof w.isSick === 'function' ? w.isSick : () => false;
    return { start, mock, subjects, routine, off: new Set((Array.isArray(w.off) ? w.off : []).filter(valid)), isSick: d => { try { return !!sick(d); } catch (e) { return false; } }, seed: String(w.seed || 'season1') };
  }
  const luck = (W, key) => rng(hash(W.seed + '|' + key));

  /* the student's free time on day i: the same rules as Onur's day in rival.js */
  function dayInfo(W, i) {
    const d = dateOf(serial(W.start) + i), weekday = new Date(serial(d) * 864e5).getUTCDay(), sick = W.isSick(d);
    const R = W.routine, school = R.days.includes(weekday) && !W.off.has(d) && !sick;
    const wake = mins(school ? R.wake : R.wwake), dinner = mins(school ? R.dinner : R.wdinner), bed = mins(school ? R.bed : R.wbed);
    const from = school ? mins(R.home) + 30 : wake + 90, to = (bed <= wake ? 1440 : bed) - 15, free = [];
    for (const [a, b] of [[from, Math.min(to, dinner)], [Math.max(from, dinner + 40), to]]) if (b - a >= P.minTask) free.push([a, b]);
    return { d, i, weekday, school, sick, free };
  }

  /* ---------- the student on day 0: topics 1..k of each subject already known from school, k from the current grade ---------- */
  function born(W) {
    const topics = [];
    for (const s of W.subjects) {
      const k = Math.round(P.topicsPer * clamp(((s.cur == null ? 4 : s.cur) - 2) / 7, .1, .8));
      for (let n = 1; n <= P.topicsPer; n++) {
        const id = s.track + '.' + n, r = luck(W, 'start|' + id), known = n <= k, a = r(), b = r();
        topics.push({ id, track: s.track, n, learned: known, how: known ? 'start' : null, S: known ? 2 + 18 * a : 0, last: known ? -Math.round(5 + 35 * b) : null,
          learnedDay: known ? 0 : null, lastDay: null, reps: 0, right: 0, lastN: 0, lastRight: 0, paperPct: null, lastOk: null });
      }
    }
    return { topics, byId: new Map(topics.map(t => [t.id, t])), energy: 1, memo: null, papers: [], past: [], recs: [] };
  }

  /* ---------- the coach's plan, checked: anything invalid is dropped and counted ---------- */
  const KINDS = new Set(['quiz', 'learn', 'notes', 'paper']);
  function sanitise(plan, W, st) {
    const out = { blocks: [], note: '', dropped: 0, memo: null, memoDropped: false };
    out.note = String(plan.note == null ? '' : plan.note).replace(/\s+/g, ' ').trim().slice(0, 80);
    if (plan.memo !== undefined) {
      let text = null; try { text = JSON.stringify(plan.memo); } catch (e) {}
      if (text && text.length <= P.memoBytes) out.memo = text; else out.memoDropped = true;
    }
    const tracks = new Set(W.subjects.map(s => s.track));
    plan.blocks.forEach((b, bi) => {
      const tasks = b && Array.isArray(b.tasks) ? b.tasks : [], when = Math.round(+(b && b.at));
      if (bi >= P.maxBlocks || !(when >= 0 && when < 1440)) { out.dropped += Math.max(1, tasks.length); return; }
      const ok = [];
      tasks.forEach((t, ti) => {
        const kind = t && t.kind, min = kind === 'paper' ? P.paperMin : Math.round(+(t && t.min));
        const good = ti < P.maxTasks && KINDS.has(kind) && (kind === 'paper' ? tracks.has(t.track)
          : st.byId.has(t.topic) && min >= (kind === 'learn' ? P.lessonMin : P.minTask) && min <= P.maxMin);
        if (!good) { out.dropped++; return; }
        ok.push(kind === 'paper' ? { kind, track: t.track, min } : { kind, topic: t.topic, min });
      });
      if (ok.length) out.blocks.push({ at: when, tasks: ok });
    });
    out.blocks.sort((a, b) => a.at - b.at);
    return out;
  }

  /* ---------- one day: school teaches, the coach plans, the student studies, memory and energy move on ---------- */
  function simDay(W, run, i, info, total) {
    const st = run.st, coach = run.coach, { d, school, sick, free } = info, e = st.energy;
    if (school) for (const s of W.subjects) if (luck(W, 'teach|' + d + '|' + s.track)() < P.teach) {
      const tp = st.topics.find(t => t.track === s.track && !t.learned);
      if (tp) Object.assign(tp, { learned: true, how: 'school', S: P.s0 * P.schoolS, last: i, learnedDay: i });
    }
    const view = {
      d, dayIx: i, daysLeft: total - i, weekday: info.weekday, school, sick, free: free.map(w => w.slice()), energy: r2(e),
      subjects: W.subjects.map(s => Object.assign({}, s)),
      topics: st.topics.map(t => ({ id: t.id, track: t.track, n: t.n, learned: t.learned, how: t.how, learnedDay: t.learnedDay, lastDay: t.lastDay, reps: t.reps, right: t.right, lastN: t.lastN, lastRight: t.lastRight, paperPct: t.paperPct })),
      papers: st.papers.map(p => Object.assign({}, p)), past: st.past.map(p => Object.assign({}, p)),
      memo: st.memo == null ? null : JSON.parse(st.memo), rand: rng(hash(W.seed + '|' + d + '|' + run.name)), P
    };
    let raw = null, error = null;
    try { raw = coach.plan(view); } catch (err) { error = String(err && err.message || err).slice(0, 120); }
    if (!error && !(raw && typeof raw === 'object' && Array.isArray(raw.blocks))) error = 'plan() did not return { blocks: [...] }';
    const plan = error ? { blocks: [], note: 'Coach error', dropped: 0, memo: st.memo, memoDropped: false } : sanitise(raw, W, st);
    st.memo = plan.memo;

    const answers = [], log = [], events = [], blocks = [], sess = new Map(), streams = new Map();
    const stream = id => { if (!streams.has(id)) streams.set(id, luck(W, 'q|' + d + '|' + id)); return streams.get(id); };
    const cap = e < P.tiredCut ? P.tiredMin : Infinity;
    let minutes = 0, focusMin = 0, dropped = plan.dropped, clipped = 0, full = !dropped, cut = null, prevEnd = -1;
    if (sick && plan.blocks.length) { cut = 'sick'; full = false; }
    const focus = (m, blockStart, today) => Math.max(.5, 1 - (1 - e) * .2 - .004 * Math.max(0, m - blockStart - 25) - .003 * Math.max(0, today - 90) - .05 * Math.max(0, m / 60 - 21));
    const session = (tp, i0) => { if (!sess.has(tp.id)) sess.set(tp.id, { R0: Rof(tp, i0), n: 0, right: 0, last: null, paper: false, touched: true }); return sess.get(tp.id); };
    const lvl = tp => tp.S >= 21 ? 3 : tp.S >= 7 ? 2 : 1;
    function ask(tp, from, count, blockStart, before) {
      const s = session(tp, i), r = stream(tp.id); let n = 0;
      for (let j = 0; j < count; j++) {
        const m = from + (j + 1) * P.pace, ok = r() < right(Rof(tp, i)) * focus(m, blockStart, before + (m - from)), ms = 20000 + Math.round(r() * 20000);
        if (!s.n) {
          if (tp.lastOk === false && ok) events.push({ k: 'revenge', t: at(d, m) });
          if (tp.learned && tp.learnedDay < i && s.R0 >= .7 && s.R0 <= .92) events.push({ k: 'onTime', t: at(d, m) });
        }
        s.n++; if (ok) { s.right++; n++; } s.last = ok;
        answers.push({ t: at(d, m), track: tp.track, ok, lvl: lvl(tp), ms });
      }
      return n;
    }

    if (!sick) for (const b of plan.blocks) {
      const want = Math.max(b.at, prevEnd < 0 ? 0 : prevEnd + P.gapMin), w = free.find(x => x[1] - Math.max(x[0], want) >= P.minTask);
      if (!w) { dropped += b.tasks.length; full = false; continue; }
      const start = Math.max(w[0], want), done = { start, end: start, tasks: [] };
      let m = start;
      for (const t of b.tasks) {
        const room = Math.min(w[1] - m, cap - minutes), min = Math.min(t.min, room);
        if (min < t.min) { full = false; if (cap - minutes < t.min) cut = 'tired'; }
        const need = t.kind === 'paper' ? P.paperMin : t.kind === 'learn' ? P.lessonMin : P.minTask;
        const tp = t.topic ? st.byId.get(t.topic) : null;
        if (t.kind === 'learn' && tp.learned) { dropped++; full = false; continue; }   /* already learned (school got there first, or twice in one plan) */
        if (min < need) { clipped += Math.max(0, min); full = false; continue; }
        clipped += t.min - min;
        const row = { kind: t.kind, topic: t.topic || null, track: tp ? tp.track : t.track, min, answers: 0, right: 0, a: m, b: m + min };
        if (t.kind === 'quiz') { row.answers = Math.floor(min / P.pace); row.right = ask(tp, m, row.answers, start, minutes); focusMin += min; }
        else if (t.kind === 'learn') {
          Object.assign(tp, { learned: true, how: 'lesson', S: P.s0 * (.5 + .5 * e), last: i, learnedDay: i });
          session(tp, i);   /* R0 = 1: answers straight after a lesson add neurons, not memory */
          events.push({ k: 'lesson', t: at(d, m + P.lessonMin) }, { k: 'newTopic', t: at(d, m + P.lessonMin) });
          row.answers = Math.floor((min - P.lessonMin) / P.pace); row.right = ask(tp, m + P.lessonMin, row.answers, start, minutes + P.lessonMin); focusMin += min;
        } else if (t.kind === 'notes') {
          const s = session(tp, i);
          if (!tp.learned) Object.assign(tp, { learned: true, how: 'notes', S: P.s0 * .5, last: i, learnedDay: i });
          else if (!s.notes) { tp.S = Math.max(tp.S, tp.S * (1 + .25 * (1 - Rof(tp, i)))); tp.last = i; }
          s.notes = true;
          log.push({ d, kind: 'revision', subj: tp.track, min, at: at(d, m + min) });
        } else {
          const tps = st.topics.filter(x => x.track === t.track), f = focus(m + 30, start, minutes + 30), lk = luck(W, 'paper|' + d + '|' + t.track);
          let sum = 0;
          for (const x of tps) { const p = right(Rof(x, i)) * f; sum += p; x.paperPct = Math.round(p * 100); if (x.learned) session(x, i).paper = true; }
          row.pct = Math.round(clamp(sum / tps.length * 100 + lk() * 8 - 4, 0, 100));
          st.papers.push({ d, track: t.track, pct: row.pct });
          log.push({ d, kind: 'paper', subj: t.track, mark: row.pct, outOf: 100, min, at: at(d, m + min) });
        }
        m += min; minutes += min; done.tasks.push(row);
      }
      done.end = m;
      if (done.tasks.length) { blocks.push(done); prevEnd = m; }
    }

    /* memory: one review effect per topic per day, from how the first answer felt (R0) and the share right */
    for (const [id, s] of sess) {
      const tp = st.byId.get(id);
      if (s.n) { tp.reps += s.n; tp.right += s.right; tp.lastN = s.n; tp.lastRight = s.right; tp.lastOk = s.last; }
      tp.lastDay = i;
      if (!tp.learned || s.R0 >= 1) continue;
      const g = Math.max(s.n ? Math.min(1, s.n / P.fullReview) : 0, s.paper ? P.paperReview : 0) * (.5 + .5 * e);
      const share = s.n ? s.right / s.n : right(s.R0) >= P.okShare ? 1 : 0;
      if (share >= P.okShare) tp.S = tp.S * (1 + 6.5 * Math.pow(tp.S, -.17) * (Math.exp(.8 * (1 - s.R0)) - 1) * g);
      else if (s.n >= P.minTask / P.pace) tp.S = Math.max(.5, tp.S * .4);
      if (g > 0) tp.last = i;
    }
    st.energy = clamp(e - minutes * P.drain + P.recover + (minutes ? 0 : P.restBonus), 0, 1);
    const mockPct = Math.round(st.topics.reduce((a, t) => a + right(Rof(t, i + 1)), 0) / st.topics.length * 1000) / 10;

    const count = k => events.filter(x => x.k === k).length;
    const rec = { d, answers, written: 0, focusMin, lessons: count('lesson'), guides: 0, examiner: 0, revenge: count('revenge'), onTime: count('onTime'), newTopics: count('newTopic'),
      papers: [], log, planned: plan.blocks.length ? full && !cut : null, schoolDay: school, studyBlocks: blocks.map(b => ({ start: at(d, b.start) })), firstStudyAt: null };
    const N = typeof NEURONS === 'object' && NEURONS && typeof NEURONS.day === 'function' ? NEURONS : null;
    const neurons = N ? Math.round(N.day(rec, st.recs.slice(0, 7)).total) : 0;
    st.recs.unshift(rec); st.recs.length = Math.min(st.recs.length, 7);
    st.past.unshift({ d, minutes, neurons, rest: !plan.blocks.length && !error, cut }); st.past.length = Math.min(st.past.length, P.pastDays);
    return { d, dayIx: i, coach: run.name, error, note: plan.note, blocks, minutes, cut, dropped, clipped, energy: r2(e), energyEnd: r2(st.energy), mockPct, rec, events, neurons, memoDropped: plan.memoDropped };
  }

  /* ---------- the runner: simulates forward from the start, one coach at a time, and keeps every finished day ---------- */
  function make(world) {
    const W = norm(world), total = serial(W.mock) - serial(W.start), infos = [], runs = new Map();
    const info = i => infos[i] || (infos[i] = dayInfo(W, i));
    const coachOf = c => typeof c === 'string' ? globalThis[c] : c;
    const usable = c => !!(c && typeof c === 'object' && typeof c.plan === 'function');
    function day(c, d) {
      const coach = coachOf(c); if (!usable(coach) || !valid(d)) return null;
      const i = serial(d) - serial(W.start); if (!(i >= 0 && i < total)) return null;
      const key = typeof c === 'string' ? c : coach;
      let run = runs.get(key);
      if (!run || run.coach !== coach) { run = { coach, name: typeof c === 'string' ? c : String(coach.name || 'coach'), st: born(W), res: [] }; runs.set(key, run); }
      while (run.res.length <= i) run.res.push(simDay(W, run, run.res.length, info(run.res.length), total));
      return run.res[i];
    }
    return { world: W, days: total, start: W.start, mock: W.mock, has: c => usable(coachOf(c)), day, info: d => valid(d) ? info(serial(d) - serial(W.start)) : null };
  }

  /* a NEURONS day record cut at `now` (today: only what has happened yet), like NEURONS.fromPlan */
  function record(res, now) {
    if (!res) return null;
    const r = res.rec, cutAt = Number.isFinite(+now) ? +now : Infinity;
    if (cutAt >= dayEnd(res.d)) return Object.assign({}, r);
    const by = k => res.events.filter(x => x.k === k && x.t <= cutAt).length;
    let focusMin = 0, last = 0;
    for (const b of res.blocks) for (const t of b.tasks) {
      const a = at(res.d, t.a), z = at(res.d, t.b); last = Math.max(last, z);
      if (t.kind === 'quiz' || t.kind === 'learn') focusMin += Math.max(0, Math.min(cutAt, z) - a) / 6e4;
    }
    return Object.assign({}, r, {
      answers: r.answers.filter(a => a.t <= cutAt), focusMin, lessons: by('lesson'), newTopics: by('newTopic'), onTime: by('onTime'), revenge: by('revenge'),
      log: r.log.filter(x => x.at <= cutAt), studyBlocks: r.studyBlocks.filter(b => b.start <= cutAt), planned: cutAt >= last ? r.planned : null
    });
  }

  /* a made-up world for tuning coaches, so nobody tunes on the real season */
  const practice = () => ({
    start: '2026-09-07', mock: '2026-12-14', seed: 'practice',
    subjects: [{ track: 'maths', cur: 6, tgt: 8 }, { track: 'physics', cur: 4, tgt: 6 }, { track: 'chemistry', cur: 5, tgt: 6 }, { track: 'englit', cur: 5, tgt: 7 },
      { track: 'history', cur: 3, tgt: 5 }, { track: 'french', cur: 4, tgt: 5 }, { track: 'geography', cur: 5, tgt: 6 }],
    routine: { days: [1, 2, 3, 4, 5], wake: '06:45', leave: '07:50', home: '16:10', dinner: '18:00', bed: '22:15', wwake: '09:00', wdinner: '18:30', wbed: '23:30' },
    off: ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'], isSick: d => hash('ill|' + d) % 23 === 0
  });

  function selfTest() {
    const fails = [], check = (name, cond) => { if (!cond) fails.push(name); };
    /* a simple coach: one lesson, then quizzes on the least recently practised topics */
    const simple = { name: 'test', plan(v) {
      const todo = v.topics.filter(t => t.learned).sort((a, b) => (a.lastDay == null ? -99 : a.lastDay) - (b.lastDay == null ? -99 : b.lastDay)).slice(0, 8);
      const fresh = v.topics.find(t => !t.learned), tasks = todo.map(t => ({ kind: 'quiz', topic: t.id, min: 3 }));
      if (fresh) tasks.unshift({ kind: 'learn', topic: fresh.id, min: P.lessonMin });
      return { blocks: v.free.length ? [{ at: v.free[0][0], tasks }] : [], note: 'test', memo: { n: (v.memo && v.memo.n || 0) + 1 } };
    } };
    const w = practice(), a = make(w), b = make(w), last = dateOf(serial(w.mock) - 1);
    const t0 = typeof performance === 'object' ? performance.now() : 0;
    a.day(simple, last);
    const ms = typeof performance === 'object' ? performance.now() - t0 : 0;
    b.day(simple, last);
    let same = true, sickSeen = false;
    for (let i = 0; i < a.days; i++) {
      const d = dateOf(serial(w.start) + i), x = a.day(simple, d), y = b.day(simple, d);
      if (JSON.stringify(x.rec) !== JSON.stringify(y.rec)) same = false;
      if (a.info(d).sick) { sickSeen = true; check('sick day studies nothing', x.minutes === 0 && x.cut === 'sick'); }
      check('mock % in range ' + d, x.mockPct >= 0 && x.mockPct <= 100);
      check('neurons not negative ' + d, x.neurons >= 0);
    }
    check('same world, same coach, same days', same);
    check('practice world has a sick day', sickSeen);
    check('season simulates in under 100 ms (' + Math.round(ms) + ' ms)', ms < 100);
    const day0 = a.day(simple, w.start);
    check('lesson counted', day0.rec.lessons === 1 && day0.rec.newTopics === 1);
    const memo = make(w), seen = [];
    const counter = { name: 'm', plan(v) { seen.push(v.memo && v.memo.n); return { blocks: [], memo: { n: (v.memo && v.memo.n || 0) + 1 } }; } };
    memo.day(counter, dateOf(serial(w.start) + 2));
    check('memo handed back next day', seen.join() === ',1,2');
    /* a coach that throws, returns junk, or asks for silly things never breaks the engine */
    const thrower = { name: 'x', plan() { throw new Error('boom'); } };
    const junk = { name: 'j', plan(v) { return v.dayIx % 2 ? 5 : { blocks: [{ at: 'soon', tasks: [1] }, { at: 990, tasks: [{ kind: 'learn', topic: v.topics[0].id, min: 25 }, { kind: 'quiz', topic: 'nope', min: 5 }, { kind: 'dance', min: 9 }] }], note: { x: 1 } }; } };
    const greedy = { name: 'g', plan(v) { return { blocks: v.free.map(f => ({ at: f[0], tasks: [{ kind: 'quiz', topic: v.topics[0].id, min: 240 }] })) }; } };
    const ex = make(w).day(thrower, w.start);
    check('throwing coach: rest day with an error', ex.error === 'boom' && ex.minutes === 0 && ex.note === 'Coach error');
    const jr = make(w), j0 = jr.day(junk, w.start), j1 = jr.day(junk, dateOf(serial(w.start) + 1));
    check('junk plan: bad tasks dropped', j0.dropped >= 3 && j0.rec.planned === false);
    check('junk return: coach error', !!j1.error && j1.minutes === 0);
    const g = make(w); let tired = false, maxMin = 0;
    for (let i = 0; i < 20; i++) { const x = g.day(greedy, dateOf(serial(w.start) + i)); maxMin = Math.max(maxMin, x.minutes); if (x.cut === 'tired') { tired = true; check('tired day stops at 20 min', x.minutes <= P.tiredMin); } }
    check('studying all evening runs the student down', tired);
    check('blocks stay inside free time', maxMin <= 24 * 60);
    /* today, cut by the clock */
    const full = a.day(simple, w.start), noon = record(full, at(w.start, 12 * 60)), late = record(full, at(w.start, 23 * 60 + 59));
    check('record before study has no answers', noon.answers.length === 0 && noon.planned === null);
    check('record at day end is the full day', late.answers.length === full.rec.answers.length);
    return { ok: !fails.length, fails, ms: Math.round(ms) };
  }

  globalThis.LEAGUE = Object.freeze({ P, START, COACHES, NAMES, make, record, practice, selfTest, recall });
})();
