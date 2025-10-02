import { BibleReferencePluginSettings } from '../data/constants'
import { BibleVerseReferenceLinkPosition } from '../data/BibleVerseReferenceLinkPosition'
import { BibleVerseNumberFormat } from '../data/BibleVerseNumberFormat'
import { VerseReference } from '../utils/splitBibleReference'
import { BibleVerseFormat } from '../data/BibleVerseFormat'
import { IVerse } from '../interfaces/IVerse'
import { getBLBLink } from '../utils/referenceBLBAltLinking'

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
    this.verses = verseTexts?.map((verse, index) => {
      return {
        book_name: bookName,
        chapter: chapterNumber,
        verse: verseNumber + index,
        text: verse,
      }
    })
  }

  /**
   * To get the content of the bible verses
   */
  public get allFormattedContent(): string {
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
    this.verses.forEach((verse, index) => {
      let singleVerseText = verse.text.trim()
      if (
        index === this.verses!.length - 1 &&
        singleVerseText.endsWith('<br/>')
      ) {
        // Remove the last <br/> tag that appears in LSB verses.
        singleVerseText = singleVerseText.slice(0, -5)
      }
      const verseNumberFormatted = this.formatVerseNumber(verse.verse)
      if (this.settings?.verseFormatting === BibleVerseFormat.Paragraph) {
        text +=
          ' ' + verseNumberFormatted + singleVerseText.replaceAll('\n', ' ')
      } else {
        text +=
          '> ' +
          verseNumberFormatted +
          singleVerseText.replace(/\r\n|\n|\r/g, ' ') +
          '\n'
        // Remove extraneous line breaks in KJV verses.
      }
    })
    console.debug('text', text)
    return text.trim()
  }

  protected get head(): string {
    let head = `> `

    if (this.settings.displayBibleIconPrefixAtHeader) {
      head += '[!bible]'

      if (this.settings?.collapsibleVerses) {
        if (this.settings.collapsedByDefault) {
          head += '-'
        } else {
          head += '+'
        }
      }
    }

    if (
      this.settings.referenceLinkPosition ===
        BibleVerseReferenceLinkPosition.Header ||
      this.settings.referenceLinkPosition ===
        BibleVerseReferenceLinkPosition.AllAbove
    ) {
      // Conditional BLB link
      if (this.settings.versionCodeBLB && this.settings.enableHyperlinking) {
        head += getBLBLink(this.settings, this.verseReference)
      } else {
        head += this.getVerseReferenceLink()
      }
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
      bottom += `> \n `
      // Conditional BLB link
      if (this.settings.versionCodeBLB && this.settings.enableHyperlinking) {
        bottom += getBLBLink(this.settings, this.verseReference)
      } else {
        bottom += this.getVerseReferenceLink()
      }
    }
    return bottom
  }

  protected abstract getVerseReferenceLink(): string

  protected getVerseLink(verseNumber: number): string {
    const { bookName, chapterNumber } = this.verseReference
    const verseNumberLinkFormat = this.settings.internalLinkingFormat || 'None'
    if (verseNumberLinkFormat === 'None') return ''
    const verseNumStr = verseNumber.toString()
    switch (verseNumberLinkFormat) {
      case '[[Book Chapter#^Verse|Verse]]':
        return `[[${bookName} ${chapterNumber}#^${verseNumStr}|${verseNumStr}]]`
      case '[[Book Chapter#Verse|Verse]]':
        return `[[${bookName} ${chapterNumber}#${verseNumStr}|${verseNumStr}]]`
      case '[[Book Chapter.Verse|Verse]]':
        return `[[${bookName} ${chapterNumber}.${verseNumStr}|${verseNumStr}]]`
      default:
        return ''
    }
  }

  protected formatVerseNumber(verseNumber: number | string): string {
    const verseNumStr2 = verseNumber.toString()
    const verseNumLink = this.getVerseLink(Number(verseNumber))
    const verseNumberFormatted = verseNumLink || verseNumStr2

    switch (this.settings.verseNumberFormatting) {
      case BibleVerseNumberFormat.Period:
        return verseNumberFormatted + '. '
      case BibleVerseNumberFormat.PeriodParenthesis:
        return verseNumberFormatted + '.) '
      case BibleVerseNumberFormat.Parenthesis:
        return verseNumberFormatted + ') '
      case BibleVerseNumberFormat.Dash:
        return verseNumberFormatted + ' - '
      case BibleVerseNumberFormat.NumberOnly:
        return verseNumberFormatted + ' '
      case BibleVerseNumberFormat.SuperScript:
        return `<sup>${verseNumberFormatted}</sup> `
      case BibleVerseNumberFormat.SuperScriptBold:
        return `<sup>**${verseNumberFormatted}**</sup> `
      case BibleVerseNumberFormat.SuperScriptItalic:
        return `<sup>*${verseNumberFormatted}*</sup> `
      case BibleVerseNumberFormat.Bold:
        return `**${verseNumberFormatted}** `
      case BibleVerseNumberFormat.Italic:
        return `*${verseNumberFormatted}* `
      case BibleVerseNumberFormat.None:
        return ' '
      default:
        return verseNumberFormatted + '. '
    }
  }
}
