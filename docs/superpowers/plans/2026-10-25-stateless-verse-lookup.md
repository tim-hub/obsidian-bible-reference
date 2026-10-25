# Stateless verse lookup — Implementation Plan

**Goal:** Replace the stateful provider class hierarchy with one verse lookup module and three stateless verse source adapters. This removes the shared mutable URL fields and the race on the "original" source link.

**Architecture:**
- `verseLookup.ts` is the deep module, with two functions in its interface:
  - `lookupVerses(version, passage)` owns the verse cache, fetching only the missing verses, and the offline fallback.
  - `sourceUrlFor(version, passage)` gives the "original" link.
- Each API source (bible-api.com, Bolls Life, Bible SuperSearch) becomes a plain object satisfying `VerseSource`: build the request URL, build the source URL, parse the response. Three adapters make this a real seam.
- The bundled offline **Version** is handled inside the lookup and never touches the network or the cache.

**Tech stack:** TypeScript 5.3, bun 1.4 test runner (`spyOn(globalThis, 'fetch')`), Obsidian `Notice`.

**Order:** Third of three plans. It requires both earlier plans to be merged:
- from `2026-10-25-offline-bible-lazy-pack.md`: `offlineLookup(bookName: string, chapter: number, verse: number[]): Promise<IVerse[]>`
- from `2026-10-25-book-id-resolved-once.md`: `VerseReference.bookId: number`, `bookNameForId(bookId: number, languageCode?: string): string`, and `new VerseSuggesting(settings, verseReference)`

## Global constraints

- TypeScript strict mode. `async/await` over promise chains. (AGENTS.md)
- "Network calls without user-facing reason and documentation" are not allowed. This plan adds no new network calls: the same three hosts, URLs and fetch options (`method: 'get'`, `redirect: 'follow'`, `cache: 'force-cache'`).
- The verse cache's persisted keys must stay compatible: `translationKey → "<English full book name>|<chapter>" → verse`. Existing `data.json` caches must keep hitting.
- User decision (2026-10-25): link-only insertion with source **original** keeps falling back to Bible Gateway. Link-only never fetches, so no source URL is recorded.
- The "original" link of a fetched reference is the source URL of its **first range**, whichever request finishes first.
- Do not add new code comments. Delete any existing comment this change makes outdated; keep accurate ones untouched. (user CLAUDE.md §5, clarified 2026-10-25)
- After any change, run the related tests, not the whole suite. (user CLAUDE.md §6)
- Commit only once the user has asked for commits. Branch off `master` first.
- Run all commands from the repo root `/Users/tim/Development/obsidian-bible-reference` unless a step says otherwise.

## File map

| File | Action | Responsibility |
|---|---|---|
| `packages/obsidian-bible-reference/src/provider/verseSource.ts` | create | `PassageQuery`, `VerseSource`, `versesQueryString` |
| `packages/obsidian-bible-reference/src/provider/bibleApiSource.ts` | create | bible-api.com adapter |
| `packages/obsidian-bible-reference/src/provider/bollsLifeSource.ts` | create | Bolls Life adapter |
| `packages/obsidian-bible-reference/src/provider/bibleSuperSearchSource.ts` | create | Bible SuperSearch adapter |
| `packages/obsidian-bible-reference/src/provider/verseLookup.ts` | create | cache, fetch the missing verses, offline fallback, source URL |
| `packages/obsidian-bible-reference/src/provider/verseLookup.test.ts` | create | component tests through `lookupVerses` / `sourceUrlFor` |
| `packages/obsidian-bible-reference/src/verse/VerseSuggesting.ts` | modify | use the lookup; record the first range's source URL |
| `packages/obsidian-bible-reference/src/verse/VerseSuggesting.original.test.ts` | create | deterministic "original" link |
| `packages/obsidian-bible-reference/src/provider/verseOfDayApi.ts` | modify | use the lookup |
| `packages/obsidian-bible-reference/src/provider/offlineBible.ts` | modify | look up by book id |
| `BaseBibleAPIProvider.ts`, `BibleAPIDotComProvider.ts`, `BollyLifeProvider.ts`, `BibleSuperSearchProvider.ts`, `OfflineProvider.ts`, `buildProvider.ts` and their tests | delete | replaced |
| `packages/obsidian-bible-reference/src/utils/bookNameLocalization.ts` | modify | delete `bookIdForVersion` |
| `CONTEXT.md`, `docs/code-patterns.md` | modify | domain terms and file structure |

---

### Task 1: Verse sources and the verse lookup module

Built alongside the old providers. Nothing calls it yet.

**Files:**
- Create: `packages/obsidian-bible-reference/src/provider/verseSource.ts`
- Create: `packages/obsidian-bible-reference/src/provider/bibleApiSource.ts`
- Create: `packages/obsidian-bible-reference/src/provider/bollsLifeSource.ts`
- Create: `packages/obsidian-bible-reference/src/provider/bibleSuperSearchSource.ts`
- Create: `packages/obsidian-bible-reference/src/provider/verseLookup.ts`
- Test: `packages/obsidian-bible-reference/src/provider/verseLookup.test.ts`

**Interfaces:**
- Consumes: `bookNameForId(bookId, 'en')` from `../utils/bookNameReference`. `offlineLookup(bookName, chapter, verse): Promise<IVerse[]>` from `./offlineBible`. `verseCache` and `expandRequestedVerses(verse: number[]): number[] | null` from `./verseCache`.
- Produces:
  ```ts
  export type PassageQuery = { bookId: number; chapter: number; verses: number[] }
  export const lookupVerses: (version: IBibleVersion, query: PassageQuery) => Promise<IVerse[]>
  export const sourceUrlFor: (version: IBibleVersion, query: PassageQuery) => string
  ```
  `verses` keeps the existing query semantics: `[n]` is one verse, `[a, b]` is a..b, `[a, 999]` is a to the end of the chapter, and three or more entries are a list. `lookupVerses` rejects with the fetch error, and shows a `Notice`, only when the fetch fails and the offline text has no such passage.

- [ ] **Step 1: Write the failing component tests**

Create `packages/obsidian-bible-reference/src/provider/verseLookup.test.ts`:

```ts
import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { lookupVerses, sourceUrlFor } from './verseLookup'
import { verseCache } from './verseCache'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { IBibleApiSource } from '../interfaces/IBibleApiSource'

const version = (key: string, apiSource: IBibleApiSource): IBibleVersion => ({
  key,
  versionName: key,
  language: 'English',
  code: 'en',
  apiSource,
})
const kjv = version('kjv', BibleAPISourceCollection.bibleApi)
const nkjv = version('nkjv', BibleAPISourceCollection.bollsLife)
const bg = version('bg', BibleAPISourceCollection.bibleSuperSearch)
const ubg = version('ubg', BibleAPISourceCollection.bibleSuperSearch)
const webOffline = version('web-offline', BibleAPISourceCollection.offline)

const john3 = (verses: number[]) => ({ bookId: 43, chapter: 3, verses })

const bibleApiBody = (verses: number[]) => ({
  reference: 'John 3',
  verses: verses.map((verse) => ({
    book_name: 'John',
    chapter: 3,
    verse,
    text: `kjv ${verse}`,
  })),
})

const respondWith = (body: unknown) =>
  spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => body,
  } as Response)

afterEach(() => {
  mock.restore()
  verseCache.clear()
})

describe('lookupVerses', () => {
  it('fetches a bible-api.com passage by English book name', async () => {
    const fetchMock = respondWith(bibleApiBody([16]))
    const verses = await lookupVerses(kjv, john3([16]))
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://bible-api.com/John+3:16?translation=kjv'
    )
    expect(verses.map((v) => v.text)).toEqual(['kjv 16'])
  })

  it('serves a repeated passage from the verse cache', async () => {
    const fetchMock = respondWith(bibleApiBody([16, 17]))
    await lookupVerses(kjv, john3([16, 17]))
    const verses = await lookupVerses(kjv, john3([16, 17]))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(verses.map((v) => v.verse)).toEqual([16, 17])
  })

  it('fetches only the verses the cache is missing', async () => {
    const fetchMock = respondWith(bibleApiBody([16]))
    await lookupVerses(kjv, john3([16]))
    fetchMock.mockResolvedValue({
      json: async () => bibleApiBody([17, 18]),
    } as Response)
    const verses = await lookupVerses(kjv, john3([16, 18]))
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://bible-api.com/John+3:17-18?translation=kjv'
    )
    expect(verses.map((v) => v.verse)).toEqual([16, 17, 18])
  })

  it('keeps the cache keyed by English book name', async () => {
    respondWith(bibleApiBody([16]))
    await lookupVerses(kjv, john3([16]))
    expect(verseCache.getVerses('kjv', 'John', 3, [16]).hits).toHaveLength(1)
  })

  it('fetches the whole Bolls Life chapter by book id and keeps the requested verses', async () => {
    const fetchMock = respondWith(
      [15, 16, 17].map((verse) => ({
        book: 43,
        chapter: 3,
        verse,
        text: `nkjv ${verse}`,
      }))
    )
    const verses = await lookupVerses(nkjv, john3([16]))
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://bolls.life/get-text/NKJV/43/3/'
    )
    expect(verses.map((v) => v.text)).toEqual(['nkjv 16'])
  })

  it('queries Bible SuperSearch with the mapped module and normalizes rows', async () => {
    const fetchMock = respondWith({
      errors: [],
      error_level: 0,
      results: {
        pol_ubg: [
          {
            id: 26137,
            book: 43,
            chapter: 3,
            verse: 16,
            text: 'Tak bowiem Bóg umiłował świat...',
          },
        ],
      },
    })
    const verses = await lookupVerses(ubg, john3([16]))
    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('bible=pol_ubg')
    expect(url).toContain('reference=John+3%3A16')
    expect(url).toContain('data_format=minimal')
    expect(verses[0]).toMatchObject({
      chapter: 3,
      verse: 16,
      book_id: '43',
      book_name: 'John',
    })
  })

  it('falls back to the bundled WEB text when the fetch fails, without caching it', async () => {
    spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    const verses = await lookupVerses(kjv, john3([16]))
    expect(verses[0].text).toContain('God so loved the world')
    expect(verseCache.getVerses('kjv', 'John', 3, [16]).hits).toHaveLength(0)
  })

  it('rejects when the fetch fails and the offline text has no such passage', async () => {
    spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    await expect(
      lookupVerses(kjv, { bookId: 43, chapter: 99, verses: [1] })
    ).rejects.toThrow('offline')
  })

  it('reads the offline version without touching the network', async () => {
    const fetchMock = spyOn(globalThis, 'fetch')
    const verses = await lookupVerses(webOffline, john3([16]))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(verses[0].text).toContain('God so loved the world')
  })
})

describe('sourceUrlFor', () => {
  it.each([
    ['kjv', kjv, 'https://bible-api.com/John+3:16-18?translation=kjv'],
    ['nkjv', nkjv, 'https://bolls.life/NKJV/43/3/'],
    ['web-offline', webOffline, 'https://bible-api.com/John+3:16-18?translation=web'],
  ])('links %s to its source', (_key, linkedVersion, expected) => {
    expect(sourceUrlFor(linkedVersion, john3([16, 18]))).toBe(expected)
  })

  it('maps bg to the polbg Bible SuperSearch module', () => {
    expect(sourceUrlFor(bg, john3([16]))).toContain('bible=polbg')
  })
})
```

- [ ] **Step 2: Run them and watch them fail**

Run: `bun test packages/obsidian-bible-reference/src/provider/verseLookup.test.ts`
Expected: FAIL with `Cannot find module './verseLookup'`.

- [ ] **Step 3: Create the seam**

Create `packages/obsidian-bible-reference/src/provider/verseSource.ts`:

```ts
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { IVerse } from '../interfaces/IVerse'

export type PassageQuery = {
  bookId: number
  chapter: number
  verses: number[]
}

export interface VerseSource {
  readsWholeChapter: boolean
  requestUrl(version: IBibleVersion, query: PassageQuery): string
  sourceUrl(version: IBibleVersion, query: PassageQuery): string
  parse(data: unknown, version: IBibleVersion, query: PassageQuery): IVerse[]
}

export const versesQueryString = (verses: number[]): string => {
  if (verses?.length >= 3) {
    return verses.join('&')
  } else if (verses?.length === 2 && !!verses[1]) {
    return `${verses[0]}-${verses[1]}`
  } else {
    return `${verses[0]}`
  }
}
```

- [ ] **Step 4: Create the three adapters**

Create `packages/obsidian-bible-reference/src/provider/bibleApiSource.ts`:

```ts
import { IVerse } from '../interfaces/IVerse'
import { bookNameForId } from '../utils/bookNameReference'
import { VerseSource, versesQueryString } from './verseSource'

const requestUrl: VerseSource['requestUrl'] = (version, query) =>
  `${version.apiSource.apiUrl}/${bookNameForId(query.bookId, 'en')}+${query.chapter}:${versesQueryString(query.verses)}?translation=${version.key}`

export const bibleApiSource: VerseSource = {
  readsWholeChapter: false,
  requestUrl,
  sourceUrl: requestUrl,
  parse: (data, _version, query) =>
    (data as { verses: IVerse[] }).verses.map((verse) => ({
      ...verse,
      chapter: verse.chapter ?? query.chapter,
    })),
}
```

Create `packages/obsidian-bible-reference/src/provider/bollsLifeSource.ts`:

```ts
import { bookNameForId } from '../utils/bookNameReference'
import { VerseSource } from './verseSource'

type BollsLifeVerse = {
  text: string
  chapter: number
  book: string
  verse: number
}

const chapterUrl: VerseSource['requestUrl'] = (version, query) =>
  `${version.apiSource.apiUrl}/${version.key.toUpperCase()}/${query.bookId}/${query.chapter}/`

export const bollsLifeSource: VerseSource = {
  readsWholeChapter: true,
  requestUrl: chapterUrl,
  sourceUrl: (version, query) =>
    chapterUrl(version, query).replace('/get-text', ''),
  parse: (data, _version, query) =>
    (data as BollsLifeVerse[] | undefined)
      ?.filter(
        (verse) =>
          verse.verse >= query.verses[0] &&
          verse.verse <= query.verses[query.verses.length - 1]
      )
      .map((verse) => ({
        text: verse.text,
        chapter: verse.chapter ?? query.chapter,
        book_id: verse.book,
        book_name: bookNameForId(query.bookId, 'en'),
        verse: verse.verse,
      })) ?? [],
}
```

Create `packages/obsidian-bible-reference/src/provider/bibleSuperSearchSource.ts`:

```ts
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { bookNameForId } from '../utils/bookNameReference'
import { VerseSource, versesQueryString } from './verseSource'

type BibleSuperSearchVerse = {
  id: number | string
  book: number | string
  chapter: number | string
  verse: number | string
  text: string
}

type BibleSuperSearchResponse = {
  errors?: string[]
  error_level?: number
  results?: Record<string, BibleSuperSearchVerse[]>
}

const BIBLE_SUPER_SEARCH_MODULES: Record<string, string> = {
  bg: 'polbg',
  ubg: 'pol_ubg',
}

const moduleKey = (version: IBibleVersion): string => {
  const normalized = version.key.toLowerCase()
  return BIBLE_SUPER_SEARCH_MODULES[normalized] || normalized
}

const requestUrl: VerseSource['requestUrl'] = (version, query) => {
  const searchParams = new URLSearchParams({
    bible: moduleKey(version),
    reference: `${bookNameForId(query.bookId, 'en')} ${query.chapter}:${versesQueryString(query.verses)}`,
    data_format: 'minimal',
  })
  return `${version.apiSource.apiUrl}/api?${searchParams.toString()}`
}

export const bibleSuperSearchSource: VerseSource = {
  readsWholeChapter: false,
  requestUrl,
  sourceUrl: requestUrl,
  parse: (data, version, query) =>
    (
      (data as BibleSuperSearchResponse)?.results?.[moduleKey(version)] || []
    ).map((row) => ({
      text: row.text,
      chapter: Number(row.chapter) || query.chapter,
      book_id: String(row.book),
      book_name: bookNameForId(query.bookId, 'en'),
      verse: Number(row.verse),
    })),
}
```

- [ ] **Step 5: Create the lookup**

Create `packages/obsidian-bible-reference/src/provider/verseLookup.ts`:

```ts
import { Notice } from 'obsidian'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { IVerse } from '../interfaces/IVerse'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection'
import { bookNameForId } from '../utils/bookNameReference'
import { PassageQuery, VerseSource, versesQueryString } from './verseSource'
import { bibleApiSource } from './bibleApiSource'
import { bollsLifeSource } from './bollsLifeSource'
import { bibleSuperSearchSource } from './bibleSuperSearchSource'
import { verseCache, expandRequestedVerses } from './verseCache'
import { offlineLookup } from './offlineBible'

export type { PassageQuery } from './verseSource'

const isOffline = (version: IBibleVersion): boolean =>
  version.apiSource === BibleAPISourceCollection.offline

const sourceFor = (version: IBibleVersion): VerseSource => {
  switch (version.apiSource) {
    case BibleAPISourceCollection.bollsLife:
      return bollsLifeSource
    case BibleAPISourceCollection.bibleSuperSearch:
      return bibleSuperSearchSource
    default:
      return bibleApiSource
  }
}

const fetchVersesFor = (
  source: VerseSource,
  query: PassageQuery,
  requested: number[] | null,
  missing: number[]
): number[] => {
  if (source.readsWholeChapter) {
    return [1, 999]
  }
  const partialHit =
    missing.length > 0 && !!requested && missing.length < requested.length
  return partialHit ? missing : query.verses
}

export const sourceUrlFor = (
  version: IBibleVersion,
  query: PassageQuery
): string =>
  isOffline(version)
    ? `https://bible-api.com/${bookNameForId(query.bookId, 'en')}+${query.chapter}:${versesQueryString(query.verses)}?translation=web`
    : sourceFor(version).sourceUrl(version, query)

export const lookupVerses = async (
  version: IBibleVersion,
  query: PassageQuery
): Promise<IVerse[]> => {
  const bookName = bookNameForId(query.bookId, 'en')
  if (isOffline(version)) {
    return await offlineLookup(bookName, query.chapter, query.verses)
  }

  const source = sourceFor(version)
  const requested = expandRequestedVerses(query.verses)
  let missing: number[] = []
  if (requested) {
    const cached = verseCache.getVerses(
      version.key,
      bookName,
      query.chapter,
      requested
    )
    if (cached.missing.length === 0 && cached.hits.length) {
      return cached.hits
    }
    missing = cached.missing
  }

  const fetchQuery = {
    ...query,
    verses: fetchVersesFor(source, query, requested, missing),
  }
  const fetchUrl = source.requestUrl(version, fetchQuery)
  console.debug(fetchUrl, 'url to query')
  try {
    const response = await fetch(fetchUrl, {
      method: 'get',
      redirect: 'follow',
      cache: 'force-cache',
    })
    const fetched = source.parse(await response.json(), version, fetchQuery)
    verseCache.putVerses(version.key, bookName, query.chapter, fetched)
    if (!requested) {
      return fetched
    }
    const { hits } = verseCache.getVerses(
      version.key,
      bookName,
      query.chapter,
      requested
    )
    return hits.length ? hits : fetched
  } catch (error) {
    console.error('error while querying', error)
    const offline = await offlineLookup(bookName, query.chapter, query.verses)
    if (offline.length) {
      console.debug('falling back to bundled offline WEB verses')
      return offline
    }
    new Notice(`Error while querying ${fetchUrl}`)
    throw error
  }
}
```

- [ ] **Step 6: Run the tests and watch them pass**

Run: `bun test packages/obsidian-bible-reference/src/provider`
Expected: all pass, `0 fail` (old provider tests included; they are untouched).

- [ ] **Step 7: Type-check**

Run: `cd packages/obsidian-bible-reference && bunx tsc -noEmit -skipLibCheck`
Expected: exit code 0.

- [ ] **Step 8: Commit**

```bash
git add packages/obsidian-bible-reference/src/provider/verseSource.ts packages/obsidian-bible-reference/src/provider/bibleApiSource.ts packages/obsidian-bible-reference/src/provider/bollsLifeSource.ts packages/obsidian-bible-reference/src/provider/bibleSuperSearchSource.ts packages/obsidian-bible-reference/src/provider/verseLookup.ts packages/obsidian-bible-reference/src/provider/verseLookup.test.ts
git commit -m "feat(plugin): add a stateless verse lookup behind three verse source adapters"
```

---

### Task 2: Switch `VerseSuggesting` and Verse of the Day to the lookup

**Files:**
- Modify: `packages/obsidian-bible-reference/src/verse/VerseSuggesting.ts`
- Modify: `packages/obsidian-bible-reference/src/provider/verseOfDayApi.ts`
- Test: `packages/obsidian-bible-reference/src/verse/VerseSuggesting.original.test.ts`

**Interfaces:**
- Consumes: `lookupVerses`, `sourceUrlFor`, `PassageQuery` from `../provider/verseLookup` (Task 1). `VerseReference.bookId` and `new VerseSuggesting(settings, verseReference)` from plan 2.
- Produces: no new exports. After `fetchAndSetVersesText()`, a `VerseSuggesting` with source **original** links to `sourceUrlFor(version, <first range>)`. Without a fetch, it links to Bible Gateway.

- [ ] **Step 1: Write the failing test**

Create `packages/obsidian-bible-reference/src/verse/VerseSuggesting.original.test.ts`:

```ts
import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { VerseSuggesting } from './VerseSuggesting'
import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from '../data/constants'
import { splitBibleReference } from '../utils/splitBibleReference'
import { verseCache } from '../provider/verseCache'

const settings: BibleReferencePluginSettings = {
  ...DEFAULT_SETTINGS,
  bibleVersion: 'kjv',
  sourceOfReference: 'original',
}

const linkOf = (content: string): string =>
  content.slice(content.indexOf('](') + 2, -1)

afterEach(() => {
  mock.restore()
  verseCache.clear()
})

describe('the original source link', () => {
  it('points at the first range even when a later range answers last', async () => {
    spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const verse = String(input).includes('3:16') ? 16 : 18
      if (verse === 18) {
        await new Promise((resolve) => setTimeout(resolve, 20))
      }
      return {
        json: async () => ({
          reference: 'John 3',
          verses: [{ book_name: 'John', chapter: 3, verse, text: `kjv ${verse}` }],
        }),
      } as Response
    })
    const suggesting = new VerseSuggesting(
      settings,
      splitBibleReference('John 3:16, 18')
    )
    await suggesting.fetchAndSetVersesText()
    expect(linkOf(suggesting.linkOnlyContent)).toBe(
      'https://bible-api.com/John+3:16?translation=kjv'
    )
  })

  it('falls back to Bible Gateway for link-only insertion, which never fetches', () => {
    const suggesting = new VerseSuggesting(
      settings,
      splitBibleReference('John 3:16')
    )
    expect(linkOf(suggesting.linkOnlyContent)).toStartWith(
      'https://www.biblegateway.com/passage/'
    )
  })
})
```

- [ ] **Step 2: Run it and watch the race test fail**

Run: `bun test packages/obsidian-bible-reference/src/verse/VerseSuggesting.original.test.ts`
Expected: `points at the first range…` FAILS, receiving `https://bible-api.com/John+3:18?translation=kjv`: the shared provider kept the URL of the last request to finish. `falls back to Bible Gateway…` passes.

- [ ] **Step 3: Use the lookup in `VerseSuggesting`**

In `packages/obsidian-bible-reference/src/verse/VerseSuggesting.ts`:

Replace:

```ts
import { buildProvider } from '../provider/buildProvider'
import { BaseBibleAPIProvider } from '../provider/BaseBibleAPIProvider'
```

with:

```ts
import {
  lookupVerses,
  PassageQuery,
  sourceUrlFor,
} from '../provider/verseLookup'
import { IBibleVersion } from '../interfaces/IBibleVersion'
```

Replace the field:

```ts
  private bibleProvider: BaseBibleAPIProvider
```

with:

```ts
  private originalSourceUrl?: string
```

Replace this block in `getVerses()` (comment included, because it sits on the deleted provider cache):

```ts
    const bibleVersion = getBibleVersion(this.bibleVersion)
    if (
      !this.bibleProvider ||
      this.bibleProvider.BibleVersionKey !== bibleVersion?.key
    ) {
      // make sure this is only 1 adapter, and it is the same bible version
      this.bibleProvider = buildProvider(bibleVersion)
    }
```

with:

```ts
    const bibleVersion = getBibleVersion(this.bibleVersion)
```

In the same method, replace:

```ts
      if (isCrossChapterReference(range)) {
        return this.getCrossChapterVerses(range)
      } else {
        const verses = await this.bibleProvider.query(
          bookNameForId(this.verseReference.bookId, 'en'),
          range.chapterNumber,
          range?.verseNumberEnd
            ? [range.verseNumber, range.verseNumberEnd]
            : [range.verseNumber]
        )
```

with:

```ts
      if (isCrossChapterReference(range)) {
        return this.getCrossChapterVerses(bibleVersion, range)
      } else {
        const verses = await lookupVerses(bibleVersion, this.passageOf(range))
```

Still in `getVerses()`, replace:

```ts
    const results = await Promise.allSettled(rangePromises)
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allVerses.push(...result.value)
      }
    })
    return allVerses
  }
```

with:

```ts
    const results = await Promise.allSettled(rangePromises)
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allVerses.push(...result.value)
      }
    })
    this.originalSourceUrl = sourceUrlFor(
      bibleVersion,
      this.passageOf(this.verseReference.ranges[0])
    )
    return allVerses
  }

  private passageOf(range: VerseRange): PassageQuery {
    return {
      bookId: this.verseReference.bookId,
      chapter: range.chapterNumber,
      verses: range.verseNumberEnd
        ? [range.verseNumber, range.verseNumberEnd]
        : [range.verseNumber],
    }
  }
```

Change the signature of `getCrossChapterVerses`:

```ts
  private async getCrossChapterVerses(range: VerseRange): Promise<IVerse[]> {
```

to:

```ts
  private async getCrossChapterVerses(
    bibleVersion: IBibleVersion,
    range: VerseRange
  ): Promise<IVerse[]> {
```

Inside it, replace:

```ts
      segments.map((segment) =>
        this.bibleProvider.query(
          bookNameForId(this.verseReference.bookId, 'en'),
          segment.chapterNumber,
          segment.verseEnd
            ? [segment.verseStart, segment.verseEnd]
            : [segment.verseStart, 999] // 999 as upper bound for "to end of chapter"
        )
      )
```

with:

```ts
      segments.map((segment) =>
        lookupVerses(bibleVersion, {
          bookId: this.verseReference.bookId,
          chapter: segment.chapterNumber,
          verses: segment.verseEnd
            ? [segment.verseStart, segment.verseEnd]
            : [segment.verseStart, 999], // 999 as upper bound for "to end of chapter"
        })
      )
```

In `getUrlForReference()`, replace:

```ts
    if (sourceOfReference === 'original') {
      if (!this.bibleProvider) {
        const bibleVersion = getBibleVersion(this.bibleVersion)
        if (bibleVersion) {
          this.bibleProvider = buildProvider(bibleVersion)
        }
      }
      return (
        this.bibleProvider?.getOriginalVerseReferenceLink() ||
        getBibleGatewayFallback()
      )
    }
```

with:

```ts
    if (sourceOfReference === 'original') {
      return this.originalSourceUrl || getBibleGatewayFallback()
    }
```

Delete the comment `// 'original' resolves through the API provider, not a URL template.` above that `if`, because there is no API provider any more.

Keep the `bookNameForId` import, because `getUrlForReference` still calls `buildUrl(bookNameForId(bookId, 'en'))`.

- [ ] **Step 4: Use the lookup for Verse of the Day**

In `packages/obsidian-bible-reference/src/provider/verseOfDayApi.ts`, replace:

```ts
import { buildProvider } from './buildProvider'
```

with:

```ts
import { lookupVerses } from './verseLookup'
```

and replace:

```ts
    const provider = buildProvider(userBibleVersion)

    const verses = parsedReference.verseNumberEnd
      ? [parsedReference.verseNumber, parsedReference.verseNumberEnd]
      : [parsedReference.verseNumber]

    const enhancedVerse = await provider.query(
      parsedReference.bookName,
      parsedReference.chapterNumber,
      verses
    )
```

with:

```ts
    const verses = parsedReference.verseNumberEnd
      ? [parsedReference.verseNumber, parsedReference.verseNumberEnd]
      : [parsedReference.verseNumber]

    const enhancedVerse = await lookupVerses(userBibleVersion, {
      bookId: parsedReference.bookId,
      chapter: parsedReference.chapterNumber,
      verses,
    })
```

- [ ] **Step 5: Run the related tests**

Run: `bun test packages/obsidian-bible-reference/src/verse packages/obsidian-bible-reference/src/provider packages/obsidian-bible-reference/src/suggesetor packages/obsidian-bible-reference/src/utils`
Expected: all pass, `0 fail`.

- [ ] **Step 6: Type-check**

Run: `cd packages/obsidian-bible-reference && bunx tsc -noEmit -skipLibCheck`
Expected: exit code 0.

- [ ] **Step 7: Commit**

```bash
git add packages/obsidian-bible-reference/src/verse/VerseSuggesting.ts packages/obsidian-bible-reference/src/verse/VerseSuggesting.original.test.ts packages/obsidian-bible-reference/src/provider/verseOfDayApi.ts
git commit -m "refactor(plugin): look up verses through the stateless verse lookup"
```

---

### Task 3: Delete the provider classes, look up offline text by id, update the glossary

**Files:**
- Delete: `packages/obsidian-bible-reference/src/provider/BaseBibleAPIProvider.ts`, `BibleAPIDotComProvider.ts`, `BollyLifeProvider.ts`, `BibleSuperSearchProvider.ts`, `BibleSuperSearchProvider.test.ts`, `OfflineProvider.ts`, `buildProvider.ts`, `buildProvider.test.ts`, `offlineWiring.test.ts`
- Modify: `packages/obsidian-bible-reference/src/provider/offlineBible.ts`
- Modify: `packages/obsidian-bible-reference/src/provider/offlineBible.test.ts`
- Modify: `packages/obsidian-bible-reference/src/provider/verseLookup.ts`
- Modify: `packages/obsidian-bible-reference/src/utils/bookNameLocalization.ts` and its test
- Modify: `CONTEXT.md`, `docs/code-patterns.md`

**Interfaces:**
- Consumes: everything from Tasks 1–2.
- Produces: `offlineLookup(bookId: number, chapter: number, verse: number[]): Promise<IVerse[]>`, with `book_name` set to the English full name.
- Deleted: `buildProvider`, `BaseBibleAPIProvider` and its four subclasses, `bookIdForVersion`.

- [ ] **Step 1: Confirm nothing outside the old provider files still uses them**

Run: `grep -rn "buildProvider\|BaseBibleAPIProvider\|OfflineProvider\|BollyLifeProvider\|BibleAPIDotComProvider\|BibleSuperSearchProvider\|bookIdForVersion" packages/obsidian-bible-reference/src | grep -v "src/provider/\(BaseBibleAPIProvider\|BibleAPIDotComProvider\|BollyLifeProvider\|BibleSuperSearchProvider\|OfflineProvider\|buildProvider\|offlineWiring\)" | grep -v bookNameLocalization`
Expected: no output.

- [ ] **Step 2: Delete the provider classes and their tests**

```bash
cd packages/obsidian-bible-reference/src/provider
git rm BaseBibleAPIProvider.ts BibleAPIDotComProvider.ts BollyLifeProvider.ts BibleSuperSearchProvider.ts BibleSuperSearchProvider.test.ts OfflineProvider.ts buildProvider.ts buildProvider.test.ts offlineWiring.test.ts
```

Their behaviour is covered in `verseLookup.test.ts`:
- `buildProvider` routing → the per-source URL tests
- `BibleSuperSearchProvider.test.ts` → the SuperSearch URL, normalisation and `polbg` tests
- `offlineWiring.test.ts` → the offline-version and fallback tests

- [ ] **Step 3: Update the offline tests to look up by id**

In `packages/obsidian-bible-reference/src/provider/offlineBible.test.ts`:
- Remove the line `import Reference from 'bible-reference-toolkit'`.
- Change every `offlineLookup('John', ` to `offlineLookup(43, `.
- Delete the test `resolves a non-English book name via normalization`. Name resolution now belongs to `splitBibleReference`, which plan 2 covers with `Juan 3:16`.
- Change `offlineLookup('Nonexistent', 1, [1])` to `offlineLookup(0, 1, [1])`, and rename that test to `returns [] for a book id outside the canon`.
- In `matches every chapter of the source JSON`, delete `const bookName = Reference.bookEnglishFullNameFromId(bookIndex + 1)` and change `offlineLookup(bookName, chapterIndex + 1, [1, 999])` to `offlineLookup(bookIndex + 1, chapterIndex + 1, [1, 999])`.

Run: `bun test packages/obsidian-bible-reference/src/provider/offlineBible.test.ts`
Expected: FAIL. `getBookIdFromBookName` throws on a number, so the old lookup returns `[]` and the text assertions fail.

- [ ] **Step 4: Look up offline text by id**

In `packages/obsidian-bible-reference/src/provider/offlineBible.ts`, change:

```ts
import { getBookIdFromBookName } from '../utils/bookNameReference'
```

to:

```ts
import { bookNameForId } from '../utils/bookNameReference'
```

In the doc comment above `offlineLookup`, delete only the paragraph that starts `` `bookName` may be in any supported language``, because the normalisation it describes is deleted. Leave the rest of the comment.

Change:

```ts
export const offlineLookup = async (
  bookName: string,
  chapter: number,
  verse: number[]
): Promise<IVerse[]> => {
  let bookId: number
  try {
    bookId = getBookIdFromBookName(bookName)
  } catch {
    return []
  }
  bible ??= decodeBible()
```

to:

```ts
export const offlineLookup = async (
  bookId: number,
  chapter: number,
  verse: number[]
): Promise<IVerse[]> => {
  bible ??= decodeBible()
```

and change:

```ts
      verses.push({ book_name: bookName, chapter, verse: n, text })
```

to:

```ts
      verses.push({ book_name: bookNameForId(bookId, 'en'), chapter, verse: n, text })
```

In `packages/obsidian-bible-reference/src/provider/verseLookup.ts`, change both calls:

```ts
    return await offlineLookup(bookName, query.chapter, query.verses)
```

to:

```ts
    return await offlineLookup(query.bookId, query.chapter, query.verses)
```

and:

```ts
    const offline = await offlineLookup(bookName, query.chapter, query.verses)
```

to:

```ts
    const offline = await offlineLookup(
      query.bookId,
      query.chapter,
      query.verses
    )
```

- [ ] **Step 5: Delete `bookIdForVersion`**

In `packages/obsidian-bible-reference/src/utils/bookNameLocalization.ts`, delete `export const bookIdForVersion = ...` and the doc comment above it. Then change the import:

```ts
import { bookNameForId, getBookIdFromBookName } from './bookNameReference'
```

to:

```ts
import { bookNameForId } from './bookNameReference'
```

In `packages/obsidian-bible-reference/src/utils/bookNameLocalization.test.ts`:
- change `import { localizedBookName, bookIdForVersion } from './bookNameLocalization'` to `import { localizedBookName } from './bookNameLocalization'`
- delete the whole `describe('bookIdForVersion', ...)` block, and the now-unused `const english = getBibleVersion('bbe')` line

- [ ] **Step 6: Update the glossary and the file-structure doc**

In `CONTEXT.md`, replace:

```md
Owned by the `bookNameLocalization` module (`utils/bookNameLocalization.ts`):
`localizedBookName` for display, `bookIdForVersion` for the API path. The
English-vs-version-specific decision and the English fallback live here, once —
callers pass a Version, not a raw locale string.
```

with:

```md
Owned by the `bookNameLocalization` module (`utils/bookNameLocalization.ts`):
`localizedBookName(bookId, version, setting)` for display. The
English-vs-version-specific decision and the English fallback live here, once —
callers pass a Version and a book id, not a raw locale string or a name.

**Book id** — the canonical 1–66 number of a book (Protestant order). Resolved
once from the typed name by `splitBibleReference` and carried on
`VerseReference.bookId`; every later step (verse counts, verse lookup, links,
offline text) works from the id, and names are produced from it only for display.

**Verse lookup** — fetching the text of a passage for a Version. Owned by
`provider/verseLookup.ts`: `lookupVerses(version, passage)` (verse cache, fetch
of the missing verses, bundled-WEB fallback) and `sourceUrlFor(version, passage)`
(the "original" link).

**Verse source** — one Bible API behind the verse lookup (bible-api.com, Bolls
Life, Bible SuperSearch). Each is a stateless `VerseSource` adapter: request URL,
source URL, response parsing. The bundled offline Version is not a verse source;
the verse lookup reads it directly.
```

In `docs/code-patterns.md`, change:

```
  provider/         # Bible API provider classes
```

to:

```
  provider/         # verse lookup, verse source adapters, verse cache
```

- [ ] **Step 7: Check for leftovers**

Run: `grep -rn "buildProvider\|BaseBibleAPIProvider\|OfflineProvider\|bookIdForVersion\|getOriginalVerseReferenceLink" packages/obsidian-bible-reference/src docs/*.md CONTEXT.md`
Expected: no output.

- [ ] **Step 8: Run the related tests**

Run: `bun test packages/obsidian-bible-reference/src/provider packages/obsidian-bible-reference/src/verse packages/obsidian-bible-reference/src/utils packages/obsidian-bible-reference/src/suggesetor`
Expected: all pass, `0 fail`.

- [ ] **Step 9: Type-check and build**

Run: `bun run build:packages && cd packages/obsidian-bible-reference && bunx tsc -noEmit -skipLibCheck && OUT_DIR=$TMPDIR/obr-build bun scripts/esbuild.config.mjs production && ls -l $TMPDIR/obr-build/main.js`
Expected: exit code 0, and `main.js` about 1.74 MB.

- [ ] **Step 10: Smoke-test in Obsidian**

In a test vault, with source of reference **original**:
- `--John 3:16` with **KJV** (bible-api.com): verse inserts, and the link opens the bible-api.com URL.
- `--John 3:16` with a Bolls Life version (for example **NKJV**): verse inserts, and the link opens `https://bolls.life/NKJV/43/3/`.
- `--John 3:16` with **UBG** (Bible SuperSearch): verse inserts.
- Same reference with the network off: the WEB text inserts.
- Link-only insertion: the link points at Bible Gateway.

- [ ] **Step 11: Commit**

```bash
git add -A packages/obsidian-bible-reference/src CONTEXT.md docs/code-patterns.md
git commit -m "refactor(plugin): delete the provider classes in favour of the verse lookup"
```

## Behaviour changes to call out in the PR

- The "original" link of a fetched multi-range reference now points at the first range, not whichever request finished last.
- Bolls Life requests use the canonical book id instead of re-resolving the English name in the version's catalog. This removes any cross-language name collision.
- `book_name` on verses returned by the offline fallback is the English full name. Before, it was whatever string the caller passed, which in practice was also the English full name.
