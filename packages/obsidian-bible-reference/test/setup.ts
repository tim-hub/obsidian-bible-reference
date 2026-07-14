import { mock } from 'bun:test'

// The `obsidian` package is a types-only dependency with no runtime entry point,
// so importing any plugin module that pulls in `obsidian` fails under `bun test`.
// bun's `mock.module` is not hoisted the way `jest.mock` was, so register the
// mock here in a preload (see bunfig.toml) — before any test imports resolve.
mock.module('obsidian', () => ({
  Notice: mock(),
}))
