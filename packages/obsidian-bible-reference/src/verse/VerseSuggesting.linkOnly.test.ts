import { VerseSuggesting } from './VerseSuggesting'
import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from '../data/constants'
import {
  getReferenceHead,
  splitBibleReference,
} from '../utils/splitBibleReference'

const buildSuggesting = (
  query: string,
  overrides: Partial<BibleReferencePluginSettings> = {}
): VerseSuggesting => {
  const settings = { ...DEFAULT_SETTINGS, ...overrides }
  const reference = splitBibleReference(query)
  return new VerseSuggesting(
    settings,
    reference.bookName,
    reference.chapterNumber,
    reference.verseNumber,
    reference.verseNumberEnd,
    reference.chapterNumberEnd,
    reference.verseNumberEndChapter,
    reference.ranges
  )
}

describe('VerseSuggesting.linkOnlyContent', () => {
  it('renders a bare markdown link with the default settings', () => {
    const suggesting = buildSuggesting('John 3:16', { bibleVersion: 'kjv' })
    expect(suggesting.linkOnlyContent).toBe(
      '[John 3:16 - KJV](https://www.biblegateway.com/passage/?search=John+3:16&version=kjv)'
    )
  })

  it('contains no callout, tag or leading whitespace decoration', () => {
    const content = buildSuggesting('John 3:16').linkOnlyContent
    expect(content).not.toContain('> ')
    expect(content).not.toContain('[!bible]')
    expect(content).not.toContain('%%')
    expect(content).toBe(content.trim())
  })

  it('omits the translation suffix when showVerseTranslation is off', () => {
    const content = buildSuggesting('John 3:16', {
      bibleVersion: 'kjv',
      showVerseTranslation: false,
    }).linkOnlyContent
    expect(content.startsWith('[John 3:16]')).toBe(true)
    expect(content).not.toContain(' - KJV')
  })

  it('still emits a link when hyperlinking is disabled', () => {
    const content = buildSuggesting('John 3:16', {
      enableHyperlinking: false,
    }).linkOnlyContent
    expect(content).toMatch(/^\[.+]\(https:\/\/.+\)$/)
  })

  it('labels a cross-chapter reference with getReferenceHead', () => {
    const suggesting = buildSuggesting('Hebrews 9:1-10:14', {
      bibleVersion: 'kjv',
    })
    const head = getReferenceHead(suggesting.verseReference)
    expect(suggesting.linkOnlyContent.startsWith(`[${head} - KJV](`)).toBe(true)
  })

  it('labels a multi-segment reference with getReferenceHead', () => {
    const suggesting = buildSuggesting('John 3:16,18', { bibleVersion: 'kjv' })
    const head = getReferenceHead(suggesting.verseReference)
    expect(suggesting.linkOnlyContent.startsWith(`[${head} - KJV](`)).toBe(true)
  })

  it('falls back to Bible Gateway for the original source without a fetch', () => {
    // 'bbe' is a bollsLife version - its original link is only known after a
    // fetch, which link-only never does.
    const suggesting = buildSuggesting('John 3:16', {
      bibleVersion: 'bbe',
      sourceOfReference: 'original',
    })
    expect(() => suggesting.linkOnlyContent).not.toThrow()
    expect(suggesting.linkOnlyContent).toContain(
      'https://www.biblegateway.com/passage/'
    )
  })

  it('falls back to Bible Gateway when the blb builder throws', () => {
    const suggesting = buildSuggesting('John 3:16', {
      bibleVersion: 'kjv',
      sourceOfReference: 'blb',
    })
    // @ts-ignore - force an unmapped book name past the parser
    suggesting.verseReference.bookName = 'UnknownBook'
    expect(suggesting.linkOnlyContent).toContain(
      'https://www.biblegateway.com/passage/'
    )
  })
})
