/* Archeron · lesson bites, after Seneca Learning's style: a lesson section becomes small chunks that appear one at a time,
   and each asks you to do something: type a missing key term, choose between a word and its opposite, or work out the
   last line of a worked example before it is shown. Reading becomes active recall. Lessons end with an exam-style
   question and its mark scheme. Loaded after teach.js and check.js, whose lesson builder and exam bank it extends. */
'use strict';
/* word pairs where swapping one for the other makes a sentence wrong; a pair is only used when exactly one of its words appears */
const ANT = [['increase', 'decrease'], ['increases', 'decreases'], ['increased', 'decreased'], ['increasing', 'decreasing'], ['higher', 'lower'], ['high', 'low'],
  ['more', 'less'], ['positive', 'negative'], ['endothermic', 'exothermic'], ['active', 'passive'], ['faster', 'slower'], ['larger', 'smaller'], ['bigger', 'smaller'],
  ['gain', 'lose'], ['gains', 'loses'], ['into', 'out of'], ['inside', 'outside'], ['before', 'after'], ['stronger', 'weaker'], ['dilute', 'concentrated'],
  ['always', 'never'], ['anode', 'cathode'], ['series', 'parallel'], ['dominant', 'recessive'], ['aerobic', 'anaerobic'], ['transverse', 'longitudinal'],
  ['conductor', 'insulator'], ['acidic', 'alkaline'], ['acid', 'alkali'], ['heated', 'cooled'], ['absorbed', 'released'], ['absorbs', 'releases'], ['top', 'bottom'],
  ['maximum', 'minimum'], ['cooler', 'hotter'], ['wider', 'narrower'], ['thicker', 'thinner'], ['upwards', 'downwards'], ['add', 'subtract']];
const reEscB = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TERMS_C = {};
/* the key terms a subject's lessons can blank out: its defined terms and short recall answers */
function termsFor(subj) {
  if (TERMS_C[subj]) return TERMS_C[subj];
  const set = new Set();
  for (const t of (SUBJ_BY[subj] || { topics: [] }).topics) {
    const T = LEARN.TOPIC[t]; if (!T) continue;
    if (T.type === 'def') for (const it of LEARN.itemsOf(t)) set.add(it.p);
    if (T.type === 'recall') for (const it of LEARN.itemsOf(t)) if (it.a.length <= 24 && it.a.split(' ').length <= 2 && /^[A-Za-z][A-Za-z' -]+$/.test(it.a)) set.add(it.a);
  }
  return TERMS_C[subj] = [...set].filter(t => t.length >= 4 || /^[A-Z]{3,}$/.test(t)).sort((a, b) => b.length - a.length);
}
const sentences = t => t.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map(s => s.trim()).filter(Boolean) || [t];
let TOG_TURN = 0;
function interaction(text, terms, used) {
  const fill = () => { for (const t of terms) { if (used.has(t.toLowerCase())) continue; const m = new RegExp(`\\b${reEscB(t)}(s|es)?\\b`, 'i').exec(text); if (m) return { mode: 'fill', ans: m[0], at: m.index, len: m[0].length, term: t }; } return null; };
  const tog = () => {
    const low = text.toLowerCase();
    for (const [a, b] of ANT) {
      const ra = new RegExp(`\\b${reEscB(a)}\\b`, 'gi'), rb = new RegExp(`\\b${reEscB(b)}\\b`, 'gi'), ma = low.match(ra) || [], mb = low.match(rb) || [];
      if (ma.length + mb.length !== 1) continue;
      const word = ma.length ? a : b, alt = ma.length ? b : a, m = new RegExp(`\\b${reEscB(word)}\\b`, 'i').exec(text);
      const cased = m[0], altCased = /^[A-Z]/.test(cased) ? alt.charAt(0).toUpperCase() + alt.slice(1) : alt;
      return { mode: 'tog', ans: cased, alt: altCased, at: m.index, len: cased.length, flip: Math.random() < .5 };
    }
    return null;
  };
  const order = TOG_TURN++ % 3 === 2 ? [tog, fill] : [fill, tog]; /* mostly typing the key term, sometimes choosing */
  for (const f of order) { const r = f(); if (r) { if (r.term) used.add(r.term.toLowerCase()); return r; } }
  return null;
}
/* a section's lines → bites. Worked examples, common mistakes and exam tips keep their own boxes. */
function toBites(lines, head, subj, used) {
  const terms = termsFor(subj).filter(t => !(head || '').toLowerCase().includes(t.toLowerCase())), out = [];
  let buf = [];
  const flush = inter => { if (buf.length) { out.push(Object.assign({ k: 'text', text: buf.join(' ') }, inter || {})); buf = []; } };
  const group = (k, l) => { flush(); const last = out[out.length - 1]; if (last && last.k === k) last.lines.push(l); else out.push({ k, lines: [l] }); };
  for (const l of lines) {
    if (l.startsWith('> ')) { group('ex', l.slice(2)); continue; }
    if (l.startsWith('! ')) { group('mis', l.slice(2)); continue; }
    if (l.startsWith('* ')) { group('tip', l.slice(2)); continue; }
    if (l.startsWith('? ')) continue;
    const parts = l.startsWith('- ') ? ['• ' + l.slice(2)] : sentences(l);
    for (const s of parts) {
      buf.push(s);
      const inter = interaction(s, terms, used);
      if (inter) { const pre = buf.slice(0, -1).join(' '), off = pre ? pre.length + 1 : 0; inter.at += off; flush(inter); }
      else if (buf.join(' ').length > 300) flush(null);
    }
  }
  flush(null);
  return out;
}
const wfNorm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
function fillOk(typed, ans) {
  const t = wfNorm(typed), a = wfNorm(ans);
  if (!t) return false;
  if (t === a || t === a + 's' || t === a + 'es' || a === t + 's') return true;
  return lev(t, a) <= (a.length >= 10 ? 2 : a.length >= 5 ? 1 : 0); /* small typos are fine: spelling is not what is being tested */
}

/* ---------- drawing a section's bites ---------- */
const cur = st => st.bites[st.n - 1];
const biteDone = b => b.res != null;
function slotText(b) {
  const before = b.text.slice(0, b.at), after = b.text.slice(b.at + b.len);
  if (!biteDone(b) && b.mode === 'fill') return [before, h('span', { class: 'wf-slot' }, h('input', { id: 'wf-in', class: 'wf-in', 'data-draft': 'wf', value: DRAFT.wf || '', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'done', size: Math.max(4, Math.min(18, b.ans.length + 1)), placeholder: b.ans[0] + '_'.repeat(Math.max(2, b.ans.length - 1)), 'aria-label': `Missing word, ${b.ans.length} letters, starts with ${b.ans[0]}` })), after];
  if (!biteDone(b) && b.mode === 'tog') return [before, h('span', { class: 'tg' }, (b.flip ? [b.alt, b.ans] : [b.ans, b.alt]).map(o => h('button', { type: 'button', class: 'tg-b', 'data-act': 'biteTog', 'data-v': o }, o))), after];
  return [before, h('b', { class: 'wf-ans ' + (b.res === 'ok' ? 'ok' : 'no') }, b.ans), after];
}
function biteEl(b, live) {
  if (b.k === 'ex') { const show = biteDone(b) ? b.lines : b.lines.slice(0, -1);
    return h('div', { class: 'bite g-ex' }, h('span', { class: 'g-tag' }, 'Worked example'), show.map(l => h('p', null, l)),
      !biteDone(b) && live && [h('p', { class: 'muted xs' }, b.lines.length > 1 ? 'Work out the last line yourself, then check.' : 'Have a go yourself, then check.'), B('Check the last line', 'biteRead', 'ghost sm', { id: 'bite-go' })]); }
  if (b.k === 'mis' || b.k === 'tip') return h('div', { class: 'bite ' + (b.k === 'mis' ? 'g-mis' : 'g-tip') }, h('span', { class: 'g-tag' }, b.k === 'mis' ? 'Common mistakes' : 'Exam tips'),
    h('ul', null, b.lines.map(l => h('li', null, l))), !biteDone(b) && live && B('Got it', 'biteRead', 'ghost sm', { id: 'bite-go' }));
  const p = h('p', { class: 'bite-t' }, b.mode ? slotText(b) : b.text);
  return h('div', { class: 'bite' + (b.mode && biteDone(b) ? ' ' + b.res : '') + (live && !biteDone(b) ? ' live' : '') }, p,
    live && !biteDone(b) && (b.mode === 'fill' ? h('div', { class: 'row bite-row' }, B('Check', 'biteFill', 'primary sm'), B("I don't know", 'biteShow', 'link sm'), b.hint && h('small', { class: 'muted' }, b.hint))
      : b.mode === 'tog' ? h('p', { class: 'muted xs' }, 'Pick the right word') : B('Continue', 'biteRead', 'ghost sm', { id: 'bite-go' })),
    b.mode === 'fill' && b.res === 'no' && b.typed && h('small', { class: 'muted' }, `You wrote “${b.typed}”`));
}
function feedPanel(st) {
  const all = st.n >= st.bites.length && biteDone(cur(st));
  return [h('h3', { class: 'ls-h' }, st.h), h('div', { class: 'feed' }, st.bites.slice(0, st.n).map((b, i) => biteEl(b, i === st.n - 1))),
    all && h('p', { class: 'muted xs feed-end' }, 'Section done.')];
}
function biteNext() {
  const st = LS && LS.steps[LS.i]; if (!st || st.k !== 'feed') return;
  DRAFT.wf = '';
  if (st.n < st.bites.length) st.n++;
  render({ focus: '#wf-in' });
  const live = document.querySelector('.bite.live, .feed-end'); if (live) live.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
  if (st.n >= st.bites.length && biteDone(cur(st))) setTimeout(() => $('#ls-next')?.focus({ preventScroll: true }), 50);
}
function biteScore(ok) { LS.asked++; if (ok) LS.ok++; SFX.play(ok ? 'correct' : 'wrong'); }

/* ---------- the exam-style question that ends a lesson ---------- */
function lessonXq(topics) {
  if (typeof xqMakers !== 'function') return null;
  const makers = xqMakers(topics, 'Exam-style question'); if (!makers.length) return null;
  let best = null; /* a lesson should end on a real question: the most marks out of a few tries */
  for (let i = 0; i < 10; i++) { const q = pick(makers)(); if (q && (!best || qMax(q) > qMax(best))) best = q; if (best && qMax(best) >= 3) break; }
  return best;
}
function xqStepPanel(st) {
  const q = st.q, x = qX(q), m = qMax(q), calc = x.calc;
  const head = [h('h3', { class: 'ls-h' }, 'Exam-style question'), h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, `${m} mark${m > 1 ? 's' : ''}`), h('span', null, xqLevel(m))), h('p', { class: 'qtext' }, q[1])];
  if (!st.marked) return [head,
    calc ? h('div', { class: 'answer' }, calc.pre && h('span', { class: 'adorn' }, calc.pre), h('input', { id: 'lxq-in', 'data-draft': 'lxq', value: DRAFT.lxq || '', autocomplete: 'off', inputmode: calc.kind === 'num' ? 'decimal' : 'text', placeholder: 'Answer', 'aria-label': 'Your answer' }), calc.suf && h('span', { class: 'adorn' }, calc.suf))
      : h('textarea', { id: 'lxq-in', rows: Math.min(8, 2 + m), 'data-draft': 'lxq', value: DRAFT.lxq || '', maxlength: 4000, placeholder: 'Write your answer, as you would in the exam', 'aria-label': 'Your answer' }),
    h('div', { class: 'row' }, B('Mark it', 'lxqMark', 'primary grow', { id: 'ls-next' }), B('Skip', 'lsNext', 'link sm'))];
  const got = qScore(q, st.got, -1);
  return [head, h('p', { class: 'yours' }, h('b', null, 'Your answer: '), st.ans || '(left blank)'),
    h('div', { class: 'fb mark' }, h('p', { class: 'fb-h' }, 'Mark scheme'), st.auto && h('p', { class: 'muted xs' }, st.auto),
      x.model && h('p', null, h('b', null, 'Model answer: '), x.model),
      qTicks(q).map((pt, j) => h('label', { class: 'chk' + (st.got[j] ? ' d' : '') }, h('input', { type: 'checkbox', checked: !!st.got[j], 'data-act': 'lxqTick', 'data-j': j }), checkBox(), h('span', null, pt))),
      h('p', { class: 'ex-score' }, `${got} / ${m}`)),
    B('Finish the lesson', 'lxqDone', 'primary wide', { id: 'ls-next' })];
}

Object.assign(ACT, {
  biteFill() {
    const st = LS && LS.steps[LS.i], b = st && cur(st); if (!b || b.mode !== 'fill' || biteDone(b)) return;
    const typed = (DRAFT.wf || $('#wf-in')?.value || '').trim(); if (!typed) { $('#wf-in')?.focus(); return; }
    if (fillOk(typed, b.ans)) { b.res = 'ok'; biteScore(true); return biteNext(); }
    b.tries = (b.tries || 0) + 1;
    if (b.tries === 1) { b.hint = `Not quite. It starts “${b.ans.slice(0, Math.min(3, b.ans.length - 1))}…”`; SFX.play('click'); DRAFT.wf = typed; return render({ focus: '#wf-in' }); }
    b.res = 'no'; b.typed = typed; biteScore(false); biteNext();
  },
  biteShow() { const st = LS && LS.steps[LS.i], b = st && cur(st); if (!b || biteDone(b)) return; b.res = 'no'; biteScore(false); biteNext(); },
  biteTog(el) { const st = LS && LS.steps[LS.i], b = st && cur(st); if (!b || b.mode !== 'tog' || biteDone(b)) return; const ok = el.dataset.v === b.ans; b.res = ok ? 'ok' : 'no'; biteScore(ok); biteNext(); },
  biteRead() { const st = LS && LS.steps[LS.i], b = st && cur(st); if (!b || biteDone(b)) return; b.res = 'read'; biteNext(); },
  lxqMark() {
    const st = LS && LS.steps[LS.i]; if (!st || st.k !== 'xq') return;
    const q = st.q, x = qX(q), ans = (DRAFT.lxq || '').trim(); st.ans = ans; st.got = qTicks(q).map(() => false); st.marked = true;
    if (x.calc && ans) { const r = LEARN.check(x.calc, ans); if (r.valid && r.ok) { st.got = st.got.map(() => true); st.auto = 'Right answer: full marks, just as an examiner would give.'; } else st.auto = `The answer is ${x.calc.show}. Give yourself any method marks your working earned.`; }
    else if (x.def && ans) { st.got = LEARN.defTicks({ points: qTicks(q) }, ans); st.auto = 'The ticks are a first guess from your words. Fix them honestly.'; }
    else if (Array.isArray(q[2]) && q[2].length === 1 && ans && fillOk(ans, q[2][0])) { st.got = [true]; st.auto = 'That matches the mark scheme.'; }
    DRAFT.lxq = ''; render({ focus: '#ls-next' });
  },
  lxqDone() { const st = LS && LS.steps[LS.i]; if (st && st.k === 'xq') { const m = qMax(st.q), g = qScore(st.q, st.got || [], -1); LS.asked++; if (g >= m / 2) LS.ok++; } lsMove(1); }
});
CHG.lxqTick = el => { const st = LS && LS.steps[LS.i]; if (!st || st.k !== 'xq') return; st.got[+el.dataset.j] = el.checked; render(); };
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'wf-in') { e.preventDefault(); ACT.biteFill(); } });
