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
    const { bookName } = this.verseReference
    this.verses = []
    if (verseTexts && verseTexts.length > 0) {
      // Note: This legacy path for verseTexts might need more careful handling for multi-chapter
      // but most callers use getVerses() which sets this.verses directly.
      this.verses = verseTexts.map((verse, index) => {
        const firstRange = this.verseReference.chapterVerseRanges[0]
        return {
          book_name: bookName,
          chapter: firstRange?.chapterNumber || 1,
          verse: (firstRange?.verseNumber || 1) + index,
          text: verse,
        }
      })
    }
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
      text = '>'
    } else {
      text = ''
    }
    this.verses.forEach((verse, index) => {
      if (index > 0) {
        const prevVerse = this.verses![index - 1]
        // Add a separator if the chapter changes or if there is a gap in verses (comma selection)
        if (
          verse.chapter !== prevVerse.chapter ||
          verse.verse !== prevVerse.verse + 1
        ) {
          if (this.settings?.verseFormatting === BibleVerseFormat.Paragraph) {
            if (verse.chapter !== prevVerse.chapter) {
              text += ` --- Chapter ${verse.chapter} ---`
            } else {
              text += ' ---'
            }
          } else {
            if (verse.chapter !== prevVerse.chapter) {
              text += `> ---\n> ${verse.chapter}\n> ---\n`
            } else {
              text += '> ---\n'
            }
          }
        }
      }

      let singleVerseText = verse.text.trim()
      if (
        index === this.verses!.length - 1 &&
        singleVerseText.endsWith('<br/>')
      ) {
        // Remove the last <br/> tag that appears in LSB verses.
        singleVerseText = singleVerseText.slice(0, -5)
      }
      const verseNumberFormatted = this.formatVerseNumber(
        verse.verse,
        verse.chapter
      )
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
      bottom += `> \n `
      bottom += this.getVerseReferenceLink()
    }
    return bottom
  }

  protected abstract getVerseReferenceLink(): string

  protected getVerseLink(verseNumber: number, chapterNumber: number): string {
    const { bookName } = this.verseReference
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

  protected formatVerseNumber(
    verseNumber: number | string,
    chapterNumber: number
  ): string {
    const verseNumStr2 = verseNumber.toString()
    const verseNumLink = this.getVerseLink(Number(verseNumber), chapterNumber)
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
