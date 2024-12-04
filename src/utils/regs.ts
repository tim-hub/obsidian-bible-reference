/**
 * regular expression to match
 * John12:1-3
 * John1:1
 * 1John1:1
 */
// export const MODAL_REG =
//   /([123])*\s*[A-Z\[\\\]^_`a-z]{2,}\s*\d{1,3}:\d{1,3}(-\d{1,3})*/

export const MODAL_REG = /([123])*\s*([\p{L}[\\\]^_`a-zA-Z]{2,100}|\p{Script=Han}{1,})\s*\d{1,3}:\d{1,3}(-\d{1,3})*/isu

export const BOOK_REG = /([123])*\s*([\p{L}[\\\]^_`a-zA-Z]{2,100}|\p{Script=Han}{1,})/isu

export const VERSION_REG = /(-[a-zA-Z0-9]+)$/isu

// export const BOOK_REG = /[123]*\s*[A-Z\[\\\]^_`a-z]{2,}/

/**
 * prefix of the trigger
 * --
 * ++
 */
export const DEFAULT_TRIGGER_PREFIX_REG = /--|(\+\+)/
