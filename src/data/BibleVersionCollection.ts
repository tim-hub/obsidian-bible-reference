import { IBibleVersion } from '../interfaces/IBibleVersion';
import { BibleAPISourceCollection } from './BibleApiSourceCollection';

export const BibleVersionCollection: IBibleVersion[] = [
  {
    key: 'web',
    versionName: 'World English Bible',
    language: 'English',
    apiUrl: 'https://bible-api.com',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'clementine',
    versionName: 'Clementine Latin Vulgate',
    language: 'Latin',
    apiUrl: 'https://bible-api.com',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'kjv',
    versionName: 'King James Version',
    language: 'English',
    apiUrl: 'https://bible-api.com',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'bbe',
    versionName: 'Bible in Basic English',
    language: 'English',
    apiUrl: 'https://bible-api.com',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'oeb-us',
    versionName: 'Open English Bible, US Edition',
    language: 'English',
    apiUrl: 'https://bible-api.com',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'almeida',
    versionName: 'João Ferreira de Almeida',
    language: 'Portuguese',
    apiUrl: 'https://bible-api.com',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'rccv',
    versionName: 'Romanian Corrected Cornilescu Version',
    language: 'Romanian',
    apiUrl: 'https://bible-api.com',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'cherokee',
    versionName: 'Cherokee New Testament',
    language: 'Cherokee',
    apiUrl: 'https://bible-api.com',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'oeb-cw',
    versionName: 'Open English Bible, Commonwealth Edition',
    language: 'English (UK)',
    apiUrl: 'https://bible-api.com',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'webbe',
    versionName: 'World English Bible, British Edition',
    language: 'English (UK)',
    apiUrl: 'https://bible-api.com',
    apiSource: BibleAPISourceCollection.bibleApi,
  },
  {
    key: 'nkjv',
    versionName: 'New King James Version',
    language: 'English',
    apiSource: BibleAPISourceCollection.bollsLife,
    infoUrl: 'https://wikipedia.org/wiki/New_King_James_Version',
  },
  {
    key: 'niv',
    versionName: 'New International Version, 1984',
    language: 'English',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'nlt',
    versionName: 'New Living Translation, 2015',
    language: 'English',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'nrsvce',
    versionName: 'New Revised Standard Version Catholic Edition (NRSVCE)',
    language: 'English',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'esv',
    versionName: 'English Standard Version',
    language: 'English',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'cuv',
    versionName: 'Chinese Union Version (Traditional)',
    language: 'Chinese',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'ubio',
    versionName: 'Біблія, Іван Іванович Огієнко 1962',
    language: 'Українська Ukrainian',
    apiSource: BibleAPISourceCollection.bollsLife,
  },
  {
    key: 'PHIL',
    versionName: 'Бiблiя. Переклад Патріарха ФІЛАРЕТА (Денисенка), 2004',
    language: 'Українська Ukrainian',
    apiSource: BibleAPISourceCollection.bollsLife,
  }
];
