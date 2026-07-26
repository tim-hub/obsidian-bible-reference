import {
  getBookIdFromBookName,
  getFullBookName,
  resolveBookName,
} from './bookNameReference'

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

  it('should map php to Philippians (50)', () => {
    expect(getBookIdFromBookName('php')).toBe(50)
  })

  it('should override isa to map to Isaiah (23)', () => {
    expect(getBookIdFromBookName('isa')).toBe(23)
  })
})

describe('test getFullBookName', () => {
  it('should return full book name in English', () => {
    expect(getFullBookName('Gen', 'en')).toBe('Genesis')
  })

  it('should return full book name for numbered books', () => {
    expect(getFullBookName('1 John', 'en')).toBe('1 John')
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

  it('should return Philippians for php in English', () => {
    expect(getFullBookName('php', 'en')).toBe('Philippians')
  })

  it('should return Isaiah for isa in English', () => {
    expect(getFullBookName('isa', 'en')).toBe('Isaiah')
  })
})

describe('book names written with an abbreviating period', () => {
  test.each([
    ['Eph.', 49],
    ['Matt.', 40],
    ['Gen.', 1],
    ['Mk.', 41],
    ['1 Cor.', 46],
    ['2 Tim.', 55],
  ])('%s resolves to book %i', (name, id) => {
    expect(getBookIdFromBookName(name)).toBe(id)
  })

  it('should return the full name for a dotted abbreviation', () => {
    expect(getFullBookName('Eph.', 'en')).toBe('Ephesians')
    expect(getFullBookName('1 Cor.', 'en')).toBe('1 Corinthians')
  })

  it('should tolerate extra whitespace around the ordinal', () => {
    expect(getBookIdFromBookName('1  Cor.')).toBe(46)
  })
})

describe('multi-word book names', () => {
  it('should resolve Song of Solomon and its alternate', () => {
    expect(getBookIdFromBookName('Song of Solomon')).toBe(22)
    expect(getBookIdFromBookName('Song of Songs')).toBe(22)
  })
})

describe('resolveBookName', () => {
  it('keeps a multi-word name whole', () => {
    expect(resolveBookName('Song of Solomon')).toBe('Song of Solomon')
  })

  it('drops the abbreviating period', () => {
    expect(resolveBookName('Eph.')).toBe('Eph')
    expect(resolveBookName('1 Cor.')).toBe('1 Cor')
  })

  it('trims leading words that are not part of the book name', () => {
    // BOOK_REG matches greedily across words, so the candidate it hands over can
    // carry prose in front of the reference.
    expect(resolveBookName('see Eph.')).toBe('Eph')
  })

  it('returns an unrecognized candidate as written', () => {
    expect(resolveBookName('Notabook')).toBe('Notabook')
  })

  it('leaves an already-clean name untouched', () => {
    expect(resolveBookName('John')).toBe('John')
    expect(resolveBookName('1 cor')).toBe('1 cor')
  })
})
