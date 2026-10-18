/* Archeron · Higher tier practice papers, added to EXAMS (exam.js). Original questions in the style of AQA Higher papers, not real past papers.
   tier: 'H' papers are shown to students on the Higher tier and the Foundation papers (tier 'F') to everyone else; see paperFits in app.js.
   Same format as exam.js: [topic, question, [mark scheme points]], one point = one mark. */
'use strict';
for (const id of ['m1', 'm2', 'b1', 'b2', 'c1', 'c2', 'p1', 'p2']) { const p = EXAMS.find(e => e.id === id); if (p) p.tier = 'F'; }
EXAMS.push(
  { id: 'mh1', subj: 'Maths', tier: 'H', name: 'Maths Higher practice paper 1 (non-calculator)', mins: 50, qs: [
    ['Indices', 'Work out the value of 64^(2/3).', ['∛64 = 4 seen', '16']],
    ['Indices', 'Write 5⁻² as a fraction.', ['1/25']],
    ['Surds', 'Simplify √75 + √12.', ['√75 = 5√3 or √12 = 2√3 seen', '7√3']],
    ['Surds', 'Rationalise the denominator of 10/√5. Give your answer in its simplest form.', ['Multiplies top and bottom by √5, e.g. 10√5/5', '2√5']],
    ['Recurring decimals', 'Prove that 0.454545… (45 recurring) = 5/11.', ['Let x = 0.4545… and 100x = 45.4545…', '99x = 45', 'x = 45/99 = 5/11']],
    ['Algebra', 'Factorise 3x² + 10x − 8.', ['(3x ± a)(x ± b) with ab = 8', '(3x − 2)(x + 4)']],
    ['Algebra', 'Solve x² − 5x − 14 = 0.', ['(x − 7)(x + 2) = 0', 'x = 7 and x = −2']],
    ['Algebra', 'Write x² + 8x + 3 in the form (x + a)² + b.', ['(x + 4)² seen', '(x + 4)² − 13']],
    ['Algebra', 'Solve the simultaneous equations 3x + 2y = 16 and 2x − y = 6.', ['A correct method to remove one letter, e.g. 4x − 2y = 12 added to 3x + 2y = 16', 'x = 4', 'y = 2']],
    ['Functions', 'f(x) = 2x − 3 and g(x) = x². (a) Work out fg(3). (b) Find f⁻¹(x).', ['(a) g(3) = 9 seen', '(a) 15', '(b) f⁻¹(x) = (x + 3)/2']],
    ['Sequences', 'Find the nth term of the quadratic sequence 4, 9, 16, 25, 36, …', ['Second difference 2, so n² seen', 'n² + 2n + 1, or (n + 1)²']],
    ['Probability', 'A bag has 5 red and 3 blue sweets. Ali takes a sweet at random and eats it. He then takes another sweet at random. Work out the probability that both sweets are red.', ['5/8 × 4/7', '20/56 or 5/14']],
    ['Proportion', 'y is inversely proportional to x². When x = 2, y = 9. Work out y when x = 3.', ['y = k/x²', 'k = 36', 'y = 4']],
    ['Graphs', 'Line L has equation y = 2x + 1. Find the equation of the line that is perpendicular to L and passes through (4, 3).', ['Gradient −1/2', '3 = −1/2 × 4 + c, or c = 5', 'y = −1/2x + 5']],
    ['Circles', 'The point (−3, 4) lies on the circle x² + y² = 25. Find the equation of the tangent to the circle at (−3, 4).', ['Gradient of the radius −4/3', 'Gradient of the tangent 3/4', 'y = 3/4x + 25/4, or 4y = 3x + 25']],
    ['Inequalities', 'Solve x² − 2x − 15 < 0.', ['(x − 5)(x + 3), or critical values 5 and −3', '−3 < x < 5']],
    ['Algebra', 'Simplify fully (x² − 9)/(x² + x − 6).', ['(x + 3)(x − 3) seen', '(x + 3)(x − 2) seen', '(x − 3)/(x − 2)']],
    ['Algebra', 'Expand and simplify (x + 2)(x − 1)(x + 3).', ['Two brackets expanded correctly, e.g. x² + x − 2', 'x³ + 4x² + x − 6']]] },
  { id: 'mh2', subj: 'Maths', tier: 'H', name: 'Maths Higher practice paper 2 (calculator)', mins: 50, qs: [
    ['Percentages', 'In a sale, prices are reduced by 15%. A jacket costs £57.80 in the sale. Work out its price before the sale.', ['57.80 ÷ 0.85', '£68']],
    ['Compound interest', 'A car is bought for £18 000. It loses 12% of its value each year. Work out its value after 4 years. Give your answer to the nearest pound.', ['Multiplier 0.88', '18 000 × 0.88⁴', '£10 795']],
    ['Trigonometry', 'In triangle ABC, AB = 8.5 cm, AC = 11 cm and angle BAC = 47°. Work out the length of BC. Give your answer to 3 significant figures.', ['BC² = 8.5² + 11² − 2 × 8.5 × 11 × cos 47°', 'BC² = 65.7…', '8.11 cm']],
    ['Trigonometry', 'In triangle PQR, angle P = 38°, angle Q = 74° and QR = 9 cm. Work out the length of PR. Give your answer to 3 significant figures.', ['PR ÷ sin 74° = 9 ÷ sin 38°', 'PR = 9 × sin 74° ÷ sin 38°', '14.1 cm']],
    ['Trigonometry', 'A triangle has sides of 7 cm and 10 cm with an angle of 52° between them. Work out its area. Give your answer to 1 decimal place.', ['½ × 7 × 10 × sin 52°', '27.6 cm²']],
    ['Algebra', 'Solve 2x² + 5x − 4 = 0. Give your answers to 2 decimal places.', ['Correct use of the formula: (−5 ± √(5² − 4 × 2 × (−4))) ÷ 4', '√57 seen', 'x = 0.64 and x = −3.14']],
    ['Bounds', 'A rectangle has length 8.4 cm and width 5.2 cm, both correct to 1 decimal place. Work out the upper bound for its area.', ['8.45 and 5.25 seen', '44.3625 cm²']],
    ['Bounds', 'A car travels 250 km, correct to the nearest 10 km, in 3.2 hours, correct to 1 decimal place. Work out the lower bound for its average speed. Give your answer to 1 decimal place.', ['245 and 3.25 seen', '245 ÷ 3.25', '75.4 km/h']],
    ['Iteration', 'Use the iteration formula xₙ₊₁ = ∛(4 − xₙ) with x₀ = 1.5 to find x₃. Give your answer to 4 decimal places.', ['x₁ = 1.3572…', 'x₂ = 1.3825…', 'x₃ = 1.3781']],
    ['Similar shapes', 'Two similar cylinders have heights of 6 cm and 9 cm. The smaller cylinder has a volume of 160 cm³. Work out the volume of the larger cylinder.', ['Length scale factor 1.5', 'Volume scale factor 1.5³ = 3.375', '540 cm³']],
    ['Statistics', 'In a histogram, the bar for the class 20 < t ≤ 35 has a frequency density of 2.4. How many people are in this class?', ['Class width 15', '36']],
    ['Trigonometry', 'A cuboid measures 6 cm by 8 cm and is 5 cm high. Work out the angle between the longest diagonal and the base. Give your answer to 1 decimal place.', ['Base diagonal √(6² + 8²) = 10', 'tan θ = 5 ÷ 10', '26.6°']],
    ['Proportion', 'The time, t seconds, for a pendulum to swing is directly proportional to the square root of its length, L cm. When L = 64, t = 1.6. Work out t when L = 100.', ['t = k√L', 'k = 0.2', 't = 2']],
    ['Probability', 'The probability that Mia is late on any day is 0.2. Work out the probability that she is late on exactly one of two days.', ['0.2 × 0.8 seen', '0.2 × 0.8 + 0.8 × 0.2', '0.32']],
    ['Algebra', 'Solve the simultaneous equations y = x² − 3 and y = 2x.', ['x² − 3 = 2x', '(x − 3)(x + 1) = 0', 'x = 3, y = 6 and x = −1, y = −2']],
    ['Graphs', 'The graph of y = f(x) has a turning point at (2, −5). Write down the coordinates of the turning point of (a) y = f(x − 3) (b) y = −f(x).', ['(a) (5, −5)', '(b) (2, 5)']],
    ['Standard form', 'Work out (6.4 × 10⁷) ÷ (1.6 × 10⁻³). Give your answer in standard form.', ['4 × 10¹⁰']]] },

  { id: 'bh', subj: 'Science', tier: 'H', name: 'Biology Higher practice paper', mins: 40, qs: [
    ['Homeostasis', 'Name the hormone released by the pancreas when the blood glucose concentration is too low, and describe its effect.', ['Glucagon', 'The liver converts glycogen into glucose', 'Glucose is released into the blood']],
    ['Homeostasis', 'Explain how negative feedback keeps the level of thyroxine in the blood steady.', ['When thyroxine is low, the pituitary gland releases more TSH', 'TSH stimulates the thyroid gland to release thyroxine', 'When thyroxine is high, the release of TSH is inhibited', 'So the thyroxine level returns to normal']],
    ['Homeostasis', 'Describe the effects of adrenaline on the body.', ['Increases the heart rate', 'Boosts the delivery of oxygen and glucose to the brain and muscles', 'Prepares the body for fight or flight']],
    ['Homeostasis', 'Explain the roles of oestrogen and LH in the menstrual cycle.', ['Oestrogen makes the lining of the uterus build up (thicken)', 'High oestrogen stimulates the release of LH (and inhibits FSH)', 'LH stimulates the release of an egg (ovulation)']],
    ['Homeostasis', 'Describe how FSH and LH are used in IVF treatment.', ['The mother is given FSH and LH to make several eggs mature', 'The eggs are collected and fertilised by sperm in a laboratory', 'The fertilised eggs develop into embryos', 'One or two embryos are inserted into the mother\'s uterus']],
    ['Bioenergetics', 'A lamp is moved from 10 cm to 20 cm away from a plant. Use the inverse square law to describe how the light intensity at the plant changes.', ['The distance is doubled', 'Intensity ∝ 1/distance², so the intensity becomes a quarter (¼) of what it was']],
    ['Bioenergetics', 'Explain what an oxygen debt is, and how it is repaid after vigorous exercise.', ['Anaerobic respiration in muscles produces lactic acid', 'The oxygen debt is the extra oxygen needed to react with the lactic acid and remove it from cells', 'Lactic acid is carried in the blood to the liver', 'The liver converts it back into glucose']],
    ['Inheritance and evolution', 'In pea plants, the allele for tall (T) is dominant to the allele for short (t). Two heterozygous plants are crossed. Work out the expected ratio of tall to short offspring.', ['Parents Tt × Tt', 'Offspring TT, Tt, Tt and tt', '3 tall : 1 short']],
    ['Cell biology', 'A cell is 0.02 mm long. An image of it is 40 mm long. Work out the magnification of the image.', ['40 ÷ 0.02', '× 2000']],
    ['Organisation', 'Explain how the alveoli are adapted for efficient gas exchange.', ['Very large surface area', 'Thin walls (one cell thick), so a short diffusion distance', 'A good blood supply keeps a steep concentration gradient']],
    ['Infection and response', 'Explain how vaccination stops a person from becoming ill with a disease.', ['A small amount of a dead or inactive form of the pathogen is put into the body', 'White blood cells produce antibodies against it', 'If the live pathogen enters later, white blood cells quickly produce the right antibodies', 'The pathogen is destroyed before it can cause illness']],
    ['Ecology', 'Explain how decomposers help to recycle carbon.', ['Decomposers (bacteria and fungi) break down dead organisms and waste', 'They respire, releasing carbon dioxide into the atmosphere', 'Plants take in the carbon dioxide for photosynthesis']]] },

  { id: 'ch', subj: 'Science', tier: 'H', name: 'Chemistry Higher practice paper', mins: 40, qs: [
    ['Quantitative chemistry', 'Calculate the number of moles in 8.8 g of carbon dioxide, CO₂. (Relative atomic masses: C = 12, O = 16)', ['Mr of CO₂ = 44', '8.8 ÷ 44', '0.2 mol']],
    ['Quantitative chemistry', 'Calculate the mass of magnesium oxide made when 6 g of magnesium burns completely. 2Mg + O₂ → 2MgO (Relative atomic masses: Mg = 24, O = 16)', ['Moles of Mg = 6 ÷ 24 = 0.25', 'Moles of MgO = 0.25 (1 : 1 ratio)', 'Mass = 0.25 × 40 = 10 g']],
    ['Quantitative chemistry', 'How many atoms are in 0.5 mol of sodium? (Avogadro constant = 6.02 × 10²³ per mole)', ['0.5 × 6.02 × 10²³', '3.01 × 10²³']],
    ['Chemical changes', 'Write the half equation for the reaction at the negative electrode when molten lead bromide is electrolysed.', ['Pb²⁺ + 2e⁻ → Pb']],
    ['Chemical changes', 'Write the half equation for the formation of chlorine at the positive electrode during the electrolysis of sodium chloride solution.', ['2Cl⁻ → Cl₂ + 2e⁻ (or 2Cl⁻ − 2e⁻ → Cl₂)']],
    ['Chemical changes', 'Write the ionic equation for the neutralisation of an acid by an alkali.', ['H⁺ + OH⁻ → H₂O']],
    ['Chemical changes', 'Zinc reacts with copper sulfate solution: Zn + Cu²⁺ → Zn²⁺ + Cu. Explain, in terms of electrons, which species is oxidised and which is reduced.', ['Zinc atoms are oxidised: they lose electrons', 'Copper ions are reduced: they gain electrons']],
    ['Chemical changes', 'Explain why a strong acid has a lower pH than a weak acid of the same concentration.', ['A strong acid is completely ionised in water', 'A weak acid is only partially ionised', 'So the strong acid has a higher concentration of H⁺ ions']],
    ['Chemical changes', 'The pH of an acid solution changes from 3 to 1. By what factor has the concentration of hydrogen ions changed?', ['Each decrease of 1 in pH is a 10 times increase in H⁺ concentration', 'It has increased by a factor of 100']],
    ['Energy changes', 'Bond energies in kJ/mol: H–H 436, Cl–Cl 243, H–Cl 432. Calculate the overall energy change for H₂ + Cl₂ → 2HCl.', ['Energy to break bonds = 436 + 243 = 679 kJ', 'Energy released making bonds = 2 × 432 = 864 kJ', '679 − 864 = −185 kJ/mol']],
    ['Rates', 'The reaction N₂ + 3H₂ ⇌ 2NH₃ is exothermic in the forward direction. Predict and explain the effect of increasing the pressure on the yield of ammonia.', ['The yield increases', 'The equilibrium shifts to the side with fewer molecules of gas', 'There are 2 molecules on the right and 4 on the left']],
    ['Rates', 'For the same reaction, predict and explain the effect of increasing the temperature on the yield of ammonia.', ['The yield decreases', 'The forward reaction is exothermic', 'A higher temperature favours the endothermic (reverse) reaction']],
    ['Rates', 'Explain, in terms of particles, why increasing the concentration of an acid increases the rate of its reaction with magnesium.', ['More acid particles in the same volume', 'So collisions happen more often', 'More successful collisions per second']],
    ['Organic chemistry', 'Decane, C₁₀H₂₂, is cracked to produce octane, C₈H₁₈, and one other product. Write a balanced equation for the reaction and name the other product.', ['C₁₀H₂₂ → C₈H₁₈ + C₂H₄', 'Ethene (an alkene)']],
    ['Chemical analysis', 'On a chromatogram a spot has moved 3.6 cm and the solvent front has moved 8.0 cm. Calculate the Rf value of the spot.', ['3.6 ÷ 8.0', '0.45']],
    ['Atmosphere', 'Explain how carbon dioxide in the atmosphere causes the Earth\'s temperature to rise.', ['Short-wavelength radiation from the Sun passes through the atmosphere', 'The Earth\'s surface gives out longer-wavelength (infrared) radiation', 'Carbon dioxide absorbs this radiation and re-emits it, warming the atmosphere']]] },

  { id: 'ph', subj: 'Science', tier: 'H', name: 'Physics Higher practice paper', mins: 40, qs: [
    ['Forces', 'Calculate the momentum of a 1200 kg car moving at 15 m/s.', ['p = m × v', '18 000 kg m/s']],
    ['Forces', 'A 0.5 kg trolley moving at 4 m/s hits a stationary 1.5 kg trolley and they move off together. Calculate their velocity after the collision.', ['Momentum before = 0.5 × 4 = 2 kg m/s', 'Total mass after = 2 kg', 'v = 2 ÷ 2 = 1 m/s']],
    ['Forces', 'State the principle of conservation of momentum.', ['In a closed system', 'the total momentum before an event equals the total momentum after it']],
    ['Magnetism', 'A wire carrying a current of 2.5 A is at right angles to a magnetic field with a flux density of 0.4 T. The length of wire in the field is 0.15 m. Calculate the force on the wire.', ['F = B × I × l', '0.4 × 2.5 × 0.15', '0.15 N']],
    ['Magnetism', 'Describe how Fleming\'s left-hand rule is used to find the direction of the force on a current-carrying wire in a magnetic field.', ['First finger points along the magnetic field (north to south)', 'Second finger points along the current', 'Thumb shows the direction of the force (motion)']],
    ['Forces', 'A car accelerates uniformly from 5 m/s to 25 m/s over a distance of 150 m. Calculate its acceleration.', ['v² − u² = 2as', '625 − 25 = 2 × a × 150', 'a = 2 m/s²']],
    ['Forces', 'Explain why a skydiver reaches a terminal velocity.', ['As speed increases, air resistance increases', 'So the resultant force (and the acceleration) decreases', 'Eventually air resistance equals weight', 'The resultant force is zero, so the velocity stays constant']],
    ['Waves', 'A sound wave has a frequency of 250 Hz and a wavelength of 1.36 m. Calculate its speed.', ['v = f × λ', '340 m/s']],
    ['Electricity', 'Explain why the National Grid transmits electricity at a very high potential difference.', ['Step-up transformers increase the potential difference', 'This reduces the current for the same power', 'So less energy is wasted heating the cables', 'Which makes the system more efficient']],
    ['Particle model', 'Calculate the energy needed to melt 0.5 kg of ice at 0 °C. (Specific latent heat of fusion of ice = 334 000 J/kg)', ['E = m × L', '0.5 × 334 000', '167 000 J']],
    ['Radioactivity', 'A sample has a half-life of 6 hours. Its count rate starts at 800 counts per minute. Work out the count rate after 18 hours, and the net decline as a ratio.', ['18 ÷ 6 = 3 half-lives', '800 → 400 → 200 → 100 counts per minute', 'Final : initial = 1 : 8']],
    ['Energy', 'A 60 kg student runs up stairs 4.5 m high in 6 s. Calculate the useful power. (g = 9.8 N/kg)', ['E = m × g × h = 60 × 9.8 × 4.5 = 2646 J', 'P = E ÷ t = 2646 ÷ 6', '441 W']]] }
);
Object.assign(EXAM_LINK, {
  'Maths|Indices': ['h-ind', 'h-fracind'], 'Maths|Surds': ['h-surd', 'h-rat'], 'Maths|Recurring decimals': ['h-recur'], 'Maths|Functions': ['h-func'], 'Maths|Proportion': ['h-prop'],
  'Maths|Graphs': ['h-perp', 'h-transf'], 'Maths|Inequalities': ['h-qineq'], 'Maths|Trigonometry': ['h-trig', 'h-sine', 'h-cosine', 'h-areasin', 'h-3d'], 'Maths|Bounds': ['h-bounds'],
  'Maths|Iteration': ['h-iter'], 'Maths|Similar shapes': ['h-simsh'], 'Maths|Statistics': ['h-histo']
});
for (const [k, ids] of [['Maths|Algebra', ['h-dbl', 'h-fact', 'h-quad', 'h-sim', 'h-fact2', 'h-ctsq', 'h-qform', 'h-algfrac', 'h-expand3', 'h-simq']], ['Maths|Sequences', ['h-qseq']],
  ['Maths|Probability', ['h-cond']], ['Maths|Circles', ['h-circle']], ['Maths|Percentages', ['h-revpct']]]) EXAM_LINK[k] = [...new Set([...(EXAM_LINK[k] || []), ...ids])];
