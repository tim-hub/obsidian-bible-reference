import { verseMatch, matchTriggerPrefix } from './verseMatch'

test('test verse match', () => {
  const result = verseMatch('--John3:16')
  expect(result).toBe('John3:16')
})

test('test verse match with range', () => {
  const result = verseMatch('--John3:16-17')
  expect(result).toBe('John3:16-17')
})

test('test verse match with comma', () => {
  const result = verseMatch('--John3:16,19')
  expect(result).toBe('John3:16,19')
})

test('test verse match with a indicator', () => {
  const result = verseMatch('--John3:5-a')
  expect(result).toBe('John3:5-a')
})

test('test verse match with multi-chapter', () => {
  const result = verseMatch('--John3:16-4:2')
  expect(result).toBe('John3:16-4:2')
})

test('test verse match with complex', () => {
  const result = verseMatch('--John3:16-4:2,7')
  expect(result).toBe('John3:16-4:2,7')
})

test('test verse match without trigger', () => {
  const result = verseMatch('John3:16')
  expect(result).toBe('John3:16')
})

test('test trigger prefix', () => {
  const result = matchTriggerPrefix('--')
  expect(result).toBe(true)
})

test('test trigger prefix ++', () => {
  const result = matchTriggerPrefix('++')
  expect(result).toBe(true)
})
