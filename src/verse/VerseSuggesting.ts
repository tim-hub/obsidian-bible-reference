import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
  OutgoingLinkPositionEnum,
} from '../data/constants'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { IVerse } from '../interfaces/IVerse'
import { ProviderFactory } from '../provider/ProviderFactory'
import { BaseBibleAPIProvider } from '../provider/BaseBibleAPIProvider'
import { BaseVerseFormatter } from './BaseVerseFormatter'
import { IVerseSuggesting } from './IVerseSuggesting'

/**
 * Verse Suggesting
 * Pass Bible Book, Chapter, Verse Numbers to get Bible Content (verses)
 */
export class VerseSuggesting
  extends BaseVerseFormatter
  implements IVerseSuggesting
{
  public bibleVersion: string
  private bibleProvider: BaseBibleAPIProvider

  // todo make constructor consistent with other classes
  constructor(
    settings: BibleReferencePluginSettings,
    bookName: string,
    chapterNumber: number,
    verseNumber: number,
    verseNumberEnd?: number
  ) {
    super(settings, {
      bookName: bookName,
      chapterNumber: chapterNumber,
      verseNumber: verseNumber,
      verseNumberEnd: verseNumberEnd,
    })
    this.bibleVersion = settings.bibleVersion
  }

  public get head(): string {
    let content = super.head
    content +=
      this.settings?.bookBacklinking === OutgoingLinkPositionEnum.Header
        ? ` [[${this.verseReference.bookName}]]`
        : ''
    content +=
      this.settings?.chapterBacklinking === OutgoingLinkPositionEnum.Header
        ? ` [[${this.verseReference.bookName} ${this.verseReference.chapterNumber}]]`
        : ''
    return content
  }

  public get bottom(): string {
    let bottom = super.bottom
    if (this.settings?.bookTagging || this.settings?.chapterTagging) {
      bottom += ' %%'
      bottom += this.settings?.bookTagging
        ? ` #${this.verseReference.bookName.replace(/ /g, '')}` // Remove spaces from book names in tags
        : ''
      bottom += this.settings?.chapterTagging
        ? ` #${
            this.verseReference.bookName.replace(/ /g, '') +
            this.verseReference.chapterNumber // Remove spaces from book names in tags
          }`
        : ''
      bottom += ' %%'
    }
    if (
      this.settings?.bookBacklinking === OutgoingLinkPositionEnum.Bottom ||
      this.settings?.chapterBacklinking === OutgoingLinkPositionEnum.Bottom
    ) {
      bottom += '>\n '
      bottom +=
        this.settings?.bookBacklinking === OutgoingLinkPositionEnum.Bottom
          ? ` [[${this.verseReference.bookName}]]`
          : ''
      bottom +=
        this.settings?.chapterBacklinking === OutgoingLinkPositionEnum.Bottom
          ? ` [[${this.verseReference.bookName} ${this.verseReference.chapterNumber}]]`
          : ''
    }
    return bottom + '\n'
  }

  /**
   * Render for use in editor/modal suggest
   */
  public renderSuggestion(el: HTMLElement) {
    const outer = el.createEl('div', { cls: 'obr-suggester-container' })
    // @ts-ignore
    outer.createEl('div', { cls: 'obr-shortcode' }).setText(this.bodyContent)
  }

  public async fetchAndSetVersesText(): Promise<void> {
    // todo add a caching here, this might not be possible with Obsidian limit
    this.verses = await this.getVerses()

    // Validate verse count after fetching
    const { verseNumber, verseNumberEnd } = this.verseReference
    if (verseNumberEnd && this.verses) {
      const expectedLength = verseNumberEnd - verseNumber + 1
      if (this.verses.length !== expectedLength) {
        console.error('Fetched verse count does not match expected range')
        console.error('Debug info:', {
          verseNumber,
          verseNumberEnd,
          expectedLength,
          actualLength: this.verses.length,
          fetchedVerses: this.verses,
        })
      }
    }
  }

  public async getVerses(): Promise<IVerse[]> {
    console.debug(this.bibleVersion)
    if (this.bibleVersion === DEFAULT_SETTINGS.bibleVersion) {
      console.debug('match to default language plus version')
    }
    const bibleVersion = getBibleVersion(this.bibleVersion)
    if (
      !this.bibleProvider ||
      this.bibleProvider.BibleVersionKey !== bibleVersion?.key
    ) {
      // make sure this is only 1 adapter, and it is the same bible version
      this.bibleProvider =
        ProviderFactory.Instance.BuildBibleVersionAPIAdapterFromIBibleVersion(
          bibleVersion,
          this.settings
        )
    }
    return this.bibleProvider.query(
      this.verseReference.bookName,
      this.verseReference.chapterNumber,
      this.verseReference?.verseNumberEnd
        ? [this.verseReference.verseNumber, this.verseReference.verseNumberEnd]
        : [this.verseReference.verseNumber]
    )
  }

  protected getVerseReferenceLink(): string {
    let verseLink = ''
    if (
      this.settings?.showVerseTranslation &&
      this.settings?.enableHyperlinking
    ) {
      verseLink = ` [${
        this.bibleProvider.BibleReferenceHead
      } - ${this.bibleVersion.toUpperCase()}](${
        this.bibleProvider.VerseLinkURL
      })`
    } else if (
      this.settings?.showVerseTranslation &&
      !this.settings?.enableHyperlinking
    ) {
      verseLink = ` ${
        this.bibleProvider.BibleReferenceHead
      } - ${this.bibleVersion.toUpperCase()}`
    } else if (
      !this.settings?.showVerseTranslation &&
      this.settings?.enableHyperlinking
    ) {
      verseLink = ` [${this.bibleProvider.BibleReferenceHead}](${this.bibleProvider.VerseLinkURL})`
    } else {
      verseLink = ` ${this.bibleProvider.BibleReferenceHead}`
    }
    return verseLink
  }
}
