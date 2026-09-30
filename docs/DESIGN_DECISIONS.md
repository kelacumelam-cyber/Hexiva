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
