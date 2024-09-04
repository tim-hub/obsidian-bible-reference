import { verseMatch, matchTriggerPrefix } from './verseMatch'

test('test verse match', () => {
  const result = verseMatch('--John3:16')
  expect(result).toBe('John3:16')
})

test('test verse not match', () => {
  const result = verseMatch('-John3:16')
  expect(result).toBe('John3:16')
})

test('test verse not match', () => {
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

test('test trigger prefix **', () => {
  const result = matchTriggerPrefix('**')
  expect(result).toBe(false)
})

test('test trigger prefix **1', () => {
  const result = matchTriggerPrefix('**1')
  expect(result).toBe(false)
})
