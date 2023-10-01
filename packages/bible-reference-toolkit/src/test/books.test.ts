import { SupportedLanguages, AllBibleBooksInAllSupportedLanguages } from '../lib/books';

describe('test books', () => {

  test('always true', ()=>{
    expect(true)
  })

  test('should support at least en, it, jp, sp', () => {
    expect(SupportedLanguages).toContain('en', 'it', 'jp', 'sp');
  });

  test('book count should be 66', ()=>{
    expect(AllBibleBooksInAllSupportedLanguages.length).toBe(66);
    expect(AllBibleBooksInAllSupportedLanguages[0].name).toBe('Genesis');
    expect(AllBibleBooksInAllSupportedLanguages[0].name).toBe('Genesis');
    expect(AllBibleBooksInAllSupportedLanguages[62].fullName).toBe('2 John');
    expect(AllBibleBooksInAllSupportedLanguages[61].fullName).toBe('1 John');
    expect(AllBibleBooksInAllSupportedLanguages[65].name).toBe('Revelation');
  })
});