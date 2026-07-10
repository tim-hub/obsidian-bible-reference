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

  it('should return the correct ids for common Spanish book aliases', () => {
    expect(getBookIdFromBookName('Cantares')).toBe(22)
    expect(getBookIdFromBookName('Cantar de los Cantares')).toBe(22)
    expect(getBookIdFromBookName('Hechos')).toBe(44)
    expect(getBookIdFromBookName('Zacarías')).toBe(38)
    expect(getBookIdFromBookName('Zacarias')).toBe(38)
  })

  it('should resolve common Spanish book names', () => {
    const commonSpanishBookNames: Array<[string, number]> = [
      ['Génesis', 1],
      ['Éxodo', 2],
      ['Levítico', 3],
      ['Números', 4],
      ['Deuteronomio', 5],
      ['Josué', 6],
      ['Jueces', 7],
      ['Rut', 8],
      ['1 Samuel', 9],
      ['2 Samuel', 10],
      ['1 Reyes', 11],
      ['2 Reyes', 12],
      ['1 Crónicas', 13],
      ['2 Crónicas', 14],
      ['Esdras', 15],
      ['Nehemías', 16],
      ['Ester', 17],
      ['Job', 18],
      ['Salmos', 19],
      ['Proverbios', 20],
      ['Eclesiastés', 21],
      ['Cantares', 22],
      ['Isaías', 23],
      ['Jeremías', 24],
      ['Lamentaciones', 25],
      ['Ezequiel', 26],
      ['Daniel', 27],
      ['Oseas', 28],
      ['Joel', 29],
      ['Amós', 30],
      ['Abdías', 31],
      ['Jonás', 32],
      ['Miqueas', 33],
      ['Nahúm', 34],
      ['Habacuc', 35],
      ['Sofonías', 36],
      ['Hageo', 37],
      ['Zacarías', 38],
      ['Malaquías', 39],
      ['Mateo', 40],
      ['Marcos', 41],
      ['Lucas', 42],
      ['Juan', 43],
      ['Hechos', 44],
      ['Romanos', 45],
      ['1 Corintios', 46],
      ['2 Corintios', 47],
      ['Gálatas', 48],
      ['Efesios', 49],
      ['Filipenses', 50],
      ['Colosenses', 51],
      ['1 Tesalonicenses', 52],
      ['2 Tesalonicenses', 53],
      ['1 Timoteo', 54],
      ['2 Timoteo', 55],
      ['Tito', 56],
      ['Filemón', 57],
      ['Hebreos', 58],
      ['Santiago', 59],
      ['1 Pedro', 60],
      ['2 Pedro', 61],
      ['1 Juan', 62],
      ['2 Juan', 63],
      ['3 Juan', 64],
      ['Judas', 65],
      ['Apocalipsis', 66],
    ]

    commonSpanishBookNames.forEach(([bookName, bookId]) => {
      expect(getBookIdFromBookName(bookName)).toBe(bookId)
    })
  })

  it('should resolve common Spanish book names without accents', () => {
    const commonSpanishBookNamesWithoutAccents: Array<[string, number]> = [
      ['Genesis', 1],
      ['Exodo', 2],
      ['Levitico', 3],
      ['Numeros', 4],
      ['Deuteronomio', 5],
      ['Josue', 6],
      ['Jueces', 7],
      ['Rut', 8],
      ['1 Samuel', 9],
      ['2 Samuel', 10],
      ['1 Reyes', 11],
      ['2 Reyes', 12],
      ['1 Cronicas', 13],
      ['2 Cronicas', 14],
      ['Esdras', 15],
      ['Nehemias', 16],
      ['Ester', 17],
      ['Job', 18],
      ['Salmos', 19],
      ['Proverbios', 20],
      ['Eclesiastes', 21],
      ['Cantares', 22],
      ['Isaias', 23],
      ['Jeremias', 24],
      ['Lamentaciones', 25],
      ['Ezequiel', 26],
      ['Daniel', 27],
      ['Oseas', 28],
      ['Joel', 29],
      ['Amos', 30],
      ['Abdias', 31],
      ['Jonas', 32],
      ['Miqueas', 33],
      ['Nahum', 34],
      ['Habacuc', 35],
      ['Sofonias', 36],
      ['Hageo', 37],
      ['Zacarias', 38],
      ['Malaquias', 39],
      ['Mateo', 40],
      ['Marcos', 41],
      ['Lucas', 42],
      ['Juan', 43],
      ['Hechos', 44],
      ['Romanos', 45],
      ['1 Corintios', 46],
      ['2 Corintios', 47],
      ['Galatas', 48],
      ['Efesios', 49],
      ['Filipenses', 50],
      ['Colosenses', 51],
      ['1 Tesalonicenses', 52],
      ['2 Tesalonicenses', 53],
      ['1 Timoteo', 54],
      ['2 Timoteo', 55],
      ['Tito', 56],
      ['Filemon', 57],
      ['Hebreos', 58],
      ['Santiago', 59],
      ['1 Pedro', 60],
      ['2 Pedro', 61],
      ['1 Juan', 62],
      ['2 Juan', 63],
      ['3 Juan', 64],
      ['Judas', 65],
      ['Apocalipsis', 66],
    ]

    commonSpanishBookNamesWithoutAccents.forEach(([bookName, bookId]) => {
      expect(getBookIdFromBookName(bookName)).toBe(bookId)
    })
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

  it('should resolve common Spanish aliases back to English', () => {
    expect(getFullBookName('Cantares', 'en')).toBe('Song of Solomon')
    expect(getFullBookName('Cantar de los Cantares', 'en')).toBe(
      'Song of Solomon'
    )
    expect(getFullBookName('Hechos', 'en')).toBe('Acts')
    expect(getFullBookName('Zacarías', 'en')).toBe('Zechariah')
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
