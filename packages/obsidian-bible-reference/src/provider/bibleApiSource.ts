import { IVerse } from '../interfaces/IVerse'
import { bookNameForId } from '../utils/bookNameReference'
import { VerseSource, versesQueryString } from './verseSource'

const requestUrl: VerseSource['requestUrl'] = (version, query) =>
  `${version.apiSource.apiUrl}/${bookNameForId(query.bookId, 'en')}+${query.chapter}:${versesQueryString(query.verses)}?translation=${version.key}`

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
