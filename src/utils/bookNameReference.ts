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
  pro: 'Proverbs',
  ecc: 'Ecclesiastes',
  sng: 'Song of Solomon',
  isa: 'Isaiah',
  jer: 'Jeremiah',
  lam: 'Lamentations',
  ezk: 'Ezekiel',
  dan: 'Daniel',
  hos: 'Hosea',
  jol: 'Joel',
  amo: 'Amos',
  oba: 'Obadiah',
  jon: 'Jonah',
  mic: 'Micah',
  nam: 'Nahum',
  hab: 'Habakkuk',
  zep: 'Zephaniah',
  hag: 'Haggai',
  zec: 'Zechariah',
  mal: 'Malachi',
  mat: 'Matthew',
  mrk: 'Mark',
  lke: 'Luke',
  jhn: 'John',
  jn: 'John', // Additional common abbreviation for John
  act: 'Acts',
  rom: 'Romans',
  '1co': '1 Corinthians',
  '2co': '2 Corinthians',
  gal: 'Galatians',
  eph: 'Ephesians',
  php: 'Philippians',
  col: 'Colossians',
  '1th': '1 Thessalonians',
  '2th': '2 Thessalonians',
  '1ti': '1 Timothy',
  '2ti': '2 Timothy',
  tit: 'Titus',
  phm: 'Philemon',
  heb: 'Hebrews',
  jas: 'James',
  '1pe': '1 Peter',
  '2pe': '2 Peter',
  '1jn': '1 John',
  '2jn': '2 John',
  '3jn': '3 John',
  jud: 'Jude',
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
