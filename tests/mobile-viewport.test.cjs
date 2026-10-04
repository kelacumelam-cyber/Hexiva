const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('compact Android viewport keeps boosters separate and caps small-board scale', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(source, /function getLiveViewportSize\(\)/);
  assert.match(source, /window\.visualViewport/);
  assert.match(source, /--hexiva-viewport-height/);
  assert.match(source, /flex-wrap:\s*nowrap/);
  assert.match(source, /\.booster-row\s*>\s*div[\s\S]*flex:\s*0 0 auto/);
  assert.match(source, /const compactPhone = width < 370 \|\| height < 720/);
  assert.match(source, /compactPhone \? 0\.80 : 0\.86/);
  assert.match(source, /Math\.min\(\s*maxBoardScale,/);
  assert.match(source, /TEST BUILD M12 UYUMU: \+100 Altın/);
});
