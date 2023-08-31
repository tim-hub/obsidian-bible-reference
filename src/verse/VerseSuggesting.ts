import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from '../data/constants'
import { BibleVersionCollection } from '../data/BibleVersionCollection'
import { IBibleVersion } from '../interfaces/IBibleVersion'
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

  public get bottom(): string {
    let bottom = super.bottom
    bottom += ' %%'
    bottom += this.settings?.bookTagging
      ? ` #${this.verseReference.bookName}`
      : ''
    bottom += this.settings?.chapterTagging
      ? ` #${
        this.verseReference.bookName + this.verseReference.chapterNumber
      }`
      : ''
    bottom += ' %%'
    return bottom
  }

  /**
   * Render for use in editor/modal suggest
   */
  public renderSuggestion(el: HTMLElement) {
    const outer = el.createDiv({ cls: 'obr-suggester-container' })
    // @ts-ignore
    outer.createDiv({ cls: 'obr-shortcode' }).setText(this.bodyContent)
  }

  public async fetchAndSetVersesText(): Promise<void> {
    // todo add a caching here, this might not be possible with Obsidian limit
    this.verses = await this.getVerses()
  }

  protected getVerseReferenceLink(): string {
    return ` [${
      this.bibleProvider.BibleReferenceHead
    } - ${this.bibleVersion.toUpperCase()}](${this.bibleProvider.VerseLinkURL})`
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
      this.verseReference.bookName,
      this.verseReference.chapterNumber,
      this.verseReference?.verseNumberEnd
        ? [this.verseReference.verseNumber, this.verseReference.verseNumberEnd]
        : [this.verseReference.verseNumber]
    )
  }
}
