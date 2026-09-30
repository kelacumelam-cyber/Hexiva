const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../src/puzzle-engine.js");
const { FAMILY_COUNT, makeAnneGridShape, connected } = require("../src/anne-grid-shape.js");

test("anne-grid chamber families are large, connected and genuinely distinct", () => {
  const fingerprints = new Set();
  for (let i = 1; i <= FAMILY_COUNT; i++) {
    const shape = makeAnneGridShape(i, 0);
    assert.ok(shape.cells.length >= 32);
    assert.ok(shape.cells.length <= 40);
    assert.equal(connected(shape.cells), true);
    fingerprints.add(P.fingerprint(shape.cells));
  }
  assert.ok(fingerprints.size >= 5);
});

test("anne-grid variants stay connected across deterministic rotations/notches", () => {
  for (let specialIndex = 1; specialIndex <= 30; specialIndex++) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const shape = makeAnneGridShape(specialIndex, attempt);
      assert.ok(shape.cells.length >= 32);
      assert.equal(connected(shape.cells), true);
    }
  }
});
