import mapper from 'bible-book-names-intl';

import {
  getTranslationBooks as getTranslationBooks1,
  BookWithAbbreviations as BookWithAbbreviations1
} from 'bible-book-names-intl';

/**
 * getTranslationBooks is a function that takes a language code and returns a list of books of the Bible in that language.
 */
export const getTranslationBooks = getTranslationBooks1;

/**
 * BookWithAbbreviations is a type that represents a book of the Bible.
 */
export type BookWithAbbreviations = BookWithAbbreviations1;

/**
 * This is a dictionary of all the languages supported by this library.
 */
export const LanguageToBookWithAbbreviationsDict = mapper;

/**
 * This is a list of all the languages supported by this library.
 */
export const SupportedLanguages = [...mapper.keys()];

export type TypeBookMatch = {
  verses: number[];
  names: string[];
}

const getAllBibleBooksInAllSupportedLanguages = (): BookWithAbbreviations[] => {
  const allBibleBooksInAllSupportedLanguages = [];
  for (let i = 0; i < 66; i++) {
    // @ts-ignore
    const enTranslation = LanguageToBookWithAbbreviationsDict?.get('en')[i];
    const {fullName, verses, name} = enTranslation;

    const book: BookWithAbbreviations = {
      name, // this is the name of the book in English
      fullName, // this is the full name of the book in English
      verses,
      abbreviations: [] as string[], // this will be the list of abbreviations and names for the book in all languages
    }

    LanguageToBookWithAbbreviationsDict.forEach((books) => {
      // in different translations,
      const theBook = books[i];
      const {abbreviations, name} = theBook;

      // concat all names from different translations
      book['abbreviations'] = [...(book['abbreviations'].concat(...abbreviations, name))]
    })
    allBibleBooksInAllSupportedLanguages.push(book);
  }
  return allBibleBooksInAllSupportedLanguages;
}

/**
 * This is a list of all the books of the Bible in all the languages supported by this library.
 */
export const AllBibleBooksInAllSupportedLanguages = getAllBibleBooksInAllSupportedLanguages();


