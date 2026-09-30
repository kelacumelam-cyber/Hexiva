import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const androidRoot = path.join(root, "android");
const manifestPath = path.join(
  androidRoot,
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

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function configureSdkLocation() {
  const localPropertiesPath = path.join(androidRoot, "local.properties");

  if (await pathExists(localPropertiesPath)) {
    console.log("Android SDK location already configured.");
    return;
  }

  const candidates = [];

  if (process.env.ANDROID_HOME) candidates.push(process.env.ANDROID_HOME);
  if (process.env.ANDROID_SDK_ROOT) candidates.push(process.env.ANDROID_SDK_ROOT);

  if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    candidates.push(path.join(process.env.LOCALAPPDATA, "Android", "Sdk"));
  }

  if (process.platform === "darwin" && process.env.HOME) {
    candidates.push(path.join(process.env.HOME, "Library", "Android", "sdk"));
  }

  if (process.platform !== "win32" && process.platform !== "darwin" && process.env.HOME) {
    candidates.push(path.join(process.env.HOME, "Android", "Sdk"));
  }

  for (const candidate of candidates) {
    if (!candidate || !(await pathExists(candidate))) continue;

    const normalized = path.resolve(candidate).replace(/\\/g, "/");
    await writeFile(
      localPropertiesPath,
      `sdk.dir=${normalized}\n`,
      "utf8"
    );
    console.log(`Android SDK location configured: ${normalized}`);
    return;
  }

  console.warn(
    "Android SDK was not found automatically. Install Android Studio / Android SDK or set ANDROID_HOME, then run android:sync again."
  );
}

await configureSdkLocation();

