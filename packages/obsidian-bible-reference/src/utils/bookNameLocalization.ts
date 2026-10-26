import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BookNameLanguageEnum } from '../data/constants'
import { bookNameForId } from './bookNameReference'

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
 * Localized full book name for display. Resolves the display locale from the version and the user's
 * book-name-language setting, then renders the book name in that locale.
 */
export const localizedBookName = (
  bookId: number,
  version: IBibleVersion | undefined,
  bookNameLanguage: BookNameLanguageEnum | undefined
): string => bookNameForId(bookId, bookNameLocale(version, bookNameLanguage))
