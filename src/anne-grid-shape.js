const FAMILY_COUNT = 8;

const D = [
  { q: 0, r: -1 },
  { q: 1, r: -1 },
  { q: 1, r: 0 },
  { q: 0, r: 1 },
  { q: -1, r: 1 },
  { q: -1, r: 0 },
];

const key = (c) => `${c.q},${c.r}`;
const step = (c, d) => ({ q: c.q + D[d].q, r: c.r + D[d].r });
const hexDistance = (c) =>
  Math.max(Math.abs(c.q), Math.abs(c.r), Math.abs(-c.q - c.r));

function connected(cells) {
  if (!cells.length) return false;
  const all = new Set(cells.map(key));
  const seen = new Set([key(cells[0])]);
  const queue = [cells[0]];
  while (queue.length) {
    const c = queue.pop();
    for (let d = 0; d < 6; d++) {
      const n = step(c, d);
      const k = key(n);
      if (all.has(k) && !seen.has(k)) {
        seen.add(k);
        queue.push(n);
      }
    }
  }
  return seen.size === cells.length;
}

function rotate(c, turns) {
  let out = { ...c };
  for (let i = 0; i < turns; i++) out = { q: -out.r, r: out.q + out.r };
  return out;
}

function baseDisk(radius = 2) {
  const cells = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const c = { q, r };
      if (hexDistance(c) <= radius) cells.push(c);
    }
  }
  return cells;
}

// Ordered radius-3 / radius-4 perimeter cells. Families share only the compact
// radius-2 chamber core; their outer profiles differ substantially so canonical
// rotation/reflection comparison treats them as genuinely different footprints.
const RING3 = [
  [-3, 1], [-3, 0], [-2, -1], [-1, -2], [0, -3], [1, -3],
  [2, -3], [3, -3], [3, -2], [3, -1], [3, 0], [2, 1],
  [1, 2], [0, 3], [-1, 3], [-2, 3], [-3, 3], [-3, 2],
].map(([q, r]) => ({ q, r }));

const RING4 = [
  [-4, 1], [-4, 0], [-3, -1], [-2, -2], [-1, -3], [0, -4],
  [1, -4], [2, -4], [3, -4], [4, -4], [4, -3], [4, -2],
  [4, -1], [4, 0], [3, 1], [2, 2], [1, 3], [0, 4],
  [-1, 4], [-2, 4], [-3, 4], [-4, 4], [-4, 3], [-4, 2],
].map(([q, r]) => ({ q, r }));

const FAMILY_RING3 = [
  [0, 1, 2, 3, 4, 5, 8, 9, 10, 13, 14],
  [0, 1, 4, 5, 6, 7, 8, 11, 12, 13, 16],
  [1, 2, 3, 6, 7, 10, 11, 12, 15, 16],
  [1, 2, 4, 6, 8, 10, 11, 12, 14, 15],
  [0, 3, 5, 6, 7, 8, 9, 10, 12, 13, 15],
  [0, 1, 4, 7, 8, 11, 12, 13, 16, 17],
  [2, 4, 5, 6, 8, 10, 11, 12, 13, 16],
  [1, 3, 4, 5, 6, 8, 10, 15, 16, 17],
];

const FAMILY_RING4 = [
  [0, 1, 5, 13],
  [1, 6, 9, 17, 21],
  [2, 3, 9, 14, 20],
  [0, 3, 4, 12, 18],
  [3, 4, 20, 23],
  [0, 5, 9, 15, 21],
  [2, 7, 11, 15, 17],
  [4, 8, 12, 21, 23],
];

function makeAnneGridShape(specialIndex, attempt = 0, options = {}) {
  // Keep early attempts on the slot's preferred family, then rotate through
  // other chamber topologies. Recently used families are skipped before any
  // expensive arrow/mechanic construction begins.
  const familyBucket = Math.floor(attempt / 48);
  const preferredFamily =
    (specialIndex - 1 + familyBucket) % FAMILY_COUNT;
  const avoided = new Set(options.avoidFamilyIndexes || []);
  let familyIndex = preferredFamily;
  for (let offset = 0; offset < FAMILY_COUNT; offset++) {
    const candidate = (preferredFamily + offset) % FAMILY_COUNT;
    if (!avoided.has(candidate)) {
      familyIndex = candidate;
      break;
    }
  }

  const cells = [
    ...baseDisk(2),
    ...FAMILY_RING3[familyIndex].map((i) => RING3[i]),
    ...FAMILY_RING4[familyIndex].map((i) => RING4[i]),
  ].map((c) => ({ ...c }));

  const rotation =
    (Math.floor((specialIndex - 1) / FAMILY_COUNT) + attempt) % 6;
  const rotated = cells.map((c) => rotate(c, rotation));
  const unique = [...new Map(rotated.map((c) => [key(c), c])).values()];

  if (!connected(unique)) throw new Error("anne-grid shape disconnected");

  return {
    family: `anneGridChamber${familyIndex + 1}`,
    familyIndex,
    cells: unique,
  };
}

module.exports = {
  FAMILY_COUNT,
  makeAnneGridShape,
  connected,
};
