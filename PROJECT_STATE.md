# PROJECT_STATE

Last updated: 2026-09-30

## Current checkpoint

The current playable baseline is `index.html`, now at V12. The V11 stronger top-down camera direction is visually approved.

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

The current V10 direction changer is a proof-of-concept special mechanism with glow/idle animation. Its final design is NOT approved yet.

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
Already implemented as V1. Final visual design pending.

### Swap mechanism
Planned.

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
