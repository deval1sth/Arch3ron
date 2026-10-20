/* Archeron · Listen mode. The app reads a question, waits while you answer it in your head, then reads the answer:
   revision for the bus or a walk. Facts, definitions and descriptive words, the ones you are weakest on first.
   Only voices built into the device are used (localService), so nothing you hear is sent anywhere. */
'use strict';
const LSN = { track: null, items: [], i: 0, phase: 'idle', pause: 5, rate: 1, run: 0, wake: null, from: 'learn' };
const SPEECH = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
function lsnVoice() {
  if (!SPEECH) return null;
  const vs = speechSynthesis.getVoices().filter(v => v.localService && /^en/i.test(v.lang));
  return vs.find(v => /en-GB/i.test(v.lang)) || vs[0] || null;
}
if (SPEECH) speechSynthesis.addEventListener?.('voiceschanged', () => { if (TAB === 'listen') render(); });
/* weak and due facts first, then new ones, then the ones you know; twenty a round */
function lsnItems(track) {
  const ids = (track && SUBJ_BY[track] ? topicsFor(track) : mySubjects().flatMap(s => topicsFor(s.id))).filter(id => FACTY.has(LEARN.TOPIC[id].type));
  const all = ids.flatMap(id => LEARN.itemsOf(id).map(it => ({ id, type: LEARN.TOPIC[id].type, p: it.p, a: it.a, k: it.k })));
  const rank = it => { const m = S.items[it.k]; return !m ? 2 : m[2] === 0 ? 0 : m[2] <= 2 ? 1 : 3; };
  return shuffleA(all).sort((a, b) => rank(a) - rank(b)).slice(0, 20);
}
const lsnPrompt = it => it.type === 'def' ? `Define: ${it.p}` : it.type === 'vocab' ? `What does "${it.p}" mean?` : it.p;
function lsnSay(text, run) {
  return new Promise(res => {
    const v = lsnVoice(); if (!v || run !== LSN.run) return res();
    let done = false; const end = () => { if (!done) { done = true; res(); } };
    try {
      const u = new SpeechSynthesisUtterance(text.replace(/→/g, ', ')); u.voice = v; u.lang = v.lang; u.rate = LSN.rate;
      u.onend = end; u.onerror = end;
      setTimeout(end, 2500 + text.split(/\s+/).length * 600 / LSN.rate); /* some devices never fire onend */
      speechSynthesis.speak(u);
    } catch (e) { end(); } /* a voice that will not speak skips the line rather than freezing the player */
  });
}
const lsnWait = (s, run, tick) => new Promise(res => { let left = s; const step = () => { if (run !== LSN.run) return res(); if (tick) tick(left); if (left <= 0) return res(); left--; setTimeout(step, 1000); }; step(); });
async function lsnPlay() {
  const run = ++LSN.run;
  try { LSN.wake = navigator.wakeLock ? await navigator.wakeLock.request('screen') : null; } catch (e) { LSN.wake = null; }
  while (run === LSN.run && LSN.i < LSN.items.length) {
    if (TAB !== 'listen') return lsnStop(); /* leaving the page stops it */
    const it = LSN.items[LSN.i];
    LSN.phase = 'q'; render(); await lsnSay(lsnPrompt(it), run);
    LSN.phase = 'wait'; render(); await lsnWait(LSN.pause, run, n => { const e = $('#lsn-count'); if (e) e.textContent = n > 0 ? `${n}` : ''; });
    LSN.phase = 'a'; render(); await lsnSay(it.a, run);
    await lsnWait(1, run);
    if (run !== LSN.run) return;
    LSN.i++;
  }
  if (run === LSN.run) { LSN.phase = 'done'; lsnRelease(); render(); }
}
function lsnRelease() { try { LSN.wake && LSN.wake.release(); } catch (e) {} LSN.wake = null; }
function lsnStop() { LSN.run++; if (SPEECH) speechSynthesis.cancel(); lsnRelease(); if (LSN.phase !== 'done') LSN.phase = 'idle'; }
function vListen() {
  if (!LSN.items.length) LSN.items = lsnItems(LSN.track);
  const it = LSN.items[LSN.i], voice = lsnVoice(), playing = ['q', 'wait', 'a'].includes(LSN.phase), subs = mySubjects().filter(s => topicsFor(s.id).some(id => FACTY.has(LEARN.TOPIC[id].type)));
  const back = LSN.from === 'subject' ? 'subject' : LSN.from === 'home' ? 'home' : 'learn';
  return h('div', { class: 'stack narrow' },
    subHero(back === 'home' ? 'Focus' : 'Learn', 'Listen and learn', back, 'The app reads a question and gives you a few seconds to answer it in your head, then reads the answer. Good for the bus or a walk.', back === 'subject' ? TRACK_NAME(SUBJ_SEL) : back === 'home' ? 'Focus' : 'Learn'),
    !voice ? card(null, null, h('p', null, SPEECH ? 'Looking for a voice built into this device…' : 'This browser cannot speak, so listen mode cannot play here.'),
      h('p', { class: 'muted xs' }, 'Listen mode only uses voices built into your device, never online ones. If none appears, check your device has an English voice installed.'))
      : h('section', { class: 'card lsn-player' + (playing ? ' live' : '') },
        LSN.phase === 'done' ? [h('p', { class: 'fb-h' }, 'Round finished'), h('p', { class: 'muted' }, `${LSN.items.length} facts heard. The ones you are weakest on come first every time.`),
          B([icon('reset'), 'Another round'], 'lsnNew', 'primary wide')]
        : it ? [h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, LEARN.name(it.id)), h('span', null, `${LSN.i + 1} of ${LSN.items.length}`)),
          h('div', { class: 'lsn-prog' }, h('i', { style: `width:${LSN.i / LSN.items.length * 100}%` })),
          h('p', { class: 'qtext lsn-q' + (LSN.phase === 'q' ? ' speaking' : '') }, lsnPrompt(it)),
          h('div', { class: 'lsn-mid' }, LSN.phase === 'wait' ? [h('span', { class: 'lsn-count', id: 'lsn-count' }, String(LSN.pause)), h('small', null, 'answer it in your head')] : null),
          h('p', { class: 'lsn-a' + (LSN.phase === 'a' ? ' speaking' : '') + (LSN.phase === 'a' || (!playing && LSN.phase !== 'idle') ? ' shown' : '') }, it.a),
          h('div', { class: 'row lsn-ctl' }, B(icon('back'), 'lsnBack', 'ghost icon-only', { 'aria-label': 'Previous', disabled: LSN.i === 0 }),
            B(playing ? [icon('pause'), 'Pause'] : [icon('play'), LSN.phase === 'idle' && LSN.i === 0 ? 'Start listening' : 'Carry on'], 'lsnToggle', 'primary grow', { id: 'lsn-go' }),
            B(icon('skip'), 'lsnSkip', 'ghost icon-only', { 'aria-label': 'Next' }))]
        : h('p', { class: 'muted' }, 'No facts to listen to here yet. Pick another subject.')),
    card('Settings', null,
      h('p', { class: 'muted xs' }, 'Subject'), h('div', { class: 'chips' }, chip('Everything', !LSN.track, 'lsnTrack', { 'data-track': '' }), subs.map(s => chip([icon(s.icon), s.name], LSN.track === s.id, 'lsnTrack', { 'data-track': s.id }))),
      h('p', { class: 'muted xs' }, 'Thinking time'), h('div', { class: 'chips' }, [3, 5, 8].map(n => chip(`${n} seconds`, LSN.pause === n, 'lsnPause', { 'data-n': n }))),
      h('p', { class: 'muted xs' }, 'Speed'), h('div', { class: 'chips' }, [[.85, 'Slower'], [1, 'Normal'], [1.15, 'Faster']].map(([r, l]) => chip(l, LSN.rate === r, 'lsnRate', { 'data-r': r })))),
    h('p', { class: 'muted xs center' }, 'Keep the screen on while you listen: some phones stop speaking when they lock.'));
}
VIEWS.listen = vListen;
Object.assign(ACT, {
  listenGo(el) { LSN.track = el.dataset.track || null; LSN.items = []; LSN.i = 0; LSN.phase = 'idle'; LSN.from = TAB === 'subject' ? 'subject' : TAB === 'home' ? 'home' : 'learn'; go('listen'); },
  lsnToggle() { if (['q', 'wait', 'a'].includes(LSN.phase)) { lsnStop(); render(); } else lsnPlay(); },
  lsnSkip() { const was = ['q', 'wait', 'a'].includes(LSN.phase); lsnStop(); LSN.i = Math.min(LSN.items.length - 1, LSN.i + 1); if (was) lsnPlay(); else render(); },
  lsnBack() { const was = ['q', 'wait', 'a'].includes(LSN.phase); lsnStop(); LSN.i = Math.max(0, LSN.i - 1); if (was) lsnPlay(); else render(); },
  lsnNew() { lsnStop(); LSN.items = lsnItems(LSN.track); LSN.i = 0; LSN.phase = 'idle'; render(); },
  lsnTrack(el) { lsnStop(); LSN.track = el.dataset.track || null; LSN.items = []; LSN.i = 0; LSN.phase = 'idle'; render(); },
  lsnPause(el) { LSN.pause = +el.dataset.n; render(); },
  lsnRate(el) { LSN.rate = +el.dataset.r; render(); }
});
/* Focus and Learn link here with a plain "go": remember where you came from for the back button */
const _goListen = ACT.go;
ACT.go = el => { if (el.dataset.tab === 'listen' && TAB !== 'listen') { LSN.from = TAB === 'home' ? 'home' : TAB === 'subject' ? 'subject' : 'learn'; if (TAB !== 'subject') LSN.track = null; LSN.items = []; LSN.i = 0; LSN.phase = 'idle'; } else if (TAB === 'listen' && el.dataset.tab !== 'listen') lsnStop(); return _goListen(el); };
render();
