const FAMILY_COUNT = 6;

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

function baseDisk(radius = 3) {
  const cells = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const c = { q, r };
      if (hexDistance(c) <= radius) cells.push(c);
    }
  }
  return cells;
}

const FAMILY_CUTS = [
  [{ q: 0, r: -3 }, { q: 3, r: -3 }, { q: -3, r: 1 }],
  [{ q: -1, r: -2 }, { q: 3, r: -1 }, { q: -2, r: 3 }],
  [{ q: 2, r: -3 }, { q: -3, r: 2 }, { q: 1, r: 2 }],
  [{ q: -2, r: -1 }, { q: 2, r: -2 }, { q: 0, r: 3 }],
  [{ q: 1, r: -3 }, { q: -3, r: 0 }, { q: 2, r: 1 }],
  [{ q: -1, r: 3 }, { q: 3, r: -2 }, { q: -2, r: 0 }],
];

const FAMILY_LOBES = [
  [{ q: 0, r: -4 }, { q: 1, r: -4 }],
  [{ q: 4, r: -2 }, { q: 4, r: -1 }],
  [{ q: 3, r: 1 }, { q: 2, r: 2 }],
  [{ q: 0, r: 4 }, { q: -1, r: 4 }],
  [{ q: -4, r: 2 }, { q: -4, r: 1 }],
  [{ q: -3, r: -1 }, { q: -2, r: -2 }],
];

function makeAnneGridShape(specialIndex, attempt = 0) {
  const familyIndex = (specialIndex - 1) % FAMILY_COUNT;
  const rotation = (Math.floor((specialIndex - 1) / FAMILY_COUNT) + attempt) % 6;
  let cells = baseDisk(3);

  const removeSet = new Set(FAMILY_CUTS[familyIndex].map(key));
  cells = cells.filter((c) => !removeSet.has(key(c)));

  for (const lobe of FAMILY_LOBES[familyIndex]) {
    if (!cells.some((c) => key(c) === key(lobe))) cells.push({ ...lobe });
  }

  // A deterministic boundary notch varies siblings without copying a fixed reference shape.
  const boundary = cells
    .filter((c) => hexDistance(c) >= 3)
    .sort((a, b) => key(a).localeCompare(key(b)));
  const notch = boundary[(specialIndex * 7 + attempt * 11) % boundary.length];
  if (notch) {
    const candidate = cells.filter((c) => key(c) !== key(notch));
    if (candidate.length >= 32 && connected(candidate)) cells = candidate;
  }

  cells = cells.map((c) => rotate(c, rotation));
  const unique = [...new Map(cells.map((c) => [key(c), c])).values()];

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
