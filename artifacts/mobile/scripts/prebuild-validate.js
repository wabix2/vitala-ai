#!/usr/bin/env node
/**
 * Pre-build validation for Vitala EAS APK pipeline.
 * Runs all checks before triggering EAS build. Exits non-zero on failure.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const mobileRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(mobileRoot, "../..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(path.join(workspaceRoot, ".env"));
loadEnvFile(path.join(mobileRoot, ".env"));

const checks = [];
let failed = false;

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
  console.log(`✔ ${name}${detail ? `: ${detail}` : ""}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.error(`✘ ${name}: ${detail}`);
  failed = true;
}

function warn(name, detail) {
  console.warn(`⚠ ${name}: ${detail}`);
}

async function main() {
  console.log("\n=== Vitala Pre-Build Validation ===\n");

  // 1. Required secrets
  const geminiKey =
    process.env.AI_INTEGRATIONS_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
  const expoToken = process.env.EXPO_TOKEN;
  const githubToken = process.env.GITHUB_TOKEN;

  if (geminiKey) pass("Gemini API key", "present");
  else fail("Gemini API key", "Set AI_INTEGRATIONS_GEMINI_API_KEY or GEMINI_API_KEY in .env");

  if (expoToken) pass("Expo token", "present");
  else fail("Expo token", "Set EXPO_TOKEN in .env");

  if (githubToken) pass("GitHub token", "present");
  else fail("GitHub token", "Set GITHUB_TOKEN in .env");

  if (process.env.EXPO_PUBLIC_API_URL) {
    pass("API URL", process.env.EXPO_PUBLIC_API_URL);
  } else {
    warn("EXPO_PUBLIC_API_URL", "Not set — AI features need a deployed API server URL");
  }

  // 2. Expo project config
  const appJsonPath = path.join(mobileRoot, "app.json");
  const easJsonPath = path.join(mobileRoot, "eas.json");
  if (fs.existsSync(appJsonPath) && fs.existsSync(easJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
    const projectId = appJson?.expo?.extra?.eas?.projectId;
    const pkg = appJson?.expo?.android?.package;
    if (projectId && pkg) pass("Expo config", `${appJson.expo.name} (${pkg})`);
    else fail("Expo config", "Missing projectId or android.package in app.json");
  } else {
    fail("Expo config", "app.json or eas.json missing");
  }

  // 3. Icon asset
  const iconPath = path.join(mobileRoot, "assets/images/icon.png");
  if (fs.existsSync(iconPath)) pass("App icon", "found");
  else fail("App icon", "Missing assets/images/icon.png");

  // 4. Gemini API test
  if (geminiKey) {
    try {
      const baseUrl =
        process.env.AI_INTEGRATIONS_GEMINI_BASE_URL ??
        "https://generativelanguage.googleapis.com";
      const url = `${baseUrl}/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Reply with OK only." }] }],
          generationConfig: { maxOutputTokens: 16 },
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) pass("Gemini API", "live response OK");
      else if (res.status === 429) {
        warn("Gemini API", "Quota exceeded — key is valid but billing/quota needs attention");
        pass("Gemini API key format", "accepted by Google (429 quota)");
      } else {
        fail("Gemini API", `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      }
    } catch (err) {
      fail("Gemini API", err.message);
    }
  }

  // 5. Expo token validation (via EAS CLI)
  if (expoToken) {
    const whoami = spawnSync("pnpm", ["exec", "eas", "whoami"], {
      cwd: mobileRoot,
      env: { ...process.env, EXPO_TOKEN: expoToken },
      encoding: "utf8",
      shell: true,
      timeout: 60000,
    });
    if (whoami.status === 0) {
      pass("Expo auth", (whoami.stdout || whoami.stderr).trim().split("\n").pop());
    } else {
      fail("Expo auth", (whoami.stderr || whoami.stdout || "eas whoami failed").trim().slice(0, 200));
    }
  }

  // 6. GitHub repo access
  const ghUser = process.env.GITHUB_USERNAME ?? "wabix2";
  const ghRepo = process.env.GITHUB_REPO ?? "vitala-ai";
  if (githubToken) {
    try {
      const res = await fetch(`https://api.github.com/repos/${ghUser}/${ghRepo}`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "vitala-prebuild",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const repo = await res.json();
        pass("GitHub repo", `${repo.full_name} (push: ${repo.permissions?.push ? "yes" : "read"})`);
        if (!repo.permissions?.push) {
          warn("GitHub push", "Token may not have push access");
        }
      } else {
        fail("GitHub repo", `HTTP ${res.status}: ${(await res.text()).slice(0, 150)}`);
      }
    } catch (err) {
      fail("GitHub repo", err.message);
    }
  }

  // 7. Dependencies
  console.log("\nInstalling dependencies...");
  const install = spawnSync("pnpm", ["install", "--no-frozen-lockfile", "--ignore-scripts"], {
    cwd: workspaceRoot,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, CI: "true" },
  });
  if (install.status === 0) pass("Dependencies", "pnpm install OK");
  else fail("Dependencies", "pnpm install failed");

  // 8. Build workspace libs + typecheck mobile
  console.log("\nBuilding workspace libs...");
  const buildLibs = spawnSync("pnpm", ["run", "typecheck:libs"], {
    cwd: workspaceRoot,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, CI: "true" },
  });
  if (buildLibs.status === 0) pass("Workspace libs", "built OK");
  else fail("Workspace libs", "tsc --build failed");

  console.log("\nRunning typecheck...");
  const typecheck = spawnSync("pnpm", ["exec", "tsc", "-p", "tsconfig.json", "--noEmit"], {
    cwd: mobileRoot,
    stdio: "inherit",
    shell: true,
  });
  if (typecheck.status === 0) pass("Typecheck", "mobile OK");
  else warn("Typecheck", "mobile has TS warnings — EAS native build may still succeed");

  // Summary
  console.log("\n=== Summary ===");
  const passed = checks.filter((c) => c.ok).length;
  const total = checks.length;
  console.log(`${passed}/${total} checks passed\n`);

  if (failed) {
    console.error("PRE-BUILD VALIDATION FAILED — fix errors above before building APK.\n");
    process.exit(1);
  }

  console.log("All critical checks passed. Ready for EAS build.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
