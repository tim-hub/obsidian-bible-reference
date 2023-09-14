import {
  generateOrdinalNameVariations,
} from './utils/utils';

import baseData from './data/base.json';
import en from './data/translations/en.json'
import it from './data/translations/it.json'
import jp from './data/translations/jp.json'

const allTranslations = [
  en,
  it,
  jp,
]


type Book = {
  names: string[];
  verses: number[];
  startNumber?: number;
};

type BookWithNameAndShortNames = Book & {
  fullName: string;
  shortNames: string[];
}


const translationsDict = new Map<string, BookWithNameAndShortNames[]>()

allTranslations.forEach(
  (translation) => {
    const books: BookWithNameAndShortNames[] = [];
    for (let i = 0; i < 66; i++) {
      const rawBookInfo = (translation as any)['' + (i + 1)];
      const bookBaseData: { verses: number[] } = (baseData as any)['' + (i + 1)];

      let newCombinedNames = rawBookInfo.shortNames.concat(rawBookInfo.name)
      if (rawBookInfo?.startNumber > 0) {
        newCombinedNames = generateOrdinalNameVariations(rawBookInfo.startNumber, newCombinedNames)
      }
      books.push({
        ...bookBaseData,
        fullName: rawBookInfo.name,
        shortNames: rawBookInfo.shortNames,
        startNumber: rawBookInfo?.startNumber, // should not be used anymore
        names: newCombinedNames,
      })
    }
    translationsDict.set(translation.language, books)
  }
)

export const getTranslationBooks = (language: string) => {
  if (!translationsDict.has(language)) {
    const msg = `No translation found for language ${language}`
    console.error(msg)
    throw new Error(msg)
  }
  return translationsDict.get(language)
}


const MultipleLanguageBibleBooks: Book[] = [];


for (let i = 0; i < 66; i++) {
  const book = {
    // @ts-ignore
    verses: translationsDict?.get('en')[i].verses as number[],
    names: [] as string[],
  }

  translationsDict.forEach((books) => {
    book['names'] = [...(new Set(book['names'].concat(books[i].names)))]
  })
  MultipleLanguageBibleBooks.push(book);
}


export default MultipleLanguageBibleBooks;
