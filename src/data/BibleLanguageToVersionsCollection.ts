import { IVerse } from '../SuggestingVerse';

export const LanguageVersionSplitter = '-';

class BibleAPIAdapter {
  protected _language: string;
  protected _version: string;
  protected _apiUrl: string;

  public constructor(versionKey: string, apiUrl: string) {
    this._apiUrl = apiUrl;
    try {
      [this._version, this._language] = versionKey.split(LanguageVersionSplitter);
    } catch (e) {
      console.error('could not be splitted by -', e);
    }
  }

  public async query(queryString: string): Promise<IVerse[]> {
    if (!this._version || !this._language) {
      throw 'version or language not set';
    }

    try {
      const url = `${this._apiUrl}/${queryString}?translation=${this._version}`;
      const response = await fetch(url);
      const data = await response.json();
      return this.formatBibleVerses(data.verses);
    } catch (e) {
      console.error('error while querying bible-api', e);
      return await Promise.reject(e);
    }
  }

  protected formatBibleVerses(verses: any): IVerse[] {
    return verses;
  }
}


export interface IBibleVersion {
  key: string;
  name: string;
  adapter: BibleAPIAdapter;
}

export const BibleVersionCollection: IBibleVersion[] = [
  {
    key: 'web-en',
    name: 'World English Bible',
    adapter: new BibleAPIAdapter('web-en', 'https://bible-api.com'),
  },
  {
    key: 'clementine-en',
    name: 'Clementine Latin Vulgate',
    adapter: new BibleAPIAdapter('clementine-en', 'https://bible-api.com'),
  },
  {
    key: 'kjv-en',
    name: 'King James Version',
    adapter: new BibleAPIAdapter('kjv-en', 'https://bible-api.com'),
  },
];
