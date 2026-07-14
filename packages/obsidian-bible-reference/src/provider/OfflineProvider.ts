import { IVerse } from '../interfaces/IVerse'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BaseBibleAPIProvider } from './BaseBibleAPIProvider'
import { offlineLookup } from './offlineBible'

/**
 * Serves the bundled World English Bible from memory — no network at all.
 * The reference link points at bible-api.com's WEB page for click-through.
 */
export class OfflineProvider extends BaseBibleAPIProvider {
  public constructor(bibleVersion: IBibleVersion) {
    super(bibleVersion)
  }

  public async query(
    bookName: string,
    chapter: number,
    verse: number[]
  ): Promise<IVerse[]> {
    this.buildRequestURL(bookName, chapter, verse)
    this.updateOriginalReferenceUrl()
    this._bibleReferenceHead = `${bookName} ${chapter}:${verse.join('-')}`
    return offlineLookup(bookName, chapter, verse)
  }

  public buildRequestURL(
    bookName: string,
    chapter: number,
    verses: number[]
  ): string {
    const queryString = `${bookName}+${chapter}:${this.convertVersesToQueryString(verses)}`
    this._currentQueryUrl = `https://bible-api.com/${queryString}?translation=web`
    return this._currentQueryUrl
  }

  protected formatBibleVerses(
    _data: { reference: string; verses: IVerse[] },
    _bookName: string,
    _chapter: number,
    _verse: number[]
  ): IVerse[] {
    return []
  }
}
