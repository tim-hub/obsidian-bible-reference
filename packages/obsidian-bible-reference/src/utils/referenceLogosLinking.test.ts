import { getLogosUrl, getLogosTranslation } from './referenceLogosLinking'
import { BibleReferencePluginSettings } from '../data/constants'

describe('referenceLogosLinking', () => {
  test('should generate correct Logos URL for single verse', () => {
    const url = getLogosUrl('esv', 'Genesis', 1, 1)
    expect(url).toBe('https://ref.ly/logosres/esv?ref=BibleESV.Ge1.1')
  })

  test('should generate correct Logos URL for verse range', () => {
    const url = getLogosUrl('esv', 'Genesis', 1, 1, 5)
    expect(url).toBe('https://ref.ly/logosres/esv?ref=BibleESV.Ge1.1-5')
  })

  test('should generate correct Logos URL for different translation', () => {
    const url = getLogosUrl('nasb', 'John', 3, 16)
    expect(url).toBe('https://ref.ly/logosres/nasb95?ref=BibleNASB.Jn3.16')
  })

  test('should generate correct Logos URL for LSB', () => {
    const url = getLogosUrl('lsb', 'Mark', 1, 15)
    expect(url).toBe('https://ref.ly/logosres/lgcystndrdbblsb?ref=Bible.Mk1.15')
  })

  test('should generate correct Logos URL for MSG', () => {
    const url = getLogosUrl('msg', 'Genesis', 1, 1)
    expect(url).toBe('https://ref.ly/logosres/message?ref=Bible.Ge1.1')
  })

  test('should throw error for unknown book', () => {
    expect(() => getLogosUrl('esv', 'UnknownBook', 1, 1)).toThrow()
  })

  test('getLogosTranslation keeps a Logos-supported version', () => {
    const settings = {} as BibleReferencePluginSettings
    expect(getLogosTranslation(settings, 'esv')).toBe('esv')
  })

  test('getLogosTranslation falls back to logosFallbackVersion when unsupported', () => {
    const settings = {
      logosFallbackVersion: 'nasb',
    } as BibleReferencePluginSettings
    expect(getLogosTranslation(settings, 'bbe')).toBe('nasb')
  })
})
