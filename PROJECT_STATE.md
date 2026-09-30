# PROJECT_STATE

Last updated: 2026-09-30

## Current checkpoint

The current playable baseline is `index.html`, at the V35.x productization stage under the final working name **Hexiva**.

Live GitHub Pages test URL:
https://kelacumelam-cyber.github.io/Hexiva/

The project is a mobile-first Three.js/WebGL puzzle game. The established visual identity and the visible-arrow movement contract must be preserved while release hardening continues.

## Fundamental movement rule

- Every playable hex has a visible arrow.
- A playable hex moves exactly in the direction shown by its arrow.
- A visible board mechanism may transparently redirect movement.
- Hidden or misleading direction behavior is forbidden.

## Approved presentation

- Strong top-down camera: `(0, 24, 9.5)`.
- 3D depth remains visible.
- Dynamic cast shadows are disabled because they harmed top-down readability.
- Board fitting keeps the puzzle between the top HUD and bottom boosters.
- Hex/block visual scale may shrink for larger layouts while touch interaction must remain comfortable.

## Implemented mechanics

- Internal true escape/drop pits.
- Traversable grey empty floor cells.
- Direction changer with visible double-chevron direction.
- Reversible two-arm swap mechanism on all three opposite hex-grid axes.
- Collision-return: a blocked hex visibly travels to the blocker and returns.
- Three-way cycle changer.
- Permanent fixed obstacle.
- Visibly linked pair requiring both members to be clear before simultaneous escape.

## Level system

- Levels are deterministic by level number.
- Restarting/replaying a level reproduces the same puzzle.
- Level number is identity, not monotonic difficulty.
- Difficulty may fluctuate naturally.
- Levels 1–4 retain tutorial-friendly behavior.
- Levels 1–34 preserve the authored/test ordering and approved mechanics.
- Level 35+ uses Generator V2.
- Generator V2 includes multiple topology families, internal floor/pit variation, deterministic mechanic placement, and reduced direct cliff-exit arrows.
- Current catalog ceiling is 1000 levels and is designed to expand later.
- The level selector renders a bounded preview instead of creating 1000 DOM buttons at once.

## Generator V2 topology families

- wide lens
- tall spine
- twin lobes
- offset/asymmetric mass
- zig-zag band
- stepped diamond
- large crescent
- compact maze

## Generator priorities

- Minimize repetitive neighboring layouts.
- Keep plain boards uncommon rather than mandatory.
- Encourage internal movement, dependency chains, collision-return, gaps, corridors, and varied density.
- Do not require every mechanic in every level.
- Greatly reduce blocks whose first arrow step exits directly off the board except where deliberately useful.
- Preserve solvability and the visible-arrow contract.

## Economy checkpoint

Current tuning values:
- starting coins: 0
- starting hammer: 1
- starting rotate: 1
- level completion reward: 25 coins
- hammer purchase: +1 for 75 coins
- rotate purchase: +1 for 50 coins
- daily gift: +25 coins, +1 hammer, +1 rotate, once per 24 hours
- unlimited debug coin faucet removed

These values are tuning checkpoints and may change after real-device playtesting.

## Persistence

- Local browser save is the reliable baseline using `localStorage` key `hexiva-save-v1`.
- Persisted state includes level, highest unlocked level, coins, boosters, and daily gift timestamp.
- Firebase/cloud persistence remains optional when configuration exists.
- A release build must not depend on Firebase availability in order to remain playable.

## Edge escape animation

- Internal pits: block falls vertically through the pit.
- Board edge: block travels fully clear of the cliff into the missing adjacent hex position, then falls vertically.
- It must not begin falling while visibly still supported by the board.
- It must not launch an arbitrary long distance beyond the cliff before falling.

## QA controls

Temporary desktop shortcuts:
- `A`: next level
- `S`: level 1

They must not unlock or persist real progression. They are temporary QA controls and should be disabled or gated in a release build.

## Web testing workflow

Default workflow:
1. Develop and validate a checkpoint.
2. Commit the complete `index.html` to `main`.
3. GitHub Pages republishes automatically.
4. User refreshes https://kelacumelam-cyber.github.io/Hexiva/
5. If stale, use Ctrl+F5.

Standalone HTML/ZIP delivery is only a fallback.

## Current known release work

Next engineering pass:
- enforce/prepare portrait-only Android presentation,
- audit Android phone viewport and safe-area behavior,
- audit WebGL memory/performance and crash risks,
- handle WebGL context loss/restoration gracefully,
- avoid unnecessary rendering/work while the tab/app is hidden,
- ensure external network/CDN failures do not make the game unusable,
- stress-check representative generated levels and mechanic combinations.

After that:
- release/debug separation,
- local bundling of external dependencies for standalone APK,
- final background and visual polish,
- Android packaging.


## V36 Android/mobile stability checkpoint

A release-hardening pass was applied before background work.

Portrait/mobile:
- the web build now shows a portrait-only rotation guard on coarse-pointer/mobile devices in landscape,
- desktop landscape testing remains available,
- gameplay UI now respects safe-area insets,
- dynamic viewport height and overscroll protection were added,
- final APK packaging must enforce portrait orientation natively in the Android manifest/activity configuration.

Performance:
- device pixel ratio is capped adaptively: lower-capability devices use at most 1.5 DPR; stronger devices at most 2.0,
- resize work is throttled to one animation frame,
- hidden tabs skip tween/visual/render work,
- cast shadows remain disabled.

GPU memory / crash hardening:
- per-level cloned materials are tagged and disposed when changing levels,
- per-level dynamically created linked-pair geometries are disposed,
- board level resources are explicitly cleared instead of only removing scene children,
- this addresses a real long-session GPU-memory leak risk.

WebGL recovery:
- context loss is handled explicitly,
- local progress is saved immediately,
- a recovery overlay is shown,
- after context restoration the page reloads from locally persisted state.

Network resilience:
- Firebase no longer uses static module imports,
- Firebase modules load only when cloud configuration actually exists,
- a Firebase/CDN failure cannot block the main game module when cloud persistence is unused,
- localStorage remains authoritative fallback.

Still pending for APK release:
- bundle Three.js, Tone.js, Tailwind output, icons/fonts and other external dependencies locally,
- native Android portrait lock,
- representative real-device thermal/FPS test,
- larger generated-level solvability/stress sweep.


## V37 booster + path correctness checkpoint

Gameplay bug fixed:
- route tracing now treats the first missing physical board cell as an immediate cliff,
- a block can no longer travel across a true gap and collide with a blocker located on another section beyond that gap,
- visible grey floor cells remain traversable and do not count as pits,
- explicit pit cells still cause immediate vertical falls.

Third booster added:
- Bomb is now the third limited booster,
- starting count: 1,
- shop price: 125 coins for +1,
- selecting Bomb then tapping a playable block removes the selected block and its immediately adjacent playable neighbors,
- fixed metal obstacles are not destroyed by the bomb,
- if a linked-pair member is caught in the blast, both linked members are removed so no half-linked state remains,
- bomb count is persisted locally and in optional cloud saves.
