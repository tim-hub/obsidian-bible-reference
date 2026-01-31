import { getStepbibleUrl } from './referenceStepbibleLinking'

describe('getStepbibleUrl', () => {
  test('generates correct URL for Matthew single verse', () => {
    const url = getStepbibleUrl('ESV', 'Matthew', 9, 1)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=ESV|reference=Matt.9.1'
    )
  })

  test('generates correct URL for Matthew verse range', () => {
    const url = getStepbibleUrl('ESV', 'Matthew', 9, 1, 9)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=ESV|reference=Matt.9.1-9'
    )
  })

  test('generates correct URL for Psalms (plural)', () => {
    const url = getStepbibleUrl('KJV', 'Psalms', 23, 1)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=KJV|reference=Ps.23.1'
    )
  })

  test('generates correct URL for Psalm (singular)', () => {
    const url = getStepbibleUrl('KJV', 'Psalm', 23, 1)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=KJV|reference=Ps.23.1'
    )
  })

  test('generates correct URL for niv2011 (maps to NIV)', () => {
    const url = getStepbibleUrl('niv2011', 'John', 3, 16)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=NIV|reference=John.3.16'
    )
  })

  test('generates correct URL with verse range', () => {
    const url = getStepbibleUrl('KJV', 'Romans', 8, 28, 30)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=KJV|reference=Rom.8.28-30'
    )
  })

  test('handles lowercase version codes', () => {
    const url = getStepbibleUrl('kjv', 'Genesis', 1, 1)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=KJV|reference=Gen.1.1'
    )
  })

  test('throws error for unknown book', () => {
    expect(() => getStepbibleUrl('KJV', 'UnknownBook', 1, 1)).toThrow(
      'Book code not found for UnknownBook'
    )
  })
})
