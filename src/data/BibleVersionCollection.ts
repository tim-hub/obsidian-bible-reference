import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BibleAPISourceCollection } from './BibleApiSourceCollection'

export const BibleVersionCollectionEnglish = [
  {
    key: 'amp',
    versionName: 'Amplified Bible',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoURL: 'https://en.wikipedia.org/wiki/Amplified_Bible',
  },
  {
    key: 'bbe',
    versionName: 'Bible in Basic English',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'bsb',
    versionName: 'Berean Standard Bible',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'cjb',
    versionName: 'The Complete Jewish Bible',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoURL:
      'https://en.wikipedia.org/wiki/Messianic_Bible_translations#Complete_Jewish_Bible_(CJB)',
  },
  {
    key: 'drb',
    versionName: 'Douay-Rheims Bible',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoURL: 'https://en.wikipedia.org/wiki/Douay-Rheims_Bible',
  },
  {
    key: 'esv',
    versionName: 'English Standard Version',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'gnv',
    versionName: 'Geneva Bible',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoURL: 'https://en.wikipedia.org/wiki/Geneva_Bible',
  },
  {
    key: 'kjv',
    versionName: 'King James Version',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'lsb',
    versionName: 'Legacy Standard Bible',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'lsv',
    versionName: 'Literal Standard Version',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoUrl: 'https://en.wikipedia.org/wiki/Literal_Standard_Version',
  },
  {
    key: 'lxxe',
    versionName: 'English Translation of the Greek Septuagint',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoUrl: 'https://en.wikipedia.org/wiki/Septuagint',
  },
  {
    key: 'mev',
    versionName: 'Modern English Version',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoUrl: 'https://wikipedia.org/wiki/Modern_English_Version',
  },
  {
    key: 'msg',
    versionName: 'The Message Bible',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoUrl: 'https://en.wikipedia.org/wiki/The_Message_(Bible)',
  },
  {
    key: 'nabre',
    versionName: 'New American Bible Revised Edition',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoUrl: 'https://wikipedia.org/wiki/New_American_Bible_Revised_Edition',
  },
  {
    key: 'nasb',
    versionName: 'New American Standard Bible (1995)',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'net',
    versionName: 'New English Translation',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoURL: 'https://en.wikipedia.org/wiki/New_English_Translation',
  },
  {
    key: 'niv',
    versionName: 'New International Version, 1984',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'niv2011',
    versionName: 'New International Version, 2011',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'njb1985',
    versionName: 'New Jerusalem Bible, 1985',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'nkjv',
    versionName: 'New King James Version',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoUrl: 'https://wikipedia.org/wiki/New_King_James_Version',
  },
  {
    key: 'nlt',
    versionName: 'New Living Translation (NLT), 2015',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'nrsvce',
    versionName: 'New Revised Standard Version Catholic Edition (NRSVCE)',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'oeb-us',
    versionName: 'Open English Bible, US Edition',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'rsv',
    versionName: 'Revised Standard Version',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'rsv2ce',
    versionName: 'Revised Standard Version, Second Catholic Edition',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'web',
    versionName: 'World English Bible',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'ylt',
    versionName: "Young's Literal Translation",
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionLatin = [
  {
    key: 'clementine',
    versionName: 'Clementine Latin Vulgate',
    language: 'Latin',
    code: 'la',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
]

export const BibleVersionCollectionPortuguese = [
  {
    key: 'almeida',
    versionName: 'João Ferreira de Almeida',
    language: 'Portuguese',
    code: 'pt',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
]

export const BibleVersionCollectionRomanian = [
  {
    key: 'rccv',
    versionName: 'Romanian Corrected Cornilescu Version',
    language: 'Romanian',
    code: 'ro',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
]

export const BibleVersionCollectionCherokee = [
  {
    key: 'cherokee',
    versionName: 'Cherokee New Testament',
    language: 'Cherokee',
    code: 'cu',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
]

export const BibleVersionCollectionEnglishUK = [
  {
    key: 'oeb-cw',
    versionName: 'Open English Bible, Commonwealth Edition',
    language: 'English (UK)',
    code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'webbe',
    versionName: 'World English Bible, British Edition',
    language: 'English (UK)',
    code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
]

export const BibleVersionCollectionGerman = [
  {
    key: 'elb',
    versionName: 'Elberfelder Bibel (1871)',
    language: 'German Deutsch',
    code: 'de',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'lut',
    versionName: 'Luther (1912)',
    language: 'German Deutsch',
    code: 'de',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'mb',
    versionName: 'Menge-Bibel',
    language: 'German Deutsch',
    code: 'de',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'sch',
    versionName: 'Schlachter (1951)',
    language: 'German Deutsch',
    code: 'de',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionGreek = [
  {
    key: 'lxx',
    versionName: 'Septuagint',
    language: 'Greek Ελληνικά',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'ntgt',
    versionName: 'Greek NT: Tischendorf 8th Ed.',
    language: 'Greek Ελληνικά',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'tr',
    versionName: 'Elzevir Textus Receptus (1624)',
    language: 'Greek Ελληνικά',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionHebrew = [
  {
    key: 'dhnt',
    versionName: "Delitzsch's Hebrew New Testament 1877, 1998 (with Vowels)",
    language: 'Hebrew עברית',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'wlc',
    versionName: 'Westminster Leningrad Codex (with Vowels)',
    language: 'Hebrew עברית',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionChinese = [
  {
    key: 'cunp',
    versionName: 'Chinese Union New Punctuation Cross References',
    language: 'Chinese',
    code: 'cn',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'cunps',
    versionName: 'Chinese Union New Punctuation (Simplified)',
    language: 'Chinese',
    code: 'cn',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'cuv',
    versionName: 'Chinese Union Version (Traditional)',
    language: 'Chinese',
    code: 'cn',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionItalian = [
  {
    key: 'nr06',
    versionName: 'Nuova Riveduta, 2006',
    language: 'Latin / Italian',
    code: 'it',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionArabic = [
  {
    key: 'svd',
    versionName: 'Smith and Van Dyke',
    language: 'Arabic العربية',
    code: 'ar',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionSpanish = [
  {
    key: 'btx3',
    versionName: 'La Biblia Textual 3ra Edicion',
    language: 'Spanish',
    code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'lbla',
    versionName: 'La Biblia de Las Americas, 1997',
    language: 'Spanish',
    code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'ntv',
    versionName: 'Nueva Traduccion Viviente, 2009',
    language: 'Spanish',
    code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'nvi',
    versionName: 'Nueva Version Internacional',
    language: 'Spanish',
    code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'pdt',
    versionName: 'Palabra de Dios para Todos',
    language: 'Spanish',
    code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'rv1960',
    versionName: 'Reina Valera 1960',
    language: 'Spanish',
    code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'rv2004',
    versionName: 'Reina Valera Gomez 2004',
    language: 'Spanish',
    code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionPolish = [
  {
    key: 'bg',
    versionName: 'Biblia gdańska, 1881',
    language: 'Polish',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'bw',
    versionName: 'Biblia warszawska, 1975',
    language: 'Polish',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionIndonesian = [
  {
    key: 'tb',
    versionName: 'Terjemahan Baru',
    language: 'Indonesian',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionRussian = [
  {
    key: 'bti',
    versionName: 'Библия под ред. М.П. Кулакова и М.М. Кулакова, 2015',
    language: 'Russian',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionUkrainian = [
  {
    key: 'utt',
    versionName: 'Українська Біблія LXX УБТ Рафаїла Турконяка (2011) 77 книг',
    language: 'Ukrainian',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionFrench = [
  {
    key: 'nbs',
    versionName: 'Nouvelle Bible Segond, 2002',
    language: 'French',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const BibleVersionCollectionTamil = [
  {
    key: 'tbsi',
    versionName: 'The Bible Society of India - Tamil - O.V.',
    language: 'Tamil',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

/**
 * Please note to support the abbreviation of the translation
 * "code" need to be added
 * And the Abbreviation source need to be updated too See this repo. https://github.com/AntiochTechnology/bible-reference-toolkit/tree/master/packages/bible-book-names-intl
 */
export const BibleVersionCollection: IBibleVersion[] = [
  ...BibleVersionCollectionArabic,
  ...BibleVersionCollectionCherokee,
  ...BibleVersionCollectionChinese,
  ...BibleVersionCollectionEnglish,
  ...BibleVersionCollectionEnglishUK,
  ...BibleVersionCollectionFrench,
  ...BibleVersionCollectionGerman,
  ...BibleVersionCollectionGreek,
  ...BibleVersionCollectionHebrew,
  ...BibleVersionCollectionIndonesian,
  ...BibleVersionCollectionItalian,
  ...BibleVersionCollectionLatin,
  ...BibleVersionCollectionPolish,
  ...BibleVersionCollectionPortuguese,
  ...BibleVersionCollectionRomanian,
  ...BibleVersionCollectionRussian,
  ...BibleVersionCollectionSpanish,
  ...BibleVersionCollectionTamil,
  ...BibleVersionCollectionUkrainian,
]

export const DEFAULT_BIBLE_VERSION = BibleVersionCollection[11]

export const getBibleVersion = (key: string): IBibleVersion => {
  return (
    BibleVersionCollection.find((bibleVersion) => bibleVersion.key === key) ??
    DEFAULT_BIBLE_VERSION
  )
}

export const allBibleVersionsWithLanguageNameAlphabetically: IBibleVersion[] =
  BibleVersionCollection.sort((a, b) => {
    // sort by language and versionName alphabetically
    const languageCompare = a.language.localeCompare(b.language)
    if (languageCompare === 0) {
      return a.versionName.localeCompare(b.versionName)
    } else {
      return languageCompare
    }
  })
