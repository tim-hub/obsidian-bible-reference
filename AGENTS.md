# Obsidian Bible Reference Plugin

Plugin to help users access and reference Bible verses in Obsidian. All decisions should serve this purpose.

## Security & privacy

- Local/offline by default. Network requests only when essential; disclose clearly in README and settings.
- No hidden telemetry. Analytics require explicit opt-in.
- Never fetch and eval remote code or auto-update outside normal releases.
- Vault-scoped only: read/write inside the vault; no files outside.
- Register and clean up all listeners via `register*` helpers.

## UX

- Sentence case for headings, buttons, titles.
- **Bold** for literal UI labels. "Select" for interactions. Arrow notation (`Settings → Community plugins`) for nav paths.
- Short, jargon-free strings.

## Performance

- Light `onload`. Defer heavy work; use lazy initialization.
- Batch disk access. Debounce/throttle file system event handlers.

## Code

- TypeScript strict mode. `async/await` over promise chains.
- `main.ts` for lifecycle only (onload, onunload, addCommand). All logic in separate modules.
- Split files exceeding ~250 lines. One responsibility per file.
- No Node/Electron APIs unless `isDesktopOnly: true`.

## Mobile

- Test on iOS and Android where feasible.
- Avoid large in-memory structures.

## Do / Don't

**Do**

- Stable command IDs — never rename after release.
- Defaults and validation in settings. Idempotent code paths.
- `register*` helpers for all cleanup.

**Don't**

- Network calls without user-facing reason and documentation.
- Cloud services without explicit opt-in and disclosure.
- Store or transmit vault contents.

## References

- [Dev setup & tooling](docs/dev-setup.md)
- [Code patterns & common tasks](docs/code-patterns.md)
- [How to release](docs/How%20to%20release.md)
- [Bible API sources](docs/bible-api-and-source.md)
- [Obsidian API docs](https://docs.obsidian.md)
- [Plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
