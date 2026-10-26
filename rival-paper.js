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
    // Candidate box
    const cand=document.createElement("div");
    cand.className="rp-candidate";
    cand.textContent="Candidate: __________________________";
    sheet.appendChild(cand);
    // Instructions area (placeholder)
    const instr=document.createElement("div");
    instr.className="rp-instructions";
    instr.textContent="Instructions: Read each question carefully. Answer in the answer booklet.";
    sheet.appendChild(instr);
    // Paper info
    const paper=document.createElement("div");
    paper.className="rp-paperinfo";
    paper.innerHTML=`<strong>${info.subject}</strong> – ${info.paper}`;
    sheet.appendChild(paper);
    // Score badge (red‑pen circle)
    const badge=document.createElement("div");
    badge.className="rp-badge";
    const perc=Math.round(info.mark/info.outOf*100);
    badge.innerHTML=`<span class="rp-mark">${info.mark}/${info.outOf}</span><br/><span class="rp-grade">Grade ${info.grade}</span>`;
    sheet.appendChild(badge);
    // Date line
    const dateEl=document.createElement("div");
    dateEl.className="rp-date";
    dateEl.textContent="Date: "+toDate(info.date);
    sheet.appendChild(dateEl);
    root.appendChild(sheet);
    // Clear container and attach
    while(container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(root);
  }
  window.RIVALPAPER={mount};
})();
