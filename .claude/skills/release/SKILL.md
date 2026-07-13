---
name: release
description: Use when releasing a new version of this plugin — version is bumped in the plugin package.json (source of truth), synced to manifest.json / versions.json, then tagged and pushed
model: haiku
---

# Release Obsidian Bible Reference Plugin

## Overview

This is a Bun workspace monorepo. The **plugin `package.json`** at
`packages/obsidian-bible-reference/package.json` is the **single source of truth**
for the version. The `version` script reads it and syncs `manifest.json` and
`versions.json` at the repo root. This project uses date-based versioning (`YY.MM.DD`).

## Version Format

`YY.MM.DD` — e.g. `26.05.08` for 2026-05-08. Append `-2`, `-3` for multiple same-day releases.

## Preflight

Run before touching any version files. Do not proceed if either fails.

```bash
bun run build   # must exit 0 (builds packages + plugin, emits main.js to repo root)
bun test        # must exit 0
```

## Steps

1. **Pull latest master**
   ```bash
   git checkout master && git pull origin master
   ```

2. **Bump the version (source of truth)** — set `version` in
   `packages/obsidian-bible-reference/package.json` to the new date version.

3. **Refresh lockfile**
   ```bash
   bun install
   ```

4. **Sync `manifest.json` and `versions.json`** from the plugin package.json:
   ```bash
   bun run --filter obsidian-bible-reference version
   ```
   > Note: the version script only adds an entry to `versions.json` when
   > `minAppVersion` hasn't been seen before. If skipped, add
   > `"<NEW>": "0.12.0"` to `versions.json` manually.

5. **Stage and commit**
   ```bash
   git add packages/obsidian-bible-reference/package.json bun.lock manifest.json versions.json
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

- [ ] Build passes (`bun run build`)
- [ ] Tests pass (`bun test`)
- [ ] `packages/obsidian-bible-reference/package.json` version matches new version
- [ ] `manifest.json` version matches new version (synced by the version script)
- [ ] `versions.json` has entry for new version
- [ ] `bun.lock` updated (`bun install` run)
- [ ] Commit message is just the version string (matches project convention)
- [ ] Tag pushed (CI attaches `main.js`, `manifest.json`, `styles.css` as release assets)

## Common Mistakes

- Bumping the root `package.json` instead of the plugin package.json (the plugin one is the source of truth)
- Forgetting `bun install` — lockfile drifts from package.json
- Tagging before committing the bumped files
- Pushing the commit but not the tag (`git push origin master` vs `git push origin <TAG>`)
