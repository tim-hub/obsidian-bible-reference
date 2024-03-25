import { IVerse } from '../interfaces/IVerse'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BaseBibleAPIProvider } from './BaseBibleAPIProvider'
import { getBookIdFromBookName } from '../utils/bookNameReference'

export class BollyLifeProvider extends BaseBibleAPIProvider {
  //private _verseApiUrl: string; // we do not support get verse api yet, but the api supported it
  private _chapterApiUrl: string

  public constructor(bibleVersion: IBibleVersion) {
    super(bibleVersion)
    //this._verseApiUrl = `${this._apiUrl}/get-paralel-verses/`;
    //this._chapterApiUrl = `${this._apiUrl}/get-chapter/`;
    this._chapterApiUrl = this._apiUrl
  }

  protected prepareVerseLinkUrl(): string {
    return this._currentQueryUrl.replace('/get-text', '')
  }

  public buildRequestURL(
    bookName: string,
    chapter: number,
    verses?: number[],
    versionName?: string
  ): string {
    const baseUrl = this._chapterApiUrl
    const bookId = getBookIdFromBookName(bookName, this._bibleVersion.code)
    this._currentQueryUrl = `${baseUrl}/${versionName?.toUpperCase()}/${bookId}/${chapter}/`
    // if build bible gateway url here, the VerseLinkURL will be different
    return this._currentQueryUrl
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
  protected formatBibleVerses(
    data: any,
    bookName: string,
    chapter: number,
    verses: number[],
    versionName: string
  ): IVerse[] {
    this._bibleReferenceHead = `${bookName} ${chapter}:${verses[0]}${
      verses[1] ? `-${verses[1]}` : ''
    }`

    return data
      .filter(
        (verse: { verse: number }) =>
          verse.verse >= verses[0] && verse.verse <= verses[verses.length - 1]
      )
      .map((verse: { text: any; chapter: any; book: any; verse: any }) => ({
        text: verse.text,
        chapter: verse.chapter,
        book_id: verse.book,
        book_name: bookName, // this might be different than user typed
        verse: verse.verse,
      }))
  }
}
