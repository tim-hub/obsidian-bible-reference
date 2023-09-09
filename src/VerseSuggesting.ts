import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from './data/constants'
import { BibleVersionCollection } from './data/BibleVersionCollection'
import { IBibleVersion } from './interfaces/IBibleVersion'
import { IVerse } from './interfaces/IVerse'
import { BibleVerseNumberFormat } from './data/BibleVerseNumberFormat'
import { BibleVerseFormat } from './data/BibleVerseFormat'
import { IVerseSuggesting } from './verse/IVerseSuggesting'
import { ProviderFactory } from './provider/ProviderFactory'
import { BaseBibleAPIProvider } from './provider/BaseBibleAPIProvider'


export class VerseSuggesting implements IVerseSuggesting {
  public text: string
  public verses: string
  public bibleVersion: string
  private bibleProvider: BaseBibleAPIProvider

  constructor(
    public settings: BibleReferencePluginSettings,
    public bookName: string,
    public chapterNumber: number,
    public verseNumber: number,
    public verseNumberEnd?: number
  ) {
    this.bookName = bookName
    this.chapterNumber = chapterNumber
    this.verseNumber = verseNumber
    this.verseNumberEnd = verseNumberEnd
    this.bibleVersion = settings.bibleVersion
  }

  /**
   * To get the content of the bible verses
   * @constructor
   */
  public get ReplacementContent(): string {
    let content = this.formatCallout(this.settings.formatString)

    return content
  }

  public async getVerses(): Promise<IVerse[]> {
    console.debug(this.bibleVersion)
    if (this.bibleVersion === DEFAULT_SETTINGS.bibleVersion) {
      console.debug('match to default language plus version')
    }
    const bibleVersion =
      BibleVersionCollection.find(
        (bv: IBibleVersion) => bv.key === this.bibleVersion
      ) ?? BibleVersionCollection[0]
    if (
      !this.bibleProvider ||
      this.bibleProvider.BibleVersionKey !== bibleVersion?.key
    ) {
      // make sure this is only 1 adapter, and it is the same bible version
      this.bibleProvider =
        ProviderFactory.Instance.BuildBibleVersionAPIAdapterFromIBibleVersion(
          bibleVersion
        )
    }
    return this.bibleProvider.query(
      this.bookName,
      this.chapterNumber,
      this?.verseNumberEnd
        ? [this.verseNumber, this.verseNumberEnd]
        : [this.verseNumber]
    )
  }

  private formatCallout(formatString: string): string {
    let verseFormatString = this.verseNumber.toString()
    if(this.verseNumberEnd != undefined) verseFormatString += '-' + this.verseNumberEnd
    return formatString
        .replaceAll('{{bible_version}}', this.bibleVersion)
        .replaceAll('{{book}}', this.bookName)
        .replaceAll('{{chapter}}', this.chapterNumber.toString())
        .replaceAll('{{verse_range}}', verseFormatString)
        .replaceAll('{{verse_reference_link}}', this.getVerseReference())
        .replaceAll('{{content}}', this.text)
  }

  private formatVerseNumber(verseNumber: number | string) {
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

  public async fetchAndSetVersesText(): Promise<void> {
    // todo add a caching here, this might not be possible with Obsidian limit
    const verses = await this.getVerses()
    let text = ''

    if (this.settings.verseFormatting === BibleVerseFormat.Paragraph) {
      text = '> '
    } else {
      text = ''
    }
    verses.forEach((verse) => {
      const verseNumberFormatted = this.formatVerseNumber(verse.verse)
      if (this.settings.verseFormatting === BibleVerseFormat.Paragraph) {
        text +=
          ' ' + verseNumberFormatted + verse.text.trim().replaceAll('\n', ' ')
      } else {
        text += '> ' + verseNumberFormatted + verse.text.trim() + '\n'
      }
    })
    this.text = text.trim()
  }

  public getVerseReference(): string {
    return ` [${
      this.bibleProvider.BibleReferenceHead
    } - ${this.bibleVersion.toUpperCase()}](${this.bibleProvider.VerseLinkURL})`
  }

  /**
   * Render for use in editor/modal suggest
   */
  public renderSuggestion(el: HTMLElement) {
    const outer = el.createDiv({ cls: 'obr-suggester-container' })
    outer.createDiv({ cls: 'obr-shortcode' }).setText(this.text)
  }
}
