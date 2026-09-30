# PROJECT_STATE

Last updated: 2026-09-30

## Current checkpoint

The current playable baseline is `index.html`, now at V22. Dense collision-test boards and traversable grey floor cells were added so collision-return movement can be tested properly.

The game is working as a mobile-first Three.js/WebGL prototype. The current visual identity must be preserved while the board presentation, mechanics, level generation, and eventual Android packaging are improved.

## What is working

- Core tap-away rule:
  - Every playable hex has a visible arrow.
  - The hex moves only in that arrow direction.
  - If another playable hex blocks its route, it cannot escape.
- Solvable level generation based on reverse construction.
- Multiple board patterns.
- Internal escape pits:
  - center hole
  - double internal holes
  - off-center hole
  - short internal corridor
- Internal pit layouts were stress-tested during development with thousands of generated cases without deadlocks.
- Direction changer V1:
  - a moving block reaches the changer,
  - visibly changes direction,
  - continues in the changer direction,
  - ordinary blockers still block the route.
- Direction-changer generation was stress-tested during development.
- Mobile board fitting between the top HUD and bottom boosters.
- Improved WebGL rendering quality relative to the first prototype.
- Colored block self-shadow artifacts were reduced while retaining depth from the base plate.
- Tween fallback protection exists so a missing Tween CDN does not leave only a black canvas.
- Double-completion / duplicate level reward protection exists.
- Top-left utility controls were changed from vertical to horizontal in an earlier iteration.
- Temporary QA shortcuts:
  - A = next level
  - S = level 1
  - shortcuts must not alter persistent progression.

## Current visual checkpoint

The previous V10/V12 glowing direction-changer device was a visual misinterpretation and is no longer the target. The correct direction-changer reference is a low-profile board-mounted special cell with a clear double-chevron direction symbol. The earlier arm-based reference belongs to the future swap mechanism.

User-provided references established the desired presentation direction:
- The board should be viewed more from above.
- The current board looks slightly too tilted / laid down.
- Keep a 3D feeling, but make it strongly top-down and easier to read.
- Do not copy the reference art; use it only as a presentation/reference direction.
- Special mechanics should look like mechanisms mounted on the board, not like ordinary playable colored hex blocks.

## Current camera checkpoint candidate (V11)

Approved presentation checkpoint:
- camera moved from `(0, 19, 15)` to `(0, 24, 9.5)`,
- board is viewed substantially more from above,
- 3D depth is intentionally retained,
- mobile board offset was reduced to match the new viewing angle,
- no block geometry, colors, shadows, mechanics, UI identity, or direction rules were changed in this checkpoint.
- User approved the stronger top-down framing.
- Direction-changer visual arrow alignment bug fixed: the mechanism frame no longer rotates the displayed arrow away from its logical `dirIndex`.

## Current visual-mechanic checkpoint (V13)

Direction-changer visual concept corrected:
- previous glowing central device concept discarded,
- now rendered as a low-profile pink board-mounted mechanic cell,
- uses a double-chevron symbol to communicate redirect direction,
- keeps subtle breathing/activation light only,
- movement logic is unchanged.

The earlier two-arm reference is reserved for the future swap mechanism.

## NEXT TASK

Do NOT add another mechanic yet.

First visually review V11 on representative mobile layouts.
If the camera direction is approved:
1. fine-tune block/base thickness and shadow balance only if needed,
2. then redesign the direction changer as a proper board-mounted mechanism.

If V11 still looks too tilted or too flat, tune only the camera and board framing before changing geometry.

After the camera/presentation checkpoint is approved:
- redesign the direction changer as a proper board-mounted mechanism,
- then proceed to the swap mechanism.

## Accepted future mechanics

### Internal escape spaces
Already in progress. A block whose valid route reaches an internal empty escape cell may fall through it.

### Direction changer
Already implemented as V1.
Correct visual concept:
- low-profile special board cell,
- clearly distinct from a playable colored hex,
- visible double-chevron/direction symbol,
- subtle glow/activation feedback,
- no large arm mechanism.

The arm-based mechanism reference is NOT the direction changer; it belongs to the future swap mechanic.

### Swap mechanism
Planned.

Visual reference clarification:
- the earlier central mechanism with two arms belongs here,
- its arms hold the two hexes that will exchange positions,
- the center remains both the mechanism/button and a real empty/escape cell.

Conceptual layout:

`- 0 -`

- The two `-` positions are hexes caught by two arms.
- The center `0` is both:
  - the swap mechanism/button,
  - and a real empty/escape space for moving hexes.
- Activating it swaps the two held hexes.
- Future orientations can be horizontal, vertical, or diagonal, but introduce them safely one at a time.

### Fixed obstacle
Accepted, but should appear rarely.

### Linked pair
Accepted, but should appear rarely.
The relationship must always be visually readable; no hidden rule.

## Level-generation philosophy

Do not create a simple linear 'level 1 easy -> level N hard' curve.

Level number is identity, not difficulty.

Each level should have its own puzzle character through topology and mechanic combinations. Difficulty may naturally vary from one level to another.

Important:
- The project may eventually contain 1000+ levels.
- Restarting a level should ultimately reproduce the same level, so seeded deterministic generation is planned.
- Avoid excessive arrows pointing directly outward.
- Preserve guaranteed solvability.
- Internal spaces and mechanics should create interesting routes without violating the visible arrow rule.
- The board and hex scale may shrink dynamically as layouts grow.
- Visual hex size may change, but touch targets should remain comfortable on mobile.

## Later visual polish

Do this after mechanics and board presentation are stable:
- final edge/anti-aliasing polish
- refine base/hex proportions
- final shadow tuning
- special-mechanic visual language
- departure animation before a block slides/falls:
  - a short two-stage lift/pop/anticipation motion is preferred over instant movement

## Persistence / packaging still pending

- Current Firebase persistence depends on injected configuration.
- Local save fallback should be designed before release.
- External CDN dependencies should eventually be bundled locally for a standalone APK.
- APK packaging comes after the game baseline is stable.
- UI currently contains '100 levels' language inherited from the prototype; this is no longer a product rule and must later be removed/refactored.

## Safety rule for development

Add mechanics one at a time:
1. implement one mechanic in isolation,
2. verify movement semantics,
3. stress-test solvability,
4. visually test on mobile,
5. only then combine it with other mechanics.

Do not sacrifice the established visual identity while extending the board system.


## V13 checkpoint

- Record correction completed: the arm-based reference belongs to the future swap mechanism, not the direction changer.
- V13 direction-changer visual is now implemented as a low-profile board-mounted pink mechanic tile with a double-chevron symbol and subtle light/activation feedback.
- Direction-changing movement logic is unchanged.
- Approved V11/V12 top-down camera presentation is preserved.
- Next review target: verify that the new changer is readable, clearly non-playable, and visually compatible with the board.


## Newly accepted future mechanic

### Collision return motion
Planned after the current board-mechanic checkpoints.

Normal tap behavior should eventually become:
- tapped hex begins moving in its visible arrow direction,
- if its path reaches a blocking hex, it visibly travels to the blocker, bumps/collides, then returns to its original cell,
- if no blocker exists, it continues out of the board or into a valid internal escape pit and falls,
- this must never change the fundamental arrow-direction contract.

This replaces the current tiny blocked nudge animation; it is not implemented yet.

## V17 visual change
- Dynamic cast shadows were disabled for the board.
- Reason: with the approved top-down camera, block shadows visually merged with neighboring hex/base layers and could look like extra geometry.
- Bevels, base plates, lighting, color, and 3D thickness remain; only cast-shadow rendering was removed.


## Swap mechanism V1 candidate

Implemented in V18 and awaiting visual/gameplay approval.

- First proof appears as the next pattern after the direction-changer proof (currently level 26 in the test ordering).
- One swap mechanism only.
- One fixed opposite-cell axis only.
- The center mechanism cell is also a real escape/drop pit.
- Clicking the mechanism swaps the two live hexes held on opposite sides.
- Clicking it again can reverse the swap because the same two positions exchange again.
- Hex arrow directions stay attached to their hexes; swapping changes position, not arrow identity.
- If either held side no longer contains a live hex, the mechanism refuses to activate.
- Input is locked during the short swap animation so positions cannot desynchronize.
- This is a proof-of-mechanic visual, not final art.
- Do not add vertical/other diagonal swap orientations until this V1 behavior is approved.


## V19 swap visual checkpoint approved

- Swap V1 behavior is approved.
- V19 visual treatment is broadly approved and can remain for now.
- It is not considered final art; further polish may happen later.
- Next safe expansion: add additional swap orientations while preserving the same reversible behavior and center-pit rule.


## Swap-axis checkpoint approved

- Levels 26, 27, and 28 were checked.
- All three opposite hex-grid swap axes work correctly.
- V19 swap visuals remain accepted as a good working state, not final art.
- Same color or same arrow on the two held hexes is not currently treated as a swap-design bug; generator-level variety will be addressed in the later level-generation overhaul.

## V21 collision-return candidate

Awaiting gameplay feel approval.

- Replaces the old tiny blocked nudge.
- A tapped blocked hex now travels along its visible arrow route.
- If empty cells exist before the blocker, it visibly crosses them.
- It stops just before the first blocking hex, performs a small impact/squash, then returns to its original cell.
- If a direction changer lies on the blocked route, the hex follows it on the outward trip and restores its original direction when back at the starting cell.
- Clear routes still escape/fall exactly as before.
- A block cannot be re-tapped while its blocked-return animation is running.


## V22 dense collision test boards

- level 29: dense collision board A
- level 30: dense collision board B
- level 31: dense collision board C
- Layouts are original; user reference images were used only for density/topology direction.
- Grey floor cell = visible, traversable empty board space; does not cause a fall.
- Pit cell = true escape/drop space.
- Each dense test board contains authored routes where a hex crosses grey empty space, reaches a blocker, collides, and returns.
- These are test/checkpoint boards, not the final level-generation overhaul.


## Approved V22 dense-board direction

User approved the V22 dense test boards as strong examples.

Important: these are NOT the only future board style.

Accepted direction:
- future levels should vary in density and topology,
- dense boards may still contain one or multiple internal empty spaces,
- boards may be asymmetric,
- some can contain corridors or internal lanes,
- some can be open and breathable,
- some can be compact and crowded,
- grey traversable floor cells and true drop pits remain distinct concepts,
- the goal is not to repeat one template with different colors,
- the goal is for each level to have its own board character.

V22 levels 29-31 are approved quality references, but only one example family among many future topology families. Generator V2 must not converge on the V22 shape/style.

## Later work backlog

- Broaden the level generator beyond repeated fixed patterns.
- Keep each level number deterministic/fixed, while maximizing structural variety across different level numbers.
- Support 1000+ levels without a fixed linear difficulty curve.
- Increase topology variety: density, holes, corridors, asymmetric shapes, internal floor spaces.
- Mix approved mechanics only after each is individually stable.
- Keep swap visuals as a good working checkpoint; optional further polish later.
- Keep direction changer visuals as a good working checkpoint; optional further polish later.
- Final visual-quality polish after gameplay/mechanics stabilize.
- Add local/offline persistence and remove release dependence on injected Firebase config.
- Bundle external CDN dependencies locally before standalone APK release.


## Generator V2 arrow-direction balance

User explicitly wants the generator to greatly reduce the number of hexes initially pointing directly outward.

Design intent:
- easy does NOT mean "most arrows point outward",
- easy levels should still require some thought,
- medium/hard levels should more often require clearing routes, creating space, or using mechanics,
- control the number of immediately playable / free-escape moves,
- avoid laborious "tap everything that already points out" gameplay,
- allow difficulty to fluctuate naturally across levels,
- very hard levels are acceptable as long as they are fair and solvable,
- preserve visible-arrow movement contract at all times.

Generator V2 should therefore include explicit targets/limits for:
- outward-facing arrow ratio,
- initially playable move count,
- trivial one-step escape count,
- dependency depth / unlock chain length.

The exact thresholds should be tuned from playtesting rather than chosen arbitrarily.


## Clarification: fixed levels, rich cross-level variety

User clarified the intended rule:

- each level number is fixed; once authored/generated for that number, replaying it should give the same puzzle,
- the goal is for the full set (e.g. 1000 levels) to be as varied as possible,
- players should not feel "I already played this exact kind of level a few levels ago",
- variety should come from board size, density, topology, internal empty spaces, corridors, pits, traversable grey cells, arrow dependencies, and selective mechanic combinations,
- not every mechanic must appear in every level,
- fully plain levels should be rare because they can feel flat,
- internal movement and collision-return behavior is desirable and should appear regularly,
- board/hex scale may shrink or grow with layout size and density.



## Generator V2 foundation candidate (V31)

A new local playable candidate, V31, starts Generator V2 without disturbing the existing authored/mechanic test levels.

Foundation changes:
- levels keep fixed identity through deterministic seeded generation,
- existing authored/test ordering is preserved before Generator V2 expansion,
- later family ordering is deterministically shuffled per cycle instead of repeating the exact same sequence forever,
- generator randomness inside solution-direction construction now uses a level seed instead of Math.random(),
- generator records QA metrics for:
  - outward-facing arrow count/ratio,
  - initially clear/playable count/ratio,
  - trivial direct escape count/ratio,
- thresholds are deliberately not hard-coded yet; they will be tuned from playtests,
- the next phase is to add genuinely new topology families and then use these metrics to reduce trivial outward-arrow-heavy boards.

Local candidate file: hexa_tap_away_game_mobile_v31.html


## V32 Generator V2 topology families

V31 foundation was user-tested successfully: sampled mechanics worked and restarting reproduced the same level.

V32 begins actual cross-level variety work for level 35+ while freezing levels 1-34.

Added eight V2 topology families:
- wide lens
- tall spine
- twin lobes with bridge
- offset/asymmetric mass
- zig-zag band
- stepped diamond
- large crescent
- compact maze

V2 levels also receive deterministic internal topology variation:
- traversable grey floor pockets,
- short floor lanes,
- split/compact void profiles,
- occasional true pits.

Each level remains fixed/deterministic by level number.

For V2 levels, valid inward/sideways arrow directions are preferred when available, using a deterministic fluctuating difficulty mood rather than a monotonic difficulty curve. This is intended to reduce free outward escapes and increase internal movement/collision play.

Generator QA metrics continue to record family, topology profile, outward-facing ratio, initially clear move count, and trivial direct escape count. Thresholds remain subject to playtesting.


## Web test workflow

Accepted default testing flow:

- The live test URL is GitHub Pages: https://kelacumelam-cyber.github.io/Hexiva/
- After each approved development checkpoint, update the repository's main `index.html`.
- GitHub Pages republishes automatically from `main` / root.
- User tests by refreshing the same URL.
- If the browser serves an older cached build, use a hard refresh (Ctrl+F5).
- GitHub Pages may take from seconds to a few minutes to publish a new commit.
- Downloading standalone HTML/ZIP files is now only a fallback when Pages is unavailable or a local-file-specific test is needed.
- Before telling the user a new web build is ready, make sure the full HTML was committed and not truncated.
