import { IVerse } from '../interfaces/IVerse'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BaseBibleAPIProvider } from './BaseBibleAPIProvider'

type BibleSuperSearchVerse = {
  id: number | string
  book: number | string
  chapter: number | string
  verse: number | string
  text: string
}

type BibleSuperSearchResponse = {
  errors?: string[]
  error_level?: number
  results?: Record<string, BibleSuperSearchVerse[]>
}

const BIBLE_SUPER_SEARCH_MODULES: Record<string, string> = {
  bg: 'polbg',
  ubg: 'pol_ubg',
}

export class BibleSuperSearchProvider extends BaseBibleAPIProvider {
  public constructor(bibleVersion: IBibleVersion) {
    super(bibleVersion)
  }

  private getModuleKey(versionName?: string): string {
    const inputKey = versionName || this.BibleVersionKey
    const normalized = inputKey.toLowerCase()
    return BIBLE_SUPER_SEARCH_MODULES[normalized] || normalized
  }

  public buildRequestURL(
    bookName: string,
    chapter: number,
    verses: number[] = [],
    versionName?: string
  ): string {
    const moduleKey = this.getModuleKey(versionName)
    const verseQuery = this.convertVersesToQueryString(verses)
    const reference = `${bookName} ${chapter}:${verseQuery}`
    const searchParams = new URLSearchParams({
      bible: moduleKey,
      reference,
      data_format: 'minimal',
    })

    this._currentQueryUrl = `${this._apiUrl}/api?${searchParams.toString()}`
    return this._currentQueryUrl
  }

  protected formatBibleVerses(
    data:
      | {
          reference: string
          verses: IVerse[]
        }
      | Array<object>,
    bookName: string,
    chapter: number,
    verses: number[],
    versionName: string
  ): IVerse[] {
    this._bibleReferenceHead = `${bookName} ${chapter}:${this.convertVersesToQueryString(verses)}`
    const moduleKey = this.getModuleKey(versionName)
    const response = data as BibleSuperSearchResponse
    const rows = response?.results?.[moduleKey] || []

    return rows.map((row) => ({
      text: row.text,
      chapter: Number(row.chapter) || chapter,
      book_id: String(row.book),
      book_name: bookName,
      verse: Number(row.verse),
    }))
  }
}
