import { BibleReferencePluginSettings } from '../data/constants'
import { VerseSuggesting } from '../VerseSuggesting'

/**
 * Get suggestions from string query
 */
export async function getSuggestionsFromQuery(
  query: string,
  settings: BibleReferencePluginSettings
): Promise<VerseSuggesting[]> {
  console.debug('get suggestion for query ', query.toLowerCase())

  const bookName = query.match(/[123]*[A-z]{3,}/)?.first()

  if (!bookName) {
    console.error(`could not find through query`, query)
    return []
  }

  const numbersPartsOfQueryString = query.substring(2 + bookName.length)
  const numbers = numbersPartsOfQueryString.split(/[-:]+/)

  const chapterNumber = parseInt(numbers[0])
  const verseNumber = parseInt(numbers[1])
  const verseEndNumber = numbers.length === 3 ? parseInt(numbers[2]) : undefined

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
