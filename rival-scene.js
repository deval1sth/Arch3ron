/* The rival's room: one SVG, lit by the real time of day. SCENE.mount(el) once, then SCENE.frame(now, info) every frame.
   info = { pose: 'write' | 'phone' | 'sleep' | 'away', lamp, note: [line1, line2], spread, line, frac, marks: [true|false] } */
const SCENE = (() => {
  const NIGHT = { sky1: '#070a22', sky2: '#1b2152', wall: '#323a6e', wall2: '#262d5c', floor: '#232a57', frame: '#3d4578', fabric: '#2e3c80', amb: .6, stars: 1, cityl: 1, beam: 0 };
  const DAY = { sky1: '#4f9be6', sky2: '#d3e9fb', wall: '#ece1d1', wall2: '#d8c8b2', floor: '#c2a383', frame: '#f6f1e7', fabric: '#5b7bd5', amb: 0, stars: 0, cityl: 0, beam: 1 };
  const DAWN = { sky1: '#5a5ba3', sky2: '#f7b48a', wall: '#a596a3', wall2: '#8b7d8f', floor: '#7d6a78', frame: '#c7bcc6', fabric: '#4a5fae', amb: .22, stars: .15, cityl: .35, beam: .4 };
  const DUSK = { sky1: '#36428f', sky2: '#f39561', wall: '#b39a98', wall2: '#957d80', floor: '#86696a', frame: '#c8b6b2', fabric: '#4757a8', amb: .2, stars: .1, cityl: .55, beam: .35 };
  const KEYS = [[0, NIGHT], [5.75, NIGHT], [7, DAWN], [8.5, DAY], [16.5, DAY], [18, DUSK], [19.4, NIGHT], [24, NIGHT]];
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
  function palette(h) {
    let i = 0; while (KEYS[i + 1][0] <= h) i++;
    const [h0, A] = KEYS[i], [h1, B] = KEYS[i + 1], t = (h - h0) / (h1 - h0), out = {};
    for (const k in A) out[k] = typeof A[k] === 'number' ? A[k] + (B[k] - A[k]) * t : mix(A[k], B[k], t);
    return out;
  }

  /* notebook spread: left page then right page, three lines each; every line is one answer */
  const LINE = i => { const p = i < 3 ? 0 : 1, r = i % 3; return { x: (p ? 401 : 349) - r * 1.2 + p * r * 1.4, y: 304.5 + r * 5, w: 40 }; };
  const S = { x: 306, y: 270 }, L1 = 58, L2 = 84;

  let svg, el = {}, last = { pose: '', spread: -1 }, rnd = 0;

  const STARS = Array.from({ length: 26 }, (_, i) => { const r = Math.sin(i * 91.7) * 43758.5453; const f = r - Math.floor(r); const r2 = Math.sin(i * 17.3) * 9631.7; const g = r2 - Math.floor(r2); return `<circle cx="${486 + f * 208}" cy="${74 + g * 108}" r="${.6 + (i % 3) * .45}" fill="#fff"/>`; }).join('');
  const CITY = [[482, 206, 22], [504, 184, 18], [522, 214, 26], [548, 196, 20], [568, 178, 16], [584, 210, 24], [608, 190, 22], [630, 204, 18], [648, 172, 20], [668, 198, 30]];
  const cityRects = CITY.map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${250 - y}"/>`).join('');
  const cityLights = CITY.flatMap(([x, y, w], i) => Array.from({ length: Math.floor((246 - y) / 9) * Math.floor(w / 7) }, (_, k) => {
    const c = k % Math.floor(w / 7), r = Math.floor(k / Math.floor(w / 7)); return ((i * 7 + k * 13) % 5 < 2) ? `<rect x="${x + 3 + c * 7}" y="${y + 5 + r * 9}" width="3" height="4"/>` : '';
  })).join('');
  const ticks = Array.from({ length: 12 }, (_, i) => `<line x1="390" y1="${78 + (i % 3 ? 2 : 0)}" x2="390" y2="83" transform="rotate(${i * 30} 390 100)"/>`).join('');

  const MARKUP = `
<svg class="scene" viewBox="0 0 800 480" role="img" aria-label="The rival's room">
<defs>
  <linearGradient id="rv-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky1)"/><stop offset="1" style="stop-color:var(--sky2)"/></linearGradient>
  <radialGradient id="rv-lamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc97a" stop-opacity=".62"/><stop offset=".45" stop-color="#ff9d4d" stop-opacity=".2"/><stop offset="1" stop-color="#ff9d4d" stop-opacity="0"/></radialGradient>
  <linearGradient id="rv-coneG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a6" stop-opacity=".55"/><stop offset="1" stop-color="#ffe2a6" stop-opacity=".05"/></linearGradient>
  <radialGradient id="rv-phoneG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#a9c4ff" stop-opacity=".55"/><stop offset="1" stop-color="#a9c4ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="rv-vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#02031a" stop-opacity=".5"/></radialGradient>
  <linearGradient id="rv-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3d6" stop-opacity=".22"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></linearGradient>
  <filter id="rv-blur" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="rv-blur1" x="-.2" y="-1" width="1.4" height="3"><feGaussianBlur stdDeviation="1.2"/></filter>
  <clipPath id="rv-win"><rect x="482" y="70" width="216" height="176" rx="2"/></clipPath>
</defs>
<rect width="800" height="480" style="fill:var(--wall)"/>
<rect y="438" width="800" height="42" style="fill:var(--floor)"/>
<rect y="432" width="800" height="7" style="fill:var(--wall2)"/>
<polygon points="482,258 698,258 600,438 300,438" fill="url(#rv-beam)" style="opacity:var(--beam)"/>
<ellipse cx="430" cy="458" rx="180" ry="13" fill="#6e58a6" opacity=".55"/>

<g>
  <rect x="60" y="74" width="150" height="6" rx="2" style="fill:var(--wall2)"/>
  <rect x="70" y="44" width="11" height="30" rx="1.5" fill="#d1495b"/><rect x="83" y="40" width="9" height="34" rx="1.5" fill="#edae49"/>
  <rect x="94" y="48" width="13" height="26" rx="1.5" fill="#00798c"/><rect x="109" y="52" width="10" height="22" rx="1.5" fill="#30638e" transform="rotate(12 114 74)"/>
  <path d="M168 74 l4 -18 h20 l4 18z" fill="#c4704a"/><path d="M182 56 q-14 -14 -4 -26 q6 14 4 26 q4 -16 16 -20 q-2 14 -16 20" fill="#3f9a5b"/>
</g>
<g>
  <rect x="58" y="96" width="150" height="104" rx="6" fill="#b9875a" stroke="#8a5f3c" stroke-width="5"/>
  <rect x="160" y="108" width="40" height="52" fill="#dfe8ff" transform="rotate(4 180 134)"/>
  <path d="M163 120 h34 M163 130 h34 M163 140 h34 M163 150 h34 M176 110 v48" stroke="#8fa0cf" stroke-width="1.1" transform="rotate(4 180 134)"/>
  <rect x="122" y="160" width="30" height="34" fill="#fafafa" transform="rotate(6 137 177)"/><rect x="125" y="163" width="24" height="22" fill="#5872c9" transform="rotate(6 137 177)"/>
  <path d="M70 176 h40 M70 184 h32" stroke="#e9dcc0" stroke-width="5" stroke-linecap="round" transform="rotate(-5 90 180)"/>
  <g transform="rotate(-3 110 132)">
    <rect x="66" y="104" width="88" height="56" rx="1.5" fill="#ffd166"/><rect x="66" y="104" width="88" height="9" fill="#f4bf4f"/>
    <text id="rv-n1" x="73" y="130" fill="#3b2a12" style="font:700 13px var(--hand)"></text>
    <text id="rv-n2" x="73" y="149" fill="#3b2a12" style="font:700 13px var(--hand)"></text>
  </g>
  <circle cx="110" cy="107" r="3.2" fill="#e74c3c"/><circle cx="181" cy="111" r="3" fill="#3498db"/><circle cx="137" cy="163" r="3" fill="#f1c40f"/>
</g>
<g>
  <circle cx="390" cy="100" r="27" fill="#fbf8f1" stroke="#5a4636" stroke-width="4"/>
  <g stroke="#5a4636" stroke-width="2" stroke-linecap="round">${ticks}</g>
  <line id="rv-hh" x1="390" y1="100" x2="390" y2="86" stroke="#2a2233" stroke-width="3.4" stroke-linecap="round"/>
  <line id="rv-mh" x1="390" y1="100" x2="390" y2="80" stroke="#2a2233" stroke-width="2.4" stroke-linecap="round"/>
  <line id="rv-sh" x1="390" y1="104" x2="390" y2="79" stroke="#e05a47" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="390" cy="100" r="2.6" fill="#e05a47"/>
</g>

<rect x="436" y="44" width="296" height="5" rx="2" fill="#2a2440"/>
<rect x="470" y="58" width="240" height="200" rx="6" style="fill:var(--frame)"/>
<g clip-path="url(#rv-win)">
  <rect x="482" y="70" width="216" height="176" fill="url(#rv-sky)"/>
  <g class="twinkle" style="opacity:var(--stars)">${STARS}</g>
  <circle id="rv-sun" r="15" fill="#ffe7a3"/><circle id="rv-moon" r="11" fill="#f4f1ff"/><circle id="rv-moonc" r="10" style="fill:var(--sky1)"/>
  <g fill="#fff" style="opacity:calc(.85 - var(--stars) * .7)"><g class="cloud"><ellipse cx="520" cy="110" rx="26" ry="8"/><ellipse cx="534" cy="104" rx="14" ry="8"/></g><g class="cloud"><ellipse cx="560" cy="138" rx="30" ry="7"/><ellipse cx="548" cy="133" rx="13" ry="7"/></g></g>
  <g style="fill:color-mix(in srgb,var(--sky1) 55%,#000)">${cityRects}</g>
  <g fill="#ffd98a" style="opacity:var(--cityl)">${cityLights}</g>
</g>
<rect x="587" y="70" width="6" height="176" style="fill:var(--frame)"/><rect x="482" y="155" width="216" height="6" style="fill:var(--frame)"/>
<rect x="462" y="254" width="256" height="10" rx="3" style="fill:var(--wall2)"/>
<path d="M444 48 q16 60 4 130 q-8 60 14 120 l30 0 q-12 -70 -2 -130 q8 -60 -4 -120z" style="fill:var(--fabric)"/>
<path d="M458 60 q6 70 -2 150 q-2 40 6 84" stroke="rgba(0,0,0,.18)" stroke-width="3" fill="none"/>

<g>
  <rect x="14" y="328" width="16" height="112" rx="4" fill="#7a5638"/>
  <rect x="14" y="402" width="224" height="24" rx="4" fill="#9a6e48"/>
  <rect x="20" y="424" width="9" height="14" fill="#7a5638"/><rect x="224" y="424" width="9" height="14" fill="#7a5638"/>
  <rect x="28" y="384" width="208" height="22" rx="9" fill="#e4dff0"/>
  <rect x="34" y="366" width="60" height="24" rx="11" fill="#f6f3fb"/>
  <path id="rv-duvet" d="M86 380 Q150 372 236 378 L238 412 Q160 420 84 414 Z" fill="#6b7fd8"/>
  <path d="M100 392 Q160 386 232 392" stroke="rgba(255,255,255,.18)" stroke-width="2" fill="none"/>
  <g id="rv-sleeper" class="fade" style="opacity:0">
    <circle cx="70" cy="371" r="12.5" fill="#eab48a" stroke="#241a2e" stroke-width="1.4"/>
    <path d="M73 370 q4 2.4 8 0" stroke="#241a2e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M60 380 L42 378 L54 372 L38 364 L54 362 L44 350 L60 354 L60 340 L70 352 L78 342 L80 356 L92 354 L84 362 L72 360 L64 368 Z" fill="#f5f5fc" stroke="#241a2e" stroke-width="1.4" stroke-linejoin="round"/>
  </g>
  <g class="zz fade" id="rv-zz" style="opacity:0;font:800 16px var(--head)" fill="#c9d4ff"><text x="86" y="344">z</text><text x="92" y="338">z</text><text x="98" y="332">Z</text></g>
</g>

<g id="rv-chair" style="transition:transform 1.2s cubic-bezier(.22,1,.36,1);transform-origin:270px 420px">
  <rect x="226" y="262" width="17" height="98" rx="8" fill="#3b4272" transform="rotate(-7 234 358)"/>
  <rect x="270" y="364" width="8" height="58" fill="#252a47"/>
  <rect x="236" y="419" width="76" height="7" rx="3" fill="#252a47"/>
  <circle cx="242" cy="432" r="6" fill="#1a1e36"/><circle cx="306" cy="432" r="6" fill="#1a1e36"/>
  <rect x="224" y="348" width="96" height="15" rx="7" fill="#454d84"/>
</g>

<polygon points="338,296 796,296 800,322 326,322" fill="#b98a5e"/>
<rect x="326" y="322" width="474" height="12" fill="#946a45"/>
<rect x="336" y="334" width="12" height="104" fill="#946a45"/>
<rect x="660" y="334" width="128" height="104" fill="#a87c52"/>
<rect x="668" y="344" width="112" height="40" rx="3" fill="none" stroke="#7d5636" stroke-width="2"/><rect x="668" y="390" width="112" height="40" rx="3" fill="none" stroke="#7d5636" stroke-width="2"/>
<circle cx="724" cy="364" r="3" fill="#5c3f27"/><circle cx="724" cy="410" r="3" fill="#5c3f27"/>

<g>
  <rect x="704" y="282" width="80" height="14" rx="2" fill="#2f6f8f"/><rect x="710" y="270" width="70" height="12" rx="2" fill="#c0533a"/><rect x="700" y="259" width="76" height="11" rx="2" fill="#e3b04b"/>
  <path d="M708 285 h70 M714 273 h60" stroke="rgba(255,255,255,.25)" stroke-width="1.4"/>
</g>
<g>
  <rect x="470" y="276" width="25" height="24" rx="4" fill="#e66b5b"/><path d="M495 282 q10 0 10 8 q0 8 -10 8" stroke="#e66b5b" stroke-width="4" fill="none"/>
  <ellipse cx="482.5" cy="277" rx="11" ry="2.4" fill="#5b2b1e"/>
  <g class="steam fade" id="rv-steam" stroke="rgba(255,255,255,.55)" stroke-width="2.4" fill="none" stroke-linecap="round">
    <path d="M478 270 q-5 -8 0 -15 q5 -7 0 -14"/><path d="M487 270 q5 -8 0 -15 q-5 -7 0 -14"/>
  </g>
</g>

<g>
  <polygon points="350,299 398,299 397,319 342,319" fill="#f7f3e8"/>
  <polygon points="398,299 446,299 452,319 397,319" fill="#fbf8ef"/>
  <path d="M398 299 L397 319" stroke="#cfc6b0" stroke-width="1.4"/>
  <g id="rv-ink" stroke="#2c3463" stroke-width="1.1" fill="none" stroke-linecap="round"></g>
  <g id="rv-marks" stroke-width="1.6" fill="none" stroke-linecap="round"></g>
  <polygon id="rv-flip" points="398,299 446,299 452,319 397,319" fill="#efe9da" opacity="0" style="transform-origin:398px 309px"/>
</g>

<g id="rv-sitter" class="fade" stroke="#241a2e" stroke-width="1.6" stroke-linejoin="round">
  <path d="M250 342 Q300 330 352 334 Q366 336 366 348 Q364 362 350 362 L262 364 Q246 362 248 352 Z" fill="#262840"/>
  <path d="M342 352 L358 352 L360 427 L345 427 Z" fill="#262840"/>
  <path d="M337 425 L371 425 Q384 427 384 435 L337 436 Z" fill="#121218"/><path d="M337 436 L384 435 L384 440 L337 440 Z" fill="#ececf3"/>
  <path d="M246 354 Q234 300 258 266 Q274 250 300 252 Q322 258 326 284 Q330 316 322 350 Z" fill="#b81f2f"/>
  <path d="M247 352 Q235 300 258 268 Q268 258 281 256 Q262 292 271 351 Z" fill="#861522" stroke="none"/>
  <path d="M323 268 Q331 304 322 347" fill="none" stroke="#dcb557" stroke-width="3.2"/>
  <path d="M248 349 L322 346" fill="none" stroke="#dcb557" stroke-width="3.2"/>
  <path id="rv-rest" d="M300 278 Q326 302 352 312 L362 315 L360 322 L346 320 Q316 312 292 292 Z" fill="#1a1a22"/>
  <circle id="rv-rhand" cx="364" cy="318" r="5.2" fill="#eab48a"/>
  <path d="M301 236 L304 262 L316 262 L315 240 Z" fill="#c98b62"/>
  <path d="M288 252 Q300 238 317 244 L320 259 Q305 254 291 263 Z" fill="#dcb557"/>
  <g id="rv-head" style="transform-origin:306px 252px"><g transform="translate(306 252) scale(1.14) translate(-306 -252)">
    <path d="M298 214 Q300 196 318 195 Q336 196 340 211 L342 221 L349 228 L342 231 L341 238 Q340 247 332 250 L318 252 Q304 250 299 240 Z" fill="#eab48a"/>
    <ellipse cx="311" cy="228" rx="4" ry="5.5" fill="#d99c74"/>
    <path d="M327 245 L339 242.5" stroke="#8a4b34" stroke-width="1.4" fill="none"/>
    <path d="M327 216.5 Q334 211.5 341 215 Q335 220 327 216.5 Z" fill="#eafcff"/>
    <circle cx="336" cy="215.6" r="2.4" fill="#2bb8ff" stroke="none"/>
    <path d="M325 209.5 L343 213" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M302 244 L274 252 L292 238 L258 234 L288 222 L254 206 L288 202 L262 182 L294 188 L282 160 L306 180 L304 150 L322 176 L332 154 L338 180 L356 168 L350 190 L362 196 L348 202 L350 214 L338 207 L330 213 L326 203 L316 205 L306 213 L302 228 Z" fill="#f5f5fc"/>
    <path d="M300 196 L280 186 M314 184 L306 166 M330 186 L334 166 M294 214 L272 210 M296 230 L276 236 M344 196 L354 192" stroke="#b9bdd8" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </g></g>
  <g id="rv-write">
    <path id="rv-armI" stroke="#241a2e" stroke-linecap="round" fill="none" stroke-width="20"/>
    <path id="rv-arm" stroke="#b81f2f" stroke-linecap="round" fill="none" stroke-width="16.5"/>
    <path id="rv-foreI" stroke="#241a2e" stroke-linecap="round" fill="none" stroke-width="15.5"/>
    <path id="rv-fore" stroke="#1a1a22" stroke-linecap="round" fill="none" stroke-width="12.5"/>
    <circle id="rv-cuff" r="8.6" fill="#b81f2f" stroke="#dcb557" stroke-width="2.6"/>
    <line id="rv-pen" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/>
    <circle id="rv-hand" r="6" fill="#eab48a" stroke-width="1.5"/>
  </g>
  <g id="rv-phone" class="fade" style="opacity:0" stroke-linecap="round" fill="none">
    <path d="M304 276 Q318 318 330 322" stroke-width="19.5"/><path d="M304 276 Q318 318 330 322" stroke="#b81f2f" stroke-width="16"/>
    <path d="M331 321 Q340 290 344 268" stroke-width="15.5"/><path d="M331 321 Q340 290 344 268" stroke="#1a1a22" stroke-width="12.5"/>
    <circle cx="331" cy="321" r="8.6" fill="#b81f2f" stroke="#dcb557" stroke-width="2.6"/>
    <rect x="336" y="248" width="11" height="20" rx="2.5" fill="#0b0f2c" transform="rotate(18 341 258)"/>
    <rect x="338" y="250.5" width="7" height="15" rx="1.5" fill="#a9c4ff" stroke="none" transform="rotate(18 341 258)"/>
    <circle cx="344" cy="266" r="5.6" fill="#eab48a" stroke-width="1.5"/>
  </g>
</g>

<rect width="800" height="480" fill="#03051a" style="opacity:var(--amb2)"/>
<g style="mix-blend-mode:screen">
  <g id="rv-glow" class="fade" style="opacity:0"><ellipse class="glow" cx="420" cy="292" rx="250" ry="175" fill="url(#rv-lamp)"/></g>
  <polygon id="rv-cone" class="fade" points="548,194 572,227 476,318 336,318" fill="url(#rv-coneG)" style="opacity:0"/>
  <g id="rv-pglow" class="fade" style="opacity:0"><ellipse class="glow" cx="336" cy="250" rx="46" ry="40" fill="url(#rv-phoneG)"/></g>
  <g id="rv-eyes" class="fade" style="opacity:0;transform-origin:306px 252px"><g transform="translate(306 252) scale(1.14) translate(-306 -252)">
    <circle cx="336" cy="215.6" r="7" fill="#46c8ff" filter="url(#rv-blur)" opacity=".9"/>
    <path class="glow" d="M333 214 Q314 208 286 203" stroke="#7fdcff" stroke-width="2.2" fill="none" stroke-linecap="round" filter="url(#rv-blur1)" opacity=".6"/>
    <circle cx="336" cy="215.6" r="1.5" fill="#effcff"/>
  </g></g>
</g>
<g>
  <ellipse cx="632" cy="298" rx="27" ry="6.5" fill="#23273d"/>
  <rect x="626" y="289" width="12" height="9" rx="2.5" fill="#2c3150"/>
  <path d="M632 291 L654 228 L592 191" stroke="#23273d" stroke-width="5.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="654" cy="228" r="5.5" fill="#3a4064"/><circle cx="592" cy="191" r="4.5" fill="#3a4064"/>
  <path d="M586 184 L595 196 L572 227 Q556 216 548 194 Z" fill="#2f3658"/>
  <path d="M586 184 L548 194" stroke="#4a5280" stroke-width="2" stroke-linecap="round"/>
  <ellipse id="rv-bulb" class="fade" cx="560" cy="210.5" rx="19.5" ry="4.5" transform="rotate(54.4 560 210.5)" fill="#fff3c9" style="opacity:0"/>
</g>
<rect width="800" height="480" fill="url(#rv-vig)"/>
</svg>`;

  const $ = id => svg.getElementById ? svg.getElementById(id) : svg.querySelector('#' + id);
  const show = (e, on) => { e.style.opacity = on ? 1 : 0; };
  const op = (e, v) => { e.style.opacity = v; };

  function mount(host) {
    host.innerHTML = MARKUP; svg = host.querySelector('svg'); svg.style.setProperty('--amb2', 0);
    svg.classList.add('boot'); setTimeout(() => svg.classList.remove('boot'), 120);
    for (const id of ['hh', 'mh', 'sh', 'n1', 'n2', 'sun', 'moon', 'moonc', 'duvet', 'sleeper', 'zz', 'chair', 'steam', 'ink', 'marks', 'flip', 'sitter', 'rest', 'rhand', 'head', 'eyes', 'write', 'arm', 'armI', 'fore', 'foreI', 'cuff', 'pen', 'hand', 'phone', 'glow', 'cone', 'pglow', 'bulb'])
      el[id] = $('rv-' + id);
  }

  function sky(now) {
    const d = new Date(now), h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600, p = palette(h);
    for (const k in p) svg.style.setProperty('--' + k, p[k]);
    const arc = (t, r) => [490 + t * 200, 236 - Math.sin(Math.PI * t) * r];
    const sunT = (h - 7) / 11, moonT = ((h + 24 - 18) % 24) / 13;
    const [sx, sy] = arc(Math.min(1, Math.max(0, sunT)), 140), [mx, my] = arc(Math.min(1, Math.max(0, moonT)), 130);
    el.sun.setAttribute('cx', sx); el.sun.setAttribute('cy', sunT > 0 && sunT < 1 ? sy : 400);
    el.moon.setAttribute('cx', mx); el.moon.setAttribute('cy', moonT > 0 && moonT < 1 ? my : 400);
    el.moonc.setAttribute('cx', mx + 5); el.moonc.setAttribute('cy', moonT > 0 && moonT < 1 ? my - 3 : 400);
    const m = d.getMinutes() + d.getSeconds() / 60, s = d.getSeconds() + d.getMilliseconds() / 1000;
    el.hh.setAttribute('transform', `rotate(${(d.getHours() % 12) * 30 + m / 2} 390 100)`);
    el.mh.setAttribute('transform', `rotate(${m * 6} 390 100)`);
    el.sh.setAttribute('transform', `rotate(${Math.floor(s) * 6} 390 100)`);
    return p;
  }

  function scribble(i, len, seed) {
    const L = LINE(i); let d = `M${L.x} ${L.y}`;
    for (let x = 1.5; x <= len * L.w; x += 1.5) d += ` L${(L.x + x).toFixed(1)} ${(L.y + Math.sin(x * 1.3 + seed) * .9 + Math.sin(x * .37 + seed * 2) * .5).toFixed(2)}`;
    return d;
  }
  function mark(i, ok) {
    const L = LINE(i), x = L.x + L.w + 3, y = L.y;
    return ok ? `<path d="M${x - 2} ${y} l1.6 1.8 l3 -3.6" stroke="#2f9e64"/>` : `<path d="M${x - 2} ${y - 1.8} l3.4 3.6 M${x + 1.4} ${y - 1.8} l-3.4 3.6" stroke="#d64550"/>`;
  }

  function frame(now, info, motion) {
    if (!svg) return;
    const p = sky(now), t = motion ? now / 1000 : 0, night = Math.min(1, p.amb / .6);
    const lamp = info.lamp && (night > .05 || info.pose === 'write');
    svg.style.setProperty('--amb2', (p.amb * (lamp ? .72 : 1)).toFixed(3));
    op(el.glow, lamp ? (.35 + .65 * night).toFixed(2) : 0);
    op(el.cone, lamp ? (.4 + .6 * night).toFixed(2) : 0);
    show(el.bulb, lamp);
    el.n1.textContent = info.note[0] || ''; el.n2.textContent = info.note[1] || '';

    if (info.pose !== last.pose) {
      const seated = info.pose === 'write' || info.pose === 'phone';
      show(el.sitter, seated); show(el.sleeper, info.pose === 'sleep'); show(el.zz, info.pose === 'sleep');
      show(el.write, info.pose === 'write'); show(el.rest, info.pose === 'write'); show(el.rhand, info.pose === 'write'); show(el.eyes, seated); show(el.phone, info.pose === 'phone');
      show(el.steam, seated);
      el.duvet.setAttribute('d', info.pose === 'sleep' ? 'M74 372 Q118 350 168 360 Q206 366 236 374 L238 412 Q160 420 74 414 Z' : 'M86 380 Q150 372 236 378 L238 412 Q160 420 84 414 Z');
      el.chair.style.transform = seated ? '' : 'translateX(-22px) rotate(-3deg)';
      last.pose = info.pose;
    }
    op(el.pglow, info.pose === 'phone' ? .9 : 0);

    if (info.pose === 'write') {
      if (info.spread !== last.spread) {
        if (last.spread >= 0 && motion) { el.flip.animate([{ transform: 'scaleX(1)', opacity: 1 }, { transform: 'scaleX(-1)', opacity: 1, offset: .85 }, { transform: 'scaleX(-1)', opacity: 0 }], { duration: 750, easing: 'cubic-bezier(.45,0,.2,1)' }); }
        last.spread = info.spread; rnd = info.spread * 7.31;
      }
      let ink = '', marks = '';
      for (let i = 0; i < info.line; i++) { ink += `<path d="${scribble(i, 1, rnd + i)}"/>`; marks += mark(i, info.marks[i]); }
      const f = Math.min(1, info.frac / .88);
      ink += `<path d="${scribble(info.line, f, rnd + info.line)}"/>`;
      if (info.frac > .9) marks += mark(info.line, info.marks[info.line]);
      el.ink.innerHTML = ink; el.marks.innerHTML = marks;

      const L = LINE(info.line), lift = info.frac > .88 ? Math.sin((info.frac - .88) / .12 * Math.PI) * 4 : 0;
      const hx = L.x + f * L.w + (info.frac > .88 ? 3 : 0) + (motion ? Math.sin(t * 22) * .8 : 0), hy = L.y - lift + (motion ? Math.sin(t * 31) * .6 : 0);
      const H = { x: hx + 5, y: hy - 9 };
      const dx = H.x - S.x, dy = H.y - S.y, dist = Math.min(L1 + L2 - 1, Math.hypot(dx, dy)), a = Math.atan2(dy, dx);
      const b = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist))));
      const E = { x: S.x + L1 * Math.cos(a + b), y: S.y + L1 * Math.sin(a + b) };
      const up = `M${S.x} ${S.y} L${E.x.toFixed(1)} ${E.y.toFixed(1)}`, fore = `M${E.x.toFixed(1)} ${E.y.toFixed(1)} L${H.x.toFixed(1)} ${H.y.toFixed(1)}`;
      el.arm.setAttribute('d', up); el.armI.setAttribute('d', up); el.fore.setAttribute('d', fore); el.foreI.setAttribute('d', fore);
      el.cuff.setAttribute('cx', E.x.toFixed(1)); el.cuff.setAttribute('cy', E.y.toFixed(1));
      el.hand.setAttribute('cx', H.x.toFixed(1)); el.hand.setAttribute('cy', H.y.toFixed(1));
      el.pen.setAttribute('x1', hx.toFixed(1)); el.pen.setAttribute('y1', hy.toFixed(1)); el.pen.setAttribute('x2', (hx + 9).toFixed(1)); el.pen.setAttribute('y2', (hy - 17).toFixed(1));
      el.head.style.transform = el.eyes.style.transform = `rotate(${(4 + (motion ? Math.sin(t * 1.1) * 1.8 + Math.sin(t * .37) * 1.2 : 0)).toFixed(2)}deg)`;
    } else if (info.pose === 'phone') {
      el.head.style.transform = el.eyes.style.transform = `rotate(${(13 + (motion ? Math.sin(t * .6) * 1.5 : 0)).toFixed(2)}deg)`;
    }
  }

  return { mount, frame };
})();
