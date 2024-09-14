import { BOOK_REG, MODAL_REG } from './regs'

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
})
