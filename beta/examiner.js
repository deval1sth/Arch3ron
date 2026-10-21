/* Archeron · Be the examiner. A student's answer, the mark scheme, and you mark it; then you see how an examiner marked it,
   with every mark (and every lost mark) pinned to the words that earned it. Knowing what earns marks is the quickest way to
   stop losing them, and almost no revision app teaches it.
   Answers are written in a markup the marking is read from, so the examiner's mark can never disagree with the annotations:
     [[2|text]]    this text earns mark-scheme point 2 (1-based; [[1,2|text]] earns both)
     [[x|text]]    this text is wrong or earns nothing; its note is the next entry in `xs`
     [[+|text]]    a strength in a levels-marked answer; its note is the next entry in `plus`
   Point schemes: `pts` (+ `any` = most marks from them), `n` = one note per point, `em` = examiner mark when a rule overrides
   the count (a wrong extra answer cancelling a right one). Levels schemes: `lv` = [lo, hi, description] top level first,
   `look` / `has` = what examiners look for and what this answer shows, `mark`, `why`. `lvOnly` asks for the level alone.
   Every script is original. The marking follows how GCSE mark schemes generally work; real schemes differ in detail by board. */
'use strict';
const EX_RULES = {
  method: ['Method marks', 'Working earns marks even when the final answer is wrong, but only when the method itself is right.'],
  implied: ['A right answer speaks for itself', 'In most calculations a correct final answer gets full marks even without working, unless the question says “show your working”.'],
  nowork: ['Working is your safety net', 'A wrong answer with no working scores 0. One correct line of working can rescue a mark.'],
  early: ['Round at the end', 'Rounding part-way through can cost the accuracy mark. Keep every digit until the last line.'],
  reason: ['Reasons in words', '“Give a reason” means writing the fact, e.g. “angles in a triangle add up to 180°”, not just the sum.'],
  list: ['One answer means one answer', 'Extra or alternative answers can cancel right ones. Give the number asked for and cross out the rest.'],
  convert: ['Convert first', 'Put units into the same form before calculating: 30 minutes is 0.5 hours, not 0.30.'],
  sense: ['Sense-check it', 'Ask whether the answer could be true. An Rf value over 1, or one person getting more than the total, means a slip.'],
  vague: ['Say exactly what you mean', '“It”, “stuff”, “the brain of the computer” or “how much it sells” earn nothing. Name the thing and give the precise idea.'],
  terms: ['Use the key word', 'Some marks hang on one word: “denatured” not “dies”, “more frequent” not “more”, “bleached” not “turns red”.'],
  energy: ['Energy is never made', 'Energy is transferred or released. “Makes energy” or “produces energy” is rejected by every exam board.'],
  data: ['Quote the data', 'When a question gives you numbers, use them, with units, in your answer.'],
  fairtest: ['Name the control variable', '“Make it a fair test” earns nothing. Say what you keep the same, and how.'],
  repeat: ['Don’t repeat the question', '“Explain” wants the reason. “It has a high melting point because it needs lots of energy to melt” goes round in a circle.'],
  command: ['Read the command word', 'Describe: say what happens. Explain: say why. Give or state: a short answer. Each one earns different things.'],
  compare: ['Both sides', 'A difference or a comparison needs both things described in the same terms. An example is not a description.'],
  develop: ['Develop every point', 'A point is worth more once you say why it matters: the point, then “because” or “so”, then the consequence.'],
  specific: ['Be specific', 'Named places, dates and figures earn marks general statements can’t. “An earthquake” is not a named example.'],
  apply: ['Apply it', 'An answer that would fit any business is capped. Use the business’s name and details from the question.'],
  evaluate: ['Make a judgement', '“Should…?”, “Evaluate” and “Do you agree?” need a decision with a reason. Both sides with no conclusion stays in the middle levels.'],
  units: ['Units', 'If the question gives the unit, the number is enough. If it says “give the unit”, there is a mark for it.'],
  source: ['Use the source asked for', 'When a question asks for sacred writings or a source, a mark is kept for it. No reference, no mark.'],
  enough: ['Short can be enough', '“Give two” and “state” questions want short, correct answers, not paragraphs.'],
  text: ['Only what’s in the text', 'Information questions reward what the extract says. Anything you add yourself scores nothing, however likely it is.'],
  effect: ['Effect beats labels', 'Naming a technique earns little. Zoom in on a word and explain what it makes the reader think or feel.'],
  context: ['Link the context', 'A history fact on its own earns little. Use it to explain why the writer wrote it that way.'],
  level: ['Levels: best fit', 'Long answers are read as a whole, matched to the level that fits best, then placed high or low within it.'],
  showthat: ['Show every step', 'In a “show that” question the answer is given, so every mark is for the working. Writing the answer again earns nothing.'],
  accuracy: ['Give the accuracy asked for', '“To 1 decimal place” or “to 3 significant figures” is part of the answer. Too many digits loses the accuracy mark.'],
  simplify: ['Simplify only when asked', 'An unsimplified fraction like 8/10 is fine unless the question says “simplest form”.'],
  format: ['Answer in the form asked', 'A probability is a fraction, decimal or percentage, never a ratio. A percentage needs the × 100.'],
  translate: ['Every word counts', 'In a translation, tense, agreement and small words like “le” or “muy” each carry marks.'],
  retell: ['Analyse, don’t retell', 'Retelling the story earns almost nothing. Every sentence should say how or why the writer does something.']
};
/* English Literature essays are marked in six levels; this is our own summary of how each one reads */
const EX_LIT = [[6, 6, 'Convincing and critical: judicious quotes, analysis of methods with subject terms, context woven into the argument.'],
  [5, 5, 'Thoughtful and developed: well-chosen quotes, examines the effects of methods, context used to explain.'],
  [4, 4, 'Clear: relevant quotes, explains the effects of methods, clear links to context.'],
  [3, 3, 'Explained: some quotes, explains some effects, some awareness of context.'],
  [2, 2, 'Supported: references used, methods identified, simple comments on effects.'],
  [1, 1, 'Simple: general references and simple comments.']];
const EX_LITLOOK = ['A relevant, well-chosen quotation', 'Names the writer’s method', 'Explains the effect of specific words', 'Context linked to the writer’s purpose'];
const EX_SRC = { storm: ['Source: an extract from a short story', 'The storm arrived without apology. It shouldered the house, rattled every window in its frame and moaned along the chimney like something lost. Inside, the candle flinched, and Ada pulled her blanket up to her chin, counting the seconds between each flash and the thunder that followed.'],
  market: ['Source: an extract from a novel', 'By seven the market was already shouting. Crates of oranges glowed like small suns against the grey morning, and a man with a voice like a foghorn sold fish that nobody could see beneath the gulls. Somewhere a radio was losing an argument with the rain.'] };

const EXS = [
  /* ---------------- Maths ---------------- */
  { id: 'm-sale', s: 'maths', t: 'Percentages', q: 'A coat costs £85. In a sale, the price is reduced by 20%. Work out the sale price of the coat.', m: 2,
    pts: ['M1 for a correct method, e.g. 20% of 85 = 17, or 85 × 0.8', 'A1 for £68'],
    a: '20% of 85: [[1|85 ÷ 10 = 8.5, × 2 = 17]]\n85 − 17 = [[x|78]]\nAnswer: £78',
    n: ['Working out 20% as 17 is a correct method for the reduction, so the method mark is earned even though the final answer is wrong.', 'The subtraction slipped: 85 − 17 = 68, not 78.'],
    xs: ['An arithmetic slip in the last line. Without the working above it, this answer would have scored 0.'],
    r: 'method', fix: '20% of 85 = 17, so the sale price is 85 − 17 = £68 (or 85 × 0.8 = £68).' },
  { id: 'm-solve', s: 'maths', t: 'Algebra', q: 'Solve 5x + 3 = 38', m: 2,
    pts: ['M1 for 5x = 35', 'A1 for x = 7'], a: '[[1,2|x = 7]]',
    n: ['Not written down, but implied by the correct answer.', 'Correct.'], xs: [],
    r: 'implied', fix: 'Already full marks. Writing 5x = 35 first is still wise: if the answer had been wrong, that line would have saved a mark.' },
  { id: 'm-ratio', s: 'maths', t: 'Ratio', q: 'Sam and Priya share £72 in the ratio 5 : 3. Work out how much Sam gets.', m: 2,
    pts: ['M1 for 72 ÷ 8 (= 9), the value of one part', 'A1 for £45'],
    a: '[[x|72 ÷ 3 = 24]]\n24 × 5 = 120\nSam gets £120',
    n: ['The method divides by 3, one side of the ratio, instead of 8, the total number of parts. A wrong method earns no method mark.', 'Sam can’t get £120 out of £72. The answer is £45.'],
    xs: ['The classic ratio slip: dividing by one side of the ratio. Add the parts first: 5 + 3 = 8.'],
    r: 'sense', fix: '5 + 3 = 8 parts. £72 ÷ 8 = £9 per part. Sam gets 5 × £9 = £45.' },
  { id: 'm-compound', s: 'maths', t: 'Percentages', q: 'Leah invests £1500 at 4% compound interest per year. Work out how much she has after 3 years. Give your answer to the nearest penny.', m: 3,
    pts: ['M1 for 1500 × 1.04 (= 1560)', 'M1 for 1500 × 1.04³, or multiplying by 1.04 three times', 'A1 for £1687.30'],
    a: 'Year 1: [[1|1500 × 1.04 = 1560]]\nYear 2: [[2|1560 × 1.04 = 1622.40]], about [[x|1622]]\nYear 3: 1622 × 1.04 = 1686.88\nAnswer: £1686.88',
    n: ['Correct first year.', 'Multiplying by 1.04 each year is the right method, so this mark is earned.', 'Not earned: rounding 1622.40 to 1622 part-way through threw the answer out by 42p.'],
    xs: ['Rounded in the middle of the calculation. Keep every digit (or use the calculator’s ANS button) and round once, at the end.'],
    r: 'early', fix: '1500 × 1.04³ = 1687.296, so £1687.30.' },
  { id: 'm-angles', s: 'maths', t: 'Angles', q: 'Two angles in a triangle are 48° and 67°. Work out the size of the third angle. Give a reason for your answer.', m: 2,
    pts: ['B1 for 65°', 'B1 for the reason: angles in a triangle add up to 180°'], a: '[[1|180 − 48 − 67 = 65°]]',
    n: ['Correct angle.', 'No reason in words. The working uses 180, but the mark is for stating the fact.'], xs: [],
    r: 'reason', fix: '65°, because angles in a triangle add up to 180°.' },
  { id: 'm-pythag', s: 'maths', t: 'Pythagoras', q: 'A right-angled triangle has shorter sides of 9 cm and 12 cm. Work out the length of the hypotenuse.', m: 3,
    pts: ['M1 for 9² + 12² (= 81 + 144)', 'M1 for √225', 'A1 for 15 cm'], a: '[[x|21 cm]]',
    n: ['Not seen. Writing 9² + 12² alone would have earned this mark.', 'Not seen.', 'Not earned: 21 is 9 + 12, so the sides were added, not squared.'],
    xs: ['A wrong answer with no working: the examiner has nothing else to give marks for.'],
    r: 'nowork', fix: '9² + 12² = 81 + 144 = 225, and √225 = 15 cm.' },
  { id: 'm-speed', s: 'maths', t: 'Speed, distance, time', q: 'A train travels 150 miles in 2 hours 30 minutes. Work out its average speed in miles per hour.', m: 2,
    pts: ['M1 for using 2.5 hours, e.g. 150 ÷ 2.5', 'A1 for 60 mph'], a: '[[x|150 ÷ 2.30]] = 65.2\nAnswer: 65.2 mph',
    n: ['Not earned: 2 hours 30 minutes is 2.5 hours, not 2.30, so this is not a correct method.', 'The answer is 60 mph.'],
    xs: ['Time written as hours.minutes. Minutes are sixtieths of an hour: 30 minutes = 0.5 hours.'],
    r: 'convert', fix: '2 h 30 min = 2.5 h, and 150 ÷ 2.5 = 60 mph.' },
  { id: 'm-expand', s: 'maths', t: 'Algebra', q: 'Expand and simplify 3(x + 4) + 2(x − 1)', m: 2,
    pts: ['M1 for 3x + 12 or 2x − 2 seen', 'A1 for 5x + 10'], a: '[[1|3x + 12]] + [[x|2x − 1]]\n= 5x + 11',
    n: ['3x + 12 is one bracket expanded correctly, which is exactly what the method mark asks for.', 'The answer should be 5x + 10.'],
    xs: ['Only the x was multiplied by 2. Every term inside the bracket gets multiplied: 2 × −1 = −2.'],
    r: 'method', fix: '3x + 12 + 2x − 2 = 5x + 10.' },
  { id: 'm-stdform', s: 'maths', t: 'Standard form', q: 'Write 52 000 in standard form.', m: 1,
    pts: ['B1 for 5.2 × 10⁴'], a: '[[x|52 × 10³]]\n[[x|5.2 × 10⁴]]',
    n: ['Not earned: two different answers are left, and neither is crossed out. The examiner can’t choose the right one for you.'],
    xs: ['Not standard form: the first number must be at least 1 and less than 10.', 'Right on its own, but it is competing with a wrong answer.'],
    r: 'list', fix: 'Cross out 52 × 10³ and leave only 5.2 × 10⁴.' },

  /* ---------------- Biology ---------------- */
  { id: 'b-osmosis', s: 'biology', t: 'Cells', q: 'Define osmosis.', m: 3,
    pts: ['Diffusion (net movement) of water', 'From a dilute solution to a more concentrated solution', 'Through a partially permeable membrane'],
    a: 'Osmosis is when [[1|water moves]] from a [[x|high concentration to a low concentration]] through a [[3|partially permeable membrane]].',
    n: ['“Water moves” is enough for the movement of water.', 'Not earned: “high to low concentration” doesn’t say of what. Water moves from a dilute solution to a more concentrated one, so if it means the solute, it is the wrong way round.', 'Correct key term.'],
    xs: ['Ambiguous. Examiners don’t guess what you meant.'],
    r: 'vague', fix: 'Osmosis is the diffusion of water from a dilute solution to a more concentrated solution through a partially permeable membrane.' },
  { id: 'b-resp', s: 'biology', t: 'Respiration', q: 'Describe aerobic respiration.', m: 3,
    pts: ['Releases (transfers) energy for the cell', 'Uses oxygen', 'Glucose + oxygen → carbon dioxide + water'],
    a: 'Aerobic respiration [[x|makes energy]] [[2|using oxygen]].\n[[3|Glucose + oxygen → carbon dioxide + water]]',
    n: ['Not earned: energy is released (transferred), never made.', 'Correct.', 'Correct word equation.'],
    xs: ['“Makes energy” never earns the mark. Energy can’t be created: say respiration releases or transfers it.'],
    r: 'energy', fix: 'Aerobic respiration is a reaction in cells that releases energy. It uses oxygen: glucose + oxygen → carbon dioxide + water.' },
  { id: 'b-enzyme', s: 'biology', t: 'Enzymes', q: 'Explain why the rate of an enzyme-controlled reaction falls when the temperature rises above about 45 °C.', m: 3,
    pts: ['The enzyme is denatured', 'The shape of the active site changes', 'The substrate no longer fits the active site'],
    a: 'Because [[x|the enzyme dies]] at high temperatures. [[2|The active site changes shape]] so the reaction slows down.',
    n: ['Not earned: enzymes are proteins, not living things, so they can’t die. The key word is “denatured”.', 'Correct.', 'Not said: the reaction slows because the substrate no longer fits the changed active site.'],
    xs: ['“Dies” or “killed” never earns the denatured mark.'],
    r: 'terms', fix: 'Above the optimum the enzyme is denatured: its active site changes shape, so the substrate no longer fits and fewer enzyme–substrate complexes form.' },
  { id: 'b-heart', s: 'biology', t: 'Exercise', q: 'A runner’s heart rate was measured every 2 minutes, in beats per minute: 0 min 70, 2 min 110, 4 min 145, 6 min 160, 8 min 160. Describe how the heart rate changes.', m: 3,
    pts: ['The heart rate increases at first', 'Then stays the same (levels off) from 6 minutes', 'Uses the data, e.g. rises from 70 to 160 beats per minute'],
    a: '[[1|It goes up]] and then [[2|stays the same]].',
    n: ['Earned, though “the heart rate increases” is safer than “it”.', 'Earned.', 'Not earned: no numbers. When you are given data, a mark is usually kept for quoting it.'], xs: [],
    r: 'data', fix: 'The heart rate increases from 70 to 160 beats per minute over the first 6 minutes, then stays at 160 beats per minute.' },
  { id: 'b-photo', s: 'biology', t: 'Photosynthesis', q: 'Describe how you could investigate the effect of light intensity on the rate of photosynthesis in pondweed.', m: 4, any: 4,
    pts: ['Put pondweed in a boiling tube of water', 'Place a lamp at different measured distances, e.g. 10, 20, 30 cm', 'Count the bubbles (or collect the gas) produced', 'In a set time, e.g. one minute', 'Repeat at each distance and calculate a mean', 'Keep the temperature the same, e.g. with a water bath'],
    a: 'Put [[1|the pondweed in a tube of water]]. Put a lamp [[2|at different distances]] and [[3|count the bubbles]]. [[x|Make it a fair test.]]',
    n: ['Earned.', 'Earned.', 'Earned.', 'Not said: counting needs a fixed time so the rates can be compared.', 'Not said.', 'Not said.'],
    xs: ['Earns nothing on its own. Name the control variable and how you keep it the same.'],
    r: 'fairtest', fix: 'Put pondweed in a boiling tube of water with a lamp 10 cm away and count the bubbles in one minute. Repeat at 20, 30 and 40 cm, three times each, and work out means. Keep the temperature the same with a water bath.' },
  { id: 'b-cells', s: 'biology', t: 'Cells', q: 'Give two ways in which plant cells are different from animal cells.', m: 2, any: 2, em: 1,
    pts: ['Plant cells have a cell wall', 'Plant cells have chloroplasts', 'Plant cells have a permanent vacuole'],
    a: 'Plant cells have a [[1|cell wall]], [[2|chloroplasts]] and [[x|a nucleus]].',
    n: ['Correct.', 'Correct.', 'Another right answer, not given.'],
    xs: ['Wrong: animal cells have a nucleus too. The question asked for two, so a wrong extra answer cancels a right one. 1 mark, not 2.'],
    r: 'list', fix: 'Plant cells have a cell wall and chloroplasts. Then stop: two answers for two marks.' },

  /* ---------------- Chemistry ---------------- */
  { id: 'c-nacl', s: 'chemistry', t: 'Bonding', q: 'Explain why sodium chloride has a high melting point.', m: 3,
    pts: ['Giant ionic lattice (structure)', 'Strong electrostatic forces of attraction between oppositely charged ions', 'A lot of energy is needed to overcome these forces'],
    a: 'Sodium chloride has a [[1|giant lattice]] of ions. [[x|It needs a lot of energy to melt]] because it has a high melting point.',
    n: ['Earned.', 'Not said: what holds the lattice together?', 'Not earned: the energy mark is for overcoming the forces between the ions, and no forces are named.'],
    xs: ['This repeats the question. “Explain” needs the reason: strong forces between ions that take a lot of energy to overcome.'],
    r: 'repeat', fix: 'Sodium chloride is a giant ionic lattice with strong electrostatic forces of attraction between oppositely charged ions. A lot of energy is needed to overcome these forces.' },
  { id: 'c-rate', s: 'chemistry', t: 'Rates of reaction', q: 'Explain why increasing the temperature increases the rate of a reaction.', m: 3,
    pts: ['Particles move faster (have more kinetic energy)', 'Collisions are more frequent (more collisions per second)', 'More collisions have at least the activation energy'],
    a: 'The [[1|particles have more energy]] so they [[x|collide more]] and the reaction goes faster.',
    n: ['Earned.', 'Not earned: “collide more” has no time in it.', 'Not said: more of the collisions have energy equal to or above the activation energy.'],
    xs: ['Rate is about time. The mark needs “more frequent collisions” or “more collisions per second”.'],
    r: 'terms', fix: 'Particles move faster, so they collide more frequently, and more of the collisions have at least the activation energy. More successful collisions per second means a faster rate.' },
  { id: 'c-gas', s: 'chemistry', t: 'Reactions of acids', q: 'Name the gas produced when magnesium reacts with hydrochloric acid.', m: 1,
    pts: ['Hydrogen'], a: '[[x|Hydrogen or carbon dioxide]]',
    n: ['Not earned: the right answer is there, but so is a wrong one.'],
    xs: ['Two answers to a one-answer question: the wrong one cancels the right one. Carbon dioxide comes from acids reacting with carbonates.'],
    r: 'list', fix: 'Hydrogen.' },
  { id: 'c-mr', s: 'chemistry', t: 'Quantitative chemistry', q: 'Calculate the relative formula mass (Mr) of calcium carbonate, CaCO₃. Relative atomic masses: Ca = 40, C = 12, O = 16.', m: 2,
    pts: ['M1 for 40 + 12 + (3 × 16)', 'A1 for 100'], a: '[[x|40 + 12 + 16]] = 68',
    n: ['Not earned: CaCO₃ has three oxygen atoms, so the method needs 3 × 16.', 'The answer is 100.'],
    xs: ['The small 3 multiplies the oxygen. Count every atom in the formula before adding.'],
    r: 'method', fix: '40 + 12 + (3 × 16) = 40 + 12 + 48 = 100.' },
  { id: 'c-rf', s: 'chemistry', t: 'Chromatography', q: 'In a chromatography experiment, a spot moved 3.2 cm and the solvent moved 8.0 cm. Calculate the Rf value.', m: 2,
    pts: ['M1 for 3.2 ÷ 8.0', 'A1 for 0.4'], a: '[[x|8.0 ÷ 3.2]] = 2.5',
    n: ['Not earned: the division is upside down. Rf = distance moved by the spot ÷ distance moved by the solvent.', 'The answer is 0.4.'],
    xs: ['An Rf value is always less than 1, because the spot can’t travel further than the solvent. 2.5 should ring alarm bells.'],
    r: 'sense', fix: 'Rf = 3.2 ÷ 8.0 = 0.4.' },
  { id: 'c-cl2', s: 'chemistry', t: 'Chemical analysis', q: 'Describe the test for chlorine gas and give the result.', m: 2,
    pts: ['Damp litmus paper', 'It is bleached (turns white)'], a: 'Hold [[1|damp litmus paper]] in the gas. It [[x|turns red]].',
    n: ['Earned.', 'Not earned: chlorine bleaches litmus paper white. Blue litmus may turn red first, but “turns red” alone is the result for an acid.'],
    xs: ['Half an observation. The mark is for the key word: bleached.'],
    r: 'terms', fix: 'Hold damp litmus paper in the gas: it is bleached (turns white).' },

  /* ---------------- Physics ---------------- */
  { id: 'p-density', s: 'physics', t: 'Density', q: 'A metal block has a mass of 0.5 kg and a volume of 0.0002 m³. Calculate its density. Give your answer in kg/m³.', m: 2,
    pts: ['M1 for 0.5 ÷ 0.0002', 'A1 for 2500'], a: 'density = mass ÷ volume\n[[1|= 0.5 ÷ 0.0002]]\n[[2|= 2500]]',
    n: ['Earned.', 'Earned. The question gave the unit, so leaving it off doesn’t lose the mark here.'], xs: [],
    r: 'units', fix: 'Already full marks. Writing 2500 kg/m³ is still a good habit.' },
  { id: 'p-ke', s: 'physics', t: 'Energy', q: 'A car of mass 1200 kg is moving at 15 m/s. Calculate its kinetic energy.', m: 2,
    pts: ['M1 for ½ × 1200 × 15²', 'A1 for 135 000 J'], a: 'Eₖ = ½mv²\n[[x|= ½ × 1200 × 15]]\n= 9000 J',
    n: ['Not earned: the speed must be squared, so the substitution needs 15².', 'The answer is 135 000 J.'],
    xs: ['The right equation, used wrongly. The square applies to v: 15² = 225.'],
    r: 'method', fix: 'Eₖ = ½ × 1200 × 15² = ½ × 1200 × 225 = 135 000 J.' },
  { id: 'p-motion', s: 'physics', t: 'Motion', q: 'A distance–time graph for a cyclist is a straight line from 0 m at 0 s to 50 m at 10 s, then horizontal until 20 s. Describe the motion of the cyclist.', m: 3,
    pts: ['Constant (steady) speed for the first 10 s', 'A speed of 5 m/s', 'Stationary (stopped) from 10 s to 20 s'],
    a: 'The cyclist [[1|moves at a steady speed]] [[x|because the line is straight]], then [[3|stops]].',
    n: ['Earned.', 'Not given. The data lets you work out the speed: 50 m ÷ 10 s = 5 m/s.', 'Earned.'],
    xs: ['Not wrong, but “describe” doesn’t ask for reasons. The time was better spent working out the speed.'],
    r: 'command', fix: 'The cyclist travels at a constant speed of 5 m/s (50 m in 10 s), then is stationary from 10 s to 20 s.' },
  { id: 'p-kettle', s: 'physics', t: 'Energy', q: 'A 2000 W kettle is switched on for 120 s. Calculate the energy transferred.', m: 2,
    pts: ['M1 for 2000 × 120', 'A1 for 240 000 J'], a: '[[1,2|240 000 J]]',
    n: ['Implied by the correct answer.', 'Correct.'], xs: [],
    r: 'implied', fix: 'Full marks. E = P × t = 2000 × 120 = 240 000 J is still the safer way to set it out.' },
  { id: 'p-ohm', s: 'physics', t: 'Electricity', q: 'The potential difference across a resistor is 6.0 V and the current through it is 0.3 A. Calculate its resistance.', m: 2,
    pts: ['M1 for 6.0 ÷ 0.3', 'A1 for 20 Ω'], a: '[[x|R = V × I]]\n= 6.0 × 0.3 = 1.8 Ω',
    n: ['Not earned: V = I × R, so R = V ÷ I. Multiplying is the wrong method.', 'The answer is 20 Ω.'],
    xs: ['Rearranged wrongly. A large potential difference driving a small current means a large resistance, so 1.8 Ω should look suspicious.'],
    r: 'sense', fix: 'R = V ÷ I = 6.0 ÷ 0.3 = 20 Ω.' },
  { id: 'p-waves', s: 'physics', t: 'Waves', q: 'Describe the difference between transverse and longitudinal waves.', m: 2,
    pts: ['Transverse: the vibrations are perpendicular to the direction of energy transfer', 'Longitudinal: the vibrations are parallel to the direction of energy transfer'],
    a: 'In transverse waves [[1|the vibrations are at right angles to the direction the wave travels]]. [[x|Longitudinal waves are like sound waves.]]',
    n: ['Earned: “at right angles” means perpendicular.', 'Not earned: an example isn’t a description.'],
    xs: ['True, but it doesn’t answer the question. A difference needs both kinds described in the same terms.'],
    r: 'compare', fix: 'Transverse waves vibrate perpendicular to the direction of energy transfer; longitudinal waves vibrate parallel to it.' },

  /* ---------------- Geography ---------------- */
  { id: 'g-urban', s: 'geography', t: 'Urban growth', q: 'Explain why cities in many low-income countries (LICs) are growing quickly.', m: 4,
    lv: [[3, 4, 'Clear explanation: each reason is developed to show why it makes the city grow.'], [1, 2, 'Basic explanation: reasons are listed with little or no development.']],
    look: ['Rural–urban migration', 'A push factor, explained', 'A pull factor, explained', 'Natural increase'], has: [0, 1, 2], mark: 2,
    a: '[[+|People move to the city]] for jobs. [[x|It is a better place to live.]] People leave the countryside because of drought.',
    why: 'Level 1, top mark. Migration, a pull factor (jobs) and a push factor (drought) are all there, but each is only listed: none says why it makes people move or how it grows the city.',
    plus: ['The main process, rural–urban migration, is identified.'],
    xs: ['Too vague to credit: better in what way?'],
    r: 'develop', fix: 'Drought makes farming fail, so families leave the countryside for the city, where factories and services offer regular wages. Most migrants are young adults, so birth rates in the city are high too, adding natural increase.' },
  { id: 'g-tectonic', s: 'geography', t: 'Tectonic hazards', q: 'Using a named example, explain the effects of a tectonic hazard.', m: 6,
    lv: [[5, 6, 'Detailed explanation of effects, clearly linked to a named example with specific facts.'], [3, 4, 'Clear explanation of some effects, with some reference to an example.'], [1, 2, 'Basic: effects are listed, general, with no real example.']],
    look: ['Primary effects (immediate damage, deaths)', 'Secondary effects (later knock-on effects)', 'Explains why each effect happens', 'A named example with specific facts'], has: [0, 1, 2], mark: 3,
    a: '[[+|Earthquakes make buildings collapse and people are killed.]] [[+|Roads are damaged so aid can’t reach people.]] People lose their homes. It costs a lot of money to rebuild. [[x|This happened in an earthquake.]]',
    why: 'Level 2, bottom mark. There is some explanation (“roads are damaged so aid can’t reach people”), but there is no named example, so it can’t reach Level 3. Mark schemes cap answers without a named example.',
    plus: ['A primary effect, clearly stated.', 'A developed secondary effect: cause and consequence.'],
    xs: ['Not a named example. “An earthquake” could be anywhere: name the place and year and give real figures.'],
    r: 'specific', fix: 'Add the example, e.g. “In the 2015 Nepal earthquake about 9,000 people died, and landslides blocked mountain roads, so aid took days to reach remote villages.”' },
  { id: 'g-seawall', s: 'geography', t: 'Coastal management', q: 'Suggest one advantage and one disadvantage of building a sea wall to protect a coastline.', m: 4,
    pts: ['Advantage stated, e.g. protects homes and land from erosion', 'Advantage developed, e.g. so homes and businesses behind it stay safe for decades', 'Disadvantage stated, e.g. very expensive', 'Disadvantage developed, e.g. it reflects wave energy, so erosion can increase further along the coast'],
    a: 'Advantage: [[1|it protects the coast]].\nDisadvantage: [[3|it is expensive]].',
    n: ['Earned.', 'Not developed: say what the protection means for the people or places behind the wall.', 'Earned.', 'Not developed: how expensive, or what else goes wrong?'], xs: [],
    r: 'develop', fix: 'Advantage: it protects homes and roads from erosion, so people don’t lose their property. Disadvantage: it is very expensive and reflects wave energy, which can increase erosion further along the coast.' },

  /* ---------------- Business ---------------- */
  { id: 'bs-sole', s: 'business', t: 'Business ownership', q: 'Sam runs a bakery in a small town as a sole trader. Explain one benefit to Sam of being a sole trader.', m: 3,
    pts: ['Benefit identified, e.g. keeps all the profit', 'Benefit explained (developed)', 'Applied to Sam’s bakery'],
    a: 'A sole trader [[1|keeps all the profit]], so [[2|they have more money to invest in the business]].',
    n: ['Earned.', 'Earned: a developed consequence.', 'Not earned: nothing in the answer is about Sam or a bakery. It would fit any business.'], xs: [],
    r: 'apply', fix: 'Sam keeps all the bakery’s profit, so Sam could reinvest it in a second oven and bake more bread for the town’s cafés.' },
  { id: 'bs-profit', s: 'business', t: 'Finance', q: 'A business has revenue of £12,000, fixed costs of £3,000 and variable costs of £5,500. Calculate its profit.', m: 2,
    pts: ['M1 for total costs = 3,000 + 5,500 (= £8,500)', 'A1 for £3,500'], a: 'Profit = revenue − costs\n[[x|= 12,000 − 3,000]]\n= £9,000',
    n: ['Not earned: only the fixed costs were taken away. Total costs include the variable costs too.', 'The answer is £3,500.'],
    xs: ['Profit = revenue − total costs, and total costs = fixed + variable.'],
    r: 'method', fix: 'Total costs = 3,000 + 5,500 = £8,500. Profit = 12,000 − 8,500 = £3,500.' },
  { id: 'bs-share', s: 'business', t: 'Marketing', q: 'What is meant by “market share”?', m: 1,
    pts: ['One business’s sales as a percentage (proportion) of the total sales in a market'], a: '[[x|How much a business sells.]]',
    n: ['Not earned: market share compares one business’s sales with the whole market.'],
    xs: ['Too vague: this describes sales, not market share. The key idea is a percentage of the whole market.'],
    r: 'vague', fix: 'Market share is one business’s sales as a percentage of the total sales in its market.' },
  { id: 'bs-pct', s: 'business', t: 'Finance', q: 'A shop’s sales rose from £40,000 to £50,000. Calculate the percentage increase.', m: 2,
    pts: ['M1 for 10,000 ÷ 40,000 (× 100)', 'A1 for 25%'], a: 'Increase = 10,000\n[[x|10,000 ÷ 50,000 × 100]] = 20%',
    n: ['Not earned: a percentage change is divided by the original value, £40,000, not the new one.', 'The answer is 25%.'],
    xs: ['Always divide by where you started.'],
    r: 'method', fix: '(50,000 − 40,000) ÷ 40,000 × 100 = 25%.' },
  { id: 'bs-online', s: 'business', t: 'Growth', q: 'Kai’s Cycles is a small bike shop. Kai is deciding whether to start selling bikes online. Should Kai sell online? Justify your answer.', m: 9,
    lv: [[7, 9, 'Detailed knowledge applied to the business throughout; developed chains of reasoning; a clear, justified decision.'], [4, 6, 'Good knowledge applied to the business; some developed reasoning; a decision with some support.'], [1, 3, 'Limited knowledge; little application; points asserted, not explained; little or no decision.']],
    look: ['Knowledge of selling online', 'Applied to Kai’s Cycles', 'Developed reasoning (because… so…)', 'A justified final decision'], has: [0, 1, 2], mark: 4,
    a: '[[+|Selling online means Kai could reach customers all over the country, not just people who walk past the shop, so sales could rise.]] [[+|But Kai would need a website and would have to pay for delivery, which costs money.]] Online customers can’t try the bikes first, so some might not buy. [[x|There are advantages and disadvantages.]]',
    why: 'Level 2, bottom mark. Good, applied points on both sides, but no decision. “Should Kai…?” needs an answer and a reason; without one, the answer can’t climb the level.',
    plus: ['Applied and developed: more reach, so more customers, so more sales.', 'A balancing point, applied to Kai.'],
    xs: ['Not a judgement. Sitting on the fence earns nothing: decide, and say what the decision depends on.'],
    r: 'evaluate', fix: 'End with a decision, e.g. “Kai should sell online, because customers from across the country outweigh the delivery costs, as long as the website shows the bikes clearly and offers free returns.”' },

  /* ---------------- RE ---------------- */
  { id: 're-god', s: 're', rel: 'chr', t: 'Christian beliefs', q: 'Give two Christian beliefs about the nature of God.', m: 2, any: 2,
    pts: ['Omnipotent (all-powerful)', 'Loving (benevolent)', 'Just', 'The Trinity: Father, Son and Holy Spirit', 'Omniscient, creator or eternal'],
    a: 'God is [[1|omnipotent]]. God is [[2|loving]].',
    n: ['Earned.', 'Earned.', 'Another right answer.', 'Another right answer.', 'Another right answer.'], xs: [],
    r: 'enough', fix: 'Full marks. Two short, correct beliefs are all a “give two” question needs.' },
  { id: 're-prayer', s: 're', rel: 'chr', t: 'Christian practices', q: 'Explain two ways in which Christians use prayer.', m: 4,
    pts: ['First way, e.g. praying privately to ask God for help', 'First way developed, e.g. because they believe God listens and cares', 'Second way, e.g. praying together in church', 'Second way developed, e.g. set prayers such as the Lord’s Prayer unite the community in worship'],
    a: 'Christians [[1|pray to ask God for help]]. They also [[3|pray together in church]].',
    n: ['Earned.', 'Not developed: why, or what difference does it make?', 'Earned.', 'Not developed.'], xs: [],
    r: 'develop', fix: 'Christians pray privately to ask God for help, because they believe God hears and cares for them. They also pray together in church using set prayers such as the Lord’s Prayer, which Jesus taught his disciples, so the community worships as one.' },
  { id: 're-afterlife', s: 're', rel: 'chr', t: 'Christian beliefs', q: 'Explain two Christian beliefs about life after death. Refer to sacred writings or another source of Christian belief and teaching in your answer.', m: 5,
    pts: ['First belief', 'First belief developed', 'Second belief', 'Second belief developed', 'A relevant reference to sacred writings or another source of authority'],
    a: 'Christians believe [[1|in heaven]], where [[2|people who have faith in Jesus will be with God forever]]. They also believe in [[3|judgement]]: [[4|God will judge everyone after they die, so how you live matters]].',
    n: ['Earned.', 'Earned: developed.', 'Earned.', 'Earned: developed.', 'Not earned: the question asks for a reference to sacred writings, and there isn’t one.'], xs: [],
    r: 'source', fix: 'Add a reference, e.g. Jesus’ parable of the sheep and the goats (Matthew 25) shows people being judged on how they treated others.' },
  { id: 're-violence', s: 're', rel: 'chr', t: 'Peace and conflict', q: '“It is wrong to use violence, even to protect yourself.” Evaluate this statement. Refer to different points of view, give reasoned arguments and reach a justified conclusion.', m: 12,
    lv: [[10, 12, 'Well-argued evaluation of different points of view, with logical reasoning, accurate teaching and a justified conclusion.'], [7, 9, 'Reasoned consideration of different points of view, with a conclusion.'], [4, 6, 'Reasoned consideration of one point of view, or simple consideration of different views.'], [1, 3, 'A point of view with simple reasons.']],
    look: ['Reasons for the statement', 'Reasons against it (e.g. self-defence, just war theory)', 'Religious teaching used accurately', 'A justified conclusion'], has: [0, 2], mark: 5,
    a: '[[+|Many Christians agree, because Jesus taught people to “turn the other cheek” and said that those who draw the sword will die by the sword.]] [[+|Quakers are pacifists, so they would refuse to fight even to defend themselves.]] Martin Luther King used non-violent protest and it worked. [[x|So I agree with the statement.]]',
    why: 'Level 2, middle. A well-reasoned case for one side with accurate teaching, but no other point of view. Many Christians accept proportionate self-defence, and just war theory allows force in some cases. Without a second view it can’t reach Level 3.',
    plus: ['Reasoned, with accurate teaching from Matthew 5 and 26.', 'A relevant group and belief.'],
    xs: ['A conclusion, but not a justified one: nothing was weighed against it.'],
    r: 'evaluate', fix: 'Add the other side: many Christians believe self-defence is acceptable if it is proportionate, and just war theory allows force as a last resort to protect the innocent. Then conclude by weighing which argument is stronger, and why.' },

  /* ---------------- English Literature ---------------- */
  { id: 'l-macbeth', s: 'englit', tx: 'mac', t: 'Macbeth', q: 'How does Shakespeare present Macbeth’s ambition? (One paragraph from a student’s essay on Act 1 Scene 7.)', m: 6, lvOnly: true,
    lv: EX_LIT, look: EX_LITLOOK, has: [0, 1], mark: 2,
    a: 'Shakespeare uses [[x|a metaphor]] when Macbeth says he has only “[[+|vaulting ambition]]”. [[x|This shows that Macbeth is ambitious.]] The audience would think he is bad.',
    why: 'Level 2. A relevant quote and a named method, but the comment repeats the question (“shows that Macbeth is ambitious”), so nothing is explained about how the language works.',
    plus: ['A strong, relevant quotation.'],
    xs: ['Naming the technique earns little on its own. What does “vaulting” suggest?', 'Repeats the question: it says what, not how.'],
    r: 'effect', fix: '“Vaulting” suggests a rider leaping onto a horse so hard that he overshoots and falls: Shakespeare hints that ambition will carry Macbeth too far and destroy him, which a Jacobean audience, who saw killing a king as a sin against God, would expect.' },
  { id: 'l-oyster', s: 'englit', tx: 'acc', t: 'A Christmas Carol', q: 'How does Dickens present Scrooge in Stave One? (One paragraph from a student’s essay.)', m: 6, lvOnly: true,
    lv: EX_LIT, look: EX_LITLOOK, has: [0, 1, 2, 3], mark: 5,
    a: 'Dickens describes Scrooge as “[[+|solitary as an oyster]]”. [[+|The simile suggests Scrooge has shut himself inside a hard shell, cut off from other people, but an oyster can also hold a pearl, hinting that there is something valuable inside him that the ghosts can bring out.]] [[+|Dickens wanted his middle-class readers to see that people like Scrooge, who ignored the poor, could still change.]]',
    why: 'Level 5. A well-chosen quote, a thoughtful, developed reading of one image (with a second interpretation), and context linked to Dickens’ purpose. Level 6 needs this quality across the whole essay, with more critical comment on method.',
    plus: ['A precise, well-chosen quotation.', 'Zooms in on the image and offers two readings of it.', 'Context tied to what Dickens wanted readers to feel.'], xs: [],
    r: 'level', fix: 'Already strong. To reach Level 6, keep this up throughout and comment on structure, e.g. how the closed “oyster” of Stave One opens up by Stave Five.' },
  { id: 'l-prisons', s: 'englit', tx: 'acc', t: 'A Christmas Carol', q: 'How does Dickens present attitudes to poverty in A Christmas Carol? (One paragraph from a student’s essay.)', m: 6, lvOnly: true,
    lv: EX_LIT, look: EX_LITLOOK, has: [0], mark: 2,
    a: 'Scrooge asks “[[+|Are there no prisons?]]” when he is asked to give money to the poor. This shows he doesn’t care about the poor. [[x|In Victorian times there were workhouses and the Poor Law was passed in 1834.]]',
    why: 'Level 2. A relevant quote and a simple comment (“doesn’t care about the poor”). The history is accurate but bolted on: it isn’t used to explain anything about Dickens’ message.',
    plus: ['A relevant quotation.'],
    xs: ['Context on its own earns little. Link it: Scrooge’s question echoes the attitudes behind the 1834 Poor Law, which Dickens attacks.'],
    r: 'context', fix: '“Are there no prisons?” is a cold rhetorical question that echoes the harsh attitudes behind the 1834 Poor Law: Dickens puts real Victorian arguments in Scrooge’s mouth so readers recoil from them.' },

  /* ---------------- English Language ---------------- */
  { id: 'el-list', s: 'englang', t: 'Reading: information', src: 'storm', q: 'From the extract, list four things you learn about the storm.', m: 4, any: 4,
    pts: ['It arrived without apology (suddenly)', 'It shouldered (pushed against) the house', 'It rattled the windows', 'It moaned along the chimney', 'There was lightning and thunder'],
    a: '1. [[1|It arrived without apology]]\n2. [[3|It rattled the windows]]\n3. [[4|It moaned along the chimney]]\n4. [[x|It was raining]]',
    n: ['Earned.', 'Another right answer, not used.', 'Earned.', 'Earned.', 'Another right answer, not used.'],
    xs: ['Not in the extract, which never mentions rain. It scores nothing, however likely it seems.'],
    r: 'text', fix: 'Swap the invented fact for one from the text, e.g. “It shouldered the house.”' },
  { id: 'el-lang', s: 'englang', t: 'Reading: language', src: 'storm', q: 'How does the writer use language to describe the storm?', m: 8,
    lv: typeof LV !== 'undefined' ? LV.q8 : [[7, 8, 'Detailed, perceptive analysis.'], [5, 6, 'Clear explanation of effects.'], [3, 4, 'Some comment on effects.'], [1, 2, 'Simple comments.']],
    look: ['Relevant quotations', 'Subject terms used accurately', 'Explains the effects of specific words', 'Zooms in on individual word choices'], has: [0, 1], mark: 3,
    a: 'The writer uses [[+|personification]] in “[[+|the storm arrived without apology]]”. [[x|This makes it sound like a person.]] The writer also uses a simile, “like something lost”, [[x|which makes it scary]].',
    why: 'Level 2, bottom mark. Accurate terms and relevant quotes, but the comments on effect are simple: “sounds like a person” and “makes it scary” could describe almost any personification or simile.',
    plus: ['A correct subject term.', 'A relevant, precise quotation.'],
    xs: ['Restates the technique instead of explaining its effect. What kind of person arrives “without apology”?', 'Too general. Why “lost”? It makes the wind sound like wailing, which adds loneliness, not just fear.'],
    r: 'effect', fix: '“Without apology” makes the storm seem rude and arrogant, as if it has every right to invade, and “shouldered” suggests a bully forcing its way in. The simile “like something lost” turns the wind into wailing, adding a lonely, sad feel to the fear.' },

  /* ---------------- History ---------------- */
  { id: 'h-versailles', s: 'history', t: 'Germany', q: 'Describe two features of the Treaty of Versailles (1919).', m: 4,
    pts: ['A feature, e.g. Germany had to pay reparations', 'Supporting detail, e.g. set at £6.6 billion in 1921', 'A second feature, e.g. Germany’s army was limited', 'Supporting detail, e.g. to 100,000 men, with no tanks or air force'],
    a: '[[1|Germany had to pay reparations]] of [[2|£6.6 billion]]. [[3|Germany’s army was made smaller]].',
    n: ['Earned.', 'Earned: a specific detail.', 'Earned.', 'Not earned: how much smaller? The detail mark needs something specific.'], xs: [],
    r: 'specific', fix: 'Germany had to pay £6.6 billion in reparations. Its army was limited to 100,000 men, with no tanks or air force.' },

  /* ---------------- Computer Science ---------------- */
  { id: 'cs-cpu', s: 'compsci', t: 'Systems architecture', q: 'State the purpose of the CPU.', m: 1,
    pts: ['To fetch, decode and execute instructions (to process data and instructions)'], a: '[[x|It is the brain of the computer.]]',
    n: ['Not earned: the mark needs what the CPU actually does.'],
    xs: ['A comparison, not a purpose. Mark schemes reject “the brain of the computer”.'],
    r: 'vague', fix: 'The CPU fetches, decodes and executes instructions.' },
  { id: 'cs-binary', s: 'compsci', t: 'Data representation', q: 'Convert the binary number 1011 0110 to denary.', m: 1,
    pts: ['182'], a: '[[1|182]]', n: ['Correct: 128 + 32 + 16 + 4 + 2 = 182.'], xs: [],
    r: 'enough', fix: 'Full marks: a one-mark conversion needs only the answer.' },

  /* ================= second batch ================= */
  /* ---------------- Maths ---------------- */
  { id: 'm-fracadd', s: 'maths', t: 'Fractions', q: 'Work out 2/5 + 1/3. Give your answer as a fraction.', m: 2,
    pts: ['M1 for a common denominator, e.g. 6/15 and 5/15', 'A1 for 11/15'], a: '2/5 + 1/3 = [[x|3/8]]',
    n: ['Not earned: adding the tops and the bottoms is not a method for adding fractions.', 'The answer is 11/15.'],
    xs: ['The classic fraction slip. Numerators can only be added once the denominators match.'],
    r: 'method', fix: '2/5 = 6/15 and 1/3 = 5/15, so 6/15 + 5/15 = 11/15.' },
  { id: 'm-mean', s: 'maths', t: 'Averages', q: 'The mean of four numbers is 9. Three of the numbers are 6, 8 and 13. Work out the fourth number.', m: 2,
    pts: ['M1 for 4 × 9 = 36', 'A1 for 9'], a: '[[1|4 × 9 = 36]]\n36 − 6 − 8 − 13 = [[x|11]]',
    n: ['Finding the total, 36, is the key step, so the method mark is earned.', 'The subtraction slipped: 6 + 8 + 13 = 27, and 36 − 27 = 9.'],
    xs: ['An arithmetic slip. Adding the three numbers first (27) and then subtracting once is safer.'],
    r: 'method', fix: 'Total = 4 × 9 = 36. 6 + 8 + 13 = 27. Fourth number = 36 − 27 = 9.' },
  { id: 'm-showthat', s: 'maths', t: 'Area', q: 'A rectangle measures 2.5 cm by 4.8 cm. Show that its area is 12 cm².', m: 2,
    pts: ['M1 for 2.5 × 4.8 written', 'A1 for 12 reached with no errors'], a: '[[x|Area = 12 cm²]]',
    n: ['Not earned: the calculation is never shown.', 'Not earned: in a “show that”, writing the given answer earns nothing.'],
    xs: ['This copies the answer from the question. The marks are for showing how you get there.'],
    r: 'showthat', fix: 'Area = 2.5 × 4.8 = 12 cm². (For a non-calculator paper: 2.5 × 4.8 = 2.5 × 4 + 2.5 × 0.8 = 10 + 2 = 12.)' },
  { id: 'm-areaunits', s: 'maths', t: 'Area', q: 'A rectangle is 3 m long and 50 cm wide. Work out its area in m².', m: 2,
    pts: ['M1 for 3 × 0.5 (or 300 × 50 = 15 000 cm²)', 'A1 for 1.5 m²'], a: '[[x|3 × 50]] = 150 m²',
    n: ['Not earned: metres and centimetres were multiplied together, so this is not a correct method.', 'The answer is 1.5 m².'],
    xs: ['Mixed units. Convert first: 50 cm = 0.5 m.'],
    r: 'convert', fix: '50 cm = 0.5 m, so the area is 3 × 0.5 = 1.5 m².' },
  { id: 'm-prob', s: 'maths', t: 'Probability', q: 'A bag has 3 red, 5 blue and 2 green counters. One counter is taken at random. Work out the probability that it is not green.', m: 2,
    pts: ['M1 for 1 − 2/10, or (3 + 5)/10', 'A1 for 8/10 (or 4/5 or 0.8)'], a: '[[1,2|8/10]]',
    n: ['Implied by the correct answer.', 'Correct. It doesn’t need simplifying: the question didn’t ask for the simplest form.'], xs: [],
    r: 'simplify', fix: 'Full marks. 4/5 or 0.8 would also be fine.' },
  { id: 'm-revpct', s: 'maths', t: 'Percentages', q: 'After a 20% decrease, the price of a jacket is £96. Work out the price before the decrease.', m: 2,
    pts: ['M1 for 96 ÷ 0.8', 'A1 for £120'], a: '20% of 96 = 19.20\n[[x|96 + 19.20]] = £115.20',
    n: ['Not earned: the 20% was taken off the original price, so adding 20% of the new price doesn’t undo it.', 'The answer is £120.'],
    xs: ['The reverse-percentage trap. £96 is 80% of the original, so divide by 0.8.'],
    r: 'method', fix: '£96 is 80% of the original, so the original price is 96 ÷ 0.8 = £120.' },
  { id: 'm-dp', s: 'maths', t: 'Rounding', q: 'Use your calculator to work out √30. Give your answer to 1 decimal place.', m: 1,
    pts: ['B1 for 5.5'], a: '[[x|5.477225575]]',
    n: ['Not earned: the question asked for 1 decimal place.'],
    xs: ['Right value, wrong accuracy. 5.477… rounds to 5.5.'],
    r: 'accuracy', fix: '√30 = 5.477… = 5.5 to 1 decimal place.' },
  { id: 'm-parallel', s: 'maths', t: 'Angles', q: 'Two parallel lines are crossed by a straight line. One angle is 63°. Angle x is in the alternate position. Work out x and give a reason.', m: 2,
    pts: ['B1 for x = 63°', 'B1 for the reason: alternate angles are equal'], a: '[[1|x = 63°]] because [[x|they are the same]].',
    n: ['Correct.', 'Not earned: “they are the same” just repeats the answer. The reason needs the angle fact.'],
    xs: ['A reason must name the fact: “alternate angles are equal”.'],
    r: 'reason', fix: 'x = 63°, because alternate angles are equal.' },
  { id: 'm-bestbuy', s: 'maths', t: 'Ratio', q: 'Pack A has 6 rolls for £2.40. Pack B has 10 rolls for £3.80. Which pack is better value? You must show your working.', m: 3,
    pts: ['M1 for a correct comparison method, e.g. 2.40 ÷ 6 or 3.80 ÷ 10', 'A1 for both unit prices: 40p and 38p', 'C1 for Pack B, with correct figures'],
    a: '[[1,2|A: 2.40 ÷ 6 = 40p a roll. B: 3.80 ÷ 10 = 38p a roll.]]\n[[x|Pack A]] because it is cheaper.',
    n: ['Earned.', 'Earned: both unit prices are right.', 'Not earned: the working shows Pack B is cheaper per roll, but the conclusion picks Pack A.'],
    xs: ['The conclusion contradicts the working. Pack A costs less in total, but more per roll.'],
    r: 'sense', fix: 'Pack A costs 40p a roll and Pack B costs 38p a roll, so Pack B is better value.' },
  { id: 'm-nth', s: 'maths', t: 'Sequences', q: 'Here are the first four terms of a sequence: 7, 11, 15, 19. Write an expression for the nth term.', m: 2,
    pts: ['B1 for 4n', 'B1 for 4n + 3'], a: '[[x|n + 4]]',
    n: ['Not earned: the terms go up by 4, so the expression starts 4n, not n + 4.', 'Not earned.'],
    xs: ['This describes the term-to-term rule (“add 4”), not the nth term.'],
    r: 'method', fix: 'The difference is 4, so start with 4n (4, 8, 12, 16). Add 3 to match: 4n + 3.' },
  { id: 'm-estimate', s: 'maths', t: 'Number', q: 'Estimate the value of (4.87 × 21.3) ÷ 0.48', m: 2,
    pts: ['M1 for rounding each number to 1 significant figure, e.g. 5 × 20 ÷ 0.5', 'A1 for 200'], a: '4.87 × 21.3 = 103.731\n[[x|103.731 ÷ 0.48 = 216.1]]',
    n: ['Not earned: an estimate means rounding first. Working it out exactly isn’t estimating.', 'Not earned: the estimate is 200.'],
    xs: ['The exact answer isn’t what “estimate” asks for, so it scores nothing even though it is accurate.'],
    r: 'command', fix: 'Round to 1 significant figure: 5 × 20 ÷ 0.5 = 100 ÷ 0.5 = 200.' },

  /* ---------------- Biology ---------------- */
  { id: 'b-vaccine', s: 'biology', t: 'Infection and response', q: 'Explain how vaccination protects a person against a disease.', m: 4,
    pts: ['A dead or inactive form of the pathogen is put into the body', 'White blood cells produce antibodies', 'Memory cells are made', 'If the real pathogen enters, antibodies are made quickly, so the person does not become ill'],
    a: 'A vaccine [[1|contains a dead version of the virus]]. Your body [[x|becomes immune to it]] so you [[x|can’t catch it]].',
    n: ['Earned.', 'Not said.', 'Not said.', 'Not earned: see the notes on the answer.'],
    xs: ['This repeats “protects” in other words. How does the body become immune? Name the cells and what they make.', 'Not true: the pathogen can still get in. Antibodies are made so fast that you don’t become ill.'],
    r: 'vague', fix: 'The vaccine contains a dead or inactive pathogen. White blood cells produce antibodies against it and memory cells are made. If the real pathogen enters later, antibodies are made quickly, so the person does not become ill.' },
  { id: 'b-antibiotic', s: 'biology', t: 'Infection and response', q: 'Explain why antibiotics cannot be used to treat measles.', m: 1,
    pts: ['Measles is caused by a virus, and antibiotics only kill bacteria'], a: 'Because [[x|the virus is resistant to antibiotics]].',
    n: ['Not earned: antibiotics don’t work on any viruses, resistant or not.'],
    xs: ['Mixes up two ideas. Resistance is when bacteria evolve to survive antibiotics.'],
    r: 'terms', fix: 'Measles is caused by a virus, and antibiotics only kill bacteria.' },
  { id: 'b-mag', s: 'biology', t: 'Cells', q: 'An image of a cell is 5 mm long. The real cell is 0.01 mm long. Calculate the magnification.', m: 2,
    pts: ['M1 for 5 ÷ 0.01', 'A1 for × 500'], a: '[[x|0.01 ÷ 5]] = 0.002',
    n: ['Not earned: magnification = image size ÷ real size.', 'The answer is × 500.'],
    xs: ['A magnification smaller than 1 would make the cell look smaller under a microscope. That should ring alarm bells.'],
    r: 'sense', fix: 'Magnification = image size ÷ real size = 5 ÷ 0.01 = × 500.' },
  { id: 'b-photoeq', s: 'biology', t: 'Photosynthesis', q: 'Write the word equation for photosynthesis.', m: 2,
    pts: ['Carbon dioxide + water on the left', 'Glucose + oxygen on the right'], a: '[[1|carbon dioxide + water]] → [[x|glucose + oxygen + energy]]',
    n: ['Earned.', 'Not earned: energy is not a product of photosynthesis.'],
    xs: ['Energy isn’t a product. Light is needed: it goes above the arrow. The products are only glucose and oxygen.'],
    r: 'energy', fix: 'carbon dioxide + water → glucose + oxygen (with “light” written above the arrow).' },
  { id: 'b-limit', s: 'biology', t: 'Photosynthesis', q: 'The rate of photosynthesis increases as light intensity increases, then levels off. Explain why the rate levels off.', m: 2,
    pts: ['Another factor is now limiting the rate', 'e.g. carbon dioxide concentration or temperature'], a: '[[x|Because the rate has reached its maximum.]]',
    n: ['Not earned.', 'Not earned.'],
    xs: ['This repeats “levels off” in other words. Explain why: light is no longer the limiting factor; something else is.'],
    r: 'repeat', fix: 'Light is no longer the limiting factor. Another factor, such as carbon dioxide concentration or temperature, is now limiting the rate.' },
  { id: 'b-punnett', s: 'biology', t: 'Inheritance', q: 'Two parents are both Bb for eye colour. B (brown) is dominant to b (blue). Use a Punnett square to find the probability that their child has blue eyes.', m: 2,
    pts: ['A correct Punnett square: BB, Bb, Bb, bb', 'Probability 0.25 (accept 1/4, 25% or 1 in 4)'],
    a: '[[1|Punnett square: BB, Bb, Bb, bb]]\nProbability = [[x|1 : 3]]',
    n: ['Earned.', 'Not earned: a ratio is not a probability.'],
    xs: ['1 : 3 is a ratio (one blue to three brown). A probability is out of the total: 1/4, 0.25 or 25%.'],
    r: 'format', fix: 'BB, Bb, Bb, bb: one of the four is bb, so the probability is 1/4 (0.25 or 25%).' },

  /* ---------------- Chemistry ---------------- */
  { id: 'c-mgcl', s: 'chemistry', t: 'Bonding', q: 'Magnesium forms Mg²⁺ ions and chlorine forms Cl⁻ ions. Write the formula of magnesium chloride.', m: 1,
    pts: ['MgCl₂'], a: '[[x|MgCl]]',
    n: ['Not earned: the charges don’t balance.'],
    xs: ['One Mg²⁺ needs two Cl⁻ to cancel its charge, so the formula is MgCl₂.'],
    r: 'sense', fix: 'MgCl₂: one Mg²⁺ balances two Cl⁻.' },
  { id: 'c-balance', s: 'chemistry', t: 'Quantitative chemistry', q: 'Balance the equation: H₂ + O₂ → H₂O', m: 1,
    pts: ['2H₂ + O₂ → 2H₂O'], a: 'H₂ + O₂ → [[x|H₂O₂]]',
    n: ['Not earned: the formula of water was changed.'],
    xs: ['Only the big numbers in front can change. H₂O₂ is a different substance (hydrogen peroxide).'],
    r: 'method', fix: '2H₂ + O₂ → 2H₂O' },
  { id: 'c-moles', s: 'chemistry', t: 'Quantitative chemistry', q: 'Calculate the number of moles in 22 g of carbon dioxide (Mr = 44).', m: 2,
    pts: ['M1 for 22 ÷ 44', 'A1 for 0.5 mol'], a: '[[x|44 ÷ 22]] = 2 mol',
    n: ['Not earned: moles = mass ÷ Mr.', 'The answer is 0.5 mol.'],
    xs: ['Upside down. 22 g is half of 44 g, so it must be half a mole.'],
    r: 'method', fix: 'Moles = mass ÷ Mr = 22 ÷ 44 = 0.5 mol.' },
  { id: 'c-alkene', s: 'chemistry', t: 'Organic chemistry', q: 'Describe the test for an alkene and give the result.', m: 2,
    pts: ['Add bromine water', 'It turns from orange to colourless'], a: 'Add [[1|bromine water]]. It goes [[x|clear]].',
    n: ['Earned.', 'Not earned: “clear” is not accepted.'],
    xs: ['“Clear” means see-through, and a coloured solution can be clear. The word is “colourless”.'],
    r: 'terms', fix: 'Add bromine water: it turns from orange to colourless.' },
  { id: 'c-conc', s: 'chemistry', t: 'Quantitative chemistry', q: '25 g of salt is dissolved to make 500 cm³ of solution. Calculate the concentration in g/dm³.', m: 2,
    pts: ['M1 for 25 ÷ 0.5', 'A1 for 50 g/dm³'], a: '[[x|25 ÷ 500]] = 0.05',
    n: ['Not earned: the volume must be in dm³.', 'The answer is 50 g/dm³.'],
    xs: ['The answer is wanted in g/dm³, so convert first: 500 cm³ = 0.5 dm³.'],
    r: 'convert', fix: '500 cm³ = 0.5 dm³, so concentration = 25 ÷ 0.5 = 50 g/dm³.' },
  { id: 'c-catalyst', s: 'chemistry', t: 'Rates of reaction', q: 'Explain how a catalyst increases the rate of a reaction.', m: 2,
    pts: ['Provides an alternative reaction pathway', 'with a lower activation energy'], a: 'A catalyst [[x|gives the particles more energy]] so [[x|they collide more]].',
    n: ['Not earned.', 'Not earned.'],
    xs: ['A catalyst doesn’t give particles energy. It lowers the energy they need: the activation energy.', 'A catalyst doesn’t change how often particles collide.'],
    r: 'terms', fix: 'A catalyst provides an alternative reaction pathway with a lower activation energy, so more collisions are successful.' },
  { id: 'c-compress', s: 'chemistry', t: 'States of matter', q: 'Explain why a gas can be compressed but a solid cannot.', m: 2,
    pts: ['In a gas the particles are far apart, with space between them', 'In a solid the particles are touching (closely packed), so there is no space to push them into'],
    a: '[[1|In a gas the particles are far apart]] so they can be pushed together.',
    n: ['Earned.', 'Not said: the question asks about the solid too.'], xs: [],
    r: 'compare', fix: 'Gas particles are far apart, so they can be pushed closer together. Solid particles are already touching, so there is no space to compress them into.' },

  /* ---------------- Physics ---------------- */
  { id: 'p-speed', s: 'physics', t: 'Motion', q: 'A car travels 3 km in 2 minutes. Calculate its average speed in m/s.', m: 3,
    pts: ['Converts to 3000 m and 120 s', 'M1 for 3000 ÷ 120', 'A1 for 25 m/s'], a: '[[x|3 ÷ 2]] = 1.5 m/s',
    n: ['Not done: the answer is wanted in m/s, so the units must change first.', 'Not earned.', 'The answer is 25 m/s.'],
    xs: ['Kilometres per minute, not metres per second. Convert first: 3 km = 3000 m and 2 min = 120 s.'],
    r: 'convert', fix: '3 km = 3000 m, 2 min = 120 s. Speed = 3000 ÷ 120 = 25 m/s.' },
  { id: 'p-shc', s: 'physics', t: 'Energy', q: '2 kg of water is heated from 20 °C to 30 °C. The specific heat capacity of water is 4200 J/kg °C. Calculate the energy transferred.', m: 2,
    pts: ['M1 for 2 × 4200 × 10', 'A1 for 84 000 J'], a: 'ΔE = m c Δθ\n[[x|= 2 × 4200 × 30]]\n= 252 000 J',
    n: ['Not earned: Δθ is the change in temperature, 30 − 20 = 10 °C, not the final temperature.', 'The answer is 84 000 J.'],
    xs: ['The final temperature was used instead of the change.'],
    r: 'method', fix: 'Δθ = 30 − 20 = 10 °C. ΔE = 2 × 4200 × 10 = 84 000 J.' },
  { id: 'p-halflife', s: 'physics', t: 'Radioactivity', q: 'A radioactive sample has an activity of 800 Bq. Its half-life is 2 hours. Calculate its activity after 6 hours.', m: 2,
    pts: ['M1 for 3 half-lives: 800 → 400 → 200 → 100', 'A1 for 100 Bq'], a: '[[x|800 ÷ 6]] = 133 Bq',
    n: ['Not earned: 6 hours is three half-lives, so the activity halves three times.', 'The answer is 100 Bq.'],
    xs: ['Dividing by the time isn’t how decay works. Count the half-lives instead.'],
    r: 'method', fix: '6 hours = 3 half-lives: 800 → 400 → 200 → 100 Bq.' },
  { id: 'p-insulate', s: 'physics', t: 'Energy', q: 'Explain how cavity wall insulation reduces the rate of energy transfer out of a house.', m: 2,
    pts: ['The foam traps air, which is a poor conductor (a good insulator)', 'This reduces energy transfer by conduction and convection across the cavity'],
    a: '[[x|It keeps the heat in.]]',
    n: ['Not earned.', 'Not earned.'],
    xs: ['This restates what insulation is for. Say how: trapped air is a poor conductor, and it stops convection currents in the gap.'],
    r: 'vague', fix: 'The foam traps air, which is a poor conductor, and stops convection currents forming in the cavity, so less energy is transferred through the walls.' },
  { id: 'p-wind', s: 'physics', t: 'Energy resources', q: 'Give one advantage and one disadvantage of generating electricity using wind turbines.', m: 2,
    pts: ['Advantage, e.g. renewable, or no carbon dioxide released while generating', 'Disadvantage, e.g. unreliable: no electricity when there is no wind'],
    a: 'Advantage: [[1|it is renewable]].\nDisadvantage: [[x|it is bad for the environment]].',
    n: ['Earned.', 'Not earned: too vague.'],
    xs: ['Bad in what way? Give the specific problem, e.g. they don’t generate when there is no wind.'],
    r: 'vague', fix: 'Advantage: it is renewable. Disadvantage: it is unreliable, because no electricity is generated when there is no wind.' },
  { id: 'p-resultant', s: 'physics', t: 'Forces', q: 'A car’s engine provides a driving force of 300 N forwards. Air resistance and friction total 120 N backwards. Calculate the resultant force.', m: 2,
    pts: ['M1 for 300 − 120', 'A1 for 180 N (forwards)'], a: '[[x|300 + 120]] = 420 N',
    n: ['Not earned: forces in opposite directions are subtracted.', 'The answer is 180 N forwards.'],
    xs: ['The resultant can’t be bigger than the driving force when another force is pulling the other way.'],
    r: 'sense', fix: 'Resultant force = 300 − 120 = 180 N, forwards.' },
  { id: 'p-pressure', s: 'physics', t: 'Particle model', q: 'Explain why the pressure of a gas in a sealed container increases when the gas is heated.', m: 3,
    pts: ['The particles move faster (have more kinetic energy)', 'They collide with the walls more often', 'with more force'],
    a: 'The [[1|particles move faster]] so they [[2|hit the walls more often]]. [[x|The particles also expand.]]',
    n: ['Earned.', 'Earned.', 'Not said: faster particles also hit the walls harder.'],
    xs: ['Wrong science: particles don’t get bigger. Adding a wrong statement risks losing a mark it contradicts, so leave it out.'],
    r: 'list', fix: 'The particles move faster, so they collide with the walls more often and with more force, which increases the pressure.' },

  /* ---------------- Geography ---------------- */
  { id: 'g-trend', s: 'geography', t: 'Climate change', q: 'The table shows a country’s average annual temperature: 1960 9.1 °C, 1980 9.3 °C, 2000 9.8 °C, 2020 10.3 °C. Describe the trend.', m: 2,
    pts: ['The temperature increases over time', 'Uses data, e.g. a rise of 1.2 °C, from 9.1 °C in 1960 to 10.3 °C in 2020'], a: '[[1|It has got warmer]] over time.',
    n: ['Earned.', 'Not earned: no figures.'], xs: [],
    r: 'data', fix: 'The temperature increases, from 9.1 °C in 1960 to 10.3 °C in 2020: a rise of 1.2 °C.' },
  { id: 'g-sustain', s: 'geography', t: 'Development', q: 'What is meant by “sustainable development”?', m: 1,
    pts: ['Development that meets the needs of people today without stopping future generations meeting their needs'], a: '[[x|Development that is good for the environment.]]',
    n: ['Not earned: the key idea is the future, not just the environment.'],
    xs: ['Too vague. The definition is about meeting today’s needs without harming future generations’ ability to meet theirs.'],
    r: 'vague', fix: 'Development that meets the needs of people today without stopping future generations from meeting their own needs.' },
  { id: 'g-waterfall', s: 'geography', t: 'Rivers', q: 'Explain how a waterfall forms.', m: 4,
    lv: [[3, 4, 'Clear explanation: the processes are named and linked in the right order.'], [1, 2, 'Basic: some processes named but not linked.']],
    look: ['Hard rock on top of soft rock', 'Soft rock eroded faster (undercutting)', 'An overhang forms and collapses', 'The waterfall retreats upstream'], has: [0, 1, 2], mark: 4,
    a: '[[+|Water flows over hard rock on top of soft rock.]] [[+|The soft rock erodes faster by hydraulic action and abrasion, making an overhang]], which [[+|collapses into the plunge pool]]. [[x|This keeps happening.]]',
    why: 'Level 2, top mark. The processes are named, explained and linked in order. Full marks don’t need perfection: the vague last sentence costs nothing here.',
    plus: ['Sets up the rock types the whole process depends on.', 'Names real erosion processes and links them to the overhang.', 'Completes the sequence.'],
    xs: ['Vague, but harmless. “So the waterfall retreats upstream, leaving a gorge” would be the stronger ending.'],
    r: 'level', fix: 'Already full marks. The best ending: “As this repeats, the waterfall retreats upstream, leaving a steep-sided gorge.”' },
  { id: 'g-traffic', s: 'geography', t: 'Urban issues', q: 'Suggest one way traffic congestion in cities can be reduced.', m: 2,
    pts: ['A strategy, e.g. park and ride, cycle lanes or a congestion charge', 'Developed: how it reduces cars on the road'], a: '[[1|Build park and ride schemes]].',
    n: ['Earned.', 'Not developed: how does it reduce traffic?'], xs: [],
    r: 'develop', fix: 'Build park and ride schemes, so people leave their cars at the edge of the city and take a bus into the centre, reducing the number of cars.' },
  { id: 'g-dtm', s: 'geography', t: 'Development', q: 'Explain why the death rate falls in stage 2 of the demographic transition model.', m: 2,
    pts: ['Improved healthcare (medicine, vaccinations)', 'Developed, e.g. cleaner water and sanitation mean fewer people die from disease'], a: '[[1|Better healthcare]] and [[x|people are richer]].',
    n: ['Earned.', 'Not earned: nothing is developed.'],
    xs: ['Too vague. Richer how, and why would that lower the death rate?'],
    r: 'develop', fix: 'Healthcare improves, with vaccinations and medicines, and clean water and sanitation reduce diseases such as cholera, so fewer people die.' },

  /* ---------------- Business ---------------- */
  { id: 'bs-breakeven', s: 'business', t: 'Finance', q: 'A business has fixed costs of £2,000. It sells each product for £15, and the variable cost of each is £5. Calculate the break-even output.', m: 2,
    pts: ['M1 for 2,000 ÷ (15 − 5)', 'A1 for 200 units'], a: '[[x|2,000 ÷ 15]] = 133.3',
    n: ['Not earned: break-even = fixed costs ÷ contribution per unit (price − variable cost).', 'The answer is 200 units.'],
    xs: ['Divided by the price instead of the contribution, £15 − £5 = £10.'],
    r: 'method', fix: 'Contribution = 15 − 5 = £10 per unit. Break-even = 2,000 ÷ 10 = 200 units.' },
  { id: 'bs-margin', s: 'business', t: 'Finance', q: 'A business has a gross profit of £18,000 and revenue of £60,000. Calculate its gross profit margin.', m: 2,
    pts: ['M1 for 18,000 ÷ 60,000', 'A1 for 30%'], a: '[[1|18,000 ÷ 60,000]] = [[x|0.3]]',
    n: ['Earned.', 'Not earned: a margin is a percentage.'],
    xs: ['Stopped one step early: × 100 turns 0.3 into 30%.'],
    r: 'format', fix: '18,000 ÷ 60,000 × 100 = 30%.' },
  { id: 'bs-stake', s: 'business', t: 'Stakeholders', q: 'What is meant by a “stakeholder”?', m: 1,
    pts: ['A person or group with an interest in (or affected by) a business'], a: '[[x|Someone who owns shares in the business.]]',
    n: ['Not earned: that is a shareholder.'],
    xs: ['A shareholder is one kind of stakeholder. Employees, customers and the local community are stakeholders too.'],
    r: 'terms', fix: 'A person or group with an interest in, or affected by, a business, such as employees, customers or the local community.' },
  { id: 'bs-limited', s: 'business', t: 'Business ownership', q: 'State one benefit of limited liability.', m: 1,
    pts: ['Owners can only lose the money they invested (their personal possessions are safe)'], a: '[[1|The owners can only lose the money they put into the business.]]',
    n: ['Correct.'], xs: [],
    r: 'enough', fix: 'Full marks: one clear sentence is all a “state” question needs.' },
  { id: 'bs-interest', s: 'business', t: 'External influences', q: 'Analyse the impact on a car dealership of a rise in interest rates.', m: 6,
    lv: [[5, 6, 'Detailed analysis: several developed chains of reasoning, applied to the business.'], [3, 4, 'Some analysis: at least one developed chain, some application.'], [1, 2, 'Limited: points stated with little development.']],
    look: ['Impact on customers (fewer buy on credit)', 'Impact on the business’s own borrowing', 'Developed chains of reasoning', 'Applied to a car dealership'], has: [0, 2, 3], mark: 4,
    a: '[[+|Customers who borrow to buy cars will pay more interest, so fewer people will buy cars, which means the dealership’s revenue will fall.]] [[x|Interest rates are set by the Bank of England.]] The business may have loans too.',
    why: 'Level 2, top mark. One excellent chain applied to a car dealership (higher interest, fewer car loans, fewer sales, lower revenue). The second point, the dealership’s own loans, is never developed, and the Bank of England fact is knowledge, not analysis.',
    plus: ['A full chain: cause, effect on customers, effect on the business.'],
    xs: ['True, but not analysis of the impact. It earns nothing here.'],
    r: 'develop', fix: 'Develop the second point: “If the dealership has loans to buy stock, its interest payments rise, so its costs go up and its profit falls.”' },

  /* ---------------- RE ---------------- */
  { id: 're-easter', s: 're', rel: 'chr', t: 'Christian practices', q: 'Explain two ways in which Christians celebrate Easter.', m: 4,
    pts: ['First way, e.g. going to church on Easter Sunday', 'First way developed, e.g. to celebrate Jesus rising from the dead', 'Second way, e.g. giving Easter eggs', 'Second way developed, e.g. eggs are a symbol of new life and the empty tomb'],
    a: 'Christians [[1|go to church on Easter Sunday]] [[2|to celebrate the resurrection of Jesus]]. They also [[3|give Easter eggs]].',
    n: ['Earned.', 'Earned: developed.', 'Earned.', 'Not developed: why eggs?'], xs: [],
    r: 'develop', fix: 'Add: “Eggs are a symbol of new life, like Jesus’ empty tomb.”' },
  { id: 're-pillars', s: 're', rel: 'isl', t: 'Muslim practices', q: 'Give two of the Five Pillars of Sunni Islam.', m: 2, any: 2,
    pts: ['Shahadah (declaration of faith)', 'Salah (prayer)', 'Zakah (charity)', 'Sawm (fasting)', 'Hajj (pilgrimage)'], a: '[[2|Salah (prayer)]] and [[3|Zakah (charity)]]',
    n: ['Another right answer.', 'Earned.', 'Earned.', 'Another right answer.', 'Another right answer.'], xs: [],
    r: 'enough', fix: 'Full marks. Two correct pillars are all it needs.' },
  { id: 're-sawm', s: 're', rel: 'isl', t: 'Muslim practices', q: 'Explain two reasons why Muslims fast during Ramadan. Refer to sacred writings or another source of Muslim belief and teaching in your answer.', m: 5,
    pts: ['First reason', 'First reason developed', 'Second reason', 'Second reason developed', 'A relevant reference to sacred writings or another source of authority'],
    a: 'Muslims fast [[1|because it is one of the Five Pillars]], [[2|so it is a duty that Allah commands]]. [[3|It also helps them understand what it is like to be poor.]] [[5|The Qur’an says fasting is prescribed for believers.]]',
    n: ['Earned.', 'Earned: developed.', 'Earned.', 'Not developed: what difference does that understanding make?', 'Earned: a relevant reference to the Qur’an.'], xs: [],
    r: 'develop', fix: 'Develop the second reason: “…so they are more likely to give generously to those in need, especially through zakah.”' },
  { id: 're-trinity', s: 're', rel: 'chr', t: 'Christian beliefs', q: 'What is meant by “the Trinity”?', m: 1,
    pts: ['One God in three persons: the Father, the Son and the Holy Spirit'], a: '[[x|Christians believe in three gods.]]',
    n: ['Not earned: Christians believe in one God.'],
    xs: ['A serious misunderstanding: the Trinity is one God in three persons, not three gods.'],
    r: 'terms', fix: 'The belief that there is one God in three persons: the Father, the Son and the Holy Spirit.' },

  /* ---------------- English Literature ---------------- */
  { id: 'l-unsex', s: 'englit', tx: 'mac', t: 'Macbeth', q: 'How does Shakespeare present Lady Macbeth in Act 1? (One paragraph from a student’s essay.)', m: 6, lvOnly: true,
    lv: EX_LIT, look: EX_LITLOOK, has: [0, 1, 2, 3], mark: 4,
    a: 'Lady Macbeth calls on the spirits to “[[+|unsex me here]]”. [[+|The command shows how desperate she is to lose the gentleness and pity her society expected of women, so that she can help kill Duncan.]] [[+|A Jacobean audience, who believed women should be obedient, would find this shocking.]]',
    why: 'Level 4. A precise quote, a clear explanation of its effect and context linked to the audience. To reach Level 5, explore the language more closely: why “unsex”, and what does it suggest she thinks power requires?',
    plus: ['A precise, well-chosen quotation.', 'Explains the effect and links it to her aim.', 'Context tied to the audience’s reaction.'], xs: [],
    r: 'level', fix: 'Push it to Level 5 by zooming in: “unsex” suggests she believes cruelty is masculine, so to gain power she must reject her own identity: Shakespeare hints at the cost of ambition before the murder happens.' },
  { id: 'l-retell', s: 'englit', tx: 'acc', t: 'A Christmas Carol', q: 'How does Dickens use the Cratchit family? (One paragraph from a student’s essay.)', m: 6, lvOnly: true,
    lv: EX_LIT, look: EX_LITLOOK, has: [0], mark: 1,
    a: '[[x|In Stave Three the Ghost of Christmas Present takes Scrooge to the Cratchits’ house. They have a small goose and a pudding.]] Tiny Tim says “[[+|God bless Us, Every One!]]” [[x|Then they go to Scrooge’s nephew’s party.]]',
    why: 'Level 1. This retells what happens. There is one relevant quotation, but nothing about how or why Dickens uses the family.',
    plus: ['A relevant quotation, but it needs a comment.'],
    xs: ['Plot summary. The examiner knows the story; what earns marks is why Dickens includes the scene.', 'More plot, moving away from the question.'],
    r: 'retell', fix: 'Dickens uses the Cratchits to show that poverty is not a moral failing: they are “happy, grateful, pleased with one another”, so readers see that the poor deserve compassion, not Scrooge’s contempt.' },
  { id: 'l-spot', s: 'englit', tx: 'mac', t: 'Macbeth', q: 'How does Shakespeare present guilt in Macbeth? (One paragraph from a student’s essay.)', m: 6, lvOnly: true,
    lv: EX_LIT, look: EX_LITLOOK, has: [0, 2], mark: 3,
    a: 'While sleepwalking, Lady Macbeth says “[[+|Out, damned spot!]]” [[+|This shows her guilt has driven her mad, because she thinks she can still see Duncan’s blood on her hands.]] [[x|Shakespeare uses an exclamation mark.]]',
    why: 'Level 3. A good quote and an explained point about guilt. The comment on method is only feature-spotting, and there is no context.',
    plus: ['A precise quotation.', 'An explained point that answers the question.'],
    xs: ['Spotting punctuation earns nothing on its own. What does the exclamation suggest about her state of mind?'],
    r: 'effect', fix: 'Replace the last sentence: “The frantic exclamation shows she has lost control, a reversal of the woman who once said ‘a little water clears us of this deed’.”' },
  { id: 'l-ozy', s: 'englit', tx: 'poe', t: 'Power and Conflict', q: 'How does Shelley present power in “Ozymandias”? (One paragraph from a student’s essay.)', m: 6, lvOnly: true,
    lv: EX_LIT, look: EX_LITLOOK, has: [0, 1, 2, 3], mark: 5,
    a: 'Shelley describes the statue’s “[[+|sneer of cold command]]”. [[+|The harsh sounds of “sneer” and “cold command” make the king seem cruel, yet the sneer survives only as broken stone in an empty desert, so his power has become a joke.]] [[+|Writing in 1818, Shelley may be warning the tyrants of his own time that their power will not last either.]]',
    why: 'Level 5. Thoughtful, developed analysis of sound and irony, with context linked to Shelley’s purpose. Level 6 needs this throughout, with a more critical, exploratory argument.',
    plus: ['A judicious quotation.', 'Analyses sound and irony, not just meaning.', 'Context woven into the poet’s purpose.'], xs: [],
    r: 'level', fix: 'Already strong. Level 6 would weigh alternatives, e.g. that the sculptor “mocked” the king, so art outlasts power.' },

  /* ---------------- English Language ---------------- */
  { id: 'el-struct', s: 'englang', t: 'Reading: structure', src: 'market', q: 'How has the writer structured the extract to interest you as a reader?', m: 8,
    lv: typeof LV !== 'undefined' ? LV.q8 : [[7, 8, 'Detailed, perceptive analysis.'], [5, 6, 'Clear explanation of effects.'], [3, 4, 'Some comment on effects.'], [1, 2, 'Simple comments.']],
    look: ['Identifies structural features (opening, shifts in focus)', 'Relevant references', 'Explains the effect on the reader', 'Uses subject terms'], has: [0], mark: 2,
    a: '[[x|The writer starts with the market and then talks about the oranges and then the fish man and then the radio.]]',
    why: 'Level 1, top mark. It notices the order the extract follows, but only retells it: nothing about why the focus moves or its effect on the reader.',
    plus: [],
    xs: ['Retells the order. Say why the writer does it: the focus narrows from the whole loud market to single details, like a camera zooming in.'],
    r: 'retell', fix: 'The writer opens with a sweeping, noisy view (“the market was already shouting”), then narrows the focus to single details, like the oranges and the fish seller, so the reader feels led through the crowd. Ending on the radio “losing an argument with the rain” shifts the mood towards gloom.' },
  { id: 'el-eval', s: 'englang', t: 'Reading: evaluation', src: 'market', q: '“The writer makes the market feel alive.” To what extent do you agree? (One paragraph; mark it as if the whole answer is like this.)', m: 20,
    lv: typeof LV !== 'undefined' ? LV.eval20 : [[16, 20, 'Perceptive, critical evaluation.'], [11, 15, 'Clear evaluation.'], [6, 10, 'Some evaluation.'], [1, 5, 'Simple evaluation.']],
    look: ['A view on the statement', 'Relevant, precise quotations', 'Explains how methods create the effect', 'Perceptive, critical judgement'], has: [0, 1, 2], mark: 13,
    a: '[[+|I agree, because the personification “the market was already shouting” makes the whole place sound like one noisy creature that woke up before the reader.]] [[+|The simile “glowed like small suns” brings warmth and colour to a “grey” morning, so the market seems to make its own light.]]',
    why: 'Level 3, middle. A clear view, apt quotes and clear explanations of how methods create a sense of life. To go higher, it would need perceptive, critical judgement, e.g. noticing that the extract ends on gloom (“losing an argument with the rain”).',
    plus: ['A clear view, backed by a precise method and explained.', 'A second method, with the contrast with “grey” noticed.'], xs: [],
    r: 'evaluate', fix: 'Add critical judgement: “Yet the writer limits this life: the fish are hidden ‘beneath the gulls’ and the radio is ‘losing an argument with the rain’, hinting that the bustle is fragile.”' },

  /* ---------------- History ---------------- */
  { id: 'h-weimar', s: 'history', t: 'Germany', q: 'Describe two problems faced by the Weimar Republic in 1923.', m: 4,
    pts: ['A problem, e.g. hyperinflation', 'Detail, e.g. by November 1923 a loaf of bread cost 200 billion marks', 'A second problem, e.g. the French occupation of the Ruhr', 'Detail, e.g. in January 1923, after Germany fell behind with reparations'],
    a: 'One problem was [[1|hyperinflation]], which [[x|was very bad]]. Another was [[3|the French occupying the Ruhr]] [[4|because Germany didn’t pay its reparations]].',
    n: ['Earned.', 'Not earned: “very bad” isn’t a detail.', 'Earned.', 'Earned: a specific supporting detail.'],
    xs: ['Too vague for the detail mark. Give a fact, e.g. by November 1923 a loaf of bread cost 200 billion marks.'],
    r: 'specific', fix: 'Hyperinflation: by November 1923 a loaf of bread cost 200 billion marks. The Ruhr: French and Belgian troops occupied it in January 1923, after Germany fell behind with reparations.' },
  { id: 'h-berlin', s: 'history', t: 'The Cold War', q: 'Describe two features of the Berlin Blockade (1948–49).', m: 4,
    pts: ['A feature, e.g. Stalin cut road, rail and canal links into West Berlin', 'Detail, e.g. it began in June 1948', 'A second feature, e.g. the Western Allies flew supplies in (the Berlin Airlift)', 'Detail, e.g. it lasted about 11 months, until May 1949'],
    a: '[[1|Stalin blocked all the roads and railways into West Berlin]]. [[3|The West flew in supplies]] [[4|for about 11 months]].',
    n: ['Earned.', 'Not earned: the first feature has no supporting detail.', 'Earned.', 'Earned.'], xs: [],
    r: 'specific', fix: 'Add a detail to the first feature, e.g. “…starting in June 1948, to force the Western Allies out of Berlin.”' },

  /* ---------------- Computer Science ---------------- */
  { id: 'cs-ram', s: 'compsci', t: 'Systems architecture', q: 'Give two differences between RAM and ROM.', m: 2, any: 2,
    pts: ['RAM is volatile (loses its contents without power); ROM is non-volatile', 'RAM can be read and written; ROM is read-only', 'RAM holds programs and data in use; ROM holds the start-up instructions'],
    a: '[[1|RAM loses its contents when the power is off but ROM doesn’t]]. [[x|RAM is bigger.]]',
    n: ['Earned.', 'Another right answer, not used.', 'Another right answer, not used.'],
    xs: ['Bigger in what way? Vague, and not a defining difference. Compare a precise property.'],
    r: 'compare', fix: 'RAM is volatile but ROM is non-volatile. RAM can be written to, but ROM is read-only.' },
  { id: 'cs-overflow', s: 'compsci', t: 'Data representation', q: 'Add these two 8-bit binary numbers and state the problem that occurs: 1100 1010 + 0100 0111', m: 2,
    pts: ['The 8-bit result 0001 0001, with a carry out of 1', 'Overflow: the result needs 9 bits, so it is too large for 8 bits'], a: '[[1|1 0001 0001]]',
    n: ['Earned.', 'Not earned: the question asks for the problem, and it isn’t named.'], xs: [],
    r: 'command', fix: '1100 1010 + 0100 0111 = 1 0001 0001. The answer needs 9 bits, so an overflow error occurs: only 0001 0001 is stored.' },
  { id: 'cs-abstract', s: 'compsci', t: 'Computational thinking', q: 'What is meant by “abstraction”?', m: 1,
    pts: ['Removing unnecessary detail to focus on what is important'], a: '[[x|Making something simpler.]]',
    n: ['Not earned: too vague.'],
    xs: ['Simpler how? The key idea is removing unnecessary detail.'],
    r: 'vague', fix: 'Removing unnecessary detail from a problem so you can focus on what is important.' },
  { id: 'cs-files', s: 'compsci', t: 'Data representation', q: 'A photo is 3 MB. How many photos can be stored on a 1.5 GB card? (1 GB = 1000 MB)', m: 2,
    pts: ['M1 for 1.5 × 1000 = 1500 MB', 'A1 for 500'], a: '[[x|1.5 ÷ 3]] = 0.5 photos',
    n: ['Not earned: GB and MB were mixed.', 'The answer is 500.'],
    xs: ['Half a photo on a 1.5 GB card can’t be right. Convert first: 1.5 GB = 1500 MB.'],
    r: 'convert', fix: '1.5 GB = 1500 MB, and 1500 ÷ 3 = 500 photos.' },

  /* ---------------- French ---------------- */
  { id: 'f-cinema', s: 'french', t: 'Translation into English', q: 'Translate into English: Le week-end dernier, je suis allé au cinéma avec mes amis.', m: 3,
    pts: ['Last weekend', 'I went to the cinema', 'with my friends'], a: '[[1|Last weekend]], [[x|I go to the cinema]] [[3|with my friends]].',
    n: ['Earned.', 'Not earned: wrong tense.', 'Earned.'],
    xs: ['“Je suis allé” is the perfect tense: “I went”, not “I go”.'],
    r: 'translate', fix: 'Last weekend, I went to the cinema with my friends.' },
  { id: 'f-tennis', s: 'french', t: 'Translation into French', q: 'Translate into French: I like football but I prefer tennis.', m: 3,
    pts: ['J’aime le football', 'mais', 'je préfère le tennis'], a: '[[1|J’aime le football]] [[2|mais]] [[x|je préfère tennis]].',
    n: ['Earned.', 'Earned.', 'Not earned: the article is missing.'],
    xs: ['After verbs of liking and preferring, French needs the article: “le tennis”.'],
    r: 'translate', fix: 'J’aime le football mais je préfère le tennis.' },
  { id: 'f-english', s: 'french', t: 'Reading', q: 'Read: « J’adore mon collège parce que les profs sont sympas. » Answer in English: why does Marc like his school?', m: 1,
    pts: ['The teachers are nice (kind, friendly)'], a: '[[x|Because the profs are sympas.]]',
    n: ['Not earned: the answer is still in French.'],
    xs: ['“Answer in English” means every word. Copying French words shows nothing you understood.'],
    r: 'command', fix: 'Because the teachers are nice.' },

  /* ---------------- Spanish ---------------- */
  { id: 's-futbol', s: 'spanish', t: 'Translation into English', q: 'Translate into English: Mañana voy a jugar al fútbol en el parque.', m: 3,
    pts: ['Tomorrow', 'I am going to play football', 'in the park'], a: '[[1|Tomorrow]] [[x|I played football]] [[3|in the park]].',
    n: ['Earned.', 'Not earned: wrong tense.', 'Earned.'],
    xs: ['“Voy a jugar” is the near future: “I am going to play”. “Mañana” is a clue too.'],
    r: 'translate', fix: 'Tomorrow I am going to play football in the park.' },
  { id: 's-alta', s: 'spanish', t: 'Translation into Spanish', q: 'Translate into Spanish: My sister is very tall.', m: 2,
    pts: ['Mi hermana es', 'muy alta'], a: '[[1|Mi hermana es]] [[x|muy alto]].',
    n: ['Earned.', 'Not earned: the adjective doesn’t agree.'],
    xs: ['“Hermana” is feminine, so the adjective must be “alta”.'],
    r: 'translate', fix: 'Mi hermana es muy alta.' },
  { id: 's-bici', s: 'spanish', t: 'Reading', q: 'Read: « Los fines de semana, Lucía monta en bici con su hermano. » Answer in English: what does Lucía do at weekends?', m: 1,
    pts: ['She rides her bike (goes cycling) with her brother'], a: '[[x|She goes to the mountains with her brother.]]',
    n: ['Not earned.'],
    xs: ['A false friend: “monta” comes from “montar” (to ride), not “montaña” (mountain). “En bici” is the clue.'],
    r: 'text', fix: 'She rides her bike with her brother.' }
];

/* ---------- reading a script's markup ---------- */
function exPrep(o) {
  const segs = [], cr = new Set(), re = /\[\[([^|\]]+)\|([^\]]+)\]\]/g; let last = 0, xi = 0, pi = 0, m;
  while ((m = re.exec(o.a))) {
    if (m.index > last) segs.push({ t: o.a.slice(last, m.index) });
    if (m[1] === 'x') segs.push({ t: m[2], x: xi++ });
    else if (m[1] === '+') segs.push({ t: m[2], p: pi++ });
    else { const ns = m[1].split(',').map(Number); ns.forEach(n => cr.add(n - 1)); segs.push({ t: m[2], c: ns }); }
    last = re.lastIndex;
  }
  if (last < o.a.length) segs.push({ t: o.a.slice(last) });
  o.segs = segs; o.nx = xi; o.np = pi; o.cr = cr;
  if (o.pts) { o.got = o.pts.map((_, i) => cr.has(i)); o.mark = o.em != null ? o.em : Math.min(o.any || o.pts.length, cr.size); }
  return o;
}
EXS.forEach(exPrep);
const EX_BY = Object.fromEntries(EXS.map(o => [o.id, o]));
/* every script checked against its own markup, so a typo can never show a student a wrong mark */
function exSelfTest() {
  const bad = [], ids = new Set();
  for (const o of EXS) {
    const f = msg => bad.push(`${o.id}: ${msg}`);
    if (ids.has(o.id)) f('duplicate id'); ids.add(o.id);
    if (!SUBJ_BY[o.s]) f('unknown subject ' + o.s);
    if (!EX_RULES[o.r]) f('unknown rule ' + o.r);
    if (!o.q || !o.a || !o.fix || !(o.m >= 1)) f('missing question, answer, fix or marks');
    if ((o.xs || []).length !== o.nx) f(`${o.nx} [[x|…]] in the answer, ${(o.xs || []).length} notes`);
    if (o.src && !EX_SRC[o.src]) f('unknown source');
    if (o.tx && !['mac', 'acc', 'je', 'poe'].includes(o.tx)) f('unknown text'); if (o.rel && !['chr', 'isl'].includes(o.rel)) f('unknown religion');
    if (o.pts) {
      if (o.n.length !== o.pts.length) f('one note per point needed');
      if (o.np) f('[[+|…]] is for levels answers');
      for (const c of o.cr) if (c < 0 || c >= o.pts.length || isNaN(c)) f('credits a point that does not exist');
      if ((o.any || o.pts.length) !== o.m) f('marks do not match the scheme');
      if (!(o.mark >= 0 && o.mark <= o.m)) f('mark out of range');
    } else {
      if (!Array.isArray(o.lv) || !o.lv.length) f('no levels');
      if ((o.plus || []).length !== o.np) f(`${o.np} [[+|…]] in the answer, ${(o.plus || []).length} notes`);
      if (o.cr.size) f('numbered marks are for point schemes');
      if (!o.lv.some(([lo, hi]) => o.mark >= lo && o.mark <= hi)) f('mark is in no level');
      if (!o.lvOnly && Math.max(...o.lv.map(l => l[1])) !== o.m) f('top level does not reach the marks');
      if (!o.why || !o.look || !o.has) f('levels need why, look and has');
    }
  }
  return bad;
}

/* ---------- a round of marking ---------- */
let EXR = null; /* { ids, i, from, sub, ticks, mark, manual, lv, shown, res: [{ id, you, ex }] } */
let EX_SUB = 'all';
const exRec = () => tcObj('exm'); /* id → [your mark, examiner's mark, date] */
const exSubs = () => { const mine = new Set(mySubjects().map(s => s.id)); return LEARN.SUBJECTS.filter(s => mine.has(s.id) && EXS.some(o => o.s === s.id)); };
/* Literature answers only for the texts you study, RE answers only for your religions (from your set-up) */
function exFits(o) {
  const mine = (S.me && S.me.subs) || [], lit = mine.find(s => s.id === 'englit'), re = mine.find(s => s.id === 're');
  return !(o.tx && lit && lit.texts && !lit.texts.includes(o.tx)) && !(o.rel && re && re.relig && !re.relig.includes(o.rel));
}
const exPool = sub => { const ok = new Set(exSubs().map(s => s.id)); return EXS.filter(o => ok.has(o.s) && exFits(o) && (sub === 'all' || o.s === sub)); };
const exTol = o => o.lv && !o.lvOnly && o.m >= 8 ? 1 : 0; /* senior examiners allow a mark either way on long answers */
const exMatch = (o, you) => Math.abs(you - o.mark) <= exTol(o);
/* five a round: never-marked first, then the ones you marked differently from the examiner, then the longest ago */
function exPick(sub, n = 5) {
  const R = exRec(), rank = o => { const r = R[o.id]; return !r ? 0 : exMatch(o, r[0]) ? 2 : 1; };
  return shuffleA(exPool(sub)).sort((a, b) => rank(a) - rank(b) || ((R[a.id] || [])[2] || '').localeCompare((R[b.id] || [])[2] || '')).slice(0, n).map(o => o.id);
}
function exOpen(i) { EXR.i = i; const o = EX_BY[EXR.ids[i]]; EXR.ticks = o.pts ? o.pts.map(() => false) : []; EXR.mark = o.pts ? 0 : null; EXR.manual = false; EXR.lv = -1; EXR.shown = false; }
const exCur = () => EXR && EX_BY[EXR.ids[EXR.i]];

/* ---------- drawing ---------- */
const exBadge = (txt, cls) => h('span', { class: 'ex-b ' + cls, 'aria-hidden': 'true' }, txt);
function exAnswer(o, shown) {
  let k = 0, carry = 0; /* the examiner's marks appear one after another, like a pen working down the page */
  const body = o.segs.map((s, i) => {
    const t = carry ? s.t.slice(carry) : s.t; carry = 0;
    if (!shown || (s.c == null && s.x == null && s.p == null)) return t;
    /* punctuation straight after a mark moves inside it, so a full stop never wraps onto a line of its own after the badge */
    const next = o.segs[i + 1], punct = next && next.c == null && next.x == null && next.p == null ? (next.t.match(/^[.,;:!?”’)]+/) || [''])[0] : '';
    carry = punct.length;
    /* the last word and its badge never part, so a badge can't wrap onto a line of its own */
    const at = { style: `animation-delay:${120 + 140 * k++}ms` }, txt = t + punct, cut = txt.search(/\S+\s*$/);
    const tail = badges => [txt.slice(0, cut), h('span', { class: 'ex-nw' }, txt.slice(cut), badges)];
    if (s.c) return h('mark', Object.assign({ class: 'ex-c' }, at), tail(s.c.map(n => exBadge(String(n), 'ok'))));
    if (s.x != null) return h('mark', Object.assign({ class: 'ex-x' }, at), tail(exBadge('✗', 'no')));
    return h('mark', Object.assign({ class: 'ex-p' }, at), tail(exBadge('✓', 'ok')));
  });
  return h('div', { class: 'ex-script' + (shown ? ' shown' : '') },
    h('p', { class: 'ex-cand' }, 'Candidate’s answer'),
    h('div', { class: 'ex-hand' }, body));
}
function exMarking(o) {
  if (o.pts) {
    const cap = o.any || o.pts.length;
    return h('div', { class: 'ex-mark' },
      h('p', { class: 'fb-h' }, 'Mark scheme'),
      h('p', { class: 'muted xs' }, o.any && o.any < o.pts.length ? `Any ${o.any} of these, one mark each. Tick every point the answer clearly earns.` : 'One mark per point. Tick every point the answer clearly earns.'),
      o.pts.map((pt, j) => h('label', { class: 'chk' + (EXR.ticks[j] ? ' d' : '') }, h('input', { type: 'checkbox', checked: !!EXR.ticks[j], 'data-act': 'exTick', 'data-j': j }), checkBox(), h('span', null, pt))),
      h('p', { class: 'fb-h ex-your' }, 'Your mark', h('span', null, EXR.manual ? 'set by you' : 'from your ticks; change it if a rule applies')),
      h('div', { class: 'chips ex-marks', role: 'group', 'aria-label': 'Your mark' }, nums(0, o.m).map(v => chip(String(v), v === EXR.mark, 'exMarkSet', { 'data-m': v, 'aria-label': `${v} mark${v === 1 ? '' : 's'}` }))),
      cap < o.pts.length && h('p', { class: 'muted xs' }, `Most it can score: ${cap}.`),
      B('Check with the examiner', 'exCheck', 'primary wide', { id: 'ex-go' }));
  }
  const L = o.lv, sel = EXR.lv;
  return h('div', { class: 'ex-mark' },
    h('p', { class: 'fb-h' }, o.lvOnly ? 'Which level is this?' : '1. Pick the level that fits best'),
    h('p', { class: 'muted xs' }, 'Read the whole answer, then choose the description that fits it best.'),
    L.map(([lo, hi, d], l) => h('button', { type: 'button', class: 'lvl' + (l === sel ? ' on' : ''), 'data-act': 'exLevel', 'data-l': l, 'aria-pressed': String(l === sel) },
      h('span', { class: 'lvl-h' }, h('b', null, `Level ${o.lvOnly ? lo : L.length - l}`), !o.lvOnly && h('small', null, lo === hi ? ` · ${lo} mark${lo > 1 ? 's' : ''}` : ` · ${lo}–${hi} marks`)), h('span', null, d))),
    !o.lvOnly && sel >= 0 && L[sel][0] !== L[sel][1] && [h('p', { class: 'fb-h' }, '2. Top, middle or bottom of the level?'),
      h('div', { class: 'chips ex-marks', role: 'group', 'aria-label': 'Your mark' }, nums(L[sel][0], L[sel][1]).map(v => chip(String(v), v === EXR.mark, 'exMarkSet', { 'data-m': v })))],
    B('Check with the examiner', 'exCheck', 'primary wide', { id: 'ex-go', disabled: EXR.mark == null }));
}
const markWord = (n, lvOnly) => lvOnly ? `Level ${n}` : `${n} mark${n === 1 ? '' : 's'}`;
function exVerdict(o) {
  const you = EXR.mark, d = you - o.mark, ok = exMatch(o, you), within = ok && d !== 0, lvl = o.lvOnly;
  const head = !d ? 'Spot on' : within ? 'Within tolerance' : d > 0 ? `${lvl ? (d === 1 ? 'One level' : `${d} levels`) : markWord(d)} too generous` : `${lvl ? (-d === 1 ? 'One level' : `${-d} levels`) : markWord(-d)} too harsh`;
  const sub = !d ? 'You marked it exactly as an examiner would.' : within ? 'Senior examiners allow a mark either way on long answers.' : d > 0 ? 'You gave credit the mark scheme doesn’t. See what the examiner didn’t accept.' : 'The answer earned more than you gave it. See what the examiner credited.';
  const rule = EX_RULES[o.r];
  return h('section', { class: 'card ex-verdict ' + (ok ? 'ok' : 'off'), id: 'ex-verdict', tabindex: '-1', 'aria-live': 'polite' },
    h('div', { class: 'ex-vh' },
      h('div', null, h('h2', null, head), h('p', { class: 'muted' }, sub)),
      h('div', { class: 'ex-vs' }, h('span', null, h('b', null, lvl ? `L${you}` : String(you)), h('small', null, 'you')), h('span', { class: 'ex-vs-ex' }, h('b', null, lvl ? `L${o.mark}` : String(o.mark)), h('small', null, 'examiner')))),
    o.pts ? h('ul', { class: 'ex-pts' }, o.pts.map((pt, j) => {
      /* in an "any N of these" scheme that is already full, the unused points are other right answers, not lost marks */
      const g = o.got[j], t = EXR.ticks[j], alt = !g && o.any && o.mark >= o.any, cls = g ? 'ok' : alt ? 'alt' : 'no';
      return h('li', { class: cls }, exBadge(g ? '✓' : alt ? '–' : '✗', g ? 'ok' : alt ? 'dim' : 'no'),
        h('div', null, h('b', null, pt), h('p', null, o.n[j]), g !== t && h('small', { class: 'ex-diff' }, t ? 'You ticked this; the examiner didn’t.' : 'You didn’t tick this; the examiner did.')));
    })) : h('div', { class: 'ex-lvwhy' }, h('p', { class: 'ex-lvmark' }, o.lvOnly ? `Level ${o.mark}` : `${o.mark} out of ${o.m}`), h('p', null, o.why),
      h('ul', { class: 'ex-look' }, o.look.map((l, j) => h('li', { class: o.has.includes(j) ? 'ok' : 'no' }, exBadge(o.has.includes(j) ? '✓' : '–', o.has.includes(j) ? 'ok' : 'dim'), l)))),
    (o.nx > 0 || o.np > 0) && h('ul', { class: 'ex-notes' },
      o.segs.filter(s => s.x != null || s.p != null).map(s => h('li', { class: s.x != null ? 'no' : 'ok' }, exBadge(s.x != null ? '✗' : '✓', s.x != null ? 'no' : 'ok'),
        h('div', null, h('q', null, s.t), h('p', null, s.x != null ? o.xs[s.x] : o.plus[s.p]))))),
    h('div', { class: 'ex-rule' }, h('p', { class: 'ex-rule-h' }, icon('mark'), 'Examiner rule: ', h('b', null, rule[0])), h('p', null, rule[1])),
    h('p', { class: 'ex-fix' }, h('b', null, o.mark === o.m && !o.lvOnly ? 'Why it scores full marks: ' : 'For full marks: '), o.fix),
    h('div', { class: 'row' }, B(EXR.i < EXR.ids.length - 1 ? 'Next answer' : 'See how you did', 'exNext', 'primary grow', { id: 'ex-next' })));
}
function exSummary() {
  const res = EXR.res, ok = res.filter(r => exMatch(EX_BY[r.id], r.you)).length, rules = [...new Set(res.map(r => EX_BY[r.id].r))];
  const harsh = res.filter(r => r.you < EX_BY[r.id].mark - exTol(EX_BY[r.id])).length, kind = res.filter(r => r.you > EX_BY[r.id].mark + exTol(EX_BY[r.id])).length;
  const lean = kind > harsh ? 'You tend to be generous: you credit what you think the student meant. Examiners only credit what is written.'
    : harsh > kind ? 'You tend to be harsh. Real mark schemes give more credit than you might think, so don’t leave out working or short answers.'
    : ok === res.length ? 'You mark like an examiner.' : 'No pattern yet: some generous, some harsh.';
  return h('section', { class: 'card ex-sum', id: 'ex-verdict', tabindex: '-1' },
    h('div', { class: 'card-h' }, h('h2', null, 'Round marked'), h('span', { class: 'pill' }, `${ok} of ${res.length} matched`)),
    h('p', null, lean),
    h('h3', null, 'Rules in this round'),
    h('ul', { class: 'ex-rlist' }, rules.map(k => h('li', null, icon('mark'), h('div', null, h('b', null, EX_RULES[k][0]), h('p', null, EX_RULES[k][1]))))),
    h('div', { class: 'row' }, exPool(EXR.sub).length > 0 && B([icon('play'), 'Mark five more'], 'exStart', 'primary', { 'data-sub': EXR.sub }), B('Done', 'exDone', 'link')));
}
function vExaminer() {
  const subs = exSubs(), sub = subs.some(s => s.id === EX_SUB) ? EX_SUB : 'all';
  if (EXR) {
    const o = exCur(), back = EXR.from === 'subject' ? ['subject', TRACK_NAME(EXR.sub)] : ['mocks', 'Mocks'];
    if (EXR.from === 'subject') SUBJ_SEL = EXR.sub;
    const done = EXR.i >= EXR.ids.length;
    return h('div', { class: 'stack narrow ex' },
      subHero(o && !done ? TRACK_NAME(o.s) : 'Exam skills', 'Be the examiner', back[0], null, back[1]),
      !done && h('div', { class: 'ex-prog' }, h('span', null, `Answer ${EXR.i + 1} of ${EXR.ids.length}`), h('span', { class: 'ex-prog-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': EXR.ids.length, 'aria-valuenow': EXR.i + (EXR.shown ? 1 : 0), 'aria-label': 'Answers marked' }, h('i', { style: `width:${(EXR.i + (EXR.shown ? 1 : 0)) / EXR.ids.length * 100}%` }))),
      done ? exSummary() : [
        o.src && acc('exsrc-' + o.src, h('b', { class: 'src-h' }, EX_SRC[o.src][0]), h('div', { class: 'srcbox' }, EX_SRC[o.src][1]), { open: true }),
        h('section', { class: 'card qcard ex-q' },
          h('div', { class: 'drill-meta' }, h('span', { class: 'pill' }, o.t), h('span', null, `${o.m} mark${o.m > 1 ? 's' : ''}`)),
          h('p', { class: 'qtext' }, o.q),
          exAnswer(o, EXR.shown),
          !EXR.shown && exMarking(o)),
        EXR.shown && exVerdict(o)]);
  }
  const R = exRec(), pool = exPool(sub), seen = Object.keys(R).filter(k => EX_BY[k]), got = new Set(seen.map(k => EX_BY[k].r)), match = seen.filter(k => exMatch(EX_BY[k], R[k][0])).length;
  return h('div', { class: 'stack narrow ex' },
    subHero('Exam skills', 'Be the examiner', 'mocks', 'Read a student’s answer, mark it with the mark scheme, then see how an examiner marked it. Knowing exactly what earns marks is how you stop losing them.', 'Mocks'),
    card('How it works', null, h('ol', { class: 'ex-how' },
      h('li', null, h('b', null, 'Read the answer. '), 'It is a real-style answer, with real-style mistakes.'),
      h('li', null, h('b', null, 'Mark it. '), 'Tick what earns marks, or pick a level for long answers.'),
      h('li', null, h('b', null, 'Compare. '), 'See every mark pinned to the words that earned it, and the rule behind it.'))),
    card('Choose answers', h('span', { class: 'muted' }, `${pool.length} to mark`),
      subs.length > 1 && h('div', { class: 'chips scroll' }, chip('All my subjects', sub === 'all', 'exSub', { 'data-sub': 'all' }), subs.map(s => chip([icon(s.icon), s.name], s.id === sub, 'exSub', { 'data-sub': s.id }))),
      pool.length ? B([icon('play'), `Mark ${Math.min(5, pool.length)} answers`], 'exStart', 'primary wide', { 'data-sub': sub }) : h('p', { class: 'muted' }, 'None of your subjects have answers to mark yet.')),
    card('Examiner rules', h('span', { class: 'muted' }, `${got.size} of ${Object.keys(EX_RULES).length} met`),
      h('p', { class: 'muted xs' }, seen.length ? `You have marked ${seen.length} answer${seen.length === 1 ? '' : 's'} and matched the examiner on ${match}.` : 'Each answer teaches one rule examiners use. They are all here once you have met them.'),
      h('ul', { class: 'ex-rlist' }, Object.entries(EX_RULES).filter(([k]) => got.has(k)).map(([, [t, d]]) => h('li', null, icon('mark'), h('div', null, h('b', null, t), h('p', null, d)))))),
    h('p', { class: 'muted xs center' }, 'Marked the way GCSE mark schemes generally work. Real schemes differ in detail between exam boards.'));
}
VIEWS.examiner = vExaminer; PARENT.examiner = 'mocks'; BACKS.examiner = 'Be the examiner';

/* the subject page's Exam tab gets its own way in, above the exam questions */
const _xqListE = xqList;
xqList = function (s) {
  const n = EXS.filter(o => o.s === s.id && exFits(o)).length;
  const ex = n > 0 ? h('button', { type: 'button', class: 'card rescue-cta ex-cta', 'data-act': 'exStart', 'data-sub': s.id, 'data-from': 'subject' },
    h('span', { class: 'wc-ic' }, icon('mark')), h('span', { class: 'grow' }, h('b', null, 'Be the examiner'), h('small', null, `${n} student answer${n === 1 ? '' : 's'} to mark like an examiner. See what really earns the marks.`)), h('span', { class: 'btn primary sm' }, 'Start')) : null;
  return [ex, _xqListE(s)];
};

Object.assign(ACT, {
  exSub(el) { EX_SUB = el.dataset.sub; render(); },
  exStart(el) {
    const sub = el.dataset.sub || 'all', ids = exPick(sub);
    if (!ids.length) return toast('No answers to mark in this subject yet');
    EXR = { ids, i: 0, from: el.dataset.from || (EXR && EXR.from) || 'mocks', sub, res: [] }; exOpen(0);
    PARENT.examiner = EXR.from === 'subject' ? 'learn' : 'mocks'; /* the bottom bar lights the tab you came from */
    if (TAB === 'examiner') { scrollTo(0, 0); render({ enter: true }); } else go('examiner');
  },
  exMarkSet(el) { if (!EXR || EXR.shown) return; EXR.mark = +el.dataset.m; EXR.manual = true; render(); },
  exLevel(el) {
    const o = exCur(); if (!o || EXR.shown) return;
    const l = +el.dataset.l, [lo, hi] = o.lv[l];
    EXR.lv = l; if (!(EXR.mark >= lo && EXR.mark <= hi)) EXR.mark = lo === hi ? lo : null;
    render({ focus: lo === hi ? '#ex-go' : null });
  },
  exCheck() {
    const o = exCur(); if (!o || EXR.shown) return;
    if (EXR.mark == null) return toast(o.lv && EXR.lv < 0 ? 'Pick a level first' : 'Pick a mark first');
    const you = EXR.mark;
    EXR.shown = true; EXR.res.push({ id: o.id, you });
    exRec()[o.id] = [you, o.mark, dkey()]; dayEv('exm'); save();
    render({ focus: '#ex-verdict' });
    const v = $('#ex-verdict'); if (v) v.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    SFX.play(exMatch(o, you) ? 'correct' : 'click');
  },
  exNext() {
    if (!EXR || !EXR.shown) return;
    if (EXR.i < EXR.ids.length - 1) exOpen(EXR.i + 1); else { EXR.i = EXR.ids.length; xp(10); save(); SFX.play('fanfare'); }
    scrollTo(0, 0); render({ enter: true, focus: EXR.i >= EXR.ids.length ? '#ex-verdict' : null });
  },
  exDone() { const from = EXR && EXR.from, sub = EXR && EXR.sub; EXR = null; PARENT.examiner = 'mocks'; if (from === 'subject') { SUBJ_SEL = sub; go('subject'); } else go('examiner'); }
});
CHG.exTick = el => {
  if (!EXR || EXR.shown) return; const o = exCur();
  EXR.ticks[+el.dataset.j] = el.checked;
  if (!EXR.manual) EXR.mark = Math.min(o.any || o.pts.length, EXR.ticks.filter(Boolean).length);
  render();
};
