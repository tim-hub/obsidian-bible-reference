import { splitBibleReference } from './splitBibleReference'

test('splitBibleReference', () => {
  expect(splitBibleReference('1 Corinthians 1:27')).toEqual({
    bookName: '1 Corinthians',
    chapterVerseRanges: [
      {
        chapterNumber: 1,
        verseNumber: 27,
      },
    ],
  })

  expect(splitBibleReference('1 Corinthians 1:27-28')).toEqual({
    bookName: '1 Corinthians',
    chapterVerseRanges: [
      {
        chapterNumber: 1,
        verseNumber: 27,
        verseEndNumber: 28,
      },
    ],
  })
})
