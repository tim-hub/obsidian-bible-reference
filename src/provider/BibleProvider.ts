import { IVerse } from '../interfaces/IVerse'

export abstract class BibleProvider {
  protected _key: string // the version selected
  protected _apiUrl: string
  protected _queryUrl: string
  protected _bibleReferenceHead: string

  /**
   * Get the Key Identity for the Bible version
   */
  public get BibleVersionKey(): string {
    return this._key
  }

  /**
   * Get the API URL for the latest query
   * for example, https://api.scripture.api.bible/v1/bibles/de4e0c8c-9c29-44c7-a8c3-c8a9c1b9d6a0/verses/ESV/
   */
  public get QueryURL(): string {
    return this._queryUrl
  }

  /**
   * Get the Callout Link URL for the verse query
   * By default it's the Query URL, but for some API there is a provided web app, so it will link to that.
   * In the Bolly Life interface, it's just the same URL location except without `/get-text`
   */
  public get VerseLinkURL(): string {
    return this._queryUrl
  }

  /**
   * Get the Reference Head for the latest query
   * for example, "John 3:16"
   */
  public get BibleReferenceHead(): string {
    return this._bibleReferenceHead
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
    if (!this._key && versionName) {
      throw new Error('version (language) not set yet')
    }
    const url = this.buildRequestURL(
      bookName,
      chapter,
      verse,
      versionName || this._key
    )
    console.debug(url, 'url to query')
    try {
      const response = await fetch(url, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow', // manual, *follow, error
        cache: 'force-cache',
      })
      const data = await response.json()
      return this.formatBibleVerses(
        data,
        bookName,
        chapter,
        verse,
        versionName || this._key
      )
    } catch (e) {
      console.error('error while querying', e)
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
  public abstract buildRequestURL(
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
    data: any,
    bookName: string,
    chapter: number,
    verse: number[],
    versionName: string
  ): IVerse[]
}
