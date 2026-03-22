import fs from "node:fs";
import path from "node:path";

const workspaceRoot = process.cwd();
const srcDir = path.join(workspaceRoot, "src");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const forbiddenUsages = [];

function isSourceFile(fileName) {
  return sourceExtensions.has(path.extname(fileName));
}

function collectFiles(directoryPath) {
  const items = fs.readdirSync(directoryPath, { withFileTypes: true });
  const result = [];

  for (const item of items) {
    const absolutePath = path.join(directoryPath, item.name);

    if (item.isDirectory()) {
      result.push(...collectFiles(absolutePath));
      continue;
    }

    if (item.isFile() && isSourceFile(item.name)) {
      result.push(absolutePath);
    }
  }

  return result;
}

function isClientModule(content) {
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === '"use client";' || trimmed === "'use client';") {
      return true;
    }
    return false;
  }

  return false;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  if (!isClientModule(content)) return;

  const envRegex = /process\.env\.([A-Z0-9_]+)/g;
  let match = envRegex.exec(content);

  while (match) {
    const envName = match[1];
    if (!envName.startsWith("NEXT_PUBLIC_")) {
      forbiddenUsages.push({
        filePath,
        envName,
      });
    }

    match = envRegex.exec(content);
  }
}

if (!fs.existsSync(srcDir)) {
  console.error("❌ Directory not found: src");
  process.exit(1);
}

const sourceFiles = collectFiles(srcDir);
for (const filePath of sourceFiles) {
  scanFile(filePath);
}

if (forbiddenUsages.length > 0) {
  console.error("❌ Found forbidden env usage in client modules:\n");
  for (const usage of forbiddenUsages) {
    const relativePath = path.relative(workspaceRoot, usage.filePath);
    console.error(`- ${relativePath}: process.env.${usage.envName}`);
  }
  console.error("\nOnly NEXT_PUBLIC_* env vars are allowed in client modules.");
  process.exit(1);
}

console.log("✅ Client env check passed: no private env vars in client modules.");
