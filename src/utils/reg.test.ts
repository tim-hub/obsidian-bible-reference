import { BOOK_REG, MODAL_REG, TRANSLATION_VERSION_KEY_REG, } from './regs'

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
    const reg = new RegExp(MODAL_REG)
    expect(reg.test(modal)).toBe(true)
  })

  test('should match modal in English Withou Space', () => {
    const modal = 'John1:1'
    const reg = new RegExp(MODAL_REG)
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
    const reg = new RegExp(MODAL_REG)
    expect(reg.test(modal)).toBe(false)
  })

  test('should not match version with only book name', () => {
    const modal = 'John1:1-esv'
    const reg = new RegExp(TRANSLATION_VERSION_KEY_REG)
    expect(reg.test(modal)).toBe(false)
  })

  test('should match version with @ starting', () => {
    const modal = 'esv'
    const reg = new RegExp(TRANSLATION_VERSION_KEY_REG)
    expect(reg.test(modal)).toBe(true)
  })
  
  test('should match version with numbers', () => {
    const modal = 'niv2011'
    const reg = new RegExp(TRANSLATION_VERSION_KEY_REG)
    expect(reg.test(modal)).toBe(true)
  })

  test('should match even when there is hyphen', () => {
    const modal = 'oeb-cw'
    const reg = new RegExp(TRANSLATION_VERSION_KEY_REG)
    expect(reg.test(modal)).toBe(true)
  })

  test('should not match if it includes multiple -', () => {
    const modal = 'oeb--cw'
    const reg = new RegExp(TRANSLATION_VERSION_KEY_REG)
    expect(reg.test(modal)).toBe(false)
  })
})
