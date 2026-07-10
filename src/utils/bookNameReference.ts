import Reference from 'bible-reference-toolkit'

const SUPPORTED_BOOK_NAME_LANGUAGE_CODES = [
  'en',
  'it',
  'jp',
  'hi',
  'sp',
  'da',
  'de',
  'fr',
  'pt',
  'ro',
  'ko',
]

const normalizeBookName = (bookName: string): string =>
  bookName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

const buildBookNameAliasLookup = (
  aliases: Array<[string, number]>
): Record<string, number> =>
  aliases.reduce<Record<string, number>>((lookup, [bookName, bookId]) => {
    lookup[normalizeBookName(bookName)] = bookId
    return lookup
  }, {})

const BOOK_NAME_ALIASES_BY_LANGUAGE_CODE: Record<
  string,
  Record<string, number>
> = {
  sp: buildBookNameAliasLookup([
    ['Génesis', 1],
    ['Éxodo', 2],
    ['Levítico', 3],
    ['Números', 4],
    ['Deuteronomio', 5],
    ['Josué', 6],
    ['Jueces', 7],
    ['Rut', 8],
    ['1 Samuel', 9],
    ['2 Samuel', 10],
    ['1 Reyes', 11],
    ['2 Reyes', 12],
    ['1 Crónicas', 13],
    ['2 Crónicas', 14],
    ['Esdras', 15],
    ['Nehemías', 16],
    ['Ester', 17],
    ['Job', 18],
    ['Salmos', 19],
    ['Proverbios', 20],
    ['Eclesiastés', 21],
    ['Cantares', 22],
    ['Cantar de los Cantares', 22],
    ['Isaías', 23],
    ['Jeremías', 24],
    ['Lamentaciones', 25],
    ['Ezequiel', 26],
    ['Daniel', 27],
    ['Oseas', 28],
    ['Joel', 29],
    ['Amós', 30],
    ['Abdías', 31],
    ['Jonás', 32],
    ['Miqueas', 33],
    ['Nahúm', 34],
    ['Habacuc', 35],
    ['Sofonías', 36],
    ['Hageo', 37],
    ['Zacarías', 38],
    ['Malaquías', 39],
    ['Mateo', 40],
    ['Marcos', 41],
    ['Lucas', 42],
    ['Juan', 43],
    ['Hechos', 44],
    ['Hechos de los Apóstoles', 44],
    ['Romanos', 45],
    ['1 Corintios', 46],
    ['2 Corintios', 47],
    ['Gálatas', 48],
    ['Efesios', 49],
    ['Filipenses', 50],
    ['Colosenses', 51],
    ['1 Tesalonicenses', 52],
    ['2 Tesalonicenses', 53],
    ['1 Timoteo', 54],
    ['2 Timoteo', 55],
    ['Tito', 56],
    ['Filemón', 57],
    ['Hebreos', 58],
    ['Santiago', 59],
    ['1 Pedro', 60],
    ['2 Pedro', 61],
    ['1 Juan', 62],
    ['2 Juan', 63],
    ['3 Juan', 64],
    ['Judas', 65],
    ['Apocalipsis', 66],
  ]),
}

const getBookIdFromAlias = (
  bookName: string,
  languageCode: string
): number | undefined =>
  BOOK_NAME_ALIASES_BY_LANGUAGE_CODE[languageCode]?.[
    normalizeBookName(bookName)
  ]

const getBookIdFromAnyAlias = (bookName: string): number | undefined => {
  for (const languageCode of Object.keys(BOOK_NAME_ALIASES_BY_LANGUAGE_CODE)) {
    const aliasBookId = getBookIdFromAlias(bookName, languageCode)
    if (aliasBookId) return aliasBookId
  }
}

const getBookIdFromSupportedTranslations = (bookName: string): number => {
  const aliasBookId = getBookIdFromAnyAlias(bookName)
  if (aliasBookId) return aliasBookId

  for (const languageCode of SUPPORTED_BOOK_NAME_LANGUAGE_CODES) {
    try {
      return Reference.bookIdFromTranslationAndName(languageCode, bookName)
    } catch {
      // Try the next supported translation.
    }
  }

  throw new Error(`No book matched "${bookName}"`)
}

export const getBookIdFromBookName = (
  bookName: string,
  languageCode: string = 'en'
): number => {
  const aliasBookId = getBookIdFromAlias(bookName, languageCode)
  if (aliasBookId) return aliasBookId

  try {
    const aliasBookId = getBookIdFromAnyAlias(bookName)
    if (aliasBookId) return aliasBookId

    console.debug('get book id first time', bookName, languageCode)
    return Reference.bookIdFromTranslationAndName(languageCode, bookName)
  } catch {
    // try in slow but in all supported languages
    console.debug('get book id from all translations', bookName)
    try {
      return Reference.bookIdFromName(bookName)
    } catch {
      return getBookIdFromSupportedTranslations(bookName)
    }
  }
}

export const getFullBookName = (
  name: string,
  languageCode: string = 'en'
): string => {
  console.debug('getFullBookName', name, languageCode)
  const bookId = getBookIdFromBookName(name, languageCode)

  try {
    return Reference.bookNameFromTranslationAndId(languageCode, bookId)
  } catch {
    return Reference.bookEnglishFullNameFromId(bookId)
  }
}
