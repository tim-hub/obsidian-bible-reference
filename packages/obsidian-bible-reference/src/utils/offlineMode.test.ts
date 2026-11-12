import { isTranslationAllowed } from './offlineMode'
import { OFFLINE_VERSION_KEY } from '../data/BibleVersionCollection'

describe('isTranslationAllowed', () => {
  test('every known translation is allowed outside Offline Mode', () => {
    expect(isTranslationAllowed({ offlineMode: false }, 'esv')).toBe(true)
    expect(isTranslationAllowed({}, 'esv')).toBe(true)
  })

  test('Offline Mode allows only the bundled translation', () => {
    expect(
      isTranslationAllowed({ offlineMode: true }, OFFLINE_VERSION_KEY)
    ).toBe(true)
    expect(isTranslationAllowed({ offlineMode: true }, 'esv')).toBe(false)
  })

  test('Offline Mode rejects unknown keys instead of the fallback version', () => {
    expect(isTranslationAllowed({ offlineMode: true }, 'nope')).toBe(false)
  })
})
