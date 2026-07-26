import { BibleReferencePluginSettings } from '../data/constants'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { localizedBookName } from './bookNameLocalization'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { splitBibleReference } from './splitBibleReference'

/**
 * Get suggestions from string query
 * @param queryWithoutPrefix without the prefix trigger
 * @param settings
 */
export const getSuggestionsFromQuery = async (
  queryWithoutPrefix: string,
  settings: BibleReferencePluginSettings,
  translation?: string
): Promise<VerseSuggesting[]> => {
  console.debug(
    'get suggestion for query ',
    queryWithoutPrefix.toLowerCase(),
    translation,
    settings.bibleVersion,
    settings.defaultBibleVersion
  )

  // Parse first, then localize the book name it resolved. Deriving the book
  // name separately here used to let a reference parse while its book name
  // resolved differently (or not at all).
  let verseRef
  try {
    verseRef = splitBibleReference(queryWithoutPrefix)
  } catch (error) {
    // Invalid reference (e.g., backwards chapter reference like Hebrews 10:1-9:14).
    // Logged at debug level, not error: this runs on every keystroke, so most
    // failures here are half-typed references on the way to a valid one
    // ("John 3:16-1" while reaching for "John 3:16-18"), not real problems.
    console.debug('could not parse Bible reference:', error)
    return []
  }

  const selectedBibleVersion = getBibleVersion(
    translation ? translation : settings.bibleVersion
  )
  const bookName = localizedBookName(
    verseRef.bookName,
    selectedBibleVersion,
    settings.bookNameLanguage
  )
  console.debug('selected bookName', bookName)

  const {
    chapterNumber,
    verseNumber,
    verseNumberEnd,
    chapterNumberEnd,
    verseNumberEndChapter,
    ranges,
  } = verseRef

  // todo get bibleVersion and language from settings
  const suggestingVerse = new VerseSuggesting(
    settings,
    bookName,
    chapterNumber,
    verseNumber,
    verseNumberEnd,
    chapterNumberEnd,
    verseNumberEndChapter,
    ranges
  )

  console.debug(
    bookName,
    chapterNumber,
    verseNumber,
    verseNumberEnd,
    suggestingVerse,
    settings
  )
  await suggestingVerse.fetchAndSetVersesText()
  return [suggestingVerse]
}
