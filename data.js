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

const ICONS = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  chart: 'M3 20h18M6 16v-5M11 16V6M16 16v-8M21 16v-3',
  cards: ['M8 3h11a2 2 0 0 1 2 2v12', 'M5 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z'],
  check: ['M10 6h11M10 12h11M10 18h11', 'M3 6l1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17'],
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
  flame: 'M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 2 2 2 2S10 6 12 3z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  dumbbell: ['M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12'],
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  up: 'M6 15l6-6 6 6',
  down: 'M6 9l6 6 6-6',
  back: 'M15 6l-6 6 6 6',
  edit: ['M4 20h4L19 9l-4-4L4 16z', 'M13.5 6.5l4 4'],
  play: 'M7 4l13 8-13 8z',
  pause: 'M7 4v16M17 4v16',
  reset: ['M4 12a8 8 0 1 0 2.3-5.7', 'M4 4v4h4'],
  skip: ['M5 5l10 7-10 7z', 'M19 5v14'],
  download: ['M12 3v12', 'M7 10l5 5 5-5', 'M4 21h16'],
  upload: ['M12 21V9', 'M7 14l5-5 5 5', 'M4 3h16'],
  target: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  trophy: ['M8 4h8v5a4 4 0 0 1-8 0z', 'M8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4', 'M12 13v4M8 21h8M9 17h6v4H9z'],
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  lantern: ['M9 3h6M12 3v2', 'M8 7h8l-1 11H9z', 'M7 18h10', 'M12 10v4'],
  scroll: ['M7 4h11a2 2 0 0 1 0 4H7', 'M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8', 'M9 12h6M9 16h4'],
  hourglass: ['M6 3h12M6 21h12', 'M7 3v3a5 5 0 0 0 10 0V3', 'M7 21v-3a5 5 0 0 1 10 0v3'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v4M16 3v4'],
  gem: ['M6 3h12l3 6-9 12L3 9z', 'M3 9h18', 'M9 3l3 6 3-6'],
  coin: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 8v8', 'M9 10h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15'],
  feather: ['M20 4C12 4 6 10 6 18v2', 'M6 18l8-8', 'M10 9h6', 'M8 13h5'],
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  map: ['M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z', 'M9 4v14M15 6v14'],
  sparkle: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  leaf: ['M5 19c0-8 6-14 14-14 0 8-6 14-14 14z', 'M5 19l7-7'],
  flask: ['M9 3h6', 'M10 3v6L5 18a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3', 'M7.5 15h9'],
  ship: ['M3 16l2 5h14l2-5z', 'M12 3v13', 'M12 4l6 9h-6', 'M12 7l-5 6h5'],
  crown: 'M3 8l4 4 5-7 5 7 4-4-2 11H5z',
  star: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.3-5.5-2.9-5.5 2.9 1-6.3L3 9.7l6.2-.9z',
  gamepad: ['M6 9h12a4 4 0 0 1 0 8c-1.5 0-2.5-1-3.5-2h-5c-1 1-2 2-3.5 2a4 4 0 0 1 0-8z', 'M8 12v2M7 13h2', 'M15.5 12.5h.01M17.5 13.5h.01'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M15.5 8.5l-2 5-5 2 2-5z'],
  book: ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z', 'M4 19V5']
};
