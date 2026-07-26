import Reference from '../lib/reference'

describe('Reference get book id from name', () => {
  test('Get Book Id from Book Name', () => {
    expect(Reference.bookIdFromName('Genesis')).toBe(1)
  })

  test('Get Book Id From Book Name For English', () => {
    expect(Reference.bookIdFromTranslationAndName('en', 'Genesis')).toBe(1)
  })

  test('Get Book Id for 1 Timothy', () => {
    expect(Reference.bookIdFromTranslationAndName('en', '1 Timothy')).toBe(54)
  })

  test('Get Book Id for 1 Tim', () => {
    expect(Reference.bookIdFromTranslationAndName('en', '1Tim')).toBe(54)
  })

  test('Get Book Id for 2 Timothy', () => {
    expect(Reference.bookIdFromTranslationAndName('en', '2 Timothy')).toBe(55)
  })

  test('Get Book Id for 3 John', () => {
    expect(Reference.bookIdFromTranslationAndName('en', '3 John')).toBe(64)
  })

  describe('get book name from id with books start with number', () => {
    test('Get Book Id from Book Name', () => {
      expect(Reference.bookIdFromName('1 Timothy')).toBe(54)
    })
  })
})

describe('Reference Original Test in Other Languages', () => {
  test('Get Book Id From Book Name For Spanish', () => {
    expect(Reference.bookIdFromTranslationAndName('sp', 'Génesis')).toBe(1)
  })

  test('Get Book Id From Book Name For Spanish With Short Name', () => {
    expect(Reference.bookIdFromTranslationAndName('sp', 'gn')).toBe(1)
  })

  test('Get Book Id for 3 John in Japanese', () => {
    expect(Reference.bookIdFromTranslationAndName('jp', 'ヨハネの手紙三')).toBe(
      64
    )
  })

  test('Get Book Name from Book Id in JP', () => {
    expect(Reference.bookNameFromTranslationAndId('jp', 64)).toBe(
      'ヨハネの手紙三'
    )
  })

  test('Get Book Name from Book Id in Spain', () => {
    expect(Reference.bookNameFromTranslationAndId('sp', 62)).toBe('1 Juan')
  })
})

// Regression: localized numbered books must resolve through the cross-language
// bookIdFromName fallback, not only per-translation lookup. The provider maps a
// localized name to English via this path, so failure here dropped the verse
// text (issues #355, #342).
describe('Cross-language numbered book resolution (bookIdFromName)', () => {
  test.each([
    ['1 Könige', 11],
    ['1Könige', 11],
    ['1 Reyes', 11],
    ['2 Corintios', 47],
    ['1 Corinthians', 46],
    ['1 Kings', 11],
  ])('resolves %s', (name, expectedId) => {
    expect(Reference.bookIdFromName(name)).toBe(expectedId)
  })
})

// The string constructor has always stripped the periods abbreviations are
// written with ("Mk. 2"). The static lookups did not, so the plugin - which
// calls them directly - could not resolve any dotted abbreviation.
describe('Abbreviations written with a period', () => {
  test.each([
    ['Eph.', 49],
    ['Matt.', 40],
    ['Gen.', 1],
    ['Mk.', 41],
    ['1 Cor.', 46],
    ['2 Tim.', 55],
    ['1 Jn.', 62],
  ])('resolves %s', (name, expectedId) => {
    expect(Reference.bookIdFromName(name)).toBe(expectedId)
  })

  test('resolves through the per-translation lookup too', () => {
    expect(Reference.bookIdFromTranslationAndName('en', 'Eph.')).toBe(49)
  })

  test('collapses whitespace runs around the ordinal', () => {
    expect(Reference.bookIdFromName('1  Cor.')).toBe(46)
    expect(Reference.bookIdFromName('  1 Cor.  ')).toBe(46)
  })
})

// Stripping periods from the query only, and not from the catalog
// entries it is compared against, broke every book whose own name carries a
// period. German 1-5 Mose and Romanian "F. Ap." all have startNumber 0, so the
// exact pass is their only chance to match - there is no ordinal fallback.
describe('Catalog entries that carry periods themselves', () => {
  test.each([
    ['de', '1. Mose', 1],
    ['de', '2. Mose', 2],
    ['de', '3. Mose', 3],
    ['de', '4. Mose', 4],
    ['de', '5. Mose', 5],
    ['de', '1. Mo', 1],
    ['de', '5. Mo', 5],
    ['ro', 'F. Ap.', 44],
  ])('resolves %s %s', (language, name, expectedId) => {
    expect(Reference.bookIdFromTranslationAndName(language, name)).toBe(
      expectedId
    )
  })

  test('resolves through the cross-language lookup too', () => {
    expect(Reference.bookIdFromName('1. Mose')).toBe(1)
    expect(Reference.bookIdFromName('5. Mose')).toBe(5)
  })

  // Both sides normalize, so the periods are now optional on either.
  test('matches with the periods left out', () => {
    expect(Reference.bookIdFromTranslationAndName('de', '1 Mose')).toBe(1)
    expect(Reference.bookIdFromTranslationAndName('ro', 'F Ap')).toBe(44)
  })
})

describe('Multi-word book names', () => {
  test.each([
    ['Song of Solomon', 22],
    ['Song of Songs', 22],
  ])('resolves %s', (name, expectedId) => {
    expect(Reference.bookIdFromName(name)).toBe(expectedId)
  })
})
