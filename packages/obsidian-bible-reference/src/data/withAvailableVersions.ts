import { BibleReferencePluginSettings } from './constants'
import { getBibleVersion } from './BibleVersionCollection'

export const withAvailableVersions = (
  settings: BibleReferencePluginSettings
): BibleReferencePluginSettings => ({
  ...settings,
  bibleVersion: getBibleVersion(settings.bibleVersion).key,
  defaultBibleVersion: getBibleVersion(settings.defaultBibleVersion).key,
})
