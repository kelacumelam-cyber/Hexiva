# Hexiva V43 — puzzle construction and audit

## Diagnosis (baseline main 55ca8e3)

V42.6 did not enforce its stated cap. Its 24-candidate selector used `bestCompliant || best`; therefore all 24 candidates could violate the cap and the board would still ship. The old audit reports 817 radius-2 violations in levels 1–1000. Level 43 already reports a connected group of five and a radius-2 neighbourhood of five. This particular example was **detected but accepted**, not a geometry conversion or cache mystery.

The old local neighbourhood only reports the largest count around one centre. It does not explain an entire perceptual component, long aligned rows across gaps, or changed positions after a swap/cycle. V43 derives positions from the actual flat-top `hexToWorld` mapping and the approved orthographic camera elevation `(0,24,9.5)`, combines screen proximity with axial row alignment, and reports transitive groups with coordinates. This remains a conservative perception heuristic, not proof of what every human will see. Real web playtesting is still required.

A permanent obstacle cannot impose a temporary dependency in a fixed-arrow removal-only board: clearing other stones never removes the wall. The old constructor avoided every obstacle route when assigning arrows, then placed most swaps/cycles without requiring their use. Consequently walls were generally decorative, and linked pairs were forced to already-free outward directions. The old audit also suppressed any route stall merely because a swap/cycle was present, without proving that operation solved it.

The old quality score rewarded maximum route dependencies. Deep waves could therefore mean a long forced sequence rather than repeated decisions. Its trivial-route probe also traced beyond missing footprint cells and could count a special tile beyond a real cliff as touched.

## New architecture

- `src/topologies.json` preserves the previous geometric family library as raw shapes, not as mandatory level identities.
- `scripts/build-catalog.cjs` constructs multiple deterministic candidates, mutates physical silhouettes, constrains arrows during solvable peeling, rejects failures, then ranks only accepted candidates.
- `src/puzzle-engine.js` is the pure rule model used by construction, state-space solving and audit. It includes first-gap escape, pits, floors, redirects, permanent walls, reversible swaps, three-arm cycles and joint linked removal.
- `src/catalog.js` is the complete immutable playable catalog. Phones do not run candidate search. `generateSolvableLevel(n)` clones that exact entry; restart cannot reroll it.
- `scripts/audit-catalog.cjs` recomputes proofs from the catalog, checks actual runtime route tracing for every direction at solution states and full mechanism orientations, audits fingerprints and near repeats, and writes detailed machine-readable reports.

A construction failure stops the build with the failing level and candidate rejection histogram in `catalog-failure.json`. There is no non-compliant fallback, forced arbitrary outward escape, or “has a mechanism, therefore ignore stall” exemption. That diagnostic is a temporary failure file, not a playable level.

Existing saves keep their level, highest unlock, coins and boosters. Levels 1–1000 are rebaselined; the old 1–34 authored/checkpoint layouts are not frozen at the expense of quality. The first four levels remain small tutorial boards. Stone count is bounded to control phone readability; greater difficulty must come from dependencies and mechanics. The visual presentation, animation and interaction rules are unchanged.

## Mechanic contribution

Swap/cycle candidates start from a solvable final arrangement and reverse an actual rearrangement transition with arrows attached to their stones. Acceptance requires a full solution **and** an exact no-rearrangement counterfactual that fails. Budget exhaustion is explicit and is not accepted as proof of necessity.

Obstacle boards combine a wall with a required swap/cycle. A wall is placed on an arm's initial route; its intended rearranged state must still solve. Acceptance requires removing that individual wall to change the clearance of a real route in a reachable certificate state. Reports include affected routes and counterfactual changes. Two obstacle modes and redirect+swap recur in the catalog.

Redirects must turn a stone on an actual successful move, and removing the individual redirect must change route clearance. Linked pairs join stones with unequal initial readiness, impose a real joint-clear restriction, and must be cleared jointly in the certificate. These are contribution checks, not a promise that any one mechanic produces a subjectively hard puzzle.

## Quality rules and limits

| Measure | Acceptance rule |
| --- | --- |
| Solvability | Full state solution; no stalled or budget-exhausted proof |
| Same-direction group | At most two, including every full swap/cycle orientation |
| Visual relation | Screen distance <= 2.06 neighbour spacings **or** collinear axial row separation <= 4 steps; transitive closure |
| Opening | At least two removal actions, and at least two actions unlocking a new immediate front, including levels 1–4 |
| Free opening stones | <= 32% (tutorial <= 60%) |
| Trivial escape | First-step direct cliff exits <= 22% (tutorial <= 50%) |
| Depth | At least three removal waves unless a required rearrangement initially prevents route-only clearing |
| Forced sequence | <= 4 certificate steps (tutorial <= 2) |
| Tutorial dependency depth | <= 5 |
| Exact/near footprint | Reject within last eight levels; near means best translated/rotated/reflected Jaccard overlap > 0.84 |
| Geometric family | No same V2 family within last eight levels |
| Mechanic | Every placed redirect/swap/cycle/linked/wall instance passes its contribution check |

These bands are explicit engineering screening rules. They are not a “fun score” or empirically proven psychometric difficulty levels. Depth, available actions and immediate unlocks are proxies. A removal-only board is monotonic: removing an available ordinary stone cannot make another fixed-arrow ordinary stone harder to remove. Real losing order choices occur in rearrangement boards where removing an arm disables a needed operation. The audit distinguishes solvable, losing and unknown opening outcomes.

The visual rule intentionally also relates arrows separated by other stones: those stones can later disappear. Removal only deletes vertices/edges from this conservative relation, so it cannot create a new over-cap component. Swap/cycle full orientations are all checked. Boosters deliberately alter puzzle rules and are not included in the unboosted solvability or visual proof.

## Commands

```sh
npm ci
npm test
npm run catalog:build
npm run audit:catalog
npm run verify:source
npm run build:web
```

`catalog:build` is an offline operation and may take several minutes. `audit:catalog` never trusts stored metrics as proof. Reports are `docs/audits/v43-summary.json`, `v43-levels.json` and `v43-generation.json`. The browser's `__hexivaAuditCatalog(1000)` summarizes the generated acceptance telemetry; the Node audit is the authoritative recomputation and runtime parity check.

## Web acceptance status

The remote Chrome browser could not create a WebGL context even on unchanged V42.6. The error persisted after one reload. No levels have been claimed played or visually accepted in this environment. Representative/worst-case levels are selected by the audit for subsequent WebGL-capable web playtesting. Native APK builds omit the temporary QA coin marker; web V43 uses a fresh once-only key to add exactly 100 to the saved balance.

## Player screenshot ↔ source geometry cross-check

The supplied crop `image(20260930-140748).png` matches baseline level 43's relative geometry. Approximate crop coordinates satisfy `pixelX ≈ 315 + 73.5*q`, `pixelY ≈ 294 + 80*(r + q/2)`, consistent with `hexToWorld(q,r) = (1.5R*q, sqrt(3)R*(r+q/2))` and the camera's z compression. These are approximate block centres in the crop, not universal screen coordinates.

| Axial cell | Approximate crop centre | Baseline arrow |
| --- | --- | --- |
| `(0,-1)` | `(315,214)` | dir 5, up-left |
| `(1,-1)` | `(389,254)` | dir 5, up-left |
| `(2,-1)` | `(462,294)` | dir 5, up-left |
| `(3,-1)` | `(536,334)` | dir 5, up-left |
| `(4,-1)` | `(609,374)` | dir 5, up-left |
| `(1,0)` | `(389,334)` | fixed obstacle |
| `(-1,-1)` | `(242,174)` | swap centre |

Thus the visually obvious five-stone row is an actual contiguous axial row and was already a V42.6 metric violation. The obstacle's immediate neighbours point away from it; the full solver trace likewise records zero wall interactions for this level. This screenshot comparison is evidence about the **old build**, not a claim to have played V43 in the WebGL-blocked browser.
