# Book id resolved once — Implementation Plan

**Goal:** Resolve a typed book name to a book id once, carry the id from then on, and make each name lookup an O(1) map hit instead of a scan over 2,258 catalog entries.

**Architecture:** Two seams get deeper.
- Inside `bible-reference-toolkit`, `Reference`'s private book lookup builds one normalised `name → bookId` `Map` per catalog on first use. The public interface does not change.
- In the plugin, `splitBibleReference` resolves the book once and returns `bookId` on `VerseReference`. **Book-name localization** (`localizedBookName`), verse counts, `VerseSuggesting` and the external-link builders take the id. Display names are produced from the id only where something is shown.

**Tech stack:** TypeScript 5.x, bun 1.4 test runner, workspace packages `bible-reference-toolkit` and `bible-book-names-intl`.

**Order:** Second of three plans. It needs no code from plan 1 (`2026-10-25-offline-bible-lazy-pack.md`). Plan 3 (`2026-10-25-stateless-verse-lookup.md`) uses `VerseReference.bookId` and `bookNameForId` from this plan.

## Global constraints

- TypeScript strict mode. `async/await` over promise chains. (AGENTS.md)
- Use the domain terms from `CONTEXT.md`: **Version**, **Book-name locale**, **Book-name localization**. "Book-name catalogs … keyed by their `language` field", and locale keys "Must be lowercase".
- `bible-reference-toolkit` is published to npm. Its public interface must not change in this plan.
- `window.BibleReferenceAPI.queryVerses` returns a `VerseSuggesting`. Keep `verseReference.bookName` holding the display name. `bookId` is additive.
- Do not add new code comments. Delete any existing comment this change makes outdated; keep accurate ones untouched. (user CLAUDE.md §5, clarified 2026-10-25)
- After any change, run the related tests, not the whole suite. (user CLAUDE.md §6)
- The plugin imports the toolkit's built `dist/`. After changing toolkit source, run `bun run build:packages` before running plugin tests.
- Commit only once the user has asked for commits. Branch off `master` first.
- Run all commands from the repo root `/Users/tim/Development/obsidian-bible-reference` unless a step says otherwise.

## File map

| File | Action | Responsibility |
|---|---|---|
| `packages/bible-reference-toolkit/src/lib/reference.ts` | modify | memoised name → id index per catalog |
| `packages/bible-reference-toolkit/src/test/reference.index.test.ts` | create | lookup semantics and speed |
| `packages/obsidian-bible-reference/src/utils/bookNameReference.ts` | modify | skip uncatalogued locales; `bookNameForId`; delete name→name helpers |
| `packages/obsidian-bible-reference/src/utils/bookNameLocalization.ts` | modify | `localizedBookName(bookId, …)` |
| `packages/obsidian-bible-reference/src/data/BibleVerseData.ts` | modify | verse/chapter counts by id |
| `packages/obsidian-bible-reference/src/utils/splitBibleReference.ts` | modify | resolve book once, return `bookId`, reject unknown books |
| `packages/obsidian-bible-reference/src/utils/getSuggestionsFromQuery.ts` | modify | hand `VerseReference` to `VerseSuggesting` |
| `packages/obsidian-bible-reference/src/verse/VerseSuggesting.ts` | modify | take a `VerseReference`; English name from id |
| tests next to each file above | modify | follow the new interfaces |

---

### Task 1: Index book names inside the toolkit

**Files:**
- Modify: `packages/bible-reference-toolkit/src/lib/reference.ts:249-301`
- Create: `packages/bible-reference-toolkit/src/test/reference.index.test.ts`

**Interfaces:**
- Unchanged public: `Reference.bookIdFromTranslationAndName(language: string, name: string): number` and `Reference.bookIdFromName(name: string): number`. Both throw `No book matched "<name>"` on a miss.
- Semantics to preserve: an exact name (full name, name, abbreviations; for numbered books only the full name) wins over a generated ordinal variant. Within each pass, the first book in catalog order wins.

- [ ] **Step 1: Write the characterisation and speed tests**

Create `packages/bible-reference-toolkit/src/test/reference.index.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import Reference from '../lib/reference'
import {
  BookWithAbbreviations,
  SupportedLanguages,
  getTranslationBooks,
  AllBibleBooksInAllSupportedLanguages,
} from '../lib/books'
import { generateOrdinalNameVariations } from '../lib/utils'

const normalize = (value: string): string =>
  value.replace(/\./g, '').replace(/\s+/g, ' ').trim().toLowerCase()

const isNumbered = (book: BookWithAbbreviations): boolean =>
  !!book.startNumber && book.startNumber > 0

const exactNames = (book: BookWithAbbreviations): string[] =>
  isNumbered(book)
    ? [book.fullName]
    : [book.fullName, book.name, ...book.abbreviations]

const ordinalNames = (book: BookWithAbbreviations): string[] =>
  isNumbered(book)
    ? generateOrdinalNameVariations(book.startNumber as number, [
        book.name,
        ...book.abbreviations,
      ])
    : []

const firstBookListing = (
  books: BookWithAbbreviations[],
  name: string
): number => {
  const key = normalize(name)
  const exact = books.findIndex((book) =>
    exactNames(book).map(normalize).includes(key)
  )
  if (exact >= 0) {
    return exact + 1
  }
  return (
    books.findIndex((book) => ordinalNames(book).map(normalize).includes(key)) +
    1
  )
}

const everyName = (books: BookWithAbbreviations[]): string[] =>
  books.flatMap((book) => [...exactNames(book), ...ordinalNames(book)])

describe.each(SupportedLanguages)('book lookup in the %s catalog', (language) => {
  test('every name resolves to the first book that lists it', () => {
    const books = getTranslationBooks(language)
    for (const name of everyName(books)) {
      expect(Reference.bookIdFromTranslationAndName(language, name)).toBe(
        firstBookListing(books, name)
      )
    }
  })
})

describe('book lookup across all catalogs', () => {
  test('every name resolves to the first book that lists it', () => {
    const books = AllBibleBooksInAllSupportedLanguages
    for (const name of everyName(books)) {
      expect(Reference.bookIdFromName(name)).toBe(firstBookListing(books, name))
    }
  })

  test('a miss still throws', () => {
    expect(() => Reference.bookIdFromName('Notabook')).toThrow(
      'No book matched "Notabook"'
    )
  })

  test('2,000 misses finish within 100 ms', () => {
    const started = performance.now()
    for (let i = 0; i < 2000; i++) {
      try {
        Reference.bookIdFromName(`Notabook${i}`)
      } catch {
        continue
      }
    }
    expect(performance.now() - started).toBeLessThan(100)
  })
})
```

- [ ] **Step 2: Run the tests and confirm only the speed test fails**

Run: `cd packages/bible-reference-toolkit && bun test src/test/reference.index.test.ts`
Expected: the per-catalog and cross-catalog tests pass, which confirms they describe today's behaviour. `2,000 misses finish within 100 ms` fails at about 1,600 ms (each miss scans and normalises every entry, about 0.8 ms).

- [ ] **Step 3: Build the index**

In `packages/bible-reference-toolkit/src/lib/reference.ts`, add after the imports:

```ts
const bookIndexes = new WeakMap<BookWithAbbreviations[], Map<string, number>>()
```

Replace the whole of `private static getBookIdFromTranslationAndName(...) { ... }` (from the method signature through its closing `}` before `// Is a Chapter level reference (no verse)`) with the version below. The three existing comments move onto the code that now carries the same rule.

```ts
  private static bookIndexFor(
    books: BookWithAbbreviations[]
  ): Map<string, number> {
    const cached = bookIndexes.get(books)
    if (cached) {
      return cached
    }
    const index = new Map<string, number>()
    // Both sides go through normalizeBookName, never just the query: several
    // catalog entries carry periods of their own (German "1. Mose", Romanian
    // "F. Ap."), and those books have startNumber 0, so the exact pass is their
    // only chance to match.
    const addName = (name: string, bookId: number): void => {
      const key = Reference.normalizeBookName(name)
      if (!index.has(key)) {
        index.set(key, bookId)
      }
    }

    // Exact pass first: a real name/abbreviation must win over a generated
    // ordinal variant. Otherwise e.g. "Isa" (Isaiah) loses to the "I"+"Sa"
    // variant of 1 Samuel, which sorts earlier.
    books.forEach((book, bookIndex) => {
      const exactNames =
        book?.startNumber && book.startNumber > 0
          ? [book.fullName] // numbered books resolve their bare names via the ordinal pass
          : [book.fullName, book.name, ...book.abbreviations]
      exactNames.forEach((name) => addName(name, bookIndex + 1))
    })

    // Fall back to ordinal variations for numbered books ("1 John", "I John"…).
    books.forEach((book, bookIndex) => {
      if (!book?.startNumber || book.startNumber <= 0) {
        return
      }
      generateOrdinalNameVariations(book.startNumber, [
        book.name,
        ...book.abbreviations,
      ]).forEach((name) => addName(name, bookIndex + 1))
    })

    bookIndexes.set(books, index)
    return index
  }

  private static getBookIdFromTranslationAndName(
    books: BookWithAbbreviations[],
    name: string
  ): number {
    const bookId = Reference.bookIndexFor(books).get(
      Reference.normalizeBookName(name)
    )
    if (bookId === undefined) {
      throw new Error(`No book matched "${name}"`)
    }
    return bookId
  }
```

`getTranslationBooks(language)` returns the same array instance on every call (it reads a module-level `Map`), and `AllBooks` is a module constant, so the `WeakMap` builds each index once.

- [ ] **Step 4: Run the toolkit tests**

Run: `cd packages/bible-reference-toolkit && bun test src/test`
Expected: all pass, `0 fail` (65 existing tests plus the new ones).

- [ ] **Step 5: Rebuild the packages and run the plugin's book-name tests**

Run: `bun run build:packages && bun test packages/obsidian-bible-reference/src/utils packages/obsidian-bible-reference/src/verse`
Expected: all pass, `0 fail`.

- [ ] **Step 6: Commit**

```bash
git add packages/bible-reference-toolkit/src/lib/reference.ts packages/bible-reference-toolkit/src/test/reference.index.test.ts
git commit -m "perf(toolkit): index book names once per catalog"
```

---

### Task 2: Stop querying catalogs that do not exist

Versions whose **Book-name locale** has no catalog (`ar`, `nl`, `pl`, `ru`, …) currently make `getTranslationBooks` print `console.error` and throw, twice per keystroke.

**Files:**
- Modify: `packages/obsidian-bible-reference/src/utils/bookNameReference.ts`
- Test: `packages/obsidian-bible-reference/src/utils/bookNameLocalization.test.ts`

**Interfaces:**
- Produces: `bookNameForId(bookId: number, languageCode?: string): string`. Returns the full name in that catalog, or the English full name when the locale has no catalog. Throws `Book id out of range (no such book)` for an id outside 1–66.
- Unchanged: `getBookIdFromBookName(bookName: string, languageCode?: string): number`. Same results, but an uncatalogued locale now goes straight to the all-language search.

- [ ] **Step 1: Write the failing test**

In `packages/obsidian-bible-reference/src/utils/bookNameLocalization.test.ts`, add as the first line:

```ts
import { spyOn } from 'bun:test'
```

and add inside `describe('localizedBookName', () => { ... })`:

```ts
  test('an uncatalogued version locale does not log a catalog error', () => {
    const consoleError = spyOn(console, 'error')
    localizedBookName('John', polish, BookNameLanguageEnum.VersionSpecific)
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
```

- [ ] **Step 2: Run it and watch it fail**

Run: `bun test packages/obsidian-bible-reference/src/utils/bookNameLocalization.test.ts`
Expected: FAIL. `console.error` was called with `No translation found for language pl`.

- [ ] **Step 3: Guard on the catalog list**

In `packages/obsidian-bible-reference/src/utils/bookNameReference.ts`, replace:

```ts
import Reference from 'bible-reference-toolkit'

export const getBookIdFromBookName = (
  bookName: string,
  languageCode: string = 'en'
): number => {
  try {
```

with:

```ts
import Reference, { SupportedLanguages } from 'bible-reference-toolkit'

const isCatalogLocale = (languageCode: string): boolean =>
  SupportedLanguages.includes(languageCode.toLowerCase())

export const bookNameForId = (
  bookId: number,
  languageCode: string = 'en'
): string =>
  isCatalogLocale(languageCode)
    ? Reference.bookNameFromTranslationAndId(languageCode, bookId)
    : Reference.bookEnglishFullNameFromId(bookId)

export const getBookIdFromBookName = (
  bookName: string,
  languageCode: string = 'en'
): number => {
  if (!isCatalogLocale(languageCode)) {
    return Reference.bookIdFromName(bookName)
  }
  try {
```

Replace the body of `getFullBookName`:

```ts
  console.debug('getFullBookName', name, languageCode)
  const bookId = getBookIdFromBookName(name, languageCode)

  try {
    return Reference.bookNameFromTranslationAndId(languageCode, bookId)
  } catch {
    return Reference.bookEnglishFullNameFromId(bookId)
  }
```

with:

```ts
  console.debug('getFullBookName', name, languageCode)
  return bookNameForId(getBookIdFromBookName(name, languageCode), languageCode)
```

- [ ] **Step 4: Run the related tests**

Run: `bun test packages/obsidian-bible-reference/src/utils`
Expected: all pass, `0 fail`. `should throw an error if code is wrong` in `bookNameReference.test.ts` still passes: its assertion sits inside a `catch`, and `getBookIdFromBookName('Genesis', 'wrongCode')` now returns `1`.

- [ ] **Step 5: Commit**

```bash
git add packages/obsidian-bible-reference/src/utils/bookNameReference.ts packages/obsidian-bible-reference/src/utils/bookNameLocalization.test.ts
git commit -m "fix(plugin): skip the catalog lookup for uncatalogued book-name locales"
```

---

### Task 3: Carry `bookId` on `VerseReference`

**Files:**
- Modify: `packages/obsidian-bible-reference/src/utils/splitBibleReference.ts`
- Modify: `packages/obsidian-bible-reference/src/data/BibleVerseData.ts`
- Modify: `packages/obsidian-bible-reference/src/utils/bookNameReference.ts`
- Modify: `packages/obsidian-bible-reference/src/utils/bookNameLocalization.ts`
- Modify: `packages/obsidian-bible-reference/src/utils/getSuggestionsFromQuery.ts`
- Modify: `packages/obsidian-bible-reference/src/verse/VerseSuggesting.ts`
- Test: `packages/obsidian-bible-reference/src/utils/splitBibleReference.test.ts`, `bookNameReference.test.ts`, `bookNameLocalization.test.ts`, `src/verse/VerseSuggesting.sourceUrl.test.ts`, `src/verse/VerseSuggesting.linkOnly.test.ts`

**Interfaces:**
- Consumes: `bookNameForId(bookId, languageCode?)` from Task 2.
- Produces:
  - `VerseReference` gains `bookId: number` (1–66, canonical Protestant order).
  - `splitBibleReference(reference: string): VerseReference` now throws `Unknown book: "<name>"` for a book no catalog knows.
  - `getVerseCount(bookId: number, chapterNumber: number): number`
  - `getChapterCount(bookId: number): number`
  - `localizedBookName(bookId: number, version: IBibleVersion | undefined, bookNameLanguage: BookNameLanguageEnum | undefined): string`
  - `new VerseSuggesting(settings: BibleReferencePluginSettings, verseReference: VerseReference)`
- Deleted: `getFullBookName` and `getCanonicalBookName`. This task removes their last callers.

- [ ] **Step 1: Write the failing parser tests**

Append to `packages/obsidian-bible-reference/src/utils/splitBibleReference.test.ts`:

```ts
describe('splitBibleReference resolves the book id once', () => {
  test.each([
    ['John 3:16', 43],
    ['Juan 3:16', 43],
    ['1 Cor 13:4', 46],
    ['Eph. 2:8', 49],
    ['Song of Songs 1:1', 22],
    ['約翰福音 3:16', 43],
  ])('%s has book id %i', (query, bookId) => {
    expect(splitBibleReference(query).bookId).toBe(bookId)
  })

  test('keeps the book name as typed', () => {
    expect(splitBibleReference('Juan 3:16').bookName).toBe('Juan')
  })

  test('rejects a book no catalog knows', () => {
    expect(() => splitBibleReference('Notabook 1:1')).toThrow(
      'Unknown book: "Notabook"'
    )
  })
})
```

In the same file, change the existing test body:

```ts
  expect(() => splitBibleReference('NonExistentBook 1:a')).toThrow(
    'Could not resolve "a" indicator'
  )
```

to:

```ts
  expect(() => splitBibleReference('NonExistentBook 1:a')).toThrow(
    'Unknown book: "NonExistentBook"'
  )
```

- [ ] **Step 2: Run them and watch them fail**

Run: `bun test packages/obsidian-bible-reference/src/utils/splitBibleReference.test.ts`
Expected: FAIL. `bookId` is `undefined`, `Notabook 1:1` does not throw, and `NonExistentBook 1:a` throws the old message.

- [ ] **Step 3: Verse counts by id**

Replace the two functions in `packages/obsidian-bible-reference/src/data/BibleVerseData.ts`, and the `import { getBookIdFromBookName } ...` line, so that the file reads:

```ts
import Reference from 'bible-reference-toolkit'

/**
 * Chapter/verse counts for range validation. Backed by bible-reference-toolkit
 * (which reads bible-book-names-intl) so the Bible structure lives in one place.
 */

/**
 * Get the number of verses in a specific chapter of a book.
 * @param bookId Canonical book id, 1-66
 * @param chapterNumber 1-indexed chapter number
 * @returns Number of verses, or 0 if the chapter is unknown
 */
export const getVerseCount = (
  bookId: number,
  chapterNumber: number
): number => {
  if (chapterNumber < 1 || chapterNumber > Reference.chaptersInBookId(bookId)) {
    return 0
  }
  return Reference.versesInChapterId(
    Reference.chaptersUpToBookId(bookId) + chapterNumber
  )
}

/**
 * Get the total number of chapters in a book.
 * @param bookId Canonical book id, 1-66
 * @returns Number of chapters
 */
export const getChapterCount = (bookId: number): number =>
  Reference.chaptersInBookId(bookId)
```

- [ ] **Step 4: Resolve the id in the parser**

In `packages/obsidian-bible-reference/src/utils/splitBibleReference.ts`:

Change line 3:

```ts
import { getFullBookName, resolveBookName } from './bookNameReference'
```

to:

```ts
import { getBookIdFromBookName, resolveBookName } from './bookNameReference'
```

In `export type VerseReference = { ... }`, change:

```ts
  bookName: string
  chapterNumber: number // main chapter (from first range)
```

to:

```ts
  bookName: string
  bookId: number
  chapterNumber: number // main chapter (from first range)
```

Replace this block (comment included, because it describes the code being deleted):

```ts
  // Normalize the book name for metadata lookups only (e.g. "1 cor" -> "1 Corinthians").
  // The returned reference keeps the raw bookName; only the verse-count/chapter guards
  // below use the normalized form so abbreviations are validated like full names.
  let lookupBookName = bookName
  try {
    const full = getFullBookName(bookName)
    if (full) lookupBookName = full
  } catch {
    /* unknown book; getVerseCount returns 0 */
  }
```

with:

```ts
  let bookId: number
  try {
    bookId = getBookIdFromBookName(bookName)
  } catch {
    throw new Error(`Unknown book: "${bookName}"`)
  }
```

Replace every `getChapterCount(lookupBookName)` with `getChapterCount(bookId)` (3 places), and every `getVerseCount(lookupBookName,` with `getVerseCount(bookId,` (6 places). A seventh call is split across lines:

```ts
        const startChapterMaxVerses = getVerseCount(
          lookupBookName,
```

Change that `lookupBookName,` to `bookId,` as well.

Run: `grep -n lookupBookName packages/obsidian-bible-reference/src/utils/splitBibleReference.ts`
Expected: no output.

In the final `return { ... }`, change:

```ts
  return {
    bookName,
    chapterNumber: first.chapterNumber,
```

to:

```ts
  return {
    bookName,
    bookId,
    chapterNumber: first.chapterNumber,
```

- [ ] **Step 5: Run the parser tests**

Run: `bun test packages/obsidian-bible-reference/src/utils/splitBibleReference.test.ts packages/obsidian-bible-reference/src/utils/splitBibleReference.complex.test.ts`
Expected: all pass, `0 fail`.

- [ ] **Step 6: Update the localization and book-name tests for the id interface**

In `packages/obsidian-bible-reference/src/utils/bookNameLocalization.test.ts`, inside `describe('localizedBookName', ...)`, change the first argument of every `localizedBookName(` call from `'John'` to `43`. There are 6 calls, including the one added in Task 2.

In `packages/obsidian-bible-reference/src/utils/bookNameReference.test.ts`:

Change the import:

```ts
import {
  getBookIdFromBookName,
  getFullBookName,
  resolveBookName,
} from './bookNameReference'
```

to:

```ts
import {
  bookNameForId,
  getBookIdFromBookName,
  resolveBookName,
} from './bookNameReference'
```

Replace the whole `describe('test getFullBookName', () => { ... })` block with:

```ts
describe('test bookNameForId', () => {
  it('should return full book name in English', () => {
    expect(bookNameForId(1, 'en')).toBe('Genesis')
  })

  it('should return full book name for numbered books', () => {
    expect(bookNameForId(62, 'en')).toBe('1 John')
  })

  it('should return Hindi book name when language is hi', () => {
    expect(bookNameForId(1, 'hi')).toBe('उत्पत्ति')
    expect(bookNameForId(19, 'hi')).toBe('भजन संहिता')
  })

  it('should fallback to English name for unsupported language', () => {
    expect(bookNameForId(1, 'invalidCode')).toBe('Genesis')
  })

  it('should return Philippians for php in English', () => {
    expect(bookNameForId(getBookIdFromBookName('php'), 'en')).toBe(
      'Philippians'
    )
  })

  it('should return Isaiah for isa in English', () => {
    expect(bookNameForId(getBookIdFromBookName('isa'), 'en')).toBe('Isaiah')
  })

  it('should throw for an id outside the canon', () => {
    expect(() => bookNameForId(0, 'en')).toThrow('Book id out of range')
  })
})
```

In `describe('book names written with an abbreviating period', ...)`, change:

```ts
  it('should return the full name for a dotted abbreviation', () => {
    expect(getFullBookName('Eph.', 'en')).toBe('Ephesians')
    expect(getFullBookName('1 Cor.', 'en')).toBe('1 Corinthians')
  })
```

to:

```ts
  it('should return the full name for a dotted abbreviation', () => {
    expect(bookNameForId(getBookIdFromBookName('Eph.'), 'en')).toBe('Ephesians')
    expect(bookNameForId(getBookIdFromBookName('1 Cor.'), 'en')).toBe(
      '1 Corinthians'
    )
  })
```

- [ ] **Step 7: Localize by id**

In `packages/obsidian-bible-reference/src/utils/bookNameLocalization.ts`, change:

```ts
import { getFullBookName, getBookIdFromBookName } from './bookNameReference'
```

to:

```ts
import { bookNameForId, getBookIdFromBookName } from './bookNameReference'
```

and change:

```ts
export const localizedBookName = (
  rawBookName: string,
  version: IBibleVersion | undefined,
  bookNameLanguage: BookNameLanguageEnum | undefined
): string =>
  getFullBookName(rawBookName, bookNameLocale(version, bookNameLanguage))
```

to:

```ts
export const localizedBookName = (
  bookId: number,
  version: IBibleVersion | undefined,
  bookNameLanguage: BookNameLanguageEnum | undefined
): string => bookNameForId(bookId, bookNameLocale(version, bookNameLanguage))
```

- [ ] **Step 8: Delete the name → name helpers**

In `packages/obsidian-bible-reference/src/utils/bookNameReference.ts`, delete `export const getFullBookName = ...` and `export const getCanonicalBookName = ...`, together with the doc comment above `getCanonicalBookName`. `getCanonicalBookName` is imported only by `VerseSuggesting.ts`, which Step 10 rewrites.

- [ ] **Step 9: Update the VerseSuggesting tests for the new constructor**

In both `packages/obsidian-bible-reference/src/verse/VerseSuggesting.sourceUrl.test.ts` and `packages/obsidian-bible-reference/src/verse/VerseSuggesting.linkOnly.test.ts`, replace the body of `buildSuggesting`:

```ts
  const settings = { ...DEFAULT_SETTINGS, ...overrides }
  const reference = splitBibleReference(query)
  return new VerseSuggesting(
    settings,
    reference.bookName,
    reference.chapterNumber,
    reference.verseNumber,
    reference.verseNumberEnd,
    reference.chapterNumberEnd,
    reference.verseNumberEndChapter,
    reference.ranges
  )
```

with:

```ts
  const settings = { ...DEFAULT_SETTINGS, ...overrides }
  return new VerseSuggesting(settings, splitBibleReference(query))
```

In `VerseSuggesting.sourceUrl.test.ts`, change:

```ts
    // @ts-ignore - force an unmapped book name past the parser
    suggesting.verseReference.bookName = 'UnknownBook'
```

to:

```ts
    // @ts-ignore - force an unmapped book name past the parser
    suggesting.verseReference.bookId = 0
```

Then append to `VerseSuggesting.sourceUrl.test.ts`. Add `import { getSuggestionsFromQuery } from '../utils/getSuggestionsFromQuery'` at the top:

```ts
describe('the external source URL for a localized book name', () => {
  it('links a Chinese display name to the English Literal Word book', async () => {
    const [suggesting] = await getSuggestionsFromQuery(
      'John 3:16',
      {
        ...DEFAULT_SETTINGS,
        bibleVersion: 'cuv',
        sourceOfReference: 'literalword',
      },
      undefined,
      true
    )
    expect(suggesting.linkOnlyContent).toContain('約翰福音 3:16')
    expect(suggesting.linkOnlyContent).toContain(
      'https://app.literalword.com/'
    )
  })
})
```

- [ ] **Step 10: Take a `VerseReference` in `VerseSuggesting`**

In `packages/obsidian-bible-reference/src/verse/VerseSuggesting.ts`:

Change the import:

```ts
import {
  getCanonicalBookName,
  getFullBookName,
} from '../utils/bookNameReference'
```

to:

```ts
import { bookNameForId } from '../utils/bookNameReference'
```

Replace the constructor:

```ts
  constructor(
    settings: BibleReferencePluginSettings,
    bookName: string,
    chapterNumber: number,
    verseNumber: number,
    verseNumberEnd?: number,
    chapterNumberEnd?: number,
    verseNumberEndChapter?: number,
    ranges?: VerseRange[]
  ) {
    super(settings, {
      bookName: bookName,
      chapterNumber: chapterNumber,
      verseNumber: verseNumber,
      verseNumberEnd: verseNumberEnd,
      chapterNumberEnd: chapterNumberEnd,
      verseNumberEndChapter: verseNumberEndChapter,
      ranges: ranges || [
        {
          chapterNumber,
          verseNumber,
          verseNumberEnd,
          chapterNumberEnd,
          verseNumberEndChapter,
        },
      ],
    })
    this.bibleVersion = settings.bibleVersion
  }
```

with:

```ts
  constructor(
    settings: BibleReferencePluginSettings,
    verseReference: VerseReference
  ) {
    super(settings, verseReference)
    this.bibleVersion = settings.bibleVersion
  }
```

Keep `VerseRange` in the `'../utils/splitBibleReference'` import, because `getCrossChapterVerses(range: VerseRange)` still uses it.

Replace both occurrences of:

```ts
          getFullBookName(this.verseReference.bookName, 'en'),
```

with:

```ts
          bookNameForId(this.verseReference.bookId, 'en'),
```

In `getUrlForReference()`, change the destructure:

```ts
    const {
      bookName,
      chapterNumber,
```

to:

```ts
    const {
      bookName,
      bookId,
      chapterNumber,
```

Delete this block (its comment explains the name resolution being removed):

```ts
    // The external sources key their book maps on the catalog's English name,
    // so anything the user may have typed instead - an abbreviation ("Ps"), or
    // an alternate spelling ("Psalms" for "Psalm") - has to be resolved first
    // or the lookup misses and the source silently degrades to Bible Gateway.
    const canonicalBookName = getCanonicalBookName(bookName)
```

Change the builder map type and the four builders to take the English name as an argument:

```ts
    const urlBuilders: { [source: string]: () => string } = {
      blb: () =>
        getBLBUrl(
          this.bibleVersion,
          canonicalBookName,
```

to:

```ts
    const urlBuilders: {
      [source: string]: (englishBookName: string) => string
    } = {
      blb: (englishBookName) =>
        getBLBUrl(
          this.bibleVersion,
          englishBookName,
```

and do the same for `literalword`, `logos` and `stepbible`: `() =>` becomes `(englishBookName) =>`, and `canonicalBookName` becomes `englishBookName`.

Change:

```ts
    try {
      return buildUrl()
    } catch (error) {
```

to:

```ts
    try {
      return buildUrl(bookNameForId(bookId, 'en'))
    } catch (error) {
```

- [ ] **Step 11: Hand the reference to `VerseSuggesting`**

In `packages/obsidian-bible-reference/src/utils/getSuggestionsFromQuery.ts`, change:

```ts
    bookName = localizedBookName(
      verseRef.bookName,
```

to:

```ts
    bookName = localizedBookName(
      verseRef.bookId,
```

Replace everything from `const {` (the destructure of `verseRef`) down to and including the `console.debug(` call that follows `new VerseSuggesting(...)`:

```ts
  const {
    chapterNumber,
    verseNumber,
    verseNumberEnd,
    chapterNumberEnd,
    verseNumberEndChapter,
    ranges,
  } = verseRef

  // todo get bibleVersion and language from settings
  const suggestingVerse = new VerseSuggesting(
    settings,
    bookName,
    chapterNumber,
    verseNumber,
    verseNumberEnd,
    chapterNumberEnd,
    verseNumberEndChapter,
    ranges
  )

  console.debug(
    bookName,
    chapterNumber,
    verseNumber,
    verseNumberEnd,
    suggestingVerse,
    settings
  )
```

with:

```ts
  // todo get bibleVersion and language from settings
  const suggestingVerse = new VerseSuggesting(settings, {
    ...verseRef,
    bookName,
  })

  console.debug(bookName, suggestingVerse, settings)
```

- [ ] **Step 12: Delete the comments this task made outdated**

In `packages/obsidian-bible-reference/src/utils/getSuggestionsFromQuery.ts`, delete these four lines and keep the three lines above them:

```ts
  // Both calls sit inside the try. splitBibleReference does not reject an
  // unknown book - resolveBookName hands the candidate back unchanged - so the
  // throw for "Notabook 1:1" comes out of localizedBookName instead. Leaving it
  // outside turned every such keystroke into an unhandled promise rejection.
```

In `packages/obsidian-bible-reference/src/utils/getSuggestionsFromQuery.test.ts`, delete the four comment lines above `describe('getSuggestionsFromQuery with a book that does not exist'`.

- [ ] **Step 13: Check nothing still calls the deleted helpers**

Run: `grep -rn "getFullBookName\|getCanonicalBookName\|lookupBookName" packages/obsidian-bible-reference/src`
Expected: no output.

- [ ] **Step 14: Run the related tests**

Run: `bun test packages/obsidian-bible-reference/src/utils packages/obsidian-bible-reference/src/verse packages/obsidian-bible-reference/src/suggesetor packages/obsidian-bible-reference/src/provider`
Expected: all pass, `0 fail`.

- [ ] **Step 15: Type-check**

Run: `cd packages/obsidian-bible-reference && bunx tsc -noEmit -skipLibCheck`
Expected: exit code 0.

- [ ] **Step 16: Commit**

```bash
git add packages/obsidian-bible-reference/src
git commit -m "refactor(plugin): resolve the book id once and carry it on VerseReference"
```

## Notes for the user

- `bookIdForVersion` in `bookNameLocalization.ts` still exists for `BollyLifeProvider`. Plan 3 deletes it.
