# Hexa Nut Sort — Godot Prototype

This repository now contains two implementations:

- `project.godot` + `godot/`: the new native Godot version.
- `app/`: the earlier Android WebView prototype, kept only as a reference.

## Run in Godot

1. Open Godot 4.x Project Manager.
2. Import this repository by selecting `project.godot` in the repository root.
3. Press **F6/F5** to run.

The Godot build currently includes:

- genuinely different early-level layouts,
- small / medium / large bolts (capacities 3 / 4 / 5),
- mixed bolt sizes in the same level,
- deterministic solvable level generation,
- variable bolt counts and empty-slot counts,
- locked spare-bolt mechanic on selected levels,
- undo and restart,
- invalid-move haptic calls through `Input.vibrate_handheld()`,
- distinct success / invalid feedback,
- portrait mobile layout.

The old HTML/Android prototype is intentionally not used by the Godot game.
