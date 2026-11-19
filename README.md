# AI Basics, interactive course

A static course built from the 49 recordings, 39 slide decks and transcripts of AI Basics. Eleven units, sixty concepts, sixty playable metaphor scenes, 64 deeper mechanism and sandbox labs, and 11 unit maps. No framework, no runtime build step, no account, no tracking. A generated manifest lets each unit load only its own prose and widgets.

The approved plan and its scene-led revision are recorded in `PLAN.md`.

## Run it

Open `index.html` directly, or serve the folder:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Classic deferred scripts mean `file://` works too, but a local server is closer to the deployed site.

## Publish on GitHub Pages

1. Put this folder in a repository. The folder itself can be the repository root, or a subfolder such as `docs/`.
2. In the repository, open Settings, then Pages.
3. Set Source to "Deploy from a branch", choose the branch, and choose `/` (root) or `/docs` to match the folder.
4. Save. Pages serves `index.html`; there is no build command and no environment variables.

If the course lives at a project URL such as `https://name.github.io/repo/`, all paths are relative, so no base path change is needed.

## What is here

```
PLAN.md                    approved interaction model and scene-led revision
index.html                 shell, navigation, mount points
css/course.css             design tokens, layout, print, reduced motion
js/kit.js                  DOM/SVG/canvas controls, transport, storage
js/app.js                  hash router, renderer, checks, tests, exam, review, progress
js/scenes.js               one themed, playable metaphor scene per concept
js/widgets/01..11.js       deeper unit interactions, grouped by unit
js/widgets/connections.js  concept-map exercise
content/units/01..11.js    prose, metaphor maps, checks, mixed-format tests, pairs, maps
content/manifest.js        generated unit metadata used by the cover and router
content/glossary.js        terms and the concept that introduces each
content/_sources/slides/   extracted slide text used while writing
assets/fonts/              Fraunces, Inter and IBM Plex Mono subsets
scripts/lint_content.py    prerequisite, glossary, symbol, asset, manifest and copy checks
scripts/metrics.py         Flesch reading ease and jargon density per unit
scripts/build_manifest.mjs regenerates content/manifest.js from the unit files
scripts/measure_size.mjs   gzipped shell, per-unit page and font budget gate
scripts/smoke.mjs          Playwright gate: mounts every lab, captures screenshots and timings
scripts/motion.mjs         records one 10-second clip per widget and scene
artifacts/                 screenshots, frame timings and widget recordings from the gate
```

## Navigation and progress

Routes are hash based: `#/unit/3`, `#/unit/10/c/astar`, `#/review`, `#/exam`. A unit's prose and widget file load on demand, then its widgets mount as they approach the viewport. The cover and rail use `content/manifest.js`; the review queue and exam load all unit content because they draw from every unit.

Progress is stored under `aim.progress.v1` in `localStorage`: answered checks, unit test scores, the 1/3/7/16 review queue and the exam result. The cover has **Export progress** and **Import progress** buttons for a JSON file. Nothing leaves the browser.

## Editing content

Each concept is one object in `content/units/NN-*.js` with a fixed set of fields: use case, metaphor and mapping, idea, lecture citation, mechanics, optional rung 2 and rung 3 labs, failure modes, two checks, a connection prompt and a recap. Widgets self-register with `AIM.register('id', { mount(host, cfg) })`; `cfg.mode` is `rung1`, `rung2` or `rung3`.

A unit test has twelve items. Eight use `{ q, options, answer, explain }`. The other four declare a `type`: `numeric` adds a numeric `answer` and `tolerance`; `ordering` adds `items` in the correct order; `error` adds `steps` and the index of the wrong one; `short` adds a `rubric` and a `model` answer. A unit also has a `pairs` array of `{ a, b, claim, same, explain }` for the same-or-different exercise. The linter validates all of them.

After editing a unit, run `node scripts/build_manifest.mjs` to refresh `content/manifest.js`. The linter fails if the manifest and the unit files disagree. Rung 1 is the scene in `js/scenes.js`, keyed by concept id. A scene declares a hue, setting, actor, a small set of props, and a short narrated beat sequence. It renders a pastel scene with its own palette, a draggable actor, a scene-specific action, beat buttons and a play/replay/reset row. The scene replaces the concept's generic first widget; the mechanism and sandbox labs remain. To add a concept, add it to the matching content file and give it a scene and a mapping table. To add a term, add it to `content/glossary.js` at the concept that first introduces it, then run the linter.

## Checks

```
node --check js/app.js                     # repeat for each JS file
node scripts/build_manifest.mjs            # after content edits
python3 scripts/lint_content.py            # must print 0 errors
node scripts/measure_size.mjs              # shell and per-unit gzip budgets
python3 scripts/metrics.py                 # reading metrics table

# Playwright tooling lives in .verify and is never shipped with the site.
cd .verify
npm install --no-audit --no-fund playwright@latest
npx playwright install chromium ffmpeg
cd ..
node scripts/smoke.mjs                     # starts its own server on 8124
node scripts/motion.mjs                    # records all widgets and scenes, about 7 minutes
```

`scripts/smoke.mjs` drives Chromium at 1440x900, 1024x768 and 390x844. At each width it visits all eleven units, scrolls every lab into view so the real IntersectionObserver mounts it, and fails on any console error, uncaught exception, failed request, HTTP 4xx/5xx, horizontal overflow, or lab control under 44px. It asserts 135 mounted hosts per width: 60 scenes, 64 deeper mechanism/sandbox labs and 11 concept maps. At 1440 it presses the action in every one of the 60 scenes and requires a beat change, and checks keyboard and drag on a sample. At 390 it exercises the action, Home/ArrowRight and a vertical drag in every scene, audits the portrait viewBox, prop clipping, prop-actor overlap, control ordering and 44px targets, and captures all 60 mobile scenes. It writes 15 viewport screenshots and 120 scene captures, and measures frame timing on `bfs-wave` and `blame-flow` while stepping them every animation frame. It also checks scene state restoration after navigation, reset and play. After the viewport passes it starts every unit test, answers all 12 items through the real controls, requires 12 of 12 correct, and grades all three same-or-different pairs in every unit. A reduced-motion pass requires play to jump straight to the final frame with its numeric trace, and a persistence pass requires the search and backprop widgets to restore their step after navigation and reset. The run fails on any cross-origin request and requires exactly three local woff2 files. `scripts/motion.mjs` records one 10-second WebM per widget and per scene configuration at 960x600.

The linter checks that every prerequisite points backwards, every glossary term is introduced before use, every formula symbol appears in its symbol table, every referenced widget is registered, every concept has exactly one scene and no scene is orphaned, every local asset exists, and that no em dash, curly quote or listed filler phrase remains in the prose.

## Verification artifacts

A passing run leaves its evidence under `artifacts/`:

- `artifacts/screenshots/`  -  `1440-`, `1024-` and `390-` captures of cover, reading, lab, search and backprop, each at that real viewport.
- `artifacts/scenes/`  -  one capture per concept scene at 1440, one portrait capture of every scene at 390, and three desktop plus three mobile contact sheets for visual review.
- `artifacts/frame-timing/bfs-wave.json` and `blame-flow.json`  -  measured frames, average, p95, maximum and fps.
- `artifacts/motion/`  -  per-widget and per-scene `.webm` recordings plus `manifest.json` with the widget, unit and configuration of each clip.
- `artifacts/size.json`  -  the gzipped shell, home, per-unit, review/exam and font measurements.
- `artifacts/summary.json`  -  counts, screenshot names, timings, reduced-motion and persistence results, network origins and any problems from the last smoke run.

## Notes

- Text is written to be read from the start; terms are introduced before use and tracked in the glossary.
- Metaphors are the requested teaching device and are labelled as metaphors. Rung 1 is the scene, with no course terms in its beats; rung 2 exposes the real variables, rung 3 removes the scaffolding or sets a harder goal.
- Each scene has its own pastel palette and the concept section takes that accent, so the page changes theme as the metaphor changes.
- At 560px and below each scene recomposes into a portrait arrangement with two prop columns, a vertical actor spine and stacked controls; it does not shrink the wide illustration.
- Animations respect `prefers-reduced-motion`; every timed lab has play, step, scrub and replay.
- Formulas are live HTML and SVG, not screenshots.
- The lecture examples are cleaned from the course transcripts. Grounding references, kept as pointers rather than copied text, are Stanford CS221 and CS229, Berkeley CS188, MIT 6.034 and 3Blue1Brown.
