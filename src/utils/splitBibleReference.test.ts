import {
  splitBibleReference,
  isCrossChapterReference,
  splitIntoChapterSegments,
} from './splitBibleReference'

test('splitBibleReference - single verse', () => {
  expect(splitBibleReference('1 Corinthians 1:27')).toMatchObject({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseNumberEnd: undefined,
    ranges: [{ chapterNumber: 1, verseNumber: 27, verseNumberEnd: undefined }],
  })
})

test('splitBibleReference - same chapter range', () => {
  expect(splitBibleReference('1 Corinthians 1:27-28')).toMatchObject({
    bookName: '1 Corinthians',
    chapterNumber: 1,
    verseNumber: 27,
    verseNumberEnd: 28,
    ranges: [{ chapterNumber: 1, verseNumber: 27, verseNumberEnd: 28 }],
  })
})

test('splitBibleReference - cross-chapter reference', () => {
  expect(splitBibleReference('Hebrews 9:1-10:14')).toMatchObject({
    bookName: 'Hebrews',
    chapterNumber: 9,
    verseNumber: 1,
    chapterNumberEnd: 10,
    verseNumberEndChapter: 14,
    ranges: [
      {
        chapterNumber: 9,
        verseNumber: 1,
        chapterNumberEnd: 10,
        verseNumberEndChapter: 14,
      },
    ],
  })
})

test('splitBibleReference - cross-chapter with numbered book', () => {
  expect(splitBibleReference('1 Corinthians 15:50-16:4')).toMatchObject({
    bookName: '1 Corinthians',
    chapterNumber: 15,
    verseNumber: 50,
    chapterNumberEnd: 16,
    verseNumberEndChapter: 4,
    ranges: [
      {
        chapterNumber: 15,
        verseNumber: 50,
        chapterNumberEnd: 16,
        verseNumberEndChapter: 4,
      },
    ],
  })
})

test('isCrossChapterReference - returns true for cross-chapter', () => {
  const ref = {
    bookName: 'Hebrews',
    chapterNumber: 9,
    verseNumber: 1,
    chapterNumberEnd: 10,
    verseNumberEndChapter: 14,
    ranges: [],
  }
  expect(isCrossChapterReference(ref)).toBe(true)
})

test('isCrossChapterReference - returns false for same-chapter', () => {
  const ref = {
    bookName: 'John',
    chapterNumber: 3,
    verseNumber: 16,
    verseNumberEnd: 17,
    ranges: [],
  }
  expect(isCrossChapterReference(ref)).toBe(false)
})

test('splitIntoChapterSegments - same chapter returns single segment', () => {
  const ref = {
    bookName: 'John',
    chapterNumber: 3,
    verseNumber: 16,
    verseNumberEnd: 21,
    ranges: [],
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
    ranges: [],
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
    ranges: [],
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
  // We need to implement the validation in the new loop
  expect(() => {
    splitBibleReference('Hebrews 10:1-9:14')
  }).toThrow()
})

test('splitBibleReference - same chapter in cross-chapter format converts to single chapter', () => {
  // John 3:1-3:16 should be treated as single chapter range
  expect(splitBibleReference('John 3:1-3:16')).toMatchObject({
    bookName: 'John',
    chapterNumber: 3,
    verseNumber: 1,
    verseNumberEnd: 16,
  })
})

test('splitBibleReference - no space single word book', () => {
  expect(splitBibleReference('john1:1')).toMatchObject({
    bookName: 'john',
    chapterNumber: 1,
    verseNumber: 1,
    verseNumberEnd: undefined,
  })
})

test('splitBibleReference - no space numbered book', () => {
  expect(splitBibleReference('1John1:1')).toMatchObject({
    bookName: '1John',
    chapterNumber: 1,
    verseNumber: 1,
    verseNumberEnd: undefined,
  })
})

test('splitBibleReference - no space verse range', () => {
  expect(splitBibleReference('john1:1-5')).toMatchObject({
    bookName: 'john',
    chapterNumber: 1,
    verseNumber: 1,
    verseNumberEnd: 5,
  })
})

test('splitBibleReference - hybrid space pattern (space after number, no space before chapter)', () => {
  expect(splitBibleReference('1 John1:1')).toMatchObject({
    bookName: '1 John',
    chapterNumber: 1,
    verseNumber: 1,
    verseNumberEnd: undefined,
  })
})

test('splitBibleReference - throws error for invalid chapter number', () => {
  expect(() => splitBibleReference('John abc:16')).toThrow(
    'Invalid chapter number'
  )
})

test('splitBibleReference - throws error for invalid verse number', () => {
  expect(() => splitBibleReference('John 3:abc')).toThrow(
    'Invalid verse number'
  )
})

test('splitBibleReference - throws error for invalid start verse in range', () => {
  expect(() => splitBibleReference('John 3:abc-17')).toThrow(
    'Invalid start verse'
  )
})

test('splitBibleReference - throws error for invalid end verse in range', () => {
  expect(() => splitBibleReference('John 3:16-abc')).toThrow(
    'Invalid end verse'
  )
})

test('splitBibleReference - throws error for invalid end chapter in cross-chapter range', () => {
  expect(() => splitBibleReference('John 3:16-abc:2')).toThrow(
    'Invalid end chapter number'
  )
})

test('splitBibleReference - throws error for start verse > end verse', () => {
  expect(() => splitBibleReference('John 3:19-16')).toThrow('Invalid range')
})

test('splitBibleReference - throws error for "a" at start of range', () => {
  expect(() => splitBibleReference('John 3:a-16')).toThrow('Invalid range')
})

test('splitBibleReference - throws error for start verse > end verse in cross-chapter format', () => {
  expect(() => splitBibleReference('John 3:16-3:5')).toThrow('Invalid range')
})

test('splitBibleReference - throws error for non-existent chapter', () => {
  expect(() => splitBibleReference('John 99:1')).toThrow(
    'Invalid chapter number'
  )
})

test('splitBibleReference - throws error for non-existent end chapter', () => {
  expect(() => splitBibleReference('John 3:16-99:1')).toThrow(
    'Invalid end chapter number'
  )
})

test('splitBibleReference - throws error for non-existent start verse', () => {
  expect(() => splitBibleReference('John 3:500')).toThrow(
    'Invalid verse number'
  )
})

test('splitBibleReference - throws error for non-existent start verse in range', () => {
  expect(() => splitBibleReference('John 3:500-501')).toThrow(
    'Invalid start verse'
  )
})

test('splitBibleReference - throws error for non-existent end verse in same chapter', () => {
  expect(() => splitBibleReference('John 3:16-500')).toThrow(
    'Invalid end verse'
  )
})

test('splitBibleReference - throws error when "a" indicator cannot be resolved due to missing metadata', () => {
  expect(() => splitBibleReference('NonExistentBook 1:a')).toThrow(
    'Could not resolve "a" indicator'
  )
})

test('splitBibleReference - throws error for malformed range with multiple dashes', () => {
  expect(() => splitBibleReference('John 3:1-2-3')).toThrow(
    'Invalid verse range'
  )
})

test('splitBibleReference - throws error for empty range start', () => {
  expect(() => splitBibleReference('John 3:-4')).toThrow('Invalid verse range')
})

test('splitBibleReference - throws error for empty range end', () => {
  expect(() => splitBibleReference('John 3:1-')).toThrow('Invalid verse range')
})

test('splitBibleReference - throws error for malformed cross-chapter end with multiple colons', () => {
  expect(() => splitBibleReference('John 3:16-4:2:8')).toThrow(
    'Invalid cross-chapter verse range'
  )
})

test('splitBibleReference - throws error for empty cross-chapter chapter', () => {
  expect(() => splitBibleReference('John 3:16-:2')).toThrow(
    'Invalid cross-chapter verse range'
  )
})

test('splitBibleReference - throws error for empty cross-chapter verse', () => {
  expect(() => splitBibleReference('John 3:16-4:')).toThrow(
    'Invalid cross-chapter verse range'
  )
})
