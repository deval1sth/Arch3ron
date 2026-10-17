/* Archeron · sound effects, made in code with the Web Audio API: no files, nothing borrowed, works offline.
   Browsers only allow sound after the first tap or key press, so the audio engine starts on that gesture.
   Wrong answers get a soft neutral "bloop", never a buzzer: missing should not feel like failing. */
'use strict';
const SFX = (() => {
  const VOL = { off: 0, quiet: .35, normal: .8 };
  let ctx = null, out = null, nb = null, level = 'quiet', scratch = null;
  function ac() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); out = ctx.createGain(); out.connect(ctx.destination); }
    out.gain.value = VOL[level];
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  const wake = () => { if (level !== 'off') ac(); };
  addEventListener('pointerdown', wake, { capture: true, passive: true }); addEventListener('keydown', wake, { capture: true });

  /* building blocks; each takes the context and destination so the self-test can render them offline */
  const tone = (c, dst, f, t, d, { type = 'sine', v = .3, f2 = 0, a = .005 } = {}) => {
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(dst); o.start(t); o.stop(t + d + .02);
  };
  const noise = c => { if (!nb || nb.sampleRate !== c.sampleRate) { nb = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } const s = c.createBufferSource(); s.buffer = nb; return s; };
  const hiss = (c, dst, t, d, { v = .2, type = 'bandpass', f = 2000, f2 = 0, q = 1 } = {}) => {
    const s = noise(c), fl = c.createBiquadFilter(), g = c.createGain(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); fl.Q.value = q;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl).connect(g).connect(dst); s.start(t); s.stop(t + d + .02);
  };
  const bell = (c, dst, f, t, v = .22, d = 1.6) => { tone(c, dst, f, t, d, { v }); tone(c, dst, f * 2.01, t, d * .6, { v: v * .35 }); tone(c, dst, f * 3.02, t, d * .35, { v: v * .15 }); };

  const SOUNDS = {
    /* game-style "coin": two quick square-wave notes, the second rings */
    correct: (c, o, t) => { tone(c, o, 988, t, .09, { type: 'square', v: .14 }); tone(c, o, 1319, t + .08, .34, { type: 'square', v: .14 }); tone(c, o, 2638, t + .08, .2, { v: .05 }); },
    /* streaks: a rising run, one note longer for each milestone */
    combo: (c, o, t, run = 3) => { const ns = [523, 659, 784, 1047, 1319], k = run >= 10 ? 5 : run >= 5 ? 4 : 3;
      ns.slice(0, k).forEach((f, i) => tone(c, o, f, t + i * .07, .2, { type: 'square', v: .12 })); tone(c, o, ns[k - 1] * 2, t + k * .07, .45, { v: .07 }); },
    wrong: (c, o, t) => tone(c, o, 330, t, .24, { v: .16, f2: 247 }),
    reveal: (c, o, t) => hiss(c, o, t, .35, { f: 600, f2: 3000, v: .1, q: .7 }),
    land: (c, o, t) => tone(c, o, 880, t, .08, { type: 'triangle', v: .13 }),
    chime: (c, o, t) => { tone(c, o, 1047, t, .5, { v: .1 }); tone(c, o, 1568, t + .09, .6, { v: .08 }); },
    start: (c, o, t) => bell(c, o, 659, t),
    rest: (c, o, t) => bell(c, o, 1047, t, .2, 1.2),
    fanfare: (c, o, t) => { [523, 659, 784].forEach((f, i) => tone(c, o, f, t + i * .11, .18, { type: 'square', v: .11 })); [1047, 1319, 1568].forEach(f => tone(c, o, f, t + .36, .9, { type: 'triangle', v: .08 })); bell(c, o, 784, t + .36, .1); },
    ach: (c, o, t) => { [1568, 2093, 2637, 3136].forEach((f, i) => tone(c, o, f, t + i * .06, .55, { v: .07 })); hiss(c, o, t, .6, { type: 'highpass', f: 6000, v: .04 }); },
    flip: (c, o, t) => hiss(c, o, t, .12, { f: 1500, f2: 4000, v: .14, q: .6 }),
    click: (c, o, t) => tone(c, o, 2200, t, .025, { type: 'triangle', v: .05 })
  };
  const on = () => level !== 'off' && !document.hidden;
  function play(name, arg) { if (!on() || !SOUNDS[name]) return; const c = ac(); if (!c || c.state !== 'running') return; SOUNDS[name](c, out, c.currentTime + .01, arg); }
  /* the board's pen: a faint fluttering scratch for as long as a line is being written */
  function pen(sec, after = 0) {
    stopPen(); if (!on() || sec <= 0) return; const c = ac(); if (!c || c.state !== 'running') return;
    const t = c.currentTime + after, s = noise(c), fl = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    s.loop = true; fl.type = 'bandpass'; fl.frequency.value = 3500; fl.Q.value = 1.2;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.03, t + .05); g.gain.setValueAtTime(.03, t + sec); g.gain.linearRampToValueAtTime(0, t + sec + .08);
    lfo.frequency.value = 11; lg.gain.value = .018; lfo.connect(lg).connect(g.gain);
    s.connect(fl).connect(g).connect(out); s.start(t); s.stop(t + sec + .1); lfo.start(t); lfo.stop(t + sec + .1); scratch = [s, lfo];
  }
  function stopPen() { if (scratch) { for (const n of scratch) try { n.stop(); } catch (e) {} scratch = null; } }
  function setLevel(l) { level = VOL[l] != null ? l : 'quiet'; if (out) out.gain.value = VOL[level]; if (level === 'off') stopPen(); }

  /* Run from the console: renders every sound offline (silently) and checks each one actually makes audio. */
  async function selfTest() {
    const res = {};
    for (const name of Object.keys(SOUNDS)) {
      const c = new OfflineAudioContext(1, 44100 * 2, 44100); SOUNDS[name](c, c.destination, 0, 5);
      const d = (await c.startRendering()).getChannelData(0); let peak = 0; for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
      res[name] = peak > .01 && peak <= 1;
    }
    return { passed: Object.values(res).filter(Boolean).length, failed: Object.keys(res).filter(k => !res[k]) };
  }
  return { play, pen, stopPen, setLevel, level: () => level, selfTest, names: Object.keys(SOUNDS) };
})();
