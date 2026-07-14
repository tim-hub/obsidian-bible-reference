import { describe, it, expect, afterEach } from 'bun:test'
import { buildProvider } from './buildProvider'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { verseCache } from './verseCache'
import { OfflineProvider } from './OfflineProvider'

describe('offline wiring', () => {
  afterEach(() => verseCache.clear())

  it('routes web-offline to OfflineProvider and resolves with no network', async () => {
    const provider = buildProvider(getBibleVersion('web-offline'))
    expect(provider).toBeInstanceOf(OfflineProvider)
    const verses = await provider.query('John', 3, [16])
    expect(verses[0].text).toContain('God so loved the world')
    expect(provider.getOriginalVerseReferenceLink()).toContain(
      'translation=web'
    )
  })

  it('falls back to bundled WEB when an online provider fetch fails', async () => {
    const provider = buildProvider(getBibleVersion('kjv'))
    const original = globalThis.fetch
    globalThis.fetch = () => Promise.reject(new Error('offline'))
    try {
      const verses = await provider.query('John', 3, [16])
      expect(verses[0].text).toContain('God so loved the world')
      // cache must NOT be poisoned with WEB text under kjv
      const { hits } = verseCache.getVerses('kjv', 'John', 3, [16])
      expect(hits).toHaveLength(0)
    } finally {
      globalThis.fetch = original
    }
  })
})
