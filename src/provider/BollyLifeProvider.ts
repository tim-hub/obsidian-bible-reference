import { IVerse } from '../interfaces/IVerse'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BaseBibleAPIProvider } from './BaseBibleAPIProvider'
import { getBookOsis } from '../utils/bookNameReference'
import { BibleReferencePluginSettings } from '../data/constants'

export class BollyLifeProvider extends BaseBibleAPIProvider {
  //private _verseApiUrl: string; // we do not support get verse api yet, but the api supported it
  private _chapterApiUrl: string
  private settings: BibleReferencePluginSettings
  private bookOsis: string
  private chapter: number
  private verses: number[]

  public constructor(
    bibleVersion: IBibleVersion,
    settings: BibleReferencePluginSettings
  ) {
    super(bibleVersion)
    this.settings = settings
    //this._verseApiUrl = `${this._apiUrl}/get-paralel-verses/`;
    //this._chapterApiUrl = `${this._apiUrl}/get-chapter/`;
    this._chapterApiUrl = this._apiUrl
  }

  public get VerseLinkURL(): string {
    if (this.settings.useLogosBibleUri) {
      const chapter = this.chapter
      const verses = this.verses.join('-')
      const bibleVersionKey = this.BibleVersionKey.toUpperCase()
      return `https://ref.ly/logosres/${this.BibleVersionKey}?ref=Bible${bibleVersionKey}.${this.bookOsis}${chapter}.${verses}`
    }
    return this.prepareVerseLinkUrl()
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
    this.bookOsis = getBookOsis(bookName)
    // bolls.life API uses the OSIS book name for its URL
    this._currentQueryUrl = `${baseUrl}/${versionName?.toUpperCase()}/${this.bookOsis}/${chapter}/`
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
    data: Array<object>,
    bookName: string,
    chapter: number,
    verses: number[],
    versionName: string
  ): IVerse[] {
    this._bibleReferenceHead = `${bookName} ${chapter}:${verses[0]}${
      verses[1] ? `-${verses[1]}` : ''
    }`
    this.chapter = chapter
    this.verses = verses

    return data
      ?.filter(
        (verse: { verse: number }) =>
          verse.verse >= verses[0] && verse.verse <= verses[verses.length - 1]
      )
      .map(
        (verse: {
          text: string
          chapter: number
          book: string
          verse: number
        }) =>
          ({
            text: verse.text,
            chapter: verse.chapter,
            book_id: verse.book,
            book_name: bookName,
            verse: verse.verse,
          }) as IVerse
      )
  }
}
