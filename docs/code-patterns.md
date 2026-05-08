# Code Patterns & Common Tasks

## File structure

```
src/
  main.ts           # lifecycle only (onload, onunload, addCommand)
  settings.ts       # settings interface + defaults
  data/             # constants, collections, version data
  provider/         # Bible API provider classes
  ui/               # modals, settings tab, views
  utils/            # pure utility functions
  verse/            # verse formatting, suggesting logic
  interfaces/       # shared TypeScript interfaces
```

## Plugin lifecycle (main.ts)

```ts
import { Plugin } from 'obsidian'
import { MySettings, DEFAULT_SETTINGS } from './settings'
import { registerCommands } from './commands'

export default class MyPlugin extends Plugin {
  settings: MySettings

  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    registerCommands(this)
  }
}
```

## Settings

```ts
export interface MySettings { enabled: boolean }
export const DEFAULT_SETTINGS: MySettings = { enabled: true }

// In onload:
this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
await this.saveData(this.settings)
```

## Commands

```ts
this.addCommand({
  id: 'your-command-id',   // never rename after release
  name: 'Do the thing',
  callback: () => this.doTheThing(),
})
```

## Registering listeners

```ts
this.registerEvent(this.app.workspace.on('file-open', (f) => { /* ... */ }))
this.registerDomEvent(window, 'resize', () => { /* ... */ })
this.registerInterval(window.setInterval(() => { /* ... */ }, 1000))
```

## Manifest rules

Required fields: `id`, `name`, `version`, `minAppVersion`, `description`, `isDesktopOnly`.
- Never change `id` after release.
- Tag on GitHub must exactly match `manifest.json` version (no `v` prefix).
- Keep `minAppVersion` accurate when using newer APIs.

## Manual install for testing

```
<Vault>/.obsidian/plugins/<plugin-id>/main.js
<Vault>/.obsidian/plugins/<plugin-id>/manifest.json
```

Reload Obsidian → **Settings → Community plugins** → enable.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Plugin doesn't load | Check `main.js` + `manifest.json` are at plugin root |
| Commands missing | Verify `addCommand` runs inside `onload`; IDs must be unique |
| Settings not saving | Ensure `loadData`/`saveData` are awaited |
| Mobile issues | Check for Node/Electron API usage; review `isDesktopOnly` |
