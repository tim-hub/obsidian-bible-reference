import { readFileSync, writeFileSync } from "fs";
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// The plugin package.json is the single source of truth for the version.
// This script derives a date-based version (YY.MM.DD), writes it back into the
// plugin package.json, and syncs it into the root manifest.json + versions.json.
//
// An explicit version may be passed as the first CLI arg to override the date
// (e.g. `bun scripts/version-bump.mjs 26.07.14`).
const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptsDir, "..");
const repoRoot = path.resolve(packageDir, "..", "..");

const packageJsonPath = path.join(packageDir, "package.json");
const manifestPath = path.join(repoRoot, "manifest.json");
const versionsPath = path.join(repoRoot, "versions.json");

// Today's date-based version: YY.MM.DD (project convention).
const now = new Date();
const yy = String(now.getFullYear()).slice(-2);
const mm = String(now.getMonth() + 1).padStart(2, "0");
const dd = String(now.getDate()).padStart(2, "0");
const baseVersion = process.argv[2] || `${yy}.${mm}.${dd}`;

// Existing release tags — used to avoid same-day collisions.
let existingTags = new Set();
try {
  const out = execFileSync("git", ["tag", "--list"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  existingTags = new Set(
    out
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
  );
} catch (err) {
  console.warn(
    "warning: could not list git tags, skipping collision check:",
    err.message
  );
}

// If the base version is already tagged, append -1, -2, ... until free.
let targetVersion = baseVersion;
let suffix = 1;
while (existingTags.has(targetVersion)) {
  targetVersion = `${baseVersion}-${suffix}`;
  suffix += 1;
}

// write the resolved version back to the plugin package.json (source of truth)
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
packageJson.version = targetVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

// bump manifest.json to the resolved version
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t"));

// update versions.json with target version and minAppVersion from manifest.json
// but only if the target version is not already in versions.json
const versions = JSON.parse(readFileSync(versionsPath, "utf8"));
if (!Object.values(versions).includes(minAppVersion)) {
  versions[targetVersion] = minAppVersion;
  writeFileSync(versionsPath, JSON.stringify(versions, null, "\t"));
}

console.log(`version set to ${targetVersion}`);
