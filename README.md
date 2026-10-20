# Archeron

A GCSE mocks training app that opens on one thing: your next focus set, and exactly what to do in it.

- **Focus**: press Begin and the set's mission appears: questions, quote recall, essay or RE plans,
  English Language guides, your due mistakes, or a past-paper workflow. Sets tick themselves; rest starts automatically.
- **Learn**: 9 subjects, ~110 topics. Generated calculation drills (Maths, Physics, Chemistry, Biology,
  Business, Geography) with worked methods, ~400 recall facts as quick-tap questions, quote recall, and
  plan builders. Hard topics come back more often. Hide topics you don't study in Settings.
- **The Realm**: nine fog-covered regions (one per subject). Learning clears the fog and raises a castle in each;
  each region has a three-form boss fought with real questions. Daily contracts, a daily Hunt raced against your
  own ghost, a streak flame, chests, a bestiary, a skill tree, a story that unlocks weekly, a Vault of real-life
  rewards, a weekly rank and a rough grade forecast.
- **Profile**: name, emblem, title, stats, the lantern river, 21 tiered achievements, subject mastery.
- **Toolkit**: checklists with confidence ratings for every subject, past papers and trend chart,
  fix list, flashcards, weekly plan, settings.

Static site, no build step, no dependencies, no network calls. Progress lives only in this browser
(`localStorage` key `archeron-v2`); older data migrates automatically. Back up from Settings.

**Motion**: Settings → Motion. "Auto" follows the device's reduce-motion setting (Windows "Animation effects",
iOS "Reduce Motion"); "Full" turns every animation on.

## Files
- `index.html`: shell
- `styles.css`: look and layout; `transitions.css`: motion (see credits)
- `data.js`: plan, flashcard decks, checklists, icons
- `content.js`: recall banks, essay/answer prompts, English Language guides
- `guides.js`: topic explainers (idea, method, example, tip), video and site links
- `defs.js`: definitions (term, model answer, key points) for the definitions trainer
- `vocab.js`: 150 descriptive writing words (spelling, meaning, use in a sentence; also a flashcard deck)
- `defs2.js`: more definitions, including Maths, English and RE term sets (merged into `defs.js`)
- `chem.js`: chemistry formulae, naming, word equations and balancing (solver-checked)
- `exam.js`: Maths and Science practice papers with mark schemes
- `papers.js`: English, Geography, Business and RE papers with levels-based marking, original sources and per-subject method tips
- `learn.js`: question generators and answer checking (answers are computed, never hand-typed)
- `study.js`: 49 in-depth guides (Learn → All guides, and "Read" on each subject's lessons) and the revision-session planner (Focus → Choose something else)
- `desk.js`: computer layouts, exam hall mode, keyboard shortcuts, printable papers
- `seq.js`: "Put it in order" sequences (required practicals, processes, plots, timelines), each tied to a practice topic
- `slips.js`: mistake detective: names the classic slip behind a wrong number, fraction or expression answer
- `teach.js`: lessons (built into Focus sets, up to two new ones per subject per day), new facts shown before they are asked,
  step-by-step hints, and quick question types (fill the gap, match up, put in order). Wraps app.js functions; state in `S.tc`
- `check.js`: gap finder, grade tests, and exam questions by topic: the hand-written ones, then a bank built from definitions, facts, calculations and practicals (Easy, Medium, Hard by marks)
- `bites.js`: Seneca-style lessons: each section arrives in chunks that ask you to type a key term, pick between opposites, or finish a worked example; lessons end with an exam-style question
- `listen.js`: listen mode: reads a question, waits, reads the answer, using only voices built into the device
- `teach.css`: styles for the files above, plus the calmer Focus, Learn and subject-page layout
- `fx.js`: confetti bursts, count-ups, reveal overlays
- `fonts/`: self-hosted Bricolage Grotesque and Atkinson Hyperlegible Next (OFL)
- `app.js`: state, migration, views, actions
- `sw.js`: offline cache. **Bump `VERSION` on every release.**

## Credits
Several transitions are adapted from [Transitions.dev](https://transitions.dev) under the Transitions.dev
License (free transitions may be used and modified in personal projects). Each keeps its credit comment.

## Deploy
Push to GitHub; Pages serves `main` / root.
