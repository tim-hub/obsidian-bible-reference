# Dev Setup & Tooling

## Stack

- **Language:** TypeScript → bundled `main.js` (entry: `src/main.ts`)
- **Package manager:** pnpm (required)
- **Bundler:** esbuild (`scripts/esbuild.config.mjs`)
- **Types:** `obsidian` type definitions
- **Node:** 18+ LTS recommended

## Commands

```bash
pnpm install        # install dependencies
pnpm run dev        # watch mode (incremental build)
pnpm run build      # production build (type-check + bundle)
pnpm test           # run jest tests
pnpm run lint       # eslint src/
pnpm run prettier   # check formatting
```

## Linting

```bash
# Lint all source files
eslint ./src/

# Fix automatically
pnpm run lint:fix
pnpm run prettier:fix
```

## Release artifacts

`main.js`, `manifest.json`, and `styles.css` (if present) must be at the plugin root. CI attaches them to the GitHub release on tag push.
