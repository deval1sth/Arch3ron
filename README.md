# Archeron

A GCSE mocks training app that opens on one thing: your next focus set, and exactly what to do in it.

- **Focus**: press Begin and the set's mission appears: questions, quote recall, essay or RE plans,
  English Language guides, your due mistakes, or a past-paper workflow. Sets tick themselves; rest starts automatically.
- **Learn**: 9 subjects, ~110 topics. Generated calculation drills (Maths, Physics, Chemistry, Biology,
  Business, Geography) with worked methods, ~400 recall facts as quick-tap questions, quote recall, and
  plan builders. Hard topics come back more often. Hide topics you don't study in Settings.
- **Voyage**: a river game unlocked by lanterns (finished sets). Boats and zones unlock as you study;
  knowledge gates ask questions for extra lives. Voyages are earned by sets, 10 right answers, or daily.
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
- `learn.js`: question generators and answer checking (answers are computed, never hand-typed)
- `game.js`: Voyage
- `fx.js`: embers, sparks, reveal overlays
- `app.js`: state, migration, views, actions
- `sw.js`: offline cache. **Bump `VERSION` on every release.**

## Credits
Several transitions are adapted from [Transitions.dev](https://transitions.dev) under the Transitions.dev
License (free transitions may be used and modified in personal projects). Each keeps its credit comment.

## Deploy
Push to GitHub; Pages serves `main` / root.
