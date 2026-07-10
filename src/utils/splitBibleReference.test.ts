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

test('splitBibleReference - validates common Spanish book aliases', () => {
  expect(splitBibleReference('Hechos 1:1')).toMatchObject({
    bookName: 'Hechos',
    chapterNumber: 1,
    verseNumber: 1,
  })
  expect(splitBibleReference('Zacarías 1:1')).toMatchObject({
    bookName: 'Zacarías',
    chapterNumber: 1,
    verseNumber: 1,
  })
  expect(splitBibleReference('Zacarias 1:1')).toMatchObject({
    bookName: 'Zacarias',
    chapterNumber: 1,
    verseNumber: 1,
  })
  expect(splitBibleReference('Cantar de los Cantares 1:1')).toMatchObject({
    bookName: 'Cantar de los Cantares',
    chapterNumber: 1,
    verseNumber: 1,
  })
  expect(splitBibleReference('1 Cronicas 1:1')).toMatchObject({
    bookName: '1 Cronicas',
    chapterNumber: 1,
    verseNumber: 1,
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

describe('splitBibleReference - multi-word book abbreviations', () => {
  // The book name is normalized for metadata lookups, so abbreviations are
  // validated like full names. Over-range references are blocked everywhere.
  // (1 Corinthians 2 = 16 verses, Romans 9 = 33 verses, 16 chapters,
  // 2 Timothy 1 = 18 verses, 4 chapters)

  test('blocks over-range end verse for an abbreviation', () => {
    expect(() => splitBibleReference('1 cor 2:1-18')).toThrow(
      'Invalid end verse'
    )
  })

  test('blocks over-range end verse for an abbreviation', () => {
    expect(() => splitBibleReference('rom 9:30-40')).toThrow(
      'Invalid end verse'
    )
  })

  test('blocks over-range end verse for an abbreviation (2 Timothy)', () => {
    expect(() => splitBibleReference('2 tim 1:1-50')).toThrow(
      'Invalid end verse'
    )
  })

  test('blocks over-range single verse for an abbreviation', () => {
    expect(() => splitBibleReference('2 tim 1:50')).toThrow(
      'Invalid verse number'
    )
  })

  test('blocks over-range chapter for an abbreviation', () => {
    expect(() => splitBibleReference('1 cor 99:1')).toThrow(
      'Invalid chapter number'
    )
  })

  test('parses a valid in-range abbreviation and keeps the raw book name', () => {
    expect(splitBibleReference('1 cor 2:1-16')).toMatchObject({
      bookName: '1 cor',
      chapterNumber: 2,
      verseNumber: 1,
      verseNumberEnd: 16,
    })
  })

  // Regression guards: full names and one-word books already blocked over-range.
  test('still blocks over-range for the full multi-word name', () => {
    expect(() => splitBibleReference('1 corinthians 2:1-18')).toThrow(
      'Invalid end verse'
    )
  })

  test('still blocks over-range for a one-word book', () => {
    expect(() => splitBibleReference('John 3:16-99')).toThrow(
      'Invalid end verse'
    )
  })
})
