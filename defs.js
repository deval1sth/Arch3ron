/* Archeron · definitions. Each line is "Term|Model definition|key point;key point".
   Key points are what a mark scheme looks for; you tick the ones your answer had.
   Written for AQA GCSE (Combined Science Trilogy, Foundation) and common GCSE Business, Geography and RE terms. */
'use strict';
const DEFS = {
  /* ---------------- Biology ---------------- */
  'd-b-cells': ['biology', 'Cells: key terms', `
Diffusion|The net movement of particles from an area of higher concentration to an area of lower concentration.|net movement of particles;from higher to lower concentration
Osmosis|The diffusion of water from a dilute solution to a more concentrated solution through a partially permeable membrane.|water moves;from dilute to more concentrated solution;through a partially permeable membrane
Active transport|The movement of substances from a more dilute solution to a more concentrated solution (against the concentration gradient), using energy from respiration.|against the concentration gradient (dilute to concentrated);needs energy from respiration
Eukaryotic cell|A cell whose genetic material is enclosed in a nucleus, such as a plant or animal cell.|genetic material inside a nucleus
Prokaryotic cell|A cell with no nucleus; its DNA is a single loop and it may have plasmids. Bacteria are prokaryotic.|no nucleus;DNA is a single loop (may have plasmids)
Specialised cell|A cell with a structure adapted to carry out a particular function.|structure adapted;for a particular function
Differentiation|The process by which a cell changes to become specialised for its job.|cell changes;becomes specialised
Stem cell|An undifferentiated cell that can divide to make more cells and can differentiate into other types of cell.|undifferentiated;can become other types of cell
Mitosis|Cell division that makes two genetically identical cells, used for growth and repair.|two genetically identical cells;for growth and repair
Magnification|How many times bigger the image is than the real object: image size ÷ real size.|how many times bigger the image is;image size ÷ real size
Resolution|The ability to tell apart two points that are close together.|distinguish between two points;that are close together
Chromosome|A long molecule of DNA, found in the nucleus, that carries many genes.|DNA;carries genes`],
  'd-b-organisation': ['biology', 'Organisation: key terms', `
Tissue|A group of cells with a similar structure and function.|group of cells;similar structure and function
Organ|A group of different tissues working together to perform a specific function.|group of tissues;working together for a function
Organ system|A group of organs working together to perform a particular function.|group of organs;working together
Enzyme|A biological catalyst, made of protein, that speeds up reactions without being used up.|biological catalyst;speeds up reactions;protein
Active site|The part of an enzyme where the substrate fits and binds.|part of the enzyme;where the substrate binds
Denatured|When the shape of an enzyme's active site changes (for example at high temperature or the wrong pH) so the substrate no longer fits.|active site changes shape;substrate no longer fits
Lock and key model|The idea that only a substrate with the right shape fits an enzyme's active site, like a key in a lock.|substrate fits the active site;only the right shape fits
Coronary heart disease|When layers of fatty material build up inside the coronary arteries, narrowing them and reducing the flow of blood and oxygen to the heart muscle.|fatty material builds up in coronary arteries;less blood or oxygen reaches the heart muscle
Transpiration|The loss of water vapour from the leaves of a plant, mainly by evaporation through the stomata.|loss of water vapour;from the leaves or stomata
Translocation|The movement of dissolved sugars through the phloem from the leaves to the rest of the plant.|movement of dissolved sugars;through the phloem
Stomata|Tiny pores, mainly on the underside of leaves, that let gases diffuse in and out; guard cells open and close them.|pores in the leaf;let gases in and out;controlled by guard cells
Xylem|Tissue made of hollow tubes that carries water and mineral ions from the roots to the stems and leaves.|carries water and mineral ions;from the roots upwards
Phloem|Tissue that carries dissolved sugars from the leaves to the rest of the plant.|carries dissolved sugars;around the plant
Haemoglobin|The red protein in red blood cells that binds to oxygen.|protein in red blood cells;binds oxygen`],
  'd-b-disease': ['biology', 'Infection and response: key terms', `
Pathogen|A microorganism that causes infectious disease.|microorganism;causes disease
Communicable disease|A disease that can be spread from one person or organism to another.|can be spread between people or organisms
Non-communicable disease|A disease that cannot be passed from one person to another, such as heart disease.|cannot be passed on
Vaccination|Putting a small amount of a dead or inactive form of a pathogen into the body so white blood cells make antibodies, giving immunity.|dead or inactive pathogen;white blood cells make antibodies;gives immunity
Antibody|A protein made by white blood cells that binds to a specific antigen on a pathogen.|protein made by white blood cells;specific to an antigen
Antigen|A protein on the surface of a pathogen that white blood cells recognise.|protein on the surface of a pathogen;recognised by white blood cells
Antibiotic|A medicine that kills bacteria inside the body. It does not work on viruses.|kills bacteria;does not work on viruses
Antitoxin|A substance made by white blood cells that neutralises the toxins released by bacteria.|made by white blood cells;neutralises toxins
Phagocytosis|When white blood cells engulf and digest pathogens.|white blood cells engulf;digest pathogens
Vector|An organism that spreads a disease by carrying a pathogen from one host to another, such as a mosquito spreading malaria.|carries the pathogen;spreads it between hosts
Herd immunity|When a large proportion of a population is vaccinated, so the disease is less likely to spread to people who are not immune.|large proportion vaccinated;disease less likely to spread
Placebo|A substance that looks like the drug being tested but has no active ingredient, used for comparison in a trial.|no active ingredient;used for comparison
Double-blind trial|A drug trial where neither the patients nor the doctors know who has the drug and who has the placebo.|neither patients nor doctors know;who gets the drug or the placebo`],
  'd-b-energy': ['biology', 'Bioenergetics: key terms', `
Photosynthesis|An endothermic reaction in which plants use light energy to turn carbon dioxide and water into glucose and oxygen.|uses light energy;carbon dioxide and water into glucose and oxygen;endothermic
Respiration|An exothermic reaction, happening all the time in living cells, that transfers energy from glucose.|transfers energy from glucose;in living cells;exothermic
Aerobic respiration|Respiration using oxygen: glucose + oxygen → carbon dioxide + water. It transfers the most energy.|uses oxygen;glucose and oxygen give carbon dioxide and water
Anaerobic respiration|Respiration without oxygen. In muscles, glucose → lactic acid. It transfers much less energy than aerobic respiration.|without oxygen;glucose to lactic acid in muscles;less energy transferred
Fermentation|Anaerobic respiration in yeast cells: glucose → ethanol + carbon dioxide.|anaerobic respiration in yeast;makes ethanol and carbon dioxide
Oxygen debt|The extra oxygen the body needs after exercise to react with the lactic acid and remove it from cells.|extra oxygen after exercise;to break down lactic acid
Metabolism|The sum of all the reactions in a cell or the body.|all the reactions;in a cell or the body
Limiting factor|The factor in shortest supply that stops the rate of photosynthesis going faster: light intensity, carbon dioxide concentration or temperature.|in shortest supply;limits the rate`],
  'd-b-homeostasis': ['biology', 'Homeostasis: key terms', `
Homeostasis|The regulation of the internal conditions of a cell or organism to keep them at optimum levels, in response to internal and external changes.|regulating internal conditions;kept at optimum levels;in response to changes
Hormone|A chemical messenger secreted by a gland into the bloodstream and carried to a target organ.|chemical messenger;secreted by a gland;carried in the blood to a target organ
Reflex action|A fast, automatic response to a stimulus that does not involve the conscious part of the brain.|fast;automatic;not conscious
Stimulus|A change in the environment that is detected by receptors.|change in the environment;detected by receptors
Receptor|A cell or group of cells that detects a stimulus.|detects a stimulus
Effector|A muscle or gland that brings about a response.|muscle or gland;brings about a response
Synapse|The gap between two neurones, where a chemical diffuses across to pass the signal on.|gap between neurones;chemical diffuses across
Central nervous system|The brain and spinal cord.|brain;spinal cord
Insulin|A hormone made by the pancreas that makes cells take in glucose from the blood, lowering blood glucose concentration.|made by the pancreas;lowers blood glucose;glucose moves into cells
Type 1 diabetes|A disorder where the pancreas fails to make enough insulin; treated with insulin injections.|pancreas does not make enough insulin;treated with insulin
Type 2 diabetes|A disorder where the body's cells no longer respond to insulin; treated with a carbohydrate-controlled diet and exercise.|cells no longer respond to insulin;treated with diet and exercise`],
  'd-b-genetics': ['biology', 'Inheritance and evolution: key terms', `
Gene|A small section of DNA on a chromosome that codes for a particular sequence of amino acids, to make a specific protein.|section of DNA;codes for a protein
Allele|A different version of the same gene.|different version of a gene
Genome|The entire genetic material of an organism.|all the genetic material
Dominant allele|An allele that is always expressed, even if only one copy is present.|expressed with only one copy
Recessive allele|An allele that is only expressed if two copies are present.|only expressed with two copies
Homozygous|Having two identical alleles of a gene.|two identical alleles
Heterozygous|Having two different alleles of a gene.|two different alleles
Genotype|The combination of alleles an organism has, such as Bb.|combination of alleles
Phenotype|The characteristic that is expressed, such as brown eyes.|characteristic that is shown or expressed
Gamete|A sex cell (sperm or egg) with half the normal number of chromosomes.|sex cell;half the number of chromosomes
Meiosis|Cell division that makes four genetically different gametes, each with half the number of chromosomes.|makes gametes;genetically different;half the chromosomes
Mutation|A change in the DNA of a gene.|change in DNA
Variation|Differences in the characteristics of individuals in a population.|differences between individuals
Evolution|A change in the inherited characteristics of a population over time through natural selection, which may lead to new species.|change in inherited characteristics;over time;through natural selection
Natural selection|Individuals best suited to their environment are more likely to survive and reproduce, passing on their alleles.|best suited are more likely to survive;reproduce and pass on alleles
Selective breeding|Humans choosing parents with desired characteristics and breeding them together over many generations.|humans choose parents with desired characteristics;breed over many generations
Genetic engineering|Changing the genome of an organism by adding a gene from another organism to give a desired characteristic.|changing the genome;adding a gene from another organism
Species|A group of similar organisms that can breed together to produce fertile offspring.|similar organisms;can breed;fertile offspring
Extinction|When there are no individuals of a species left alive.|no individuals left alive`],
  'd-b-ecology': ['biology', 'Ecology: key terms', `
Ecosystem|The interaction of a community of living organisms with the non-living parts of their environment.|community of living organisms;interacting with the non-living environment
Community|All the populations of different species living in a habitat.|populations of different species;in a habitat
Population|All the organisms of one species living in a habitat.|one species;in a habitat
Habitat|The place where an organism lives.|where an organism lives
Biodiversity|The variety of all the different species of organisms on Earth, or within an ecosystem.|variety of species
Interdependence|When species in a community depend on each other for things like food, shelter, pollination and seed dispersal.|species depend on each other
Abiotic factor|A non-living factor that affects a community, such as light intensity, temperature or moisture.|non-living factor
Biotic factor|A living factor that affects a community, such as food availability, predators or pathogens.|living factor
Producer|An organism that makes its own food by photosynthesis; it starts a food chain.|makes its own food by photosynthesis
Adaptation|A feature that helps an organism survive in its environment.|feature;helps it survive
Extremophile|An organism that lives in extreme conditions, such as high temperature, high salt or high pressure.|lives in extreme conditions
Quadrat|A square frame used to sample organisms in an area.|square frame;used to sample organisms`],

  /* ---------------- Chemistry ---------------- */
  'd-c-atoms': ['chemistry', 'Atoms and the periodic table: key terms', `
Atom|The smallest part of an element that can exist. It has a nucleus of protons and neutrons, with electrons around it.|smallest part of an element;nucleus of protons and neutrons;electrons around it
Element|A substance made of only one type of atom.|only one type of atom
Compound|A substance made of two or more different elements chemically combined in fixed proportions.|two or more elements;chemically combined;fixed proportions
Mixture|Two or more elements or compounds that are not chemically combined.|two or more substances;not chemically combined
Isotopes|Atoms of the same element with the same number of protons but a different number of neutrons.|same number of protons;different number of neutrons
Ion|An atom or group of atoms with an electric charge, formed by losing or gaining electrons.|charged particle;lost or gained electrons
Atomic number|The number of protons in the nucleus of an atom.|number of protons
Mass number|The total number of protons and neutrons in the nucleus of an atom.|protons plus neutrons
Relative atomic mass|The average mass of the atoms of an element, taking into account the abundance of its isotopes.|average mass of the atoms;takes isotopes into account
Group|A vertical column in the periodic table. Elements in the same group have the same number of outer-shell electrons.|vertical column;same number of outer electrons
Period|A horizontal row in the periodic table.|horizontal row
Noble gases|The Group 0 elements. They are unreactive because they have a full outer shell of electrons.|Group 0;full outer shell;unreactive
Alkali metals|The Group 1 elements: reactive metals with one electron in their outer shell.|Group 1;one outer electron
Halogens|The Group 7 elements: non-metals with seven electrons in their outer shell.|Group 7;seven outer electrons`],
  'd-c-bonding': ['chemistry', 'Bonding and structure: key terms', `
Ionic bond|The strong electrostatic attraction between oppositely charged ions, formed when a metal transfers electrons to a non-metal.|electrostatic attraction;oppositely charged ions;electrons transferred
Covalent bond|A shared pair of electrons between two atoms, usually non-metals.|shared pair of electrons;between atoms
Metallic bonding|The attraction between positive metal ions and a sea of delocalised electrons.|positive metal ions;delocalised electrons
Delocalised electrons|Electrons that are free to move through a structure, as in metals and graphite.|free to move
Giant ionic lattice|A regular 3D structure of oppositely charged ions held together by strong electrostatic forces in all directions.|regular arrangement of ions;strong electrostatic forces
Simple molecule|A small group of atoms joined by covalent bonds, with weak forces between the molecules, so it has a low melting point.|atoms joined by covalent bonds;weak forces between molecules
Giant covalent structure|A huge network of atoms all joined by strong covalent bonds, such as diamond, graphite or silicon dioxide.|many atoms;all joined by strong covalent bonds
Intermolecular forces|The weak forces of attraction between molecules.|weak forces;between molecules
Alloy|A mixture of a metal with other elements. It is harder than the pure metal because the different-sized atoms distort the layers so they cannot slide.|mixture of a metal with other elements;harder because layers cannot slide
Polymer|A very large molecule made from many small repeating units called monomers.|very large molecule;many repeating units`],
  'd-c-changes': ['chemistry', 'Chemical changes: key terms', `
Conservation of mass|No atoms are lost or made in a chemical reaction, so the total mass of the products equals the total mass of the reactants.|no atoms lost or made;mass of products equals mass of reactants
Concentration|The mass of solute in a given volume of solution, for example in g/dm³.|mass of solute;per volume of solution
Oxidation|The gain of oxygen (or the loss of electrons).|gain of oxygen
Reduction|The loss of oxygen (or the gain of electrons).|loss of oxygen
Reactivity series|A list of metals in order of how reactive they are.|metals in order of reactivity
Displacement reaction|A reaction where a more reactive element takes the place of a less reactive element in a compound.|more reactive element;replaces a less reactive one in a compound
Acid|A substance that produces hydrogen ions (H⁺) in aqueous solution. Its pH is below 7.|produces hydrogen ions;in solution;pH below 7
Alkali|A soluble base that produces hydroxide ions (OH⁻) in aqueous solution. Its pH is above 7.|produces hydroxide ions;soluble base;pH above 7
Base|A substance that neutralises an acid to form a salt and water, such as a metal oxide or hydroxide.|neutralises an acid;forms a salt and water
Neutralisation|The reaction between an acid and a base to form a salt and water: H⁺ + OH⁻ → H₂O.|acid and base react;form a salt and water
Salt|A compound formed when the hydrogen in an acid is replaced by a metal.|hydrogen in an acid;replaced by a metal
Electrolysis|Breaking down an ionic compound, when molten or dissolved, using electricity.|breaking down an ionic compound;molten or dissolved;using electricity
Electrolyte|A molten or dissolved ionic compound that conducts electricity and is broken down in electrolysis.|ionic compound;molten or dissolved;conducts electricity
Cathode|The negative electrode. Positive ions move to it and gain electrons.|negative electrode
Anode|The positive electrode. Negative ions move to it and lose electrons.|positive electrode
Ore|A rock that contains enough metal or metal compound to make extracting it worthwhile.|rock containing a metal;worth extracting`],
  'd-c-energy': ['chemistry', 'Energy and rates: key terms', `
Exothermic reaction|A reaction that transfers energy to the surroundings, so the temperature of the surroundings increases.|transfers energy to the surroundings;temperature increases
Endothermic reaction|A reaction that takes in energy from the surroundings, so the temperature of the surroundings decreases.|takes in energy from the surroundings;temperature decreases
Activation energy|The minimum amount of energy that particles must have to react when they collide.|minimum energy;needed to react
Rate of reaction|How quickly reactants are used up or products are formed.|how fast reactants are used up or products formed
Catalyst|A substance that speeds up a reaction without being used up, by providing a pathway with a lower activation energy.|speeds up a reaction;not used up;lower activation energy
Collision theory|Reactions only happen when particles collide with enough energy (at least the activation energy).|particles collide;with enough energy
Reversible reaction|A reaction where the products can react to form the reactants again.|products can turn back into reactants
Dynamic equilibrium|When a reversible reaction in a closed system goes forwards and backwards at the same rate, so the amounts stay the same.|forward and backward rates are equal;closed system`],
  'd-c-organic': ['chemistry', 'Organic, analysis and the atmosphere: key terms', `
Hydrocarbon|A compound made of hydrogen and carbon atoms only.|hydrogen and carbon only
Alkane|A saturated hydrocarbon with only single carbon–carbon bonds. General formula CₙH₂ₙ₊₂.|hydrocarbon;single bonds only
Alkene|A hydrocarbon with a carbon–carbon double bond. Alkenes turn bromine water from orange to colourless.|hydrocarbon;carbon–carbon double bond
Crude oil|A finite resource formed from the remains of ancient plankton; a mixture of many hydrocarbons.|mixture of hydrocarbons;from ancient plankton
Fractional distillation|Separating a mixture of liquids, such as crude oil, into fractions with different boiling points.|separates by boiling point;into fractions
Cracking|Breaking large hydrocarbon molecules into smaller, more useful ones, such as shorter alkanes and alkenes.|breaking large hydrocarbons;into smaller, more useful molecules
Complete combustion|Burning a fuel in plenty of oxygen to produce carbon dioxide and water.|plenty of oxygen;carbon dioxide and water
Pure substance|A single element or compound not mixed with any other substance. It melts and boils at a fixed temperature.|single element or compound;fixed melting and boiling point
Formulation|A mixture designed as a useful product, with each part in a measured amount.|mixture;designed for a use;measured amounts
Chromatography|A method of separating mixtures using a stationary phase and a mobile phase.|separates mixtures;stationary and mobile phase
Potable water|Water that is safe to drink.|safe to drink
Greenhouse gas|A gas, such as carbon dioxide, methane or water vapour, that absorbs heat radiated from the Earth and keeps it warm.|absorbs heat from the Earth;examples carbon dioxide or methane
Carbon footprint|The total amount of carbon dioxide and other greenhouse gases emitted over the full life cycle of a product, service or event.|total greenhouse gases emitted;over the full life cycle
Life cycle assessment|An assessment of the environmental impact of a product at every stage: raw materials, manufacture, use and disposal.|environmental impact;at every stage of its life
Finite resource|A resource that will run out because it is not being replaced fast enough.|will run out
Desalination|Removing salt from sea water to make potable water, by distillation or reverse osmosis.|removing salt from sea water`],

  /* ---------------- Physics ---------------- */
  'd-p-energy': ['physics', 'Energy: key terms', `
Work done|The energy transferred when a force moves an object through a distance.|energy transferred;force moves an object a distance
Power|The rate at which energy is transferred, or the rate at which work is done.|rate of energy transfer
Efficiency|The proportion of input energy that is usefully transferred: useful output ÷ total input.|useful output divided by total input
Conservation of energy|Energy cannot be created or destroyed, only transferred from one store to another.|cannot be created or destroyed;only transferred
Specific heat capacity|The amount of energy needed to raise the temperature of 1 kg of a substance by 1 °C.|energy needed;to raise 1 kg by 1 °C
Dissipated energy|Energy that is transferred to the surroundings in a way that is not useful, often by heating.|wasted energy;spread to the surroundings
Renewable energy resource|An energy resource that is being, or can be, replenished as it is used, such as wind or solar.|replenished as it is used
Non-renewable energy resource|An energy resource that will run out, such as coal, oil, gas or nuclear fuel.|will run out
Thermal conductivity|How quickly energy is transferred through a material by heating.|how fast energy moves through a material
Kinetic energy|The energy stored by a moving object.|energy of a moving object
Gravitational potential energy|The energy an object stores because of its height above the ground.|energy stored due to height
Elastic potential energy|The energy stored in a stretched or squashed object, such as a spring.|stored in a stretched or squashed object`],
  'd-p-electric': ['physics', 'Electricity: key terms', `
Current|The rate of flow of electrical charge.|rate of flow of charge
Potential difference|The energy transferred per unit of charge passing between two points in a circuit.|energy transferred;per unit of charge
Resistance|How much a component opposes the flow of current. R = V ÷ I.|opposes the current
Ohmic conductor|A conductor where the current is directly proportional to the potential difference, at constant temperature.|current proportional to potential difference;constant temperature
Series circuit|A circuit with components one after another in a single loop, so the current is the same everywhere.|single loop;same current through each component
Parallel circuit|A circuit with more than one branch, where each branch has the same potential difference.|more than one branch;same potential difference across each branch
Direct current|Current that flows in one direction only, as from a cell or battery.|one direction only
Alternating current|Current that keeps reversing direction. UK mains is a.c. at 50 Hz and about 230 V.|keeps changing direction
Live wire|The brown wire, which carries the alternating potential difference (about 230 V) from the supply.|brown;about 230 V
Neutral wire|The blue wire, which completes the circuit and is at or close to 0 V.|blue;completes the circuit
Earth wire|The green and yellow safety wire, at 0 V, which only carries current if there is a fault.|green and yellow;safety wire for faults
National Grid|The system of cables and transformers linking power stations to homes and businesses.|cables and transformers;links power stations to consumers
Step-up transformer|A transformer that increases the potential difference for transmission, which reduces the current and so the energy lost.|increases potential difference;reduces current and energy loss
Thermistor|A component whose resistance decreases as the temperature increases.|resistance falls as temperature rises
Light-dependent resistor|A component whose resistance decreases as the light intensity increases.|resistance falls as light increases
Diode|A component that lets current flow in one direction only.|current in one direction only`],
  'd-p-particles': ['physics', 'Particles and radiation: key terms', `
Density|Mass per unit volume. ρ = m ÷ V.|mass per unit volume
Internal energy|The total kinetic and potential energy of all the particles in a system.|total kinetic and potential energy;of the particles
Specific latent heat|The energy needed to change the state of 1 kg of a substance with no change in temperature.|energy to change state of 1 kg;no change in temperature
Gas pressure|The force of gas particles colliding with the walls of their container, per unit area.|particles colliding with the walls;force per area
Isotopes|Atoms of the same element with the same number of protons but a different number of neutrons.|same number of protons;different number of neutrons
Radioactive decay|The random process in which an unstable nucleus gives out radiation to become more stable.|unstable nucleus;gives out radiation;random
Half-life|The time it takes for the number of radioactive nuclei in a sample, or the count rate, to halve.|time taken;to halve
Activity|The rate at which a source of unstable nuclei decays, measured in becquerels (Bq).|rate of decay;becquerels
Alpha particle|Two protons and two neutrons (a helium nucleus). Highly ionising and stopped by paper.|two protons and two neutrons;helium nucleus
Beta particle|A high-speed electron given out from the nucleus as a neutron turns into a proton.|fast electron;from the nucleus
Gamma ray|Electromagnetic radiation given out from the nucleus. Very penetrating, weakly ionising.|electromagnetic wave;from the nucleus
Irradiation|Exposing an object to nuclear radiation. The object does not become radioactive.|exposed to radiation;does not become radioactive
Contamination|The unwanted presence of radioactive atoms on or in other materials.|radioactive atoms get on or into a material
Background radiation|Radiation around us all the time from natural sources (rocks, cosmic rays) and man-made sources.|always around us;natural and man-made sources`],
  'd-p-forces': ['physics', 'Forces: key terms', `
Scalar|A quantity with magnitude (size) only, such as speed, distance or mass.|size only
Vector|A quantity with magnitude and direction, such as velocity, force or displacement.|size and direction
Velocity|Speed in a given direction.|speed in a given direction
Displacement|Distance travelled in a given direction, measured in a straight line from start to finish.|distance;in a given direction
Acceleration|The rate of change of velocity.|rate of change of velocity
Resultant force|The single force that has the same effect as all the forces acting on an object together.|single force;same effect as all the forces
Weight|The force acting on an object due to gravity.|force due to gravity
Non-contact force|A force between objects that are not touching, such as gravity, magnetic or electrostatic force.|objects not touching
Newton's first law|If the resultant force on an object is zero, it stays still or keeps moving at the same speed in the same direction.|zero resultant force;stays still or constant velocity
Newton's second law|The acceleration of an object is proportional to the resultant force on it and inversely proportional to its mass: F = m × a.|acceleration proportional to resultant force;F = ma
Newton's third law|When two objects interact, they exert equal and opposite forces on each other.|two objects interact;equal and opposite forces
Terminal velocity|The constant top speed of a falling object, reached when air resistance equals weight so the resultant force is zero.|constant maximum speed;air resistance equals weight
Stopping distance|Thinking distance plus braking distance.|thinking distance;plus braking distance
Thinking distance|The distance a vehicle travels during the driver's reaction time.|during the reaction time
Braking distance|The distance a vehicle travels under the braking force.|after the brakes are applied
Elastic deformation|A change in shape where the object goes back to its original shape when the force is removed.|returns to its original shape
Limit of proportionality|The point beyond which extension is no longer proportional to the force.|extension no longer proportional to force`],
  'd-p-waves': ['physics', 'Waves and magnetism: key terms', `
Transverse wave|A wave where the oscillations are at right angles to the direction of energy transfer, such as light or ripples on water.|oscillations at right angles;to the direction of energy transfer
Longitudinal wave|A wave where the oscillations are parallel to the direction of energy transfer, such as sound. It has compressions and rarefactions.|oscillations parallel;to the direction of energy transfer
Amplitude|The maximum displacement of a point on a wave from its rest position.|maximum displacement;from the rest position
Wavelength|The distance from a point on one wave to the same point on the next wave, such as crest to crest.|distance between the same points;on neighbouring waves
Frequency|The number of waves passing a point each second, measured in hertz (Hz).|waves per second
Period|The time taken for one complete wave to pass a point. T = 1 ÷ f.|time for one wave
Refraction|When a wave changes direction as it crosses a boundary between two materials, because its speed changes.|changes direction;speed changes at a boundary
Electromagnetic waves|Transverse waves that transfer energy and all travel at the same speed through a vacuum.|transverse;same speed in a vacuum
Electromagnetic spectrum|The continuous range of electromagnetic waves: radio, microwaves, infrared, visible light, ultraviolet, X-rays, gamma rays.|continuous range of electromagnetic waves
Magnetic field|The region around a magnet where a force acts on another magnet or a magnetic material.|region around a magnet;force on magnetic materials
Permanent magnet|A magnet that produces its own magnetic field.|produces its own field
Induced magnet|A material that becomes a magnet only when it is placed in a magnetic field.|becomes a magnet in a field
Electromagnet|A solenoid (coil of wire) wrapped around an iron core, which is magnetic when a current flows.|coil of wire with an iron core;magnetic when current flows
Motor effect|When a wire carrying a current in a magnetic field experiences a force.|current-carrying wire in a magnetic field;experiences a force`],

  /* ---------------- Business, Geography, RE ---------------- */
  'd-bs-terms': ['business', 'Business: key terms', `
Entrepreneur|Someone who takes the risk of setting up a business, hoping to make a profit.|takes risks;sets up a business
Revenue|The money a business receives from selling its goods or services: price × quantity sold.|money from sales;price times quantity
Profit|What is left when total costs are taken away from revenue.|revenue minus total costs
Fixed costs|Costs that do not change with the level of output, such as rent.|do not change with output
Variable costs|Costs that change directly with the level of output, such as raw materials.|change with output
Break-even point|The level of output where total revenue equals total costs, so there is no profit or loss.|revenue equals total costs;no profit or loss
Cash flow|The movement of money into and out of a business over a period of time.|money in and out;over time
Unlimited liability|When the owners are personally responsible for all the debts of the business.|personally responsible;for all the debts
Limited liability|When owners can lose only the money they invested in the business.|only lose what they invested
Market research|Gathering information about customers, competitors and trends in the market.|gathering information;about customers and the market
Primary research|New information collected first-hand for a specific purpose, such as a survey.|new data;collected first-hand
Secondary research|Using information that already exists, collected by someone else.|existing data;collected by others
Market segmentation|Dividing a market into groups of customers with similar characteristics.|dividing a market;groups with similar characteristics
Stakeholder|Anyone who has an interest in, or is affected by, a business.|interest in or affected by a business
Marketing mix|The four Ps: product, price, place and promotion.|product;price;place;promotion
Economies of scale|When average (unit) costs fall as a business grows larger.|unit costs fall;as the business grows
Inflation|A sustained rise in the general level of prices.|rise in the general price level
Interest rate|The cost of borrowing money and the reward for saving.|cost of borrowing;reward for saving
Recruitment|The process of finding and appointing new employees.|finding and appointing staff
Quality assurance|Checking quality at every stage of production to prevent faults.|checks at every stage;prevents faults`],
  'd-g-terms': ['geography', 'Geography: key terms', `
Natural hazard|A natural event that threatens people or property.|natural event;threat to people or property
Hazard risk|The probability that a natural hazard will affect people.|probability;hazard affects people
Plate margin|The boundary where two tectonic plates meet.|where two plates meet
Tropical storm|A large low-pressure weather system with very strong winds that forms over warm oceans (at least 27 °C) between 5° and 30° from the equator.|low pressure;warm ocean;strong winds
Climate change|A long-term change in the Earth's average temperature and weather patterns.|long-term change;temperature and weather
Ecosystem|A community of plants and animals interacting with each other and their physical environment.|living things;interacting with their environment
Deforestation|The cutting down and removal of trees from a forested area.|removing trees
Sustainable|Meeting the needs of people today without stopping future generations from meeting theirs.|needs of today;without harming future generations
Urbanisation|An increase in the percentage of people living in towns and cities.|increasing percentage;living in urban areas
Megacity|An urban area with a population of over 10 million people.|over 10 million people
Rural–urban migration|The movement of people from the countryside to towns and cities.|countryside to cities
Erosion|The wearing away and removal of material by a moving force, such as waves or a river.|wearing away;by waves or rivers
Longshore drift|The movement of sediment along a coastline by waves that approach the beach at an angle.|sediment moves along the coast;waves at an angle
Development gap|The difference in standards of living between the world's richest and poorest countries.|difference in standards of living;rich and poor countries
Gross national income per head|The total income of a country divided by its population.|total income;divided by population
Infant mortality|The number of children who die before their first birthday per 1000 live births.|die before age one;per 1000 live births`],
  'd-r-terms': ['re', 'RE: key terms', `
Omnipotent|All-powerful.|all-powerful
Benevolent|All-loving and all-good.|all-loving or all-good
Trinity|The Christian belief that there are three persons in one God: the Father, the Son and the Holy Spirit.|three persons;one God
Incarnation|The belief that God became human in the person of Jesus.|God became human;in Jesus
Atonement|Restoring the relationship between people and God through the life, death and resurrection of Jesus.|restoring the relationship with God;through Jesus
Salvation|Being saved from sin and its consequences, and going to heaven.|saved from sin
Resurrection|Rising from the dead.|rising from the dead
Sacrament|An outward sign of an inward, invisible grace, such as baptism or Holy Communion.|outward sign;inward grace
Evangelism|Spreading the Christian gospel by public preaching or personal witness.|spreading the gospel
Tawhid|The Muslim belief in the oneness of God.|oneness of God
Akhirah|The Muslim belief in life after death.|life after death
Risalah|Prophethood: the way Allah communicates with humans through prophets.|prophethood;communication from God
Ummah|The worldwide community of Muslims.|worldwide Muslim community
Shahadah|The Muslim declaration of faith, the first of the Five Pillars.|declaration of faith
Zakah|Giving 2.5% of savings to the poor, one of the Five Pillars.|2.5% of savings;to the poor
Sawm|Fasting during the month of Ramadan, one of the Five Pillars.|fasting;during Ramadan
Hajj|The pilgrimage to Makkah that every Muslim should make once in their lifetime, if able.|pilgrimage to Makkah;once if able
Pacifism|The belief that people should not take part in war or any kind of violence.|no war or violence
Just war|A war that meets internationally accepted criteria for fairness.|meets criteria;fair war
Sanctity of life|The belief that all life is holy because it is created by God.|life is holy;created by God
Stewardship|The idea that believers have a duty to look after the world on behalf of God.|duty to care for the world;on behalf of God`],
};
