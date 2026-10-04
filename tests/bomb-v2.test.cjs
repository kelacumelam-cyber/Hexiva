const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Puzzle = require('../src/puzzle-engine.js');

test('bomb center has exactly six unique hex neighbours', () => {
  const cells = Puzzle.neighbours({ q: 3, r: -2 });
  assert.equal(cells.length, 6);

  const keys = new Set(cells.map(c => `${c.q},${c.r}`));
  assert.equal(keys.size, 6);

  assert.deepEqual(
    [...keys].sort(),
    [
      '2,-1',
      '2,-2',
      '3,-1',
      '3,-3',
      '4,-2',
      '4,-3',
    ].sort()
  );
});

test('bomb neighbour relation is symmetric', () => {
  const center = { q: 0, r: 0 };
  for (const neighbour of Puzzle.neighbours(center)) {
    const reverse = Puzzle.neighbours(neighbour)
      .some(cell => cell.q === center.q && cell.r === center.r);
    assert.equal(reverse, true);
  }
});

test('runtime bomb targets empty floor cells instead of a single block', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'index.html'),
    'utf8'
  );

  assert.match(source, /function bombBlastAtCell\(q, r\)/);
  assert.match(source, /activeBombBaseMeshes/);
  assert.match(source, /HexivaPuzzle\.neighbours\(\{ q, r \}\)/);
  assert.match(source, /Bomba yalnız boş gri hücreye konabilir/);
  assert.doesNotMatch(source, /function bombBlastBlock\(/);
  assert.doesNotMatch(source, /Seçilen tek bloğu temizler/);
});
