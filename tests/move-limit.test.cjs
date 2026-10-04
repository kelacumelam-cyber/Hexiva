const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('dynamic move limit and +5 recovery flow are wired', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(source, /function calculateMoveLimit\(generatedLevel\)/);
  assert.match(source, /movesRemaining = movesInitial/);
  assert.match(source, /function consumeMove\(\)/);
  assert.match(source, /function scheduleMovesOverCheck\(\)/);
  assert.match(source, /blocks\.some\(block => block\.isAnimating\)/);
  assert.match(source, /block\.isAnimating = true;\s*playSound\('slide'\)/);
  assert.match(source, /function useExtraMovePack\(\)/);
  assert.match(source, /EXTRA_MOVE_DAILY_LIMIT = 5/);
  assert.match(source, /EXTRA_MOVE_PRICE = 100/);
  assert.match(source, /extraMoveDailyPurchases >= EXTRA_MOVE_DAILY_LIMIT/);
  assert.match(source, /id="moves-over-modal"/);
  assert.match(source, /id="move-display"/);
  assert.match(source, /TEST BUILD HAMLE LİMİTİ/);
});
