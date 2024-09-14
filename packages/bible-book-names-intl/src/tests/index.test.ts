import languageToBookWithAbbreviationsDict from '../index';

describe('test book names', () => {

  test('it should have at least 10 languages translations', ()=>{
    expect(languageToBookWithAbbreviationsDict.size).toBeGreaterThanOrEqual(10);
    //    it has English translation
    expect(languageToBookWithAbbreviationsDict.has('en')).toBe(true);
    expect(languageToBookWithAbbreviationsDict.has('de')).toBe(true);
    expect(languageToBookWithAbbreviationsDict.has('jp')).toBe(true);
    expect(languageToBookWithAbbreviationsDict.has('fr')).toBe(true);
    expect(languageToBookWithAbbreviationsDict.has('zh_CN')).toBe(true);
  })


  const books = languageToBookWithAbbreviationsDict.get('en');
  test('it has English translation', () => {
    expect(languageToBookWithAbbreviationsDict.has('en')).toBe(true);
  });

  test('books count is 66', () => {
    expect(languageToBookWithAbbreviationsDict.has('en')).toBe(true);
    expect(books.length).toBe(66);
    expect(books[0].fullName).toBe('Genesis');
    expect(books[0].abbreviations).toContain('Gen');
    expect(books[0].verses.length).toBe(50);
    expect(!books[0].startNumber).toBe(true);
  });

  test('first book Genesis', () => {
    expect(books[0].fullName).toBe('Genesis');
    expect(books[0].abbreviations).toContain('Gen');
    expect(books[0].abbreviations).toContain('Ge');
    expect(books[0].verses.length).toBe(50);
    expect(!books[0].startNumber).toBe(true);
  });

  test('test book 1 John', () => {
    expect(books[61].fullName).toBe('1 John');
    expect(books[61].name).toBe('John');
    expect(books[61].startNumber).toBe(1);
    expect(books[61].verses.length).toBe(5);
    expect(books[61].verses[0]).toBe(10);
    expect(books[61].abbreviations).toContain('Jn');
    expect(books[61].abbreviations).toContain('Joh');
  });
});

//todo add more
