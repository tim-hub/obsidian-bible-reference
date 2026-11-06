import { BibleReferencePluginSettings } from '../data/constants'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { localizedBookName } from './bookNameLocalization'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { splitBibleReference } from './splitBibleReference'

/**
 * Get suggestions from string query
 * @param queryWithoutPrefix without the prefix trigger
 * @param settings
 * @param translation
 * @param linkOnly skip the verse text fetch, the caller only needs a link
 */
export const getSuggestionsFromQuery = async (
  queryWithoutPrefix: string,
  settings: BibleReferencePluginSettings,
  translation?: string,
  linkOnly = false
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
  let bookName
  try {
    verseRef = splitBibleReference(queryWithoutPrefix)
    bookName = localizedBookName(
      verseRef.bookId,
      getBibleVersion(translation ? translation : settings.bibleVersion),
      settings.bookNameLanguage
    )
  } catch (error) {
    // Invalid reference (e.g., backwards chapter reference like Hebrews 10:1-9:14).
    // Logged at debug level, not error: this runs on every keystroke, so most
    // failures here are half-typed references on the way to a valid one
    // ("John 3:16-1" while reaching for "John 3:16-18"), not real problems.
    console.debug('could not parse Bible reference:', error)
    return []
  }
  console.debug('selected bookName', bookName)

  // todo get bibleVersion and language from settings
  const suggestingVerse = new VerseSuggesting(settings, {
    ...verseRef,
    bookName,
  })

  console.debug(bookName, suggestingVerse, settings)
  if (!linkOnly) {
    await suggestingVerse.fetchAndSetVersesText()
  }
  return [suggestingVerse]
}
