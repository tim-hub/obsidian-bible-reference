import { getSuggestionsFromQuery } from './getSuggestionsFromQuery'
import { DEFAULT_SETTINGS } from '../data/constants'

const settings = { ...DEFAULT_SETTINGS, bibleVersion: 'kjv' }

describe('getSuggestionsFromQuery with linkOnly', () => {
  it('returns one suggestion without fetching the verse text', async () => {
    const suggestions = await getSuggestionsFromQuery(
      'John 3:16',
      settings,
      undefined,
      true
    )
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0].linkOnlyContent).toBe(
      '[John 3:16 - KJV](https://www.biblegateway.com/passage/?search=John+3:16&version=kjv)'
    )
    expect(suggestions[0].bodyContent).toBe('')
  })

  it('returns no suggestion for an invalid reference', async () => {
    const suggestions = await getSuggestionsFromQuery(
      'Hebrews 10:1-9:14',
      settings,
      undefined,
      true
    )
    expect(suggestions).toEqual([])
  })

  it('returns no suggestion when no book can be matched', async () => {
    const suggestions = await getSuggestionsFromQuery(
      '3:16',
      settings,
      undefined,
      true
    )
    expect(suggestions).toEqual([])
  })
})
