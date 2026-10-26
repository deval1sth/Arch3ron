/* Claude's coach for the AI league (.sim/LEAGUE.md). Retrieval practice, spaced: each topic comes back for six answers
   (more in one day doesn't stick) when my estimate of its recall falls to about 75%, the point where a review gains the
   most for what it costs. One new topic a day, ahead of school. A steady 85 minutes every day in short blocks, the
   first straight after school and another two hours later, so energy never runs down. No papers, no re-reading:
   answering beats both, for memory and for neurons. */
(() => {
  'use strict';
  const DUE = .78, SPARE = .02, BLOCK = 25, QUIZ = 3, TARGET = 85;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const recall = (S, t) => t <= 0 ? 1 : Math.pow(1 + 19 / 81 * t / S, -.5);

  function plan(view) {
    const P = view.P, i = view.dayIx;
    if (view.sick) return { blocks: [], note: 'Off sick: resting', memo: view.memo };
    /* my estimate of each topic's stability, kept per subject as [S, last day practised] */
    const memo = view.memo && view.memo.s ? view.memo : { s: {} }, subj = new Map(view.subjects.map(s => [s.track, s]));
    const est = t => { const row = memo.s[t.track] || (memo.s[t.track] = []); return row[t.n - 1] || null; };
    for (const t of view.topics) if (t.learned) {
      let e = est(t);
      if (!e) {
        const S0 = t.how === 'start' ? 6 : t.how === 'lesson' ? P.s0 * .9 : t.how === 'school' ? P.s0 * P.schoolS : P.s0 * .5;
        e = memo.s[t.track][t.n - 1] = [S0, t.how === 'start' ? -15 : t.learnedDay];
      }
      if (t.lastDay != null && t.lastDay > e[1]) {
        /* practised since I last looked: grow or shrink my estimate the way the model does */
        if (t.lastN) {
          const acc = t.lastRight / t.lastN, R = recall(e[0], t.lastDay - e[1]), g = Math.min(1, t.lastN / P.fullReview) * .9;
          e[0] = acc >= P.okShare ? e[0] * (1 + 6.5 * Math.pow(e[0], -.17) * (Math.exp(.8 * (1 - R)) - 1) * g) : Math.max(.5, e[0] * .4);
        }
        e[1] = t.lastDay;
      }
      e[0] = Math.round(e[0] * 10) / 10;
    }

    /* how much today: 85 minutes holds energy steady; ease off when tired */
    const e = view.energy, target = e >= .7 ? TARGET : e >= .5 ? 60 : e >= .3 ? 30 : 18;

    /* what: reviews first, most faded first, weak and behind-target subjects a little earlier */
    const gap = s => s ? Math.max(0, (s.tgt == null ? (s.cur || 4) + 1 : s.tgt) - (s.cur || 4)) : 0;
    const learned = view.topics.filter(t => t.learned && (t.how === 'start' || t.learnedDay < i)).map(t => {
      const x = est(t), s = subj.get(t.track), R = x ? recall(x[0], i - x[1]) : .5;
      return { t, R, key: R - SPARE * gap(s) - (s && s.weak ? SPARE : 0) };
    }).sort((a, b) => a.key - b.key || (a.t.id < b.t.id ? -1 : 1));
    const due = learned.filter(x => x.R <= DUE).length;
    const fresh = view.topics.filter(t => !t.learned);
    let lessons = fresh.length ? 1 : 0;
    const slotsFor = l => Math.floor((target - l * P.lessonMin) / QUIZ);
    if (fresh.length > 1 && target >= TARGET && due < slotsFor(1) / 2) lessons = 2;
    const picks = [], bySubj = new Map();
    for (const t of fresh) { if (!bySubj.has(t.track)) bySubj.set(t.track, []); bySubj.get(t.track).push(t); }
    for (let l = 0; l < lessons; l++) {
      let best = null, bestW = -1;
      for (const [track, list] of bySubj) {
        const s = subj.get(track), w = list.length * (1 + .3 * gap(s) + (s && s.weak ? .25 : 0)) / (picks.some(p => p.track === track) ? 3 : 1);
        if (w > bestW || (w === bestW && track < best)) { best = track; bestW = w; }
      }
      const list = bySubj.get(best), t = list.shift(); if (!list.length) bySubj.delete(best);
      picks.push(t);
    }
    const reviews = learned.slice(0, Math.max(0, slotsFor(picks.length))).map(x => x.t);

    /* when: blocks of 25 minutes; the first as early as possible, the second at least two hours later */
    const tasks = [...picks.map(t => ({ kind: 'learn', topic: t.id, min: P.lessonMin })), ...reviews.map(t => ({ kind: 'quiz', topic: t.id, min: QUIZ }))];
    const blocks = [];
    const place = (len, want) => { for (const [a, b] of view.free) { const s = Math.max(a, want); if (s + len <= b) return s; } return null; };
    let want = 0, end = 0, k = 0;
    while (k < tasks.length) {
      const take = []; let len = 0;
      while (k < tasks.length && len + tasks[k].min <= BLOCK) { len += tasks[k].min; take.push(tasks[k++]); }
      if (!take.length) { take.push(tasks[k]); len = tasks[k++].min; }
      let at = place(len, want);
      if (at == null && blocks.length) at = place(len, end + 10);   /* no room two hours on: carry on after a short break */
      if (at == null) break;
      blocks.push({ at, tasks: take });
      end = at + len; want = blocks.length === 1 ? at + 120 : end + 10;
    }
    const mins = blocks.reduce((a, b) => a + b.tasks.reduce((x, t) => x + t.min, 0), 0);
    const n = blocks.reduce((a, b) => a + b.tasks.filter(t => t.kind === 'quiz').length, 0);
    const name = t => (subj.get(t.track) || { name: t.track }).name + ' ' + t.n;
    const note = mins ? `${n} review${n === 1 ? '' : 's'}${picks.length ? ', new: ' + picks.map(name).join(', ') : ''}` : 'Rest';
    return { blocks, note: note.slice(0, 80), memo };
  }

  globalThis.COACH_CLAUDE = Object.freeze({
    name: 'Claude', version: 1, plan,
    about: 'Short spaced quizzes: each topic comes back when it is about 75% remembered, 6 answers at a time. One new topic a day. About 85 min daily in 25-min blocks, never burning out.'
  });
})();
