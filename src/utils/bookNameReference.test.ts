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

  it('should return the correct ids for numbered Spanish book names', () => {
    expect(getBookIdFromBookName('1 Reyes')).toBe(11)
    expect(getBookIdFromBookName('2 Reyes')).toBe(12)
    expect(getBookIdFromBookName('1 Corintios')).toBe(46)
    expect(getBookIdFromBookName('2 Corintios')).toBe(47)
  })

  it('should return the correct id for Hindi book names', () => {
    expect(getBookIdFromBookName('उत्पत्ति', 'hi')).toBe(1)
    expect(getBookIdFromBookName('भजन संहिता', 'hi')).toBe(19)
    expect(getBookIdFromBookName('प्रकाशितवाक्य', 'hi')).toBe(66)
  })

  it('should find Hindi book from any language when not specified', () => {
    expect(getBookIdFromBookName('उत्पत्ति')).toBe(1)
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

  it('should resolve numbered Spanish book names back to English', () => {
    expect(getFullBookName('1 Reyes', 'en')).toBe('1 Kings')
    expect(getFullBookName('2 Reyes', 'en')).toBe('2 Kings')
    expect(getFullBookName('1 Corintios', 'en')).toBe('1 Corinthians')
    expect(getFullBookName('2 Corintios', 'en')).toBe('2 Corinthians')
  })

  it('should return Hindi book name when language is hi', () => {
    expect(getFullBookName('Genesis', 'hi')).toBe('उत्पत्ति')
    expect(getFullBookName('Psalms', 'hi')).toBe('भजन संहिता')
  })

  it('should fallback to English name for unsupported language', () => {
    // When language code is invalid, it should fallback to English
    const result = getFullBookName('Genesis', 'invalidCode')
    expect(result).toBe('Genesis')
  })
})
