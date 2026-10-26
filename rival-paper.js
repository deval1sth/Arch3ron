/* Archeron Examinations: a locally generated cover for Onur's practice paper. */
(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const instructions = [
    'Use black ink.',
    'Answer all questions.',
    'Show your working where appropriate.',
    'The marks for each question are shown in brackets.'
  ];

  function node(tag, className, value) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (value != null) item.textContent = String(value);
    return item;
  }

  function svgNode(tag, className) {
    const item = document.createElementNS(SVG_NS, tag);
    if (className) item.setAttribute('class', className);
    return item;
  }

  function printable(value, fallback) {
    const result = value == null ? '' : String(value).trim();
    return result || fallback;
  }

  function examDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return printable(value, 'Date to be confirmed');
    const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3], 12));
    if (date.getUTCFullYear() !== +match[1] || date.getUTCMonth() !== +match[2] - 1 || date.getUTCDate() !== +match[3]) {
      return printable(value, 'Date to be confirmed');
    }
    const weekday = date.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
    const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    return weekday + ' ' + day;
  }

  function randomFor(seedText) {
    let seed = 2166136261;
    for (let i = 0; i < seedText.length; i++) seed = Math.imul(seed ^ seedText.charCodeAt(i), 16777619);
    if (!seed) seed = 1;
    return () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    };
  }

  function markRows(outOf, mark, subject, date) {
    const count = outOf >= 6 ? 6 : 5;
    const random = randomFor(subject + '|' + date);
    const maxima = Array(count).fill(Math.floor(outOf / count));
    const order = Array.from({ length: count }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (let i = 0; i < outOf % count; i++) maxima[order[i]]++;

    const remainingMax = Array(count + 1).fill(0);
    for (let i = count - 1; i >= 0; i--) remainingMax[i] = remainingMax[i + 1] + maxima[i];
    const awarded = [];
    let remaining = mark;
    for (let i = 0; i < count; i++) {
      const min = Math.max(0, remaining - remainingMax[i + 1]);
      const max = Math.min(maxima[i], remaining);
      const value = min + Math.floor(random() * (max - min + 1));
      awarded.push(value);
      remaining -= value;
    }
    return maxima.map((max, i) => ({ max, awarded: awarded[i] }));
  }

  function candidateDetails() {
    const box = node('section', 'rp-candidate');
    box.setAttribute('aria-label', 'Candidate details');
    box.appendChild(node('h2', 'rp-section-title', 'Candidate details'));
    const grid = node('div', 'rp-candidate-grid');
    [
      ['Candidate name', 'Onur', 'rp-candidate-name'],
      ['Candidate number', '0413', ''],
      ['Centre number', '52817', '']
    ].forEach(([label, value, extra]) => {
      const field = node('div', 'rp-candidate-field' + (extra ? ' ' + extra : ''));
      field.appendChild(node('span', 'rp-field-label', label));
      field.appendChild(node('span', 'rp-handwriting', value));
      grid.appendChild(field);
    });
    box.appendChild(grid);
    return box;
  }

  function instructionList() {
    const section = node('section', 'rp-instructions');
    section.appendChild(node('h2', 'rp-section-title', 'Instructions'));
    const list = node('ul', 'rp-instruction-list');
    instructions.forEach(text => list.appendChild(node('li', '', text)));
    section.appendChild(list);
    return section;
  }

  function markTable(outOf, mark, subject, date) {
    const section = node('section', 'rp-examiner');
    section.appendChild(node('h2', 'rp-section-title', "For examiner's use"));
    section.appendChild(node('p', 'rp-table-note', 'Record each question mark in red pen.'));

    const table = node('table', 'rp-mark-table');
    const head = node('thead');
    const headRow = node('tr');
    [['Question', 'rp-question-col'], ['Max marks', 'rp-max-col'], ['Mark awarded', 'rp-awarded-col']].forEach(([text, cls]) => {
      const cell = node('th', cls, text);
      cell.setAttribute('scope', 'col');
      headRow.appendChild(cell);
    });
    head.appendChild(headRow);
    table.appendChild(head);

    const body = node('tbody');
    const rows = markRows(outOf, mark, subject, date);
    rows.forEach((entry, i) => {
      const row = node('tr');
      const question = node('th', 'rp-question-label', 'Question ' + (i + 1));
      question.setAttribute('scope', 'row');
      row.appendChild(question);
      row.appendChild(node('td', 'rp-max-mark', String(entry.max)));
      row.appendChild(node('td', 'rp-awarded-mark rp-handwriting', String(entry.awarded)));
      body.appendChild(row);
    });
    table.appendChild(body);

    const foot = node('tfoot');
    const totalRow = node('tr');
    totalRow.appendChild(node('th', 'rp-total-label', 'Total'));
    totalRow.appendChild(node('td', 'rp-total-max', String(outOf)));
    totalRow.appendChild(node('td', 'rp-total-awarded rp-handwriting', String(mark)));
    foot.appendChild(totalRow);
    table.appendChild(foot);
    section.appendChild(table);
    return section;
  }

  function resultMark(mark, outOf, grade) {
    const result = node('section', 'rp-result');
    result.setAttribute('aria-label', 'Final mark and grade');
    const drawing = svgNode('svg', 'rp-score-drawing');
    drawing.setAttribute('viewBox', '0 0 174 106');
    drawing.setAttribute('role', 'img');
    drawing.setAttribute('aria-label', mark + ' out of ' + outOf + ' marks');
    const title = svgNode('title');
    title.textContent = 'Total mark: ' + mark + ' out of ' + outOf;
    drawing.appendChild(title);

    const ring = svgNode('path', 'rp-score-ring');
    ring.setAttribute('d', 'M35 25 C43 10 70 7 104 13 C134 18 151 34 148 56 C144 79 119 92 83 88 C52 85 27 69 29 48 C30 38 31 31 35 25 Z');
    ring.setAttribute('transform', 'rotate(-5 88 53)');
    drawing.appendChild(ring);
    const scoreText = svgNode('text', 'rp-score-text');
    scoreText.setAttribute('x', '87');
    scoreText.setAttribute('y', '59');
    scoreText.setAttribute('text-anchor', 'middle');
    scoreText.textContent = mark + ' / ' + outOf;
    drawing.appendChild(scoreText);
    const tick = svgNode('path', 'rp-score-tick');
    tick.setAttribute('d', 'M139 20 l7 7 13 -17');
    tick.setAttribute('transform', 'rotate(5 150 19)');
    drawing.appendChild(tick);

    result.appendChild(drawing);
    const gradeNote = node('div', 'rp-grade-note');
    gradeNote.appendChild(node('span', 'rp-grade-caption', 'Grade'));
    gradeNote.appendChild(node('strong', 'rp-grade-value rp-handwriting', grade));
    result.appendChild(gradeNote);
    return result;
  }

  function mount(el, info) {
    if (!el || typeof el.replaceChildren !== 'function') return;
    const data = info && typeof info === 'object' ? info : {};
    const subject = printable(data.subject, 'Subject');
    const paper = printable(data.paper, 'Practice paper');
    const grade = printable(data.grade, '—');
    const rawOutOf = Number(data.outOf);
    const outOf = Number.isFinite(rawOutOf) && rawOutOf > 0 ? Math.floor(rawOutOf) : 0;
    const rawMark = Number(data.mark);
    const mark = Math.min(outOf, Math.max(0, Number.isFinite(rawMark) ? Math.floor(rawMark) : 0));
    const dateText = examDate(data.date);

    const desk = node('div', 'rp-desk');
    const sheet = node('article', 'rp-sheet');
    const masthead = node('header', 'rp-masthead');
    masthead.appendChild(node('div', 'rp-board-name', 'Archeron Examinations'));
    masthead.appendChild(node('div', 'rp-document-type', 'Examination paper · Candidate copy'));
    sheet.appendChild(masthead);

    const identity = node('section', 'rp-paper-identity');
    identity.appendChild(node('div', 'rp-level', 'GCSE (9–1)'));
    identity.appendChild(node('h1', 'rp-subject', subject));
    identity.appendChild(node('p', 'rp-paper-name', paper));
    sheet.appendChild(identity);

    const meta = node('div', 'rp-meta');
    const time = node('div', 'rp-time-allowed');
    time.appendChild(node('span', 'rp-meta-label', 'Time allowed'));
    time.appendChild(node('strong', '', '1 hour 30 minutes'));
    meta.appendChild(time);
    const date = node('div', 'rp-date');
    date.appendChild(node('span', 'rp-meta-label', 'Exam date'));
    date.appendChild(node('strong', '', dateText));
    meta.appendChild(date);
    sheet.appendChild(meta);

    sheet.appendChild(candidateDetails());
    sheet.appendChild(instructionList());
    sheet.appendChild(markTable(outOf, mark, subject, String(data.date || '')));
    sheet.appendChild(resultMark(mark, outOf, grade));
    sheet.appendChild(node('footer', 'rp-footer', 'Check that your name and candidate number are shown above.'));

    desk.appendChild(sheet);
    el.replaceChildren(desk);
  }

  globalThis.RIVALPAPER = Object.freeze({ mount });
})();