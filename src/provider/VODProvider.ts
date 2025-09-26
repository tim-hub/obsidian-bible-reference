import { ProviderFactory } from './ProviderFactory'
import { splitBibleReference } from '../utils/splitBibleReference'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { IVerse } from '../interfaces/IVerse'

export type VerseOfDayResponse = {
  verse: {
    details: {
      text: string
      reference: string
      version: string
      version_url: string
    }
    notice: string
  }
}

export type EnhancedVerseOfDayResponse = VerseOfDayResponse & {
  enhancedVerse?: IVerse[]
  userVersion?: string
}

/**
 * get the verse of the day from OurManna API
 * https://ourmanna.readme.io/reference/get-verse-of-the-day
 */
export const getVod = async (): Promise<VerseOfDayResponse> => {
  const resp = await fetch(
    'https://beta.ourmanna.com/api/v1/get?format=json&order=daily'
  )
  return resp.json()
}

/**
 * Get the verse of the day with enhanced verse text in user's preferred version
 * Falls back to NIV from OurManna if the preferred version fails
 */
export const getEnhancedVod = async (
  preferredVersionKey?: string
): Promise<EnhancedVerseOfDayResponse> => {
  const vodResponse = await getVod()

  if (!preferredVersionKey || preferredVersionKey.toLowerCase() === 'niv') {
    return vodResponse
  }

  try {
    const reference = vodResponse.verse.details.reference
    const parsedReference = splitBibleReference(reference)
    const userBibleVersion = getBibleVersion(preferredVersionKey)

    if (!userBibleVersion) {
      return vodResponse
    }

    const provider =
      ProviderFactory.Instance.BuildBibleVersionAPIAdapterFromIBibleVersion(
        userBibleVersion
      )

    const verses = parsedReference.verseEndNumber
      ? [parsedReference.verseNumber, parsedReference.verseEndNumber]
      : [parsedReference.verseNumber]

    const enhancedVerse = await provider.query(
      parsedReference.bookName,
      parsedReference.chapterNumber,
      verses
    )

    return {
      ...vodResponse,
      enhancedVerse,
      userVersion: preferredVersionKey,
    }
  } catch (error) {
    console.warn(`Failed to fetch VOD in preferred version "${preferredVersionKey}", using NIV:`, error)
    return vodResponse
  }
}
