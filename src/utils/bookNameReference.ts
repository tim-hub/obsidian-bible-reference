import { bcv_parser } from 'bible-passage-reference-parser/esm/bcv_parser.js'
import {
  grammar,
  regexps,
  translations,
} from 'bible-passage-reference-parser/esm/lang/en.js'

interface BCVParserConstructor {
  grammar: unknown
  regexps: unknown
  translations: unknown
}

const lang: BCVParserConstructor = {
  grammar,
  regexps,
  translations,
}

const bcv = new bcv_parser(lang)

bcv.set_options({
  book_alone_strategy: 'full',
  book_sequence_strategy: 'include',
})

export const getBookOsis = (bookName: string): string => {
  const parsed = bcv.parse(bookName).osis()
  // The osis output might be something like "Gen.1" if only "Genesis" is passed in.
  // We only want the book part.
  if (parsed.includes('.')) {
    return parsed.split('.')[0]
  }
  return parsed
}

// https://gist.github.com/danott/615135
const booksYouVersionMapping: { [key: string]: string } = {
  gen: 'Genesis',
  exo: 'Exodus',
  lev: 'Leviticus',
  num: 'Numbers',
  deu: 'Deuteronomy',
  jos: 'Joshua',
  jdg: 'Judges',
  rut: 'Ruth',
  '1sa': '1 Samuel',
  '2sa': '2 Samuel',
  '1ki': '1 Kings',
  '2ki': '2 Kings',
  '1ch': '1 Chronicles',
  '2ch': '2 Chronicles',
  ezr: 'Ezra',
  neh: 'Nehemiah',
  est: 'Esther',
  job: 'Job',
  psa: 'Psalm',
  ps: 'Psalm', // Common abbreviation for Psalm
  pro: 'Proverbs',
  prov: 'Proverbs', // Common abbreviation for Proverbs
  ecc: 'Ecclesiastes',
  eccl: 'Ecclesiastes', // Common abbreviation for Ecclesiastes
  sng: 'Song of Solomon',
  song: 'Song of Solomon', // Common abbreviation for Song of Solomon
  sos: 'Song of Solomon', // Another common abbreviation
  isa: 'Isaiah',
  jer: 'Jeremiah',
  lam: 'Lamentations',
  ezk: 'Ezekiel',
  ezek: 'Ezekiel', // Common abbreviation for Ezekiel
  dan: 'Daniel',
  hos: 'Hosea',
  jol: 'Joel',
  amo: 'Amos',
  oba: 'Obadiah',
  obad: 'Obadiah', // Common abbreviation for Obadiah
  jon: 'Jonah',
  mic: 'Micah',
  nam: 'Nahum',
  nah: 'Nahum', // Common abbreviation for Nahum
  hab: 'Habakkuk',
  zep: 'Zephaniah',
  zeph: 'Zephaniah', // Common abbreviation for Zephaniah
  hag: 'Haggai',
  zec: 'Zechariah',
  zech: 'Zechariah', // Common abbreviation for Zechariah
  mal: 'Malachi',
  mat: 'Matthew',
  matt: 'Matthew', // Common abbreviation for Matthew
  mrk: 'Mark',
  mar: 'Mark', // Common abbreviation for Mark
  mk: 'Mark', // Another common abbreviation for Mark
  lke: 'Luke',
  lk: 'Luke', // Common abbreviation for Luke
  jhn: 'John',
  jn: 'John', // Additional common abbreviation for John
  act: 'Acts',
  rom: 'Romans',
  '1co': '1 Corinthians',
  '1cor': '1 Corinthians', // Common abbreviation for 1 Corinthians
  '2co': '2 Corinthians',
  '2cor': '2 Corinthians', // Common abbreviation for 2 Corinthians
  gal: 'Galatians',
  eph: 'Ephesians',
  php: 'Philippians',
  phil: 'Philippians', // Common abbreviation for Philippians
  col: 'Colossians',
  '1th': '1 Thessalonians',
  '1thess': '1 Thessalonians', // Common abbreviation for 1 Thessalonians
  '2th': '2 Thessalonians',
  '2thess': '2 Thessalonians', // Common abbreviation for 2 Thessalonians
  '1ti': '1 Timothy',
  '1tim': '1 Timothy', // Common abbreviation for 1 Timothy
  '2ti': '2 Timothy',
  '2tim': '2 Timothy', // Common abbreviation for 2 Timothy
  tit: 'Titus',
  phm: 'Philemon',
  phlm: 'Philemon', // Common abbreviation for Philemon
  heb: 'Hebrews',
  jas: 'James',
  jam: 'James', // Common abbreviation for James
  '1pe': '1 Peter',
  '1pet': '1 Peter', // Common abbreviation for 1 Peter
  '2pe': '2 Peter',
  '2pet': '2 Peter', // Common abbreviation for 2 Peter
  '1jn': '1 John',
  '1john': '1 John', // Common abbreviation for 1 John
  '2jn': '2 John',
  '2john': '2 John', // Common abbreviation for 2 John
  '3jn': '3 John',
  '3john': '3 John', // Common abbreviation for 3 John
  jud: 'Jude',
  jude: 'Jude', // Full name as abbreviation
  rev: 'Revelation',
}

export const getBookFullName = (bookName: string): string => {
  const lowerBookName = bookName.toLowerCase().trim()

  // Check if it's an abbreviation in our mapping
  if (booksYouVersionMapping[lowerBookName]) {
    return booksYouVersionMapping[lowerBookName]
  }

  // If not found in mapping, return the original book name (might already be full name)
  return bookName
}
