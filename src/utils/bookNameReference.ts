import Reference from 'bible-reference-toolkit'


export const getBookIdFromBookName = (bookName: string, langaugeCode: string = 'en'): number => {
  try {
    return Reference.bookIdFromTranslationAndName(langaugeCode, bookName)
  } catch (e) {
    // try in slow but in all supported languages
    return Reference.bookIdFromName(bookName)
  }
}

export const getFullBookName = (name: string, langaugeCode: string = 'en'): string => {
  console.debug('getFullBookName', name, langaugeCode)
  const bookId = getBookIdFromBookName(name, langaugeCode)
  try {
    return Reference.bookNameFromTranslationAndId(langaugeCode, bookId)
  } catch (e) {
    return Reference.bookEnglishFullNameFromId(bookId)
  }
}
