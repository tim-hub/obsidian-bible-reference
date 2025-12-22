import { BaseVerseFormatter } from './BaseVerseFormatter'
import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from '../data/constants'
import { VerseReference } from '../utils/splitBibleReference'
import { BibleVerseFormat } from '../data/BibleVerseFormat'
import { BibleVerseNumberFormat } from '../data/BibleVerseNumberFormat'
import { IVerse } from '../interfaces/IVerse'

class MockFormatter extends BaseVerseFormatter {
  constructor(
    settings: BibleReferencePluginSettings,
    verseReference: VerseReference,
    verses: IVerse[]
  ) {
    super(settings, verseReference)
    this.verses = verses
  }
  protected getVerseReferenceLink(): string {
    return 'link'
  }
}

describe('BaseVerseFormatter', () => {
  it('should add separators for non-contiguous verses in list mode', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      verseFormatting: BibleVerseFormat.SingleLine,
      verseNumberFormatting: BibleVerseNumberFormat.Period,
    }
    const verseReference = { bookName: 'John', chapterVerseRanges: [] }
    const verses = [
      { book_name: 'John', chapter: 3, verse: 5, text: 'v5' },
      { book_name: 'John', chapter: 3, verse: 8, text: 'v8' },
    ]
    const formatter = new MockFormatter(settings, verseReference, verses)
    const expected = '> 5. v5\n> ---\n> 8. v8'
    expect(formatter.bodyContent).toBe(expected)
  })

  it('should add separators with chapter number for chapter changes in list mode', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      verseFormatting: BibleVerseFormat.SingleLine,
      verseNumberFormatting: BibleVerseNumberFormat.Period,
    }
    const verseReference = { bookName: 'John', chapterVerseRanges: [] }
    const verses = [
      { book_name: 'John', chapter: 3, verse: 36, text: 'v36' },
      { book_name: 'John', chapter: 4, verse: 1, text: 'v1' },
    ]
    const formatter = new MockFormatter(settings, verseReference, verses)
    // Note: New format includes chapter number
    const expected = '> 36. v36\n> ---\n> 4\n> ---\n> 1. v1'
    expect(formatter.bodyContent).toBe(expected)
  })

  it('should add separators with chapter number in paragraph mode', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      verseFormatting: BibleVerseFormat.Paragraph,
      verseNumberFormatting: BibleVerseNumberFormat.Period,
    }
    const verseReference = { bookName: 'John', chapterVerseRanges: [] }
    const verses = [
      { book_name: 'John', chapter: 3, verse: 5, text: 'v5' },
      { book_name: 'John', chapter: 4, verse: 1, text: 'v1' },
    ]
    const formatter = new MockFormatter(settings, verseReference, verses)
    const expected = '> 5. v5 --- Chapter 4 --- 1. v1'
    expect(formatter.bodyContent).toBe(expected)
  })
})
