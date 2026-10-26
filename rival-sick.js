// rival-sick.js – deterministic sick‑day generator for Onur
/* Exposes a single global constant RIVALSICK with three methods:
   - isSick('YYYY-MM-DD') → boolean
   - note('YYYY-MM-DD')   → short casual reason string
   - selfTest() → {ok: true|false, fails: []}
   All logic is deterministic, based on a simple hash of the date string.
*/
(function(){
  // Ensure a global window object exists in non‑browser runtimes
  if (typeof window === 'undefined') { window = {}; }
  // ----- deterministic 32‑bit hash (djb2‑like) -----
  function hashDate(str){
    /* FNV-1a plus a final mix: neighbouring dates give unrelated numbers, so sick days don't fall on a regular rhythm */
    var h = 2166136261;
    for(var i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
    return h >>> 0;
  }

  // ----- core rule helpers -----
  function toDate(str){
    // treat as UTC to avoid local‑timezone drift
    var parts = str.split('-');
    return new Date(Date.UTC(+parts[0], +parts[1]-1, +parts[2]));
  }

  function daysBetween(a,b){
    return Math.round((a - b)/(1000*60*60*24));
  }

  // ----- public API -----
  /* the day before, as YYYY-MM-DD */
  function prevDay(dateStr){ var d = toDate(dateStr); d.setUTCDate(d.getUTCDate()-1); return d.toISOString().slice(0,10); }
  /* 1 in 16 rolled; after the no-Saturday and no-two-in-a-row rules that comes to about 1 day in 20 */
  function rolled(dateStr){ return hashDate(dateStr) % 16 === 0; }
  function isSick(dateStr){
    if(!/^\d{4}-\d\d-\d\d$/.test(String(dateStr))) return false;
    if(!rolled(dateStr)) return false;
    // rule: never two days in a row (a rolled day after another rolled day stays healthy)
    if(rolled(prevDay(dateStr))) return false;

    var d = toDate(dateStr);
    // rule: never on Saturday (UTC 6)
    if(d.getUTCDay()===6) return false;

    // rule: never within 7 days of 2027‑01‑11
    var ref = new Date(Date.UTC(2027,0,11)); // month 0‑based
    if(Math.abs(daysBetween(d,ref))<7) return false;
    return true;
  }

  // ----- reasons, in Onur's texting voice (12+ entries) -----
  var REASONS = [
    "dentist then slept all afternoon",
    "migraine. screens hurt",
    "stomach bug. staying in bed",
    "flu. feel so rough",
    "lost my voice lol",
    "hay fever destroyed me today",
    "cold. sneezing nonstop",
    "laptop died, charger's at my cousin's",
    "didn't sleep at all last night. couldn't focus",
    "fever. mum said no screens",
    "sore throat, just sleeping",
    "headache all day. tomorrow tho"
  ];

  function note(dateStr){
    return REASONS[(hashDate(dateStr) >>> 5) % REASONS.length];
  }

  // ----- self‑test -----
  function selfTest(){
    var start = new Date(Date.UTC(2026,10,1)); // 2026‑11‑01 (month 10)
    var end   = new Date(Date.UTC(2027,0,31)); // 2027‑01‑31
    var ok = true;
    var fails = [];
    var prevSick = false;
    for(var d=start; d<=end; d.setUTCDate(d.getUTCDate()+1)){
      var iso = d.toISOString().slice(0,10);
      var sick = isSick(iso);
      // check consecutive rule
      if(sick && prevSick){
        ok = false;
        fails.push('consecutive sick on '+iso);
      }
      // check Saturday rule (redundant – isSick already handles)
      if(sick && d.getUTCDay()===6){
        ok = false;
        fails.push('sick on Saturday '+iso);
      }
      // check proximity to 2027‑01‑11
      var ref = new Date(Date.UTC(2027,0,11));
      if(sick && Math.abs(daysBetween(d,ref))<7){
        ok = false;
        fails.push('sick within 7 days of 2027‑01‑11 on '+iso);
      }
      prevSick = sick;
    }
    return {ok: ok, fails: fails};
  }

  // expose globally
  window.RIVALSICK = {isSick:isSick, note:note, selfTest:selfTest};
  // expose as global var for non‑browser runtimes
  var RIVALSICK = window.RIVALSICK;
  // If executed via cscript, output self‑test result for verification
  if (typeof WScript !== 'undefined') {
    var res = RIVALSICK.selfTest();
    var out = 'ok=' + res.ok + ';fails=' + (res.fails.length ? res.fails.join('|') : 'none');
    WScript.Echo(out);
  }
})();


