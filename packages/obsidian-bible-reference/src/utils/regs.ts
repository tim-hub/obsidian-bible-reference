/**
 * Every dash a verse range gets written with. Users type the ASCII hyphen, but
 * text pasted out of books, PDFs and CJK keyboards carries en/em dashes, the
 * minus sign, or the fullwidth forms. Kept as one string so the character class
 * below and `normalizeDashes` can never drift apart.
 *
 * U+002D hyphen-minus, U+2010 hyphen, U+2011 non-breaking hyphen,
 * U+2012 figure dash, U+2013 en dash, U+2014 em dash, U+2015 horizontal bar,
 * U+2212 minus sign, U+FE58 small em dash, U+FF0D fullwidth hyphen-minus.
 *
 */
export const DASH_CHARS = '-‐‑‒–—―−﹘－'

/**
 * DASH_CHARS escaped for interpolation into a character class. Without this the
 * hyphen pairs up with the character after it and reads as a range, which is a
 * hard SyntaxError under the `u` flag rather than a silent mismatch.
 */
const DASH_CLASS_BODY = DASH_CHARS.replace(/[\\\]^-]/g, '\\$&')

const DASH_REG = new RegExp(`[${DASH_CLASS_BODY}]`, 'gu')

/**
 * Fold every dash to the ASCII hyphen so range parsing only has one form to
 * handle. Book names carry no dashes in any supported catalog, so this is safe
 * to run over a whole reference string.
 */
export const normalizeDashes = (value: string): string =>
  value.replace(DASH_REG, '-')

/**
 * A single character of a book name.
 *
 * `a-zA-Z` is deliberately absent from the bracket class - `\p{L}` already
 * covers it, and the overlap made the alternation ambiguous under a quantifier,
 * which backtracks badly on input that ends up not matching.
 */
const BOOK_CHAR = '(?:\\p{L}|\\p{M}|[\\\\[\\]^_`])'

/**
 * Words of a book name, each optionally closed by the period an abbreviation is
 * written with ("Eph.", "Cor."). The first word keeps the two-character floor -
 * a lone letter must not read as a book name, or the pattern starts matching
 * stray letters in prose. A single letter that carries a period is exempt: it is
 * unambiguously an abbreviation, and Romanian writes Acts as "F. Ap.". Later
 * words have no such risk, the first word already anchors the match.
 */
const BOOK_WORD_HEAD = `(?:${BOOK_CHAR}{2,100}\\.?|${BOOK_CHAR}\\.)`
const BOOK_WORD_TAIL = `${BOOK_CHAR}{1,100}\\.?`

/**
 * A whole book name: one word, or several separated by whitespace, so
 * "Song of Solomon" survives as one unit. The separator is whitespace and the
 * words are letters, two disjoint sets, so the repetition cannot backtrack
 * catastrophically; the {0,5} bound caps it in any case. Han script has no word
 * separators and stays its own alternative.
 */
const BOOK_NAME = `(?:${BOOK_WORD_HEAD}(?:\\s+${BOOK_WORD_TAIL}){0,5}|\\p{Script=Han}{1,})`

/**
 * The ordinal a numbered book starts with, optionally with the period German
 * writes it with ("1. Mose"). Runs to 5 because German numbers the Pentateuch
 * that way; English stops at 3 John. Exactly one digit: "11 John" is a typo,
 * not a book, and letting the quantifier repeat made it match as "1 John".
 * An ordinal no book uses is caught later, when the name is looked up.
 */
const BOOK_ORDINAL = '([1-5]\\.?)?'

/**
 * regular expression to match
 * John12:1-3
 * John1:1
 * 1John1:1
 * Hebrews9:1-10:14
 * Eph. 2:8
 * Song of Solomon 1:1
 * John 3:16–18
 * 1. Mose 1:1
 * F. Ap. 2:1
 */
export const BOOK_VERSE_REG = new RegExp(
  `${BOOK_ORDINAL}\\s*(${BOOK_NAME})\\s*\\d{1,3}(?:[\\d:;,\\s${DASH_CLASS_BODY}]|a(?!\\p{L}))*`,
  'isu'
)

export const BOOK_REG = new RegExp(`${BOOK_ORDINAL}\\s*(${BOOK_NAME})`, 'isu')

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
