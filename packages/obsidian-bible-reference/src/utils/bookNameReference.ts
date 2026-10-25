import Reference, { SupportedLanguages } from 'bible-reference-toolkit'

const isCatalogLocale = (languageCode: string): boolean =>
  SupportedLanguages.includes(languageCode.toLowerCase())

export const bookNameForId = (
  bookId: number,
  languageCode: string = 'en'
): string =>
  isCatalogLocale(languageCode)
    ? Reference.bookNameFromTranslationAndId(languageCode, bookId)
    : Reference.bookEnglishFullNameFromId(bookId)

export const getBookIdFromBookName = (
  bookName: string,
  languageCode: string = 'en'
): number => {
  if (!isCatalogLocale(languageCode)) {
    return Reference.bookIdFromName(bookName)
  }
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

/**
 * Whether the catalog recognizes the candidate as a whole. Unlike
 * resolveBookName this does not shrink the candidate, so "Genesis" is a book
 * and "am reading Genesis" is not - which is what separates a reference from
 * prose that merely contains one.
 */
export const isKnownBookName = (
  candidate: string,
  languageCode: string = 'en'
): boolean => {
  try {
    getBookIdFromBookName(candidate, languageCode)
    return true
  } catch {
    return false
  }
}

export const getFullBookName = (
  name: string,
  languageCode: string = 'en'
): string => {
  console.debug('getFullBookName', name, languageCode)
  return bookNameForId(getBookIdFromBookName(name, languageCode), languageCode)
}

/**
 * Like getFullBookName, but returns the name as written when the catalog does
 * not recognize it instead of throwing. For callers that only need a lookup key
 * and already handle unknown books themselves.
 */
export const getCanonicalBookName = (
  name: string,
  languageCode: string = 'en'
): string => {
  try {
    return getFullBookName(name, languageCode)
  } catch {
    return name
  }
}
