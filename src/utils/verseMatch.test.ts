import { verseMatch } from './verseMatch'

test('test verse match', () => {
  const result = verseMatch('--John3:16')
  expect(result).toBe('--John3:16')
})

test('test verse not match', () => {
  const result = verseMatch('-John3:16')
  expect(result).toBe('')
})
