const fs = require("fs");
const vm = require("vm");
const { buildSpecial } = require("./build-anne-grid-catalog.cjs");

function loadCatalog(path) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path, "utf8"), context);
  return JSON.parse(JSON.stringify(context.window.HEXIVA_CATALOG));
}

const kinds = [
  "redirectSwap",
  "obstacleCycle",
  "obstacle",
  "redirectCycle",
  "swap",
  "cycle",
];

function main() {
  const base = loadCatalog("src/catalog.js");
  const accepted = base.slice(0, 7).map((level, index) => ({
    ...level,
    level: index + 1,
  }));

  for (const kind of kinds) {
    const started = Date.now();
    process.stdout.write(`[mechanic probe] ${kind} ... `);
    try {
      const level = buildSpecial(9, 2, accepted, {
        maxAttempts: 360,
        requiredAccepted: 1,
        forceKind: kind,
      });
      console.log(
        `PASS ${((Date.now() - started) / 1000).toFixed(1)}s, attempts=${level.generationStats.attempts}`,
      );
    } catch (error) {
      const message = String(error.message || error);
      const reasons = message.includes(": ") ? message.slice(message.indexOf(": ") + 2) : message;
      console.log(
        `FAIL ${((Date.now() - started) / 1000).toFixed(1)}s ${reasons}`,
      );
    }
  }
}

main();
