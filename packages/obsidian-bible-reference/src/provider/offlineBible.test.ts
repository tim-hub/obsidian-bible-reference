import { describe, it, expect } from 'bun:test'
import { offlineLookup } from './offlineBible'
import bible from '../data/offlineBible.web.json'

describe('offlineLookup (bundled WEB)', () => {
  it('returns a promise', () => {
    expect(offlineLookup(43, 3, [16])).toBeInstanceOf(Promise)
  })

  it('returns a single verse', async () => {
    const verses = await offlineLookup(43, 3, [16])
    expect(verses).toHaveLength(1)
    expect(verses[0]).toMatchObject({
      book_name: 'John',
      chapter: 3,
      verse: 16,
    })
    expect(verses[0].text).toContain('God so loved the world')
  })

  it('returns an inclusive range', async () => {
    const verses = await offlineLookup(43, 3, [16, 18])
    expect(verses.map((v) => v.verse)).toEqual([16, 17, 18])
  })

  it('expands the open-ended sentinel to the end of the chapter', async () => {
    const verses = await offlineLookup(43, 3, [1, 999])
    expect(verses).toHaveLength(36)
    expect(verses[0].verse).toBe(1)
    expect(verses[verses.length - 1].verse).toBe(36)
  })

  it('returns [] for a book id outside the canon', async () => {
    expect(await offlineLookup(0, 1, [1])).toEqual([])
  })

  it('returns [] for an out-of-range chapter', async () => {
    expect(await offlineLookup(43, 999, [1])).toEqual([])
  })
})

describe('offlineLookup returns the whole bundled WEB text', () => {
  it('matches every chapter of the source JSON', async () => {
    const source = bible as string[][][]
    for (let bookIndex = 0; bookIndex < source.length; bookIndex++) {
      for (
        let chapterIndex = 0;
        chapterIndex < source[bookIndex].length;
        chapterIndex++
      ) {
        const verses = await offlineLookup(
          bookIndex + 1,
          chapterIndex + 1,
          [1, 999]
        )
        expect(verses.map((v) => v.text)).toEqual(
          source[bookIndex][chapterIndex].filter((text) => text)
        )
      }
    }
  })
})
