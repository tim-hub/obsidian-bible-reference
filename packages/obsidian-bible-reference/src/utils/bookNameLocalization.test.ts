import { describe, expect, spyOn, test } from 'bun:test'
import { localizedBookName } from './bookNameLocalization'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { BookNameLanguageEnum } from '../data/constants'

const traditional = getBibleVersion('cuv') // code: zh_tw
const simplified = getBibleVersion('cunps') // code: zh_cn
const polish = getBibleVersion('ubg') // code: pl — no catalog

describe('localizedBookName', () => {
  test('English setting renders English regardless of version', () => {
    expect(
      localizedBookName(43, traditional, BookNameLanguageEnum.English)
    ).toBe('John')
  })

  test('version-specific renders Traditional Chinese for a zh_tw version', () => {
    expect(
      localizedBookName(43, traditional, BookNameLanguageEnum.VersionSpecific)
    ).toBe('約翰福音')
  })

  test('version-specific renders Simplified Chinese for a zh_cn version', () => {
    expect(
      localizedBookName(43, simplified, BookNameLanguageEnum.VersionSpecific)
    ).toBe('约翰福音')
  })

  test('falls back to English when the version has no catalog', () => {
    expect(
      localizedBookName(43, polish, BookNameLanguageEnum.VersionSpecific)
    ).toBe('John')
  })

  test('falls back to English when no version is selected', () => {
    expect(
      localizedBookName(43, undefined, BookNameLanguageEnum.VersionSpecific)
    ).toBe('John')
  })

  test('an uncatalogued version locale does not log a catalog error', () => {
    const consoleError = spyOn(console, 'error')
    localizedBookName(43, polish, BookNameLanguageEnum.VersionSpecific)
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
