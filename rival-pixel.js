/* Onur's room as pixel art: a 320×192 framebuffer drawn with hand-written primitives and sprites, lit per pixel
   (time of day, desk lamp, monitor, phone, his eyes) with ordered dithering, then scaled up with crisp pixels.
   SCENE.mount(el), SCENE.frame(now, info, motion), SCENE.say(kind, text), SCENE.room(r). */
const SCENE = (() => {
  const W = 320, H = 192;
  const col = new Uint32Array(W * H), emi = new Uint8Array(W * H);
  let cv, cx, img, E = 0, lastDraw = 0, react = null, roomData = null, spreadAt = 0, lastSpread = -1, blinkAt = 0;
  const hexn = h => parseInt(h.slice(1), 16);
  const C = Object.fromEntries(Object.entries({
    ink: '#0b0b12', skin: '#efdfd8', skinS: '#c7aea8', hair: '#15151d', hairH: '#3d4260', shirt: '#1d1d28', shirtH: '#353850', shirtS: '#121219',
    jeans: '#2d3c60', jeansS: '#202b47', jeansH: '#43588a', sock: '#2b2b33', eyeW: '#f4eeee', eyeR: '#ff2a3a', pupil: '#2a0306', under: '#6b4a56', mouth: '#7c5a58',
    wall: '#77727d', wallD: '#625e69', base: '#4a4652', floor: '#5c4537', floorD: '#4a3629', rug: '#5a1c24', rugD: '#47141b',
    desk: '#6f4d35', deskT: '#8a6444', deskD: '#4f3525', wood: '#3c2b21', chair: '#24252e', chairH: '#383a48',
    frame: '#d8d2c8', blind: '#e8e2d8', sill: '#bdb5a8', bed: '#3a2c25', sheet: '#c9ccd6', duvet: '#3e4660', duvetH: '#56608a', pillow: '#e0e3ea',
    paper: '#ece7de', calRed: '#a3232c', clock: '#efece6', note: '#e3c46c', noteD: '#c9a94f', board: '#1f2a24', chalk: '#e9e7df', chalkR: '#ff8a8f',
    trophy: '#e0b84a', trophyD: '#a8862f', ball: '#e8e4da', bezel: '#101116', screen: '#22335d', screenL: '#3b5296', scrText: '#e8ecf8', red: '#d42a38',
    metal: '#23242e', metalH: '#3a3d4e', bulb: '#fff2c6', mug: '#d9d6d0', coffee: '#3a2418', steam: '#c9ccd6', city: '#141826', cityL: '#ffcf86', star: '#ffffff',
    moon: '#eef0ff', sun: '#fff0c4', phone: '#0b0d16', phoneS: '#a9c4ff', binC: '#2a2b33', cloud: '#ffffff', rain: '#9fb3d8', poster: '#e8e3d6', posterG: '#9a8f7a',
    books: '#000000'
  }).map(([k, v]) => [k, hexn(v)]));
  const BOOKS = ['#3b3f52', '#5a4a3c', '#6b2228', '#2c4642', '#8b7f6c', '#46464c', '#1f2232', '#7a6a50', '#4a2730', '#59606e'].map(hexn);

  /* ---------- primitives (no anti-aliasing: every pixel is one colour) ---------- */
  const px = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= H) return; const i = y * W + x; col[i] = c; emi[i] = E; };
  const rect = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(i, j, c); };
  function line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (let n = 0; n < 2000; n++) { px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  function poly(pts, c) {
    let a = Infinity, b = -Infinity; for (const p of pts) { a = Math.min(a, p[1]); b = Math.max(b, p[1]); }
    for (let y = Math.ceil(a); y <= Math.floor(b); y++) {
      const xs = []; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; if ((p[1] <= y && q[1] > y) || (q[1] <= y && p[1] > y)) xs.push(p[0] + (y - p[1]) * (q[0] - p[0]) / (q[1] - p[1])); }
      xs.sort((m, n) => m - n); for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x <= Math.round(xs[k + 1]); x++) px(x, y, c);
    }
  }
  const outline = (pts, c) => pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; line(p[0], p[1], q[0], q[1], c); });
  const shape = (pts, fill) => { poly(pts, fill); outline(pts, C.ink); };
  const disc = (x, y, r, c) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * .6) px(x + i, y + j, c); };
  const thick = (a, b, r, c) => { const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]))); for (let s = 0; s <= n; s++) disc(a[0] + (b[0] - a[0]) * s / n, a[1] + (b[1] - a[1]) * s / n, r, c); };
  /* a sleeve chain: all the ink first, then the fill, so joints have no seams */
  const arm = (pts, r, fill, hand) => { for (let i = 0; i + 1 < pts.length; i++) thick(pts[i], pts[i + 1], r + 1, C.ink); for (let i = 0; i + 1 < pts.length; i++) thick(pts[i], pts[i + 1], r, fill); if (hand) { disc(hand[0], hand[1], 2, C.ink); disc(hand[0], hand[1], 1, C.skin); } };

  /* ---------- a 3×5 pixel font ---------- */
  const FONT = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
    I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
    Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
    Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110',
    6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110', '.': '000000000000010', ',': '000000000010100', ':': '000010000010000',
    '!': '010010010000010', '?': '110001010000010', "'": '010010000000000', '-': '000000111000000', '/': '001001010100100', '%': '101001010100101', '+': '000010111010000',
    '*': '000101010101000', '(': '001010010010001', ')': '100010010010100', '"': '101101000000000' };
  function text(s, x, y, c, maxChars = 99) {
    s = String(s).toUpperCase().replace(/[…]/g, '...').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').slice(0, maxChars);
    for (let n = 0; n < s.length; n++) { const g = FONT[s[n]]; if (g) for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j * 3 + i] === '1') px(x + n * 4 + i, y + j, c); }
  }
  const wrap = (s, n) => { const out = []; let cur = ''; for (const w of String(s).split(' ')) { if ((cur + ' ' + w).trim().length > n) { if (cur) out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur); return out; };

  /* ---------- Onur's head, 22×22, facing right ---------- */
  const HEAD = [
    '..........k.....k.........', '......k..khk...khk..k.....', '.....khk.khhk.khhk.khk....', '...k.khhkhhhhkhhhhkhhk....', '..khkhhhhhhhhhhhhhhhhhk...',
    '.khhhhhHHHHhhhhhhhhhhhhk..', '.khhhHHhhhhhhhhhhhhhhhhhk.', 'khhhHhhhhhhhhhhhhhhhhhhhhk', 'khhhhhhhhhhhhhhhhhhhhhhhk.', 'khhhhhhhhhhhhhhhhhhhhhhhhk',
    'khhhhhhhhhhhhhhhhhhhhhhhk.', 'khhhhhhhhhhhhhhhhhhhhhhhhk', 'khhhhhhhhhhshhhhshhhhshhhk', '.khhhhhhhhssshhssshhsshhk.', '.khhhhhhhhssshhsssshhsshk.',
    '..khhhhhhSskkksssssskkssk.', '..khhhhhhSswwepssssseepsk.', '..khhhhhhSsddddssssddsssk.', '...khhhhhSssssssssssssssnk', '...khhhhhSssssssssssssssk.',
    '....khhhhSsssssssmmssssk..', '....khhhkkSsssssssssssk...', '.....khk..kSsssssssssk....', '.....k.....kkSSsssskk.....', '...........kSSkkkkk.......'].map(r => r.padEnd(26, '.').slice(0, 26));
  const variant = (rows, swap) => rows.map(r => r.replace(/./g, ch => swap[ch] ?? ch));
  const HEAD_SHUT = variant(HEAD, { w: 's', e: 's', p: 's' }), HEAD_TIRED = variant(HEAD, { w: 'k', e: 'd' });
  const HEAD_YAWN = HEAD.map((r, j) => j === 20 ? r.replace('mm', 'kk') : j === 21 ? r.slice(0, 16) + 'kkkk' + r.slice(20) : r);
  const rot = rows => Array.from({ length: rows[0].length }, (_, r) => rows.map(row => row[row.length - 1 - r]).join(''));
  const HEAD_SLEEP = rot(HEAD_SHUT);
  const MAP = { k: [C.ink], h: [C.hair], H: [C.hairH], s: [C.skin], S: [C.skinS], w: [C.eyeW], e: [C.eyeR, 1], p: [C.pupil, 1], d: [C.under], m: [C.mouth], n: [C.skinS] };
  function sprite(rows, x, y) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const m = MAP[r[i]]; if (!m) continue; E = m[1] ? 1 : 0; px(x + i, y + j, m[0]); } }); E = 0; }
  const TROPHY = ['kkkkkkk', 'kyyyyyk', '.kyyyk.', '..kyk..', '..kyk..', '.kyyyk.', 'kkkkkkk'];

  /* ---------- time of day ---------- */
  const NIGHT = { sky1: '#06081a', sky2: '#18204a', amb: [.2, .22, .34], stars: 1, city: 1, stripe: [.04, .05, .1] };
  const DAWN = { sky1: '#3d3f6e', sky2: '#e9a184', amb: [.62, .55, .58], stars: .2, city: .4, stripe: [.18, .12, .08] };
  const DAY = { sky1: '#7fb0e6', sky2: '#dbe9f6', amb: [1, 1, 1], stars: 0, city: 0, stripe: [.16, .14, .1] };
  const DUSK = { sky1: '#2a2f5e', sky2: '#f08a56', amb: [.62, .5, .52], stars: .1, city: .5, stripe: [.2, .1, .04] };
  const KEYS = [[0, NIGHT], [5.75, NIGHT], [7, DAWN], [8.5, DAY], [16.5, DAY], [18, DUSK], [19.4, NIGHT], [24, NIGHT]];
  const rgb = h => [hexn(h) >> 16 & 255, hexn(h) >> 8 & 255, hexn(h) & 255];
  function sky(h) {
    let i = 0; while (KEYS[i + 1][0] <= h) i++;
    const [h0, A] = KEYS[i], [h1, B] = KEYS[i + 1], t = (h - h0) / (h1 - h0), L = (a, b) => a + (b - a) * t;
    const c1 = rgb(A.sky1).map((v, k) => L(v, rgb(B.sky1)[k])), c2 = rgb(A.sky2).map((v, k) => L(v, rgb(B.sky2)[k]));
    return { c1, c2, amb: A.amb.map((v, k) => L(v, B.amb[k])), stars: L(A.stars, B.stars), city: L(A.city, B.city), stripe: A.stripe.map((v, k) => L(v, B.stripe[k])) };
  }
  const pack = c => (Math.round(c[0]) << 16) | (Math.round(c[1]) << 8) | Math.round(c[2]);
  const STARS = Array.from({ length: 22 }, (_, i) => [201 + Math.floor((Math.sin(i * 91.7) * 43758.5453 % 1 + 1) % 1 * 92), 15 + Math.floor((Math.sin(i * 17.3) * 9631.7 % 1 + 1) % 1 * 40)]);
  const CITY = [[200, 62, 10], [210, 52, 8], [218, 66, 12], [230, 56, 9], [239, 46, 7], [246, 60, 11], [257, 54, 9], [266, 64, 10], [276, 48, 8], [284, 58, 10]];

  /* ---------- the room ---------- */
  function room(now, S, info, t) {
    const d = new Date(now);
    rect(0, 0, W, 151, C.wall); rect(0, 148, W, 4, C.base);
    for (let y = 152; y < H; y++) for (let x = 0; x < W; x++) px(x, y, (y - 152) % 9 === 0 || ((x + (y - 152 > 9 ? 37 : 0)) % 61 === 0) ? C.floorD : C.floor);
    for (let y = 176; y < 188; y++) for (let x = 64; x < 190; x++) { const u = (x - 127) / 63, v = (y - 182) / 6; if (u * u + v * v <= 1) px(x, y, (x + y) % 7 ? C.rug : C.rugD); }

    /* window: sky, stars, moon or sun, city, rain, blinds half up */
    for (let y = 14; y < 88; y++) { const f = (y - 14) / 74; E = 1; for (let x = 200; x < 294; x++) px(x, y, pack(S.c1.map((v, k) => v + (S.c2[k] - v) * f))); }
    if (S.stars > .1) for (const [x, y] of STARS) if ((x * 7 + y + Math.floor(now / 900)) % 5 || S.stars > .8) px(x, y, C.star);
    const h = d.getHours() + d.getMinutes() / 60, sunT = (h - 7) / 11, moonT = ((h + 24 - 18) % 24) / 13;
    const arc = (k, r) => [204 + k * 86, 70 - Math.sin(Math.PI * k) * r];
    if (sunT > 0 && sunT < 1) { const [x, y] = arc(sunT, 50); disc(x, y, 5, C.sun); }
    if (moonT > 0 && moonT < 1) { const [x, y] = arc(moonT, 46); disc(x, y, 4, C.moon); disc(x + 2, y - 1, 3, pack(S.c1)); }
    if (S.stars < .5) { const off = (now / 1000 * 2) % 120; for (const [x0, y0] of [[205, 30], [245, 40]]) { const x = 200 + ((x0 - 200 + off) % 94); rect(Math.round(x), y0, 12, 3, C.cloud); rect(Math.round(x) + 3, y0 - 2, 6, 2, C.cloud); } }
    for (const [x, y, w] of CITY) { rect(x, y, w, 88 - y, C.city); if (S.city > .3) for (let j = y + 2; j < 86; j += 4) for (let i = x + 1; i < x + w - 1; i += 3) if ((i * 13 + j * 7) % 5 < 2) px(i, j, C.cityL); }
    if (rainy(now)) for (let k = 0; k < 40; k++) { const x = 200 + ((k * 37 + Math.floor(now / 40) * 3) % 94), y = 14 + ((k * 53 + Math.floor(now / 40) * 5) % 74); px(x, y, C.rain); px(x - 1, y + 1, C.rain); }
    E = 0;
    for (let y = 14; y < 34; y += 3) { rect(200, y, 94, 2, C.blind); px(200, y + 1, C.sill); }
    rect(196, 10, 102, 4, C.frame); rect(196, 88, 102, 4, C.frame); rect(196, 10, 4, 82, C.frame); rect(294, 10, 4, 82, C.frame); rect(246, 14, 2, 74, C.frame);
    rect(192, 92, 110, 4, C.sill); outline([[196, 10], [297, 10], [297, 91], [196, 91]], C.ink);
    line(288, 14, 288, 40, C.sill);

    /* shelves of books */
    for (const [y, seed, x1] of [[34, 11, 82], [60, 29, 66]]) {
      rect(6, y, 78, 3, C.wood); line(6, y + 3, 83, y + 3, C.ink);
      let x = 8, s = seed; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      while (x < x1) { const w = 3 + Math.floor(r() * 3), bh = 8 + Math.floor(r() * 5); rect(x, y - bh, w, bh, BOOKS[Math.floor(r() * BOOKS.length)]); line(x + w, y - bh, x + w, y - 1, C.ink); px(x, y - bh, C.ink); x += w + 1; }
    }
    rect(68, 50, 12, 10, C.ink); rect(69, 51, 10, 8, C.paper); rect(70, 52, 8, 6, C.screenL);

    /* calendar with today ringed, and the clock */
    rect(92, 12, 28, 32, C.paper); rect(92, 12, 28, 8, C.calRed); outline([[92, 12], [119, 12], [119, 43], [92, 43]], C.ink);
    text(['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()], 100, 14, C.paper);
    const first = (new Date(d.getFullYear(), d.getMonth(), 1).getDay() + 6) % 7, days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    for (let n = 1; n <= days; n++) { const k = first + n - 1, x = 94 + (k % 7) * 3.6, y = 22 + Math.floor(k / 7) * 4; if (n === d.getDate()) rect(Math.round(x) - 1, y - 1, 3, 3, C.calRed); else px(x, y, C.posterG); }
    disc(150, 26, 10, C.ink); disc(150, 26, 9, C.clock);
    for (let k = 0; k < 12; k++) px(150 + Math.sin(k * Math.PI / 6) * 8, 26 - Math.cos(k * Math.PI / 6) * 8, C.ink);
    const mm = d.getMinutes() + d.getSeconds() / 60, hh = (d.getHours() % 12) + mm / 60;
    line(150, 26, 150 + Math.sin(hh * Math.PI / 6) * 5, 26 - Math.cos(hh * Math.PI / 6) * 5, C.ink);
    line(150, 26, 150 + Math.sin(mm * Math.PI / 30) * 7, 26 - Math.cos(mm * Math.PI / 30) * 7, C.ink);
    line(150, 26, 150 + Math.sin(d.getSeconds() * Math.PI / 30) * 8, 26 - Math.cos(d.getSeconds() * Math.PI / 30) * 8, C.red);

    /* sticky note: his status, or a jab at you */
    rect(152, 52, 42, 18, C.note); rect(152, 52, 42, 3, C.noteD); outline([[152, 52], [193, 52], [193, 69], [152, 69]], C.ink);
    text(info.note[0] || '', 154, 56, C.ink, 10); text(info.note[1] || '', 154, 63, C.ink, 10);

    /* the room's story: tallies, trophies, posters */
    const R = roomData || { you: 0, onur: 0, trophies: 0, crumpled: 0, level: 1 };
    rect(8, 70, 74, 21, C.board); outline([[8, 70], [81, 70], [81, 90], [8, 90]], C.wood);
    text('RUNO', 11, 73, C.chalk); text('ONUR', 11, 82, C.chalkR); tallies(R.you, 30, 73, C.chalk); tallies(R.onur, 30, 82, C.chalkR);
    rect(8, 104, 74, 2, C.wood); line(8, 106, 81, 106, C.ink);
    for (let i = 0; i < Math.min(9, R.trophies); i++) TROPHY.forEach((row, j) => { for (let k = 0; k < 7; k++) { const ch = row[k]; if (ch !== '.') px(10 + i * 8 + k, 97 + j, ch === 'k' ? C.trophyD : C.trophy); } });
    if (R.level >= 4) { rect(86, 50, 20, 26, C.poster); outline([[86, 50], [105, 50], [105, 75], [86, 75]], C.ink); for (let j = 53; j < 73; j += 4) for (let i = 88; i < 104; i += 3) px(i, j, (i + j) % 7 ? C.posterG : C.calRed); }
    if (R.level >= 7) { rect(158, 74, 36, 16, C.ink); text('NO DAYS', 162, 76, C.poster); text('OFF', 170, 83, C.red); }

    /* bed */
    rect(0, 112, 4, 48, C.bed); rect(0, 140, 86, 14, C.bed); line(0, 154, 85, 154, C.ink); rect(2, 152, 3, 22, C.bed); rect(80, 152, 3, 22, C.bed);
    rect(2, 132, 84, 9, C.sheet); line(2, 141, 85, 141, C.ink);
    rect(4, 124, 26, 9, C.pillow); outline([[4, 124], [29, 124], [29, 132], [4, 132]], C.ink);
    const sleeping = info.pose === 'sleep';
    poly(sleeping ? [[22, 130], [38, 118], [62, 122], [86, 128], [86, 146], [22, 146]] : [[26, 132], [86, 129], [86, 146], [24, 146]], C.duvet);
    outline(sleeping ? [[22, 130], [38, 118], [62, 122], [86, 128], [86, 146], [22, 146]] : [[26, 132], [86, 129], [86, 146], [24, 146]], C.ink);
    line(30, 138, 84, 136, C.duvetH);
    if (sleeping) { sprite(HEAD_SLEEP, 2, 104); for (let k = 0; k < 3; k++) { const p = ((now / 2600 + k / 3) % 1); text('Z', 30 + k * 4 + p * 8, 100 - p * 18 - k * 3, C.chalk); } }
  }
  function tallies(n, x, y, c) {
    for (let i = 0; i < Math.min(n, 30); i++) { const g = Math.floor(i / 5), k = i % 5, gx = x + g * 8; if (k < 4) line(gx + k * 1.5, y, gx + k * 1.5, y + 4, c); else line(gx - 1, y + 4, gx + 6, y, c); }
    if (n) text(String(n), 70, y, c);
  }
  const rainy = now => { const d = new Date(now); return ((d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) * 2654435761 >>> 0) % 3 === 0; };

  function desk(now, info, motion) {
    const R = roomData || { level: 1, crumpled: 0 };
    shape([[140, 106], [320, 106], [320, 116], [134, 116]], C.deskT); rect(134, 116, 186, 6, C.desk); line(134, 122, 319, 122, C.ink);
    rect(138, 122, 6, 54, C.deskD); outline([[138, 122], [143, 122], [143, 175], [138, 175]], C.ink);
    rect(268, 122, 46, 54, C.desk); outline([[268, 122], [313, 122], [313, 175], [268, 175]], C.ink);
    for (const y of [127, 150]) { outline([[271, y], [310, y], [310, y + 20], [271, y + 20]], C.deskD); rect(286, y + 9, 8, 2, C.sill); }
    /* monitor */
    rect(236, 66, 56, 39, C.bezel); outline([[236, 66], [291, 66], [291, 104], [236, 104]], C.ink); rect(262, 104, 4, 3, C.metal); rect(252, 106, 24, 2, C.metal);
    E = 1;
    if (info.pose === 'write') {
      rect(239, 69, 50, 32, C.screen); rect(239, 69, 50, 5, C.ink); px(241, 71, C.red); text('ARCHERON', 244, 69, C.screenL);
      text((info.subject || 'REVISION').slice(0, 12), 241, 77, C.scrText, 12); rect(241, 85, 40, 1, C.screenL); rect(241, 88, 32, 1, C.screenL);
      rect(241, 96, 46, 2, C.screenL); rect(241, 96, Math.round(46 * Math.max(0, Math.min(1, info.prog || 0))), 2, C.red);
    } else rect(239, 69, 50, 32, C.ink);
    E = 0;
    rect(232, 108, 44, 3, C.metal); for (let x = 233; x < 275; x += 2) px(x, 109, C.metalH);
    /* mug and steam */
    rect(300, 98, 7, 8, C.mug); outline([[300, 98], [306, 98], [306, 105], [300, 105]], C.ink); line(307, 100, 308, 103, C.ink); line(301, 98, 305, 98, C.coffee);
    if (info.pose === 'write' || info.pose === 'phone') for (let k = 0; k < 2; k++) for (let j = 0; j < 6; j++) { const y = 96 - j - ((now / 120) % 4 | 0); if (y > 86) px(302 + k * 2 + Math.round(Math.sin(j * .9 + now / 400 + k) * 1), y, C.steam); }
    /* books on the desk grow with his level */
    for (let i = 0; i < (R.level >= 9 ? 6 : R.level >= 6 ? 4 : R.level >= 3 ? 2 : 0); i++) { const y = 103 - i * 3, x = 192 + (i % 2); rect(x, y, 16 - (i % 3), 3, BOOKS[(i * 3 + 2) % BOOKS.length]); line(x, y + 3, x + 15 - (i % 3), y + 3, C.ink); }
    /* Halloween week: a carved pumpkin, its face flickering like a candle */
    const dd = new Date(now), md = dd.getMonth() * 100 + dd.getDate();
    if (md >= 924 && md <= 1001) {
      for (let y = 98; y < 106; y++) for (let x = 214; x < 231; x++) { const u = (x - 222) / 8.5, v = (y - 102) / 4.4; if (u * u + v * v <= 1) px(x, y, (x === 218 || x === 222 || x === 226) ? 0xb4561a : 0xe0782a); }
      line(214, 103, 215, 105, 0x8a3f12); line(230, 103, 229, 105, 0x8a3f12); rect(221, 96, 2, 3, 0x4c6b2a); px(223, 96, 0x4c6b2a);
      const fl = motion ? .75 + .25 * Math.sin(now / 90) * Math.sin(now / 37) : 1, glow = (r, g, b) => (Math.round(r * fl) << 16) | (Math.round(g * fl) << 8) | Math.round(b * fl);
      E = 1; const f = glow(255, 205, 90);
      px(218, 100, f); px(219, 100, f); px(225, 100, f); px(226, 100, f); px(222, 101, f);
      for (let x = 217; x <= 227; x++) if (x !== 220 && x !== 224) px(x, 103, f); px(218, 104, f); px(222, 104, f); px(226, 104, f);
      E = 0;
    }
    /* notebook: one line per answer, a tick or a cross at the end */
    shape([[143, 108], [157, 108], [157, 114], [141, 114]], C.paper); shape([[158, 108], [172, 108], [174, 114], [158, 114]], C.paper);
    if (info.pose === 'write') {
      if (info.spread !== lastSpread) { if (lastSpread >= 0 && motion) spreadAt = now; lastSpread = info.spread; }
      const f = Math.max(0, Math.min(1, (info.frac - .28) / .6));
      for (let i = 0; i <= info.line; i++) {
        const L = LINE(i), len = i < info.line ? L.w : Math.round(L.w * f);
        for (let k = 0; k < len; k++) if ((k + i) % 4 !== 3) px(L.x + k, L.y, C.ink);
        if (i < info.line || info.frac > .9) px(L.x + L.w + 1, L.y, info.marks[i] ? 0x2f9e64 : 0xd64550);
      }
      const ft = (now - spreadAt) / 600; if (ft < 1) { const x = 172 - ft * 30; shape([[158, 108], [x, 107], [x - 1, 114], [158, 114]], C.paper); }
    }
    /* bin with your week wins */
    shape([[154, 162], [166, 162], [165, 176], [155, 176]], C.binC); line(155, 165, 165, 165, C.metalH);
    [[156, 159], [161, 158], [164, 160], [158, 155], [163, 154], [153, 156], [167, 157], [160, 151]].slice(0, Math.min(8, R.crumpled)).forEach(([x, y]) => { disc(x, y, 2, C.ink); disc(x, y, 1, C.ball); });
  }
  const LINE = i => { const p = i < 3 ? 0 : 1, r = i % 3; return { x: p ? 160 : 145, y: 109 + r * 2, w: 10 }; };

  function lamp(on) {
    shape([[205, 104], [221, 104], [222, 107], [204, 107]], C.metal);
    line(213, 104, 222, 82, C.metal); line(214, 104, 223, 82, C.metal); line(222, 82, 203, 70, C.metal); line(223, 83, 204, 71, C.metal); disc(222, 82, 1, C.metalH);
    shape([[200, 64], [208, 68], [205, 80], [194, 76]], C.metal); line(201, 66, 207, 69, C.metalH);
    E = on ? 1 : 0; line(195, 77, 204, 80, on ? C.bulb : C.metalH); line(196, 78, 203, 80, on ? C.bulb : C.metalH); E = 0;
  }

  /* ---------- Onur ---------- */
  function onur(now, info, motion, chairOff) {
    /* chair */
    const o = chairOff;
    shape([[90 + o, 96], [95 + o, 95], [97 + o, 138], [92 + o, 138]], C.chair); line(93 + o, 98, 94 + o, 134, C.chairH);
    rect(113 + o, 140, 4, 26, C.metal); shape([[98 + o, 166], [132 + o, 166], [130 + o, 169], [100 + o, 169]], C.metal);
    for (const x of [100, 115, 130]) { disc(x + o, 171, 2, C.ink); }
    shape([[96 + o, 136], [137 + o, 136], [136 + o, 140], [97 + o, 140]], C.chairH);
    const seated = info.pose === 'write' || info.pose === 'phone';
    if (!seated) return;

    const re = react ? (now - react.at) / 1000 : 99, live = re < 3.4, mode = live && react.kind === 'stretch' && re < 2.6 ? 'stretch' : info.pose === 'write' && info.frac < .28 ? 'think' : info.pose;
    /* legs and body */
    shape([[124, 134], [136, 133], [141, 136], [141, 139], [124, 139]], C.sock);
    shape([[128, 104], [135, 104], [134, 136], [128, 136]], C.jeans); line(133, 106, 133, 134, C.jeansS);
    shape([[102, 137], [96, 122], [96, 108], [101, 97], [110, 90], [120, 88], [126, 93], [124, 107], [121, 124], [118, 136]], C.shirt);
    poly([[103, 136], [97, 122], [97, 108], [101, 99], [103, 112], [106, 130]], C.shirtS);
    line(102, 99, 110, 92, C.shirtH); line(98, 108, 99, 120, C.shirtH);
    shape([[104, 131], [124, 104], [131, 99], [137, 103], [136, 108], [118, 136], [106, 138]], C.jeans);
    line(108, 129, 126, 105, C.jeansH); line(127, 103, 133, 100, C.jeansH);
    /* neck and head: the head nods with what he's doing */
    shape([[119, 80], [128, 80], [129, 92], [117, 93]], C.skin); poly([[120, 81], [122, 81], [121, 92], [118, 92]], C.skinS);
    shape([[110, 92], [117, 89], [129, 89], [132, 93], [121, 97]], C.shirt); line(117, 90, 129, 90, C.shirtH);
    const blink = motion && (now - blinkAt) % 4200 < 140, turn = !live ? 0 : react.kind === 'glance' ? -2 : react.kind === 'slump' ? 3 : react.kind === 'stretch' ? -1 : 0;
    const nod = mode === 'write' ? (motion ? Math.round(Math.sin(now / 900)) : 0) + 1 : mode === 'phone' ? 2 : 0;
    const yawning = live && react.kind === 'slump' && react.text === '*yawn*';
    const head = blink ? HEAD_SHUT : yawning ? HEAD_YAWN : info.tired ? HEAD_TIRED : HEAD;
    const hx = 113 + (mode === 'write' ? 1 : 0), hy = 59 + nod + turn + (info.tired ? 1 : 0);
    sprite(head, hx, hy);
    eyes = [[hx + 12, hy + 16], [hx + 21, hy + 16]];

    /* arms */
    const S0 = [118, 94];
    if (mode === 'write') {
      const L = LINE(info.line), f = Math.max(0, Math.min(1, (info.frac - .28) / .6)), sp = info.hype ? 1.7 : 1;
      const tx = L.x + f * L.w + (motion ? Math.sin(now / 1000 * 22 * sp) * .5 : 0), ty = L.y - (info.frac > .88 ? 1 : 0);
      const Wr = [tx - 2, ty - 3], L1 = 25, L2 = 30, dx = Wr[0] - S0[0], dy = Wr[1] - S0[1], dist = Math.min(L1 + L2 - 1, Math.hypot(dx, dy)), a = Math.atan2(dy, dx);
      const b = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist)))), El = [S0[0] + L1 * Math.cos(a + b), S0[1] + L1 * Math.sin(a + b)];
      line(tx, ty, tx + 3, ty - 6, C.steam);
      arm([S0, El, Wr], 2, C.shirt, Wr);
    } else if (mode === 'think') {
      arm([S0, [128, 118], [131, 92]], 2, C.shirt, null);
      disc(132, 89, 2, C.ink); disc(132, 89, 1, C.skin); line(132, 87, 131, 83, C.skin); px(130, 83, C.ink);
    } else if (mode === 'phone') {
      arm([S0, [128, 118], [134, 98]], 2, C.shirt, [134, 97]);
      rect(132, 86, 5, 9, C.phone); E = 1; rect(133, 87, 3, 7, C.phoneS); E = 0;
    } else if (mode === 'stretch') {
      arm([[110, 92], [104, 70], [112, 50]], 2, C.shirtS, [112, 49]);
      arm([S0, [121, 70], [127, 50]], 2, C.shirt, [127, 49]);
    }
  }
  let eyes = [];

  /* ---------- light: ambient by time, the desk lamp, the monitor, his phone and eyes, with dithering ---------- */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
  function lightUp(S, lights, day) {
    const out = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, c = col[i]; let r = c >> 16 & 255, g = c >> 8 & 255, b = c & 255;
      if (!emi[i]) {
        let lr = S.amb[0], lg = S.amb[1], lb = S.amb[2];
        if (x > 30 && x < 196 && y > 30 && y < 176 && ((y - x * .45 + 400) % 12) < 3) { lr += S.stripe[0]; lg += S.stripe[1]; lb += S.stripe[2]; }
        for (const L of lights) {
          const dx = x - L.x, dy = y - L.y, dd = Math.sqrt(dx * dx + dy * dy); if (dd > L.r) continue;
          let f = 1 - dd / L.r; f *= f;
          if (L.cone) { const cs = (dx * L.cone[0] + dy * L.cone[1]) / (dd || 1); if (cs < L.cone[2]) f *= .18; }
          f *= L.i; lr += L.c[0] * f; lg += L.c[1] * f; lb += L.c[2] * f;
        }
        const t = BAYER[(y & 3) * 4 + (x & 3)], q = v => Math.floor(Math.min(1.3, v) * 10 + t) / 10;
        r = Math.min(255, r * q(lr)); g = Math.min(255, g * q(lg)); b = Math.min(255, b * q(lb));
      }
      const o = i * 4; out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = 255;
    }
    cx.putImageData(img, 0, 0);
  }

  /* ---------- speech bubble, drawn after the light so it stays readable ---------- */
  function bubble(now) {
    if (!react || (now - react.at) / 1000 > 3.4) return;
    const lines = wrap(react.text, 22).slice(0, 3), w = Math.max(...lines.map(l => l.length)) * 4 + 6, h = lines.length * 7 + 5, x = 142, y = 36;
    cx.fillStyle = '#0b0b12'; cx.fillRect(x - 1, y - 1, w + 2, h + 2); cx.fillStyle = '#f4f1ea'; cx.fillRect(x, y, w, h);
    cx.fillStyle = '#0b0b12'; cx.fillRect(x + 2, y + h + 1, 2, 2); cx.fillRect(x, y + h + 3, 2, 2);
    const tmp = cx.getImageData(x, y, w, h); /* draw text pixels straight onto the canvas */
    lines.forEach((l, j) => { l = l.toUpperCase(); for (let n = 0; n < l.length; n++) { const g = FONT[l[n]]; if (g) for (let jj = 0; jj < 5; jj++) for (let ii = 0; ii < 3; ii++) if (g[jj * 3 + ii] === '1') { const o = ((3 + j * 7 + jj) * w + 3 + n * 4 + ii) * 4; tmp.data[o] = 11; tmp.data[o + 1] = 11; tmp.data[o + 2] = 18; } } });
    cx.putImageData(tmp, x, y);
  }

  function mount(host) {
    host.innerHTML = '<canvas class="pix" width="320" height="192" role="img" aria-label="Onur\'s room, in pixel art"></canvas>';
    cv = host.querySelector('canvas'); cx = cv.getContext('2d'); img = cx.createImageData(W, H); blinkAt = Math.random() * 4000;
  }

  function frame(now, info, motion) {
    if (!cv) return;
    if (motion && now - lastDraw < 40 && now >= lastDraw) return;   /* about 25 frames a second is plenty for pixel art */
    lastDraw = now;
    const d = new Date(now), S = sky(d.getHours() + d.getMinutes() / 60), night = Math.max(0, Math.min(1, 1 - S.amb[0]) / .8);
    const seated = info.pose === 'write' || info.pose === 'phone', lampOn = info.lamp && (night > .05 || info.pose === 'write');
    room(now, S, info, motion); desk(now, info, motion);
    onur(now, info, motion, seated ? 0 : -8);
    lamp(lampOn);
    const lights = [];
    if (lampOn) { const dx = 158 - 199, dy = 112 - 78, l = Math.hypot(dx, dy); lights.push({ x: 199, y: 78, r: 130, c: [1.05, .85, .58], i: .45 + .75 * night, cone: [dx / l, dy / l, .72] }, { x: 199, y: 76, r: 26, c: [1, .85, .6], i: .5 * night }); }
    if (info.pose === 'write') lights.push({ x: 264, y: 86, r: 90, c: [.45, .55, .9], i: .25 + .55 * night });
    if (info.pose === 'phone') lights.push({ x: 134, y: 90, r: 20, c: [.5, .6, 1], i: .9 });
    if (seated) for (const [x, y] of eyes) lights.push({ x, y, r: 3, c: [1, .15, .15], i: .2 + .3 * night });
    lightUp(S, lights, !night);
    bubble(now);
  }

  function say(kind, txt) { react = { kind, text: txt, at: performance.now() }; react.at = Date.now(); }
  function room_(r) { roomData = r; }
  return { mount, frame, say, room: room_ };
})();
