# Offline Bible: lazy, packed, one interface — Implementation Plan

**Goal:** Stop every plugin load from evaluating the 4.17 MB offline Bible, and shrink `main.js` from 4.31 MB to about 1.75 MB.

**Architecture:** `src/provider/offlineBible.ts` is the offline Bible module. Its interface becomes one async function, `offlineLookup`. Behind it, the World English Bible ships as a gzip + base64 string that is decoded once, on the first lookup. The packing runs at build time (esbuild plugin) and at test time (bun preload plugin), both from one script. The source of truth stays `src/data/offlineBible.web.json`.

**Tech stack:** TypeScript 5.3, esbuild 0.28, bun 1.4 test runner, web `DecompressionStream` + `atob` at runtime, Node `zlib` at build time only.

**Order:** First of three plans. Plans `2026-10-25-book-id-resolved-once.md` and `2026-10-25-stateless-verse-lookup.md` build on the async `offlineLookup` defined here.

## Global constraints

- TypeScript strict mode. `async/await` over promise chains. (AGENTS.md)
- No Node/Electron APIs at runtime unless `isDesktopOnly: true`. `zlib` is allowed only in `scripts/`. (AGENTS.md)
- Local/offline by default: the Bible text must stay inside `main.js`. The community installer ships only `main.js`, `styles.css` and `manifest.json`.
- "Light `onload`. Defer heavy work; use lazy initialization." (AGENTS.md)
- Do not add new code comments. Delete any existing comment this change makes outdated; keep accurate ones untouched. (user CLAUDE.md §5, clarified 2026-10-25)
- After any change, run the related tests, not the whole suite. (user CLAUDE.md §6)
- Commit only once the user has asked for commits. Branch off `master` first.
- Run all commands from the repo root `/Users/tim/Development/obsidian-bible-reference` unless a step says otherwise.

## File map

| File | Action | Responsibility |
|---|---|---|
| `packages/obsidian-bible-reference/src/provider/offlineBible.ts` | modify | Offline Bible module: decode once, look up verses |
| `packages/obsidian-bible-reference/src/provider/OfflineProvider.ts` | modify | await the async lookup |
| `packages/obsidian-bible-reference/src/provider/BaseBibleAPIProvider.ts` | modify | await the async lookup in the network-failure fallback |
| `packages/obsidian-bible-reference/src/provider/offlineBible.test.ts` | modify | async tests + full round-trip test |
| `packages/obsidian-bible-reference/scripts/packOfflineBible.mjs` | create | JSON → gzip+base64 JS module source |
| `packages/obsidian-bible-reference/scripts/esbuild.config.mjs` | modify | resolve the `offline-bible-packed` virtual module |
| `packages/obsidian-bible-reference/test/setup.ts` | modify | same virtual module under `bun test` |
| `packages/obsidian-bible-reference/src/data/offlineBiblePacked.d.ts` | create | type for the virtual module |

---

### Task 1: Make `offlineLookup` async

The interface change on its own: callers await a promise. Data loading does not change yet.

**Files:**
- Modify: `packages/obsidian-bible-reference/src/provider/offlineBible.ts`
- Modify: `packages/obsidian-bible-reference/src/provider/OfflineProvider.ts:23`
- Modify: `packages/obsidian-bible-reference/src/provider/BaseBibleAPIProvider.ts:172`
- Test: `packages/obsidian-bible-reference/src/provider/offlineBible.test.ts`

**Interfaces:**
- Produces: `offlineLookup(bookName: string, chapter: number, verse: number[]): Promise<IVerse[]>`

- [ ] **Step 1: Update the tests to await the lookup**

Replace the whole of `packages/obsidian-bible-reference/src/provider/offlineBible.test.ts` with:

```ts
import { describe, it, expect } from 'bun:test'
import { offlineLookup } from './offlineBible'

describe('offlineLookup (bundled WEB)', () => {
  it('returns a promise', () => {
    expect(offlineLookup('John', 3, [16])).toBeInstanceOf(Promise)
  })

  it('returns a single verse', async () => {
    const verses = await offlineLookup('John', 3, [16])
    expect(verses).toHaveLength(1)
    expect(verses[0]).toMatchObject({
      book_name: 'John',
      chapter: 3,
      verse: 16,
    })
    expect(verses[0].text).toContain('God so loved the world')
  })

  it('returns an inclusive range', async () => {
    const verses = await offlineLookup('John', 3, [16, 18])
    expect(verses.map((v) => v.verse)).toEqual([16, 17, 18])
  })

  it('expands the open-ended sentinel to the end of the chapter', async () => {
    const verses = await offlineLookup('John', 3, [1, 999])
    expect(verses).toHaveLength(36)
    expect(verses[0].verse).toBe(1)
    expect(verses[verses.length - 1].verse).toBe(36)
  })

  it('resolves a non-English book name via normalization', async () => {
    const verses = await offlineLookup('Juan', 3, [16])
    expect(verses[0]?.text).toContain('God so loved the world')
  })

  it('returns [] for an unknown book', async () => {
    expect(await offlineLookup('Nonexistent', 1, [1])).toEqual([])
  })

  it('returns [] for an out-of-range chapter', async () => {
    expect(await offlineLookup('John', 999, [1])).toEqual([])
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `bun test packages/obsidian-bible-reference/src/provider/offlineBible.test.ts`
Expected: `returns a promise` fails (received an array, not a `Promise`). The other tests pass, because awaiting a plain value still works.

- [ ] **Step 3: Make the lookup async**

In `packages/obsidian-bible-reference/src/provider/offlineBible.ts`, change the signature line block:

```ts
export const offlineLookup = (
  bookName: string,
  chapter: number,
  verse: number[]
): IVerse[] => {
```

to:

```ts
export const offlineLookup = async (
  bookName: string,
  chapter: number,
  verse: number[]
): Promise<IVerse[]> => {
```

In `packages/obsidian-bible-reference/src/provider/OfflineProvider.ts`, change:

```ts
    return offlineLookup(bookName, chapter, verse)
```

to:

```ts
    return await offlineLookup(bookName, chapter, verse)
```

In `packages/obsidian-bible-reference/src/provider/BaseBibleAPIProvider.ts`, change:

```ts
      const offline = offlineLookup(bookName, chapter, verse)
```

to:

```ts
      const offline = await offlineLookup(bookName, chapter, verse)
```

- [ ] **Step 4: Run the related tests and watch them pass**

Run: `bun test packages/obsidian-bible-reference/src/provider`
Expected: all pass, `0 fail` (includes `offlineWiring.test.ts`, which exercises both callers).

- [ ] **Step 5: Type-check**

Run: `cd packages/obsidian-bible-reference && bunx tsc -noEmit -skipLibCheck`
Expected: no output, exit code 0.

- [ ] **Step 6: Commit**

```bash
git add packages/obsidian-bible-reference/src/provider/offlineBible.ts packages/obsidian-bible-reference/src/provider/OfflineProvider.ts packages/obsidian-bible-reference/src/provider/BaseBibleAPIProvider.ts packages/obsidian-bible-reference/src/provider/offlineBible.test.ts
git commit -m "refactor(plugin): make the offline Bible lookup async"
```

---

### Task 2: Ship the offline Bible packed and decode it on first lookup

**Files:**
- Create: `packages/obsidian-bible-reference/scripts/packOfflineBible.mjs`
- Create: `packages/obsidian-bible-reference/src/data/offlineBiblePacked.d.ts`
- Modify: `packages/obsidian-bible-reference/test/setup.ts`
- Modify: `packages/obsidian-bible-reference/scripts/esbuild.config.mjs`
- Modify: `packages/obsidian-bible-reference/src/provider/offlineBible.ts`
- Test: `packages/obsidian-bible-reference/src/provider/offlineBible.test.ts`

**Interfaces:**
- Consumes: `offlineLookup(bookName, chapter, verse): Promise<IVerse[]>` from Task 1.
- Produces: virtual module `offline-bible-packed` with `export default string` (base64 of gzip of the packed text). Packed text format: books joined by `\x1d`, chapters by `\x1e`, verses by `\n`. Verified: no verse text in `offlineBible.web.json` contains any of these three characters. Five verses are empty strings, and the split keeps them.
- Produces: `OFFLINE_BIBLE_MODULE = 'offline-bible-packed'` and `packedOfflineBibleModule(): string` from `scripts/packOfflineBible.mjs`.

- [ ] **Step 1: Write the round-trip test**

Append to `packages/obsidian-bible-reference/src/provider/offlineBible.test.ts`. Add `import Reference from 'bible-reference-toolkit'` and `import bible from '../data/offlineBible.web.json'` at the top:

```ts
describe('offlineLookup returns the whole bundled WEB text', () => {
  it('matches every chapter of the source JSON', async () => {
    const source = bible as string[][][]
    for (let bookIndex = 0; bookIndex < source.length; bookIndex++) {
      const bookName = Reference.bookEnglishFullNameFromId(bookIndex + 1)
      for (let chapterIndex = 0; chapterIndex < source[bookIndex].length; chapterIndex++) {
        const verses = await offlineLookup(bookName, chapterIndex + 1, [1, 999])
        expect(verses.map((v) => v.text)).toEqual(
          source[bookIndex][chapterIndex].filter((text) => text)
        )
      }
    }
  })
})
```

- [ ] **Step 2: Run the test to confirm it passes against today's implementation**

Run: `bun test packages/obsidian-bible-reference/src/provider/offlineBible.test.ts`
Expected: all pass. This test pins today's behaviour so that the packing change below cannot drop or reorder any verse.

- [ ] **Step 3: Create the packer**

Create `packages/obsidian-bible-reference/scripts/packOfflineBible.mjs`:

```js
import fs from 'fs'
import path from 'path'
import { gzipSync } from 'zlib'
import { fileURLToPath } from 'url'

export const OFFLINE_BIBLE_MODULE = 'offline-bible-packed'

const bibleJsonPath = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../src/data/offlineBible.web.json'
)

export const packedOfflineBibleModule = () => {
	const bible = JSON.parse(fs.readFileSync(bibleJsonPath, 'utf8'))
	const text = bible
		.map((book) => book.map((chapter) => chapter.join('\n')).join('\x1e'))
		.join('\x1d')
	const base64 = gzipSync(text, { level: 9 }).toString('base64')
	return `export default ${JSON.stringify(base64)}`
}
```

- [ ] **Step 4: Declare the virtual module's type**

Create `packages/obsidian-bible-reference/src/data/offlineBiblePacked.d.ts`:

```ts
declare module 'offline-bible-packed' {
  const packedBible: string
  export default packedBible
}
```

- [ ] **Step 5: Serve the virtual module under `bun test`**

In `packages/obsidian-bible-reference/test/setup.ts`, change the first line:

```ts
import { mock } from 'bun:test'
```

to:

```ts
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
```

The root `bunfig.toml` and the package `bunfig.toml` both preload this file, so the module resolves from either directory. A throwaway prototype confirmed that bun 1.4.4 resolves `build.module` virtual modules from a preload.

- [ ] **Step 6: Serve the virtual module in the esbuild bundle**

In `packages/obsidian-bible-reference/scripts/esbuild.config.mjs`, add after the existing imports:

```js
import { OFFLINE_BIBLE_MODULE, packedOfflineBibleModule } from "./packOfflineBible.mjs";

const offlineBiblePlugin = {
	name: OFFLINE_BIBLE_MODULE,
	setup(build) {
		build.onResolve({ filter: new RegExp(`^${OFFLINE_BIBLE_MODULE}$`) }, () => ({
			path: OFFLINE_BIBLE_MODULE,
			namespace: OFFLINE_BIBLE_MODULE,
		}));
		build.onLoad({ filter: /.*/, namespace: OFFLINE_BIBLE_MODULE }, () => ({
			contents: packedOfflineBibleModule(),
			loader: "js",
		}));
	},
};
```

In the `esbuild.context({ ... })` options, add after `minify: prod,`:

```js
	plugins: [offlineBiblePlugin],
```

- [ ] **Step 7: Decode on first lookup**

In `packages/obsidian-bible-reference/src/provider/offlineBible.ts`, replace:

```ts
import offlineBible from '../data/offlineBible.web.json'
```

with:

```ts
import packedBible from 'offline-bible-packed'

const BOOK_SEPARATOR = '\x1d'
const CHAPTER_SEPARATOR = '\x1e'
const VERSE_SEPARATOR = '\n'
```

Leave the existing doc comment above `const bible` in place. Replace the line under it:

```ts
const bible = offlineBible as string[][][]
```

with:

```ts
let bible: Promise<string[][][]> | undefined

const decodeBible = async (): Promise<string[][][]> => {
  const bytes = Uint8Array.from(atob(packedBible), (char) => char.charCodeAt(0))
  const text = await new Response(
    new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  ).text()
  return text
    .split(BOOK_SEPARATOR)
    .map((book) =>
      book.split(CHAPTER_SEPARATOR).map((chapter) => chapter.split(VERSE_SEPARATOR))
    )
}
```

Inside `offlineLookup`, replace:

```ts
  const chapterVerses = bible[bookId - 1]?.[chapter - 1]
```

with:

```ts
  bible ??= decodeBible()
  const chapterVerses = (await bible)[bookId - 1]?.[chapter - 1]
```

- [ ] **Step 8: Run the related tests**

Run: `bun test packages/obsidian-bible-reference/src/provider`
Expected: all pass, `0 fail`. The round-trip test now runs through the packed path.

- [ ] **Step 9: Type-check**

Run: `cd packages/obsidian-bible-reference && bunx tsc -noEmit -skipLibCheck`
Expected: exit code 0. If `DecompressionStream` is reported as unknown, check that `"DOM"` is still in `tsconfig.json` `lib`. It is today, and the plugin's TypeScript 5.3 `lib.dom.d.ts` declares it.

- [ ] **Step 10: Build and measure the bundle**

Run: `bun run build:packages && cd packages/obsidian-bible-reference && OUT_DIR=$TMPDIR/obr-build bun scripts/esbuild.config.mjs production && ls -l $TMPDIR/obr-build/main.js && grep -c "God so loved the world" $TMPDIR/obr-build/main.js`
Expected: `main.js` is 1,739,315 bytes (down from 4,309,687), measured in a trial run of this plan. `grep -c` prints `0`, which proves the text no longer ships as a plain literal. `OUT_DIR` is set explicitly because the developer shell may already export `OUT_DIR` pointing at a vault.

- [ ] **Step 11: Smoke-test in Obsidian**

Copy the build into a test vault (`OUT_DIR=<vault>/.obsidian/plugins/obsidian-bible-reference bun run dev`, or copy `main.js`). Turn on **Settings → Bible Reference → Offline Mode** and type `--John 3:16`. Expected: the WEB verse appears. On mobile, repeat on iOS 16.4+ and Android: `DecompressionStream` needs WebKit 16.4+ or Chromium 80+.

- [ ] **Step 12: Commit**

```bash
git add packages/obsidian-bible-reference/scripts/packOfflineBible.mjs packages/obsidian-bible-reference/scripts/esbuild.config.mjs packages/obsidian-bible-reference/test/setup.ts packages/obsidian-bible-reference/src/data/offlineBiblePacked.d.ts packages/obsidian-bible-reference/src/provider/offlineBible.ts packages/obsidian-bible-reference/src/provider/offlineBible.test.ts
git commit -m "perf(plugin): ship the offline Bible gzipped and decode it on first lookup"
```

## Risks

- If `decodeBible` rejects on an old WebView, the rejected promise stays memoised, so every later offline lookup rejects too. On the network-failure path, the original fetch error is then replaced by the decode error. This plan accepts that, and Step 11 checks the supported platforms.
- The test preload packs 4 MB with gzip level 9 on each `bun test` run that imports the module. Expect a few hundred milliseconds.
