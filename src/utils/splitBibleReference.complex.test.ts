import { splitBibleReference } from './splitBibleReference'
import { getVerseCount } from '../data/BibleVerseData'

describe('splitBibleReference complex queries', () => {
  test('should handle single verse', () => {
    const result = splitBibleReference('John 3:16')
    expect(result.bookName).toBe('John')
    expect(result.chapterVerseRanges).toHaveLength(1)
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 16,
    })
  })

  test('should handle query without space', () => {
    const result = splitBibleReference('John3:16')
    expect(result.bookName).toBe('John')
    expect(result.chapterVerseRanges).toHaveLength(1)
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 16,
    })
  })

  test('should handle range', () => {
    const result = splitBibleReference('John 3:16-17')
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 16,
      verseEndNumber: 17,
    })
  })

  test('should handle comma separated verses', () => {
    const result = splitBibleReference('John 3:16,19')
    expect(result.chapterVerseRanges).toHaveLength(2)
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 16,
    })
    expect(result.chapterVerseRanges[1]).toEqual({
      chapterNumber: 3,
      verseNumber: 19,
    })
  })

  test('should handle "a" for end of chapter', () => {
    const result = splitBibleReference('John 3:5-a')
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 5,
      verseEndNumber: 36, // John 3 has 36 verses
    })
  })

  test('should handle "a" for full chapter', () => {
    const result = splitBibleReference('John 3:a')
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 1,
      verseEndNumber: 36,
    })
  })

  test('should handle multi-chapter range', () => {
    const result = splitBibleReference('John 3:36-4:2')
    expect(result.chapterVerseRanges).toHaveLength(2)
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 36,
      verseEndNumber: 36,
    })
    expect(result.chapterVerseRanges[1]).toEqual({
      chapterNumber: 4,
      verseNumber: 1,
      verseEndNumber: 2,
    })
  })

  test('should handle multi-chapter range with intermediate chapters', () => {
    const result = splitBibleReference('John 3:36-5:2')
    expect(result.chapterVerseRanges).toHaveLength(3)
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 36,
      verseEndNumber: 36,
    })
    expect(result.chapterVerseRanges[1]).toEqual({
      chapterNumber: 4,
      verseNumber: 1,
      verseEndNumber: 54, // John 4 has 54 verses
    })
    expect(result.chapterVerseRanges[2]).toEqual({
      chapterNumber: 5,
      verseNumber: 1,
      verseEndNumber: 2,
    })
  })

  test('should handle John 3:5-7,10', () => {
    const result = splitBibleReference('John 3:5-7,10')
    expect(result.chapterVerseRanges).toHaveLength(2)
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 5,
      verseEndNumber: 7,
    })
    expect(result.chapterVerseRanges[1]).toEqual({
      chapterNumber: 3,
      verseNumber: 10,
    })
  })

  test('should handle John 3:a-4:1', () => {
    const result = splitBibleReference('John 3:a-4:1')
    // John 3:1 to end, then John 4:1
    expect(result.chapterVerseRanges).toHaveLength(2)
    expect(result.chapterVerseRanges[0].chapterNumber).toBe(3)
    expect(result.chapterVerseRanges[0].verseNumber).toBe(1)
    expect(result.chapterVerseRanges[0].verseEndNumber).toBe(
      getVerseCount('John', 3)
    )
    expect(result.chapterVerseRanges[1].chapterNumber).toBe(4)
    expect(result.chapterVerseRanges[1].verseNumber).toBe(1)
  })

  test('should handle John 3:32-4:a', () => {
    const result = splitBibleReference('John 3:32-4:a')
    // John 3:32 to end, then John 4:1 to end
    expect(result.chapterVerseRanges).toHaveLength(2)
    expect(result.chapterVerseRanges[0].chapterNumber).toBe(3)
    expect(result.chapterVerseRanges[0].verseNumber).toBe(32)
    expect(result.chapterVerseRanges[0].verseEndNumber).toBe(
      getVerseCount('John', 3)
    )
    expect(result.chapterVerseRanges[1].chapterNumber).toBe(4)
    expect(result.chapterVerseRanges[1].verseNumber).toBe(1)
    expect(result.chapterVerseRanges[1].verseEndNumber).toBe(
      getVerseCount('John', 4)
    )
  })

  test('should handle john3:a-4:1 (no space)', () => {
    const result = splitBibleReference('john3:a-4:1')
    expect(result.bookName).toBe('john')
    expect(result.chapterVerseRanges[0].chapterNumber).toBe(3)
    expect(result.chapterVerseRanges[0].verseNumber).toBe(1)
  })

  test('should handle John 3:32-4a', () => {
    const result = splitBibleReference('John 3:32-4a')
    expect(result.chapterVerseRanges).toHaveLength(2)
    expect(result.chapterVerseRanges[0].chapterNumber).toBe(3)
    expect(result.chapterVerseRanges[0].verseNumber).toBe(32)
    expect(result.chapterVerseRanges[1].chapterNumber).toBe(4)
    expect(result.chapterVerseRanges[1].verseNumber).toBe(1)
    expect(result.chapterVerseRanges[1].verseEndNumber).toBe(
      getVerseCount('John', 4)
    )
  })

  test('should handle complex combination', () => {
    const result = splitBibleReference('John 3:16-17,19,4:1-2,7')
    // 3:16-17
    // 3:19
    // 4:1-2
    // 4:7
    expect(result.chapterVerseRanges).toHaveLength(4)
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 16,
      verseEndNumber: 17,
    })
    expect(result.chapterVerseRanges[1]).toEqual({
      chapterNumber: 3,
      verseNumber: 19,
    })
    expect(result.chapterVerseRanges[2]).toEqual({
      chapterNumber: 4,
      verseNumber: 1,
      verseEndNumber: 2,
    })
    expect(result.chapterVerseRanges[3]).toEqual({
      chapterNumber: 4,
      verseNumber: 7,
    })
  })

  test('should handle numbered book without space', () => {
    const result = splitBibleReference('1John3:16')
    expect(result.bookName).toBe('1John')
    expect(result.chapterVerseRanges).toHaveLength(1)
    expect(result.chapterVerseRanges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 16,
    })
  })
})
