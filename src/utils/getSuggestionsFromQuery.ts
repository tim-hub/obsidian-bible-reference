import { BibleReferencePluginSettings } from '../data/constants'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { splitBibleReference } from './splitBibleReference'
import { getFullBookName } from './bookNameReference'

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

  const verseReference = splitBibleReference(queryWithoutPrefix)

  if (!verseReference.bookName) {
    console.error(`could not find through query`, queryWithoutPrefix)
    return []
  }

  const selectedBibleVersion = getBibleVersion(
    translation ? translation : settings.bibleVersion
  )
  verseReference.bookName = getFullBookName(
    verseReference.bookName,
    selectedBibleVersion?.code
  )
  console.debug('selected bookName', verseReference.bookName)

  const suggestingVerse = new VerseSuggesting(settings, verseReference)

  console.debug(suggestingVerse, settings)
  await suggestingVerse.fetchAndSetVersesText()
  return [suggestingVerse]
}
