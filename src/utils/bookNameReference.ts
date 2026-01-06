import Reference from 'bible-reference-toolkit'
import { LOCALIZED_BOOK_NAMES } from '../data/localizedBookNames'

// precompute reverse lookup maps for performance
const REVERSE_LOCALIZED_BOOK_NAMES: {
  [languageCode: string]: { [bookName: string]: number }
} = {}

for (const lang in LOCALIZED_BOOK_NAMES) {
  REVERSE_LOCALIZED_BOOK_NAMES[lang] = {}
  for (const bookId in LOCALIZED_BOOK_NAMES[lang]) {
    const localizedName = LOCALIZED_BOOK_NAMES[lang][bookId].toLowerCase()
    REVERSE_LOCALIZED_BOOK_NAMES[lang][localizedName] = Number(bookId)
  }
}

export const getBookIdFromBookName = (
  bookName: string,
  languageCode: string = 'en'
): number => {
  const lowerBookName = bookName.toLowerCase()

  // Check custom mapping first for the specific language
  if (languageCode && REVERSE_LOCALIZED_BOOK_NAMES[languageCode]) {
    const bookId = REVERSE_LOCALIZED_BOOK_NAMES[languageCode][lowerBookName]
    if (bookId) return bookId
  }

  // Check all custom mappings if language is not specified or not found
  for (const lang in REVERSE_LOCALIZED_BOOK_NAMES) {
    const bookId = REVERSE_LOCALIZED_BOOK_NAMES[lang][lowerBookName]
    if (bookId) return bookId
  }

  try {
    console.debug('get book id first time', bookName, languageCode)
    return Reference.bookIdFromTranslationAndName(languageCode, bookName)
  } catch (e) {
    // try in slow but in all supported languages
    console.debug('get book id from all translations', bookName)
    return Reference.bookIdFromName(bookName)
  }
}

export const getFullBookName = (
  name: string,
  languageCode: string = 'en'
): string => {
  console.debug('getFullBookName', name, languageCode)
  const bookId = getBookIdFromBookName(name, languageCode)

  // Check custom mapping first
  if (
    languageCode &&
    LOCALIZED_BOOK_NAMES[languageCode] &&
    LOCALIZED_BOOK_NAMES[languageCode][bookId.toString()]
  ) {
    return LOCALIZED_BOOK_NAMES[languageCode][bookId.toString()]
  }

  try {
    return Reference.bookNameFromTranslationAndId(languageCode, bookId)
  } catch (e) {
    return Reference.bookEnglishFullNameFromId(bookId)
  }
}
