import { IVerse } from '../interfaces/IVerse'
import { Notice } from 'obsidian'
import { IBibleVersion } from '../interfaces/IBibleVersion'

export abstract class BaseBibleAPIProvider {
  protected _versionKey: string // the version selected, for example kjv
  protected _apiUrl: string
  protected _currentQueryUrl: string
  protected _bibleReferenceHead: string
  protected _bibleVersion: IBibleVersion
  protected _verseReferenceLink: string = ''
  protected bibleGatewayUrl: string = ''

  constructor(bibleVersion: IBibleVersion) {
    this._bibleVersion = bibleVersion
    const { key } = bibleVersion
    this._versionKey = key
    this._apiUrl = bibleVersion.apiSource.apiUrl
    this._verseReferenceLink = ''
  }

  /**
   * Get the Key Identity for the Bible version
   */
  public get BibleVersionKey(): string {
    return this._versionKey
  }

  /**
   * Get the Reference Head for the latest query
   * for example, "John 3:16"
   */
  public get BibleReferenceHead(): string {
    return this._bibleReferenceHead
  }

  /**
   * Prepare the Verse Link URL for the verse reference
   * @protected
   */
  public getOriginalVerseReferenceLink(): string {
    // By default, use the Bible Gateway URL, be set in each query
    return this._currentQueryUrl
  }

  /**
   * Convert the verses array to a query string
   * For example, [1,2,3] will be converted to "1&2&3"
   * [1,2] will be converted to "1-2"
   * [1] will be converted to "1"
   * @param verses
   * @protected
   */
  public convertVersesToQueryString(verses: number[]): string {
    if (verses?.length >= 3) {
      return verses.join('&')
    } else if (verses?.length === 2 && !!verses[1]) {
      return `${verses[0]}-${verses[1]}`
    } else {
      return `${verses[0]}`
    }
  }

  protected updateOriginalReferenceUrl() {
    this._verseReferenceLink = this._currentQueryUrl
    console.log(this._verseReferenceLink, 'updated verse reference link')
  }

  /**
   * The Query Function to get response from bible api then format the response,
   * @param bookName
   * @param chapter
   * @param verse
   * @param versionName
   */
  public async query(
    bookName: string,
    chapter: number,
    verse: number[],
    versionName?: string
  ): Promise<IVerse[]> {
    if (!this._versionKey && versionName) {
      throw new Error('version (language) not set yet')
    }
    const url = this.buildRequestURL(
      bookName,
      chapter,
      verse,
      versionName || this._versionKey
    )
    this._currentQueryUrl = url
    this.updateOriginalReferenceUrl()
    console.debug(url, 'url to query')
    try {
      const response = await fetch(url, {
        method: 'get',
        // headers: {
        //   'Content-Type': 'application/json',
        // }, // some provide does not accept this header
        redirect: 'follow', // manual, *follow, error
        cache: 'force-cache',
      })
      const data = await response.json()
      return this.formatBibleVerses(
        data,
        bookName,
        chapter,
        verse,
        versionName || this._versionKey
      )
    } catch (e) {
      console.error('error while querying', e)
      new Notice(`Error while querying ${url}`)
      return await Promise.reject(e)
    }
  }

  /**
   * Format the response from the bible api, and set the bible reference head
   * @param data
   * @param bookName
   * @param chapter
   * @param verse
   * @param versionName
   */
  protected abstract formatBibleVerses(
    data:
      | {
          reference: string
          verses: IVerse[]
        }
      | Array<object>,
    bookName: string,
    chapter: number,
    verse: number[],
    versionName: string
  ): IVerse[]

  /**
   * Build the request URL from the given parameters, and set the _queryUrl
   * @param bookName
   * @param chapter
   * @param verses
   * @param versionName
   */
  protected abstract buildRequestURL(
    bookName: string,
    chapter: number,
    verses?: number[],
    versionName?: string
  ): string
}
