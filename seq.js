/* Archeron · "Put it in order": processes, required practicals, plots and timelines, written for AQA GCSE.
   SQ(practice topic id, title, steps in the right order). Each sequence is asked inside its topic's practice and in lessons.
   Steps are short so they fit a phone; the topic id must exist in LEARN.TOPIC or the sequence is skipped. */
'use strict';
const SEQS = [];
const SQ = (topic, title, steps) => SEQS.push({ id: 's' + SEQS.length, topic, title, steps });

/* ---------------- Biology ---------------- */
SQ('q3-b-practicals', 'Required practical: osmosis in potato', ['Cut potato cylinders the same size with a cork borer', 'Blot each one dry and weigh it', 'Put each cylinder in a different sugar concentration', 'Leave them for the same time at the same temperature', 'Take them out, blot dry and weigh again', 'Work out the percentage change in mass']);
SQ('q3-b-practicals', 'Required practical: pH and amylase', ['Put a drop of iodine in each well of a spotting tile', 'Put amylase and a pH buffer in a tube in a 35 °C water bath', 'Add starch and start the stopwatch', 'Every 30 seconds, drop some mixture onto fresh iodine', 'Stop when the iodine stays orange-brown', 'Repeat with buffers of other pH values']);
SQ('b-energy', 'Required practical: light and photosynthesis', ['Put pondweed in water with sodium hydrogencarbonate', 'Place a lamp a measured distance away', 'Let the pondweed adjust for a few minutes', 'Count the oxygen bubbles in one minute', 'Move the lamp and repeat', 'Plot the rate against the distance']);
SQ('b-nerves', 'A reflex arc', ['A receptor detects the stimulus', 'An impulse travels along a sensory neurone', 'It crosses a synapse to a relay neurone in the spinal cord', 'It passes to a motor neurone', 'The effector (a muscle or gland) responds']);
SQ('b-heart', 'Blood through the heart, starting from the body', ['Vena cava', 'Right atrium', 'Right ventricle', 'Pulmonary artery', 'Lungs', 'Pulmonary vein', 'Left atrium', 'Left ventricle', 'Aorta']);
SQ('b-digestion', 'The journey of a meal', ['Mouth: chewing, and amylase starts digesting starch', 'Oesophagus: food is pushed down', 'Stomach: protease and acid digest protein', 'Small intestine: digestion finishes and products are absorbed', 'Large intestine: water is absorbed', 'Waste leaves the body']);
SQ('b-genes', 'Natural selection', ['There is variation in a population', 'Some individuals have a characteristic that suits the environment', 'They are more likely to survive and reproduce', 'They pass on the genes for that characteristic', 'Over many generations it becomes more common']);
SQ('b-cells', 'The cell cycle and mitosis', ['The cell grows and copies its organelles', 'The DNA is copied, so each chromosome has two copies', 'One set of chromosomes is pulled to each end of the cell', 'The nucleus divides', 'The cytoplasm and membrane divide: two identical cells']);
SQ('b-disease', 'How a vaccine protects you', ['A dead or inactive pathogen is injected', 'White blood cells detect its antigens', 'They make antibodies and memory cells', 'Later, the live pathogen gets into the body', 'Antibodies are made fast and in large amounts', 'The pathogen is destroyed before you feel ill']);
SQ('b-hormones', 'After a meal: bringing blood glucose down', ['Blood glucose rises after eating', 'The pancreas detects the rise', 'The pancreas releases insulin into the blood', 'Insulin makes cells take up glucose', 'The liver and muscles store extra glucose as glycogen', 'Blood glucose falls back to normal']);
SQ('b-ecology', 'Estimating a population with quadrats', ['Measure the area of the field', 'Place quadrats at random positions', 'Count the organisms in each quadrat', 'Repeat with many quadrats', 'Work out the mean number per m²', 'Multiply by the area of the field']);

/* ---------------- Chemistry ---------------- */
SQ('q3-c-practicals', 'Required practical: making copper sulfate crystals', ['Warm dilute sulfuric acid in a beaker', 'Add copper oxide until no more dissolves', 'Filter off the excess copper oxide', 'Heat the solution to evaporate some of the water', 'Leave it to cool so crystals form', 'Pat the crystals dry']);
SQ('c-organic', 'Fractional distillation of crude oil', ['Heat crude oil until most of it evaporates', 'The vapours enter the bottom of the column', 'They rise and cool as they go up', 'Each fraction condenses at its boiling point', 'Fractions are collected: long chains low down, short chains at the top']);
SQ('c-separation', 'Simple distillation of salty water', ['Heat the salty water in a flask', 'The water boils and becomes steam', 'The steam passes into the condenser', 'It cools and condenses back to water', 'Pure water drips into the beaker; the salt stays behind']);
SQ('c-separation', 'Paper chromatography', ['Draw a pencil start line near the bottom of the paper', 'Put spots of ink on the line', 'Stand the paper in solvent, below the line', 'Let the solvent soak up the paper', 'Mark the solvent front', 'Measure the distances and work out Rf values']);
SQ('c-atoms', 'Models of the atom, oldest first', ['Tiny solid spheres that cannot be divided', 'Plum pudding: a ball of positive charge with electrons in it', 'Nuclear model: mass in a small, positive nucleus', 'Bohr: electrons in fixed shells', 'Chadwick: neutrons in the nucleus']);
SQ('c-reactions', 'Reactivity series, most reactive first', ['Potassium', 'Sodium', 'Calcium', 'Magnesium', 'Zinc', 'Iron', 'Copper']);
SQ('c-atmos', "How Earth's atmosphere changed", ['Volcanoes release carbon dioxide, water vapour and nitrogen', 'Water vapour condenses to form the oceans', 'Carbon dioxide dissolves in the oceans and forms sediments', 'Algae and plants photosynthesise and release oxygen', 'Oxygen builds up and carbon dioxide falls']);
SQ('c-rates', 'Required practical: the disappearing cross', ['Draw a cross on paper and put a flask on it', 'Add sodium thiosulfate solution to the flask', 'Add hydrochloric acid and start the timer', 'Watch the cross through the solution', 'Stop the timer when the cross disappears', 'Repeat with a different concentration']);

/* ---------------- Physics ---------------- */
SQ('pr-energy', 'Required practical: specific heat capacity', ['Measure the mass of the metal block', 'Put in the heater and thermometer and insulate the block', 'Record the starting temperature', 'Switch on and measure the energy with a joulemeter', 'Record the final temperature', 'Work out c = ΔE ÷ (m × Δθ)']);
SQ('pr-electric', 'Required practical: resistance of a wire', ['Connect the wire to a power supply with an ammeter in series', 'Connect a voltmeter across the wire', 'Set a length of wire with crocodile clips', 'Read the current and potential difference', 'Work out R = V ÷ I', 'Repeat for other lengths and plot a graph']);
SQ('p-density', 'Density of an irregular stone', ['Weigh the stone on a balance', 'Fill a eureka can to the spout', 'Lower the stone in and collect the water that overflows', 'Measure that water in a measuring cylinder', 'Work out density = mass ÷ volume']);
SQ('pr-particles', 'Heating ice until it becomes steam', ['Ice warms up to 0 °C', 'Ice melts at 0 °C and the temperature stays the same', 'Water warms from 0 °C to 100 °C', 'Water boils at 100 °C and the temperature stays the same', 'Steam heats up above 100 °C']);
SQ('pr-forces-waves', 'Electromagnetic spectrum, longest wavelength first', ['Radio waves', 'Microwaves', 'Infrared', 'Visible light', 'Ultraviolet', 'X-rays', 'Gamma rays']);
SQ('pr-electric', 'The National Grid, power station to home', ['The power station generates electricity', 'A step-up transformer raises the potential difference', 'Cables carry it at high p.d. and low current', 'A step-down transformer lowers the potential difference', 'It reaches homes at 230 V']);
SQ('pr-forces-waves', 'Stopping a car', ['The driver sees a hazard', 'The car travels the thinking distance while the driver reacts', 'The driver presses the brake', 'Friction slows the car over the braking distance', 'The car stops']);

/* ---------------- Maths ---------------- */
SQ('frac-mul', 'Dividing fractions', ['Keep the first fraction', 'Change ÷ to ×', 'Flip the second fraction', 'Multiply the tops and the bottoms', 'Simplify']);
SQ('solve-2', 'Solving 5x + 3 = 2x + 15', ['Subtract 2x from both sides: 3x + 3 = 15', 'Subtract 3 from both sides: 3x = 12', 'Divide both sides by 3: x = 4', 'Check: both sides make 23']);
SQ('pct-change', 'Percentage change', ['Find the change: new − original', 'Divide the change by the original', 'Multiply by 100', 'Write it with a % sign']);
SQ('ratio-share', 'Sharing in a ratio', ['Add the ratio numbers to get the total parts', 'Divide the amount by the total parts', 'Multiply one part by each ratio number', 'Check the shares add up to the amount']);
SQ('averages', 'Finding the median', ['Write the numbers in order', 'Count how many there are', 'Find the middle position: (n + 1) ÷ 2', 'Two middle values? Take the halfway point']);
SQ('pythag', 'Finding the hypotenuse', ['Square the two shorter sides', 'Add the squares', 'Square root the total', 'Check it is the longest side']);
SQ('nth-term', 'Finding the nth term', ['Find the difference between the terms', 'Write the difference in front of n', 'Compare that with the sequence', 'Add or subtract to make it match', 'Check it with a term']);
SQ('bidmas', 'BIDMAS: what to do first', ['Brackets', 'Indices (powers and roots)', 'Division and multiplication, left to right', 'Addition and subtraction, left to right']);

/* ---------------- English Language ---------------- */
SQ('el-papers', 'Language Paper 1, question by question', ['Q1: list four things (4 marks)', 'Q2: how language is used (8 marks)', 'Q3: how the text is structured (8 marks)', 'Q4: evaluate a statement (20 marks)', 'Q5: descriptive or narrative writing (40 marks)']);
SQ('el-papers', 'Language Paper 2, question by question', ['Q1: choose four true statements (4 marks)', 'Q2: summarise the differences (8 marks)', 'Q3: how language is used (12 marks)', 'Q4: compare the writers\' viewpoints (16 marks)', 'Q5: viewpoint writing (40 marks)']);
SQ('d-el-terms', 'A classic story shape', ['Exposition: set the scene and the character', 'Rising action: a problem appears', 'Climax: the most tense moment', 'Falling action: the consequences', 'Resolution: how it ends']);

/* ---------------- English Literature ---------------- */
SQ('q2-mac-plot', 'Macbeth: key events', ['The witches greet Macbeth with prophecies', 'Macbeth is made Thane of Cawdor', 'Macbeth murders Duncan', 'Banquo is murdered but Fleance escapes', "Banquo's ghost appears at the banquet", "Macduff's family is murdered", 'Lady Macbeth sleepwalks', 'Macduff kills Macbeth']);
SQ('q2-acc-plot', 'A Christmas Carol: the staves', ["Marley's ghost visits Scrooge", 'The Ghost of Christmas Past', 'The Ghost of Christmas Present', 'The Ghost of Christmas Yet to Come', 'Scrooge wakes on Christmas morning, changed']);
SQ('lit-je', "Journey's End: key events", ['Raleigh arrives in the dugout', 'Stanhope worries Raleigh will write home about his drinking', "Stanhope reads Raleigh's letter", 'Osborne and Raleigh lead the raid', 'Osborne is killed in the raid', 'Raleigh is badly wounded in the German attack', 'Stanhope stays with Raleigh as he dies']);
SQ('d-lit-terms', 'Building a Literature paragraph', ['Make a point that answers the question', 'Give a quote as evidence', 'Name the method', 'Explain the effect', 'Link to context', 'Link back to the question']);

/* ---------------- Geography ---------------- */
SQ('g-coasts-rivers', 'How a waterfall forms', ['A river flows over hard rock lying on soft rock', 'The soft rock erodes faster and undercuts the hard rock', 'An overhang of hard rock forms', 'The overhang collapses into the plunge pool', 'The waterfall retreats upstream, leaving a gorge']);
SQ('g-coasts-rivers', 'Longshore drift', ['Waves reach the beach at an angle, with the prevailing wind', 'The swash carries sediment up the beach at that angle', 'The backwash pulls it straight back down', 'Sediment zigzags along the coast']);
SQ('g-coasts-rivers', 'How an oxbow lake forms', ['Erosion on the outside bends tightens the meander', 'The neck of the meander narrows', 'In a flood the river cuts through the neck', 'Deposition seals off the old bend', 'An oxbow lake is left behind']);
SQ('g-weather', 'How a tropical storm forms', ['Warm ocean water (over 27 °C) evaporates', 'Warm, moist air rises fast, making low pressure', 'The air cools and condenses into huge clouds, releasing heat', "The Earth's rotation makes the storm spin", 'It loses energy over land or cooler water']);
SQ('g-tectonics', 'A volcano at a destructive plate margin', ['An oceanic plate moves towards a continental plate', 'The denser oceanic plate sinks (subducts)', 'It melts in the mantle, forming magma', 'Magma rises through cracks in the crust', 'It erupts and builds a volcano']);

/* ---------------- Business ---------------- */
SQ('bs-marketing', 'The product life cycle', ['Development', 'Introduction', 'Growth', 'Maturity', 'Decline']);
SQ('bs-ops-people', 'Recruiting a new worker', ['Identify the vacancy', 'Write a job description and person specification', 'Advertise the job', 'Shortlist the applicants', 'Interview them', 'Appoint the best candidate']);

/* ---------------- RE ---------------- */
SQ('r-chr-beliefs', 'Holy Week and Easter', ['Jesus enters Jerusalem (Palm Sunday)', 'The Last Supper', 'Jesus is arrested in Gethsemane', 'Jesus is tried and crucified', 'Jesus rises from the dead (Easter Sunday)']);
SQ('r-isl-practice', 'Hajj: the main stages', ["Put on ihram at the miqat", "Tawaf: circle the Ka'bah seven times", "Sa'y: walk between Safa and Marwah", 'Stand in prayer at Arafat', 'Collect pebbles at Muzdalifah', 'Stone the pillars at Mina']);
SQ('r-themes', 'A 12-mark answer', ['Arguments for the statement', 'A religious teaching that supports them', 'Arguments against the statement', 'A teaching or view that supports them', 'A justified conclusion']);

/* ---------------- History ---------------- */
SQ('hi-weimar', 'Germany, 1918 to 1933', ['The Kaiser abdicates (1918)', 'The Treaty of Versailles is signed (1919)', 'France occupies the Ruhr (January 1923)', 'The Munich Putsch (November 1923)', 'The Wall Street Crash (1929)', 'Hitler becomes Chancellor (1933)']);
SQ('hi-nazi', 'How Hitler took total control, 1933 to 1934', ['Hitler becomes Chancellor (January 1933)', 'The Reichstag Fire (February 1933)', 'The Enabling Act (March 1933)', 'Trade unions are banned (May 1933)', 'The Night of the Long Knives (June 1934)', 'Hindenburg dies; Hitler becomes Führer (August 1934)']);
SQ('hi-eliz', 'The Spanish Armada, 1588', ['Philip II prepares the Armada', 'It sails up the Channel in a crescent formation', 'It anchors off Calais', 'English fireships scatter the fleet', 'The Battle of Gravelines', 'Storms wreck ships on the way home round Scotland and Ireland']);
SQ('hi-med', 'Breakthroughs in medicine, oldest first', ['Vesalius publishes accurate anatomy (1543)', 'Harvey shows the blood circulates (1628)', "Jenner's smallpox vaccine (1796)", "Pasteur's germ theory (1861)", 'Fleming discovers penicillin (1928)']);

/* ---------------- Computer Science ---------------- */
SQ('cs-algo', 'Bubble sort', ['Compare the first two items', 'Swap them if they are in the wrong order', 'Move along one place and compare the next pair', 'Carry on to the end of the list', 'Repeat passes until a pass makes no swaps']);
SQ('cs-sys', 'The fetch-execute cycle', ['The address in the program counter is copied to the MAR, and the PC goes up by 1', 'The instruction at that address is fetched into the MDR', 'It is copied to the CIR and decoded by the control unit', 'The instruction is executed']);
