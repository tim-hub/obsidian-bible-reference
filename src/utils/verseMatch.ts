/**
 * check if the given string contains a verseNumber, and return the verseNumber if it does
 * @param verse
 * @param modal
 * @constructor
 */
import { MODAL_REG, SHORT_REG } from './regs'

export const verseMatch = (verse: string, isFromModal = false): string => {
  const matchResults = verse.match(isFromModal ? MODAL_REG : SHORT_REG)
  if (!matchResults) {
    return ''
  } else {
    return matchResults[0]
  }
}
