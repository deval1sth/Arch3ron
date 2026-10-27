# Archeron: rules for every agent

Three agents work in this repo at once: Claude Code, Codex and Antigravity. Read this file and `.sim/HANDOFF.md` before doing anything.

## The project
Archeron is Runo's offline GCSE revision PWA (mocks around 11 January 2027), live at https://deval1sth.github.io/Arch3ron/ from `main`.
Plain HTML/CSS/JS: no build step, no backend, no network calls, no chart libraries, no franchise assets. There is no node or python on this PC, so test in a browser (e.g. the local server on port 8765).

## Feature freeze (until Runo's real GCSEs end, about June 2027)
Runo's time goes on revising, not on new features. Until the real exams are over:
- Allowed: bug fixes, wrong content, and changes Runo asks for in their own subjects (Maths, Physics, Chemistry first). After the mocks, changes driven by what the mocks showed.
- Not allowed: new features from idea lists, new subjects or set texts, refactors, publishing work. Those wait for the stages in `.sim/PUBLISH-ROADMAP.md`.
- Before proposing anything, search the code for an existing version. Many "new" ideas (hint ladder, units checker, mistake reasons, put-in-order, exam hall) were already built.

## Working together
- `.sim/HANDOFF.md` is the shared notes file (kept out of git). Before starting, read it and add a line saying which files you are taking. When you finish, say what you changed and what is next.
- Never edit a file another agent has claimed in HANDOFF.md. If you need to, write a note there and wait.
- Never touch work that isn't yours (uncommitted edits, the untracked `tests/` folder). Don't revert, stash or "clean up" other people's changes unless you put them back exactly as they were.
- Git (`C:\Program Files\Git\cmd\git.exe`): `git pull --rebase` before starting and before pushing. Small commits, only your own files (`git add <files>`, never `git add -A`). Never force-push.
- Only commit or push when the task you were given says to.

## Rules that have broken the app before
- **One global scope.** All app scripts share one global scope and one ACT/CHG object, so a new top-level name can silently replace an existing one (this once broke every exam paper for weeks). Search every `*.js` for a name before adding it.
- **Parse-check every changed JS file** before committing: paste its text into `new Function(text)` in a browser console. A stray apostrophe in a single-quoted string ("Onur's") broke the live site once.
- **Button clicks go through `ACT`, file/select changes through `CHG`.** A handler in the wrong object does nothing.
- **Never use `confirm()` or `alert()`.** Browsers can switch them off. Use `sure(msg)` (tap twice) or buttons on the page.
- **Service worker.** When you change any file the app loads, bump `VERSION` in `sw.js` (and `beta/sw.js` for beta files). Check HANDOFF.md for the latest number so two agents don't pick the same one. When testing, unregister the service worker and clear caches before reloading, or you'll test old cached files.
- **Main first.** Edit the main app directly; Runo doesn't want changes staged in `beta/` any more, and `beta/` is no longer kept in sync. Main still has no friends feature: no FRIENDS/vFriends/fr* code.
- **Saved state.** New state lives in `S.tc` or needs a line in `normalize()`, or it is dropped on load.

## Tone and design rules (from Runo)
- The main app is calm: no streaks, rewards, games, penalties, "you failed" wording, or counters of what's left. Show progress that can never be lost.
- The one exception is the Daily streak: an opt-in switch on the Daily archive (`S.dailyStreak`, off by default) that Runo asked for. Don't add other streaks, and don't turn this one on by default.
- Keep the readiness %, grade predictor, mock countdown and Stats tab as they are.
- Quality bar is high: fluid, deliberate, polished. Runo mostly uses it on a PC.
- Onur (`rival*.html/js/css`) is personal to Runo. Never link him or Onur features into the main app. On his page, losses and wins are shown factually, never insulting. rival.js reads the app's state read-only; its own data lives only in localStorage `archeron-rival`.
- Content (questions, facts, quotes) must be accurate. If unsure, leave it out.
