import { TRANSLATION_VERSION_KEY_REG } from './regs'

/**
 * check if the given string contains a verseNumber, and return the verseNumber if it does
 * @param verseWithVersionAtEnd without the prefix trigger --
 * @returns string the same string if it match
 */
export const versionSelectionMatch = (verseWithVersionAtEnd: string): string => {
  console.log(`version selection reg : ${verseWithVersionAtEnd}`)
  const matchResults = verseWithVersionAtEnd.match(TRANSLATION_VERSION_KEY_REG)
  console.log(`version selection reg match result : ${matchResults}`)
  if (!matchResults) {
    return ''
  } else {
    return matchResults[0]
  }
}