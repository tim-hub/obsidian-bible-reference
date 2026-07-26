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
  // verseMatch must hand back a literal substring of what was typed: the editor
  // suggester locates its replacement range with lastIndexOf on the raw line.
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
