# Archeron

GCSE mocks training programme: daily sets on an editable weekly plan, a focus timer, streaks and XP,
score charts with trend projections, marks-lost analysis, flashcards, checklists and a mistakes redo loop.

Static site, no build step, no dependencies, no network calls. Progress lives only in this browser
(`localStorage` key `archeron-v2`). Old `nightwatch-v1` data is migrated automatically on first load.
Back up from the **Me** tab.

## Files
- `index.html`: shell (intro, header, nav)
- `styles.css`: all styling
- `data.js`: static content (plan, decks, checklists, icons)
- `app.js`: state, migration, views, actions
- `sw.js`: offline cache. **Bump `VERSION` on every release.**
- `manifest.json`, `icon.svg`, `icons/`: PWA install assets

## Deploy
Push to GitHub, then Settings → Pages → deploy from `main` / root.
