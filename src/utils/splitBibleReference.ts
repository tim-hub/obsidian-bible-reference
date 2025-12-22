import { getVerseCount } from '../data/BibleVerseData'
import { BOOK_REG } from './regs'

/**
 * Reference to a verse or a range of verse in the Bible
 */
export type VerseRange = {
  chapterNumber: number
  verseNumber: number
  verseEndNumber?: number
}

export type VerseReference = {
  bookName: string
  chapterVerseRanges: VerseRange[]
}

/**
 * Split Bible Reference to book name and a series of chapter/verse ranges.
 * Examples:
 * "John 3:16" => { bookName: "John", chapterVerseRanges: [{ chapterNumber: 3, verseNumber: 16 }] }
 * "John 3:16-17" => { bookName: "John", chapterVerseRanges: [{ chapterNumber: 3, verseNumber: 16, verseEndNumber: 17 }] }
 * "John 3:16,19" => { bookName: "John", chapterVerseRanges: [{ chapterNumber: 3, verseNumber: 16 }, { chapterNumber: 3, verseNumber: 19 }] }
 * "John 3:16-4:2" => { bookName: "John", chapterVerseRanges: [{ chapterNumber: 3, verseNumber: 16, verseEndNumber: 36 }, { chapterNumber: 4, verseNumber: 1, verseEndNumber: 2 }] }
 * "John 3:a" => { bookName: "John", chapterVerseRanges: [{ chapterNumber: 3, verseNumber: 1, verseEndNumber: 36 }] }
 */
export const splitBibleReference = (reference: string): VerseReference => {
  const match = reference.match(BOOK_REG)
  if (!match) {
    return { bookName: '', chapterVerseRanges: [] }
  }

  const bookName = match[0].trim()
  const chapterVersePart = reference.substring(match[0].length).trim()

  const chapterVerseRanges: VerseRange[] = []
  let currentChapter = 1

  // Split by comma for multiple verse selections
  const segments = chapterVersePart.split(',')

  segments.forEach((segment) => {
    // Check for multi-chapter range or chapter start
    if (segment.includes(':')) {
      const colonIndex = segment.indexOf(':')
      const chapterPart = segment.substring(0, colonIndex)
      const versePart = segment.substring(colonIndex + 1)
      currentChapter = parseInt(chapterPart)

      if (versePart.toLowerCase() === 'a') {
        // Entire chapter: John 3:a
        const lastVerse = getVerseCount(bookName, currentChapter)
        chapterVerseRanges.push({
          chapterNumber: currentChapter,
          verseNumber: 1,
          verseEndNumber: lastVerse > 0 ? lastVerse : undefined,
        })
      } else if (versePart.includes('-')) {
        // Range within or across chapters: 3:16-17 or 3:16-4:2 or 3:16-a
        parseRange(
          bookName,
          currentChapter,
          versePart,
          chapterVerseRanges,
          (chapter) => (currentChapter = chapter)
        )
      } else {
        // Single verse with chapter: 3:16
        chapterVerseRanges.push({
          chapterNumber: currentChapter,
          verseNumber: parseInt(versePart),
        })
      }
    } else if (segment.includes('-')) {
      // Range without chapter (relative to last known chapter): 16-17 or 16-a
      parseRange(
        bookName,
        currentChapter,
        segment,
        chapterVerseRanges,
        (chapter) => (currentChapter = chapter)
      )
    } else {
      // Single verse without chapter: 19
      chapterVerseRanges.push({
        chapterNumber: currentChapter,
        verseNumber: parseInt(segment),
      })
    }
  })

  return {
    bookName,
    chapterVerseRanges,
  }
}

/**
 * Helper to parse ranges like "16-17", "16-4:2", or "16-a"
 */
const parseRange = (
  bookName: string,
  startChapter: number,
  rangePart: string,
  outRanges: VerseRange[],
  updateChapter: (chapter: number) => void
) => {
  const [startVerseStr, endPart] = rangePart.split('-')
  const startVerse =
    startVerseStr.toLowerCase() === 'a' ? 1 : parseInt(startVerseStr)

  if (endPart.toLowerCase() === 'a') {
    // To end of chapter: 16-a
    const lastVerse = getVerseCount(bookName, startChapter)
    outRanges.push({
      chapterNumber: startChapter,
      verseNumber: startVerse,
      verseEndNumber: lastVerse > 0 ? lastVerse : undefined,
    })
  } else if (endPart.includes(':')) {
    // Multi-chapter range: 3:16-4:2 or 3:16-4:a
    const [endChapterStr, endVerseStr] = endPart.split(':')
    const endChapter = parseInt(endChapterStr)
    const endVerse =
      endVerseStr.toLowerCase() === 'a'
        ? getVerseCount(bookName, endChapter)
        : parseInt(endVerseStr)

    // First chapter: startVerse to end
    const lastVerseOfStartChapter = getVerseCount(bookName, startChapter)
    outRanges.push({
      chapterNumber: startChapter,
      verseNumber: startVerse,
      verseEndNumber:
        lastVerseOfStartChapter > 0 ? lastVerseOfStartChapter : undefined,
    })

    // Intermediate chapters (if any)
    for (let c = startChapter + 1; c < endChapter; c++) {
      const lastV = getVerseCount(bookName, c)
      outRanges.push({
        chapterNumber: c,
        verseNumber: 1,
        verseEndNumber: lastV > 0 ? lastV : undefined,
      })
    }

    // Last chapter: 1 to endVerse
    outRanges.push({
      chapterNumber: endChapter,
      verseNumber: 1,
      verseEndNumber: endVerse,
    })

    updateChapter(endChapter)
  } else {
    // Simple range: 16-17
    outRanges.push({
      chapterNumber: startChapter,
      verseNumber: startVerse,
      verseEndNumber: parseInt(endPart),
    })
  }
}

/**
 * Get a readable string representation of a VerseReference
 */
export const getReferenceHead = (verseReference: VerseReference): string => {
  const { bookName, chapterVerseRanges } = verseReference
  if (!chapterVerseRanges.length) {
    return bookName
  }

  let result = bookName + ' '
  chapterVerseRanges.forEach((range, index) => {
    if (index > 0) {
      if (range.chapterNumber !== chapterVerseRanges[index - 1].chapterNumber) {
        result += '; '
      } else {
        result += ', '
      }
    }
    if (
      index === 0 ||
      range.chapterNumber !== chapterVerseRanges[index - 1].chapterNumber
    ) {
      result += range.chapterNumber + ':'
    }
    result += range.verseNumber
    if (range.verseEndNumber && range.verseEndNumber !== range.verseNumber) {
      result += '-' + range.verseEndNumber
    }
  })
  return result
}
