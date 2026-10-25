import { describe, it, expect } from 'bun:test'
import { offlineLookup } from './offlineBible'

describe('offlineLookup (bundled WEB)', () => {
  it('returns a promise', () => {
    expect(offlineLookup('John', 3, [16])).toBeInstanceOf(Promise)
  })

  it('returns a single verse', async () => {
    const verses = await offlineLookup('John', 3, [16])
    expect(verses).toHaveLength(1)
    expect(verses[0]).toMatchObject({
      book_name: 'John',
      chapter: 3,
      verse: 16,
    })
    expect(verses[0].text).toContain('God so loved the world')
  })

  it('returns an inclusive range', async () => {
    const verses = await offlineLookup('John', 3, [16, 18])
    expect(verses.map((v) => v.verse)).toEqual([16, 17, 18])
  })

  it('expands the open-ended sentinel to the end of the chapter', async () => {
    const verses = await offlineLookup('John', 3, [1, 999])
    expect(verses).toHaveLength(36)
    expect(verses[0].verse).toBe(1)
    expect(verses[verses.length - 1].verse).toBe(36)
  })

  it('resolves a non-English book name via normalization', async () => {
    const verses = await offlineLookup('Juan', 3, [16])
    expect(verses[0]?.text).toContain('God so loved the world')
  })

  it('returns [] for an unknown book', async () => {
    expect(await offlineLookup('Nonexistent', 1, [1])).toEqual([])
  })

  it('returns [] for an out-of-range chapter', async () => {
    expect(await offlineLookup('John', 999, [1])).toEqual([])
  })
})
