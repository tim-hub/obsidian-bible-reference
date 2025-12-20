// utils/referenceBLBAltLinking.ts

import { BibleReferencePluginSettings } from '../data/constants'
import { VerseReference } from './splitBibleReference'
import { blbBookCodes } from '../data/abbreviations'

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
  const bookCode = blbBookCodes[bookName]
  if (!bookCode) {
    throw new Error(`Book code not found for ${bookName}`)
  }
  let url = `https://www.blueletterbible.org/${versionCode}/${bookCode}/${chapterNumber}/${verseNumber}`
  if (verseNumberEnd) {
    url += `-${verseNumberEnd}`
  }
  return url
}

/**
 * Generates a formatted BLB hyperlink for the verse reference.
 * @param settings - The plugin settings containing versionCodeBLB.
 * @param verseReference - The verse reference object with book, chapter, and verse details.
 * @returns A Markdown link string or an empty string if there's an error.
 */
export function getBLBLink(
  settings: BibleReferencePluginSettings,
  verseReference: VerseReference
): string {
  const { bookName, chapterNumber, verseNumber, verseNumberEnd } =
    verseReference
  try {
    const url = getBLBUrl(
      settings.versionCodeBLB,
      bookName,
      chapterNumber,
      verseNumber,
      verseNumberEnd
    )
    const reference = `${bookName} ${chapterNumber}:${verseNumber}${verseNumberEnd ? `-${verseNumberEnd}` : ''}`
    return ` [${reference}](${url})`
  } catch (error) {
    console.error('Error generating BLB URL:', error)
    return '' // Return empty string for broken link
  }
}
