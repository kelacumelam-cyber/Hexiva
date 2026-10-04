import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
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

// Web Speech / microphone access needs the Android dangerous permission in the
// generated Capacitor manifest. Keep this idempotent because android:sync may
// run configure-android more than once.
const microphonePermission = '<uses-permission android:name="android.permission.RECORD_AUDIO" />';
try {
  manifest = await readFile(manifestPath, "utf8");
} catch (error) {
  throw new Error(
    "AndroidManifest.xml not found. Run 'npm run android:add' after npm install.",
    { cause: error }
  );
}

if (!manifest.includes(microphonePermission)) {
  manifest = manifest.replace(/<manifest\b[^>]*>/, (full) => full + "\n    " + microphonePermission);
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

// Launcher icon source is intentionally kept as a normal PNG during local
// packaging instead of encoding a large binary into source code. The approved
// Hexiva icon can live in assets/ or be picked up directly from Downloads.
async function configureLauncherIcon() {
  const candidates = [
    path.join(root, "assets", "hexiva-app-icon.png"),
    path.join(root, "hexiva_app_icon_cropped.png"),
    process.env.USERPROFILE
      ? path.join(process.env.USERPROFILE, "Downloads", "hexiva_app_icon_cropped.png")
      : null,
    process.env.USERPROFILE
      ? path.join(process.env.USERPROFILE, "Downloads", "hexiva_app_icon_256.png")
      : null
  ].filter(Boolean);

  let source = null;
  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      source = candidate;
      break;
    }
  }

  if (!source) {
    console.warn(
      "Hexiva launcher icon not found yet. Put hexiva_app_icon_cropped.png in the project root, assets/, or Downloads before the final APK build."
    );
    return;
  }

  const drawableDir = path.join(androidRoot, "app", "src", "main", "res", "drawable-nodpi");
  await mkdir(drawableDir, { recursive: true });
  await cp(source, path.join(drawableDir, "hexiva_app_icon.png"));

  manifest = manifest.replace(/<application\b([^>]*)>/, (full, attrs) => {
    let next = attrs;
    if (/android:icon=/.test(next)) {
      next = next.replace(/android:icon="[^"]*"/, 'android:icon="@drawable/hexiva_app_icon"');
    } else {
      next += ' android:icon="@drawable/hexiva_app_icon"';
    }
    if (/android:roundIcon=/.test(next)) {
      next = next.replace(/android:roundIcon="[^"]*"/, 'android:roundIcon="@drawable/hexiva_app_icon"');
    } else {
      next += ' android:roundIcon="@drawable/hexiva_app_icon"';
    }
    return `<application${next}>`;
  });

  console.log(`Hexiva Android launcher icon configured from: ${source}`);
}

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

await configureLauncherIcon();
await writeFile(manifestPath, manifest, "utf8");
console.log("Android portrait orientation enforced.");

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

const mainJavaPath = path.join(
  androidRoot,
  "app",
  "src",
  "main",
  "java",
  "com",
  "hexiva",
  "game",
  "MainActivity.java"
);

const microphonePluginPath = path.join(
  androidRoot,
  "app",
  "src",
  "main",
  "java",
  "com",
  "hexiva",
  "game",
  "HexivaMicrophonePlugin.java"
);

// The speech-recognition dependency is a normal Capacitor plugin and is
// auto-registered by Capacitor. Remove any stale first-party bridge left by
// earlier experiments and restore the generated MainActivity.
try {
  await access(microphonePluginPath);
  const { unlink } = await import("node:fs/promises");
  await unlink(microphonePluginPath);
  console.log("Removed stale Hexiva microphone bridge.");
} catch {}

const generatedMainActivity = `package com.hexiva.game;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {}
`;

await writeFile(mainJavaPath, generatedMainActivity, "utf8");
console.log("Android MainActivity restored to the Capacitor default.");

await configureSdkLocation();

