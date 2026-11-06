import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { buildProvider } from './buildProvider'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { verseCache } from './verseCache'

describe('bolls.life versions', () => {
  afterEach(() => {
    verseCache.clear()
    mock.restore()
  })

  it('queries CSB17 from bolls.life', async () => {
    const fetchMock = spyOn(global, 'fetch').mockResolvedValue({
      json: async () => [
        { verse: 16, chapter: 3, book: 43, text: 'For God loved the world' },
      ],
    } as Response)

    const provider = buildProvider(getBibleVersion('csb17'))
    const verses = await provider.query('John', 3, [16])

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://bolls.life/get-text/CSB17/43/3/'
    )
    expect(verses.map((verse) => verse.text)).toEqual([
      'For God loved the world',
    ])
    expect(provider.getOriginalVerseReferenceLink()).toBe(
      'https://bolls.life/CSB17/43/3/'
    )
  })
})
