const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('movement uses sequential tumbling for blocked reverse and escape', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(source, /function createTumblingMotionVisual\(block\)/);
  assert.match(source, /for \(let i = 0; i < 3; i\+\+\)/);
  assert.match(source, /function tumbleSegment\(dirIndex, duration, reverse = false\)/);
  assert.match(source, /const sign = reverse \? -1 : 1/);
  assert.match(source, /motion\.tumbleSegment\(segment\.dirIndex, duration, true\)/);
  assert.match(source, /motion\.tumbleSegment\(currentDirIndex, duration, false\)/);
  assert.match(source, /TWEEN\.Easing\.Linear\.None/);
  assert.match(source, /block\.mesh\.visible = false/);
  assert.match(source, /TEST BUILD TAKLALI HAREKET/);
});
