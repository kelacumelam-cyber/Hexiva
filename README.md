# Hexa Tap Away

Mobile-first hexagonal tap-away puzzle game.

This repository was reset on 2026-09-30 to use the current HTML/WebGL prototype as the new baseline. The previous Android/Godot experiment remains available in Git history but is no longer part of the current main tree.

## Current baseline

- Main playable prototype: `index.html`
- Three.js/WebGL rendering
- Mobile-first board fitting and responsive scale
- Colored hexagonal blocks with fixed visible arrow directions
- A block always moves in the direction shown by its arrow
- Internal pit / escape cells
- Direction-changer mechanic V1
- Temporary desktop test shortcuts:
  - `A`: next level
  - `S`: return to level 1
- Debug shortcuts do not unlock or persist progression

## Core design rule

The game must never lie about movement. If an arrow points in a direction, the block moves in that direction. New mechanics may redirect a moving block only through a clearly visible board mechanism.

## Project direction

The project is not designed around a fixed 100-level limit. It should support hundreds or thousands of deterministic, solvable, varied levels without tying difficulty directly to the level number.

See `PROJECT_STATE.md` for the current checkpoint and `docs/DESIGN_DECISIONS.md` for accepted design decisions.
