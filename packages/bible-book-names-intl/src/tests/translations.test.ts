import { readJSONFilesInDirectory } from '../utils/utils';
import path from 'path';

describe('test translation structure', () => {
  test('test english', async () => {
    // read the file
    const en = await import('../data/translations/en.json');

    // check if it is an array
    expect(Array.isArray(en.default)).toBe(true);

    // check if it has 66 elements
    expect(en.default.length).toBe(66);

    // check if the first element is an array
    expect(Array.isArray(en.default[0])).toBe(true);
  });
});

describe('test all translations', () => {
  const duplicatedBookIndex = new Set([
    8, 9, 10, 11, 12, 13, 45, 46, 51, 52, 53, 54, 59, 60, 61, 62, 63,
  ]);


  const allTranslations = readJSONFilesInDirectory(
    path.join(__dirname, '../data/translations/')
  );

  test('it is an array', ()=>{
    // check if it is an array
    expect(Array.isArray(allTranslations)).toBe(true);
  })

  test('test each translation', async () => {
    for (const translation of allTranslations) {
      // check if it has 66 elements
      expect(translation.length).toBe(66);

      // check if the first element is an array
      expect(Array.isArray(translation[0])).toBe(true);

      // some books have same name with different start number, they are located at

      // 1 Sam and 2 Sam => 8, 9
      // 1 Kings and 2 Kings => 10, 11
      // 1 Chron and 2 Chron => 12, 13
      // 1 Corinthians and 2 Corinthians => 45, 46
      // 1 Thess and 2 Thess => 51, 52
      // 1 Tim and 2 Tim => 53, 54
      // 1 Pet and 2 Pet => 59, 60
      // 1 John and 2 John and 3 John => 61, 62, 63

      expect(translation[8]).toEqual(translation[9]);
      expect(new Set(translation[8]).size).toBe(translation[8].length);
      expect(translation[10]).toEqual(translation[11]);
      expect(new Set(translation[10]).size).toBe(translation[10].length);
      expect(translation[12]).toEqual(translation[13]);
      expect(new Set(translation[12]).size).toBe(translation[12].length);
      expect(translation[45]).toEqual(translation[46]);
      expect(new Set(translation[45]).size).toBe(translation[45].length);
      expect(translation[51]).toEqual(translation[52]);
      expect(new Set(translation[51]).size).toBe(translation[51].length);
      expect(translation[53]).toEqual(translation[54]);
      expect(new Set(translation[53]).size).toBe(translation[53].length);
      expect(translation[59]).toEqual(translation[60]);
      expect(new Set(translation[59]).size).toBe(translation[59].length);
      expect(translation[61]).toEqual(translation[62]);
      expect(translation[61]).toEqual(translation[63]);
      expect(new Set(translation[61]).size).toBe(translation[61].length);
    }

    // book names should be unique as well, except the books above
    allTranslations.forEach((translation: any[]) => {
      const bookNames = new Set();
      translation.forEach((book:string[], index:number) => {
        // skip the books above
        if (!duplicatedBookIndex.has(index)) {
          for (const name of book) {
            console.log(bookNames, bookNames.has(name), name)
            expect(bookNames.has(name)).toBe(false);
            bookNames.add(name);
          }
        }
      });
    });
  });

});
