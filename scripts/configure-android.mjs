import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const manifestPath = path.join(
  process.cwd(),
  "android",
  "app",
  "src",
  "main",
  "AndroidManifest.xml"
);

let manifest;
try {
  manifest = await readFile(manifestPath, "utf8");
} catch (error) {
  throw new Error(
    "AndroidManifest.xml not found. Run 'npm run android:add' after npm install.",
    { cause: error }
  );
}

const activityPattern = /<activity\b([^>]*android:name="\.MainActivity"[^>]*)>/;

if (!activityPattern.test(manifest)) {
  throw new Error("Could not find .MainActivity in AndroidManifest.xml");
}

manifest = manifest.replace(activityPattern, (full, attrs) => {
  if (/android:screenOrientation=/.test(attrs)) {
    return full.replace(
      /android:screenOrientation="[^"]*"/,
      'android:screenOrientation="portrait"'
    );
  }
  return `<activity${attrs} android:screenOrientation="portrait">`;
});

await writeFile(manifestPath, manifest, "utf8");
console.log("Android portrait orientation enforced.");
