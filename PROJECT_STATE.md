# PROJECT_STATE

Last updated: 2026-09-30

## Current checkpoint

The current playable baseline is `index.html`, now at V17. The stronger top-down camera is approved and board cast shadows are disabled.

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
