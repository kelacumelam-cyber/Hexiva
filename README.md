# Hexiva

Mobile-first 3D hexagonal tap-away puzzle game.

Live test build: https://kelacumelam-cyber.github.io/Hexiva/

## Current baseline

- Main playable build: `index.html`
- Three.js / WebGL rendering
- Portrait-first mobile presentation with responsive board fitting
- Deterministic level identity: the same level number reproduces the same puzzle
- Current catalog ceiling: 1000 levels, designed to expand further
- Generator V2 for level 35+
- Local browser persistence through `localStorage`
- Optional cloud persistence when Firebase configuration is supplied
- Starting economy: 0 coins, 1 hammer, 1 rotate, 1 bomb
- Level reward: 25 coins
- Shop: +1 hammer for 75 coins, +1 rotate for 50 coins, +1 bomb for 125 coins
- Daily gift: +25 coins, +1 hammer, +1 rotate, once per 24 hours

## Fundamental movement contract

A playable hex always moves in the direction of its visible arrow. Movement may change only through an explicit visible board mechanism. Hidden or misleading direction changes are not allowed.

## Implemented mechanics

- Internal escape pits
- Traversable grey floor cells
- Direction changer
- Reversible two-arm swap mechanism on all three hex-grid axes
- Collision-and-return movement for blocked blocks
- Three-way cycle mechanism
- Fixed obstacles
- Visibly linked pairs
- Bomb booster with one-cell-radius playable-block blast

## Level philosophy

Level number is identity, not a linear difficulty rating. Difficulty may rise or fall naturally. Boards should vary in topology, density, gaps, corridors, internal movement, and selective mechanic combinations while remaining deterministic and solvable.

Levels 1–34 preserve the authored/test sequence. Level 35+ uses Generator V2 topology families and deterministic mechanic distribution.

## Testing workflow

After an approved checkpoint, the complete `index.html` is committed to `main`. GitHub Pages republishes automatically. Test by refreshing the same live URL; use Ctrl+F5 if a stale browser cache is shown.

Standalone HTML/ZIP delivery is only a fallback.

## Release work still pending

- Android portrait/orientation packaging policy
- Android/WebGL performance and crash-hardening pass
- Broader automated solvability/stress validation across the generated catalog
- Release/debug separation for QA keyboard shortcuts
- Local bundling of external CDN dependencies before standalone APK packaging
- Final visual/background polish
