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
import {
  isCrossChapterReference,
  splitIntoChapterSegments,
} from '../utils/splitBibleReference'

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
    verseNumberEnd?: number,
    chapterNumberEnd?: number,
    verseNumberEndChapter?: number
  ) {
    super(settings, {
      bookName: bookName,
      chapterNumber: chapterNumber,
      verseNumber: verseNumber,
      verseNumberEnd: verseNumberEnd,
      chapterNumberEnd: chapterNumberEnd,
      verseNumberEndChapter: verseNumberEndChapter,
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

    // Check if cross-chapter reference
    if (isCrossChapterReference(this.verseReference)) {
      return this.getCrossChapterVerses()
    }

    // Single chapter query
    const verses = await this.bibleProvider.query(
      this.verseReference.bookName,
      this.verseReference.chapterNumber,
      this.verseReference?.verseNumberEnd
        ? [this.verseReference.verseNumber, this.verseReference.verseNumberEnd]
        : [this.verseReference.verseNumber]
    )
    return verses.map((verse) => ({
      ...verse,
      chapter: this.verseReference.chapterNumber,
    }))
  }

  /**
   * Fetch verses from multiple chapters for cross-chapter references
   */
  private async getCrossChapterVerses(): Promise<IVerse[]> {
    const segments = splitIntoChapterSegments(this.verseReference)

    // Execute API calls in parallel
    const results = await Promise.allSettled(
      segments.map((segment) =>
        this.bibleProvider.query(
          segment.bookName,
          segment.chapterNumber,
          segment.verseEnd
            ? [segment.verseStart, segment.verseEnd]
            : [segment.verseStart, 999] // 999 as upper bound for "to end of chapter"
        )
      )
    )

    const verses: IVerse[] = []
    let hadFailure = false

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const chapterNumber = segments[index].chapterNumber
        const versesWithChapter = result.value.map((verse) => ({
          ...verse,
          chapter: chapterNumber,
        }))
        verses.push(...versesWithChapter)
      } else {
        hadFailure = true
        console.error(
          `Failed to fetch chapter ${segments[index].chapterNumber}:`,
          result.reason
        )
      }
    })

    if (hadFailure) {
      console.warn(
        'Some chapters could not be loaded. Showing partial results.'
      )
    }

    return verses
  }

  protected getUrlForReference(): string {
    const sourceOfReference = this.settings.sourceOfReference || 'biblegateway'
    const {
      bookName,
      chapterNumber,
      verseNumber,
      verseNumberEnd,
      chapterNumberEnd,
      verseNumberEndChapter,
    } = this.verseReference

    // Helper function to generate Bible Gateway URL as fallback
    const getBibleGatewayFallback = (): string => {
      let versesString: string
      if (isCrossChapterReference(this.verseReference)) {
        versesString = verseNumber.toString()
        return getBibleGatewayUrl(
          this.bibleVersion,
          bookName,
          chapterNumber,
          versesString,
          chapterNumberEnd,
          verseNumberEndChapter
        )
      } else if (verseNumberEnd) {
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
          if (isCrossChapterReference(this.verseReference)) {
            return getBibleGatewayFallback()
          }
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
    // For cross-chapter references, generate the full reference
    let head: string
    if (isCrossChapterReference(this.verseReference)) {
      const {
        bookName,
        chapterNumber,
        verseNumber,
        chapterNumberEnd,
        verseNumberEndChapter,
      } = this.verseReference
      head = `${bookName} ${chapterNumber}:${verseNumber}-${chapterNumberEnd}:${verseNumberEndChapter}`
    } else {
      head = this.bibleProvider.BibleReferenceHead
    }

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
