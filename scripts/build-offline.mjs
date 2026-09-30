import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const vendor = path.join(dist, "vendor");

await rm(dist, { recursive: true, force: true });
await mkdir(vendor, { recursive: true });

const tailwindCli = path.join(
  root,
  "node_modules",
  "tailwindcss",
  "lib",
  "cli.js"
);

execFileSync(
  process.execPath,
  [
    tailwindCli,
    "-c", "tailwind.config.cjs",
    "-i", "src/tailwind.css",
    "-o", "dist/app.css",
    "--minify"
  ],
  { stdio: "inherit", cwd: root }
);

await cp(
  path.join(root, "node_modules", "three", "build", "three.min.js"),
  path.join(vendor, "three.min.js")
);

await cp(
  path.join(root, "node_modules", "@tweenjs", "tween.js", "dist", "tween.umd.js"),
  path.join(vendor, "tween.umd.js")
);

await cp(
  path.join(root, "node_modules", "tone", "build", "Tone.js"),
  path.join(vendor, "Tone.js")
);

let html = await readFile(path.join(root, "index.html"), "utf8");

const replacements = [
  [
    '<script src="https://cdn.tailwindcss.com"></script>',
    '<link rel="stylesheet" href="./app.css">'
  ],
  [
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
    '<script src="./vendor/three.min.js"></script>'
  ],
  [
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js"></script>',
    '<script src="./vendor/tween.umd.js"></script>'
  ],
  [
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>',
    '<script src="./vendor/Tone.js"></script>'
  ]
];

for (const [from, to] of replacements) {
  if (!html.includes(from)) {
    throw new Error(`Offline build anchor missing: ${from}`);
  }
  html = html.replace(from, to);
}

// APK/offline build must not depend on Google Fonts.
// The existing CSS already has generic fallbacks after Fredoka.
html = html.replace(
  /\s*<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Fredoka[^"]*" rel="stylesheet">\s*/,
  "\n"
);

// Release artifact must not contain development-only grants.
html = html.replace(
  "    const QA_COIN_GRANT_KEY = 'hexiva-qa-coin-grant-v1';\n",
  ""
);

const qaGrantBlock = /\n\s*\/\/ Temporary development grant: once per browser\/profile, never per refresh\.\n\s*if \(!localStorage\.getItem\(QA_COIN_GRANT_KEY\)\) \{[\s\S]*?\n\s*\}\n/;
if (!qaGrantBlock.test(html)) {
  throw new Error("QA coin grant block not found in source");
}
html = html.replace(qaGrantBlock, "\n");

// Desktop A/S navigation is useful for web QA, never for release.
const debugShortcutBlock = /\n\s*\/\/ TEMP DEBUG SHORTCUTS \(desktop testing only\)[\s\S]*?\n\s*\}\);\n\n\s*const mainMenu = document\.getElementById\('main-menu'\);/;
if (!debugShortcutBlock.test(html)) {
  throw new Error("Desktop debug shortcut block not found in source");
}
html = html.replace(
  debugShortcutBlock,
  "\n\n    const mainMenu = document.getElementById('main-menu');"
);

// Native release uses local persistence only. Remove dormant Firebase imports too.
const cloudModule = /\n\s*<script type="module">[\s\S]*?\/\/ Cloud persistence is optional\.[\s\S]*?<\/script>\n/;
if (!cloudModule.test(html)) {
  throw new Error("Optional Firebase cloud module not found in source");
}
html = html.replace(
  cloudModule,
  '\n  <script>window.cloudSaveHandler = null;<\/script>\n'
);

// Release sanity checks before writing the artifact.
const forbidden = [
  "QA_COIN_GRANT_KEY",
  "TEMP DEBUG SHORTCUTS",
  "www.gstatic.com/firebase",
  "cdn.tailwindcss.com",
  "cdnjs.cloudflare.com",
  "fonts.googleapis.com"
];

for (const token of forbidden) {
  if (html.includes(token)) {
    throw new Error(`Release artifact still contains forbidden token: ${token}`);
  }
}

await writeFile(path.join(dist, "index.html"), html, "utf8");

console.log("Hexiva offline web bundle created in dist/");
