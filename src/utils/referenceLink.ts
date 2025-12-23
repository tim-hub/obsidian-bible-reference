/**
 * Get the Bible Gateway URL for the latest query
 * @returns {string}
 *   something like this https://www.biblegateway.com/passage/?search=Romans%206:23&version=niv
 *   or for cross-chapter: https://www.biblegateway.com/passage/?search=John+1:1-3:5&version=niv
 * @param versionKey
 * @param bookName
 * @param chapter
 * @param versesString
 * @param chapterEnd - Optional end chapter for cross-chapter references
 * @param verseNumberEndChapter - Optional end verse number for cross-chapter references
 * @protected
 */
export const getBibleGatewayUrl = (
  versionKey: string,
  bookName: string,
  chapter: number,
  versesString: string,
  chapterEnd?: number,
  verseNumberEndChapter?: number
): string => {
  let searchString: string
  if (chapterEnd !== undefined && verseNumberEndChapter !== undefined) {
    // Cross-chapter reference: John 1:1-3:5
    searchString = `${encodeURIComponent(bookName)}+${chapter}:${versesString}-${chapterEnd}:${verseNumberEndChapter}`
  } else {
    // Single chapter reference: John 3:16 or John 3:16-18
    searchString = `${encodeURIComponent(bookName)}+${chapter}:${versesString}`
  }
  return `https://www.biblegateway.com/passage/?search=${searchString}&version=${versionKey}`
}
