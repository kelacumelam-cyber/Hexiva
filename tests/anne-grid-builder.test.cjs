const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../src/puzzle-engine.js");
const { draft } = require("../scripts/build-catalog.cjs");

function firstConstructed(finalLevel, specialIndex, limit = 800) {
  for (let attempt = 0; attempt < limit; attempt++) {
    const level = draft(finalLevel, attempt, {
      anneGrid: true,
      specialIndex,
    });
    if (level) return { level, attempt };
  }
  return null;
}

test("anne-grid drafts keep the chamber large and deliberately sparse", () => {
  for (let specialIndex = 1; specialIndex <= 6; specialIndex++) {
    const built = firstConstructed(5 + specialIndex * 4, specialIndex);
    assert.ok(built, `no constructed anne-grid draft for family ${specialIndex}`);

    const level = built.level;
    assert.ok(level.footprint.length >= 32);
    assert.ok(level.floors.length >= 4);
    assert.ok(level.pits.length >= 2);
    assert.ok(level.blocks.length <= level.footprint.length - 6);
    assert.equal(level.swappers.length + level.cyclers.length, 1);
    assert.ok(P.visualGroups(P.initial(level)).every((group) => group.size <= 2));
  }
});

test("anne-grid draft generation is deterministic for the same slot and attempt", () => {
  const built = firstConstructed(27, 4);
  assert.ok(built);
  assert.deepEqual(
    draft(27, built.attempt, { anneGrid: true, specialIndex: 4 }),
    draft(27, built.attempt, { anneGrid: true, specialIndex: 4 }),
  );
});
