import { bookNameForId } from '../utils/bookNameReference'
import { VerseSource } from './verseSource'

type BollsLifeVerse = {
  text: string
  chapter: number
  book: string
  verse: number
}

const chapterUrl: VerseSource['requestUrl'] = (version, query) =>
  `${version.apiSource.apiUrl}/${version.key.toUpperCase()}/${query.bookId}/${query.chapter}/`

export const bollsLifeSource: VerseSource = {
  readsWholeChapter: true,
  requestUrl: chapterUrl,
  sourceUrl: (version, query) =>
    chapterUrl(version, query).replace('/get-text', ''),
  parse: (data, _version, query) =>
    (data as BollsLifeVerse[] | undefined)
      ?.filter(
        (verse) =>
          verse.verse >= query.verses[0] &&
          verse.verse <= query.verses[query.verses.length - 1]
      )
      .map((verse) => ({
        text: verse.text,
        chapter: verse.chapter ?? query.chapter,
        book_id: verse.book,
        book_name: bookNameForId(query.bookId, 'en'),
        verse: verse.verse,
      })) ?? [],
}
