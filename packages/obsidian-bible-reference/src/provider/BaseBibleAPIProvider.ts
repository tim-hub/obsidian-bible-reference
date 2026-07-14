import { IVerse } from '../interfaces/IVerse'
import { Notice } from 'obsidian'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { verseCache, expandRequestedVerses } from './verseCache'
import { offlineLookup } from './offlineBible'

export abstract class BaseBibleAPIProvider {
  protected _versionKey: string // the version selected, for example kjv
  protected _apiUrl: string
  protected _currentQueryUrl: string
  protected _bibleReferenceHead: string
  protected _bibleVersion: IBibleVersion
  protected _verseReferenceLink: string = ''
  protected bibleGatewayUrl: string = ''
  // BollyLife fetches the whole chapter then filters, so a miss fetches [1,999].
  protected fetchesWholeChapter = false

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
    const translationKey = versionName || this._versionKey

    // The reference link must reflect the USER'S requested range (used by the
    // 'original' source link), independent of what we actually fetch below.
    const referenceUrl = this.buildRequestURL(
      bookName,
      chapter,
      verse,
      translationKey
    )
    this._currentQueryUrl = referenceUrl
    this.updateOriginalReferenceUrl()

    // Full cache hit? Serve without touching the network.
    const requested = expandRequestedVerses(verse)
    let missing: number[] | null = null
    if (requested) {
      const { hits, missing: gap } = verseCache.getVerses(
        translationKey,
        bookName,
        chapter,
        requested
      )
      if (gap.length === 0 && hits.length) {
        return hits
      }
      missing = gap
    }

    // Fetch the gap. Whole chapter for BollyLife-style providers. On a partial
    // hit fetch only the still-missing verses; on a full miss keep the caller's
    // compact range (e.g. [1,51] -> "1-51", not the expanded "1&2&...&51").
    const partialHit =
      !!missing?.length && !!requested && missing.length < requested.length
    const fetchVerses = this.fetchesWholeChapter
      ? [1, 999]
      : partialHit
        ? missing!
        : verse
    const fetchUrl = this.buildRequestURL(
      bookName,
      chapter,
      fetchVerses,
      translationKey
    )
    console.debug(fetchUrl, 'url to query')
    try {
      const response = await fetch(fetchUrl, {
        method: 'get',
        // headers: {
        //   'Content-Type': 'application/json',
        // }, // some provide does not accept this header
        redirect: 'follow', // manual, *follow, error
        cache: 'force-cache',
      })
      const data = await response.json()
      const fetched = this.formatBibleVerses(
        data,
        bookName,
        chapter,
        fetchVerses,
        translationKey
      )
      verseCache.putVerses(translationKey, bookName, chapter, fetched)
      // Restore the requested-range reference link (buildRequestURL for the
      // fetched subset overwrote it as a side effect).
      this._currentQueryUrl = referenceUrl
      this.updateOriginalReferenceUrl()
      if (requested) {
        const { hits } = verseCache.getVerses(
          translationKey,
          bookName,
          chapter,
          requested
        )
        return hits.length ? hits : fetched
      }
      return fetched
    } catch (e) {
      this._currentQueryUrl = referenceUrl
      this.updateOriginalReferenceUrl()
      console.error('error while querying', e)
      // Graceful degrade: fall back to the bundled WEB text for this lookup.
      // Not written to verseCache, so the selected version's cache stays clean.
      const offline = offlineLookup(bookName, chapter, verse)
      if (offline.length) {
        console.debug('falling back to bundled offline WEB verses')
        return offline
      }
      new Notice(`Error while querying ${fetchUrl}`)
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
