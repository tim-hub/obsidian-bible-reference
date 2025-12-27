// utils/referenceBLBAltLinking.ts

import { BLB_BOOK_CODES } from '../data/abbreviations'

/**
 * Generates a Blue Letter Bible URL for a given verse reference.
 * @throws Error if the book name is not found in the mapping.
 */
export function getBLBUrl(
  versionCode: string,
  bookName: string,
  chapterNumber: number,
  verseNumber: number,
  verseNumberEnd?: number
): string {
  const bookCode = BLB_BOOK_CODES[bookName]
  if (!bookCode) {
    throw new Error(`Book code not found for ${bookName}`)
  }

  // Map internal version keys to BLB version codes
  let blbVersion = versionCode.toLowerCase()
  if (blbVersion === 'niv2011') {
    blbVersion = 'niv'
  }

  let url = `https://www.blueletterbible.org/${blbVersion}/${bookCode.toLowerCase()}/${chapterNumber}/${verseNumber}`
  if (verseNumberEnd) {
    url += `-${verseNumberEnd}`
  }
  return url + '/'
}
