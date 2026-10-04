# PROJECT_STATE

Last updated: 2026-09-30

## Current checkpoint

The current source checkpoint is **V43**, under the working name **Hexiva**: `index.html` consumes a deterministic, offline-generated 1000-level puzzle catalog. See `docs/GENERATOR_V43.md` and the V43 history entry below for the current rules and validation status.

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
- Levels 1–4 are small constrained tutorials: at least two opening removals and two immediately unlocking actions, dependency depth at most five, at most two forced certificate steps.
- V43 rebaselines levels 1–1000; the former 1–34 authored/checkpoint layouts remain historical references rather than mandatory playable identities.
- Offline V43 construction uses the former topology library with real connectivity-preserving physical edits, strict same-direction limits, and mechanically necessary state transitions.
- Every playable entry passes rejection-based quality screening; the phone reads the audited catalog instead of searching candidates.
- Current catalog ceiling is 1000 levels and is designed to expand later.
- The level selector renders a bounded preview instead of creating 1000 DOM buttons at once.

## Original Generator V2 topology families (retained as construction seeds)

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


## V41.2 debug APK + physical test workflow

- Added cross-platform `npm run android:debug`.
- Command rebuilds/syncs offline assets and runs Gradle `assembleDebug`.
- Expected output path documented: `android/app/build/outputs/apk/debug/app-debug.apk`.
- Added a focused 15-20 minute physical Android acceptance checklist covering portrait layout, mechanics, persistence, offline launch, thermal behavior and long-session slowdown.


## V41.3 Windows Node 24 build compatibility

- Replaced `spawnSync npx.cmd` Tailwind invocation with direct execution of the local Tailwind CLI through `process.execPath`.
- Hardened debug APK Gradle invocation on Windows by routing `gradlew.bat` through `cmd.exe`.
- This avoids Node 24 Windows `spawnSync ... EINVAL` failures while keeping the build fully local/pinned.


## V41.4 robust release cleanup

The release builder no longer relies on fragile nested-brace regular expressions for QA/cloud stripping.
It now removes known source ranges using explicit start/end markers, which is more stable across formatting and Node versions.


## V41.5 Windows CRLF build fix

Root cause of the release-cleanup marker failure was Windows CRLF line endings in the local checkout.
The offline builder now normalizes `\r\n` to `\n` immediately after reading `index.html`, so release cleanup behaves consistently across Windows, macOS and Linux.


## V41.6 Windows Gradle wrapper quoting fix

The debug APK helper now invokes `gradlew.bat` from the Android working directory using `cmd.exe /c call gradlew.bat assembleDebug`.
This avoids nested-quote path parsing failures on Windows paths containing spaces.


## V41.7 Android SDK auto-detection

The Android configuration step now automatically creates `android/local.properties` when possible.
Detection order:
- `ANDROID_HOME`
- `ANDROID_SDK_ROOT`
- Windows: `%LOCALAPPDATA%/Android/Sdk`
- macOS/Linux conventional SDK paths

This removes the need for manual `sdk.dir` setup on standard Android Studio installations.


## V41.8 JDK 21 Android build detection

Debug APK builds now detect and use a JDK 21+ without requiring permanent Windows environment changes.
Detection includes:
- existing JAVA_HOME / JDK_HOME,
- Android Studio bundled JBR,
- installed JDK directories under Program Files/Java,
- Android Studio JBR on macOS.

The selected JDK is injected into the Gradle process only for the build.


## V41.9 Windows JDK vendor detection

The debug APK helper now detects JDK 21+ installations under `Program Files/Eclipse Adoptium` and also derives a JDK home from the `java` executable currently resolved by PATH.
This removes the previous vendor-directory blind spot that missed Temurin 21 even when `java -version` worked.


## V41.10 Java version stderr detection

JDK auto-detection now accounts for the fact that `java -version` writes its version banner to stderr even when the command succeeds.
The build helper probes both stdout and stderr before rejecting a detected JDK candidate.


## V41.11 APK input fix + release JS validation

Root cause of the first physical-device APK input failure was found in the offline release transform:
the Firebase-module removal replacement duplicated the opening of the main classic script, producing invalid JavaScript in the packaged HTML.
CSS still rendered active button states, but the game listener script never initialized.

Fix:
- retain the existing main script opening exactly once after removing the cloud module,
- parse-check all generated inline classic scripts during `build:web`,
- abort packaging immediately if release-only transformation introduces JavaScript syntax damage.


## V41.12 physical mobile HUD + typography fix

Physical-device testing revealed that the mobile utility-strip rule applied a left anchor to both utility groups. The right-side home strip therefore had both left and right anchors, stretching its interactive container across the screen and causing visual/control overlap and blocked taps.

Fixes:
- home-strip explicitly clears the inherited left anchor on phones,
- utility strips get an explicit interaction layer and touch-action manipulation,
- sound control keeps a 44px minimum touch target even on narrow phones,
- Fredoka / Google Fonts usage is removed from the source UI,
- typography now uses the native system mobile stack for a conventional mobile-game interface.


## V42 Level Quality Telemetry V1

Physical playtesting of the first 22 levels exposed a repeat/"tap to clear" problem that solvability alone does not catch.

Accepted level-design constraints now include:
- avoid long same-direction sweep chains,
- limit excessive free opening moves,
- detect repeated footprints across translation, rotation and reflection,
- prefer meaningful internal dependencies over raw block count,
- keep taught mechanics returning and combining,
- treat web playtesting as the final reality check for boredom/automation.

This batch intentionally does not add guessed rejection thresholds yet. It adds measurement first:
- canonical footprint fingerprint,
- same-direction adjacency and largest connected same-direction cluster,
- initially-clear ratio and opening direction diversity/dominance,
- trivial direct-escape ratio,
- catalog audit helper exposed as `window.__hexivaAuditCatalog(limit)`,
- repeat-family reporting with exact level numbers and minimum recurrence gap.

Next step: run the web/catalog audit, inspect the worst offenders and then turn the measured failure modes into generator candidate rejection/scoring rules.


## V42.1 Quality-ranked candidate generation + anti-repeat V2 schedule

The first 100-level telemetry audit confirmed the physical playtest complaint:
- several early non-tutorial levels had opening-direction dominance = 1.0,
- same-direction connected clusters reached 0.50 of the board,
- trivial direct escapes reached 0.50,
- canonical footprints repeated on adjacent levels in multiple families.

Changes:
- generator now produces multiple deterministic candidates per level (12 tutorial, 8 otherwise),
- candidates are ranked by a continuous quality penalty using opening-clear ratio, trivial escapes, same-direction clusters/adjacency and opening direction dominance,
- empirical red-zone penalties are based on the observed first-100 audit rather than arbitrary difficulty-by-block-count,
- solvability stalls are heavily penalized,
- six new asymmetric V2 footprint families were added,
- V2 pattern scheduling now avoids canonical rotation/mirror-equivalent footprints within a four-level recent window when alternatives exist,
- telemetry is bumped to version 2 and records the chosen generation attempt, candidates evaluated and quality penalty.

Legacy levels 1-34 keep their authored/test footprint identities for now, but their arrow layouts benefit from best-of-N candidate ranking. Levels 35+ receive both the quality-ranked arrow generation and the anti-repeat expanded footprint schedule.

Next validation:
- hard refresh the GitHub Pages web build,
- run `__hexivaAuditCatalog(100)`,
- compare repeat gaps, direction dominance, same-direction clusters and trivial escape ratios against the previous baseline,
- then physically/web-play the first 20-30 levels before tightening thresholds further.


## V42.2 Opening-choice quality fix

The post-V42.1 100-level audit showed that the anti-repeat footprint schedule worked for V2 levels (no adjacent V2 repeats; minimum recurrence gap moved to 5+ in the tested range), and trivial/direct-clear metrics improved. However, opening-direction dominance still hit 1.0 on several levels.

Root cause: the quality ranker penalized too many free moves, but did not strongly penalize too few meaningful opening choices.

Changes:
- candidate ranking now penalizes fewer than two initially-clear moves,
- if two or more openers exist but they all share one direction, a stronger penalty applies,
- full opening-direction dominance (>= 0.90) is heavily penalized,
- partial dominance (>= 0.70 with at least three openers) is also penalized,
- candidate search increased from 12/8 to 24 tutorial / 16 non-tutorial candidates.

This keeps the "easy != automatic" rule explicit: an opening should ideally present at least two plausible choices rather than a forced tap sequence.

Next validation: rerun the 100-level audit and inspect the top opening-dominance, clear, trivial-escape and same-direction-cluster offenders before changing topology further.


## V42.3 Structural opening diversification

The second post-ranking audit showed a persistent failure mode: several levels still had opening-direction dominance = 1.0 even after stronger scoring and more candidate attempts. This proved the issue was structural, not merely ranking-related.

Changes:
- after a candidate board is built, the generator now inspects opening routes on the full starting board,
- if fewer than two opening moves exist, it may safely reassign a non-protected block to an alternate direction that is already clear on the full board,
- if multiple openers exist but all point in the same direction, one suitable block is reassigned to a different full-board-clear direction,
- forced mechanic directions plus deliberate pit/redirect feeder arrows are protected from this repair,
- edits are restricted to routes that are already clear on the full starting board, so the repair cannot introduce a new dependency/deadlock; removing such a block earlier only frees space,
- telemetry now records `openingRepairCount`.

This is the first structural enforcement of the rule "easy != automatic": when geometry permits, the opening must present at least two playable choices and more than one direction.


## V42.4 Absolute same-direction cluster control

Web playtesting through levels 19, 20 and 24 showed that ratio-only cluster scoring still missed visually obvious sweep groups on larger boards. Level 20 exposed a six-block same-direction cluster: its board was large enough that the ratio did not look extreme, but the local visual repetition was still poor.

Changes:
- max same-direction connected cluster size is now penalized directly, not only as a board ratio,
- clusters above 3 receive escalating penalties,
- 5+ and 6+ clusters receive additional heavy penalties,
- non-tutorial candidate search increased to 24 candidates to give the ranker more alternatives.

Design intent:
- 3-block local groups may still appear naturally,
- 4-block groups should be uncommon,
- 5-6+ sweep groups should almost never survive candidate selection unless geometry leaves no better solvable option.

Next validation should focus on actual web play through levels 19-24 rather than another broad console audit first.


## V42.5 Same-direction cluster hard cap = 2

Web playtesting confirmed that even three connected blocks pointing the same direction still read as a sweep instruction. The accepted design rule is now stricter:

- maximum preferred connected same-direction cluster size: 2,
- any candidate with a 3+ cluster receives a near-rejection penalty,
- candidate selection now explicitly prefers cluster-compliant candidates (<= 2) over non-compliant ones,
- if no compliant candidate exists in the sampled pool, the generator still falls back to the least-bad solvable candidate instead of breaking generation,
- telemetry records `sameDirectionClusterCompliant` on the chosen level.

This turns the anti-sweep rule from a soft ratio preference into an explicit structural quality constraint.


## V42.6 Visual same-direction grouping + deploy marker

Further web playtesting showed that the connected-cluster metric still missed groups that humans perceive as one sweep group when same-direction arrows are separated by a single hex/gap.

Changes:
- added a radius-2 visual-neighborhood metric for same-direction arrows,
- any local visual neighborhood with 3+ same-direction blocks receives a near-rejection penalty,
- candidate selection now explicitly prefers levels that satisfy BOTH:
  - connected same-direction cluster <= 2,
  - radius-2 same-direction visual neighborhood <= 2,
- chosen-level telemetry records `sameDirectionVisualCompliant`,
- added `window.__hexivaDirectionViolations(limit)` to scan the catalog for remaining violations,
- added one-time QA deploy marker `V42.6`: +100 coins on first load of this build so testers can verify the latest GitHub Pages deployment is active rather than cached.

Reason:
The previous definition matched graph adjacency, but not human visual grouping. The rule is now based on what the player actually sees, not only on direct hex connectivity.


## V43 — constrained puzzle catalog and mechanical contribution

### Root causes and evidence

Baseline inspected: `main` commit `55ca8e3`, including the full PROJECT_STATE history, generator, runtime routes, swap/cycle transitions, linked removal, persistence and offline packaging.

- V42.6's selector used `bestCompliant || best`. A violating board was still shipped when its 24 samples had no compliant candidate. The old radius-2 audit found 817 violations across 1–1000.
- Player screenshot `image(20260930-140748).png` and source agree: level 43's five-arrow up-left row is `(0,-1)` through `(4,-1)`. It was detected as a five-stone violation and accepted anyway. The crop's approximate world projection and pixel/cell mapping are documented in `docs/GENERATOR_V43.md`.
- The level 43 wall is `(1,0)`; its neighbours point away, and the certificate records no wall route. Its swap at `(-1,-1)` is unnecessary. This is an actual construction defect, not evidence of a coordinate-conversion or cache bug.
- The baseline contribution audit found 339/340 nonfunctional walls, 239/240 unnecessary swaps, 200/200 unnecessary cycles, 198/429 nonfunctional redirects and 113/114 ineffective linked pairs. Counts are tied to the stated counterfactual criteria; they are not a subjective difficulty judgement.
- Permanent walls cannot create temporary dependencies by ordinary stone removal. Old peeling excluded wall-bound directions and did not reverse required positional transitions.
- The old route-only audit hid stalls whenever swap/cycle existed instead of proving a solution. Maximum dependency scoring also rewarded long forced chains. Its trivial-route probe could incorrectly keep tracing beyond a real cliff.

### Architecture and decisions

- Replaced runtime best-of-24 generation with an immutable complete catalog constructed offline from deterministic multiple candidates. This reduces phone work and ties the audit to the exact played data.
- Introduced a pure rule engine with joint linked removal, actual swap/cycle positions, visible redirects, first-gap escape and permanent obstacles. It searches state transitions with explicit node budgets; budget exhaustion is never proof of necessity.
- Arrow assignment is restricted to solvable peel routes **while** enforcing a conservative visual-group bound. No arbitrary direction-flip repair or noncompliant fallback remains.
- Screen grouping uses the actual flat-top mapping/camera projection, projected proximity, axial alignment across gaps/interleaved stones and transitive components. All full rearrangement orientations pass the <=2 cap. Under this conservative relation, ordinary removals cannot create a larger group.
- Swap/cycle puzzles reverse a solved positional state. Acceptance proves these operations are necessary by disabling them and solving again. Walls are combined with rearrangements and must change actual route clearance; individual redirects and links also need certified contribution.
- Real physical silhouette edits and best translated/rotated/reflected overlap screen recent layouts. Same V2 family, exact equivalents and >0.84 near-overlap are rejected within eight preceding levels.
- Candidate rejection reasons are recorded. Zero compliant candidates stops construction; it never populates a playable fallback. Atomic local checkpoints protect long generation across worker interruptions.
- Two construction optimizations preserve semantics: squared projected distances matched 390,625 geometric pairs; cached fixed route traces matched 429 complete candidate outputs (182 successfully constructed).
- The initial full audit passed the first screening bands but revealed a tutorial depth of 11 and 5–6 forced steps in several boards. Those were treated as real remaining weaknesses: tutorial depth was capped at five, two opening choices enforced from level 1, and certificate forced runs capped at four (two for tutorials). The final catalog is regenerated under these stricter gates.
- The existing presentation, visible-arrow movement, animation, boosters, coin rewards, save identity, highest unlock and 1000-level ceiling are preserved. Catalog layouts change once in this rebaseline; replay/restart of a given V43 number is fixed.

### QA deployment marker

Fresh key: `hexiva-qa-v43-20260930-c74f9e21`.
The web source adds exactly +100 to the player's loaded saved balance once per browser/profile. Historical +500/V42.6 grants are not replayed. A test verifies 275 -> 375 and no second-load grant. The offline/APK build strips the new grant/key and desktop QA controls.

### Validation and acceptance limits

Final automatic results and selected representatives are appended below after the stricter catalog is independently audited. Reports live in `docs/audits/`; `npm run audit:catalog` recomputes the proofs and compares every direction at solution/orientation states with the actual existing `checkCanTapAway` function.

The remote Chrome browser fails to create a WebGL context on unchanged V42.6 and again after one reload. V43 has **not** been claimed visually played in that browser. Real Three.js geometry construction with a renderer stub is a separate CPU smoke test, not a substitute for web/GPU gameplay acceptance. The audit screens structural quality; it cannot prove human perception or enjoyment.


### V43 final independent automatic audit (stricter catalog)

- All 1000 levels solve; zero proof-budget exhaustion and zero quality-gate violations.
- Maximum conservative visual group = 2; zero visual violations, including rearrangement orientations and certificate states.
- Zero same-family/exact/near-footprint repeats within the preceding eight levels. There are 14 distant exact repeats; minimum exact recurrence gap is 14.
- Zero excessive opening/trivial-escape ratios under the documented tutorial/normal bands.
- 248 redirects, 372 swaps, 248 cycles, 124 linked pairs and 248 obstacles; zero nonfunctional instances and zero unaffected walls. 38 walls affect multiple distinct stones; the other 210 affect one distinct stone. Repeated observations of one stone are not represented as multiple stone relationships.
- 1,419,150 route comparisons against the actual runtime `checkCanTapAway` all match.
- 397 levels have at least one solvable-state opening action whose premature removal strands the puzzle; zero unknown opening outcomes.
- Maximum certificate forced run = 4 (tutorial <=2). First-four opening counts are 2/3/2/3 and dependency depths 3/5/5/5.
- Average dependency depth is 4.5 in tutorials, 5.4 in 5–34, 5.62 in 35–100 and about 6.07 in 301–1000. Difficulty is not monotonic by level.
- 402,955 candidate evaluations; maximum search budget 6000. Per-candidate rejection categories can overlap. The recent-shape-or-family category explicitly covers the shared exact-equivalence/family screening gate.
- 12 tests passed, including actual runtime swap/cycle callback transitions on all supported axes, save-credit idempotence, first-gap/pit/obstacle/link/loop cases, deterministic construction, and scene construction/cleanup of all 1000 boards using real Three.js geometry with a renderer stub.
- Source verification passed (1000 entries and parsed inline scripts); offline web build passed and strips the new QA key/credit.
- Representative automated checks: 1, 13, 15, 19, 20, 24, 43, 163, 863, 936 and 1000. These are not claimed played in the blocked WebGL browser.
- Four-step forced segments and distant repeats remain explicitly visible. Current combinations are wall+swap, wall+cycle and redirect+swap; linked/rearrangement combinations await generalization of the coordinate-bound runtime link model.

Turkish review report: `docs/audits/V43_REPORT_TR.md`. The structural audit passes; real web/GPU perceptual acceptance remains open due to the documented browser limitation.


### V43 live-source deployment verification

- Code/catalog commit published to `main`: `50b451984bceb4a311dba6d256bf16c8ea4f8c9e`. The remote tree was checked against the tested local tree (`83b1806aa6b2a05251cd6197407edcfd708b806e`) and matched exactly.
- GitHub Pages returned HTTP 200 for `index.html`, `src/catalog.js` and `src/puzzle-engine.js`; all three responses match the tested local bytes exactly. This verifies publication rather than assuming a pushed commit is already live.
- Reloaded browser DOM includes both new local script URLs and the fresh `hexiva-qa-v43-20260930-c74f9e21` marker. The player-visible coin credit still cannot be observed here because renderer initialization fails first.
- Published V43 also produced `THREE.WebGLRenderer: Error creating WebGL context` in remote Chrome (2026-09-30T16:26:02Z). No V43 levels were visually played. Automated route/geometry proofs and live-source verification are separate from unresolved perceptual/GPU gameplay acceptance.

Live byte hashes:
- `index.html`: SHA-256 `da5cc410c634ce89f963480329851cf3ae3ea5fd69eca5a424a5ba69f787c3c9`.
- `src/catalog.js`: SHA-256 `2d9d023da7a19886dfdfbf446aac6654cf169dd6a743416d93e21b757d804e55`.
- `src/puzzle-engine.js`: SHA-256 `4bb6d20367c708a7d93e119d3bec7494399601d6d37329820e8571072063f874`.


## V43.1 — adaptive viewport fitting for tall catalog silhouettes

A live web screenshot exposed a presentation regression introduced by the broader V43 silhouette space: tall/narrow boards could overlap the top HUD and bottom booster row.

Root cause:
- `fitBoardToMobileViewport()` correctly calculated the scale needed to fit the board,
- then a fixed `minimumReadableScale` clamp (0.58–0.72) enlarged tall boards again and forced them outside the safe lane.

Fix:
- removed the fixed minimum-readable scale as a fitting constraint,
- the safe vertical lane is now derived from the actual rendered top HUD / utility controls and booster-row DOM rectangles,
- the board is scaled only as much as necessary to fit that live lane,
- after scaling, orthographic projection is solved for the exact X/Z translation required to centre the board in the safe lane,
- resize/orientation changes continue to re-run the same fit,
- `window.__hexaBoardFitStats` exposes current scale, board/safe bounds and a boolean `fits` for QA,
- a fresh one-time web QA marker `hexiva-qa-v43-fit-20260930-7c6a2f1d` adds +100 coins so deployment can be visually confirmed,
- offline/APK packaging strips all V43 QA marker constants as before.

This changes only presentation scale/placement; V43 puzzle topology, arrows, mechanics, catalog identity and solution logic are untouched.


## V43.2 - softer arrow contrast

Live web review showed that pure white arrows on saturated yellow blocks were visually tiring.

Changes:
- playable arrow fill changed from pure white to warm off-white,
- added a subtle dark blue-grey underlay beneath each playable arrow,
- underlay is slightly enlarged and lowered so it reads as a soft contour,
- outline is parented to the arrow mesh so runtime rotations stay synchronized,
- block palette and puzzle logic are unchanged,
- a fresh one-time QA build marker was added for deployment verification.

Goal: reduce glare on bright blocks, especially yellow and orange, while preserving readability on dark blocks.


## Temporary family-edition Turkish voice cheat

A temporary family-only voice shortcut was added for the user's mother's device.

Behavior:
- a small SES microphone button starts one-shot Turkish speech recognition,
- recognition language is tr-TR and checks multiple alternatives,
- acceptance is tolerant to a few natural variants but still requires the ordered core meaning:
  oglum -> seni -> cok -> seviyorum/seviyom,
- unrelated speech does not trigger the reward,
- one successful listening session grants +200 coins and +2 bombs,
- success message: "200 Altın ve 2 Bomba kazandın! ❤️",
- every new button press can be used again; one recognition session can reward only once,
- microphone permission errors and unsupported browsers show a user-facing hint,
- a fresh one-time QA deployment marker adds +100 coins on the web build,
- offline build cleanup strips all QA deploy-marker constants generically so later APK packaging does not fail.

This feature is intentionally temporary and should be removed in a later public update when requested.

## V43.3 — anne-grid chamber catalog expansion (1250 levels)

The requested broad chamber/grid design language is now integrated without replacing the existing 1000 V43 normal levels.

Catalog/layout:
- Final catalog size: **1250**.
- Existing **1000 V43 normal levels are preserved in relative order**.
- **250 anne-grid special levels** are interleaved through the final sequence.
- Every final 10-level block contains exactly **2 non-adjacent** anne-grid levels.
- The first four original V43 tutorial levels remain untouched; the first special levels are at final levels 5 and 9.
- Anne-grid chambers use eight genuinely distinct connected footprint families. Pairwise canonical near-overlap is regression-tested against the same Work threshold (<= 0.84).
- Large chamber footprints are deliberately sparse: meaningful floor gaps, pits and certified mechanics remain part of the playable structure rather than decorative fill.

Mechanics/generation:
- Supported special cadence uses proven combinations: redirect+swap, obstacle+cycle, obstacle+swap, swap, cycle, and redirect+swap recurrence.
- The rejected redirect+cycle pairing was removed from the production cadence after targeted feasibility probing showed poor reliable yield under the hard quality gates.
- No silent mechanic fallback remains. The recorded mechanic kind is the mechanic actually constructed.
- Anne-grid arrow assignment uses bounded backtracking while preserving the conservative same-direction visual-group cap.
- Recent family/near-footprint conflicts are screened before expensive construction, and future normal V43 neighbours are also checked so insertion cannot create a new last-8 near-repeat.
- Full generation is resumable through an on-disk checkpoint and fails closed if no compliant candidate is found.
- Preview promotion is hash-bound: the audited preview SHA-256 must exactly match the file being promoted.

Independent full preview audit supplied by the local QA run:
- **1250/1250** levels audited.
- **250/250** anne-grid levels present.
- qualityViolations = [].
- solvabilityStalls = [].
- visualViolations = [].
- nearFootprintRepeatsWithin8 = [].
- familyRepeatsWithin8 = [].
- nonfunctionalMechanisms = [].
- openingOutcomeUnknowns = [].
- anneGridCadenceViolations = [].
- Maximum conservative same-direction visual group = **2**.
- **1,881,402** runtime route parity comparisons completed with no reported mismatch.

Promotion/runtime regression:
- The audited preview was promoted to src/catalog.js: **1000 preserved normal + 250 special = 1250 total**.
- Local regression after promotion: **21/21 tests passed**.
- Real Three.js geometry (renderer stub) successfully constructed and cleaned up **all 1250 catalog boards**.
- The existing MeshLambertMaterial roughness console warnings remain non-fatal and pre-existing; they did not fail the regression suite.

Deployment QA:
- Fresh one-time web marker: hexiva-qa-anne-grid-20261001-0eda768.
- It adds exactly **+100 coins once per browser/profile** so the anne-grid deployment can be distinguished during live web QA.
- Offline/APK packaging already strips generic QA_DEPLOY_MARKER_* constants/grants.
- Human web/GPU playtest remains the final acceptance step; automated structural proofs do not replace perceptual gameplay review.


## V43.3.1 — Android microphone permission packaging fix

The V43.3 APK exposed the temporary Turkish voice button but its generated Android manifest did not contain `android.permission.RECORD_AUDIO`. As a result, Android had no declared dangerous microphone permission to request, so the system permission dialog never appeared.

Fix:
- `scripts/configure-android.mjs` now idempotently injects `RECORD_AUDIO` into the generated Capacitor Android manifest.
- `scripts/verify-source.mjs` now guards the packaging configuration against regression.
- The web speech recognition behavior in `index.html` is otherwise unchanged; the fix is intentionally limited to Android permission packaging.
- After rebuilding the APK, Android should be able to present the microphone permission dialog when the voice feature first requests access.


## V43.3.2 — Android native speech-recognition bridge

The Android permission-only fix was insufficient: the APK could declare `RECORD_AUDIO`, but the voice feature still relied on the browser `SpeechRecognition` API inside Android WebView. That path is not a reliable native speech-recognition/permission flow.

Fix:
- Added `@capacitor-community/speech-recognition@7.0.1`, which provides native Android speech recognition and explicit `checkPermissions()` / `requestPermissions()` methods.
- Android APK voice handling now prefers the native plugin, requests `RECORD_AUDIO` through the plugin, then performs the existing Turkish phrase matching.
- The existing Web Speech API remains as the browser fallback, so the live web build is not intentionally changed.
- The native call is one-shot and does not use partial results; this avoids unnecessary Android recognizer lifecycle complexity for the temporary family voice command.
- The previous manifest declaration remains in place as defense-in-depth.


## V43.3.3 — Capacitor 8 speech plugin compatibility correction

A compatibility review found that `@capacitor-community/speech-recognition@7.0.1` is a Capacitor 7 plugin, while Hexiva uses Capacitor 8. The community plugin repository still has an open Capacitor 8 support request, so it was not a safe dependency choice for the APK.

Correction:
- Removed `@capacitor-community/speech-recognition@7.0.1`.
- Switched to `@capawesome-team/capacitor-speech-recognition@8.1.1`, whose 8.x line explicitly targets Capacitor 8.
- The native API shape used by Hexiva (checkPermissions/requestPermissions/start with matches) remains the intended integration.
- The existing explicit `RECORD_AUDIO` manifest configuration remains as defense-in-depth.
- User must run `npm install` before the next APK build so `package-lock.json` and native Android plugin files are regenerated/synced.


## V43.3.5 — WebView getUserMedia permission trigger

The first-party native-plugin attempt was simplified after checking Capacitor's actual Android WebChromeClient implementation. Capacitor already handles WebView `AUDIO_CAPTURE` requests by requesting `RECORD_AUDIO` and granting/denying the WebView request.

The voice button now:
- calls `navigator.mediaDevices.getUserMedia({ audio: true })` first on Android/WebView,
- immediately stops the temporary audio track after permission is established,
- then starts the existing Web Speech recognition flow,
- keeps the browser fallback behavior intact,
- requires no third-party speech-recognition dependency.

This is deliberately smaller than adding a custom native speech plugin and uses the permission path Capacitor already provides.


## V43.3.6 — use native Android speech recognition for APK

The WebView `getUserMedia` permission trigger did not solve the device behavior. The APK needs a native speech-recognition path rather than depending on Android WebView's `SpeechRecognition` implementation.

Changes:
- Added `@capacitor-community/speech-recognition@7.0.1` back as the Android speech-recognition implementation.
- The plugin is used only when present in the native APK; the browser Web Speech API remains the web fallback.
- Android permission is requested through the plugin's `checkPermissions()` / `requestPermissions()` flow before recognition starts.
- Recognition uses Turkish `tr-TR`, up to five results, one-shot mode and no popup.
- The existing phrase matcher and reward logic are unchanged.
- The repository issue tracker shows the plugin currently has an open Capacitor 8 support request, but also documents real Android use with Capacitor 8. Therefore this is a deliberate compatibility-tested fallback rather than the earlier paid-plugin route. A future dedicated native implementation can replace it if necessary.


## V43.3.7 — remove stale custom Android bridge

The first-party bridge experiment left a generated `HexivaMicrophonePlugin.java` in the ignored `android/` tree. Its `PluginMethod` import was invalid for Capacitor 8, causing `:app:compileDebugJavaWithJavac` to fail with "cannot find symbol".

Resolution:
- The custom bridge is removed; it was unnecessary because the selected speech-recognition plugin already owns the native permission/recognition flow.
- `configure-android.mjs` now deletes any stale `HexivaMicrophonePlugin.java` and restores the generated Capacitor `MainActivity`.
- Source verification now fails if the stale custom bridge generation returns.
- The existing `RECORD_AUDIO` manifest declaration remains.


## 2026-10-04 — Bomb V2 checkpoint adayı
Yeni aile oynanış pass'i üç ayrı sıraya bölündü:
1. Bomb V2
2. collision-return V2
3. üç katmanlı hareket görseli

Bomb V2 kodlandı; sonraki fazlara henüz dokunulmadı.

Bomb V2 sözleşmesi:
- bomba artık renkli bloğa değil boş gri taban hücresine yerleştirilir,
- merkez hücrenin 6 kenar komşusundaki canlı oynanabilir bloklar hedeflenir,
- sabit engeller patlama hedefi değildir,
- merkez hücre doluysa bomba kullanılmaz,
- komşularda patlatılabilir blok yoksa bomba harcanmaz,
- linked pair üyesi patlamaya yakalanırsa yarım bağlı durum bırakmamak için çift ilişki güvenli biçimde çözülür ve canlı eş de blast hedeflerine dahil edilir,
- patlama merkezi kısa bir bomba/ring görseli ile okunur,
- booster/shop açıklaması yeni davranışa güncellendi.

Yeni tests/bomb-v2.test.cjs:
- tam 6 benzersiz komşu,
- komşuluğun simetrisi,
- runtime'ın boş taban + altı-komşu sözleşmesini kullanması.

Bu checkpoint test ve gerçek web oynanış doğrulaması bekliyor.


## 2026-10-04 — Bomb V2 test sonucu
Owner local full test sonucu:
- tests: 21
- pass: 21
- fail: 0
- all 1250 catalog boards construct/cleanup smoke passed.

Bomb V2 code/test checkpoint green. Real GitHub Pages gameplay smoke is next acceptance gate.


## 2026-10-04 — Mobil oyun alanı ölçek hedefi

Şimdilik uygulanmayacak; mobil cihaz testi sonrasına bırakılan görsel düzen hedefi:

- oyun alanının genel ölçeği küçültülecek,
- renkli altıgen bloklar ve gri taban/board birlikte orantılı küçültülecek,
- amaç mobil ekranda daha fazla boşluk ve daha temiz kontrol yerleşimi elde etmek,
- mevcut büyük blok/board ölçeğinin üç parçalı takla animasyonunun okunurluğunu olumsuz etkiliyor olabileceği not edildi,
- takla mekaniğinin kendisine şu aşamada dokunulmayacak; karar gerçek mobil oynanış testinden sonra verilecek,
- LEVEL/HAMLE göstergesi ve mevcut ayar/yardımcı düğmeler bu aşamada yerinde kalacak.

Durum: hedef kaydedildi, uygulama beklemede.


## 2026-10-04 — Compact Android / Galaxy M12 uyumluluk pass'i

Mobil cihaz geri bildirimi sonrası board ve alt kontrol yerleşimi daha düşük kullanılabilir ekran alanlarına uyarlanmıştır.

- Galaxy M12 benzeri eski/kompakt Android cihazlar alt gezinme çubuğu açıkken de hedef kabul edilir.
- Düzen artık `visualViewport` varsa gerçek görünür genişlik/yüksekliği kullanır; CSS yüksekliği de bu canlı viewport ile senkronlanır.
- Alt booster/hak satırı nowrap + shrink koruması kullanır; butonlar dar ekranlarda kontrollü küçülür, iç içe geçmez.
- Düşük yükseklikli coarse-pointer cihazlarda yalnız çevresel UI biraz daha kompaktlaşır.
- Yoğun board'ların mevcut otomatik küçülmesi korunur.
- Küçük board'ların ekranı gereksiz doldurması engellendi: telefonlarda board ölçeğine maksimum tavan kondu.
- Dar/kompakt telefonlarda maksimum board scale 0.80, diğer telefonlarda 0.86; daha büyük ekranlarda 0.94.
- Takla mekaniğinin süre/fizik mantığı değiştirilmedi; yalnız ekrandaki genel board boyutu sınırlandı.
- QA checkpoint'i: `hexiva-qa-m12-viewport-v1-gold-100` (+100 altın, bir kez).

Durum: kodlandı; yerel test ve gerçek M12 APK smoke testi bekliyor.


## 2026-10-05 — Güvenli mobil checkpoint: Galaxy M12 gerçek cihaz kabulü

Gerçek APK testi tamamlandı ve mevcut durum kullanıcı tarafından **şimdilik iyi** olarak kabul edildi.

Doğrulanan checkpoint kapsamı:

- Galaxy M12 gibi daha eski / düşük kullanılabilir ekran yüksekliğine sahip Android cihazlarda alt gezinme çubuğu görünürken oyun artık kullanılabilir durumda.
- Alt 4 booster/hak kontrolü mevcut testte iç içe geçmeden kullanılabildi.
- `visualViewport` tabanlı kullanılabilir alan hesabı gerçek cihazda sorun çıkarmadı.
- Küçük footprint'li bölümlerin gereksiz büyümesine getirilen maksimum board ölçek tavanı kabul edildi.
- Her 10 bölümdeki yoğun board varyantlarının mevcut otomatik küçülme davranışı korundu.
- Takla animasyonunun fizik/zamanlama mantığı bu pass'te değiştirilmedi.
- Android launcher icon build akışı artık ikon bulunamazsa fail-fast davranıyor; eski ikonla sessiz build alınmıyor.
- Onaylı ikon proje köküne `hexiva_app_icon_cropped.png` adıyla konduğunda Android debug build başarıyla tamamlandı ve gerçek cihaz testi yapıldı.
- Bu checkpoint sonrası yeni gameplay/yerleşim değişikliği yapılmadı.

Bekleyen sonraki işler:

- Daha uzun gerçek cihaz oturumunda FPS / ısınma / stabilite gözlemi.
- İleride public/release hazırlığında geçici aile mikrofon özelliklerinin kaldırılması değerlendirilecek.
- Gerekirse sonraki mobil turda yalnız ince yerleşim ayarı yapılacak; mevcut M12 davranışı referans korunmalı.

**Checkpoint kararı:** mevcut mobil durum korunacak; yeni değişikliklerde bu checkpoint regresyon referansı olarak kullanılacak.
