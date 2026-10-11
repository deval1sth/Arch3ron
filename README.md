# Archeron

A GCSE mocks training app that opens on one thing: your next focus set.

- **Focus**: press Begin. When the set ends it ticks itself and your rest starts.
- **Learn**: generated practice with instant feedback and worked methods: Maths Foundation (25 topics),
  Physics equations (forwards and rearranged), and quote recall. Hard topics come back more often.
- **Journey**: lanterns for every set and relics for milestones. Nothing here can ever be lost.
- **Toolkit**: past papers and trend chart, fix list, checklists, weekly plan, flashcards, settings.

Static site, no build step, no dependencies, no network calls. Progress lives only in this browser
(`localStorage` key `archeron-v2`); old `nightwatch-v1` data is migrated automatically. Back up from Settings.

## Files
- `index.html`: shell
- `styles.css`: look and layout; `transitions.css`: motion (see credits)
- `data.js`: static content (plan, decks, checklists, icons)
- `learn.js`: question generators and answer checking (answers are computed, never hand-typed)
- `fx.js`: embers, sparks, reveal overlays
- `app.js`: state, migration, views, actions
- `sw.js`: offline cache. **Bump `VERSION` on every release.**

## Credits
Several transitions are adapted from [Transitions.dev](https://transitions.dev) under the Transitions.dev
License (free transitions may be used and modified in personal projects). Each keeps its credit comment.

## Deploy
Push to GitHub, then Settings → Pages → deploy from `main` / root.
