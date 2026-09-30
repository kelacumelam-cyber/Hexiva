import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const vendor = path.join(dist, "vendor");

await rm(dist, { recursive: true, force: true });
await mkdir(vendor, { recursive: true });

execFileSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "tailwindcss",
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

await writeFile(path.join(dist, "index.html"), html, "utf8");

console.log("Hexiva offline web bundle created in dist/");
