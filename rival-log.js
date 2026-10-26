/* rival-log.js – Log UI for Onur’s page (rival) */
/* Exposes a single global RIVALLOG with mount, entries, onChange */
/* All code wrapped in an IIFE to avoid polluting global scope */
(function(){
  const STORAGE_KEY = "archeron-rival";
  const LOG_KEY = "log";
  const callbacks = [];

  // utility: read the full storage object (or empty)
  function readStore(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch(e){ console.error("RIVALLOG storage read error", e); return {}; }
  }
  // utility: write only the log array back, preserving other keys
  function writeLog(logArray){
    const obj = readStore();
    obj[LOG_KEY] = logArray;
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
    catch(e){ console.error("RIVALLOG storage write error", e); }
  }
  // format a Date as YYYY-MM-DD (local date)
  function fmtDate(date){
    const d = date instanceof Date ? date : new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,"0");
    const dd = String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${dd}`;
  }
  // generate a unique id
  function genId(){
    return "l" + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  }
  // public API: get entries for a given date string (YYYY-MM-DD)
  function entries(dateStr){
    const store = readStore();
    const log = Array.isArray(store[LOG_KEY]) ? store[LOG_KEY] : [];
    return log.filter(e=>e.d===dateStr);
  }
  // public API: register a change callback
  function onChange(fn){
    if(typeof fn === "function") callbacks.push(fn);
  }
  // invoke callbacks after any mutation
  function trigger(){ callbacks.forEach(fn=>{ try{ fn(); }catch(e){ console.error(e); } }); }

  // UI helpers ---------------------------------------------------
  function create(tag,cls){ const el=document.createElement(tag); if(cls) el.className=cls; return el; }
  function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); }

  // render the whole card into container element
  function mount(container){
    const root = create("div","rl-card");
    const title = create("h2",null);
    title.textContent="Log outside study";
    root.appendChild(title);

    const list = create("div","rl-list");
    root.appendChild(list);

    // form for new entry
    const form = create("form","rl-form");
    form.innerHTML = `
      <input type="hidden" name="kind"/>
      <div class="rl-kinds">
        <button type="button" class="rl-chip" data-kind="paper">Paper</button>
        <button type="button" class="rl-chip" data-kind="revision">Revision</button>
        <button type="button" class="rl-chip" data-kind="classtest">Class test</button>
        <button type="button" class="rl-chip" data-kind="homework">Homework</button>
        <button type="button" class="rl-chip" data-kind="teach">Teach</button>
        <button type="button" class="rl-chip" data-kind="tutor">Tutor</button>
        <button type="button" class="rl-chip" data-kind="video">Video</button>
      </div>
      <label>Subject
        <select name="subj" required>
          <option value="maths">Maths</option>
          <option value="biology">Biology</option>
          <option value="chemistry">Chemistry</option>
          <option value="physics">Physics</option>
          <option value="englit">English Lit</option>
          <option value="englang">English Lang</option>
          <option value="geography">Geography</option>
          <option value="business">Business</option>
          <option value="re">RE</option>
          <option value="history">History</option>
          <option value="compsci">Computing</option>
          <option value="french">French</option>
          <option value="spanish">Spanish</option>
        </select>
      </label>
      <div class="rl-date">
        <button type="button" class="rl-chip" data-d="today">Today</button>
        <button type="button" class="rl-chip" data-d="yesterday">Yesterday</button>
        <button type="button" class="rl-chip" data-d="custom">Pick</button>
        <input type="date" name="d" class="rl-date-input" hidden/>
      </div>
      <label class="rl-minutes" hidden>Minutes
        <input type="number" name="min" min="1" max="240" placeholder="45"/>
      </label>
      <label class="rl-mark" hidden>Mark (out of)
        <input type="number" name="mark" min="0" placeholder="0"/>
        <input type="number" name="outOf" min="1" placeholder="80"/>
      </label>
      <label>Note
        <input type="text" name="note" maxlength="80" placeholder="Optional note"/>
      </label>
      <div class="rl-actions">
        <button type="submit" class="rl-btn rl-primary">Save</button>
        <button type="button" class="rl-btn rl-cancel" hidden>Cancel</button>
      </div>
      <div class="rl-note" hidden></div>
    `;
    root.appendChild(form);

    // helpers for kind chips
    const kindInput = form.querySelector("input[name='kind']");
    const kindChips = form.querySelectorAll('.rl-chip[data-kind]');
    kindChips.forEach(chip=>{
      chip.addEventListener('click',()=>{
        const sel = chip.dataset.kind;
        kindInput.value = sel;
        // activate visual
        kindChips.forEach(c=>c.classList.toggle('active', c===chip));
        updateFieldVisibility(sel);
      });
    });

    // date chips handling
    const dateInput = form.querySelector('input[name="d"]');
    const dateChips = form.querySelectorAll('.rl-chip[data-d]');
    const today = fmtDate(new Date());
    const yesterday = fmtDate(new Date(Date.now()-86400000));
    dateChips.forEach(chip=>{
      chip.addEventListener('click',()=>{
        const val = chip.dataset.d;
        dateChips.forEach(c=>c.classList.toggle('active', c===chip));
        if(val==='custom'){
          dateInput.hidden = false;
          // set limits last 14 days
          const max = today;
          const min = fmtDate(new Date(Date.now()-13*86400000));
          dateInput.min = min;
          dateInput.max = max;
          dateInput.value = '';
        } else {
          dateInput.hidden = true;
          dateInput.value = val==='today'? today : yesterday;
        }
      });
    });

    // field visibility based on kind
    function updateFieldVisibility(kind){
      const minutesLabel = form.querySelector('.rl-minutes');
      const markLabel = form.querySelector('.rl-mark');
      const minutesKinds = ['revision','tutor','video'];
      const markKinds = ['paper','classtest'];
      minutesLabel.hidden = !minutesKinds.includes(kind);
      markLabel.hidden = !markKinds.includes(kind);
    }

    // cancel button handling
    const cancelBtn = form.querySelector('.rl-cancel');
    cancelBtn.addEventListener('click',()=>{
      delete form.dataset.editId;
      delete form.dataset.editD;
      delete form.dataset.editAt;
      form.reset();
      // reset chips and date UI
      kindChips.forEach(c=>c.classList.remove('active'));
      dateChips.forEach(c=>c.classList.remove('active'));
      dateInput.hidden = true;
      cancelBtn.hidden = true;
      form.querySelector('button[type="submit"]').textContent = 'Save';
    });

    // render function to refresh list
    function render(){
      clear(list);
      const todayStr = fmtDate(new Date());
      const todays = entries(todayStr);
      if(todays.length===0){
        const empty = create('div','empty');
        empty.textContent='No entries today';
        list.appendChild(empty);
      }else{
        todays.forEach(entry=>{ list.appendChild(renderEntry(entry)); });
      }
    }

    // render a single entry row with readable labels
    const kindLabels = {paper:'Past paper',classtest:'Class test',revision:'Revision',teach:'Teach',video:'Video',tutor:'Tutor',homework:'Homework'};
    const subjLabels = {maths:'Maths',biology:'Biology',chemistry:'Chemistry',physics:'Physics',englit:'English Lit',englang:'English Lang',geography:'Geography',business:'Business',re:'RE',history:'History',compsci:'Computing',french:'French',spanish:'Spanish'};
    function renderEntry(entry){
      const item = create('div','rl-item');
      const meta = create('div','rl-meta');
      let text = `${kindLabels[entry.kind]||entry.kind} · ${subjLabels[entry.subj]||entry.subj}`;
      if(entry.min!==undefined){
        text += ` · ${entry.min} min`;
      }
      if(entry.mark!==undefined && entry.outOf!==undefined){
        const perc = Math.round(entry.mark/entry.outOf*100);
        text += ` · ${entry.mark}/${entry.outOf} (${perc}%)`;
      }
      meta.textContent = text;
      item.appendChild(meta);
      if(entry.note){
        const note = create('div','rl-note-small');
        note.textContent = entry.note;
        note.style.fontSize='12px';
        note.style.color='var(--dim)';
        item.appendChild(note);
      }
      const actions = create('div','rl-actions');
      const editBtn = create('button','rl-btn'); editBtn.textContent='Edit';
      const delBtn = create('button','rl-btn'); delBtn.textContent='Delete';
      // delete pending state
      let deletePending = false;
      let deleteTimer = null;
      delBtn.addEventListener('click',e=>{
        e.stopPropagation();
        if(deletePending){
          deleteEntry(entry.id);
        } else {
          deletePending = true;
          delBtn.textContent='Tap again to delete';
          delBtn.classList.add('rl-delete-pending');
          deleteTimer = setTimeout(()=>{
            deletePending = false;
            delBtn.textContent='Delete';
            delBtn.classList.remove('rl-delete-pending');
          },4000);
        }
      });
      editBtn.addEventListener('click',e=>{ e.stopPropagation(); populateForm(entry); });
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      item.appendChild(actions);
      return item;
    }

    function deleteEntry(id){
      const store = readStore();
      const log = Array.isArray(store[LOG_KEY]) ? store[LOG_KEY] : [];
      const newLog = log.filter(e=>e.id!==id);
      writeLog(newLog);
      render();
      trigger();
    }

    function populateForm(entry){
      // set values
      kindInput.value = entry.kind;
      kindChips.forEach(c=>c.classList.toggle('active', c.dataset.kind===entry.kind));
      form.subj.value = entry.subj;
      if(entry.min!==undefined) form.min.value = entry.min; else form.min.value = '';
      if(entry.mark!==undefined) form.mark.value = entry.mark; else form.mark.value = '';
      if(entry.outOf!==undefined) form.outOf.value = entry.outOf; else form.outOf.value = '';
      form.note.value = entry.note||'';
      // date handling – keep original
      form.dataset.editD = entry.d;
      form.dataset.editAt = entry.at;
      // set date UI to match entry.d (but disabled editing)
      dateInput.hidden = true;
      dateChips.forEach(c=>c.classList.remove('active'));
      // show a label instead of chips for edit mode
      // we keep chips unchanged; user can change date via chips if desired – spec says editing must KEEP original d and at, not reset, so we simply store and ignore UI changes for date when editing.
      // set field visibility
      updateFieldVisibility(entry.kind);
      // set edit flag
      form.dataset.editId = entry.id;
      // change save button text and show cancel
      const saveBtn = form.querySelector('button[type="submit"]');
      saveBtn.textContent = 'Save changes';
      cancelBtn.hidden = false;
    }

    form.addEventListener('submit',e=>{
      e.preventDefault();
      const data = new FormData(form);
      const kind = kindInput.value || data.get('kind');
      const subj = data.get('subj');
      const minRaw = data.get('min');
      const markRaw = data.get('mark');
      const outRaw = data.get('outOf');
      const note = (data.get('note')||'').trim();
      const d = form.dataset.editD || (form.querySelector('.rl-chip[data-d].active')? form.querySelector('.rl-chip[data-d].active').dataset.d==='today'? today : form.querySelector('.rl-chip[data-d].active').dataset.d==='yesterday'? yesterday : dateInput.value : today);
      const at = form.dataset.editAt ? parseInt(form.dataset.editAt,10) : Date.now();

      const entry = { id: form.dataset.editId || genId(), d, kind, subj, at };
      // minutes
      if(['revision','tutor','video'].includes(kind)){
        let min = parseInt(minRaw,10);
        if(isNaN(min) || min<1) min=1;
        if(min>120){ showNote('Revision capped at 120 min (2 hours)'); min=120; }
        entry.min = min;
        // caps for video per day
        if(kind==='video'){
          const dayEntries = entries(d).filter(e=>e.kind==='video');
          const total = dayEntries.reduce((sum,e)=>sum+(e.min||0),0)+min;
          if(total>60){ showNote('Video capped at 60 min per day'); entry.min = Math.max(0, 60 - (dayEntries.reduce((s,e)=>s+(e.min||0),0))); }
        }
        // caps for teach per day (max 2 entries)
        if(kind==='teach'){
          const teachCount = entries(d).filter(e=>e.kind==='teach').length + (form.dataset.editId?0:1);
          if(teachCount>2){ showNote('Teach limited to 2 entries per day'); return; }
        }
      }
      // marks
      if(['paper','classtest'].includes(kind)){
        let mark = parseInt(markRaw,10);
        let out = parseInt(outRaw,10);
        if(isNaN(mark)) mark=0;
        if(isNaN(out) || out<1) out=1;
        if(out>300){ out=300; showNote('outOf capped at 300'); }
        if(mark>out){ mark=out; showNote('mark capped at outOf'); }
        entry.mark = mark;
        entry.outOf = out;
      }
      if(note) entry.note = note;

      // persist
      const store = readStore();
      const log = Array.isArray(store[LOG_KEY]) ? store[LOG_KEY] : [];
      const without = log.filter(e=>e.id!==entry.id);
      without.push(entry);
      try{
        writeLog(without);
      }catch(e){
        showNote("Couldn't save: browser storage is full");
        return;
      }
      // cleanup
      delete form.dataset.editId;
      delete form.dataset.editD;
      delete form.dataset.editAt;
      form.reset();
      // reset UI
      kindChips.forEach(c=>c.classList.remove('active'));
      dateChips.forEach(c=>c.classList.remove('active'));
      dateInput.hidden = true;
      cancelBtn.hidden = true;
      const saveBtn = form.querySelector('button[type="submit"]');
      saveBtn.textContent = 'Save';
      render();
      trigger();
    });

    function showNote(msg){
      const noteDiv = form.querySelector('.rl-note');
      noteDiv.textContent = msg;
      noteDiv.hidden = false;
      setTimeout(()=>{ noteDiv.hidden = true; },3000);
    }

    // initial render
    render();
    // replace container content
    clear(container);
    container.appendChild(root);
  }

  // expose global
  window.RIVALLOG = { mount, entries, onChange };
})();
