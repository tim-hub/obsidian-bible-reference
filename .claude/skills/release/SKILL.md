---
name: release
description: Use when releasing a new version of this plugin — version is bumped in the plugin package.json (source of truth), synced to manifest.json / versions.json, then tagged and pushed
model: haiku
---

# Release Obsidian Bible Reference Plugin

## Overview

This is a Bun workspace monorepo. The **plugin `package.json`** at
`packages/obsidian-bible-reference/package.json` is the **single source of truth**
for the version. The `version` script auto-derives today's date version, writes it
into the plugin `package.json`, and syncs `manifest.json` and `versions.json` at the
repo root. This project uses date-based versioning (`YY.MM.DD`).

## Version Format

`YY.MM.DD` — e.g. `26.05.08` for 2026-05-08. The version script generates this from
the current date automatically. If today already has a release tag, it appends
`-1`, `-2`, … for the next same-day release. Pass an explicit version as an argument
to override the date (e.g. `bun run --filter obsidian-bible-reference version 26.07.14`).

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

2. **Bump + sync the version (one command)** — auto-sets today's `YY.MM.DD`
   into the plugin `package.json`, `manifest.json`, and `versions.json`:
   ```bash
   bun run --filter obsidian-bible-reference version
   ```
   It prints `version set to <NEW_VERSION>`. Capture it for the commit/tag:
   ```bash
   VERSION=$(node -p "require('./packages/obsidian-bible-reference/package.json').version")
   echo "$VERSION"
   ```
   > Note: the version script only adds an entry to `versions.json` when
   > `minAppVersion` hasn't been seen before. If skipped, add
   > `"<VERSION>": "0.12.0"` to `versions.json` manually.

3. **Refresh lockfile**
   ```bash
   bun install
   ```

4. **Stage and commit**
   ```bash
   git add packages/obsidian-bible-reference/package.json bun.lock manifest.json versions.json
   git commit -m "$VERSION"
   ```

5. **Tag** (no `v` prefix — Obsidian guideline)
   ```bash
   git tag "$VERSION"
   ```

6. **Push commit and tag**
   ```bash
   git push origin master
   git push origin "$VERSION"
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
