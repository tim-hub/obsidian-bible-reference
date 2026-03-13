import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from '../data/constants'
import { VerseSuggesting } from './VerseSuggesting'

jest.mock(
  'obsidian',
  () => ({
    Notice: class Notice {},
  }),
  { virtual: true }
)

class TestVerseSuggesting extends VerseSuggesting {
  public getReferenceUrl(): string {
    return this.getUrlForReference()
  }
}

describe('VerseSuggesting reference link sources', () => {
  const createVerseSuggesting = (
    overrides: Partial<BibleReferencePluginSettings> = {},
    chapterNumber = 3,
    verseNumber = 16,
    verseNumberEnd?: number,
    chapterNumberEnd?: number,
    verseNumberEndChapter?: number
  ) =>
    new TestVerseSuggesting(
      { ...DEFAULT_SETTINGS, ...overrides },
      'John',
      chapterNumber,
      verseNumber,
      verseNumberEnd,
      chapterNumberEnd,
      verseNumberEndChapter
    )

  test('uses route.bible when selected as the reference link source', () => {
    const suggesting = createVerseSuggesting({
      sourceOfReference: 'routebible',
      bibleVersion: 'kjv',
    })

    expect(suggesting.getReferenceUrl()).toBe(
      'https://route.bible/?q=John+3%3A16&v=KJV&src=obsidian_bible_reference&utm_source=obsidian_bible_reference&utm_medium=obsidian_plugin&utm_campaign=reference_link_source'
    )
  })

  test('preserves same-chapter ranges for route.bible links', () => {
    const suggesting = createVerseSuggesting(
      {
        sourceOfReference: 'routebible',
        bibleVersion: 'esv',
      },
      8,
      28,
      30
    )

    expect(suggesting.getReferenceUrl()).toContain('q=John+8%3A28-30')
    expect(suggesting.getReferenceUrl()).toContain('v=ESV')
  })

  test('preserves existing biblegateway behavior', () => {
    const suggesting = createVerseSuggesting({
      sourceOfReference: 'biblegateway',
      bibleVersion: 'kjv',
    })

    expect(suggesting.getReferenceUrl()).toBe(
      'https://www.biblegateway.com/passage/?search=John+3:16&version=kjv'
    )
  })
})
