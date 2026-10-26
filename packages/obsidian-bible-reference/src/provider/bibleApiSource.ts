import { IVerse } from '../interfaces/IVerse'
import { bookNameForId } from '../utils/bookNameReference'
import { getVerseCount } from '../data/BibleVerseData'
import { PassageQuery, VerseSource, versesQueryString } from './verseSource'

const versesWithRealEnd = (query: PassageQuery): number[] =>
  query.verses[1] === 999
    ? [query.verses[0], getVerseCount(query.bookId, query.chapter)]
    : query.verses

const requestUrl: VerseSource['requestUrl'] = (version, query) =>
  `${version.apiSource.apiUrl}/${bookNameForId(query.bookId, 'en')}+${query.chapter}:${versesQueryString(versesWithRealEnd(query))}?translation=${version.key}`

export const bibleApiSource: VerseSource = {
  readsWholeChapter: false,
  requestUrl,
  sourceUrl: requestUrl,
  parse: (data, _version, query) =>
    (data as { verses: IVerse[] }).verses.map((verse) => ({
      ...verse,
      chapter: verse.chapter ?? query.chapter,
    })),
}
