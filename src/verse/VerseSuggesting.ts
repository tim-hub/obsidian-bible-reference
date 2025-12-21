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
import { getBLBUrl } from '../utils/referenceBLBAltLinking'
import { getLogosUrl } from '../utils/referenceLogosLinking'
import { getBibleGatewayUrl } from '../utils/referenceLink'

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
    const outer = el.createDiv({ cls: 'obr-suggester-container' })
    // @ts-ignore
    outer.createDiv({ cls: 'obr-shortcode' }).setText(this.bodyContent)
  }

  public async fetchAndSetVersesText(): Promise<void> {
    // todo add a caching here, this might not be possible with Obsidian limit
    this.verses = await this.getVerses()
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

  protected getUrlForReference(): string {
    const sourceOfReference = this.settings.sourceOfReference || 'biblegateway'
    const { bookName, chapterNumber, verseNumber, verseNumberEnd } =
      this.verseReference

    // Helper function to generate Bible Gateway URL as fallback
    const getBibleGatewayFallback = (): string => {
      let versesString: string
      if (verseNumberEnd) {
        versesString = `${verseNumber}-${verseNumberEnd}`
      } else {
        versesString = verseNumber.toString()
      }
      return getBibleGatewayUrl(
        this.bibleVersion,
        bookName,
        chapterNumber,
        versesString
      )
    }

    switch (sourceOfReference) {
      case 'blb': {
        // Blue Letter Bible
        try {
          return getBLBUrl(
            this.bibleVersion,
            bookName,
            chapterNumber,
            verseNumber,
            verseNumberEnd
          )
        } catch (error) {
          console.error('Error generating BLB URL:', error)
          return getBibleGatewayFallback()
        }
      }

      case 'biblegateway': {
        // Bible Gateway
        try {
          let versesString: string
          if (verseNumberEnd) {
            versesString = `${verseNumber}-${verseNumberEnd}`
          } else {
            versesString = verseNumber.toString()
          }
          return getBibleGatewayUrl(
            this.bibleVersion,
            bookName,
            chapterNumber,
            versesString
          )
        } catch (error) {
          console.error('Error generating Bible Gateway URL:', error)
          return getBibleGatewayFallback()
        }
      }

      case 'logos': {
        // Logos
        try {
          return getLogosUrl(
            this.bibleVersion,
            bookName,
            chapterNumber,
            verseNumber,
            verseNumberEnd
          )
        } catch (error) {
          console.error('Error generating Logos URL:', error)
          return getBibleGatewayFallback()
        }
      }

      case 'original': {
        // Original (API provider's URL)
        // Ensure bibleProvider is initialized
        if (!this.bibleProvider) {
          const bibleVersion = getBibleVersion(this.bibleVersion)
          if (bibleVersion) {
            this.bibleProvider =
              ProviderFactory.Instance.BuildBibleVersionAPIAdapterFromIBibleVersion(
                bibleVersion
              )
          }
        }
        const originalUrl =
          this.bibleProvider?.getOriginalVerseReferenceLink() || ''
        return originalUrl || getBibleGatewayFallback()
      }

      default:
        return getBibleGatewayFallback()
    }
  }

  protected getVerseReferenceLink(): string {
    const head = this.bibleProvider.BibleReferenceHead
    const version = this.settings?.showVerseTranslation
      ? ` - ${this.bibleVersion.toUpperCase()}`
      : ''
    const label = `${head}${version}`

    // keep the original leading space that the previous implementation returned
    const leading = ' '

    if (this.settings?.enableHyperlinking) {
      return `${leading}[${label}](${this.getUrlForReference()})`
    }

    return `${leading}${label}`
  }
}
