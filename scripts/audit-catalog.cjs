const fs = require("fs"),
  vm = require("vm"),
  assert = require("assert/strict"),
  P = require("../src/puzzle-engine.js"),
  { reject } = require("./build-catalog.cjs");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("src/catalog.js", "utf8"), context);
const catalog = JSON.parse(JSON.stringify(context.window.HEXIVA_CATALOG));
const html = fs.readFileSync("index.html", "utf8"),
  routeSource = html.slice(
    html.indexOf("    function checkCanTapAway("),
    html.indexOf("    function getLinkedPairForBlock("),
  );
const dirs = P.D.map(([dq, dr]) => ({ dq, dr }));
const rt = { HEX_DIRECTIONS: dirs, console };
vm.createContext(rt);
vm.runInContext(routeSource, rt);
function parity(l, bs) {
  rt.activeBoardFootprint = new Set(l.footprint.map(P.key));
  rt.activePitCells = new Set(l.pits.map(P.key));
  rt.activeObstacleMap = new Map(l.obstacles.map((c) => [P.key(c), c]));
  rt.activeRedirectors = new Map(l.redirectors.map((c) => [P.key(c), c]));
  rt.blocks = bs;
  let checked = 0;
  for (const b of bs)
    for (let dirIndex = 0; dirIndex < 6; dirIndex++) {
      const test = { ...b, dirIndex },
        actual = rt.checkCanTapAway(test),
        expected = P.trace(l, bs, test);
      assert.equal(
        actual.canFly,
        expected.clear,
        `route mismatch level ${l.level} cell ${P.key(b)} dir ${dirIndex}`,
      );
      if (expected.clear) assert.equal(actual.escapeType, expected.escape);
      else if (expected.obstacle)
        assert.equal(
          `${actual.blockerQ},${actual.blockerR}`,
          expected.obstacle,
        );
      else if (expected.blocker !== undefined)
        assert.equal(actual.blocker.id, expected.blocker);
      checked++;
    }
  return checked;
}
const violations = [],
  rows = [],
  repeats = [],
  nearRepeats = [],
  familyRepeats = [],
  seen = new Map();
let parityChecks = 0;
const mechanismCounts = {},
  mechanicFailures = [],
  openingOutcomes = [];
for (const l of catalog) {
  const proof = P.solve(l),
    m = P.metrics(l, proof),
    bad = reject(m, l.level);
  if (bad.length) violations.push({ level: l.level, reasons: bad });
  assert.equal(proof.exhausted, false, `budget exhausted ${l.level}`);
  let bs = P.initial(l);
  parityChecks += parity(l, bs);
  let orientationState = bs;
  const orientationGroups = [];
  for (let o = 0; o < 3; o++) {
    const groups = P.visualGroups(orientationState);
    orientationGroups.push(Math.max(...groups.map((g) => g.size)));
    if (groups.some((g) => g.size > 2))
      violations.push({ level: l.level, reasons: ["rearranged-visual-group"] });
    const a = P.actions(l, orientationState).find(
      (a) => a.type === "swap" || a.type === "cycle",
    );
    if (!a) break;
    orientationState = P.apply(orientationState, a);
    parityChecks += parity(l, orientationState);
  }
  const affectedStones = new Map(
    m.mechanisms.map((mechanic) => [
      mechanic.type + ":" + mechanic.index,
      new Set(),
    ]),
  );
  for (const a of proof.solution || []) {
    for (const mechanic of m.mechanisms)
      if (mechanic.type === "obstacle")
        for (const b of bs)
          if (P.trace(l, bs, b).obstacle === mechanic.cell)
            affectedStones.get(mechanic.type + ":" + mechanic.index).add(b.id);
    assert(
      P.actions(l, bs).some((x) => JSON.stringify(x) === JSON.stringify(a)),
    );
    bs = P.apply(bs, a);
    parityChecks += parity(l, bs);
    assert(P.visualGroups(bs).every((g) => g.size <= 2));
  }
  for (const mechanic of m.mechanisms)
    if (mechanic.type === "obstacle")
      mechanic.distinctAffectedStoneCount = affectedStones.get(
        mechanic.type + ":" + mechanic.index,
      ).size;
  assert.equal(bs.length, 0, `incomplete certificate ${l.level}`);
  const legal = P.actions(l, P.initial(l));
  const outcomes = legal.map((a) => {
    const result = P.solve(l, {}, 20000, P.apply(P.initial(l), a));
    return {
      type: a.type,
      cell: a.cell,
      solvable: result.solved,
      unknown: result.exhausted,
    };
  });
  openingOutcomes.push({ level: l.level, actions: outcomes });
  const f = m.footprintFingerprint;
  if (seen.has(f))
    repeats.push({
      level: l.level,
      previous: seen.get(f),
      gap: l.level - seen.get(f),
    });
  seen.set(f, l.level);
  for (const other of catalog.slice(Math.max(0, l.level - 9), l.level - 1)) {
    if (l.level <= 4) continue;
    const similarity = P.similarity(other.footprint, l.footprint);
    if (similarity > 0.84)
      nearRepeats.push({
        level: l.level,
        previous: other.level,
        gap: l.level - other.level,
        similarity,
      });
    if (l.level > 34 && other.patternKey === l.patternKey)
      familyRepeats.push({
        level: l.level,
        previous: other.level,
        gap: l.level - other.level,
      });
  }
  for (const mechanic of m.mechanisms) {
    mechanismCounts[mechanic.type] = (mechanismCounts[mechanic.type] || 0) + 1;
    if (!mechanic.functional)
      mechanicFailures.push({ level: l.level, ...mechanic });
  }
  rows.push({
    level: l.level,
    patternKey: l.patternKey,
    ...m,
    openingOutcomes: outcomes,
    orientationGroups,
  });
  if (l.level % 100 === 0) console.log(`Audited ${l.level}/${catalog.length}`);
}
const sort = (k, n = 12) =>
  [...rows]
    .sort((a, b) => b[k] - a[k])
    .slice(0, n)
    .map((x) => ({ level: x.level, value: x[k] }));
const summary = {
  generatorVersion: "V43",
  auditedLevels: catalog.length,
  qualityViolations: violations,
  solvabilityStalls: rows
    .filter((x) => x.solvabilityStalled)
    .map((x) => x.level),
  visualViolations: rows
    .filter((x) => x.maxSameDirectionVisualGroup > 2)
    .map((x) => x.level),
  exactFootprintRepeats: repeats,
  minimumExactRepeatGap: repeats.length
    ? Math.min(...repeats.map((x) => x.gap))
    : null,
  nearFootprintRepeatsWithin8: nearRepeats,
  familyRepeatsWithin8: familyRepeats,
  excessiveOpenings: rows
    .filter((x) => x.initiallyClearRatio > (x.level <= 4 ? 0.6 : 0.32))
    .map((x) => x.level),
  excessiveTrivialEscapes: rows
    .filter((x) => x.trivialEscapeRatio > (x.level <= 4 ? 0.5 : 0.22))
    .map((x) => x.level),
  mechanismCounts,
  nonfunctionalMechanisms: mechanicFailures,
  unaffectedObstacleLevels: rows
    .filter((x) =>
      x.mechanisms.some((m) => m.type === "obstacle" && m.affectedRoutes === 0),
    )
    .map((x) => x.level),
  runtimeRouteParityChecks: parityChecks,
  openingOutcomeUnknowns: openingOutcomes
    .filter((x) => x.actions.some((a) => a.unknown))
    .map((x) => x.level),
  levelsWithLosingOpening: openingOutcomes
    .filter((x) => x.actions.some((a) => !a.solvable && !a.unknown))
    .map((x) => x.level),
  maxForcedRun: Math.max(...rows.map((x) => x.maxForcedRun)),
  maximumVisualGroup: Math.max(
    ...rows.map((x) => x.maxSameDirectionVisualGroup),
  ),
  averageDependencyDepth:
    rows.reduce((s, x) => s + x.dependencyDepth, 0) / rows.length,
  dependencyByBand: [
    [1, 4],
    [5, 34],
    [35, 100],
    [101, 300],
    [301, 1000],
  ].map(([start, end]) => {
    const group = rows.filter((x) => x.level >= start && x.level <= end);
    return {
      start,
      end,
      count: group.length,
      averageDepth:
        group.reduce((s, x) => s + x.dependencyDepth, 0) / group.length,
      averageDecisionSteps:
        group.reduce((s, x) => s + x.decisionSteps, 0) / group.length,
    };
  }),
  representatives: {
    mostFreeOpeners: sort("initiallyClearRatio"),
    mostTrivial: sort("trivialEscapeRatio"),
    deepest: sort("dependencyDepth"),
    longestForced: sort("maxForcedRun"),
    obstacles: rows
      .filter((x) => x.mechanisms.some((m) => m.type === "obstacle"))
      .slice(0, 12)
      .map((x) => x.level),
  },
  webPlaytest: {
    status: "blocked",
    reason:
      "Remote Chrome: THREE.WebGLRenderer Error creating WebGL context; reproduced on unchanged V42.6 and after one reload. No levels claimed visually played.",
  },
};
fs.mkdirSync("docs/audits", { recursive: true });
fs.writeFileSync(
  "docs/audits/v43-summary.json",
  JSON.stringify(summary, null, 2),
);
fs.writeFileSync("docs/audits/v43-levels.json", JSON.stringify(rows));
console.log(JSON.stringify(summary, null, 2));
if (
  catalog.length !== 1000 ||
  violations.length ||
  nearRepeats.length ||
  familyRepeats.length ||
  mechanicFailures.length
)
  process.exitCode = 1;
