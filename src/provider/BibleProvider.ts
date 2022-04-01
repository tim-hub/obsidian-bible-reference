import { IVerse } from '../interfaces/IVerse';

export abstract class BibleProvider {
  protected _key: string; // the version selected
  protected _apiUrl: string;
  protected _queryUrl?: string;
  protected _bibleReferenceHead?: string;

  /**
   * Get the Key Identity for the Bible version
   */
  public get BibleVersionKey(): string {
    return this._key;
  }

  /**
   * Get the API URL for the latest query
   * for example, https://api.scripture.api.bible/v1/bibles/de4e0c8c-9c29-44c7-a8c3-c8a9c1b9d6a0/verses/ESV/
   */
  public get QueryURL(): string {
    return this._queryUrl;
  }

  /**
   * Get the Reference Head for the latest query
   * for example, "John 3:16"
   */
  public get BibleReferenceHead(): string {
    return this._bibleReferenceHead;
  }

  /**
   * The Query Function to get response from bible api then format the response,
   * @param bookName
   * @param chapter
   * @param verse, optional, if none, whole chapter will be returned
   * @param versionName, optional, to override default selected version
   */
  public async query(
    bookName: string,
    chapter: number,
    verse?: number[],
    versionName?: string,
  ): Promise<IVerse[]> {
    if ((!this._key) && versionName) {
      throw new Error('version (language) not set yet');
    }
    const url = this.buildRequestURL(bookName, chapter, verse, versionName);
    try {
      const response = await fetch(url);
      const data = await response.json();
      return this.formatBibleVerses(data);
    } catch (e) {
      console.error('error while querying bible-api', e);
      return await Promise.reject(e);
    }
  }

  /**
   * Build the request URL from the given parameters, and set the _queryUrl
   * @param bookName
   * @param chapter
   * @param verses
   * @param versionName
   */
  public abstract buildRequestURL(
    bookName: string,
    chapter: number,
    verses?: number[],
    versionName?: string,
  ): string

  /**
   * Format the response from the bible api, and set the bible reference head
   * @param data
   */
  protected abstract formatBibleVerses(data: any): IVerse[];
}
