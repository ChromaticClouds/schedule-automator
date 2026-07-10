// scripts/check-architecture.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const violations = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) return [full];
    return [];
  });
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const serverSrc = path.join(root, "ai-scheduler-server", "src");
const serverFiles = walk(serverSrc);

for (const file of serverFiles) {
  const rel = path.relative(serverSrc, file);
  const text = read(file);

  if (rel.startsWith("core/") && text.includes("../features/")) {
    violations.push(`${rel}: core must not import features`);
  }

  if (rel.startsWith("integrations/") && text.includes("../features/")) {
    violations.push(`${rel}: integrations must not import features`);
  }

  if (rel.startsWith("features/")) {
    const match = rel.match(/^features\/([^/]+)\//);
    const owner = match?.[1];

    const crossFeatureImport = [...text.matchAll(/from\s+["'](?:\.\.\/)+([^"']+)["']/g)]
      .map((m) => m[1])
      .find((target) => target.startsWith("features/") && !target.startsWith(`features/${owner}/`));

    if (crossFeatureImport) {
      violations.push(`${rel}: avoid private cross-feature import: ${crossFeatureImport}`);
    }
  }
}

if (violations.length) {
  console.error("Architecture boundary violations:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Architecture boundaries look OK.");
