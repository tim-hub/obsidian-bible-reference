// utils/referenceStepbibleLinking.ts

import { STEPBIBLE_BOOK_CODES } from '../data/abbreviations'

/**
 * Generates a StepBible URL for a given verse reference.
 * URL format: https://www.stepbible.org/?q=version={VERSION}|reference={Book}.{Chapter}.{Verse}[-{VerseEnd}]
 * @throws Error if the book name is not found in the mapping.
 */
export function getStepbibleUrl(
  versionCode: string,
  bookName: string,
  chapterNumber: number,
  verseNumber: number,
  verseNumberEnd?: number
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

  // Build reference string: Book.Chapter.Verse or Book.Chapter.Verse-VerseEnd
  let reference = `${bookCode}.${chapterNumber}.${verseNumber}`
  if (verseNumberEnd) {
    reference += `-${verseNumberEnd}`
  }

  // StepBible uses | as separator between version and reference in the query
  return `https://www.stepbible.org/?q=version=${stepbibleVersion}|reference=${reference}`
}
