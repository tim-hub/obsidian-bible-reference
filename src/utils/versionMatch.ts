import { VERSION_REG } from './regs'

/**
 * check if the given string contains a verseNumber, and return the verseNumber if it does
 * @param verseTrigger without the prefix trigger --
 * @returns string the same string if it match
 */
export const versionMatch = (verseTrigger: string): string => {
  const matchResults = verseTrigger.match(VERSION_REG)
  console.log(`version reg match result : ${matchResults}`)
  if (!matchResults) {
    return ''
  } else {
    return matchResults[0].substring(1)
  }
}