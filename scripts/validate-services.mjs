import fs from "node:fs";

const envFile = fs.existsSync(".env") ? fs.readFileSync(".env", "utf8") : "";
for (const line of envFile.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const fail = (label, detail) => {
  console.error(`${label} failed: ${detail}`);
  process.exitCode = 1;
};

async function checkGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Reply with Vitala OK." }] }] })
  });
  const body = await res.text();
  if (!res.ok || !body.includes("Vitala")) fail("Gemini API", body);
  else console.log("Gemini API reachable.");
}

async function checkExpo() {
  const res = await fetch("https://api.expo.dev/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.EXPO_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: "query { meUserActor { id username __typename } }" })
  });
  const body = await res.text();
  if (!res.ok || body.includes('"errors"')) fail("Expo token", body);
  else console.log("Expo token accepted.");
}

async function checkGithub() {
  const owner = process.env.GITHUB_USERNAME;
  const repo = process.env.GITHUB_REPO;
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "vitala-prebuild"
    }
  });
  if (!res.ok) fail("GitHub repo access", await res.text());
  else console.log("GitHub repo access confirmed.");
}

function checkFiles() {
  for (const file of ["app.config.ts", "eas.json", "package.json"]) {
    if (!fs.existsSync(file)) fail("Build configuration", `${file} is missing`);
  }
  console.log("Build configuration files present.");
}

await checkGemini();
await checkExpo();
await checkGithub();
checkFiles();

if (process.exitCode) process.exit(process.exitCode);
console.log("Pre-build service simulation passed.");
