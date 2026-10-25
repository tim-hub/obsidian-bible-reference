import { describe, expect, test } from 'bun:test'
import Reference from '../lib/reference'
import {
  BookWithAbbreviations,
  SupportedLanguages,
  getTranslationBooks,
  AllBibleBooksInAllSupportedLanguages,
} from '../lib/books'
import { generateOrdinalNameVariations } from '../lib/utils'

const normalize = (value: string): string =>
  value.replace(/\./g, '').replace(/\s+/g, ' ').trim().toLowerCase()

const isNumbered = (book: BookWithAbbreviations): boolean =>
  !!book.startNumber && book.startNumber > 0

const exactNames = (book: BookWithAbbreviations): string[] =>
  isNumbered(book)
    ? [book.fullName]
    : [book.fullName, book.name, ...book.abbreviations]

const ordinalNames = (book: BookWithAbbreviations): string[] =>
  isNumbered(book)
    ? generateOrdinalNameVariations(book.startNumber as number, [
        book.name,
        ...book.abbreviations,
      ])
    : []

const firstBookListing = (
  books: BookWithAbbreviations[],
  name: string
): number => {
  const key = normalize(name)
  const exact = books.findIndex((book) =>
    exactNames(book).map(normalize).includes(key)
  )
  if (exact >= 0) {
    return exact + 1
  }
  return (
    books.findIndex((book) => ordinalNames(book).map(normalize).includes(key)) +
    1
  )
}

const everyName = (books: BookWithAbbreviations[]): string[] =>
  books.flatMap((book) => [...exactNames(book), ...ordinalNames(book)])

describe.each(SupportedLanguages)(
  'book lookup in the %s catalog',
  (language) => {
    test('every name resolves to the first book that lists it', () => {
      const books = getTranslationBooks(language)
      for (const name of everyName(books)) {
        expect(Reference.bookIdFromTranslationAndName(language, name)).toBe(
          firstBookListing(books, name)
        )
      }
    })
  }
)

describe('book lookup across all catalogs', () => {
  test('every name resolves to the first book that lists it', () => {
    const books = AllBibleBooksInAllSupportedLanguages
    for (const name of everyName(books)) {
      expect(Reference.bookIdFromName(name)).toBe(firstBookListing(books, name))
    }
  })

  test('a miss still throws', () => {
    expect(() => Reference.bookIdFromName('Notabook')).toThrow(
      'No book matched "Notabook"'
    )
  })

  test('2,000 misses finish within 100 ms', () => {
    const started = performance.now()
    for (let i = 0; i < 2000; i++) {
      try {
        Reference.bookIdFromName(`Notabook${i}`)
      } catch {
        continue
      }
    }
    expect(performance.now() - started).toBeLessThan(100)
  })
})
