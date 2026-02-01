import { getStepbibleUrl } from './referenceStepbibleLinking'

describe('getStepbibleUrl', () => {
  test('generates correct URL for Matthew single verse', () => {
    const url = getStepbibleUrl('ESV', 'Matthew', 9, 1)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=ESV|reference=Matt.9.1&skipwelcome'
    )
  })

  test('generates correct URL for Matthew verse range', () => {
    const url = getStepbibleUrl('ESV', 'Matthew', 9, 1, 9)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=ESV|reference=Matt.9.1-9&skipwelcome'
    )
  })

  test('generates correct URL for Psalms (plural)', () => {
    const url = getStepbibleUrl('KJV', 'Psalms', 23, 1)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=KJV|reference=Ps.23.1&skipwelcome'
    )
  })

  test('generates correct URL for Psalm (singular)', () => {
    const url = getStepbibleUrl('KJV', 'Psalm', 23, 1)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=KJV|reference=Ps.23.1&skipwelcome'
    )
  })

  test('generates correct URL for niv2011 (maps to NIV)', () => {
    const url = getStepbibleUrl('niv2011', 'John', 3, 16)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=NIV|reference=John.3.16&skipwelcome'
    )
  })

  test('generates correct URL with verse range', () => {
    const url = getStepbibleUrl('KJV', 'Romans', 8, 28, 30)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=KJV|reference=Rom.8.28-30&skipwelcome'
    )
  })

  test('handles lowercase version codes', () => {
    const url = getStepbibleUrl('kjv', 'Genesis', 1, 1)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=KJV|reference=Gen.1.1&skipwelcome'
    )
  })

  test('generates correct URL for cross-chapter reference', () => {
    const url = getStepbibleUrl('ESV', 'Matthew', 9, 19, undefined, 10, 1)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=ESV|reference=Matt.9.19-Matt.10.1&skipwelcome'
    )
  })

  test('generates correct URL for cross-chapter reference spanning multiple chapters', () => {
    const url = getStepbibleUrl('NIV', 'Hebrews', 9, 1, undefined, 10, 14)
    expect(url).toBe(
      'https://www.stepbible.org/?q=version=NIV|reference=Heb.9.1-Heb.10.14&skipwelcome'
    )
  })

  test('throws error for unknown book', () => {
    expect(() => getStepbibleUrl('KJV', 'UnknownBook', 1, 1)).toThrow(
      'Book code not found for UnknownBook'
    )
  })
})
