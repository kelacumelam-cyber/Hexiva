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

The target is that levels feel structurally distinct rather than like the same pattern recolored.

### Reference-board policy
V22 dense boards 29-31 are approved reference examples for future generator work. They are examples to preserve as quality targets, not templates to clone repeatedly.


### Outward-arrow balance
The level generator must substantially reduce excessive outward-facing arrows. A low-difficulty level should not become a trivial "tap all outward arrows" task.

Difficulty should come from route structure, dependency chains, board topology, and mechanic placement—not from simply making arrows obvious or hidden.

The generator should explicitly control:
- outward-facing arrow ratio,
- count of immediately playable blocks,
- count of trivial direct escapes,
- unlock/dependency depth.

Very hard levels are allowed, but they must remain fair, deterministic, and solvable.
