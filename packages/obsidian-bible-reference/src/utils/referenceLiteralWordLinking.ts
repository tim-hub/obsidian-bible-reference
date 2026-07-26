// utils/referenceLiteralWordLinking.ts

/**
 * Mapping of standard book names to Literal Word abbreviations.
 * Reference: https://app.literalword.com/deep-links
 */
export const literalWordBookAbbreviations: { [key: string]: string } = {
  Genesis: '1',
  Exodus: '2',
  Leviticus: '3',
  Numbers: '4',
  Deuteronomy: '5',
  Joshua: '6',
  Judges: '7',
  Ruth: '8',
  '1 Samuel': '9',
  '2 Samuel': '10',
  '1 Kings': '11',
  '2 Kings': '12',
  '1 Chronicles': '13',
  '2 Chronicles': '14',
  Ezra: '15',
  Nehemiah: '16',
  Esther: '17',
  Job: '18',
  Psalms: '19',
  Proverbs: '20',
  Ecclesiastes: '21',
  'Song of Solomon': '22',
  Isaiah: '23',
  Jeremiah: '24',
  Lamentations: '25',
  Ezekiel: '26',
  Daniel: '27',
  Hosea: '28',
  Joel: '29',
  Amos: '30',
  Obadiah: '31',
  Jonah: '32',
  Micah: '33',
  Nahum: '34',
  Habakkuk: '35',
  Zephaniah: '36',
  Haggai: '37',
  Zechariah: '38',
  Malachi: '39',
  Matthew: '40',
  Mark: '41',
  Luke: '42',
  John: '43',
  Acts: '44',
  Romans: '45',
  '1 Corinthians': '46',
  '2 Corinthians': '47',
  Galatians: '48',
  Ephesians: '49',
  Philippians: '50',
  Colossians: '51',
  '1 Thessalonians': '52',
  '2 Thessalonians': '53',
  '1 Timothy': '54',
  '2 Timothy': '55',
  Titus: '56',
  Philemon: '57',
  Hebrews: '58',
  James: '59',
  '1 Peter': '60',
  '2 Peter': '61',
  '1 John': '62',
  '2 John': '63',
  '3 John': '64',
  Jude: '65',
  Revelation: '66',
}

/**
 * Mapping of plugin Bible version keys to Literal Word keywords.
 * Reference: https://app.literalword.com/deep-links
 */
export const literalWordTranslationKeywords: { [key: string]: string } = {
  nasb: 'nasb',
  esv: 'esv',
  lsb: 'lsb',
  kjv: 'kjv',
  nkjv: 'nkjv',
}

/**
 * Generates a Literal Word app URL for a given verse reference.
 * Reference: https://app.literalword.com/deep-links
 */
export function getLiteralWordUrl(
  translation: string, // plugin translation key
  bookName: string,
  chapterNumber: number,
  verseNumber: number
): string {
  const bookAbbr = literalWordBookAbbreviations[bookName]
  if (!bookAbbr) {
    throw new Error(`Literal Word abbreviation not found for ${bookName}`)
  }

  const translationAbbr = literalWordTranslationKeywords[translation]

  if (translationAbbr) {
    // https://app.literalword.com/<translation>/<book>/<chapter>[/<verse>]
    return `https://app.literalword.com/${translationAbbr}/${bookAbbr}/${chapterNumber}/${verseNumber}`
  }

  // https://app.literalword.com/<book>/<chapter>[/<verse>]
  return `https://app.literalword.com/${bookAbbr}/${chapterNumber}/${verseNumber}`
}
