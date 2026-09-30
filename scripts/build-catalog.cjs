const fs = require("fs"),
  crypto = require("crypto"),
  P = require("../src/puzzle-engine.js"),
  templates = require("../src/topologies.json"),
  { makeAnneGridShape } = require("../src/anne-grid-shape.js");
function rng(seed) {
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const shuffle = (arr, r) =>
  arr
    .map((x) => ({ x, n: r() }))
    .sort((a, b) => a.n - b.n)
    .map((x) => x.x);
const keys = Object.keys(templates),
  v2 = keys.slice(34);
function connected(cells) {
  const ks = new Set(cells.map(P.key)),
    seen = new Set([P.key(cells[0])]),
    queue = [cells[0]];
  while (queue.length) {
    const c = queue.pop();
    for (let d = 0; d < 6; d++) {
      const n = P.step(c, d),
        k = P.key(n);
      if (ks.has(k) && !seen.has(k)) {
        seen.add(k);
        queue.push(n);
      }
    }
  }
  return seen.size === ks.size;
}
function shape(level, attempt, r, options = {}) {
  if (options.anneGrid) {
    return makeAnneGridShape(options.specialIndex || level, attempt);
  }

  let family =
    level <= 34 && attempt < 240
      ? keys[level - 1]
      : v2[(level + Math.floor(attempt / 40) * 7) % v2.length];
  let cells = [
    ...new Map(templates[family].map((c) => [P.key(c), c])).values(),
  ].map((c) => ({ ...c }));
  if (level > 4) {
    // Actual boundary edits, not recolouring or a rotation presented as novelty.
    const edits = 1 + Math.floor(r() * 5);
    for (let i = 0; i < edits; i++) {
      const ks = new Set(cells.map(P.key));
      const boundary = shuffle(
        cells.filter((c) => P.D.some((_, d) => !ks.has(P.key(P.step(c, d))))),
        r,
      );
      const c = boundary.find(
        (c) =>
          cells.length > 10 &&
          connected(cells.filter((x) => P.key(x) !== P.key(c))),
      );
      if (c) cells = cells.filter((x) => P.key(x) !== P.key(c));
      if (r() < 0.6 && cells.length < 35) {
        const ks2 = new Set(cells.map(P.key));
        const options = cells
          .flatMap((c) => P.D.map((_, d) => P.step(c, d)))
          .filter(
            (c) =>
              !ks2.has(P.key(c)) && Math.abs(c.q) <= 6 && Math.abs(c.r) <= 6,
          );
        if (options.length)
          cells.push(options[Math.floor(r() * options.length)]);
      }
    }
  }
  const target =
    level <= 4
      ? 7 + level * 2
      : Math.min(
          28,
          16 + Math.floor(Math.min(level, 120) / 20) + Math.floor(r() * 6),
        );
  while (cells.length > target) {
    const order = shuffle(cells, r);
    const c = order.find((c) =>
      connected(cells.filter((x) => P.key(x) !== P.key(c))),
    );
    if (!c) break;
    cells = cells.filter((x) => P.key(x) !== P.key(c));
  }
  // Rotation affects the on-screen grouping constraints; identity is still canonical.
  const rot = Math.floor(r() * 6);
  for (let i = 0; i < rot; i++)
    cells = cells.map((c) => ({ q: -c.r, r: c.q + c.r }));
  return { cells, family };
}
function draft(level, attempt, options = {}) {
  function fail(reason) {
    if (options.anneGrid && options.failureStats) {
      options.failureStats[reason] = (options.failureStats[reason] || 0) + 1;
    }
    return null;
  }

  const r = rng(
    (Math.imul(level, 0x45d9f3b) ^ Math.imul(attempt + 1, 0x9e3779b9)) >>> 0,
  );
  const { cells, family } = shape(level, attempt, r, options),
    ks = new Set(cells.map(P.key));
  const l = {
    level,
    mechanicKind: kind,
    patternKey: family,
    footprint: cells,
    pits: [],
    floors: [],
    redirectors: [],
    swappers: [],
    cyclers: [],
    obstacles: [],
    linkedPairs: [],
    blocks: [],
  };
  // Mechanic cadence recurs and combines. Obstacle is paired with rearrangement:
  // a permanent wall alone cannot be necessary in a fixed-arrow removal-only puzzle.
  let kind;
  if (options.anneGrid) {
    const anneKinds = [
      "redirectSwap",
      "obstacleCycle",
      "obstacle",
      "redirectCycle",
      "swap",
      "cycle",
    ];
    const anneIndex = ((options.specialIndex || level) - 1) % anneKinds.length;
    kind = options.forceKind || anneKinds[anneIndex];

    // Some large sparse chambers cannot physically support a necessary wall+cycle
    // arrangement on every deterministic notch/rotation. Try the harder combination
    // first, then fall back to a real cycle puzzle instead of stalling construction
    // or accepting a decorative wall.
    if (!options.forceKind && kind === "obstacleCycle" && attempt >= 120)
      kind = "cycle";
  } else {
    kind =
      level < 8
        ? "plain"
        : [
            "plain",
            "redirect",
            "swap",
            "linked",
            "cycle",
            "obstacle",
            "redirectSwap",
            "obstacleCycle",
          ][level % 8];
  }
  const interiors = shuffle(
    cells.filter(
      (c) => P.D.filter((_, d) => ks.has(P.key(P.step(c, d)))).length >= 4,
    ),
    r,
  );
  let reserved = new Set(),
    mechanism = null;
  const wantSwap = ["swap", "obstacle", "redirectSwap"].includes(kind),
    wantCycle = ["cycle", "obstacleCycle", "redirectCycle"].includes(kind);
  if (wantSwap || wantCycle) {
    for (const c of interiors) {
      for (const axis of shuffle(wantSwap ? [0, 1, 2] : [0, 1], r)) {
        const dirs = wantSwap
          ? [axis, axis + 3]
          : [axis, (axis + 2) % 6, (axis + 4) % 6];
        const ends = dirs.map((d) => P.step(c, d));
        if (!ends.every((e) => ks.has(P.key(e)))) continue;
        mechanism = {
          ...c,
          ...(wantSwap ? { aDir: dirs[0], bDir: dirs[1] } : { dirs }),
        };
        l[wantSwap ? "swappers" : "cyclers"].push(mechanism);
        l.pits.push(c);
        reserved.add(P.key(c));
        break;
      }
      if (mechanism) break;
    }
    if (!mechanism) return fail("mechanism-placement");
  }
  // A few traversable spaces keep dense boards readable without fragmenting the silhouette.
  const free = interiors.filter(
    (c) =>
      !reserved.has(P.key(c)) &&
      (!mechanism ||
        !P.D.some((_, d) => P.key(P.step(mechanism, d)) === P.key(c))),
  );
  const floorCount = options.anneGrid
    ? Math.min(12, Math.max(10, Math.floor(cells.length / 4)))
    : level <= 4
      ? 0
      : Math.min(3, Math.floor(cells.length / 12));
  for (const c of free.slice(0, floorCount)) {
    l.floors.push(c);
    reserved.add(P.key(c));
  }
  if (kind === "redirect" || kind === "redirectSwap" || kind === "redirectCycle") {
    const c = free.find((c) => !reserved.has(P.key(c)));
    if (!c) return fail("redirect-placement");
    l.redirectors.push({ ...c, dirIndex: Math.floor(r() * 6) });
    reserved.add(P.key(c));
  }
  if (options.anneGrid) {
    const pitTarget = 1 + (((options.specialIndex || level) % 3) === 0 ? 1 : 0);
    for (const c of free) {
      if (l.pits.length >= pitTarget + (mechanism ? 1 : 0)) break;
      if (reserved.has(P.key(c))) continue;
      l.pits.push(c);
      reserved.add(P.key(c));
    }
  } else if (!mechanism && level > 4 && r() < 0.2) {
    const c = free.find((c) => !reserved.has(P.key(c)));
    if (c) {
      l.pits.push(c);
      reserved.add(P.key(c));
    }
  }
  const playable = cells.filter((c) => !reserved.has(P.key(c)));
  let remaining = playable.map((c, id) => ({ ...c, id, dirIndex: 0 })),
    assigned = [];
  const idByCell = new Map(remaining.map((b) => [P.key(b), b.id]));
  // Geometry/redirects are fixed during peeling. Trace each route once; occupied
  // route cells then determine clearance exactly without rebuilding physics maps.
  const routes = remaining.map((b) =>
    P.D.map((_, dirIndex) => {
      const t = P.trace(l, [], { ...b, dirIndex });
      return {
        ...t,
        ids: t.path.filter((k) => idByCell.has(k)).map((k) => idByCell.get(k)),
      };
    }),
  );
  function peelCandidates(currentRemaining, currentAssigned) {
    const candidates = [],
      remainingIds = new Set(currentRemaining.map((b) => b.id));
    for (const b of currentRemaining)
      for (let d = 0; d < 6; d++) {
        const t = routes[b.id][d];
        if (!t.clear || t.ids.some((id) => remainingIds.has(id))) continue;
        const out = { ...b, dirIndex: d };
        if (!P.fitsVisual(currentAssigned, out)) continue;
        const deps = t.ids.filter((id) => !remainingIds.has(id)).length;
        // Moderate dependency rewards; never maximize depth at the expense of branches.
        const baseScore = deps ? 2 + Math.min(deps, 3) * 0.2 : 0;
        const anneGridBias = options.anneGrid
          ? (t.escape === "pit" ? 0.8 : 0) +
            (t.path.length > 2 ? 0.7 : t.path.length > 1 ? 0.3 : -0.9)
          : 0;
        candidates.push({
          b: out,
          score:
            baseScore +
            anneGridBias +
            r() * 2 +
            (t.path.length > 1 ? 0.6 : 0),
        });
      }
    candidates.sort((a, b) => b.score - a.score);
    return candidates;
  }

  if (options.anneGrid) {
    // Large sparse chambers expose a weakness of the normal greedy peel: an
    // individually good arrow choice can make the remaining visual-direction
    // assignment impossible several steps later. Search only this special mode,
    // keep a strict node budget, and fail closed if no compliant peel is found.
    let searchNodes = 0;
    const searchBudget = 2500;

    function anneGridLeafIsViable(candidateAssigned) {
      if (!mechanism) return true;

      const dirs = wantSwap ? [mechanism.aDir, mechanism.bDir] : mechanism.dirs;
      const ends = dirs.map((d) => P.step(mechanism, d));
      const members = ends.map((cell) =>
        candidateAssigned.find((b) => P.key(b) === P.key(cell)),
      );
      if (members.some((b) => !b)) return false;

      const stagedBlocks = candidateAssigned.map((b) => ({ ...b }));
      const stagedMembers = ends.map((cell) =>
        stagedBlocks.find((b) => P.key(b) === P.key(cell)),
      );
      stagedMembers.forEach((b, i) =>
        Object.assign(b, ends[(i + ends.length - 1) % ends.length]),
      );

      let visualState = stagedBlocks.map((b, id) => ({ ...b, id }));
      for (
        let orientation = 0;
        orientation < (wantCycle ? 3 : wantSwap ? 2 : 1);
        orientation++
      ) {
        if (P.visualGroups(visualState).some((g) => g.size > 2)) return false;
        const action = P.actions(
          { ...l, blocks: stagedBlocks },
          visualState,
        ).find((a) => a.type === (wantSwap ? "swap" : "cycle"));
        if (action) visualState = P.apply(visualState, action);
      }

      if (kind === "obstacle" || kind === "obstacleCycle") {
        const endpointKeys = new Set(ends.map(P.key));
        const wallCandidates = l.footprint.filter(
          (cell) =>
            !endpointKeys.has(P.key(cell)) &&
            !l.pits.some((x) => P.key(x) === P.key(cell)) &&
            !l.redirectors.some((x) => P.key(x) === P.key(cell)) &&
            stagedMembers.some((b) =>
              P.trace({ ...l, blocks: stagedBlocks }, [], b).path.includes(
                P.key(cell),
              ),
            ),
        );
        if (!wallCandidates.length) return false;
      }

      return true;
    }

    function searchPeel(currentRemaining, currentAssigned) {
      if (!currentRemaining.length)
        return anneGridLeafIsViable(currentAssigned) ? currentAssigned : null;
      if (++searchNodes > searchBudget) return null;

      const candidates = peelCandidates(currentRemaining, currentAssigned);
      if (!candidates.length) return null;

      // Limit branching, but keep enough alternatives for the final rearranged
      // visual state and required-wall checks to influence the chosen assignment.
      for (const candidate of candidates.slice(0, 10)) {
        const nextRemaining = currentRemaining.filter(
          (item) => item.id !== candidate.b.id,
        );
        const result = searchPeel(
          nextRemaining,
          [...currentAssigned, candidate.b],
        );
        if (result) return result;
      }
      return null;
    }

    const searched = searchPeel(remaining, []);
    if (!searched) return fail("anne-peel");
    assigned = searched;
    remaining = [];
  } else {
    while (remaining.length) {
      const candidates = peelCandidates(remaining, assigned);
      if (!candidates.length) return null;
      const b = candidates[0].b;
      assigned.push(b);
      remaining = remaining.filter((x) => x.id !== b.id);
    }
  }
  l.blocks = assigned
    .sort((a, b) => a.id - b.id)
    .map((b, i) => ({
      ...b,
      color: [
        0xff334b, 0xff7c1a, 0xffd600, 0x1cd747, 0x0091ff, 0xa445f8, 0x36393f,
      ][(i + level * 2) % 7],
    }));
  if (kind === "linked") {
    // Couple unequal clearance times, not two forced free cliff exits.
    const start = P.initial(l),
      ready = start.filter((b) => P.trace(l, start, b).clear),
      blocked = start.filter((b) => !P.trace(l, start, b).clear);
    const a = ready[Math.floor(r() * ready.length)],
      b = blocked[Math.floor(r() * blocked.length)];
    if (!a || !b) return null;
    l.linkedPairs.push({
      id: `v43-link-${level}`,
      a: { q: a.q, r: a.r },
      b: { q: b.q, r: b.r },
    });
  }
  if (mechanism) {
    const dirs = wantSwap ? [mechanism.aDir, mechanism.bDir] : mechanism.dirs;
    const ends = dirs.map((d) => P.step(mechanism, d));
    const members = ends.map((c) =>
      l.blocks.find((b) => P.key(b) === P.key(c)),
    );
    if (members.some((b) => !b)) return fail("mechanism-members");
    // Reverse a real state transition, retaining the arrow on its stone.
    members.forEach((b, i) =>
      Object.assign(b, ends[(i + ends.length - 1) % ends.length]),
    );
    if (kind === "obstacle" || kind === "obstacleCycle") {
      const start = P.initial(l);
      const endpointKeys = new Set(ends.map(P.key));
      const options = l.footprint.filter(
        (c) =>
          !endpointKeys.has(P.key(c)) &&
          !l.pits.some((x) => P.key(x) === P.key(c)) &&
          !l.redirectors.some((x) => P.key(x) === P.key(c)) &&
          members.some((b) => P.trace(l, [], b).path.includes(P.key(c))),
      );
      let placed = false;
      for (const c of shuffle(options, r)) {
        const withWall = {
          ...l,
          obstacles: [c],
          blocks: l.blocks.filter((b) => P.key(b) !== P.key(c)),
        };
        const wallStart = P.initial(withWall);
        const after = P.apply(
          wallStart,
          P.actions(withWall, wallStart).find(
            (a) => a.type === (wantSwap ? "swap" : "cycle"),
          ),
        );
        // Wall blocks an initial arm route, but the intended rearranged position is solvable.
        if (
          start.some((b) => P.trace(withWall, [], b).obstacle === P.key(c)) &&
          P.solve(withWall, {}, 5000, after).solved
        ) {
          l.obstacles = [c];
          l.blocks = withWall.blocks;
          l.floors = l.floors.filter((x) => P.key(x) !== P.key(c));
          placed = true;
          break;
        }
      }
      if (!placed) return fail("wall-placement");
    }
  }
  let visualState = P.initial(l);
  for (
    let orientation = 0;
    orientation < (wantCycle ? 3 : wantSwap ? 2 : 1);
    orientation++
  ) {
    if (P.visualGroups(visualState).some((g) => g.size > 2))
      return fail("visual-orientation");
    const a = P.actions(l, visualState).find(
      (a) => a.type === (wantSwap ? "swap" : "cycle"),
    );
    if (a) visualState = P.apply(visualState, a);
  }

  return l;
}
function reject(m, level, options = {}) {
  const out = [];
  if (m.solvabilityStalled)
    out.push(m.solverExhausted ? "solver-budget" : "unsolvable");
  if (m.maxSameDirectionVisualGroup > 2) out.push("visual-group");
  if (m.nonfunctionalMechanisms.length) out.push("decorative-mechanic");
  if (m.initiallyClearCount < 2) out.push("one-opener");
  if (m.initiallyClearRatio > (level <= 4 ? 0.6 : 0.32))
    out.push("free-opening");
  if (m.trivialEscapeRatio > (level <= 4 ? 0.5 : 0.22))
    out.push("trivial-escape");
  if (m.clearanceWaveCount < (level <= 4 ? 2 : 3) && !m.routeOnlyStalled)
    out.push("shallow");
  if (m.maxForcedRun > (level <= 4 ? 2 : 4)) out.push("forced-run");
  if (m.meaningfulOpeningCount < 2) out.push("meaningless-opening");
  if (level <= 4 && m.dependencyDepth > 5) out.push("tutorial-depth");
  if (options.anneGrid) {
    if (m.initiallyClearRatio > 0.26) out.push("anne-grid-opening");
    if (m.trivialEscapeRatio > 0.16) out.push("anne-grid-trivial");
    if (m.dependencyDepth < 5) out.push("anne-grid-depth");
    if (m.decisionSteps < 9) out.push("anne-grid-decisions");
  }
  return out;
}
function score(m) {
  return (
    m.initiallyClearRatio * 3 +
    m.trivialEscapeRatio * 4 +
    m.maxForcedRun * 0.15 -
    m.decisionSteps * 0.03 -
    m.distinctOpeningFronts * 0.1
  );
}
async function main() {
  const count = Number(process.argv[2]) || 1000,
    levels = [],
    stats = [],
    rejected = {},
    started = Date.now();
  const checkpoint = ".catalog-checkpoint.json";
  const signature = crypto
    .createHash("sha256")
    .update(fs.readFileSync(__filename))
    .update(fs.readFileSync(require.resolve("../src/puzzle-engine.js")))
    .update(fs.readFileSync(require.resolve("../src/topologies.json")))
    .update(String(count))
    .digest("hex");
  if (fs.existsSync(checkpoint)) {
    const previous = JSON.parse(fs.readFileSync(checkpoint));
    if (previous.signature === signature) {
      levels.push(...previous.levels);
      stats.push(...previous.stats);
      Object.assign(rejected, previous.rejected);
      console.log(`Resuming after ${levels.length} verified levels`);
    }
  }
  for (let n = levels.length + 1; n <= count; n++) {
    let best = null,
      bestM = null,
      bestScore = Infinity,
      accepted = 0,
      attempt = 0;
    const reasons = {};
    for (; attempt < 6000; attempt++) {
      const l = draft(n, attempt);
      if (!l) {
        reasons["construction-constraints"] =
          (reasons["construction-constraints"] || 0) + 1;
        continue;
      }
      // Reject exact and near silhouettes in the last eight levels before expensive solving.
      if (
        n > 4 &&
        levels
          .slice(-8)
          .some(
            (x) =>
              P.fingerprint(x.footprint) === P.fingerprint(l.footprint) ||
              (n > 34 && x.patternKey === l.patternKey),
          )
      ) {
        reasons["recent-shape-or-family"] =
          (reasons["recent-shape-or-family"] || 0) + 1;
        continue;
      }
      // Near similarity is computed only for prospective accepted candidates.
      const proof = P.solve(l, {}, 10000);
      if (!proof.solved) {
        reasons[proof.exhausted ? "solver-budget" : "unsolvable"] =
          (reasons[proof.exhausted ? "solver-budget" : "unsolvable"] || 0) + 1;
        continue;
      }
      const m = P.metrics(l, proof),
        violations = reject(m, n);
      if (violations.length) {
        for (const v of violations) reasons[v] = (reasons[v] || 0) + 1;
        continue;
      }
      if (
        n > 4 &&
        levels
          .slice(-8)
          .some((x) => P.similarity(x.footprint, l.footprint) > 0.84)
      ) {
        reasons["near-repeat"] = (reasons["near-repeat"] || 0) + 1;
        continue;
      }
      accepted++;
      const s = score(m);
      if (s < bestScore) {
        best = l;
        bestM = m;
        bestScore = s;
        best.solution = proof.solution;
      }
      if (accepted >= 3) break;
    }
    if (!best) {
      fs.writeFileSync(
        "catalog-failure.json",
        JSON.stringify({ level: n, attempts: attempt, reasons }, null, 2),
      );
      throw Error(
        `No compliant candidate for ${n}: ${JSON.stringify(reasons)}`,
      );
    }
    best.generationStats = {
      ...bestM,
      telemetryVersion: 3,
      generatorVersion: "V43",
      attempts: Math.min(attempt + 1, 6000),
      acceptedCandidates: accepted,
      rejections: reasons,
      qualityPenalty: bestScore,
      qualityAccepted: true,
      difficultyProfile:
        n <= 4
          ? "tutorial"
          : bestM.decisionSteps > 15
            ? "hard"
            : bestM.decisionSteps > 8
              ? "normal"
              : "relaxed",
    };
    levels.push(best);
    stats.push({ level: n, ...best.generationStats });
    for (const [k, v] of Object.entries(reasons))
      rejected[k] = (rejected[k] || 0) + v;
    fs.writeFileSync(
      checkpoint + ".tmp",
      JSON.stringify({ signature, levels, stats, rejected }),
    );
    fs.renameSync(checkpoint + ".tmp", checkpoint);
    if (n % 10 === 0)
      console.log(
        `Generated ${n}/${count} (${((Date.now() - started) / 1000).toFixed(1)}s), last attempts ${Math.min(attempt + 1, 6000)}`,
      );
  }
  fs.mkdirSync("docs/audits", { recursive: true });
  const playable = levels.map(({ solution, ...l }) => {
    const { dependencyPhases, ...generationStats } = l.generationStats;
    return { ...l, generationStats };
  });
  fs.writeFileSync(
    "src/catalog.js",
    "// Generated by npm run catalog:build; do not hand-edit.\nwindow.HEXIVA_CATALOG = " +
      JSON.stringify(playable) +
      ";\n",
  );
  if (fs.existsSync("catalog-failure.json"))
    fs.unlinkSync("catalog-failure.json");
  fs.writeFileSync(
    "docs/audits/v43-generation.json",
    JSON.stringify({ generatorVersion: "V43", count, rejected, stats }),
  );
  fs.unlinkSync(checkpoint);
  console.log(`Catalog saved: ${count}`);
}
if (require.main === module) main();
module.exports = { draft, reject, score };
