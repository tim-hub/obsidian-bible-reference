import { BOOK_VERSE_REG, DEFAULT_TRIGGER_PREFIX_REG } from './regs'

/**
 * check if the given string contains a verseNumber, and return the verseNumber if it does
 * @param verseTrigger without the prefix trigger --
 * @returns string the same string if it match
 */
export const verseMatch = (verseTrigger: string): string => {
  if (verseTrigger.length < 5) {
    return ''
  }

  const matchResults = verseTrigger.match(BOOK_VERSE_REG)
  if (!matchResults) {
    return ''
  } else {
    return matchResults[0]
  }
}

export const matchTriggerPrefix = (verseTrigger: string): boolean => {
  return DEFAULT_TRIGGER_PREFIX_REG.test(verseTrigger)
}
