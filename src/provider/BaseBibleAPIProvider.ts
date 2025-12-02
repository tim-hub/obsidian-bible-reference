import { IVerse } from '../interfaces/IVerse'
import { Notice } from 'obsidian'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { abbreviationsLogos } from '../data/abbreviations'

export abstract class BaseBibleAPIProvider {
  protected _versionKey: string // the version selected, for example kjv
  protected _apiUrl: string
  protected _currentQueryUrl: string
  protected _bibleReferenceHead: string
  protected _bibleVersion: IBibleVersion
  protected bibleGatewayUrl: string = ''
  protected reflyUrl: string = ''

  constructor(bibleVersion: IBibleVersion) {
    this._bibleVersion = bibleVersion
    const { key } = bibleVersion
    this._versionKey = key
    this._apiUrl = bibleVersion.apiSource.apiUrl
  }

  protected get LanguageShortCode(): string | undefined {
    return this._bibleVersion.code
  }

  /**
   * Get the Key Identity for the Bible version
   */
  public get BibleVersionKey(): string {
    return this._versionKey
  }

  /**
   * Get the API URL for the latest query
   * for example, https://api.scripture.api.bible/v1/bibles/de4e0c8c-9c29-44c7-a8c3-c8a9c1b9d6a0/verses/ESV/
   */
  public get QueryURL(): string {
    return this._currentQueryUrl
  }

  protected abstract prepareVerseLinkUrl(): string

  /**
   * Get the Callout Link URL for the verse query
   * By default it's the Query URL, but for some API there is a provided web app, so it will link to that.
   * In the Bolly Life interface, it's just the same URL location except without `/get-text`
   */
  public get VerseLinkURL(): string {
    return this.prepareVerseLinkUrl()
  }

  /**
   * Get the external link URL based on the link type preference
   * @param linkType - The type of external link (BibleGateway or Ref.ly)
   */
  public getExternalLinkUrl(linkType: string): string {
    if (linkType === 'Ref.ly (Logos)' && this.reflyUrl) {
      return this.reflyUrl
    }
    // Default to the standard verse link (BibleGateway or API URL)
    return this.prepareVerseLinkUrl()
  }

  /**
   * Get the Reference Head for the latest query
   * for example, "John 3:16"
   */
  public get BibleReferenceHead(): string {
    return this._bibleReferenceHead
  }

  /**
   * Get the Bible Gateway URL for the latest query
   * @returns {string}
   *   something like this https://www.biblegateway.com/passage/?search=Romans%206:23&version=niv
   * @param bookName
   * @param chapter
   * @param verses
   * @protected
   */
  protected buildBibleGatewayUrl(
    bookName: string,
    chapter: number,
    verses: number[]
  ): string {
    return `https://www.biblegateway.com/passage/?search=${bookName}+${chapter}:${this.convertVersesToQueryString(
      verses
    )}&version=${this._versionKey}`
  }

  /**
   * Convert the verses array to a query string
   * For example, [1,2,3] will be converted to "1&2&3"
   * [1,2] will be converted to "1-2"
   * [1] will be converted to "1"
   * @param verses
   * @protected
   */
  protected convertVersesToQueryString(verses: number[]): string {
    if (verses?.length >= 3) {
      return verses.join('&')
    } else if (verses?.length === 2 && !!verses[1]) {
      return `${verses[0]}-${verses[1]}`
    } else {
      return `${verses[0]}`
    }
  }

  /**
   * Get the ref.ly (Logos) book abbreviation for a given book name
   * @param bookName
   * @protected
   */
  protected getReflyBookAbbreviation(bookName: string): string {
    // If exact match found, return it
    if (abbreviationsLogos[bookName]) {
      return abbreviationsLogos[bookName]
    }

    // Fallback: remove spaces from book name
    return bookName.replace(/ /g, '')
  }

  /**
   * Build the ref.ly (Logos) URL for the verse query
   * @returns {string}
   *   something like this https://ref.ly/Jn3.16 or https://ref.ly/Pr31.10-31
   * @param bookName
   * @param chapter
   * @param verses
   * @protected
   */
  protected buildReflyUrl(
    bookName: string,
    chapter: number,
    verses: number[]
  ): string {
    const bookAbbrev = this.getReflyBookAbbreviation(bookName)

    if (!verses || verses.length === 0) {
      // Whole chapter
      return `https://ref.ly/${bookAbbrev}${chapter}`
    } else if (verses.length === 1) {
      // Single verse
      return `https://ref.ly/${bookAbbrev}${chapter}.${verses[0]}`
    } else if (verses.length === 2) {
      // Verse range
      return `https://ref.ly/${bookAbbrev}${chapter}.${verses[0]}-${verses[1]}`
    } else {
      // Multiple non-consecutive verses - use first verse
      return `https://ref.ly/${bookAbbrev}${chapter}.${verses[0]}`
    }
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
}
