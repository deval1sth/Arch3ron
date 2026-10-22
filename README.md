# Archeron

A GCSE mocks training app that opens on one thing: your next focus set, and exactly what to do in it.

- **Focus**: press Begin and the set's mission appears: a lesson, questions, quote recall, essay or RE plans,
  your due mistakes, or a past-paper workflow. Sets tick themselves; rest starts automatically.
- **Learn**: every subject in three tabs. Learn (interactive lessons and guides), Practise (generated
  calculations with worked methods, facts, definitions, quick question types) and Exam (exam questions by topic,
  Be the examiner). Hard topics and missed facts come back on a spaced schedule.
- **Mocks**: what to do next, predicted grades, timed papers, grade tests, Be the examiner (mark real-style
  answers against a mark scheme) and Mock-day memory (what you will still know on the day, with a top-up).
- **Stats**: sets, focus time, questions, papers and streaks by day, week, month or all time.
- **Toolkit**: set-up and profiles, plan, checklists, flashcards, fix list, settings and backup.

Static site, no build step, no dependencies, no network calls. Each profile's progress lives only in this
browser (`localStorage`); back up from Settings.

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
- `examiner.js`: Be the examiner: 110 original student answers with planted mistakes, mark schemes and annotated
  examiner marking, one examiner rule each (`exSelfTest()` checks every script against its own markup)
- `forecast.js`: Mock-day memory: each learned fact projected to the mock date with the FSRS-6 memory model, a
  forgetting curve, and a top-up of the facts that most need it. It also keeps the review log for calibration and
  the names of the topics you missed today (`S.tc.miss`) for the Rival page
- `rival.html`, `rival.css`, `rival-scene.js`, `rival.js`: the Rival page, a separate page (not linked from the
  app) where a copy of you lives your routine and studies in every free slot. It reads Archeron's saved progress
  on the device, never writes it, and works its day out from the clock, so it keeps going while closed
- `teach.css`: styles for the files above, plus the calmer Focus, Learn and subject-page layout
- `fx.js`: confetti bursts, count-ups, reveal overlays
- `fonts/`: self-hosted Bricolage Grotesque and Atkinson Hyperlegible Next (OFL)
- `app.js`: state, migration, views, actions
- `sw.js`: offline cache. **Bump `VERSION` on every release.**

## Credits
Several transitions are adapted from [Transitions.dev](https://transitions.dev) under the Transitions.dev
License (free transitions may be used and modified in personal projects). Each keeps its credit comment.

## Checks
Run in the browser console on the local preview before every release: `LEARN.selfTest()`, `CHEM.selfTest()`,
`BOARD.selfTest()`, `lessonSelfTest()`, `xqSelfTest()` and `exSelfTest()`. Each returns its problems; all should be empty.

## Deploy
Push to GitHub; Pages serves `main` / root.

## Copyright
© 2026 Runo304. All rights reserved. The code is visible here so the site can be hosted, but it may not be copied, reused or republished without permission.
