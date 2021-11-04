/**
 * regular expression to match verse
 *
 * -- John 1:1
 * -- Joh 1
 * -- Joh 123:1-3
 * -- 1 Col 1:1-15
 */
const reg = /\-{2}(\ *)(([123]\ )*)(\w{3,})(\ *)\d{0,3}\:*\d{0,3}\-*\d{0,3}$/;

/**
 * check if the given string contains a verse, and return the verse if it does
 * @param verse
 * @constructor
 */
export const VerseTypoCheck = (verse: string): string => {
    return verse.match(reg)?.first();
}
