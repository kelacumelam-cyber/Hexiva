import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const html = await readFile("index.html", "utf8");

const required = [
  "function generateSolvableLevel",
  "function checkCanTapAway",
  "function animateFlyAway",
  "function bombBlastBlock",
  "window.__hexivaAuditCatalog",
  'id="game-canvas"',
  'id="hammer-btn"',
  'id="rotate-btn"',
  'id="bomb-btn"',
];

for (const token of required) {
  if (!html.includes(token)) {
    throw new Error(`Required source token missing: ${token}`);
  }
}

if (html.includes("font-awesome")) {
  throw new Error("Font Awesome dependency unexpectedly returned");
}

const configureAndroid = await readFile("scripts/configure-android.mjs", "utf8");
if (!configureAndroid.includes("android.permission.RECORD_AUDIO")) {
  throw new Error("Android microphone permission is not declared by the packaging configuration");
}

const context = { window: {} };
runInNewContext(await readFile("src/catalog.js", "utf8"), context);
if (context.window.HEXIVA_CATALOG?.length !== 1000) {
  throw new Error("Expected exactly 1000 catalog levels");
}
for (const match of html.matchAll(
  /<script(?![^>]*\bsrc=)(?![^>]*\btype=["']module["'])[^>]*>([\s\S]*?)<\/script>/gi,
)) {
  new Function(match[1]);
}
console.log(
  "Hexiva source sanity check passed (1000 catalog entries, inline scripts parsed).",
);
