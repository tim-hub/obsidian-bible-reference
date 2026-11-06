import { VerseSuggesting } from './VerseSuggesting'
import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from '../data/constants'
import { splitBibleReference } from '../utils/splitBibleReference'
import { getSuggestionsFromQuery } from '../utils/getSuggestionsFromQuery'

const buildSuggesting = (
  query: string,
  overrides: Partial<BibleReferencePluginSettings> = {}
): VerseSuggesting => {
  const settings = { ...DEFAULT_SETTINGS, ...overrides }
  return new VerseSuggesting(settings, splitBibleReference(query))
}

const urlFor = (
  query: string,
  overrides: Partial<BibleReferencePluginSettings> = {}
): string => {
  const content = buildSuggesting(query, overrides).linkOnlyContent
  return content.slice(content.indexOf('](') + 2, -1)
}

describe('the external source URL for a book name the user typed', () => {
  it('links Psalm to Literal Word - the issue #369 report', () => {
    expect(
      urlFor('Psalm 19:7-10', {
        bibleVersion: 'kjv',
        sourceOfReference: 'literalword',
      })
    ).toBe('https://app.literalword.com/kjv/19/19/7')
  })

  it('links Psalm and Psalms to the same place', () => {
    const settings: Partial<BibleReferencePluginSettings> = {
      bibleVersion: 'kjv',
      sourceOfReference: 'literalword',
    }
    expect(urlFor('Psalm 19:7-10', settings)).toBe(
      urlFor('Psalms 19:7-10', settings)
    )
  })

  it.each([
    ['literalword', 'https://app.literalword.com/'],
    ['logos', 'https://ref.ly/logosres/'],
    ['blb', 'https://www.blueletterbible.org/'],
    ['stepbible', 'https://www.stepbible.org/'],
  ])('keeps Psalm on %s rather than Bible Gateway', (source, prefix) => {
    expect(
      urlFor('Psalm 19:7-10', {
        bibleVersion: 'kjv',
        sourceOfReference: source,
      })
    ).toStartWith(prefix)
  })

  it.each([
    ['Ps 19:7', 'https://app.literalword.com/kjv/19/19/7'],
    ['Gen 1:1', 'https://app.literalword.com/kjv/1/1/1'],
    ['2 Tim 3:16', 'https://app.literalword.com/kjv/55/3/16'],
    ['Song of Songs 1:1', 'https://app.literalword.com/kjv/22/1/1'],
  ])('resolves the abbreviation in %s', (query, expected) => {
    expect(
      urlFor(query, { bibleVersion: 'kjv', sourceOfReference: 'literalword' })
    ).toBe(expected)
  })

  it('still falls back to Bible Gateway for a book no catalog knows', () => {
    const suggesting = buildSuggesting('John 3:16', {
      bibleVersion: 'kjv',
      sourceOfReference: 'literalword',
    })
    // @ts-ignore
    suggesting.verseReference.bookId = 0
    expect(suggesting.linkOnlyContent).toContain(
      'https://www.biblegateway.com/passage/'
    )
  })
})

describe('the external source URL for a localized book name', () => {
  it('links a Chinese display name to the English Literal Word book', async () => {
    const [suggesting] = await getSuggestionsFromQuery(
      'John 3:16',
      {
        ...DEFAULT_SETTINGS,
        bibleVersion: 'cuv',
        sourceOfReference: 'literalword',
      },
      undefined,
      true
    )
    expect(suggesting.linkOnlyContent).toContain('約翰福音 3:16')
    expect(suggesting.linkOnlyContent).toContain('https://app.literalword.com/')
  })
})
