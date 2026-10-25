import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { VerseSuggesting } from './VerseSuggesting'
import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from '../data/constants'
import { splitBibleReference } from '../utils/splitBibleReference'
import { verseCache } from '../provider/verseCache'

const settings: BibleReferencePluginSettings = {
  ...DEFAULT_SETTINGS,
  bibleVersion: 'kjv',
  sourceOfReference: 'original',
}

const linkOf = (content: string): string =>
  content.slice(content.indexOf('](') + 2, -1)

afterEach(() => {
  mock.restore()
  verseCache.clear()
})

describe('the original source link', () => {
  it('points at the first range even when a later range answers last', async () => {
    spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const verse = String(input).includes('3:16') ? 16 : 18
      if (verse === 18) {
        await new Promise((resolve) => setTimeout(resolve, 20))
      }
      return {
        json: async () => ({
          reference: 'John 3',
          verses: [
            { book_name: 'John', chapter: 3, verse, text: `kjv ${verse}` },
          ],
        }),
      } as Response
    })
    const suggesting = new VerseSuggesting(
      settings,
      splitBibleReference('John 3:16, 18')
    )
    await suggesting.fetchAndSetVersesText()
    expect(linkOf(suggesting.linkOnlyContent)).toBe(
      'https://bible-api.com/John+3:16?translation=kjv'
    )
  })

  it('falls back to Bible Gateway for link-only insertion, which never fetches', () => {
    const suggesting = new VerseSuggesting(
      settings,
      splitBibleReference('John 3:16')
    )
    expect(linkOf(suggesting.linkOnlyContent)).toStartWith(
      'https://www.biblegateway.com/passage/'
    )
  })
})
