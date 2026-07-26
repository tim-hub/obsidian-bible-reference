import {
  BOOK_VERSE_REG,
  DEFAULT_TRIGGER_PREFIX_REG,
  normalizeDashes,
} from './regs'
import { isKnownBookName } from './bookNameReference'

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
  }

  // The pattern is unanchored, so it happily matches a reference buried in
  // prose - and since it spans whitespace to keep multi-word names whole, it
  // can start partway through a word run. Require the match to account for the
  // whole query. Without this "11 John 1:1" matches as "1 John 1:1" and
  // "Genesis 1:1 hello world" replaces the trailing words with a verse.
  if (matchResults[0].trim() !== verseTrigger.trim()) {
    return ''
  }

  // Shape alone is not enough either: the pattern knows what a book name looks
  // like, not which ones exist, so "am reading Genesis" reads as one. Ask the
  // catalog. Group 1 is the ordinal of a numbered book, group 2 the name.
  const bookCandidate =
    `${matchResults[1] ?? ''} ${matchResults[2] ?? ''}`.trim()
  if (!isKnownBookName(bookCandidate)) {
    return ''
  }

  return matchResults[0]
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

// True when the reference ends on a separator that still needs something after
// it: a range dash, a segment comma/semicolon, or a chapter colon. Typing
// "John 3:16-18" necessarily passes through "John 3:16-", which is an
// unfinished reference rather than a broken one, so callers should wait instead
// of parsing it and reporting an error. Dashes are folded first so en/em dashes
// count the same as the ASCII hyphen.
const INCOMPLETE_REFERENCE_REG = /[-:,;]\s*$/
export const isIncompleteReference = (reference: string): boolean =>
  INCOMPLETE_REFERENCE_REG.test(normalizeDashes(reference).trim())
