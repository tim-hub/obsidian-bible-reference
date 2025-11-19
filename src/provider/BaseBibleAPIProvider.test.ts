import { BibleAPIDotComProvider } from './BibleAPIDotComProvider'
import { IBibleVersion } from '../interfaces/IBibleVersion'

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

  // All books from the reflyAbbreviations array
  const bibleBooks = [
    'Genesis',
    'Exodus',
    'Leviticus',
    'Numbers',
    'Deuteronomy',
    'Joshua',
    'Judges',
    'Ruth',
    '1 Samuel',
    '2 Samuel',
    '1 Kings',
    '2 Kings',
    '1 Chronicles',
    '2 Chronicles',
    'Ezra',
    'Nehemiah',
    'Esther',
    'Job',
    'Psalm',
    'Psalms',
    'Proverbs',
    'Ecclesiastes',
    'Song of Solomon',
    'Isaiah',
    'Jeremiah',
    'Lamentations',
    'Ezekiel',
    'Daniel',
    'Hosea',
    'Joel',
    'Amos',
    'Obadiah',
    'Jonah',
    'Micah',
    'Nahum',
    'Habakkuk',
    'Zephaniah',
    'Haggai',
    'Zechariah',
    'Malachi',
    'Matthew',
    'Mark',
    'Luke',
    'John',
    'Acts',
    'Romans',
    '1 Corinthians',
    '2 Corinthians',
    'Galatians',
    'Ephesians',
    'Philippians',
    'Colossians',
    '1 Thessalonians',
    '2 Thessalonians',
    '1 Timothy',
    '2 Timothy',
    'Titus',
    'Philemon',
    'Hebrews',
    'James',
    '1 Peter',
    '2 Peter',
    '1 John',
    '2 John',
    '3 John',
    'Jude',
    'Revelation',
  ]

  let provider: BibleAPIDotComProvider

  beforeEach(() => {
    provider = new BibleAPIDotComProvider(mockBibleVersion)
  })

  describe('Ref.ly URLs should not return 404', () => {
    it.each(bibleBooks)(
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
