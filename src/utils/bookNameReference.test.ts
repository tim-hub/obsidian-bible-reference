import { getBookOsis, getBookFullName } from './bookNameReference'

describe('test bookNameReference', () => {
  // Test for getBookOsis function
  it('should return the OSIS book code', () => {
    expect(getBookOsis('Genesis')).toBe('Gen')
    expect(getBookOsis('John')).toBe('John')
    expect(getBookOsis('1 John')).toBe('1John')
  })

  // Test for getBookFullName function
  it('should expand abbreviated book names to full names', () => {
    expect(getBookFullName('jn')).toBe('John')
    expect(getBookFullName('jhn')).toBe('John')
    expect(getBookFullName('gen')).toBe('Genesis')
    expect(getBookFullName('mat')).toBe('Matthew')
    expect(getBookFullName('1jn')).toBe('1 John')
    expect(getBookFullName('2co')).toBe('2 Corinthians')
  })

  it('should handle case insensitive abbreviations', () => {
    expect(getBookFullName('JN')).toBe('John')
    expect(getBookFullName('GEN')).toBe('Genesis')
    expect(getBookFullName('Mat')).toBe('Matthew')
  })

  it('should return full book names unchanged', () => {
    expect(getBookFullName('John')).toBe('John')
    expect(getBookFullName('Genesis')).toBe('Genesis')
    expect(getBookFullName('Matthew')).toBe('Matthew')
  })

  it('should handle invalid book names gracefully', () => {
    expect(getBookFullName('invalidbook')).toBe('invalidbook')
    expect(getBookFullName('')).toBe('')
  })
})
