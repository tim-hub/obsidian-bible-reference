import { hasExplicitVerse } from './verseMatch'

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
