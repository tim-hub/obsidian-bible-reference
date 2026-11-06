import {
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
  OutgoingLinkPositionEnum,
} from '../data/constants'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { IVerse } from '../interfaces/IVerse'
import {
  lookupVerses,
  PassageQuery,
  sourceUrlFor,
} from '../provider/verseLookup'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { BaseVerseFormatter } from './BaseVerseFormatter'
import { getBLBUrl } from '../utils/referenceBLBAltLinking'
import { getLiteralWordUrl } from '../utils/referenceLiteralWordLinking'
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
import { bookNameForId } from '../utils/bookNameReference'

/**
 * Verse Suggesting
 * Pass Bible Book, Chapter, Verse Numbers to get Bible Content (verses)
 */
export class VerseSuggesting extends BaseVerseFormatter {
  public bibleVersion: string
  private originalSourceUrl?: string

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
  public renderSuggestion(el: HTMLElement, linkOnly = false) {
    const outer = el.createDiv({ cls: 'obr-suggester-container' })
    // @ts-ignore
    outer
      .createDiv({ cls: 'obr-shortcode' })
      .setText(linkOnly ? this.linkOnlyContent : this.bodyContent)
  }

  /**
   * A bare markdown link to the reference - no verse text, no callout, no tags.
   * Never fetches, so it works offline.
   */
  public get linkOnlyContent(): string {
    return `[${this.getReferenceLabel()}](${this.getUrlForReference()})`
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

    const allVerses: IVerse[] = []

    const rangePromises = this.verseReference.ranges.map(async (range) => {
      if (isCrossChapterReference(range)) {
        return this.getCrossChapterVerses(bibleVersion, range)
      } else {
        const verses = await lookupVerses(bibleVersion, this.passageOf(range))
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
    this.originalSourceUrl = sourceUrlFor(
      bibleVersion,
      this.passageOf(this.verseReference.ranges[0])
    )
    return allVerses
  }

  private passageOf(range: VerseRange): PassageQuery {
    if (isCrossChapterReference(range)) {
      return this.chapterPassagesOf(range)[0]
    }
    return {
      bookId: this.verseReference.bookId,
      chapter: range.chapterNumber,
      verses: range.verseNumberEnd
        ? [range.verseNumber, range.verseNumberEnd]
        : [range.verseNumber],
    }
  }

  private chapterPassagesOf(range: VerseRange): PassageQuery[] {
    const { bookId, bookName } = this.verseReference
    return splitIntoChapterSegments({
      bookName,
      ...range,
    } as VerseReference).map((segment) => ({
      bookId,
      chapter: segment.chapterNumber,
      verses: [segment.verseStart, segment.verseEnd ?? 999],
    }))
  }

  /**
   * Fetch verses from multiple chapters for cross-chapter references
   */
  private async getCrossChapterVerses(
    bibleVersion: IBibleVersion,
    range: VerseRange
  ): Promise<IVerse[]> {
    const passages = this.chapterPassagesOf(range)

    // Execute API calls in parallel
    const results = await Promise.allSettled(
      passages.map((passage) => lookupVerses(bibleVersion, passage))
    )

    const verses: IVerse[] = []
    let hadFailure = false

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const chapterNumber = passages[index].chapter
        const versesWithChapter = result.value.map((verse) => ({
          ...verse,
          chapter: chapterNumber,
        }))
        verses.push(...versesWithChapter)
      } else {
        hadFailure = true
        console.error(
          `Failed to fetch chapter ${passages[index].chapter}:`,
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
      bookId,
      chapterNumber,
      verseNumber,
      verseNumberEnd,
      chapterNumberEnd,
      verseNumberEndChapter,
    } = this.verseReference

    // Helper function to generate Bible Gateway URL as fallback
    const getBibleGatewayFallback = (): string => {
      const bibleGatewayVersion =
        getBibleVersion(this.bibleVersion).bibleGatewayKey ?? this.bibleVersion
      let versesString: string
      if (isCrossChapterReference(this.verseReference)) {
        versesString = verseNumber.toString()
        return getBibleGatewayUrl(
          bibleGatewayVersion,
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
        bibleGatewayVersion,
        bookName,
        chapterNumber,
        versesString
      )
    }

    if (sourceOfReference === 'original') {
      return this.originalSourceUrl || getBibleGatewayFallback()
    }

    // Each external source builds its own URL; any failure falls back to
    // Bible Gateway. ('biblegateway' and any unknown source ARE the fallback.)
    const urlBuilders: {
      [source: string]: (englishBookName: string) => string
    } = {
      blb: (englishBookName) =>
        getBLBUrl(
          this.bibleVersion,
          englishBookName,
          chapterNumber,
          verseNumber,
          verseNumberEnd
        ),
      literalword: (englishBookName) =>
        getLiteralWordUrl(
          this.bibleVersion,
          englishBookName,
          chapterNumber,
          verseNumber
        ),
      logos: (englishBookName) =>
        getLogosUrl(
          getLogosTranslation(this.settings, this.bibleVersion),
          englishBookName,
          chapterNumber,
          verseNumber,
          verseNumberEnd
        ),
      stepbible: (englishBookName) =>
        getStepbibleUrl(
          this.bibleVersion,
          englishBookName,
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
      return buildUrl(bookNameForId(bookId, 'en'))
    } catch (error) {
      console.error(`Error generating ${sourceOfReference} URL:`, error)
      return getBibleGatewayFallback()
    }
  }

  /**
   * The human readable reference, ex. `John 3:16 - KJV`
   * For cross-chapter and multi-segment references, use centralized getReferenceHead
   */
  private getReferenceLabel(): string {
    const head = getReferenceHead(this.verseReference)
    const version = this.settings?.showVerseTranslation
      ? ` - ${this.bibleVersion.toUpperCase()}`
      : ''
    return `${head}${version}`
  }

  protected getVerseReferenceLink(): string {
    const label = this.getReferenceLabel()

    // keep the original leading space that the previous implementation returned
    const leading = ' '

    if (this.settings?.enableHyperlinking) {
      return `${leading}[${label}](${this.getUrlForReference()})`
    }

    return `${leading}${label}`
  }
}
