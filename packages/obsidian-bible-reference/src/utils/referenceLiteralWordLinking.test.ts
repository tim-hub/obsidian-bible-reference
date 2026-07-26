import { getLiteralWordUrl } from './referenceLiteralWordLinking'

describe('referenceLiteralWordLinking', () => {
  test('should generate correct Literal Word URL for single verse', () => {
    const url = getLiteralWordUrl('esv', 'Genesis', 1, 1)
    expect(url).toBe('https://app.literalword.com/esv/1/1/1')
  })

  test('should generate correct Literal Word URL for different translation', () => {
    const url = getLiteralWordUrl('nasb', 'John', 3, 16)
    expect(url).toBe('https://app.literalword.com/nasb/43/3/16')
  })

  test('should generate correct Literal Word URL for unknown translation', () => {
    const url = getLiteralWordUrl('unknown', 'Mark', 1, 15)
    expect(url).toBe('https://app.literalword.com/41/1/15')
  })

  test('should throw error for unknown book', () => {
    expect(() => getLiteralWordUrl('esv', 'UnknownBook', 1, 1)).toThrow()
  })
})
