import { localizedBookName, bookIdForVersion } from './bookNameLocalization'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { BookNameLanguageEnum } from '../data/constants'

const traditional = getBibleVersion('cuv') // code: zh_tw
const simplified = getBibleVersion('cunps') // code: zh_cn
const english = getBibleVersion('bbe') // code: en
const polish = getBibleVersion('ubg') // code: pl — no catalog

describe('localizedBookName', () => {
  test('English setting renders English regardless of version', () => {
    expect(
      localizedBookName('John', traditional, BookNameLanguageEnum.English)
    ).toBe('John')
  })

  test('version-specific renders Traditional Chinese for a zh_tw version', () => {
    expect(
      localizedBookName(
        'John',
        traditional,
        BookNameLanguageEnum.VersionSpecific
      )
    ).toBe('約翰福音')
  })

  test('version-specific renders Simplified Chinese for a zh_cn version', () => {
    expect(
      localizedBookName(
        'John',
        simplified,
        BookNameLanguageEnum.VersionSpecific
      )
    ).toBe('约翰福音')
  })

  test('falls back to English when the version has no catalog', () => {
    expect(
      localizedBookName('John', polish, BookNameLanguageEnum.VersionSpecific)
    ).toBe('John')
  })

  test('falls back to English when no version is selected', () => {
    expect(
      localizedBookName('John', undefined, BookNameLanguageEnum.VersionSpecific)
    ).toBe('John')
  })
})

describe('bookIdForVersion', () => {
  test('resolves a localized (Traditional) name to its book id', () => {
    expect(bookIdForVersion('約翰福音', traditional!)).toBe(43)
  })

  test('resolves an English name via the all-language fallback', () => {
    expect(bookIdForVersion('John', english!)).toBe(43)
  })
})
