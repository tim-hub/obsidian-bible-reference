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

export type BookWithFullNameAndShortNames = Book & {
  fullName: string;
  shortNames: string[];
}


const translationsDict = new Map<string, BookWithFullNameAndShortNames[]>()

allTranslations.forEach(
  (translation) => {
    const books: BookWithFullNameAndShortNames[] = [];
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


const MultipleLanguageBibleBooks: BookWithFullNameAndShortNames[] = [];


for (let i = 0; i < 66; i++) {
  const book = {
    // @ts-ignore
    fullName: translationsDict?.get('en')[i].fullName as string,
    // @ts-ignore
    verses: translationsDict?.get('en')[i].verses as number[],
    names: [] as string[],
    shortNames: [] as string[],
  }

  translationsDict.forEach((books) => {
    // concat all names from different translations
    book['shortNames'] = [...(new Set(book['shortNames'].concat(books[i].shortNames)))]
    book['names'] = [...(new Set(book['names'].concat(books[i].fullName)))] // add full names to list
  })
  book['names'] = [...book['names'], ...book['shortNames']] // combine them (full and short) together as names
  MultipleLanguageBibleBooks.push(book);
}


export default MultipleLanguageBibleBooks;
