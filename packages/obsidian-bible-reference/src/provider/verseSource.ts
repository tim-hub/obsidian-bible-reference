import { IBibleVersion } from '../interfaces/IBibleVersion'
import { IVerse } from '../interfaces/IVerse'

export type PassageQuery = {
  bookId: number
  chapter: number
  verses: number[]
}

export interface VerseSource {
  readsWholeChapter: boolean
  requestUrl(version: IBibleVersion, query: PassageQuery): string
  sourceUrl(version: IBibleVersion, query: PassageQuery): string
  parse(data: unknown, version: IBibleVersion, query: PassageQuery): IVerse[]
}

export const versesQueryString = (verses: number[]): string => {
  if (verses?.length >= 3) {
    return verses.join('&')
  } else if (verses?.length === 2 && !!verses[1]) {
    return `${verses[0]}-${verses[1]}`
  } else {
    return `${verses[0]}`
  }
}
