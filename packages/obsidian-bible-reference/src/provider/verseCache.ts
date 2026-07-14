import { IVerse } from '../interfaces/IVerse'

const SCHEMA_VERSION = 1 as const
const FLUSH_DELAY_MS = 2000

interface SerializedVerseCache {
  version: typeof SCHEMA_VERSION
  translations: {
    [translationKey: string]: {
      // chapterKey = `${bookName}|${chapter}`
      [chapterKey: string]: { [verseNumber: string]: IVerse }
    }
  }
}

const chapterKeyOf = (bookName: string, chapter: number): string =>
  `${bookName}|${chapter}`

/**
 * Nested, verse-granular cache for immutable Bible text.
 * Keyed translation -> `${bookName}|${chapter}` -> verse number.
 * Fully automatic, unbounded, no expiry (per plugin design).
 */
class VerseCache {
  private data: SerializedVerseCache['translations'] = {}
  private dirty = false
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  private persist?: () => void

  /**
   * Return cached verses (in requested order) plus the verse numbers missing.
   */
  public getVerses(
    translationKey: string,
    bookName: string,
    chapter: number,
    verseNumbers: number[]
  ): { hits: IVerse[]; missing: number[] } {
    const chapterData =
      this.data[translationKey]?.[chapterKeyOf(bookName, chapter)]
    const hits: IVerse[] = []
    const missing: number[] = []
    for (const verseNumber of verseNumbers) {
      const verse = chapterData?.[verseNumber]
      if (verse) {
        hits.push(verse)
      } else {
        missing.push(verseNumber)
      }
    }
    console.debug(
      `[verseCache] getVerses ${translationKey} ${chapterKeyOf(bookName, chapter)} req=[${verseNumbers}] hits=[${hits.map((h) => h.verse)}] missing=[${missing}]`
    )
    return { hits, missing }
  }

  /**
   * Store each returned verse under translation/chapter/verse.
   * Skips empty payloads (never caches HTTP-200 error bodies).
   */
  public putVerses(
    translationKey: string,
    bookName: string,
    chapter: number,
    verses: IVerse[]
  ): void {
    if (!verses?.length) {
      console.debug(
        `[verseCache] putVerses SKIP (empty) ${translationKey} ${chapterKeyOf(bookName, chapter)}`
      )
      return
    }
    const key = chapterKeyOf(bookName, chapter)
    const translation = (this.data[translationKey] ??= {})
    const chapterData = (translation[key] ??= {})
    for (const verse of verses) {
      chapterData[verse.verse] = verse
    }
    console.debug(
      `[verseCache] putVerses ${translationKey} ${key} stored=[${verses.map((v) => v.verse)}]`
    )
    this.markDirty()
  }

  public hydrate(serialized: unknown): void {
    const blob = serialized as SerializedVerseCache | undefined
    if (blob?.version === SCHEMA_VERSION && blob.translations) {
      this.data = blob.translations
      console.debug(
        `[verseCache] hydrate loaded translations=[${Object.keys(this.data)}]`
      )
    } else {
      console.debug('[verseCache] hydrate empty (no/incompatible blob)')
    }
  }

  public serialize(): SerializedVerseCache {
    return { version: SCHEMA_VERSION, translations: this.data }
  }

  public setPersist(persist: () => void): void {
    this.persist = persist
  }

  /**
   * Cancel any pending flush and persist immediately if dirty (onunload).
   */
  public flushNow(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    if (this.dirty) {
      this.dirty = false
      console.debug('[verseCache] flushNow (onunload) -> persist()')
      this.persist?.()
    }
  }

  /** Test hygiene: reset all state. */
  public clear(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    this.data = {}
    this.dirty = false
    this.persist = undefined
  }

  private markDirty(): void {
    this.dirty = true
    if (this.flushTimer) {
      return
    }
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null
      if (this.dirty) {
        this.dirty = false
        console.debug('[verseCache] flush -> persist()')
        this.persist?.()
      }
    }, FLUSH_DELAY_MS)
  }
}

export const verseCache = new VerseCache()

/**
 * Interpret a query verse[] as concrete verse numbers, or null when the extent
 * is unknowable (open-ended `[n,999]`) so the caller always fetches.
 *   [n]         -> [n]
 *   [a,b] b<999 -> [a..b]
 *   [a,999]     -> null   (whole-chapter-to-end sentinel; matches getCrossChapterVerses)
 */
export function expandRequestedVerses(verse: number[]): number[] | null {
  if (verse.length === 1) {
    return [verse[0]]
  }
  const [start, end] = verse
  if (end === 999) {
    return null
  }
  const numbers: number[] = []
  for (let n = start; n <= end; n++) {
    numbers.push(n)
  }
  return numbers
}
