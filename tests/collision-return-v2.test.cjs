const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('blocked collision uses three-piece travel and symmetric reverse timing', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(source, /function createBlockedMotionVisual\(block, dirIndex\)/);
  assert.match(source, /for \(let i = 0; i < 3; i\+\+\)/);
  assert.match(source, /block\.mesh\.visible = false/);
  assert.match(source, /const motionMsPerWorldUnit = 155/);
  assert.match(source, /TWEEN\.Easing\.Linear\.None/);
  assert.match(source, /const blockFaceRadius = HEX_RADIUS \* 0\.88 \* Math\.cos\(Math\.PI \/ 6\)/);
  assert.match(source, /motion\.close\(\(\) =>/);
  assert.match(source, /block\.mesh\.visible = true/);
  assert.doesNotMatch(source, /Rebound is intentionally much faster than the outward swim/);
});
