import { IVerse } from '../interfaces/IVerse';
import { IBibleVersion } from '../interfaces/IBibleVersion';
import { BibleProvider } from './BibleProvider';
import { Reference } from '../../biblejs-name-converter';

export class BollyLifeProvider extends BibleProvider {
  private _verseApiUrl: string;
  private _chapterApiUrl: string; // currently we do not support get whole chapter yet, but the api supported it

  public constructor(bibleVersion: IBibleVersion) {
    super();
    const {key} = bibleVersion;
    this._key = key;
    this._apiUrl = bibleVersion.apiSource.apiUrl;
    this._verseApiUrl = `${this._apiUrl}/get-paralel-verses/`;
    this._chapterApiUrl = `${this._apiUrl}/get-chapter/`;
  }

  public buildRequestURL(): string {
    return this._verseApiUrl;
  }

  private buildPayload(bookName: string, chapter: number, verse: number[], versionName: string): any {
    try {
      // transfer book name to number
      const bookId = Reference.bookIdFromName(bookName);
      return JSON.stringify({
        translations: [versionName.toUpperCase()],
        book: bookId,
        chapter: chapter,
        verses: verse,
      });
    } catch (e) {
      console.error(bookName, chapter, verse, versionName, e);
      throw new Error('book name is not supported');
    }
  }

  /**
   * The Query Function to post to server of bolly life api then format the response,
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
    const url = this.buildRequestURL();
    try {
      const response = await fetch(url, {
        method: 'POST',
        //mode: 'no-cors',
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "app://obsidian.md",
        },
        body: this.buildPayload(bookName, chapter, verse, versionName ? versionName : this._key),
      });
      const data = await response.json();
      return this.formatBibleVerses(data);
    } catch (e) {
      console.error(`error while querying ${this._verseApiUrl} `, e, this.buildPayload(bookName, chapter, verse, versionName ? versionName : this._key));
      return await Promise.reject(e);
    }
  }

  /**
   * Format response from Bible-Api.com
   * - reference
   * - text
   * - verses
   * - translation_id
   * - translation_name
   * - translation_note
   * @returns {Promise<IVerse[]>}
   */
  protected formatBibleVerses(data: any): IVerse[] {
    return data.map(
        (verse: { text: any; chapter: any; book: any; verse: any; }) => (
        {
          text: verse.text,
          chapter: verse.chapter,
          book_id: verse.book,
          book_name: Reference.bookNameFromId(verse.book), // this might be different than user typed
          verse: verse.verse,
        }
      )
    )
  }
}

