import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// The plugin package.json is the single source of truth for the version.
// This script reads that version and syncs it into the root manifest.json
// (which Obsidian reads) and versions.json.
const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptsDir, "..");
const repoRoot = path.resolve(packageDir, "..", "..");

const packageJsonPath = path.join(packageDir, "package.json");
const manifestPath = path.join(repoRoot, "manifest.json");
const versionsPath = path.join(repoRoot, "versions.json");

const targetVersion = JSON.parse(readFileSync(packageJsonPath, "utf8")).version;

// bump manifest.json to the package.json version
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
