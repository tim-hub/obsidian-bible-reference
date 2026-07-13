import { BOOK_REG, BOOK_VERSE_REG } from './regs'

describe('test book name reg matching in different languages', () => {
  test('should match book name in English', () => {
    const bookName = 'John'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in Italian', () => {
    const bookName = 'Giovanni'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in Japanese', () => {
    const bookName = 'ヨハネ'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in Spanish', () => {
    const bookName = 'Juan'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in Chinese', () => {
    const bookName = '约翰福音'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in French', () => {
    const bookName = 'Josué'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should not cover just one letter', () => {
    const bookName = 'J'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(false)
  })
})

describe('test modal reg matching in different languages', () => {
  test('should match modal in English', () => {
    const modal = 'John 1:1'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(modal)).toBe(true)
  })

  test('should match modal in English Without Space', () => {
    const modal = 'John1:1'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(modal)).toBe(true)
  })

  test('should match book name in French', () => {
    const bookName = 'Josué1:1'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in Chinese', () => {
    const bookName = '约翰福音2:1'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should not match if use letter for number', () => {
    const modal = 'John a:1'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(modal)).toBe(false)
  })
})

describe('cross-chapter regex matching', () => {
  test('should match cross-chapter reference', () => {
    const ref = 'Hebrews 9:1-10:14'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(ref)).toBe(true)
  })

  test('should match cross-chapter reference without space', () => {
    const ref = 'Hebrews9:1-10:14'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(ref)).toBe(true)
  })

  test('should capture full cross-chapter reference', () => {
    const ref = 'Hebrews 9:1-10:14'
    const match = ref.match(BOOK_VERSE_REG)
    expect(match?.[0]).toBe('Hebrews 9:1-10:14')
  })

  test('should match numbered book cross-chapter', () => {
    const ref = '1 Corinthians 15:50-16:4'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(ref)).toBe(true)
  })

  test('should still match same-chapter verse range', () => {
    const ref = 'John 3:16-21'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(ref)).toBe(true)
  })

  test('should still match single verse', () => {
    const ref = 'John 3:16'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(ref)).toBe(true)
  })
})
