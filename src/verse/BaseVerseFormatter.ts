import { BibleReferencePluginSettings } from '../data/constants'
import { BibleVerseReferenceLinkPosition } from '../data/BibleVerseReferenceLinkPosition'
import { BibleVerseNumberFormat } from '../data/BibleVerseNumberFormat'
import { VerseReference } from '../utils/splitBibleReference'
import { BibleVerseFormat } from '../data/BibleVerseFormat'
import { IVerse } from '../interfaces/IVerse'

export abstract class BaseVerseFormatter {
  protected settings: BibleReferencePluginSettings
  protected verseReference: VerseReference

  protected verses?: IVerse[] = []

  protected constructor(
    settings: BibleReferencePluginSettings,
    verseReference: VerseReference,
    verseTexts?: string[]
  ) {
    this.settings = settings
    this.verseReference = verseReference
    const { bookName, chapterNumber, verseNumber, verseNumberEnd } =
      this.verseReference
    if (verseNumberEnd && verseNumberEnd - verseNumber !== verseTexts?.length) {
      console.error('Verse text length does not match verse numbers')
    }
    const verses: IVerse[] = verseTexts?.map((verse, index) => {
      return {
        book_name: bookName,
        chapter: chapterNumber,
        verse: verseNumber + index,
        text: verse,
      }
    })
    this.verses = verses
  }

  /**
   * To get the content of the bible verses
   */
  public get allFormatedContent(): string {
    if (!this.verses?.length) {
      console.error('No verses found')
    }
    return [this.head, this.bodyContent, this.bottom].join('\n')
  }

  public get bodyContent(): string {
    if (!this.verses?.length) {
      return ''
    }
    let text = ''
    if (this.settings?.verseFormatting === BibleVerseFormat.Paragraph) {
      text = '> '
    } else {
      text = ''
    }
    this.verses.forEach((verse) => {
      const verseNumberFormatted = this.formatVerseNumber(verse.verse)
      if (this.settings?.verseFormatting === BibleVerseFormat.Paragraph) {
        text +=
          ' ' + verseNumberFormatted + verse.text.trim().replaceAll('\n', ' ')
      } else {
        text += '> ' + verseNumberFormatted + verse.text.trim() + '\n'
      }
    })
    console.debug('text', text)
    return text.trim()
  }

  protected get head(): string {
    let head = `> [!Bible]`

    if (this.settings?.collapsibleVerses) {
      head += '-'
    }
    if (
      this.settings.referenceLinkPosition ===
        BibleVerseReferenceLinkPosition.Header ||
      this.settings.referenceLinkPosition ===
        BibleVerseReferenceLinkPosition.AllAbove
    ) {
      head += this.getVerseReferenceLink()
    }

    return head
  }

  protected get bottom(): string {
    let bottom = ''
    if (
      this.settings.referenceLinkPosition ===
        BibleVerseReferenceLinkPosition.Bottom ||
      this.settings.referenceLinkPosition ===
        BibleVerseReferenceLinkPosition.AllAbove
    ) {
      bottom += `> \n ${this.getVerseReferenceLink()}`
    }
    return bottom
  }

  protected abstract getVerseReferenceLink(): string

  protected formatVerseNumber(verseNumber: number | string) {
    let verseNumberFormatted = ''
    switch (this.settings.verseNumberFormatting) {
      case BibleVerseNumberFormat.Period:
        verseNumberFormatted += verseNumber + '. '
        return verseNumberFormatted
      case BibleVerseNumberFormat.PeriodParenthesis:
        verseNumberFormatted += verseNumber + '.) '
        return verseNumberFormatted
      case BibleVerseNumberFormat.Parenthesis:
        verseNumberFormatted += verseNumber + ') '
        return verseNumberFormatted
      case BibleVerseNumberFormat.Dash:
        verseNumberFormatted += verseNumber + ' - '
        return verseNumberFormatted
      case BibleVerseNumberFormat.NumberOnly:
        verseNumberFormatted += verseNumber + ' '
        return verseNumberFormatted
      case BibleVerseNumberFormat.SuperScript:
        verseNumberFormatted += '<sup> ' + verseNumber + ' </sup>'
        return verseNumberFormatted
      case BibleVerseNumberFormat.SuperScriptBold:
        verseNumberFormatted += '<sup> **' + verseNumber + '** </sup>'
        return verseNumberFormatted
      case BibleVerseNumberFormat.None:
        verseNumberFormatted = ' '
        return verseNumberFormatted
      default:
        verseNumberFormatted += verseNumber + '. '
        return verseNumberFormatted
    }
  }
}
