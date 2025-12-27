import { getBLBUrl } from './referenceBLBAltLinking'

describe('getBLBUrl', () => {
  test('generates correct URL for Psalms (plural)', () => {
    const url = getBLBUrl('KJV', 'Psalms', 23, 1)
    expect(url).toBe('https://www.blueletterbible.org/kjv/psa/23/1/')
  })

  test('generates correct URL for Psalm (singular)', () => {
    const url = getBLBUrl('KJV', 'Psalm', 23, 1)
    expect(url).toBe('https://www.blueletterbible.org/kjv/psa/23/1/')
  })

  test('generates correct URL for niv2011 (maps to niv)', () => {
    const url = getBLBUrl('niv2011', 'Psalm', 23, 1)
    expect(url).toBe('https://www.blueletterbible.org/niv/psa/23/1/')
  })

  test('generates correct URL with verse range', () => {
    const url = getBLBUrl('KJV', 'Psalm', 23, 1, 6)
    expect(url).toBe('https://www.blueletterbible.org/kjv/psa/23/1-6/')
  })

  test('throws error for unknown book', () => {
    expect(() => getBLBUrl('KJV', 'UnknownBook', 1, 1)).toThrow(
      'Book code not found for UnknownBook'
    )
  })
})
