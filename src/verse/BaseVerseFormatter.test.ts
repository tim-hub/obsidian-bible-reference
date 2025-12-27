import { BaseVerseFormatter } from './BaseVerseFormatter'
import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from '../data/constants'
import { VerseReference } from '../utils/splitBibleReference'
import { BibleVerseFormat } from '../data/BibleVerseFormat'
import { BibleVerseNumberFormat } from '../data/BibleVerseNumberFormat'
import { BibleVerseSegmentSeparatorFormat } from '../data/BibleVerseSegmentSeparatorFormat'
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
  it('should add separators for chapter changes in list mode (default: with chapter number)', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      verseFormatting: BibleVerseFormat.SingleLine,
      verseNumberFormatting: BibleVerseNumberFormat.Period,
      showChapterNumberInSeparator: true,
    }
    const verseReference: VerseReference = {
      bookName: 'John',
      chapterNumber: 3,
      verseNumber: 36,
      ranges: [{ chapterNumber: 3, verseNumber: 36 }],
    }
    const verses = [
      {
        book_id: 'John',
        book_name: 'John',
        chapter: 3,
        verse: 36,
        text: 'v36',
      },
      { book_id: 'John', book_name: 'John', chapter: 4, verse: 1, text: 'v1' },
    ]
    const formatter = new MockFormatter(settings, verseReference, verses)
    const expected = '> 36. v36\n> ---\n> 4\n> ---\n> 1. v1'
    expect(formatter.bodyContent).toBe(expected)
  })

  it('should add separators for chapter changes in list mode without chapter number when disabled', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      verseFormatting: BibleVerseFormat.SingleLine,
      verseNumberFormatting: BibleVerseNumberFormat.Period,
      showChapterNumberInSeparator: false,
    }
    const verseReference: VerseReference = {
      bookName: 'John',
      chapterNumber: 3,
      verseNumber: 36,
      ranges: [{ chapterNumber: 3, verseNumber: 36 }],
    }
    const verses = [
      {
        book_id: 'John',
        book_name: 'John',
        chapter: 3,
        verse: 36,
        text: 'v36',
      },
      { book_id: 'John', book_name: 'John', chapter: 4, verse: 1, text: 'v1' },
    ]
    const formatter = new MockFormatter(settings, verseReference, verses)
    const expected = '> 36. v36\n> ---\n> 1. v1'
    expect(formatter.bodyContent).toBe(expected)
  })

  it('should add separators with chapter number in paragraph mode', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      verseFormatting: BibleVerseFormat.Paragraph,
      verseNumberFormatting: BibleVerseNumberFormat.Period,
      showChapterNumberInSeparator: true,
    }
    const verseReference: VerseReference = {
      bookName: 'John',
      chapterNumber: 3,
      verseNumber: 5,
      ranges: [{ chapterNumber: 3, verseNumber: 5 }],
    }
    const verses = [
      { book_id: 'John', book_name: 'John', chapter: 3, verse: 5, text: 'v5' },
      { book_id: 'John', book_name: 'John', chapter: 4, verse: 1, text: 'v1' },
    ]
    const formatter = new MockFormatter(settings, verseReference, verses)
    const expected = '> 5. v5\n>\n> ---\n> 4\n> ---\n> 1. v1'
    expect(formatter.bodyContent).toBe(expected)
  })

  it('should add separators for verse gaps in same chapter (Single Line)', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      verseFormatting: BibleVerseFormat.SingleLine,
      verseNumberFormatting: BibleVerseNumberFormat.Period,
      verseSegmentSeparatorFormat:
        BibleVerseSegmentSeparatorFormat.VerseSeparator,
    }
    const verseReference: VerseReference = {
      bookName: 'John',
      chapterNumber: 3,
      verseNumber: 16,
      ranges: [{ chapterNumber: 3, verseNumber: 16 }],
    }
    const verses = [
      {
        book_id: 'John',
        book_name: 'John',
        chapter: 3,
        verse: 16,
        text: 'v16',
      },
      {
        book_id: 'John',
        book_name: 'John',
        chapter: 3,
        verse: 19,
        text: 'v19',
      },
    ]
    const formatter = new MockFormatter(settings, verseReference, verses)
    const expected = '> 16. v16\n> ---\n> 19. v19'
    expect(formatter.bodyContent).toBe(expected)
  })

  it('should add separators for verse gaps in same chapter (Paragraph)', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      verseFormatting: BibleVerseFormat.Paragraph,
      verseNumberFormatting: BibleVerseNumberFormat.Period,
      verseSegmentSeparatorFormat:
        BibleVerseSegmentSeparatorFormat.VerseSeparator,
    }
    const verseReference: VerseReference = {
      bookName: 'John',
      chapterNumber: 3,
      verseNumber: 16,
      ranges: [{ chapterNumber: 3, verseNumber: 16 }],
    }
    const verses = [
      {
        book_id: 'John',
        book_name: 'John',
        chapter: 3,
        verse: 16,
        text: 'v16',
      },
      {
        book_id: 'John',
        book_name: 'John',
        chapter: 3,
        verse: 19,
        text: 'v19',
      },
    ]
    const formatter = new MockFormatter(settings, verseReference, verses)
    const expected = '> 16. v16\n>\n> ---\n> 19. v19'
    expect(formatter.bodyContent).toBe(expected)
  })
})
