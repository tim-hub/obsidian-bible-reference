import { splitBibleReference, getReferenceHead } from './splitBibleReference'

describe('splitBibleReference complex', () => {
  test('should parse comma-separated verses', () => {
    const result = splitBibleReference('John 3:16,19')
    expect(result.bookName).toBe('John')
    expect(result.ranges).toHaveLength(2)
    expect(result.ranges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 16,
      verseNumberEnd: undefined,
    })
    expect(result.ranges[1]).toEqual({
      chapterNumber: 3,
      verseNumber: 19,
      verseNumberEnd: undefined,
    })
  })

  test('should parse semicolon-separated verses', () => {
    const result = splitBibleReference('John 3:16; 4:1')
    expect(result.bookName).toBe('John')
    expect(result.ranges).toHaveLength(2)
    expect(result.ranges[0].chapterNumber).toBe(3)
    expect(result.ranges[0].verseNumber).toBe(16)
    expect(result.ranges[1].chapterNumber).toBe(4)
    expect(result.ranges[1].verseNumber).toBe(1)
  })

  test('should parse "a" for all of chapter', () => {
    const result = splitBibleReference('John 3:a')
    expect(result.bookName).toBe('John')
    expect(result.ranges[0].chapterNumber).toBe(3)
    expect(result.ranges[0].verseNumber).toBe(1)
    expect(result.ranges[0].verseNumberEnd).toBe(36) // John 3 has 36 verses
  })

  test('should parse "a" for to end of chapter', () => {
    const result = splitBibleReference('John 3:16-a')
    expect(result.bookName).toBe('John')
    expect(result.ranges[0].chapterNumber).toBe(3)
    expect(result.ranges[0].verseNumber).toBe(16)
    expect(result.ranges[0].verseNumberEnd).toBe(36)
  })

  test('should parse explicit multi-chapter range', () => {
    const result = splitBibleReference('John 3:16-4:2')
    expect(result.bookName).toBe('John')
    expect(result.ranges).toHaveLength(1)
    expect(result.ranges[0]).toEqual({
      chapterNumber: 3,
      verseNumber: 16,
      chapterNumberEnd: 4,
      verseNumberEndChapter: 2,
    })
  })

  test('should parse multi-chapter range with "a"', () => {
    const result = splitBibleReference('John 3:16-4:a')
    expect(result.bookName).toBe('John')
    expect(result.ranges[0].chapterNumber).toBe(3)
    expect(result.ranges[0].verseNumber).toBe(16)
    expect(result.ranges[0].chapterNumberEnd).toBe(4)
    expect(result.ranges[0].verseNumberEndChapter).toBe(54) // John 4 has 54 verses
  })

  test('should handle hybrid space with complex segments', () => {
    const result = splitBibleReference('1 John1:1, 4')
    expect(result.bookName).toBe('1 John')
    expect(result.ranges).toHaveLength(2)
    expect(result.ranges[0].chapterNumber).toBe(1)
    expect(result.ranges[0].verseNumber).toBe(1)
    expect(result.ranges[1].chapterNumber).toBe(1)
    expect(result.ranges[1].verseNumber).toBe(4)
  })

  test('should carry over chapter from cross-chapter range to next segment', () => {
    const result = splitBibleReference('John 3:35-4:2, 5')
    expect(result.bookName).toBe('John')
    expect(result.ranges).toHaveLength(2)
    expect(result.ranges[0]).toMatchObject({
      chapterNumber: 3,
      verseNumber: 35,
      chapterNumberEnd: 4,
      verseNumberEndChapter: 2,
    })
    expect(result.ranges[1]).toMatchObject({
      chapterNumber: 4,
      verseNumber: 5,
    })
  })
})

describe('getReferenceHead', () => {
  test('should format multi-segment reference correctly', () => {
    const ref = splitBibleReference('John 3:16, 19:2, 8')
    expect(getReferenceHead(ref)).toBe('John 3:16, 19:2, 8')
  })

  test('should format cross-chapter reference correctly', () => {
    const ref = splitBibleReference('Hebrews 9:28-10:1')
    expect(getReferenceHead(ref)).toBe('Hebrews 9:28-10:1')
  })

  test('should format hybrid reference correctly', () => {
    const ref = splitBibleReference('John 3:35-4:2, 5')
    expect(getReferenceHead(ref)).toBe('John 3:35-4:2, 5')
  })
})
