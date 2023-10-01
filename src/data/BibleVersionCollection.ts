import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BibleAPISourceCollection } from './BibleApiSourceCollection'

/**
 * Please note to support the abbreviation of the translation
 * "code" need to be added
 * And the Abbreviation source need to be updated too See this repo. https://github.com/AntiochTechnology/bible-reference-toolkit/tree/master/packages/bible-book-names-intl
 */
export const BibleVersionCollection: IBibleVersion[] = [
  // bible api
  {
    key: 'web',
    versionName: 'World English Bible',
    language: 'English',
    code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'clementine',
    versionName: 'Clementine Latin Vulgate',
    language: 'Latin', code: 'la',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'kjv',
    versionName: 'King James Version',
    language: 'English', code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'bbe',
    versionName: 'Bible in Basic English',
    language: 'English', code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'oeb-us',
    versionName: 'Open English Bible, US Edition',
    language: 'English', code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'almeida',
    versionName: 'João Ferreira de Almeida',
    language: 'Portuguese', code: 'pt',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'rccv',
    versionName: 'Romanian Corrected Cornilescu Version',
    language: 'Romanian', code: 'ro',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'cherokee',
    versionName: 'Cherokee New Testament',
    language: 'Cherokee', code: 'cu',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'oeb-cw',
    versionName: 'Open English Bible, Commonwealth Edition',
    language: 'English (UK)', code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'webbe',
    versionName: 'World English Bible, British Edition',
    language: 'English (UK)', code: 'en',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  // bolls life
  {
    key: 'nkjv',
    versionName: 'New King James Version',
    language: 'English', code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoUrl: 'https://wikipedia.org/wiki/New_King_James_Version',
  },
  {
    key: 'niv',
    versionName: 'New International Version, 1984',
    language: 'English', code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'nrsvce',
    versionName: 'New Revised Standard Version Catholic Edition (NRSVCE)',
    language: 'English', code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'esv',
    versionName: 'English Standard Version',
    language: 'English', code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
   {
    key: "nasb",
    versionName: "New American Standard Bible (1995)",
    language: "English",
   code: 'en',
    apiSource: BibleAPISourceCollection.bollsLife
  },
  {
    key: "elb",
    versionName: "Elberfelder Bibel (1871)",
    language: "German Deutsch",
    code: 'de',
    apiSource: BibleAPISourceCollection.bollsLife
  },
  {
    key: "lut",
    versionName: "Luther (1912)",
    language: "German Deutsch",
    code: 'de',
    apiSource: BibleAPISourceCollection.bollsLife
  },
  {
    key: "ntgt",
    versionName: "Greek NT: Tischendorf 8th Ed.",
    language: "Greek Ελληνικά",
    apiSource: BibleAPISourceCollection.bollsLife
  },
  {
    key: "tr",
    versionName: "Elzevir Textus Receptus (1624)",
    language: "Greek Ελληνικά",
    apiSource: BibleAPISourceCollection.bollsLife
  },
  {
    key: "lxx",
    versionName: "Septuagint",
    language: "Greek Ελληνικά",
    apiSource: BibleAPISourceCollection.bollsLife
  },
  {
    key: "wlc",
    versionName: "Westminster Leningrad Codex (with Vowels)",
    language: "Hebrew עברית",
    apiSource: BibleAPISourceCollection.bollsLife
  },
  {
    key: "dhnt",
    versionName: "Delitzsch's Hebrew New Testament 1877, 1998 (with Vowels)",
    language: "Hebrew עברית",
    apiSource: BibleAPISourceCollection.bollsLife
  },
  {
    key: 'cuv',
    versionName: 'Chinese Union Version (Traditional)',
    language: 'Chinese', code: 'cn',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'nr06',
    versionName: 'Nuova Riveduta, 2006',
    language: 'Latin / Italian', code: 'it',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'svd',
    versionName: 'Smith and Van Dyke',
    language: 'Arabic العربية', code: 'ar',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'btx3',
    versionName: 'La Biblia Textual 3ra Edicion',
    language: 'Spanish', code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'rv1960',
    versionName: 'Reina Valera 1960',
    language: 'Spanish', code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'rv2004',
    versionName: 'Reina Valera Gomez 2004',
    language: 'Spanish', code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'pdt',
    versionName: 'Palabra de Dios para Todos',
    language: 'Spanish', code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'nvi',
    versionName: 'Nueva Version Internacional',
    language: 'Spanish', code: 'sp',
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
    key: 'lbla',
    versionName: 'La Biblia de Las Americas, 1997',
    language: 'Spanish',
    code: 'sp',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  // todo add langauge code
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
  {
    key: 'tb',
    versionName: 'Terjemahan Baru',
    language: 'Indonesian',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'bti',
    versionName: 'Библия под ред. М.П. Кулакова и М.М. Кулакова, 2015',
    language: 'Russian',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'utt',
    versionName: 'Українська Біблія LXX УБТ Рафаїла Турконяка (2011) 77 книг',
    language: 'Ukrainian',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
]

export const DEFAULT_BIBLE_VERSION = BibleVersionCollection[11]
