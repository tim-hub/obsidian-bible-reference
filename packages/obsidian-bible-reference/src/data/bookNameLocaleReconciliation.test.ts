import { BibleVersionCollection } from './BibleVersionCollection'
import { SupportedLanguages } from 'bible-reference-toolkit'

/**
 * Guards the version <-> book-name-catalog agreement. A version's `code` is its
 * book-name locale; if it neither matches a catalog nor is a known
 * English-fallback, book names render in English silently (the class of bug that
 * shipped as `code: 'cn'` against the `zh_tw`/`zh_cn` catalogs).
 */

// Version codes with no book-name catalog that intentionally fall back to
// English. Prune a code from here when its catalog is added.
const ENGLISH_FALLBACK = new Set([
  'ar',
  'cu',
  'id',
  'la',
  'ml',
  'nl',
  'pl',
  'ru',
  'ta',
  'uk',
])

// Catalogs that ship with no version pointing at them. Harmless, but tracked so
// the pairing stays visible (add a version, or remove from here).
const CATALOGS_WITHOUT_VERSION = ['da', 'jp']

describe('book-name locale reconciliation', () => {
  const catalogs = new Set(SupportedLanguages)
  const usedCodes = new Set(
    BibleVersionCollection.map((v) => v.code).filter(Boolean) as string[]
  )

  test('every version code resolves to a catalog or an explicit English fallback', () => {
    const unaccounted = BibleVersionCollection.filter((v) => v.code)
      .filter((v) => !catalogs.has(v.code!) && !ENGLISH_FALLBACK.has(v.code!))
      .map((v) => `${v.key} -> ${v.code}`)
    expect(unaccounted).toEqual([])
  })

  test('English-fallback list is pruned once a catalog exists for a code', () => {
    const nowLocalizable = [...ENGLISH_FALLBACK].filter((c) => catalogs.has(c))
    expect(nowLocalizable).toEqual([])
  })

  test('catalogs without a version stay accounted for', () => {
    const dead = SupportedLanguages.filter(
      (c) => c !== 'en' && !usedCodes.has(c)
    ).sort()
    expect(dead).toEqual([...CATALOGS_WITHOUT_VERSION].sort())
  })
})
