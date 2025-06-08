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

// Mapping from OSIS abbreviations to full book names
const osisToFullName: { [key: string]: string } = {
  Gen: 'Genesis',
  Exod: 'Exodus',
  Lev: 'Leviticus',
  Num: 'Numbers',
  Deut: 'Deuteronomy',
  Josh: 'Joshua',
  Judg: 'Judges',
  Ruth: 'Ruth',
  '1Sam': '1 Samuel',
  '2Sam': '2 Samuel',
  '1Kgs': '1 Kings',
  '2Kgs': '2 Kings',
  '1Chr': '1 Chronicles',
  '2Chr': '2 Chronicles',
  Ezra: 'Ezra',
  Neh: 'Nehemiah',
  Esth: 'Esther',
  Job: 'Job',
  Ps: 'Psalms',
  Prov: 'Proverbs',
  Eccl: 'Ecclesiastes',
  Song: 'Song of Solomon',
  Isa: 'Isaiah',
  Jer: 'Jeremiah',
  Lam: 'Lamentations',
  Ezek: 'Ezekiel',
  Dan: 'Daniel',
  Hos: 'Hosea',
  Joel: 'Joel',
  Amos: 'Amos',
  Obad: 'Obadiah',
  Jonah: 'Jonah',
  Mic: 'Micah',
  Nah: 'Nahum',
  Hab: 'Habakkuk',
  Zeph: 'Zephaniah',
  Hag: 'Haggai',
  Zech: 'Zechariah',
  Mal: 'Malachi',
  Matt: 'Matthew',
  Mark: 'Mark',
  Luke: 'Luke',
  John: 'John',
  Acts: 'Acts',
  Rom: 'Romans',
  '1Cor': '1 Corinthians',
  '2Cor': '2 Corinthians',
  Gal: 'Galatians',
  Eph: 'Ephesians',
  Phil: 'Philippians',
  Col: 'Colossians',
  '1Thess': '1 Thessalonians',
  '2Thess': '2 Thessalonians',
  '1Tim': '1 Timothy',
  '2Tim': '2 Timothy',
  Titus: 'Titus',
  Phlm: 'Philemon',
  Heb: 'Hebrews',
  Jas: 'James',
  '1Pet': '1 Peter',
  '2Pet': '2 Peter',
  '1John': '1 John',
  '2John': '2 John',
  '3John': '3 John',
  Jude: 'Jude',
  Rev: 'Revelation',
}

export const getBookFullName = (bookName: string): string => {
  try {
    // First, use bcv_parser to normalize the book name to OSIS
    const osisName = getBookOsis(bookName)

    // Then map the OSIS abbreviation to the full name
    if (osisToFullName[osisName]) {
      return osisToFullName[osisName]
    }

    // If no mapping found, return the original book name
    return bookName
  } catch (error) {
    console.debug('Error parsing book name:', bookName, error)
    return bookName
  }
}
