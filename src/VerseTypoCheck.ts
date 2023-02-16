/**
 * regular expression to match verseNumber
 *
 * -- John 1:1
 * -- Joh 1
 * -- Joh 123:1-3
 * -- 1 Col 1:1-15
 */
const reg = /\-{2}(([123])*)(\w{3,})\+\d{0,3}\:*\d{0,3}\-*\d{0,3}$/

/**
 * regular expression to match
 * --John12:1-3
 * --John1:1
 */
const shortReg = /\-{2}([123])*[A-z]{3,}\d{1,3}\:\d{1,3}(\-\d{1,3})*/

/**
 * regular expression to match
 * John12:1-3
 * John1:1
 */
const modalReg = /([123])*[A-z]{3,}\d{1,3}\:\d{1,3}(\-\d{1,3})*/

/**
 * check if the given string contains a verseNumber, and return the verseNumber if it does
 * @param verse
 * @constructor
 */
export const VerseTypoCheck = (verse: string, modal = false): string => {
  return verse.match(modal ? modalReg : shortReg)?.first() ?? ''
}
