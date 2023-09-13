import {
  generateOrdinalNameVariations,
  readJSONFilesInDirectory,
} from './utils/utils';

import baseData from './data/base.json';
import path from 'path';

type Book = {
  names: string[];
  verses: number[];
  startWithNumber?: boolean;
  startNumber?: number;
};

const BookWithNamesAndChapterVersesCount: Book[] = [];

const allWesternTranslations = readJSONFilesInDirectory(
  path.join(__dirname, './data/translations/')
);

for (let i = 0; i < 66; i++) {
  const book = (baseData as any)['' + (i + 1)];

  allWesternTranslations.forEach((translation: any) => {
    let newNames = translation[i];
    if (book?.names?.length) {
      newNames = book.names.concat(translation[i]);
    }
    book.names = newNames; //todo use set here
  });
  BookWithNamesAndChapterVersesCount.push(book);
}

// todo support non western translations

BookWithNamesAndChapterVersesCount.forEach((book, index) => {
  if (book?.startNumber && book?.startNumber > 0) {
    book.names = generateOrdinalNameVariations(book.startNumber, book.names);
  }
});

export default BookWithNamesAndChapterVersesCount;
