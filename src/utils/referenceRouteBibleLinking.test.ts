import { getRouteBibleUrl } from './referenceRouteBibleLinking'

describe('getRouteBibleUrl', () => {
  test('generates a Route.Bible URL for a single verse', () => {
    const url = getRouteBibleUrl('John 3:16', 'kjv')

    expect(url).toBe(
      'https://route.bible/?q=John+3%3A16&v=KJV&src=obsidian_bible_reference&utm_source=obsidian_bible_reference&utm_medium=obsidian_plugin&utm_campaign=reference_link_source'
    )
  })

  test('preserves same-chapter ranges in q', () => {
    const url = getRouteBibleUrl('Romans 8:28-30', 'esv')

    expect(url).toContain('q=Romans+8%3A28-30')
    expect(url).toContain('v=ESV')
  })

  test('preserves cross-chapter references in q', () => {
    const url = getRouteBibleUrl('Hebrews 9:1-10:14', 'niv')

    expect(url).toContain('q=Hebrews+9%3A1-10%3A14')
    expect(url).toContain('v=NIV')
  })
})
