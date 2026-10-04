const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('blocked collision uses physical contact and faster rebound tuning', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(source, /const blockFaceRadius = HEX_RADIUS \* 0\.88 \* Math\.cos\(Math\.PI \/ 6\)/);
  assert.match(source, /const contactAdvance = Math\.max\(0\.18, dirLen - \(blockFaceRadius \* 2\)\)/);
  assert.match(source, /Math\.max\(55, Math\.min\(145, 42 \+ distance \* 27\)\)/);
  assert.match(source, /TWEEN\.Easing\.Cubic\.Out/);
  assert.match(source, /wall-touch compression/);
});
