import baseData from './data/base.json';
import en from './data/translations/en.json'
import it from './data/translations/it.json'
import jp from './data/translations/jp.json'
import sp from './data/translations/sp.json'
// add new translations here

const allTranslations = [
  en,
  it,
  jp,
  sp,
  // add new translations here
]


type OriginalBookType = {
  names?: string[]; // deprecated
  verses: number[];
  startNumber?: number;
};

export type BookWithAbbreviations = OriginalBookType & {
  name: string;
  fullName: string;
  abbreviations: string[];
}


const getLanguageToBookWithAbbreviationsDict = (): Map<string, BookWithAbbreviations[]> => {
  const languageToBookWithAbbreviationsDict = new Map<string, BookWithAbbreviations[]>()

  allTranslations.forEach(
    (translation: any) => {
      const books: BookWithAbbreviations[] = [];
      for (let i = 0; i < 66; i++) {
        const rawBookInfo = (translation as any)['' + (i + 1)];
        const bookBaseData: { verses: number[] } = (baseData as any)['' + (i + 1)];
        const {startNumber, name, shortNames} = rawBookInfo;
        books.push({
          ...bookBaseData,
          name,
          fullName: startNumber > 1 ? `${startNumber} ${name}` : name,
          abbreviations: shortNames,
          startNumber: startNumber,
        } as BookWithAbbreviations);
      }
      languageToBookWithAbbreviationsDict.set(translation.language, books)
    }
  )
  return languageToBookWithAbbreviationsDict
}

const languageToBookWithAbbreviationsDict = getLanguageToBookWithAbbreviationsDict();

export const getTranslationBooks = (language: string): BookWithAbbreviations[] => {
  if (!languageToBookWithAbbreviationsDict.has(language)) {
    const msg = `No translation found for language ${language}`
    console.error(msg)
    throw new Error(msg)
  }
  return languageToBookWithAbbreviationsDict.get(language) as BookWithAbbreviations[]
}

export default languageToBookWithAbbreviationsDict;