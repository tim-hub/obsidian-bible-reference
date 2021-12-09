import { IVerse } from '../SuggestingVerse';
import { IBibleVersion } from './BibleVersionCollection';

export class BibleVersionAPIAdapter {
  protected _key: string;
  protected _language: string;
  protected _versionName: string;
  protected _apiUrl: string;

  protected formatBibleVerses(verses: any): IVerse[] {
    return verses;
  }

  public constructor(key: string, versionName: string, language:string, apiUrl: string) {
    this._key = key;
    this._apiUrl = apiUrl;
    this._versionName = versionName;
    this._language = language;
  }

  public get BibleVersionKey(): string {
    return this._key;
  }

  public async query(queryString: string): Promise<IVerse[]> {
    if (!this._versionName || !this._language) {
      throw 'version or language not set';
    }

    try {
      const url = `${this._apiUrl}/${queryString}?translation=${this.BibleVersionKey}`;
      const response = await fetch(url);
      const data = await response.json();
      return this.formatBibleVerses(data.verses);
    } catch (e) {
      console.error('error while querying bible-api', e);
      return await Promise.reject(e);
    }
  }

  public static BuildBibleVersionAPIAdapterFromIBibleVersion(bibleVersion: IBibleVersion): BibleVersionAPIAdapter {
    const { key, versionName, language, apiUrl } = bibleVersion;
    return new BibleVersionAPIAdapter(key, versionName, language, apiUrl);
  }
}

