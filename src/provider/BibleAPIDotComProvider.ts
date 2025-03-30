import { IVerse } from '../interfaces/IVerse'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BaseBibleAPIProvider } from './BaseBibleAPIProvider'

export class BibleAPIDotComProvider extends BaseBibleAPIProvider {
  public constructor(bibleVersion: IBibleVersion) {
    super(bibleVersion)
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
    queryString += this.convertVersesToQueryString(verses)
    this._currentQueryUrl = `${this._apiUrl}/${queryString}?translation=${
      versionName
        ? versionName
        : this?.BibleVersionKey
        ? this.BibleVersionKey
        : ''
    }`

    // setup the bible gateway url
    this.bibleGatewayUrl = this.buildBibleGatewayUrl(
      bookName,
      chapter,
      verses
    ).replace(/ /g, '+') // Remove spaces in Book names for URL.
    return this._currentQueryUrl
  }

  protected prepareVerseLinkUrl(): string {
    if (
      this._versionKey in
        [
          'bbe',
          'clementine',
          'oeb-us',
          'oeb-cw',
          'almeida',
          'rccv',
          'cherokee',
        ] &&
      !this.bibleGatewayUrl
    ) {
      return this._currentQueryUrl
    }
    if (this._versionKey === 'webbe') {
      //   replace bibleGatewayUrl webbe to web
      return this.bibleGatewayUrl.replace('webbe', 'web')
    }
    return this.bibleGatewayUrl
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
  protected formatBibleVerses(data: {
    reference: string
    verses: IVerse[]
  }): IVerse[] {
    this._bibleReferenceHead = data.reference
    return data.verses
  }
}
