const fs = require("fs");
const vm = require("vm");
const P = require("../src/puzzle-engine.js");
const { draft, reject, score } = require("./build-catalog.cjs");
const {
  FINAL_LEVEL_COUNT,
  NORMAL_LEVEL_COUNT,
  SPECIAL_LEVEL_COUNT,
  buildCatalogLayout,
} = require("../src/catalog-layout.js");

const SOURCE_CATALOG = "src/catalog.js";
const OUTPUT_CATALOG = "src/catalog-anne-grid-preview.js";
const OUTPUT_AUDIT = "docs/audits/anne-grid-generation.json";
const MAX_ATTEMPTS = 12000;
const REQUIRED_ACCEPTED = 3;

function loadCatalog(path) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path, "utf8"), context);
  return JSON.parse(JSON.stringify(context.window.HEXIVA_CATALOG));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function recentShapeViolation(levels, candidate) {
  return levels.slice(-8).some((other) => {
    if (P.fingerprint(other.footprint) === P.fingerprint(candidate.footprint))
      return true;
    if (other.patternKey === candidate.patternKey) return true;
    return P.similarity(other.footprint, candidate.footprint) > 0.84;
  });
}

function buildSpecial(finalLevel, specialIndex, acceptedLevels) {
  let best = null;
  let bestMetrics = null;
  let bestScore = Infinity;
  let accepted = 0;
  const reasons = {};
  let attempt = 0;

  for (; attempt < MAX_ATTEMPTS; attempt++) {
    const beforeConstructionRejects = Object.values(reasons).reduce(
      (sum, value) => sum + value,
      0,
    );
    const candidate = draft(finalLevel, attempt, {
      anneGrid: true,
      specialIndex,
      failureStats: reasons,
    });
    if (!candidate) {
      const afterConstructionRejects = Object.values(reasons).reduce(
        (sum, value) => sum + value,
        0,
      );
      if (afterConstructionRejects === beforeConstructionRejects) {
        reasons["construction-constraints"] =
          (reasons["construction-constraints"] || 0) + 1;
      }
      continue;
    }

    if (recentShapeViolation(acceptedLevels, candidate)) {
      reasons["recent-shape-or-family"] =
        (reasons["recent-shape-or-family"] || 0) + 1;
      continue;
    }

    const proof = P.solve(candidate, {}, 20000);
    if (!proof.solved) {
      const reason = proof.exhausted ? "solver-budget" : "unsolvable";
      reasons[reason] = (reasons[reason] || 0) + 1;
      continue;
    }

    const metrics = P.metrics(candidate, proof);
    const violations = reject(metrics, finalLevel, { anneGrid: true });
    if (violations.length) {
      for (const reason of violations)
        reasons[reason] = (reasons[reason] || 0) + 1;
      continue;
    }

    accepted++;
    const candidateScore = score(metrics);
    if (candidateScore < bestScore) {
      best = candidate;
      bestMetrics = metrics;
      bestScore = candidateScore;
      best.solution = proof.solution;
    }
    if (accepted >= REQUIRED_ACCEPTED) break;
  }

  if (!best) {
    throw new Error(
      `No compliant anne-grid candidate for final level ${finalLevel} / special ${specialIndex}: ${JSON.stringify(reasons)}`,
    );
  }

  best.generationStats = {
    ...bestMetrics,
    telemetryVersion: 4,
    generatorVersion: "V43-ANNE-GRID-V1",
    anneGrid: true,
    specialIndex,
    attempts: Math.min(attempt + 1, MAX_ATTEMPTS),
    acceptedCandidates: accepted,
    rejections: reasons,
    qualityPenalty: bestScore,
    qualityAccepted: true,
    difficultyProfile: "hard",
  };

  return best;
}

function main() {
  const base = loadCatalog(SOURCE_CATALOG);
  if (base.length !== NORMAL_LEVEL_COUNT) {
    throw new Error(
      `Expected untouched ${NORMAL_LEVEL_COUNT}-level V43 base catalog, got ${base.length}. Refusing to overwrite or rebase from an unknown source.`,
    );
  }

  const layout = buildCatalogLayout();
  const output = [];
  const specialStats = [];

  for (const slot of layout) {
    if (slot.kind === "normal") {
      const normal = clone(base[slot.normalLevel - 1]);
      normal.level = slot.finalLevel;
      normal.generationStats = {
        ...normal.generationStats,
        sourceLevel: slot.normalLevel,
        anneGrid: false,
      };
      output.push(normal);
      continue;
    }

    const special = buildSpecial(
      slot.finalLevel,
      slot.specialIndex,
      output,
    );
    special.level = slot.finalLevel;
    output.push(special);
    specialStats.push({
      level: slot.finalLevel,
      specialIndex: slot.specialIndex,
      patternKey: special.patternKey,
      blockCount: special.generationStats.blockCount,
      dependencyDepth: special.generationStats.dependencyDepth,
      decisionSteps: special.generationStats.decisionSteps,
      initiallyClearRatio: special.generationStats.initiallyClearRatio,
      trivialEscapeRatio: special.generationStats.trivialEscapeRatio,
      mechanisms: special.generationStats.mechanisms.map((m) => ({
        type: m.type,
        functional: m.functional,
      })),
      attempts: special.generationStats.attempts,
    });

    if (slot.specialIndex % 10 === 0)
      console.log(
        `Generated anne-grid ${slot.specialIndex}/${SPECIAL_LEVEL_COUNT} at final level ${slot.finalLevel}`,
      );
  }

  if (output.length !== FINAL_LEVEL_COUNT)
    throw new Error(`Expected ${FINAL_LEVEL_COUNT} final levels, got ${output.length}`);

  const playable = output.map(({ solution, ...level }) => {
    if (!level.generationStats) return level;
    const { dependencyPhases, ...generationStats } = level.generationStats;
    return { ...level, generationStats };
  });

  fs.mkdirSync("docs/audits", { recursive: true });
  fs.writeFileSync(
    OUTPUT_CATALOG,
    "// Preview generated by scripts/build-anne-grid-catalog.cjs; not loaded by the live game.\nwindow.HEXIVA_CATALOG = " +
      JSON.stringify(playable) +
      ";\n",
  );
  fs.writeFileSync(
    OUTPUT_AUDIT,
    JSON.stringify(
      {
        generatorVersion: "V43-ANNE-GRID-V1",
        finalLevels: FINAL_LEVEL_COUNT,
        normalLevels: NORMAL_LEVEL_COUNT,
        specialLevels: SPECIAL_LEVEL_COUNT,
        specialStats,
      },
      null,
      2,
    ),
  );

  console.log(
    `Preview saved: ${OUTPUT_CATALOG} (${NORMAL_LEVEL_COUNT} preserved normal + ${SPECIAL_LEVEL_COUNT} anne-grid)`,
  );
}

if (require.main === module) main();
module.exports = { buildSpecial, recentShapeViolation };
