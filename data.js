/* Archeron · static content. No user data lives here — grades are entered on-device only. */
'use strict';

const SUBJ = ['Maths', 'Science', 'English Language', 'English Literature', 'RE', 'Geography', 'Business'];
const SUBJ_COLOR = {
  'Maths': '#f06418', 'Science': '#1f9d55', 'English Language': '#2f6fe4',
  'English Literature': '#8a4fe0', 'RE': '#e0457f', 'Geography': '#0f9a94', 'Business': '#d93a3a'
};

/* Starting plan, keyed by weekday (0 = Sun). [time, label, sets, kind] — kind: train | rest | other */
const DEFAULT_PLAN = {
  1: [['15:30', 'Maths: 5-a-day + one topic', 2, 'train'], ['16:30', 'Tutoring', 0, 'other'], ['19:00', 'Science: Biology', 3, 'train']],
  2: [['15:30', 'Maths', 2, 'train'], ['16:30', 'Tutoring', 0, 'other'], ['19:00', 'English Lit: quotes + essay plan', 3, 'train']],
  3: [['15:30', 'Maths', 2, 'train'], ['16:30', 'Tutoring', 0, 'other'], ['19:00', 'Science: Chemistry', 3, 'train']],
  4: [['15:45', 'Maths past paper section + corrections', 4, 'train'], ['18:45', 'RE', 3, 'train']],
  5: [['15:45', 'English Language timed answers', 4, 'train'], ['Evening', 'Free evening: earned rest', 0, 'rest']],
  6: [['09:00', 'Full timed Maths paper + marking', 4, 'train'], ['11:30', 'Science: Physics', 3, 'train'], ['14:00', 'Geography', 2, 'train'], ['15:00', 'Business', 2, 'train'], ['Afternoon', 'Rest of the day off', 0, 'rest']],
  0: [['14:00', 'Mistakes list redo (all subjects)', 3, 'train'], ['15:45', 'Science past paper questions + plan the week', 2, 'train']]
};

const FINISHERS = ['Corbettmaths 5-a-day (Foundation)', '15 min flashcards', 'Homework done the day it was set'];
const RANKS = ['Initiate', 'Night Owl', 'Shadow', 'Sentinel', 'Warden', 'Legend'];
const INT = [0, 1, 2, 4, 8, 16];
const QTYPES = ['Recall', 'Calculation', 'Extended writing', 'Data / graphs', 'Application', 'Exam technique', 'Ran out of time'];

const DECKS = {
  mac: { name: 'Macbeth', cards: [
    ['"Fair is foul, and foul is fair"', 'The Witches: nothing is what it seems; sets up deception'],
    ['"brave Macbeth"', 'Captain: loyal hero at the start, so his fall is bigger'],
    ['"Stars, hide your fires"', 'Macbeth: hides his "black and deep desires"; ambition already there'],
    ['"too full o\'th\' milk of human kindness"', 'Lady Macbeth: thinks he is too gentle to kill'],
    ['"unsex me here"', 'Lady Macbeth: rejects womanhood to be ruthless; gender roles'],
    ['"look like th\'innocent flower, But be the serpent under\'t"', 'Lady Macbeth: deception; serpent links to the devil in Eden'],
    ['"vaulting ambition"', 'Macbeth: ambition is his only reason to kill Duncan'],
    ['"Is this a dagger which I see before me"', 'Macbeth: guilt + supernatural before the murder'],
    ['"Will all great Neptune\'s ocean wash this blood clean from my hand?"', 'Macbeth: instant overwhelming guilt'],
    ['"A little water clears us of this deed"', 'Lady Macbeth: dismisses guilt; contrast with later breakdown'],
    ['"full of scorpions is my mind"', 'Macbeth: power brings torment, not peace'],
    ['"Out, damned spot!"', 'Lady Macbeth: guilt destroys her mind; reverses "a little water"'],
    ['"a tale told by an idiot... signifying nothing"', 'Macbeth: ambition leaves him empty and hopeless'],
    ['"this dead butcher and his fiend-like queen"', 'Malcolm: how they end up seen; order restored']] },
  acc: { name: 'Christmas Carol', cards: [
    ['"squeezing, wrenching, grasping, scraping, clutching, covetous old sinner!"', 'Narrator, Stave 1: list of verbs piles up his greed'],
    ['"solitary as an oyster"', 'Narrator, Stave 1: isolated, closed off, maybe a pearl inside'],
    ['"Are there no prisons?"', 'Scrooge, Stave 1: cruel attitude of the rich to the poor'],
    ['"decrease the surplus population"', 'Scrooge, Stave 1: sees the poor as numbers; thrown back at him later'],
    ['"I wear the chain I forged in life"', 'Marley: your choices have consequences'],
    ['"Mankind was my business"', 'Marley: Dickens\'s message, we are responsible for each other'],
    ['"a golden one"', 'Belle, Stave 2: money replaced love as his idol'],
    ['"This boy is Ignorance. This girl is Want."', 'Ghost of Christmas Present: warning to society about poverty'],
    ['"God bless us, every one!"', 'Tiny Tim: goodness and hope despite poverty'],
    ['"I will honour Christmas in my heart, and try to keep it all the year"', 'Scrooge, Stave 4: his promise to change'],
    ['"as merry as a schoolboy"', 'Scrooge, Stave 5: redemption, reborn and childlike'],
    ['"as good a friend, as good a master, and as good a man"', 'Narrator, Stave 5: complete transformation']] },
  je: { name: "Journey's End", cards: [
    ['"To forget, you little fool – to forget! D\'you understand? To forget!"', 'Stanhope to Raleigh, Act 3: drink is how he copes with the horror. Check the wording in your copy.'],
    ['"If I went up those steps into the front line – without being doped with whisky – I\'d go mad with fright."', 'Stanhope to Osborne: the cost of the war on the best officer. Check the wording in your copy.'],
    ['"He\'s the finest officer in the battalion, and the men simply love him."', 'Raleigh\'s letter home, Act 2: hero-worship, and Stanhope\'s fear of being seen as he really is. Check the wording in your copy.'],
    ['"He\'s a long way the best company commander we\'ve got."', 'Osborne on Stanhope, Act 1: loyalty, and his steady, fatherly role. Check the wording in your copy.']],
    note: 'Four starter quotes. Check each one word for word against your own copy (a misquote can cost marks), then add the eight key moments with Add card.' },
  phy: { name: 'Physics equations', cards: [
    ['Weight', 'W = m × g  (N, kg, N/kg)'], ['Work done', 'W = F × s  (J, N, m)'], ['Spring force', 'F = k × e  (N, N/m, m)'],
    ['Speed', 'v = s ÷ t  (m/s, m, s)'], ['Acceleration', 'a = Δv ÷ t  (m/s², m/s, s)'], ['Resultant force', 'F = m × a  (N, kg, m/s²)'],
    ['Momentum', 'p = m × v  (kg m/s, kg, m/s)'], ['Kinetic energy', 'E = ½ m v²  (J, kg, m/s)'], ['Gravitational potential energy', 'E = m g h  (J, kg, N/kg, m)'],
    ['Power (energy)', 'P = E ÷ t  (W, J, s)'], ['Efficiency', 'useful output ÷ total input'], ['Charge', 'Q = I × t  (C, A, s)'],
    ['Potential difference', 'V = I × R  (V, A, Ω)'], ['Power (electrical)', 'P = V × I  (W, V, A)'], ['Power (resistance)', 'P = I² × R  (W, A, Ω)'],
    ['Energy transferred (power)', 'E = P × t  (J, W, s)'], ['Energy transferred (charge)', 'E = Q × V  (J, C, V)'], ['Density', 'ρ = m ÷ V  (kg/m³, kg, m³)'], ['Wave speed', 'v = f × λ  (m/s, Hz, m)']] },
  mat: { name: 'Maths formulas', cards: [
    ['Area of a rectangle', 'length × width'], ['Area of a triangle', '½ × base × height'], ['Area of a trapezium', '½ × (a + b) × height'],
    ['Area of a circle', 'π × r²'], ['Circumference', 'π × diameter'], ['Volume of a prism', 'area of cross-section × length'],
    ['Pythagoras', 'a² + b² = c²'], ['Speed', 'distance ÷ time'], ['Angles in a triangle', 'add up to 180°'], ['Angles on a straight line', 'add up to 180°'],
    ['Angles around a point', 'add up to 360°'], ['Interior angles of a polygon', '(n − 2) × 180°'], ['Percentage change', '(change ÷ original) × 100'], ['Compound interest', 'amount × (1 + r/100)ⁿ']] },
  vocab: { name: 'Descriptive words', cards: Object.values(typeof VOCAB !== 'undefined' ? VOCAB : {}).flatMap(([, t]) => t.trim().split('\n').map(l => l.split('|')).map(([w, m, e]) => [w, `${m}. e.g. ${e}`])), note: 'Say the meaning, then use the word in a sentence of your own before you flip.' },
  my: { name: 'My cards', cards: [], note: 'Your own deck. Add anything you keep forgetting.' }
};

/* Checklists. Each item is [label, practice topic id or null]. Keys mm…pa keep their original item order
   so older ticks migrate. type 'conf' = confidence rating, 'done' = simple tick. */
const LISTS = {
  mm: { name: 'Maths: must-know', subj: 'Maths', type: 'conf', items: [['Place value, rounding, decimal places', 'rounding'], ['Four operations without a calculator', 'bidmas'], ['Negative numbers', 'negatives'], ['Order of operations (BIDMAS)', 'bidmas'], ['Fractions: simplify, add, subtract, multiply, divide', 'frac-add'], ['Fractions, decimals, percentages conversions', 'pct-of'], ['Percentage of an amount', 'pct-of'], ['Factors, multiples, primes', null], ['Squares, cubes, square roots', null], ['Simplifying expressions', 'expand'], ['Substituting into formulas', 'substitute'], ['Solving simple equations', 'solve-1'], ['Sequences and the nth term', 'nth-term'], ['Ratio: simplify and share', 'ratio-share'], ['Perimeter and area of rectangles and triangles', 'area'], ['Angles on a line, around a point, in a triangle', 'angles'], ['Reading bar charts, pictograms, tables', null], ['Mean, median, mode, range', 'averages'], ['Probability basics', 'prob'], ['Time, money and unit conversions', null]] },
  mp: { name: 'Maths: push to a 4', subj: 'Maths', type: 'conf', items: [['Percentage increase and decrease', 'pct-incdec'], ['Simple and compound interest', 'compound'], ['Best buys and proportion', null], ['Expanding brackets and factorising', 'expand'], ['Equations with brackets / unknowns both sides', 'solve-2'], ['Inequalities', null], ['Straight line graphs, y = mx + c', null], ['Area of circles, trapeziums, compound shapes', 'circles'], ['Volume of prisms and cuboids', null], ['Angles in polygons and parallel lines', 'angles'], ['Pythagoras', 'pythag'], ['Speed, distance, time', 'sdt'], ['Standard form', 'std-form'], ['Index laws', null], ['Pie charts and scatter graphs', null], ['Transformations', null], ['Probability trees and Venn diagrams', 'prob']] },
  st: { name: 'Science topics', subj: 'Science', type: 'conf', items: [['B: Cells', 'b-cells'], ['B: Organisation', 'b-heart'], ['B: Infection and response', 'b-immune'], ['B: Bioenergetics', 'b-energy'], ['B: Homeostasis', 'b-hormones'], ['B: Inheritance and evolution', 'b-genes'], ['B: Ecology', 'b-ecology'], ['C: Atomic structure + periodic table', 'c-atoms'], ['C: Bonding', 'c-bonding'], ['C: Quantitative chemistry', 'cc-mr'], ['C: Chemical changes', 'c-reactions'], ['C: Energy changes', 'c-rates'], ['C: Rates and equilibrium', 'c-rates'], ['C: Organic chemistry', 'c-organic'], ['C: Chemical analysis', 'c-tests'], ['C: Atmosphere and resources', 'c-atmos'], ['P: Energy', 'pr-energy'], ['P: Electricity', 'pr-electric'], ['P: Particle model', 'pr-particles'], ['P: Atomic structure', 'pr-particles'], ['P: Forces', 'pr-forces-waves'], ['P: Waves', 'pr-forces-waves'], ['P: Magnetism', 'pr-forces-waves']] },
  bp: { name: 'Biology practicals', subj: 'Science', type: 'conf', items: [['Microscopy + magnification', 'bc-mag'], ['Osmosis (potato)', 'bc-osmosis'], ['Food tests', 'b-digestion'], ['Enzymes: pH and amylase', 'b-digestion'], ['Photosynthesis: light intensity', 'bc-mean'], ['Reaction time', null], ['Field investigation: quadrats', 'b-ecology']] },
  cp: { name: 'Chemistry practicals', subj: 'Science', type: 'conf', items: [['Making salts', 'c-reactions'], ['Neutralisation / titration (check with teacher)', 'c-reactions'], ['Electrolysis', 'c-reactions'], ['Temperature changes', 'c-rates'], ['Rates of reaction', 'cc-rate'], ['Chromatography + Rf', 'cc-rf'], ['Water purification', 'c-atmos']] },
  pp: { name: 'Physics practicals', subj: 'Science', type: 'conf', items: [['Specific heat capacity', 'pr-energy'], ['Resistance of a wire', 'p-ohm'], ['I-V characteristics', 'p-ohm'], ['Density', 'p-density'], ['Force and extension of a spring', 'p-spring'], ['Acceleration: force and mass', 'p-newton2'], ['Waves: ripple tank + string', 'p-wave'], ['Infrared radiation', 'pr-forces-waves']] },
  en: { name: 'English Literature', subj: 'English Literature', type: 'conf', items: [['Macbeth: plot', 'lit-macbeth'], ['Macbeth: characters', 'lit-macbeth'], ['Macbeth: themes', null], ['Macbeth: context', 'lit-macbeth'], ['Macbeth: key quotes', 'q-mac'], ['A Christmas Carol: plot', 'lit-acc'], ['A Christmas Carol: characters', 'lit-acc'], ['A Christmas Carol: themes', null], ['A Christmas Carol: context', 'lit-acc'], ['A Christmas Carol: key quotes', 'q-acc'], ["Journey's End: plot", 'lit-je'], ["Journey's End: characters", 'lit-je'], ["Journey's End: themes", null], ["Journey's End: context", 'lit-je'], ["Journey's End: key quotes", 'q-je'], ['Poetry: poets and poems', 'lit-poems'], ['Poetry: comparing two poems', null], ['Unseen poetry', null]] },
  el: { name: 'English Language', subj: 'English Language', type: 'conf', items: [['P1 Q1: list four things', 'el-papers'], ['P1 Q2: language analysis', 'el-devices'], ['P1 Q3: structure analysis', 'el-devices'], ['P1 Q4: evaluation', 'el-papers'], ['P1 Q5: descriptive or narrative writing', null], ['P2 Q1: true statements', 'el-papers'], ['P2 Q2: summary', 'el-papers'], ['P2 Q3: language analysis', 'el-devices'], ['P2 Q4: comparing perspectives', 'el-papers'], ['P2 Q5: viewpoint writing', null], ['Spelling, punctuation and grammar', null]] },
  gg: { name: 'Geography', subj: 'Geography', type: 'conf', items: [['Tectonic hazards', 'g-tectonics'], ['Weather hazards and tropical storms', 'g-weather'], ['Climate change', 'g-weather'], ['Ecosystems', 'g-living'], ['Tropical rainforests', 'g-living'], ['Hot deserts or cold environments', 'g-living'], ['Coasts', 'g-coasts-rivers'], ['Rivers', 'g-coasts-rivers'], ['Urban issues and challenges', 'g-urban'], ['Changing economic world', 'g-urban'], ['Resource management', 'g-urban'], ['Geographical skills and calculations', 'gc-data'], ['Fieldwork', null]] },
  bz: { name: 'Business', subj: 'Business', type: 'conf', items: [['Enterprise and entrepreneurs', 'bs-enterprise'], ['Business ownership', 'bs-enterprise'], ['Stakeholders', 'bs-enterprise'], ['Marketing mix', 'bs-marketing'], ['Market research and segmentation', 'bs-marketing'], ['Product life cycle', 'bs-marketing'], ['Production and quality', 'bs-ops-people'], ['Recruitment and training', 'bs-ops-people'], ['Motivation and pay', 'bs-ops-people'], ['Revenue, costs and profit', 'bz-profit'], ['Break-even', 'bz-breakeven'], ['Cash flow', 'bz-cash'], ['Sources of finance', 'bs-finance'], ['Profit margins and ARR', 'bz-margins'], ['External influences', 'bs-external']] },
  re: { name: 'RE', subj: 'RE', type: 'conf', items: [['Christianity: beliefs', 'r-chr-beliefs'], ['Christianity: practices', 'r-chr-practice'], ['Islam: beliefs', 'r-isl-beliefs'], ['Islam: practices', 'r-isl-practice'], ['Relationships and families', 'r-themes'], ['Religion and life', 'r-themes'], ['Peace and conflict', 'r-themes'], ['Crime and punishment', 'r-themes'], ['12-mark evaluation technique', null]] },
  pa: { name: 'Past papers', subj: 'All', type: 'done', items: [['Maths P1 (non-calc) set 1', null], ['Maths P2 (calc) set 1', null], ['Maths P3 (calc) set 1', null], ['Maths P1 set 2', null], ['Maths P2 set 2', null], ['Maths P3 set 2', null], ['Biology P1', null], ['Biology P2', null], ['Chemistry P1', null], ['Chemistry P2', null], ['Physics P1', null], ['Physics P2', null], ['English Language P1', null], ['English Language P2', null], ['English Lit P1 (Macbeth + ACC)', null], ["English Lit P2 (Journey's End + poetry)", null], ['Geography P1', null], ['Geography P2', null], ['Business P1', null], ['Business P2', null], ['RE P1', null], ['RE P2', null]] }
};
/* Original bat silhouette (inline paths, not a franchise mark) */
const BAT = 'M100 34 L95 20 L92 33 C80 31 70 23 60 8 C63 31 42 40 8 38 C30 50 36 64 33 82 C50 69 66 69 76 77 C81 66 90 62 100 75 C110 62 119 66 124 77 C134 69 150 69 167 82 C164 64 170 50 192 38 C158 40 137 31 140 8 C130 23 120 31 108 33 L105 20 Z';

/* Icons: Lucide v0.460.0 (lucide.dev), inlined as path data so the app stays offline; keys keep the app's own names.
   ISC License
   Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c)
   for Lucide are held by Lucide Contributors 2022.
   Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted,
   provided that the above copyright notice and this permission notice appear in all copies.
   THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED
   WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
   CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF
   CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE. */
const ICONS = {
  home: ['M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8', 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
  chart: ['M3 3v16a2 2 0 0 0 2 2h16', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
  cards: ['m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z', 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65'],
  check: ['m3 17 2 2 4-4', 'm3 7 2 2 4-4', 'M13 6h8', 'M13 12h8', 'M13 18h8'],
  wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M8 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0'],
  flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  bolt: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z',
  dumbbell: ['M14.4 14.4 9.6 9.6', 'M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z', 'm21.5 21.5-1.4-1.4', 'M3.9 3.9 2.5 2.5', 'M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z'],
  moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z',
  plus: ['M5 12h14', 'M12 5v14'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  up: 'm18 15-6-6-6 6',
  down: 'm6 9 6 6 6-6',
  back: 'm15 18-6-6 6-6',
  edit: ['M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z', 'm15 5 4 4'],
  play: 'M6 3L20 12L6 21L6 3z',
  pause: ['M15 4h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1z', 'M7 4h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1z'],
  reset: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
  skip: ['M5 4L15 12L5 20L5 4z', 'M19 5L19 19'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10L12 15L17 10', 'M12 15L12 3'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8L12 3L7 8', 'M12 3L12 15'],
  target: ['M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M6 12a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0'],
  trophy: ['M6 9H4.5a2.5 2.5 0 0 1 0-5H6', 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18', 'M4 22h16', 'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22', 'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22', 'M18 2H6v7a6 6 0 0 0 12 0V2Z'],
  grid: ['M4 3h5a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1v-5a1 1 0 0 1 1 -1z', 'M15 3h5a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1v-5a1 1 0 0 1 1 -1z', 'M15 14h5a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1v-5a1 1 0 0 1 1 -1z', 'M4 14h5a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1v-5a1 1 0 0 1 1 -1z'],
  lantern: ['M8 2h8l4 10H4L8 2Z', 'M12 12v6', 'M8 22v-2c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2H8Z'],
  scroll: ['M15 12h-5', 'M15 8h-5', 'M19 17V5a2 2 0 0 0-2-2H4', 'M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3'],
  hourglass: ['M5 22h14', 'M5 2h14', 'M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22', 'M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2'],
  calendar: ['M8 2v4', 'M16 2v4', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2z', 'M3 10h18'],
  gem: ['M6 3h12l4 6-10 13L2 9Z', 'M11 3 8 9l4 13 4-13-3-6', 'M2 9h20'],
  coin: ['M2 8a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M18.09 10.37A6 6 0 1 1 10.34 18', 'M7 6h1v4', 'm16.71 13.88.7.71-2.82 2.82'],
  feather: ['M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z', 'M16 8 2 22', 'M17.5 15H9'],
  shield: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
  map: ['M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z', 'M15 5.764v15', 'M9 3.236v15'],
  sparkle: 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
  leaf: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],
  flask: ['M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2', 'M8.5 2h7', 'M7 16h10'],
  ship: ['M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1', 'M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76', 'M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6', 'M12 10v4', 'M12 2v3'],
  crown: ['M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z', 'M5 21h14'],
  star: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z',
  gamepad: ['M6 11L10 11', 'M8 9L8 13', 'M15 12L15.01 12', 'M18 10L18.01 10', 'M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z'],
  compass: ['m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z', 'M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0'],
  book: ['M12 7v14', 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'],
  listen: 'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3',
  mark: ['M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1z', 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'm9 14 2 2 4-4'],
  curve: ['M3 3v16a2 2 0 0 0 2 2h16', 'M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7'],
  /* subject icons */
  pi: ['M9 4L9 20', 'M4 7c0-1.7 1.3-3 3-3h13', 'M18 20c-1.7 0-3-1.3-3-3V4'],
  dna: ['m10 16 1.5 1.5', 'm14 8-1.5-1.5', 'M15 2c-1.798 1.998-2.518 3.995-2.807 5.993', 'm16.5 10.5 1 1', 'm17 6-2.891-2.891', 'M2 15c6.667-6 13.333 0 20-6', 'm20 9 .891.891', 'M3.109 14.109 4 15', 'm6.5 12.5 1 1', 'm7 18 2.891 2.891', 'M9 22c1.798-1.998 2.518-3.995 2.807-5.993'],
  testtube: ['M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01a2.83 2.83 0 0 1 0-4L17 3', 'm16 2 6 6', 'M12 16H4'],
  atom: ['M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z', 'M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z'],
  booktext: ['M12 7v14', 'M16 12h2', 'M16 8h2', 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z', 'M6 12h2', 'M6 8h2'],
  pen: ['M12 20h9', 'M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z'],
  globe: ['M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0', 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20', 'M2 12h20'],
  briefcase: ['M12 12h.01', 'M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2', 'M22 13a18.15 18.15 0 0 1-20 0', 'M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2z'],
  scale: ['m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z', 'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z', 'M7 21h10', 'M12 3v18', 'M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2'],
  landmark: ['M3 22L21 22', 'M6 18L6 11', 'M10 18L10 11', 'M14 18L14 11', 'M18 18L18 11', 'M12 2L20 7L4 7z'],
  cpu: ['M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2z', 'M10 9h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z', 'M15 2v2', 'M15 20v2', 'M2 15h2', 'M2 9h2', 'M20 15h2', 'M20 9h2', 'M9 2v2', 'M9 20v2'],
  languages: ['m5 8 6 6', 'm4 14 6-6 2-3', 'M2 5h12', 'M7 2h1', 'm22 22-5-10-5 10', 'M14 18h6'],
  chat: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'M13 8H7', 'M17 12H7']
};
