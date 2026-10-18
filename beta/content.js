/* Archeron · recall banks. Each line is "prompt|answer" or "prompt|answer|distractor;distractor;distractor".
   Without listed distractors, wrong options come from other answers in the same topic.
   Mostly AQA-aligned GCSE content; topics you don't study can be hidden in Settings. */
'use strict';
const BANKS = {
  /* ---------------- Biology ---------------- */
  'b-cells': ['biology', 'Cell structures', `
Controls the cell and contains genetic material|Nucleus
Where aerobic respiration happens|Mitochondria
Where proteins are made|Ribosomes
Absorbs light for photosynthesis|Chloroplasts
Controls what enters and leaves the cell|Cell membrane
Made of cellulose and strengthens plant cells|Cell wall
Filled with cell sap; keeps plant cells firm|Permanent vacuole
Jelly-like part where most chemical reactions happen|Cytoplasm
Small rings of DNA found in bacteria|Plasmids
Tail-like structure that helps some bacteria move|Flagellum
Cell with no nucleus, e.g. a bacterium|Prokaryotic cell
Cell with a nucleus, e.g. plant and animal cells|Eukaryotic cell`],
  'b-transport': ['biology', 'Transport and cell division', `
Net movement of particles from a high to a low concentration|Diffusion
Movement of water across a partially permeable membrane from a dilute to a more concentrated solution|Osmosis
Movement against a concentration gradient using energy from respiration|Active transport
Cell division that makes two identical cells for growth and repair|Mitosis
Cell division that makes gametes|Meiosis
When a cell becomes specialised to do a particular job|Differentiation
An undifferentiated cell that can become other types of cell|Stem cell
Plant tissue where stem cells are found|Meristem
How root hair cells take in mineral ions from the soil|Active transport
Making the area bigger speeds up diffusion. This is increasing the…|Surface area|Temperature;Concentration gradient;Distance`],
  'b-digestion': ['biology', 'Digestion and enzymes', `
Breaks down starch into sugars|Amylase
Breaks down proteins into amino acids|Protease
Breaks down lipids into fatty acids and glycerol|Lipase
Organ that makes bile|Liver
Organ that stores bile|Gall bladder
Turns blue-black when starch is present|Iodine solution
Turns purple when protein is present|Biuret reagent
Turns brick-red when heated with sugars|Benedict's solution
Turns red when lipids are present|Sudan III
Where most digested food is absorbed into the blood|Small intestine
Finger-like projections that increase surface area in the small intestine|Villi
Part of an enzyme where the substrate fits|Active site
What happens to an enzyme's active site at very high temperatures|It is denatured|It speeds up;It is digested;It gets bigger`],
  'b-heart': ['biology', 'Heart, blood and lungs', `
Carries blood away from the heart at high pressure|Artery
Carries blood back to the heart and has valves|Vein
Tiny vessel where substances are exchanged with tissues|Capillary
Blood cell that carries oxygen|Red blood cell
Blood cell that defends against pathogens|White blood cell
Cell fragments that help blood to clot|Platelets
Liquid part of the blood|Plasma
Chamber that pumps blood around the body|Left ventricle
Takes blood from the heart to the lungs|Pulmonary artery
Brings blood from the lungs to the heart|Pulmonary vein
Main artery carrying blood to the body|Aorta
Main vein bringing blood back from the body|Vena cava
Group of cells in the right atrium that sets the resting heart rate|Pacemaker
Mesh tube used to keep a narrowed coronary artery open|Stent
Drugs that lower blood cholesterol|Statins
Tiny air sacs in the lungs where gas exchange happens|Alveoli`],
  'b-plants': ['biology', 'Plant organisation and photosynthesis', `
Tissue that carries water and mineral ions up the plant|Xylem
Tissue that carries dissolved sugars around the plant|Phloem
Loss of water vapour from the leaves|Transpiration
Movement of dissolved sugars through the phloem|Translocation
Pores on the underside of leaves for gas exchange|Stomata
Cells that open and close the stomata|Guard cells
Leaf layer where most photosynthesis happens|Palisade mesophyll
Gas plants take in for photosynthesis|Carbon dioxide
Gas given out by photosynthesis|Oxygen
Sugar made by photosynthesis|Glucose
Insoluble substance plants store glucose as|Starch
Substance made from glucose to build cell walls|Cellulose`],
  'b-disease': ['biology', 'What causes the disease?', `
Measles|Virus
HIV|Virus
Tobacco mosaic virus (TMV)|Virus
Salmonella food poisoning|Bacterium
Gonorrhoea|Bacterium
Rose black spot|Fungus
Malaria|Protist`],
  'b-immune': ['biology', 'Immunity and medicines', `
White blood cells engulfing and digesting pathogens|Phagocytosis
Proteins made by white blood cells that lock on to specific antigens|Antibodies
Chemicals that neutralise toxins made by bacteria|Antitoxins
Dead or inactive pathogen given to make you immune|Vaccine
Medicines that kill bacteria but not viruses|Antibiotics
Heart drug that comes from foxglove|Digitalis
Painkiller that originally came from willow|Aspirin
Antibiotic discovered by Alexander Fleming|Penicillin
Trial where neither patients nor doctors know who gets the real drug|Double-blind trial
Substance with no effect, given as a control in drug trials|Placebo
Organisms that cause disease|Pathogens
Animal that spreads malaria from person to person|Mosquito|Rat;Housefly;Tick`],
  'b-energy': ['biology', 'Photosynthesis and respiration', `
Word equation for photosynthesis|carbon dioxide + water → glucose + oxygen
Word equation for aerobic respiration|glucose + oxygen → carbon dioxide + water
Anaerobic respiration in muscles|glucose → lactic acid
Anaerobic respiration in yeast (fermentation)|glucose → ethanol + carbon dioxide
Photosynthesis takes in energy from the surroundings, so it is…|Endothermic|Exothermic;Neutral;Reversible
Respiration releases energy, so it is…|Exothermic|Endothermic;Neutral;Reversible
Extra oxygen needed after exercise to break down lactic acid|Oxygen debt|Oxygen surplus;Lactic gain;Breath debt
The sum of all the reactions in a cell or the body|Metabolism|Respiration;Digestion;Homeostasis
Factors that can limit the rate of photosynthesis|Light intensity, temperature, carbon dioxide|Oxygen, glucose, water vapour;Starch, nitrogen, oxygen;Wind, soil type, humidity`],
  'b-hormones': ['biology', 'Hormones and homeostasis', `
Keeping internal conditions constant|Homeostasis
Gland that releases insulin and glucagon|Pancreas
Hormone that lowers blood glucose|Insulin
Hormone that raises blood glucose|Glucagon
Diabetes where the pancreas makes too little insulin|Type 1 diabetes
Diabetes where body cells stop responding to insulin|Type 2 diabetes
The 'master gland' in the brain|Pituitary gland
Main female reproductive hormone, made in the ovaries|Oestrogen
Main male reproductive hormone|Testosterone
Hormone that causes eggs to mature in the ovaries|FSH
Hormone that triggers the release of an egg|LH
Hormone that maintains the uterus lining|Progesterone
Gland that releases adrenaline|Adrenal gland
Gland that releases thyroxine|Thyroid gland`],
  'b-nerves': ['biology', 'The nervous system', `
Fast, automatic response that does not involve the conscious brain|Reflex
Gap between two neurones|Synapse
Carries impulses from receptors to the central nervous system|Sensory neurone
Carries impulses from the central nervous system to effectors|Motor neurone
Connects sensory and motor neurones in a reflex arc|Relay neurone
Brain and spinal cord together|Central nervous system
Muscle or gland that responds to a stimulus|Effector
Cell that detects a stimulus|Receptor`],
  'b-genes': ['biology', 'Inheritance and evolution', `
Molecule that carries genetic information|DNA
Small section of DNA that codes for a protein|Gene
All of an organism's genetic material|Genome
Different forms of the same gene|Alleles
Having two identical alleles, e.g. BB|Homozygous
Having two different alleles, e.g. Bb|Heterozygous
Allele that shows even if only one copy is present|Dominant
The alleles an organism has, e.g. Bb|Genotype
The characteristic that shows, e.g. brown eyes|Phenotype
Inherited disorder causing thick mucus (recessive)|Cystic fibrosis
Inherited disorder causing extra fingers or toes (dominant)|Polydactyly
Scientist who proposed evolution by natural selection|Charles Darwin
When no individuals of a species are left alive|Extinction
Humans breeding plants or animals for useful characteristics|Selective breeding
Adding a gene from one organism to another's genome|Genetic engineering
Remains of organisms from millions of years ago, found in rocks|Fossils
Sex chromosomes of a human male|XY|XX;YY;XO
Number of chromosomes in a normal human body cell|46|23;44;92`],
  'b-ecology': ['biology', 'Ecology', `
All the organisms of one species in a habitat|Population
All the populations of different species in a habitat|Community
A community plus its non-living environment|Ecosystem
Non-living factors such as light and temperature|Abiotic factors
Living factors such as predators and disease|Biotic factors
Organisms that make their own food by photosynthesis|Producers
Square frame used to sample organisms|Quadrat
Line along which samples are taken to show change across a habitat|Transect
The variety of different species in an area|Biodiversity
Microorganisms that break down dead material|Decomposers
Organisms adapted to live in extreme conditions|Extremophiles
Greenhouse gas released by cattle and rice fields|Methane|Oxygen;Nitrogen;Hydrogen`],

  /* ---------------- Chemistry ---------------- */
  'c-atoms': ['chemistry', 'Atoms and the periodic table', `
Positive particle in the nucleus|Proton
Neutral particle in the nucleus|Neutron
Negative particle in the shells|Electron
The number of protons in an atom|Atomic number
The number of protons plus neutrons|Mass number
Atoms of the same element with different numbers of neutrons|Isotopes
Columns in the periodic table|Groups
Rows in the periodic table|Periods
Group 1 elements|Alkali metals
Group 7 elements|Halogens
Group 0 elements|Noble gases
Scientist who left gaps in his periodic table for undiscovered elements|Dmitri Mendeleev
Model of the atom as a ball of positive charge with electrons in it|Plum pudding model
Experiment that showed atoms have a tiny, dense, positive nucleus|Alpha scattering experiment`],
  'c-electrons': ['chemistry', 'Electron arrangements', `
Sodium (atomic number 11)|2,8,1
Chlorine (atomic number 17)|2,8,7
Oxygen (atomic number 8)|2,6
Magnesium (atomic number 12)|2,8,2
Carbon (atomic number 6)|2,4
Neon (atomic number 10)|2,8
Argon (atomic number 18)|2,8,8
Aluminium (atomic number 13)|2,8,3`],
  'c-separation': ['chemistry', 'Mixtures and separation', `
Separating an insoluble solid from a liquid|Filtration
Getting a soluble solid out of a solution|Crystallisation
Separating a liquid from a solution|Simple distillation
Separating liquids with different boiling points|Fractional distillation
Separating the dyes in an ink|Chromatography
Two or more substances not chemically combined|Mixture
Substance made of only one type of atom|Element
Two or more elements chemically combined|Compound`],
  'c-groups': ['chemistry', 'Group trends', `
Reactivity going down group 1|Increases|Decreases;Stays the same;Goes up then down
Reactivity going down group 7|Decreases|Increases;Stays the same;Goes up then down
Boiling point going down group 7|Increases|Decreases;Stays the same;Goes down then up
Why noble gases are unreactive|They have a full outer shell|They are metals;They have no electrons;They are liquids
Products of sodium reacting with water|Sodium hydroxide and hydrogen|Sodium oxide and oxygen;Sodium chloride and water;Sodium and hydrogen oxide
A more reactive halogen does this to a less reactive one in solution|Displaces it|Neutralises it;Dissolves it;Oxidises the water`],
  'c-bonding': ['chemistry', 'Bonding and structure', `
Bonding between a metal and a non-metal|Ionic
Bonding between non-metals|Covalent
Bonding in metals|Metallic
Ionic bonding involves…|Transfer of electrons|Sharing pairs of electrons;Delocalised electrons;Sharing protons
Covalent bonding involves…|Sharing pairs of electrons|Transfer of electrons;Delocalised electrons;Sharing protons
Why ionic compounds conduct when melted or dissolved|The ions are free to move|The electrons are fixed;The molecules are small;The bonds are weak
Why small covalent molecules have low boiling points|Weak forces between molecules|Strong covalent bonds;Free electrons;Charged ions
Giant covalent structure where each carbon forms four bonds|Diamond
Carbon in layers that conducts electricity|Graphite
A single layer of graphite|Graphene
Hollow cage-shaped carbon molecules|Fullerenes
A mixture of a metal with other elements|Alloy
State symbol meaning dissolved in water|(aq)|(l);(s);(g)`],
  'c-reactions': ['chemistry', 'Chemical changes', `
Acid + metal →|salt + hydrogen
Acid + alkali →|salt + water
Acid + metal carbonate →|salt + water + carbon dioxide
Metal + oxygen →|metal oxide
Salts made from hydrochloric acid|Chlorides
Salts made from sulfuric acid|Sulfates
Salts made from nitric acid|Nitrates
pH of a neutral solution|7|1;14;0
Ions that make a solution acidic|H⁺ ions|OH⁻ ions;Cl⁻ ions;Na⁺ ions
Ions that make a solution alkaline|OH⁻ ions|H⁺ ions;Cl⁻ ions;SO₄²⁻ ions
Reaction between an acid and an alkali|Neutralisation|Oxidation;Electrolysis;Combustion
Gain of oxygen|Oxidation|Reduction;Neutralisation;Displacement
Loss of oxygen|Reduction|Oxidation;Neutralisation;Displacement
How metals less reactive than carbon are extracted|Reduction with carbon|Electrolysis;Distillation;Filtration
How metals more reactive than carbon are extracted|Electrolysis|Reduction with carbon;Distillation;Filtration
The negative electrode in electrolysis|Cathode|Anode;Electrolyte;Terminal
The positive electrode in electrolysis|Anode|Cathode;Electrolyte;Terminal`],
  'c-rates': ['chemistry', 'Energy changes and rates', `
Reaction that releases energy to the surroundings|Exothermic
Reaction that takes in energy from the surroundings|Endothermic
Minimum energy particles need to react|Activation energy
Speeds up a reaction without being used up|Catalyst
Biological catalysts|Enzymes
Why a powder reacts faster than lumps|Larger surface area|Smaller surface area;Higher mass;Lower temperature
Why a higher temperature speeds up a reaction|Particles collide more often and with more energy|Particles get bigger;The catalyst is used up;There are fewer particles
A reaction where the products can react to re-form the reactants|Reversible reaction
When forward and reverse reactions happen at the same rate|Equilibrium`],
  'c-organic': ['chemistry', 'Crude oil and fuels', `
Compound of hydrogen and carbon only|Hydrocarbon
Finite resource that is the main source of hydrocarbons|Crude oil
Process that separates crude oil into fractions|Fractional distillation
General formula of the alkanes|CₙH₂ₙ₊₂|CₙH₂ₙ;CₙH₂ₙ₋₂;CₙHₙ
Simplest alkane, CH₄|Methane
Breaking long hydrocarbons into shorter, more useful ones|Cracking
What bromine water does with an alkene|Turns from orange to colourless|Turns from colourless to orange;Turns milky;Stays orange
Products of complete combustion of a hydrocarbon|Carbon dioxide and water|Carbon monoxide and water;Carbon and hydrogen;Methane and oxygen
As hydrocarbon chains get longer, viscosity…|Increases|Decreases;Stays the same;Disappears`],
  'c-tests': ['chemistry', 'Gas tests and analysis', `
Test for hydrogen|A lit splint gives a squeaky pop
Test for oxygen|It relights a glowing splint
Test for carbon dioxide|It turns limewater milky
Test for chlorine|It bleaches damp litmus paper white
A single element or compound with nothing else mixed in|Pure substance|Formulation;Mixture;Alloy
A mixture designed as a useful product, e.g. paint|Formulation|Pure substance;Element;Isotope`],
  'c-atmos': ['chemistry', 'Atmosphere and resources', `
Gas that makes up about 80% of today's atmosphere|Nitrogen
Gas that makes up about 20% of today's atmosphere|Oxygen
Gas the early atmosphere was mainly made of|Carbon dioxide
Gas from burning fuels containing sulfur that causes acid rain|Sulfur dioxide
Toxic gas from incomplete combustion|Carbon monoxide
Water that is safe to drink|Potable water|Pure water;Distilled water;Fresh water
Making drinkable water from sea water|Desalination|Sterilisation;Filtration;Chlorination
Assessing a product's environmental impact over its whole life|Life cycle assessment|Carbon footprint;Risk assessment;Impact audit`],

  /* ---------------- Physics (recall) ---------------- */
  'pr-energy': ['physics', 'Energy', `
Energy store of a moving object|Kinetic
Energy store of an object raised above the ground|Gravitational potential
Energy store of a stretched spring|Elastic potential
Energy store in fuels and food|Chemical
Energy cannot be created or destroyed, only transferred|Conservation of energy|Efficiency;Dissipation;Power
Energy needed to raise 1 kg of a substance by 1 °C|Specific heat capacity|Specific latent heat;Power;Density
Unit of energy|Joule (J)|Watt (W);Newton (N);Volt (V)
Unit of power|Watt (W)|Joule (J);Newton (N);Ohm (Ω)
Which of these is renewable?|Wind|Coal;Oil;Natural gas`],
  'pr-electric': ['physics', 'Electricity', `
Current in a series circuit|The same everywhere|Shared between branches;Zero;Bigger at the battery
Potential difference across parallel branches|The same across each branch|Shared between branches;Zero;Doubled
UK mains supply|230 V, 50 Hz|120 V, 60 Hz;230 V, 60 Hz;12 V, 50 Hz
Colour of the live wire|Brown
Colour of the neutral wire|Blue
Colour of the earth wire|Green and yellow stripes
Resistance of a thermistor when temperature rises|Decreases|Increases;Stays the same;Becomes zero
Resistance of an LDR when light gets brighter|Decreases|Increases;Stays the same;Becomes zero
Component that lets current flow in only one direction|Diode|Resistor;Thermistor;Fuse
Current is the rate of flow of…|Charge|Energy;Voltage;Resistance`],
  'pr-particles': ['physics', 'Particles and radiation', `
Solid to liquid|Melting
Liquid to gas|Evaporating
Gas to liquid|Condensing
Solid straight to gas|Sublimation
An alpha particle is…|Two protons and two neutrons|A fast-moving electron;Electromagnetic radiation;A single neutron
A beta particle is…|A fast-moving electron from the nucleus|Two protons and two neutrons;Electromagnetic radiation;A single neutron
Gamma radiation is…|Electromagnetic radiation|Two protons and two neutrons;A fast-moving electron;A single neutron
Most ionising type of radiation|Alpha|Beta;Gamma;Neutron
Most penetrating type of radiation|Gamma|Alpha;Beta;Neutron
What stops alpha radiation|Paper|Thin aluminium;Thick lead;Nothing
Time for half the radioactive nuclei in a sample to decay|Half-life|Decay time;Activity;Count rate
Radioactive atoms getting onto or into an object|Contamination|Irradiation;Ionisation;Absorption`],
  'pr-forces-waves': ['physics', 'Forces, waves and magnets', `
Quantity with size only|Scalar|Vector;Force;Velocity
Quantity with size and direction|Vector|Scalar;Speed;Mass
Stopping distance equals…|Thinking distance + braking distance|Speed × time;Braking distance − thinking distance;Mass × acceleration
Wave where oscillations are at right angles to the direction of travel|Transverse|Longitudinal;Sound;Seismic P-wave
Wave where oscillations are parallel to the direction of travel|Longitudinal|Transverse;Light;Water ripple
EM waves in order of decreasing wavelength|Radio, microwave, infrared, visible, UV, X-ray, gamma|Gamma, X-ray, UV, visible, infrared, microwave, radio;Visible, radio, gamma, UV, X-ray, infrared, microwave;Radio, visible, microwave, UV, infrared, gamma, X-ray
EM waves used in thermal imaging cameras|Infrared|Ultraviolet;X-rays;Gamma rays
EM waves that cause sunburn|Ultraviolet|Infrared;Radio waves;Microwaves
EM waves used to image broken bones|X-rays|Microwaves;Radio waves;Visible light
What like magnetic poles do|Repel|Attract;Cancel out;Nothing`],

  /* ---------------- Geography ---------------- */
  'g-tectonics': ['geography', 'Tectonic hazards', `
Natural event that threatens people or property|Natural hazard
Plate margin where plates move apart|Constructive margin
Plate margin where plates move towards each other|Destructive margin
Plate margin where plates slide past each other|Conservative margin
Point on the surface directly above an earthquake's focus|Epicentre
Effects that happen straight away, e.g. buildings collapsing|Primary effects
Effects that happen later, e.g. disease or job losses|Secondary effects
Large sea wave caused by an underwater earthquake|Tsunami
Magnitude of the 2015 Nepal earthquake|7.8|6.2;8.8;9.1`],
  'g-weather': ['geography', 'Weather and climate', `
Tropical storm name in the Atlantic|Hurricane
Tropical storm name in the north-west Pacific|Typhoon
Tropical storm name in the Indian Ocean|Cyclone
Calm centre of a tropical storm|Eye
Minimum sea temperature for tropical storms to form|27 °C|17 °C;7 °C;37 °C
Long period with much less rain than usual|Drought
Long-term change in average global temperatures|Climate change
Natural cause of climate change linked to Earth's orbit|Milankovitch cycles
Reducing the causes of climate change|Mitigation
Adjusting to the effects of climate change|Adaptation
Country hit by Typhoon Haiyan in 2013|Philippines|Japan;Indonesia;Vietnam`],
  'g-living': ['geography', 'The living world', `
Large ecosystem covering a big area, e.g. tropical rainforest|Biome
Tallest rainforest trees poking above the canopy|Emergent layer
Large roots that support tall rainforest trees|Buttress roots
Pointed leaf tips that shed heavy rain|Drip tips
Cutting down forest on a large scale|Deforestation
Cutting down only selected trees to protect the forest|Selective logging
Land turning into desert, e.g. from overgrazing|Desertification
Ground that stays frozen all year|Permafrost
Meeting today's needs without harming future generations|Sustainability
Annual rainfall of a hot desert|Less than 250 mm|More than 2000 mm;About 1000 mm;About 600 mm`],
  'g-coasts-rivers': ['geography', 'Coasts and rivers', `
Rocks thrown at a cliff by waves wear it away|Abrasion
Rocks knock together and become smaller and rounder|Attrition
Force of water compresses air in cracks|Hydraulic action
Movement of sediment along the coast|Longshore drift
Ridge of sand or shingle stretching out to sea|Spit
Order of headland erosion landforms|Crack, cave, arch, stack, stump|Cave, crack, stack, arch, stump;Arch, cave, crack, stump, stack;Stack, arch, cave, crack, stump
Area of land drained by a river|Drainage basin
Where two rivers join|Confluence
Small river that joins a larger one|Tributary
Bend in a river|Meander
Lake formed when a meander is cut off|Ox-bow lake
Raised banks along a river from flooding|Levées
Flat land beside a river that floods|Floodplain
Time between peak rainfall and peak discharge|Lag time
Volume of water passing a point per second|Discharge
Example of hard engineering|Sea wall|Beach nourishment;Managed retreat;Dune regeneration
Example of soft engineering|Beach nourishment|Sea wall;Groynes;Rock armour`],
  'g-urban': ['geography', 'Urban issues and development', `
Increase in the proportion of people living in towns and cities|Urbanisation
City with more than 10 million people|Megacity
Things that make people leave the countryside|Push factors
Things that attract people to cities|Pull factors
Unplanned housing built without permission|Squatter settlement
People moving out of cities into rural areas|Counter-urbanisation
Land that has been built on before|Brownfield site
Land that has never been built on|Greenfield site
Protected countryside around a city|Green belt
Measure combining life expectancy, education and income|Human Development Index
What NEE stands for|Newly emerging economy|New European economy;Non-emerging economy;National economic estimate
Shift from manufacturing to services|Deindustrialisation
Jobs in farming, fishing and mining|Primary sector
Jobs in manufacturing|Secondary sector
Jobs providing services, e.g. retail|Tertiary sector
Jobs in research and IT|Quaternary sector
Company that operates in more than one country|Transnational corporation
Having reliable access to enough affordable, nutritious food|Food security`],

  /* ---------------- Business ---------------- */
  'bs-enterprise': ['business', 'Enterprise and ownership', `
Person who takes a risk to start a business|Entrepreneur
Business owned and run by one person|Sole trader
Two or more owners who share the profits|Partnership
Company owned by shareholders whose shares are not sold to the public|Private limited company
Owners can only lose what they invested|Limited liability
Owners are personally responsible for all debts|Unlimited liability
Paying to use another firm's brand and way of working|Franchise
Anyone with an interest in a business|Stakeholder
Document setting out a business's aims and how it will reach them|Business plan
Land, labour, capital and enterprise|Factors of production`],
  'bs-marketing': ['business', 'Marketing', `
Product, price, place and promotion|Marketing mix
Research collected first-hand, e.g. a survey|Primary research
Research using data that already exists|Secondary research
Research based on numbers|Quantitative research
Research based on opinions and views|Qualitative research
Dividing a market into groups of customers|Market segmentation
Introduction, growth, maturity, decline|Product life cycle
Actions to lengthen a product's life|Extension strategies
Setting a low price to enter a market|Penetration pricing
Setting a high price for a new, innovative product|Price skimming
Adding a percentage to costs to set the price|Cost-plus pricing
Feature that makes a product different from competitors|Unique selling point
Diagram comparing products on two features, e.g. price and quality|Market map
Selling online|E-commerce`],
  'bs-ops-people': ['business', 'Operations and people', `
Making one-off products to a customer's order|Job production
Making groups of identical products|Batch production
Continuous production of identical products|Flow production
Ordering stock only when it is needed|Just in time
Checking products at the end of production|Quality control
Building quality into every stage of production|Quality assurance
Filling a job with someone already in the business|Internal recruitment
Filling a job with someone from outside the business|External recruitment
Number of staff a manager is directly responsible for|Span of control
Pay based on the number of items made|Piece rate
Payment for each sale made|Commission
Staff receive a share of the profits|Profit sharing
Contract with no guaranteed hours|Zero-hours contract`],
  'bs-finance': ['business', 'Finance', `
Price × quantity sold|Revenue
Fixed costs + variable costs|Total costs
Revenue − total costs|Profit
Costs that do not change with output, e.g. rent|Fixed costs
Costs that change with output, e.g. raw materials|Variable costs
Level of output where revenue equals total costs|Break-even point
Actual sales − break-even sales|Margin of safety
Revenue − cost of sales|Gross profit
Prediction of money coming in and going out|Cash flow forecast
Short-term borrowing up to an agreed limit|Overdraft
Money borrowed from a bank and repaid with interest|Loan
Money raised by selling shares|Share capital
Raising small amounts from lots of people online|Crowdfunding
Profit kept in the business to reinvest|Retained profit`],
  'bs-external': ['business', 'External influences', `
The cost of borrowing money|Interest rate
General rise in prices over time|Inflation
Value of one currency in terms of another|Exchange rate
Two or more quarters of falling GDP|Recession
Growing links between economies around the world|Globalisation
Tax on imports|Tariff
Limit on the quantity of imports|Quota
Doing what is morally right in business|Ethics
What a strong pound means for UK exports|They become more expensive abroad|They become cheaper abroad;Nothing changes;They are banned`],

  /* ---------------- RE ---------------- */
  'r-chr-beliefs': ['re', 'Christianity: beliefs', `
God as three persons in one|Trinity
God becoming human in Jesus|Incarnation
Jesus' death repairing the relationship between God and humanity|Atonement
Jesus rising from the dead|Resurrection
Jesus returning to heaven 40 days after the resurrection|Ascension
God being all-powerful|Omnipotent
God being all-loving|Omnibenevolent
God's undeserved love and kindness|Grace
Being saved from sin and its consequences|Salvation
The first sin, of Adam and Eve|Original sin
Book of the Bible with the creation accounts|Genesis`],
  'r-chr-practice': ['re', 'Christianity: practices', `
Rituals through which Christians receive God's grace|Sacraments
Sacrament using water to welcome someone into the Church|Baptism
Sacrament remembering the Last Supper with bread and wine|Holy Communion
Prayer Jesus taught his disciples|The Lord's Prayer
Worship that follows a set pattern|Liturgical worship
Journey to a holy place|Pilgrimage
Pilgrimage site in France linked to healing|Lourdes
Island pilgrimage site in Scotland|Iona
Festival celebrating Jesus' resurrection|Easter
Spreading the Christian faith|Evangelism`],
  'r-isl-beliefs': ['re', 'Islam: beliefs', `
Belief in the oneness of God|Tawhid
Belief in prophets and messengers|Risalah
Belief in life after death|Akhirah
Belief in God's predestination|Al-Qadr
Angel who revealed the Qur'an to Muhammad|Jibril
The final prophet in Islam|Muhammad
Holy book of Islam|Qur'an
Leadership in Shi'a Islam passed down from Muhammad's family|Imamate
The worldwide community of Muslims|Ummah`],
  'r-isl-practice': ['re', 'Islam: practices', `
Declaration of faith|Shahadah
Prayer five times a day|Salah
Giving 2.5% of savings to the poor|Zakah
Fasting during Ramadan|Sawm
Pilgrimage to Makkah|Hajj
Ritual washing before prayer|Wudu
Direction Muslims face to pray|Qiblah
Festival at the end of Ramadan|Id-ul-Fitr
Festival remembering Ibrahim's willingness to sacrifice his son|Id-ul-Adha
Shi'a remembrance of the death of Husayn|Ashura
Struggle to live as God wants|Jihad`],
  'r-themes': ['re', 'Themes: key terms', `
Living together without being married|Cohabitation
Legal ending of a marriage|Divorce
Sex between a married person and someone they are not married to|Adultery
Methods used to prevent pregnancy|Contraception
Belief that life is sacred because it is God-given|Sanctity of life
Belief that the value of life depends on how good it is|Quality of life
Ending a life to relieve suffering|Euthanasia
Deliberately ending a pregnancy|Abortion
Duty to look after the world for God|Stewardship
Belief that humans have authority over nature|Dominion
War that meets set conditions to be fair|Just war
Belief that all violence is wrong|Pacifism
Restoring friendship after conflict|Reconciliation
Aim of punishment: paying back for the crime|Retribution
Aim of punishment: putting others off committing crime|Deterrence
Aim of punishment: helping the offender change|Reformation
Execution as a legal punishment|Capital punishment`],

  /* ---------------- English Language (AQA) ---------------- */
  'el-papers': ['englang', 'The exam papers', `
Paper 1, Question 1 asks you to…|List four things from a set part of the text
Paper 1, Question 2 is about…|How the writer uses language
Paper 1, Question 3 is about…|How the writer structures the text
Paper 1, Question 4 asks you to…|Evaluate a statement about the text
Paper 1, Question 5 is…|Descriptive or narrative writing
Paper 2, Question 1 asks you to…|Choose four true statements
Paper 2, Question 2 asks you to…|Summarise differences or similarities
Paper 2, Question 4 asks you to…|Compare the writers' perspectives
Paper 2, Question 5 is…|Writing to present a viewpoint
Length of each English Language paper|1 hour 45 minutes|1 hour;2 hours 15 minutes;1 hour 30 minutes
Marks for Question 5 on each paper|40|20;16;24`],
  'el-devices': ['englang', 'Language and structure terms', `
Comparison using 'like' or 'as'|Simile
Saying something is something else|Metaphor
Giving human qualities to something non-human|Personification
Words that sound like what they describe|Onomatopoeia
Repeated consonant sounds at the start of nearby words|Alliteration
Repeated 's' sounds|Sibilance
Deliberate exaggeration|Hyperbole
Question asked for effect, not answer|Rhetorical question
Group of three for emphasis|Triadic structure
Placing contrasting ideas side by side|Juxtaposition
Hints about what will happen later|Foreshadowing
Ending that returns to the beginning|Cyclical structure
Speaking straight to the reader as 'you'|Direct address
Naming word|Noun
Describing word|Adjective
Doing or being word|Verb`],

  /* ---------------- English Literature ---------------- */
  'lit-macbeth': ['englit', 'Macbeth: context and plot', `
Who wrote Macbeth|William Shakespeare|Christopher Marlowe;Ben Jonson;Charles Dickens
King of England when Macbeth was written|James I|Elizabeth I;Charles I;Henry VIII
Failed 1605 plot to kill James I|Gunpowder Plot|Babington Plot;Rye House Plot;Popish Plot
Belief that kings are chosen by God|Divine Right of Kings|Great Chain of Being;Regicide;Original sin
Order of society with God and the king at the top|Great Chain of Being|Divine Right of Kings;Feudal system;Trinity
Killing a king|Regicide|Treason;Patricide;Tyranny
Who kills Macbeth|Macduff|Malcolm;Banquo;Fleance
Who is crowned king at the end|Malcolm|Macduff;Fleance;Donalbain
The witches say Banquo's descendants will be…|Kings|Traitors;Thanes;Soldiers
Whose ghost appears at the banquet|Banquo|Duncan;Lady Macbeth;Macduff
Macbeth's fatal flaw|Ambition|Jealousy;Pride;Greed
Why Macduff can kill Macbeth despite the prophecy|He was not 'of woman born' in the usual way|He is the Thane of Cawdor;He is Banquo's son;The witches lied
Whose family Macbeth has murdered|Macduff's|Banquo's;Malcolm's;Ross's`],
  'lit-acc': ['englit', 'A Christmas Carol: context and plot', `
Who wrote A Christmas Carol|Charles Dickens|William Shakespeare;Thomas Hardy;J. B. Priestley
Year it was published|1843|1813;1866;1901
1834 law that led to harsh workhouses|Poor Law Amendment Act|Factory Act;Education Act;Corn Laws
Thinker whose 'surplus population' ideas Scrooge echoes|Thomas Malthus|Karl Marx;Adam Smith;Charles Darwin
What the five chapters are called|Staves|Acts;Books;Cantos
Scrooge's dead business partner|Jacob Marley|Fezziwig;Fred;Bob Cratchit
Scrooge's clerk|Bob Cratchit|Fred;Fezziwig;Jacob Marley
Scrooge's cheerful nephew|Fred|Tiny Tim;Bob Cratchit;Fezziwig
Scrooge's former fiancée|Belle|Fan;Martha;Mrs Fezziwig
Scrooge's kind first employer|Fezziwig|Marley;Fred;Bob Cratchit
Children hiding under the Ghost of Christmas Present's robe|Ignorance and Want|Fear and Greed;Hope and Charity;Want and Plenty
The ghost that never speaks|Ghost of Christmas Yet to Come|Ghost of Christmas Past;Ghost of Christmas Present;Jacob Marley`],
  'lit-je': ['englit', "Journey's End: context and characters", `
Who wrote Journey's End|R. C. Sherriff|Wilfred Owen;J. B. Priestley;Siegfried Sassoon
Year it was first performed|1928|1918;1914;1945
Where it is set|An officers' dugout in the British trenches|A field hospital;A London club;A German bunker
When it is set|March 1918|August 1914;July 1916;November 1918
The German attack the play builds towards|The Spring Offensive|The Battle of the Somme;D-Day;The Battle of Passchendaele
Company commander who drinks heavily|Stanhope|Osborne;Trotter;Hibbert
Older officer, a former schoolmaster, called 'Uncle'|Osborne|Trotter;Hibbert;Mason
Young officer who went to school with Stanhope|Raleigh|Hibbert;Trotter;Osborne
Officer who claims to be ill to escape the front line|Hibbert|Raleigh;Trotter;Mason
Cheerful officer who loves food and his garden|Trotter|Hibbert;Osborne;Raleigh
The cook who serves the officers|Mason|Trotter;Hibbert;Hardy
Officer killed during the raid|Osborne|Raleigh;Stanhope;Hibbert
Book Osborne is reading|Alice's Adventures in Wonderland|Great Expectations;Treasure Island;The Pilgrim's Progress
Character who dies at the end of the play|Raleigh|Stanhope;Trotter;Mason`],
  'lit-poems': ['englit', 'Power and Conflict: poets', `
Ozymandias|Percy Bysshe Shelley
London|William Blake
Extract from The Prelude|William Wordsworth
My Last Duchess|Robert Browning
The Charge of the Light Brigade|Alfred, Lord Tennyson
Exposure|Wilfred Owen
Storm on the Island|Seamus Heaney
Bayonet Charge|Ted Hughes
Remains|Simon Armitage
Poppies|Jane Weir
War Photographer|Carol Ann Duffy
Tissue|Imtiaz Dharker
The Emigrée|Carol Rumens
Checking Out Me History|John Agard
Kamikaze|Beatrice Garland`]
};

/* Prompts for the plan builders (original wording) */
const PROMPTS = {
  macbeth: ['How does Shakespeare present ambition in Macbeth?', 'How does Shakespeare present Lady Macbeth as a powerful woman?', 'How does Shakespeare present guilt in Macbeth?', 'How does Shakespeare use the supernatural in Macbeth?', 'How does Shakespeare present Macbeth as a tyrant?', 'How does Shakespeare present loyalty and betrayal?'],
  acc: ["How does Dickens present Scrooge's transformation?", 'How does Dickens present poverty in A Christmas Carol?', 'How does Dickens present the importance of family?', 'How does Dickens present the Cratchit family?', 'How does Dickens present social responsibility?'],
  je: ['How does Sherriff present Stanhope as a leader?', 'How does Sherriff present the horrors of war?', 'How does Sherriff present friendship in the trenches?', 'How does Sherriff present fear and courage?', 'How does Sherriff present class differences?'],
  poetry: ["Compare how poets present the effects of conflict in 'Remains' and one other poem.", "Compare how poets present the power of nature in 'Storm on the Island' and one other poem.", "Compare how poets present memory in 'Poppies' and one other poem.", "Compare how poets present power in 'Ozymandias' and one other poem."],
  re: ["'Euthanasia should be legal.'", "'The death penalty is never right.'", "'War can never be justified.'", "'Religious people should be pacifists.'", "'Divorce is always wrong.'", "'Humans should care for the planet because it belongs to God.'", "'Prayer is the most important practice for Christians.'", "'Hajj is the most important of the Five Pillars.'", "'Abortion is always wrong.'", "'The main aim of punishment should be to reform the offender.'"],
  writing1: ['Write a description of a crowded railway station.', "Write a story that begins: 'The lights went out at exactly midnight.'", 'Write a description of a beach in winter.', 'Write a story about someone who takes a risk.', 'Write a description of a city waking up at dawn.', 'Write a story set during a storm.'],
  writing2: ["'Homework should be banned.' Write an article for a newspaper giving your view.", "'Teenagers spend too much time on their phones.' Write a speech giving your view.", "'Zoos should be closed.' Write a letter to your local council giving your view.", "'Everyone should do a year of volunteering after school.' Write an article giving your view.", "'Social media does more harm than good.' Write a speech for your school assembly."]
};

/* How-to guides for English Language questions (general study advice) */
const LANG_GUIDES = [
  ['Language (P1 Q2, P2 Q3)', ['Pick three short quotes', 'Name the method: metaphor, verb choice, sentence type…', 'Zoom in on one key word and its connotations', 'Explain the effect on the reader, not just what it means']],
  ['Structure (P1 Q3)', ['Track the focus: what are we looking at at the start, middle and end?', 'Spot the shifts: time, place, character, mood', 'Say why the writer opens and ends where they do', 'Talk about the whole text, not single words']],
  ['Evaluate (P1 Q4)', ['Decide how far you agree with the statement', 'Back each point with a quote', 'Analyse the methods behind the effect', 'Finish with your own clear judgement']],
  ['Compare (P2 Q4)', ["Identify each writer's view or feeling", 'Use comparison words: whereas, similarly, however', 'Compare the methods each writer uses', 'Keep both texts in every paragraph']],
  ['Writing (Q5)', ['Plan for 5 minutes: hook, 4–5 paragraph ideas, ending', 'Vary sentence openers and lengths', 'Use a few ambitious words, not every sentence', 'Save 5 minutes to check spelling and punctuation']]
];
