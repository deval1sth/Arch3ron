// rival-paper.js – fake GCSE exam paper cover UI
/* Exposes global RIVALPAPER with a single mount(el, info) function */
(function(){
  const toDate = d=>{
    const dt=new Date(d);
    const y=dt.getFullYear();
    const m=String(dt.getMonth()+1).padStart(2,"0");
    const dd=String(dt.getDate()).padStart(2,"0");
    return `${y}-${m}-${dd}`;
  };
  // escape HTML to avoid code injection
  function esc(str){
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  // grid of 80 cells, red‑pen marks up to total
  function createGrid(total){
    const grid=document.createElement('div');
    grid.className='rp-grid';
    const cells=Math.min(total,80);
    for(let i=0;i<cells;i++){
      const cell=document.createElement('div');
      cell.className='rp-cell rp-marked';
      grid.appendChild(cell);
    }
    for(let i=cells;i<80;i++){
      const cell=document.createElement('div');
      cell.className='rp-cell';
      grid.appendChild(cell);
    }
    return grid;
  }
  function mount(container, info){
    // info: {subject, paper, mark, outOf, grade, date}
    const root=document.createElement("div");
    root.className="rp-card";
    const sheet=document.createElement("div");
    sheet.className="rp-sheet";
    // Header
    const header=document.createElement("h2");
    header.textContent="Archeron Examinations";
    header.className="rp-header";
    sheet.appendChild(header);
    // Candidate box – Onur's details in handwriting style
    const cand=document.createElement("div");
    cand.className="rp-candidate rp-hand";
    cand.textContent="Onur Runo – Centre 123456 – No. 7890";
    sheet.appendChild(cand);
    // Instructions area (placeholder)
    const instr=document.createElement("div");
    instr.className="rp-instructions";
    instr.textContent="Instructions: Read each question carefully. Answer in the answer booklet.";
    sheet.appendChild(instr);
    // Paper info
    const paper=document.createElement("div");
    paper.className="rp-paperinfo";
    paper.innerHTML=`<strong>${esc(info.subject)}</strong> – ${esc(info.paper)}`;
    sheet.appendChild(paper);
    // Score badge (hand‑drawn red‑pen circle)
    const badge=document.createElement("div");
    badge.className="rp-badge";
    badge.innerHTML=`<span class="rp-mark">${info.mark}/${info.outOf}</span><br/><span class="rp-grade">Grade ${esc(info.grade)}</span>`;
    sheet.appendChild(badge);
    // Date line – formatted like 11 Jan 2027
    const dateEl=document.createElement("div");
    dateEl.className="rp-date";
    const dObj=new Date(info.date);
    const options={day:'numeric', month:'short', year:'numeric'};
    dateEl.textContent=`Date: ${dObj.toLocaleDateString(undefined, options)}`;
    sheet.appendChild(dateEl);
    // Examiner's grid – red‑pen marks adding to total
    const grid=createGrid(info.mark);
    sheet.appendChild(grid);
    root.appendChild(sheet);
    // Clear container and attach
    while(container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(root);
  }
  window.RIVALPAPER={mount};
})();
