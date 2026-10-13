/* Archeron · Study: in-depth guides to the hard topics. Written for AQA GCSE (Maths 8300 and Combined Science
   Trilogy 8464 at Foundation; English Language 8700, Literature 8702; Geography, Business, RE Spec A).
   Markup: "## Heading", "- bullet", "> worked example line", "! common mistake", "* exam tip",
   "? question | answer" (quick check), anything else is a paragraph.
   G(id, subject, title, practice topic ids, lead, body) */
'use strict';
const STUDY = [];
const G = (id, subj, title, topics, lead, body) => STUDY.push({ id, subj, title, topics, lead, body });

/* ================= MATHS ================= */
G('m-fractions', 'maths', 'Fractions: all four operations', ['frac-of', 'frac-add', 'frac-mul'], 'Fractions turn up on almost every Foundation paper, often hidden inside ratio, probability and percentage questions. Four rules cover everything.', `
## What a fraction means
The bottom number (denominator) says how many equal parts the whole is split into. The top number (numerator) says how many of those parts you have. 3/5 means 3 parts out of 5 equal parts.
## Equivalent fractions and simplifying
Multiply or divide the top and bottom by the same number and the value does not change: 2/3 = 4/6 = 10/15.
To simplify, divide top and bottom by their highest common factor. 18/24: HCF is 6, so 18/24 = 3/4.
## Adding and subtracting
You can only add or subtract when the denominators match.
- Find a common denominator (the lowest common multiple of the bottoms).
- Convert each fraction: whatever you do to the bottom, do to the top.
- Add or subtract the tops only. The bottom stays the same.
- Simplify the answer.
> Work out 2/3 + 3/4
> Common denominator 12: 2/3 = 8/12, 3/4 = 9/12
> 8/12 + 9/12 = 17/12 = 1 5/12
## Multiplying
Multiply the tops, multiply the bottoms, then simplify. No common denominator needed.
> 3/4 × 2/5 = 6/20 = 3/10
## Dividing: Keep, Change, Flip
Keep the first fraction, change ÷ to ×, flip the second fraction upside down, then multiply.
> 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6
## Mixed numbers
Turn mixed numbers into improper (top-heavy) fractions before multiplying or dividing: 2 1/3 = (2 × 3 + 1)/3 = 7/3.
> 1 1/2 × 2 2/3 = 3/2 × 8/3 = 24/6 = 4
## Fraction of an amount
Divide by the bottom, multiply by the top.
> 3/8 of 64: 64 ÷ 8 = 8, then 8 × 3 = 24
! Adding the bottoms: 1/3 + 1/4 is NOT 2/7. Make the denominators the same first.
! Flipping the wrong fraction when dividing. Only the second one flips.
! Leaving answers unsimplified. Many mark schemes ask for the simplest form.
* On non-calculator papers show every step: method marks are awarded even if the final answer slips.
* On calculator papers the fraction button (a b/c) checks your answer in seconds.
? Work out 5/6 − 1/4 | Common denominator 12: 10/12 − 3/12 = 7/12
? Work out 3/5 ÷ 9/10 | 3/5 × 10/9 = 30/45 = 2/3
? Find 2/7 of 91 | 91 ÷ 7 = 13, × 2 = 26`);

G('m-percent', 'maths', 'Percentages: the multiplier method', ['pct-of', 'pct-incdec', 'pct-change', 'compound'], 'Percentages are worth a lot of marks and nearly all of them can be done with one idea: the multiplier.', `
## Percent means "out of 100"
35% = 35/100 = 0.35. To turn a percentage into a decimal, divide by 100.
## Finding a percentage of an amount
Non-calculator: build it from 10% (divide by 10), 5% (half of 10%) and 1% (divide by 100).
> 35% of 260: 10% = 26, so 30% = 78; 5% = 13; 35% = 78 + 13 = 91
Calculator: multiply by the decimal. 35% of 260 = 0.35 × 260 = 91.
## Increase and decrease with a multiplier
- Increase by p%: multiply by (100 + p) ÷ 100. Increase by 15% → × 1.15.
- Decrease by p%: multiply by (100 − p) ÷ 100. Decrease by 15% → × 0.85.
> A £240 coat is reduced by 30%. Multiplier 0.70. £240 × 0.7 = £168
## Percentage change
Percentage change = change ÷ original × 100.
> A price rises from £80 to £92. Change = 12. 12 ÷ 80 × 100 = 15% increase
## Reverse percentages (finding the original)
If you know the amount AFTER a percentage change, divide by the multiplier.
> After a 20% increase a TV costs £360. Original = 360 ÷ 1.2 = £300
## Compound interest and depreciation
Repeated percentage change: multiply by the multiplier once for each year, which is the same as using a power.
> £500 at 4% compound interest for 3 years = 500 × 1.04³ = £562.43
> A £12 000 car loses 15% a year. After 2 years: 12 000 × 0.85² = £8670
Simple interest is different: the same amount is added each year (4% of £500 = £20 a year, so £60 over 3 years).
! Finding 20% of the new price and taking it off in a reverse percentage question. Always divide by the multiplier.
! Dividing by the new value in percentage change. Divide by the ORIGINAL.
! Writing money as £68.5. Money needs 2 decimal places: £68.50.
* Check "compound" or "simple" in the question: they give different answers.
? Increase £45 by 12% | 45 × 1.12 = £50.40
? A jacket costs £51 after a 15% discount. What was the original price? | 51 ÷ 0.85 = £60
? 300 rises to 345. Percentage increase? | 45 ÷ 300 × 100 = 15%`);

G('m-ratio', 'maths', 'Ratio and proportion', ['ratio-share', 'ratio-simp'], 'Ratio questions look different every time but always come back to one move: find the value of one part.', `
## What a ratio says
3 : 2 means for every 3 of the first thing there are 2 of the second. There are 5 parts in total.
## Simplifying
Divide every part by the highest common factor. Make the units the same first.
> 45 : 60 → divide by 15 → 3 : 4
> 50 cm : 2 m → 50 : 200 → 1 : 4
## Sharing in a ratio
- Add the parts to find the total number of parts.
- Divide the amount by the total parts: that is one part.
- Multiply one part by each number in the ratio.
> Share £84 in the ratio 3 : 4. 7 parts. 84 ÷ 7 = 12. 3 × 12 = £36 and 4 × 12 = £48
## When you know one share, not the total
> Ali and Ben share sweets in the ratio 2 : 5. Ben gets 30. One part = 30 ÷ 5 = 6. Ali gets 2 × 6 = 12, and the total is 7 × 6 = 42
## Ratio to fractions
In 3 : 5 the first share is 3/8 of the total and the second is 5/8.
## Direct proportion (recipes, best buys)
Find the value for 1, then multiply up. This is the unitary method.
> 4 pens cost £3.60. 1 pen = 90p. 7 pens = £6.30
> Best buy: 500 g for £2.40 → 0.48p per g; 750 g for £3.45 → 0.46p per g. The 750 g pack is better value
! Dividing the amount by one of the ratio numbers instead of by the total parts.
! Forgetting to check: the shares must add up to the total.
* Draw a bar model (boxes for each part) if the wording is confusing.
? Simplify 24 : 36 | Divide by 12 → 2 : 3
? Share 120 in the ratio 1 : 2 : 3 | 6 parts, one part = 20 → 20, 40, 60
? The ratio of boys to girls is 4 : 5 and there are 35 girls. How many boys? | One part = 35 ÷ 5 = 7, so boys = 4 × 7 = 28`);

G('m-algebra', 'maths', 'Algebra: simplify, expand, factorise', ['expand', 'substitute'], 'Algebra is just arithmetic with letters standing in for numbers. These four skills unlock most algebra marks.', `
## Simplifying (collecting like terms)
Like terms have exactly the same letters and powers. Add or subtract their numbers.
> 5a + 3b − 2a + b = 3a + 4b
> x² + 3x + 2x² − x = 3x² + 2x
## Expanding single brackets
Multiply everything inside by the term outside. Signs stay with their terms.
> 4(2x − 3) = 8x − 12
> −3(x − 5) = −3x + 15
## Expanding two brackets
Multiply every term in the first bracket by every term in the second (FOIL: First, Outer, Inner, Last), then collect like terms.
> (x + 3)(x + 5) = x² + 5x + 3x + 15 = x² + 8x + 15
> (x − 4)(x + 2) = x² + 2x − 4x − 8 = x² − 2x − 8
## Factorising (putting brackets back)
Take out the highest common factor of every term.
> 6x + 15 = 3(2x + 5)
> 8x² − 12x = 4x(2x − 3)
Check by expanding your answer: you should get back to the start.
## Factorising quadratics x² + bx + c
Find two numbers that multiply to c and add to b.
> x² + 7x + 12: 3 × 4 = 12 and 3 + 4 = 7 → (x + 3)(x + 4)
> x² − x − 6: −3 × 2 = −6 and −3 + 2 = −1 → (x − 3)(x + 2)
## Substitution
Replace each letter with its number, put negatives in brackets, then use BIDMAS.
> If a = −2 and b = 5, find a² + 3b: (−2)² + 15 = 4 + 15 = 19
! Writing 3(x + 4) = 3x + 4. Multiply EVERY term inside.
! (x + 3)² is not x² + 9. It is (x + 3)(x + 3) = x² + 6x + 9.
! Typing −2² on a calculator gives −4. Use brackets: (−2)² = 4.
* "Factorise fully" means take out the biggest factor possible, including letters.
? Expand and simplify 2(x + 3) + 5(x − 1) | 2x + 6 + 5x − 5 = 7x + 1
? Factorise x² + 5x + 6 | (x + 2)(x + 3)
? Factorise fully 10y² + 15y | 5y(2y + 3)`);

G('m-equations', 'maths', 'Solving and forming equations', ['solve-1', 'solve-2'], 'An equation is a balance. Whatever you do to one side, do to the other, and the unknown is left on its own.', `
## One-step and two-step equations
Undo the operations in reverse order: deal with + and − first, then × and ÷.
> 5x − 7 = 23 → 5x = 30 → x = 6
> x/4 + 3 = 10 → x/4 = 7 → x = 28
## Brackets
Expand first, then solve.
> 3(2x + 1) = 27 → 6x + 3 = 27 → 6x = 24 → x = 4
## Unknowns on both sides
Move the smaller x term so the x's stay positive, then solve.
> 7x + 4 = 3x + 20 → 4x + 4 = 20 → 4x = 16 → x = 4
## Forming equations from words
Let x be the thing you don't know, write the relationship as an equation, then solve it.
> I think of a number, multiply it by 3 and add 8. The answer is 41. → 3x + 8 = 41 → x = 11
> The angles in a triangle are x, 2x and 3x. → 6x = 180 → x = 30, so the angles are 30°, 60°, 90°
## Inequalities
Solve like an equation, but keep the inequality sign. If you multiply or divide by a negative number, flip the sign.
> 3x − 2 < 13 → 3x < 15 → x < 5
List integers that satisfy −2 < n ≤ 3: −1, 0, 1, 2, 3 (open end excluded, closed end included).
## Rearranging formulae
Change the subject exactly as you would solve an equation.
> Make u the subject of v = u + at → u = v − at
! Doing the steps in the wrong order: deal with the + or − before dividing.
! Forgetting to apply an operation to EVERY term on a side.
* Always check: substitute your answer back into the original equation.
? Solve 4(x − 2) = 2x + 6 | 4x − 8 = 2x + 6 → 2x = 14 → x = 7
? Solve 2x + 5 ≥ 17 | 2x ≥ 12 → x ≥ 6
? Make r the subject of A = πr² | r = √(A ÷ π)`);

G('m-sequences', 'maths', 'Sequences and the nth term', ['nth-term'], 'The nth term is a rule that gives any term in a sequence. Once you see the pattern, it takes three lines.', `
## Types of sequence
- Arithmetic (linear): add the same amount each time. 4, 7, 10, 13… (+3)
- Geometric: multiply by the same amount each time. 3, 6, 12, 24… (×2)
- Square numbers: 1, 4, 9, 16…  Triangular numbers: 1, 3, 6, 10…
- Fibonacci-type: add the two previous terms. 1, 1, 2, 3, 5, 8…
## Finding the nth term of a linear sequence
- Find the common difference d.
- Write d × n.
- Compare d × n with the actual first term and add or subtract the difference.
> 5, 9, 13, 17… difference 4 → 4n. When n = 1, 4n = 4 but the term is 5, so add 1 → nth term = 4n + 1
> 20, 17, 14, 11… difference −3 → −3n. When n = 1, −3n = −3 but the term is 20, so add 23 → 23 − 3n
## Using the nth term
Substitute n to find any term. To check if a number is in the sequence, set the nth term equal to it and see if n is a whole number.
> Is 52 in the sequence 4n + 1? 4n + 1 = 52 → n = 12.75. Not a whole number, so no
! Writing n + 4 instead of 4n. The difference goes IN FRONT of n.
! Forgetting the sign when the sequence goes down.
* Always test your rule on the second term too.
? Find the nth term of 2, 8, 14, 20 | Difference 6 → 6n − 4
? Find the 50th term of 3n + 7 | 3 × 50 + 7 = 157
? What type of sequence is 5, 15, 45, 135? | Geometric (multiply by 3)`);

G('m-angles', 'maths', 'Angles: lines, triangles, parallel lines, polygons', ['angles'], 'Angle questions are reliable marks if you know a small set of facts and always name the fact you used.', `
## The basic facts
- Angles on a straight line add up to 180°.
- Angles around a point add up to 360°.
- Vertically opposite angles are equal.
- Angles in a triangle add up to 180°.
- Angles in a quadrilateral add up to 360°.
- An isosceles triangle has two equal sides and two equal base angles.
## Parallel lines
- Alternate angles are equal (the Z shape).
- Corresponding angles are equal (the F shape).
- Co-interior angles add up to 180° (the C or U shape).
## Polygons
Sum of interior angles = (n − 2) × 180°, where n is the number of sides.
Exterior angles of any polygon add up to 360°. For a regular polygon each exterior angle = 360° ÷ n.
Interior angle + exterior angle = 180°.
> Regular hexagon: exterior = 360 ÷ 6 = 60°, interior = 180 − 60 = 120°
> Sum of angles in a pentagon = 3 × 180 = 540°
## Bearings
Measured from North, clockwise, written with three figures: 045°, 270°.
Back bearing = bearing ± 180°.
! Writing "Z angles" as a reason. Examiners want the proper name: "alternate angles are equal".
! Using 180° for a quadrilateral.
* "Give reasons" questions: every step needs a fact written in words. The number alone scores less.
? Find each interior angle of a regular octagon | Exterior 360 ÷ 8 = 45°, interior 135°
? Two angles in a triangle are 52° and 71°. Find the third and give a reason | 57°, because angles in a triangle add up to 180°
? A regular polygon has exterior angles of 24°. How many sides? | 360 ÷ 24 = 15`);

G('m-area', 'maths', 'Area, perimeter, circles and volume', ['area', 'circles'], 'Most of these questions are "choose the right formula, substitute carefully, give the units".', `
## Area formulae to know
- Rectangle: length × width
- Triangle: ½ × base × perpendicular height
- Parallelogram: base × perpendicular height
- Trapezium: ½ × (a + b) × h, where a and b are the parallel sides
## Circles
- Circumference = π × diameter (= 2πr)
- Area = π × r²
- Diameter = 2 × radius
> Radius 7 cm. Area = π × 49 = 153.9 cm². Circumference = π × 14 = 44.0 cm
A semicircle is half the area; its perimeter is half the circumference PLUS the diameter.
## Compound shapes
Split into rectangles and triangles, find each area, then add (or subtract a hole).
## Volume
- Cuboid: length × width × height
- Prism: area of cross-section × length
- Cylinder: πr² × h
> Cylinder r = 3 cm, h = 10 cm: π × 9 × 10 = 282.7 cm³
## Units
Length: cm. Area: cm². Volume: cm³. 1 m = 100 cm, so 1 m² = 10 000 cm² and 1 m³ = 1 000 000 cm³. 1 litre = 1000 cm³.
! Using the slanted side as the height of a triangle or parallelogram. Height must be perpendicular to the base.
! Using the diameter in πr².
! Forgetting the straight edge in a semicircle's perimeter.
* Write the formula first, then substitute. That line alone can earn a method mark.
? Area of a trapezium with parallel sides 5 cm and 9 cm, height 4 cm | ½ × 14 × 4 = 28 cm²
? Perimeter of a semicircle with diameter 10 cm | ½ × π × 10 + 10 = 25.7 cm
? Volume of a triangular prism: triangle base 6 cm, height 4 cm, length 10 cm | ½ × 6 × 4 × 10 = 120 cm³`);

G('m-trig', 'maths', 'Pythagoras and trigonometry', ['pythag'], 'Both are about right-angled triangles. Pythagoras links three sides; trigonometry links sides and angles.', `
## Pythagoras' theorem
a² + b² = c², where c is the hypotenuse (the longest side, opposite the right angle).
- Finding the hypotenuse: square both short sides, ADD, square root.
- Finding a shorter side: square both, SUBTRACT, square root.
> Short sides 5 and 12: 25 + 144 = 169, √169 = 13
> Hypotenuse 17, one side 8: 289 − 64 = 225, √225 = 15
## Labelling for trigonometry
From the angle you are using: the hypotenuse (H) is the longest side, the opposite (O) faces the angle, the adjacent (A) is next to the angle.
## SOH CAH TOA
- sin θ = O ÷ H
- cos θ = A ÷ H
- tan θ = O ÷ A
Pick the ratio that uses the two sides you know or want.
> Find x: angle 35°, hypotenuse 10, x is opposite. sin 35 = x ÷ 10 → x = 10 × sin 35 = 5.74
> Find the angle: opposite 6, adjacent 8. tan θ = 6 ÷ 8 → θ = tan⁻¹(0.75) = 36.9°
## Exact values (non-calculator)
sin 30° = 0.5, cos 60° = 0.5, tan 45° = 1, sin 90° = 1, cos 0° = 1.
! Adding when finding a short side. Short side → subtract.
! Calculator in radians. Check it shows D or DEG.
! Labelling sides before choosing which angle you are using.
* Sense check: the hypotenuse must be the longest side.
? A ladder 6 m long reaches 5 m up a wall. How far is its foot from the wall? | √(36 − 25) = √11 = 3.32 m
? Adjacent 12, angle 40°. Find the opposite | tan 40 × 12 = 10.07
? Opposite 7, hypotenuse 9. Find the angle | sin⁻¹(7 ÷ 9) = 51.1°`);

G('m-prob', 'maths', 'Probability: basics, trees and Venn diagrams', ['prob'], 'Probability is a number from 0 (impossible) to 1 (certain). Write it as a fraction, decimal or percentage, never as "3 in 8".', `
## Basic probability
P(event) = number of ways it can happen ÷ total number of outcomes.
P(not A) = 1 − P(A). All probabilities for one event add up to 1.
> A bag has 4 red and 6 blue counters. P(red) = 4/10 = 2/5. P(not red) = 3/5
## Expected outcomes
Expected number = probability × number of trials.
> P(late) = 0.15. In 200 days expect 0.15 × 200 = 30 late days
## Relative frequency
Relative frequency = times it happened ÷ total trials. More trials make it a more reliable estimate.
## Listing outcomes and sample spaces
For two dice or two spinners, draw a grid of every combination.
> Two dice: 36 outcomes. P(total of 7) = 6/36 = 1/6
## Tree diagrams
- Probabilities on each pair of branches add to 1.
- Multiply ALONG branches for "and".
- ADD the end results for "or".
> P(rain) = 0.3 each day. P(rain on both days) = 0.3 × 0.3 = 0.09. P(rain on exactly one day) = 0.3 × 0.7 + 0.7 × 0.3 = 0.42
Without replacement: the second branch changes because one item has gone.
> 5 red and 3 blue, two picked without replacement. P(both red) = 5/8 × 4/7 = 20/56 = 5/14
## Venn diagrams
Fill the overlap first, then each circle, then the outside. ∩ means "and" (overlap), ∪ means "or" (anything in either circle).
! Adding along branches instead of multiplying.
! Forgetting to reduce the total in "without replacement".
* Check that the final answers on a tree diagram add to 1.
? A fair spinner has 5 equal sections numbered 1 to 5. P(even)? | 2/5
? P(win) = 0.35. P(not win)? | 0.65
? Two coins are flipped. P(two heads)? | 1/2 × 1/2 = 1/4`);

G('m-stats', 'maths', 'Averages, range and frequency tables', ['averages'], 'Four measures, and one table method that comes up every year.', `
## Mean, median, mode and range
- Mean: add all the values, divide by how many there are.
- Median: put them in order, take the middle one (position (n + 1) ÷ 2).
- Mode: the most common value.
- Range: largest − smallest. It measures spread (consistency), not average.
> 4, 8, 8, 10, 15: mean 45 ÷ 5 = 9, median 8, mode 8, range 11
With an even number of values the median is halfway between the middle two.
## Mean from a frequency table
Add an f × x column. Mean = total of f × x ÷ total frequency.
> Goals 0, 1, 2, 3 with frequencies 4, 7, 6, 3. f × x: 0, 7, 12, 9 = 28. Total frequency 20. Mean = 28 ÷ 20 = 1.4 goals
## Grouped data
Use the midpoint of each group as x. The answer is an estimate of the mean. The group with the highest frequency is the modal class.
## Comparing two sets of data
Compare an average AND the range, and say what they mean in context.
> "Class A's mean score is higher (62 vs 55), so they did better on average. Class B's range is smaller, so their scores were more consistent."
## Missing values
If you know the mean, total = mean × number of values.
> The mean of 5 numbers is 12. Four of them add to 47. The fifth is 60 − 47 = 13
! Dividing by the number of rows in a frequency table instead of the total frequency.
! Forgetting to order the data before finding the median.
* "Compare" needs two comparisons, each with a sentence in context.
? Find the median of 7, 3, 9, 1, 5, 11 | Order: 1, 3, 5, 7, 9, 11 → (5 + 7) ÷ 2 = 6
? The mean of 4 numbers is 15. What is their total? | 60
? Which average is affected most by an extreme value? | The mean`);

G('m-number', 'maths', 'Number skills: BIDMAS, negatives, rounding, standard form', ['bidmas', 'negatives', 'rounding', 'std-form'], 'The quick marks at the start of every paper. Get these automatic and you buy time for harder questions.', `
## Order of operations (BIDMAS)
Brackets, Indices (powers and roots), Division and Multiplication (left to right), Addition and Subtraction (left to right).
> 20 − 3 × 4 = 20 − 12 = 8;  (20 − 3) × 4 = 68;  2 + 3² = 11
## Negative numbers
- Adding a negative = subtracting: 5 + (−3) = 2.
- Subtracting a negative = adding: 5 − (−3) = 8.
- Multiplying or dividing: same signs give positive, different signs give negative. −4 × −3 = 12, −12 ÷ 3 = −4.
## Rounding
- Decimal places: count digits after the point.
- Significant figures: start at the first non-zero digit.
- Look at the next digit: 5 or more rounds up.
> 3.4672 to 2 d.p. = 3.47;  0.004581 to 2 s.f. = 0.0046;  48 520 to 2 s.f. = 49 000
## Estimating
Round every number to 1 significant figure, then calculate.
> 41.2 × 9.7 ÷ 19.8 ≈ 40 × 10 ÷ 20 = 20
## Standard form
A × 10ⁿ where 1 ≤ A < 10. Large numbers have positive n, small numbers negative n.
> 4 300 000 = 4.3 × 10⁶;  0.00072 = 7.2 × 10⁻⁴
> (3 × 10⁴) × (5 × 10³) = 15 × 10⁷ = 1.5 × 10⁸
## Index laws
aᵐ × aⁿ = aᵐ⁺ⁿ; aᵐ ÷ aⁿ = aᵐ⁻ⁿ; (aᵐ)ⁿ = aᵐⁿ; a⁰ = 1.
! 48 520 to 2 s.f. is NOT 49. Keep the size of the number with zeros.
! 15 × 10⁷ is not standard form: the first number must be less than 10.
* Estimation questions want to see your rounded numbers written down.
? Work out −7 − (−10) | 3
? Write 0.000 56 in standard form | 5.6 × 10⁻⁴
? Simplify x⁵ × x³ ÷ x² | x⁶`);

G('m-graphs', 'maths', 'Straight-line graphs: y = mx + c', [], 'Every straight line has an equation y = mx + c. m tells you how steep it is; c tells you where it crosses the y-axis.', `
## Plotting a line from its equation
Make a table of values: choose x values, work out y, plot the points, join them with a ruler.
> y = 2x − 1: x = 0 → −1, x = 1 → 1, x = 2 → 3, x = 3 → 5
## Gradient (m)
Gradient = change in y ÷ change in x ("rise over run"). Uphill left to right is positive; downhill is negative.
> Through (1, 3) and (4, 12): gradient = (12 − 3) ÷ (4 − 1) = 3
## y-intercept (c)
Where the line crosses the y-axis (x = 0).
> y = −4x + 7: gradient −4, crosses at (0, 7)
## Finding the equation of a line
Work out the gradient, then substitute one point to find c.
> Gradient 3 through (1, 3): 3 = 3 × 1 + c → c = 0 → y = 3x
## Parallel lines
Parallel lines have the same gradient. y = 2x + 5 is parallel to y = 2x − 3.
## Real-life graphs
On a distance-time graph the gradient is speed. A horizontal line means stopped. Steeper means faster.
! Getting change in x over change in y the wrong way round.
! Forgetting the negative sign when the line goes downhill.
* Rearrange equations into y = mx + c first: 2y = 6x + 4 becomes y = 3x + 2.
? What is the gradient of y = 5 − 2x? | −2
? Where does y = 3x + 4 cross the y-axis? | (0, 4)
? Are y = 4x + 1 and y = 4x − 7 parallel? | Yes, both have gradient 4`);

G('m-measures', 'maths', 'Speed, units and compound measures', ['sdt'], 'Speed, density and pressure are all "one thing divided by another". Units are where marks are lost.', `
## Speed, distance, time
Speed = distance ÷ time; distance = speed × time; time = distance ÷ speed.
> 150 miles in 2 hours 30 minutes: 150 ÷ 2.5 = 60 mph
## Converting time
Minutes to hours: divide by 60. 45 minutes = 0.75 hours; 20 minutes = 1/3 hour.
2 hours 15 minutes = 2.25 hours, NOT 2.15.
## Density and pressure
Density = mass ÷ volume (g/cm³ or kg/m³). Pressure = force ÷ area (N/m²).
> Mass 540 g, volume 200 cm³: density = 2.7 g/cm³
## Unit conversions
1 km = 1000 m; 1 m = 100 cm; 1 cm = 10 mm; 1 kg = 1000 g; 1 litre = 1000 ml.
Speed: 72 km/h = 72 000 m ÷ 3600 s = 20 m/s.
## Time calculations
Use a number line or count up in chunks rather than subtracting times like decimals.
> 09:45 to 13:20: 09:45 → 10:00 is 15 min, → 13:00 is 3 h, → 13:20 is 20 min. Total 3 h 35 min
! Writing 1.5 hours as 1 hour 50 minutes. 0.5 hours is 30 minutes.
* Write the units at every step; they tell you which formula to use.
? A car travels at 48 mph for 15 minutes. How far? | 48 × 0.25 = 12 miles
? Convert 3.5 hours to hours and minutes | 3 hours 30 minutes
? A 2 kg block has a volume of 250 cm³. Density in g/cm³? | 2000 ÷ 250 = 8 g/cm³`);

/* ================= BIOLOGY ================= */
G('b-transport', 'biology', 'Diffusion, osmosis and active transport', ['b-transport', 'bc-osmosis', 'd-b-cells'], 'Three ways substances move in and out of cells. The exam loves asking you to compare them.', `
## Diffusion
The net movement of particles from an area of higher concentration to an area of lower concentration. It is passive: no energy from respiration is needed.
Examples: oxygen into blood in the lungs; carbon dioxide into leaves; urea from cells into blood.
Diffusion is faster when there is a bigger concentration difference (steeper gradient), a higher temperature, or a larger surface area.
## Osmosis
The diffusion of WATER from a dilute solution to a more concentrated solution through a partially permeable membrane.
- Animal cell in pure water: water moves in, the cell may burst.
- Animal cell in strong salt solution: water moves out, the cell shrivels.
- Plant cell in water: becomes turgid (firm); the cell wall stops it bursting.
## Active transport
Moves substances from a more dilute solution to a more concentrated solution (AGAINST the concentration gradient). It needs energy from respiration.
Examples: root hair cells take in mineral ions from dilute soil water; glucose is absorbed from the gut into the blood.
## Surface area to volume ratio
Small organisms have a large surface area compared with their volume, so diffusion across the surface is enough. Large organisms need exchange surfaces (alveoli, villi, gills, root hairs) and transport systems.
Good exchange surfaces have a large surface area, thin walls (short diffusion distance), a good blood supply and (in lungs) ventilation.
## Required practical: osmosis in potato
- Cut equal cylinders of potato, weigh them, place in sugar solutions of different concentrations.
- After a set time, blot dry and reweigh.
- Calculate % change in mass = change ÷ starting mass × 100.
- Gain in mass: water moved in (the solution was more dilute than the potato). Loss: water moved out.
> 2.50 g becomes 2.80 g: change 0.30 g. 0.30 ÷ 2.50 × 100 = +12%
! Saying water moves "from high to low concentration" in osmosis without saying WATER or "dilute to concentrated". Be precise.
! Forgetting that active transport needs ENERGY from RESPIRATION. Both words earn marks.
* Use % change, not mass change, because the potato pieces start at different masses.
? Why do root hair cells contain many mitochondria? | To release energy by respiration for active transport of mineral ions
? A plant cell is placed in pure water. What happens? | Water enters by osmosis and the cell becomes turgid
? Give two factors that increase the rate of diffusion | Larger concentration gradient, higher temperature (or larger surface area)`);

G('b-enzymes', 'biology', 'Enzymes and digestion', ['b-digestion', 'd-b-organisation'], 'Enzymes are biological catalysts. Almost every enzyme question is really about the shape of the active site.', `
## What enzymes do
Enzymes are proteins that speed up reactions in living things without being used up.
## Lock and key model
Each enzyme has an active site with a specific shape. Only a substrate with the matching shape fits (like a key in a lock). The enzyme–substrate complex forms, the reaction happens, and the products leave.
## Temperature
- As temperature rises, molecules move faster and collide more, so the rate increases.
- Above the optimum (about 37 °C for human enzymes) the active site changes shape: the enzyme is denatured.
- The substrate no longer fits, so the rate falls quickly to zero. Denaturing is permanent.
## pH
Each enzyme has an optimum pH. Pepsin (stomach protease) works best at about pH 2; most other enzymes near pH 7. The wrong pH changes the active site's shape.
## Digestive enzymes
- Amylase: starch → sugars (made in salivary glands, pancreas, small intestine)
- Protease: proteins → amino acids (stomach, pancreas, small intestine)
- Lipase: lipids → fatty acids + glycerol (pancreas, small intestine)
- Bile (made in liver, stored in gall bladder) is NOT an enzyme. It neutralises stomach acid and emulsifies fats into small droplets, giving lipase a larger surface area.
## Food tests
- Starch: iodine turns orange-brown → blue-black.
- Sugars: Benedict's solution, heat in a water bath → brick red.
- Protein: Biuret reagent turns blue → purple.
- Lipids: Sudan III stains a red layer.
## Required practical: pH and amylase
Mix amylase and starch at different pHs. Every 30 seconds take a drop and test with iodine on a spotting tile. Record the time until iodine stops turning blue-black: the shortest time is the optimum pH. Keep temperature constant with a water bath.
! Saying the enzyme is "killed". Enzymes are not alive: they are DENATURED.
! Calling bile an enzyme.
* For "explain" marks link three steps: temperature too high → active site changes shape → substrate no longer fits.
? What happens to an enzyme above its optimum temperature? | The active site changes shape (denatures) so the substrate cannot fit
? Which enzyme digests fats, and into what? | Lipase; fatty acids and glycerol
? How does bile help digestion? | Neutralises stomach acid and emulsifies fats, increasing surface area for lipase`);

G('b-energy', 'biology', 'Photosynthesis and respiration', ['b-energy', 'b-plants', 'd-b-energy'], 'Two reactions that are almost the reverse of each other. Learn both equations word for word.', `
## Photosynthesis
carbon dioxide + water → glucose + oxygen (using light energy)
6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
It is endothermic: energy is transferred from the environment (light) to the chloroplasts.
## Limiting factors
The rate is held back by whichever factor is in shortest supply: light intensity, carbon dioxide concentration, or temperature (and the amount of chlorophyll).
On a graph, the rate rises then levels off: where it levels off, a different factor has become limiting.
Farmers use greenhouses with heaters, lamps and extra CO₂ to increase growth, but only while the cost is less than the extra profit.
## Uses of glucose in plants
Respiration; converted to insoluble starch for storage; cellulose for cell walls; fats and oils for storage; combined with nitrate ions to make amino acids for proteins.
## Required practical: light intensity
Count oxygen bubbles from pondweed (or measure gas volume) with a lamp at different distances. Rate increases as the lamp gets closer. Light intensity follows an inverse square law: halve the distance, four times the light.
## Aerobic respiration
glucose + oxygen → carbon dioxide + water. Happens continuously in mitochondria. Exothermic: transfers energy for movement, keeping warm and building molecules.
## Anaerobic respiration
- In muscles: glucose → lactic acid. Much less energy is transferred. Lactic acid builds up, causing fatigue and an oxygen debt.
- In plants and yeast: glucose → ethanol + carbon dioxide. In yeast this is fermentation, used to make bread and alcohol.
## During exercise
Heart rate, breathing rate and breath volume increase to supply more oxygen and glucose and remove more carbon dioxide. After exercise, the oxygen debt is repaid: extra oxygen reacts with lactic acid in the liver.
! Saying plants photosynthesise instead of respiring. Plants respire ALL the time; they photosynthesise only in the light.
! Saying respiration "makes" energy. Energy is TRANSFERRED, never made.
* Graph questions: name the limiting factor at each part of the curve.
? Write the word equation for aerobic respiration | glucose + oxygen → carbon dioxide + water
? Why does the rate of photosynthesis level off as light increases? | Another factor (CO₂ or temperature) becomes limiting
? What is produced by anaerobic respiration in yeast? | Ethanol and carbon dioxide`);

G('b-disease', 'biology', 'Disease, immunity and medicines', ['b-disease', 'b-immune', 'd-b-disease'], 'How pathogens make us ill, how the body fights back, and how vaccines and medicines help.', `
## Pathogens
Microorganisms that cause infectious disease: bacteria, viruses, fungi and protists.
- Bacteria reproduce quickly and release toxins that damage tissues.
- Viruses live and reproduce inside cells, damaging them.
## Diseases to know
- Measles (virus): fever and red rash, spread by droplets. Prevented by vaccination.
- HIV (virus): flu-like illness then attacks immune cells; leads to AIDS. Spread by sexual contact and body fluids. Controlled with antiretroviral drugs.
- Tobacco mosaic virus (plants): mosaic pattern on leaves, less photosynthesis.
- Salmonella (bacteria): food poisoning from undercooked food. UK poultry is vaccinated.
- Gonorrhoea (bacteria): STD, treated with antibiotics; some strains are now resistant. Condoms prevent spread.
- Rose black spot (fungus): black spots, leaves fall, less photosynthesis. Treated with fungicides.
- Malaria (protist): spread by mosquitoes; recurring fever. Prevented with nets and insecticides.
## Non-specific defences
Skin is a barrier; nose hairs and mucus trap particles; cilia in the trachea move mucus up; stomach acid kills pathogens.
## The immune system: white blood cells
- Phagocytosis: they engulf and digest pathogens.
- They produce antibodies that lock on to specific antigens on the pathogen.
- They produce antitoxins that neutralise toxins.
## Vaccination
A dead or inactive form of the pathogen is injected. White blood cells make antibodies. If the real pathogen enters later, the right antibodies are made very quickly, so you do not become ill. If most people are vaccinated, the disease cannot spread easily (herd immunity).
## Medicines
- Antibiotics kill bacteria inside the body. They do NOT work on viruses.
- Painkillers treat symptoms but do not kill pathogens.
- Overuse of antibiotics leads to antibiotic-resistant bacteria such as MRSA.
## Developing new drugs
Preclinical testing on cells, tissues and animals → clinical trials on healthy volunteers (low doses, check safety) → patients (find the best dose). Double-blind trials use a placebo; neither patients nor doctors know who has which.
! Saying antibodies kill viruses by themselves, or that antibiotics treat viral infections.
* "Explain how a vaccine works" has a clear three-step answer: dead pathogen → antibodies made → fast response next time.
? Why can't antibiotics treat a cold? | Colds are caused by viruses; antibiotics only kill bacteria
? What is a placebo used for? | A comparison, to check the drug's effect is real
? Give three ways white blood cells protect us | Phagocytosis, antibodies, antitoxins`);

G('b-homeostasis', 'biology', 'Homeostasis: nerves, hormones and blood glucose', ['b-hormones', 'b-nerves', 'd-b-homeostasis'], 'Keeping conditions inside the body stable. Learn the reflex arc and the blood glucose loop as step-by-step sequences.', `
## Homeostasis
The regulation of internal conditions (temperature, blood glucose, water) at optimum levels, in response to internal and external changes. Control systems have receptors, a coordination centre (brain, spinal cord or pancreas) and effectors (muscles or glands).
## The nervous system
stimulus → receptor → sensory neurone → CNS (coordinator) → motor neurone → effector → response
Signals pass across synapses as chemicals that diffuse across the gap.
## Reflex actions
Automatic, fast responses that do not involve the conscious brain, protecting the body (pulling your hand from a hot object).
stimulus → receptor → sensory neurone → relay neurone (spinal cord) → motor neurone → effector (muscle) → response
## Required practical: reaction time
Use the ruler-drop test or a computer. Repeat, take a mean, and investigate a factor such as caffeine. Keep other variables (same hand, same person) the same.
## The endocrine system
Glands secrete hormones into the blood, which carry them to target organs. Hormonal responses are slower than nervous ones but last longer.
- Pituitary gland: the "master gland" that controls other glands.
- Pancreas: insulin; thyroid: thyroxine; adrenal glands: adrenaline; ovaries: oestrogen; testes: testosterone.
## Controlling blood glucose
- Blood glucose rises after a meal → pancreas releases insulin → cells take in glucose; liver and muscles store it as glycogen → blood glucose falls.
- Type 1 diabetes: the pancreas does not make enough insulin. Treated with insulin injections.
- Type 2 diabetes: body cells stop responding to insulin. Linked to obesity. Treated with a carbohydrate-controlled diet and exercise.
## Reproductive hormones
FSH (pituitary) makes eggs mature; oestrogen builds the uterus lining; LH (pituitary) triggers ovulation; progesterone maintains the lining. Contraceptive pills use hormones to stop eggs maturing or being released.
! Mixing up glucose, glycogen and glucagon. Glycogen is the STORE.
! Describing a reflex with the brain deciding. Reflexes bypass conscious thought.
* Sequence questions are easy marks: learn the chains in order, word for word.
? What is the role of the relay neurone in a reflex arc? | Carries the impulse from the sensory neurone to the motor neurone in the spinal cord
? What is the difference between Type 1 and Type 2 diabetes? | Type 1: no insulin made; Type 2: cells don't respond to insulin
? Give two differences between nervous and hormonal responses | Nervous: faster, shorter-lasting, electrical; hormonal: slower, longer-lasting, chemical in the blood`);

G('b-genetics', 'biology', 'Inheritance and genetic crosses', ['b-genes', 'd-b-genetics'], 'From DNA to Punnett squares. The vocabulary is half the battle.', `
## DNA, genes and chromosomes
DNA is a polymer made of two strands in a double helix. It is found in chromosomes in the nucleus. A gene is a small section of DNA that codes for a particular protein. The genome is all of an organism's genetic material.
## Key vocabulary
- Allele: a different version of a gene.
- Dominant: always expressed if present (capital letter, B). Recessive: only expressed if two copies (lower case, b).
- Homozygous: two identical alleles (BB or bb). Heterozygous: two different alleles (Bb).
- Genotype: the alleles (Bb). Phenotype: the characteristic you see (brown eyes).
## Meiosis and mitosis
Mitosis makes two identical body cells for growth and repair. Meiosis makes four genetically different gametes with half the chromosomes (23 in humans), so fertilisation restores 46.
## Punnett squares
- Write each parent's alleles.
- Put one parent's gametes along the top, the other's down the side.
- Fill each box with one allele from each.
- Give the ratio or probability the question asks for.
> Two carriers of cystic fibrosis, Ff × Ff. Offspring: FF, Ff, Ff, ff. P(cystic fibrosis, ff) = 1/4 = 25%. Ratio unaffected : affected = 3 : 1
## Sex determination
Females XX, males XY. Each egg carries X; sperm carry X or Y, so there is a 50% chance of a boy or a girl.
## Inherited disorders
Polydactyly (extra fingers or toes) is caused by a DOMINANT allele. Cystic fibrosis (a disorder of cell membranes) is caused by a RECESSIVE allele. Embryo screening can detect them but raises ethical issues (cost, discarded embryos, "designer babies").
! Mixing up genotype and phenotype.
! Giving a ratio when the question asks for a probability (or the reverse).
* Show the gametes clearly in your Punnett square. There is often a mark just for that.
? What is a heterozygous genotype? | Two different alleles, e.g. Bb
? Bb × bb. What proportion are bb? | 50%
? How many chromosomes are in a human egg cell? | 23`);

G('b-evolution', 'biology', 'Variation, evolution and selective breeding', ['b-genes', 'd-b-genetics'], 'Natural selection is a six-step story. Tell it in order and you get full marks.', `
## Variation
Differences between individuals are caused by genes, the environment, or both. Mutations (changes in DNA) happen continuously; most have no effect, a few create a new characteristic.
## Natural selection (Darwin)
- Individuals in a population show variation.
- There is competition for food, mates and territory, and threats from predators and disease.
- Those with characteristics best suited to the environment are more likely to survive.
- They reproduce and pass on their alleles.
- Over many generations the useful characteristic becomes more common.
- This is evolution. If populations change so much they can no longer interbreed to produce fertile offspring, a new species has formed.
## Antibiotic resistance as evidence
A mutation makes some bacteria resistant. The antibiotic kills the others. Resistant bacteria survive, reproduce quickly and spread. To slow this: only prescribe antibiotics when needed, finish the course, and limit their use in farming.
## Evidence for evolution
Fossils show how organisms changed over time (though the record is incomplete). Antibiotic resistance shows evolution happening now.
## Selective breeding
Humans choose parents with desired characteristics (high milk yield, disease resistance), breed them, select the best offspring and repeat over many generations. Risk: inbreeding, which reduces variation and increases inherited disorders.
## Genetic engineering
Adding a gene from one organism to another, such as bacteria making human insulin or GM crops that resist pests. Benefits include bigger yields; concerns include effects on wild populations and long-term health.
## Classification
Linnaeus: kingdom, phylum, class, order, family, genus, species. Binomial names use genus and species (Homo sapiens). The three-domain system (Archaea, Bacteria, Eukarya) is based on chemical analysis.
! Saying organisms "decide" or "try" to adapt. Mutations are random; selection picks which survive.
* Use the words: variation, competition, survive, reproduce, pass on alleles, over many generations.
? Why are antibiotic-resistant bacteria becoming more common? | Resistant bacteria survive antibiotics, reproduce and pass on the resistance
? What is a species? | A group of organisms that can breed together to produce fertile offspring
? Give one risk of selective breeding | Inbreeding, which reduces variation and increases genetic disease`);

G('b-ecology', 'biology', 'Ecology: ecosystems, cycles and sampling', ['b-ecology', 'd-b-ecology'], 'How living things depend on each other and on their environment, and how scientists measure it.', `
## Levels of organisation
Individual → population (one species) → community (all species) → ecosystem (community plus the non-living environment).
## Factors
- Abiotic (non-living): light intensity, temperature, moisture, soil pH and minerals, wind, CO₂, oxygen.
- Biotic (living): food availability, new predators, new pathogens, competition.
## Food chains and predator–prey cycles
Producers (plants, using photosynthesis) → primary consumers → secondary consumers. Arrows show the direction of energy flow. When prey numbers rise, predator numbers rise shortly after; then prey fall, then predators fall, giving out-of-step cycles.
## Interdependence
Species depend on each other for food, shelter, pollination and seed dispersal. Removing one species can affect the whole community.
## The carbon cycle
- Photosynthesis removes CO₂ from the air.
- Respiration (plants, animals, decomposers) and combustion release CO₂.
- Feeding passes carbon along food chains.
- Decomposers break down dead material, releasing CO₂ and returning mineral ions to the soil.
## The water cycle
Evaporation and transpiration → condensation into clouds → precipitation → run-off and drainage.
## Required practical: sampling with quadrats
- Place quadrats at random (random number coordinates) to avoid bias.
- Count organisms in each and find the mean.
- Population estimate = mean per quadrat × number of quadrats that would fit in the whole area.
- Use a transect (quadrats along a line) to see how distribution changes, e.g. away from a hedge.
## Biodiversity and human impact
Biodiversity is the variety of species. Human impacts: pollution, deforestation, peat bog destruction, global warming. Protection: breeding programmes, protecting habitats, field margins and hedgerows, reducing deforestation and recycling.
! Food chain arrows pointing the wrong way: they point TO the organism that eats.
* For sampling: random placement, many quadrats, calculate a mean, scale up.
? 4 quadrats of 1 m² have 6, 9, 5 and 8 daisies. The field is 200 m². Estimate the population | Mean 7 per m² × 200 = 1400
? Name two processes that release carbon dioxide | Respiration and combustion (or decay)
? Give one abiotic factor | e.g. light intensity, temperature, soil pH`);

/* ================= CHEMISTRY ================= */
G('c-atoms', 'chemistry', 'Atomic structure and the periodic table', ['c-atoms', 'c-electrons', 'c-groups', 'd-c-atoms'], 'Everything in chemistry depends on how electrons are arranged. Learn this and the rest falls into place.', `
## Inside an atom
- Proton: relative mass 1, charge +1, in the nucleus.
- Neutron: relative mass 1, charge 0, in the nucleus.
- Electron: tiny mass, charge −1, in shells around the nucleus.
Atoms have no overall charge because protons = electrons. The nucleus is tiny compared with the atom.
## Atomic number and mass number
Atomic number = number of protons. Mass number = protons + neutrons. Neutrons = mass number − atomic number.
> Sodium: atomic number 11, mass number 23 → 11 protons, 11 electrons, 12 neutrons
Isotopes: atoms of the same element with different numbers of neutrons (carbon-12 and carbon-14).
## Electron arrangement
Shells fill in order: 2 in the first, then 8, then 8 (for the first 20 elements).
> Na (11): 2,8,1   Cl (17): 2,8,7   Ca (20): 2,8,8,2
The number of outer electrons = the group number. The number of shells = the period.
## The atom model through history
Solid ball (Dalton) → plum pudding (Thomson, after discovering electrons) → nuclear model (Rutherford's alpha scattering: most went straight through, so the atom is mostly empty space with a tiny, dense, positive nucleus) → electrons in shells (Bohr) → neutrons (Chadwick).
## Groups
- Group 0 (noble gases): full outer shell, so unreactive. Boiling points increase down the group.
- Group 1 (alkali metals): one outer electron, lost easily. React with water to make a hydroxide and hydrogen. More reactive DOWN the group, because the outer electron is further from the nucleus and lost more easily.
- Group 7 (halogens): seven outer electrons, gain one. Diatomic (Cl₂). LESS reactive down the group. A more reactive halogen displaces a less reactive one from its salt solution.
## Metals and non-metals
Metals are on the left and form positive ions. Non-metals are on the right and do not.
## Mixtures and separation
Filtration (insoluble solid from liquid), crystallisation (soluble solid from solution), simple distillation (liquid from solution), fractional distillation (liquids with different boiling points), chromatography (dyes).
! Saying Group 7 gets MORE reactive down the group. It is the opposite of Group 1.
* "Explain the trend" in Group 1: more shells → outer electron further from nucleus → less attraction → lost more easily → more reactive.
? How many neutrons are in ³⁵Cl (atomic number 17)? | 18
? Write the electron arrangement of magnesium (12) | 2,8,2
? Why are noble gases unreactive? | They have a full outer shell of electrons`);

G('c-bonding', 'chemistry', 'Bonding, structure and properties', ['c-bonding', 'd-c-bonding'], 'Three types of bonding explain why salt melts at 801 °C, methane boils at −162 °C and copper conducts.', `
## Ionic bonding (metal + non-metal)
Metal atoms lose electrons to become positive ions; non-metal atoms gain electrons to become negative ions. Both get full outer shells. The oppositely charged ions attract (electrostatic attraction).
> Sodium (2,8,1) loses 1 electron → Na⁺; chlorine (2,8,7) gains 1 → Cl⁻
Ionic compounds form giant lattices with strong forces in all directions:
- High melting and boiling points (lots of energy to break).
- Conduct electricity when molten or dissolved (ions free to move), but not as solids.
## Covalent bonding (non-metals)
Atoms share pairs of electrons.
Simple molecules (H₂O, CO₂, CH₄, Cl₂):
- Strong covalent bonds inside molecules, but WEAK forces between molecules.
- Low melting and boiling points (only the weak intermolecular forces break).
- Do not conduct (no charged particles free to move).
Giant covalent structures (diamond, graphite, silicon dioxide):
- Many strong covalent bonds, so very high melting points.
- Diamond: each carbon bonded to 4 others, very hard, does not conduct.
- Graphite: layers, each carbon bonded to 3 others, layers slide (soft, slippery), one delocalised electron per atom so it conducts.
- Graphene: a single layer of graphite; fullerenes and nanotubes are hollow carbon molecules.
## Metallic bonding
Positive metal ions in a sea of delocalised electrons. Strong attraction → high melting points. Delocalised electrons carry charge and heat → good conductors. Layers slide → malleable. Alloys contain different-sized atoms that distort the layers so they cannot slide, making alloys harder.
## Polymers
Very long molecules made from repeating units, held together by stronger intermolecular forces than small molecules, so most are solids at room temperature.
## States of matter
State symbols: (s), (l), (g), (aq). Changing state means overcoming forces between particles; the stronger the forces, the higher the melting or boiling point.
! Saying covalent bonds break when a simple molecular substance boils. Only the weak forces BETWEEN molecules break.
! Saying ionic solids conduct. Only when molten or dissolved.
* Property questions follow one pattern: structure → type of force → how much energy → property.
? Why does sodium chloride conduct when molten but not when solid? | Molten: ions are free to move and carry charge; solid: ions are fixed in place
? Why does graphite conduct electricity? | Each carbon has a delocalised electron that can move through the structure
? Why is methane a gas at room temperature? | Weak intermolecular forces need little energy to overcome`);

G('c-quant', 'chemistry', 'Formulae, equations and calculations', ['ce-formula', 'ce-balance', 'ce-word', 'cc-mr', 'cc-pct', 'cc-conc'], 'Writing formulae, balancing equations and calculating masses. These skills are tested in nearly every chemistry question.', `
## Writing ionic formulae
The charges must cancel to zero. Group 1 ions are +1, Group 2 +2, aluminium +3; Group 7 ions −1, Group 6 −2. Learn the group ions: hydroxide OH⁻, nitrate NO₃⁻, sulfate SO₄²⁻, carbonate CO₃²⁻, ammonium NH₄⁺.
> Magnesium chloride: Mg²⁺ and Cl⁻ → need 2 Cl⁻ → MgCl₂
> Calcium hydroxide: Ca²⁺ and OH⁻ → Ca(OH)₂ (brackets because OH is one ion)
> Aluminium oxide: Al³⁺ and O²⁻ → 2 × 3+ = 6+, 3 × 2− = 6− → Al₂O₃
## Naming compounds
Metal first, unchanged. A non-metal on its own ends in -ide (chloride, oxide, sulfide). A group with oxygen ends in -ate (sulfate, nitrate, carbonate).
## Balancing equations
The same number of each type of atom on both sides, because atoms are never created or destroyed. Change only the big numbers in front, never the small numbers in formulae.
> CH₄ + 2O₂ → CO₂ + 2H₂O. Check: C 1 = 1, H 4 = 4, O 4 = 4
Tip: balance elements that appear in only one formula on each side first; leave O₂ or H₂ until last.
## Acid reaction patterns
- metal + acid → salt + hydrogen
- metal oxide or hydroxide + acid → salt + water
- metal carbonate + acid → salt + water + carbon dioxide
- hydrochloric → chloride; sulfuric → sulfate; nitric → nitrate
## Relative formula mass (Mr)
Add the relative atomic masses (Ar) of every atom.
> CaCO₃ = 40 + 12 + (3 × 16) = 100
> Mg(OH)₂ = 24 + 2 × (16 + 1) = 58
## Percentage by mass
% of element = (Ar × number of atoms) ÷ Mr × 100.
> % O in H₂O = 16 ÷ 18 × 100 = 88.9%
## Conservation of mass
Total mass of reactants = total mass of products. If mass seems to go down, a gas escaped; if it goes up, a gas (often oxygen) was gained.
## Concentration
Concentration (g/dm³) = mass (g) ÷ volume (dm³). Convert cm³ to dm³ by dividing by 1000.
> 8 g in 250 cm³ = 8 ÷ 0.25 = 32 g/dm³
! Writing MgCl as the formula of magnesium chloride. Check the charges.
! Changing a formula to balance an equation (H₂O₂ instead of 2H₂O).
* Practise in this app: Learn → Chemistry → Equations and formulae.
? Formula of sodium sulfate? | Na₂SO₄
? Balance: Mg + O₂ → MgO | 2Mg + O₂ → 2MgO
? Mr of H₂SO₄ (H = 1, S = 32, O = 16)? | 2 + 32 + 64 = 98`);

G('c-changes', 'chemistry', 'Acids, salts and the reactivity series', ['c-reactions', 'ce-word', 'd-c-changes'], 'How metals react, how to make salts, and what pH really measures.', `
## The reactivity series
Potassium, sodium, lithium, calcium, magnesium, (carbon), zinc, iron, (hydrogen), copper, silver, gold.
- Metals above hydrogen react with acids to give hydrogen.
- A more reactive metal displaces a less reactive one from a solution of its salt.
> zinc + copper sulfate → zinc sulfate + copper (zinc is more reactive)
> copper + zinc sulfate → no reaction
## Extracting metals
Metals less reactive than carbon (zinc, iron, copper) are extracted by heating their oxides with carbon (reduction). More reactive metals (aluminium) need electrolysis, which costs more energy.
## Oxidation and reduction
Oxidation = gain of oxygen (or loss of electrons). Reduction = loss of oxygen (or gain of electrons). OIL RIG: Oxidation Is Loss, Reduction Is Gain (of electrons).
## Acids and alkalis
- Acids produce H⁺ ions in water (pH below 7). Alkalis produce OH⁻ ions (pH above 7). pH 7 is neutral.
- Neutralisation: H⁺ + OH⁻ → H₂O.
- Universal indicator and pH probes measure pH.
## Making a soluble salt (required practical)
- Warm the acid and add an insoluble base (e.g. copper oxide) until no more dissolves, so the acid is used up (base in excess).
- Filter to remove the excess solid.
- Heat the solution in an evaporating basin to reduce it, then leave to crystallise.
- Pat the crystals dry.
> copper oxide + sulfuric acid → copper sulfate + water (blue crystals)
## Titration (outline)
Add acid from a burette to a measured volume of alkali with an indicator until it just changes colour. Repeat until results are concordant (within 0.10 cm³).
! Saying copper reacts with dilute acid. It is below hydrogen, so it does not.
! Forgetting the filtering step in the salt practical.
* For displacement questions, always state which metal is more reactive.
? What gas is produced when magnesium reacts with hydrochloric acid? | Hydrogen
? Why is excess copper oxide added when making copper sulfate? | To make sure all the acid reacts
? Will iron displace copper from copper sulfate solution? | Yes, iron is more reactive than copper`);

G('c-electrolysis', 'chemistry', 'Electrolysis', ['c-reactions', 'ce-word', 'd-c-changes'], 'Using electricity to split ionic compounds. Positive ions go to the negative electrode; negative ions go to the positive electrode.', `
## The basics
An ionic compound is melted or dissolved so its ions can move (the electrolyte). Two electrodes are connected to a power supply.
- Cathode: the NEGATIVE electrode. Positive ions (metals, hydrogen) move here and GAIN electrons (reduction).
- Anode: the POSITIVE electrode. Negative ions (non-metals) move here and LOSE electrons (oxidation).
Memory aid: PANIC. Positive Anode, Negative Is Cathode.
## Molten compounds
The metal forms at the cathode, the non-metal at the anode.
> Molten lead bromide: lead at the cathode, bromine at the anode
## Aqueous solutions (more complicated)
Water also provides H⁺ and OH⁻ ions.
- At the cathode: hydrogen is produced if the metal is MORE reactive than hydrogen; otherwise the metal is produced.
- At the anode: oxygen is produced, unless the solution contains halide ions (chloride, bromide, iodide), in which case the halogen is produced.
> Sodium chloride solution: hydrogen at the cathode, chlorine at the anode, sodium hydroxide left in solution
> Copper sulfate solution: copper at the cathode, oxygen at the anode
## Extracting aluminium
Aluminium oxide is dissolved in molten cryolite to lower the melting point and save energy. Aluminium forms at the cathode. Oxygen forms at the carbon anodes, which react to make carbon dioxide, so the anodes must be replaced regularly.
## Required practical
Electrolyse solutions with inert (graphite) electrodes. Test gases: hydrogen (squeaky pop with a lit splint), oxygen (relights a glowing splint), chlorine (bleaches damp litmus paper).
! Mixing up cathode and anode charges.
! Predicting sodium at the cathode for sodium chloride SOLUTION. Sodium is more reactive than hydrogen, so hydrogen forms.
* Write "metal at cathode, non-metal at anode" for molten questions; apply the two rules for solutions.
? What forms at each electrode when molten zinc chloride is electrolysed? | Zinc at the cathode, chlorine at the anode
? Why must the anodes be replaced in aluminium extraction? | Oxygen reacts with the carbon anodes to make carbon dioxide
? What is the test for chlorine? | It bleaches damp litmus paper`);

G('c-rates', 'chemistry', 'Rates of reaction and energy changes', ['c-rates', 'cc-rate', 'd-c-energy'], 'Collision theory explains every rate question: particles must collide with enough energy.', `
## Collision theory
Reactions happen when particles collide with at least the activation energy. The rate depends on how often they collide and how many collisions are successful.
## Factors that increase the rate
- Higher temperature: particles move faster, collide more often AND more collisions have enough energy.
- Higher concentration (or pressure for gases): more particles in the same volume, so more frequent collisions.
- Larger surface area (smaller pieces, powder): more particles exposed, so more frequent collisions.
- Catalyst: provides an alternative pathway with a lower activation energy; it is not used up.
## Measuring rate
Mean rate = quantity of product formed ÷ time (or reactant used ÷ time). Measure gas volume with a gas syringe, mass lost on a balance, or time for a cross to disappear.
On a graph the gradient is the rate. Steeper = faster. The line levels off when a reactant is used up.
> 45 cm³ of gas in 30 s → mean rate = 1.5 cm³/s
## Required practical: concentration and rate
Sodium thiosulfate + hydrochloric acid goes cloudy. Time how long until a cross under the flask disappears at different concentrations. Higher concentration → shorter time → faster rate.
## Energy changes
- Exothermic: transfers energy TO the surroundings, temperature rises (combustion, neutralisation, respiration, hand warmers).
- Endothermic: takes in energy FROM the surroundings, temperature falls (thermal decomposition, sports injury packs, photosynthesis).
Reaction profiles: exothermic products are lower than reactants; endothermic products are higher. The hump is the activation energy.
## Reversible reactions
Products can react to re-form the reactants: A + B ⇌ C + D. In a closed system it reaches dynamic equilibrium: forward and backward reactions go at the same rate. If one direction is exothermic, the other is endothermic by the same amount.
> Blue hydrated copper sulfate ⇌ white anhydrous copper sulfate + water
! Saying higher temperature only makes particles collide more often. They also collide with MORE ENERGY.
! Saying a catalyst gives particles more energy. It lowers the activation energy instead.
* Explaining a factor needs the chain: change → particles → collisions → rate.
? Why does powder react faster than a lump? | Larger surface area, so more frequent collisions
? How does a catalyst increase the rate? | Provides a pathway with lower activation energy
? A reaction makes the temperature drop. Exothermic or endothermic? | Endothermic`);

G('c-organic', 'chemistry', 'Crude oil, fuels and the atmosphere', ['c-organic', 'c-atmos', 'd-c-organic'], 'Hydrocarbons, how we separate and crack them, and what burning them does to the air.', `
## Crude oil and alkanes
Crude oil is a finite mixture of hydrocarbons formed from ancient plankton. Most are alkanes: CₙH₂ₙ₊₂, single bonds only (saturated). Methane CH₄, ethane C₂H₆, propane C₃H₈, butane C₄H₁₀.
## Fractional distillation
Crude oil is heated until it evaporates. Vapour rises up a column that is hot at the bottom and cooler at the top. Each fraction condenses at the level where the temperature equals its boiling point.
Short-chain hydrocarbons: low boiling point, runny (low viscosity), very flammable, collected at the top (petrol, gases). Long chains: high boiling point, viscous, collected at the bottom (bitumen).
## Cracking
Breaks long, less useful hydrocarbons into shorter, more useful ones, including alkenes. Uses a catalyst and heat, or steam at high temperature.
> decane → octane + ethene (C₁₀H₂₂ → C₈H₁₈ + C₂H₄)
Alkenes have a C=C double bond. Test: bromine water turns from orange to colourless.
## Combustion
Complete (plenty of oxygen): hydrocarbon + oxygen → carbon dioxide + water.
Incomplete (limited oxygen): carbon monoxide (toxic) and soot (carbon) are made.
## The atmosphere now and then
Today: about 80% nitrogen, 20% oxygen, small amounts of argon and carbon dioxide. The early atmosphere was mostly CO₂ from volcanoes. Oxygen increased as algae and plants photosynthesised; CO₂ decreased through photosynthesis, dissolving in oceans and forming sedimentary rocks and fossil fuels.
## Greenhouse gases and climate change
Carbon dioxide, methane and water vapour absorb heat radiated from the Earth. Human activity (burning fossil fuels, deforestation, cattle farming) increases them. Effects: rising sea levels, extreme weather, changes to habitats and food production.
## Pollutants
Sulfur dioxide and nitrogen oxides cause acid rain and breathing problems; particulates (soot) cause global dimming and lung damage; carbon monoxide stops the blood carrying oxygen.
## Water
Potable water: filter, then sterilise (chlorine, ozone or UV). Sea water can be desalinated by distillation or reverse osmosis, but both use lots of energy.
! Saying carbon monoxide causes acid rain. That is sulfur dioxide and nitrogen oxides.
* Fractional distillation answers need: heat, evaporate, cooler higher up, condense at their boiling points.
? Give the general formula of alkanes | CₙH₂ₙ₊₂
? What is the test for an alkene? | Bromine water turns from orange to colourless
? Name two products of incomplete combustion | Carbon monoxide and soot (carbon)`);

/* ================= PHYSICS ================= */
G('p-energy', 'physics', 'Energy: stores, equations and resources', ['pr-energy', 'p-ke', 'p-gpe', 'p-power-e', 'p-work', 'd-p-energy'], 'Energy is never made or destroyed, only moved between stores. The equations turn that idea into numbers.', `
## Energy stores and transfers
Stores: kinetic, gravitational potential, elastic potential, thermal, chemical, nuclear, magnetic, electrostatic. Energy is transferred by forces (mechanical work), electrical work, heating and radiation.
> A ball falling: gravitational potential store → kinetic store
## Equations you must use
- Kinetic energy: Eₖ = ½ m v²
- Gravitational potential energy: Eₚ = m g h (g = 9.8 N/kg)
- Elastic potential energy: Eₑ = ½ k e²
- Work done: W = F s
- Power: P = E ÷ t (or P = W ÷ t)
- Efficiency = useful output ÷ total input
- Change in thermal energy: ΔE = m c Δθ
> A 1200 kg car at 15 m/s: Eₖ = ½ × 1200 × 225 = 135 000 J
> Lifting 50 kg through 2 m: Eₚ = 50 × 9.8 × 2 = 980 J
## Energy conservation and wasted energy
Total energy stays the same. Energy that is not useful is "wasted", usually dissipated to the surroundings as thermal energy. Reduce it with lubrication (less friction) and thermal insulation.
## Specific heat capacity (required practical)
The energy needed to raise 1 kg by 1 °C. Heat a block with an immersion heater, measure the energy (joulemeter, or P × t) and the temperature rise, then c = ΔE ÷ (m Δθ). Insulate the block to reduce losses.
## Energy resources
- Non-renewable: coal, oil, gas (release CO₂), nuclear (no CO₂ but radioactive waste). Reliable.
- Renewable: wind, solar, hydroelectric, tidal, waves, geothermal, biofuel. Will not run out, but some are unreliable (wind, solar) or limited by location.
! Forgetting to square v in kinetic energy. Square v FIRST, then multiply.
! Using the total height instead of the change in height.
* Write the equation, substitute with units, then calculate. Each step can score.
? Kinetic energy of a 2 kg ball at 6 m/s? | ½ × 2 × 36 = 36 J
? A 500 W heater runs for 2 minutes. Energy transferred? | 500 × 120 = 60 000 J
? A motor uses 400 J and does 300 J of useful work. Efficiency? | 0.75 (75%)`);

G('p-circuits', 'physics', 'Electricity: circuits, resistance and mains', ['pr-electric', 'p-ohm', 'p-charge', 'p-power-vi', 'p-power-ir', 'p-energy-pt', 'p-energy-qv', 'd-p-electric'], 'Current, potential difference and resistance, and how they behave differently in series and parallel.', `
## The three quantities
- Current (I, amps): rate of flow of charge. Q = I t.
- Potential difference (V, volts): energy transferred per unit charge. E = Q V.
- Resistance (R, ohms): how much a component opposes current. V = I R.
## Measuring
Ammeter in SERIES (in the loop). Voltmeter in PARALLEL (across the component).
## Series circuits
- Current is the same everywhere.
- The potential difference of the supply is shared between components.
- Total resistance = R₁ + R₂ + …
## Parallel circuits
- Potential difference across each branch is the same as the supply.
- The current splits between branches; branch currents add up to the total.
- Adding a resistor in parallel DECREASES the total resistance (there are more paths for the current).
## Component characteristics (I–V graphs)
- Ohmic resistor (at constant temperature): straight line through the origin, current ∝ pd.
- Filament lamp: curve; resistance increases as it heats up.
- Diode: current flows in one direction only.
- Thermistor: resistance falls as temperature rises (thermostats).
- LDR: resistance falls as light increases (night lights).
## Power
P = V I and P = I² R. Energy transferred E = P t.
> A kettle on 230 V draws 10 A: P = 2300 W. In 3 minutes: E = 2300 × 180 = 414 000 J
## Mains electricity (UK)
Alternating current, 230 V, 50 Hz. Three-core cable: live (brown, 230 V), neutral (blue, about 0 V), earth (green and yellow, safety, carries current only if there is a fault). The National Grid uses step-up transformers for transmission (high pd, low current, less energy lost) and step-down transformers for homes.
! Putting a voltmeter in series.
! Thinking resistors in parallel add up. The total is LESS than the smallest one.
* For a fault question involving the live wire: touching it is dangerous even when the switch is off, because the live wire is still at 230 V.
? A 12 V battery drives 0.5 A through a resistor. Resistance? | 24 Ω
? 3 C of charge flows in 6 s. Current? | 0.5 A
? Two 6 Ω resistors in series. Total resistance? | 12 Ω`);

G('p-particles', 'physics', 'Particle model and radioactivity', ['pr-particles', 'p-density', 'd-p-particles'], 'Density and states of matter, then what happens inside unstable nuclei.', `
## Density
ρ = m ÷ V. Solids are usually densest (particles close and ordered), gases least dense.
Required practical: regular objects, measure sides and calculate volume; irregular objects, use a eureka (displacement) can; mass on a balance.
## States and internal energy
Internal energy = total kinetic + potential energy of the particles. Heating raises temperature OR changes state. During a change of state the temperature stays the same while energy breaks bonds.
Specific latent heat: E = m L (energy to change the state of 1 kg without changing temperature).
## Gas pressure
Gas particles move randomly and collide with the container walls. Higher temperature → faster particles → more frequent, harder collisions → higher pressure (at constant volume).
## Radioactive decay
Unstable nuclei give out radiation to become more stable. Decay is random: you cannot predict which nucleus decays next.
- Alpha (α): 2 protons + 2 neutrons (helium nucleus). Most ionising, stopped by paper or a few cm of air.
- Beta (β): a fast electron from the nucleus (a neutron becomes a proton). Stopped by a few mm of aluminium.
- Gamma (γ): electromagnetic wave. Least ionising, most penetrating; reduced by thick lead or concrete.
## Half-life
The time for the number of unstable nuclei (or the count rate) to halve.
> Count rate 800 Bq, half-life 2 hours. After 6 hours (3 half-lives): 800 → 400 → 200 → 100 Bq
## Contamination and irradiation
Irradiation: exposure to radiation from outside; the object does NOT become radioactive. Contamination: radioactive atoms get on or into something; it stays a risk. Protect with distance, shielding, short exposure times and gloves or tongs.
## Background radiation
Always present, from rocks (radon), cosmic rays, food, and medical and nuclear sources. Subtract it from readings in experiments.
! Saying an irradiated object becomes radioactive.
! Halving the time instead of the count rate.
* Half-life questions: write out each halving step so the examiner can follow it.
? A source has a half-life of 5 days. What fraction remains after 15 days? | 1/8
? Which radiation is stopped by paper? | Alpha
? Mass 600 g, volume 250 cm³. Density? | 2.4 g/cm³`);

G('p-forces', 'physics', 'Forces, motion and Newton\'s laws', ['pr-forces-waves', 'p-weight', 'p-newton2', 'p-accel', 'p-speed', 'p-spring', 'p-momentum', 'd-p-forces'], 'Forces change how things move. Newton\'s three laws and two graphs explain almost all of it.', `
## Scalars and vectors
Scalars have size only (speed, distance, mass, energy). Vectors have size and direction (velocity, displacement, force, acceleration).
## Resultant force
Add forces in the same direction; subtract forces in opposite directions.
> Thrust 500 N forwards, drag 320 N backwards → resultant 180 N forwards
## Weight
W = m g. Mass (kg) is the same everywhere; weight (N) depends on gravitational field strength.
## Newton's laws
- First: if the resultant force is zero, an object stays still or moves at a constant velocity.
- Second: F = m a. Bigger force, bigger acceleration; bigger mass, smaller acceleration.
- Third: when two objects interact, they exert equal and opposite forces on each other.
## Acceleration
a = Δv ÷ t.
> 0 to 24 m/s in 8 s → a = 3 m/s²
## Motion graphs
- Distance–time: gradient = speed. Flat = stationary. Curve = accelerating.
- Velocity–time: gradient = acceleration. Area under the graph = distance travelled. Flat = constant velocity.
## Terminal velocity
A falling object speeds up, so air resistance increases until it equals weight. The resultant force is then zero, so it falls at a constant (terminal) velocity. Opening a parachute increases air resistance, so it decelerates to a new, lower terminal velocity.
## Stopping distance
Stopping distance = thinking distance + braking distance.
- Thinking distance increases with speed, tiredness, alcohol, drugs, distractions.
- Braking distance increases with speed, wet or icy roads, worn tyres or brakes, and greater mass.
## Springs (required practical)
F = k e (up to the limit of proportionality). Hang masses, measure extension (new length − original length). The graph is a straight line through the origin until the limit.
## Momentum
p = m v. In a collision, total momentum before = total momentum after.
! Using total length instead of extension for springs.
! Saying a parachutist "goes up" when the parachute opens. They slow down.
* Terminal velocity answers need: speed increases → air resistance increases → equals weight → resultant force zero → constant speed.
? Weight of 70 kg on Earth? | 686 N
? A 1500 kg car accelerates at 2 m/s². Resultant force? | 3000 N
? What does the area under a velocity–time graph show? | Distance travelled`);

G('p-waves', 'physics', 'Waves, the EM spectrum and magnetism', ['p-wave', 'pr-forces-waves', 'd-p-waves'], 'How waves carry energy, the seven types of electromagnetic wave, and the basics of magnets.', `
## Transverse and longitudinal
- Transverse: oscillations at right angles to the direction of energy transfer (water ripples, light, all EM waves).
- Longitudinal: oscillations parallel to the direction of energy transfer, with compressions and rarefactions (sound).
Waves transfer energy, not matter.
## Describing waves
Amplitude: maximum displacement from rest. Wavelength (λ): distance from one point to the same point on the next wave. Frequency (f): waves per second, in hertz. Period T = 1 ÷ f.
## The wave equation
v = f λ
> f = 50 Hz, λ = 4 m → v = 200 m/s
## Required practical: ripple tank
Measure wavelength (several waves against a ruler, then divide), count waves past a point in 10 s for frequency, and calculate v = f λ. A strobe or camera helps freeze the pattern.
## The electromagnetic spectrum (long wavelength → short)
Radio, microwaves, infrared, visible, ultraviolet, X-rays, gamma. All travel at the same speed in a vacuum. Frequency and energy increase towards gamma.
- Radio: TV and radio. Microwaves: satellites, cooking. Infrared: heaters, thermal cameras. Visible: fibre optics, seeing. UV: energy-efficient lamps, tanning (risk of skin cancer). X-rays and gamma: medical imaging and treatment (ionising, can damage cells and cause cancer).
## Reflection and refraction
Waves reflect off surfaces. Refraction is a change of direction when a wave crosses into a new material, because its speed changes. Light slows and bends towards the normal when entering glass.
## Magnetism
Like poles repel, unlike poles attract. Field lines go from north to south and are closest where the field is strongest. A permanent magnet makes its own field; an induced magnet only becomes magnetic in a field (iron, steel, nickel, cobalt).
Electromagnet: a coil of wire (solenoid) around an iron core; stronger with more current or more turns. A wire carrying a current in a magnetic field feels a force: the motor effect.
! Saying sound is transverse.
! Mixing up wavelength and amplitude on a diagram.
* Learn the EM spectrum order: Raging Martians Invaded Venus Using X-ray Guns.
? A wave has v = 340 m/s and f = 170 Hz. Wavelength? | 2 m
? Which EM wave has the highest frequency? | Gamma rays
? Give two ways to make an electromagnet stronger | More current; more turns (or an iron core)`);

/* ================= ENGLISH LANGUAGE ================= */
G('el-paper1', 'englang', 'Language Paper 1: every question, step by step', ['el-papers', 'el-devices', 'd-el-terms'], 'Paper 1 is 1 hour 45 minutes, 80 marks, one fiction extract. Spend about 15 minutes reading, then time each question by its marks.', `
## Timing plan
Read the source and questions: 15 min. Q1: 5 min. Q2: 10 min. Q3: 10 min. Q4: 20 min. Q5: 45 min (5 planning, 35 writing, 5 checking).
## Q1: list four things (4 marks)
Only use the lines the question gives. Write four short, separate facts, copied or in your own words. Do not analyse.
## Q2: language (8 marks)
How does the writer use language to describe…? Three short paragraphs, each built like this:
- Point: what impression the writer creates.
- Evidence: a short quotation (one to five words).
- Method: name it if you can (verb, adjective, metaphor, simile, personification, sentence form).
- Zoom: pick one word and explore its connotations.
- Effect: what the reader thinks or feels, and why.
> The writer makes the sea seem alive and dangerous. The verb "heave" suggests something huge and straining, like a creature breathing, so the reader senses its power is barely held back.
## Q3: structure (8 marks)
How the WHOLE text is built, not individual words. Track the focus: what are we shown at the beginning, how does it shift, and how does it end? Use terms: opening, shift in focus, zooming in, flashback, dialogue, one-line paragraph, climax, cyclical ending, tension. Always say WHY the writer made that choice (to build tension, to introduce a character, to create a contrast).
## Q4: evaluation (20 marks)
A statement to agree or disagree with. Give your opinion clearly ("I strongly agree"), then 3 or 4 paragraphs that each take one part of the statement, give evidence, and analyse HOW the writer creates that effect. Consider a slightly different reading for the top band. Stay inside the lines named.
## Q5: descriptive or narrative writing (40 marks)
24 marks for content and organisation, 16 for technical accuracy. See the Writing guide.
! Writing about structure in Q2 or language in Q3. Each question has its own focus.
! Spending 30 minutes on Q4 and rushing Q5. Q5 is half the paper.
* Q2 and Q3 reward depth more than length. Three well-explored points beat six thin ones.
? How many marks is Paper 1 Q5 worth? | 40 (24 content, 16 technical accuracy)
? What is Q3 about? | Structure: how the whole text is organised and how the focus changes
? How long should you spend on Q4? | About 20 minutes`);

G('el-paper2', 'englang', 'Language Paper 2: viewpoints and perspectives', ['el-papers', 'el-devices', 'd-el-terms'], 'Paper 2 pairs two non-fiction sources, one modern and one from the 19th century. It rewards comparing, not just describing.', `
## Timing plan
Read: 15 min. Q1: 5 min. Q2: 10 min. Q3: 15 min. Q4: 20 min. Q5: 45 min.
## Q1: true statements (4 marks)
Shade four true statements from a list about Source A. Check each one against the lines given.
## Q2: summary of differences (8 marks)
Facts and inferences about the two sources, on the topic named. For each difference:
- State the difference.
- Evidence from Source A and what it suggests (inference).
- Evidence from Source B and what it suggests.
> Whereas the modern writer feels "wide awake" and happy after the cold water, suggesting the swim is a release, Harriet is "half-frozen", implying it is a punishment she endures.
Use comparative words: whereas, however, similarly, in contrast, on the other hand.
## Q3: language (12 marks)
Like Paper 1 Q2 but on one source, often the older one. Three or four developed analytical paragraphs.
## Q4: compare perspectives (16 marks)
Compare the writers' ATTITUDES and the METHODS they use to show them, across both whole sources. Each paragraph: the attitude in A + method + quote → the attitude in B + method + quote → why they differ (purpose, audience, era).
## Q5: viewpoint writing (40 marks)
An article, letter, speech or essay arguing a view. Match the form (headline for an article, "Dear…" for a letter), the audience and the purpose. Plan 5 or 6 paragraphs: hook, argument 1, argument 2, counter-argument then rebuttal, argument 3, powerful ending that links back to the start.
Persuasive devices: direct address, rhetorical questions, facts and statistics (invented ones are allowed), anecdote, expert opinion, lists of three, emotive language, hyperbole.
! Summarising only one source in Q2.
! Comparing what the sources are ABOUT instead of the writers' attitudes in Q4.
* Q4 sentence starter: "Both writers… however, while Writer A… Writer B…"
? Which question asks you to compare attitudes? | Question 4 (16 marks)
? What does Q2 need from both sources? | Evidence and inferences showing a difference
? Name four persuasive devices | Rhetorical question, statistic, anecdote, direct address (also lists of three, emotive language)`);

G('el-writing', 'englang', 'Question 5: writing that scores highly', ['d-el-terms', 'v-sight', 'v-sound', 'v-move', 'v-mood', 'v-nature'], 'Q5 is worth 40 of the 80 marks on each paper. A plan, a shape and accurate sentences are what move you up the bands.', `
## Plan for 5 minutes
Decide your ending first, then your shape. Note 5 or 6 paragraph ideas and 5 ambitious words you will use.
## A shape for description (Paper 1)
- Zoom in on one small detail to open (a drip of water, a flickering sign).
- Widen out to the setting, using all five senses.
- A shift: time passes, the weather turns, a person arrives.
- Zoom in again on something meaningful.
- End by echoing the opening (cyclical structure) but changed.
## A shape for a story (Paper 1)
Keep it to one moment or a short time and two characters at most. Start in the middle of the action or with a striking detail, build tension, include a turning point, and finish with a resolution or an open ending. Avoid huge plots.
## Making the writing ambitious
- Precise vocabulary: "the gloomy corridor" rather than "the dark corridor". Learn the descriptive word sets in Learn → English Language.
- Imagery: metaphor, simile, personification, pathetic fallacy.
- Vary sentence openings: a verb ("Clutching…"), an adverb ("Slowly,…"), a preposition ("Beneath the…").
- Vary sentence lengths, and use a one-word sentence or one-line paragraph for impact.
## Technical accuracy (16 marks)
- Full stops between sentences: no comma splices.
- Use at least three of: semicolon, colon, dash, question mark, exclamation mark, brackets, speech marks.
- Spell common words correctly: their/there/they're, your/you're, its/it's, definitely, separate, beginning.
- Paragraph every time time, place, topic or speaker changes.
## Checking (5 minutes)
Read it back slowly. Fix full stops, capitals and spellings. Replace one or two plain words with better ones.
! Writing two pages of plot and no description.
! Starting every sentence with "I" or "The".
* 450 to 650 careful words beat 1000 rushed ones.
? What is a comma splice? | Two sentences joined with only a comma (should be a full stop or semicolon)
? Name three ways to open a sentence differently | With a verb, an adverb or a prepositional phrase
? What is a cyclical structure? | Ending where you began, often with a change`);

/* ================= ENGLISH LITERATURE ================= */
G('lit-essay', 'englit', 'How to write a Literature essay', ['lit-macbeth', 'lit-acc', 'lit-je', 'd-lit-terms'], 'Every Literature question is marked on the same four things. Build your essays around them.', `
## What examiners mark
- AO1: a clear argument that answers the question, with quotes as evidence.
- AO2: analysis of the writer's methods (language, form, structure) and their effects.
- AO3: context (when and why it was written) linked to your argument.
- AO4: spelling, punctuation and grammar (Macbeth and Journey's End questions only).
## Plan in 5 minutes
Write a one-sentence thesis that answers the question. Choose 3 or 4 points that move through the text (beginning, middle, end) and a quote for each.
## The introduction (3 or 4 sentences)
State your thesis and the writer's purpose. No "In this essay I will…".
> Shakespeare presents Lady Macbeth as powerful only while she controls her husband; once she loses that control, her power collapses into guilt, warning a Jacobean audience about women who defy the natural order.
## An analytical paragraph
- A topic sentence that answers the question.
- A short, embedded quote.
- The method (metaphor, imperative, symbolism, dramatic irony, stage direction).
- Zoom in on a key word: its connotations.
- The effect on the audience or reader.
- A link to context woven into the analysis.
- A link back to the question.
## Using the extract AND the whole text
Questions on Macbeth and A Christmas Carol start with an extract. Spend about a third of your time on the extract and the rest across the whole text.
## The conclusion
Return to your thesis and say what the writer's big message is.
## Context that actually scores
Context must explain WHY the writer made a choice. "Shakespeare uses the witches because King James wrote Daemonologie and feared witchcraft, so the audience would see them as truly evil" scores. A bolted-on history fact does not.
! Retelling the story. Every paragraph must analyse HOW the writer presents something.
! Long quotations. Use short, embedded ones.
* Learn 10 short quotes per text that each fit several themes.
? What is AO2? | Analysis of the writer's methods: language, form, structure and their effects
? How should context be used? | Linked to the writer's purpose and the argument, not bolted on
? What should an introduction contain? | A thesis that answers the question and the writer's purpose`);

G('lit-macbeth', 'englit', 'Macbeth: plot, themes and context', ['lit-macbeth', 'q-mac'], 'A tragedy about ambition, guilt and the supernatural, written for King James I around 1606.', `
## Plot in five acts
- Act 1: Macbeth, a brave soldier, meets three witches who predict he will be king. Lady Macbeth persuades him to murder King Duncan.
- Act 2: Macbeth kills Duncan; he is haunted by guilt ("a dagger"). Duncan's sons flee and Macbeth becomes king.
- Act 3: Macbeth has Banquo murdered; Fleance escapes. Banquo's ghost appears at the feast.
- Act 4: The witches show apparitions. Macbeth has Macduff's wife and children killed. Malcolm and Macduff plan revenge.
- Act 5: Lady Macbeth sleepwalks, tormented by guilt, and dies. Macduff kills Macbeth; Malcolm becomes king.
## Key themes
- Ambition: "vaulting ambition" drives Macbeth to destruction.
- Guilt: blood imagery shows guilt that cannot be washed away; sleeplessness.
- The supernatural: the witches tempt but do not force Macbeth.
- Appearance and reality: "Fair is foul, and foul is fair"; "look like th'innocent flower".
- Kingship: Duncan and Edward the Confessor are good kings; Macbeth is a tyrant.
- Masculinity and gender: Lady Macbeth calls on spirits to "unsex" her and questions Macbeth's manhood.
## Characters
- Macbeth: a tragic hero whose fatal flaw (hamartia) is ambition. Moves from "brave Macbeth" to "this dead butcher".
- Lady Macbeth: dominant at first, then collapses into guilt and madness.
- Banquo: a foil. He hears the same prophecy but stays loyal.
- Macduff: the avenger, who represents justice and family.
## Context
- King James I was also King of Scotland and claimed descent from Banquo, so Banquo is shown positively.
- The Gunpowder Plot (1605) tried to kill James: regicide was the worst crime.
- The divine right of kings: monarchs were chosen by God, so killing one went against God and nature, which is why nature is disrupted after Duncan's murder.
- James wrote Daemonologie and believed in witchcraft.
- The Great Chain of Being: everyone had a fixed place; disrupting it brought chaos.
- Jacobean women were expected to be obedient, so Lady Macbeth is shocking.
! Saying the witches make Macbeth kill Duncan. They predict; he chooses.
* Strong arguments discuss responsibility: who is most to blame, and why Shakespeare leaves it open.
? Why is Banquo presented positively? | James I claimed to be descended from him
? What is Macbeth's hamartia? | Ambition
? What does the sleepwalking scene show? | Lady Macbeth's guilt has destroyed her mind`);

G('lit-acc', 'englit', 'A Christmas Carol: staves, themes and context', ['lit-acc', 'q-acc'], 'Dickens wrote a ghost story in 1843 to persuade wealthy readers to care about the poor.', `
## The five staves
- Stave 1: Scrooge, a miser, refuses charity and his nephew Fred's invitation. Marley's ghost warns him, dragging the chains he forged in life.
- Stave 2: The Ghost of Christmas Past shows Scrooge's lonely childhood, Fezziwig's generous party, and Belle leaving him because he loves money more.
- Stave 3: The Ghost of Christmas Present shows the Cratchits' happy but poor Christmas and Tiny Tim's illness, Fred's party, and two starving children, Ignorance and Want.
- Stave 4: The Ghost of Christmas Yet to Come shows people celebrating a dead man's death, Tiny Tim's death, and Scrooge's own neglected grave.
- Stave 5: Scrooge wakes transformed: he sends the Cratchits a turkey, gives to charity, visits Fred and becomes "a second father" to Tiny Tim.
## Key themes
- Redemption: anyone can change.
- Social responsibility: the rich must help the poor ("Mankind was my business").
- Poverty and the poor law: Scrooge asks "Are there no prisons? … workhouses?"
- Family and Christmas: warmth, generosity and togetherness.
## Characters
- Scrooge: "solitary as an oyster", cold imagery, later warm and generous. A symbol of the selfish rich.
- Bob Cratchit and Tiny Tim: the deserving poor; Tim makes the reader pity them.
- Fred: shows the Christmas spirit Scrooge lacks; never gives up on him.
- The ghosts: each forces Scrooge to face a different time.
## Context
- The 1834 Poor Law Amendment Act forced the poor into harsh workhouses.
- Thomas Malthus argued about "surplus population"; Dickens throws this phrase back at Scrooge.
- Dickens worked in a blacking factory as a child when his father was in debtors' prison.
- He published it as a cheap book at Christmas to reach middle-class readers.
## Form and structure
A novella in five "staves" (like verses of a carol). A cyclical structure: Stave 5 mirrors Stave 1 (fog becomes clear, bright weather). An intrusive, chatty narrator speaks directly to the reader.
! Treating Scrooge's change as sudden: it builds stave by stave.
* Link every point to Dickens's purpose: making readers change their attitude to the poor.
? What do Ignorance and Want represent? | The neglected poor children of society and the dangers of ignoring them
? Why is the novella split into staves? | To echo a carol: it is a Christmas song with a message
? What phrase of Scrooge's is used against him? | "Decrease the surplus population"`);

G('lit-je', 'englit', 'Journey\'s End: plot, characters and context', ['lit-je', 'q-je'], 'R.C. Sherriff\'s 1928 play is set in a single dugout over four days before the German Spring Offensive of March 1918.', `
## Plot (three acts, March 1918, near St Quentin)
- Act 1: Raleigh, a young officer, joins Stanhope's company. They were at school together and Raleigh hero-worships him, but Stanhope has changed and drinks heavily to cope. Osborne, kind and older, looks after everyone.
- Act 2: Stanhope fears Raleigh will write home to his sister Madge about his drinking; he reads the letter but it praises him. Hibbert tries to leave with "neuralgia"; Stanhope stops him. Orders come for a dangerous raid.
- Act 3: Osborne and Raleigh lead the raid; Osborne is killed. Stanhope and Raleigh argue at dinner. The German attack begins; Raleigh is fatally wounded, and Stanhope sits with him as he dies. The dugout collapses at the end.
## Characters
- Stanhope: a brave, respected captain destroyed by three years at the front; whisky helps him cope.
- Raleigh: young, idealistic; represents the innocence the war destroys.
- Osborne: "Uncle"; calm, gentle, a former schoolmaster who reads Alice in Wonderland. His death devastates Stanhope.
- Hibbert: terrified, shows that fear is normal; Stanhope admits he feels it too.
- Trotter: cheerful, working-class, focuses on food and counting the hours.
- Mason: the cook, providing comic relief.
## Themes
- The futility and waste of war: the raid kills Osborne and achieves little.
- Heroism and courage: redefined as carrying on despite fear.
- Coping: whisky, routine, food, jokes and denial.
- Class: officers are mainly public-school educated; Trotter and Mason are working-class.
- Friendship and loss.
## Form and staging
Set entirely in the cramped dugout: claustrophobic, cut off from the outside world. Stage directions (candles, the sound of shelling, time markers) build tension towards the attack. The ending is left unresolved and bleak.
## Context
Sherriff served as an officer in the First World War. The play reflects the real Operation Michael attack of 21 March 1918. In 1928 many people were questioning whether the war had been worth it.
! Calling Stanhope a coward. His drinking shows how much he has endured.
* Use stage directions as evidence: they are Sherriff's own voice.
* Use only quotes you have checked in your own copy: misquotes cost marks.
? Who is killed in the raid? | Osborne
? Why does Stanhope drink? | To cope with the strain and fear of years at the front
? Why is the play set in one dugout? | It creates a claustrophobic, trapped atmosphere and focuses on the men`);

G('lit-poetry', 'englit', 'Power and Conflict poetry: comparing poems', ['lit-poems', 'd-lit-terms'], 'You compare a named poem with one you choose from the 15 in the anthology. Then you write about an unseen poem.', `
## The 15 poems by theme
- Power of nature: Ozymandias, The Prelude (extract), Storm on the Island, Exposure.
- Power of humans and abuse of power: Ozymandias, London, My Last Duchess, Checking Out Me History.
- Effects of war and conflict: Charge of the Light Brigade, Exposure, Bayonet Charge, Remains, Poppies, War Photographer, Kamikaze.
- Memory and identity: The Émigrée, Kamikaze, Poppies, Tissue, Checking Out Me History.
## Choosing your second poem
Pick one with a clear link to the question AND a clear difference in method. Good pairs: Ozymandias + My Last Duchess (arrogant rulers); Exposure + Storm on the Island (nature as enemy); Remains + War Photographer (guilt and memory).
## Structure for the comparison essay
- Introduction: what both poems say about the theme, and the key difference.
- 3 comparative paragraphs. Each: Poem A's idea + quote + method → "whereas" Poem B's idea + quote + method → why they differ (context or purpose).
- Conclusion: which poem presents the theme more powerfully, and why.
## Methods to discuss
Form (sonnet, dramatic monologue, free verse); structure (volta, enjambment, caesura, stanza length, ending); language (imagery, semantic fields, verbs, repetition); voice (first person, speaker).
## Unseen poetry (two questions)
- Q1 (24 marks): how the poet presents a feeling or idea. Plan: overall meaning → three points with quotes → form and structure → how the poem ends.
- Q2 (8 marks): compare METHODS in the two unseen poems. Two or three comparisons are enough.
## Reading an unseen poem
Read the title, then read it twice. Ask: who is speaking, to whom, about what? What changes? Underline 5 interesting words and one structural feature.
! Writing about one poem then the other with no comparison. Compare in every paragraph.
* "Both poets… however, while… in contrast…"
? Give two poems about the power of nature | Storm on the Island and Exposure (also The Prelude, Ozymandias)
? What is a dramatic monologue? | A poem spoken by one character to a silent listener, revealing their personality (e.g. My Last Duchess)
? What is the unseen comparison question worth? | 8 marks`);

/* ================= GEOGRAPHY ================= */
G('g-hazards', 'geography', 'Natural hazards: earthquakes, volcanoes and storms', ['g-tectonics', 'g-weather', 'd-g-terms'], 'Why hazards happen, why some places suffer more, and the case studies you need.', `
## Plate margins
- Constructive: plates move apart; magma rises to form new crust. Gentle volcanoes and small earthquakes (Mid-Atlantic Ridge, Iceland).
- Destructive: an oceanic plate is subducted under a continental plate. Explosive volcanoes and powerful earthquakes (Andes, Japan).
- Conservative: plates slide past each other. Earthquakes, no volcanoes (San Andreas Fault).
## Why earthquakes happen
Friction makes plates stick; pressure builds; it is released suddenly, sending out seismic waves from the focus. The epicentre is the point on the surface directly above.
## Why people live in danger zones
Fertile volcanic soils, jobs (tourism, geothermal energy, mining), family ties, they cannot afford to move, and trust in monitoring.
## Reducing the risk: the four Ps
Monitoring (seismometers, tiltmeters), prediction, protection (earthquake-proof buildings, cross-bracing, shock absorbers), planning (evacuation routes, drills, land-use zoning).
## Comparing two earthquakes (case studies)
- Chile 2010 (HIC/NEE, magnitude 8.8): about 500 deaths; strict building codes, quick emergency response; long-term rebuilding funded by the country.
- Nepal 2015 (LIC, magnitude 7.8): about 9000 deaths; poorly built homes, landslides blocked roads, heavy dependence on international aid.
Key point: level of development affects preparation, building quality and response, so it strongly affects the death toll.
## Tropical storms
Form over warm oceans (at least 27 °C) between 5° and 30° from the equator. Warm, moist air rises, condenses and releases heat; the Earth's rotation makes the storm spin. Case study: Typhoon Haiyan, Philippines 2013: about 6300 deaths, storm surge flooding.
## Climate change
Evidence: rising global temperatures, shrinking ice, rising sea levels, ice cores. Causes: natural (orbit, solar output, volcanic eruptions) and human (fossil fuels, farming, deforestation). Responses: mitigation (renewables, carbon capture, planting trees, international agreements) and adaptation (flood defences, drought-resistant crops).
! Mixing up the focus (underground) and the epicentre (on the surface).
* 9-mark answers need named examples with specific facts and figures, and a judgement.
? At which plate margin is one plate subducted? | Destructive
? Give two reasons people live near volcanoes | Fertile soil, jobs in tourism or geothermal energy (also family, cost of moving)
? Name one way to protect buildings from earthquakes | Cross-bracing, shock absorbers or rolling weights in the foundations`);

G('g-method', 'geography', 'Answering Geography questions: 4, 6 and 9 markers', ['g-living', 'g-coasts-rivers', 'g-urban', 'gc-density'], 'Command words tell you exactly what to do. Get them right and the marks follow.', `
## Command words
- Describe: say what it is like or where it is (patterns, numbers from data). No reasons needed.
- Explain: give reasons, using "because", "this means", "which leads to".
- Suggest: apply your knowledge to an unfamiliar example.
- Assess, evaluate, "to what extent": weigh up both sides and reach a judgement.
## Describing data and maps
Give the general trend, quote figures with units, and point out an anomaly. For maps: compass directions, distances and named places.
> "The population rose steadily from 2 million in 2000 to 5 million in 2020, an increase of 3 million."
## 4 and 6-mark explanations
Develop each point into a chain of two or three linked steps.
> Deforestation reduces interception (point), so more rain reaches the ground quickly (development), which increases surface run-off and flood risk (further development).
## 9-mark questions (plus 3 SPaG marks on some)
- Introduction: define the key term and state your view.
- Two or three developed paragraphs with named case-study facts (places, dates, figures).
- Consider the other side.
- Conclusion: a clear judgement, saying "it depends on…" where relevant.
## Case studies to learn with facts
A tectonic hazard in a richer and a poorer country; a tropical storm; a UK flood or extreme weather event; a tropical rainforest (the Amazon or Malaysia); a hot desert or cold environment; a UK coastline and river; a major city in an LIC or NEE (Rio or Lagos); a UK city (Bristol, Liverpool or London); a country's economic development (Nigeria); a resource-management scheme.
## Coasts and rivers: landforms
Erosion processes: hydraulic action, abrasion, attrition, solution. Landforms: headlands and bays, caves, arches, stacks, spits (coasts); waterfalls, gorges, meanders, ox-bow lakes, levees, floodplains (rivers). Explain landforms as a sequence of steps.
! Describing when the question says explain.
! Vague case studies ("lots of people died"). Use real numbers.
* For "how far" questions, always write a conclusion with a judgement.
? What does "explain" require? | Reasons, linked with because, so or this means
? What makes a 9-mark answer reach the top level? | Detailed case-study facts, balanced evaluation and a clear judgement
? Name the four types of erosion | Hydraulic action, abrasion, attrition, solution`);

/* ================= BUSINESS ================= */
G('bs-finance', 'business', 'Business finance: every calculation', ['bz-profit', 'bz-breakeven', 'bz-margins', 'bz-cash', 'bz-arr', 'bs-finance'], 'Finance formulas are guaranteed marks. Show your working with £ signs at every step.', `
## The formulas
- Revenue = price × quantity sold
- Total costs = fixed costs + variable costs (variable cost per unit × quantity)
- Profit = revenue − total costs
- Gross profit = revenue − cost of sales
- Net profit = gross profit − other operating expenses
- Gross profit margin = gross profit ÷ revenue × 100
- Net profit margin = net profit ÷ revenue × 100
- Break-even output = fixed costs ÷ (selling price − variable cost per unit)
- Margin of safety = actual sales − break-even sales
- Average rate of return (ARR) = average annual profit ÷ cost of investment × 100
- Net cash flow = cash inflows − cash outflows; closing balance = opening balance + net cash flow
## Worked examples
> Price £12, variable cost £4, fixed costs £20 000. Contribution = £8 per unit. Break-even = 20 000 ÷ 8 = 2500 units
> Revenue £80 000, cost of sales £30 000, expenses £35 000. Gross profit £50 000 (62.5% margin). Net profit £15 000 (18.75% margin)
> An £8000 machine earns total profit of £2000 over 4 years (after its cost). Average £500 a year. ARR = 500 ÷ 8000 × 100 = 6.25%
## Break-even charts
The fixed cost line is horizontal; the total cost line starts at fixed costs and rises; the revenue line starts at zero. Break-even is where revenue crosses total costs. Left of it is a loss; right of it is a profit.
## Cash flow vs profit
A business can be profitable but run out of cash if customers pay late or it buys too much stock. Fix cash-flow problems with an overdraft, chasing debtors, delaying payments to suppliers, or reducing stock.
## Sources of finance
Owners' capital, retained profit, selling assets, loans, overdrafts, share capital, crowdfunding, trade credit. Match short-term needs with short-term finance (overdraft) and long-term needs with long-term finance (loan, shares).
! Dividing by profit instead of revenue for margins.
! Rounding break-even down. You cannot sell part of a unit, so round UP.
* Always write the formula first. There is a mark for it even if you slip later.
? Fixed costs £9000, price £15, variable cost £6. Break-even? | 9000 ÷ 9 = 1000 units
? Revenue £50 000, net profit £6000. Net profit margin? | 12%
? Opening balance −£200, inflows £1500, outflows £1100. Closing balance? | £200`);

G('bs-method', 'business', 'Business: the marketing mix and 6 and 9 markers', ['bs-marketing', 'bs-ops-people', 'bs-external', 'bs-enterprise'], 'Business marks reward applying every point to the business in front of you, then building chains of reasoning.', `
## The marketing mix (4 Ps)
- Product: design, quality, the product life cycle (introduction, growth, maturity, decline) and extension strategies.
- Price: skimming (high at launch), penetration (low to enter the market), competitive, cost-plus.
- Place: online, shops, wholesalers; where customers buy.
- Promotion: advertising, social media, sponsorship, special offers, public relations.
The 4 Ps must fit together and fit the target market.
## Command words
- Explain (2 to 4 marks): a point plus a developed reason, applied to the case.
- Analyse (6 marks): two or three chains of reasoning, applied to the business, no judgement needed.
- Evaluate / justify (9 marks): both sides, then a decision with a reason.
## Building a chain of reasoning
Use connectives: "this means that…", "which leads to…", "as a result…".
> Penetration pricing would attract price-sensitive students (point), which means Pedal & Pour could fill quieter weekday hours (development), increasing revenue to cover its high fixed costs such as rent (further development, applied).
## Application
Use details from the case study: names, products, numbers, customers. Generic answers are capped low.
## The 9-mark structure
- Option or argument for, with two developed chains.
- Argument against, with developed chains.
- Decision: which is better, and "it depends on…" (the key factor that could change your mind).
## Other topics to know
Ownership (sole trader, partnership, Ltd, PLC; limited and unlimited liability), stakeholders, recruitment and training, motivation, production methods (job, batch, flow), quality, consumer law, interest rates, exchange rates, globalisation and ethics.
! Listing several points without developing any.
! Making a decision with no justification.
* Read the case study first and underline numbers and problems: they are hints for application.
? What is penetration pricing? | Setting a low price to enter a market and gain customers
? What does a 9-mark question need at the end? | A justified decision, ideally with "it depends on…"
? What is limited liability? | Owners can only lose the money they invested`);

/* ================= RE ================= */
G('re-method', 're', 'RE: answering 1, 2, 4, 5 and 12-mark questions', ['r-themes', 'd-r-themes'], 'Every RE section has the same five questions. Learn the formula for each.', `
## 1 mark: multiple choice
Read all four options; key terms decide these.
## 2 marks: "Give two…"
Two short, separate points. No explanation needed.
## 4 marks: "Explain two ways…" or "Explain two contrasting beliefs…"
- First point, developed with an example or explanation.
- Second point, developed.
For "contrasting" you need two DIFFERENT views (for example Catholic vs Protestant, or religious vs non-religious).
## 5 marks: same as 4 marks plus a source
Develop two points AND refer to a source of religious belief: the Bible, the Qur'an, a teaching of Jesus or Muhammad, a church or scholar's teaching. Quote or paraphrase accurately.
> Christians believe in the sanctity of life because God created humans in his image ("God created mankind in his own image", Genesis 1:27), so only God should take life.
## 12 marks: evaluate a statement
Evaluate the statement. Refer to religious teaching. Give developed arguments for, developed arguments against, and a justified conclusion.
- Arguments FOR, each with a religious teaching and a chain of reasoning.
- Arguments AGAINST, including another religious view or a non-religious view (humanist or atheist).
- Conclusion: your judgement and the deciding reason. Do not just repeat.
Up to 3 extra marks for spelling, punctuation and specialist terms on some 12-markers.
## Specialist vocabulary
Use the key terms: sanctity of life, stewardship, agape, Tawhid, Akhirah, Ummah, atonement, salvation. Practise them in Learn → RE.
! Giving one-sided 12-mark answers. Both sides are required.
! Inventing quotes. Paraphrase accurately if unsure.
* For 12 markers aim for two developed points each side plus a conclusion: about 15 minutes.
? What must a 5-mark answer include that a 4-mark answer does not? | A reference to a source of religious belief or teaching
? What does a 12-mark answer need? | Arguments for, arguments against, religious teaching, a justified conclusion
? What does "contrasting" mean in a 4-mark question? | Two different or opposing views`);

G('re-christ', 're', 'Christianity: core beliefs and practices', ['r-chr-beliefs', 'r-chr-practice', 'd-r-chr'], 'The beliefs and practices that come up most often, each with a teaching you can quote.', `
## The nature of God
God is omnipotent (all-powerful), benevolent (all-loving) and just (fair). The problem of evil asks why a loving, powerful God allows suffering; Christian responses include free will and suffering as a test or opportunity to help others.
## The Trinity
One God in three persons: the Father (creator), the Son (Jesus, God incarnate) and the Holy Spirit (God's presence in the world). Shown at Jesus's baptism (Matthew 3:16–17). Stated in the Nicene Creed.
## Creation
Genesis 1–2: God created the world in six days. Literalists take this word for word; most Christians read it as showing that God created, compatible with science. John 1:1: "In the beginning was the Word".
## Jesus
Incarnation: God became human in Jesus. Crucifixion: Jesus died on the cross. Resurrection: he rose on the third day, showing victory over death. Ascension: he returned to heaven. Atonement: his death repaired the relationship between God and humanity, offering salvation.
## Life after death
Judgement by God; heaven (eternal life with God) and hell (separation from God). Catholics also believe in purgatory. Some Christians believe in the resurrection of the body, others of the soul.
## Worship and sacraments
Liturgical worship (set structure, e.g. the Catholic Mass), non-liturgical (informal, e.g. Pentecostal), private worship (personal prayer). Sacraments: baptism (infant or believers') and the Eucharist (Holy Communion), remembering the Last Supper.
## Prayer, pilgrimage and festivals
The Lord's Prayer was taught by Jesus. Pilgrimage sites include Lourdes and Iona. Christmas celebrates the incarnation; Easter the resurrection.
## The Church in the world
Evangelism and mission, church growth, food banks, street pastors, reconciliation, and fighting persecution. Worldwide: Christian Aid, CAFOD and Tearfund.
* Pair every belief with a source: you will need them for 5-mark and 12-mark questions.
? What does the Trinity mean? | One God in three persons: Father, Son and Holy Spirit
? What is atonement? | Restoring the relationship between humans and God through Jesus's death
? Name two sacraments | Baptism and the Eucharist`);

G('re-islam', 're', 'Islam: core beliefs and practices', ['r-isl-beliefs', 'r-isl-practice', 'd-r-isl'], 'Sunni and Shi\'a beliefs, the Five Pillars, and what each one means to Muslims.', `
## Tawhid
The oneness of God: Allah is one and unique, and nothing can be compared to him (Surah 112). It is the most important Muslim belief.
## Sunni and Shi'a
After Muhammad's death in 632 CE, Sunni Muslims followed Abu Bakr, chosen by the community; Shi'a Muslims believed leadership should pass through Muhammad's family, starting with Ali. Sunni Muslims follow the Six Articles of Faith; Shi'a Muslims follow the Five Roots of Usul ad-Din (including Imamah and Adalat).
## The Six Articles of Faith (Sunni)
Belief in Allah (Tawhid); angels; the holy books; the prophets (Risalah); the Day of Judgement (Akhirah); predestination (al-Qadr).
## Prophets and holy books
Prophets include Adam, Ibrahim, Musa, Isa and Muhammad (the final prophet). Books: the Qur'an (revealed to Muhammad by the angel Jibril), the Torah, the Psalms, the Gospel and the Scrolls of Abraham.
## Life after death (Akhirah)
Everyone will be judged on the Day of Judgement. The faithful go to Jannah (paradise); others to Jahannam (hell). This encourages Muslims to live good lives.
## The Five Pillars
- Shahadah: the declaration of faith.
- Salah: prayer five times a day, after wudu (washing), facing Makkah (the qiblah). Jummah is Friday prayer at the mosque.
- Zakah: giving 2.5% of savings to the poor; it purifies wealth. (Shi'a Muslims also pay khums.)
- Sawm: fasting from dawn to sunset during Ramadan; builds self-discipline and empathy with the poor.
- Hajj: pilgrimage to Makkah at least once if able. Includes circling the Ka'aba, standing at Arafat and stoning the pillars at Mina.
## Jihad
Greater jihad: the personal struggle to live as a good Muslim. Lesser jihad: holy war, only under strict conditions (in defence, as a last resort, without harming civilians).
## Festivals
Id-ul-Fitr ends Ramadan. Id-ul-Adha remembers Ibrahim's willingness to sacrifice his son and comes at the end of Hajj. Ashura: Shi'a Muslims mourn Husayn's death at Karbala.
* Explain WHY each practice matters to Muslims, not just what it is.
? What is Tawhid? | The oneness of God
? What percentage of savings is given in Zakah? | 2.5%
? What is greater jihad? | The personal struggle to live as a good Muslim`);

/* ================= views ================= */
const STUDY_BY = Object.fromEntries(STUDY.map(g => [g.id, g]));
let STUDY_SUBJ = 'all', GUIDE_SEL = null, GUIDE_BACK = 'study';
const readMins = g => Math.max(3, Math.round(g.body.split(/\s+/).length / 170));
function guideBody(body) {
  const out = []; let list = null, kind = null;
  const flush = () => { if (list) out.push(list); list = null; kind = null; };
  const bucket = (k, make) => { if (kind !== k) { flush(); list = make(); kind = k; } return list; };
  for (const raw of body.trim().split('\n')) {
    const l = raw.trim(); if (!l) continue;
    if (l.startsWith('## ')) { flush(); out.push(h('h3', { class: 'g-h' }, l.slice(3))); }
    else if (l.startsWith('- ')) bucket('ul', () => h('ul', { class: 'g-ul' })).append(h('li', null, l.slice(2)));
    else if (l.startsWith('> ')) bucket('ex', () => h('div', { class: 'g-ex' }, h('span', { class: 'g-tag' }, 'Worked example'))).append(h('p', null, l.slice(2)));
    else if (l.startsWith('! ')) bucket('mis', () => h('div', { class: 'g-mis' }, h('span', { class: 'g-tag' }, 'Common mistakes'), h('ul'))).lastChild.append(h('li', null, l.slice(2)));
    else if (l.startsWith('* ')) bucket('tip', () => h('div', { class: 'g-tip' }, h('span', { class: 'g-tag' }, 'Exam tips'), h('ul'))).lastChild.append(h('li', null, l.slice(2)));
    else if (l.startsWith('? ')) { const [q, a] = l.slice(2).split(' | '); bucket('chk', () => h('div', { class: 'g-chk', id: 'checks' }, h('span', { class: 'g-tag' }, 'Quick check: answer, then tap to reveal'))).append(h('details', null, h('summary', null, q), h('p', null, a))); }
    else { flush(); out.push(h('p', { class: 'g-p' }, l)); }
  }
  flush(); return out;
}
function vStudy() {
  const subs = LEARN.SUBJECTS.filter(s => STUDY.some(g => g.subj === s.id)), shown = STUDY.filter(g => STUDY_SUBJ === 'all' || g.subj === STUDY_SUBJ);
  const ses = activeSession(), done = Object.keys(S.read).length;
  return h('div', { class: 'stack' },
    hero('Study', 'Understand it properly', 'In-depth guides to the hardest topics: plain explanations, worked examples, the mistakes that cost marks, and quick checks. Each one links straight to practice.'),
    tilt(h('button', { type: 'button', class: 'lcard wide sess-card', 'data-act': 'go', 'data-tab': 'session' }, h('span', { class: 'lc-ic' }, icon('play')),
      h('b', null, ses ? 'Resume your revision session' : 'Start a revision session'),
      h('span', { class: 'lc-d' }, ses ? `${sessDone(ses)} of ${sessSteps(ses)} steps done · ${ses.blocks.map(b => SUBJ_BY[b.sid].name).join(', ')}` : 'Choose how long you have. It plans each block around the subjects you most need to improve, with the right guide and practice for each.'),
      h('small', null, ses ? 'Carry on' : 'Plan my session'))),
    card(null, null, h('div', { class: 'chips scroll' }, chip(`All (${STUDY.length})`, STUDY_SUBJ === 'all', 'studySubj', { 'data-id': 'all' }),
      subs.map(s => chip([icon(s.icon), s.name], STUDY_SUBJ === s.id, 'studySubj', { 'data-id': s.id }))),
      h('p', { class: 'muted xs' }, `${done} of ${STUDY.length} guides read.`)),
    subs.filter(s => STUDY_SUBJ === 'all' || s.id === STUDY_SUBJ).map(s => card(s.name, h('span', { class: 'muted' }, `${shown.filter(g => g.subj === s.id).length} guides`),
      h('ul', { class: 'guides-l' }, shown.filter(g => g.subj === s.id).map(g => h('li', null, h('button', { type: 'button', 'data-act': 'guide', 'data-id': g.id },
        h('span', { class: 'gl-t' }, h('b', null, g.title), h('small', null, g.lead)), h('span', { class: 'gl-m' }, S.read[g.id] ? h('span', { class: 'pill won' }, '✓ read') : h('small', null, `${readMins(g)} min`)))))))));
}
function vGuide() {
  const g = STUDY_BY[GUIDE_SEL]; if (!g) return vStudy();
  const same = STUDY.filter(x => x.subj === g.subj), i = same.indexOf(g), next = same[i + 1];
  return h('div', { class: 'stack narrow guide-v' },
    subHero(SUBJ_BY[g.subj].name, g.title, GUIDE_BACK, null, GUIDE_BACK === 'session' ? 'Back to your session' : 'Study'),
    h('p', { class: 'lede' }, g.lead),
    h('article', { class: 'card guide-body' }, guideBody(g.body)),
    sebFactCard(`${g.title} ${g.topics.map(LEARN.name).join(' ')}`, g.subj, 'g' + g.id),
    g.topics.length > 0 && card('Practise this now', null, h('p', { class: 'muted xs' }, 'Questions are generated fresh, and wrong ones come back until they stick.'),
      h('div', { class: 'chips' }, g.topics.map(t => chip([icon('play'), LEARN.name(t)], false, 'guideDrill', { 'data-topic': t })))),
    h('div', { class: 'row' }, S.read[g.id] ? h('span', { class: 'pill won' }, `✓ Read ${fmtDate(S.read[g.id])}`) : B([icon('check'), 'Mark as read'], 'guideRead', 'primary', { 'data-id': g.id }),
      next && B(['Next: ', next.title], 'guide', 'ghost', { 'data-id': next.id })));
}

/* ================= revision sessions ================= */
/* Priority = how far each subject is from its target grade, plus what the app has seen you get wrong.
   shortcut: falls back to the report grades from the project when none are entered in Settings. */
const REPORT = { Maths: ['2', '4'], Science: ['3', '4'], RE: ['3-', '4'], 'English Literature': ['4-', '5'], Geography: ['4', '5'], 'English Language': ['5-', '6'], Business: ['5', '6'] };
const gradeNum = g => { const m = String(g || '').match(/(\d)([+-]?)/); return m ? +m[1] + (m[2] === '+' ? .3 : m[2] === '-' ? -.3 : 0) : null; };
function subjGap(subj) {
  const g = S.grades[subj] || {}, rep = REPORT[subj] || ['4', '5'];
  const curS = gradeNum(g.cur) != null ? g.cur : rep[0], tgtS = gradeNum(g.tgt) != null ? g.tgt : rep[1], cur = gradeNum(curS), tgt = gradeNum(tgtS);
  return { cur, tgt, curS, tgtS, gap: Math.max(0, tgt - cur), own: !!(g.cur && g.tgt) };
}
const accOf = id => { const k = skill(id); return k.rec.length ? k.rec.filter(Boolean).length / k.rec.length : null; };
function subjPriority(sid) {
  const s = SUBJ_BY[sid], gp = subjGap(s.subj), tried = s.topics.map(accOf).filter(a => a != null);
  const weak = tried.length ? 1 - tried.reduce((a, b) => a + b, 0) / tried.length : .5;
  const fixes = S.queue.filter(x => LEARN.trackOf(x.id) === sid).length;
  /* gap to target, how low the grade is now, Maths as the stated top priority, then live weakness data */
  return gp.gap * 10 + Math.max(0, 5 - gp.cur) * 4 + (sid === 'maths' ? 8 : 0) + weak * 10 + fixes * 3 + (STUDY.some(g => g.subj === sid) ? 0 : -50);
}
const sessRank = () => LEARN.SUBJECTS.map(s => s.id).filter(sid => STUDY.some(g => g.subj === sid)).sort((a, b) => subjPriority(b) - subjPriority(a));
function guideScore(g, used) {
  if (used.has(g.id)) return -1e9;
  let sc = S.read[g.id] ? 0 : 10;
  for (const t of g.topics) { if (S.queue.some(x => x.id === t)) sc += 50; const a = accOf(t); sc += a == null ? 6 : (1 - a) * 30; if (stars(t) === 3) sc -= 8; if (g.subj === 'maths' && typeof MUST4 !== 'undefined' && MUST4.has(t)) sc += 4; }
  return sc / Math.max(1, Math.sqrt(g.topics.length)) + Math.random(); /* small tie-break so plans vary */
}
function weakestTopic(g) {
  const ts = g.topics.filter(t => LEARN.TOPIC[t] && !S.hidden[t]);
  return ts.find(t => S.queue.some(x => x.id === t)) || ts.slice().sort((a, b) => (accOf(a) ?? -1) - (accOf(b) ?? -1))[0] || null;
}
const ESSAY = new Set(['englit', 'englang', 're']);
function makeSession(mins, subs) {
  const n = Math.max(1, Math.round(mins / 25)), used = new Set(), blocks = [];
  for (let i = 0; i < n; i++) {
    const sid = subs[i % subs.length], gs = STUDY.filter(g => g.subj === sid).sort((a, b) => guideScore(b, used) - guideScore(a, used)), g = gs[0];
    if (!g) continue;
    used.add(g.id);
    const topic = weakestTopic(g), tn = topic ? LEARN.name(topic) : g.title;
    blocks.push({ sid, gid: g.id, topic, steps: [
      { k: 'blurt', m: 3, t: `Warm up from memory: without notes, write down everything you already know about ${topic ? tn : g.title.split(':')[0]}. The gaps show you what to focus on.` },
      { k: 'learn', m: 8, t: `Read the guide "${g.title}". Copy each worked example by hand and cover the answer before checking.` },
      ESSAY.has(sid)
        ? { k: 'plan', m: 11, t: `Apply it: plan one exam answer in Plans and writing (5 minutes), then write one full paragraph using the guide's structure.${topic ? ` Finish with a few ${tn} questions.` : ''}` }
        : { k: 'practise', m: 11, t: topic ? `Practise ${tn}. Keep going until you get 3 right in a row; read the method on every one you miss.` : 'Answer the quick-check questions, then redo the worked examples without looking.' },
      { k: 'check', m: 3, t: 'Check yourself: answer the guide\'s quick-check questions from memory, then compare with your warm-up notes. What did you learn?' }
    ].map(s => ({ ...s, d: false })) });
  }
  return { day: dkey(), mins, blocks };
}
function sessNorm(raw) {
  const r = obj(raw); if (!isKey(r.day) || !Array.isArray(r.blocks)) return null;
  const blocks = r.blocks.map(obj).filter(b => STUDY_BY[b.gid] && STUDY_BY[b.gid].subj === b.sid) /* runs during app start-up: only use data loaded before app.js */.slice(0, 6).map(b => ({ sid: b.sid, gid: b.gid, topic: LEARN.TOPIC[b.topic] ? b.topic : null,
    steps: arr(b.steps).map(obj).filter(s => s.k && s.t).slice(0, 6).map(s => ({ k: str(s.k, 12), m: clamp(Math.round(num(s.m, 5)), 1, 60), t: str(s.t, 400), d: !!s.d })) }));
  return blocks.length ? { day: r.day, mins: clamp(Math.round(num(r.mins, 50)), 25, 200), blocks } : null;
}
const sessSteps = s => s.blocks.reduce((a, b) => a + b.steps.length, 0), sessDone = s => s.blocks.reduce((a, b) => a + b.steps.filter(x => x.d).length, 0);
const activeSession = () => S.sess && sessDone(S.sess) < sessSteps(S.sess) ? S.sess : null;
let SESS_D = null;
function vSession() {
  const ses = S.sess;
  if (!ses || SESS_D) return sessPlanner();
  const total = sessSteps(ses), done = sessDone(ses), finished = done === total;
  const cur = ses.blocks.findIndex(b => b.steps.some(x => !x.d));
  return h('div', { class: 'stack narrow' },
    subHero('Study', 'Your revision session', 'study', null, 'Study'),
    card(finished ? 'Session complete' : `${ses.mins}-minute session`, h('span', { class: 'pill' }, `${done} / ${total} steps`), bar(done / total * 100),
      finished ? h('p', null, 'Well done. That is real, focused revision. Log it, take a proper break, and come back tomorrow.')
        : h('p', { class: 'muted xs' }, 'Work through each step in order. Each block is one 25-minute focus set; take a 5-minute break between blocks.'),
      h('div', { class: 'row' }, !finished && !T.run && B([icon('flame'), 'Start a 25-minute focus timer'], 'sessTimer', 'primary'), T.run && h('span', { class: 'pill' }, 'Timer running: see the top bar'),
        B(finished ? 'Plan another session' : 'Re-plan', 'sessNew', 'ghost'))),
    ses.blocks.map((b, bi) => {
      const g = STUDY_BY[b.gid], s = SUBJ_BY[b.sid];
      return [bi > 0 && h('p', { class: 'brk-line muted xs' }, icon('moon'), ' 5-minute break: stand up, drink water, no scrolling'),
        h('section', { class: 'card sess-block' + (bi === cur ? ' now' : '') + (b.steps.every(x => x.d) ? ' done' : '') },
          h('div', { class: 'card-h' }, h('h2', null, `Block ${bi + 1}: ${s.name}`), h('span', { class: 'muted' }, '25 min')),
          h('p', { class: 'muted xs' }, `Guide: ${g.title}${b.topic ? ` · Practice: ${LEARN.name(b.topic)}` : ''}`),
          h('ol', { class: 'sess-steps' }, b.steps.map((st, si) => h('li', { class: st.d ? 'd' : '' },
            h('label', { class: 'chk' + (st.d ? ' d' : '') }, h('input', { type: 'checkbox', checked: st.d, 'data-act': 'sessTick', 'data-b': bi, 'data-s': si }), checkBox(),
              h('span', null, h('b', null, { blurt: 'Warm up', learn: 'Learn', practise: 'Practise', plan: 'Apply', check: 'Check' }[st.k] || 'Step', ` · ${st.m} min`), h('br'), st.t)),
            st.k === 'learn' || st.k === 'check' ? B([icon('book'), st.k === 'check' ? 'Open the quick check' : 'Open the guide'], 'guide', 'ghost sm', { 'data-id': b.gid, 'data-from': 'session', 'data-anchor': st.k === 'check' ? 'checks' : '' })
              : st.k === 'practise' && b.topic ? B([icon('play'), 'Practise now'], 'sessDrill', 'ghost sm', { 'data-topic': b.topic })
              : st.k === 'plan' ? h('div', { class: 'row' }, B([icon('edit'), 'Plans and writing'], 'go', 'ghost sm', { 'data-tab': 'write' }), b.topic && B([icon('play'), 'Questions'], 'sessDrill', 'ghost sm', { 'data-topic': b.topic })) : null))))];
    }));
}
function sessPlanner() {
  const rank = sessRank(), D = SESS_D || (SESS_D = { mins: 50, subs: null });
  const n = Math.max(1, Math.round(D.mins / 25)), subs = D.subs || rank.slice(0, Math.min(n, 3));
  const own = SUBJ.some(s => S.grades[s] && S.grades[s].cur && S.grades[s].tgt);
  return h('div', { class: 'stack narrow' },
    subHero('Study', 'Plan a revision session', 'study', 'Each 25-minute block follows the method that works best: recall from memory first, learn from a guide, practise with feedback, then check yourself. Subjects you most need to improve come first.', 'Study'),
    card('How long have you got?', null, h('div', { class: 'chips' }, [25, 50, 75, 100].map(m => chip(`${m} min`, D.mins === m, 'sessMins', { 'data-m': m }))),
      h('p', { class: 'muted xs' }, `${n} block${n > 1 ? 's' : ''} of 25 minutes${n > 1 ? ', with 5-minute breaks between them' : ''}.`)),
    card('Subjects', h('span', { class: 'muted' }, 'most needed first'), h('p', { class: 'muted xs' }, own ? 'Ranked by the gap between your current and target grades in Settings, and by what you have been getting wrong.' : 'Ranked by the gap between your report grades and your targets, and by what you have been getting wrong. Add your own grades in Settings to fine-tune this.'),
      h('div', { class: 'sess-subs' }, rank.map(sid => { const s = SUBJ_BY[sid], gp = subjGap(s.subj), on = subs.includes(sid);
        return h('button', { type: 'button', class: 'sess-sub' + (on ? ' on' : ''), 'data-act': 'sessSub', 'data-id': sid, 'aria-pressed': String(on) },
          icon(s.icon), h('span', null, h('b', null, s.name), h('small', null, `now ${gp.curS} → aim ${gp.tgtS}`)), on ? h('span', { class: 'pill won' }, '✓') : null); })),
      h('p', { class: 'muted xs' }, `${subs.length} selected. Blocks rotate through them in order.`)),
    B([icon('sparkle'), 'Build my session'], 'sessBuild', 'primary wide', { disabled: !subs.length }),
    S.sess && B('Cancel', 'sessCancel', 'link'));
}
const STUDYACT = {
  studySubj(el) { STUDY_SUBJ = el.dataset.id; render(); },
  guide(el) { GUIDE_SEL = el.dataset.id; GUIDE_BACK = el.dataset.from === 'session' ? 'session' : 'study'; go('guide'); if (el.dataset.anchor) setTimeout(() => $('#checks')?.scrollIntoView({ block: 'start' }), 500); },
  guideRead(el) { S.read[el.dataset.id] = dkey(); save(); toast('Marked as read'); render(); },
  guideDrill(el) { startDrill(LEARN.trackOf(el.dataset.topic), el.dataset.topic, 'guide'); go('drill', '#ans'); },
  sessDrill(el) { startDrill(LEARN.trackOf(el.dataset.topic), el.dataset.topic, 'sess'); go('drill', '#ans'); },
  sessMins(el) { SESS_D.mins = +el.dataset.m; SESS_D.subs = null; render(); },
  sessSub(el) {
    const rank = sessRank(), n = Math.max(1, Math.round(SESS_D.mins / 25)), cur = SESS_D.subs || rank.slice(0, Math.min(n, 3)), id = el.dataset.id;
    SESS_D.subs = cur.includes(id) ? cur.filter(x => x !== id) : rank.filter(x => cur.includes(x) || x === id); render();
  },
  sessBuild() {
    const rank = sessRank(), n = Math.max(1, Math.round(SESS_D.mins / 25)), subs = SESS_D.subs || rank.slice(0, Math.min(n, 3));
    if (!subs.length) return toast('Pick at least one subject');
    S.sess = makeSession(SESS_D.mins, subs); SESS_D = null; save(); toast('Session planned. Start with block 1.'); render(); scrollTo({ top: 0 });
  },
  sessNew() { if (activeSession() && !confirm('Replace this session with a new plan?')) return; SESS_D = { mins: S.sess ? S.sess.mins : 50, subs: null }; render(); },
  sessCancel() { SESS_D = null; render(); },
  sessTimer() { if (T.run) return; T.mode = 'focus'; T.left = tTotal(); ACT.tgl(); go('session'); },
  sessTick(el) {
    const st = S.sess.blocks[+el.dataset.b].steps[+el.dataset.s]; st.d = el.checked; save();
    if (sessDone(S.sess) === sessSteps(S.sess)) { xp(30); FXS.reveal('Session complete', `${S.sess.mins} minutes of real revision`, 'Every block: recall, learn, practise, check. That is how it sticks.'); }
    render();
  }
};
