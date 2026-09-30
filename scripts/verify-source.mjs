import { readFile } from "node:fs/promises";

const html = await readFile("index.html", "utf8");

const required = [
  "function generateSolvableLevel",
  "function checkCanTapAway",
  "function animateFlyAway",
  "function bombBlastBlock",
  "window.__hexivaAuditCatalog",
  "id=\"game-canvas\"",
  "id=\"hammer-btn\"",
  "id=\"rotate-btn\"",
  "id=\"bomb-btn\""
];

for (const token of required) {
  if (!html.includes(token)) {
    throw new Error(`Required source token missing: ${token}`);
  }
}

if (html.includes("font-awesome")) {
  throw new Error("Font Awesome dependency unexpectedly returned");
}

console.log("Hexiva source sanity check passed.");
