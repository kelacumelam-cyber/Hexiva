const FINAL_LEVEL_COUNT = 1250;
const NORMAL_LEVEL_COUNT = 1000;
const SPECIAL_LEVEL_COUNT = 250;

const SPECIAL_PAIRS = [
  [2, 7],
  [3, 8],
  [4, 9],
  [2, 8],
  [3, 9],
];

function specialPositionsForDecade(decadeIndex) {
  return SPECIAL_PAIRS[decadeIndex % SPECIAL_PAIRS.length];
}

function buildCatalogLayout() {
  const layout = [];
  let normalIndex = 0;
  let specialIndex = 0;

  for (let finalLevel = 1; finalLevel <= FINAL_LEVEL_COUNT; finalLevel++) {
    const decadeIndex = Math.floor((finalLevel - 1) / 10);
    const withinDecade = ((finalLevel - 1) % 10) + 1;
    const pair = specialPositionsForDecade(decadeIndex);
    const isSpecial = pair.includes(withinDecade);

    if (isSpecial) {
      specialIndex++;
      layout.push({
        finalLevel,
        kind: "anne-grid",
        specialIndex,
        decadeIndex,
        withinDecade,
      });
    } else {
      normalIndex++;
      layout.push({
        finalLevel,
        kind: "normal",
        normalLevel: normalIndex,
        decadeIndex,
        withinDecade,
      });
    }
  }

  if (normalIndex !== NORMAL_LEVEL_COUNT || specialIndex !== SPECIAL_LEVEL_COUNT) {
    throw new Error(
      `Invalid catalog layout totals: normal=${normalIndex}, special=${specialIndex}`,
    );
  }

  return layout;
}

module.exports = {
  FINAL_LEVEL_COUNT,
  NORMAL_LEVEL_COUNT,
  SPECIAL_LEVEL_COUNT,
  SPECIAL_PAIRS,
  specialPositionsForDecade,
  buildCatalogLayout,
};
