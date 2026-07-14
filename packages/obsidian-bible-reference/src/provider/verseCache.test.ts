import { afterEach, describe, expect, it } from 'bun:test'
import { verseCache, expandRequestedVerses } from './verseCache'
import { IVerse } from '../interfaces/IVerse'

const verse = (n: number): IVerse => ({
  book_name: 'John',
  chapter: 3,
  verse: n,
  text: `text ${n}`,
})

describe('verseCache', () => {
  afterEach(() => {
    verseCache.clear()
  })

  describe('getVerses', () => {
    it('returns all hits when fully cached, in requested order', () => {
      verseCache.putVerses('kjv', 'John', 3, [verse(16), verse(17)])
      const { hits, missing } = verseCache.getVerses('kjv', 'John', 3, [17, 16])
      expect(missing).toEqual([])
      expect(hits.map((h) => h.verse)).toEqual([17, 16])
    })

    it('reports partial hits and missing numbers', () => {
      verseCache.putVerses('kjv', 'John', 3, [verse(16)])
      const { hits, missing } = verseCache.getVerses(
        'kjv',
        'John',
        3,
        [16, 17, 18]
      )
      expect(hits.map((h) => h.verse)).toEqual([16])
      expect(missing).toEqual([17, 18])
    })

    it('reports all missing when nothing cached', () => {
      const { hits, missing } = verseCache.getVerses('kjv', 'John', 3, [16])
      expect(hits).toEqual([])
      expect(missing).toEqual([16])
    })
  })

  describe('putVerses', () => {
    it('skips empty payloads', () => {
      verseCache.putVerses('kjv', 'John', 3, [])
      expect(verseCache.serialize().translations).toEqual({})
    })

    it('keys verses nested by translation / book+chapter / verse', () => {
      verseCache.putVerses('kjv', 'John', 3, [verse(16)])
      verseCache.putVerses('web', 'John', 3, [verse(16)])
      verseCache.putVerses('kjv', 'Genesis', 1, [verse(1)])

      const { translations } = verseCache.serialize()
      expect(Object.keys(translations)).toEqual(['kjv', 'web'])
      expect(translations['kjv']['John|3']['16'].text).toBe('text 16')
      expect(translations['kjv']['Genesis|1']['1']).toBeDefined()
      expect(translations['web']['John|3']['16']).toBeDefined()
    })

    it('does not cross translations on lookup', () => {
      verseCache.putVerses('kjv', 'John', 3, [verse(16)])
      const { missing } = verseCache.getVerses('web', 'John', 3, [16])
      expect(missing).toEqual([16])
    })
  })

  describe('hydrate / serialize', () => {
    it('round-trips through serialize', () => {
      verseCache.putVerses('kjv', 'John', 3, [verse(16)])
      const blob = verseCache.serialize()

      verseCache.clear()
      verseCache.hydrate(blob)
      const { hits } = verseCache.getVerses('kjv', 'John', 3, [16])
      expect(hits[0].text).toBe('text 16')
    })

    it('ignores undefined input', () => {
      verseCache.hydrate(undefined)
      expect(verseCache.serialize().translations).toEqual({})
    })

    it('ignores a wrong schema version', () => {
      verseCache.hydrate({ version: 999, translations: { kjv: {} } })
      expect(verseCache.serialize().translations).toEqual({})
    })
  })

  describe('flushNow', () => {
    it('fires persist when dirty', () => {
      let calls = 0
      verseCache.setPersist(() => {
        calls++
      })
      verseCache.putVerses('kjv', 'John', 3, [verse(16)])
      verseCache.flushNow()
      expect(calls).toBe(1)
    })

    it('does nothing when clean', () => {
      let calls = 0
      verseCache.setPersist(() => {
        calls++
      })
      verseCache.flushNow()
      expect(calls).toBe(0)
    })
  })
})

describe('expandRequestedVerses', () => {
  it('single verse', () => {
    expect(expandRequestedVerses([16])).toEqual([16])
  })

  it('bounded range is inclusive', () => {
    expect(expandRequestedVerses([16, 18])).toEqual([16, 17, 18])
  })

  it('open-ended [n,999] is unknowable -> null', () => {
    expect(expandRequestedVerses([5, 999])).toBeNull()
  })
})
