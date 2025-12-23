/**
 * regular expression to match
 * John12:1-3
 * John1:1
 * 1John1:1
 * Hebrews9:1-10:14
 */
export const BOOK_VERSE_REG =
  /([123])*\s*([\p{L}[\\\]^_`a-zA-Z]{2,100}|\p{Script=Han}{1,})\s*\d{1,3}:\d{1,3}(-\d{1,3}(:\d{1,3})?)?/isu

export const BOOK_REG =
  /([123])*\s*([\p{L}[\\\]^_`a-zA-Z]{2,100}|\p{Script=Han}{1,})/isu

export const TRANSLATION_VERSION_KEY_REG = /^[a-zA-Z]+-?[a-zA-Z0-9]*$/isu

export const BOOK_VERSE_WITH_TRANSLATION_REG = new RegExp(
  `(${BOOK_VERSE_REG.source})[@-](${TRANSLATION_VERSION_KEY_REG.source.slice(1, -1)})`,
  'isu'
) // todo maybe this is a better option

// export const BOOK_REG = /[123]*\s*[A-Z\[\\\]^_`a-z]{2,}/

/**
 * prefix of the trigger
 * --
 * ++
 */
export const DEFAULT_TRIGGER_PREFIX_REG = /--|(\+\+)/

/**
 * Pattern to parse Bible references without spaces
 * Matches: john1:1, 1John1:1, genesis3:16, 2corinthians5:17-21
 *
 * Groups:
 * 1: Optional leading number (1, 2, 3 for numbered books)
 * 2: Book name letters (john, corinthians, etc.)
 * 3: Chapter number
 * 4: Verse info (verse number, range, or cross-chapter)
 *
 * Examples:
 * - "john1:1" => ["john1:1", "", "john", "1", "1"]
 * - "1John1:1" => ["1John1:1", "1", "John", "1", "1"]
 * - "john1:1-5" => ["john1:1-5", "", "john", "1", "1-5"]
 */
export const NO_SPACE_REFERENCE_REG = /^(\d?)([a-zA-Z]+)(\d+):(.+)$/

/**
 * Pattern to parse Bible references with hybrid spacing
 * Matches: "1 John1:1", "2 Corinthians5:17", "3 John2:1"
 * (space after number prefix, but no space before chapter)
 *
 * Groups:
 * 1: Leading number (1, 2, 3 for numbered books)
 * 2: Book name letters (John, Corinthians, etc.)
 * 3: Chapter number
 * 4: Verse info (verse number, range, or cross-chapter)
 *
 * Examples:
 * - "1 John1:1" => ["1 John1:1", "1", "John", "1", "1"]
 * - "2 Corinthians5:17" => ["2 Corinthians5:17", "2", "Corinthians", "5", "17"]
 */
export const HYBRID_SPACE_REFERENCE_REG = /^(\d)\s+([a-zA-Z]+)(\d+):(.+)$/

/**
 * Pattern to detect cross-chapter verse ranges
 * Matches: 9:1-10:14, 1:1-3:16
 *
 * Groups:
 * 1: Start chapter number
 * 2: Start verse number
 * 3: End chapter number
 * 4: End verse number
 *
 * Examples:
 * - "9:1-10:14" => ["9:1-10:14", "9", "1", "10", "14"]
 * - "1:1-3:16" => ["1:1-3:16", "1", "1", "3", "16"]
 */
export const CROSS_CHAPTER_REG = /^(\d+):(\d+)-(\d+):(\d+)$/

/**
 * Pattern to split chapter and verse components
 * Used for parsing "1:27" or "1:27-28" into separate numbers
 *
 * Splits on colons and hyphens
 * Example: "1:27-28".split(CHAPTER_VERSE_SEPARATOR) => ["1", "27", "28"]
 */
export const CHAPTER_VERSE_SEPARATOR_REG = /[-:]+/
