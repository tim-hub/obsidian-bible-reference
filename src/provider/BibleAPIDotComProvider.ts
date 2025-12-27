import { IVerse } from '../interfaces/IVerse'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BaseBibleAPIProvider } from './BaseBibleAPIProvider'

/**
 * import { allBibleVersionsWithLanguageNameAlphabetically } from '../data/BibleVersionCollection'
 * const translationKeysFromBibleAPIDotCom: string[] = allBibleVersionsWithLanguageNameAlphabetically.filter(
 *     (version) => version.apiSource.name === 'Bible API'
 *   ).map((version) => version.key)
 * ['cherokee', 'bbe', 'kjv', 'oeb-us', 'web', 'oeb-cw', 'webbe', 'clementine', 'almeida', 'rccv']
 */

// const bibleGatewaySupportedTranslations = [
//   'bbe',
//   'clementine',
//   'oeb-us',
//   'oeb-cw',
//   'almeida',
//   'rccv',
//   'cherokee',
// ]

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
    return this._currentQueryUrl
  }

  /**
   * todo reference need to switch trasnaltion key
   *     /**
   *      * BibleAPI.com is a pure API
   *      * We used the Bible Gateway URL for the verse reference link
   *
   *     if (this._versionKey === 'webbe') {
   *       //   replace bibleGatewayUrl webbe to web
   *       return this.bibleGatewayUrl.replace('webbe', 'web')
   *     }
   */
  public getOriginalVerseReferenceLink(): string {
    return super.getOriginalVerseReferenceLink()
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
    data: {
      reference: string
      verses: IVerse[]
    },
    bookName: string,
    chapter: number,
    verse: number[],
    versionName: string
  ): IVerse[] {
    this._bibleReferenceHead = data.reference
    return data.verses.map((v) => ({ ...v, chapter: v.chapter ?? chapter }))
  }
}
