import { splitBibleReference } from './splitBibleReference'

test('splitBibleReference', () => {
  expect(splitBibleReference('1 Corinthians 1:27')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseEndNumber: undefined,
  })

  expect(splitBibleReference('1 Corinthians 1:27-28')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseEndNumber: 28,
  })

  expect(splitBibleReference('1 Corinthians 1:27-28')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseEndNumber: 28,
  })

  expect(splitBibleReference('1 Corinthians 1:27-28')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseEndNumber: 28,
  })

  expect(splitBibleReference('1 Corinthians 1:27-28')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseEndNumber: 28,
  })

  expect(splitBibleReference('1 Corinthians 1:27-28')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseEndNumber: 28,
  })

  expect(splitBibleReference('1 Corinthians 1:27-28')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseEndNumber: 28,
  })

  expect(splitBibleReference('1 Corinthians 1:27-28')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseEndNumber: 28,
  })

  expect(splitBibleReference('1 Corinthians 1:27-28')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseEndNumber: 28,
  })
})
