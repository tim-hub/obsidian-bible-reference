import Reference from 'bible-reference-toolkit'
import { LOCALIZED_BOOK_NAMES } from '../data/localizedBookNames'

export const getBookIdFromBookName = (
  bookName: string,
  languageCode: string = 'en'
): number => {
  // Check custom mapping first for the specific language
  if (languageCode && LOCALIZED_BOOK_NAMES[languageCode]) {
    const mapping = LOCALIZED_BOOK_NAMES[languageCode]
    const bookId = Object.keys(mapping).find(
      (key) => mapping[key].toLowerCase() === bookName.toLowerCase()
    )
    if (bookId) return Number(bookId)
  }

  // Check all custom mappings if language is not specified or not found
  for (const lang in LOCALIZED_BOOK_NAMES) {
    const mapping = LOCALIZED_BOOK_NAMES[lang]
    const bookId = Object.keys(mapping).find(
      (key) => mapping[key].toLowerCase() === bookName.toLowerCase()
    )
    if (bookId) return Number(bookId)
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
