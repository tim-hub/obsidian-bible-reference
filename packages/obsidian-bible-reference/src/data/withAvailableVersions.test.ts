import { describe, expect, it } from 'bun:test'
import { withAvailableVersions } from './withAvailableVersions'
import { DEFAULT_SETTINGS } from './constants'
import { DEFAULT_BIBLE_VERSION_KEY } from './BibleVersionCollection'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { splitBibleReference } from '../utils/splitBibleReference'

const linkFor = (bibleVersion: string): string => {
  const settings = withAvailableVersions({ ...DEFAULT_SETTINGS, bibleVersion })
  const reference = splitBibleReference('John 3:16')
  return new VerseSuggesting(
    settings,
    reference.bookName,
    reference.chapterNumber,
    reference.verseNumber
  ).linkOnlyContent
}

describe('withAvailableVersions', () => {
  it.each(['niv', 'niv2011', 'nvi', 'nvipt'])(
    'labels and links a saved withdrawn %s as the default version',
    (withdrawnKey) => {
      expect(linkFor(withdrawnKey)).toBe(linkFor(DEFAULT_BIBLE_VERSION_KEY))
    }
  )

  it('replaces a withdrawn default version used by verse of the day', () => {
    const settings = withAvailableVersions({
      ...DEFAULT_SETTINGS,
      defaultBibleVersion: 'niv2011',
    })
    expect(settings.defaultBibleVersion).toBe(DEFAULT_BIBLE_VERSION_KEY)
  })

  it('keeps saved versions that are still available', () => {
    const settings = withAvailableVersions({
      ...DEFAULT_SETTINGS,
      bibleVersion: 'csb17',
      defaultBibleVersion: 'kjv',
    })
    expect(settings.bibleVersion).toBe('csb17')
    expect(settings.defaultBibleVersion).toBe('kjv')
  })
})
