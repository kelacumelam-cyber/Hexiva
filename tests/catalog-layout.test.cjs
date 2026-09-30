const test = require("node:test");
const assert = require("node:assert/strict");
const {
  FINAL_LEVEL_COUNT,
  NORMAL_LEVEL_COUNT,
  SPECIAL_LEVEL_COUNT,
  buildCatalogLayout,
} = require("../src/catalog-layout.js");

test("anne-grid layout keeps all 1000 normal levels and inserts 250 specials", () => {
  const layout = buildCatalogLayout();
  assert.equal(layout.length, FINAL_LEVEL_COUNT);
  assert.equal(layout.filter((x) => x.kind === "normal").length, NORMAL_LEVEL_COUNT);
  assert.equal(layout.filter((x) => x.kind === "anne-grid").length, SPECIAL_LEVEL_COUNT);

  const normals = layout.filter((x) => x.kind === "normal").map((x) => x.normalLevel);
  assert.deepEqual(normals, Array.from({ length: 1000 }, (_, i) => i + 1));
});

test("every block of ten contains exactly two non-adjacent anne-grid levels", () => {
  const layout = buildCatalogLayout();

  for (let start = 0; start < layout.length; start += 10) {
    const decade = layout.slice(start, start + 10);
    const specialOffsets = decade
      .map((entry, index) => (entry.kind === "anne-grid" ? index + 1 : null))
      .filter(Boolean);

    assert.equal(specialOffsets.length, 2);
    assert.ok(Math.abs(specialOffsets[1] - specialOffsets[0]) > 1);
  }
});

test("anne-grid levels never touch across ten-level boundaries", () => {
  const specials = buildCatalogLayout()
    .filter((x) => x.kind === "anne-grid")
    .map((x) => x.finalLevel);

  for (let i = 1; i < specials.length; i++) {
    assert.ok(specials[i] - specials[i - 1] > 1);
  }
});
