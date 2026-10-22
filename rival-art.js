/* Onur and his room, drawn in SVG. Built once by ART.markup(); rival-scene.js animates it.
   Scene units: 800 × 480, roughly 1 unit = 0.4 cm, so Onur is about six heads tall and the furniture matches him.
   His head is drawn in head-local units (centre 0,0), placed at HEAD and scaled by HS. */
const ART = (() => {
  const INK = '#050507', SKIN = '#f2e6e0', SKIN_SH = '#d8c4bf', SKIN_DK = '#b99f9b';
  const HAIR = '#0b0b10', HAIR_MID = '#121219', HAIR_HI = '#3c4158';
  const SHIRT = '#17171e', SHIRT_SH = '#0c0c11', SHIRT_HI = '#30323f';
  const JEANS = '#26324d', JEANS_SH = '#1b2439', JEANS_HI = '#3d4c74', SOCK = '#2b2b32';
  const HEAD = [346, 150], HS = .9, NECK = [334, 196];
  const f = n => +(+n).toFixed(1);
  const rand = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  /* a tapered strand from root R to tip T, bent sideways by `bend` */
  function strand(R, T, w, bend) {
    const dx = T[0] - R[0], dy = T[1] - R[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const C = [R[0] + dx * .5 + nx * bend, R[1] + dy * .5 + ny * bend];
    return `M${f(R[0] + nx * w / 2)} ${f(R[1] + ny * w / 2)} Q${f(C[0] + nx * w * .32)} ${f(C[1] + ny * w * .32)} ${f(T[0])} ${f(T[1])} Q${f(C[0] - nx * w * .32)} ${f(C[1] - ny * w * .32)} ${f(R[0] - nx * w / 2)} ${f(R[1] - ny * w / 2)}Z`;
  }
  /* a limb: tapered from width wa at A to wb at B, round at both ends */
  function limb(A, B, wa, wb) {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    return `M${f(A[0] + nx * wa / 2)} ${f(A[1] + ny * wa / 2)} L${f(B[0] + nx * wb / 2)} ${f(B[1] + ny * wb / 2)} A${f(wb / 2)} ${f(wb / 2)} 0 0 0 ${f(B[0] - nx * wb / 2)} ${f(B[1] - ny * wb / 2)} L${f(A[0] - nx * wa / 2)} ${f(A[1] - ny * wa / 2)} A${f(wa / 2)} ${f(wa / 2)} 0 0 0 ${f(A[0] + nx * wa / 2)} ${f(A[1] + ny * wa / 2)}Z`;
  }
  const paths = list => list.map(([R, T, w, b]) => strand(R, T, w, b)).join('');

  /* ---------- hair, head-local: a heavy messy mop. Locks hang down at the back and nape, a fringe falls over the eyes,
     side locks reach the jaw, and only a few flicks stand up at the crown. ---------- */
  const MOP = 'M30 -40 C14 -54 -18 -56 -38 -38 C-52 -24 -54 0 -48 22 C-44 36 -36 46 -28 52 L-18 40 C-20 26 -20 12 -16 0 C-8 -10 12 -14 32 -12Z';
  const BACK = paths([[[-40, -30], [-60, -24], 14, -4], [[-46, -14], [-64, 2], 15, -3], [[-48, 2], [-63, 24], 15, -2], [[-46, 16], [-57, 42], 14, -3],
    [[-41, 28], [-47, 58], 14, -2], [[-34, 38], [-36, 66], 13, -2], [[-26, 44], [-22, 70], 12, 2], [[-18, 40], [-11, 63], 11, 3],
    [[-26, -46], [-44, -58], 14, -4], [[-10, -53], [-21, -72], 14, -3], [[6, -54], [3, -70], 12, -2], [[20, -48], [31, -62], 11, -3], [[-36, -36], [-55, -42], 12, -3]]);
  const MASS = 'M38 -6 C40 -24 28 -46 4 -48 C-20 -50 -38 -36 -40 -14 C-41 -2 -36 8 -30 14 C-28 4 -24 -4 -20 -8 C-10 -14 8 -16 24 -12 C31 -10 35 -8 38 -6Z';
  const FRINGE = 'M-24 -2 C-16 -13 6 -16 24 -12 C32 -10 37 -8 41 -4 L41 1 C31 2.5 21 3 11 3.6 C0 3.8 -12 3 -24 6Z';
  const FRONT = paths([[[-4, -40], [-16, -58], 15, 4], [[-20, -36], [-38, -48], 15, 5], [[10, -40], [17, -56], 13, -3],
    [[-14, -6], [-20, 40], 12, 3], [[-20, -4], [-28, 34], 12, 4],
    [[-10, -12], [-14, 26], 16, 5], [[-1, -14], [-4, 22], 15, 4], [[8, -14], [6, 26], 15, 3], [[15, -13], [20, 30], 15, -3], [[22, -12], [23, 20], 13, 3],
    [[29, -10], [37, 26], 14, -4], [[35, -8], [47, 17], 11, -3], [[3, -15], [26, -3], 12, -6], [[-6, -14], [14, 6], 10, -4]]);
  const CLUMPS = 'M-6 -46 Q-14 -30 -18 -14 M10 -44 Q8 -28 4 -14 M24 -38 Q25 -26 20 -12 M-24 -38 Q-32 -24 -34 -8 M-38 4 Q-40 18 -36 30';
  const SHINE = paths([[[-28, -30], [-12, -42], 3, -3], [[-8, -42], [16, -38], 3, -3], [[-36, -14], [-30, -30], 3, 2], [[6, -12], [5, 12], 3, 2],
    [[16, -12], [20, 20], 3, -2], [[-4, -12], [-9, 16], 3, 2], [[-44, 0], [-50, 20], 3, 2]]);
  const FACE = 'M-22 -6 C-21 -26 2 -34 22 -30 C34 -27 40 -14 39 0 C39 7 41 13 41 18 C40 21 37 22 36 23 C35 29 31 35 26 39 C22 42 17 44 13 43 C4 41 -6 35 -13 27 C-19 20 -23 8 -22 -6Z';

  function head() {
    return `<g id="rv-head" style="transform-origin:${NECK[0]}px ${NECK[1]}px"><g transform="translate(${HEAD[0]} ${HEAD[1]}) scale(${HS})">
  <path d="${MOP}" fill="${HAIR}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
  <g fill="${HAIR}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"><path d="${BACK}"/></g>
  <path d="${FACE}" fill="${SKIN}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M-21 0 Q8 -12 39 2 L39 8 Q8 -4 -21 8Z" fill="${SKIN_SH}"/>
  <path d="M-18 22 C-12 32 -2 38 6 40 C-2 34 -10 26 -12 18Z" fill="${SKIN_SH}"/>
  <path d="M30 16 L35 22 L31 23.5" fill="none" stroke="${SKIN_DK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 31.5 Q23 32.6 28 30.6" fill="none" stroke="#7c5a58" stroke-width="1.3" stroke-linecap="round"/>
  <ellipse cx="-20" cy="10" rx="4.5" ry="7.5" fill="${SKIN_SH}" stroke="${INK}" stroke-width="1.3"/>
  <path d="M-6 9.5 Q2 3 14 8 Q12 14.5 4 15.5 Q-3 14.5 -6 9.5Z" fill="#f4eeee"/>
  <circle cx="6" cy="10.8" r="4.4" fill="url(#rv-iris)"/><circle cx="6.6" cy="11.2" r="1.7" fill="#190205"/><circle cx="4.6" cy="9" r="1.2" fill="#fff"/>
  <path d="M-7 9.6 Q2 2.4 15 7.6 L16.5 6.4" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M-4 14.6 Q4 16.6 12 13.4" fill="none" stroke="${INK}" stroke-width="1"/>
  <path d="M-5 17.4 Q4 20.6 13.5 16" fill="none" stroke="#6d4b57" stroke-width="1.5" opacity=".75" stroke-linecap="round"/>
  <path d="M-3 19.6 Q4 21.8 11 19" fill="none" stroke="#8a6670" stroke-width="1" opacity=".5" stroke-linecap="round"/>
  <path d="M25 9.4 Q30 5.6 35.5 8.4 Q34 13.6 30 13.8 Q27 13.4 25 9.4Z" fill="#f4eeee"/>
  <circle cx="31.4" cy="10.4" r="3.1" fill="url(#rv-iris)"/><circle cx="31.8" cy="10.7" r="1.2" fill="#190205"/>
  <path d="M24.4 9.4 Q30 4.8 36.4 8" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M25.5 16.2 Q30.5 18.4 35 15.6" fill="none" stroke="#6d4b57" stroke-width="1.2" opacity=".7" stroke-linecap="round"/>
  <path d="${MASS}" fill="${HAIR_MID}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="${FRINGE}" fill="${HAIR_MID}"/>
  <g fill="${HAIR_MID}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"><path d="${FRONT}"/></g>
  <path d="${CLUMPS}" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>
  <g fill="${HAIR_HI}" opacity=".9"><path d="${SHINE}"/></g>
</g></g>`;
  }

  /* ---------- the room ---------- */
  function books(x0, x1, y, seed) {
    const r = rand(seed), C = ['#3b3f52', '#5a4a3c', '#6b2228', '#2c4642', '#8b7f6c', '#46464c', '#1f2232', '#7a6a50', '#4a2730', '#59606e'];
    let x = x0, out = '';
    while (x < x1 - 8) {
      const w = 5 + Math.round(r() * 6), h = 20 + Math.round(r() * 16), c = C[Math.floor(r() * C.length)];
      if (r() < .08 && x < x1 - 30) { out += `<rect x="${x + 4}" y="${y - h + 2}" width="${w}" height="${h}" fill="${c}" stroke="${INK}" stroke-width=".9" transform="rotate(-14 ${x + 4} ${y})"/>`; x += w + 9; continue; }
      out += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${c}" stroke="${INK}" stroke-width=".9"/><path d="M${x + 1} ${y - h + 5} h${w - 2} M${x + 1} ${y - 6} h${w - 2}" stroke="rgba(255,255,255,.18)" stroke-width=".9"/>`;
      x += w + .5;
    }
    return out;
  }
  const STARS = Array.from({ length: 30 }, (_, i) => { const a = Math.sin(i * 91.7) * 43758.5453, b = Math.sin(i * 17.3) * 9631.7; return `<circle cx="${f(518 + (a - Math.floor(a)) * 248)}" cy="${f(38 + (b - Math.floor(b)) * 120)}" r="${.6 + (i % 3) * .4}" fill="#fff"/>`; }).join('');
  const CITY = [[516, 186, 24], [540, 160, 20], [560, 194, 30], [590, 170, 22], [612, 150, 18], [630, 182, 28], [658, 164, 22], [680, 190, 26], [706, 156, 20], [726, 176, 30], [756, 168, 14]];
  const city = CITY.map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${230 - y}"/>`).join('');
  const lights = CITY.flatMap(([x, y, w], i) => { const cols = Math.floor(w / 6), rows = Math.floor((224 - y) / 8); return Array.from({ length: cols * rows }, (_, k) => ((i * 7 + k * 13) % 5 < 2 ? `<rect x="${x + 2 + (k % cols) * 6}" y="${y + 4 + Math.floor(k / cols) * 8}" width="2.6" height="3.4"/>` : '')); }).join('');
  const slats = Array.from({ length: 18 }, (_, i) => `<rect x="516" y="${34 + i * 11}" width="252" height="6.6"/>`).join('');
  const stripes = Array.from({ length: 11 }, (_, i) => `<rect x="150" y="${300 + i * 15}" width="380" height="7.5"/>`).join('');
  const ticks = Array.from({ length: 12 }, (_, i) => `<line x1="408" y1="${i % 3 ? 52 : 50}" x2="408" y2="56" transform="rotate(${i * 30} 408 70)"/>`).join('');
  const calCells = Array.from({ length: 42 }, (_, i) => `<text class="rv-cd" x="${236 + (i % 7) * 10}" y="${70 + Math.floor(i / 7) * 9}"></text>`).join('');
  const sleeve = (A, B, wa, wb, fill) => `<path d="${limb(A, B, wa, wb)}" fill="${fill}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;

  function markup() {
    return `
<svg class="scene" viewBox="0 0 800 480" role="img" aria-label="Onur's room">
<defs>
  <linearGradient id="rv-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky1)"/><stop offset="1" style="stop-color:var(--sky2)"/></linearGradient>
  <radialGradient id="rv-lamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc77d" stop-opacity=".6"/><stop offset=".45" stop-color="#ff9a52" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a52" stop-opacity="0"/></radialGradient>
  <linearGradient id="rv-coneG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0a3" stop-opacity=".5"/><stop offset="1" stop-color="#ffe0a3" stop-opacity=".04"/></linearGradient>
  <radialGradient id="rv-mon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8fb0ff" stop-opacity=".45"/><stop offset="1" stop-color="#8fb0ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="rv-phoneG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#a9c4ff" stop-opacity=".55"/><stop offset="1" stop-color="#a9c4ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="rv-iris" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#ff5a64"/><stop offset=".55" stop-color="#d4182a"/><stop offset="1" stop-color="#5e0710"/></radialGradient>
  <linearGradient id="rv-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22325a"/><stop offset="1" stop-color="#0e1526"/></linearGradient>
  <radialGradient id="rv-vig" cx=".5" cy=".46" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#010106" stop-opacity=".62"/></radialGradient>
  <pattern id="rv-tone" width="4.5" height="4.5" patternUnits="userSpaceOnUse"><circle cx="2.25" cy="2.25" r=".75" fill="#000"/></pattern>
  <filter id="rv-blur" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="3"/></filter>
  <clipPath id="rv-win"><rect x="516" y="34" width="252" height="194"/></clipPath>
  <clipPath id="rv-wallclip"><rect x="0" y="0" width="800" height="424"/></clipPath>
</defs>

<rect width="800" height="480" style="fill:var(--wall)"/>
<rect width="800" height="424" fill="url(#rv-tone)" opacity=".1"/>
<rect y="424" width="800" height="9" style="fill:var(--wall2)"/>
<rect y="432" width="800" height="48" style="fill:var(--floor)"/>
<path d="M0 446 H800 M0 462 H800" stroke="rgba(0,0,0,.25)" stroke-width="1"/>
<g clip-path="url(#rv-wallclip)" style="fill:var(--beamc);opacity:calc(var(--beam) * .17)"><g transform="skewY(-16)">${stripes}</g></g>

<g>
  <rect x="20" y="96" width="180" height="6" fill="#241b17" stroke="${INK}" stroke-width="1"/>
  <rect x="20" y="172" width="180" height="6" fill="#241b17" stroke="${INK}" stroke-width="1"/>
  ${books(26, 196, 96, 11)}${books(26, 150, 172, 29)}
  <rect x="160" y="150" width="26" height="22" fill="#1d1d22" stroke="${INK}" stroke-width="1"/><rect x="163" y="153" width="20" height="16" fill="#6b5a4a"/>
</g>
<g>
  <path d="M264 30 L264 36" stroke="${INK}" stroke-width="1.4"/><circle cx="264" cy="29" r="2" fill="#555"/>
  <rect x="228" y="36" width="74" height="86" rx="2" fill="#efebe4" stroke="${INK}" stroke-width="1.2"/>
  <rect x="228" y="36" width="74" height="17" fill="#8e1b22"/>
  <text id="rv-calm" x="265" y="48.5" text-anchor="middle" fill="#f6e9e6" style="font:700 8.5px var(--font);letter-spacing:.12em"></text>
  <g fill="#34343c" style="font:600 5.6px var(--font)" text-anchor="middle">${calCells}</g>
  <circle id="rv-calt" r="4.6" fill="none" stroke="#c4202d" stroke-width="1.3"/>
</g>
<g>
  <circle cx="408" cy="70" r="24" fill="#f4f2ee" stroke="#111" stroke-width="3.5"/>
  <g stroke="#222" stroke-width="1.6" stroke-linecap="round">${ticks}</g>
  <line id="rv-hh" x1="408" y1="70" x2="408" y2="58" stroke="#111" stroke-width="3" stroke-linecap="round"/>
  <line id="rv-mh" x1="408" y1="70" x2="408" y2="52" stroke="#111" stroke-width="2" stroke-linecap="round"/>
  <line id="rv-sh" x1="408" y1="74" x2="408" y2="50" stroke="#c4202d" stroke-width="1" stroke-linecap="round"/>
  <circle cx="408" cy="70" r="2.2" fill="#c4202d"/>
</g>
<g transform="rotate(-3 456 172)">
  <rect x="424" y="148" width="66" height="48" fill="#e2c46c" stroke="${INK}" stroke-width=".8"/><rect x="424" y="148" width="66" height="7" fill="#cfb05a"/>
  <text id="rv-n1" x="430" y="170" fill="#2b220f" style="font:700 10.5px var(--hand)"></text>
  <text id="rv-n2" x="430" y="186" fill="#2b220f" style="font:700 10.5px var(--hand)"></text>
</g>

<rect x="506" y="24" width="272" height="214" style="fill:var(--frame)" stroke="${INK}" stroke-width="1.4"/>
<g clip-path="url(#rv-win)">
  <rect x="516" y="34" width="252" height="194" fill="url(#rv-sky)"/>
  <g class="twinkle" style="opacity:var(--stars)">${STARS}</g>
  <circle id="rv-sun" r="14" fill="#fff0c4"/><circle id="rv-moon" r="10" fill="#eef0ff"/><circle id="rv-moonc" r="9" style="fill:var(--sky1)"/>
  <g fill="#fff" style="opacity:calc(.7 - var(--stars) * .6)"><g class="cloud"><ellipse cx="560" cy="80" rx="26" ry="7"/><ellipse cx="574" cy="74" rx="13" ry="7"/></g><g class="cloud"><ellipse cx="610" cy="112" rx="30" ry="6"/><ellipse cx="598" cy="107" rx="12" ry="6"/></g></g>
  <g style="fill:color-mix(in srgb,var(--sky1) 50%,#000)">${city}</g>
  <g fill="#ffcf86" style="opacity:var(--cityl)">${lights}</g>
  <g style="fill:var(--frame)" stroke="rgba(0,0,0,.35)" stroke-width=".6">${slats}</g>
</g>
<path d="M762 34 V200" stroke="#cfc8bd" stroke-width="1.2"/><circle cx="762" cy="202" r="2.4" fill="#cfc8bd"/>
<rect x="498" y="236" width="288" height="8" style="fill:var(--wall2)" stroke="${INK}" stroke-width="1"/>

<g>
  <rect x="0" y="372" width="196" height="36" fill="#262a38" stroke="${INK}" stroke-width="1.3"/>
  <rect x="0" y="404" width="200" height="22" fill="#1c1a1c" stroke="${INK}" stroke-width="1.3"/>
  <rect x="190" y="404" width="8" height="30" fill="#1c1a1c"/>
  <rect x="10" y="352" width="86" height="26" rx="12" fill="#c9ccd6" stroke="${INK}" stroke-width="1.3"/>
  <path id="rv-duvet" d="M70 372 Q130 364 196 370 L198 410 Q120 418 66 412Z" fill="#363c50" stroke="${INK}" stroke-width="1.3"/>
  <path d="M86 386 Q140 380 192 386" stroke="rgba(255,255,255,.08)" stroke-width="2" fill="none"/>
  <g id="rv-sleeper" class="fade" style="opacity:0">
    <circle cx="60" cy="356" r="15" fill="${SKIN}" stroke="${INK}" stroke-width="1.4"/>
    <path d="M62 357 q5 2.6 10 0" stroke="#3a2a35" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M52 372 L26 368 L44 360 L20 350 L42 346 L28 330 L50 338 L50 318 L64 336 L76 320 L78 340 L94 334 L86 346 L80 362 L74 352 L70 366 L64 356Z" fill="${HAIR}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M38 346 Q48 340 56 344 M62 334 Q70 334 74 340" stroke="${HAIR_HI}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  </g>
  <g class="zz fade" id="rv-zz" style="opacity:0;font:800 15px var(--head)" fill="#c9d4ff"><text x="86" y="318">z</text><text x="92" y="312">z</text><text x="98" y="306">Z</text></g>
</g>
<ellipse cx="310" cy="452" rx="150" ry="13" fill="#3a1418" opacity=".7"/>

<g id="rv-chair" style="transition:transform 1.2s cubic-bezier(.22,1,.36,1);transform-origin:300px 420px">
  <rect x="222" y="224" width="20" height="132" rx="9" fill="#1e1f27" stroke="${INK}" stroke-width="1.3" transform="rotate(-6 232 356)"/>
  <rect x="296" y="366" width="10" height="46" fill="#15161c"/>
  <path d="M250 418 L352 418 L346 412 L256 412Z" fill="#15161c" stroke="${INK}" stroke-width="1"/>
  <circle cx="254" cy="426" r="6" fill="#0d0d12"/><circle cx="348" cy="426" r="6" fill="#0d0d12"/><circle cx="301" cy="428" r="6" fill="#0d0d12"/>
  <rect x="232" y="348" width="134" height="16" rx="7" fill="#24252f" stroke="${INK}" stroke-width="1.3"/>
</g>

<polygon points="380,268 800,268 800,286 366,286" fill="#4a3426" stroke="${INK}" stroke-width="1.2"/>
<rect x="366" y="286" width="434" height="14" fill="#33241b" stroke="${INK}" stroke-width="1.2"/>
<rect x="376" y="300" width="14" height="132" fill="#2a1e17" stroke="${INK}" stroke-width="1"/>
<rect x="676" y="300" width="116" height="132" fill="#3a291f" stroke="${INK}" stroke-width="1.2"/>
<rect x="684" y="308" width="100" height="50" rx="2" fill="none" stroke="#23180f" stroke-width="1.6"/><rect x="684" y="366" width="100" height="58" rx="2" fill="none" stroke="#23180f" stroke-width="1.6"/>
<rect x="726" y="330" width="16" height="3" rx="1" fill="#8a7a66"/><rect x="726" y="392" width="16" height="3" rx="1" fill="#8a7a66"/>

<g>
  <ellipse cx="700" cy="270" rx="30" ry="5" fill="#111216" stroke="${INK}" stroke-width="1"/>
  <rect x="694" y="236" width="12" height="34" fill="#16171c" stroke="${INK}" stroke-width="1"/>
  <rect x="614" y="128" width="172" height="112" rx="7" fill="#0b0c10" stroke="${INK}" stroke-width="1.4"/>
  <rect x="621" y="135" width="158" height="98" rx="2" fill="#07080c"/>
  <g id="rv-screen" class="fade" style="opacity:0">
    <rect x="621" y="135" width="158" height="98" rx="2" fill="url(#rv-scr)"/>
    <rect x="621" y="135" width="158" height="11" fill="#0b1222"/><circle cx="628" cy="140.5" r="2" fill="#c4202d"/>
    <text x="634" y="143" fill="#9fb0d8" style="font:700 6.5px var(--font);letter-spacing:.14em">ARCHERON</text>
    <text id="rv-scrt" x="632" y="164" fill="#e8ecf8" style="font:700 10px var(--font)"></text>
    <rect x="632" y="172" width="120" height="3" rx="1.5" fill="#2a3a62"/><rect x="632" y="179" width="96" height="3" rx="1.5" fill="#2a3a62"/>
    <rect x="632" y="192" width="62" height="13" rx="3" fill="#1d2a4b" stroke="#3b5296" stroke-width=".8"/><rect x="700" y="192" width="62" height="13" rx="3" fill="#1d2a4b" stroke="#3b5296" stroke-width=".8"/>
    <rect x="632" y="221" width="134" height="3" rx="1.5" fill="#1d2744"/><rect id="rv-scrp" x="632" y="221" width="40" height="3" rx="1.5" fill="#d42a38"/>
  </g>
  <polygon points="604,271 712,271 716,281 600,281" fill="#17181e" stroke="${INK}" stroke-width="1"/>
  <path d="M607 274.4 H710 M605 278 H712" stroke="#2b2d38" stroke-width="1.3" stroke-dasharray="4 1.2"/>
</g>
<g>
  <rect x="744" y="250" width="22" height="20" rx="3" fill="#d9d6d0" stroke="${INK}" stroke-width="1.2"/><path d="M766 255 q9 0 9 6 q0 6 -9 6" stroke="#d9d6d0" stroke-width="3.5" fill="none"/>
  <ellipse cx="755" cy="251" rx="10" ry="2.2" fill="#3a2418"/>
  <g class="steam fade" id="rv-steam" stroke="rgba(255,255,255,.5)" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M751 244 q-5 -8 0 -15 q5 -7 0 -14"/><path d="M760 244 q5 -8 0 -15 q-5 -7 0 -14"/></g>
</g>
<g>
  <polygon points="386,271 420,271 418,283 380,283" fill="#f2eee4" stroke="${INK}" stroke-width=".9"/>
  <polygon points="420,271 454,271 460,283 418,283" fill="#f7f3ea" stroke="${INK}" stroke-width=".9"/>
  <path d="M420 271 L418 283" stroke="#bdb39c" stroke-width="1.2"/>
  <g id="rv-ink" stroke="#1d2340" stroke-width=".9" fill="none" stroke-linecap="round"></g>
  <g id="rv-marks" stroke-width="1.3" fill="none" stroke-linecap="round"></g>
  <polygon id="rv-flip" points="420,271 454,271 460,283 418,283" fill="#ebe5d6" opacity="0" style="transform-origin:419px 277px"/>
</g>

<g id="rv-sitter" class="fade">
  <path d="M326 334 L344 332 Q360 334 362 342 Q362 348 354 348 L324 348 Q320 340 326 334Z" fill="#202027" stroke="${INK}" stroke-width="1.3"/>
  <path d="M262 349 C247 318 245 285 254 262 C263 236 282 219 305 212 C318 209 328 214 332 222 C335 240 330 262 324 284 L314 336 C302 346 282 350 262 349Z" fill="${SHIRT}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M262 349 C249 320 247 288 255 264 C253 300 259 330 280 349Z" fill="${SHIRT_SH}"/>
  <path class="rim" d="M256 336 C246 304 248 272 260 250 C270 232 286 220 302 214" fill="none" stroke="#7d8fd4" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
  <path d="M282 318 Q292 334 288 348 M300 300 Q310 318 306 340 M270 290 Q278 298 276 312" fill="none" stroke="${SHIRT_SH}" stroke-width="1.5" stroke-linecap="round"/>
  <path d="${limb([280, 336], [342, 246], 28, 22)}" fill="${JEANS_SH}" stroke="${INK}" stroke-width="1.4"/>
  <path d="${limb([352, 250], [346, 336], 24, 17)}" fill="${JEANS}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M334 330 L356 328 Q376 330 380 340 Q381 348 370 349 L332 349 Q328 340 334 330Z" fill="${SOCK}" stroke="${INK}" stroke-width="1.5"/>
  <path d="M266 326 C290 300 316 270 342 240 Q354 228 365 238 Q372 250 362 262 C338 290 310 320 292 346 Q272 352 266 326Z" fill="${JEANS}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M276 320 C298 296 320 270 344 244" fill="none" stroke="${JEANS_HI}" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>
  <path d="M300 336 Q312 330 318 318 M326 296 Q334 296 340 288" fill="none" stroke="${JEANS_SH}" stroke-width="1.4" stroke-linecap="round"/>
  <path class="rim" d="M352 232 Q366 232 371 246" fill="none" stroke="#9fb3ff" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M308 214 C316 204 328 194 338 186 L357 190 C352 200 342 212 332 222Z" fill="${SKIN_SH}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M341 196 C346 200 350 204 351 210" fill="none" stroke="${SKIN_DK}" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M302 215 Q318 206 333 221" fill="none" stroke="${SHIRT_HI}" stroke-width="2.6" stroke-linecap="round"/>
  ${head()}
  <g id="rv-write">
    <path id="rv-arm" fill="${SHIRT}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path id="rv-fore" fill="${SHIRT}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <circle id="rv-cuff" r="8" fill="${SHIRT}"/>
    <path id="rv-forehi" fill="none" stroke="${SHIRT_HI}" stroke-width="1.4" stroke-linecap="round"/>
    <line id="rv-pen" stroke="#d8dbe6" stroke-width="2.2" stroke-linecap="round"/>
    <g id="rv-hand"><path d="M-3 -6.5 C5 -9 13 -5 14 1.5 C14 7 8.5 9.5 2 9 C-3 8 -6.5 -3 -3 -6.5Z" fill="${SKIN}" stroke="${INK}" stroke-width="1.3"/><path d="M8 3.6 Q13.5 6.4 11 10 M3 -6.5 Q10 -11 14.5 -4.6" fill="none" stroke="${INK}" stroke-width="1" stroke-linecap="round"/></g>
  </g>
  <g id="rv-think" style="opacity:0">
    ${sleeve([318, 228], [346, 282], 19, 15, SHIRT)}${sleeve([346, 282], [364, 208], 15, 11, SHIRT)}
    <circle cx="346" cy="282" r="7.6" fill="${SHIRT}"/>
    <path d="M358 200 C360 190 372 188 376 196 C379 204 374 212 366 212 C358 212 354 206 358 200Z" fill="${SKIN}" stroke="${INK}" stroke-width="1.3"/>
    <path d="M370 193 L365 180.5" stroke="${INK}" stroke-width="5.2" stroke-linecap="round"/><path d="M370 193 L365 180.5" stroke="${SKIN}" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M361 206 Q368 208 375 204" fill="none" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>
  </g>
  <g id="rv-stretch" style="opacity:0">
    ${sleeve([302, 222], [292, 152], 18, 14, SHIRT_SH)}${sleeve([292, 152], [314, 88], 14, 11, SHIRT_SH)}
    <circle cx="315" cy="84" r="6.4" fill="${SKIN_SH}" stroke="${INK}" stroke-width="1.3"/>
    ${sleeve([318, 228], [324, 156], 19, 15, SHIRT)}${sleeve([324, 156], [340, 90], 15, 11, SHIRT)}
    <circle cx="341" cy="85" r="6.8" fill="${SKIN}" stroke="${INK}" stroke-width="1.3"/>
  </g>
  <g id="rv-phone" class="fade" style="opacity:0">
    ${sleeve([318, 228], [346, 282], 19, 15, SHIRT)}${sleeve([346, 282], [372, 216], 15, 11, SHIRT)}
    <circle cx="346" cy="282" r="7.6" fill="${SHIRT}"/>
    <rect x="368" y="190" width="12" height="22" rx="2.4" fill="#0b0d16" stroke="${INK}" stroke-width="1" transform="rotate(-14 374 201)"/>
    <rect x="370.2" y="192.6" width="7.6" height="16.6" rx="1.3" fill="#a9c4ff" transform="rotate(-14 374 201)"/>
    <path d="M366 212 C368 205 379 205 381 212 C381 219 372 222 366 219Z" fill="${SKIN}" stroke="${INK}" stroke-width="1.3"/>
  </g>
</g>

<rect width="800" height="480" fill="#02030a" style="opacity:var(--amb2)"/>
<g style="mix-blend-mode:screen">
  <g id="rv-glow" class="fade" style="opacity:0"><ellipse class="glow" cx="450" cy="268" rx="220" ry="140" fill="url(#rv-lamp)"/></g>
  <polygon id="rv-cone" class="fade" points="504,172 536,198 466,282 380,282" fill="url(#rv-coneG)" style="opacity:0"/>
  <g id="rv-mglow" class="fade" style="opacity:0"><ellipse cx="560" cy="180" rx="250" ry="130" fill="url(#rv-mon)"/></g>
  <g id="rv-pglow" class="fade" style="opacity:0"><ellipse class="glow" cx="376" cy="196" rx="44" ry="38" fill="url(#rv-phoneG)"/></g>
  <g id="rv-eyes" class="fade" style="opacity:0;transform-origin:${NECK[0]}px ${NECK[1]}px"><g transform="translate(${HEAD[0]} ${HEAD[1]}) scale(${HS})">
    <circle cx="6" cy="10.8" r="6.5" fill="#ff2236" filter="url(#rv-blur)" opacity=".75"/><circle cx="31.4" cy="10.4" r="5" fill="#ff2236" filter="url(#rv-blur)" opacity=".6"/>
  </g></g>
</g>
<g>
  <ellipse cx="560" cy="270" rx="22" ry="5" fill="#15161c" stroke="${INK}" stroke-width="1"/>
  <path d="M560 266 L584 196 L532 166" stroke="#1b1c24" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="584" cy="196" r="4.6" fill="#2b2d3a" stroke="${INK}" stroke-width="1"/>
  <path d="M528 154 L542 164 L536 198 Q518 194 504 172Z" fill="#1d1e27" stroke="${INK}" stroke-width="1.3"/>
  <ellipse id="rv-bulb" class="fade" cx="521" cy="185" rx="16" ry="4" transform="rotate(48 521 185)" fill="#fff1c6" style="opacity:0"/>
</g>
<rect width="800" height="480" fill="url(#rv-vig)"/>
<g id="rv-bub" style="opacity:0;transition:opacity .3s">
  <rect id="rv-bubr" x="386" y="72" width="120" height="34" rx="12" fill="#f7f4ee" stroke="${INK}" stroke-width="1.8"/>
  <path d="M396 105 L380 122 L412 105" fill="#f7f4ee" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M397.5 104.6 L410.5 104.6" stroke="#f7f4ee" stroke-width="3.2"/>
  <text id="rv-bubt" x="398" y="95" fill="#111" style="font:700 15px var(--hand)"></text>
</g>
</svg>`;
  }

  /* shoulder, arm lengths and notebook lines for the writing arm (rival-scene.js) */
  const RIG = { S: [318, 228], L1: 58, L2: 80, LINE: i => { const p = i < 3 ? 0 : 1, r = i % 3; return { x: p ? 424 + r * 1.4 : 388 - r * 1.8, y: 274 + r * 3.6, w: 26 }; } };
  return { markup, limb, RIG };
})();
