import { afterAll, describe, expect, it } from 'bun:test'

const nativeDecompressionStream = globalThis.DecompressionStream

describe('offlineLookup on a WebView without DecompressionStream', () => {
  afterAll(() => {
    globalThis.DecompressionStream = nativeDecompressionStream
  })

  it('still returns the bundled WEB text', async () => {
    // @ts-ignore
    delete globalThis.DecompressionStream
    const { offlineLookup } = await import('./offlineBible')
    const verses = await offlineLookup(43, 3, [16])
    expect(verses[0].text).toContain('God so loved the world')
  })
})
