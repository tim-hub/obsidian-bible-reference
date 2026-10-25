import { mock } from 'bun:test'
import { plugin } from 'bun'
import {
  OFFLINE_BIBLE_MODULE,
  packedOfflineBibleModule,
} from '../scripts/packOfflineBible.mjs'

plugin({
  name: OFFLINE_BIBLE_MODULE,
  setup(build) {
    build.module(OFFLINE_BIBLE_MODULE, () => ({
      contents: packedOfflineBibleModule(),
      loader: 'js',
    }))
  },
})

// The `obsidian` package is a types-only dependency with no runtime entry point,
// so importing any plugin module that pulls in `obsidian` fails under `bun test`.
// bun's `mock.module` is not hoisted the way `jest.mock` was, so register the
// mock here in a preload (see bunfig.toml) — before any test imports resolve.
mock.module('obsidian', () => ({
  Notice: mock(),
  // The suggesters extend these at runtime, so a bare stub is enough to let a
  // test instantiate one and drive it directly. MarkdownView is a value, not
  // just a type, in VerseLookupSuggestModal - without it that module cannot be
  // imported at all under `bun test`.
  MarkdownView: class {},
  EditorSuggest: class {
    app: unknown
    constructor(app: unknown) {
      this.app = app
    }
  },
  SuggestModal: class {
    app: unknown
    constructor(app: unknown) {
      this.app = app
    }
    setInstructions() {}
    onOpen() {}
  },
}))
