import { TRANSLATION_VERSION_KEY_REG } from './regs'

describe('test book name reg matching in different languages', () => {
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



