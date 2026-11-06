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
