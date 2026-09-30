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
  assert.equal(fingerprints.size, FAMILY_COUNT);
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


test("anne-grid families stay below the Work near-repeat threshold", () => {
  const shapes = [];
  for (let i = 1; i <= FAMILY_COUNT; i++) {
    shapes.push(makeAnneGridShape(i, 0));
  }

  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      const similarity = P.similarity(shapes[i].cells, shapes[j].cells);
      assert.ok(
        similarity <= 0.84,
        `families ${i + 1} and ${j + 1} are too similar: ${similarity}`,
      );
    }
  }
});
