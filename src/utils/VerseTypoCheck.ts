/**
 * check if the given string contains a verseNumber, and return the verseNumber if it does
 * @param verse
 * @param modal
 * @constructor
 */
import { MODAL_REG, SHORT_REG } from './regs'

export const VerseTypoCheck = (verse: string, modal = false): string => {
  return verse.match(modal ? MODAL_REG : SHORT_REG)?.first() ?? ''
}
