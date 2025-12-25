import { BOOK_REG } from './regs'
import { getVerseCount } from '../data/BibleVerseData'

/**
 * Helper to safely parse integers and throw error on NaN
 */
const safeParseInt = (value: string, fieldName: string): number => {
  const result = parseInt(value)
  if (isNaN(result)) {
    throw new Error(`Invalid ${fieldName}: "${value}" is not a number`)
  }
  return result
}

/**
 * Reference to a verse range within or across chapters
 */
export type VerseRange = {
  chapterNumber: number
  verseNumber: number
  verseNumberEnd?: number
  chapterNumberEnd?: number // For cross-chapter references
  verseNumberEndChapter?: number // End verse in the end chapter
}

/**
 * Reference to a verse or multiple ranges of verses in the Bible
 */
export type VerseReference = {
  bookName: string
  chapterNumber: number // main chapter (from first range)
  verseNumber: number // first verse
  verseNumberEnd?: number
  chapterNumberEnd?: number
  verseNumberEndChapter?: number
  ranges: VerseRange[]
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
 * Split Bible Reference to book name and segments, for example:
 * John 3:16,19 => { bookName: 'John', ..., ranges: [{ch:3, v:16}, {ch:3, v:19}] }
 * John 3:16-a => { bookName: 'John', ..., ranges: [{ch:3, v:16, vEnd: last}] }
 * Hebrews 9:1-10:14 => { bookName: 'Hebrews', ..., ranges: [{ch:9, v:1, chEnd:10, vEndCh:14}] }
 */
export const splitBibleReference = (reference: string): VerseReference => {
  const trimmedRef = reference.trim()
  let bookName = ''
  let chapterVersePart = ''

  // Use BOOK_REG for robust book name extraction
  const bookMatch = trimmedRef.match(BOOK_REG)
  if (bookMatch) {
    bookName = bookMatch[0].trim()
    const index = bookMatch.index ?? 0
    chapterVersePart = trimmedRef.slice(index + bookMatch[0].length).trim()
    // In case of no space between book and chapter: john1:1
    if (chapterVersePart.startsWith(':')) {
      // This shouldn't happen with BOOK_REG and digits following, but safe check
    }
  } else {
    // Fallback to original logic if BOOK_REG fails (unlikely)
    const parts = trimmedRef.split(' ')
    const length = parts.length
    bookName = parts.slice(0, length - 1).join(' ')
    chapterVersePart = parts[length - 1]
  }

  const ranges: VerseRange[] = []
  // Split by comma or semicolon for multiple selections
  const segments = chapterVersePart.split(/[,;]/)
  let currentChapter = 1

  segments.forEach((segmentStr) => {
    const segment = segmentStr.trim()
    if (!segment) return

    // Parse chapter if present
    let versePart: string
    if (segment.includes(':')) {
      const parts = segment.split(':')
      currentChapter = safeParseInt(parts[0], 'chapter number')
      versePart = parts.slice(1).join(':')
    } else {
      // Check if the whole segment is a chapter (e.g. "John 3")
      // But usually "John 3" is handled as chapter 3, verse 1-all.
      // If we are in the context of segments like "3:16, 19", 19 is a verse.
      // If the FIRST segment has no colon, it's just a chapter.
      if (
        ranges.length === 0 &&
        !isNaN(parseInt(segment)) &&
        !segment.toLowerCase().includes('a')
      ) {
        currentChapter = safeParseInt(segment, 'chapter number')
        versePart = 'a' // Match entire chapter
      } else {
        versePart = segment
      }
    }

    // Parse versePart (could be "16", "16-17", "16-a", "16-4:2", "a")
    if (versePart.includes('-')) {
      const rangeParts = versePart.split('-')
      const startStr = rangeParts[0].trim().toLowerCase()
      const endStr = rangeParts[1].trim().toLowerCase()

      // Check for cross-chapter in the end part: "16-4:2"
      if (endStr.includes(':')) {
        const endChapterParts = endStr.split(':')
        const endChapterNum = safeParseInt(
          endChapterParts[0],
          'end chapter number'
        )
        const endVerseStr = endChapterParts[1]

        if (endChapterNum < currentChapter) {
          throw new Error(
            `Invalid cross-chapter reference: end chapter ${endChapterNum} must be greater than or equal to start chapter ${currentChapter}`
          )
        }

        const startVerse =
          startStr === 'a' ? 1 : safeParseInt(startStr, 'start verse')
        const endVerse =
          endVerseStr === 'a'
            ? getVerseCount(bookName, endChapterNum)
            : safeParseInt(endVerseStr, 'end verse')

        if (endChapterNum === currentChapter) {
          ranges.push({
            chapterNumber: currentChapter,
            verseNumber: startVerse,
            verseNumberEnd: endVerse,
          })
        } else {
          ranges.push({
            chapterNumber: currentChapter,
            verseNumber: startVerse,
            chapterNumberEnd: endChapterNum,
            verseNumberEndChapter: endVerse,
          })
          currentChapter = endChapterNum // Update context for next segments
        }
      } else {
        // Single chapter range: "16-17" or "16-a"
        const startVerse =
          startStr === 'a' ? 1 : safeParseInt(startStr, 'start verse')
        const endVerse =
          endStr === 'a'
            ? getVerseCount(bookName, currentChapter)
            : safeParseInt(endStr, 'end verse')

        ranges.push({
          chapterNumber: currentChapter,
          verseNumber: startVerse,
          verseNumberEnd: endVerse,
        })
      }
    } else {
      // Single verse or 'a'
      const v =
        versePart.toLowerCase() === 'a'
          ? 1
          : safeParseInt(versePart, 'verse number')
      const vEnd =
        versePart.toLowerCase() === 'a'
          ? getVerseCount(bookName, currentChapter)
          : undefined

      ranges.push({
        chapterNumber: currentChapter,
        verseNumber: v,
        verseNumberEnd: vEnd,
      })
    }
  })

  if (ranges.length === 0) {
    throw new Error('Could not parse any verse ranges')
  }

  const first = ranges[0]
  return {
    bookName,
    chapterNumber: first.chapterNumber,
    verseNumber: first.verseNumber,
    verseNumberEnd: first.verseNumberEnd,
    chapterNumberEnd: first.chapterNumberEnd,
    verseNumberEndChapter: first.verseNumberEndChapter,
    ranges,
  }
}

/**
 * Detect if a reference spans multiple chapters
 */
export const isCrossChapterReference = (
  ref: VerseReference | VerseRange
): boolean => {
  return (
    ref.chapterNumberEnd !== undefined &&
    ref.chapterNumberEnd !== ref.chapterNumber
  )
}

/**
 * Split a cross-chapter reference into individual chapter query segments
 */
export const splitIntoChapterSegments = (
  ref: VerseReference | VerseRange
): ChapterQuerySegment[] => {
  const bookName = (ref as VerseReference).bookName || ''
  if (!isCrossChapterReference(ref)) {
    return [
      {
        bookName: bookName,
        chapterNumber: ref.chapterNumber,
        verseStart: ref.verseNumber,
        verseEnd: ref.verseNumberEnd,
      },
    ]
  }

  const segments: ChapterQuerySegment[] = []

  // First chapter: from verseNumber to end of chapter
  segments.push({
    bookName: bookName,
    chapterNumber: ref.chapterNumber,
    verseStart: ref.verseNumber,
    verseEnd: undefined, // To end of chapter
  })

  // Middle chapters (full chapters)
  for (let ch = ref.chapterNumber + 1; ch < ref.chapterNumberEnd!; ch++) {
    segments.push({
      bookName: bookName,
      chapterNumber: ch,
      verseStart: 1,
      verseEnd: undefined, // Full chapter
    })
  }

  // Last chapter: from verse 1 to verseNumberEndChapter
  segments.push({
    bookName: bookName,
    chapterNumber: ref.chapterNumberEnd!,
    verseStart: 1,
    verseEnd: ref.verseNumberEndChapter,
  })

  return segments
}
/**
 * Get a readable string representation of a VerseReference
 */
export const getReferenceHead = (verseReference: VerseReference): string => {
  const { bookName, ranges } = verseReference

  const rangeHeads = ranges.map((range, index) => {
    let head = ''
    // Only show chapter number if it's the first range OR if the chapter changed from previous range's effective end
    const prevRange = ranges[index - 1]
    const prevEffectiveChapter =
      index === 0
        ? -1
        : prevRange.chapterNumberEnd !== undefined
          ? prevRange.chapterNumberEnd
          : prevRange.chapterNumber
    const showChapter =
      index === 0 || prevEffectiveChapter !== range.chapterNumber

    if (showChapter) {
      head += `${range.chapterNumber}:${range.verseNumber}`
    } else {
      head += `${range.verseNumber}`
    }

    if (
      range.chapterNumberEnd !== undefined &&
      range.verseNumberEndChapter !== undefined
    ) {
      // Cross-chapter range: 1:1-3:5
      head += `-${range.chapterNumberEnd}:${range.verseNumberEndChapter}`
    } else if (
      range.verseNumberEnd &&
      range.verseNumberEnd !== range.verseNumber
    ) {
      // Single chapter range: 3:16-18
      head += `-${range.verseNumberEnd}`
    }
    return head
  })

  return `${bookName} ${rangeHeads.join(', ')}`
}
