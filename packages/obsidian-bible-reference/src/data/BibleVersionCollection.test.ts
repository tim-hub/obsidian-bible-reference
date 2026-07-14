import {
  getBibleVersion,
  DEFAULT_BIBLE_VERSION,
  DEFAULT_BIBLE_VERSION_KEY,
} from './BibleVersionCollection'

describe('test getBibleVersion', () => {
  it('should return the correct version for a valid key', () => {
    const result = getBibleVersion('kjv')
    expect(result.key).toBe('kjv')
  })

  it('should return default version for invalid key', () => {
    const result = getBibleVersion('invalid-key-that-does-not-exist')
    expect(result).toBe(DEFAULT_BIBLE_VERSION)
    expect(result.key).toBe(DEFAULT_BIBLE_VERSION_KEY)
  })

  it('should return default version for empty key', () => {
    const result = getBibleVersion('')
    expect(result).toBe(DEFAULT_BIBLE_VERSION)
  })
})
