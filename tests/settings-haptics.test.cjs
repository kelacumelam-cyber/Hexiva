const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('settings persist sound volume and vibration preference', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(source, /const SETTINGS_SAVE_KEY = 'hexiva-settings-v1'/);
  assert.match(source, /id="sound-volume"/);
  assert.match(source, /id="vibration-toggle"/);
  assert.match(source, /function saveSettings\(\)/);
  assert.match(source, /function loadSettings\(\)/);
  assert.match(source, /function vibrateImpact\(\)/);
  assert.match(source, /navigator\.vibrate\(65\)/);
  assert.match(source, /playSound\('blocked'\);\s*vibrateImpact\(\);/);
  assert.match(source, /TEST BUILD AYARLAR \+ TİTREŞİM/);
});
