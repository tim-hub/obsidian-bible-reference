import { getBookOsis, getBookFullName } from './bookNameReference'

describe('test bookNameReference', () => {
  // Test for getBookOsis function
  it('should return the OSIS book code', () => {
    expect(getBookOsis('Genesis')).toBe('Gen')
    expect(getBookOsis('John')).toBe('John')
    expect(getBookOsis('1 John')).toBe('1John')
    expect(getBookOsis('2chron')).toBe('2Chr')
  })

  // Test for getBookFullName function using two-step approach
  it('should expand abbreviated book names to full names', () => {
    expect(getBookFullName('jn')).toBe('John')
    expect(getBookFullName('gen')).toBe('Genesis')
    expect(getBookFullName('mat')).toBe('Matthew')
    expect(getBookFullName('matt')).toBe('Matthew')
    expect(getBookFullName('mar')).toBe('Mark')
    expect(getBookFullName('mk')).toBe('Mark')
    expect(getBookFullName('lk')).toBe('Luke')
    expect(getBookFullName('2chron')).toBe('2 Chronicles') // The main regression case!
    expect(getBookFullName('1chron')).toBe('1 Chronicles')
    expect(getBookFullName('1jn')).toBe('1 John')
    expect(getBookFullName('2cor')).toBe('2 Corinthians')
  })

  it('should handle case insensitive abbreviations', () => {
    expect(getBookFullName('JN')).toBe('John')
    expect(getBookFullName('GEN')).toBe('Genesis')
    expect(getBookFullName('2CHRON')).toBe('2 Chronicles')
    expect(getBookFullName('Mat')).toBe('Matthew')
  })

  it('should return full book names unchanged', () => {
    expect(getBookFullName('John')).toBe('John')
    expect(getBookFullName('Genesis')).toBe('Genesis')
    expect(getBookFullName('Matthew')).toBe('Matthew')
    expect(getBookFullName('Mark')).toBe('Mark')
    expect(getBookFullName('2 Chronicles')).toBe('2 Chronicles')
  })

  it('should handle invalid book names gracefully', () => {
    expect(getBookFullName('invalidbook')).toBe('invalidbook')
    expect(getBookFullName('')).toBe('')
  })
})
