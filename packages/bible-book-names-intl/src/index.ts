import {
  generateOrdinalNameVariations,
} from './utils/utils';

import baseData from './data/base.json';
import en from './data/translations/en.json'
import it from './data/translations/it.json'
import jp from './data/translations/jp.json'
import sp from './data/translations/sp.json'

const allTranslations = [
  en,
  it,
  jp,
  sp,
]


type OriginalBookType = {
  names: string[];
  verses: number[];
  startNumber?: number;
};

export type BookWithFullNameAndShortNames = OriginalBookType & {
  fullName: string;
  abbreviations: string[];
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
        abbreviations: rawBookInfo.shortNames,
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
  const book: BookWithFullNameAndShortNames = {
    fullName: translationsDict?.get('en')[i].fullName as string,
    verses: translationsDict?.get('en')[i].verses as number[],
    names: [] as string[],
    abbreviations: [] as string[],
  }

  translationsDict.forEach((books) => {
    // concat all names from different translations
    book['abbreviations'] = [...(new Set(book['abbreviations'].concat(books[i].abbreviations)))]
    book['names'] = [...(new Set(book['names'].concat(books[i].fullName)))] // add full names to list
  })
  book['names'] = [...book['names'], ...book['abbreviations']] // combine them (full and short) together as names
  MultipleLanguageBibleBooks.push(book);
}


export default MultipleLanguageBibleBooks;
