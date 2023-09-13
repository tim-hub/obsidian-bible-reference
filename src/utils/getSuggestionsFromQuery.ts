import { BibleReferencePluginSettings } from '../data/constants'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { BOOK_REG } from './regs'
import Reference from 'bible-reference-toolkit/dist/lib/reference'

/**
 * Get suggestions from string query
 */
export const getSuggestionsFromQuery = async (
  query: string,
  settings: BibleReferencePluginSettings
): Promise<VerseSuggesting[]> => {
  console.debug('get suggestion for query ', query.toLowerCase())

  const matchResults = query.match(BOOK_REG)
  const rawBookName = matchResults?.length ? matchResults[0] : undefined

  if (!rawBookName) {
    console.error(`could not find through query`, query)
    return []
  }

  const numbersPartsOfQueryString = query.substring(2 + rawBookName.length)
  const numbers = numbersPartsOfQueryString.split(/[-:]+/)

  const chapterNumber = parseInt(numbers[0].trim())
  const verseNumber = parseInt(numbers[1])
  const verseEndNumber = numbers.length === 3 ? parseInt(numbers[2]) : undefined

  const bookId = Reference.bookIdFromName(rawBookName)
  const bookName = Reference.bookNameFromId(bookId)

  // todo get bibleVersion and language from settings
  const suggestingVerse = new VerseSuggesting(
    settings,
    bookName,
    chapterNumber,
    verseNumber,
    verseEndNumber
  )

  console.debug(
    bookName,
    chapterNumber,
    verseNumber,
    verseEndNumber,
    suggestingVerse,
    settings
  )
  await suggestingVerse.fetchAndSetVersesText()
  return [suggestingVerse]
}
