/**
 * regular expression to match
 * John12:1-3
 * John1:1
 * 1John1:1
 */
export const BOOK_VERSE_REG = /([123])*\s*([\p{L}[\\\]^_`a-zA-Z]{2,100}|\p{Script=Han}{1,})\s*\d{1,3}:\d{1,3}(-\d{1,3})*/isu

export const BOOK_REG = /([123])*\s*([\p{L}[\\\]^_`a-zA-Z]{2,100}|\p{Script=Han}{1,})/isu

export const TRANSLATION_VERSION_KEY_REG = /^[a-zA-Z]+-?[a-zA-Z0-9]*$/isu 

export const BOOK_VERSE_WITH_TRANSLATION_REG = new RegExp(
  `(${BOOK_VERSE_REG.source})[@-](${TRANSLATION_VERSION_KEY_REG.source.slice(1, -1)})`,
  'isu'
); // todo maybe this is a better option


// export const BOOK_REG = /[123]*\s*[A-Z\[\\\]^_`a-z]{2,}/

/**
 * prefix of the trigger
 * --
 * ++
 */
export const DEFAULT_TRIGGER_PREFIX_REG = /--|(\+\+)/
