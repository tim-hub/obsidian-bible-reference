/**
 * regular expression to match verseNumber
 *
 * -- John 1:1
 * -- Joh 1
 * -- Joh 123:1-3
 * -- 1 Col 1:1-15
 * eslint-disable-line /
export const ORIGINAL_REG = /-{2}(([123])*)(\w{3,})\+\d{0,3}:*\d{0,3}-*\d{0,3}$/

 /**
 * regular expression to match
 * --John12:1-3
 * --John1:1
 */
export const SHORT_REG = /-{2}([123])*\s*[A-z]{2,}\s*\d{1,3}:\d{1,3}(-\d{1,3})*/

/**
 * regular expression to match
 * John12:1-3
 * John1:1
 */
export const MODAL_REG = /([123])*\s*[A-z]{2,}\s*\d{1,3}:\d{1,3}(-\d{1,3})*/

export const BOOK_REG = /[123]*\s*[A-z]{2,}/
