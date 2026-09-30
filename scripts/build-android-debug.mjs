import { access } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const androidDir = path.join(root, "android");
const wrapper = process.platform === "win32"
  ? path.join(androidDir, "gradlew.bat")
  : path.join(androidDir, "gradlew");

try {
  await access(wrapper);
} catch {
  throw new Error(
    "Android project is missing. Run 'npm run android:add' once before building the debug APK."
  );
}

execFileSync(wrapper, ["assembleDebug"], {
  cwd: androidDir,
  stdio: "inherit"
});

const apk = path.join(
  androidDir,
  "app",
  "build",
  "outputs",
  "apk",
  "debug",
  "app-debug.apk"
);

console.log("");
console.log("Hexiva debug APK:");
console.log(apk);
