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
  'cn',
  'ko',
  'ar',
  'ru',
]

const getBookIdFromSupportedTranslations = (bookName: string): number => {
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
  try {
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
