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

test('splitBibleReference - validates backward chapter reference throws error', () => {
  expect(() => {
    splitBibleReference('Hebrews 10:1-9:14')
  }).toThrow(
    'Invalid cross-chapter reference: end chapter 9 must be greater than or equal to start chapter 10'
  )
})

test('splitBibleReference - same chapter in cross-chapter format converts to single chapter', () => {
  // John 3:1-3:16 should be treated as single chapter range
  expect(splitBibleReference('John 3:1-3:16')).toEqual({
    bookName: 'John',
    chapterNumber: 3,
    verseNumber: 1,
    verseNumberEnd: 16,
  })
})

test('splitBibleReference - no space single word book', () => {
  expect(splitBibleReference('john1:1')).toEqual({
    bookName: 'john',
    chapterNumber: 1,
    verseNumber: 1,
    verseNumberEnd: undefined,
  })
})

test('splitBibleReference - no space numbered book', () => {
  expect(splitBibleReference('1John1:1')).toEqual({
    bookName: '1John',
    chapterNumber: 1,
    verseNumber: 1,
    verseNumberEnd: undefined,
  })
})

test('splitBibleReference - no space verse range', () => {
  expect(splitBibleReference('john1:1-5')).toEqual({
    bookName: 'john',
    chapterNumber: 1,
    verseNumber: 1,
    verseNumberEnd: 5,
  })
})

test('splitBibleReference - hybrid space pattern (space after number, no space before chapter)', () => {
  expect(splitBibleReference('1 John1:1')).toEqual({
    bookName: '1 John',
    chapterNumber: 1,
    verseNumber: 1,
    verseNumberEnd: undefined,
  })
})
