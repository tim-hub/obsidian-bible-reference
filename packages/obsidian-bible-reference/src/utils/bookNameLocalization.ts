import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BookNameLanguageEnum } from '../data/constants'
import { getFullBookName, getBookIdFromBookName } from './bookNameReference'

/**
 * The book-name catalog locale for a version. The "English" setting forces
 * 'en'; otherwise the version's own catalog code, falling back to English when
 * the version declares none. This is the single place the setting-vs-version
 * locale decision lives.
 */
const bookNameLocale = (
  version: IBibleVersion | undefined,
  bookNameLanguage: BookNameLanguageEnum | undefined
): string =>
  bookNameLanguage === BookNameLanguageEnum.English
    ? 'en'
    : (version?.code ?? 'en')

/**
 * Localized full book name for display, e.g. 'John' -> '約翰福音' for a zh_tw
 * version. Resolves the display locale from the version and the user's
 * book-name-language setting, then renders the book name in that locale.
 */
export const localizedBookName = (
  rawBookName: string,
  version: IBibleVersion | undefined,
  bookNameLanguage: BookNameLanguageEnum | undefined
): string =>
  getFullBookName(rawBookName, bookNameLocale(version, bookNameLanguage))

/**
 * Book id for a version's API URL, resolving the (already-localized) book name
 * in the version's own catalog locale.
 */
export const bookIdForVersion = (
  bookName: string,
  version: IBibleVersion
): number => getBookIdFromBookName(bookName, version.code)
