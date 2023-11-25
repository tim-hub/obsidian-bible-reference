import Reference from '../lib/reference';


describe('Reference get book id from name', () => {
  test('Get Book Id from Book Name', () => {
    expect(Reference.bookIdFromName('Genesis')).toBe(1);
  })

  test('Get Book Id From Book Name For English', () => {
    expect(Reference.bookIdFromTranslationAndName('en', 'Genesis')).toBe(1);
  })

  test('Get Book Id for 1 Timothy', () => {
    expect(Reference.bookIdFromTranslationAndName('en', '1 Timothy')).toBe(54);
  })

  test('Get Book Id for 1 Tim', () => {
    expect(Reference.bookIdFromTranslationAndName('en', '1Tim')).toBe(54);
  })



  test('Get Book Id for 2 Timothy', () => {
    expect(Reference.bookIdFromTranslationAndName('en', '2 Timothy')).toBe(55);
  })

  test('Get Book Id for 3 John', () => {
    expect(Reference.bookIdFromTranslationAndName('en', '3 John')).toBe(64);
  })

  describe('get book name from id with books start with number', () => {
    test('Get Book Id from Book Name', () => {
      expect(Reference.bookIdFromName('1 Timothy')).toBe(54);
    })
  })
})


describe('Reference Original Test in Other Languages', () => {
  test('Get Book Id From Book Name For Spanish', () => {
    expect(Reference.bookIdFromTranslationAndName('sp', 'Génesis')).toBe(1);
  })

  test('Get Book Id From Book Name For Spanish With Short Name', () => {
    expect(Reference.bookIdFromTranslationAndName('sp', 'gn')).toBe(1);
  })

  test('Get Book Id for 3 John in Japanese', () => {
    expect(Reference.bookIdFromTranslationAndName('jp', 'ヨハネの手紙三')).toBe(64);
  })

  test('Get Book Name from Book Id in JP', () => {
    expect(Reference.bookNameFromTranslationAndId('jp', 64)).toBe('ヨハネの手紙三');
  })

  test('Get Book Name from Book Id in Spain', () => {
    expect(Reference.bookNameFromTranslationAndId('sp', 62)).toBe('1 Juan');
  })
})