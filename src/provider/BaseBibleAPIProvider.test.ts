import { BibleAPIDotComProvider } from './BibleAPIDotComProvider'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { bookNames } from '../data/abbreviations'

describe('BaseBibleAPIProvider - Ref.ly URL validation', () => {
  // Create a mock bible version for testing
  const mockBibleVersion: IBibleVersion = {
    key: 'kjv',
    name: 'King James Version',
    code: 'en',
    apiSource: {
      name: 'Bible API',
      apiUrl: 'https://bible-api.com',
    },
  }

  let provider: BibleAPIDotComProvider

  beforeEach(() => {
    provider = new BibleAPIDotComProvider(mockBibleVersion)
  })

  describe('Ref.ly URLs should not return 404', () => {
    it.each(bookNames)(
      'should return a valid URL for %s chapter 1',
      async (bookName) => {
        // Build the request URL which also sets the reflyUrl
        provider.buildRequestURL(bookName, 1, [])

        // Get the ref.ly URL
        const reflyUrl = provider.getExternalLinkUrl('Ref.ly (Logos)')

        // Verify the URL is constructed
        expect(reflyUrl).toBeTruthy()
        expect(reflyUrl).toContain('https://ref.ly/')

        // Test that the URL doesn't return 404
        const response = await fetch(reflyUrl, {
          method: 'HEAD', // Use HEAD to avoid downloading the full page
          redirect: 'follow',
        })

        expect(response.status).not.toBe(404)
        expect(response.ok).toBe(true)
      },
      30000 // 30 second timeout for network requests
    )
  })

  describe('Ref.ly URL format validation', () => {
    it('should generate correct URL format for Genesis 1', () => {
      provider.buildRequestURL('Genesis', 1, [])
      const reflyUrl = provider.getExternalLinkUrl('Ref.ly (Logos)')
      expect(reflyUrl).toBe('https://ref.ly/Ge1')
    })

    it('should generate correct URL format for John 3:16', () => {
      provider.buildRequestURL('John', 3, [16])
      const reflyUrl = provider.getExternalLinkUrl('Ref.ly (Logos)')
      expect(reflyUrl).toBe('https://ref.ly/Jn3.16')
    })

    it('should generate correct URL format for Psalm 23', () => {
      provider.buildRequestURL('Psalm', 23, [])
      const reflyUrl = provider.getExternalLinkUrl('Ref.ly (Logos)')
      expect(reflyUrl).toBe('https://ref.ly/Ps23')
    })

    it('should generate correct URL format for 1 Corinthians 13:1-13', () => {
      provider.buildRequestURL('1 Corinthians', 13, [1, 13])
      const reflyUrl = provider.getExternalLinkUrl('Ref.ly (Logos)')
      expect(reflyUrl).toBe('https://ref.ly/1Co13.1-13')
    })
  })
})
