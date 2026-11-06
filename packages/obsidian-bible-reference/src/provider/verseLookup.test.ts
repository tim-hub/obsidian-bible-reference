import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { lookupVerses, sourceUrlFor } from './verseLookup'
import { verseCache } from './verseCache'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { IBibleApiSource } from '../interfaces/IBibleApiSource'

const version = (key: string, apiSource: IBibleApiSource): IBibleVersion => ({
  key,
  versionName: key,
  language: 'English',
  code: 'en',
  apiSource,
})
const kjv = version('kjv', BibleAPISourceCollection.bibleApi)
const nkjv = version('nkjv', BibleAPISourceCollection.bollsLife)
const bg = version('bg', BibleAPISourceCollection.bibleSuperSearch)
const ubg = version('ubg', BibleAPISourceCollection.bibleSuperSearch)
const webOffline = version('web-offline', BibleAPISourceCollection.offline)

const john3 = (verses: number[]) => ({ bookId: 43, chapter: 3, verses })

const bibleApiBody = (verses: number[]) => ({
  reference: 'John 3',
  verses: verses.map((verse) => ({
    book_name: 'John',
    chapter: 3,
    verse,
    text: `kjv ${verse}`,
  })),
})

const respondWith = (body: unknown) =>
  spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => body,
  } as Response)

afterEach(() => {
  mock.restore()
  verseCache.clear()
})

describe('lookupVerses', () => {
  it('fetches a bible-api.com passage by English book name', async () => {
    const fetchMock = respondWith(bibleApiBody([16]))
    const verses = await lookupVerses(kjv, john3([16]))
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://bible-api.com/John+3:16?translation=kjv'
    )
    expect(verses.map((v) => v.text)).toEqual(['kjv 16'])
  })

  it('serves a repeated passage from the verse cache', async () => {
    const fetchMock = respondWith(bibleApiBody([16, 17]))
    await lookupVerses(kjv, john3([16, 17]))
    const verses = await lookupVerses(kjv, john3([16, 17]))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(verses.map((v) => v.verse)).toEqual([16, 17])
  })

  it('fetches only the verses the cache is missing', async () => {
    const fetchMock = respondWith(bibleApiBody([16]))
    await lookupVerses(kjv, john3([16]))
    fetchMock.mockResolvedValue({
      json: async () => bibleApiBody([17, 18]),
    } as Response)
    const verses = await lookupVerses(kjv, john3([16, 18]))
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://bible-api.com/John+3:17-18?translation=kjv'
    )
    expect(verses.map((v) => v.verse)).toEqual([16, 17, 18])
  })

  it('keeps the cache keyed by English book name', async () => {
    respondWith(bibleApiBody([16]))
    await lookupVerses(kjv, john3([16]))
    expect(verseCache.getVerses('kjv', 'John', 3, [16]).hits).toHaveLength(1)
  })

  it('fetches the whole Bolls Life chapter by book id and keeps the requested verses', async () => {
    const fetchMock = respondWith(
      [15, 16, 17].map((verse) => ({
        book: 43,
        chapter: 3,
        verse,
        text: `nkjv ${verse}`,
      }))
    )
    const verses = await lookupVerses(nkjv, john3([16]))
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://bolls.life/get-text/NKJV/43/3/'
    )
    expect(verses.map((v) => v.text)).toEqual(['nkjv 16'])
  })

  it('queries Bible SuperSearch with the mapped module and normalizes rows', async () => {
    const fetchMock = respondWith({
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
    })
    const verses = await lookupVerses(ubg, john3([16]))
    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('bible=pol_ubg')
    expect(url).toContain('reference=John+3%3A16')
    expect(url).toContain('data_format=minimal')
    expect(verses[0]).toMatchObject({
      chapter: 3,
      verse: 16,
      book_id: '43',
      book_name: 'John',
    })
  })

  it('falls back to the bundled WEB text when the fetch fails, without caching it', async () => {
    spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    const verses = await lookupVerses(kjv, john3([16]))
    expect(verses[0].text).toContain('God so loved the world')
    expect(verseCache.getVerses('kjv', 'John', 3, [16]).hits).toHaveLength(0)
  })

  it('rejects when the fetch fails and the offline text has no such passage', async () => {
    spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    await expect(
      lookupVerses(kjv, { bookId: 43, chapter: 99, verses: [1] })
    ).rejects.toThrow('offline')
  })

  it('reads the offline version without touching the network', async () => {
    const fetchMock = spyOn(globalThis, 'fetch')
    const verses = await lookupVerses(webOffline, john3([16]))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(verses[0].text).toContain('God so loved the world')
  })
})

describe('sourceUrlFor', () => {
  it.each([
    ['kjv', kjv, 'https://bible-api.com/John+3:16-18?translation=kjv'],
    ['nkjv', nkjv, 'https://bolls.life/NKJV/43/3/'],
    [
      'web-offline',
      webOffline,
      'https://bible-api.com/John+3:16-18?translation=web',
    ],
  ])('links %s to its source', (_key, linkedVersion, expected) => {
    expect(sourceUrlFor(linkedVersion, john3([16, 18]))).toBe(expected)
  })

  it('maps bg to the polbg Bible SuperSearch module', () => {
    expect(sourceUrlFor(bg, john3([16]))).toContain('bible=polbg')
  })
})
