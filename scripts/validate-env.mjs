import fs from "node:fs";

const envFile = fs.existsSync(".env") ? fs.readFileSync(".env", "utf8") : "";
for (const line of envFile.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const required = ["GEMINI_API_KEY", "EXPO_TOKEN", "GITHUB_TOKEN", "GITHUB_USERNAME", "GITHUB_REPO"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Environment variables present.");
