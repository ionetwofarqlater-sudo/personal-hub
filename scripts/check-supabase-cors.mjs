import fs from "node:fs";
import path from "node:path";

function parseDotenv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const env = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function getEnvValue(name, fallbackEnv) {
  const value = process.env[name] || fallbackEnv[name];
  if (!value) return null;
  return value;
}

function normalizeOrigin(input) {
  try {
    const url = new URL(input);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

async function run() {
  const workspaceRoot = process.cwd();
  const dotenvPath = path.join(workspaceRoot, ".env.local");
  const dotenvEnv = parseDotenv(dotenvPath);

  const supabaseUrl = getEnvValue("NEXT_PUBLIC_SUPABASE_URL", dotenvEnv);
  const siteUrl = getEnvValue("NEXT_PUBLIC_SITE_URL", dotenvEnv) || "http://localhost:3000";

  if (!supabaseUrl) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing (env or .env.local).");
    process.exit(1);
  }

  const origin = normalizeOrigin(siteUrl);
  if (!origin) {
    console.error(`❌ Invalid NEXT_PUBLIC_SITE_URL: ${siteUrl}`);
    process.exit(1);
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/`;

  const response = await fetch(endpoint, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "GET",
    },
  });

  const allowOrigin = response.headers.get("access-control-allow-origin");
  const isAllowed = allowOrigin === "*" || allowOrigin === origin;

  if (!isAllowed) {
    console.error("❌ CORS check failed for Supabase REST endpoint.");
    console.error(`   Origin used: ${origin}`);
    console.error(`   access-control-allow-origin: ${allowOrigin ?? "<missing>"}`);
    console.error("   Check Supabase allowed origins / API settings for production URL.");
    process.exit(1);
  }

  console.log("✅ Supabase CORS check passed.");
  console.log(`   Origin: ${origin}`);
  console.log(`   access-control-allow-origin: ${allowOrigin}`);
}

run().catch((error) => {
  console.error("❌ Failed to run Supabase CORS check.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
