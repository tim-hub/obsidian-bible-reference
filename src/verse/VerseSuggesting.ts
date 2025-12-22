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
import { VerseReference, getReferenceHead } from '../utils/splitBibleReference'

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
    verseReference: VerseReference
  ) {
    super(settings, verseReference)
    this.bibleVersion = settings.bibleVersion
  }

  public get head(): string {
    let content = super.head
    content +=
      this.settings?.bookBacklinking === OutgoingLinkPositionEnum.Header
        ? ` [[${this.verseReference.bookName}]]`
        : ''
    if (this.settings?.chapterBacklinking === OutgoingLinkPositionEnum.Header) {
      const uniqueChapters = Array.from(
        new Set(
          this.verseReference.chapterVerseRanges.map((r) => r.chapterNumber)
        )
      )
      uniqueChapters.forEach((chapter) => {
        content += ` [[${this.verseReference.bookName} ${chapter}]]`
      })
    }
    return content
  }

  public get bottom(): string {
    let bottom = super.bottom
    if (this.settings?.bookTagging || this.settings?.chapterTagging) {
      bottom += ' %%'
      bottom += this.settings?.bookTagging
        ? ` #${this.verseReference.bookName.replace(/ /g, '')}` // Remove spaces from book names in tags
        : ''
      if (this.settings?.chapterTagging) {
        const uniqueChapters = Array.from(
          new Set(
            this.verseReference.chapterVerseRanges.map((r) => r.chapterNumber)
          )
        )
        uniqueChapters.forEach((chapter) => {
          bottom += ` #${
            this.verseReference.bookName.replace(/ /g, '') + chapter
          }`
        })
      }
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
      if (
        this.settings?.chapterBacklinking === OutgoingLinkPositionEnum.Bottom
      ) {
        const uniqueChapters = Array.from(
          new Set(
            this.verseReference.chapterVerseRanges.map((r) => r.chapterNumber)
          )
        )
        uniqueChapters.forEach((chapter) => {
          bottom += ` [[${this.verseReference.bookName} ${chapter}]]`
        })
      }
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

    const allVerses: IVerse[] = []
    for (const range of this.verseReference.chapterVerseRanges) {
      const verses = await this.bibleProvider.query(
        this.verseReference.bookName,
        range.chapterNumber,
        range.verseEndNumber
          ? [range.verseNumber, range.verseEndNumber]
          : [range.verseNumber]
      )
      allVerses.push(...verses)
    }
    return allVerses
  }

  protected getUrlForReference(): string {
    const sourceOfReference = this.settings.sourceOfReference || 'biblegateway'
    const { bookName, chapterVerseRanges } = this.verseReference
    const firstRange = chapterVerseRanges[0]

    // Helper function to generate Bible Gateway URL as fallback
    const getBibleGatewayFallback = (): string => {
      let versesString = ''
      chapterVerseRanges.forEach((range, index) => {
        if (index > 0) {
          if (
            range.chapterNumber !== chapterVerseRanges[index - 1].chapterNumber
          ) {
            versesString += ';'
          } else {
            versesString += ','
          }
        }
        if (
          range.chapterNumber !==
          (chapterVerseRanges[index - 1]?.chapterNumber || -1)
        ) {
          versesString += `${range.chapterNumber}:`
        }
        versesString += range.verseEndNumber
          ? `${range.verseNumber}-${range.verseEndNumber}`
          : range.verseNumber.toString()
      })

      return getBibleGatewayUrl(
        this.bibleVersion,
        bookName,
        firstRange.chapterNumber,
        versesString
      )
    }

    switch (sourceOfReference) {
      case 'blb': {
        // Blue Letter Bible - currently only supports one range
        try {
          return getBLBUrl(
            this.bibleVersion,
            bookName,
            firstRange.chapterNumber,
            firstRange.verseNumber,
            firstRange.verseEndNumber
          )
        } catch (error) {
          console.error('Error generating BLB URL:', error)
          return getBibleGatewayFallback()
        }
      }

      case 'biblegateway': {
        // Bible Gateway
        try {
          return getBibleGatewayFallback()
        } catch (error) {
          console.error('Error generating Bible Gateway URL:', error)
          return getBibleGatewayFallback()
        }
      }

      case 'logos': {
        // Logos - currently only supports one range
        try {
          return getLogosUrl(
            this.bibleVersion,
            bookName,
            firstRange.chapterNumber,
            firstRange.verseNumber,
            firstRange.verseEndNumber
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
    const head = getReferenceHead(this.verseReference)
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
