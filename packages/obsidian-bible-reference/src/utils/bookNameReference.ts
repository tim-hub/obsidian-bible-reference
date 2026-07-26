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

/**
 * Reduce a book-name candidate to the longest trailing run of words the catalog
 * recognizes, and drop the periods abbreviations are written with.
 *
 * BOOK_REG matches greedily across whitespace so multi-word names survive whole
 * ("Song of Solomon"), which means it also swallows any prose in front of the
 * reference ("see Eph." -> "Eph"). Trimming only from the left keeps the match's
 * end position intact, so the chapter/verse remainder the caller slices off is
 * unaffected. An unrecognized candidate comes back as written, so downstream
 * errors still quote what the user typed.
 */
export const resolveBookName = (
  candidate: string,
  languageCode: string = 'en'
): string => {
  const words = candidate.trim().split(/\s+/)
  for (let i = 0; i < words.length; i++) {
    const attempt = words.slice(i).join(' ')
    try {
      getBookIdFromBookName(attempt, languageCode)
      return attempt.replace(/\./g, '')
    } catch {
      // not a book name; drop the leading word and try the shorter candidate
    }
  }
  return candidate.trim().replace(/\./g, '')
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
