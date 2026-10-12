/* Archeron · English, Geography, Business and RE practice papers, added to EXAMS (exam.js).
   Question: [topic, question, scheme, extra]. A scheme is one of:
     [points]                     one mark per point
     { any: [points], max }       tick any that apply, capped at max
     { lv: LEVELS, look: [...] }  levels-based: tick what examiners look for, pick a level, then a mark
   extra: { src: key or [keys] (source shown above the question), mins (suggested time), same: true (marks the previous answer) }
   Level wording is our own summary of how each band reads, not exam-board text. Sources are original or public domain. */
'use strict';
const LV = {
  q8: [[7, 8, 'Detailed, perceptive analysis. Quotes are well chosen and subject terms are precise.'], [5, 6, 'Clear explanation of effects, with relevant quotes and accurate subject terms.'],
    [3, 4, 'Some comment on effects, some quotes, some subject terms.'], [1, 2, 'Simple comments; quotes copied out with little explanation.']],
  q12: [[10, 12, 'Detailed, perceptive analysis with judicious quotes and precise terms.'], [7, 9, 'Clear explanation of effects with relevant quotes and accurate terms.'],
    [4, 6, 'Some comment on effects, some quotes and some terms.'], [1, 3, 'Simple comments with little explanation.']],
  q16: [[13, 16, 'Perceptive, detailed comparison of ideas and methods, with judicious quotes from both sources.'], [9, 12, 'Clear comparison of ideas and methods, with relevant quotes from both.'],
    [5, 8, 'Some comparison, some quotes, some comment on methods.'], [1, 4, 'Simple comparison; mostly describes what each source says.']],
  eval20: [[16, 20, 'Perceptive, critical evaluation of the statement; methods analysed in detail; judicious quotes.'], [11, 15, 'Clear evaluation; methods explained clearly; relevant quotes.'],
    [6, 10, 'Some evaluation; some comment on methods; some quotes.'], [1, 5, 'Simple, limited evaluation with simple references.']],
  content24: [[19, 24, 'Compelling and convincing. Tone and register perfectly matched; ambitious vocabulary; inventive structure; fluent paragraphs.'],
    [13, 18, 'Consistently clear. Tone matched; increasingly sophisticated vocabulary and devices; effective structure; coherent paragraphs.'],
    [7, 12, 'Some sustained attempts to match purpose; vocabulary chosen for effect; some devices; some paragraphing.'], [1, 6, 'Simple awareness of purpose; simple vocabulary; random or no paragraphs.']],
  tech16: [[13, 16, 'Sentences always accurate; wide range of punctuation used accurately; wide range of sentence forms for effect; high spelling accuracy, including ambitious words.'],
    [9, 12, 'Sentence demarcation mostly secure; a range of punctuation, mostly accurate; varied sentences; mostly accurate spelling.'],
    [5, 8, 'Demarcation mostly secure; some control of punctuation; some variety of sentences; some accurate spelling of harder words.'], [1, 4, 'Occasional demarcation; some punctuation; simple sentences; basic spelling.']],
  lit30: [[26, 30, 'Convincing, critical argument. Judicious quotes, detailed analysis of methods, context woven in.'], [21, 25, 'Thoughtful, developed argument. Apt quotes, methods examined, thoughtful links to context.'],
    [16, 20, 'Clear, sustained response. Effective quotes, clear explanation of methods with terms, clear context links.'], [11, 15, 'Explained response. References support points; some methods and effects; some context.'],
    [6, 10, 'Supported, relevant comments. Some quotes; some awareness of methods and context.'], [1, 5, 'Simple comments. Few references; little awareness of methods or context.']],
  lit24: [[21, 24, 'Convincing, critical response with detailed analysis of language, form and structure.'], [17, 20, 'Thoughtful, developed response that examines methods and effects.'],
    [13, 16, 'Clear, sustained response explaining methods and effects.'], [9, 12, 'Explained response with some comment on methods.'], [5, 8, 'Supported comments; some awareness of methods.'], [1, 4, 'Simple comments; little on methods.']],
  spag4: [[4, 4, 'High: consistently accurate spelling and punctuation; wide range of vocabulary and sentence structures.'], [2, 3, 'Intermediate: considerable accuracy; good range of vocabulary and sentences.'],
    [1, 1, 'Threshold: reasonable accuracy; meaning is not seriously affected by errors.']],
  geo6: [[5, 6, 'Thorough, detailed explanation; every point developed; specific detail where needed.'], [3, 4, 'Clear explanation with some development and some detail.'], [1, 2, 'Basic points with little development.']],
  geo9: [[7, 9, 'Detailed, balanced evaluation with specific case-study facts and a clear, justified conclusion.'], [4, 6, 'Clear explanation with some evaluation and some case-study detail; a partly supported conclusion.'],
    [1, 3, 'Basic points; little evaluation; generic or no case study.']],
  bus6: [[5, 6, 'Developed chains of reasoning, applied to the business throughout.'], [3, 4, 'Some chains of reasoning, partly applied to the business.'], [1, 2, 'Simple points with little reasoning or application.']],
  bus9: [[7, 9, 'Balanced, applied analysis with chains of reasoning and a fully justified decision ("it depends on…").'], [4, 6, 'Some applied analysis and a decision with some justification.'],
    [1, 3, 'Simple points; little use of the case; decision unsupported.']],
  re12: [[10, 12, 'Well argued: logical chains of reasoning, both sides developed with religious teachings, a justified conclusion.'], [7, 9, 'Reasoned: different views with logical reasoning and religious knowledge; a judgement is reached.'],
    [4, 6, 'One view reasoned with some religion, or different views each with a reason.'], [1, 3, 'A point of view with a reason stated.']]
};
const LOOK = {
  lang: ['Short quotes from the right part of the source', 'Named methods (verbs, imagery, personification, sentence forms)', 'Zoomed in on single words and their connotations', 'Explained the effect on the reader, not just the meaning', 'At least three separate, developed points'],
  writing: ['Planned for about 5 minutes first', 'Strong opening, a clear shift or turning point, a deliberate ending', 'Ambitious vocabulary chosen for effect', 'A range of devices (senses, imagery, contrast, repetition)', 'Paragraphs used deliberately, including a one-line paragraph for impact', 'About 450 to 650 words'],
  tech: ['Every sentence correctly ended (no comma splices)', 'At least three kinds of punctuation beyond full stops and commas (; : — ? ! " ")', 'Varied sentence openings and lengths, including a short sentence for effect', 'Checked their/there/they\'re, your/you\'re, its/it\'s', 'Standard English throughout'],
  lit: ['A clear argument (thesis) that answers the question', 'Close analysis of the extract: words, imagery, sentence forms', 'Wrote about the whole text, not just the extract', 'Short, embedded quotes', 'Named the writer\'s methods and their effects', 'Context linked to the argument, not bolted on'],
  spag: ['Accurate spelling, including names and key terms', 'Accurate punctuation, including apostrophes and quotation marks', 'A range of vocabulary and sentence structures', 'Meaning always clear'],
  re: ['Developed arguments FOR the statement', 'Developed arguments AGAINST (a different view)', 'Religious teachings or sources used as evidence', 'Chains of reasoning ("this means…, so…")', 'A justified conclusion that weighs up both sides', 'Key terms used accurately']
};
const EXAM_HOW = {
  Maths: 'Show every step. Method marks come even when the final answer slips, so write the working down.',
  Biology: 'One mark per idea. Use the key words from the mark scheme and learn the ones you miss.',
  Chemistry: 'One mark per idea. Equations and calculations need every step; units matter.',
  Physics: 'Write the equation, substitute, then answer with units. That is where the marks are.',
  'English Language': 'Time each question as in the exam: Q1 5 min, Q2 10, Q3 10, Q4 20, Q5 45 (5 of them planning). Spend the most time where the most marks are.',
  'English Literature': 'Plan for 5 minutes, then write about 50 minutes per essay. Embed short quotes, name methods, and tie context to your argument.',
  Geography: 'Short questions are one mark per point. For 6 and 9-markers, use a named case study with facts and figures, and end with a judgement.',
  Business: 'Apply every point to the business in the case study, then build chains: "this means… which leads to…". Always make a decision on 9-markers.',
  RE: '4 and 5-markers: two points, each developed (5-markers also need a teaching or source). 12-markers: argue both sides with teachings, then a justified conclusion.'
};

/* ---------------- sources (original texts, or public domain) ---------------- */
const SRC_STORM = ['Source: an original story extract written for this paper', `The storm had been building since noon. By four o'clock the sky over Harrow Point had turned the colour of a bruise, and the sea, which all morning had lain flat and grey as a sheet of tin, began to heave itself against the rocks.

Elsie stood at the kitchen window with her palms pressed to the cold glass. Her father had gone out in the boat at first light to check the lobster pots off Gull Rock. He had promised to be back by three.

The clock on the mantelpiece ticked. It was a small, bossy sound, and she hated it.

Outside, the wind found every gap in the old cottage. It whistled under the door and moaned in the chimney like something trapped. A gust hit the window so hard that the glass shivered in its frame, and Elsie stepped back, her breath leaving a ghost on the pane.

She told herself what she had told herself a hundred times before: he knows these waters. He has been fishing them for thirty years. He will come round the headland any minute now, the little red boat bouncing on the swell, and he will laugh at her for worrying.

But the headland stayed empty.

At half past four she lit the storm lantern and pulled on her father's oilskin coat. It swallowed her; the sleeves hung past her fingers and it smelled of salt and tobacco and him. She pushed open the door and the wind snatched it from her hand, slamming it back against the wall.

The path down to the harbour was a river of mud. Rain drove sideways into her face, needle-sharp, and the lantern swung wildly, throwing its weak yellow light first on the hedge, then on the sky, then on nothing at all. Twice she slipped and fell to her knees. Twice she got up.

At the harbour wall she stopped. Below her, the sea was a living thing: black, enormous, roaring. Waves the size of houses rose out of the darkness, paused, and then smashed into the stone with a sound like gunfire. Spray burst over the wall and soaked her to the skin.

And then, between one wave and the next, she saw it. A pinprick of light, far out beyond the rocks. It flickered. It vanished. It came back.

Elsie lifted the lantern high above her head and began, with all the strength she had, to swing it from side to side.`];
const SRC_SWIM_A = ['Source A: a modern newspaper column (original, written for this paper)', `Why I swim in the sea in January

There is a moment, about four seconds after you walk into the North Sea in January, when your body simply refuses to believe what is happening. Your lungs snatch at the air. Your skin screams. Every sensible part of your brain shouts one word: out.

I ignore it. I have been ignoring it every Sunday morning for three years.

It started by accident. After a difficult year, a friend dragged me to a beach near Whitby at seven o'clock on a frozen morning. I stood on the shingle in a borrowed swimming costume, shaking, convinced she had lost her mind. Ten minutes later I came out of the water a different person: wide awake, ridiculously happy, and laughing at nothing.

Scientists are still arguing about why cold water makes people feel so good. Some point to the rush of chemicals the body releases in shock; others say it is simply the company, the shared madness of a dozen strangers in woolly hats. Personally, I do not care why it works. I only know that for those ten minutes my phone is in a bag on the beach, my emails do not exist, and the only thing I have to think about is my next breath.

Of course, it is not for everyone. Cold water is genuinely dangerous, and nobody should try it alone or without building up slowly. But I wish more people would give it a chance. We spend so much of our lives wrapped up warm, scrolling, sheltering from the weather. The sea reminds you that you have a body, and that it is tougher than you think.

So this Sunday, at seven o'clock, I will be back on that beach. The water will be eight degrees. I will gasp, and swear, and wonder why I do this to myself.

And then I will smile.`];
const SRC_SWIM_B = ['Source B: a letter written for this paper in the style of 1858, from Harriet to her sister, at a seaside town where her doctor sent her', `My dearest Louisa,

You asked me to tell you everything about the sea-bathing, and so I shall, though I warn you it is not the delightful amusement the guide-books promise.

Each morning at seven, Mama and I are marched down to the beach, where a row of bathing-machines stands waiting like so many ugly wooden huts upon wheels. One climbs inside, removes one's clothing in a space hardly larger than a wardrobe, and puts on a flannel gown so heavy and shapeless that I am certain it was designed by someone who wished us to drown. A horse then drags the whole contraption into the water, with a great jolting and creaking, until the sea is up to the steps.

And then, Louisa, comes the dipper. She is a vast, red-faced woman with arms like a blacksmith, and her whole employment is to seize young ladies and plunge them beneath the waves. I protested that I should prefer to enter the water gradually. She laughed, said, "It does you good, miss," and pushed my head under before I could draw breath.

The cold is beyond anything you can imagine. I came up gasping and spluttering, my hair plastered to my face, and was dipped twice more for good measure. Dr Hadley insists that this treatment will strengthen my nerves and improve my complexion. At present it has only improved my vocabulary, though I dare not repeat the words in a letter.

I confess the sea air does make me sleep soundly, and the walks along the cliffs are very fine. But if I am ever well again, it will be in spite of the dipper, not because of her.

Your loving and half-frozen sister,
Harriet`];
const SRC_MAC = ['Macbeth, Act 1 Scene 5. Lady Macbeth has just heard that King Duncan will stay at her castle tonight.', `LADY MACBETH
The raven himself is hoarse
That croaks the fatal entrance of Duncan
Under my battlements. Come, you spirits
That tend on mortal thoughts, unsex me here,
And fill me from the crown to the toe top-full
Of direst cruelty! Make thick my blood;
Stop up the access and passage to remorse,
That no compunctious visitings of nature
Shake my fell purpose, nor keep peace between
The effect and it! Come to my woman's breasts,
And take my milk for gall, you murdering ministers,
Wherever in your sightless substances
You wait on nature's mischief! Come, thick night,
And pall thee in the dunnest smoke of hell,
That my keen knife see not the wound it makes,
Nor heaven peep through the blanket of the dark,
To cry 'Hold, hold!'

(Check the wording against your own edition; editions differ slightly.)`];
const SRC_ACC = ['A Christmas Carol, Stave 1. The narrator introduces Scrooge.', `Oh! But he was a tight-fisted hand at the grindstone, Scrooge! a squeezing, wrenching, grasping, scraping, clutching, covetous, old sinner! Hard and sharp as flint, from which no steel had ever struck out generous fire; secret, and self-contained, and solitary as an oyster. The cold within him froze his old features, nipped his pointed nose, shrivelled his cheek, stiffened his gait; made his eyes red, his thin lips blue; and spoke out shrewdly in his grating voice. A frosty rime was on his head, and on his eyebrows, and his wiry chin. He carried his own low temperature always about with him; he iced his office in the dog-days; and didn't thaw it one degree at Christmas.`];
const SRC_OZY = ['Ozymandias, by Percy Bysshe Shelley (1818)', `I met a traveller from an antique land,
Who said—"Two vast and trunkless legs of stone
Stand in the desert. . . . Near them, on the sand,
Half sunk a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them, and the heart that fed;
And on the pedestal, these words appear:
My name is Ozymandias, King of Kings;
Look on my Works, ye Mighty, and despair!
Nothing beside remains. Round the decay
Of that colossal Wreck, boundless and bare
The lone and level sands stretch far away."`];
const SRC_REM = ['Unseen poem 1: Remember, by Christina Rossetti (1862)', `Remember me when I am gone away,
Gone far away into the silent land;
When you can no more hold me by the hand,
Nor I half turn to go yet turning stay.
Remember me when no more day by day
You tell me of our future that you plann'd:
Only remember me; you understand
It will be late to counsel then or pray.
Yet if you should forget me for a while
And afterwards remember, do not grieve:
For if the darkness and corruption leave
A vestige of the thoughts that once I had,
Better by far you should forget and smile
Than that you should remember and be sad.`];
const SRC_S71 = ['Unseen poem 2: Sonnet 71, by William Shakespeare (1609)', `No longer mourn for me when I am dead
Than you shall hear the surly sullen bell
Give warning to the world that I am fled
From this vile world, with vilest worms to dwell:
Nay, if you read this line, remember not
The hand that writ it; for I love you so
That I in your sweet thoughts would be forgot
If thinking on me then should make you woe.
O, if, I say, you look upon this verse
When I perhaps compounded am with clay,
Do not so much as my poor name rehearse,
But let your love even with my life decay,
Lest the wise world should look into your moan
And mock you with me after I am gone.`];
const SRC_PEDAL = ['Case study: Pedal & Pour (fictional business)', `Tom and Aisha Mensah opened Pedal & Pour, a café and bike-repair shop, in a market town in 2021. They set it up as a partnership, investing £18,000 of their own savings and taking out a £12,000 bank loan. The café sells coffee, cakes and lunches; the workshop repairs bikes for local cyclists and for tourists who ride the nearby trails.

The business employs four part-time staff, mostly students on zero-hours contracts. Staff turnover is high: three baristas left last year, and Aisha spends many hours recruiting and training replacements.

Customer reviews praise the friendly service but complain about long queues at weekends. Tom is considering buying a second, larger coffee machine for £4,500, which would let them serve customers more quickly.

In 2025 the business had revenue of £156,000. Its fixed costs were £48,000 and its variable costs were £72,000.`];
const SRC_GLOW = ['Case study: Glow Skincare Ltd (fictional business)', `Priya Shah runs Glow Skincare Ltd, a private limited company that makes natural face creams. She sells online through her website and social media, and to two independent shops. Each jar sells for £15 and costs £5 to make. Fixed costs are £30,000 a year. Last year Glow sold 5,000 jars.

Most of Glow's customers are aged 18 to 30. Priya promotes the brand mainly on Instagram and TikTok and has paid influencers to review her creams.

A national supermarket chain has offered to stock Glow's creams in 300 stores, but it will only pay £8 per jar. Priya is worried about cash flow: the supermarket pays 60 days after delivery, but her suppliers expect to be paid within 30 days.`];

const lang = (lv, extra) => ({ lv, look: LOOK.lang.concat(extra || []) });
const reSet = (beliefs, mcq, two, contrast, five, twelve) => [
  [beliefs, mcq[0], [mcq[1]]],
  [beliefs, two[0], { any: two[1], max: 2 }],
  [beliefs, contrast[0], contrast[1]],
  [beliefs, five[0], five[1]],
  [beliefs, `"${twelve[0]}"\n\nEvaluate this statement. In your answer you should: refer to religious teaching; give developed arguments to support this statement; give developed arguments to support a different point of view; reach a justified conclusion.`, { lv: LV.re12, look: LOOK.re.concat(twelve[1]) }, { mins: 15 }]];

EXAMS.push(
  /* ---------------- English Language ---------------- */
  { id: 'el1', g: 'English Language', subj: 'English Language', name: 'English Language practice paper 1 (fiction and creative writing)', mins: 105, src: { A: SRC_STORM }, qs: [
    ['Retrieval', 'Read again the first four paragraphs of the source, up to "the glass shivered in its frame". List four things from this part of the source about the weather.', { any: ['The storm had been building since noon', 'The sky had turned the colour of a bruise', 'The sea began to heave against the rocks (it had been flat in the morning)', 'The wind found every gap / whistled under the door / moaned in the chimney', 'A gust hit the window so hard the glass shivered'], max: 4 }, { src: 'A', mins: 5 }],
    ['Language analysis', 'Look in detail at the two paragraphs beginning "The path down to the harbour" and "At the harbour wall". How does the writer use language to describe the storm? You could include the writer\'s choice of words and phrases, language features and techniques, and sentence forms.', lang(LV.q8, ['Commented on sentence forms, e.g. "Twice she got up."']), { src: 'A', mins: 10 }],
    ['Structure', 'You now need to think about the whole of the source. How has the writer structured the text to interest you as a reader? You could write about what the writer focuses your attention on at the beginning, how and why the focus changes as the source develops, and any other structural features that interest you.',
      { lv: LV.q8, look: ['Commented on the opening and what the reader is shown first', 'Tracked shifts in focus: window → path → sea → the light', 'Explained the effect of single-line paragraphs ("But the headland stayed empty.")', 'Explained the effect of the ending (a cliffhanger)', 'Covered the whole text, not one part', 'Used structural terms (focus, shift, tension, contrast)'] }, { src: 'A', mins: 10 }],
    ['Evaluation', 'Focus this part of your answer on the source from "At half past four" to the end. A student said: "In this part of the story, the writer makes Elsie seem incredibly brave, and the ending leaves the reader full of hope." To what extent do you agree? In your response, you could consider your own impressions of Elsie, evaluate how the writer creates hope at the end, and support your response with references to the text.',
      { lv: LV.eval20, look: ['Gave your own view on the statement (agree, partly agree)', 'Covered BOTH parts: Elsie\'s bravery AND the hopeful ending', 'Quotes from the right section as evidence', 'Explained the writer\'s methods, not just what happens', 'Considered another reading, e.g. hope mixed with fear', 'Stayed within the section the question names'] }, { src: 'A', mins: 20 }],
    ['Writing: content and organisation', 'Your school is creating a collection of creative writing. Either: write a description of a place during a storm. Or: write a story about someone waiting for a person to come home. (24 marks for content and organisation; the next question marks the same writing for technical accuracy.)', { lv: LV.content24, look: LOOK.writing }, { mins: 45 }],
    ['Writing: technical accuracy', 'Mark the writing you did for the previous question for technical accuracy (spelling, punctuation, grammar and sentence forms).', { lv: LV.tech16, look: LOOK.tech }, { same: true }]] },
  { id: 'el2', g: 'English Language', subj: 'English Language', name: 'English Language practice paper 2 (viewpoints and perspectives)', mins: 105, src: { A: SRC_SWIM_A, B: SRC_SWIM_B }, qs: [
    ['Retrieval', 'Read again Source A from the beginning to "laughing at nothing". Choose four statements below which are TRUE.\nA  The writer swims every Sunday morning.\nB  The writer has been cold-water swimming for ten years.\nC  The writer started after a friend took her to the beach.\nD  The writer felt confident the first time she went in.\nE  The beach is near Whitby.\nF  The writer\'s lungs snatch at the air when she goes in.\nG  The writer swims in the afternoon.\nH  The writer felt worse after her first swim.', ['A', 'C', 'E', 'F'], { src: 'A', mins: 5 }],
    ['Summary', 'You need to refer to Source A and Source B for this question. Use details from both sources. Write a summary of the differences between how the two writers experience the cold sea.',
      { lv: LV.q8, look: ['Clear differences between the two writers', 'Evidence from BOTH sources', 'Inferences: what the details suggest, not just what they say', 'Comparison words (whereas, however, in contrast)', 'Stayed focused on the cold sea'] }, { src: ['A', 'B'], mins: 10 }],
    ['Language analysis', 'You now need to refer only to Source B. How does the writer use language to describe the experience of sea-bathing?', lang(LV.q12, ['Commented on humour and exaggeration, e.g. the dipper "with arms like a blacksmith"']), { src: 'B', mins: 15 }],
    ['Comparison', 'For this question, you need to refer to the whole of Source A, together with the whole of Source B. Compare how the writers convey their different attitudes to swimming in the cold sea. In your answer, you could compare their different attitudes, compare the methods they use to convey their attitudes, and support your response with references to both texts.',
      { lv: LV.q16, look: ['Compared attitudes (perspectives), not just content', 'Compared the methods each writer uses', 'Quotes from both sources', 'Comparison words throughout', 'Considered how the time period shapes each view', 'Covered the whole of each source, including the endings'] }, { src: ['A', 'B'], mins: 20 }],
    ['Writing: content and organisation', '"Modern life keeps us indoors and glued to our screens. Schools should make every student spend at least one hour outdoors each day." Write an article for a broadsheet newspaper in which you explain your point of view on this statement. (24 marks for content and organisation; the next question marks the same writing for technical accuracy.)',
      { lv: LV.content24, look: ['Clear viewpoint from the first paragraph', 'Article features: headline, strapline or subheadings', 'Persuasive devices: rhetorical questions, anecdote, statistics, direct address, groups of three', 'A counter-argument raised and then rebutted', 'Paragraphs linked with discourse markers', 'An ending that returns to the opening idea'] }, { mins: 45 }],
    ['Writing: technical accuracy', 'Mark the article you wrote for the previous question for technical accuracy.', { lv: LV.tech16, look: LOOK.tech }, { same: true }]] },

  /* ---------------- English Literature ---------------- */
  { id: 'lit1', g: 'English Literature', subj: 'English Literature', name: 'English Literature practice paper 1 (Macbeth and A Christmas Carol)', mins: 105, src: { M: SRC_MAC, C: SRC_ACC }, qs: [
    ['Macbeth', 'Starting with this speech, explore how Shakespeare presents Lady Macbeth as a powerful woman. Write about how Shakespeare presents Lady Macbeth in this speech, and how he presents her in the play as a whole.', { lv: LV.lit30, look: LOOK.lit.concat(['Context: Jacobean expectations of women, the supernatural, King James I', 'Tracked her change across the play, e.g. the sleepwalking in Act 5']) }, { src: 'M', mins: 50 }],
    ['Spelling, punctuation and grammar', 'Mark your Macbeth essay for spelling, punctuation and grammar (4 marks).', { lv: LV.spag4, look: LOOK.spag }, { same: true }],
    ['A Christmas Carol', 'Starting with this extract, explore how Dickens presents Scrooge as cold and isolated from other people. Write about how Dickens presents Scrooge in this extract, and how he presents Scrooge\'s relationships with others in the novella as a whole.', { lv: LV.lit30, look: LOOK.lit.concat(['Context: Victorian poverty, the Poor Law, Dickens\'s message to readers', 'Tracked Scrooge\'s transformation by Stave 5']) }, { src: 'C', mins: 50 }]] },
  { id: 'lit2', g: 'English Literature', subj: 'English Literature', name: 'English Literature practice paper 2 (Journey\'s End and poetry)', mins: 135, src: { O: SRC_OZY, R: SRC_REM, S: SRC_S71 }, qs: [
    ['Journey\'s End', 'How does Sherriff present the effects of the war on Stanhope in Journey\'s End? Write about what Stanhope is like and how he is affected by the war, and how Sherriff presents Stanhope by the ways he writes. (Use quotes from your own copy, checked word for word.)', { lv: LV.lit30, look: LOOK.lit.filter((_, i) => i !== 1).concat(['Used stage directions as well as dialogue', 'Context: Sherriff\'s own war service, shell shock, life in the trenches', 'Compared Stanhope with Raleigh, Osborne or Hibbert']) }, { mins: 45 }],
    ['Spelling, punctuation and grammar', 'Mark your Journey\'s End essay for spelling, punctuation and grammar (4 marks).', { lv: LV.spag4, look: LOOK.spag }, { same: true }],
    ['Power and Conflict poetry', 'Compare how poets present the effects of power in "Ozymandias" and in one other poem from "Power and conflict".', { lv: LV.lit30, look: ['Compared the poems throughout, not one then the other', 'Chose a strong second poem (e.g. My Last Duchess, London, Tissue, Storm on the Island)', 'Quotes from both poems', 'Analysed form and structure (sonnet, volta, enjambment, dramatic monologue)', 'Context: Shelley\'s Romanticism and dislike of tyranny', 'Both similarities AND differences'] }, { src: 'O', mins: 45 }],
    ['Unseen poetry', 'In "Remember", how does the poet present the speaker\'s feelings about being remembered after death?', { lv: LV.lit24, look: ['A clear answer about the speaker\'s feelings', 'Short, embedded quotes', 'Close language analysis', 'Form and structure: sonnet, the turn at "Yet"', 'Showed how the feelings change through the poem', 'A personal interpretation'] }, { src: 'R', mins: 30 }],
    ['Unseen poetry', 'In both "Remember" and "Sonnet 71" the speakers describe how they want to be remembered after death. What are the similarities and/or differences between the ways the poets present these feelings?', { lv: [[7, 8, 'Exploratory comparison of methods, with precise subject terms.'], [5, 6, 'Thoughtful comparison of methods and their effects.'], [3, 4, 'Relevant comparison of methods, with some explanation.'], [1, 2, 'Simple comments on methods in one or both poems.']], look: ['Compared METHODS, not just meanings', 'Quotes from both poems', 'Similarities and differences', 'Subject terms (sonnet, imperative, rhyme, volta, imagery)'] }, { src: ['R', 'S'], mins: 15 }]] },

  /* ---------------- Geography ---------------- */
  { id: 'g1', g: 'Geography', subj: 'Geography', name: 'Geography practice paper 1 (physical environment)', mins: 50, qs: [
    ['Natural hazards', 'Define the term "natural hazard".', ['A natural event that threatens (or causes) loss of life or damage to property']],
    ['Natural hazards', 'Give two reasons why people continue to live in areas at risk from tectonic hazards.', { any: ['Fertile soils from volcanic ash, good for farming', 'Jobs, e.g. tourism, mining or geothermal energy', 'Family and friends live there / they have always lived there', 'They cannot afford to move', 'They trust monitoring, prediction and protection'], max: 2 }],
    ['Natural hazards', 'Explain how plate movement at a destructive plate margin can cause earthquakes.', ['An oceanic plate moves towards a continental plate', 'The denser oceanic plate is subducted beneath the continental plate', 'Friction makes the plates stick, so pressure builds up', 'The pressure is released suddenly, sending out shock (seismic) waves']],
    ['Natural hazards', 'Describe the global distribution of tropical storms.', { any: ['Between about 5° and 30° north and south of the equator', 'Over warm oceans (at least 27 °C)', 'Named areas, e.g. Caribbean, Gulf of Mexico, south-east Asia, northern Australia'], max: 2 }],
    ['Natural hazards', 'Using named examples, evaluate how far the effects of a tectonic hazard depend on the level of development of the country it happens in.', { lv: LV.geo9, look: ['Named real examples (e.g. Chile 2010 and Nepal 2015)', 'Facts and figures: deaths, costs, places', 'Primary AND secondary effects', 'Linked effects to wealth: building quality, emergency services, preparation', 'Considered other factors: magnitude, depth, time of day, population density', 'A clear judgement ("to a large extent, because…")'] }, { mins: 12 }],
    ['Weather and climate', 'Give two pieces of evidence for climate change.', { any: ['Global temperatures have risen since the early 1900s', 'Ice sheets, glaciers and Arctic sea ice are shrinking', 'Sea levels have risen', 'Ice cores, tree rings or historical records', 'Seasonal changes, e.g. earlier flowering or migration'], max: 2 }],
    ['Weather and climate', 'Explain two ways the causes of climate change can be reduced (mitigation).', ['Way 1 named: e.g. renewable energy, carbon capture, planting trees, international agreements', 'Way 1 explained: how it cuts or removes carbon dioxide', 'Way 2 named (a different way)', 'Way 2 explained']],
    ['The living world', 'Describe one way that plants are adapted to the tropical rainforest.', ['Named adaptation, e.g. drip-tip leaves, buttress roots, lianas, thin bark', 'How it helps, e.g. drip tips shed heavy rain to stop rot; buttress roots support tall trees in shallow soil']],
    ['The living world', 'Explain why deforestation in tropical rainforests can lead to soil erosion.', ['Trees are removed, so there are no roots to hold the soil or canopy to intercept rain', 'Heavy rainfall washes the exposed soil away']],
    ['The living world', 'Using a named example, explain the causes of deforestation in a tropical rainforest.', { lv: LV.geo6, look: ['Named example (e.g. the Amazon or Malaysia)', 'Several causes: logging, cattle ranching, farming, mining, roads, energy (HEP), population pressure', 'Each cause explained, not just listed', 'Specific facts or figures from the example'] }, { mins: 8 }],
    ['Coasts and rivers', 'Explain how longshore drift moves sediment along a coast.', ['The prevailing wind makes waves approach the beach at an angle', 'The swash carries sediment up the beach at that angle', 'The backwash carries it straight back down (gravity)', 'This zig-zag moves sediment along the coast']],
    ['Coasts and rivers', 'Give one advantage and one disadvantage of using a sea wall to protect a coast.', ['Advantage: stops erosion / protects buildings / can act as a promenade', 'Disadvantage: expensive / unattractive / reflected waves can erode its base']],
    ['Coasts and rivers', 'Explain how a waterfall is formed.', { lv: LV.geo6, look: ['A band of hard rock lies over softer rock', 'The soft rock erodes faster (hydraulic action, abrasion), making a step', 'A plunge pool forms beneath', 'An overhang of hard rock develops and collapses', 'The waterfall retreats upstream, leaving a gorge', 'Correct terms in a logical sequence'] }, { mins: 8 }]] },
  { id: 'g2', g: 'Geography', subj: 'Geography', name: 'Geography practice paper 2 (human environment)', mins: 45, qs: [
    ['Urban issues', 'Define the term "urbanisation".', ['An increase in the percentage of people living in towns and cities']],
    ['Urban issues', 'Give two push factors that cause rural–urban migration in lower-income countries.', { any: ['Lack of jobs or low pay in farming', 'Poor services: schools, healthcare, clean water', 'Natural disasters, drought or crop failure', 'Conflict or war'], max: 2 }],
    ['Urban issues', 'Explain two challenges caused by rapid urban growth in a lower-income or newly emerging country.', ['Challenge 1, e.g. squatter settlements, traffic, waste, pollution, informal jobs', 'Developed, e.g. homes without clean water or sanitation spread disease', 'Challenge 2 (a different challenge)', 'Developed']],
    ['Urban issues', 'Using a named UK city, explain how urban regeneration has improved the city.', { lv: LV.geo6, look: ['Named UK city (e.g. Bristol, Liverpool, London)', 'A named regeneration project or area', 'Social improvements', 'Economic improvements (jobs, investment)', 'Environmental improvements', 'Specific place names and facts'] }, { mins: 8 }],
    ['Changing economic world', 'Name one measure of development.', { any: ['GNI per head, birth rate, death rate, infant mortality, life expectancy, literacy rate, HDI, people per doctor, access to safe water'], max: 1 }],
    ['Changing economic world', 'Explain two physical causes of uneven development.', ['Cause 1, e.g. landlocked, extreme climate, natural hazards, few raw materials', 'Developed: how it holds development back', 'Cause 2 (a different cause)', 'Developed']],
    ['Changing economic world', 'Describe one strategy used to reduce the development gap.', ['Named strategy: aid, fair trade, debt relief, microfinance, tourism, investment, intermediate technology', 'How it helps close the gap']],
    ['Changing economic world', 'Evaluate the advantages and disadvantages of transnational corporations (TNCs) for a lower-income or newly emerging country, such as Nigeria.', { lv: LV.geo9, look: ['Named country and TNC (e.g. Shell or Unilever in Nigeria)', 'Advantages: jobs, skills, investment, infrastructure, tax', 'Disadvantages: low wages, profits leave the country, pollution such as oil spills', 'Specific facts or examples', 'Weighed advantages against disadvantages', 'A clear judgement'] }, { mins: 12 }],
    ['Resource management', 'Give two reasons why demand for water in the UK is increasing.', { any: ['A growing population', 'More water-using appliances (showers, dishwashers, washing machines)', 'Demand from industry and farming', 'Lifestyle changes'], max: 2 }],
    ['Resource management', 'Explain why water is transferred from one part of the UK to another.', ['The north and west have more rain and fewer people (water surplus)', 'The south and east have more people and less rain (water deficit)', 'So water is moved from areas of surplus to areas of deficit', 'Example or method, e.g. reservoirs, pipelines or rivers (such as Kielder Water)']],
    ['Resource management', 'Explain how the UK\'s energy mix has changed.', { any: ['Much less coal is used; coal power stations have closed', 'More renewable energy, especially wind and solar', 'Gas is a major source of energy', 'Reason: to cut carbon emissions and meet climate targets', 'Reason: North Sea oil and gas are running down, so more energy is imported'], max: 4 }]] },

  /* ---------------- Business ---------------- */
  { id: 'bs1', g: 'Business', subj: 'Business', name: 'Business practice paper 1 (Pedal & Pour)', mins: 45, src: { P: SRC_PEDAL }, qs: [
    ['Business in the real world', 'Which one of the following is a fixed cost for Pedal & Pour?\nA  Coffee beans\nB  Rent\nC  Cake ingredients\nD  Bike parts', ['B: Rent'], { src: 'P' }],
    ['Business in the real world', 'Identify two features of a partnership.', { any: ['Owned by 2 to 20 people', 'Usually unlimited liability', 'Partners share profits, decisions and the workload', 'Not a separate legal entity', 'May have a deed of partnership'], max: 2 }],
    ['Business in the real world', 'Explain one disadvantage to Tom and Aisha of running Pedal & Pour as a partnership.', ['Disadvantage, e.g. unlimited liability or disagreements between partners', 'Applied, e.g. if the business could not repay its £12,000 loan, they could lose personal possessions'], { src: 'P' }],
    ['Finance', 'Calculate Pedal & Pour\'s profit in 2025. Show your workings.', ['£156,000 − (£48,000 + £72,000)', '£36,000'], { src: 'P' }],
    ['Human resources', 'Explain one reason why high staff turnover is a problem for Pedal & Pour.', ['Reason, e.g. recruitment and training costs time and money', 'Applied, e.g. Aisha spends hours training new baristas instead of running the business, and new staff are slower at busy weekends'], { src: 'P' }],
    ['Human resources', 'Give two methods Pedal & Pour could use to motivate its staff.', { any: ['Financial: bonus, pay rise, commission, staff discount', 'Non-financial: training, praise, more responsibility, job rotation, team events', 'Offering contracts with guaranteed hours'], max: 2 }],
    ['Human resources', 'Analyse the impact on Pedal & Pour of employing staff on zero-hours contracts.', { lv: LV.bus6, look: ['Benefit: flexible; only pay staff when it is busy (weekends)', 'Drawback: staff feel insecure, are less motivated and leave (high turnover)', 'Chains of reasoning ("this means… which leads to…")', 'Applied to Pedal & Pour throughout (café, weekends, students)'] }, { src: 'P', mins: 8 }],
    ['Business operations', 'Explain one benefit to Pedal & Pour of providing good customer service.', ['Benefit, e.g. repeat customers, good reviews, word of mouth, can charge more', 'Applied, e.g. reviews already praise the friendly service, which attracts tourists'], { src: 'P' }],
    ['Business operations', 'Tom is deciding whether to buy a second coffee machine for £4,500. Should he buy it? Justify your answer.', { lv: LV.bus9, look: ['Used evidence from the case: weekend queues, £36,000 profit, £4,500 cost', 'For: faster service, more customers served, higher revenue', 'Against: cost, may need more staff, quiet weekdays', 'Chains of reasoning', 'A clear decision with a justification ("it depends on…")'] }, { src: 'P', mins: 12 }],
    ['Influences on business', 'Explain one way an increase in interest rates could affect Pedal & Pour.', ['Effect, e.g. higher repayments on the £12,000 bank loan, or customers have less to spend', 'Developed: lower profit, or less money to invest in the new coffee machine'], { src: 'P' }],
    ['Influences on business', 'Give two ways a business like Pedal & Pour could be more environmentally friendly.', { any: ['Reduce waste or recycle', 'Reusable cups or less packaging', 'Renewable energy', 'Local or sustainable suppliers'], max: 2 }]] },
  { id: 'bs2', g: 'Business', subj: 'Business', name: 'Business practice paper 2 (Glow Skincare)', mins: 45, src: { G: SRC_GLOW }, qs: [
    ['Finance', 'Calculate Glow\'s revenue last year.', ['£75,000'], { src: 'G' }],
    ['Finance', 'Calculate Glow\'s break-even output.', ['£30,000 ÷ (£15 − £5)', '3,000 jars'], { src: 'G' }],
    ['Finance', 'Calculate Glow\'s profit last year. Show your workings.', ['Total costs = £30,000 + (£5 × 5,000) = £55,000', 'Profit = £75,000 − £55,000 = £20,000'], { src: 'G' }],
    ['Finance', 'Explain one reason why the supermarket\'s payment terms could cause Glow a cash-flow problem.', ['Cash goes out to suppliers (within 30 days) before cash comes in from the supermarket (after 60 days)', 'So Glow may not have enough cash to pay its bills and may need an overdraft'], { src: 'G' }],
    ['Finance', 'Identify two sources of finance Priya could use to pay for extra stock.', { any: ['Retained profit', 'Bank loan', 'Overdraft', 'Selling shares (share capital)', 'Trade credit', 'Crowdfunding'], max: 2 }],
    ['Marketing', 'Identify the market segment Glow targets.', ['By age: 18 to 30-year-olds'], { src: 'G' }],
    ['Marketing', 'Explain one advantage to Glow of promoting its creams on social media.', ['Advantage, e.g. cheap, wide reach, targeted, two-way communication with customers', 'Applied: its 18 to 30-year-old customers use Instagram and TikTok'], { src: 'G' }],
    ['Marketing', 'Analyse how Glow could use the marketing mix to compete with bigger brands.', { lv: LV.bus6, look: ['Product: natural ingredients as a unique selling point', 'Price: a premium price justified by quality', 'Place: online plus independent shops', 'Promotion: influencers on social media', 'Chains of reasoning', 'Applied to Glow throughout'] }, { src: 'G', mins: 8 }],
    ['Marketing', 'Should Priya accept the supermarket\'s offer? Justify your answer.', { lv: LV.bus9, look: ['Used the numbers: £8 − £5 = £3 profit per jar, against £10 now', 'For: far higher sales volume and brand awareness in 300 stores', 'Against: lower profit per jar and a cash-flow gap', 'Risk: losing the independent, natural image, or depending on one buyer', 'A clear decision justified with "it depends on…"'] }, { src: 'G', mins: 12 }],
    ['Influences on business', 'Explain one way consumer law affects Glow.', ['Products must be safe, as described and of satisfactory quality', 'So Glow must test its creams and label ingredients accurately, which adds cost'], { src: 'G' }],
    ['Influences on business', 'Explain one benefit to Priya of Glow being a private limited company.', ['Limited liability', 'So Priya can only lose the money she invested, not her personal possessions, if Glow fails'], { src: 'G' }]] },

  /* ---------------- RE ---------------- */
  { id: 're1', g: 'RE', subj: 'RE', name: 'RE practice paper 1 (Christianity)', mins: 50, qs: [
    ...reSet('Christianity: beliefs',
      ['Which one of the following is the Christian belief that God became human in Jesus?\nA  Atonement\nB  Incarnation\nC  Resurrection\nD  Trinity', 'B: Incarnation'],
      ['Give two Christian beliefs about life after death.', ['Heaven', 'Hell', 'Resurrection of the body', 'Judgement by God', 'Purgatory (Catholic belief)']],
      ['Explain two contrasting Christian beliefs about hell.', ['Belief 1: hell is a real place of eternal punishment', 'Developed, e.g. Jesus speaks of "everlasting fire" in the Parable of the Sheep and the Goats', 'Belief 2: hell is a state of separation from God, not a physical place', 'Developed, e.g. a loving God would not torture people forever; it is a choice to reject God']],
      ['Explain two Christian beliefs about the crucifixion. Refer to sacred writings or another source of Christian belief and teaching in your answer.', ['Belief 1, e.g. Jesus suffered and died, showing he was fully human', 'Developed', 'Belief 2, e.g. his death made up for human sin (atonement) and brings salvation', 'Developed', 'A relevant source, e.g. "Father, forgive them; for they know not what they do" (Luke 23:34) or John 3:16']],
      ['The Trinity is the most important Christian belief about God.', ['Teachings: the baptism of Jesus (Matthew 3), the Nicene Creed']]),
    ...reSet('Christianity: practices',
      ['Which one of the following is a sacrament?\nA  Pilgrimage\nB  Baptism\nC  Evangelism\nD  Prayer', 'B: Baptism'],
      ['Give two ways Christians celebrate Easter.', ['Church services on Good Friday and Easter Sunday', 'Holy Week events, e.g. Palm Sunday processions', 'Sunrise or vigil services; lighting the Paschal candle', 'Easter eggs as a symbol of new life', 'Fasting during Lent beforehand']],
      ['Explain two contrasting ways in which Christians worship.', ['Way 1: liturgical worship with set prayers and rituals, e.g. the Catholic Mass', 'Developed: gives structure and unites Christians worldwide', 'Way 2: non-liturgical or informal worship, e.g. Quaker silence or charismatic worship', 'Developed: allows a personal, spontaneous relationship with God']],
      ['Explain two reasons why prayer is important to Christians. Refer to sacred writings or another source of Christian belief and teaching in your answer.', ['Reason 1, e.g. it is how Christians talk to God and build a relationship with him', 'Developed', 'Reason 2, e.g. Jesus taught his followers to pray', 'Developed', 'A relevant source, e.g. the Lord\'s Prayer (Matthew 6:9–13) or "Pray without ceasing" (1 Thessalonians 5:17)']],
      ['Helping the poor is more important than going to church.', ['Teachings: the Parable of the Sheep and the Goats, the Good Samaritan, keeping the Sabbath holy']])] },
  { id: 're2', g: 'RE', subj: 'RE', name: 'RE practice paper 2 (Islam)', mins: 50, qs: [
    ...reSet('Islam: beliefs',
      ['Which one of the following is the Muslim belief in the oneness of God?\nA  Tawhid\nB  Risalah\nC  Akhirah\nD  Adalat', 'A: Tawhid'],
      ['Give two prophets who are important in Islam.', ['Adam', 'Ibrahim (Abraham)', 'Musa (Moses)', 'Isa (Jesus)', 'Dawud (David)', 'Muhammad']],
      ['Explain two contrasting beliefs held by Sunni and Shi\'a Muslims.', ['Sunni: leadership after Muhammad passed to a leader chosen by the community (Abu Bakr was the first caliph)', 'Developed, e.g. Sunni Muslims follow the Six Articles of Faith', 'Shi\'a: leadership should pass through Muhammad\'s family (Ali and the Imams)', 'Developed, e.g. Shi\'a Muslims follow the Five Roots of Usul ad-Din, including Imamah']],
      ['Explain two Muslim beliefs about angels. Refer to sacred writings or another source of Muslim belief and teaching in your answer.', ['Belief 1, e.g. angels are made of light and always obey Allah', 'Developed', 'Belief 2, e.g. Jibril revealed the Qur\'an to Muhammad; Mika\'il brings nourishment and rain', 'Developed', 'A relevant source, e.g. the Qur\'an (Surah 97, the Night of Power) or the Six Articles of Faith']],
      ['Belief in Akhirah (life after death) is the most important belief for Muslims.', ['Teachings: the Day of Judgement, the Six Articles of Faith, Tawhid as the foundation of all belief']]),
    ...reSet('Islam: practices',
      ['Which one of the following is the pillar of fasting?\nA  Zakah\nB  Sawm\nC  Salah\nD  Hajj', 'B: Sawm'],
      ['Give two things Muslims do during Hajj.', ['Wear ihram (simple white clothing)', 'Walk around the Ka\'aba seven times (tawaf)', 'Walk between Safa and Marwah', 'Stand on the plain of Arafat', 'Throw pebbles at pillars at Mina', 'Sacrifice an animal at Id-ul-Adha']],
      ['Explain two ways Muslims prepare for salah (prayer).', ['Way 1: wudu, ritual washing', 'Developed: to be spiritually and physically clean before Allah', 'Way 2: e.g. face the qiblah (towards Makkah), remove shoes, use a prayer mat, make niyyah (intention)', 'Developed']],
      ['Explain two reasons why zakah is important to Muslims. Refer to sacred writings or another source of Muslim belief and teaching in your answer.', ['Reason 1: it is one of the Five Pillars, a duty from Allah', 'Developed', 'Reason 2: it purifies wealth and helps the poor', 'Developed', 'A relevant source, e.g. the Qur\'an tells Muslims to "establish prayer and give zakah" (2:43)']],
      ['Ramadan is the most important time of the year for Muslims.', ['Teachings: Sawm as a pillar, the Night of Power, Hajj and Id-ul-Adha as alternatives']])] },
  { id: 're3', g: 'RE', subj: 'RE', name: 'RE practice paper 3 (families, and religion and life)', mins: 50, qs: [
    ...reSet('Relationships and families',
      ['Which one of the following means living together without being married?\nA  Adultery\nB  Cohabitation\nC  Divorce\nD  Polygamy', 'B: Cohabitation'],
      ['Give two religious purposes of marriage.', ['Lifelong companionship and commitment', 'Having children (procreation)', 'Raising children in the faith', 'A sacrament that reflects God\'s love (Catholic belief)', 'The right place for a sexual relationship']],
      ['Explain two contrasting religious beliefs about divorce.', ['Belief 1, e.g. the Catholic Church does not allow divorce because marriage is a lifelong sacrament', 'Developed, e.g. "What therefore God hath joined together, let not man put asunder" (Mark 10:9); annulment is possible instead', 'Belief 2, e.g. the Church of England and Islam allow divorce as a last resort', 'Developed, e.g. after attempts at reconciliation, it may be the lesser evil']],
      ['Explain two religious beliefs about the roles of men and women in the family. Refer to sacred writings or another source of religious belief and teaching in your answer.', ['Belief 1, e.g. men and women are equal, both made in God\'s image', 'Developed', 'Belief 2, e.g. traditional roles: men as providers, women as carers', 'Developed', 'A relevant source, e.g. "male and female created he them" (Genesis 1:27)']],
      ['The family is no longer important in modern society.', ['Teachings: "Honour thy father and thy mother", the family as the "domestic church"']]),
    ...reSet('Religion and life',
      ['Which one of the following is the belief that life is holy because it is God-given?\nA  Quality of life\nB  Stewardship\nC  Sanctity of life\nD  Dominion', 'C: Sanctity of life'],
      ['Give two ways religious people may help to protect the environment.', ['Recycling and reducing waste', 'Supporting environmental work by religious charities', 'Using renewable energy', 'Campaigning or protesting', 'Buying sustainable or local products']],
      ['Explain two contrasting beliefs about euthanasia.', ['Belief 1, e.g. most Christians and Muslims oppose it because of the sanctity of life: only God should take life', 'Developed', 'Belief 2, e.g. some Christians and humanists support it out of compassion and concern for quality of life', 'Developed']],
      ['Explain two religious beliefs about the origins of the universe. Refer to sacred writings or another source of religious belief and teaching in your answer.', ['Belief 1, e.g. God created the universe; some take Genesis literally (six days)', 'Developed', 'Belief 2, e.g. many accept the Big Bang as the way God created', 'Developed', 'A relevant source, e.g. "In the beginning God created the heaven and the earth" (Genesis 1:1)']],
      ['Animals are just as important as humans.', ['Teachings: dominion and stewardship (Genesis 1), humans made in God\'s image']])] },
  { id: 're4', g: 'RE', subj: 'RE', name: 'RE practice paper 4 (peace and conflict, crime and punishment)', mins: 50, qs: [
    ...reSet('Peace and conflict',
      ['Which one of the following is the belief that all violence is wrong?\nA  Just war\nB  Holy war\nC  Pacifism\nD  Retaliation', 'C: Pacifism'],
      ['Give two conditions of a just war.', ['A just cause, e.g. self-defence', 'Declared by a proper (legitimate) authority', 'Fought with the right intention', 'Used as a last resort', 'A reasonable chance of success', 'Proportional force; civilians not targeted']],
      ['Explain two contrasting religious beliefs about nuclear weapons.', ['Belief 1: most religious people oppose them because they kill innocent civilians indiscriminately', 'Developed: they break just war conditions and the sanctity of life', 'Belief 2: some accept them as a deterrent that keeps the peace', 'Developed: having them may stop a war from starting']],
      ['Explain two religious beliefs about forgiveness. Refer to sacred writings or another source of religious belief and teaching in your answer.', ['Belief 1: people should forgive others, as God forgives them', 'Developed', 'Belief 2: forgiveness leads to reconciliation after conflict', 'Developed', 'A relevant source, e.g. Jesus said to forgive "until seventy times seven" (Matthew 18:22)']],
      ['Religion is the main cause of war.', ['Teachings: "Blessed are the peacemakers" (Matthew 5:9), greater and lesser jihad']]),
    ...reSet('Crime and punishment',
      ['Which one of the following aims of punishment means paying the offender back for the crime?\nA  Deterrence\nB  Reformation\nC  Retribution\nD  Protection', 'C: Retribution'],
      ['Give two causes of crime.', ['Poverty', 'Upbringing or family problems', 'Mental illness', 'Addiction to drugs or alcohol', 'Greed', 'Hate', 'Opposition to an unjust law']],
      ['Explain two contrasting beliefs about the death penalty.', ['Belief 1, e.g. many Christians oppose it: the sanctity of life, the chance to reform, innocent people could be executed', 'Developed', 'Belief 2, e.g. some Muslims and some Christians support it for the most serious crimes, e.g. Shari\'ah allows it for murder', 'Developed']],
      ['Explain two religious beliefs about the reformation of offenders. Refer to sacred writings or another source of religious belief and teaching in your answer.', ['Belief 1: everyone can change and be forgiven', 'Developed', 'Belief 2: believers should support prisoners, e.g. prison chaplains and Christian charities', 'Developed', 'A relevant source, e.g. "I was in prison, and ye came unto me" (Matthew 25:36)']],
      ['Prisons should focus on reforming criminals rather than punishing them.', ['Teachings: "an eye for an eye" (Exodus 21:24) against forgiveness and reform']])] }
);

/* Which practice topics fix marks lost on each exam topic. Key: "<paper group>|<question topic>". */
const EXAM_LINK = {
  'Maths|Rounding': ['rounding'], 'Maths|Fractions': ['frac-of', 'frac-add', 'frac-mul'], 'Maths|Percentages': ['pct-of', 'pct-incdec', 'pct-change'], 'Maths|Ratio': ['ratio-share', 'ratio-simp'],
  'Maths|Algebra': ['solve-1', 'solve-2', 'expand', 'substitute'], 'Maths|Sequences': ['nth-term'], 'Maths|Angles': ['angles'], 'Maths|Area': ['area'], 'Maths|Probability': ['prob'],
  'Maths|Number': ['negatives', 'bidmas'], 'Maths|Averages': ['averages'], 'Maths|Standard form': ['std-form'], 'Maths|Speed, distance, time': ['sdt'], 'Maths|Pythagoras': ['pythag'],
  'Maths|Circles': ['circles'], 'Maths|Compound interest': ['compound'],
  'Biology|Cell biology': ['b-cells', 'b-transport', 'd-b-cells', 'bc-mag'], 'Biology|Organisation': ['b-digestion', 'b-heart', 'b-plants', 'd-b-organisation'],
  'Biology|Infection and response': ['b-disease', 'b-immune', 'd-b-disease'], 'Biology|Bioenergetics': ['b-energy', 'd-b-energy'], 'Biology|Homeostasis': ['b-hormones', 'b-nerves', 'd-b-homeostasis'],
  'Biology|Inheritance and evolution': ['b-genes', 'd-b-genetics'], 'Biology|Ecology': ['b-ecology', 'd-b-ecology'],
  'Chemistry|Atomic structure': ['c-atoms', 'c-electrons', 'c-groups', 'd-c-atoms'], 'Chemistry|Bonding': ['c-bonding', 'd-c-bonding'], 'Chemistry|Quantitative chemistry': ['cc-mr', 'cc-pct', 'cc-conc', 'ce-balance'],
  'Chemistry|Chemical changes': ['c-reactions', 'd-c-changes', 'ce-word', 'ce-formula'], 'Chemistry|Energy changes': ['c-rates', 'd-c-energy'], 'Chemistry|Rates': ['c-rates', 'cc-rate', 'd-c-energy'],
  'Chemistry|Organic chemistry': ['c-organic', 'd-c-organic'], 'Chemistry|Chemical analysis': ['c-tests', 'c-separation', 'cc-rf'], 'Chemistry|Atmosphere': ['c-atmos', 'd-c-organic'], 'Chemistry|Resources': ['c-atmos'],
  'Physics|Energy': ['pr-energy', 'p-ke', 'p-gpe', 'p-power-e', 'd-p-energy'], 'Physics|Electricity': ['pr-electric', 'p-ohm', 'p-charge', 'p-power-vi', 'p-energy-pt', 'd-p-electric'],
  'Physics|Particle model': ['pr-particles', 'p-density', 'd-p-particles'], 'Physics|Radioactivity': ['pr-particles', 'd-p-particles'],
  'Physics|Forces': ['pr-forces-waves', 'p-weight', 'p-newton2', 'p-accel', 'p-spring', 'd-p-forces'], 'Physics|Waves': ['p-wave', 'pr-forces-waves', 'd-p-waves'], 'Physics|Magnetism': ['pr-forces-waves', 'd-p-waves'],
  'English Language|Retrieval': ['el-papers'], 'English Language|Language analysis': ['el-devices', 'd-el-terms'], 'English Language|Structure': ['el-devices', 'd-el-terms'],
  'English Language|Evaluation': ['el-papers'], 'English Language|Summary': ['el-papers'], 'English Language|Comparison': ['el-papers'], 'English Language|Writing: content and organisation': ['d-el-terms'],
  'English Literature|Macbeth': ['lit-macbeth', 'q-mac'], 'English Literature|A Christmas Carol': ['lit-acc', 'q-acc'], 'English Literature|Journey\'s End': ['lit-je', 'q-je'],
  'English Literature|Power and Conflict poetry': ['lit-poems', 'd-lit-terms'], 'English Literature|Unseen poetry': ['d-lit-terms'],
  'Geography|Natural hazards': ['g-tectonics', 'g-weather', 'd-g-terms'], 'Geography|Weather and climate': ['g-weather'], 'Geography|The living world': ['g-living'],
  'Geography|Coasts and rivers': ['g-coasts-rivers'], 'Geography|Urban issues': ['g-urban', 'gc-density'], 'Geography|Changing economic world': ['gc-natinc', 'd-g-terms'], 'Geography|Resource management': ['d-g-terms'],
  'Business|Business in the real world': ['bs-enterprise', 'd-bs-terms'], 'Business|Finance': ['bs-finance', 'bz-profit', 'bz-breakeven', 'bz-margins', 'bz-cash'],
  'Business|Human resources': ['bs-ops-people'], 'Business|Business operations': ['bs-ops-people'], 'Business|Influences on business': ['bs-external'], 'Business|Marketing': ['bs-marketing'],
  'RE|Christianity: beliefs': ['r-chr-beliefs', 'd-r-chr'], 'RE|Christianity: practices': ['r-chr-practice', 'd-r-chr'], 'RE|Islam: beliefs': ['r-isl-beliefs', 'd-r-isl'],
  'RE|Islam: practices': ['r-isl-practice', 'd-r-isl'], 'RE|Relationships and families': ['r-themes', 'd-r-themes'], 'RE|Religion and life': ['r-themes', 'd-r-themes'],
  'RE|Peace and conflict': ['r-themes', 'd-r-themes'], 'RE|Crime and punishment': ['r-themes', 'd-r-themes']
};
