/* Archeron · Voyage: steer a ferry down the river Acheron. Pure canvas, no assets.
   Lanterns (finished study sets) unlock boats and river zones. Knowledge gates ask a question. */
'use strict';
const VOYAGE = (() => {
  const BOATS = [
    { id: 'raft', name: 'Driftwood Raft', need: 0, hull: '#b88a4a', trim: '#e8c06a', perk: 'Steady and simple. Three lives.' },
    { id: 'skiff', name: 'Ember Skiff', need: 5, hull: '#8a3b22', trim: '#ff8a3d', perk: 'Wisps are worth 50% more.' },
    { id: 'barge', name: 'Lantern Barge', need: 15, hull: '#5a4a2a', trim: '#f6dc9a', perk: 'Starts every voyage with a shield.' },
    { id: 'ferry', name: "Ferryman's Boat", need: 30, hull: '#2c2a3e', trim: '#b0a4ff', perk: 'Four lives instead of three.' },
    { id: 'galleon', name: 'Ghost Galleon', need: 60, hull: '#26404a', trim: '#7fe0d0', perk: 'Pulls nearby wisps towards you.' },
    { id: 'phoenix', name: 'Phoenix Barge', need: 100, hull: '#6b1f1f', trim: '#ffb347', perk: 'Rises again once after sinking.' }
  ];
  const ZONES = [
    { id: 'twilight', name: 'Twilight Reach', need: 0, water: ['#141226', '#262048'], bank: '#07060c', glow: '#e8c06a', mult: 1 },
    { id: 'ember', name: 'Ember Falls', need: 20, water: ['#1f0f0c', '#47201a'], bank: '#0b0504', glow: '#ff8a3d', mult: 1.1 },
    { id: 'marsh', name: 'Starlit Marsh', need: 40, water: ['#0b1a1c', '#163a3c'], bank: '#040a0a', glow: '#7fe0d0', mult: 1.2 },
    { id: 'gates', name: 'Gates of Acheron', need: 80, water: ['#170b20', '#3a1640'], bank: '#08030b', glow: '#d48cff', mult: 1.35 }
  ];

  function start(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const boatDef = BOATS.find(b => b.id === opts.boat) || BOATS[0], zone = ZONES.find(z => z.id === opts.zone) || ZONES[0];
    const reduced = opts.reduced != null ? opts.reduced : matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, paused = false, over = false;
    const keys = {};
    const S = {
      t: 0, dist: 0, speed: 150, score: 0, wisps: 0, gates: 0,
      lives: boatDef.id === 'ferry' ? 4 : 3, max: boatDef.id === 'ferry' ? 4 : 3, shield: boatDef.id === 'barge', revive: boatDef.id === 'phoenix',
      inv: 1.2, shake: 0, nextGate: 22, spawnRock: .8, spawnWisp: .4,
      boat: { x: 0, tx: 0, y: 0 }, rocks: [], wisps: [], gatesArr: [], parts: [], streaks: []
    };

    function size() {
      const r = canvas.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(280, r.width); H = Math.max(360, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S.boat.y = H * .8; if (!S.boat.x) { S.boat.x = S.boat.tx = W / 2; }
      if (!S.streaks.length) for (let i = 0; i < 26; i++) S.streaks.push({ u: Math.random(), y: Math.random() * H, len: 10 + Math.random() * 30 });
    }
    const banks = sy => {
      const wy = S.dist + (H - sy);
      const l = W * .1 + W * .07 * Math.sin(wy * .0035) + W * .03 * Math.sin(wy * .011);
      const r = W - (W * .1 + W * .07 * Math.sin(wy * .0029 + 1.7) + W * .03 * Math.sin(wy * .013 + .5));
      return [l, r];
    };
    const rnd = (a, b) => a + Math.random() * (b - a);

    function spawn(dt) {
      S.spawnRock -= dt; S.spawnWisp -= dt;
      const [l, r] = banks(-40);
      if (S.spawnRock <= 0) {
        const rad = rnd(12, 22); S.rocks.push({ x: rnd(l + rad + 4, r - rad - 4), y: -40, r: rad, rot: rnd(0, 6.28), sides: 6 + (Math.random() * 3 | 0) });
        S.spawnRock = Math.max(.35, 1.1 - S.t * .012) * rnd(.7, 1.3);
      }
      if (S.spawnWisp <= 0) { S.wisps.push({ x: rnd(l + 20, r - 20), y: -30, ph: rnd(0, 6.28) }); S.spawnWisp = rnd(.5, 1.1); }
      if (S.t >= S.nextGate) { S.gatesArr.push({ y: -30, passed: false }); S.nextGate += 26; }
    }
    function burst(x, y, n, hue, spd = 3) {
      if (reduced) return;
      for (let i = 0; i < n; i++) { const a = rnd(0, 6.28), v = rnd(.5, spd); S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(20, 45), max: 45, hue }); }
    }
    function hit() {
      if (S.inv > 0) return;
      if (S.shield) { S.shield = false; S.inv = 1.2; burst(S.boat.x, S.boat.y, 24, 200); return; }
      S.lives--; S.inv = 1.6; S.shake = .35; burst(S.boat.x, S.boat.y, 30, 20, 4);
      if (S.lives <= 0) {
        if (S.revive) { S.revive = false; S.lives = 1; S.inv = 2.5; burst(S.boat.x, S.boat.y, 80, 35, 5); return; }
        end();
      }
    }
    function end() {
      over = true; cancelAnimationFrame(raf);
      draw();
      opts.onEnd && opts.onEnd({ score: Math.round(S.score), wisps: S.wisps, gates: S.gates, dist: Math.round(S.dist / 10) });
    }

    function update(dt) {
      S.t += dt;
      S.speed = Math.min(470, (150 + S.t * 6) * (zone.mult > 1 ? 1 + (zone.mult - 1) * .5 : 1));
      const dy = S.speed * dt;
      S.dist += dy;
      S.score += dy / 10 * zone.mult;
      if (keys.left) S.boat.tx -= 420 * dt;
      if (keys.right) S.boat.tx += 420 * dt;
      const [bl, br] = banks(S.boat.y);
      S.boat.tx = Math.min(br - 18, Math.max(bl + 18, S.boat.tx));
      S.boat.x += (S.boat.tx - S.boat.x) * Math.min(1, dt * 12);
      S.boat.x = Math.min(br - 16, Math.max(bl + 16, S.boat.x));
      if (S.inv > 0) S.inv -= dt;
      if (S.shake > 0) S.shake -= dt;
      spawn(dt);
      for (const r of S.rocks) { r.y += dy; const dx = r.x - S.boat.x, dyy = r.y - S.boat.y; if (dx * dx + dyy * dyy < (r.r + 12) ** 2) { hit(); r.hit = true; } }
      S.rocks = S.rocks.filter(r => r.y < H + 50 && !r.hit);
      for (const w of S.wisps) {
        w.y += dy; w.ph += dt * 4;
        if (boatDef.id === 'galleon') { const dx = S.boat.x - w.x, dyy = S.boat.y - w.y, d = Math.hypot(dx, dyy); if (d < 110 && d > 1) { w.x += dx / d * 260 * dt; w.y += dyy / d * 260 * dt; } }
        const dx = w.x - S.boat.x, dyy = w.y - S.boat.y;
        if (dx * dx + dyy * dyy < 26 * 26) { w.got = true; S.wisps++; S.score += 10 * (boatDef.id === 'skiff' ? 1.5 : 1) * zone.mult; burst(w.x, w.y, 10, 45, 2); }
      }
      S.wisps = S.wisps.filter(w => w.y < H + 40 && !w.got);
      for (const g of S.gatesArr) {
        g.y += dy;
        if (!g.passed && g.y >= S.boat.y) {
          g.passed = true; paused = true;
          opts.onGate ? opts.onGate(ok => {
            if (ok) { S.gates++; S.score += 100 * zone.mult; S.lives = Math.min(S.max, S.lives + 1); burst(S.boat.x, S.boat.y, 50, 45, 4); }
            S.inv = Math.max(S.inv, 1); paused = false; last = performance.now(); loop(last);
          }) : (paused = false);
        }
      }
      S.gatesArr = S.gatesArr.filter(g => g.y < H + 40);
      for (const s of S.streaks) { s.y += dy * 1.2; if (s.y > H + 40) { s.y = -40; s.u = Math.random(); } }
      for (const p of S.parts) { p.x += p.vx; p.y += p.vy + dy * .3; p.vx *= .96; p.vy *= .96; p.life--; }
      S.parts = S.parts.filter(p => p.life > 0);
      if (!reduced && Math.random() < .6) S.parts.push({ x: S.boat.x + rnd(-6, 6), y: S.boat.y + 22, vx: rnd(-.6, .6), vy: rnd(.5, 1.5), life: 30, max: 30, hue: -1 });
    }

    function draw() {
      ctx.save();
      if (S.shake > 0 && !reduced) ctx.translate(rnd(-4, 4), rnd(-4, 4));
      ctx.fillStyle = zone.bank; ctx.fillRect(-10, -10, W + 20, H + 20);
      /* river */
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, zone.water[0]); g.addColorStop(1, zone.water[1]);
      ctx.beginPath();
      for (let y = -10; y <= H + 10; y += 12) { const [l] = banks(y); y === -10 ? ctx.moveTo(l, y) : ctx.lineTo(l, y); }
      for (let y = H + 10; y >= -10; y -= 12) { const [, r] = banks(y); ctx.lineTo(r, y); }
      ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      /* bank glow edge */
      ctx.strokeStyle = zone.glow; ctx.globalAlpha = .18; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
      /* streaks */
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1.5;
      for (const s of S.streaks) { const [l, r] = banks(s.y), x = l + (r - l) * s.u; ctx.beginPath(); ctx.moveTo(x, s.y); ctx.lineTo(x, s.y + s.len); ctx.stroke(); }
      /* lanterns on the banks */
      const step = 180, first = Math.floor(S.dist / step);
      for (let k = first; k < first + Math.ceil(H / step) + 2; k++) {
        const sy = H - (k * step - S.dist); if (sy < -20 || sy > H + 20) continue;
        const [l, r] = banks(sy), side = k % 2 ? l - 10 : r + 10;
        const lg = ctx.createRadialGradient(side, sy, 0, side, sy, 18); lg.addColorStop(0, zone.glow); lg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = .55 + .2 * Math.sin(S.t * 3 + k); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(side, sy, 18, 0, 6.28); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(side, sy, 2.4, 0, 6.28); ctx.fill();
      }
      /* gates */
      for (const gt of S.gatesArr) {
        const [l, r] = banks(gt.y);
        ctx.strokeStyle = zone.glow; ctx.lineWidth = 3; ctx.shadowColor = zone.glow; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.moveTo(l, gt.y); ctx.quadraticCurveTo((l + r) / 2, gt.y - 34, r, gt.y); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = zone.glow; ctx.font = '600 12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('KNOWLEDGE GATE', (l + r) / 2, gt.y - 22);
      }
      /* wisps */
      for (const w of S.wisps) {
        const rr = 7 + Math.sin(w.ph) * 1.5, wg = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, rr * 3);
        wg.addColorStop(0, 'rgba(255,243,196,.95)'); wg.addColorStop(.35, 'rgba(232,192,106,.5)'); wg.addColorStop(1, 'rgba(232,192,106,0)');
        ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(w.x, w.y, rr * 3, 0, 6.28); ctx.fill();
      }
      /* rocks */
      for (const r of S.rocks) {
        ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot);
        ctx.beginPath(); for (let i = 0; i < r.sides; i++) { const a = i / r.sides * 6.28, rr = r.r * (.8 + .2 * Math.sin(i * 2.3 + r.rot)); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        ctx.closePath(); ctx.fillStyle = '#1c1a22'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(r.x, r.y + 2, r.r + 5, .2, 2.9); ctx.stroke();
      }
      /* particles */
      for (const p of S.parts) {
        const a = p.life / p.max;
        ctx.fillStyle = p.hue < 0 ? `rgba(255,255,255,${a * .25})` : `hsla(${p.hue},100%,65%,${a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.hue < 0 ? 2.5 * a + 1 : 2.2, 0, 6.28); ctx.fill();
      }
      drawBoat();
      ctx.restore();
      /* HUD */
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, 40);
      ctx.fillStyle = '#fff4dc'; ctx.font = '700 18px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(S.score).toLocaleString('en-GB'), 14, 20);
      ctx.font = '600 11px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillText(`${S.wisps} wisps`, 14 + ctx.measureText('0'.repeat(String(Math.round(S.score)).length + 2)).width + 30, 21);
      for (let i = 0; i < S.max; i++) {
        const x = W - 18 - i * 22, on = i < S.lives;
        ctx.fillStyle = on ? zone.glow : 'rgba(255,255,255,.15)'; ctx.globalAlpha = on ? 1 : .6;
        ctx.beginPath(); ctx.moveTo(x - 5, 13); ctx.lineTo(x + 5, 13); ctx.lineTo(x + 6, 27); ctx.lineTo(x - 6, 27); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      }
      if (S.shield) { ctx.fillStyle = '#9fd8ff'; ctx.font = '600 11px system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.fillText('SHIELD', W - 18 - S.max * 22, 21); }
    }
    function drawBoat() {
      const { x, y } = S.boat;
      if (S.inv > 0 && Math.floor(S.inv * 10) % 2 === 0 && !over) ctx.globalAlpha = .45;
      const lg = ctx.createRadialGradient(x, y - 6, 0, x, y - 6, 70); lg.addColorStop(0, 'rgba(255,220,150,.35)'); lg.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(x, y - 6, 70, 0, 6.28); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.quadraticCurveTo(x + 15, y - 8, x + 12, y + 20); ctx.lineTo(x - 12, y + 20); ctx.quadraticCurveTo(x - 15, y - 8, x, y - 26); ctx.closePath();
      ctx.fillStyle = boatDef.hull; ctx.fill(); ctx.strokeStyle = boatDef.trim; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 8, y + 6); ctx.lineTo(x + 8, y + 6); ctx.stroke();
      ctx.fillStyle = '#fff3c4'; ctx.shadowColor = boatDef.trim; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(x, y - 4, 4, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
      if (S.shield) { ctx.strokeStyle = 'rgba(159,216,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - 2, 30, 0, 6.28); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }

    function loop(now) {
      if (over || paused) return;
      const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
      update(dt); if (!over) { draw(); raf = requestAnimationFrame(loop); }
    }
    const pointer = e => { const r = canvas.getBoundingClientRect(); S.boat.tx = e.clientX - r.left; };
    const down = e => { canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId); pointer(e); };
    const move = e => { if (e.buttons || e.pointerType !== 'mouse') pointer(e); };
    const kd = e => { if (e.key === 'ArrowLeft' || e.key === 'a') { keys.left = true; e.preventDefault(); } if (e.key === 'ArrowRight' || e.key === 'd') { keys.right = true; e.preventDefault(); } };
    const ku = e => { if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false; if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false; };
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
    addEventListener('keydown', kd); addEventListener('keyup', ku);
    const onResize = () => { size(); if (paused || over) draw(); };
    addEventListener('resize', onResize);
    size(); draw();
    last = performance.now(); raf = requestAnimationFrame(loop);

    return {
      pause() { if (over || paused) return; paused = true; cancelAnimationFrame(raf); },
      resume() { if (over || !paused) return; paused = false; last = performance.now(); raf = requestAnimationFrame(loop); },
      isPaused: () => paused,
      finish() { if (!over) { paused = false; end(); } },
      stop() { over = true; cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('resize', onResize); }
    };
  }
  return { BOATS, ZONES, start };
})();
