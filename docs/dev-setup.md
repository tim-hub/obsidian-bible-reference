# Dev Setup & Tooling

## Stack

- **Language:** TypeScript → bundled `main.js` (entry: `packages/obsidian-bible-reference/src/main.ts`)
- **Repo layout:** [Bun](https://bun.sh) workspace monorepo. The repo root is the installable Obsidian plugin folder (`manifest.json`, `versions.json`, `styles.css`, built `main.js`); all source lives under `packages/`.
- **Package manager / runtime / test runner:** Bun (required, `>=1.1`)
- **Bundler:** esbuild (`packages/obsidian-bible-reference/scripts/esbuild.config.mjs`)
- **Types:** `obsidian` type definitions
- **Packages:** `obsidian-bible-reference` (plugin), `bible-reference-toolkit`, `bible-book-names-intl`

## Commands (run from the repo root)

```bash
bun install         # install all workspace dependencies
bun run dev         # watch mode (incremental build of the plugin)
bun run build       # production build (type-check + bundle -> main.js at repo root)
bun test            # run all package tests (bun test)
bun run lint        # eslint the plugin package
bun run prettier    # check formatting
```

Per-package scripts (e.g. `lint:fix`, `prettier:fix`, `version`) live in each package and can be run with:

```bash
bun run --filter obsidian-bible-reference lint:fix
bun run --filter obsidian-bible-reference prettier:fix
```

## Release artifacts

`main.js`, `manifest.json`, and `styles.css` must be at the repo root (the plugin folder). The production build emits `main.js` there; CI attaches these files to the GitHub release on tag push.
