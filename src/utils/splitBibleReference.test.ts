import {
  splitBibleReference,
  isCrossChapterReference,
  splitIntoChapterSegments,
} from './splitBibleReference'

test('splitBibleReference - single verse', () => {
  expect(splitBibleReference('1 Corinthians 1:27')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseNumberEnd: undefined,
  })
})

test('splitBibleReference - same chapter range', () => {
  expect(splitBibleReference('1 Corinthians 1:27-28')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseNumberEnd: 28,
  })
})

test('splitBibleReference - cross-chapter reference', () => {
  expect(splitBibleReference('Hebrews 9:1-10:14')).toEqual({
    bookName: 'Hebrews',
    chapterNumber: 9,
    verseNumber: 1,
    chapterNumberEnd: 10,
    verseNumberEndChapter: 14,
  })
})

test('splitBibleReference - cross-chapter with numbered book', () => {
  expect(splitBibleReference('1 Corinthians 15:50-16:4')).toEqual({
    bookName: '1 Corinthians',
    chapterNumber: 15,
    verseNumber: 50,
    chapterNumberEnd: 16,
    verseNumberEndChapter: 4,
  })
})

test('isCrossChapterReference - returns true for cross-chapter', () => {
  const ref = {
    bookName: 'Hebrews',
    chapterNumber: 9,
    verseNumber: 1,
    chapterNumberEnd: 10,
    verseNumberEndChapter: 14,
  }
  expect(isCrossChapterReference(ref)).toBe(true)
})

test('isCrossChapterReference - returns false for same-chapter', () => {
  const ref = {
    bookName: 'John',
    chapterNumber: 3,
    verseNumber: 16,
    verseNumberEnd: 17,
  }
  expect(isCrossChapterReference(ref)).toBe(false)
})

test('splitIntoChapterSegments - same chapter returns single segment', () => {
  const ref = {
    bookName: 'John',
    chapterNumber: 3,
    verseNumber: 16,
    verseNumberEnd: 21,
  }
  expect(splitIntoChapterSegments(ref)).toEqual([
    {
      bookName: 'John',
      chapterNumber: 3,
      verseStart: 16,
      verseEnd: 21,
    },
  ])
})

test('splitIntoChapterSegments - two consecutive chapters', () => {
  const ref = {
    bookName: 'Hebrews',
    chapterNumber: 9,
    verseNumber: 1,
    chapterNumberEnd: 10,
    verseNumberEndChapter: 14,
  }
  expect(splitIntoChapterSegments(ref)).toEqual([
    {
      bookName: 'Hebrews',
      chapterNumber: 9,
      verseStart: 1,
      verseEnd: undefined, // to end of chapter
    },
    {
      bookName: 'Hebrews',
      chapterNumber: 10,
      verseStart: 1,
      verseEnd: 14,
    },
  ])
})

test('splitIntoChapterSegments - multiple chapters', () => {
  const ref = {
    bookName: 'Hebrews',
    chapterNumber: 9,
    verseNumber: 1,
    chapterNumberEnd: 12,
    verseNumberEndChapter: 14,
  }
  expect(splitIntoChapterSegments(ref)).toEqual([
    {
      bookName: 'Hebrews',
      chapterNumber: 9,
      verseStart: 1,
      verseEnd: undefined, // to end of chapter
    },
    {
      bookName: 'Hebrews',
      chapterNumber: 10,
      verseStart: 1,
      verseEnd: undefined, // full chapter
    },
    {
      bookName: 'Hebrews',
      chapterNumber: 11,
      verseStart: 1,
      verseEnd: undefined, // full chapter
    },
    {
      bookName: 'Hebrews',
      chapterNumber: 12,
      verseStart: 1,
      verseEnd: 14,
    },
  ])
})
