import { IVerse } from '../interfaces/IVerse'
import { getBookIdFromBookName } from '../utils/bookNameReference'
import offlineBible from '../data/offlineBible.web.json'

/**
 * Bundled World English Bible (public domain), indexed by position:
 *   offlineBible[bookId-1][chapter-1][verse-1] = verse text
 * Canonical 66-book Protestant order (aligned to getTranslationBooks('en')).
 */
const bible = offlineBible as string[][][]

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
export const offlineLookup = (
  bookName: string,
  chapter: number,
  verse: number[]
): IVerse[] => {
  let bookId: number
  try {
    bookId = getBookIdFromBookName(bookName)
  } catch {
    return []
  }
  const chapterVerses = bible[bookId - 1]?.[chapter - 1]
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
