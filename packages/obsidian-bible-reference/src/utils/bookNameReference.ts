import Reference from 'bible-reference-toolkit'

export const getBookIdFromBookName = (
  bookName: string,
  languageCode: string = 'en'
): number => {
  try {
    return Reference.bookIdFromTranslationAndName(languageCode, bookName)
  } catch {
    // fall back to a slower search across all supported languages
    return Reference.bookIdFromName(bookName)
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
