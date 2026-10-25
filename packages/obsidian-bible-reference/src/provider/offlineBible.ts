import { IVerse } from '../interfaces/IVerse'
import { getBookIdFromBookName } from '../utils/bookNameReference'
import packedBible from 'offline-bible-packed'

const BOOK_SEPARATOR = '\x1d'
const CHAPTER_SEPARATOR = '\x1e'
const VERSE_SEPARATOR = '\n'

/**
 * Bundled World English Bible (public domain), indexed by position:
 *   offlineBible[bookId-1][chapter-1][verse-1] = verse text
 * Canonical 66-book Protestant order (aligned to getTranslationBooks('en')).
 */
let bible: Promise<string[][][]> | undefined

const decodeBible = async (): Promise<string[][][]> => {
  const bytes = Uint8Array.from(atob(packedBible), (char) => char.charCodeAt(0))
  const text = await new Response(
    new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  ).text()
  return text
    .split(BOOK_SEPARATOR)
    .map((book) =>
      book
        .split(CHAPTER_SEPARATOR)
        .map((chapter) => chapter.split(VERSE_SEPARATOR))
    )
}

/**
 * Resolve verses from the in-memory bundled WEB text — no network.
 *
 * `bookName` may be in any supported language; it is normalized to a canonical
 * book id so the English bundle resolves even when a version renders non-English
 * book names.
 *
 * `verse` mirrors the query verse[] semantics used across providers:
 *   [n]          -> verse n
 *   [a, b]       -> a..b
 *   [a, 999]     -> a..end of chapter (open-ended sentinel)
 *
 * Returns the verses that exist; `[]` when the book/chapter is out of range.
 */
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
  const chapterVerses = (await bible)[bookId - 1]?.[chapter - 1]
  if (!chapterVerses) {
    return []
  }

  const start = verse[0]
  const end =
    verse.length === 1
      ? verse[0]
      : verse[1] === 999
        ? chapterVerses.length
        : verse[1]

  const verses: IVerse[] = []
  for (let n = start; n <= end; n++) {
    const text = chapterVerses[n - 1]
    if (text) {
      verses.push({ book_name: bookName, chapter, verse: n, text })
    }
  }
  return verses
}
