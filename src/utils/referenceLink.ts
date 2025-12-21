/**
 * Get the Bible Gateway URL for the latest query
 * @returns {string}
 *   something like this https://www.biblegateway.com/passage/?search=Romans%206:23&version=niv
 * @param versionKey
 * @param bookName
 * @param chapter
 * @param versesString
 * @protected
 */
export const getBibleGatewayUrl = (
  versionKey: string,
  bookName: string,
  chapter: number,
  versesString: string
): string => {
  return `https://www.biblegateway.com/passage/?search=${bookName}+${chapter}:${versesString}&version=${versionKey}`
}
