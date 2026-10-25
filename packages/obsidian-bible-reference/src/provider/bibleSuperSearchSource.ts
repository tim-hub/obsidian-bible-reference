import { IBibleVersion } from '../interfaces/IBibleVersion'
import { bookNameForId } from '../utils/bookNameReference'
import { VerseSource, versesQueryString } from './verseSource'

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

const moduleKey = (version: IBibleVersion): string => {
  const normalized = version.key.toLowerCase()
  return BIBLE_SUPER_SEARCH_MODULES[normalized] || normalized
}

const requestUrl: VerseSource['requestUrl'] = (version, query) => {
  const searchParams = new URLSearchParams({
    bible: moduleKey(version),
    reference: `${bookNameForId(query.bookId, 'en')} ${query.chapter}:${versesQueryString(query.verses)}`,
    data_format: 'minimal',
  })
  return `${version.apiSource.apiUrl}/api?${searchParams.toString()}`
}

export const bibleSuperSearchSource: VerseSource = {
  readsWholeChapter: false,
  requestUrl,
  sourceUrl: requestUrl,
  parse: (data, version, query) =>
    (
      (data as BibleSuperSearchResponse)?.results?.[moduleKey(version)] || []
    ).map((row) => ({
      text: row.text,
      chapter: Number(row.chapter) || query.chapter,
      book_id: String(row.book),
      book_name: bookNameForId(query.bookId, 'en'),
      verse: Number(row.verse),
    })),
}
