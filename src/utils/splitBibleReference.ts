/**
 * Reference to a verse or a range of verse in the Bible
 */
export type VerseReference = {
  bookName: string
  chapterNumber: number
  verseNumber: number
  verseNumberEnd?: number
  chapterNumberEnd?: number // For cross-chapter references
  verseNumberEndChapter?: number // End verse in the end chapter
}

/**
 * Represents a single chapter query segment for API calls
 */
export type ChapterQuerySegment = {
  bookName: string
  chapterNumber: number
  verseStart: number
  verseEnd?: number // undefined means "to end of chapter"
}

/**
 * Split Bible Reference to book name, chapter number, and verse number, for example:
 * 1 Corinthians 1:27 => { bookName: '1 Corinthians', chapterNumber: 1, verseNumber: 27 }
 * 1 Corinthians 1:27-28 => { bookName: '1 Corinthians', chapterNumber: 1, verseNumber: 27, verseNumberEnd: 28 }
 * Hebrews 9:1-10:14 => { bookName: 'Hebrews', chapterNumber: 9, verseNumber: 1, chapterNumberEnd: 10, verseNumberEndChapter: 14 }
 *
 */
export const splitBibleReference = (reference: string): VerseReference => {
  // split from last space,
  const parts = reference.trim().split(' ')
  const length = parts.length

  // the first one or two parts are book name
  const bookName = parts.slice(0, length - 1).join(' ')
  const numbersPart = parts[length - 1]

  // Check for cross-chapter pattern: "9:1-10:14"
  const crossChapterMatch = numbersPart.match(/^(\d+):(\d+)-(\d+):(\d+)$/)

  if (crossChapterMatch) {
    const startChapter = parseInt(crossChapterMatch[1])
    const startVerse = parseInt(crossChapterMatch[2])
    const endChapter = parseInt(crossChapterMatch[3])
    const endVerse = parseInt(crossChapterMatch[4])

    // Validate that end chapter comes after start chapter
    if (endChapter < startChapter) {
      throw new Error(
        `Invalid cross-chapter reference: end chapter ${endChapter} must be greater than or equal to start chapter ${startChapter}`
      )
    }

    // If same chapter, treat as regular verse range instead
    if (endChapter === startChapter) {
      return {
        bookName,
        chapterNumber: startChapter,
        verseNumber: startVerse,
        verseNumberEnd: endVerse,
      }
    }

    return {
      bookName,
      chapterNumber: startChapter,
      verseNumber: startVerse,
      chapterNumberEnd: endChapter,
      verseNumberEndChapter: endVerse,
    }
  }

  // Same chapter logic
  const numbers = numbersPart.split(/[-:]+/)

  const chapterNumber = parseInt(numbers[0].trim())
  const verseNumber = parseInt(numbers[1])
  const verseEndNumber = numbers.length === 3 ? parseInt(numbers[2]) : undefined

  return {
    bookName,
    chapterNumber,
    verseNumber,
    verseNumberEnd: verseEndNumber,
  }
}

/**
 * Detect if a reference spans multiple chapters
 */
export const isCrossChapterReference = (ref: VerseReference): boolean => {
  return (
    ref.chapterNumberEnd !== undefined &&
    ref.chapterNumberEnd !== ref.chapterNumber
  )
}

/**
 * Split a cross-chapter reference into individual chapter query segments
 * Example: Hebrews 9:1-12:14 produces:
 * - Hebrews 9:1-end
 * - Hebrews 10 (full)
 * - Hebrews 11 (full)
 * - Hebrews 12:1-14
 */
export const splitIntoChapterSegments = (
  ref: VerseReference
): ChapterQuerySegment[] => {
  if (!isCrossChapterReference(ref)) {
    return [
      {
        bookName: ref.bookName,
        chapterNumber: ref.chapterNumber,
        verseStart: ref.verseNumber,
        verseEnd: ref.verseNumberEnd,
      },
    ]
  }

  const segments: ChapterQuerySegment[] = []

  // First chapter: from verseNumber to end of chapter
  segments.push({
    bookName: ref.bookName,
    chapterNumber: ref.chapterNumber,
    verseStart: ref.verseNumber,
    verseEnd: undefined, // To end of chapter
  })

  // Middle chapters (full chapters)
  for (let ch = ref.chapterNumber + 1; ch < ref.chapterNumberEnd!; ch++) {
    segments.push({
      bookName: ref.bookName,
      chapterNumber: ch,
      verseStart: 1,
      verseEnd: undefined, // Full chapter
    })
  }

  // Last chapter: from verse 1 to verseNumberEndChapter
  segments.push({
    bookName: ref.bookName,
    chapterNumber: ref.chapterNumberEnd!,
    verseStart: 1,
    verseEnd: ref.verseNumberEndChapter,
  })

  return segments
}
