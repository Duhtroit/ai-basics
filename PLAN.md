# AI Basics, interactive course: plan v4 (scene-led)

Status: approved and implemented. This file records the interaction model; `README.md` explains how to run the course and `BUILD_REPORT.md` records the verification evidence.

## 1. Direction

The course is an **editorial lab**.

- Reading surfaces use warm paper (`#FAF8F4`), ink (`#14161A`), a 66 character measure and hairline rules.
- Interactive labs use graphite (`#0E1116`) so they read as instruments, not forms.
- Each of the eleven units has one accent from an OKLCH ramp at equal lightness and chroma. The weeks stay related and remain identifiable.
- Type is self-hosted and subset: a serif display face, a grotesk for interface text and a mono for formulas. There is no CDN request.
- The grid uses 8px spacing, twelve columns and 1px rules. One soft shadow is reserved for dragged objects.
- Icons are 1.5px line drawings. There are no emoji, glass effects or decorative gradients.
- Motion uses 120, 180 and 240ms tokens with one easing family. Motion explains a state change or keeps a spatial object continuous; it is not decoration.
- Every timed widget has play, pause, step, scrub and replay. With reduced motion the state changes instantly and the numeric trace remains.

## 2. Revised interaction model: scene-led rung 1

The revision makes the metaphor the first thing a student meets, not a chart below the prose.

- **Every concept opens with a playable scene.** There are 60 scenes, one per concept, keyed by concept id in `js/scenes.js`.
- A scene is the metaphor literally: its own pastel hue, family-friendly setting, a small cast of drawn props and one draggable actor. A pond has a stone and ripples; a hill has a walker and a slope; a kitchen has an oven and a dial.
- The student drags the actor, presses a scene-specific action, chooses a narrated beat, plays the scene or resets it. Each action changes the state and the readout. Scenery alone would not count as a metaphor.
- **The theme switches with the metaphor.** The scene exposes `--scene-bg`, `--scene-accent` and related values; the concept section takes the same tint. Moving between concepts visibly changes the palette, not only the illustration.
- **The metaphor set is family-friendly and deliberately basic.** Shops, kitchens, ponds, libraries, courtrooms, hills, workshops and stages are drawn from a small SVG vocabulary with high-contrast shapes. There is no course terminology in a rung 1 beat.
- **There is more visual material per concept.** Rung 1 is a scene with several props and a changing actor; the deeper mechanism and sandbox labs remain below it. The page now has 60 scenes, 64 deeper labs and 11 concept maps, for 135 lab hosts.
- **Rung 2 keeps the scene and exposes the real variables.** Rung 3 drops the scene and states what was removed. The mapping table before the interaction names each metaphor element, its concept element and what the student does.
- **Portrait recomposition.** At 560px and below the scene switches from the wide 720x260 composition to a 360x560 portrait composition. Props are rearranged into two readable columns around a vertical actor spine, the backdrop is redrawn for the tall frame, and the trace, beats, controls and captions stack below. The drawing is not uniformly shrunk. Touch targets remain at least 44px and the actor moves vertically under pointer drag and arrow keys.

## 3. Metaphor rule

1. Rung 1 is the metaphor, literally.
2. The isomorphism test: rename every label to its concept term and the behaviour must still make sense. Otherwise the metaphor is decoration and is replaced.
3. Metaphor decay: rung 1 is entirely metaphor; rung 2 keeps the setting and exposes real variables; rung 3 drops the setting with a visible note about what was removed.
4. A metaphor must be driveable: state, actions and feedback. Scenery is not a metaphor.
5. No metaphor, no build. A concept without a playable metaphor is blocked rather than shipped as a chart.
6. Metaphor sets are written per unit and mapped in the concept's table.

## 4. Course map

| Unit | Focus |
|---|---|
| 1 | Welcome, paradigms, math warm-up, Python |
| 2 | Perspectives, k-fold, metrics, loss, overfitting, research case |
| 3 | Linear regression, normal equation, gradient descent |
| 4 | Logistic regression, forward process, boundaries, thresholds, log loss |
| 5 | Neural warm-up, neurons, forward pass, backpropagation, training, depth |
| 6 | Twenty questions, entropy, ID3, C4.5, CART, bagging, boosting |
| 7 | CSP, backtracking, propagation, local search, modelling, tutorial |
| 8 | Probability, conditional probability, Bayes rule, Bayes nets, inference, explaining away |
| 9 | State, state spaces, grids, implicit graphs, frameworks |
| 10 | BFS, UCS, A*, heuristics, racing search strategies |
| 11 | Syntax, semantics, knowledge bases, resolution, chaining |

The delivered course has 60 concept pages across those eleven units. Each concept has two checks. Each unit has a twelve-item test in four formats: eight selected-response items, one numeric item, one ordering item, one spot-the-error item and one short-answer item with a three-point rubric. Each unit also has a bridge card set, a same-or-different set and a concept map.

## 5. Assessment

- **Unit tests use four formats.** Selected response checks recognition, numeric items check a calculation, ordering items check a procedure, spot-the-error items check a diagnosis, and short-answer items check explanation against a visible rubric.
- **Short answers are self-assessed.** The student writes an answer, ticks the rubric points it makes, and compares with a model answer. The test counts the item only when the answer is substantial and every rubric point is ticked.
- **Spot-the-error items show numbered steps.** The student clicks the step that is wrong, so the interaction is a diagnosis rather than a recall question.
- **Every unit carries same-or-different pairs.** Three claims about two course ideas ask whether the claim holds for both. A pair set mixes same and different answers.
- **Missed items enter the review queue.** Selected-response items return as answerable questions; numeric, ordering and short-answer items return with a reveal that shows the correct answer, the model answer and the explanation.

## 6. Per-widget acceptance

- Custom-styled controls, no default browser chrome on the main interactions.
- Keyboard operable with arrows, Home and End, visible focus and correct ARIA values.
- Feedback within 100ms for local state changes.
- Pointer drag with pointer capture, no layout shift and a measured 60fps budget on the two animated reference widgets.
- State survives navigation and has a reset.
- Touch targets at least 44px; mobile layouts recompose instead of shrinking.
- A "try this" prompt and a "what to notice" caption.
- A real outcome state and a way back.

## 7. Gates

- Phase 2 benchmark screens: cover, reading concept and lab, for approval before mass production.
- Every phase: screenshots at 1440, 1024 and 390; a recording of each new widget; and `scripts/smoke.mjs`, which mounts every widget, asserts a clean console and captures screenshots.
- Budget: shell under 300KB gzipped, at most 250KB per unit, 60fps on the search and backprop widgets. `scripts/measure_size.mjs` measures the gzipped shell (including the three fonts) and every unit page as loaded, and fails the gate if either limit is missed. The delivered shell is 140.6KB and the heaviest unit page is 189.6KB.
- Fonts: three local woff2 subsets under 120KB total, with no remote font, stylesheet or script request. The smoke run fails on any cross-origin request and requires exactly three local woff2 files.
- Reduced motion: every timed control presents its final state and numeric trace immediately. The smoke run checks the search, backprop, descent and scene controls with `prefers-reduced-motion: reduce`, and checks the CSS transition duration.
- State: the smoke run requires the search and backprop widgets to restore their step after navigating away and back, and to return to zero on reset. Scene state restoration, reset and play are checked separately.
- The mobile gate additionally requires all 60 scenes at 390, portrait viewBoxes, no clipped props, no prop-actor overlap, no scene/control overlap, 44px targets, and action, keyboard and drag advancing beats with ARIA in sync.

## 8. Implementation record

- 60 scene specifications and the renderer live in `js/scenes.js`; the app inserts the scene above the mapping and replaces the generic rung 1 chart.
- The palette and scene layer live in `css/course.css`; the script is loaded before `app.js` in `index.html`.
- The smoke gate drives 135 lab hosts at each of 1440x900, 1024x768 and 390x844. At 390 it exercises and captures every one of the 60 scenes.
- The cover and rail read a generated `content/manifest.js`. A unit route loads only that unit's prose file, widget file, the scene renderer and the map widget; the review queue and exam load all unit prose. The linter fails if the manifest is stale.
- The content linter enforces exactly one scene per concept, no orphan scenes, every unit test format, valid numeric and ordering answers, and three well-formed same-or-different pairs per unit.
- The smoke gate now renders and answers all 11 unit tests at 1440, requires 12 of 12 correct on each, and grades every same-or-different pair.
- Counts and current evidence are refreshed in `BUILD_REPORT.md`; artifact paths are listed in `README.md`.
