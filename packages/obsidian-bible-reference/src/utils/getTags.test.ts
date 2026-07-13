import { getBookTag, getChapterTag } from './getTags'

describe('test getBookTag', () => {
  it('should return the default tag format with no input', () => {
    expect(getBookTag('John')).toBe('#John')
  })
  it('should return the default tag format with empty input', () => {
    expect(getBookTag('John', '')).toBe('#John')
  })
  it('should remove spaces', () => {
    expect(getBookTag('1 Corinthians', '{{book}}')).toBe('#1Corinthians')
  })
  it('should handle prefixes', () => {
    expect(getBookTag('John', 'prefix/{{book}}')).toBe('#prefix/John')
  })
  it('should handle suffixes', () => {
    expect(getBookTag('John', '{{book}}/suffix')).toBe('#John/suffix')
  })
})

describe('test getChapterTag', () => {
  it('should return the default tag format with no input', () => {
    expect(getChapterTag('John', 1)).toBe('#John1')
  })
  it('should return the default tag format with empty input', () => {
    expect(getChapterTag('John', 1, '')).toBe('#John1')
  })
  it('should remove spaces', () => {
    expect(getChapterTag('1 Corinthians', 1, '{{book}}{{chapter}}')).toBe(
      '#1Corinthians1'
    )
  })
  it('should handle prefixes', () => {
    expect(getChapterTag('John', 1, 'prefix/{{book}}{{chapter}}')).toBe(
      '#prefix/John1'
    )
  })
  it('should handle suffixes', () => {
    expect(getChapterTag('John', 1, '{{book}}{{chapter}}/suffix')).toBe(
      '#John1/suffix'
    )
  })
  it('should handle splitting {{book}} and {{chapter}}', () => {
    expect(getChapterTag('John', 1, '{{book}}/{{chapter}}')).toBe('#John/1')
  })
})
