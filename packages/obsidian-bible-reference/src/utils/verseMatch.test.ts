import {
  hasExplicitVerse,
  verseMatch,
  isIncompleteReference,
} from './verseMatch'
import { DASH_CHARS } from './regs'

describe('hasExplicitVerse', () => {
  test.each([
    ['John 1', false],
    ['1 John 1', false],
    ['John 1:', false],
    ['John 1:1', true],
    ['John 1:a', true],
    ['Genesis 1:a', true],
    ['John 3:16-4:2', true],
    ['John 3:16,19', true],
  ])('%s -> %s', (reference, expected) => {
    expect(hasExplicitVerse(reference)).toBe(expected)
  })
})

describe('verseMatch', () => {
  // verseMatch hands back a literal substring of what was typed rather than a
  // normalized form, so callers can relate the result back to the raw line.
  test.each([
    'John 3:16',
    'John 3:16-18',
    'Eph. 2:8',
    'Matt. 5:3',
    '1 Cor. 13:4-7',
    'Song of Solomon 1:1',
    'Hebrews 9:1-10:14',
  ])('returns %s unchanged', (reference) => {
    expect(verseMatch(reference)).toBe(reference)
  })

  // Song of Songs goes by more names than any other book, and every one of
  // these was reported as not matching. See issue #347.
  test.each([
    'Song of Songs 1:1',
    'SongofSongs1:1',
    'songofsongs1:1',
    'Song of Solomon 1:1',
    'Songs1:1',
    'Sg1:1',
    'SS1:1',
    'Canticles 1:1',
    'SOS1:1',
  ])('matches %s', (reference) => {
    expect(verseMatch(reference)).toBe(reference)
  })

  test.each([...DASH_CHARS])(
    'returns the whole range rather than truncating at %s',
    (dash) => {
      const reference = `John 3:16${dash}18`
      expect(verseMatch(reference)).toBe(reference)
    }
  )

  test('returns an empty string when there is no reference', () => {
    expect(verseMatch('no reference here')).toBe('')
  })

  // The pattern spans whitespace so multi-word book names survive whole, which
  // also lets it read a run of prose words as a book name. And it is unanchored,
  // so it can skip past whatever it cannot match. The match has to cover the
  // whole query, and the catalog is the authority on what is actually a book.
  test.each([
    'i am reading Genesis 1:1',
    'see Eph. 2:8',
    'note: Genesis 1:1',
    'today, Genesis 1:1',
    'todo item 3: 1 thing',
    'Notabook 1:1',
    'Genesis 1:1 and then some notes',
    '11 John 1:1', // typo: matched as "1 John" and fetched the Gospel of John
    '123 John 1:1',
  ])('rejects %s, which is prose rather than a reference', (text) => {
    expect(verseMatch(text)).toBe('')
  })

  // Book names that carry a period of their own, rather than one that marks an
  // abbreviation. "Ap." alone is Romanian for Revelation, so losing the "F."
  // silently fetched the wrong book.
  test.each(['F. Ap. 2:1', '1. Mose 1:1', '5. Mose 6:4'])(
    'keeps %s whole',
    (reference) => {
      expect(verseMatch(reference)).toBe(reference)
    }
  )
})

describe('isIncompleteReference', () => {
  // Typing "John 3:16-18" passes through "John 3:16-", which must not be
  // reported as a broken range.
  test.each([
    ['John 3:16-', true],
    ['John 3:16- ', true],
    ['John 3:16,', true],
    ['John 3:16;', true],
    ['John 3:', true],
    ['John 3:16-4:', true],
    ['John 3:16', false],
    ['John 3:16-18', false],
    ['John 3:16-4:2', false],
    ['John 3:a', false],
    ['Song of Solomon 1:1', false],
  ])('%s -> %s', (reference, expected) => {
    expect(isIncompleteReference(reference)).toBe(expected)
  })

  test.each([...DASH_CHARS])('treats a trailing %s as incomplete', (dash) => {
    expect(isIncompleteReference(`John 3:16${dash}`)).toBe(true)
  })
})
