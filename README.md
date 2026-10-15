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
- `study.js`: Study tab (49 in-depth guides) and the revision-session planner
- `desk.js`: computer layouts, exam hall mode, keyboard shortcuts, printable papers
- `fx.js`: confetti bursts, count-ups, reveal overlays
- `fonts/`: self-hosted Bricolage Grotesque and Atkinson Hyperlegible Next (OFL)
- `app.js`: state, migration, views, actions
- `sw.js`: offline cache. **Bump `VERSION` on every release.**

## Credits
Several transitions are adapted from [Transitions.dev](https://transitions.dev) under the Transitions.dev
License (free transitions may be used and modified in personal projects). Each keeps its credit comment.

## Deploy
Push to GitHub; Pages serves `main` / root.
