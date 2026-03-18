import Reference from 'bible-reference-toolkit'

export const getBookIdFromBookName = (
  bookName: string,
  languageCode: string = 'en'
): number => {
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

  try {
    return Reference.bookNameFromTranslationAndId(languageCode, bookId)
  } catch (e) {
    return Reference.bookEnglishFullNameFromId(bookId)
  }
}
