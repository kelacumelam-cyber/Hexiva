import { access, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const androidDir = path.join(root, "android");
const wrapper = process.platform === "win32"
  ? path.join(androidDir, "gradlew.bat")
  : path.join(androidDir, "gradlew");


async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function javaExecutable(jdkHome) {
  return path.join(jdkHome, "bin", process.platform === "win32" ? "java.exe" : "java");
}

function parseJavaMajor(output) {
  const match = String(output).match(/version\s+"(\d+)(?:\.(\d+))?/i);
  if (!match) return null;
  const first = Number(match[1]);
  const second = Number(match[2] || 0);
  return first === 1 ? second : first;
}

async function detectJdk21() {
  const candidates = [];

  if (process.env.JAVA_HOME) candidates.push(process.env.JAVA_HOME);
  if (process.env.JDK_HOME) candidates.push(process.env.JDK_HOME);

  if (process.platform === "win32") {
    const programFiles = process.env.ProgramFiles || "C:\\Program Files";
    candidates.push(
      path.join(programFiles, "Android", "Android Studio", "jbr"),
      path.join(programFiles, "Android", "Android Studio", "jre")
    );

    const javaRoot = path.join(programFiles, "Java");
    if (await pathExists(javaRoot)) {
      for (const entry of await readdir(javaRoot, { withFileTypes: true })) {
        if (entry.isDirectory()) candidates.push(path.join(javaRoot, entry.name));
      }
    }
  } else if (process.platform === "darwin") {
    candidates.push(
      "/Applications/Android Studio.app/Contents/jbr/Contents/Home"
    );
  }

  const seen = new Set();

  for (const raw of candidates) {
    if (!raw) continue;
    const home = path.resolve(raw);
    if (seen.has(home)) continue;
    seen.add(home);

    const java = javaExecutable(home);
    if (!(await pathExists(java))) continue;

    try {
      const output = execFileSync(java, ["-version"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      });
      const major = parseJavaMajor(output);
      if (major >= 21) return { home, major };
    } catch (error) {
      const combined = `${error.stdout || ""}\n${error.stderr || ""}`;
      const major = parseJavaMajor(combined);
      if (major >= 21) return { home, major };
    }
  }

  return null;
}

const detectedJdk = await detectJdk21();

if (!detectedJdk) {
  throw new Error(
    "JDK 21+ not found. Install/update Android Studio (which includes the proper JDK) or set JAVA_HOME to a JDK 21+ installation."
  );
}

const gradleEnv = {
  ...process.env,
  JAVA_HOME: detectedJdk.home,
  PATH: `${path.join(detectedJdk.home, "bin")}${path.delimiter}${process.env.PATH || ""}`
};

console.log(`Using JDK ${detectedJdk.major}: ${detectedJdk.home}`);

try {
  await access(wrapper);
} catch {
  throw new Error(
    "Android project is missing. Run 'npm run android:add' once before building the debug APK."
  );
}

if (process.platform === "win32") {
  execFileSync(
    "cmd.exe",
    ["/d", "/s", "/c", "call gradlew.bat assembleDebug"],
    { cwd: androidDir, stdio: "inherit", env: gradleEnv }
  );
} else {
  execFileSync(wrapper, ["assembleDebug"], {
    cwd: androidDir,
    stdio: "inherit",
    env: gradleEnv
  });
}

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
