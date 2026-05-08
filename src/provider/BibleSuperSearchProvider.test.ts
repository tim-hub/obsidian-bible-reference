import { BibleSuperSearchProvider } from './BibleSuperSearchProvider'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection'

jest.mock(
  'obsidian',
  () => ({
    Notice: jest.fn(),
  }),
  { virtual: true }
)

describe('BibleSuperSearchProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('builds query URL with mapped bg module', () => {
    const provider = new BibleSuperSearchProvider({
      key: 'bg',
      versionName: 'Biblia gdańska, 1881',
      language: 'Polish',
      code: 'pl',
      apiSource: BibleAPISourceCollection.bibleSuperSearch,
    })

    const url = provider.buildRequestURL('John', 3, [16], 'bg')

    expect(url).toContain('/api?')
    expect(url).toContain('bible=polbg')
    expect(url).toContain('reference=John+3%3A16')
    expect(url).toContain('data_format=minimal')
  })

  it('queries and normalizes verse response for ubg', async () => {
    const provider = new BibleSuperSearchProvider({
      key: 'ubg',
      versionName: 'Uwspółcześniona Biblia Gdańska, 2017',
      language: 'Polish',
      code: 'pl',
      apiSource: BibleAPISourceCollection.bibleSuperSearch,
    })

    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        errors: [],
        error_level: 0,
        results: {
          pol_ubg: [
            {
              id: 26137,
              book: 43,
              chapter: 3,
              verse: 16,
              text: 'Tak bowiem Bóg umiłował świat...',
            },
          ],
        },
      }),
    } as Response)

    const verses = await provider.query('John', 3, [16], 'ubg')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(verses).toHaveLength(1)
    expect(verses[0]).toMatchObject({
      chapter: 3,
      verse: 16,
      book_id: '43',
      book_name: 'John',
    })
  })
})
