# Design Decisions

## 2026-09-30 baseline

### Fundamental movement contract
A playable hex always follows its visible arrow direction. Never use hidden or misleading movement behavior.

### New mechanics must be explicit
If movement changes, a visible board mechanism must explain why.

### Board presentation
The desired direction is stronger top-down readability while keeping a small amount of 3D depth. The current baseline is considered slightly too tilted.

### Visual identity
Preserve:
- colorful chunky hex blocks,
- clear white arrows,
- layered base/depth feeling,
- existing friendly mobile-game visual character.

Measurements may adapt:
- hexes can become smaller,
- board can scale both horizontally and vertically,
- base and cell systems can evolve to support mechanics.

### Mechanics accepted
- internal escape holes
- direction changer
- swap mechanism with center cell also serving as an escape space
- rare fixed obstacles
- rare linked pairs

### Mechanics intentionally postponed
Do not add every idea at once. Each mechanic gets its own implementation and solvability checkpoint.

### Difficulty
Do not bind difficulty monotonically to level number. The game may have 1000+ levels. Individual levels should have distinct puzzle structures and difficulty can fluctuate naturally.

### Determinism
Future target: level N should reproduce the same puzzle every time. Restart should restart the same puzzle rather than rerolling it.

### Testing shortcuts
A/S keyboard shortcuts are temporary development aids and must not change real progression.

### Immediate next decision
Camera / board viewing angle is the next implementation target. Mechanics are paused until that visual checkpoint is approved.


### Reference clarification — direction changer vs swap mechanism
A previous visual reference was misclassified.

Correct interpretation:
- Direction changer: low-profile board-mounted special cell with a visible double-chevron/direction symbol. It redirects a moving hex only after the hex reaches that cell.
- Swap mechanism: the larger central mechanism with two arms. Its arms hold two hexes and swap their positions when activated. Its center can also function as a real empty/escape cell.

Do not reuse the arm-based swap visual language for the direction changer.


### Blocked-move animation
Accepted future behavior: a tapped hex should physically travel along its arrow direction until the first blocking hex, visibly bump it, and return to its starting cell. If its route is clear, it escapes/falls normally. This is an animation/feedback rule and must not alter movement logic.

### Shadow policy
With the approved stronger top-down camera, dynamic cast shadows should remain disabled unless a later visual test clearly proves they improve readability. Depth should primarily come from geometry, bevels, base plates, lighting, and color separation.


### Swap V1 safety rule
The first swap implementation must use one fixed axis only. Its center cell remains a valid escape/drop space. The exchange is reversible by activating the same mechanism again, and arrows remain attached to their original hexes. Broader orientations and combinations come only after this proof is approved.


### Swap visual checkpoint
V19 swap visuals are accepted as a good working state, not final polish. Further beautification is deferred. Development may continue to additional swap orientations, preserving reversibility and the center escape/pit behavior.


### Swap axes approved
All three opposite direction-pair axes on the hex grid are approved as working. Same-color or same-arrow endpoint pairs are allowed for now; generator-level variety constraints are deferred to the later level-generation overhaul.

### Collision-return behavior implemented
Blocked taps now physically travel toward the first blocker and return to origin. This is feedback/animation only and does not change the core arrow-direction movement contract.


### Traversable grey floor cells
Grey board slots are a distinct topology type from pits. A grey floor cell is empty and passable; a moving hex crosses it and continues. A pit is an escape/drop cell and ends the move by falling.

### Dense collision-test layouts
Reference images may guide density and topology without being copied. V22 adds three original dense test boards to validate collision-return movement before the broader generator redesign.


### Level variety principle
There must not be one dominant board template. Dense boards are only one family. A future generator should vary shape, density, internal empty spaces, traversable grey floors, true pits, corridors, asymmetry, and mechanic placement.

A dense board may contain one or more internal holes/empty regions. Density does not mean fully filled.

The target is that levels feel structurally distinct rather than like the same pattern recolored. A level number should map to one fixed puzzle; freshness comes from differences between level numbers.

### Reference-board policy
V22 dense boards 29-31 are approved quality references for future generator work. They are only one family among many; they must not become the dominant or canonical template.


### Outward-arrow balance
The level generator must substantially reduce excessive outward-facing arrows. A low-difficulty level should not become a trivial "tap all outward arrows" task.

Difficulty should come from route structure, dependency chains, board topology, and mechanic placement—not from simply making arrows obvious or hidden.

The generator should explicitly control:
- outward-facing arrow ratio,
- count of immediately playable blocks,
- count of trivial direct escapes,
- unlock/dependency depth.

Very hard levels are allowed, but they must remain fair, deterministic, and solvable.


### Fixed level identity, varied level set
Each level number should map to a fixed puzzle. Restarting or replaying that level should reproduce the same board.

The diversity target applies across the level catalog: hundreds/thousands of levels should differ meaningfully in topology, density, size, empty-space structure, movement dependencies, and mechanic combinations.

Not every mechanic must be present in every level. Completely plain levels should be uncommon; internal travel and collision-return interactions are considered valuable because they make the board feel active and spatial.

Board and hex visual scale may adapt to layout size and density.



### Generator V2 staged rollout
Generator V2 should be introduced in stages rather than replacing the whole level system at once.

Stage 1 is deterministic identity + measurement. Existing authored mechanic test levels remain stable. Structural metrics are collected before choosing difficulty thresholds.

Stage 2 will add new topology families and stronger cross-level diversity.

Stage 3 will enforce/tune limits for excessive outward-facing arrows, excessive immediately playable blocks, and trivial direct escapes based on playtesting rather than arbitrary constants.


### Generator V2 topology-family rule
Levels 1-34 remain frozen authored/test checkpoints. Level 35+ draws from multiple topology families rather than cycling the old pattern list.

Each level number remains fixed/deterministic, but different level numbers should vary strongly in size, density, silhouette, internal floor gaps, corridors, pits, and dependency structure.

For level 35+, valid inward/sideways directions should generally be preferred over free outward exits when possible. Difficulty may fluctuate between levels instead of increasing monotonically.


### Economy baseline
Current tuning checkpoint:
- 0 starting coins,
- 1 starting hammer,
- 1 starting rotate,
- 25 coins per completed level,
- hammer: +1 for 75 coins,
- rotate: +1 for 50 coins,
- no unlimited debug coin faucet,
- daily gift: +25 coins, +1 hammer, +1 rotate, once per 24 hours.

These values may be tuned after real-phone playtesting.

### Edge fall animation
A block escaping over the board edge travels only to the physical cliff lip and then falls vertically. It must not launch far beyond the board before dropping.


### Bomb booster
Bomb is an explicit limited booster, not a board mechanic:
- start with 1,
- buy +1 for 125 coins,
- target a playable block,
- remove only that selected block,
- do not destroy fixed obstacles,
- if the selected block belongs to a linked pair, detach the link first so the surviving member becomes a normal playable block.
