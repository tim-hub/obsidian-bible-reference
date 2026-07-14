import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
  OutgoingLinkPositionEnum,
} from '../data/constants'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { IVerse } from '../interfaces/IVerse'
import { buildProvider } from '../provider/buildProvider'
import { BaseBibleAPIProvider } from '../provider/BaseBibleAPIProvider'
import { BaseVerseFormatter } from './BaseVerseFormatter'
import { getBLBUrl } from '../utils/referenceBLBAltLinking'
import {
  getLogosUrl,
  getLogosTranslation,
} from '../utils/referenceLogosLinking'
import { getBibleGatewayUrl } from '../utils/referenceLink'
import { getStepbibleUrl } from '../utils/referenceStepbibleLinking'
import {
  isCrossChapterReference,
  splitIntoChapterSegments,
  getReferenceHead,
  VerseRange,
  VerseReference,
} from '../utils/splitBibleReference'
import { getFullBookName } from '../utils/bookNameReference'

/**
 * Verse Suggesting
 * Pass Bible Book, Chapter, Verse Numbers to get Bible Content (verses)
 */
export class VerseSuggesting extends BaseVerseFormatter {
  public bibleVersion: string
  private bibleProvider: BaseBibleAPIProvider

  constructor(
    settings: BibleReferencePluginSettings,
    bookName: string,
    chapterNumber: number,
    verseNumber: number,
    verseNumberEnd?: number,
    chapterNumberEnd?: number,
    verseNumberEndChapter?: number,
    ranges?: VerseRange[]
  ) {
    super(settings, {
      bookName: bookName,
      chapterNumber: chapterNumber,
      verseNumber: verseNumber,
      verseNumberEnd: verseNumberEnd,
      chapterNumberEnd: chapterNumberEnd,
      verseNumberEndChapter: verseNumberEndChapter,
      ranges: ranges || [
        {
          chapterNumber,
          verseNumber,
          verseNumberEnd,
          chapterNumberEnd,
          verseNumberEndChapter,
        },
      ],
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
      this.bibleProvider = buildProvider(bibleVersion)
    }

    const allVerses: IVerse[] = []

    const rangePromises = this.verseReference.ranges.map(async (range) => {
      if (isCrossChapterReference(range)) {
        return this.getCrossChapterVerses(range)
      } else {
        const verses = await this.bibleProvider.query(
          getFullBookName(this.verseReference.bookName, 'en'),
          range.chapterNumber,
          range?.verseNumberEnd
            ? [range.verseNumber, range.verseNumberEnd]
            : [range.verseNumber]
        )
        return verses.map((verse) => ({
          ...verse,
          chapter: range.chapterNumber,
        }))
      }
    })

    const results = await Promise.allSettled(rangePromises)
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allVerses.push(...result.value)
      }
    })
    return allVerses
  }

  /**
   * Fetch verses from multiple chapters for cross-chapter references
   */
  private async getCrossChapterVerses(range: VerseRange): Promise<IVerse[]> {
    const segments = splitIntoChapterSegments({
      bookName: this.verseReference.bookName,
      ...range,
    } as VerseReference)

    // Execute API calls in parallel
    const results = await Promise.allSettled(
      segments.map((segment) =>
        this.bibleProvider.query(
          getFullBookName(this.verseReference.bookName, 'en'),
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

    // 'original' resolves through the API provider, not a URL template.
    if (sourceOfReference === 'original') {
      if (!this.bibleProvider) {
        const bibleVersion = getBibleVersion(this.bibleVersion)
        if (bibleVersion) {
          this.bibleProvider = buildProvider(bibleVersion)
        }
      }
      return (
        this.bibleProvider?.getOriginalVerseReferenceLink() ||
        getBibleGatewayFallback()
      )
    }

    // Each external source builds its own URL; any failure falls back to
    // Bible Gateway. ('biblegateway' and any unknown source ARE the fallback.)
    const urlBuilders: { [source: string]: () => string } = {
      blb: () =>
        getBLBUrl(
          this.bibleVersion,
          bookName,
          chapterNumber,
          verseNumber,
          verseNumberEnd
        ),
      logos: () =>
        getLogosUrl(
          getLogosTranslation(this.settings, this.bibleVersion),
          bookName,
          chapterNumber,
          verseNumber,
          verseNumberEnd
        ),
      stepbible: () =>
        getStepbibleUrl(
          this.bibleVersion,
          bookName,
          chapterNumber,
          verseNumber,
          verseNumberEnd,
          chapterNumberEnd,
          verseNumberEndChapter
        ),
    }

    const buildUrl = urlBuilders[sourceOfReference]
    if (!buildUrl) {
      return getBibleGatewayFallback()
    }
    try {
      return buildUrl()
    } catch (error) {
      console.error(`Error generating ${sourceOfReference} URL:`, error)
      return getBibleGatewayFallback()
    }
  }

  protected getVerseReferenceLink(): string {
    // For cross-chapter and multi-segment references, use centralized getReferenceHead
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
