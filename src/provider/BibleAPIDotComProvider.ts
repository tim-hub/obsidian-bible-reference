import { IVerse } from '../interfaces/IVerse'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BibleProvider } from './BibleProvider'

export class BibleAPIDotComProvider extends BibleProvider {
  public constructor(bibleVersion: IBibleVersion) {
    super()
    const { key } = bibleVersion
    this._key = key
    this._apiUrl = bibleVersion.apiSource.apiUrl
  }

  /**
   * Build Request Url for Bible-Api.com
   * @param bookName
   * @param chapter
   * @param verses
   * @param versionName
   */
  public buildRequestURL(
    bookName: string,
    chapter: number,
    verses: number[],
    versionName?: string
  ): string {
    let queryString = `${bookName}+${chapter}:`
    if (verses?.length >= 3) {
      queryString += verses.join('&')
    } else if (verses?.length === 2 && !!verses[1]) {
      queryString += `${verses[0]}-${verses[1]}`
    } else {
      queryString += `${verses[0]}`
    }
    this._queryUrl = `${this._apiUrl}/${queryString}?translation=${
      versionName
        ? versionName
        : this?.BibleVersionKey
        ? this.BibleVersionKey
        : ''
    }`
    return this._queryUrl
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
    this._bibleReferenceHead = data.reference
    return data.verses
  }
}
