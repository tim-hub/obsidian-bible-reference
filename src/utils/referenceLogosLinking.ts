// utils/referenceLogosLinking.ts

import { BibleReferencePluginSettings } from '../data/constants'
import { VerseReference } from './splitBibleReference'

/**
 * Mapping of standard book names to Logos Bible Software abbreviations.
 * Reference: https://www.logos.com/bible-book-abbreviations
 */
export const logosBookAbbreviations: { [key: string]: string } = {
  Genesis: 'Ge',
  Exodus: 'Ex',
  Leviticus: 'Le',
  Numbers: 'Nu',
  Deuteronomy: 'De',
  Joshua: 'Jos',
  Judges: 'Jdg',
  Ruth: 'Ru',
  '1 Samuel': '1Sa',
  '2 Samuel': '2Sa',
  '1 Kings': '1Ki',
  '2 Kings': '2Ki',
  '1 Chronicles': '1Ch',
  '2 Chronicles': '2Ch',
  Ezra: 'Ezr',
  Nehemiah: 'Ne',
  Esther: 'Es',
  Job: 'Job',
  Psalms: 'Ps',
  Proverbs: 'Pr',
  Ecclesiastes: 'Ec',
  'Song of Solomon': 'So',
  Isaiah: 'Is',
  Jeremiah: 'Je',
  Lamentations: 'La',
  Ezekiel: 'Eze',
  Daniel: 'Da',
  Hosea: 'Ho',
  Joel: 'Joe',
  Amos: 'Am',
  Obadiah: 'Ob',
  Jonah: 'Jon',
  Micah: 'Mic',
  Nahum: 'Na',
  Habakkuk: 'Hab',
  Zephaniah: 'Zep',
  Haggai: 'Hag',
  Zechariah: 'Zec',
  Malachi: 'Mal',
  Matthew: 'Mt',
  Mark: 'Mk',
  Luke: 'Lk',
  John: 'Jn',
  Acts: 'Ac',
  Romans: 'Ro',
  '1 Corinthians': '1Co',
  '2 Corinthians': '2Co',
  Galatians: 'Ga',
  Ephesians: 'Eph',
  Philippians: 'Php',
  Colossians: 'Col',
  '1 Thessalonians': '1Th',
  '2 Thessalonians': '2Th',
  '1 Timothy': '1Ti',
  '2 Timothy': '2Ti',
  Titus: 'Tit',
  Philemon: 'Phm',
  Hebrews: 'Heb',
  James: 'Jas',
  '1 Peter': '1Pe',
  '2 Peter': '2Pe',
  '1 John': '1Jn',
  '2 John': '2Jn',
  '3 John': '3Jn',
  Jude: 'Jud',
  Revelation: 'Re',
}

/**
 * Mapping of plugin Bible version keys to Logos keywords.
 */
export const logosTranslationKeywords: { [key: string]: string } = {
  niv2011: 'niv2011',
  nasb: 'nasb95',
  msg: 'message',
  esv: 'esv',
  lsb: 'lgcystndrdbblsb',
  nlt: 'nlt',
  kjv: 'kjv',
  nkjv: 'nkjv',
  rsv: 'rsv',
}

/**
 * Mapping of plugin Bible version keys to Logos keywords for the 'ref' parameter.
 * Some versions use a different abbreviation in the ref than in the URL keyword.
 */
export const logosRefKeywords: { [key: string]: string } = {
  niv2011: 'NIV',
  nasb: 'NASB',
  msg: '',
  lsb: '',
}

/**
 * Generates a Logos ref.ly URL for a given verse reference.
 */
export function getLogosUrl(
  translation: string, // plugin translation key
  bookName: string,
  chapterNumber: number,
  verseNumber: number,
  verseNumberEnd?: number
): string {
  const bookAbbr = logosBookAbbreviations[bookName]
  if (!bookAbbr) {
    throw new Error(`Logos abbreviation not found for ${bookName}`)
  }

  const logosKeyword =
    logosTranslationKeywords[translation] || translation.toLowerCase()

  const logosRefKeyword =
    translation in logosRefKeywords
      ? logosRefKeywords[translation]
      : logosKeyword.toUpperCase()

  // Example result [Genesis 1:1 - ESV](https://ref.ly/logosres/esv?ref=BibleESV.Ge1.1)
  let ref = `Bible${logosRefKeyword}.${bookAbbr}${chapterNumber}.${verseNumber}`
  if (verseNumberEnd) {
    ref += `-${verseNumberEnd}`
  }

  return `https://ref.ly/logosres/${logosKeyword}?ref=${ref}`
}

/**
 * Generates a formatted Logos hyperlink for the verse reference.
 */
export function getLogosLink(
  settings: BibleReferencePluginSettings,
  verseReference: VerseReference
): string {
  const { bookName, chapterNumber, verseNumber, verseNumberEnd } =
    verseReference
  const translation = settings.bibleVersion || 'esv'

  try {
    const url = getLogosUrl(
      translation,
      bookName,
      chapterNumber,
      verseNumber,
      verseNumberEnd
    )
    const reference = `${bookName} ${chapterNumber}:${verseNumber}${verseNumberEnd ? `-${verseNumberEnd}` : ''}`
    return ` [${reference} - ${translation.toUpperCase()}](${url})`
  } catch (error) {
    console.error('Error generating Logos URL:', error)
    return ''
  }
}
