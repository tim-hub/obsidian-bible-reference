import { readJSONFilesInDirectory } from '../utils/utils';
import path from 'path';

describe('test translation structure', () => {
  test('test english', async () => {
    // read the file
    const en = await import('../data/translations/en.json');

    // check if it is an array
    expect(Array.isArray(en.default)).toBe(false);

    // check if it has 66 elements
    expect(en.default['language']).toBe('en');

    // check if the first element is an array
    expect(Array.isArray(en.default['1'].shortNames)).toBe(true);
    expect(en.default['1'].shortNames).toContain('Gen', 'Ge');
    expect(en.default['1'].name).toBe('Genesis');
    expect(en.default['1'].startNumber).toBe(0);

    expect(en.default).toMatchSnapshot();
  });
});

describe('test all translations', () => {
  const duplicatedBookIndex = new Set([9, 10, 11, 12, 13, 14, 46, 47, 52, 53, 54, 55, 60, 61, 62, 63, 64]);

  // 1 Sam and 2 Sam => 8, 9
  // 1 Kings and 2 Kings => 10, 11
  // 1 Chron and 2 Chron => 12, 13
  // 1 Corinthians and 2 Corinthians => 45, 46
  // 1 Thess and 2 Thess => 51, 52
  // 1 Tim and 2 Tim => 53, 54
  // 1 Pet and 2 Pet => 59, 60
  // 1 John and 2 John and 3 John => 61, 62, 63
  const duplicatedBookIndexInPair = [
    [9, 10],
    [11, 12],
    [13, 14],
    [46, 47],
    [52, 53],
    [54, 55],
    [60, 61],
    [62, 63, 64],
  ]


  const allTranslations = readJSONFilesInDirectory(
    path.join(__dirname, '../data/translations/')
  );

  test('there are at least one valid JSON file', () => {
    // check if it is an array
    expect(Array.isArray(allTranslations)).toBe(true);
  })

  test('test each translation', async () => {
    for (const translation of allTranslations) {
      // check if it has 66 elements
      expect(Array.isArray(translation)).toBe(false);
      expect(translation['language']).toBeDefined()
      expect(translation['1']).toBeDefined()
      expect(translation['66']).toBeDefined()

      // check if the first element is an array
      expect(Array.isArray(translation['1'].shortNames)).toBe(true);

      // some books have same name with different start number, they are located at


      for (const indexes of duplicatedBookIndexInPair) {
        const sameNameBooks = indexes.map((index: number) => translation[index])
        if (sameNameBooks[0]?.startNumber > 0) {
          // every book name and short names should be the same
          sameNameBooks.every((book, i, arr) => {
            expect(book.shortNames).toBe(arr[0].shortNames)
            // short name need to be unique
            expect(new Set(book.shortNames).size).toBe(book.shortNames.length)
            expect(book.name).toBe(arr[0].name)
          })

          // but start number should be different
          if (sameNameBooks.length > 2) {
            expect(sameNameBooks.map((b) => b.startNumber)).toEqual([1, 2, 3])
          } else {
            expect(sameNameBooks.map((b) => b.startNumber)).toEqual([1, 2])
          }
        } else {
          // if the start number is 0, (which means number is not used in book name in the same way in English) then the short names and name should be different
          expect(sameNameBooks[0].shortNames).not.toBe(sameNameBooks[1].shortNames)
          expect(sameNameBooks[0].name).not.toBe(sameNameBooks[1].name)
          if (sameNameBooks.length > 2) {
            expect(sameNameBooks[0].shortNames).not.toBe(sameNameBooks[2].shortNames)
            expect(sameNameBooks[0].name).not.toBe(sameNameBooks[2].name)
          }
        }
      }

      // expect(translation).toMatchSnapshot(); // snapshot test is not working as expected
    }
  });

  test('book names should be unique inside each translation', () => {
    // book names should be unique as well, except the books above
    allTranslations.forEach((translation: any[]) => {
      const uniqueBookNames = new Set();
      for (let i = 1; i <= 66; i++) {
        const book = translation[i];
        if (!duplicatedBookIndex.has(i)) {
          uniqueBookNames.add(book.name);
          for (const name of book.shortNames) {
            // console.log(name, uniqueBookNames)
            if (uniqueBookNames.has(name)) {
              console.error(`${name} is duplicated among other books`)
            }
            expect(uniqueBookNames.has(name)).toBe(false);
            uniqueBookNames.add(name);
          }
        }
      }
    });
  })

});
