/* NEURONS scoring engine. Pure adapters: no DOM, storage, or app-state writes. */
(() => {
  'use strict';

  /* Tunable scoring rules. Keep these values in one table. */
  const W = Object.freeze({
    answer: Object.freeze({ base: 1, level: 0.5, right: 0.5 }),
    written: 3,
    focusMinute: 0.5, focusCap: 240,
    lesson: 15,
    guide: 8, guideCap: 10,
    inAppPaper: Object.freeze({ base: 40, mark: 60 }),
    examiner: 5,
    revenge: 4,
    onTime: 2,
    newTopic: 10,
    externalPaper: Object.freeze({ base: 60, mark: 90 }),
    revisionMinute: 0.4, revisionEntryCap: 120, revisionDayCap: 240,
    classTest: Object.freeze({ base: 20, mark: 20 }),
    homework: 12,
    teaching: 15, teachingCap: 2,
    tutorMinute: 0.5, tutorDayCap: 120,
    videoMinute: 0.15, videoDayCap: 60,
    showUp: 20, showUpAnswers: 10, showUpMinutes: 15,
    consistency: 5, consistencyCap: 35,
    planHit: 25,
    weakMultiplier: 1.25,
    spacing: 10, spacingHours: 2,
    earlyStart: 10, earlySchoolHour: 17, earlyOtherHour: 11,
    rushSeconds: 4, rushBatch: 10, rushAccuracy: 0.5,
    zeroDayRate: 0.05, zeroDayWindow: 7
  });
  const weakTracks = new Set(['maths', 'biology', 'chemistry', 'physics', 're']);
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const number = value => Number.isFinite(+value) ? +value : 0;
  const amount = value => Math.max(0, number(value));
  const whole = value => Math.floor(amount(value));
  const round = value => Math.round((number(value) + Number.EPSILON) * 100) / 100;
  const validDate = value => typeof value === 'string' && /^\d{4}-\d\d-\d\d$/.test(value);
  const serial = value => {
    if (!validDate(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
      ? Math.floor(date.getTime() / 86400000) : null;
  };
  const localAt = (date, minute) => {
    if (!validDate(date)) return null;
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day, Math.floor(minute / 60), minute % 60).getTime();
  };
  const weekday = date => {
    const day = serial(date);
    return day == null ? null : new Date(day * 86400000).getUTCDay();
  };
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
  const valueOf = (object, key) => amount(object && object[key]);
  const listedLog = (rec, kind) => (Array.isArray(rec.log) ? rec.log : []).filter(entry => entry && entry.kind === kind && (!validDate(entry.d) || entry.d === rec.d));
  const studyMinutes = rec => {
    let total = amount(rec.focusMin);
    for (const entry of Array.isArray(rec.log) ? rec.log : []) {
      if (!entry || (validDate(entry.d) && entry.d !== rec.d)) continue;
      if (['paper', 'classtest', 'revision', 'tutor', 'video'].includes(entry.kind)) total += amount(entry.min);
    }
    return total;
  };
  const answerRows = rec => Array.isArray(rec.answers) ? rec.answers : [];
  const blocksOf = rec => Array.isArray(rec.studyBlocks) ? rec.studyBlocks : [];
  const blockStart = block => typeof block === 'number' ? block : number(block && block.start);
  const startsOf = rec => {
    const blocks = blocksOf(rec).map(blockStart).filter(Number.isFinite);
    if (blocks.length) return blocks;
    if (rec.firstStudyAt != null && +rec.firstStudyAt > 0) return [+rec.firstStudyAt];   /* null means no study, not 1 Jan 1970 */
    return answerRows(rec).map(answer => number(answer && answer.t)).filter(value => value > 0);
  };
  const hasSpacing = rec => {
    const starts = [...new Set(startsOf(rec).sort((a, b) => a - b))];
    return starts.some((start, i) => starts.slice(i + 1).some(next => next - start >= W.spacingHours * 3600000));
  };
  const showUp = rec => answerRows(rec).length >= W.showUpAnswers || studyMinutes(rec) >= W.showUpMinutes;
  const withinHistory = (rec, history) => {
    const today = serial(rec && rec.d);
    return (Array.isArray(history) ? history : []).filter(item => {
      const day = serial(item && item.d);
      return item && (today == null || day == null || day < today);
    }).slice(0, W.zeroDayWindow);
  };
  const streakBefore = (rec, history) => {
    const today = serial(rec && rec.d);
    let expected = today == null ? null : today - 1, streak = 0;
    for (const previous of withinHistory(rec, history)) {
      const day = serial(previous.d);
      if (expected != null && day != null && day !== expected) break;
      if (expected != null && day == null) break;
      if (!showUp(previous)) break;
      streak++;
      if (expected != null) expected--;
    }
    return Math.min(streak, W.consistencyCap / W.consistency);
  };
  const paperScore = (papers, rule) => (Array.isArray(papers) ? papers : []).reduce((sum, paper) => {
    const outOf = amount(paper && paper.outOf), mark = amount(paper && paper.mark);
    return outOf > 0 ? sum + rule.base + rule.mark * clamp(mark / outOf, 0, 1) : sum;
  }, 0);
  const externalPaperScore = log => log.reduce((sum, entry) => {
    const outOf = amount(entry && entry.outOf), mark = amount(entry && entry.mark);
    return outOf > 0 ? sum + W.externalPaper.base + W.externalPaper.mark * clamp(mark / outOf, 0, 1) : sum;
  }, 0);
  const answerScore = answers => {
    const ordered = answers.map((answer, index) => ({ answer: answer || {}, index }))
      .sort((a, b) => {
        const at = number(a.answer.t), bt = number(b.answer.t);
        if (at > 0 && bt > 0) return at - bt || a.index - b.index;
        if (at > 0) return -1;
        if (bt > 0) return 1;
        return a.index - b.index;
      });
    const rushed = new Set();
    for (let start = 0; start + W.rushBatch <= ordered.length; start += W.rushBatch) {
      const batch = ordered.slice(start, start + W.rushBatch);
      const right = batch.filter(item => item.answer.ok === true).length;
      if (right / W.rushBatch < W.rushAccuracy) {
        for (const item of batch) if (item.answer.ms != null && Number.isFinite(+item.answer.ms) && +item.answer.ms >= 0 && +item.answer.ms < W.rushSeconds * 1000) rushed.add(item.index);
      }
    }
    let base = 0, weak = 0, rushing = 0;
    for (const item of ordered) {
      const answer = item.answer;
      const level = clamp(Math.floor(number(answer.lvl) || 1), 1, 3);
      const points = W.answer.base * (1 + W.answer.level * (level - 1)) + (answer.ok === true ? W.answer.right : 0);
      const isWeak = weakTracks.has(String(answer.track || '').toLowerCase());
      base += points;
      if (isWeak) weak += points * (W.weakMultiplier - 1);
      if (rushed.has(item.index)) rushing -= points * (isWeak ? W.weakMultiplier : 1);
    }
    return { base: round(base), weak: round(weak), rushing: round(rushing) };
  };
  const emptyParts = () => ({
    answer: 0, weak: 0, rushing: 0, written: 0, focus: 0, lesson: 0, guide: 0,
    inAppPaper: 0, examiner: 0, revenge: 0, onTime: 0, newTopic: 0,
    externalPaper: 0, revision: 0, classTest: 0, homework: 0, teaching: 0,
    tutor: 0, video: 0, showUp: 0, consistency: 0, planHit: 0,
    spacing: 0, earlyStart: 0, zeroDay: 0
  });
  const sumParts = parts => Object.values(parts).reduce((sum, value) => sum + value, 0);
  const scoreDay = (rec, history, depth) => {
    const record = rec && typeof rec === 'object' ? rec : {};
    const previous = withinHistory(record, history);
    const parts = emptyParts(), answers = answerRows(record);
    const answersScored = answerScore(answers);
    parts.answer = answersScored.base;
    parts.weak = answersScored.weak;
    parts.rushing = answersScored.rushing;
    parts.written = whole(record.written) * W.written;
    parts.focus = Math.min(W.focusCap, amount(record.focusMin)) * W.focusMinute;
    parts.lesson = whole(record.lessons) * W.lesson;
    parts.guide = Math.min(W.guideCap, whole(record.guides)) * W.guide;
    parts.inAppPaper = paperScore(record.papers, W.inAppPaper);
    parts.examiner = whole(record.examiner) * W.examiner;
    parts.revenge = whole(record.revenge) * W.revenge;
    parts.onTime = whole(record.onTime) * W.onTime;
    parts.newTopic = whole(record.newTopics) * W.newTopic;
    parts.externalPaper = externalPaperScore(listedLog(record, 'paper'));
    const revisionMinutes = listedLog(record, 'revision').reduce((sum, entry) => sum + Math.min(W.revisionEntryCap, amount(entry.min)), 0);
    parts.revision = Math.min(W.revisionDayCap, revisionMinutes) * W.revisionMinute;
    parts.classTest = listedLog(record, 'classtest').reduce((sum, entry) => {
      const outOf = amount(entry.outOf), mark = amount(entry.mark);
      return outOf > 0 ? sum + W.classTest.base + W.classTest.mark * clamp(mark / outOf, 0, 1) : sum;
    }, 0);
    parts.homework = listedLog(record, 'homework').length * W.homework;
    parts.teaching = Math.min(W.teachingCap, listedLog(record, 'teach').length) * W.teaching;
    const tutorMinutes = listedLog(record, 'tutor').reduce((sum, entry) => sum + amount(entry.min), 0);
    parts.tutor = Math.min(W.tutorDayCap, tutorMinutes) * W.tutorMinute;
    const videoMinutes = listedLog(record, 'video').reduce((sum, entry) => sum + amount(entry.min), 0);
    parts.video = Math.min(W.videoDayCap, videoMinutes) * W.videoMinute;

    const showed = showUp(record);
    if (showed) {
      parts.showUp = W.showUp;
      parts.consistency = streakBefore(record, previous) * W.consistency;
    }
    if (record.planned === true) parts.planHit = W.planHit;
    if (hasSpacing(record)) parts.spacing = W.spacing;
    const starts = startsOf(record);
    if (starts.length && typeof record.schoolDay === 'boolean') {
      const hour = new Date(Math.min(...starts)).getHours();
      if (hour < (record.schoolDay ? W.earlySchoolHour : W.earlyOtherHour)) parts.earlyStart = W.earlyStart;
    }

    const beforePenalty = sumParts(parts);
    if (!showed && depth < 8 && previous.length) {
      let priorTotal = 0;
      for (let i = 0; i < previous.length; i++) priorTotal += scoreDay(previous[i], previous.slice(i + 1), depth + 1).total;
      const average = priorTotal / W.zeroDayWindow;
      parts.zeroDay = -average * W.zeroDayRate;
    }
    const total = round(Math.max(0, sumParts(parts)));
    return { total, parts };
  };
  const answersFromState = day => {
    const total = Math.min(10000, whole(day.qa)), correct = Math.min(total, whole(day.qr));
    const trackCounts = day.t && typeof day.t === 'object' ? Object.entries(day.t)
      .map(([track, count]) => [track, whole(count)]).filter(([, count]) => count > 0).sort((a, b) => a[0].localeCompare(b[0])) : [];
    const events = day.ev && typeof day.ev === 'object' ? day.ev : {};
    const answers = []; let remaining = total, knownRight = 0;
    const addAnswers = (count, right, track) => {
      for (let i = 0; i < count; i++) answers.push({ t: null, track: track || null, ok: i < right, lvl: 1, ms: null });
    };
    for (const [track, count] of trackCounts) {
      const used = Math.min(remaining, count);
      const right = Math.min(used, valueOf(events, 's:' + track), Math.max(0, correct - knownRight));
      addAnswers(used, right, track);
      remaining -= used; knownRight += right;
    }
    addAnswers(remaining, Math.max(0, correct - knownRight), null);
    return answers;
  };
  const validScore = score => score && amount(score.max) > 0 && Number.isFinite(+score.score);
  const scoreIsInApp = score => (Array.isArray(score.tp) && score.tp.length > 0) || /^(Generated |PPP\b)/i.test(String(score.paper || ''));
  const fromState = (state, date, log) => {
    const s = state && typeof state === 'object' ? state : {}, d = validDate(date) ? date : '', day = (s.days && s.days[d]) || {};
    const events = day.ev && typeof day.ev === 'object' ? day.ev : {};
    const scores = (Array.isArray(s.scores) ? s.scores : []).filter(score => validScore(score) && score.date === d && scoreIsInApp(score));
    const expectedPapers = whole(events.paper), papers = expectedPapers ? scores.slice(-expectedPapers).map(score => ({ mark: number(score.score), outOf: number(score.max) })) : [];
    const weekdayNumber = weekday(d), planRows = weekdayNumber == null ? [] : (s.plan && Array.isArray(s.plan[weekdayNumber]) ? s.plan[weekdayNumber] : []);
    const plannedSets = planRows.filter(row => row && row.kind === 'train').reduce((sum, row) => sum + (s.deload ? Math.ceil(whole(row.sets) / 2) : whole(row.sets)), 0);
    const completedSets = planRows.filter(row => row && row.kind === 'train').reduce((sum, row) => {
      const done = day.s && Array.isArray(day.s[row.id]) ? day.s[row.id].filter(Boolean).length : 0;
      return sum + Math.min(done, (s.deload ? Math.ceil(whole(row.sets) / 2) : whole(row.sets)));
    }, 0);
    const hourCounts = s.tc && s.tc.hrs && Array.isArray(s.tc.hrs[d]) ? s.tc.hrs[d] : [];
    const firstHour = hourCounts.findIndex(count => amount(count) > 0);
    const readCount = s.read && typeof s.read === 'object' ? Object.values(s.read).filter(readDate => readDate === d).length : 0;
    const firstTopics = s.tc && s.tc.tn && typeof s.tc.tn === 'object'
      ? Object.values(s.tc.tn).filter(entry => Array.isArray(entry) && entry[2] === d).length : 0;
    return {
      d, answers: answersFromState(day), written: whole(events.written), focusMin: amount(events.focusms) / 60000,
      lessons: whole(events.lesson), guides: readCount, examiner: whole(events.exm),
      revenge: whole(events.fix), onTime: whole(events.ontime), newTopics: firstTopics,
      papers, log: (Array.isArray(log) ? log : []).filter(entry => entry && entry.d === d),
      planned: plannedSets > 0 ? completedSets >= plannedSets : null,
      schoolDay: null,
      firstStudyAt: Array.isArray(day.studyStarts) && day.studyStarts.length ? number(day.studyStarts[0]) : firstHour >= 0 ? localAt(d, firstHour * 60) : null,
      studyBlocks: Array.isArray(day.studyStarts) ? day.studyStarts.slice(-12).map(start => ({ start: number(start) })).filter(block => block.start > 0) : []
    };
  };
  const fromPlan = (plan, now) => {
    const p = plan && typeof plan === 'object' ? plan : {}, date = validDate(p.k) ? p.k : '';
    const cutoff = Number.isFinite(+now) ? +now : Infinity;
    const answers = (Array.isArray(p.ans) ? p.ans : []).filter(answer => number(answer && answer.t) <= cutoff).map(answer => ({
      t: number(answer.t),
      track: answer.tp && answer.tp.track || (answer.s && Array.isArray(answer.s.tracks) ? answer.s.tracks[0] : null),
      ok: answer.ok === true,
      lvl: clamp(Math.floor(number(answer.lvl) || 1), 1, 3),
      ms: answer.ms != null && Number.isFinite(+answer.ms) ? Math.max(0, +answer.ms) : null
    }));
    const runs = Array.isArray(p.runs) ? p.runs : [...new Set((Array.isArray(p.ans) ? p.ans : []).map(answer => answer && answer.run).filter(Boolean))];
    const current = Number.isFinite(+now) ? +now : Infinity;
    const studyRuns = runs.filter(run => run && run.kind === 'study');
    let focusMin = 0;
    const studyBlocks = [];
    for (const run of studyRuns) {
      const start = localAt(date, number(run.a)), end = localAt(date, number(run.b));
      if (start == null || end == null || current <= start) continue;
      studyBlocks.push({ start });
      focusMin += Math.max(0, Math.min(current, end) - start) / 60000;
    }
    return {
      d: date, answers, written: 0, focusMin,
      lessons: 0, guides: 0, examiner: 0, revenge: 0, onTime: 0,
      newTopics: 0, papers: [], log: [], planned: null,
      schoolDay: typeof p.school === 'boolean' ? p.school : null,
      studyBlocks, firstStudyAt: null
    };
  };
  const hash = text => {
    let value = 2166136261;
    for (let i = 0; i < text.length; i++) { value ^= text.charCodeAt(i); value = Math.imul(value, 16777619); }
    return value >>> 0;
  };
  const onurExtras = date => {
    const d = validDate(date) ? date : '', dayNumber = serial(d), dow = weekday(d), seed = hash(d || '1970-01-01');
    let state = seed || 1;
    const next = () => { state = (state + 0x6D2B79F5) | 0; let x = state; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
    const subjects = ['maths', 'biology', 'chemistry', 'physics', 'englit', 'englang', 'geography', 'business', 're', 'history', 'compsci', 'french', 'spanish'];
    const subject = subjects[Math.abs(dayNumber || 0) % subjects.length];
    const schoolDay = dow != null && dow >= 1 && dow <= 5;
    const paperDay = dow === 6 && Math.floor((dayNumber || 0) / 7) % 2 === 0;
    const log = paperDay ? [{ d, kind: 'paper', subj: subject, mark: 72 + Math.floor(next() * 17), outOf: 100, at: localAt(d, 18 * 60) }] : [];
    return {
      d, answers: [], written: schoolDay ? 2 : 3, focusMin: 0,
      lessons: dow === 2 || dow === 5 ? 1 : 0,
      guides: dow === 1 || dow === 3 || dow === 6 ? 1 : 0,
      examiner: dow === 4 ? 2 : 0,
      revenge: dow === 0 ? 1 : 0,
      onTime: dow === 2 ? 1 : 0,
      newTopics: dow === 1 || dow === 3 ? 1 : 0,
      papers: [], log,
      planned: true, schoolDay,
      studyBlocks: [], firstStudyAt: null
    };
  };
  const selfTest = () => {
    const fails = [];
    const check = (name, actual, expected) => { if (Math.abs(number(actual) - expected) > 0.001) fails.push(`${name}: expected ${expected}, got ${actual}`); };
    const rich = {
      d: '2026-10-26', schoolDay: true, planned: true,
      answers: [
        { t: localAt('2026-10-26', 9 * 60), track: 'maths', ok: true, lvl: 1, ms: 5000 },
        { t: localAt('2026-10-26', 9 * 60 + 1), track: 'biology', ok: false, lvl: 2, ms: 5000 },
        { t: localAt('2026-10-26', 12 * 60), track: 'englit', ok: true, lvl: 3, ms: null }
      ],
      written: 2, focusMin: 300, lessons: 2, guides: 12,
      papers: [{ mark: 1, outOf: 2 }], examiner: 2, revenge: 1, onTime: 3, newTopics: 2,
      studyBlocks: [{ start: localAt('2026-10-26', 9 * 60) }, { start: localAt('2026-10-26', 12 * 60) }],
      log: [
        { d: '2026-10-26', kind: 'paper', mark: 50, outOf: 100 },
        { d: '2026-10-26', kind: 'revision', min: 150 }, { d: '2026-10-26', kind: 'revision', min: 150 },
        { d: '2026-10-26', kind: 'classtest', mark: 15, outOf: 20 },
        { d: '2026-10-26', kind: 'homework' }, { d: '2026-10-26', kind: 'homework' },
        { d: '2026-10-26', kind: 'teach' }, { d: '2026-10-26', kind: 'teach' }, { d: '2026-10-26', kind: 'teach' },
        { d: '2026-10-26', kind: 'tutor', min: 150 }, { d: '2026-10-26', kind: 'video', min: 100 }
      ]
    };
    const richResult = scoreDay(rich, [], 0);
    check('weighted answer base', richResult.parts.answer, 5.5);
    check('weak-subject multiplier', richResult.parts.weak, 0.75);
    check('focus cap', richResult.parts.focus, 120);
    check('guide cap', richResult.parts.guide, 80);
    check('revision entry/day caps', richResult.parts.revision, 96);
    check('teaching cap', richResult.parts.teaching, 30);
    check('tutor cap', richResult.parts.tutor, 60);
    check('video cap', richResult.parts.video, 9);
    check('richer day total', richResult.total, 776.25);

    const rushing = { d: '2026-10-26', answers: Array.from({ length: 10 }, (_, i) => ({ t: i * 5000 + 1, track: 'englit', ok: i < 4, lvl: 1, ms: 3999 })) };
    const rushingResult = scoreDay(rushing, [], 0);
    check('rushing gross answers', rushingResult.parts.answer, 12);
    check('rushing debit', rushingResult.parts.rushing, -12);
    check('show-up from ten answers', rushingResult.parts.showUp, 20);
    check('rushing day total', rushingResult.total, 20);

    const consistentHistory = [
      { d: '2026-10-25', focusMin: 15 }, { d: '2026-10-24', focusMin: 15 }, { d: '2026-10-23', focusMin: 15 }
    ];
    const consistent = scoreDay({ d: '2026-10-26', focusMin: 15 }, consistentHistory, 0);
    check('three-day consistency', consistent.parts.consistency, 15);
    check('consistency day total', consistent.total, 42.5);

    const zeroHistory = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(Date.UTC(2026, 9, 25 - i)).toISOString().slice(0, 10);
      return { d: day, focusMin: 200 };
    });
    const zero = scoreDay({ d: '2026-10-26' }, zeroHistory, 0);
    check('zero-day penalty from previous week average', zero.parts.zeroDay, -6.75);
    check('zero-day floor', zero.total, 0);

    const source = { days: { '2026-10-26': { qa: 4, qr: 3, t: { maths: 2, biology: 2 }, ev: { 's:maths': 1, 's:biology': 2, focusms: 90000, written: 2, ontime: 3 }, studyStarts: [localAt('2026-10-26', 9 * 60), localAt('2026-10-26', 12 * 60)] } }, tc: { hrs: { '2026-10-26': [0, 0, 0, 0, 0, 0, 0, 9] } } };
    const adapted = fromState(source, '2026-10-26', []);
    check('state adapter answer count', adapted.answers.length, 4);
    check('state adapter correct count', adapted.answers.filter(answer => answer.ok).length, 3);
    check('state adapter focus minutes', adapted.focusMin, 1.5);
    check('state adapter written answers', adapted.written, 2);
    check('state adapter on-time reviews', adapted.onTime, 3);
    check('state adapter study blocks', adapted.studyBlocks.length, 2);
    check('state adapter first study timestamp', adapted.firstStudyAt, localAt('2026-10-26', 9 * 60));
    if (fails.length) return { ok: false, fails };
    return { ok: true, fails: [] };
  };
  const missing = Object.freeze([
    'per-answer timestamps, response times, and question levels (daily count/correctness and track totals are available)',
    'actual school-day and holiday status',
    'paper provenance when an in-app score has no topic detail',
    'out-of-app activities unless they are supplied in the day log'
  ]);
  globalThis.NEURONS = Object.freeze({ W, day: (rec, history = []) => scoreDay(rec, history, 0), fromState, fromPlan, onurExtras, missing, selfTest });
})();
