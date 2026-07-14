import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BibleAPIDotComProvider } from './BibleAPIDotComProvider'
import { BaseBibleAPIProvider } from './BaseBibleAPIProvider'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection'
import { BollyLifeProvider } from './BollyLifeProvider'
import { BibleSuperSearchProvider } from './BibleSuperSearchProvider'
import { OfflineProvider } from './OfflineProvider'

/**
 * Build the Bible API provider for the given Bible version.
 * Bible API is the default when the source is unrecognised.
 */
export const buildProvider = (
  bibleVersion: IBibleVersion
): BaseBibleAPIProvider => {
  switch (bibleVersion.apiSource) {
    case BibleAPISourceCollection.bollsLife:
      return new BollyLifeProvider(bibleVersion)
    case BibleAPISourceCollection.bibleSuperSearch:
      return new BibleSuperSearchProvider(bibleVersion)
    case BibleAPISourceCollection.offline:
      return new OfflineProvider(bibleVersion)
    case BibleAPISourceCollection.bibleApi:
    default:
      return new BibleAPIDotComProvider(bibleVersion)
  }
}
