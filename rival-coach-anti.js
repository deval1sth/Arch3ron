(function () {
  'use strict';

  const COACH_ANTI = Object.freeze({
    name: 'Antigravity',
    about: 'Balanced strategy: early review of fading topics, learn a new topic when energy is high, schedule a past-paper on low-energy days, otherwise rest.',
    version: 1,
    plan(view) {
      const { free, energy, subjects, topics, P, rand } = view;

      // 1. Rest days: sick, no free time, or student too tired (< 0.26)
      if (view.sick || !free || free.length === 0 || energy < 0.26) {
        const reason = view.sick ? 'Off sick' : (energy < 0.26 ? 'Resting to recover energy' : 'Rest day');
        return { blocks: [], note: reason, memo: view.memo || {} };
      }

      const gap = Math.max(5, (P && P.gapMin) || 5);
      const weakTracks = new Set(subjects.filter(s => s.weak).map(s => s.track));

      // 2. Compute recall estimate R for each learned topic
      // For topics from start with lastDay == null, treat as faded
      const fading = topics
        .filter(t => t.learned)
        .map(t => {
          let R;
          if (t.lastDay == null) {
            const tDays = 15 + view.dayIx;
            R = Math.pow(1 + (19 / 81) * (tDays / 5), -0.5);
          } else {
            const tDays = view.dayIx - t.lastDay;
            if (tDays <= 0) {
              R = 1.0;
            } else {
              const revCount = Math.floor((t.reps || 0) / 6);
              const baseS = (t.how === 'start') ? 5 : 1.5;
              const estS = baseS + revCount * 3;
              R = Math.pow(1 + (19 / 81) * (tDays / estS), -0.5);
            }
          }
          return { id: t.id, track: t.track, R, isWeak: weakTracks.has(t.track) };
        })
        .sort((a, b) => {
          if (Math.abs(a.R - b.R) > 0.02) return a.R - b.R; // lower recall first
          if (a.isWeak !== b.isWeak) return a.isWeak ? -1 : 1; // weak subject bonus
          return a.id.localeCompare(b.id); // consistent tie-break
        });

      // 3. Unlearned topics for learning when fresh
      const unlearned = topics
        .filter(t => !t.learned)
        .sort((a, b) => {
          const aWeak = weakTracks.has(a.track);
          const bWeak = weakTracks.has(b.track);
          if (aWeak !== bWeak) return aWeak ? -1 : 1;
          if (a.n !== b.n) return a.n - b.n;
          return a.id.localeCompare(b.id);
        });

      // Check available free windows
      const longestWindow = free.reduce((m, [a, b]) => Math.max(m, b - a), 0);

      // Strategy mode selection:
      // A) Low energy (< 0.60) & window >= 60 min -> Past Paper
      // B) High energy (>= 0.65) & unlearned topics exist -> Learn 1 topic + review
      // C) Regular -> Spaced fading reviews + notes to fill
      const doPaper = (energy < 0.60) && (longestWindow >= 60);
      const doLearn = !doPaper && (energy >= 0.65) && (unlearned.length > 0);

      let topicCursor = 0;
      const getQuizTopic = () => {
        if (topicCursor < fading.length) {
          return fading[topicCursor++].id;
        }
        return fading.length ? fading[0].id : null;
      };

      const candidateBlocks = [];
      let planNote = '';

      if (doPaper) {
        // Pick subject for paper: prefer weak subject, or cycling
        const paperSubject = subjects.find(s => s.weak) || subjects[view.dayIx % subjects.length];
        candidateBlocks.push({
          tasks: [{ kind: 'paper', track: paperSubject.track, min: 60 }]
        });
        // Add 1 quiz + notes block of ~20 min if free time allows
        const b2Tasks = [];
        for (let i = 0; i < 5; i++) {
          const tid = getQuizTopic();
          if (tid) b2Tasks.push({ kind: 'quiz', topic: tid, min: 3 });
        }
        const nTid = getQuizTopic();
        if (nTid) b2Tasks.push({ kind: 'notes', topic: nTid, min: 5 });
        if (b2Tasks.length) candidateBlocks.push({ tasks: b2Tasks });
        planNote = 'Past paper ' + paperSubject.track + ', 5 reviews, notes';
      } else if (doLearn) {
        const learnTopic = unlearned[0];
        // Block 1: Learn (20 min) + 2 quizzes (6 min) = 26 min
        const b1Tasks = [{ kind: 'learn', topic: learnTopic.id, min: 20 }];
        for (let i = 0; i < 2; i++) {
          const tid = getQuizTopic();
          if (tid) b1Tasks.push({ kind: 'quiz', topic: tid, min: 3 });
        }
        candidateBlocks.push({ tasks: b1Tasks });

        // Block 2: 8 quizzes (24 min) + 1 notes (4 min) = 28 min
        const b2Tasks = [];
        for (let i = 0; i < 8; i++) {
          const tid = getQuizTopic();
          if (tid) b2Tasks.push({ kind: 'quiz', topic: tid, min: 3 });
        }
        const notesTid = getQuizTopic();
        if (notesTid) b2Tasks.push({ kind: 'notes', topic: notesTid, min: 4 });
        candidateBlocks.push({ tasks: b2Tasks });

        // Block 3: 8 quizzes (24 min) + 1 notes (4 min) = 28 min
        const b3Tasks = [];
        for (let i = 0; i < 8; i++) {
          const tid = getQuizTopic();
          if (tid) b3Tasks.push({ kind: 'quiz', topic: tid, min: 3 });
        }
        const notesTid2 = getQuizTopic();
        if (notesTid2) b3Tasks.push({ kind: 'notes', topic: notesTid2, min: 4 });
        candidateBlocks.push({ tasks: b3Tasks });

        planNote = 'Learn ' + learnTopic.id + ', 18 reviews, notes';
      } else {
        // Regular day: 3 blocks of 27-29 min = ~83 min
        // Block 1: 9 quizzes (27 min)
        const b1Tasks = [];
        for (let i = 0; i < 9; i++) {
          const tid = getQuizTopic();
          if (tid) b1Tasks.push({ kind: 'quiz', topic: tid, min: 3 });
        }
        candidateBlocks.push({ tasks: b1Tasks });

        // Block 2: 9 quizzes (27 min)
        const b2Tasks = [];
        for (let i = 0; i < 9; i++) {
          const tid = getQuizTopic();
          if (tid) b2Tasks.push({ kind: 'quiz', topic: tid, min: 3 });
        }
        candidateBlocks.push({ tasks: b2Tasks });

        // Block 3: 8 quizzes (24 min) + 1 notes (5 min) = 29 min
        const b3Tasks = [];
        for (let i = 0; i < 8; i++) {
          const tid = getQuizTopic();
          if (tid) b3Tasks.push({ kind: 'quiz', topic: tid, min: 3 });
        }
        const n3 = getQuizTopic();
        if (n3) b3Tasks.push({ kind: 'notes', topic: n3, min: 5 });
        candidateBlocks.push({ tasks: b3Tasks });

        planNote = '26 fading reviews, notes';
      }

      // 4. Schedule blocks into view.free windows
      const scheduledBlocks = [];
      let winIdx = 0;
      let curTime = free[0][0];

      for (const blk of candidateBlocks) {
        if (scheduledBlocks.length >= 6) break;
        const bDur = blk.tasks.reduce((sum, t) => sum + t.min, 0);

        let placed = false;
        while (winIdx < free.length) {
          const [wStart, wEnd] = free[winIdx];
          if (curTime < wStart) {
            curTime = wStart;
          }
          if (curTime + bDur <= wEnd) {
            scheduledBlocks.push({
              at: curTime,
              tasks: blk.tasks
            });
            curTime = curTime + bDur + gap;
            placed = true;
            break;
          } else {
            winIdx++;
            if (winIdx < free.length) {
              curTime = free[winIdx][0];
            }
          }
        }
        if (!placed) break;
      }

      if (scheduledBlocks.length === 0) {
        return { blocks: [], note: 'Rest day', memo: view.memo || {} };
      }

      return {
        blocks: scheduledBlocks,
        note: planNote.slice(0, 80),
        memo: view.memo || {}
      };
    }
  });

  window.COACH_ANTI = COACH_ANTI;
})();
