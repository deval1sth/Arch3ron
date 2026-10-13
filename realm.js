/* Archeron · The Realm. Replaces Voyage. Everything here is driven by what you actually learn:
   the fog lifts as you learn, castles rise as regions are mastered, bosses guard each region,
   and rewards (chests, perks, story) take real, sustained work to earn.
   Loaded before app.js; uses its helpers (h, card, S, LEARN…) only inside functions. */
'use strict';

/* ---------- world data ---------- */
const REGIONS = {
  maths: { name: 'The Numeral Spires', color: '#d9a441', x: 182, y: 58, boss: ['The Arithmancer', 'Herald of the Broken Count', '#ffd36b', 'skull', 'crown', 'none'] },
  physics: { name: 'The Stormforge Peaks', color: '#7aa7ff', x: 292, y: 84, boss: ['The Storm Engine', 'Lord of the Iron Sky', '#cfe0ff', 'hood', 'spikes', 'bat'] },
  chemistry: { name: 'The Alembic Marsh', color: '#4fd1c5', x: 300, y: 178, boss: ['The Alembic Wyrm', 'Drinker of Reagents', '#a5fff6', 'skull', 'ram', 'bat'] },
  biology: { name: 'The Thornwild', color: '#7bc96f', x: 232, y: 242, boss: ['The Hollow Bloom', 'Mother of Rot', '#c6ff7a', 'hood', 'antlers', 'tattered'] },
  geography: { name: 'The Shattered Steppe', color: '#e0894a', x: 122, y: 246, boss: ['The Rift Colossus', 'Breaker of Continents', '#ffc38a', 'skull', 'ram', 'none'] },
  business: { name: 'The Gilded Bazaar', color: '#f2c14e', x: 56, y: 172, boss: ['The Gilded Tyrant', 'Keeper of Every Debt', '#fff0a8', 'hood', 'crown', 'bat'] },
  re: { name: 'The Cathedral Wastes', color: '#c9d6ff', x: 70, y: 86, boss: ['The Fallen Seraph', 'The Last Unbeliever', '#ffffff', 'hood', 'halo', 'feather'] },
  englit: { name: 'The Theatre of Ash', color: '#e06a8a', x: 142, y: 152, boss: ['The Pale Playwright', 'Who Writes Your Ending', '#ffb3c6', 'hood', 'crown', 'tattered'] },
  englang: { name: 'The Inkfall Coast', color: '#9b7bff', x: 232, y: 152, boss: ['The Ink Wraith', 'Devourer of Words', '#d6c7ff', 'hood', 'none', 'tattered'] }
};
const ROADS = [['maths', 're'], ['maths', 'physics'], ['maths', 'englit'], ['maths', 'englang'], ['re', 'business'], ['re', 'englit'], ['business', 'englit'], ['business', 'geography'],
  ['englit', 'englang'], ['englit', 'geography'], ['englang', 'physics'], ['englang', 'chemistry'], ['englang', 'biology'], ['physics', 'chemistry'], ['chemistry', 'biology'], ['biology', 'geography']];
const STAGES = [[0, 'Ruins'], [5, 'Palisade Wall'], [15, 'Stone Keep'], [30, 'Watchtowers'], [50, 'Spired Fortress'], [70, 'Banner Hold'], [90, 'Citadel']];
const BOSS_REQ = [3, 20, 45], BOSS_HP = [8, 12, 16], BOSS_TIER = ['Awakened', 'Enraged', 'Ascended'];
const RARITY = { common: '#a3abbd', uncommon: '#6fd08c', rare: '#6aa8ff', epic: '#b67bff', legendary: '#ffcf5a' };
const RAR_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const BANNERS = [['b-ember', 'Ember Standard', 'common', '#d9a441', 'flame'], ['b-ash', 'Ash Pennant', 'common', '#8a8f9e', 'feather'], ['b-blood', 'Bloodmoon Banner', 'uncommon', '#b3303a', 'moon'],
  ['b-thorn', 'Thornwild Colours', 'uncommon', '#4f9a5a', 'leaf'], ['b-tide', 'Tidecaller Flag', 'uncommon', '#3d8fb3', 'compass'], ['b-storm', 'Stormforge Ensign', 'rare', '#5b7cff', 'bolt'],
  ['b-hex', 'Hexbound Sigil', 'rare', '#8e5bd6', 'sparkle'], ['b-bone', 'Bonewarden Banner', 'rare', '#d8d0bf', 'shield'], ['b-cinder', 'Crown of Cinders', 'epic', '#ff7a3c', 'crown'],
  ['b-abyss', 'Abyssal Gem', 'epic', '#29c4c4', 'gem'], ['b-star', 'Starfall Standard', 'legendary', '#ffe27a', 'star'], ['b-lantern', 'The Last Lantern', 'legendary', '#ffb347', 'lantern']];
const TITLES_R = [['t-fog', 'Fogwalker', 'common'], ['t-ash', 'Ash-Handed', 'common'], ['t-candle', 'Candle Scholar', 'common'], ['t-night', 'Night Student', 'common'],
  ['t-hex', 'Hexbreaker', 'uncommon'], ['t-ink', 'Ink-Sworn', 'uncommon'], ['t-thorn', 'Thornwalker', 'uncommon'], ['t-embers', 'Keeper of Embers', 'uncommon'],
  ['t-bane', 'Demonbane', 'rare'], ['t-warden', 'Warden of the Reach', 'rare'], ['t-blood', 'Bloodmoon Scholar', 'rare'], ['t-bound', 'Daemon-Bound', 'rare'],
  ['t-heralds', 'Slayer of Heralds', 'epic'], ['t-crowned', 'Crowned in Ash', 'epic'], ['t-unbowed', 'The Unbowed', 'epic'],
  ['t-sovereign', 'Sovereign of the Reach', 'legendary'], ['t-eternal', 'The Lantern Eternal', 'legendary']];
const COSMETICS = Object.fromEntries([...BANNERS.map(b => [b[0], { kind: 'banner', name: b[1], rarity: b[2], color: b[3], icon: b[4] }]), ...TITLES_R.map(t => [t[0], { kind: 'title', name: t[1], rarity: t[2] }])]);
const CHESTS = {
  iron: { name: 'Iron chest', color: '#9aa3b5', shards: [8, 16], cos: .2, w: { common: 70, uncommon: 25, rare: 5 } },
  silver: { name: 'Silver chest', color: '#d7e0ef', shards: [20, 35], cos: .45, w: { common: 40, uncommon: 40, rare: 17, epic: 3 } },
  gold: { name: 'Gold chest', color: '#ffcf5a', shards: [50, 80], cos: 1, w: { uncommon: 30, rare: 45, epic: 20, legendary: 5 } },
  obsidian: { name: 'Obsidian chest', color: '#b67bff', shards: [90, 140], cos: 1, extra: .5, w: { rare: 40, epic: 42, legendary: 18 } }
};
const PERKS = [
  ['wind', 'The Hunter', 'Second Wind', '+1 life in boss fights and the Hunt.', 1, null],
  ['exec', 'The Hunter', 'Executioner', 'Combo damage against bosses starts at 2 right in a row instead of 3.', 2, 'wind'],
  ['instinct', 'The Hunter', 'Hunter\'s Instinct', '+25% score in the Hunt.', 3, 'exec'],
  ['fortune', 'The Alchemist', 'Fortune\'s Favour', '+50% shards from chests, and a better chance of finding cosmetics.', 1, null],
  ['quarter', 'The Alchemist', 'Quartermaster', '+10 shards for every daily quest.', 2, 'fortune'],
  ['board', 'The Alchemist', 'Contract Board', 'Swap one daily quest for a new one, once a day.', 3, 'quarter'],
  ['ward', 'The Warden', 'Ember Ward', 'One missed day a week does not cool your flame.', 1, null],
  ['relent', 'The Warden', 'Relentless', 'One extra boss attempt per day.', 2, 'ward']
];
const QUESTS = [
  ['qr25', 'Answer 25 questions correctly', 25, e => e.qr], ['sets3', 'Finish 3 focus sets', 3, e => e.sets], ['vocab8', 'Spell or use 8 descriptive words correctly', 8, e => e.vocab],
  ['def8', 'Get 8 definitions right', 8, e => e.def], ['eq6', 'Get 6 chemistry equations or formulae right', 6, e => e.eq], ['maths10', 'Get 10 Maths questions right', 10, e => e['s:maths']],
  ['sci12', 'Get 12 Science questions right', 12, e => (e['s:biology'] || 0) + (e['s:chemistry'] || 0) + (e['s:physics'] || 0)],
  ['eng10', 'Get 10 English questions right', 10, e => (e['s:englit'] || 0) + (e['s:englang'] || 0)],
  ['hum10', 'Get 10 RE, Geography or Business questions right', 10, e => (e['s:re'] || 0) + (e['s:geography'] || 0) + (e['s:business'] || 0)],
  ['run10', 'Get 10 right in a row', 10, e => e.run], ['fix1', 'Clear a topic from your fix queue', 1, e => e.fix], ['hunt1', 'Complete today\'s Hunt', 1, e => e.hunt],
  ['boss1', 'Challenge a boss', 1, e => e.boss], ['paper1', 'Finish an exam paper or a generated Maths paper', 1, e => e.paper]
];
const WRANKS = [[0, 'Ashen'], [25, 'Iron'], [45, 'Bronze'], [65, 'Silver'], [85, 'Gold'], [105, 'Obsidian'], [125, 'Grandmaster of the Nightwatch']];
const GRADE_F = [[5, 70], [4, 55], [3, 40], [2, 25], [1, 12]], GRADE_H = [[9, 85], [8, 77], [7, 68], [6, 59], [5, 50], [4, 41], [3, 31], [2, 20], [1, 10]];
const FOUNDATION = new Set(['Maths', 'Science']);
const STORY = [
  ['The Veil', 'Long ago the Nightwatch kept the nine regions of the Reach in the light. Then the Unwritten King breathed out the Veil: a grey fog that eats what people know. Towns forgot their names. Castles crumbled because no one remembered how to hold them up. You wake in the ruins of a watchtower with an ember in your hand and a fox made of flame curled at your feet. "You are the last of the Watch," it says. "Every truth you learn burns a little of the fog away. Start."'],
  ['Embers and Ash', 'The fox calls itself Vesper. It does not explain where it came from. It only watches you work by the light of your ember, and every time you answer true, the flame between your fingers grows brighter. "The King\'s Veil is patient," Vesper says. "It will wait for you to stop. So don\'t." Beyond the ruined wall, for the first time in a hundred years, someone in the valley lights a lamp.'],
  ['The First Herald', 'The fog does not lift quietly. In each region something wakes to defend it: a Herald of the Unwritten King, fed on everything people have forgotten. You hear the first one before you see it, counting backwards in the dark, every number wrong. Vesper\'s fur bristles. "Heralds are not killed by swords," it says. "They are killed by being answered."'],
  ['Stone Remembers', 'You learn that castles are memories made solid. Where enough is known, walls stand; where knowledge fails, they fall. You lay the first stones of your keep and find they hold. Travellers begin to arrive, drawn by the glow of your windows. One of them, an old cartographer with ink-stained hands, unrolls a map of the Reach. Most of it is blank. "Fill it," she says, "and I will believe you."'],
  ['The Ink Coast', 'On the Inkfall Coast the sea is black and the waves are made of unwritten words. A child there cannot describe the colour of the sky, because the Veil took the words for it. You give her three: azure, luminous, iridescent. She repeats them like a spell, and the water at her feet turns clear. Vesper says nothing, but it walks closer to you on the road back.'],
  ['The Pale Playwright', 'In the Theatre of Ash, the actors only perform endings. Every play is a tragedy, because the Playwright has stolen every other choice. He offers you a script with your own name on it and the final page already written. You tear it in half. "Endings are earned," you tell him. Behind you, for a moment, the audience remembers how to applaud.'],
  ['Vesper\'s Secret', 'In a storm on the Stormforge Peaks, Vesper finally tells you the truth. It is not a fox. It is the shape your own will takes when the fog is thinnest. "When you stop working, I fade," it says. "That is why I was so dim when you found me." It is brighter now than you have ever seen it, nine tails of fire curling in the rain.'],
  ['The Gilded Debt', 'The Gilded Tyrant keeps the Bazaar in chains of debt: every merchant owes him more than they could ever earn. But debts are only numbers, and you have learned how numbers work. You show the merchants their accounts, line by line, revenue against cost, and one by one the chains fall open. The Tyrant\'s gold turns to ash in his hands.'],
  ['The Cathedral Wastes', 'In the Wastes stand a thousand empty churches and temples, their meanings forgotten. The Fallen Seraph sits among them, unable to remember what anyone ever believed. You do not argue with it. You simply say what each faith teaches, and why it matters to those who hold it. The bells begin to ring, one after another, across the whole plain.'],
  ['Half the Map', 'The cartographer\'s map is half full now. She traces the roads you have opened with a shaking finger. "No one has done this since the Watch fell," she whispers. That night, as you sit by the fire, Vesper lays its head on your knee. "He has noticed you," it says. You do not have to ask who.'],
  ['The Herald of Rot', 'In the Thornwild everything grows wrong: cells that divide without stopping, roots that strangle what they feed. The Hollow Bloom knows the forest better than anyone, except, by now, you. You name every part of it, every system, every process, until the Bloom cannot hide inside the confusion any longer. The forest exhales.'],
  ['The Alembic Wyrm', 'The Wyrm drinks reagents and breathes out mistakes: unbalanced reactions that burn the marsh. You stand in its path and balance every equation it spits at you, atom for atom, until there is nothing left for it to burn. Vesper laughs, actually laughs, for the first time. The sound is like a struck match.'],
  ['The Night Before', 'The Unwritten King names the night he will come for you: the Night of Reckoning, when every Herald\'s power returns at once. You have weeks, not months. The cartographer\'s map is almost complete; your castles burn with light across the Reach. "Are you afraid?" Vesper asks. "Yes," you say. "Good. Fear means you know what is at stake. Now train."'],
  ['The Night of Reckoning', 'The fog rolls in like a tide, and the King walks inside it, wearing a crown of blank pages. He asks you everything at once. And you answer: not perfectly, but enough. Enough truths to hold the walls. Enough to keep the lamps lit. When the dawn comes the Veil has broken into a thousand grey threads, and Vesper stands beside you, blazing. "You did not do this in one night," it says. "You did it every night before."']
];
const CREATURE_A = ['Ashen', 'Hollow', 'Gloam', 'Grave', 'Ember', 'Thorn', 'Mire', 'Pale', 'Rime', 'Hex', 'Dusk', 'Bone', 'Shade', 'Iron', 'Blood', 'Wyrd', 'Cinder', 'Moon', 'Storm', 'Veil'];
const CREATURE_N = ['Wisp', 'Hound', 'Moth', 'Basilisk', 'Gargoyle', 'Revenant', 'Kitsune', 'Gumiho', 'Banshee', 'Wyvern', 'Golem', 'Harpy', 'Selkie', 'Imp', 'Raven', 'Serpent', 'Lich', 'Stag', 'Owl', 'Wolf'];

/* ---------- small helpers ---------- */
function seedOf(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; }
function rng(seed) { let a = seed; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R0 = () => S.realm;
const ev = k => (S.days[k] && S.days[k].ev) || {};
function realmEv(name, n = 1, asMax = false) { const d = ensureDay(dkey()); d.ev = d.ev || {}; d.ev[name] = asMax ? Math.max(d.ev[name] || 0, n) : (d.ev[name] || 0) + n; }
const hasPerk = id => !!R0().perks[id];
/* shortcut: a set ticked on the plan AND counted by the timer is the same set, so take the larger of the two, not the sum */
const setsDay = k => Math.max(setsOn(k), ev(k).sets || 0);
const activeDay = k => setsDay(k) > 0 || ((S.days[k] || {}).qa || 0) >= 20;
let SVGN = 0;
const svgWrap = (cls, label, inner, vb) => { const w = h('div', { class: cls, role: 'img', 'aria-label': label }); w.innerHTML = `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`; return w; };

/* ---------- normalising saved realm data ---------- */
function realmNorm(raw) {
  const r = obj(raw), out = { since: isKey(r.since) ? r.since : dkey(), shards: Math.max(0, Math.round(num(r.shards))), setsToChest: clamp(Math.round(num(r.setsToChest)), 0, 5),
    chests: arr(r.chests).filter(c => CHESTS[c]).slice(0, 60), owned: {}, banner: COSMETICS[r.banner] ? r.banner : 'b-ember', title: COSMETICS[r.title] ? r.title : '',
    bosses: {}, bossDay: {}, perks: {}, bound: {}, stage: {}, chap: Math.max(0, Math.round(num(r.chap))), fresh: !raw,
    hunt: { best: 0, trail: [], last: '', scores: {} }, q: null, vault: [], stat: {} };
  for (const k of Object.keys(obj(r.owned))) if (COSMETICS[k]) out.owned[k] = 1;
  out.owned['b-ember'] = 1;
  for (const [k, v] of Object.entries(obj(r.bosses))) if (REGIONS[k]) out.bosses[k] = clamp(Math.round(num(v)), 0, 3);
  for (const [k, v] of Object.entries(obj(r.bossDay))) if (REGIONS[k] && Array.isArray(v) && isKey(v[0])) out.bossDay[k] = [v[0], clamp(Math.round(num(v[1])), 0, 9)];
  for (const p of PERKS) if (obj(r.perks)[p[0]]) out.perks[p[0]] = 1;
  for (const [k, v] of Object.entries(obj(r.bound))) if (isKey(v)) out.bound[str(k, 30)] = v;
  for (const [k, v] of Object.entries(obj(r.stage))) if (REGIONS[k]) out.stage[k] = clamp(Math.round(num(v)), 0, STAGES.length - 1);
  const hu = obj(r.hunt);
  out.hunt = { best: Math.max(0, num(hu.best)), trail: arr(hu.trail).map(x => Math.max(0, num(x))).slice(0, 20), last: isKey(hu.last) ? hu.last : '', scores: {} };
  for (const [k, v] of Object.entries(obj(hu.scores)).sort().slice(-60)) if (isKey(k)) out.hunt.scores[k] = Math.max(0, num(v));
  const q = obj(r.q);
  if (isKey(q.day) && Array.isArray(q.ids) && q.ids.length === 3 && q.ids.every(id => QUESTS.some(x => x[0] === id)))
    out.q = { day: q.day, ids: q.ids, claimed: [0, 1, 2].map(i => !!arr(q.claimed)[i]), rer: !!q.rer };
  out.vault = arr(r.vault).map(obj).filter(v => v.name).slice(0, 30).map(v => ({ id: str(v.id || 'v' + Date.now(), 20), name: str(v.name, 60), cost: clamp(Math.round(num(v.cost, 100)), 1, 99999), n: Math.max(0, Math.round(num(v.n))) }));
  for (const k of ['hunts', 'quests', 'bossWins', 'heatBest', 'chests']) out.stat[k] = Math.max(0, Math.round(num(obj(r.stat)[k])));
  return out;
}

/* ---------- measures ---------- */
function regionTopics(sid) { return ((SUBJ_BY[sid] || {}).topics || []).filter(usable); }
/* Fog cleared in a region. Every right answer counts straight away, so the fog visibly moves:
   a fact is worth half once you get it right and all of it once right twice in a row;
   a calculation topic earns a fifth per right answer in a row, up to 5 (mastered). */
function regionPct(sid) {
  const b = (LEARN.bank() || {})[sid] || {}, keys = [...(b.def || []), ...(b.recall || []), ...(b.eq || []), ...(b.vocab || [])];
  const calc = regionTopics(sid).filter(id => LEARN.TOPIC[id].type === 'calc');
  const T = keys.length + calc.length; if (!T) return 0;
  let got = 0;
  for (const k of keys) { const m = S.items[k]; if (m) got += m[2] >= 2 ? 1 : m[2] === 1 ? .5 : 0; }
  for (const id of calc) got += Math.min(5, skill(id).best) / 5;
  return got / T * 100;
}
const pctTxt = p => p < 10 ? p.toFixed(1) : String(Math.floor(p));
const stageOf = pct => STAGES.reduce((s, [t], i) => pct >= t ? i : s, 0);
function flame() {
  const keys = Object.keys(S.days).filter(isKey).sort();
  let heat = 0, streak = 0, best = 0, wardWeek = -1;
  const today = dkey(); if (!keys.length) return { heat: 0, streak: 0, best: 0 };
  for (let k = keys[0]; k <= today; k = addDays(1, k)) {
    const on = activeDay(k);
    if (on) { heat++; streak++; }
    else if (k !== today) {
      const wk = Math.floor((dayNum(k) + 3) / 7);
      if (hasPerk('ward') && wardWeek !== wk) wardWeek = wk; else heat = Math.floor(heat * .6);
      streak = 0;
    }
    best = Math.max(best, heat);
  }
  return { heat, streak, best };
}
const FLAMES = [[0, 'Cold ember', '#6b6f80'], [1, 'Spark', '#ffb36b'], [3, 'Flame', '#ff9a3d'], [7, 'Blaze', '#ff7a2f'], [14, 'Inferno', '#ff5a3c'], [30, 'Hellfire', '#b67bff']];
const flameTier = heat => FLAMES.reduce((s, f) => heat >= f[0] ? f : s, FLAMES[0]);
function rank() {
  let act = 0, n = 0, r = 0, sets = 0;
  for (let i = 0; i < 7; i++) { const k = addDays(-i), d = S.days[k] || {}; if (activeDay(k)) act++; n += d.qa || 0; r += d.qr || 0; sets += setsDay(k); }
  const score = act * 8 + Math.min(n, 350) / 7 + (n >= 20 ? r / n * 30 : 0) + Math.min(sets, 40) * .6;
  const i = WRANKS.reduce((s, [t], j) => score >= t ? j : s, 0), next = WRANKS[i + 1];
  return { score: Math.round(score), name: WRANKS[i][1], i, next, toNext: next ? Math.ceil(next[0] - score) : 0 };
}
function forecast(subj) {
  const sids = LEARN.SUBJECTS.filter(s => s.subj === subj).map(s => s.id);
  const learnedPct = sids.reduce((a, s) => a + regionPct(s), 0) / (sids.length || 1);
  const papers = S.scores.filter(x => x.subj === subj).sort((a, b) => a.date < b.date ? -1 : 1).slice(-3);
  if (!papers.length) return null; /* coverage of the app alone says little about exam marks, so wait for real papers */
  const est = .8 * (papers.reduce((a, p) => a + pctOf(p), 0) / papers.length) + .2 * learnedPct;
  const g = (FOUNDATION.has(subj) ? GRADE_F : GRADE_H).find(([, t]) => est >= t);
  return { grade: g ? g[0] : 'U', est: Math.round(est), papers: papers.length };
}
function storyWeeks() {
  const since = R0().since, wkStart = k => addDays(-((parseKey(k).getDay() + 6) % 7), k), need = Math.max(1, Math.ceil(weekTarget() * .7));
  let n = 0, info = null;
  for (let w = wkStart(since); w <= dkey(); w = addDays(7, w)) {
    let sets = 0; for (let i = 0; i < 7; i++) sets += setsDay(addDays(i, w));
    if (sets >= need) n++;
    if (addDays(7, w) > dkey()) info = { sets, need };
  }
  return { chapters: Math.min(STORY.length, 1 + n), week: info || { sets: 0, need } };
}
function creature(id) {
  const t = LEARN.TOPIC[id], r = rng(seedOf(id)), base = { recall: 0, def: 1, vocab: 1, calc: 2, eq: 2, quote: 3 }[t.type] || 0;
  const rar = RAR_ORDER[Math.min(3, base + (seedOf(id + 'r') % 7 === 0 ? 1 : 0))];
  return { id, name: `${CREATURE_A[Math.floor(r() * CREATURE_A.length)]} ${CREATURE_N[Math.floor(r() * CREATURE_N.length)]}`, rarity: rar, topic: t.name, sid: t.subject };
}
const boundIds = () => Object.keys(LEARN.TOPIC).filter(id => usable(id) && stars(id) === 3);
const guardians = () => Object.keys(REGIONS).filter(sid => { const t = regionTopics(sid); return t.length && t.every(id => stars(id) === 3); });
function perkPoints() { const got = Object.values(R0().bosses).reduce((a, b) => a + b, 0), spent = PERKS.filter(p => hasPerk(p[0])).reduce((a, p) => a + p[4], 0); return { got, spent, left: got - spent }; }
function bossAttempts(sid) { const d = R0().bossDay[sid], max = 1 + (hasPerk('relent') ? 1 : 0); return max - (d && d[0] === dkey() ? d[1] : 0); }
function nextBossTier(sid) { const t = (R0().bosses[sid] || 0) + 1; return t > 3 ? null : { t, open: regionPct(sid) >= BOSS_REQ[t - 1] }; }

/* ---------- quests ---------- */
function todaysQuests() {
  const R = R0(), k = dkey();
  if (!R.q || R.q.day !== k) {
    const r = rng(seedOf('quest' + k)), pool = QUESTS.filter(q => q[0] !== 'fix1' || S.queue.length), big = new Set(['hunt1', 'boss1', 'paper1']), ids = [];
    for (const q of pool.map(q => [r(), q]).sort((a, b) => a[0] - b[0]).map(x => x[1])) {
      if (ids.length === 3) break;
      if (big.has(q[0]) && ids.some(id => big.has(id))) continue;
      ids.push(q[0]);
    }
    R.q = { day: k, ids, claimed: [false, false, false], rer: false };
  }
  const e = { ...ev(k), qa: (S.days[k] || {}).qa || 0, qr: (S.days[k] || {}).qr || 0 };
  return R.q.ids.map((id, i) => { const q = QUESTS.find(x => x[0] === id), v = Math.min(q[2], q[3](e) || 0); return { i, id, text: q[1], need: q[2], v, done: v >= q[2], claimed: R.q.claimed[i] }; });
}
const questReward = () => 20 + (hasPerk('quarter') ? 10 : 0);

/* ---------- chests ---------- */
function giveChest(type, why) { const R = R0(); R.chests.push(type); R.stat.chests++; toast(`${CHESTS[type].name} earned · ${why}`, 'big'); }
function rollRarity(w, r) { const tot = Object.values(w).reduce((a, b) => a + b, 0); let x = r() * tot; for (const [k, v] of Object.entries(w)) if ((x -= v) <= 0) return k; return Object.keys(w)[0]; }
function openChest(i) {
  const R = R0(), type = R.chests[i]; if (!type) return;
  const C = CHESTS[type], r = Math.random, fortune = hasPerk('fortune');
  let shards = Math.round((C.shards[0] + r() * (C.shards[1] - C.shards[0])) * (fortune ? 1.5 : 1));
  const got = [], rolls = (r() < Math.min(1, C.cos + (fortune ? .15 : 0)) ? 1 : 0) + (C.extra && r() < C.extra + (fortune ? .15 : 0) ? 1 : 0);
  for (let n = 0; n < rolls; n++) {
    const rar = rollRarity(C.w, r), pool = Object.entries(COSMETICS).filter(([, c]) => c.rarity === rar), [id, c] = pool[Math.floor(r() * pool.length)];
    if (R.owned[id]) { const dup = { common: 10, uncommon: 20, rare: 35, epic: 60, legendary: 100 }[rar]; shards += dup; got.push(`Duplicate ${c.name} → +${dup} shards`); }
    else { R.owned[id] = 1; got.push(`New ${c.rarity} ${c.kind}: ${c.name}`); }
  }
  R.chests.splice(i, 1); R.shards += shards; save();
  FXS.reveal(C.name + ' opened', `+${shards} shards`, got.join(' · ') || 'No cosmetic this time. Shards spend in the Vault.');
}

/* ---------- sync: runs after every action ---------- */
function realmSync(silent) {
  const R = R0(); if (!R) return;
  const quiet = silent || R.fresh;
  /* castles rising */
  for (const sid of Object.keys(REGIONS)) {
    const st = stageOf(regionPct(sid));
    if (st > (R.stage[sid] || 0)) { if (!quiet) FXS.reveal(REGIONS[sid].name, `Your castle rises: ${STAGES[st][1]}`, 'The fog thins. Keep going and the walls will climb higher.'); R.stage[sid] = st; }
  }
  /* creatures bound */
  const now = boundIds();
  const fresh = now.filter(id => !R.bound[id]); for (const id of fresh) R.bound[id] = dkey();
  if (fresh.length && !quiet) { const c = creature(fresh[0]); FXS.reveal(fresh.length > 1 ? `${fresh.length} creatures bound` : `${c.rarity} creature bound`, c.name + (fresh.length > 1 ? ` and ${fresh.length - 1} more` : ''), `For mastering ${c.topic}${fresh.length > 1 ? ' and others' : ''}. Find them in your Bestiary.`); }
  /* story chapters → obsidian chest each */
  const ch = storyWeeks().chapters;
  if (ch > Math.max(1, R.chap)) { for (let c = Math.max(1, R.chap); c < ch; c++) { R.chests.push('obsidian'); R.stat.chests++; } if (!quiet) FXS.reveal('A new chapter', STORY[ch - 1][0], 'Weekly target hit. Obsidian chest earned. Read it in The Realm.'); }
  R.chap = Math.max(R.chap, ch);
  const f = flame(); R.stat.heatBest = Math.max(R.stat.heatBest, f.best);
  R.fresh = false;
}
function realmOnSet() {
  const R = R0(); realmEv('sets');
  if (++R.setsToChest >= 6) { R.setsToChest = 0; giveChest('iron', '6 focus sets'); }
}

/* ---------- fights: bosses and the Hunt reuse the Learn drill (DR) ---------- */
let RF = null, FOG = null;
function realmOnAnswer(ok) {
  if (DR && DR.ctx === 'fog') return fogAnswer(ok);
  if (!RF || RF.over) return;
  RF.n++;
  if (RF.kind === 'boss') {
    if (ok) { const combo = DR.run >= (hasPerk('exec') ? 2 : 3), d = 1 + (combo ? 1 : 0); RF.hp = Math.max(0, RF.hp - d); RF.log = combo ? `Combo strike! −${d}` : `Hit! −${d}`; }
    else { RF.lives--; RF.log = `${RF.cfg[0]} strikes back. −1 life`; }
    if (RF.hp <= 0) bossWin(); else if (RF.lives <= 0) { RF.over = 'lose'; save(); }
  } else {
    if (ok) { const pts = Math.round((100 + 20 * Math.min(DR.run - 1, 10)) * (hasPerk('instinct') ? 1.25 : 1)); RF.score += pts; RF.log = `+${pts}${DR.run >= 3 ? ` · ${DR.run} combo` : ''}`; }
    else { RF.lives--; RF.log = 'A miss. −1 life'; }
    RF.trail.push(RF.score);
    if (RF.lives <= 0 || RF.n >= 12) huntEnd();
  }
}
/* Burning the fog: ordinary practice, but inside the Realm, so every answer visibly moves your region. */
function fogAnswer(ok) {
  if (!FOG) return;
  const pct = regionPct(FOG.sid), gain = pct - FOG.pct;
  FOG.n++; if (ok) FOG.right++;
  if (gain > 0.0001) { FOG.burned += gain; FOG.msg = `Fog burned! +${gain.toFixed(2)}%`; FOG.hot = true; }
  else { FOG.hot = false; FOG.msg = ok ? 'Right, but this one was already clear. Keep going.' : 'Wrong. The fog holds here, and this one will come back until you get it.'; }
  FOG.pct = pct;
}
function bossWin() {
  const R = R0(); RF.over = 'win'; R.bosses[RF.sid] = RF.tier; R.stat.bossWins++;
  R.chests.push('gold'); R.stat.chests++; save();
  FXS.reveal(`${BOSS_TIER[RF.tier - 1]} herald slain`, RF.cfg[0], 'Gold chest and 1 perk point earned.');
}
function huntEnd() {
  const R = R0(), H = R.hunt; RF.over = 'done';
  const pb = RF.score > H.best, shards = Math.round(RF.score / 40);
  H.scores[dkey()] = RF.score; if (pb) { H.best = RF.score; H.trail = RF.trail.slice(); }
  R.shards += shards; R.stat.hunts++; realmEv('hunt'); RF.shards = shards; RF.pb = pb; save();
}

/* ---------- art ---------- */
function castleSvg(lv, { color = '#d9a441', banner = '#d9a441', cracks = 0 } = {}) {
  const u = 'c' + (++SVGN), G = 178, lit = lv >= 5, warm = lv >= 3;
  const win = lit ? '#ffcf73' : warm ? '#d98a3a' : '#191521';
  const merl = (x, y, w) => { let p = ''; for (let i = x; i < x + w - 3; i += 9) p += `<rect x="${i}" y="${y - 6}" width="6" height="7"/>`; return `<g fill="url(#${u}st)">${p}</g>`; };
  const wall = (x, y, w, hh) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="url(#${u}st)" stroke="#0b0a10" stroke-width=".8"/><path d="M${x} ${y + 8}H${x + w}M${x} ${y + 18}H${x + w}" stroke="#ffffff" stroke-opacity=".03"/>${merl(x, y, w)}`;
  const gw = (cx, cy, w = 6, hh = 11, glow = true) => { const d = `M${cx - w / 2} ${cy + hh / 2}V${cy - hh / 2 + w / 2}Q${cx - w / 2} ${cy - hh / 2} ${cx} ${cy - hh / 2 - 2}Q${cx + w / 2} ${cy - hh / 2} ${cx + w / 2} ${cy - hh / 2 + w / 2}V${cy + hh / 2}Z`;
    return (glow && warm ? `<path d="${d}" fill="${win}" filter="url(#${u}g)" opacity=".9"/>` : '') + `<path d="${d}" fill="${win}"/>`; };
  const cone = (x, w, top, tall) => `<path d="M${x - 3} ${top}L${x + w / 2} ${top - tall}L${x + w + 3} ${top}Z" fill="url(#${u}rf)" stroke="#0b0a10" stroke-width=".8"/><path d="M${x + w / 2} ${top - tall}V${top - tall - 6}" stroke="${color}" stroke-width="1.2"/>`;
  const flag = (x, y) => `<path d="M${x} ${y}V${y - 18}" stroke="#2a2430" stroke-width="1.2"/><path d="M${x} ${y - 18}Q${x + 10} ${y - 20} ${x + 18} ${y - 15}Q${x + 10} ${y - 12} ${x} ${y - 10}Z" fill="${banner}"><animate attributeName="d" dur="2.6s" repeatCount="indefinite" values="M${x} ${y - 18}Q${x + 10} ${y - 20} ${x + 18} ${y - 15}Q${x + 10} ${y - 12} ${x} ${y - 10}Z;M${x} ${y - 18}Q${x + 9} ${y - 16} ${x + 18} ${y - 16}Q${x + 9} ${y - 10} ${x} ${y - 10}Z;M${x} ${y - 18}Q${x + 10} ${y - 20} ${x + 18} ${y - 15}Q${x + 10} ${y - 12} ${x} ${y - 10}Z"/></path>`;
  const tower = (x, w, hh, roof) => wall(x, G - hh, w, hh) + `<rect x="${x + w / 2 - 1.2}" y="${G - hh + 14}" width="2.4" height="9" fill="${win}"/>` + (hh > 60 ? gw(x + w / 2, G - hh + 38, 5, 9) : '') + (roof ? cone(x, w, G - hh - 6, w * 1.5) : '');
  let s = `<defs><linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07060d"/><stop offset=".7" stop-color="#1a1428"/><stop offset="1" stop-color="#2a1d30"/></linearGradient>
    <linearGradient id="${u}st" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4d4760"/><stop offset=".5" stop-color="#2f2a3d"/><stop offset="1" stop-color="#1b1724"/></linearGradient>
    <linearGradient id="${u}rf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#43303f"/><stop offset="1" stop-color="#160f18"/></linearGradient>
    <radialGradient id="${u}m"><stop offset="0" stop-color="${color}" stop-opacity=".5"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${u}mo"><stop offset="0" stop-color="#fff6e0" stop-opacity=".35"/><stop offset="1" stop-color="#fff6e0" stop-opacity="0"/></radialGradient>
    <filter id="${u}g" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>
    <rect width="320" height="220" fill="url(#${u}sky)"/><circle cx="256" cy="46" r="44" fill="url(#${u}mo)"/><circle cx="256" cy="46" r="15" fill="#f3ead2"/><circle cx="262" cy="42" r="14" fill="#1a1428" opacity=".25"/>`;
  const r = rng(lv * 97 + 3); for (let i = 0; i < 28; i++) s += `<circle cx="${(r() * 320).toFixed(0)}" cy="${(r() * 110).toFixed(0)}" r="${(r() * .9 + .2).toFixed(2)}" fill="#fff" opacity="${(r() * .6 + .2).toFixed(2)}"/>`;
  s += `<path d="M0 150L36 120L66 138L104 98L142 132L184 106L226 134L266 102L320 128V220H0Z" fill="#120e1a"/><path d="M0 162L50 146L96 158L150 140L206 156L262 142L320 158V220H0Z" fill="#0e0b14"/>`;
  if (lv >= 6) s += `<circle cx="160" cy="110" r="120" fill="url(#${u}m)"/><path d="M160 34L140 0H180Z" fill="${color}" opacity=".12"/>`;
  s += `<path d="M0 ${G}Q80 ${G - 16} 160 ${G - 20}Q240 ${G - 16} 320 ${G}V220H0Z" fill="#0a0810"/>`;
  if (lv === 0) {
    s += `<g fill="url(#${u}st)" stroke="#0b0a10" stroke-width=".8"><path d="M96 ${G}V${G - 22}L104 ${G - 16}L110 ${G - 26}V${G}Z"/><path d="M140 ${G}V${G - 34}L148 ${G - 28}L152 ${G - 38}L160 ${G - 30}V${G}Z"/><path d="M196 ${G}V${G - 18}L204 ${G - 24}L212 ${G - 14}V${G}Z"/></g>`;
    for (let i = 0; i < 9; i++) s += `<ellipse cx="${(90 + r() * 140).toFixed(0)}" cy="${G - 1}" rx="${(2 + r() * 4).toFixed(1)}" ry="2" fill="#2a2536"/>`;
    s += `<text x="160" y="${G + 26}" text-anchor="middle" fill="#6b6f80" font-size="10" font-style="italic">ruins in the fog</text>`;
  } else {
    if (lv >= 5) s += tower(48, 18, 54, true) + tower(254, 18, 54, true);
    s += wall(88, G - 34, 144, 34);
    if (lv >= 2) {
      s += wall(128, G - 88, 64, 88);
      s += gw(144, G - 66) + gw(176, G - 66) + gw(144, G - 40) + gw(176, G - 40) + (lv >= 4 ? gw(160, G - 70, 8, 14) : '');
    }
    if (lv >= 3) s += tower(72, 26, 74, lv >= 4) + tower(222, 26, 74, lv >= 4);
    else s += tower(80, 16, 46, false) + tower(224, 16, 46, false);
    if (lv >= 4) s += wall(149, G - 112, 22, 24) + cone(149, 22, G - 118, 30);
    if (lv >= 6) s += `<rect x="154" y="${G - 170}" width="12" height="52" fill="url(#${u}st)" stroke="#0b0a10" stroke-width=".8"/>` + cone(154, 12, G - 170, 26) + `<circle cx="160" cy="${G - 142}" r="5" fill="${win}" filter="url(#${u}g)"/><circle cx="160" cy="${G - 142}" r="3.5" fill="${win}"/>`;
    s += `<path d="M150 ${G}V${G - 16}Q160 ${G - 28} 170 ${G - 16}V${G}Z" fill="${lit ? '#ffb85c' : '#0a0810'}" ${lit ? `filter="url(#${u}g)"` : ''}/><path d="M150 ${G}V${G - 16}Q160 ${G - 28} 170 ${G - 16}V${G}Z" fill="${lit ? '#ffcf73' : '#07060b'}" opacity="${lit ? .8 : 1}"/><path d="M153 ${G - 16}V${G}M157 ${G - 21}V${G}M161 ${G - 22}V${G}M165 ${G - 20}V${G}M168 ${G - 15}V${G}M150 ${G - 8}H170" stroke="#1a1520" stroke-width="1"/>`;
    if (lv >= 5) { s += flag(85, G - 80 - 39) + flag(235, G - 80 - 39) + flag(160, G - 148);
      for (const x of [100, 140, 180, 220]) s += `<circle cx="${x}" cy="${G - 26}" r="4" fill="#ff9a3d" filter="url(#${u}g)"><animate attributeName="opacity" values=".6;1;.7;.95;.6" dur="1.7s" repeatCount="indefinite"/></circle><circle cx="${x}" cy="${G - 26}" r="1.6" fill="#ffe2a6"/>`; }
    else if (lv >= 3) s += flag(160, G - 88 - 7);
  }
  for (let i = 0; i < Math.min(cracks, 4); i++) { const x = 100 + i * 34 + r() * 10, y = G - 30 - r() * 40;
    s += `<path d="M${x} ${y}l4 6l-3 5l5 7l-2 6" fill="none" stroke="#ff5a3c" stroke-width="1.3" filter="url(#${u}g)"/><path d="M${x} ${y}l4 6l-3 5l5 7l-2 6" fill="none" stroke="#ffb199" stroke-width=".7"/>`; }
  for (let i = 0; i < 6; i++) s += `<ellipse cx="${(r() * 320).toFixed(0)}" cy="${(G - 4 + r() * 18).toFixed(0)}" rx="${(40 + r() * 50).toFixed(0)}" ry="${(5 + r() * 5).toFixed(0)}" fill="#8b8fa8" opacity="${(.05 + (6 - lv) * .015).toFixed(3)}"/>`;
  return s;
}
function bossSvg(cfg, color, { dead = false, tier = 1 } = {}) {
  const u = 'b' + (++SVGN), [, , eye, head, horns, wings] = cfg;
  const mirror = p => `<path d="${p}"/><path d="${p}" transform="translate(240 0) scale(-1 1)"/>`;
  let s = `<defs><radialGradient id="${u}a"><stop offset="0" stop-color="${color}" stop-opacity="${.25 + tier * .12}"/><stop offset=".6" stop-color="${color}" stop-opacity=".08"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241b30"/><stop offset="1" stop-color="#050408"/></linearGradient>
    <linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d1626"/><stop offset="1" stop-color="#09070d"/></linearGradient>
    <linearGradient id="${u}bn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7dfcf"/><stop offset="1" stop-color="#8f8676"/></linearGradient>
    <filter id="${u}g" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/></filter></defs>
    <g class="${dead ? 'boss-dead' : 'boss-live'}"><circle cx="120" cy="118" r="112" fill="url(#${u}a)"/>
    <g class="rune" style="transform-origin:120px 118px"><circle cx="120" cy="118" r="100" fill="none" stroke="${color}" stroke-opacity=".4"/><circle cx="120" cy="118" r="90" fill="none" stroke="${color}" stroke-opacity=".25" stroke-dasharray="2 6"/>`;
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, x1 = 120 + Math.cos(a) * 92, y1 = 118 + Math.sin(a) * 92, x2 = 120 + Math.cos(a) * (i % 3 ? 98 : 104), y2 = 118 + Math.sin(a) * (i % 3 ? 98 : 104); s += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${color}" stroke-opacity=".55"/>`; }
  s += `</g><g fill="url(#${u}w)" stroke="${color}" stroke-opacity=".35">`;
  if (wings === 'bat') s += mirror('M112 120C92 92 56 70 14 76C30 90 30 104 22 118C38 112 48 120 44 136C58 126 70 130 74 146C86 132 98 130 110 138Z');
  if (wings === 'tattered') s += mirror('M112 118C90 96 60 82 22 88L34 98L18 106L36 112L20 124L40 126L28 140L50 136L44 152L64 142L66 158L82 144L92 152L110 136Z');
  if (wings === 'feather') for (let i = 0; i < 7; i++) s += mirror(`M116 112C${96 - i * 10} ${70 + i * 9} ${60 - i * 6} ${54 + i * 13} ${20 + i * 4} ${54 + i * 15}C${54 - i * 2} ${70 + i * 13} ${86 - i * 5} ${92 + i * 8} 116 ${118 + i * 2}Z`);
  s += `</g><path d="M120 94C96 94 84 112 80 132C72 168 60 200 44 236H196C180 200 168 168 160 132C156 112 144 94 120 94Z" fill="url(#${u}b)" stroke="${color}" stroke-opacity=".45"/>
    <path d="M120 106V236" stroke="${color}" stroke-opacity=".3"/><path d="M98 120Q120 132 142 120" fill="none" stroke="${color}" stroke-opacity=".35"/>
    <circle cx="120" cy="150" r="10" fill="none" stroke="${color}" stroke-width="1.5" filter="url(#${u}g)"/><circle cx="120" cy="150" r="10" fill="none" stroke="${eye}"/><path d="M120 142V158M112 150H128" stroke="${eye}" stroke-opacity=".8"/>`;
  if (head === 'skull') s += `<path d="M120 54C99 54 93 68 95 84C97 94 104 98 106 106H134C136 98 143 94 145 84C147 68 141 54 120 54Z" fill="url(#${u}bn)"/><ellipse cx="111" cy="83" rx="6.5" ry="7" fill="#0a070c"/><ellipse cx="129" cy="83" rx="6.5" ry="7" fill="#0a070c"/><path d="M117 94L120 89L123 94Z" fill="#0a070c"/><path d="M110 101V106M115 101V107M120 101V107M125 101V107M130 101V106" stroke="#5a5246"/>`;
  else s += `<path d="M120 50C97 50 88 70 90 96C100 108 140 108 150 96C152 70 143 50 120 50Z" fill="url(#${u}b)" stroke="${color}" stroke-opacity=".5"/><ellipse cx="120" cy="86" rx="19" ry="17" fill="#030205"/>`;
  s += `<g fill="${color}" stroke="#0a070c" stroke-width=".6">`;
  if (horns === 'ram') s += mirror('M104 64C86 50 68 58 70 76C72 90 88 92 92 82C86 84 80 78 84 70C88 62 98 64 104 70Z');
  if (horns === 'spikes') s += mirror('M106 60L92 20L112 56Z') + '<path d="M114 52L120 8L126 52Z"/>';
  if (horns === 'crown') s += '<path d="M96 60L100 36L109 52L120 30L131 52L140 36L144 60Z"/><circle cx="120" cy="44" r="3" fill="' + eye + '"/>';
  if (horns === 'antlers') s += `</g><g fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round">` + mirror('M104 60C92 44 86 30 88 14M92 40C82 36 76 28 74 18M89 26C96 22 100 14 100 6');
  if (horns === 'halo') s += `</g><g fill="none" stroke="${eye}" stroke-width="2.5"><ellipse cx="120" cy="40" rx="28" ry="7" filter="url(#${u}g)"/><ellipse cx="120" cy="40" rx="28" ry="7" stroke-dasharray="40 6 60 4"/>`;
  s += `</g><g class="boss-eye"><ellipse cx="111" cy="${head === 'skull' ? 83 : 86}" rx="4.5" ry="2.6" fill="${eye}" filter="url(#${u}g)"/><ellipse cx="129" cy="${head === 'skull' ? 83 : 86}" rx="4.5" ry="2.6" fill="${eye}" filter="url(#${u}g)"/>
    <ellipse cx="111" cy="${head === 'skull' ? 83 : 86}" rx="2.6" ry="1.5" fill="#fff"/><ellipse cx="129" cy="${head === 'skull' ? 83 : 86}" rx="2.6" ry="1.5" fill="#fff"/></g>`;
  for (let i = 0; i < 10; i++) s += `<circle class="ember-p" style="--d:${(i * .7).toFixed(1)}s" cx="${40 + (i * 37) % 160}" cy="${150 + (i * 23) % 80}" r="${1 + (i % 3) * .6}" fill="${color}"/>`;
  if (dead) s += `<path d="M70 40L110 120L96 140L150 230" stroke="#ff5a3c" stroke-width="2" fill="none" filter="url(#${u}g)"/>`;
  return s + '</g>';
}
function sigilSvg(id, color) {
  const r = rng(seedOf(id)), n = 3 + Math.floor(r() * 5), rot = r() * 360;
  let s = `<circle cx="50" cy="50" r="44" fill="none" stroke="${color}" stroke-opacity=".5"/><circle cx="50" cy="50" r="36" fill="none" stroke="${color}" stroke-opacity=".25" stroke-dasharray="3 4"/><g transform="rotate(${rot.toFixed(0)} 50 50)">`;
  const pts = Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [50 + Math.cos(a) * 30, 50 + Math.sin(a) * 30]; });
  s += `<path d="M${pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L')}Z" fill="${color}" fill-opacity=".08" stroke="${color}" stroke-width="1.4"/>`;
  for (const [x, y] of pts) s += `<path d="M50 50L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${color}" stroke-opacity=".5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + r() * 2.5).toFixed(1)}" fill="${color}"/>`;
  if (r() < .5) s += `<circle cx="50" cy="50" r="${(10 + r() * 6).toFixed(1)}" fill="none" stroke="${color}" stroke-width="1.2"/>`;
  return s + `</g><ellipse cx="50" cy="50" rx="7" ry="4" fill="${color}"/><circle cx="50" cy="50" r="2.2" fill="#0a070c"/>`;
}
function mapSvg() {
  const u = 'm' + (++SVGN);
  let s = `<defs><radialGradient id="${u}sea" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#141026"/><stop offset="1" stop-color="#05040a"/></radialGradient>
    <linearGradient id="${u}land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241c2f"/><stop offset="1" stop-color="#15101d"/></linearGradient>
    <radialGradient id="${u}fog"><stop offset="0" stop-color="#9aa0b8" stop-opacity=".85"/><stop offset=".6" stop-color="#7b8098" stop-opacity=".55"/><stop offset="1" stop-color="#5a5f78" stop-opacity="0"/></radialGradient>
    <filter id="${u}b"><feGaussianBlur stdDeviation="5"/></filter><filter id="${u}g" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
    <rect width="360" height="300" fill="url(#${u}sea)"/>
    <path d="M40 60C70 26 140 18 190 26C250 20 320 40 336 92C350 140 340 196 314 236C286 278 220 290 160 286C96 284 40 270 22 222C6 180 18 142 26 110C30 90 30 74 40 60Z" fill="url(#${u}land)" stroke="#3a2f48" stroke-width="1.5"/>
    <path d="M40 60C70 26 140 18 190 26C250 20 320 40 336 92C350 140 340 196 314 236C286 278 220 290 160 286C96 284 40 270 22 222C6 180 18 142 26 110C30 90 30 74 40 60Z" fill="none" stroke="#d9a441" stroke-opacity=".15" stroke-width="5" filter="url(#${u}b)"/>`;
  for (const [a, b] of ROADS) { const A = REGIONS[a], Bq = REGIONS[b]; s += `<path d="M${A.x} ${A.y}L${Bq.x} ${Bq.y}" stroke="#d9a441" stroke-opacity=".22" stroke-dasharray="3 5"/>`; }
  for (const [sid, g] of Object.entries(REGIONS)) {
    const pct = regionPct(sid), st = stageOf(pct), beaten = R0().bosses[sid] || 0;
    s += `<g class="mreg" data-act="region" data-id="${sid}" role="button" tabindex="-1"><circle cx="${g.x}" cy="${g.y}" r="26" fill="${g.color}" opacity="${(.05 + pct / 250).toFixed(3)}" filter="url(#${u}g)"/>
      <circle cx="${g.x}" cy="${g.y}" r="15" fill="#0d0a14" stroke="${g.color}" stroke-opacity="${(.35 + pct / 160).toFixed(2)}" stroke-width="1.5"/>
      <path d="M${g.x - 8} ${g.y + 7}V${g.y - 1}h3v-3h2v3h6v-${3 + st}h2v-2h2v2h2v${3 + st}h6v-3h2v3h3v8Z" transform="translate(-6 0)" fill="${st >= 5 ? g.color : '#8a8296'}" opacity="${(.5 + st * .08).toFixed(2)}"/>
      ${beaten ? `<circle cx="${g.x + 12}" cy="${g.y - 12}" r="5" fill="#ff5a3c"/><text x="${g.x + 12}" y="${g.y - 9.5}" text-anchor="middle" font-size="7" font-weight="700" fill="#fff">${beaten}</text>` : ''}
      <text x="${g.x}" y="${g.y + 28}" text-anchor="middle" font-size="8.5" fill="#d8cfe0" opacity=".85">${g.name.replace('The ', '')}</text>
      <text x="${g.x}" y="${g.y + 38}" text-anchor="middle" font-size="7.5" fill="${g.color}">${pctTxt(pct)}% clear</text></g>`;
  }
  for (const [sid, g] of Object.entries(REGIONS)) { const fog = 1 - Math.min(1, regionPct(sid) / 100);
    s += `<g class="fog" opacity="${(fog * .95).toFixed(2)}" pointer-events="none"><circle cx="${g.x - 10}" cy="${g.y - 4}" r="44" fill="url(#${u}fog)" filter="url(#${u}b)"/><circle cx="${g.x + 14}" cy="${g.y + 8}" r="34" fill="url(#${u}fog)" filter="url(#${u}b)"/></g>`; }
  return s;
}
function chestSvg(type) {
  const c = CHESTS[type].color, u = 'k' + (++SVGN);
  return `<defs><linearGradient id="${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2b22"/><stop offset="1" stop-color="#1a120d"/></linearGradient><filter id="${u}g"><feGaussianBlur stdDeviation="3"/></filter></defs>
    <ellipse cx="40" cy="62" rx="30" ry="5" fill="${c}" opacity=".25" filter="url(#${u}g)"/>
    <rect x="12" y="30" width="56" height="30" rx="3" fill="url(#${u})" stroke="${c}" stroke-width="1.5"/><path d="M12 32Q12 14 40 14Q68 14 68 32Z" fill="url(#${u})" stroke="${c}" stroke-width="1.5"/>
    <path d="M24 18V60M56 18V60" stroke="${c}" stroke-width="3" opacity=".8"/><rect x="34" y="28" width="12" height="12" rx="2" fill="${c}"/><circle cx="40" cy="34" r="2" fill="#1a120d"/>
    <path d="M40 14V8" stroke="${c}" stroke-width="1.5" filter="url(#${u}g)"/>`;
}
function bannerSwatch(id) { const c = COSMETICS[id]; const w = h('span', { class: 'bsw', style: `--bc:${c.color}` }); w.append(icon(c.icon)); return w; }

/* ---------- views ---------- */
function realmHead() {
  const f = flame(), ft = flameTier(f.heat), rk = rank(), R = R0();
  return h('div', { class: 'rhead' },
    h('div', { class: 'rh-flame', style: `--fc:${ft[2]};--fs:${Math.min(1.6, .8 + f.heat / 40)}` }, h('span', { class: 'fl' }, icon('flame')), h('b', null, ft[1]), h('small', null, `${f.streak} day${f.streak === 1 ? '' : 's'} in a row · heat ${f.heat}`)),
    h('div', { class: 'rh-stat' }, h('b', null, R.shards.toLocaleString('en-GB')), h('small', null, 'shards')),
    h('button', { type: 'button', class: 'rh-stat', 'data-act': 'go', 'data-tab': 'rank' }, h('b', null, rk.name.split(' ')[0]), h('small', null, 'weekly rank')));
}
function vRealm() {
  const R = R0(), qs = todaysQuests(), allDone = qs.every(q => q.claimed), st = storyWeeks(), H = R.hunt, huntDone = H.last === dkey();
  const wkAgo = H.scores[addDays(-7)];
  return h('div', { class: 'stack realm' },
    hero('The Realm', 'The Hollow Reach', 'Nine regions lost to the Veil. Every truth you learn burns the fog away, raises your castles and arms you against the Heralds.'),
    realmHead(),
    realmProfileCard(),
    acc('realm-how', h('h2', null, 'How to play'), h('ol', { class: 'steps' },
      h('li', null, 'Tap a region on the map (or a name below it). Each region is one subject.'),
      h('li', null, 'Press "Burn back the fog" and answer questions. Every question you learn clears fog, and your castle there grows from ruins to a citadel.'),
      h('li', null, 'At 3%, 20% and 45% clear, the region\'s Herald (boss) wakes. Beat it with right answers for a Gold chest and a perk point.'),
      h('li', null, 'Every day: three contracts for shards, and one Hunt to beat your best score.'),
      h('li', null, 'Focus sets fill your chests and your weekly target unlocks the next story chapter.')), { open: !Object.keys(R.bound).length && !Object.keys(R.bosses).length }),
    h('section', { class: 'card rmap-card' }, svgWrap('rmap', 'Map of the nine regions. Fog covers what you have not learned yet.', mapSvg(), '0 0 360 300'),
      h('p', { class: 'muted xs' }, 'Tap a region to see its castle, its Herald and its creatures. The fog over each region is exactly what you have not learned there yet.'),
      h('div', { class: 'chips' }, Object.entries(REGIONS).map(([sid, g]) => chip([h('i', { class: 'sw', style: `background:${g.color}` }), g.name.replace('The ', ''), h('small', null, ` ${pctTxt(regionPct(sid))}%`)], false, 'region', { 'data-id': sid })))),
    card('Daily contracts', h('span', { class: 'muted' }, allDone ? 'All claimed' : `${qs.filter(q => q.claimed).length} of 3 claimed`),
      h('ul', { class: 'quests' }, qs.map(q => h('li', { class: q.claimed ? 'claimed' : q.done ? 'done' : '' },
        h('div', { class: 'grow' }, h('b', null, q.text), bar(q.v / q.need * 100), h('small', { class: 'muted' }, `${q.v} / ${q.need} · +${questReward()} shards`)),
        q.claimed ? h('span', { class: 'pill' }, 'Claimed') : q.done ? B('Claim', 'qClaim', 'primary sm', { 'data-i': q.i })
          : hasPerk('board') && !R.q.rer ? B('Swap', 'qSwap', 'ghost sm', { 'data-i': q.i }) : null))),
      h('p', { class: 'muted xs' }, 'Claim all three for a Silver chest. New contracts every day.')),
    card('The Hunt', h('span', { class: 'muted' }, huntDone ? 'Done for today' : 'One run a day'),
      h('p', { class: 'muted' }, '12 questions from everything, 3 lives. Combos multiply your score. Race your own ghost: your best run, question by question.'),
      h('div', { class: 'tiles' }, h('div', { class: 'tile' }, h('b', null, H.best.toLocaleString('en-GB')), h('span', null, 'best score')),
        h('div', { class: 'tile' }, h('b', null, H.scores[dkey()] != null ? H.scores[dkey()].toLocaleString('en-GB') : '–'), h('span', null, 'today')),
        h('div', { class: 'tile' }, h('b', null, wkAgo != null ? wkAgo.toLocaleString('en-GB') : '–'), h('span', null, 'a week ago'))),
      B([icon('play'), huntDone ? 'Hunted today. Back tomorrow' : 'Begin the Hunt'], 'huntGo', 'primary wide', { disabled: huntDone })),
    card('Chests', h('span', { class: 'muted' }, `${R.chests.length} unopened`),
      R.chests.length ? h('div', { class: 'chests' }, R.chests.map((c, i) => h('button', { type: 'button', class: 'chest', 'data-act': 'chestOpen', 'data-i': i, 'aria-label': `Open ${CHESTS[c].name}` },
        svgWrap('chest-art', '', chestSvg(c), '0 0 80 70'), h('small', null, CHESTS[c].name)))) : h('p', { class: 'muted' }, 'No chests waiting.'),
      h('ul', { class: 'how muted xs' }, h('li', null, `Iron: every 6 focus sets (${R.setsToChest}/6 so far)`), h('li', null, 'Silver: all three daily contracts'), h('li', null, 'Gold: slay a Herald'), h('li', null, 'Obsidian: hit your weekly set target (unlocks a story chapter)'))),
    card('The Chronicle', h('span', { class: 'muted' }, `Chapter ${st.chapters} of ${STORY.length}`),
      h('p', null, h('b', null, STORY[st.chapters - 1][0])), h('p', { class: 'muted xs' }, `This week: ${st.week.sets} of ${st.week.need} sets towards the next chapter.`), bar(st.week.sets / st.week.need * 100),
      B([icon('book'), 'Read the Chronicle'], 'go', 'ghost', { 'data-tab': 'story' })),
    h('div', { class: 'tools' },
      tilt(h('button', { type: 'button', class: 'tool', 'data-act': 'go', 'data-tab': 'bestiary' }, h('span', { class: 'lc-ic' }, icon('leaf')), h('b', null, 'Bestiary'), h('small', null, `${boundIds().length} creatures bound`))),
      tilt(h('button', { type: 'button', class: 'tool', 'data-act': 'go', 'data-tab': 'perks' }, h('span', { class: 'lc-ic' }, icon('gem')), h('b', null, 'Skill tree'), h('small', null, `${perkPoints().left} perk point${perkPoints().left === 1 ? '' : 's'} to spend`))),
      tilt(h('button', { type: 'button', class: 'tool', 'data-act': 'go', 'data-tab': 'vault' }, h('span', { class: 'lc-ic' }, icon('coin')), h('b', null, 'The Vault'), h('small', null, 'Spend shards on real rewards'))),
      tilt(h('button', { type: 'button', class: 'tool', 'data-act': 'go', 'data-tab': 'rank' }, h('span', { class: 'lc-ic' }, icon('crown')), h('b', null, 'Rank and forecast'), h('small', null, 'Your predicted grades')))));
}
function vRegion() {
  const sid = REGION_SEL, g = REGIONS[sid], R = R0(); if (!g) return vRealm();
  const pct = regionPct(sid), st = stageOf(pct), next = STAGES[st + 1], cfg = g.boss, nb = nextBossTier(sid), beaten = R.bosses[sid] || 0;
  const fixes = S.queue.filter(x => LEARN.trackOf(x.id) === sid), topics = regionTopics(sid), fc = forecast(SUBJ_BY[sid].subj);
  const tries = bossAttempts(sid);
  return h('div', { class: 'stack narrow realm' },
    subHero(SUBJ_BY[sid].name, g.name, 'realm', null, 'The Realm'),
    h('section', { class: 'card castle-card' }, svgWrap('castle', `Your castle: ${STAGES[st][1]}`, castleSvg(st, { color: g.color, banner: COSMETICS[R.banner].color, cracks: fixes.length }), '0 0 320 220'),
      h('div', { class: 'card-h' }, h('h2', null, STAGES[st][1]), h('span', { class: 'pill' }, `${pctTxt(pct)}% clear`)), bar(pct),
      h('p', { class: 'muted xs' }, next ? `${(next[0] - pct).toFixed(1)}% more fog to clear to raise the ${next[1]}. Every right answer here burns some away.` : 'A citadel. The fog cannot touch it.'),
      fixes.length > 0 && h('div', { class: 'crack-note' }, h('p', null, `${fixes.length} crack${fixes.length > 1 ? 's' : ''} in the walls. Get 3 right in a row on each to repair it:`),
        h('div', { class: 'chips' }, fixes.map(x => chip([icon('wrench'), LEARN.name(x.id)], false, 'fog', { 'data-id': sid, 'data-topic': x.id })))),
      h('div', { class: 'row' }, B([icon('flame'), 'Burn back the fog'], 'fog', 'primary', { 'data-id': sid }))),
    h('section', { class: 'card boss-card', style: `--bc:${g.color}` },
      svgWrap('boss-art' + (nb ? '' : ' slain'), cfg[0], bossSvg(cfg, g.color, { dead: !nb, tier: nb ? nb.t : 3 }), '0 0 240 240'),
      h('p', { class: 'eyebrow' }, 'Herald of the Unwritten King'), h('h2', { class: 'boss-name' }, cfg[0]), h('p', { class: 'muted' }, cfg[1]),
      h('div', { class: 'tiers' }, BOSS_TIER.map((n, i) => h('span', { class: 'pill' + (i < beaten ? ' won' : '') }, `${i < beaten ? '✓ ' : ''}${n}`))),
      !nb ? h('p', null, 'All three forms slain. The region is free.')
        : !nb.open ? h('p', { class: 'muted' }, `The ${BOSS_TIER[nb.t - 1]} form stirs at ${BOSS_REQ[nb.t - 1]}% clear. You are at ${pctTxt(pct)}%. Burn back the fog to wake it.`)
        : [h('p', { class: 'muted xs' }, `${BOSS_TIER[nb.t - 1]} form · ${BOSS_HP[nb.t - 1]} HP · you have ${3 + (hasPerk('wind') ? 1 : 0)} lives. Right answers strike; ${hasPerk('exec') ? 2 : 3} in a row strike twice. Wrong answers and "Show me" cost a life.`),
          B([icon('bolt'), tries > 0 ? `Challenge the ${BOSS_TIER[nb.t - 1]} form` : 'It is gathering strength. Return tomorrow'], 'bossGo', 'primary wide', { 'data-id': sid, disabled: tries <= 0 })]),
    card('Forecast', null, !fc ? h('p', { class: 'muted' }, `Do one ${SUBJ_BY[sid].subj} exam practice paper and a rough grade forecast appears here.`)
      : [h('p', null, `Rough estimate for ${SUBJ_BY[sid].subj}: `, h('b', null, `grade ${fc.grade}`), ` (${fc.est}%)`),
        h('p', { class: 'muted xs' }, `From your last ${fc.papers} exam practice paper${fc.papers > 1 ? 's' : ''} and what you have learned here. See Rank and forecast for how it works.`)]),
    card('Creatures of this region', h('span', { class: 'muted' }, `${topics.filter(id => stars(id) === 3).length} of ${topics.length} bound`), beastGrid(topics)));
}
function beastGrid(ids) {
  return h('div', { class: 'beasts' }, ids.map(id => {
    const c = creature(id), got = stars(id) === 3, col = RARITY[c.rarity];
    return h('button', { type: 'button', class: 'beast' + (got ? '' : ' locked'), 'data-act': 'fog', 'data-id': c.sid, 'data-topic': id, style: `--rc:${col}`, 'aria-label': got ? `${c.name}, ${c.rarity}, bound by mastering ${c.topic}` : `Unknown creature. Master ${c.topic} to bind it` },
      svgWrap('sigil', '', sigilSvg(id, got ? col : '#4a4458'), '0 0 100 100'), h('b', null, got ? c.name : '???'), h('small', null, got ? c.rarity : `Master: ${c.topic}`));
  }));
}
function vBestiary() {
  const g = guardians();
  return h('div', { class: 'stack realm' }, subHero('The Realm', 'Bestiary', 'realm', 'Master a topic (5 right in a row) and the creature that haunted it is bound to you. Rarer creatures guard harder kinds of topic. Master every topic in a region to bind its legendary Guardian.'),
    card('Legendary guardians', h('span', { class: 'muted' }, `${g.length} of 9`), h('div', { class: 'beasts' }, Object.entries(REGIONS).map(([sid, r]) => { const got = g.includes(sid);
      return h('div', { class: 'beast' + (got ? '' : ' locked'), style: `--rc:${RARITY.legendary}` }, svgWrap('sigil', '', sigilSvg('guardian' + sid, got ? RARITY.legendary : '#4a4458'), '0 0 100 100'), h('b', null, got ? `Guardian of ${r.name.replace('The ', '')}` : '???'), h('small', null, got ? 'legendary' : `Master all of ${SUBJ_BY[sid].name}`)); }))),
    Object.keys(REGIONS).map(sid => acc('beasts-' + sid, [h('h2', null, REGIONS[sid].name), h('span', { class: 'muted acc-r' }, `${regionTopics(sid).filter(id => stars(id) === 3).length}/${regionTopics(sid).length}`)], beastGrid(regionTopics(sid)))));
}
function vPerks() {
  const P = perkPoints(), branches = [...new Set(PERKS.map(p => p[1]))];
  return h('div', { class: 'stack narrow realm' }, subHero('The Realm', 'Skill tree', 'realm', 'Every Herald form you slay grants 1 perk point. There are 27 to earn and 15 needed to unlock everything, so spend them carefully.'),
    card('Perk points', h('span', { class: 'pill' }, `${P.left} to spend`), h('p', { class: 'muted xs' }, `${P.got} earned · ${P.spent} spent`)),
    branches.map(b => card(b, null, h('ol', { class: 'perks' }, PERKS.filter(p => p[1] === b).map(([id, , name, desc, cost, req]) => {
      const own = hasPerk(id), can = !own && P.left >= cost && (!req || hasPerk(req));
      return h('li', { class: own ? 'own' : can ? 'can' : 'locked' }, h('div', { class: 'grow' }, h('b', null, name), h('p', { class: 'muted xs' }, desc), req && !hasPerk(req) && !own ? h('small', { class: 'muted' }, `Needs ${PERKS.find(p => p[0] === req)[2]}`) : null),
        own ? h('span', { class: 'pill won' }, 'Learned') : B(`${cost} pt${cost > 1 ? 's' : ''}`, 'perkBuy', can ? 'primary sm' : 'ghost sm', { 'data-id': id, disabled: !can }));
    })))));
}
function vVault() {
  const R = R0(), D = DRAFT.vault || (DRAFT.vault = { name: '', cost: '' });
  return h('div', { class: 'stack narrow realm' }, subHero('The Realm', 'The Vault', 'realm', 'Set your own real-life rewards and what they cost. Earn the shards, then claim them. Make the big ones expensive: they mean more that way.'),
    card('Shards', h('span', { class: 'pill' }, R.shards.toLocaleString('en-GB')), h('p', { class: 'muted xs' }, 'About 60 to 100 shards is a strong day: contracts, the Hunt and a chest.')),
    card('Add a reward', null, field('Reward', h('input', { 'data-draft': 'vault.name', value: D.name, maxlength: 60, placeholder: 'e.g. An hour of gaming, takeaway Friday' })),
      field('Cost in shards', h('input', { type: 'number', inputmode: 'numeric', min: 1, 'data-draft': 'vault.cost', value: D.cost, placeholder: 'e.g. 150, 400, 1000' })), B([icon('plus'), 'Add to the Vault'], 'vaultAdd', 'primary')),
    card('Your rewards', null, R.vault.length ? h('ul', { class: 'list' }, R.vault.map(v => h('li', null, h('div', { class: 'grow' }, h('b', null, v.name), h('small', null, `${v.cost.toLocaleString('en-GB')} shards${v.n ? ` · claimed ${v.n}×` : ''}`)),
      B('Claim', 'vaultUse', R.shards >= v.cost ? 'primary sm' : 'ghost sm', { 'data-id': v.id, disabled: R.shards < v.cost }), B(icon('x'), 'vaultDel', 'ghost icon-only', { 'data-id': v.id, 'aria-label': `Remove ${v.name}` }))))
      : h('p', { class: 'muted' }, 'Nothing here yet. Add something you actually want.')),
    card('Wardrobe', null, h('p', { class: 'muted xs' }, 'Banners fly over every castle; titles show on your profile. Find more in chests.'),
      h('div', { class: 'chips' }, BANNERS.filter(b => R.owned[b[0]]).map(b => chip([bannerSwatch(b[0]), b[1]], R.banner === b[0], 'wearBanner', { 'data-id': b[0] }))),
      h('div', { class: 'chips' }, chip('No title', !R.title, 'wearTitle', { 'data-id': '' }), TITLES_R.filter(t => R.owned[t[0]]).map(t => chip([h('i', { class: 'sw', style: `background:${RARITY[t[2]]}` }), t[1]], R.title === t[0], 'wearTitle', { 'data-id': t[0] }))),
      h('p', { class: 'muted xs' }, `${Object.keys(R.owned).length} of ${Object.keys(COSMETICS).length} collected.`)));
}
function vStory() {
  const st = storyWeeks();
  return h('div', { class: 'stack narrow realm' }, subHero('The Realm', 'The Chronicle', 'realm', `A new chapter unlocks each week you finish at least ${st.week.need} focus sets (70% of your plan). The last chapter is the night of your mocks.`),
    STORY.map(([t, body], i) => i < st.chapters ? card(`Chapter ${i + 1}: ${t}`, null, h('p', { class: 'story' }, body))
      : h('section', { class: 'card locked-ch' }, h('b', null, `Chapter ${i + 1}`), h('p', { class: 'muted xs' }, i === st.chapters ? `Unlocks when you finish ${st.week.need} sets in a week (${st.week.sets} so far this week).` : 'Sealed.'))));
}
function vRank() {
  const rk = rank(), f = flame(), sub = SUBJ.map(s => [s, forecast(s), S.grades[s] || {}]);
  return h('div', { class: 'stack narrow realm' }, subHero('The Realm', 'Rank and forecast', 'realm'),
    card('Weekly rank', h('span', { class: 'pill' }, rk.name), h('p', { class: 'muted xs' }, 'Rated on the last 7 days: days active, questions answered, accuracy and sets. It goes down if you slack, and up when you show up.'),
      bar(rk.next ? (rk.score - WRANKS[rk.i][0]) / (rk.next[0] - WRANKS[rk.i][0]) * 100 : 100),
      h('p', { class: 'muted xs' }, rk.next ? `${rk.toNext} more point${rk.toNext === 1 ? '' : 's'} to reach ${rk.next[1]} (score ${rk.score}).` : `The highest rank (score ${rk.score}).`),
      h('ol', { class: 'ranks' }, WRANKS.map(([t, n], i) => h('li', { class: i === rk.i ? 'on' : i < rk.i ? 'past' : '' }, h('b', null, n), h('small', null, `${t}+`))))),
    card('Your flame', h('span', { class: 'pill' }, flameTier(f.heat)[1]), h('p', { class: 'muted xs' }, `Heat ${f.heat} · best ${Math.max(f.best, R0().stat.heatBest)} · ${f.streak} day streak. Each active day (a focus set, or 20 answers) adds heat. A missed day cools it by 40% rather than putting it out.${hasPerk('ward') ? ' Ember Ward shields one missed day a week.' : ''}`),
      h('ol', { class: 'ranks' }, FLAMES.map(([t, n, c]) => h('li', { class: f.heat >= t ? 'past' : '', style: `--fc:${c}` }, h('b', null, n), h('small', null, `${t}+ heat`))))),
    card('Grade forecast', null, h('p', { class: 'muted xs' }, 'A rough guide, not a prediction you can bank on. It needs at least one exam practice paper in the subject, then blends your last three paper scores (80%) with how much of the subject you have learned (20%), using approximate grade boundaries. Foundation Maths and Science stop at grade 5.'),
      h('div', { class: 'tbl' }, h('table', null, h('tr', null, h('th', null, 'Subject'), h('th', null, 'Report'), h('th', null, 'Forecast'), h('th', null, 'Target')),
        sub.map(([s, f, g]) => h('tr', null, h('td', null, h('i', { class: 'sw', style: `background:${SUBJ_COLOR[s]}` }), s), h('td', null, g.cur || '–'), h('td', { class: 'y' }, f ? `${f.grade} (${f.est}%)` : 'needs a paper'), h('td', null, g.tgt || '–')))))));
}
function vFog() {
  if (!FOG || !DR) return vRegion();
  const sid = FOG.sid, g = REGIONS[sid], pct = regionPct(sid), st = stageOf(pct), next = STAGES[st + 1], prevT = STAGES[st][0];
  return h('div', { class: 'stack narrow realm' },
    subHero(SUBJ_BY[sid].name, 'Burning the fog', 'region', null, g.name.replace('The ', '')),
    h('section', { class: 'card fog-card' + (FOG.hot ? ' hot' : ''), style: `--bc:${g.color}` },
      h('div', { class: 'fog-top' }, svgWrap('castle mini', STAGES[st][1], castleSvg(st, { color: g.color, banner: COSMETICS[R0().banner].color, cracks: S.queue.filter(x => LEARN.trackOf(x.id) === sid).length }), '0 0 320 220'),
        h('div', { class: 'grow' }, h('p', { class: 'eyebrow' }, STAGES[st][1]), h('b', { class: 'fog-pct' }, `${pct.toFixed(1)}% clear`),
          h('small', { class: 'muted' }, next ? `${(next[0] - pct).toFixed(1)}% more to raise the ${next[1]}` : 'Citadel complete'))),
      bar(next ? (pct - prevT) / (next[0] - prevT) * 100 : 100),
      h('p', { class: 'fog-msg' }, FOG.msg || (FOG.topic ? `Hunting one topic: ${LEARN.name(FOG.topic)}.` : 'Answer questions from this region. Every one you learn burns away a little fog.')),
      h('div', { class: 'fog-stats muted xs' }, h('span', null, `${FOG.n} answered`), h('span', null, `${FOG.right} right`), h('span', null, `+${FOG.burned.toFixed(2)}% burned this session`)),
      FOG.topic && B('Whole region instead', 'fog', 'link', { 'data-id': sid })),
    drillPanel());
}
function fightHud() {
  const hearts = h('div', { class: 'hearts', 'aria-label': `${RF.lives} lives left` }, Array.from({ length: RF.maxLives }, (_, i) => h('i', { class: i < RF.lives ? 'on' : '' })));
  return h('div', { class: 'hud' }, hearts, RF.log && h('span', { class: 'hud-log' }, RF.log));
}
function vBoss() {
  if (!RF || RF.kind !== 'boss') return vRealm();
  const g = REGIONS[RF.sid], max = BOSS_HP[RF.tier - 1];
  if (RF.over && DR.state === 'ask') return h('div', { class: 'stack narrow realm' },
    h('section', { class: 'card boss-card', style: `--bc:${g.color}` }, svgWrap('boss-art' + (RF.over === 'win' ? ' slain' : ''), RF.cfg[0], bossSvg(RF.cfg, g.color, { dead: RF.over === 'win', tier: RF.tier }), '0 0 240 240'),
      h('h2', { class: 'boss-name' }, RF.over === 'win' ? `${RF.cfg[0]} falls` : `${RF.cfg[0]} endures`),
      h('p', { class: 'muted' }, RF.over === 'win' ? `You slew its ${BOSS_TIER[RF.tier - 1]} form with ${RF.lives} li${RF.lives === 1 ? 'fe' : 'ves'} to spare. A Gold chest and a perk point are yours.` : `It had ${RF.hp} of ${max} HP left. Learn more of ${SUBJ_BY[RF.sid].name}, then return: every question you master makes the next fight easier.`),
      h('div', { class: 'row center' }, B('Back to the region', 'bossDone', 'primary'))));
  return h('div', { class: 'stack narrow realm' },
    h('section', { class: 'card boss-card fight', style: `--bc:${g.color}` }, svgWrap('boss-art small' + (RF.hit ? ' hit' : ''), RF.cfg[0], bossSvg(RF.cfg, g.color, { tier: RF.tier }), '0 0 240 240'),
      h('p', { class: 'eyebrow' }, `${BOSS_TIER[RF.tier - 1]} form`), h('h2', { class: 'boss-name' }, RF.cfg[0]),
      h('div', { class: 'hp', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': RF.hp, 'aria-label': 'Boss health' }, h('i', { style: `width:${RF.hp / max * 100}%` }), h('span', null, `${RF.hp} / ${max}`)),
      fightHud()),
    drillPanel(),
    h('div', { class: 'row center' }, B('Flee (counts as a loss)', 'bossFlee', 'link')));
}
function vHunt() {
  if (!RF || RF.kind !== 'hunt') return vRealm();
  const H = R0().hunt, ghost = H.trail[Math.min(RF.n, H.trail.length) - 1] || 0, ahead = RF.score - ghost;
  if (RF.over && DR.state === 'ask') return h('div', { class: 'stack narrow realm' },
    card('The Hunt is over', null, h('p', { class: 'big-score' }, RF.score.toLocaleString('en-GB')), h('p', { class: 'muted' }, RF.pb ? 'A new personal best. Your ghost just got faster.' : `Your best is ${H.best.toLocaleString('en-GB')}.`),
      h('p', null, `+${RF.shards} shards`), h('div', { class: 'row' }, B('Back to the Realm', 'huntDone', 'primary'))));
  return h('div', { class: 'stack narrow realm' },
    h('section', { class: 'card hunt-head' }, h('div', { class: 'card-h' }, h('h2', null, 'The Hunt'), h('span', { class: 'pill' }, `${Math.min(RF.n + 1, 12)} / 12`)),
      h('div', { class: 'tiles' }, h('div', { class: 'tile' }, h('b', null, RF.score.toLocaleString('en-GB')), h('span', null, 'score')),
        h('div', { class: 'tile' }, h('b', null, H.trail.length ? (ahead >= 0 ? '+' : '−') + Math.abs(ahead).toLocaleString('en-GB') : '–'), h('span', null, H.trail.length ? (ahead >= 0 ? 'ahead of your ghost' : 'behind your ghost') : 'no ghost yet'))),
      fightHud()),
    drillPanel());
}

/* ---------- actions ---------- */
let REGION_SEL = 'maths';
function startFight(kind, sid) {
  const lives = 3 + (hasPerk('wind') ? 1 : 0);
  RF = { kind, sid, n: 0, lives, maxLives: lives, log: '', over: null, score: 0, trail: [] };
  if (kind === 'boss') { const nb = nextBossTier(sid); Object.assign(RF, { tier: nb.t, hp: BOSS_HP[nb.t - 1], cfg: REGIONS[sid].boss }); }
  startDrill(kind === 'boss' ? sid : 'all', null, kind);
}
const REALMACT = {
  region(el) { REGION_SEL = el.dataset.id; go('region'); },
  fog(el) {
    const topic = el.dataset.topic || null, sid = el.dataset.id || (topic && LEARN.trackOf(topic));
    if (!REGIONS[sid]) return;
    REGION_SEL = sid; RF = null; FOG = { sid, topic, pct: regionPct(sid), burned: 0, n: 0, right: 0, msg: '', hot: false };
    startDrill(sid, topic, 'fog'); go('fog', DR.q && DR.q.kind === 'mcq' ? '#opt0' : '#ans');
  },
  qClaim(el) {
    const R = R0(), i = +el.dataset.i, q = todaysQuests()[i]; if (!q || !q.done || q.claimed) return;
    R.q.claimed[i] = true; R.shards += questReward(); R.stat.quests++;
    if (R.q.claimed.every(Boolean)) giveChest('silver', 'all daily contracts'); else toast(`+${questReward()} shards`);
    save(); render();
  },
  qSwap(el) {
    const R = R0(), i = +el.dataset.i; if (!hasPerk('board') || R.q.rer) return;
    const used = new Set(R.q.ids), pool = QUESTS.filter(q => !used.has(q[0]) && (q[0] !== 'fix1' || S.queue.length));
    R.q.ids[i] = pool[Math.floor(Math.random() * pool.length)][0]; R.q.rer = true; save(); render();
  },
  huntGo() { if (R0().hunt.last === dkey()) return; R0().hunt.last = dkey(); save(); startFight('hunt'); go('hunt', '#ans'); },
  huntDone() { RF = null; go('realm'); },
  bossGo(el) {
    const sid = el.dataset.id, nb = nextBossTier(sid); if (!nb || !nb.open || bossAttempts(sid) <= 0) return;
    const R = R0(), d = R.bossDay[sid]; R.bossDay[sid] = [dkey(), d && d[0] === dkey() ? d[1] + 1 : 1]; realmEv('boss'); save();
    startFight('boss', sid); go('boss', '#ans');
  },
  bossFlee() { if (!confirm('Flee? This attempt counts as a loss.')) return; RF.over = 'lose'; DR.state = 'ask'; render(); },
  bossDone() { const sid = RF.sid; RF = null; REGION_SEL = sid; go('region'); },
  chestOpen(el) { openChest(+el.dataset.i); render(); },
  perkBuy(el) { const p = PERKS.find(x => x[0] === el.dataset.id); if (!p || hasPerk(p[0]) || perkPoints().left < p[4] || (p[5] && !hasPerk(p[5]))) return; R0().perks[p[0]] = 1; save(); toast(`Perk learned: ${p[2]}`, 'big'); render(); },
  vaultAdd() {
    const D = DRAFT.vault, name = (D.name || '').trim(), cost = Math.round(+D.cost);
    if (!name) return toast('Name your reward'); if (!(cost >= 1)) return toast('Give it a shard cost');
    R0().vault.push({ id: 'v' + newId(), name: name.slice(0, 60), cost: Math.min(cost, 99999), n: 0 }); DRAFT.vault = { name: '', cost: '' }; save(); render();
  },
  vaultUse(el) { const R = R0(), v = R.vault.find(x => x.id === el.dataset.id); if (!v || R.shards < v.cost) return; if (!confirm(`Spend ${v.cost} shards on "${v.name}"?`)) return; R.shards -= v.cost; v.n++; save(); FXS.reveal('Reward claimed', v.name, 'You earned this. Enjoy it properly.'); render(); },
  vaultDel(el) { if (!confirm('Remove this reward?')) return; R0().vault = R0().vault.filter(x => x.id !== el.dataset.id); save(); render(); },
  wearBanner(el) { if (R0().owned[el.dataset.id]) { R0().banner = el.dataset.id; save(); render(); } },
  wearTitle(el) { if (!el.dataset.id || R0().owned[el.dataset.id]) { R0().title = el.dataset.id; save(); render(); } }
};
