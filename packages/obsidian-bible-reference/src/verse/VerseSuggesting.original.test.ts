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

describe('a cross-chapter reference', () => {
  const respondWithRequestedVerses = () =>
    spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return {
        json: async () => ({ reference: 'Hebrews', verses: [] }),
      } as unknown as Response
    })

  it('requests each chapter with its real last verse, never 999', async () => {
    const fetchMock = respondWithRequestedVerses()
    const suggesting = new VerseSuggesting(
      settings,
      splitBibleReference('Hebrews 9:27-10:2')
    )
    await suggesting.fetchAndSetVersesText()
    const urls = fetchMock.mock.calls.map(([input]) => String(input))
    expect(urls).toContain(
      'https://bible-api.com/Hebrews+9:27-28?translation=kjv'
    )
    expect(urls).toContain(
      'https://bible-api.com/Hebrews+10:1-2?translation=kjv'
    )
  })

  it('links the original source to the first chapter from the start verse to its end', async () => {
    respondWithRequestedVerses()
    const suggesting = new VerseSuggesting(
      settings,
      splitBibleReference('Hebrews 9:27-10:2')
    )
    await suggesting.fetchAndSetVersesText()
    expect(linkOf(suggesting.linkOnlyContent)).toBe(
      'https://bible-api.com/Hebrews+9:27-28?translation=kjv'
    )
  })
})

describe('a cross-chapter reference on a version with its own versification', () => {
  it('keeps the verses past the KJV chapter length', async () => {
    spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const lastVerse = String(input).includes('/19/51/') ? 21 : 11
      return {
        json: async () =>
          Array.from({ length: lastVerse }, (_, index) => ({
            book: 19,
            chapter: String(input).includes('/19/51/') ? 51 : 52,
            verse: index + 1,
            text: `wlc ${index + 1}`,
          })),
      } as unknown as Response
    })
    const suggesting = new VerseSuggesting(
      { ...settings, bibleVersion: 'wlc' },
      splitBibleReference('Psalm 51:18-52:2')
    )
    const verses = await suggesting.getVerses()
    expect(verses.map((verse) => `${verse.chapter}:${verse.verse}`)).toEqual([
      '51:18',
      '51:19',
      '51:20',
      '51:21',
      '52:1',
      '52:2',
    ])
  })
})
