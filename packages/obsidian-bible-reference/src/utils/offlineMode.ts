import { BibleReferencePluginSettings } from '../data/constants'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection'
import { getBibleVersion } from '../data/BibleVersionCollection'

/**
 * Whether the translation with this key can be used under the current
 * settings. Offline Mode promises no network access, so while it is on only
 * the bundled translations qualify; switching to an online one would be
 * persisted and fetched from the network on every lookup.
 */
export const isTranslationAllowed = (
  settings: Pick<BibleReferencePluginSettings, 'offlineMode'>,
  versionKey: string
): boolean => {
  if (!settings.offlineMode) {
    return true
  }
  const version = getBibleVersion(versionKey)
  return (
    version.key === versionKey &&
    version.apiSource === BibleAPISourceCollection.offline
  )
}

export const offlineModeBlockedMessage = (versionKey: string) =>
  `Bible Reference - ${versionKey.toUpperCase()} needs a network connection. Turn off Offline Mode to use it.`
