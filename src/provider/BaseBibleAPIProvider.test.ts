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

  describe('Ref.ly URLs should not redirect to base URL', () => {
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

        // Test that the URL doesn't redirect to the base ref.ly page
        // Invalid links redirect to https://ref.ly/ without the reference
        const response = await fetch(reflyUrl, {
          method: 'HEAD', // Use HEAD to avoid downloading the full page
          redirect: 'follow',
        })

        // Check that the final URL after redirects is not just the base URL
        // The redirect response that ref.ly gives when sending to base url.
        expect(response.url).not.toBe('https://ref.ly/')
        expect(response.ok).toBe(true)
      },
      30000 // 30 second timeout for network requests
    )
  })

  describe('1 Samuel with spaces in book abbreviation', () => {
    it('should return 307 status from refly', async () => {
      const response = await fetch('https://ref.ly/1', {
        method: 'HEAD',
        redirect: 'follow',
      })
      expect(response.url).toBe('https://ref.ly/')
    })
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
