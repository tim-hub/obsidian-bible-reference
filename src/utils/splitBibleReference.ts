/**
 * Reference to a verse or a range of verse in the Bible
 */
export type VerseReference = {
  bookName: string
  chapterNumber: number
  verseNumber: number
  verseNumberEnd?: number
}

/**
 * Split Bible Reference to book name, chapter number, and verse number, for example:
 * 1 Corinthians 1:27 => { bookName: '1 Corinthians', chapterNumber: 1, verseNumber: 27 }
 * 1 Corinthians 1:27-28 => { bookName: '1 Corinthians', chapterNumber: 1, verseNumber: 27, verseNumberEnd: 28 }
 *
 */
export const splitBibleReference = (reference: string) => {
  // split from last space,

  const parts = reference.trim().split(' ')
  const length = parts.length

  const numbers = parts[length - 1].split(/[-:]+/)

  const chapterNumber = parseInt(numbers[0].trim())
  const verseNumber = parseInt(numbers[1])
  const verseEndNumber = numbers.length === 3 ? parseInt(numbers[2]) : undefined

  // the first one or two parts are book name
  const bookName = parts.slice(0, length - 1).join(' ')

  return {
    bookName,
    chapterNumber,
    verseNumber,
    verseEndNumber,
  }
}
