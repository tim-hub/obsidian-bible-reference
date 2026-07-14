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

// True when the reference specifies a verse explicitly: a colon followed by a
// verse number or the "a" (whole-chapter) indicator. Bare "John 1" -> false;
// "John 1:1", "John 1:a", "John 3:16-4:2" -> true. Book names contain no colon,
// so this cleanly separates transient chapter-typing from an intentional lookup.
const EXPLICIT_VERSE_REG = /:\s*(\d|a)/i
export const hasExplicitVerse = (reference: string): boolean =>
  EXPLICIT_VERSE_REG.test(reference)
