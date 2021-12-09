export interface IBibleVersion {
  key: string;
  versionName: string;
  language: string;
  apiUrl: string;
}

export const BibleVersionCollection: IBibleVersion[] = [
  {
    key: 'web',
    versionName: 'World English Bible',
    language: 'English',
    apiUrl: 'https://bible-api.com',
  },
  {
    key: 'clementine',
    versionName: 'Clementine Latin Vulgate',
    language: 'Latin',
    apiUrl: 'https://bible-api.com',
  },
  {
    key: 'kjv',
    versionName: 'King James Version',
    language: 'English',
    apiUrl: 'https://bible-api.com',
  },
  {
    key: 'bbe',
    versionName: 'Bible in Basic English',
    language: 'English',
    apiUrl: 'https://bible-api.com',
  },
  {
    key: 'oeb-us',
    versionName: 'Open English Bible, US Edition',
    language: 'English',
    apiUrl: 'https://bible-api.com',
  },
  {
    key: 'almeida',
    versionName: 'João Ferreira de Almeida',
    language: 'Portuguese',
    apiUrl: 'https://bible-api.com',
  },
  {
    key: 'rccv',
    versionName: 'Romanian Corrected Cornilescu Version',
    language: 'Romanian',
    apiUrl: 'https://bible-api.com',
  },
  {
    key: 'cherokee',
    versionName: 'Cherokee New Testament',
    language: 'Cherokee',
    apiUrl: 'https://bible-api.com',
  },
];
