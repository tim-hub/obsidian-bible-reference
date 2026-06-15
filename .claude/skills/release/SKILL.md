---
name: release
description: Use when releasing a new version of this plugin — version needs bumping across package.json, manifest.json, versions.json, then tagged and pushed
model: haiku
---

# Release Obsidian Bible Reference Plugin

## Overview

Bump version across all metadata files, refresh the lockfile, commit, tag, and push. This project uses date-based versioning (`YY.MM.DD`).

## Version Format

`YY.MM.DD` — e.g. `26.05.08` for 2026-05-08. Append `-2`, `-3` for multiple same-day releases.

## Preflight

Run before touching any version files. Do not proceed if either fails.

```bash
pnpm run build   # must exit 0
pnpm test        # must exit 0
```

## Steps

1. **Pull latest master**
   ```bash
   git checkout master && git pull origin master
   ```

2. **Update `version` in `package.json` and `manifest.json`** to the new date version.

3. **Refresh lockfile**
   ```bash
   pnpm install
   ```

4. **Sync `manifest.json` and `versions.json`** via the version bump script:
   ```bash
   npm_package_version=<NEW_VERSION> node scripts/version-bump.mjs
   ```
   > Note: `version-bump.mjs` only adds an entry to `versions.json` when `minAppVersion` hasn't been seen before. If skipped, add `"<NEW>": "0.12.0"` to `versions.json` manually.

5. **Stage and commit**
   ```bash
   git add package.json pnpm-lock.yaml manifest.json versions.json
   git commit -m "<NEW_VERSION>"
   ```

6. **Tag** (no `v` prefix — Obsidian guideline)
   ```bash
   git tag <NEW_VERSION>
   ```

7. **Push commit and tag**
   ```bash
   git push origin master
   git push origin <NEW_VERSION>
   ```

## Checklist

- [ ] Build passes (`pnpm run build`)
- [ ] Tests pass (`pnpm test`)
- [ ] `package.json` version matches new version
- [ ] `manifest.json` version matches new version
- [ ] `versions.json` has entry for new version
- [ ] `pnpm-lock.yaml` updated (`pnpm install` run)
- [ ] Commit message is just the version string (matches project convention)
- [ ] Tag pushed (CI attaches `main.js`, `manifest.json`, `styles.css` as release assets)

## Common Mistakes

- Forgetting `pnpm install` — lockfile drifts from package.json
- Tagging before committing the bumped files
- Pushing the commit but not the tag (`git push origin master` vs `git push origin <TAG>`)
