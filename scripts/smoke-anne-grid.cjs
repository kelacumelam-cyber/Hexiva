const fs = require("fs");
const vm = require("vm");
const P = require("../src/puzzle-engine.js");
const { buildSpecial } = require("./build-anne-grid-catalog.cjs");
const { buildCatalogLayout } = require("../src/catalog-layout.js");

function loadCatalog(path) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path, "utf8"), context);
  return JSON.parse(JSON.stringify(context.window.HEXIVA_CATALOG));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function main() {
  const targetSpecials = Math.max(1, Math.min(30, Number(process.argv[2]) || 4));
  const base = loadCatalog("src/catalog.js");
  if (base.length !== 1000)
    throw new Error(`Smoke expects untouched 1000-level base catalog, got ${base.length}`);

  const output = [];
  const layout = buildCatalogLayout();
  const rows = [];

  for (const slot of layout) {
    if (slot.kind === "normal") {
      const normal = clone(base[slot.normalLevel - 1]);
      normal.level = slot.finalLevel;
      output.push(normal);
      continue;
    }

    console.log(`[anne-grid smoke] generating special ${slot.specialIndex} at final level ${slot.finalLevel}...`);
    const started = Date.now();
    const level = buildSpecial(slot.finalLevel, slot.specialIndex, output, {
      maxAttempts: 1800,
      requiredAccepted: 1,
    });
    console.log(
      `[anne-grid smoke] special ${slot.specialIndex} ready in ${((Date.now() - started) / 1000).toFixed(1)}s after ${level.generationStats.attempts} attempts`,
    );
    level.level = slot.finalLevel;
    output.push(level);

    const proof = P.solve(level, {}, 20000);
    const m = P.metrics(level, proof);
    rows.push({
      finalLevel: slot.finalLevel,
      specialIndex: slot.specialIndex,
      family: level.patternKey,
      blocks: m.blockCount,
      floors: level.floors.length,
      pits: level.pits.length,
      redirects: level.redirectors.length,
      swaps: level.swappers.length,
      cycles: level.cyclers.length,
      obstacles: level.obstacles.length,
      depth: m.dependencyDepth,
      decisions: m.decisionSteps,
      maxVisualGroup: m.maxSameDirectionVisualGroup,
      openings: Number(m.initiallyClearRatio.toFixed(3)),
      trivial: Number(m.trivialEscapeRatio.toFixed(3)),
      attempts: level.generationStats.attempts,
    });

    if (rows.length >= targetSpecials) break;
  }

  if (rows.length !== targetSpecials)
    throw new Error(`Expected ${targetSpecials} smoke specials, got ${rows.length}`);

  console.table(rows);
  console.log(
    `Anne-grid smoke passed: ${rows.length} compliant specials generated without modifying src/catalog.js`,
  );
}

if (require.main === module) main();
