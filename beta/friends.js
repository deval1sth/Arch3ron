/* Archeron · friends and the weekly effort board (beta). No server: each person shares a friend code (or a link carrying
   it) by message, and the board is built on each device from the codes it has been given.
   A code holds only a name, an avatar number and this week's effort: sets done, questions right, days studied. Never grades
   or photos. Codes come from other people, so every one is decoded and checked field by field before it is used. */
'use strict';
const FRIENDS = (() => {
  const VER = 'ARC1';
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) >>> 0; return (h % 1679616).toString(36).padStart(4, '0'); };
  const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  const isDay = k => /^\d{4}-\d{2}-\d{2}$/.test(k);
  const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi ? v : null;

  /* this week's effort, counted from the days the app already records */
  function mine() {
    const from = weekStart(); let sets = 0, right = 0, days = 0;
    for (let i = 0; i < 7; i++) { const k = addDays(i, from); if (k > dkey()) break; const d = S.days[k]; if (!d) continue;
      const s = setsOn(k), q = d.qr || 0; sets += s; right += q; if (s || d.qa) days++; }
    return { sets, right, days };
  }
  const myId = () => hash(ME.active() + '|archeron').slice(0, 4) + hash(ME.active()).slice(0, 4);
  const avNum = av => av && av.k === 'a' ? av.i : 0;
  function code() {
    const m = mine(), p = { i: myId(), n: (S.me && S.me.name) || 'Friend', a: avNum(S.me && S.me.av), w: weekStart(), s: m.sets, q: m.right, d: m.days, t: Math.floor(Date.now() / 6e4), c: S.daily && S.daily.d === dkey() ? S.daily.s : -1, cd: dkey() };
    const body = b64(JSON.stringify(p)); return `${VER}-${body}.${hash(body)}`;
  }
  /* every code found in a piece of text, checked; anything malformed is skipped */
  function parse(text) {
    const out = [];
    for (const m of String(text || '').matchAll(/ARC1-([A-Za-z0-9_-]{16,700})\.([0-9a-z]{4})/g)) {
      if (hash(m[1]) !== m[2]) continue;
      let p; try { p = JSON.parse(unb64(m[1])); } catch (e) { continue; }
      if (!p || typeof p !== 'object') continue;
      const f = { i: typeof p.i === 'string' && /^[0-9a-z]{4,12}$/.test(p.i) ? p.i : null, n: typeof p.n === 'string' ? p.n.replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 24) : '',
        a: int(p.a, 0, 23), w: typeof p.w === 'string' && isDay(p.w) ? p.w : null, s: int(p.s, 0, 2000), q: int(p.q, 0, 100000), d: int(p.d, 0, 7), t: int(p.t, 0, 1e9) };
      if (Object.values(f).some(v => v === null) || !f.n) continue;
      /* optional: today's Daily five score, only from codes that carry it */
      f.c = p.c === undefined ? -1 : int(p.c, -1, 5) ?? -1; f.cd = typeof p.cd === 'string' && isDay(p.cd) ? p.cd : '';
      out.push(f);
    }
    return out;
  }
  /* add or update friends; returns how many changed. Your own code is ignored. Up to 40 friends. */
  function add(list) {
    let n = 0;
    for (const f of list) {
      if (f.i === myId()) continue;
      const i = S.friends.findIndex(x => x.i === f.i);
      if (i >= 0) { if (f.t >= S.friends[i].t) { S.friends[i] = f; n++; } }
      else if (S.friends.length < 40) { S.friends.push(f); n++; }
    }
    if (n) save();
    return n;
  }
  const link = () => location.origin + location.pathname.replace(/index\.html$/, '') + '#add=' + code();
  async function share() {
    const text = `Add me on Archeron, the GCSE revision app: ${link()}`;
    try { if (navigator.share) { await navigator.share({ title: 'Archeron friend code', text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text); toast('Friend link copied. Paste it into a message.'); } catch (e) { prompt('Copy your friend link:', text); }
  }
  /* opened from a friend's link: offer to add them, then tidy the address bar */
  function boot() {
    const m = location.hash.match(/^#add=(.+)$/); if (!m) return;
    const got = parse(decodeURIComponent(m[1]));
    history.replaceState(null, '', location.pathname + location.search);
    if (!got.length) { toast('That friend link did not work. Ask for a new one.'); return; }
    if (got[0].i === myId()) { toast('That is your own friend link.'); return; }
    if (confirm(`Add ${got[0].n} as a friend? You will see each other's weekly effort when you swap codes.`)) { add(got); toast(`${got[0].n} added`); go('friends'); }
  }
  /* saved friends are re-checked on load with the same rules as a pasted code */
  const clean = list => (Array.isArray(list) ? list : []).slice(0, 40).filter(f => f && typeof f.i === 'string' && /^[0-9a-z]{4,12}$/.test(f.i) && typeof f.n === 'string' && f.n.length <= 24 && int(f.a, 0, 23) !== null && typeof f.w === 'string' && isDay(f.w) && int(f.s, 0, 2000) !== null && int(f.q, 0, 100000) !== null && int(f.d, 0, 7) !== null && int(f.t, 0, 1e9) !== null)
    .map(f => ({ i: f.i, n: f.n.replace(/[\u0000-\u001f\u007f<>]/g, ''), a: f.a, w: f.w, s: f.s, q: f.q, d: f.d, t: f.t, c: int(f.c, -1, 5) ?? -1, cd: typeof f.cd === 'string' && isDay(f.cd) ? f.cd : '' }));
  return { mine, code, parse, add, share, link, boot, myId, clean };
})();

let FR_SORT = 'sets';
function vFriends() {
  const ws = weekStart(), m = FRIENDS.mine(), me = { i: 'me', n: (S.me && S.me.name) || 'You', a: S.me && S.me.av, s: m.sets, q: m.right, d: m.days, me: true, c: S.daily && S.daily.d === dkey() ? S.daily.s : -1, cd: dkey() };
  const key = { sets: 's', right: 'q', days: 'd' }[FR_SORT];
  const now = [me, ...S.friends.filter(f => f.w === ws)].sort((a, b) => b[key] - a[key] || b.s - a.s);
  const old = S.friends.filter(f => f.w !== ws);
  const row = (f, i) => h('li', { class: 'fr-row' + (f.me ? ' me' : '') },
    h('span', { class: 'fr-n' }, i == null ? '' : String(i + 1)), ME.avatarEl(f.me ? f.a : { k: 'a', i: f.a }, 40),
    h('span', { class: 'grow fr-who' }, h('b', null, f.n + (f.me ? ' (you)' : '')), f.cd === dkey() && f.c >= 0 && h('small', null, `Daily five today: ${f.c}/5`)),
    h('span', { class: 'fr-v' }, h('b', null, String(f.s)), h('small', null, 'sets')), h('span', { class: 'fr-v' }, h('b', null, String(f.q)), h('small', null, 'right')), h('span', { class: 'fr-v' }, h('b', null, `${f.d}/7`), h('small', null, 'days')),
    !f.me && B(icon('x'), 'frDel', 'ghost icon-only sm', { 'data-i': f.i, 'aria-label': `Remove ${f.n}` }));
  return h('div', { class: 'stack narrow' },
    subHero('Toolkit', 'Friends', 'tools', 'Swap codes with friends to see who turned up this week. Only names, avatars and effort are shared: never grades or photos.'),
    card('This week', h('span', { class: 'muted' }, 'resets every Monday'),
      h('div', { class: 'chips' }, [['sets', 'Sets'], ['right', 'Questions right'], ['days', 'Days studied']].map(([k, l]) => chip(l, FR_SORT === k, 'frSort', { 'data-k': k }))),
      h('ol', { class: 'fr-list' }, now.map(row)),
      S.friends.length ? h('p', { class: 'muted xs' }, 'Every set counts, however small. Your friends’ numbers update when they send you a new code.') : h('p', { class: 'muted xs' }, 'No friends yet. Share your link below and paste theirs.')),
    card('Your friend link', null, h('p', { class: 'muted xs' }, 'Send it after you study. It carries this week\'s effort, so send a new one whenever you want your friends to see your progress.'),
      h('div', { class: 'row' }, B([icon('upload'), 'Share my link'], 'frShare', 'primary'), B('Copy code only', 'frCopy', 'ghost'))),
    card('Add a friend', null, h('p', { class: 'muted xs' }, 'Paste the link or code a friend sent you. You can paste several at once.'),
      h('textarea', { id: 'frIn', rows: 3, placeholder: 'Paste a friend link or code here', 'aria-label': 'Friend link or code', 'data-draft': 'fr', value: DRAFT.fr || '' }),
      h('div', { class: 'row' }, B('Add', 'frAdd', 'primary'))),
    old.length > 0 && card('Not updated this week', null, h('p', { class: 'muted xs' }, 'Their last code was from an earlier week. Ask them for a new one.'), h('ol', { class: 'fr-list old' }, old.map(f => row(f, null)))));
}
