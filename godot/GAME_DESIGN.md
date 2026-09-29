# Hexa Nut Sort — Godot Design Direction

## Why move to Godot

The HTML/WebView build was useful as a gameplay mock-up, but the native Godot version is now the main implementation. The goal is to avoid browser rendering artifacts and make haptics, animation, audio, mobile input and future Android exports first-class.

## Reference research

Reference: GuruGame / Brainteaser Puzzle Game Studio — **Nut Sort: Color Puzzle Games**.

Public version history shows two useful progression ideas:
- a Question-Mark Screw/Nut mode,
- different bolt lengths introduced as a recurring challenge rather than making every level the same shape.

Broader nut/screw-sort games also use mechanics such as:
- locked / color-sealed bolts,
- one-way bolts,
- proximity locks,
- key-locked bolts,
- color-restricted bolts,
- regenerating bolts,
- stars / replay goals,
- hints, undo and extra-slot boosters,
- haptics and stronger completion feedback,
- themed chapters instead of one repeated board.

We should borrow the design principles, not clone art, levels, names or exact layouts.

## Our progression

The early game must visibly change, not merely recolor the same board.

- Level 1: 4 total bolts, small capacity.
- Level 2: 5 total bolts.
- Level 3: 6 total bolts and mixed small/medium lengths.
- Level 4: medium-length board.
- Level 5: small + medium + large bolts in the same puzzle.
- Level 6: locked spare bolt.
- Level 7+: increasingly mixed lengths, counts and board density.
- Later cycles add more colors / bolts while preserving a mobile-readable board.

Bolt capacities:
- Small = 3 nuts
- Medium = 4 nuts
- Large = 5 nuts

## Current native prototype

Implemented:
- deterministic level generation,
- reverse-scramble construction intended to preserve a solution path,
- mixed bolt capacities,
- changing total bolt counts,
- locked spare-bolt mechanic,
- undo,
- restart,
- batch same-color moves,
- invalid move feedback,
- handheld vibration calls,
- native Godot drawing (no SVG/WebView).

Next:
1. Verify generated levels in-engine and add automated solvability tests.
2. Add proper move animation and nut lift/drop.
3. Add audio and richer haptic patterns.
4. Add question-mark / hidden-nut mechanic.
5. Add star/par system based on solver-derived minimum/near-minimum moves.
6. Add color-blind shapes/patterns.
7. Add handcrafted chapter rules and difficulty milestones.
8. Add Android export preset and release pipeline.
