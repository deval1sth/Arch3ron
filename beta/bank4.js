/* Archeron · question bank 4 (beta): Computer Science, French, Spanish and History.
   Original questions. Computer Science follows the content AQA (8525) and OCR (J277) share. History covers the three topics
   AQA and Edexcel both offer: Weimar and Nazi Germany, medicine through time, and Elizabethan England.
   Lines are "Question|Answer|wrong;wrong;wrong" (recall) and "Term|Definition|key point;key point" (definitions).
   French and Spanish vocabulary is listed as word pairs below and turned into questions both ways, with wrong options taken
   from the same theme and direction. */
'use strict';
Object.assign(BANKS, {
  /* ================= COMPUTER SCIENCE ================= */
  'cs-sys': ['compsci', 'Systems architecture and hardware', `
Which part of the CPU carries out calculations and logical comparisons?|ALU|Control unit;Cache;Program counter
Which part of the CPU coordinates the fetch-decode-execute cycle?|Control unit|ALU;Cache;Accumulator
Which register holds the address of the next instruction to be fetched?|Program counter|Accumulator;Memory data register;Current instruction register
Which register holds the result of calculations done by the ALU?|Accumulator|Program counter;Memory address register;Cache
Which register holds the address of the memory location being read from or written to?|Memory address register|Memory data register;Accumulator;Program counter
Which memory is volatile and holds the programs and data currently in use?|RAM|ROM;SSD;Virtual memory
Which memory holds the start-up (boot) instructions and keeps them when the power is off?|ROM|RAM;Cache;Virtual memory
Which component speeds up the CPU by storing frequently used instructions and data close to it?|Cache|ROM;Hard disk;Virtual memory
What is used as extra RAM when RAM is full?|Virtual memory|Cache;ROM;Registers
Which type of secondary storage has no moving parts and uses flash memory?|Solid state drive|Magnetic hard disk;Optical disc;Magnetic tape
Which type of secondary storage uses a laser to read and write data?|Optical|Magnetic;Solid state;Cloud
Which factor would let a CPU run more fetch-decode-execute cycles each second?|A higher clock speed|More secondary storage;A larger screen;A bigger hard disk
What is an embedded system?|A computer system built into a larger device to do one dedicated task|A program that runs inside a web browser;A computer that controls a whole network;Software stored in the cloud`],
  'cs-net': ['compsci', 'Networks and security', `
Which type of network covers a large geographical area, such as the internet?|WAN|LAN;PAN;Star network
Which network topology connects every device to a central switch?|Star|Bus;Mesh;Ring
Which protocol is used to send email?|SMTP|HTTP;FTP;IMAP
Which protocol encrypts web traffic between a browser and a web server?|HTTPS|HTTP;FTP;SMTP
Which protocol is used to transfer files between computers on a network?|FTP|SMTP;HTTP;IMAP
What is the main job of a router?|To send data packets between different networks|To store web pages;To give devices their MAC address;To scan for viruses
What identifies a network interface card and is set when it is made?|MAC address|IP address;Domain name;Port number
What is the name for an attack that floods a server with requests so that it cannot respond?|Denial of service|Phishing;SQL injection;Shouldering
What is SQL injection?|Typing database commands into an input box to read or change a database|A virus that spreads by email;Guessing passwords many times;Watching someone type a PIN
What is shouldering (shoulder surfing)?|Watching someone enter a password or PIN|Flooding a server with requests;Sending fake emails;Copying a website
What is a brute-force attack?|Trying every possible password until one works|Watching someone type a password;Sending fake emails;Flooding a server with requests
Which security method checks that users are who they claim to be?|Authentication|Encryption;Compression;Validation
What does a firewall do?|Monitors network traffic and blocks unauthorised access|Speeds up the internet connection;Stores backups;Removes viruses from files`],
  'cs-data': ['compsci', 'Data representation', `
How many bits are in a nibble?|4|8;2;16
How many bits are in a byte?|8|4;10;16
Using 1000 as the multiplier, how many bytes are in a kilobyte?|1000|1024;100;8
Which unit is bigger: a gigabyte or a terabyte?|A terabyte|A gigabyte;They are the same;A megabyte
What is the denary value of the hex digit F?|15|16;14;10
Which character set uses 7 bits to represent 128 characters?|ASCII|Unicode;Hexadecimal;Morse
Which character set can represent characters from almost every written language?|Unicode|ASCII;Hexadecimal;Binary
What is the smallest element of a bitmap image called?|Pixel|Bit;Sample;Byte
What happens to file size if the colour depth of an image is increased?|It increases|It decreases;It stays the same;It halves
What happens to the quality of a sound file if the sample rate is increased?|It improves|It gets worse;It stays the same;It becomes silent
Run-length encoding is an example of which type of compression?|Lossless|Lossy;Neither;Both
Which type of compression permanently removes some data, such as in an MP3 file?|Lossy|Lossless;Run-length encoding;Huffman coding
Why do computers use binary?|Their circuits have two states: on and off|Binary numbers are smaller;Binary is easier for people to read;Hexadecimal cannot be stored`],
  'cs-algo': ['compsci', 'Algorithms and programming', `
Which search checks each item in turn from the start of the list?|Linear search|Binary search;Merge sort;Bubble sort
Which search only works on a sorted list?|Binary search|Linear search;Bubble sort;Insertion sort
Which sort repeatedly swaps neighbouring items that are in the wrong order?|Bubble sort|Merge sort;Insertion sort;Binary search
Which sort splits a list into single items, then merges them back together in order?|Merge sort|Bubble sort;Insertion sort;Linear search
Which programming construct repeats a set of instructions?|Iteration|Selection;Sequence;Assignment
Which programming construct chooses which instructions to run, such as an IF statement?|Selection|Iteration;Sequence;Concatenation
Which error stops a program from running because the code breaks the rules of the language?|Syntax error|Logic error;Runtime error;Rounding error
Which error lets a program run but gives the wrong result?|Logic error|Syntax error;Translation error;Compiler error
What type of test data is just inside or just outside the allowed range?|Boundary|Normal;Erroneous;Random
What type of test data should be rejected, such as text where a number is expected?|Erroneous|Normal;Boundary;Valid
Which data type stores whole numbers?|Integer|Real;String;Boolean
Which data type stores only True or False?|Boolean|Integer;Character;String
What does SQL stand for?|Structured Query Language|Simple Query Language;Sequential Query Logic;Structured Question List
In a database table, which field uniquely identifies each record?|Primary key|Foreign key;Index;Attribute
Which translator converts a whole high-level program into machine code in one go?|Compiler|Interpreter;Assembler;Linker
Which translator converts and runs a program one line at a time?|Interpreter|Compiler;Assembler;Loader`],
  'cs-law': ['compsci', 'Laws, ethics and the environment', `
Which law makes it illegal to access a computer without permission?|Computer Misuse Act 1990|Data Protection Act 2018;Copyright, Designs and Patents Act 1988;Equality Act 2010
Which law controls how personal data is collected, stored and used?|Data Protection Act 2018|Computer Misuse Act 1990;Copyright, Designs and Patents Act 1988;Freedom of Information Act 2000
Which law protects software, music and films from being copied without permission?|Copyright, Designs and Patents Act 1988|Computer Misuse Act 1990;Data Protection Act 2018;Equality Act 2010
What is open-source software?|Software whose source code anyone can see and change|Software that is always paid for;Software that cannot be changed;Software only for businesses
What is proprietary software?|Software whose source code is kept secret by the company that owns it|Software anyone can change;Software that is always free;Software written by students
Which is an environmental problem caused by computing?|Electronic waste that contains toxic materials|Faster internet speeds;Cheaper smartphones;More online learning`]
});

Object.assign(DEFS, {
  'd-cs-terms': ['compsci', 'Computer Science: key terms', `
CPU|The central processing unit: the part of the computer that fetches, decodes and executes instructions.|fetches decodes and executes;instructions
Clock speed|How many fetch-decode-execute cycles the CPU can carry out each second, measured in hertz.|cycles per second;measured in hertz
Cache|Small, very fast memory inside or close to the CPU that stores frequently used instructions and data.|small fast memory;frequently used data
RAM|Volatile main memory that holds the programs and data currently in use.|volatile;programs and data in use
ROM|Non-volatile memory that holds the instructions needed to start the computer.|non-volatile;start-up instructions
Virtual memory|Part of secondary storage used as extra RAM when RAM is full.|secondary storage;used as RAM when full
Secondary storage|Non-volatile storage that keeps programs and data when the power is off, such as an SSD.|non-volatile;keeps data when power is off
Algorithm|A step-by-step set of instructions for solving a problem.|step-by-step instructions;solving a problem
Decomposition|Breaking a problem down into smaller problems that are easier to solve.|breaking down;smaller problems
Abstraction|Removing unnecessary detail so you can focus on what matters for solving the problem.|removing unnecessary detail
Variable|A named location in memory that holds a value that can change while the program runs.|named location in memory;value can change
Constant|A named value that cannot change while the program runs.|named value;cannot change
Array|A data structure that holds several items of the same data type under one name, each found by its index.|several items;same data type;index
Protocol|A set of rules for how devices communicate over a network.|set of rules;communicate
Encryption|Scrambling data using a key so that only someone with the right key can read it.|scrambling data;key
Phishing|Sending fake messages that pretend to come from a trusted source to trick people into giving personal information.|fake messages;trick people;personal information
Malware|Software designed to harm a computer system or steal data, such as viruses and ransomware.|harmful software;steal data
Lossy compression|Compression that permanently removes some data to make a file smaller.|permanently removes data;smaller file
Lossless compression|Compression that makes a file smaller without losing any data, so the original can be rebuilt exactly.|without losing any data;rebuilt exactly
Colour depth|The number of bits used to store the colour of each pixel.|bits per pixel
Sample rate|The number of sound samples taken each second, measured in hertz.|samples per second
Operating system|Software that manages the hardware, runs programs and provides a user interface.|manages hardware;user interface`]
});

/* ================= FRENCH AND SPANISH VOCABULARY: [theme, [word, English]...] ================= */
const VOCAB_FR = {
  'Identity and family': [['la famille', 'the family'], ['le frère', 'the brother'], ['la sœur', 'the sister'], ['les parents', 'the parents'], ['le grand-père', 'the grandfather'], ['la grand-mère', 'the grandmother'], ['le cousin', 'the cousin'], ['l’ami', 'the friend'], ['drôle', 'funny'], ['gentil', 'kind'], ['bavard', 'chatty'], ['timide', 'shy'], ['paresseux', 'lazy'], ['s’entendre avec', 'to get on with'], ['le mariage', 'the wedding']],
  'School': [['le collège', 'the secondary school'], ['la matière', 'the subject'], ['l’emploi du temps', 'the timetable'], ['les devoirs', 'the homework'], ['le professeur', 'the teacher'], ['la récré', 'break time'], ['l’uniforme', 'the uniform'], ['la règle', 'the rule'], ['l’examen', 'the exam'], ['réussir', 'to succeed'], ['échouer', 'to fail'], ['facile', 'easy'], ['difficile', 'difficult'], ['ennuyeux', 'boring'], ['la cantine', 'the canteen']],
  'Free time': [['le loisir', 'the hobby'], ['jouer au foot', 'to play football'], ['faire de la natation', 'to go swimming'], ['lire', 'to read'], ['regarder la télé', 'to watch TV'], ['le film', 'the film'], ['la musique', 'the music'], ['le chanteur', 'the singer'], ['le portable', 'the mobile phone'], ['les réseaux sociaux', 'social media'], ['sortir', 'to go out'], ['le week-end', 'the weekend'], ['le match', 'the match'], ['le jeu vidéo', 'the video game'], ['la danse', 'dance']],
  'Home and town': [['la maison', 'the house'], ['l’appartement', 'the flat'], ['la chambre', 'the bedroom'], ['la cuisine', 'the kitchen'], ['le jardin', 'the garden'], ['la ville', 'the town'], ['le village', 'the village'], ['la gare', 'the train station'], ['le magasin', 'the shop'], ['la bibliothèque', 'the library'], ['le centre commercial', 'the shopping centre'], ['la piscine', 'the swimming pool'], ['bruyant', 'noisy'], ['tranquille', 'quiet'], ['près de', 'near']],
  'Holidays and travel': [['les vacances', 'the holidays'], ['la plage', 'the beach'], ['la montagne', 'the mountains'], ['l’hôtel', 'the hotel'], ['le camping', 'the campsite'], ['l’avion', 'the plane'], ['le train', 'the train'], ['la voiture', 'the car'], ['le billet', 'the ticket'], ['la valise', 'the suitcase'], ['le soleil', 'the sun'], ['il pleut', 'it is raining'], ['il fait beau', 'the weather is nice'], ['à l’étranger', 'abroad'], ['visiter', 'to visit (a place)']],
  'Food and drink': [['le petit-déjeuner', 'breakfast'], ['le déjeuner', 'lunch'], ['le dîner', 'dinner'], ['le pain', 'the bread'], ['le fromage', 'the cheese'], ['la viande', 'the meat'], ['le poisson', 'the fish'], ['les légumes', 'the vegetables'], ['les fruits', 'the fruit'], ['l’eau', 'the water'], ['le gâteau', 'the cake'], ['délicieux', 'delicious'], ['manger', 'to eat'], ['boire', 'to drink'], ['végétarien', 'vegetarian']],
  'Jobs and future plans': [['le métier', 'the job'], ['le médecin', 'the doctor'], ['l’infirmier', 'the nurse'], ['l’avocat', 'the lawyer'], ['l’ingénieur', 'the engineer'], ['le stage', 'the work experience'], ['l’université', 'university'], ['le salaire', 'the salary'], ['gagner', 'to earn'], ['travailler', 'to work'], ['l’avenir', 'the future'], ['je voudrais', 'I would like'], ['je vais', 'I am going to'], ['l’apprentissage', 'the apprenticeship'], ['bien payé', 'well paid']],
  'Environment and society': [['l’environnement', 'the environment'], ['la pollution', 'pollution'], ['le réchauffement climatique', 'global warming'], ['recycler', 'to recycle'], ['les déchets', 'the rubbish'], ['l’énergie', 'energy'], ['protéger', 'to protect'], ['la planète', 'the planet'], ['les sans-abri', 'homeless people'], ['la pauvreté', 'poverty'], ['le bénévolat', 'volunteering'], ['économiser', 'to save'], ['les transports en commun', 'public transport'], ['le vélo', 'the bike'], ['la santé', 'health']]
};
const VOCAB_ES = {
  'Identity and family': [['la familia', 'the family'], ['el hermano', 'the brother'], ['la hermana', 'the sister'], ['los padres', 'the parents'], ['el abuelo', 'the grandfather'], ['la abuela', 'the grandmother'], ['el primo', 'the cousin'], ['el amigo', 'the friend'], ['gracioso', 'funny'], ['amable', 'kind'], ['hablador', 'chatty'], ['tímido', 'shy'], ['perezoso', 'lazy'], ['llevarse bien con', 'to get on well with'], ['la boda', 'the wedding']],
  'School': [['el instituto', 'the secondary school'], ['la asignatura', 'the subject'], ['el horario', 'the timetable'], ['los deberes', 'the homework'], ['el profesor', 'the teacher'], ['el recreo', 'break time'], ['el uniforme', 'the uniform'], ['la regla', 'the rule'], ['el examen', 'the exam'], ['aprobar', 'to pass (an exam)'], ['suspender', 'to fail (an exam)'], ['fácil', 'easy'], ['difícil', 'difficult'], ['aburrido', 'boring'], ['el comedor', 'the canteen']],
  'Free time': [['el pasatiempo', 'the hobby'], ['jugar al fútbol', 'to play football'], ['nadar', 'to swim'], ['leer', 'to read'], ['ver la tele', 'to watch TV'], ['la película', 'the film'], ['la música', 'the music'], ['el cantante', 'the singer'], ['el móvil', 'the mobile phone'], ['las redes sociales', 'social media'], ['salir', 'to go out'], ['el fin de semana', 'the weekend'], ['el partido', 'the match'], ['el videojuego', 'the video game'], ['bailar', 'to dance']],
  'Home and town': [['la casa', 'the house'], ['el piso', 'the flat'], ['el dormitorio', 'the bedroom'], ['la cocina', 'the kitchen'], ['el jardín', 'the garden'], ['la ciudad', 'the city'], ['el pueblo', 'the village'], ['la estación', 'the station'], ['la tienda', 'the shop'], ['la biblioteca', 'the library'], ['el centro comercial', 'the shopping centre'], ['la piscina', 'the swimming pool'], ['ruidoso', 'noisy'], ['tranquilo', 'quiet'], ['cerca de', 'near']],
  'Holidays and travel': [['las vacaciones', 'the holidays'], ['la playa', 'the beach'], ['la montaña', 'the mountains'], ['el hotel', 'the hotel'], ['el camping', 'the campsite'], ['el avión', 'the plane'], ['el tren', 'the train'], ['el coche', 'the car'], ['el billete', 'the ticket'], ['la maleta', 'the suitcase'], ['el sol', 'the sun'], ['llueve', 'it is raining'], ['hace buen tiempo', 'the weather is nice'], ['en el extranjero', 'abroad'], ['visitar', 'to visit']],
  'Food and drink': [['el desayuno', 'breakfast'], ['la comida', 'lunch'], ['la cena', 'dinner'], ['el pan', 'the bread'], ['el queso', 'the cheese'], ['la carne', 'the meat'], ['el pescado', 'the fish'], ['las verduras', 'the vegetables'], ['la fruta', 'the fruit'], ['el agua', 'the water'], ['el pastel', 'the cake'], ['delicioso', 'delicious'], ['comer', 'to eat'], ['beber', 'to drink'], ['vegetariano', 'vegetarian']],
  'Jobs and future plans': [['el trabajo', 'the job'], ['el médico', 'the doctor'], ['el enfermero', 'the nurse'], ['el abogado', 'the lawyer'], ['el ingeniero', 'the engineer'], ['las prácticas', 'the work experience'], ['la universidad', 'university'], ['el sueldo', 'the salary'], ['ganar', 'to earn'], ['trabajar', 'to work'], ['el futuro', 'the future'], ['me gustaría', 'I would like'], ['voy a', 'I am going to'], ['el aprendizaje', 'the apprenticeship'], ['bien pagado', 'well paid']],
  'Environment and society': [['el medio ambiente', 'the environment'], ['la contaminación', 'pollution'], ['el calentamiento global', 'global warming'], ['reciclar', 'to recycle'], ['la basura', 'the rubbish'], ['la energía', 'energy'], ['proteger', 'to protect'], ['el planeta', 'the planet'], ['las personas sin hogar', 'homeless people'], ['la pobreza', 'poverty'], ['el voluntariado', 'volunteering'], ['ahorrar', 'to save'], ['el transporte público', 'public transport'], ['la bicicleta', 'the bike'], ['la salud', 'health']]
};
/* each theme becomes one bank of questions in both directions; wrong options come from the same theme and direction */
(function vocabBanks() {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const three = (pool, not) => pool.filter(x => x !== not).map(x => [rnd(), x]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(x => x[1]);
  for (const [lang, sub, V] of [['French', 'french', VOCAB_FR], ['Spanish', 'spanish', VOCAB_ES]]) {
    let k = 0;
    for (const [theme, pairs] of Object.entries(V)) {
      const fw = pairs.map(p => p[0]), en = pairs.map(p => p[1]), lines = [];
      for (const [w, e] of pairs) {
        lines.push(`What does “${w}” mean in English?|${e}|${three(en, e).join(';')}`);
        lines.push(`How do you say “${e}” in ${lang}?|${w}|${three(fw, w).join(';')}`);
      }
      BANKS[`${sub.slice(0, 2)}-v${k++}`] = [sub, `${lang}: ${theme}`, '\n' + lines.join('\n')];
    }
  }
})();

Object.assign(BANKS, {
  /* ================= HISTORY: Weimar and Nazi Germany (AQA and Edexcel) ================= */
  'hi-weimar': ['history', 'Germany: the Weimar Republic 1918–29', `
When did Germany sign the armistice that ended fighting in the First World War?|November 1918|June 1919;January 1933;August 1914
Which treaty forced Germany to accept blame for the First World War?|The Treaty of Versailles|The Treaty of Locarno;The Dawes Plan;The Young Plan
Which clause of the Treaty of Versailles was the "war guilt" clause?|Article 231|Article 48;Article 10;Article 22
How large was the army Germany was allowed under the Treaty of Versailles?|100,000 men|500,000 men;1 million men;10,000 men
Which article of the Weimar constitution let the President rule by decree in an emergency?|Article 48|Article 231;Article 1;Article 25
Who led the left-wing Spartacist uprising in Berlin in 1919?|Rosa Luxemburg and Karl Liebknecht|Hitler and Röhm;Kapp and Lüttwitz;Ebert and Scheidemann
Which right-wing attempt to seize Berlin in 1920 was defeated by a general strike?|The Kapp Putsch|The Munich Putsch;The Spartacist Uprising;The Night of the Long Knives
Which region did French and Belgian troops occupy in 1923 when Germany missed reparation payments?|The Ruhr|The Rhineland;The Saar;Alsace-Lorraine
In which year did hyperinflation peak in Germany?|1923|1919;1929;1933
Who became Chancellor in 1923 and led Germany's recovery in the "Golden Years"?|Gustav Stresemann|Friedrich Ebert;Heinrich Brüning;Franz von Papen
Which 1924 plan reorganised reparations and arranged American loans to Germany?|The Dawes Plan|The Young Plan;The Marshall Plan;The Locarno Pact
Which new currency replaced the worthless mark in 1923–24?|The Rentenmark|The Euro;The Reichsthaler;The Deutschmark
Which 1925 treaties improved Germany's relations with Britain, France and other neighbours?|The Locarno Pact|The Treaty of Versailles;The Kellogg-Briand Pact;The Dawes Plan
When did Germany join the League of Nations?|1926|1919;1923;1933
What event in 1929 ended the "Golden Years" by causing American loans to be recalled?|The Wall Street Crash|The Munich Putsch;The Reichstag Fire;Hyperinflation`],
  'hi-nazi': ['history', 'Germany: the Nazis 1919–39', `
In which year did Hitler attempt to seize power in the Munich Putsch?|1923|1919;1929;1933
Which book did Hitler write in prison after the Munich Putsch?|Mein Kampf|The Communist Manifesto;Der Stürmer;The Nuremberg Laws
On what date was Hitler appointed Chancellor?|30 January 1933|1 September 1939;9 November 1923;27 February 1933
What happened to the Reichstag building on 27 February 1933?|It was set on fire|It was bombed by the Allies;It was turned into a museum;It was moved to Munich
Which law of March 1933 let Hitler make laws without the Reichstag?|The Enabling Act|The Nuremberg Laws;Article 48;The Reich Citizenship Law
What was the Night of the Long Knives (June 1934)?|Hitler's purge of the SA leadership, including Röhm|The Kristallnacht attacks on Jewish property;The burning of the Reichstag;The Munich Putsch
Who led the SA until he was killed in 1934?|Ernst Röhm|Heinrich Himmler;Joseph Goebbels;Hermann Göring
Who was in charge of Nazi propaganda?|Joseph Goebbels|Heinrich Himmler;Ernst Röhm;Rudolf Hess
Who led the SS?|Heinrich Himmler|Joseph Goebbels;Ernst Röhm;Albert Speer
What was the Gestapo?|The Nazi secret police|The Nazi youth movement;The German army;The Nazi labour union
Which 1935 laws took away German citizenship from Jews and banned marriage between Jews and non-Jews?|The Nuremberg Laws|The Enabling Act;The Reich Concordat;The Weimar Constitution
What was Kristallnacht (November 1938)?|Nazi attacks on Jewish shops, homes and synagogues across Germany|The burning of the Reichstag;The purge of the SA;A Nazi rally in Nuremberg
What was the Nazi youth organisation for boys called?|The Hitler Youth|The League of German Maidens;The Strength Through Joy;The SA
What was the Nazi organisation for girls called?|The League of German Maidens|The Hitler Youth;The Women's Front;The Mothers' Union
Which organisation replaced trade unions in 1933?|The German Labour Front|The Hitler Youth;The SS;The Reichstag
What did the Nazis' Strength Through Joy organisation provide?|Cheap holidays and leisure activities for workers|Loans to farmers;Training for soldiers;Schools for girls
Which agreement of 1933 between the Nazis and the Pope protected Catholic schools in return for staying out of politics?|The Concordat|The Enabling Act;The Locarno Pact;The Anschluss
What were the "three Ks" the Nazis promoted for women?|Children, kitchen, church|Cars, kitchen, cleaning;Culture, country, church;Children, career, church`],
  /* ================= HISTORY: medicine through time (AQA Health and the people; Edexcel Medicine in Britain) ================= */
  'hi-med': ['history', 'Medicine through time', `
Which ancient Greek doctor's ideas about the four humours dominated medieval medicine?|Hippocrates and Galen|Pasteur and Koch;Vesalius and Harvey;Jenner and Snow
Which four humours did medieval doctors believe made up the body?|Blood, phlegm, yellow bile and black bile|Air, fire, earth and water;Blood, bone, muscle and skin;Heart, liver, brain and lungs
What did many people in 1348 believe caused the Black Death?|Miasma (bad air) and God's punishment|Germs carried by fleas;Contaminated water;Vitamin deficiency
What did Andreas Vesalius publish in 1543?|The Fabric of the Human Body, showing Galen made mistakes about anatomy|The theory of the circulation of the blood;The germ theory of disease;The first vaccine
Who discovered that the heart pumps blood around the body in a circulation (1628)?|William Harvey|Andreas Vesalius;Edward Jenner;Joseph Lister
Who developed a vaccination against smallpox in 1796?|Edward Jenner|Louis Pasteur;Robert Koch;Alexander Fleming
Who published the germ theory in 1861?|Louis Pasteur|Robert Koch;Joseph Lister;John Snow
Who proved that cholera was spread by contaminated water by removing the Broad Street pump handle in 1854?|John Snow|Edwin Chadwick;Joseph Lister;Florence Nightingale
Who identified the specific bacteria that cause tuberculosis and cholera?|Robert Koch|Louis Pasteur;Paul Ehrlich;Edward Jenner
Who introduced carbolic acid antiseptic surgery in the 1860s?|Joseph Lister|James Simpson;John Snow;Alexander Fleming
Which anaesthetic did James Simpson begin using in 1847?|Chloroform|Ether;Laughing gas;Penicillin
Which 1875 law made local councils responsible for clean water, sewers and rubbish collection?|The Public Health Act|The Poor Law Amendment Act;The National Health Service Act;The Factory Act
Who discovered penicillin in 1928?|Alexander Fleming|Florey and Chain;Louis Pasteur;Robert Koch
Who developed penicillin so that it could be mass-produced during the Second World War?|Howard Florey and Ernst Chain|Alexander Fleming;Robert Koch;Paul Ehrlich
What was Salvarsan 606, found by Paul Ehrlich's team in 1909?|The first chemical cure (a "magic bullet") for a specific disease, syphilis|The first vaccine;The first antibiotic;The first anaesthetic
In which year was the National Health Service founded?|1948|1918;1875;1965
Which minister set up the NHS?|Aneurin Bevan|Winston Churchill;William Beveridge;Lloyd George
Whose 1942 report led to the creation of the welfare state and the NHS?|William Beveridge|Aneurin Bevan;Edwin Chadwick;Florence Nightingale
Which discovery of 1953 by Crick and Watson, using Rosalind Franklin's work, opened the way to genetic medicine?|The structure of DNA|The germ theory;Penicillin;Blood groups
Who reformed nursing and hospital hygiene after the Crimean War?|Florence Nightingale|Mary Seacole;Elizabeth Garrett Anderson;Rosalind Franklin`],
  /* ================= HISTORY: Elizabethan England (AQA and Edexcel) ================= */
  'hi-eliz': ['history', 'Elizabethan England', `
In which year did Elizabeth I become queen?|1558|1533;1588;1603
Who was Elizabeth's mother?|Anne Boleyn|Catherine of Aragon;Jane Seymour;Mary Queen of Scots
What was the religious settlement of 1559?|Elizabeth's compromise that made England Protestant but kept some Catholic features|A law banning all Protestant worship;A treaty with Spain;A plan for Elizabeth to marry
Which act of 1559 made Elizabeth Supreme Governor of the Church of England?|The Act of Supremacy|The Act of Uniformity;The Poor Law;The Statute of Artificers
Which act of 1559 set out how church services should be held and fined people who did not attend?|The Act of Uniformity|The Act of Supremacy;The Treason Act;The Navigation Act
Who were the recusants?|Catholics who refused to attend Church of England services|Puritans who wanted simpler churches;Spanish spies;Members of the Privy Council
Who were the Puritans?|Strict Protestants who wanted to remove all Catholic features from the church|Catholics loyal to the Pope;Elizabeth's closest advisers;Explorers in the Americas
Which 1569 rebellion by northern Catholic nobles aimed to put Mary Queen of Scots on the throne?|The Revolt of the Northern Earls|The Babington Plot;The Throckmorton Plot;The Essex Rebellion
Which plot of 1586 led directly to the execution of Mary Queen of Scots?|The Babington Plot|The Ridolfi Plot;The Throckmorton Plot;The Gunpowder Plot
In which year was Mary Queen of Scots executed?|1587|1568;1588;1603
Who was Elizabeth's spymaster?|Sir Francis Walsingham|William Cecil;Robert Dudley;Walter Raleigh
Who was Elizabeth's chief adviser for most of her reign?|William Cecil (Lord Burghley)|Francis Walsingham;Robert Devereux;Francis Drake
In which year did England defeat the Spanish Armada?|1588|1558;1568;1603
Which tactic broke up the Armada's crescent formation while it was anchored off Calais?|Sending fireships into the Spanish fleet at night|Boarding every Spanish ship;Blockading Lisbon;Paying the Spanish to retreat
Who sailed around the world between 1577 and 1580?|Francis Drake|Walter Raleigh;John Hawkins;Humphrey Gilbert
Which failed English colony in America did Walter Raleigh sponsor?|Roanoke|Jamestown;Plymouth;Boston
Which 1601 law made each parish responsible for looking after its poor?|The Poor Law|The Act of Uniformity;The Vagabonds Act;The Statute of Artificers
What was a "sturdy beggar" to Elizabethans?|A person who could work but chose to beg|A disabled person who could not work;An honest farm labourer;A soldier home from war
Which theatre opened in 1599 and staged Shakespeare's plays?|The Globe|The Rose;The Curtain;The Theatre Royal
Who led a failed rebellion in London in 1601 and was executed?|Robert Devereux, Earl of Essex|Robert Dudley, Earl of Leicester;William Cecil;Thomas Norfolk`]
});

Object.assign(DEFS, {
  'd-hi-terms': ['history', 'History: key terms', `
Reparations|Payments Germany had to make for damage caused in the First World War, set at £6.6 billion in 1921.|payments for war damage
Hyperinflation|Prices rising so fast that money becomes almost worthless, as in Germany in 1923.|prices rising so fast;money almost worthless
Putsch|An attempt to seize power by force.|seize power by force
Propaganda|Information used to persuade people to think a certain way, often by giving one side only.|persuade people;one side
Censorship|Controlling what people can read, see or hear by banning information.|controlling information;banning
Totalitarian|A state where the government controls every part of people's lives.|government controls everything
Anti-Semitism|Hatred of or prejudice against Jewish people.|prejudice against Jewish people
Miasma|The old belief that disease was caused by bad air from rotting matter.|bad air;causes disease
Germ theory|The idea, proved by Pasteur, that microbes cause disease.|microbes cause disease
Vaccination|Giving a weakened or dead form of a disease to make the body build immunity.|weakened or dead form;immunity
Antiseptic|A chemical that kills germs on wounds or instruments, as Lister used in surgery.|kills germs
Aseptic surgery|Surgery that keeps germs out of the operating theatre completely, using sterilised instruments and clothing.|keeps germs out;sterilised
Recusant|A Catholic who refused to attend Church of England services.|Catholic;refused to attend
Privy Council|The group of advisers who helped Elizabeth I govern.|advisers;helped govern
Patronage|Giving jobs, money or favours to gain loyalty.|jobs or favours;loyalty
Vagrancy|Wandering from place to place with no home or work.|no home or work;wandering`]
});
