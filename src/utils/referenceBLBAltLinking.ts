// utils/referenceBLBAltLinking.ts

import { BibleReferencePluginSettings } from '../data/constants';
import { VerseReference } from '../utils/splitBibleReference';

/**
 * Mapping of standard book names to Blue Letter Bible three-character codes.
 */
export const blbBookCodes: { [key: string]: string } = {
  'Genesis': 'Gen',
  'Exodus': 'Exo',
  'Leviticus': 'Lev',
  'Numbers': 'Num',
  'Deuteronomy': 'Deu',
  'Joshua': 'Jos',
  'Judges': 'Jdg',
  'Ruth': 'Rth',
  '1 Samuel': '1Sa',
  '2 Samuel': '2Sa',
  '1 Kings': '1Ki',
  '2 Kings': '2Ki',
  '1 Chronicles': '1Ch',
  '2 Chronicles': '2Ch',
  'Ezra': 'Ezr',
  'Nehemiah': 'Neh',
  'Esther': 'Est',
  'Job': 'Job',
  'Psalms': 'Psa',
  'Proverbs': 'Pro',
  'Ecclesiastes': 'Ecc',
  'Song of Solomon': 'Sng',
  'Isaiah': 'Isa',
  'Jeremiah': 'Jer',
  'Lamentations': 'Lam',
  'Ezekiel': 'Eze',
  'Daniel': 'Dan',
  'Hosea': 'Hos',
  'Joel': 'Joe',
  'Amos': 'Amo',
  'Obadiah': 'Oba',
  'Jonah': 'Jon',
  'Micah': 'Mic',
  'Nahum': 'Nah',
  'Habakkuk': 'Hab',
  'Zephaniah': 'Zep',
  'Haggai': 'Hag',
  'Zechariah': 'Zec',
  'Malachi': 'Mal',
  'Matthew': 'Mat',
  'Mark': 'Mar',
  'Luke': 'Luk',
  'John': 'Jhn',
  'Acts': 'Act',
  'Romans': 'Rom',
  '1 Corinthians': '1Co',
  '2 Corinthians': '2Co',
  'Galatians': 'Gal',
  'Ephesians': 'Eph',
  'Philippians': 'Php',
  'Colossians': 'Col',
  '1 Thessalonians': '1Th',
  '2 Thessalonians': '2Th',
  '1 Timothy': '1Ti',
  '2 Timothy': '2Ti',
  'Titus': 'Tit',
  'Philemon': 'Phm',
  'Hebrews': 'Heb',
  'James': 'Jas',
  '1 Peter': '1Pe',
  '2 Peter': '2Pe',
  '1 John': '1Jn',
  '2 John': '2Jn',
  '3 John': '3Jn',
  'Jude': 'Jud',
  'Revelation': 'Rev'
};

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
  const bookCode = blbBookCodes[bookName];
  if (!bookCode) {
    throw new Error(`Book code not found for ${bookName}`);
  }
  let url = `https://www.blueletterbible.org/${versionCode}/${bookCode}/${chapterNumber}/${verseNumber}`;
  if (verseNumberEnd) {
    url += `-${verseNumberEnd}`;
  }
  return url;
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
  const { bookName, chapterNumber, verseNumber, verseNumberEnd } = verseReference;
  try {
    const url = getBLBUrl(
      settings.versionCodeBLB,
      bookName,
      chapterNumber,
      verseNumber,
      verseNumberEnd
    );
    const reference = `${bookName} ${chapterNumber}:${verseNumber}${verseNumberEnd ? `-${verseNumberEnd}` : ''}`;
    return ` [${reference}](${url})`;
  } catch (error) {
    console.error('Error generating BLB URL:', error);
    return ''; // Return empty string for broken link
  }
}
