(function(){
  // Helper: escape HTML characters
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  const COACH_ANTI = Object.freeze({
    name: 'Antigravity',
    about: 'Balanced strategy: early review of fading topics, learn a new topic when energy is high, schedule a past‑paper on low‑energy days, otherwise rest.',
    version: 1,
    plan(view) {
      // Do not mutate view
      const { free, energy, subjects, topics, P, rand } = view;
      // Compute total free minutes
      const totalFree = free.reduce((s, [a, b]) => s + (b - a), 0);

      // Helper to pick a random element deterministically
      const pick = (arr) => arr.length ? arr[Math.floor(rand() * arr.length)] : null;

      // Build list of fading topics (R low first)
      const fading = topics
        .filter(t => t.learned)
        .map(t => ({
          ...t,
          R: (() => {
            const tDays = view.dayIx - (t.lastDay ?? view.dayIx);
            const S = t.reps ? t.reps : 1; // approximate stability placeholder
            // Use spec formula approx: R = (1 + 19/81 * tDays / (t.reps||1)) ** -0.5
            const val = 1 + (19/81) * tDays / (S || 1);
            return Math.pow(val, -0.5);
          })()
        }))
        .sort((a,b)=>a.R - b.R || (rand()?1:-1)); // tie‑break with rand

      // Choose a subject that is weak (bonus) for potential paper
      const weakSubject = subjects.find(s=>s.weak) || subjects[0];

      const blocks = [];
      let remaining = totalFree;
      const MIN_GAP = P.gapMin || 5;
      // Helper to add a block if fits
      const tryAddBlock = (block) => {
        const blockDur = block.tasks.reduce((s,t)=>s+t.min,0);
        if (blockDur <= remaining) {
          blocks.push(block);
          remaining -= blockDur + MIN_GAP; // reserve gap after block
          return true;
        }
        return false;
      };

      // 1. If enough energy, try learn a new topic
      if (energy >= 0.6) {
        // find first unlearned topic in any subject (seeded order)
        const unlearned = topics.filter(t=>!t.learned);
        const learnTopic = pick(unlearned);
        if (learnTopic) {
          tryAddBlock({ at: free[0][0], tasks: [{ kind:'learn', topic: learnTopic.id, min: Math.max(P.lessonMin, 20) }] });
        }
      }

      // 2. Add up to two quiz tasks on most faded topics
      const quizCount = Math.min(2, Math.floor(remaining/3));
      for (let i=0;i<quizCount;i++) {
        const t = fading[i];
        if (!t) break;
        tryAddBlock({ at: free[0][0], tasks: [{ kind:'quiz', topic: t.id, min: 3 }] });
      }

      // 3. If still enough free time and energy low, schedule a past paper (60 min)
      if (energy < 0.5 && remaining >= P.paperMin) {
        tryAddBlock({ at: free[0][0], tasks: [{ kind:'paper', track: weakSubject.track, min: P.paperMin }] });
      }

      // 4. Fill any leftover with short notes (if any time >= 3)
      while (remaining >= 3) {
        const t = pick(fading);
        if (!t) break;
        tryAddBlock({ at: free[0][0], tasks: [{ kind:'notes', topic: t.id, min: 3 }] });
      }

      // If no blocks added, return rest day []
      if (blocks.length === 0) {
        return { blocks: [], note: 'Rest day', memo: {} };
      }

      // Compose a brief note summarising plan
      const noteParts = [];
      blocks.forEach(b=>{
        b.tasks.forEach(t=>{
          if (t.kind==='learn') noteParts.push('learn '+t.topic);
          if (t.kind==='quiz') noteParts.push('quiz '+t.topic);
          if (t.kind==='paper') noteParts.push('paper '+t.track);
          if (t.kind==='notes') noteParts.push('notes '+t.topic);
        });
      });
      const note = noteParts.slice(0,5).join(', ');

      return { blocks, note: note.slice(0,80), memo: {} };
    }
  });
  // expose globally – only this global should exist
  if (typeof window !== 'undefined') window.COACH_ANTI = COACH_ANTI;
  else if (typeof global !== 'undefined') global.COACH_ANTI = COACH_ANTI;
})();
