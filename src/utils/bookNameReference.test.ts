import { getBookIdFromBookName, getFullBookName } from './bookNameReference'

describe('test bookNameReference', () => {
  it('should return the book id', () => {
    expect(getBookIdFromBookName('Genesis')).toBe(1)
  })

  it('should return the book id even start with number', () => {
    expect(getBookIdFromBookName('1 John', 'en')).toBe(62)
  })

  it('should return the correct id in Spanish', () => {
    expect(getBookIdFromBookName('Génesis', 'sp')).toBe(1)
  })

  it('should throw an error if code is wrong or cannot find the book', () => {
    try {
      getBookIdFromBookName('Genesis', 'wrongCode')
    } catch (e) {
      expect((e as Error).message).toBe(
        'No translation found for language wrongCode'
      )
    }
  })
})

describe('test getFullBookName', () => {
  it('should return full book name in English', () => {
    expect(getFullBookName('Gen', 'en')).toBe('Genesis')
  })

  it('should return full book name for numbered books', () => {
    expect(getFullBookName('1 John', 'en')).toBe('1 John')
  })

  it('should fallback to English name for unsupported language', () => {
    // When language code is invalid, it should fallback to English
    const result = getFullBookName('Genesis', 'invalidCode')
    expect(result).toBe('Genesis')
  })
})
