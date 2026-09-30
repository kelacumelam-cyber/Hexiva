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


## V37.1 general gameplay audit fixes

General consistency audit found and fixed:
- Generator route validation now treats missing physical footprint cells as immediate cliffs, exactly like runtime movement.
- This removes a generator/runtime physics mismatch around concave boards and internal true gaps.
- Hammering one member of a linked pair now explicitly removes the link relationship and visual, leaving the surviving member as a normal playable block instead of a half-linked stuck state.
- Bomb processing deduplicates linked-pair cleanup and removes affected pair relationships from active state.


## V37.2 bomb tuning + UI localization

- Bottom booster labels localized to Turkish: ÇEKİÇ, DÖNDÜR, BOMBA.
- Bomb changed from area-of-effect to single-target behavior.
- Bomb now removes only the selected playable block.
- If the selected block belongs to a linked pair, the link is detached first and the surviving block remains a normal playable block.
- Fixed obstacles remain unaffected.


## V38 deterministic difficulty + generator audit checkpoint

Difficulty is now intentionally non-linear and deterministic:
- tutorial: opening levels only,
- relaxed: ~18%,
- normal: ~50%,
- hard: ~26%,
- very hard: ~6%.

Hard / very-hard profiles:
- prefer deeper reverse-construction dependency routes,
- favor board-internal route dependencies over easy direct cliff exits,
- use denser two-mechanic combinations in Generator V2 when placement permits.

Relaxed profiles:
- prefer lighter dependency routes,
- use cleaner/no-mechanic or single-mechanic boards more often.

The visible-arrow contract and solvability-first reverse construction remain unchanged.

Generator audit telemetry added:
- difficultyProfile,
- clearanceWaveCount,
- maxClearanceWaveSize,
- solvabilityStalled,
- existing initial-clear/direct-cliff/trivial-escape metrics remain.

A development helper `window.__hexivaAuditCatalog(start,end)` can scan deterministic generated levels without rendering them and reports stalled levels plus suspiciously easy hard-profile levels.


## V38.1 exhaustive catalog audit semantics

The generator audit was executed across levels 1-1000 after V38.

Observed profile counts:
- tutorial: 4
- relaxed: 193
- normal: 490
- hard: 253
- very hard: 60

Hard-profile quality check:
- no hard/very-hard level matched the "suspiciously easy" heuristic,
- examples include very deep dependency chains (20+ clearance waves),
- level 619: 39 blocks, 29 clearance waves, ~7.7% initially clear, redirect + swap,
- level 673: 36 blocks, 27 clearance waves, ~5.6% initially clear, redirect + obstacle.

Audit clarification:
- level 33 was flagged by the route-only simulator because it is an authored swap-dependent puzzle,
- route-only simulation does not activate swap/cycle mechanisms,
- audit telemetry now separates mechanism-dependent stalls from true route stalls so these are not reported as generator failures.


## V39 prosperity background checkpoint

A first static environment background was added:
- bright blue-to-warm horizon sky,
- soft distant cloud shapes,
- warm sunlight accent,
- several distant floating green islands with rock undersides,
- subtle terrace / garden / clean-architecture cues for a prosperity feel,
- center readability veil keeps the puzzle area visually quiet.

Performance constraints:
- one static inline SVG layer only,
- no background animation or requestAnimationFrame work,
- no new CDN or image dependency,
- pointer-events disabled on the background,
- Three.js canvas now renders with transparent alpha over the static background.

The board, camera, gameplay, touch handling, HUD and mechanics were not intentionally changed.


## V39.1 floating island tree refinement

Background islands were refined after visual review:
- removed the abstract icon-like pavilion shapes,
- replaced simple green circles with small tree silhouettes using trunks and clustered foliage,
- added several trees across the distant islands,
- kept all decoration static and inline SVG to preserve mobile performance.


## V40 portrait phone polish checkpoint

Mobile portrait is now explicitly treated as the product target rather than the desktop preview.

UI:
- added phone-specific HUD sizing for <=430px and <=360px widths,
- compacted coin / level / restart controls on narrow phones,
- compacted utility buttons and audio control,
- compacted the 3-booster row while preserving distinct touch targets,
- added explicit fixed utility-card sizing instead of relying on wide-screen appearance.

Board fitting:
- phone portrait gets its own visual safe corridor between the top utility strip and bottom boosters,
- large boards may scale below the former 0.72 floor when a narrow phone truly needs it,
- minimum scale is 0.62 for typical portrait phones and 0.58 for <=380px widths,
- board vertical bias was tuned for the mobile-safe lane.

Desktop remains a preview/testing surface and is not the sizing authority.


## V40.1 animation + fallback polish

- edge escapes now get a tiny deterministic tip before the fall,
- pit drops stay straighter and slightly quicker than edge drops,
- fall spin is deterministic rather than random,
- blocked bump distance was reduced and impact squash tightened,
- local Tween fallback now implements Quadratic.InOut used by gameplay,
- utility labels localized: GÜNLÜK HEDİYE, DÜKKAN, ANA.


## V40.2 mobile long-session performance audit

Performance cleanup:
- WebGL rendering and per-frame gameplay visual updates now pause while the main menu covers the game.
- Existing hidden-tab and WebGL-context-loss pauses remain.
- Swap/cycle visual updates no longer allocate a combined temporary array every frame.
- Linked-pair visual updates reuse the requestAnimationFrame timestamp instead of calling performance.now each frame.
- Linked ring/clamp update loops avoid temporary fallback arrays.

These changes target battery, thermal load and garbage-collection pressure during long mobile sessions without changing gameplay visuals.


## V40.3 APK dependency cleanup

Removed Font Awesome as an external runtime dependency.
- restart, sound, menu, play, level-select and lock icons now use local Unicode/emoji,
- sound toggle updates text content instead of icon-library classes,
- obsolete sync-status icon class mutations were replaced by a no-op hook because the visible sync bubble had already been removed,
- one CDN/offline failure point is gone.


## V41 offline + Android packaging foundation

A non-destructive packaging path was added without changing the live GitHub Pages runtime:
- pinned local dependencies for Three.js 0.128.0, Tween.js 18.6.4, Tone.js 14.8.49 and Tailwind CSS 3.4.17,
- offline build script creates `dist/` and rewrites runtime CDN references to local vendor files,
- Google Fonts request is removed from the offline artifact,
- Capacitor Android 8.5.2 is pinned,
- Capacitor webDir points to `dist/`,
- Android generation/sync scripts rebuild offline assets before syncing,
- Android configuration script enforces portrait orientation on MainActivity,
- generated `dist/`, `node_modules/` and `android/` remain outside source control.

Current Android application ID is provisional: `com.hexiva.game`.


## V41.1 release artifact cleanup

The offline/APK build now strips development-only behavior without removing it from the live QA page:
- one-time +500 QA coin grant removed from release output,
- A/S desktop test shortcuts removed from release output,
- optional Firebase module removed from native release output; local save remains authoritative,
- build fails if known CDN/Firebase release tokens remain,
- source sanity verification script added.
