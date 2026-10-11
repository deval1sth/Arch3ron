/* Archeron · static content. No user data lives here — grades are entered on-device only. */
'use strict';

const SUBJ = ['Maths', 'Science', 'English Language', 'English Literature', 'RE', 'Geography', 'Business'];
const SUBJ_COLOR = {
  'Maths': '#ffc83d', 'Science': '#4ade80', 'English Language': '#7aa2ff',
  'English Literature': '#c49bff', 'RE': '#f9a8d4', 'Geography': '#2dd4bf', 'Business': '#fb923c'
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
  je: { name: "Journey's End", cards: [], note: 'Add quotes from your own copy of the play, checked word for word. A misquote can cost marks, so this deck starts empty on purpose.' },
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
  my: { name: 'My cards', cards: [], note: 'Your own deck. Add anything you keep forgetting.' }
};

const LISTS = {
  mm: { name: 'Maths: must-know', items: ['Place value, rounding, decimal places', 'Four operations without a calculator', 'Negative numbers', 'Order of operations (BIDMAS)', 'Fractions: simplify, add, subtract, multiply, divide', 'Fractions, decimals, percentages conversions', 'Percentage of an amount', 'Factors, multiples, primes', 'Squares, cubes, square roots', 'Simplifying expressions', 'Substituting into formulas', 'Solving simple equations', 'Sequences and the nth term', 'Ratio: simplify and share', 'Perimeter and area of rectangles and triangles', 'Angles on a line, around a point, in a triangle', 'Reading bar charts, pictograms, tables', 'Mean, median, mode, range', 'Probability basics', 'Time, money and unit conversions'] },
  mp: { name: 'Maths: push to a 4', items: ['Percentage increase and decrease', 'Simple and compound interest', 'Best buys and proportion', 'Expanding brackets and factorising', 'Equations with brackets / unknowns both sides', 'Inequalities', 'Straight line graphs, y = mx + c', 'Area of circles, trapeziums, compound shapes', 'Volume of prisms and cuboids', 'Angles in polygons and parallel lines', 'Pythagoras', 'Speed, distance, time', 'Standard form', 'Index laws', 'Pie charts and scatter graphs', 'Transformations', 'Probability trees and Venn diagrams'] },
  bp: { name: 'Biology practicals', items: ['Microscopy + magnification', 'Osmosis (potato)', 'Food tests', 'Enzymes: pH and amylase', 'Photosynthesis: light intensity', 'Reaction time', 'Field investigation: quadrats'] },
  cp: { name: 'Chemistry practicals', items: ['Making salts', 'Neutralisation / titration (check with teacher)', 'Electrolysis', 'Temperature changes', 'Rates of reaction', 'Chromatography + Rf', 'Water purification'] },
  pp: { name: 'Physics practicals', items: ['Specific heat capacity', 'Resistance of a wire', 'I-V characteristics', 'Density', 'Force and extension of a spring', 'Acceleration: force and mass', 'Waves: ripple tank + string', 'Infrared radiation'] },
  st: { name: 'Science topics', items: ['B: Cells', 'B: Organisation', 'B: Infection and response', 'B: Bioenergetics', 'B: Homeostasis', 'B: Inheritance and evolution', 'B: Ecology', 'C: Atomic structure + periodic table', 'C: Bonding', 'C: Quantitative chemistry', 'C: Chemical changes', 'C: Energy changes', 'C: Rates and equilibrium', 'C: Organic chemistry', 'C: Chemical analysis', 'C: Atmosphere and resources', 'P: Energy', 'P: Electricity', 'P: Particle model', 'P: Atomic structure', 'P: Forces', 'P: Waves', 'P: Magnetism'] },
  pa: { name: 'Past papers', items: ['Maths P1 (non-calc) set 1', 'Maths P2 (calc) set 1', 'Maths P3 (calc) set 1', 'Maths P1 set 2', 'Maths P2 set 2', 'Maths P3 set 2', 'Biology P1', 'Biology P2', 'Chemistry P1', 'Chemistry P2', 'Physics P1', 'Physics P2', 'English Language P1', 'English Language P2', 'English Lit P1 (Macbeth + ACC)', "English Lit P2 (Journey's End + poetry)", 'Geography P1', 'Geography P2', 'Business P1', 'Business P2', 'RE P1', 'RE P2'] }
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
  trophy: ['M8 4h8v5a4 4 0 0 1-8 0z', 'M8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4', 'M12 13v4M8 21h8M9 17h6v4H9z']
};
