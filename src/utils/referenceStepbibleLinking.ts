// utils/referenceStepbibleLinking.ts

import { STEPBIBLE_BOOK_CODES } from '../data/abbreviations'

/**
 * Generates a StepBible URL for a given verse reference.
 * URL format: https://www.stepbible.org/?q=version={VERSION}|reference={Book}.{Chapter}.{Verse}[-{VerseEnd}]&skipwelcome
 * For cross-chapter references: {Book}.{Chapter}.{Verse}-{Book}.{ChapterEnd}.{VerseEnd}
 * @throws Error if the book name is not found in the mapping.
 */
export function getStepbibleUrl(
  versionCode: string,
  bookName: string,
  chapterNumber: number,
  verseNumber: number,
  verseNumberEnd?: number,
  chapterNumberEnd?: number,
  verseNumberEndChapter?: number
): string {
  const bookCode = STEPBIBLE_BOOK_CODES[bookName]
  if (!bookCode) {
    throw new Error(`Book code not found for ${bookName}`)
  }

  // Map internal version keys to StepBible version codes (uppercase)
  let stepbibleVersion = versionCode.toUpperCase()
  if (stepbibleVersion === 'NIV2011') {
    stepbibleVersion = 'NIV'
  }

  // Build reference string
  let reference = `${bookCode}.${chapterNumber}.${verseNumber}`

  if (chapterNumberEnd !== undefined && verseNumberEndChapter !== undefined) {
    // Cross-chapter reference: Book.Chapter.Verse-Book.ChapterEnd.VerseEnd
    reference += `-${bookCode}.${chapterNumberEnd}.${verseNumberEndChapter}`
  } else if (verseNumberEnd) {
    // Same chapter verse range: Book.Chapter.Verse-VerseEnd
    reference += `-${verseNumberEnd}`
  }

  // StepBible uses | as separator between version and reference in the query
  // &skipwelcome skips the welcome pane
  return `https://www.stepbible.org/?q=version=${stepbibleVersion}|reference=${reference}&skipwelcome`
}
