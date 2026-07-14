import Reference from 'bible-reference-toolkit'
import { getBookIdFromBookName } from '../utils/bookNameReference'

/**
 * Chapter/verse counts for range validation. Backed by bible-reference-toolkit
 * (which reads bible-book-names-intl) so the Bible structure lives in one place.
 */

/**
 * Get the number of verses in a specific chapter of a book.
 * @param bookName Standard book name
 * @param chapterNumber 1-indexed chapter number
 * @returns Number of verses, or 0 if the book/chapter is unknown
 */
export const getVerseCount = (
  bookName: string,
  chapterNumber: number
): number => {
  try {
    const bookId = getBookIdFromBookName(bookName)
    if (
      chapterNumber < 1 ||
      chapterNumber > Reference.chaptersInBookId(bookId)
    ) {
      return 0
    }
    const chapterId = Reference.chaptersUpToBookId(bookId) + chapterNumber
    return Reference.versesInChapterId(chapterId)
  } catch {
    return 0
  }
}

/**
 * Get the total number of chapters in a book.
 * @param bookName Standard book name
 * @returns Number of chapters, or 0 if the book is unknown
 */
export const getChapterCount = (bookName: string): number => {
  try {
    return Reference.chaptersInBookId(getBookIdFromBookName(bookName))
  } catch {
    return 0
  }
}
