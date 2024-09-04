/**
 * regular expression to match
 * John12:1-3
 * John1:1
 * 1John1:1
 */
export const MODAL_REG =
  /([123])*\s*[A-Z\[\\\]^_`a-z]{2,}\s*\d{1,3}:\d{1,3}(-\d{1,3})*/

export const BOOK_REG = /[123]*\s*[A-Z\[\\\]^_`a-z]{2,}/

/**
 * prefix of the trigger
 * --
 * ++
 */
export const DEFAULT_TRIGGER_PREFIX_REG = /--|(\+\+)/
